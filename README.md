# Rede Alagoas Conecta

PROMPT MESTRE — ALAGOAS+COOPERATIVA

1. OBJETIVO DO PROJETO

Crie um SaaS completo chamado ALAGOAS+COOPERATIVA — Sistema de Gestão da Rede de Comercialização Cooperativista de Alagoas.

O sistema não deve parecer um ERP genérico adaptado para lojas. Ele deve ser construído como a infraestrutura digital da própria rede Alagoas+Cooperativa, conectando cooperativas, produtos, lojas, estoque, vendas, financeiro, repasses e indicadores.

O conceito central do sistema é:

Quem produz → o que produz → onde está → onde vende → quanto vende → quanto recebe → qual impacto gera.

O sistema deve nascer preparado para a realidade atual da rede e para sua expansão futura.

Hoje considerar:

3 lojas: Maceió, Arapiraca e Piaçabuçu

30+ cooperativas e empreendimentos

Centenas de produtos

A arquitetura deve permitir crescimento para:

8+ lojas

100+ cooperativas

Sem necessidade de reconstruir a aplicação.

2. IDENTIDADE E POSICIONAMENTO

Nome oficial:

ALAGOAS+COOPERATIVA

Subtítulo:

Sistema de Gestão da Rede de Comercialização Cooperativista de Alagoas

Mensagem institucional:

Onde a produção cooperativista encontra o mercado.

O sistema deve transmitir:

Cooperativismo

Agricultura familiar

Desenvolvimento regional

Identidade alagoana

Comercialização

Transparência

Confiança

Pessoas

Produtos

Território

Impacto social e econômico

Não criar uma marca paralela.

A interface deve parecer uma extensão natural da identidade existente do Alagoas+Cooperativa.

Evitar:

Aparência de banco

Aparência de ERP corporativo tradicional

Excesso de cinza

Interfaces frias

Excesso de gráficos sem contexto

Visual excessivamente técnico

Priorizar:

Design institucional + regional + contemporâneo

Elementos inspirados em Alagoas

Fotografias de produtos

Cards espaçosos

Ícones simples

Tipografia limpa

Elementos orgânicos

Destaque para produtos e pessoas

A interface deve ser bonita, moderna, humana e profissional.

3. PRINCÍPIO DE LINGUAGEM

Utilize linguagem humana e cooperativista.

Não utilizar termos excessivamente técnicos de ERP.

Exemplos:

Em vez de:
"fornecedores"

Usar:
🤝 Cooperativas

Em vez de:
"Produtos cadastrados"

Usar:
Produtos da Rede

Em vez de:
"Filiais"

Usar:
📍 Nossas Lojas

Em vez de:
"Relatório de vendas"

Usar:
📈 Desempenho da Rede

Em vez de:
"Estoque por filial"

Usar:
📦 Estoque da Rede

4. PERFIS DE USUÁRIO

Implementar controle de acesso baseado em funções.

ADMINISTRAÇÃO DA REDE

Acesso completo ao sistema.

Pode:

Gerenciar lojas

Gerenciar cooperativas

Gerenciar produtos

Gerenciar categorias

Gerenciar estoque

Gerenciar entradas

Gerenciar transferências

Gerenciar vendas

Gerenciar repasses

Visualizar relatórios

Gerenciar usuários

Visualizar impacto

Visualizar mapa

Configurar o sistema

Consultar auditoria

GERENTE DA LOJA

Acesso somente à sua loja.

Pode:

Visualizar dashboard da loja

Operar PDV

Consultar estoque

Registrar entradas

Solicitar/aprovar operações permitidas

Realizar transferências conforme permissão

Consultar vendas

Realizar fechamento de caixa

OPERADOR

Acesso operacional.

Principalmente:

PDV

Vendas

Operações autorizadas de estoque

Não permitir acesso administrativo ou financeiro completo.

COOPERATIVA

Cada cooperativa deve visualizar somente suas próprias informações.

Pode acessar:

Dashboard

Meus produtos

Meu estoque

Minhas vendas

Meu extrato

Valores a receber

Histórico

CONSULTA

Acesso somente aos relatórios autorizados.

5. MENU PRINCIPAL

Criar sidebar responsiva com:

🏠 Início

📊 Visão da Rede

🏪 Lojas

Maceió

Arapiraca

Piaçabuçu

🤝 Cooperativas

🛍️ Produtos da Rede

📦 Estoque

Estoque geral

Entradas

