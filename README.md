# UFSCar Cloud Provider Selector

Plataforma web de apoio à decisão para seleção de provedores de Cloud Computing
(AWS, Google Cloud e Microsoft Azure) nas dimensões de **Sustentabilidade**,
**Segurança da Informação** e **Desempenho Operacional**.

Produto tecnológico da dissertação de mestrado do Programa de Pós-Graduação
Profissional em Engenharia de Produção (PPGPEP) da Universidade Federal de São
Carlos (UFSCar).

> A plataforma apoia a análise, mas não decide por ninguém. Ela não substitui a
> avaliação especializada, os procedimentos formais de contratação nem a análise
> de custos.

---

## Como funciona

O gestor responde a um questionário. A plataforma combina essas prioridades com
as evidências encontradas nos documentos públicos dos provedores e devolve um
ranking que pode ser auditado.

| Componente | Papel | Natureza |
| --- | --- | --- |
| **AHP** | Calcula os pesos das três dimensões a partir das comparações par a par do gestor e verifica a consistência (CR ≤ 0,10) | Determinístico |
| **Regras de relevância** | Convertem as respostas dos Blocos A–C (Decisivo = 5 … Irrelevante = 1) em pesos locais dos indicadores | Determinístico |
| **RAG** | Recupera, indicador a indicador, os trechos dos documentos dos provedores indexados no FAISS | Recuperação |
| **LLM** | Lê os trechos e devolve o valor publicado ou a categoria da rubrica, com a fonte | Probabilístico |
| **Normalização e agregação** | Normaliza (benefício `x/max`, minimização `min/x`), renormaliza os pesos e calcula `S_i = Σ w'_j · r_ij` | Determinístico |

A LLM não atribui nota, peso nem posição. Ela só extrai e classifica as
evidências. Todo número do ranking vem de código determinístico e pode ser
reproduzido.

### Fluxo de uma avaliação

1. **Questionário.** São 25 perguntas em cinco blocos:
   - A, B e C: relevância de cada indicador;
   - D: comparações par a par entre as dimensões;
   - E: requisitos institucionais em texto livre.
2. **AHP.** A plataforma monta a matriz de Saaty e calcula os pesos (média das
   linhas da matriz normalizada), além de λmax, CI e CR. Com CR > 0,10 a
   avaliação para antes de chamar a LLM, e a plataforma sugere quais
   comparações revisar.
3. **Pesos.** O peso global de cada indicador é `w_j = W_d × l_j`.
4. **Evidências.** O RAG e a LLM procuram cada um dos 13 indicadores em cada
   provedor. Cada evidência recebe um estado: `FOUND`, `PARTIAL`, `NOT_FOUND` ou
   `INVALID`. Valor com unidade inesperada vira `INVALID`.
5. **Tratamento das ausências.**
   - Se nenhum provedor tem evidência válida, o indicador sai do cálculo e os
     pesos dos demais são renormalizados.
   - Se pelo menos um provedor tem, quem não tem recebe 0 nesse indicador. Esse
     zero é uma penalidade por falta de documento, não uma medição, e o relatório
     o registra como limitação.
6. **Ranking.** A plataforma ordena os provedores pela pontuação. Diferenças
   menores que 0,02 são declaradas como empate.
7. **Relatório.** Mostra os pesos, a memória de cálculo indicador a indicador,
   as evidências com documento e página, e a justificativa gerada pela IA.

### Indicadores operacionais

| Dimensão | Indicadores |
| --- | --- |
| Sustentabilidade | Eficiência energética (PUE) · Energia renovável (%) · Redução de emissões · Resíduos eletrônicos (% de desvio de aterro) · Circularidade |
| Desempenho Operacional | Disponibilidade (%) · Suporte técnico · Latência (ms) · Escalabilidade e elasticidade |
| Segurança da Informação | Certificações e conformidade · Backup e continuidade · Identidade e controle de acesso · Criptografia e proteção de dados |

A definição completa de cada indicador fica em
[`backend/methodology/indicators.json`](backend/methodology/indicators.json):
tipo, direção, unidades esperadas, rubrica e termos de busca.

---

## Tecnologias

- **Backend:** Python, FastAPI, LangChain, FAISS, NumPy, SQLAlchemy + SQLite, pypdf, pytest.
- **LLM:** multiprovedor (OpenAI, Groq, OpenRouter, Gemini, Ollama), com fallback configurável.
- **Embeddings:** OpenAI (`text-embedding-ada-002`) ou Hugging Face (`all-MiniLM-L6-v2`, local).
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS e Recharts, servido por Nginx.
- **Infraestrutura:** Docker Compose. Em produção, Traefik faz o TLS.

## Estrutura do repositório

