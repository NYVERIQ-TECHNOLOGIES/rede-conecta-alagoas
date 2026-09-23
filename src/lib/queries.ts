import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Customer, CustomerAddress, Order, OrderItem, StoreProduct } from "@/lib/domain";
import type { AppRole, Profile } from "@/lib/session";

/**
 * Cliente flexível para tabelas criadas após a última geração de tipos do Supabase.
 * Assim que os tipos forem regenerados, esta variável pode ser trocada por `supabase`.
 */
const rpc = (fn: string, args: Record<string, unknown>) =>
  (
    supabase as unknown as {
      rpc: (f: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>;
    }
  ).rpc(fn, args);

const db = supabase as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- builder flexível para tabelas ainda sem tipos
  from: (table: string) => any;
};

/** Executa consultas nas tabelas novas de forma tolerante (retorna vazio se a tabela ainda não existir). */
async function fresh<T>(
  run: () => Promise<{ data: T | null; error: { message?: string } | null }>,
): Promise<T> {
  try {
    const { data, error } = await run();
    if (error) {
      console.warn("[fresh]", error.message);
      return [] as unknown as T;
    }
    return (data ?? []) as T;
  } catch (err) {
    console.warn("[fresh]", err);
    return [] as unknown as T;
  }
}

type DbRole = Database["public"]["Enums"]["app_role"];
type CooperativeInsert = Database["public"]["Tables"]["cooperatives"]["Insert"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type StoreInsert = Database["public"]["Tables"]["stores"]["Insert"];

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: StoreInsert) => {
      const { data, error } = await supabase.from("stores").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useCreateCooperative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CooperativeInsert) => {
      const { data, error } = await supabase.from("cooperatives").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cooperatives"] }),
  });
}

export function useDeleteCooperative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cooperatives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperatives"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProductInsert) => {
      const { data, error } = await supabase.from("products").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCooperatives() {
  return useQuery({
    queryKey: ["cooperatives"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cooperatives").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, cooperatives(name, city, region), product_categories(name, emoji)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventories")
        .select(
          "*, products(name, price, cooperative_id, cooperatives(name)), stores(name), product_batches(batch_code, expires_at)",
        )
        .order("quantity");
      if (error) throw error;
      return data;
    },
  });
}

export function useSales(sinceISO?: string) {
  return useQuery({
    queryKey: ["sales", sinceISO ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("sales")
        .select("*, stores(name), sale_items(*, products(name), cooperatives(name))")
        .order("created_at", { ascending: false })
        .limit(500);
      if (sinceISO) q = q.gte("created_at", sinceISO);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useSettlements() {
  return useQuery({
    queryKey: ["settlements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cooperative_settlements")
        .select("*, cooperatives(name, city)")
        .order("period_end", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_transfers")
        .select(
          "*, products(name), from:stores!stock_transfers_from_store_id_fkey(name), to:stores!stock_transfers_to_store_id_fkey(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function stockTone(quantity: number, min: number, critical: number) {
  if (quantity <= critical) return "crit" as const;
  if (quantity <= min) return "warn" as const;
  return "good" as const;
}

export function stockLabel(quantity: number, min: number, critical: number) {
  if (quantity <= critical) return "Crítico";
  if (quantity <= min) return "Baixo";
  return "Saudável";
}

/* ------------------------------------------------------------------ *
 * CLIENTES
 * ------------------------------------------------------------------ */

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      fresh<Customer[]>(() =>
        db
          .from("customers")
          .select("*, profiles!customers_user_id_fkey(full_name, email)")
          .order("created_at", { ascending: false }),
      ),
  });
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: ["customer-profile"],
    queryFn: async (): Promise<Customer | null> => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return null;
      const { data, error } = await db
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) return null;
      return (data as Customer) ?? null;
    },
  });
}

export function useCreateCustomerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      full_name,
      email,
      phone,
      cpf,
    }: {
      full_name: string;
      email: string;
      phone?: string | undefined;
      cpf?: string | undefined;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");
      const { data, error } = await db
        .from("customers")
        .upsert(
          { user_id: userId, full_name, email, phone: phone || null, cpf: cpf || null },
          { onConflict: "user_id" },
        )
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-profile"] }),
  });
}

export function useCustomerAddresses() {
  return useQuery({
    queryKey: ["customer-addresses"],
    queryFn: () =>
      fresh<CustomerAddress[]>(() =>
        db.from("customer_addresses").select("*").order("is_default", { ascending: false }),
      ),
  });
}

