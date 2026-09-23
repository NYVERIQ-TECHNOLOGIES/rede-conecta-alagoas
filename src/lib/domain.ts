export type OrderStatus =
  "criado" | "confirmado" | "separacao" | "pronto" | "entregue" | "concluido" | "cancelado";

export type DeliveryType = "retirada" | "entrega";

export interface Customer {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  preferences: unknown;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string | null;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zip: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  code: number;
  customer_id: string | null;
  store_id: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  address_id: string | null;
  payment_method: string;
  subtotal: number;
  discount: number;
  total: number;
  cancelled_reason: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  stores?: { name: string; city: string; address: string | null } | null;
  customers?: { full_name: string | null } | null;
  customer_addresses?: CustomerAddress | null;
  order_items?: OrderItem[] | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  cooperative_id: string;
  batch_id: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  commission_rate: number;
  net_amount: number;
  products?: { name: string; unit: string; image_url: string | null } | null;
  cooperatives?: { name: string } | null;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  products?: {
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    cooperative_id: string;
    category_id: string | null;
    unit: string;
  } | null;
  cooperatives?: { name: string } | null;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  criado: "Criado",
  confirmado: "Confirmado",
  separacao: "Em separação",
  pronto: "Pronto",
  entregue: "Entregue",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "good" | "warn" | "crit" | "leaf" | "muted"> = {
  criado: "muted",
  confirmado: "leaf",
  separacao: "warn",
  pronto: "warn",
  entregue: "leaf",
  concluido: "good",
  cancelado: "crit",
};

export const DELIVERY_LABEL: Record<DeliveryType, string> = {
  retirada: "Retirada na loja",
  entrega: "Entrega",
};