```
backend/
  app/            API FastAPI
    domain/       pesos, normalização, pontuação e sensibilidade (núcleo determinístico)
    ahp.py        matriz de Saaty, vetor de prioridades, CR
    evidence.py   extração de evidências via RAG + LLM
    rag/ llm/     recuperação vetorial e clientes/prompts da LLM
    guardrails/   validação de texto, segredos, injeção e arquivos
    admin.py      área de gestão (/api/admin)
  methodology/    indicators.json e scales.json: configuração metodológica versionada
  data/pdf/       acervo documental dos provedores (ver FONTES.md)
  scripts/        ingestão, diagnóstico do ranking, teste de determinismo
  tests/          testes automatizados (pytest)
frontend/         interface web (React + Vite)
docs/simulacoes/  planilhas com a memória de cálculo das simulações
```

---

## Como executar

Pré-requisitos: Docker com Docker Compose, `make` e a chave de pelo menos um
provedor de LLM.

```bash
git clone https://github.com/williamreis/ufscar-cloud-provider-selector
```

```bash
cd ufscar-cloud-provider-selector
```

```bash
cp backend/.env_sample backend/.env
```

Edite `backend/.env` e preencha pelo menos:

- `LLM_PROVIDER` e a chave correspondente (por exemplo, `GROQ_API_KEY`);
- `ADMIN_PASSWORD`, sem a qual a área `/admin` responde 503.

Depois suba os contêineres e indexe o acervo de `backend/data/pdf`:

```bash
make all
```

Endereços de desenvolvimento:

| Serviço | Endereço |
| --- | --- |
| Interface web | http://localhost:8501 |
| API | http://localhost:8001 |
| Documentação da API (Swagger) | http://localhost:8001/docs |

### Comandos do Makefile

| Comando | O que faz |
| --- | --- |
| `make build` / `make up` | Constrói as imagens / sobe os contêineres |
| `make ingest` | Indexa os documentos de `backend/data/pdf` no FAISS |
| `make test` | Roda a suíte de testes do backend |
| `make quadros` | Gera os Quadros 22 e 24 da dissertação a partir de `methodology/*.json` |
| `make diagnostico SUB=<id>` | Mostra de onde vem a diferença entre os provedores num envio (não chama a LLM) |
| `make determinismo N=<n>` | Reexecuta o mesmo envio *n* vezes e compara os resultados |
| `make clean` | Derruba os contêineres e remove os volumes |

> Trocar o modelo de embeddings muda a dimensão dos vetores. Depois da troca,
> rode `make ingest` de novo.

### Produção

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Em produção o backend não publica porta: só o Nginx do frontend fala com ele.
O frontend escuta em `127.0.0.1:8000` e é exposto pelo Traefik, que cuida do
TLS (Let's Encrypt) para os domínios de `APP_DOMAIN_1` e `APP_DOMAIN_2`. Os
detalhes estão nos comentários de [`docker-compose.prod.yml`](docker-compose.prod.yml).

---

## Configuração metodológica

Os parâmetros que são decisão acadêmica ficam em
[`backend/methodology/scales.json`](backend/methodology/scales.json), fora do
código:

- coeficientes de relevância;
- método do AHP e tabela de RI;
- rubricas (níveis 0,25 / 0,50 / 0,75 / 1,00);
- margem de empate;
- tolerância de safra;
- regras de comparabilidade.

Cada avaliação grava o hash de `scales.json`, de `indicators.json`, dos prompts
e do questionário. Alterar esses arquivos gera uma versão nova e não muda as
avaliações já registradas.

## Rastreabilidade e reprodutibilidade

- **Auditoria.** Cada envio fica registrado em SQLite (`backend/data/audit.db`)
  com respostas, pesos, evidências, pontuações e versões. A área `/admin`
  permite consultar e exportar esses registros em CSV.
- **Simulações.** As planilhas de [`docs/simulacoes/`](docs/simulacoes)
  reproduzem com fórmulas todo o cálculo de três cenários:
  - [Segurança](docs/simulacoes/Cenario_Seguranca.xlsx);
  - [Sustentabilidade](docs/simulacoes/Cenario_Sustentabilidade.xlsx);
  - [Desempenho Operacional](docs/simulacoes/Cenario_Desempenho.xlsx).

  O cálculo vai do AHP ao ranking. A aba `Conferencia` compara a planilha com o
  relatório que a plataforma publicou.
- **Fontes.** [`backend/data/pdf/FONTES.md`](backend/data/pdf/FONTES.md) lista
  os documentos oficiais do acervo, com título e URL de origem.
- **Descrição detalhada.** [`RESUMO.md`](RESUMO.md) descreve o produto seguindo
  a numeração do Capítulo 5 da dissertação.

## Autor

William Reis · PPGPEP/UFSCar
