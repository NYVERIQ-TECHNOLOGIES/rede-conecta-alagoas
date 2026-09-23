-- ============ ECOSSISTEMA 4 EXPERIÊNCIAS ============
-- Adiciona o papel CLIENTE, a camada de pedidos, o catálogo por PDV
-- e as RPCs que conectam o fluxo COOPERATIVA → PDV → CLIENTE → ADM.

-- ============ ENUMS ============
alter type public.app_role add value 'cliente';
create type public.order_status as enum ('criado','confirmado','separacao','pronto','entregue','concluido','cancelado');
create type public.delivery_type as enum ('retirada','entrega');
alter type public.movement_type add value 'pedido';
alter type public.movement_type add value 'devolucao';

-- ============ TABELAS ============
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text not null default '',
  email text,
  phone text,
  cpf text,
  birth_date date,
  preferences jsonb,
  created_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  street text not null,
  number text,
  complement text,
  neighborhood text,
  city text not null,
  state text not null default 'AL',
  zip text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code serial,
  customer_id uuid references public.customers(id) on delete set null,
  store_id uuid not null references public.stores(id) on delete restrict,
  status order_status not null default 'criado',
  delivery_type delivery_type not null default 'retirada',
  address_id uuid references public.customer_addresses(id) on delete set null,
  payment_method payment_method not null default 'pix',
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  cancelled_reason text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  cooperative_id uuid not null references public.cooperatives(id) on delete restrict,
  batch_id uuid references public.product_batches(id) on delete set null,
  quantity integer not null,
  unit_price numeric not null,
  total numeric not null,
  commission_rate numeric not null default 0.15,
  net_amount numeric not null default 0
);

-- Catálogo por PDV: a cooperativa disponibiliza (produto ativo) e o PDV ativa/vende na sua loja.
create table public.store_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (store_id, product_id)
);

alter table public.sales add column order_id uuid references public.orders(id) on delete set null;

-- ============ GRANTS ============
grant select, insert, update, delete on public.customers, public.customer_addresses,
  public.orders, public.order_items, public.store_products to authenticated;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- ============ TRIGGER: novos usuários viram CLIENTE ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  -- novos acessos da plataforma são clientes; papéis de staff/cooperativa são concedidos pelo ADM
  insert into public.user_roles (user_id, role) values (new.id, 'cliente')
  on conflict do nothing;
  return new;
end; $$;

-- ============ RLS ============
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_products enable row level security;

-- clientes
create policy "own customer" on public.customers for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta'));
create policy "own customer insert" on public.customers for insert to authenticated
  with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own customer update" on public.customers for update to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "own addresses" on public.customer_addresses for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "own addresses write" on public.customer_addresses for all to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()))
  with check (public.has_role(auth.uid(),'admin') or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));

-- pedidos
create policy "read orders" on public.orders for select to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or customer_id = (
      select id from public.customers where user_id = auth.uid()
    )
    or (public.is_staff(auth.uid()) and store_id = public.current_store_id())
    or exists (select 1 from public.order_items oi where oi.order_id = orders.id and oi.cooperative_id = public.current_cooperative_id())
  );
create policy "write orders" on public.orders for all to authenticated
  using (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()))
  with check (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()));

create policy "read order items" on public.order_items for select to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or cooperative_id = public.current_cooperative_id()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (
        select id from public.customers where user_id = auth.uid()))
    or exists (select 1 from public.orders o where o.id = order_id and o.store_id = public.current_store_id())
  );

-- catálogo por PDV
create policy "read store catalog" on public.store_products for select to authenticated using (true);
create policy "manage store catalog" on public.store_products for all to authenticated
  using (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()))
  with check (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()));

-- liberar leitura do CLIENTE sobre catálogo institucional
drop policy "read products" on public.products;
create policy "read products" on public.products for select to authenticated
  using (public.is_staff(auth.uid()) or cooperative_id = public.current_cooperative_id() or public.has_role(auth.uid(),'cliente'));

drop policy "read cooperatives" on public.cooperatives;
create policy "read cooperatives" on public.cooperatives for select to authenticated
  using (public.is_staff(auth.uid()) or id = public.current_cooperative_id() or public.has_role(auth.uid(),'cliente'));

