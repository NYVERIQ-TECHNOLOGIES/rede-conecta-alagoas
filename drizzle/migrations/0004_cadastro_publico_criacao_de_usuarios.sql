-- ============ CADASTRO PÚBLICO + GOVERNANÇA DO ECOSSISTEMA ============
-- * Cooperativas se cadastram sozinhas (entra com status PENDENTE)
-- * O ADM valida os cadastros: aceita (ativa) ou recusa (inativa)
-- * O ADM cadastra PDVs (gerente/operador) e outros administradores

create extension if not exists pgcrypto;

-- ============ RPC: COOPERATIVA SE CADASTRA (autosserviço) ============
create or replace function public.register_cooperative(
  _name text,
  _email text,
  _city text,
  _cnpj text default null,
  _region text default null,
  _phone text default null,
  _responsible_name text default null,
  _description text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _coop_id uuid;
begin
  -- com sessão ativa usa o próprio usuário; sem sessão (confirmação de e-mail pendente)
  -- resolve o acesso pelo e-mail digitado no cadastro
  if _uid is null then
    select id into _uid from auth.users where lower(email) = lower(_email);
    if _uid is null then
      raise exception 'Não foi possível vincular o cadastro ao seu e-mail. Confirme o e-mail e entre novamente.';
    end if;
  end if;

  if exists (select 1 from public.profiles where id = _uid and cooperative_id is not null) then
    raise exception 'Este acesso já está vinculado a uma cooperativa.';
  end if;

  insert into public.cooperatives (
    name, cnpj, city, region, phone, responsible_name, email, description, status
  ) values (
    _name, _cnpj, _city, _region, _phone, _responsible_name, _email, _description, 'pendente'
  ) returning id into _coop_id;

  update public.profiles set cooperative_id = _coop_id where id = _uid;

  insert into public.user_roles (user_id, role) values (_uid, 'cooperativa')
  on conflict do nothing;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (_uid, 'cadastro_cooperativa', 'cooperatives', _coop_id,
    jsonb_build_object('name', _name, 'city', _city, 'cnpj', _cnpj));

  return _coop_id;
end; $$;

grant execute on function public.register_cooperative(text, text, text, text, text, text, text, text) to authenticated;

-- ============ RPC: ADM ACEITA OU RECUSA O CADASTRO ============
create or replace function public.set_cooperative_status(
  _cooperative_id uuid,
  _status public.entity_status
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Somente a administração pode validar cadastros.';
  end if;

  update public.cooperatives set status = _status where id = _cooperative_id;
  if not found then raise exception 'Cooperativa inexistente.'; end if;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'triagem_cooperativa', 'cooperatives', _cooperative_id,
    jsonb_build_object('status', _status));
end; $$;

grant execute on function public.set_cooperative_status(uuid, public.entity_status) to authenticated;

-- ============ RPC: ADM CADASTRA PDVs E ADMINISTRADORES ============
create or replace function public.create_network_user(
  _email text,
  _password text,
  _full_name text,
  _role public.app_role,
  _store_id uuid default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  _uid uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Somente a administração pode criar usuários.';
  end if;
  if _password is null or length(_password) < 6 then
    raise exception 'A senha precisa ter ao menos 6 caracteres.';
  end if;
  if _role not in ('admin', 'gerente', 'operador', 'consulta') then
    raise exception 'Papel % não pode ser criado por aqui. Use o cadastro público.', _role;
  end if;
  if _store_id is not null and not exists (select 1 from public.stores where id = _store_id) then
    raise exception 'Loja indicada não existe.';
  end if;
  if _role in ('gerente', 'operador') and _store_id is null then
    raise exception 'Papéis de PDV precisam estar vinculados a uma loja.';
  end if;
  if exists (select 1 from auth.users where lower(email) = lower(_email)) then
    raise exception 'Já existe um acesso cadastrado com este e-mail.';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    lower(_email), crypt(_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', _full_name), now(), now(), '', '', '', ''
  ) returning id into _uid;

  update public.profiles
    set full_name = _full_name, email = lower(_email), store_id = _store_id
    where id = _uid;

  insert into public.user_roles (user_id, role) values (_uid, _role)
  on conflict do nothing;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'usuario_criado', 'user_roles', _uid,
    jsonb_build_object('email', lower(_email), 'role', _role, 'store_id', _store_id));

  return _uid;
end; $$;

grant execute on function public.create_network_user(text, text, text, public.app_role, uuid) to authenticated;
