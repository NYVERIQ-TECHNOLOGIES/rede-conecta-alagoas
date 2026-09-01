-- ============ ENUMS ============
create type public.app_role as enum ('admin','gerente','operador','cooperativa','consulta');
create type public.entity_status as enum ('ativa','pendente','inativa');
create type public.transfer_status as enum ('solicitada','aprovada','separacao','enviada','recebida','cancelada');
create type public.settlement_status as enum ('aguardando','repassado','cancelado');
create type public.payment_method as enum ('pix','dinheiro','debito','credito');
create type public.sale_status as enum ('concluida','cancelada');
create type public.movement_type as enum ('entrada','venda','transferencia_saida','transferencia_entrada','perda','ajuste','cancelamento');

-- ============ CORE TABLES ============
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text,
  manager_name text,
  opening_hours text,
  status entity_status not null default 'ativa',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.cooperatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  city text not null,
  region text,
  responsible_name text,
  phone text,
  email text,
  social_links text,
  description text,
  history text,
  logo_url text,
  latitude numeric,
  longitude numeric,
  families_reached integer,
  commission_rate numeric not null default 0.15,
  status entity_status not null default 'ativa',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text,
  store_id uuid references public.stores(id) on delete set null,
  cooperative_id uuid references public.cooperatives(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text,
  slug text unique not null,
  sort_order integer not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cooperative_id uuid not null references public.cooperatives(id) on delete restrict,
  category_id uuid references public.product_categories(id) on delete set null,
  description text,
  ingredients text,
  origin text,
  city text,
  weight numeric,
  unit text not null default 'un',
  price numeric not null default 0,
  cost numeric not null default 0,
  image_url text,
  status entity_status not null default 'ativa',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create table public.product_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  batch_code text not null,
  produced_at date,
  expires_at date,
  created_at timestamptz not null default now()
);

create table public.inventories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  batch_id uuid references public.product_batches(id) on delete set null,
  quantity integer not null default 0,
  min_quantity integer not null default 10,
  critical_quantity integer not null default 4,
  updated_at timestamptz not null default now(),
  unique (product_id, store_id, batch_id)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  batch_id uuid references public.product_batches(id) on delete set null,
  type movement_type not null,
  quantity integer not null,
  document text,
  document_url text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  from_store_id uuid not null references public.stores(id) on delete restrict,
  to_store_id uuid not null references public.stores(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  batch_id uuid references public.product_batches(id) on delete set null,
  quantity integer not null,
  status transfer_status not null default 'solicitada',
  requested_by uuid,
  approved_by uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  operator_id uuid,
  opening_amount numeric not null default 0,
  closing_amount numeric,
  difference numeric,
  notes text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  code serial,
  store_id uuid not null references public.stores(id) on delete restrict,
  operator_id uuid,
  cash_register_id uuid references public.cash_registers(id) on delete set null,
  total numeric not null default 0,
  discount numeric not null default 0,
  payment_method payment_method not null,
  status sale_status not null default 'concluida',
  cancelled_reason text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  cooperative_id uuid not null references public.cooperatives(id) on delete restrict,
  batch_id uuid references public.product_batches(id) on delete set null,
  quantity integer not null,
  unit_price numeric not null,
  total numeric not null,
  commission_rate numeric not null default 0.15,
  net_amount numeric not null default 0
);