-- ============ RPC: PEDIDO DO CLIENTE ============
create or replace function public.place_order(
  _store_id uuid,
  _delivery_type public.delivery_type,
  _address_id uuid,
  _payment_method public.payment_method,
  _discount numeric,
  _items jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  _customer_id uuid;
  _order_id uuid;
  _item jsonb;
  _product public.products%rowtype;
  _coop public.cooperatives%rowtype;
  _qty integer;
  _inv public.inventories%rowtype;
  _line numeric;
  _total numeric := 0;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select id into _customer_id from public.customers where user_id = auth.uid();
  if _customer_id is null then raise exception 'cadastre seu perfil de cliente para comprar'; end if;

  insert into public.orders (customer_id, store_id, delivery_type, address_id, payment_method, subtotal, total, discount)
  values (_customer_id, _store_id, _delivery_type, _address_id, _payment_method, 0, 0, coalesce(_discount,0))
  returning id into _order_id;

  for _item in select * from jsonb_array_elements(_items) loop
    select * into _product from public.products where id = (_item->>'product_id')::uuid;
    if not found then raise exception 'produto inexistente'; end if;
    _qty := (_item->>'quantity')::int;

    select * into _inv from public.inventories
      where product_id = _product.id and store_id = _store_id and quantity > 0
      order by quantity desc limit 1;
    if not found or _inv.quantity < _qty then
      raise exception 'estoque insuficiente para %', _product.name;
    end if;

    update public.inventories set quantity = quantity - _qty, updated_at = now() where id = _inv.id;

    select * into _coop from public.cooperatives where id = _product.cooperative_id;

    _line := _product.price * _qty;
    _total := _total + _line;

    insert into public.order_items (order_id, product_id, cooperative_id, batch_id, quantity, unit_price, total, commission_rate, net_amount)
    values (_order_id, _product.id, _product.cooperative_id, _inv.batch_id, _qty, _product.price, _line,
            _coop.commission_rate, _line * (1 - _coop.commission_rate));
  end loop;

  update public.orders set subtotal = _total, total = greatest(_total - coalesce(_discount,0), 0) where id = _order_id;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'pedido_criado', 'orders', _order_id, jsonb_build_object('total', _total, 'items', _items));
  return _order_id;
end; $$;

grant execute on function public.place_order(uuid, delivery_type, uuid, payment_method, numeric, jsonb) to authenticated;

-- ============ RPC: PDV PROCESSAR PEDIDO → VENDA ============
create or replace function public.confirm_order_to_sale(_order_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _o public.orders%rowtype;
  _it public.order_items%rowtype;
  _sale_id uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select * into _o from public.orders where id = _order_id;
  if not found then raise exception 'pedido inexistente'; end if;
  if _o.status = 'cancelado' or _o.status = 'concluido' then raise exception 'pedido não pode ser processado'; end if;

  insert into public.sales (store_id, operator_id, order_id, total, discount, payment_method)
  values (_o.store_id, auth.uid(), _o.id, _o.total, _o.discount, _o.payment_method)
  returning id into _sale_id;

  for _it in select * from public.order_items where order_id = _order_id loop
    insert into public.sale_items (sale_id, product_id, cooperative_id, batch_id, quantity, unit_price, total, commission_rate, net_amount)
    values (_sale_id, _it.product_id, _it.cooperative_id, _it.batch_id, _it.quantity, _it.unit_price, _it.total, _it.commission_rate, _it.net_amount);
  end loop;

  update public.orders set status = 'concluido', updated_at = now() where id = _order_id;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'pedido_processado', 'orders', _order_id, jsonb_build_object('sale_id', _sale_id));
  return _sale_id;
end; $$;

grant execute on function public.confirm_order_to_sale(uuid) to authenticated;

-- ============ RPC: CANCELAR PEDIDO (devolve estoque) ============
create or replace function public.cancel_order(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  _store uuid;
  _it record;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select store_id into _store from public.orders where id = _order_id;
  if _store is null then raise exception 'pedido inexistente'; end if;

  update public.orders set status = 'cancelado', updated_at = now()
  where id = _order_id and status not in ('concluido','cancelado');
  if not found then raise exception 'pedido não pode ser cancelado'; end if;

  for _it in select * from public.order_items where order_id = _order_id loop
    update public.inventories set quantity = quantity + _it.quantity, updated_at = now()
      where product_id = _it.product_id and store_id = _store
        and batch_id is not distinct from _it.batch_id;
    insert into public.inventory_movements (product_id, store_id, batch_id, type, quantity, notes, created_by)
    values (_it.product_id, _store, _it.batch_id, 'devolucao', _it.quantity, 'Cancelamento de pedido', auth.uid());
  end loop;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'pedido_cancelado', 'orders', _order_id, '{}'::jsonb);
end; $$;

grant execute on function public.cancel_order(uuid) to authenticated;