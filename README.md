# G2_Programacao_Dinamica_PA-26.1

Conteúdo da disciplina: Programação Dinâmica.

## Alunos

| Matrícula | Aluno |
| -- | -- |
| 231011533 | João Maurício Pilla Nascimento |
| 231035446 | Lucas Monteiro Freitas |

## Sobre

O projeto **PD Visual** apresenta algoritmos clássicos de programação dinâmica por meio de uma interface interativa e de uma API separada para resolução dos problemas.

No backend, o sistema implementa os algoritmos:

- **Knapsack**
- **Weighted Interval Scheduling**
- **Longest Increasing Subsequence (LIS)**
- **Sequence Alignment**
- **Bellman-Ford**

Cada algoritmo possui uma rota própria na API FastAPI para receber os dados de entrada e retornar a solução calculada.

No frontend, a aplicação exibe visualizações passo a passo do preenchimento das tabelas e das decisões tomadas pelos algoritmos, permitindo personalizar entradas e acompanhar a execução de forma didática.

## Estrutura

```text
backend/
  algorithms/
  routes/
  main.py
  schemas.py
  utils.py

index.html
script.js
styles.css
package.json
```

## Screenshots

As capturas de tela ainda não foram adicionadas ao repositório.

## Instalação

Linguagens: Python e JavaScript
Frameworks e ferramentas: FastAPI e Vite

### Pré-requisitos

- Python 3.8 ou superior
- Node.js 18 ou superior
- npm 9 ou superior

### Backend

No terminal, execute:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic
uvicorn main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

A documentação interativa do FastAPI ficará em:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Em outro terminal, na raiz do projeto, execute:

```bash
npm install
npm run dev
```

O frontend ficará disponível no endereço informado pelo Vite, normalmente:

```text
http://127.0.0.1:5173
```

## Uso

1. Inicie o backend em `backend/`.
2. Inicie o frontend na raiz do projeto.
3. Acesse a interface no navegador.
4. Escolha um dos algoritmos disponíveis.
5. Personalize a entrada, quando desejado.
6. Avance passo a passo ou use a execução automática para acompanhar a solução.

## Endpoints da API

- `POST /knapsack/solve`
- `POST /weighted-interval/solve`
- `POST /longest-increasing-subsequence/solve`
- `POST /sequence-alignment/solve`
- `POST /bellman-ford/solve`

## Observações

- O frontend atual funciona como um visualizador didático local, com simulações em JavaScript.
- O backend mantém implementações separadas dos algoritmos em FastAPI.
- Para rodar o backend, é importante iniciar o `uvicorn` a partir da pasta `backend/`, pois os imports do projeto usam esse diretório como base.

## Vídeo

- Adicionar link da apresentação.