create table public.cooperative_settlements (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null references public.cooperatives(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_amount numeric not null default 0,
  returns_amount numeric not null default 0,
  commission_amount numeric not null default 0,
  adjustments numeric not null default 0,
  net_amount numeric not null default 0,
  status settlement_status not null default 'aguardando',
  due_date date,
  paid_at timestamptz,
  receipt_url text,
  created_at timestamptz not null default now()
);

create table public.product_losses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  batch_id uuid references public.product_batches(id) on delete set null,
  quantity integer not null,
  reason text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- ============ GRANTS ============
grant select, insert, update, delete on public.stores, public.cooperatives, public.profiles,
  public.product_categories, public.products, public.product_images, public.product_batches,
  public.inventories, public.inventory_movements, public.stock_transfers, public.cash_registers,
  public.sales, public.sale_items, public.cooperative_settlements, public.product_losses to authenticated;
grant select on public.user_roles, public.audit_logs to authenticated;
grant insert on public.audit_logs to authenticated;
grant all on public.stores, public.cooperatives, public.profiles, public.user_roles,
  public.product_categories, public.products, public.product_images, public.product_batches,
  public.inventories, public.inventory_movements, public.stock_transfers, public.cash_registers,
  public.sales, public.sale_items, public.cooperative_settlements, public.product_losses,
  public.audit_logs to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- ============ HELPERS ============
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.current_store_id()
returns uuid language sql stable security definer set search_path = public as $$
  select store_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_cooperative_id()
returns uuid language sql stable security definer set search_path = public as $$
  select cooperative_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('admin','gerente','operador','consulta'))
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'consulta')
  on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ RLS ============
alter table public.stores enable row level security;
alter table public.cooperatives enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_batches enable row level security;
alter table public.inventories enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.cash_registers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.cooperative_settlements enable row level security;
alter table public.product_losses enable row level security;
alter table public.audit_logs enable row level security;

-- reference data: readable by any authenticated user
create policy "read stores" on public.stores for select to authenticated using (true);
create policy "admin manage stores" on public.stores for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read cooperatives" on public.cooperatives for select to authenticated
  using (public.is_staff(auth.uid()) or id = public.current_cooperative_id());
create policy "admin manage cooperatives" on public.cooperatives for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read categories" on public.product_categories for select to authenticated using (true);
create policy "admin manage categories" on public.product_categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read products" on public.products for select to authenticated
  using (public.is_staff(auth.uid()) or cooperative_id = public.current_cooperative_id());
create policy "admin manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read product images" on public.product_images for select to authenticated using (true);
create policy "admin manage product images" on public.product_images for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read batches" on public.product_batches for select to authenticated using (true);
create policy "staff manage batches" on public.product_batches for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "read inventories" on public.inventories for select to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or (public.is_staff(auth.uid()) and store_id = public.current_store_id())
    or exists (select 1 from public.products p where p.id = product_id and p.cooperative_id = public.current_cooperative_id())
  );
create policy "staff write inventories" on public.inventories for all to authenticated
  using (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()))
  with check (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()));

create policy "read movements" on public.inventory_movements for select to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or (public.is_staff(auth.uid()) and store_id = public.current_store_id())
    or exists (select 1 from public.products p where p.id = product_id and p.cooperative_id = public.current_cooperative_id())
  );
create policy "staff write movements" on public.inventory_movements for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()));

create policy "read transfers" on public.stock_transfers for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or from_store_id = public.current_store_id() or to_store_id = public.current_store_id());
create policy "staff write transfers" on public.stock_transfers for all to authenticated
  using (public.has_role(auth.uid(),'admin') or from_store_id = public.current_store_id() or to_store_id = public.current_store_id())
  with check (public.has_role(auth.uid(),'admin') or from_store_id = public.current_store_id() or to_store_id = public.current_store_id());

create policy "read cash" on public.cash_registers for select to authenticated
  using (public.has_role(auth.uid(),'admin') or store_id = public.current_store_id());
create policy "staff write cash" on public.cash_registers for all to authenticated
  using (public.has_role(auth.uid(),'admin') or store_id = public.current_store_id())
  with check (public.has_role(auth.uid(),'admin') or store_id = public.current_store_id());

create policy "read sales" on public.sales for select to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or (public.is_staff(auth.uid()) and store_id = public.current_store_id())
    or exists (select 1 from public.sale_items si where si.sale_id = sales.id and si.cooperative_id = public.current_cooperative_id())
  );
