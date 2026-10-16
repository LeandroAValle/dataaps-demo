# Decisões técnicas

## ADR 001 — Dados exclusivamente sintéticos

**Decisão:** gerar uma base fictícia com IDs `SYN-*`, equipes inventadas e semente fixa. Nenhum dado real de saúde entra no repositório.

**Motivo:** permitir inspeção pública do pipeline, do código e dos resultados sem depender de autorização para compartilhar dados ou integrações de produção.

**Consequência:** os números e regras mostram a mecânica da solução; não validam eficácia clínica ou desempenho de um município.

## ADR 002 — Um snapshot para interface e API

**Decisão:** a transformação escreve um JSON versionado, lido pelo front-end estático e pela API local.

**Alternativas consideradas:** API obrigatória para a demonstração; cálculos separados no navegador e no servidor.

**Motivo:** a demonstração pública pode rodar no GitHub Pages, enquanto o contrato da API permanece inspecionável. Uma fonte de saída evita discrepância entre os resultados.

**Consequência:** não há atualização em tempo real. A atualização exige regerar o snapshot e publicar um novo commit.

## ADR 003 — Validação antes de agregar

**Decisão:** IDs duplicados, equipes desconhecidas e valores fora do contrato interrompem o build.

**Motivo:** um dashboard bonito não compensa contagens baseadas em entradas inconsistentes. A validação torna falhas visíveis antes da publicação.

**Consequência:** qualquer mudança no formato de entrada requer atualização explícita do contrato e dos testes.

## ADR 004 — Indicadores com proveniência e limites explícitos

**Decisão:** a resposta inclui fonte, período, status da fonte e status da regra. A interface sinaliza que os dados são sintéticos e que não há integração real.

**Motivo:** evita apresentar exemplos como indicadores oficiais ou inferências clínicas. Ajuda quem revisa o projeto a separar interface, cálculo e regra de negócio ainda não validada.

**Consequência:** o protótipo não permite qualquer uso operacional ou decisão clínica.
