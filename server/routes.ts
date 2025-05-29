import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export function registerApiRoutes(app: Express): void {
  // Rota de health check
  app.get("/api/healthcheck", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Rota de login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, senha } = req.body;
      
      if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Por enquanto, simulamos um login bem-sucedido para teste
      // Em produção, isso seria validado com banco de dados
      const mockUser = {
        id: "1",
        nome: email.split("@")[0],
        name: email.split("@")[0],
        email: email
      };

      res.json(mockUser);
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de cadastro
  app.post("/api/cadastro", async (req, res) => {
    try {
      const { username, nome, email, senha } = req.body;
      
      if (!username || !nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      // Por enquanto, simulamos um cadastro bem-sucedido
      // Em produção, isso seria salvo no banco de dados
      res.status(201).json({ message: "Usuário cadastrado com sucesso" });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de logout
  app.post("/api/logout", async (req, res) => {
    try {
      // Por enquanto, apenas retornamos sucesso
      // Em produção, isso limparia a sessão do usuário
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Erro no logout:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar livros em destaque
  app.get("/api/livros-destaque", async (req, res) => {
    try {
      // Dados mockados de livros em destaque
      const mockLivros = [
        {
          idGoogle: "CoUdBAAAQBAJ",
          titulo: "O Alquimista",
          autores: ["Paulo Coelho"],
          imagem: "https://books.google.com/books/content?id=CoUdBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 8.5
        },
        {
          idGoogle: "kotPYEqx7kMC",
          titulo: "1984",
          autores: ["George Orwell"],
          imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 9.2
        },
        {
          idGoogle: "aWZzLPhY4o0C",
          titulo: "O Senhor dos Anéis",
          autores: ["J.R.R. Tolkien"],
          imagem: "https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 9.8
        },
        {
          idGoogle: "VSkuAAAAYAAJ",
          titulo: "Dom Casmurro",
          autores: ["Machado de Assis"],
          imagem: "https://books.google.com/books/content?id=VSkuAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 7.8
        }
      ];

      res.json(mockLivros);
    } catch (error) {
      console.error("Erro ao buscar livros em destaque:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar livros usando a API do Google Books
  app.get("/api/buscar-livros", async (req, res) => {
    try {
      const { q, startIndex = 0, maxResults = 10, orderBy = "relevance" } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q as string)}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=${orderBy}`;
      
      const response = await fetch(googleBooksUrl);
      const data = await response.json();
      
      if (!data.items) {
        return res.json([]);
      }

      const books = data.items.map((item: any) => ({
        idGoogle: item.id,
        titulo: item.volumeInfo.title || "Sem título",
        autores: item.volumeInfo.authors || ["Autor desconhecido"],
        descricao: item.volumeInfo.description?.replace(/<[^>]+>/g, "") || "Sem descrição",
        imagem: item.volumeInfo.imageLinks?.thumbnail || ""
      }));

      res.json(books);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar todas as resenhas (dados mockados por enquanto)
  app.get("/api/resenhas-todas", async (req, res) => {
    try {
      // Por enquanto, retornamos dados mockados
      const mockResenhas = [
        {
          id: 1,
          user: { id: 1, nome: "João Silva" },
          userId: 1,
          status: "lido",
          nota: 9,
          resenha: "Um livro extraordinário que mudou minha perspectiva sobre a vida. A narrativa é envolvente e os personagens são muito bem desenvolvidos. Recomendo fortemente para quem gosta de ficção contemporânea.",
          livro: {
            idGoogle: "CoUdBAAAQBAJ",
            titulo: "O Alquimista",
            autor: "Paulo Coelho",
            imagem: "https://books.google.com/books/content?id=CoUdBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "O Alquimista",
          autor: "Paulo Coelho",
          imagem: "https://books.google.com/books/content?id=CoUdBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 2,
          user: { id: 2, nome: "Maria Santos" },
          userId: 2,
          status: "lido",
          nota: 8,
          resenha: "Uma obra clássica que todos deveriam ler. A profundidade dos temas abordados é impressionante e a escrita é magistral. Orwell conseguiu criar um mundo distópico que ainda hoje ressoa com nossa realidade.",
          livro: {
            idGoogle: "kotPYEqx7kMC",
            titulo: "1984",
            autor: "George Orwell",
            imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "1984",
          autor: "George Orwell",
          imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        }
      ];

      res.json(mockResenhas);
    } catch (error) {
      console.error("Erro ao buscar resenhas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar resenhas de um livro específico
  app.get("/api/resenhas/:livroId", async (req, res) => {
    try {
      const { livroId } = req.params;
      // Por enquanto, retornamos array vazio
      res.json([]);
    } catch (error) {
      console.error("Erro ao buscar resenhas do livro:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para criar uma nova resenha
  app.post("/api/resenhas", async (req, res) => {
    try {
      const resenhaData = req.body;
      // Por enquanto, apenas retornamos sucesso
      res.status(201).json({ message: "Resenha criada com sucesso", id: Date.now() });
    } catch (error) {
      console.error("Erro ao criar resenha:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