create policy "staff write sales" on public.sales for all to authenticated
  using (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()))
  with check (public.has_role(auth.uid(),'admin') or (public.is_staff(auth.uid()) and store_id = public.current_store_id()));

create policy "read sale items" on public.sale_items for select to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or cooperative_id = public.current_cooperative_id()
    or exists (select 1 from public.sales s where s.id = sale_id and s.store_id = public.current_store_id())
  );
create policy "staff write sale items" on public.sale_items for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "read settlements" on public.cooperative_settlements for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'consulta')
    or cooperative_id = public.current_cooperative_id());
create policy "admin manage settlements" on public.cooperative_settlements for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read losses" on public.product_losses for select to authenticated
  using (public.has_role(auth.uid(),'admin') or store_id = public.current_store_id());
create policy "staff write losses" on public.product_losses for all to authenticated
  using (public.has_role(auth.uid(),'admin') or store_id = public.current_store_id())
  with check (public.has_role(auth.uid(),'admin') or store_id = public.current_store_id());

create policy "own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin insert profile" on public.profiles for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));

create policy "read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "admin read audit" on public.audit_logs for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "authenticated insert audit" on public.audit_logs for insert to authenticated
  with check (auth.uid() is not null);

-- ============ SALE RPC (atomic) ============
create or replace function public.register_sale(
  _store_id uuid,
  _payment_method payment_method,
  _discount numeric,
  _items jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  _sale_id uuid;
  _item jsonb;
  _product public.products%rowtype;
  _coop public.cooperatives%rowtype;
  _qty integer;
  _inv public.inventories%rowtype;
  _total numeric := 0;
  _line numeric;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;

  insert into public.sales (store_id, operator_id, total, discount, payment_method)
  values (_store_id, auth.uid(), 0, coalesce(_discount,0), _payment_method)
  returning id into _sale_id;

  for _item in select * from jsonb_array_elements(_items) loop
    select * into _product from public.products where id = (_item->>'product_id')::uuid;
    if not found then raise exception 'produto inexistente'; end if;
    select * into _coop from public.cooperatives where id = _product.cooperative_id;
    _qty := (_item->>'quantity')::int;

    select * into _inv from public.inventories
      where product_id = _product.id and store_id = _store_id and quantity > 0
      order by quantity desc limit 1;
    if not found or _inv.quantity < _qty then
      raise exception 'estoque insuficiente para %', _product.name;
    end if;

    update public.inventories set quantity = quantity - _qty, updated_at = now() where id = _inv.id;

    _line := _product.price * _qty;
    _total := _total + _line;

    insert into public.sale_items (sale_id, product_id, cooperative_id, batch_id, quantity, unit_price, total, commission_rate, net_amount)
    values (_sale_id, _product.id, _product.cooperative_id, _inv.batch_id, _qty, _product.price, _line,
            _coop.commission_rate, _line * (1 - _coop.commission_rate));

    insert into public.inventory_movements (product_id, store_id, batch_id, type, quantity, notes, created_by)
    values (_product.id, _store_id, _inv.batch_id, 'venda', -_qty, 'Venda PDV', auth.uid());
  end loop;

  update public.sales set total = greatest(_total - coalesce(_discount,0), 0) where id = _sale_id;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'venda_registrada', 'sales', _sale_id, jsonb_build_object('total', _total, 'items', _items));

  return _sale_id;
end; $$;

grant execute on function public.register_sale(uuid, payment_method, numeric, jsonb) to authenticated;

