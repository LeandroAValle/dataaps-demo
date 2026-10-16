# Dados e métricas

## Fonte

`data/raw/people_synthetic.csv` é criado por `python -m pipeline.generate` com semente fixa `202609`. Nenhum nome, documento, endereço ou dado clínico individual é gerado. O arquivo tem 1.200 registros fictícios, distribuídos igualmente entre três equipes inventadas.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `synthetic_id` | texto | Identificador artificial único no formato `SYN-0001`. |
| `team` | texto | Uma das três equipes fictícias. |
| `follow_up_history` | 12 caracteres `0`/`1` | Estado ilustrativo de acompanhamento em 12 períodos. |
| `essential_fields_complete` | `0`/`1` | Sinal sintético de completude cadastral. |
| `opportunity` | vazio, `prenatal`, `vaccine` | Categoria fictícia para revisão. |

## Transformação

- O pipeline rejeita fonte vazia, IDs repetidos, equipe desconhecida e valores fora do contrato.
- O recorte geral usa todas as linhas; cada equipe usa apenas suas linhas.
- A taxa por período é a proporção de `1` no respectivo caractere de `follow_up_history`.
- A qualidade é a proporção de `essential_fields_complete = 1`.
- Inconsistências contam `essential_fields_complete = 0`.
- As oportunidades incluem as categorias `prenatal`, `vaccine` e os cadastros incompletos. Um registro pode gerar mais de um sinal; portanto, a soma de sinais não equivale ao número de pessoas únicas.

## Proveniência da saída

`web/public/dashboard.json` informa `schema_version`, `generated_from`, `source`, `source_status`, `rule_status` e `period`. O período `2026-09` é uma competência fictícia fixa para esta versão; não representa atualização de produção.

## Uso responsável

Os rótulos da interface ilustram perguntas de gestão. Não existem regras clínicas oficiais, base nominal, diagnóstico ou recomendação de cuidado. Qualquer aplicação real exigiria definição dos indicadores com especialistas, autorização para tratamento de dados, validação de qualidade e controle de acesso.
