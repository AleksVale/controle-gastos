# controle-gastos# Controle de Gastos 💰

O **Controle de Gastos** é uma aplicação moderna e responsiva para gerenciar suas finanças pessoais. Com ele, você pode registrar despesas, categorizá-las, gerar relatórios e acompanhar seus gastos de forma prática e eficiente.

## Funcionalidades 🚀

- **Dashboard**: Visualize um resumo das suas finanças, incluindo gráficos interativos.
- **Gerenciamento de Despesas**: Adicione, edite e exclua despesas com facilidade.
- **Categorias**: Organize suas despesas em categorias personalizadas.
- **Relatórios**: Exporte relatórios em PDF ou Excel para análise detalhada.
- **Perfil do Usuário**: Visualize e gerencie informações do seu perfil.
- **Filtros Avançados**: Filtre despesas por data, categoria, valor e descrição.

---

## Tecnologias Utilizadas 🛠️

### Frontend
- **React** com **TypeScript**
- **Vite** para desenvolvimento rápido
- **TailwindCSS** para estilização moderna
- **React Query** para gerenciamento de estado assíncrono
- **Chart.js** para gráficos interativos
- **Zod** para validação de formulários

### Backend
- **Node.js** com **Fastify**
- **Prisma** como ORM
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Zod** para validação de dados

---

## Pré-requisitos 🧰

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **npm** ou **yarn**

---

## Configuração do Projeto ⚙️

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/controle-gastos.git
cd controle-gastos
```

### 2. Configuração do Backend

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env`:
   Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
   ```env
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/controle_gastos
   JWT_SECRET=sua_chave_secreta
   PORT=3000
   ```

4. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev
   ```

5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

O backend estará disponível em: `http://localhost:3000`.

---

### 3. Configuração do Frontend

1. Acesse o diretório do frontend:
   ```bash
   cd ../frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O frontend estará disponível em: `http://localhost:5173`.

---

## Scripts Disponíveis 📜

### Backend
- `npm run start:dev`: Inicia o servidor em modo de desenvolvimento.
- `npm run build`: Compila o backend para produção.
- `npm run start`: Inicia o servidor em produção.

### Frontend
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila o frontend para produção.
- `npm run preview`: Visualiza a versão de produção localmente.
- `npm run lint`: Verifica problemas de lint no código.
- `npm run format`: Formata o código com Prettier.

---

## Estrutura do Projeto 📂

```plaintext
controle-gastos/
├── backend/                # Código do backend
│   ├── prisma/             # Configuração do Prisma
│   ├── src/                # Código fonte do backend
│   └── package.json        # Configurações do backend
├── frontend/               # Código do frontend
│   ├── src/                # Código fonte do frontend
│   ├── public/             # Arquivos estáticos
│   └── package.json        # Configurações do frontend
└── README.md               # Documentação do projeto
```



**Controle de Gastos** - Organize suas finanças de forma simples e eficiente! 💸

