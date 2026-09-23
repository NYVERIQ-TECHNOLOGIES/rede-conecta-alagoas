import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  Boxes,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardList,
  HandCoins,
  Landmark,
  Leaf,
  MapPinned,
  PackagePlus,
  PlusCircle,
  RefreshCw,
  Settings,
  ShoppingBasket,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  UserCog,
  Users,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { AppRole } from "./session";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: AppRole[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

type LinkParts = [string, string, LucideIcon];
type RoleParts = [string, string, LucideIcon, AppRole[]];

function group(title: string, parts: (LinkParts | RoleParts)[]): NavGroup {
  return {
    title,
    items: parts.map(([to, label, icon, roles]) =>
      roles ? { to, label, icon, roles: roles as AppRole[] } : { to, label, icon },
    ),
  };
}

const staffRoles: AppRole[] = ["admin", "gerente", "operador"];
const managerOnly: AppRole[] = ["admin", "gerente"];

/** Navegação da experiência ADM — mantém o visual atual, ampliado por experiência. */
export const ADMIN_GROUPS: NavGroup[] = [
  group("Visão Geral", [["/admin", "Visão Geral da Rede", BarChart3]]),
  group("Rede", [
    ["/admin/cooperativas", "Cooperativas", UsersRound],
    ["/admin/lojas", "PDVs / Lojas", Store],
    ["/admin/clientes", "Clientes", Users],
    ["/admin/produtos", "Produtos", ShoppingBasket],
    ["/admin/municipios", "Municípios", MapPinned],
  ]),
  group("Operação", [
    ["/admin/vendas", "Vendas", ClipboardList],
    ["/admin/pedidos", "Pedidos", ShoppingBag],
    ["/admin/estoque", "Estoque", Boxes],
    ["/admin/validades", "Validades", CalendarClock],
    ["/admin/entradas", "Entradas", PackagePlus, staffRoles],
    ["/admin/transferencias", "Transferências", RefreshCw, managerOnly],
    ["/admin/fechamento", "Fechamento de caixa", WalletCards, staffRoles],
  ]),
  group("Financeiro", [
    ["/admin/repasses", "Repasses", HandCoins],
    ["/admin/extrato", "Meu Extrato", Landmark],
  ]),
  group("Inteligência", [
    ["/admin/desempenho", "Desempenho", ChartNoAxesCombined],
    ["/admin/impacto", "Impacto da Rede", Leaf],
    ["/admin/mapa", "Mapa do Cooperativismo", MapPinned],
    ["/admin/inteligencia", "Assistente da Rede", Bot],
  ]),
  group("Administração", [
    ["/admin/usuarios", "Usuários", UserCog],
    ["/admin/permissoes", "Perfis e permissões", Settings],
    ["/admin/configuracoes", "Configurações", Settings],
    ["/admin/logs", "Logs / atividades", ClipboardList],
  ]),
];

/** Navegação operacional do PDV — rápido, escopo da loja. */
export const PDV_GROUPS: NavGroup[] = [
  group("Visão Geral", [["/pdv", "Dashboard", BarChart3]]),
  group("Vendas", [
    ["/pdv/vendas-novo", "Nova venda", PlusCircle],
    ["/pdv/vendas", "Vendas", ClipboardList],
    ["/pdv/pedidos", "Pedidos", ShoppingBag],
    ["/pdv/historico", "Histórico", CalendarClock],
  ]),
  group("Produtos", [
    ["/pdv/produtos", "Produtos disponíveis", ShoppingBasket],
    ["/pdv/catalogo", "Catálogo", ShoppingCart],
    ["/pdv/precos", "Preços", ShoppingBasket],
  ]),
  group("Estoque", [
    ["/pdv/estoque", "Estoque", Boxes],
    ["/pdv/movimentacoes", "Movimentações", RefreshCw],
    ["/pdv/validades", "Validades", CalendarClock],
  ]),
  group("Loja", [
    ["/pdv/loja", "Dados da loja", Store],
    ["/pdv/horarios", "Horários", CalendarClock],
    ["/pdv/usuarios", "Usuários do PDV", UsersRound],
  ]),
  group("Financeiro", [
    ["/pdv/financeiro", "Valores", WalletCards],
    ["/pdv/repasses", "Repasses", HandCoins],
    ["/pdv/historico-financeiro", "Histórico", TrendingUp],
  ]),
];

/** Navegação gerencial da cooperativa. */
export const COOP_GROUPS: NavGroup[] = [
  group("Visão Geral", [["/cooperativa", "Dashboard", BarChart3]]),
  group("Minha Cooperativa", [
    ["/cooperativa/dados", "Dados da cooperativa", Store],
    ["/cooperativa/usuarios", "Usuários", UsersRound],
    ["/cooperativa/responsaveis", "Responsáveis", UserCog],
    ["/cooperativa/atuacao", "Municípios / atuação", MapPinned],
  ]),
  group("Produtos", [
    ["/cooperativa/produtos", "Meus produtos", ShoppingBasket],
    ["/cooperativa/produto-novo", "Novo produto", PlusCircle],
    ["/cooperativa/categorias", "Categorias", ShoppingBasket],
    ["/cooperativa/precos", "Preços", ShoppingBasket],
  ]),
  group("Comercialização", [
    ["/cooperativa/pdvs", "PDVs", Store],
    ["/cooperativa/vendas", "Vendas", ClipboardList],
    ["/cooperativa/pedidos", "Pedidos", ShoppingBag],
    ["/cooperativa/comercializados", "Produtos comercializados", TrendingUp],
  ]),
  group("Estoque", [
    ["/cooperativa/estoque", "Estoque", Boxes],
    ["/cooperativa/movimentacoes", "Movimentações", RefreshCw],
    ["/cooperativa/validades", "Validades", CalendarClock],
  ]),
  group("Financeiro", [
    ["/cooperativa/repasses", "Repasses", HandCoins],
    ["/cooperativa/valores-receber", "Valores a receber", WalletCards],
    ["/cooperativa/historico-financeiro", "Histórico", TrendingUp],
  ]),
  group("Desempenho", [["/cooperativa/desempenho", "Desempenho", ChartNoAxesCombined]]),
];