Transferências

Perdas

Validades

🛒 Vendas

PDV

Vendas

Cancelamentos

💰 Financeiro

Repasses

Recebimentos

Fechamento

📈 Desempenho

Vendas

Produtos

Lojas

Cooperativas

🌱 Impacto da Rede

🗺️ Mapa do Cooperativismo

🤖 Inteligência

⚙️ Configurações

6. DASHBOARD — VISÃO DA REDE

A primeira tela após login deve ser:

Visão da Rede

Exibir saudação:

Bom dia! 👋

Título:

Visão Geral

Período selecionável:

Hoje

7 dias

30 dias

Mês atual

Mês anterior

Personalizado

Criar cards:

Vendas

Valor total comercializado.

Cooperativas

Quantidade ativa.

Produtos

Quantidade cadastrada.

Lojas

Quantidade ativa.

Adicionar:

Desempenho das Lojas

Mostrar:

Maceió

Arapiraca

Piaçabuçu

Comparar:

Vendas

Produtos

Estoque

Crescimento

Produtos em Destaque

Mostrar ranking amigável:

🥇 Produto 1
🥈 Produto 2
🥉 Produto 3

Atenção

Criar alertas para:

Produtos com estoque baixo

Produtos com estoque crítico

Produtos próximos do vencimento

Cooperativas aguardando repasse

Transferências pendentes

Outras situações importantes

Não criar números fictícios permanentes.

Quando não houver dados reais, mostrar estados vazios apropriados.

7. MODELO CENTRAL — PRODUTO DA REDE

O conceito mais importante do sistema é:

O produto não pertence simplesmente à loja.

Todo produto deve possuir origem cooperativista.

Relacionamento:

COOPERATIVA
↓
PRODUTO
↓
LOTE
↓
ESTOQUE
↓
LOJA
↓
VENDA
↓
REPASSE

Exemplo:

Geleia de Caju 250g

Cooperativa: determinada cooperativa cadastrada
Origem: Agreste de Alagoas
Categoria: Alimentos
Preço: R$ 18,90

Estoque:

Maceió: 32
Arapiraca: 17
Piaçabuçu: 8
Total: 57

Se 5 unidades forem vendidas em Maceió, o sistema deve atualizar automaticamente:

Estoque

Venda

Cooperativa responsável

Valor da venda

Comissão/taxa

Valor a repassar

Indicadores

8. CADASTRO DE COOPERATIVAS

Criar tela:

🤝 Cooperativas da Rede

Exibir cards/listagem com:

Logo

Nome

Município

Região

Status

Quantidade de produtos

Status:
🟢 Ativa
🟡 Pendente
🔴 Inativa

Ao abrir uma cooperativa:

Perfil da Cooperativa

Campos:

Logo

Nome

CNPJ

Município

Região

Responsável

Telefone

E-mail

Redes sociais

Descrição

História

Status

Abas:

Descrição

Produtos

Vendas

Estoque

Valores a receber

Histórico

🌱 História

Criar uma área especial para contar quem produz.

Essa informação poderá posteriormente alimentar o catálogo público.

9. CADASTRO DE PRODUTOS

Criar:

🛍️ Produtos da Rede

Campos:

Nome

Foto

Cooperativa responsável

Categoria

Descrição

Origem

Município

Peso

Unidade

Ingredientes

Validade

Lote

Preço

Custo

Margem

Status

Criar seção:

🌱 Quem produz?

Exibir informações da cooperativa responsável.

Permitir múltiplas imagens do produto.

O produto deve ter identidade e contexto, não ser apenas um item de estoque.

10. CATEGORIAS

Criar categorias iniciais baseadas no mix real da rede:

🍯 Doces & Geleias

Geleias

Doces

Goiabadas

Compotas

🥥 Coco & Derivados

Leite de coco

Coco ralado

Produtos derivados

🌽 Alimentos

Farinhas

Goma de tapioca

Biscoitos

Bolos

Broas

Chips

🍹 Bebidas

Licores

Cachaças

Vinhos

Bebidas artesanais

🍌 Frutas & Derivados

Polpas

Chips

Produtos desidratados

Derivados

🧶 Artesanato

Bordados

Filé

Artesanato regional

Decoração

👕 Moda & Identidade

Vestuário

Peças em filé

Produtos artesanais

Permitir criação e edição de novas categorias.

11. LOJAS

Criar:

📍 Nossas Lojas

Lojas iniciais:

Maceió

