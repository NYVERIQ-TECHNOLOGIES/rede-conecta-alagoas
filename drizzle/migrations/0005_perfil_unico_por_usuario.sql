-- ============ PERFIL ÚNICO POR USUÁRIO (MASTER DEFINE) ============
-- O master (administração) define, para cada usuário, qual o perfil da rede.
-- Substitui atômicamente os papéis e o vínculo de loja do usuário.

create or replace function public.set_user_roles(
  _user_id uuid,
  _role public.app_role,
  _store_id uuid default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  _is_coop boolean;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Somente a administração pode definir perfis.';
  end if;

  if _user_id = auth.uid() and _role <> 'admin' then
    raise exception 'Você não pode remover o próprio perfil de administração.';
  end if;

  if _store_id is not null and not exists (select 1 from public.stores where id = _store_id) then
    raise exception 'Loja indicada não existe.';
  end if;
  if _role in ('gerente', 'operador') and _store_id is null then
    raise exception 'Perfis de PDV precisam estar vinculados a uma loja.';
  end if;

  select exists (
    select 1 from public.profiles where id = _user_id and cooperative_id is not null
  ) into _is_coop;
  if _role = 'cooperativa' and not _is_coop then
    raise exception 'Vincule este usuário a uma cooperativa antes de conceder o perfil.';
  end if;

  delete from public.user_roles where user_id = _user_id;
  insert into public.user_roles (user_id, role) values (_user_id, _role);

  update public.profiles set store_id = _store_id where id = _user_id;

  insert into public.audit_logs (user_id, action, entity, entity_id, new_data)
  values (auth.uid(), 'perfil_definido', 'user_roles', _user_id,
    jsonb_build_object('role', _role, 'store_id', _store_id));
end; $$;

grant execute on function public.set_user_roles(uuid, public.app_role, uuid) to authenticated;