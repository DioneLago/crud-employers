# Gestão de Funcionários

Aplicação para cadastrar, consultar, editar e excluir funcionários, com login, busca por nome e filtros por situação e periodicidade de fechamento. Também exibe a duração diária do expediente e os dias corridos entre admissão e demissão.

O frontend usa Angular 18 e Bootstrap. A API foi feita com Node.js e Express, com persistência no MongoDB.

A listagem começa pela admissão mais antiga. Clique nos títulos Nome, Admissão ou Demissão para alternar entre ordem crescente e decrescente; a coluna e a seta ativas ficam em azul claro. Na ordenação por demissão, os funcionários sem essa data ficam no final.

Ao sair, a sessão é encerrada e o token é invalidado na API. A revogação fica salva no MongoDB até a expiração do token.

## Configuração inicial

Na raiz do projeto, copie o arquivo de exemplo caso ainda não tenha um `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

No arquivo, configure `MONGO_USER` e `MONGO_PASSWORD` para o banco, `AUTH_USER` e `AUTH_PASSWORD` para o login e um segredo próprio em `JWT_SECRET`. Para gerar o segredo:

```bash
openssl rand -hex 32
```

## Rodar com Docker

É necessário ter Docker com Docker Compose instalado.

1. Mantenha `PORT=3800` e `MONGO_PORT=27017` no `backend/.env`. O endereço do banco é ajustado automaticamente pelo Compose.
2. Na raiz do projeto, inicie os serviços:

```bash
docker compose --env-file backend/.env up -d --build
```

3. Acesse [http://localhost:3000](http://localhost:3000) e entre com o usuário e a senha definidos em `AUTH_USER` e `AUTH_PASSWORD`.

O comando sobe o frontend, a API e o MongoDB. Use sempre `--env-file backend/.env` para que o banco e a API recebam as mesmas credenciais.

Para acompanhar os logs:

```bash
docker compose --env-file backend/.env logs -f backend app
```

Para encerrar:

```bash
docker compose --env-file backend/.env down
```

Os dados permanecem no volume do MongoDB. As credenciais do banco são criadas na primeira inicialização; mudar o `.env` depois não altera os usuários já existentes.

## Rodar manualmente

Para execução manual, use Node.js 22, npm e uma instância do MongoDB em execução.

1. No `backend/.env`, ajuste o endereço e as credenciais do MongoDB. Para um banco local, use `MONGO_HOST=localhost`. Se o banco não exigir autenticação, deixe `MONGO_USER` e `MONGO_PASSWORD` vazios. Mantenha `PORT=3800` para usar o endereço de API configurado no frontend.
2. Na raiz do projeto, abra um terminal e inicie a API:

```bash
cd backend
npm ci
npm start
```

3. Em outro terminal, também a partir da raiz, inicie o frontend:

```bash
cd app
npm ci
npm start
```

4. Acesse [http://localhost:3000](http://localhost:3000) e entre com as credenciais configuradas no `.env`.

A API fica em [http://localhost:3800](http://localhost:3800). Ao acessar esse endereço, a resposta informa se o banco está conectado.