Mercado 31 — Jaraguá

Arapiraca

Partage Shopping

Piaçabuçu

Centro

Cada loja deve possuir:

Nome

Endereço

Município

Responsável

Horário

Status

Vendas

Produtos

Estoque

A arquitetura deve permitir adicionar novas lojas sem alterar o sistema.

A unidade de Piaçabuçu deve permitir futuramente análises específicas relacionadas ao fluxo de moradores e turistas ligados ao Rio São Francisco.

12. ESTOQUE

Criar módulo completo:

📦 Estoque da Rede

Indicadores:

🟢 Estoque saudável
🟡 Estoque baixo
🔴 Estoque crítico
🟣 Próximo do vencimento

Exibir:

Produto

Cooperativa

Loja

Lote

Quantidade

Validade

Status

Criar filtros:

Loja

Cooperativa

Categoria

Produto

Status

Lote

Validade

13. ENTRADA DE PRODUTOS

Criar fluxo:

📦 Nova Entrada

Campos:

Cooperativa

Produto

Lote

Quantidade

Data de fabricação

Validade

Loja

Documento/NF

Upload do documento

Botão:

Registrar entrada

Ao registrar:

Criar movimento de estoque

Atualizar quantidade

Associar lote

Associar validade

Associar cooperativa

Registrar documento

Registrar usuário responsável

Criar log de auditoria

14. CONTROLE DE LOTES E VALIDADE

Obrigatório.

O sistema deve controlar lote e validade individualmente.

Criar tela:

⚠️ Produtos próximos do vencimento

Colunas:

Produto

Loja

Lote

Validade

Quantidade

Dias restantes

Status

Criar ações:

Transferir

Promover

Priorizar venda

Criar filtros por período de validade.

15. TRANSFERÊNCIA ENTRE LOJAS

Criar fluxo de transferência.

Exemplo:

Arapiraca solicita produto.

Sistema verifica estoque disponível em Maceió.

Se existir quantidade suficiente:

🔄 Transferência sugerida

Maceió → Arapiraca

20 unidades

Botão:

Aprovar transferência

Fluxo:

Solicitação
→ Aprovação
→ Separação
→ Envio
→ Recebimento
→ Atualização dos estoques

Registrar histórico completo.

16. PDV

Criar um PDV extremamente simples.

A tela deve priorizar velocidade e facilidade.

Elementos:

🔎 Buscar produto

📷 Escanear código

🛒 Carrinho

Quantidade

Preço

Desconto, caso autorizado

Subtotal

Total

Pagamento:

PIX

Dinheiro

Débito

Crédito

Após finalizar:

Venda → estoque → cooperativa → financeiro → indicadores

Tudo deve ser integrado automaticamente.

Criar confirmação clara de venda.

17. VENDAS

Criar módulo:

🛒 Vendas

Permitir:

Listagem

Busca

Filtros

Detalhes

Cancelamento conforme permissão

Consulta por loja

Consulta por cooperativa

Consulta por produto

Consulta por período

Consulta por forma de pagamento

Cada venda deve possuir:

Número

Data/hora

Loja

Operador

Itens

Produtos

Quantidades

Valores

Pagamento

Cooperativa relacionada

Taxa/comissão

Valor líquido

18. REPASSES ÀS COOPERATIVAS

Este é um dos módulos financeiros mais importantes.

Criar:

💰 Repasses às Cooperativas

Exemplo de cálculo:

Vendas no período:
R$ 18.450

(-) Taxa/comissão da rede:
R$ 2.767

Valor a repassar:
R$ 15.683

Status:

🟡 Aguardando pagamento

🟢 Repassado

O cálculo deve ser automático com base nas vendas.

Cada repasse deve possuir:

Cooperativa

Período

Vendas brutas

Devoluções

Taxas/comissões

Ajustes

Valor líquido

Status

Data prevista

Data de pagamento

Comprovante

Histórico

19. EXTRATO DA COOPERATIVA

Criar:

🤝 Meu Extrato

A cooperativa deve conseguir consultar de forma transparente:

Vendas

Produtos vendidos

Quantidades

Valores

Taxas

Devoluções

Ajustes

Valores já repassados

Valores a receber

Permitir clicar em cada lançamento para ver os detalhes.

O objetivo é reduzir conflitos e aumentar a confiança.

20. DESEMPENHO DOS PRODUTOS

Criar:

🏆 Produtos em Destaque

Indicadores:

Mais vendidos

