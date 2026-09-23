import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  cooperative: string;
  unit: string;
  image_url?: string | null;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "qty">) => void;
  remove: (product_id: string) => void;
  setQty: (product_id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "alagoas-cooperativa-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* armazenamento indisponível */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const add = (line: Omit<CartLine, "qty">) => {
      setItems((prev) => {
        const found = prev.find((i) => i.product_id === line.product_id);
        if (found) {
          return prev.map((i) =>
            i.product_id === line.product_id ? { ...i, qty: i.qty + 1, price: line.price } : i,
          );
        }
        return [...prev, { ...line, qty: 1 }];
      });
    };

    const remove = (product_id: string) => {
      setItems((prev) => prev.filter((i) => i.product_id !== product_id));
    };

    const setQty = (product_id: string, qty: number) => {
      if (qty <= 0) return remove(product_id);
      setItems((prev) => prev.map((i) => (i.product_id === product_id ? { ...i, qty } : i)));
    };

    const clear = () => setItems([]);

    return {
      items,
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.price * i.qty, 0),
      add,
      remove,
      setQty,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
