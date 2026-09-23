import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/admin/permissoes")({
  head: () => ({
    meta: [
      { title: "Perfis e Permissões — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Matriz de permissões das quatro experiências." },
      { property: "og:title", content: "Perfis e Permissões — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Permissoes,
});

const MATRIX = [
  {
    exp: "CLIENTE",
    tone: "leaf" as const,
    pode: [
      "Visualizar produtos",
      "Fazer compras e pedidos",
      "Consultar pedidos e histórico",
      "Gerenciar próprio perfil, endereços e preferências",
    ],
    naoPode: [
      "Alterar produtos",
      "Alterar estoque",
      "Ver dados internos de cooperativas",
      "Ver dados administrativos da rede",
    ],
  },
  {
    exp: "PDV",
    tone: "clay" as const,
    pode: [
      "Consultar produtos disponíveis",
      "Registrar vendas",
      "Processar pedidos de clientes",
      "Controlar estoque e validades da loja",
      "Consultar preços e repasses",
      "Gerenciar usuários do próprio PDV",
    ],
    naoPode: [
      "Alterar dados de outras lojas",
      "Alterar produtos de cooperativas",
      "Ver dados administrativos globais",
    ],
  },
  {
    exp: "COOPERATIVA",
    tone: "good" as const,
    pode: [
      "Gerenciar seus produtos e preços",
      "Ver vendas e pedidos dos seus produtos",
      "Ver PDVs atendidos",
      "Controlar estoque sob responsabilidade",
      "Ver repasses e indicadores",
      "Gerenciar usuários da própria cooperativa",
    ],
    naoPode: [
      "Alterar dados de outras cooperativas",
      "Administrar usuários globais",
      "Alterar configurações da plataforma",
    ],
  },
  {
    exp: "ADM",
    tone: "warn" as const,
    pode: [
      "Gerenciar clientes, PDVs, cooperativas, produtos e usuários",
      "Gerenciar permissões",
      "Ver vendas, estoque e financeiro",
      "Gerenciar configurações",
      "Ver indicadores globais",
    ],
    naoPode: [],
  },
];

function Permissoes() {
  return (
    <>
      <PageHeader
        eyebrow="🔐 Administração · Perfis"
        title="Perfis e Permissões"
        description="Cada experiência é definida por papel (app_role). A regra é reforçada também nas políticas de segurança do banco (RLS)."
      />

      <Panel title="Como funciona" subtitle="Uma plataforma, quatro experiências, dados conectados">
        <p className="text-[13px] leading-6 text-muted-foreground">
          Um perfil pode acumular papéis (ex.: gerente e operador no mesmo PDV, ou admin comercial e
          operacional na cooperativa). O acesso entra pela experiência garantida pelo papel com
          maior privilégio — <b>ADM &gt; PDV &gt; Cooperativa &gt; Cliente</b>. O banco continua
          validando cada leitura e escrita via RLS para que nenhum papel ultrapasse suas permissões.
        </p>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        {MATRIX.map((m) => (
          <Panel key={m.exp} title={`${m.exp} — visão geral`}>
            <div className="space-y-4">
              <div>
                <div className="label-mono mb-1.5">Pode</div>
                <ul className="space-y-1 text-[13px] text-muted-foreground">
                  {m.pode.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-good" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              {m.naoPode.length > 0 && (
                <div>
                  <div className="label-mono mb-1.5">Não pode</div>
                  <ul className="space-y-1 text-[13px] text-muted-foreground">
                    {m.naoPode.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-crit" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Tag tone={m.tone}>{m.exp}</Tag>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
