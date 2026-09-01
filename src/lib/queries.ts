import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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
        .select(
          "*, stores(name), sale_items(*, products(name), cooperatives(name))",
        )
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
        .select("*, products(name), from:stores!stock_transfers_from_store_id_fkey(name), to:stores!stock_transfers_to_store_id_fkey(name)")
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
