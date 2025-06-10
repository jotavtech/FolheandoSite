import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { User, Livro, Resenha, Estante, salvarLivroGoogleBooks, mongoose } from "./database";
import bcrypt from 'bcrypt';

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

      // Buscar usuário no banco
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Retornar dados do usuário (sem a senha)
      const userResponse = {
        id: user._id.toString(),
        nome: user.nome,
        email: user.email,
        username: user.username,
        bio: user.bio || "",
        createdAt: user.createdAt
      };
      
      res.json(userResponse);
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

      // Verificar se usuário já existe
      const userExistente = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      });

      if (userExistente) {
        if (userExistente.email === email.toLowerCase()) {
          return res.status(400).json({ error: "Email já está em uso" });
        }
        if (userExistente.username === username) {
          return res.status(400).json({ error: "Username já está em uso" });
        }
      }

      // Criptografar senha
      const saltRounds = 10;
      const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

      // Criar novo usuário
      const novoUser = new User({
        username,
        nome,
        email: email.toLowerCase(),
        senha: senhaCriptografada
      });

      await novoUser.save();
      res.status(201).json({ message: "Usuário cadastrado com sucesso" });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de logout
  app.post("/api/logout", async (req, res) => {
    try {
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Erro no logout:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar livros em destaque (baseado nas melhores avaliações + livros aleatórios)
  app.get("/api/livros-destaque", async (req, res) => {
    try {
      console.log("🔍 Iniciando busca por livros em destaque...");
      
      // Primeiro, buscar livros com avaliações do banco
      const livrosEstatisticas = await Resenha.aggregate([
        {
          $group: {
            _id: "$idGoogleLivro",
            mediaNotas: { $avg: "$nota" },
            totalAvaliacoes: { $sum: 1 }
          }
        },
        {
          $match: {
            totalAvaliacoes: { $gte: 1 }
          }
        },
        {
          $sort: { mediaNotas: -1 }
        },
        {
          $limit: 2 // Apenas 2 livros do banco
        }
      ]);

      console.log(`📊 Livros do banco: ${livrosEstatisticas.length}`);

      // Buscar dados dos livros do banco no Google Books
      const livrosAvaliados = await Promise.all(
        livrosEstatisticas.map(async (estatistica) => {
          try {
            const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${estatistica._id}`;
            const response = await fetch(googleBooksUrl);
            
            if (response.ok) {
              const bookData = await response.json();
              return {
                idGoogle: bookData.id,
                titulo: bookData.volumeInfo.title || "Título não disponível",
                autores: bookData.volumeInfo.authors || ["Autor desconhecido"],
                imagem: bookData.volumeInfo.imageLinks?.thumbnail || "",
                descricao: bookData.volumeInfo.description?.replace(/<[^>]+>/g, "").substring(0, 300) || "Descrição não disponível",
                editora: bookData.volumeInfo.publisher || "",
                dataPublicacao: bookData.volumeInfo.publishedDate || "",
                categoria: bookData.volumeInfo.categories || [],
                mediaNotas: Number(estatistica.mediaNotas.toFixed(1)),
                totalAvaliacoes: estatistica.totalAvaliacoes
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Erro ao buscar livro ${estatistica._id}:`, error);
            return null;
          }
        })
      );

      const livrosValidosBank = livrosAvaliados.filter(livro => livro !== null);

      // Buscar livros aleatórios do Google Books (sempre 6 livros)
      console.log("🎲 Buscando livros aleatórios...");
      const categoriasPopulares = ['fiction', 'romance', 'mystery', 'fantasy', 'science', 'biography'];
      const livrosAleatorios = [];
      
      for (let i = 0; i < 6; i++) {
        try {
          const categoriaAleatoria = categoriasPopulares[i % categoriasPopulares.length];
          const startIndex = Math.floor(Math.random() * 50);
          
          const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:${categoriaAleatoria}&orderBy=relevance&startIndex=${startIndex}&maxResults=10`;
          
          const response = await fetch(googleBooksUrl);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
              const livroAleatorio = data.items[Math.floor(Math.random() * Math.min(5, data.items.length))];
              
              if (livroAleatorio.volumeInfo.title && livroAleatorio.volumeInfo.authors) {
                livrosAleatorios.push({
                  idGoogle: livroAleatorio.id,
                  titulo: livroAleatorio.volumeInfo.title,
                  autores: livroAleatorio.volumeInfo.authors,
                  imagem: livroAleatorio.volumeInfo.imageLinks?.thumbnail || "",
                  descricao: livroAleatorio.volumeInfo.description?.replace(/<[^>]+>/g, "").substring(0, 300) || "Descrição não disponível",
                  editora: livroAleatorio.volumeInfo.publisher || "",
                  dataPublicacao: livroAleatorio.volumeInfo.publishedDate || "",
                  categoria: livroAleatorio.volumeInfo.categories || [],
                  mediaNotas: Math.round((Math.random() * 3 + 7) * 10) / 10,
                  totalAvaliacoes: 0
                });
              }
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar livro aleatório ${i}:`, error);
        }
      }

      // Combinar todos os livros
      const todosOsLivros = [...livrosValidosBank, ...livrosAleatorios];
      
      console.log(`✅ Total final: ${todosOsLivros.length} livros (${livrosValidosBank.length} avaliados + ${livrosAleatorios.length} aleatórios)`);
      console.log("📚 Livros:", todosOsLivros.map(l => l?.titulo));

      res.json(todosOsLivros);
    } catch (error) {
      console.error("Erro ao buscar livros em destaque:", error);
      
      // Em caso de erro, retornar livros de fallback
      const livrosFallback = [
        {
          idGoogle: "sample1",
          titulo: "Dom Casmurro",
          autores: ["Machado de Assis"],
          imagem: "",
          descricao: "Clássico da literatura brasileira",
          editora: "",
          dataPublicacao: "",
          categoria: [],
          mediaNotas: 8.5,
          totalAvaliacoes: 0
        },
        {
          idGoogle: "sample2",
          titulo: "O Alquimista",
          autores: ["Paulo Coelho"],
          imagem: "",
          descricao: "Livro sobre seguir seus sonhos",
          editora: "",
          dataPublicacao: "",
          categoria: [],
          mediaNotas: 8.0,
          totalAvaliacoes: 0
        },
        {
          idGoogle: "sample3",
          titulo: "1984",
          autores: ["George Orwell"],
          imagem: "",
          descricao: "Distopia clássica",
          editora: "",
          dataPublicacao: "",
          categoria: [],
          mediaNotas: 9.0,
          totalAvaliacoes: 0
        }
      ];
      
      res.json(livrosFallback);
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

  // Rota para buscar todas as resenhas
  app.get("/api/resenhas-todas", async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let query: any = {};
      
      // Se houver busca, filtrar por título, autor ou resenha
      if (search) {
        query = {
          $or: [
            { titulo: { $regex: search, $options: 'i' } },
            { autor: { $regex: search, $options: 'i' } },
            { resenha: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const resenhas = await Resenha.find(query)
        .populate('userId', 'nome username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      // Transformar dados para o formato esperado pelo frontend
      const resenhasFormatadas = resenhas.map((resenha: any) => ({
        id: resenha._id,
        user: {
          id: resenha.userId._id,
          nome: resenha.userId.nome
        },
        userId: resenha.userId._id,
        status: resenha.status,
        nota: resenha.nota,
        resenha: resenha.resenha,
        livro: {
          idGoogle: resenha.idGoogleLivro,
          titulo: resenha.titulo,
          autor: resenha.autor,
          imagem: resenha.imagem
        },
        titulo: resenha.titulo,
        autor: resenha.autor,
        imagem: resenha.imagem,
        createdAt: resenha.createdAt
      }));

      const total = await Resenha.countDocuments(query);

      res.json({
        resenhas: resenhasFormatadas,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Erro ao buscar resenhas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar resenhas de um livro específico
  app.get("/api/resenhas/:livroId", async (req, res) => {
    try {
      const { livroId } = req.params;
      
      const resenhas = await Resenha.find({ idGoogleLivro: livroId })
        .populate('userId', 'nome username')
        .sort({ createdAt: -1 })
        .lean();

      const resenhasFormatadas = resenhas.map((resenha: any) => ({
        id: resenha._id,
        user: {
          id: resenha.userId._id,
          nome: resenha.userId.nome
        },
        userId: resenha.userId._id,
        status: resenha.status,
        nota: resenha.nota,
        resenha: resenha.resenha,
        titulo: resenha.titulo,
        autor: resenha.autor,
        imagem: resenha.imagem,
        createdAt: resenha.createdAt
      }));

      res.json(resenhasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar resenhas do livro:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para criar uma nova resenha
  app.post("/api/resenhas", async (req, res) => {
    try {
      const { 
        userId, 
        idGoogleLivro, 
        status, 
        nota, 
        resenha, 
        titulo, 
        autor, 
        imagem,
        livroData 
      } = req.body;
      
      if (!userId || !idGoogleLivro || !status || !nota || !resenha || !titulo || !autor) {
        return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
      }

      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Salvar livro se fornecido
      let livro;
      if (livroData) {
        livro = await salvarLivroGoogleBooks(livroData);
      } else {
        // Tentar encontrar livro existente
        livro = await Livro.findOne({ idGoogle: idGoogleLivro });
        if (!livro) {
          // Criar livro básico se não existir
          livro = await salvarLivroGoogleBooks({
            idGoogle: idGoogleLivro,
            titulo,
            autores: [autor],
            imagem: imagem || ""
          });
        }
      }

      // Verificar se já existe resenha deste usuário para este livro
      const resenhaExistente = await Resenha.findOne({ 
        userId, 
        idGoogleLivro 
      });

      if (resenhaExistente) {
        return res.status(400).json({ error: "Você já avaliou este livro" });
      }

      // Criar nova resenha
      const novaResenha = new Resenha({
        userId,
        livroId: livro._id,
        idGoogleLivro,
        status,
        nota,
        resenha,
        titulo,
        autor,
        imagem: imagem || ""
      });

      const resenhaSalva = await novaResenha.save();

      // Atualizar ou criar entrada na estante do usuário
      await Estante.findOneAndUpdate(
        { userId, idGoogleLivro },
        { 
          userId,
          livroId: livro._id,
          idGoogleLivro,
          status,
          progresso: status === 'lido' ? 100 : 0,
          dataFim: status === 'lido' ? new Date() : undefined,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      res.status(201).json({ 
        message: "Resenha criada com sucesso", 
        id: resenhaSalva._id 
      });
    } catch (error) {
      console.error("Erro ao criar resenha:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para deletar uma resenha
  app.delete("/api/resenhas/:resenhaId", async (req, res) => {
    try {
      const { resenhaId } = req.params;
      
      const resenha = await Resenha.findByIdAndDelete(resenhaId);
      
      if (!resenha) {
        return res.status(404).json({ error: "Resenha não encontrada" });
      }

      res.json({ message: "Resenha deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar resenha:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar estante do usuário
  app.get("/api/estante/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      let query: any = { userId };
      if (status) {
        query.status = status;
      }

      const estante = await Estante.find(query)
        .populate('livroId')
        .sort({ updatedAt: -1 })
        .lean();

      res.json(estante);
    } catch (error) {
      console.error("Erro ao buscar estante:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para atualizar status de leitura
  app.put("/api/estante/:userId/:livroId", async (req, res) => {
    try {
      const { userId, livroId } = req.params;
      const { status, progresso } = req.body;

      const estanteAtualizada = await Estante.findOneAndUpdate(
        { userId, idGoogleLivro: livroId },
        { 
          status,
          progresso: progresso || 0,
          dataFim: status === 'lido' ? new Date() : undefined,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!estanteAtualizada) {
        return res.status(404).json({ error: "Item não encontrado na estante" });
      }

      res.json({ message: "Status atualizado com sucesso", estante: estanteAtualizada });
    } catch (error) {
      console.error("Erro ao atualizar estante:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de debug para testar agregação
  app.get("/api/debug-agregacao", async (req, res) => {
    try {
      const totalResenhas = await Resenha.countDocuments();
      const resenhas = await Resenha.find().limit(10);
      
      const agregacao = await Resenha.aggregate([
        {
          $group: {
            _id: "$idGoogleLivro",
            mediaNotas: { $avg: "$nota" },
            totalAvaliacoes: { $sum: 1 },
            titulo: { $first: "$titulo" },
            autor: { $first: "$autor" },
            imagem: { $first: "$imagem" }
          }
        },
        {
          $sort: { mediaNotas: -1 }
        }
      ]);
      
      res.json({
        totalResenhas,
        amostrasResenhas: resenhas.map(r => ({
          idGoogleLivro: r.idGoogleLivro,
          titulo: r.titulo,
          nota: r.nota
        })),
        resultadoAgregacao: agregacao
      });
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Rota de teste simples
  app.get("/api/teste", (req, res) => {
    res.json({ message: "Teste funcionando!" });
  });

  // Rota de debug simples
  app.get("/api/usuario/debug", async (req, res) => {
    try {
      const usuarios = await User.find({}, { senha: 0 }) // Excluir senha por segurança
        .sort({ createdAt: -1 })
        .lean();

      const usuariosFormatados = usuarios.map((usuario: any) => ({
        id: usuario._id.toString(),
        username: usuario.username,
        nome: usuario.nome,
        email: usuario.email,
        bio: usuario.bio || "",
        createdAt: usuario.createdAt
      }));

      res.json({
        message: "Usuários cadastrados no banco de dados",
        total: usuariosFormatados.length,
        usuarios: usuariosFormatados
      });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.json({ 
        message: "Erro ao buscar usuários", 
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Rota para buscar avaliações de um usuário específico
  app.get("/api/usuario/:userId/avaliacoes", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Converter para ObjectId
      const objectId = new mongoose.Types.ObjectId(userId);
      
      const resenhas = await Resenha.find({ userId: objectId })
        .populate('userId', 'nome username')
        .sort({ createdAt: -1 })
        .lean();

      // Transformar dados para o formato esperado pelo frontend
      const avaliacoes = resenhas.map((resenha: any) => ({
        id: resenha._id,
        livroId: resenha.idGoogleLivro,
        titulo: resenha.titulo,
        autor: resenha.autor,
        imagem: resenha.imagem,
        nota: resenha.nota,
        status: resenha.status,
        resenha: resenha.resenha,
        dataAvaliacao: resenha.createdAt
      }));

      res.json(avaliacoes);
    } catch (error) {
      console.error("Erro ao buscar avaliações do usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar estatísticas de um usuário específico
  app.get("/api/usuario/:userId/estatisticas", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Converter para ObjectId
      const objectId = new mongoose.Types.ObjectId(userId);
      
      // Buscar estatísticas das resenhas
      const estatisticasResenhas = await Resenha.aggregate([
        {
          $match: { userId: objectId }
        },
        {
          $group: {
            _id: null,
            totalAvaliacoes: { $sum: 1 },
            notaMedia: { $avg: "$nota" },
            livrosLidos: {
              $sum: {
                $cond: [{ $eq: ["$status", "lido"] }, 1, 0]
              }
            },
            livrosLendo: {
              $sum: {
                $cond: [{ $eq: ["$status", "lendo"] }, 1, 0]
              }
            },
            livrosDesejados: {
              $sum: {
                $cond: [{ $eq: ["$status", "quero_ler"] }, 1, 0]
              }
            }
          }
        }
      ]);

      const stats = estatisticasResenhas[0] || {
        totalAvaliacoes: 0,
        notaMedia: 0,
        livrosLidos: 0,
        livrosLendo: 0,
        livrosDesejados: 0
      };

      // Buscar estatísticas da estante (pode ter livros sem resenha)
      const estanteStats = await Estante.aggregate([
        {
          $match: { userId: objectId }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      // Combinar estatísticas
      let livrosLidos = stats.livrosLidos;
      let livrosLendo = stats.livrosLendo;
      let livrosDesejados = stats.livrosDesejados;

      // Adicionar livros da estante que podem não ter resenha
      estanteStats.forEach((stat: any) => {
        if (stat._id === 'lido') livrosLidos = Math.max(livrosLidos, stat.count);
        if (stat._id === 'lendo') livrosLendo = Math.max(livrosLendo, stat.count);
        if (stat._id === 'quero_ler') livrosDesejados = Math.max(livrosDesejados, stat.count);
      });

      const estatisticas = {
        totalAvaliacoes: stats.totalAvaliacoes,
        livrosLidos,
        livrosLendo,
        livrosDesejados,
        notaMedia: stats.notaMedia ? Number(stats.notaMedia.toFixed(1)) : 0
      };

      res.json(estatisticas);
    } catch (error) {
      console.error("Erro ao buscar estatísticas do usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para atualizar bio do usuário
  app.put("/api/usuario/:userId/bio", async (req, res) => {
    try {
      const { userId } = req.params;
      const { bio } = req.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { bio },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({ message: "Bio atualizada com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar bio:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para buscar todos os usuários cadastrados
  app.get("/api/usuarios", async (req, res) => {
    try {
      const usuarios = await User.find({}, { senha: 0 }) // Excluir senha por segurança
        .sort({ createdAt: -1 })
        .lean();

      const usuariosFormatados = usuarios.map((usuario: any) => ({
        id: usuario._id.toString(),
        username: usuario.username,
        nome: usuario.nome,
        email: usuario.email,
        bio: usuario.bio || "",
        createdAt: usuario.createdAt
      }));

      res.json({
        total: usuariosFormatados.length,
        usuarios: usuariosFormatados
      });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de teste para buscar livros aleatórios
  app.get("/api/livros-teste", async (req, res) => {
    try {
      console.log("🔍 Buscando livros aleatórios de teste...");
      
      const categoriasPopulares = ['fiction', 'romance', 'mystery', 'fantasy'];
      const todosOsLivros = [];
      
      for (let i = 0; i < 4; i++) {
        try {
          const categoriaAleatoria = categoriasPopulares[i % categoriasPopulares.length];
          const startIndex = Math.floor(Math.random() * 20);
          
          const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:${categoriaAleatoria}&orderBy=relevance&startIndex=${startIndex}&maxResults=5`;
          console.log(`📡 Buscando: ${googleBooksUrl}`);
          
          const response = await fetch(googleBooksUrl);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`📖 Encontrados ${data.items?.length || 0} livros`);
            
            if (data.items && data.items.length > 0) {
              const livroAleatorio = data.items[0]; // Pega o primeiro
              
              if (livroAleatorio.volumeInfo.title) {
                todosOsLivros.push({
                  idGoogle: livroAleatorio.id,
                  titulo: livroAleatorio.volumeInfo.title,
                  autores: livroAleatorio.volumeInfo.authors || ["Autor desconhecido"],
                  imagem: livroAleatorio.volumeInfo.imageLinks?.thumbnail || "",
                  descricao: livroAleatorio.volumeInfo.description?.replace(/<[^>]+>/g, "").substring(0, 300) || "Descrição não disponível",
                  editora: livroAleatorio.volumeInfo.publisher || "",
                  dataPublicacao: livroAleatorio.volumeInfo.publishedDate || "",
                  categoria: livroAleatorio.volumeInfo.categories || [],
                  mediaNotas: Math.round((Math.random() * 3 + 7) * 10) / 10,
                  totalAvaliacoes: 0
                });
              }
            }
          } else {
            console.log(`❌ Erro na resposta da API: ${response.status}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar livro ${i}:`, error);
        }
      }
      
      console.log(`✅ Total de livros encontrados: ${todosOsLivros.length}`);
      res.json(todosOsLivros);
    } catch (error) {
      console.error("Erro geral:", error);
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