export function useSaveAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Omit<CustomerAddress, "id" | "created_at"> & { id?: string | undefined }) => {
      const { data, error } = values.id
        ? await db
            .from("customer_addresses")
            .update({
              label: values.label,
              street: values.street,
              number: values.number,
              complement: values.complement,
              neighborhood: values.neighborhood,
              city: values.city,
              state: values.state,
              zip: values.zip,
              is_default: values.is_default,
            })
            .eq("id", values.id)
            .select()
            .maybeSingle()
        : await db.from("customer_addresses").insert(values).select().maybeSingle();
      if (error) throw error;
      return data as CustomerAddress;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("customer_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-addresses"] }),
  });
}

/* ------------------------------------------------------------------ *
 * PEDIDOS (a RLS restringe: cliente vê os próprios, PDV vê os da loja, ADM vê todos)
 * ------------------------------------------------------------------ */

const ORDER_SELECT =
  "*, stores(name, city, address), customers(full_name), customer_addresses(*), order_items(*, products(name, unit, image_url), cooperatives(name))";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      fresh<Order[]>(() =>
        db.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(200),
      ),
  });
}

export function useOrdersByStore(storeId: string | undefined) {
  return useQuery({
    queryKey: ["orders", "store", storeId ?? "all"],
    queryFn: () =>
      fresh<Order[]>(() => {
        let q = db
          .from("orders")
          .select(ORDER_SELECT)
          .order("created_at", { ascending: false })
          .limit(200);
        if (storeId) q = q.eq("store_id", storeId);
        return q;
      }),
    enabled: !!storeId,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: async (): Promise<Order | null> => {
      if (!orderId) return null;
      const { data, error } = await db
        .from("orders")
        .select(ORDER_SELECT)
        .eq("id", orderId)
        .maybeSingle();
      if (error) return null;
      return (data as Order) ?? null;
    },
    enabled: !!orderId,
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      store_id: string;
      delivery_type: "retirada" | "entrega";
      address_id: string | null;
      payment_method: string;
      discount: number;
      items: { product_id: string; quantity: number }[];
    }) => {
      const { data, error } = await rpc("place_order", {
        _store_id: args.store_id,
        _delivery_type: args.delivery_type,
        _address_id: args.address_id,
        _payment_method: args.payment_method,
        _discount: args.discount,
        _items: args.items,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await rpc("confirm_order_to_sale", { _order_id: orderId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await rpc("cancel_order", { _order_id: orderId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

/* ------------------------------------------------------------------ *
 * CATÁLOGO POR PDV
 * ------------------------------------------------------------------ */

export function useStoreProducts(storeId: string | undefined) {
  return useQuery({
    queryKey: ["store-products", storeId ?? "all"],
    queryFn: () =>
      fresh<StoreProduct[]>(() =>
        db
          .from("store_products")
          .select(
            "*, products(name, price, description, image_url, cooperative_id, category_id, unit, status), cooperatives(name)",
          )
          .eq("store_id", storeId)
          .order("sort_order"),
      ),
    enabled: !!storeId,
  });
}

export function useSetStoreProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      store_id,
      product_id,
      active,
    }: {
      store_id: string;
      product_id: string;
      active: boolean;
    }) => {
      const { error } = await db
        .from("store_products")
        .upsert({ store_id, product_id, active }, { onConflict: "store_id,product_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-products"] }),
  });
}

export function useStoresWithProduct(productId: string, enabled = true) {
  return useQuery({
    queryKey: ["stores-with-product", productId],
    queryFn: () =>
      fresh<
        {
          store_id: string;
          active: boolean;
          stores: { name: string; city: string; address: string | null } | null;
        }[]
      >(() =>
        db
          .from("store_products")
          .select("store_id, active, stores(name, city, address)")
          .eq("product_id", productId)
          .eq("active", true),
      ),
    enabled,
  });
}

/* ------------------------------------------------------------------ *
 * USUÁRIOS E PERFIS (ADM)
 * ------------------------------------------------------------------ */

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<{ profile: Profile; roles: AppRole[] }[]> => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        db.from("profiles").select("*").order("full_name"),
        db.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map<string, AppRole[]>();
      (roles ?? []).forEach((r: { user_id: string; role: AppRole }) => {
        roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
      });
      return ((profiles ?? []) as Profile[]).map((p) => ({
        profile: p,
        roles: roleMap.get(p.id) ?? [],
      }));
    },
  });
}

export function useAddRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id, role: role as DbRole });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", role as DbRole);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () =>
      fresh<Database["public"]["Tables"]["audit_logs"]["Row"][]>(() =>
        db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(150),
      ),
  });
}

export type { Order, OrderItem, StoreProduct };