-- ============ STOCK ENTRY RPC ============
create or replace function public.register_entry(
  _product_id uuid, _store_id uuid, _batch_code text, _quantity integer,
  _produced_at date, _expires_at date, _document text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare _batch_id uuid; _inv_id uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select id into _batch_id from public.product_batches
    where product_id = _product_id and batch_code = _batch_code limit 1;
  if _batch_id is null then
    insert into public.product_batches (product_id, batch_code, produced_at, expires_at)
    values (_product_id, _batch_code, _produced_at, _expires_at) returning id into _batch_id;
  end if;

  select id into _inv_id from public.inventories
    where product_id = _product_id and store_id = _store_id and batch_id = _batch_id;
  if _inv_id is null then
    insert into public.inventories (product_id, store_id, batch_id, quantity)
    values (_product_id, _store_id, _batch_id, _quantity) returning id into _inv_id;
  else
    update public.inventories set quantity = quantity + _quantity, updated_at = now() where id = _inv_id;
  end if;

  insert into public.inventory_movements (product_id, store_id, batch_id, type, quantity, document, created_by)
  values (_product_id, _store_id, _batch_id, 'entrada', _quantity, _document, auth.uid());

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'entrada_registrada', 'inventories', _inv_id,
    jsonb_build_object('product_id', _product_id, 'quantity', _quantity, 'batch', _batch_code));

  return _batch_id;
end; $$;

grant execute on function public.register_entry(uuid, uuid, text, integer, date, date, text) to authenticated;

-- ============ TRANSFER COMPLETE RPC ============
create or replace function public.complete_transfer(_transfer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _t public.stock_transfers%rowtype; _inv public.inventories%rowtype; _dest_id uuid;
begin
  select * into _t from public.stock_transfers where id = _transfer_id;
  if not found then raise exception 'transferência inexistente'; end if;
  if _t.status = 'recebida' then return; end if;

  select * into _inv from public.inventories
    where product_id = _t.product_id and store_id = _t.from_store_id and quantity >= _t.quantity
    order by quantity desc limit 1;
  if not found then raise exception 'estoque insuficiente na loja de origem'; end if;

  update public.inventories set quantity = quantity - _t.quantity, updated_at = now() where id = _inv.id;

  select id into _dest_id from public.inventories
    where product_id = _t.product_id and store_id = _t.to_store_id and batch_id is not distinct from _inv.batch_id;
  if _dest_id is null then
    insert into public.inventories (product_id, store_id, batch_id, quantity)
    values (_t.product_id, _t.to_store_id, _inv.batch_id, _t.quantity);
  else
    update public.inventories set quantity = quantity + _t.quantity, updated_at = now() where id = _dest_id;
  end if;

  insert into public.inventory_movements (product_id, store_id, batch_id, type, quantity, notes, created_by)
  values (_t.product_id, _t.from_store_id, _inv.batch_id, 'transferencia_saida', -_t.quantity, 'Transferência', auth.uid()),
         (_t.product_id, _t.to_store_id, _inv.batch_id, 'transferencia_entrada', _t.quantity, 'Transferência', auth.uid());

  update public.stock_transfers set status = 'recebida', updated_at = now() where id = _transfer_id;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'transferencia_recebida', 'stock_transfers', _transfer_id, to_jsonb(_t));
end; $$;

grant execute on function public.complete_transfer(uuid) to authenticated;

-- ============ SETTLEMENT GENERATOR ============
create or replace function public.generate_settlement(_cooperative_id uuid, _start date, _end date)
returns uuid language plpgsql security definer set search_path = public as $$
declare _gross numeric := 0; _commission numeric := 0; _id uuid;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'sem permissão'; end if;
  select coalesce(sum(si.total),0), coalesce(sum(si.total - si.net_amount),0)
    into _gross, _commission
  from public.sale_items si
  join public.sales s on s.id = si.sale_id
  where si.cooperative_id = _cooperative_id and s.status = 'concluida'
    and s.created_at::date between _start and _end;

  insert into public.cooperative_settlements
    (cooperative_id, period_start, period_end, gross_amount, commission_amount, net_amount, due_date)
  values (_cooperative_id, _start, _end, _gross, _commission, _gross - _commission, _end + 10)
  returning id into _id;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'repasse_gerado', 'cooperative_settlements', _id,
    jsonb_build_object('gross', _gross, 'net', _gross - _commission));
  return _id;