Produto

Produto

Produto

Produto

Produto

Maior faturamento

Ranking por valor comercializado.

Maior crescimento

Mostrar percentual de crescimento comparado ao período anterior.

Usar dados reais.

21. DESTAQUES DA REDE

Não transformar o cooperativismo em uma competição agressiva.

Em vez de "ranking das cooperativas", utilizar:

🌱 Destaques da Rede

Indicadores:

Maior crescimento

Maior volume comercializado

Produto destaque

Nova cooperativa em destaque

O objetivo é gerar inteligência comercial sem prejudicar o princípio de cooperação.

22. DASHBOARD DE IMPACTO

Criar módulo:

🌱 Impacto da Rede

Não mostrar somente desempenho financeiro.

Mostrar impacto da rede.

Indicadores:

Valor total em produtos comercializados

Cooperativas e empreendimentos

Produtos

Lojas

Municípios representados

Categorias

Famílias/cooperados alcançados

IMPORTANTE:

O indicador de famílias/cooperados alcançados somente deve aparecer quando houver dado confiável fornecido pelas cooperativas.

Nunca inventar indicadores.

23. MAPA DO COOPERATIVISMO

Criar:

🗺️ Mapa do Cooperativismo

Utilizar mapa de Alagoas.

Cada município com cooperativas deve possuir ponto.

Ao clicar no município:

Mostrar:

Município

Número de cooperativas

Número de produtos

Valor comercializado

Categorias

Informações disponíveis

Exemplo:

Piaçabuçu

4 cooperativas
28 produtos
R$ XX em vendas

O mapa deve ser visualmente bonito e integrado ao conceito territorial da rede.

24. INTELIGÊNCIA

Criar módulo:

🤖 Inteligência

Não utilizar IA apenas como elemento decorativo.

A IA deve futuramente ajudar em decisões.

Criar inicialmente uma interface preparada para:

Assistente da Rede

Exemplos de perguntas:

"Qual loja vende mais geleia?"

Resposta baseada nos dados reais.

"Quais produtos estão em risco de ruptura?"

Resposta baseada no estoque e velocidade de vendas.

"Qual cooperativa cresceu mais este mês?"

Resposta baseada nos dados reais.

Nunca inventar respostas.

Se não houver dados suficientes, informar claramente que não existem dados suficientes.

25. ARQUITETURA DO BANCO DE DADOS

Utilizar Supabase como backend.

Criar estrutura relacional preparada para crescimento.

Tabelas principais:

users

profiles

roles

permissions

stores

cooperatives

cooperatives_users

products

product_categories

product_images

product_batches

inventories

inventory_movements

stock_transfers

sales

sale_items

payments

financial_transactions

cooperative_settlements

cooperative_settlement_items

product_losses

product_expirations

audit_logs

Criar relacionamentos consistentes.

O modelo principal deve permitir:

cooperative
→ products
→ batches
→ inventory
→ store
→ sale
→ settlement

26. SEGURANÇA E RLS

Implementar Row Level Security no Supabase.

Regras:

ADMIN:
Acesso completo.

GERENTE:
Somente informações da sua loja.

OPERADOR:
Somente operações autorizadas.

COOPERATIVA:
Somente seus próprios produtos, estoque, vendas e financeiro.

CONSULTA:
Somente relatórios autorizados.

Nunca permitir que uma cooperativa visualize dados financeiros ou operacionais de outra cooperativa.

Nunca confiar somente no frontend para segurança.

As regras de acesso devem existir no banco através de RLS/policies.

27. AUDITORIA

Registrar ações importantes.

Criar:

audit_logs

Registrar:

Usuário

Ação

Entidade

ID do registro

Data/hora

Dados anteriores quando necessário

Dados novos quando necessário

Auditar principalmente:

Vendas

Cancelamentos

Entradas

Transferências

Alterações de estoque

Repasses

Alterações financeiras

Alterações de usuários

Alterações de permissões

28. FECHAMENTO DE CAIXA

Criar módulo:

Fechamento

Permitir:

Abrir caixa

Registrar operador

Valor inicial

Vendas

PIX

Dinheiro

Débito

Crédito

Ajustes

Diferenças

Fechar caixa

Gerar resumo do fechamento.

29. RELATÓRIOS

Criar relatórios:

Vendas

Por período

Por loja

Por produto

Por cooperativa

Por categoria

Estoque

Estoque atual

Estoque baixo

Estoque crítico

Validades

