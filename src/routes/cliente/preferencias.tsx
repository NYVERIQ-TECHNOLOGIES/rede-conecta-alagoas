import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/cliente/preferencias")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Preferências — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Suas preferências alimentares na rede cooperativista." },
    ],
  }),
  component: Preferencias,
});

const SUGGESTED = ["Vegetariano", "Sem glúten", "Sem lactose", "Orgânico"];

function Preferencias() {
  return (
    <>
      <PageHeader
        eyebrow="🥗 Suas preferências"
        title="Preferências alimentares"
        description="Diga o que você procura na hora de comprar da rede."
      />

      <Panel title="O que é isso?">
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Suas preferências ajudam a destacar produtos que combinam com o seu estilo de vida. Por
          exemplo, quem marca “vegetariano” vê primeiro produtos sem carne, e quem marca “orgânico”
          encontra facilmente a produção sem agroquímicos das cooperativas.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTED.map((c) => (
            <span
              key={c}
              className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-line bg-panel-2 px-4 py-2 text-[13px] font-medium text-muted-foreground select-none"
            >
              <Leaf className="size-3.5 text-leaf" /> {c}
            </span>
          ))}
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-md border border-dashed border-line bg-panel-2/60 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-warn" />
          Em breve você poderá salvar suas preferências e ver produtos compatíveis em destaque. Por
          enquanto, este recurso está em preparação.
        </p>
      </Panel>
    </>
  );
}