end; $$;

grant execute on function public.generate_settlement(uuid, date, date) to authenticated;

-- ============ SEED (DEMONSTRAÇÃO) ============
insert into public.product_categories (name, emoji, slug, sort_order) values
 ('Doces & Geleias','🍯','doces-geleias',1),
 ('Coco & Derivados','🥥','coco-derivados',2),
 ('Alimentos','🌽','alimentos',3),
 ('Bebidas','🍹','bebidas',4),
 ('Frutas & Derivados','🍌','frutas-derivados',5),
 ('Artesanato','🧶','artesanato',6),
 ('Moda & Identidade','👕','moda-identidade',7);

insert into public.stores (id, name, city, address, manager_name, opening_hours, is_demo) values
 ('11111111-1111-1111-1111-111111111111','Maceió','Maceió','Mercado 31 — Jaraguá','Ana Lins','Seg a Sáb, 9h às 18h',true),
 ('22222222-2222-2222-2222-222222222222','Arapiraca','Arapiraca','Partage Shopping','Carlos Bezerra','Seg a Sáb, 10h às 22h',true),
 ('33333333-3333-3333-3333-333333333333','Piaçabuçu','Piaçabuçu','Centro','Rita Nascimento','Seg a Sex, 8h às 17h',true);

insert into public.cooperatives (id, name, city, region, responsible_name, phone, email, description, history, commission_rate, latitude, longitude, families_reached, is_demo) values
 ('aaaaaaa1-0000-4000-8000-000000000001','Cooperativa Vale do Caju','Palmeira dos Índios','Agreste','Josefa Santos','(82) 99999-0001','contato@valedocaju.coop','Beneficiamento de caju e frutas do agreste.','Fundada em 2009 por 22 famílias agricultoras do agreste alagoano.',0.15,-9.4057,-36.6281,22,true),
 ('aaaaaaa1-0000-4000-8000-000000000002','Cooperativa Cocos do Norte','Maragogi','Litoral Norte','Antônio Silva','(82) 99999-0002','contato@cocosdonorte.coop','Leite de coco, coco ralado e derivados.','Nasceu da união de pequenos produtores do litoral norte.',0.12,-9.0122,-35.2225,31,true),
 ('aaaaaaa1-0000-4000-8000-000000000003','Cooperativa Filé do Sertão','Piaçabuçu','Baixo São Francisco','Maria das Dores','(82) 99999-0003','contato@filedosertao.coop','Bordado em filé e artesanato ribeirinho.','Tradição do filé passada entre gerações às margens do São Francisco.',0.10,-10.4064,-36.4344,18,true),
 ('aaaaaaa1-0000-4000-8000-000000000004','Cooperativa Sabor do Sertão','Delmiro Gouveia','Sertão','João Pereira','(82) 99999-0004','contato@sabordosertao.coop','Farinhas, goma de tapioca e biscoitos artesanais.','Cooperativa de agricultura familiar do sertão alagoano.',0.15,-9.3861,-37.9942,27,true);