Movimentações

Financeiro

Vendas

Taxas

Repasses

Valores a receber

Valores pagos

Desempenho

Produtos

Lojas

Cooperativas

Permitir filtros e exportação quando tecnicamente viável.

30. EXPERIÊNCIA DO USUÁRIO

A aplicação deve ser:

Responsiva

Desktop-first para administração

Excelente em tablet

Adaptada para celular

Rápida

Intuitiva

Acessível

Visualmente consistente

Criar estados:

Loading

Empty state

Error state

Success

Confirmation

Validation

Não deixar telas quebradas quando não houver dados.

Utilizar skeleton loading quando apropriado.

31. DASHBOARDS

Não transformar cada tela em um painel cheio de gráficos.

Os gráficos devem existir somente quando ajudarem na tomada de decisão.

Priorizar:

Indicadores

Alertas

Comparações

Tendências

Informações acionáveis

Usar gráficos simples e legíveis.

32. DADOS DE DEMONSTRAÇÃO

Durante o desenvolvimento, criar dados seed/demonstração para permitir testar o sistema.

Utilizar os exemplos conceituais do projeto, mas deixar claramente identificados como dados de demonstração.

Não apresentar dados fictícios como dados reais.

Criar dados para:

Lojas

Cooperativas

Produtos

Categorias

Lotes

Estoque

Vendas

Repasses

Usuários

33. CATÁLOGO PÚBLICO — FASE 2

Preparar arquitetura para futura criação de catálogo público.

Não é prioridade do MVP.

No futuro:

Alagoas+Cooperativa

"Produtos de quem coopera para transformar Alagoas."

Permitir ao consumidor navegar por:

🍯 Alimentos
🥥 Derivados
🍹 Bebidas
🧶 Artesanato
👕 Moda

E visualizar:

Produto
→ Cooperativa
→ Pessoa/História
→ Município
→ Origem

34. MVP 1.0

Priorizar no MVP:

ADMIN

Dashboard

Lojas

Cooperativas

Produtos

Estoque

Entradas

Transferências

Vendas

Repasses

Relatórios

Usuários

LOJA

Dashboard

PDV

Estoque

Entradas

Transferências

Fechamento de caixa

Vendas

COOPERATIVA

Dashboard

Meus produtos

Meu estoque

Minhas vendas

Meu extrato

Valores a receber

Essas funcionalidades devem funcionar de ponta a ponta.

35. FUNCIONALIDADES FUTURAS

Preparar arquitetura para:

Catálogo público

Aplicativo/mobile

Integrações de pagamento

Leitor de código de barras

Integração fiscal

IA/Assistente da Rede

Previsão de demanda

Recomendações de transferência

Análise avançada de vendas

Novas lojas

Novas cooperativas

Novos municípios

Novas categorias

36. REGRAS IMPORTANTES

Não criar um ERP genérico.

O centro do sistema é a rede cooperativista.

O produto deve manter sua origem cooperativista.

Toda venda deve conseguir chegar à cooperativa responsável.

O estoque deve ser controlado por loja e lote.

Produtos alimentícios devem possuir controle de validade.

Repasses devem ser calculados com base nas vendas.

Cooperativas devem possuir transparência sobre seus próprios dados.

Utilizar RLS para segurança.

Preparar arquitetura para expansão.

Não criar competição agressiva entre cooperativas.

Não inventar dados reais.

Não exibir informações sem fonte ou sem dados.

A interface deve ser humana e cooperativista.

O sistema deve priorizar decisões e operações reais.

O PDV deve ser simples e rápido.

Todas as operações importantes devem possuir histórico/auditoria.

O design deve valorizar produtos, pessoas e território.

37. TECNOLOGIA

Utilize uma arquitetura moderna e escalável.

Preferencialmente:

Frontend:

React

TypeScript

Tailwind CSS

Componentes reutilizáveis

Backend:

Supabase

PostgreSQL

Supabase Auth

RLS

Storage

Organizar o código de maneira modular.

Separar:

Componentes

Páginas

Hooks

Serviços

Tipos

Regras de negócio

Integrações

Evitar código duplicado.

38. DESIGN SYSTEM

Criar um design system próprio para o Alagoas+Cooperativa.

Definir:

Tipografia

Hierarquia visual

Espaçamentos

Border radius

Cards

Botões

Inputs

Selects

Tables

Badges

Modais

Alertas

Toasts

Tabs

Dropdowns

Utilizar ícones simples e consistentes.

