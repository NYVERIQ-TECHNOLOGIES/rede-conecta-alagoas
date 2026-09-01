CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare _is_first boolean;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;

  select not exists (select 1 from public.user_roles) into _is_first;

  insert into public.user_roles (user_id, role)
  values (new.id, case when _is_first then 'admin'::app_role else 'consulta'::app_role end)
  on conflict do nothing;
  return new;
end; $function$;