insert into public.products (id, name, cooperative_id, category_id, description, origin, city, weight, unit, price, cost, is_demo)
select p.id, p.name, p.coop, c.id, p.descr, p.origin, p.city, p.weight, 'un', p.price, p.cost, true
from (values
 ('bbbbbbb1-0000-4000-8000-000000000001'::uuid,'Geleia de Caju 250g','aaaaaaa1-0000-4000-8000-000000000001'::uuid,'doces-geleias','Geleia artesanal de caju, sem conservantes.','Agreste de Alagoas','Palmeira dos Índios',0.25,18.90,9.50),
 ('bbbbbbb1-0000-4000-8000-000000000002'::uuid,'Goiabada Cascão 500g','aaaaaaa1-0000-4000-8000-000000000001'::uuid,'doces-geleias','Goiabada em tabuleiro, receita tradicional.','Agreste de Alagoas','Palmeira dos Índios',0.5,22.00,11.00),
 ('bbbbbbb1-0000-4000-8000-000000000003'::uuid,'Leite de Coco 500ml','aaaaaaa1-0000-4000-8000-000000000002'::uuid,'coco-derivados','Leite de coco puro, extraído a frio.','Litoral Norte','Maragogi',0.5,12.50,6.00),
 ('bbbbbbb1-0000-4000-8000-000000000004'::uuid,'Coco Ralado 200g','aaaaaaa1-0000-4000-8000-000000000002'::uuid,'coco-derivados','Coco ralado desidratado sem açúcar.','Litoral Norte','Maragogi',0.2,9.90,4.20),
 ('bbbbbbb1-0000-4000-8000-000000000005'::uuid,'Goma de Tapioca 1kg','aaaaaaa1-0000-4000-8000-000000000004'::uuid,'alimentos','Goma hidratada pronta para uso.','Sertão de Alagoas','Delmiro Gouveia',1.0,14.00,7.00),
 ('bbbbbbb1-0000-4000-8000-000000000006'::uuid,'Biscoito de Goma 300g','aaaaaaa1-0000-4000-8000-000000000004'::uuid,'alimentos','Biscoito artesanal crocante.','Sertão de Alagoas','Delmiro Gouveia',0.3,11.50,5.50),
 ('bbbbbbb1-0000-4000-8000-000000000007'::uuid,'Licor de Jenipapo 500ml','aaaaaaa1-0000-4000-8000-000000000001'::uuid,'bebidas','Licor artesanal de jenipapo.','Agreste de Alagoas','Palmeira dos Índios',0.5,38.00,18.00),
 ('bbbbbbb1-0000-4000-8000-000000000008'::uuid,'Polpa de Cajá 1kg','aaaaaaa1-0000-4000-8000-000000000002'::uuid,'frutas-derivados','Polpa congelada 100% fruta.','Litoral Norte','Maragogi',1.0,16.00,8.00),
 ('bbbbbbb1-0000-4000-8000-000000000009'::uuid,'Caminho de Mesa em Filé','aaaaaaa1-0000-4000-8000-000000000003'::uuid,'artesanato','Peça bordada à mão em filé.','Baixo São Francisco','Piaçabuçu',0.3,120.00,60.00),
 ('bbbbbbb1-0000-4000-8000-000000000010'::uuid,'Blusa em Filé Artesanal','aaaaaaa1-0000-4000-8000-000000000003'::uuid,'moda-identidade','Blusa bordada em filé, peça única.','Baixo São Francisco','Piaçabuçu',0.4,185.00,95.00)
) as p(id,name,coop,slug,descr,origin,city,weight,price,cost)
join public.product_categories c on c.slug = p.slug;

-- lotes + estoque de demonstração
do $$
declare _p record; _s record; _batch uuid; _i int := 0;
begin
  for _p in select id from public.products order by name loop
    insert into public.product_batches (product_id, batch_code, produced_at, expires_at)
    values (_p.id, 'L' || to_char(now(),'YYMM') || lpad((_i+1)::text,3,'0'),
            current_date - 30, current_date + (case when _i % 4 = 0 then 12 else 180 end))
    returning id into _batch;
    for _s in select id from public.stores loop
      insert into public.inventories (product_id, store_id, batch_id, quantity)
      values (_p.id, _s.id, _batch, 3 + ((_i * 7) % 40));
      _i := _i + 1;
    end loop;
  end loop;
end $$;

insert into public.stock_transfers (from_store_id, to_store_id, product_id, quantity, status, notes)
values ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',
        'bbbbbbb1-0000-4000-8000-000000000001',20,'solicitada','Reposição solicitada por Arapiraca');
