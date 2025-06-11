# Folheando - Plataforma de Avaliações de Livros

Sistema completo de avaliação de livros com frontend em React/TypeScript e backend em Node.js/Express.

## Estrutura do Projeto

```
FolheandoSite-1/
├── client/                 # Frontend React/TypeScript
│   └── src/               # Código fonte do frontend
├── server/                # Backend Node.js/Express
│   ├── server.js         # Servidor principal
│   ├── prisma/           # Configuração do banco de dados
│   └── package.json      # Dependências do backend
├── package.json          # Configuração principal e scripts
└── README.md            # Este arquivo
```

## Como Executar

### 🚀 Execução Completa (Recomendado)

Para executar frontend e backend simultaneamente:

```bash
npm start
```

ou

```bash
npm run dev:full
```

Este comando iniciará:
- **Frontend** (React + Vite) na porta `http://localhost:5173`
- **Backend** (Node.js + Express) na porta `http://localhost:3002`

### 📱 Execução Separada

Se preferir executar separadamente:

#### Frontend apenas:
```bash
npm run dev:frontend
```

#### Backend apenas:
```bash
npm run dev:backend
```

## Funcionalidades

### Frontend (React/TypeScript)
- ✅ Página inicial com carousel de depoimentos
- ✅ Sistema de autenticação (login/cadastro)
- ✅ Busca de livros via Google Books API
- ✅ Criação e visualização de avaliações
- ✅ Perfil do usuário com estatísticas
- ✅ Design responsivo e animações
- ✅ Componentes reutilizáveis

### Backend (Node.js/Express)
- ✅ API RESTful para gerenciamento de usuários
- ✅ CRUD completo de avaliações/resenhas
- ✅ Integração com banco de dados Prisma
- ✅ Sistema de autenticação
- ✅ Upload de arquivos
- ✅ CORS configurado

## Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Wouter (routing)
- Lucide React (ícones)
- Framer Motion (animações)

### Backend
- Node.js
- Express
- Prisma (ORM)
- SQLite (banco de dados)
- CORS
- Multer (upload de arquivos)

## Configuração do Banco de Dados

O backend usa Prisma com SQLite. Para configurar:

```bash
cd server
npm run prisma:migrate
npm run prisma:seed
```

## Scripts Disponíveis

- `npm start` - Executa aplicação completa
- `npm run dev:full` - Mesmo que npm start
- `npm run dev:frontend` - Executa apenas frontend
- `npm run dev:backend` - Executa apenas backend
- `npm run build` - Build de produção
- `npm run check` - Verificação de tipos TypeScript

## Portas

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3002

## Status do Projeto

✅ **Completo e Funcional**

O projeto está pronto para uso com todas as funcionalidades principais implementadas e testadas. 