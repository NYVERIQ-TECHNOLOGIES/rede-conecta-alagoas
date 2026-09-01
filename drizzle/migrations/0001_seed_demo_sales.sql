do $$
declare
  _store uuid; _sale uuid; _p record; _d int; _qty int; _i int := 0; _pm public.payment_method;
  _stores uuid[] := array['11111111-1111-1111-1111-111111111111'::uuid,'22222222-2222-2222-2222-222222222222'::uuid,'33333333-3333-3333-3333-333333333333'::uuid];
  _methods public.payment_method[] := array['pix','dinheiro','debito','credito']::public.payment_method[];
begin
  for _d in 0..29 loop
    for _i in 1..3 loop
      _store := _stores[1 + ((_d + _i) % 3)];
      _pm := _methods[1 + ((_d * _i) % 4)];
      insert into public.sales (store_id, total, payment_method, is_demo, created_at)
      values (_store, 0, _pm, true, now() - (_d || ' days')::interval) returning id into _sale;

      for _p in select pr.id, pr.price, pr.cooperative_id, c.commission_rate
                from public.products pr join public.cooperatives c on c.id = pr.cooperative_id
                order by md5(pr.id::text || _d::text || _i::text) limit 2 loop
        _qty := 1 + ((_d + _i) % 3);
        insert into public.sale_items (sale_id, product_id, cooperative_id, quantity, unit_price, total, commission_rate, net_amount)
        values (_sale, _p.id, _p.cooperative_id, _qty, _p.price, _p.price * _qty, _p.commission_rate,
                _p.price * _qty * (1 - _p.commission_rate));
      end loop;

      update public.sales s set total = (select coalesce(sum(total),0) from public.sale_items where sale_id = s.id)
      where s.id = _sale;
    end loop;
  end loop;
end $$;

insert into public.cooperative_settlements (cooperative_id, period_start, period_end, gross_amount, commission_amount, net_amount, status, due_date)
select si.cooperative_id, (current_date - 30), current_date,
  sum(si.total), sum(si.total - si.net_amount), sum(si.net_amount), 'aguardando', current_date + 10
from public.sale_items si join public.sales s on s.id = si.sale_id
where s.created_at >= now() - interval '30 days'
group by si.cooperative_id;
