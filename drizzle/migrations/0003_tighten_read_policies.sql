drop policy if exists "authenticated insert audit" on public.audit_logs;
create policy "users insert own audit" on public.audit_logs for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "read batches" on public.product_batches;
create policy "read batches" on public.product_batches for select to authenticated
  using (public.is_staff(auth.uid()) or exists (
    select 1 from public.products p where p.id = product_id and p.cooperative_id = public.current_cooperative_id()));

drop policy if exists "read product images" on public.product_images;
create policy "read product images" on public.product_images for select to authenticated
  using (public.is_staff(auth.uid()) or exists (
    select 1 from public.products p where p.id = product_id
      and (p.status = 'ativa' or p.cooperative_id = public.current_cooperative_id())));

drop policy if exists "read stores" on public.stores;
create policy "read stores" on public.stores for select to authenticated
  using (public.is_staff(auth.uid()) or status = 'ativa' or id = public.current_store_id());

drop policy if exists "read categories" on public.product_categories;
create policy "read categories" on public.product_categories for select to authenticated
  using (public.is_staff(auth.uid()) or public.has_role(auth.uid(),'cooperativa')
    or exists (select 1 from public.products p where p.category_id = product_categories.id and p.status = 'ativa'));