O design deve transmitir:
regional + humano + moderno + confiável + cooperativista.

39. RESPONSIVIDADE

Desktop:
Sidebar completa + área de conteúdo.

Tablet:
Sidebar adaptável.

Mobile:
Menu compacto.

O PDV deve funcionar muito bem em telas menores.

Tabelas devem possuir comportamento responsivo.

Nunca deixar conteúdo horizontal impossível de usar.

40. FLUXOS PRINCIPAIS A IMPLEMENTAR

Implementar completamente estes fluxos:

Fluxo 1 — Cadastro de cooperativa

Admin
→ Cooperativas
→ Nova cooperativa
→ Cadastro
→ Salvar
→ Perfil

Fluxo 2 — Cadastro de produto

Admin
→ Produtos
→ Novo produto
→ Selecionar cooperativa
→ Categoria
→ Informações
→ Foto
→ Salvar

Fluxo 3 — Entrada

Loja
→ Entradas
→ Nova entrada
→ Cooperativa
→ Produto
→ Lote
→ Quantidade
→ Validade
→ NF
→ Registrar

Fluxo 4 — Venda

Operador
→ PDV
→ Buscar produto
→ Adicionar ao carrinho
→ Pagamento
→ Finalizar
→ Atualizar estoque
→ Registrar venda
→ Atualizar financeiro
→ Atualizar repasse

Fluxo 5 — Transferência

Loja
→ Estoque
→ Solicitar transferência
→ Outra loja
→ Produto
→ Quantidade
→ Aprovação
→ Envio
→ Recebimento
→ Atualizar estoque

Fluxo 6 — Repasse

Admin
→ Financeiro
→ Repasses
→ Selecionar cooperativa
→ Selecionar período
→ Sistema calcula
→ Conferir
→ Registrar pagamento
→ Histórico

Fluxo 7 — Cooperativa

Cooperativa
→ Dashboard
→ Produtos
→ Vendas
→ Extrato
→ Valores a receber

41. QUALIDADE

Antes de considerar o projeto concluído:

Testar autenticação

Testar permissões

Testar RLS

Testar CRUD

Testar estoque

Testar lotes

Testar validade

Testar transferências

Testar PDV

Testar pagamentos

Testar cancelamentos

Testar repasses

Testar fechamento de caixa

Testar dashboards

Testar responsividade

Testar estados vazios

Testar erros

Testar auditoria

Garantir que os dados permaneçam consistentes.

42. PRIORIDADE DE IMPLEMENTAÇÃO

Construa nesta ordem:

FASE 1
Autenticação + usuários + perfis + permissões

FASE 2
Lojas + cooperativas + categorias + produtos

FASE 3
Estoque + lotes + validade + entradas

FASE 4
Transferências

FASE 5
PDV + vendas + pagamentos

FASE 6
Financeiro + repasses + extratos

FASE 7
Dashboards + desempenho

FASE 8
Impacto + mapa

FASE 9
Auditoria + relatórios + refinamento

FASE 10
Preparação para funcionalidades futuras

43. RESULTADO ESPERADO

O resultado final deve ser um SaaS funcional, moderno e escalável que represente a operação do Alagoas+Cooperativa.

Não quero apenas uma demonstração visual.

Quero uma aplicação com:

Banco de dados funcional

Autenticação

Permissões

RLS

CRUDs completos

Estoque funcional

Lotes

Validades

Transferências

PDV

Vendas

Financeiro

Repasses

Extrato das cooperativas

Dashboards

Relatórios

Auditoria

O sistema deve conectar toda a cadeia:

COOPERATIVA
↓
PRODUTO
↓
LOTE
↓
ESTOQUE
↓
LOJA
↓
VENDA
↓
FINANCEIRO
↓
REPASSE
↓
IMPACTO

O objetivo é transformar o Alagoas+Cooperativa em uma verdadeira infraestrutura digital da rede de comercialização cooperativista de Alagoas, e não apenas em um sistema de controle de estoque.

Comece pela arquitetura, banco de dados, autenticação, permissões e estrutura principal da aplicação. Depois implemente os módulos na ordem definida acima.

Não simplifique as regras de negócio descritas neste prompt.
Não substitua a identidade cooperativista por uma estética genérica de SaaS.
Priorize funcionalidade real, segurança, escalabilidade e experiência do usuário.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rede-conecta-alagoas.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fda23492-6972-448d-beb5-1639161cd51b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
