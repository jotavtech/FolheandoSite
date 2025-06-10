import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'


const app = express();
const prisma = new PrismaClient();
dotenv.config();

app.use(cors());
app.use(express.json());

// Rota de login compatível com frontend
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.user.findUnique({
      where: { email }
    });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      bio: usuario.bio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de cadastro compatível com frontend
app.post('/api/cadastro', async (req, res) => {
  const { username, nome, email, senha } = req.body;

  try {
    const novoUsuario = await prisma.user.create({
      data: { username, nome, email, senha }
    });

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      id: novoUsuario.id,
      username: novoUsuario.username,
      nome: novoUsuario.nome,
      email: novoUsuario.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Rota de resenhas compatível com frontend
app.post('/api/resenhas', async (req, res) => {
  const { userId, idGoogleLivro, status, nota, resenha, titulo, autor, imagem } = req.body;

  try {
    let livro = await prisma.livro.findUnique({ where: { id: idGoogleLivro } });

    if (!livro) {
      livro = await prisma.livro.create({
        data: { id: idGoogleLivro, titulo, autor, imagem }
      });
    } else if (!livro.imagem && imagem) {
      livro = await prisma.livro.update({
        where: { id: idGoogleLivro },
        data: { imagem }
      });
    }

    const leituraExistente = await prisma.leitura.findUnique({
      where: {
        userId_livroId: {
          userId,
          livroId: idGoogleLivro
        }
      }
    });

    if (leituraExistente) {
      return res.status(400).json({ error: 'Você já adicionou uma resenha para este livro.' });
    }

    const novaLeitura = await prisma.leitura.create({
      data: {
        userId,
        livroId: idGoogleLivro,
        status: status.toLowerCase(),
        nota,
        resenha
      }
    });

    res.status(201).json({
      message: "Resenha criada com sucesso",
      id: novaLeitura.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar resenhas de um livro específico
app.get('/api/resenhas/:idLivro', async (req, res) => {
  const idLivro = req.params.idLivro;

  try {
    const resenhas = await prisma.leitura.findMany({
      where: { livroId: idLivro },
      include: { user: true }
    });

    res.json(resenhas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar resenhas' });
  }
});

// Rota para buscar todas as resenhas de um usuário
app.get('/api/resenhas-usuario/:idUsuario', async (req, res) => {
  const idUsuario = req.params.idUsuario;

  try {
    const resenhas = await prisma.leitura.findMany({
      where: { userId: idUsuario },
      include: { livro: true }
    });

    res.json(resenhas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar resenhas do usuário' });
  }
});

// Rota para editar nome e bio do usuário
app.put('/api/usuarios/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, bio } = req.body;

  try {
    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(bio !== undefined && { bio })
      }
    });

    res.json(usuarioAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Rota para editar uma resenha existente
app.put('/api/resenhas/:id', async (req, res) => {
  const id = req.params.id;
  const { status, nota, resenha } = req.body;

  try {
    const resenhaAtualizada = await prisma.leitura.update({
      where: { id },
      data: {
        status: status.toLowerCase(),
        nota,
        resenha
      }
    });

    res.json(resenhaAtualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao editar resenha' });
  }
});

// Rota para deletar resenhas
app.delete('/api/resenhas/:resenhaId', async (req, res) => {
  const resenhaId = req.params.resenhaId;

  try {
    const resenha = await prisma.leitura.delete({
      where: { id: resenhaId }
    });

    if (!resenha) {
      return res.status(404).json({ error: 'Resenha não encontrada' });
    }

    res.json({ message: 'Resenha deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar resenha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar os livros com status "Quero ler" de um usuário
app.get('/api/leitura/usuario/:idUsuario', async (req, res) => {
  const idUsuario = req.params.idUsuario;

  try {
    const leituras = await prisma.leitura.findMany({
      where: {
        userId: idUsuario,
        status: 'nao_li'
      },
      include: {
        livro: true
      }
    });

    res.json(leituras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar lista de desejos do usuário' });
  }
});

// Rota para buscar um usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        bio: true,
        foto: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Rota para buscar livros da API do Google
app.get("/buscar-livros", async (req, res) => {
  const termo = req.query.q || "livros";
  const startIndex = parseInt(req.query.startIndex) || 0;
  const maxResults = parseInt(req.query.maxResults) || 10;
  const orderBy = req.query.orderBy || "relevance"; // agora "newest" também é aceito

  try {
    const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termo)}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=${orderBy}`;

    const response = await fetch(googleApiUrl);
    const json = await response.json();

    if (!json.items) {
      return res.send([]);
    }

    const livros = json.items.map((item) => {
      const volume = item.volumeInfo;
      return {
        idGoogle: item.id,
        titulo: volume.title || "Sem título",
        autores: volume.authors || ["Desconhecido"],
        descricao: volume.description || "",
        imagem: volume.imageLinks?.thumbnail || "",
      };
    });

    res.send(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).send({ erro: "Erro ao buscar livros" });
  }
});

// Rota para listar todos os usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        bio: true
      },
      orderBy: { id: 'desc' }
    });
    
    res.json({
      total: usuarios.length,
      usuarios: usuarios.map(user => ({
        ...user,
        createdAt: new Date().toISOString()
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rota para excluir uma resenha
app.delete('/resenhas/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.leitura.delete({
      where: { id }
    });

    res.json({ mensagem: 'Resenha excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao excluir resenha' });
  }
});

//UPLOAD DE FOTO
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cria pasta se não existir
const pastaUploads = 'uploads';
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads);
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    cb(null, `foto-${Date.now()}${extensao}`);
  }
});

const upload = multer({ storage });

// Rota para upload da foto
app.post('/api/upload-foto/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const urlFoto = `http://localhost:3002/uploads/${req.file.filename}`;

  try {
    const usuario = await prisma.user.update({
      where: { id },
      data: { foto: urlFoto }
    });

    res.json({ foto: usuario.foto });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar a foto' });
  }
});

// Servir os arquivos da pasta uploads
app.use('/uploads', express.static('uploads'));

// Rota para buscar livros da API do Google (compatibilidade com frontend)
app.get("/api/livros", async (req, res) => {
  const termo = req.query.q || "livros";
  const startIndex = parseInt(req.query.startIndex) || 0;
  const maxResults = parseInt(req.query.maxResults) || 10;
  const orderBy = req.query.orderBy || "relevance";

  try {
    const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termo)}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=${orderBy}`;

    const response = await fetch(googleApiUrl);
    const json = await response.json();

    if (!json.items) {
      return res.json([]);
    }

    const livros = json.items.map((item) => {
      const volume = item.volumeInfo;
      return {
        idGoogle: item.id,
        titulo: volume.title || "Sem título",
        autores: volume.authors || ["Desconhecido"],
        descricao: volume.description || "",
        imagem: volume.imageLinks?.thumbnail || "",
      };
    });

    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

// Rota para livros em destaque
app.get("/api/livros-destaque", async (req, res) => {
  try {
    // Buscar os livros mais bem avaliados
    const livrosMaisAvaliados = await prisma.leitura.groupBy({
      by: ['livroId'],
      _avg: {
        nota: true
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gte: 1
          }
        }
      },
      orderBy: {
        _avg: {
          nota: 'desc'
        }
      },
      take: 6
    });

    const livrosComDetalhes = await Promise.all(
      livrosMaisAvaliados.map(async (item) => {
        const livro = await prisma.livro.findUnique({
          where: { id: item.livroId }
        });
        
        return {
          idGoogle: livro.id,
          titulo: livro.titulo,
          autores: [livro.autor],
          imagem: livro.imagem || "",
          mediaNotas: Math.round(item._avg.nota * 10) / 10,
          totalAvaliacoes: item._count.id
        };
      })
    );

    res.json(livrosComDetalhes);
  } catch (error) {
    console.error("Erro ao buscar livros em destaque:", error);
    res.status(500).json({ erro: "Erro ao buscar livros em destaque" });
  }
});

// Rota para todas as resenhas (compatibilidade com página de avaliações)
app.get("/api/resenhas-todas", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;

  try {
    const whereClause = search ? {
      OR: [
        { livro: { titulo: { contains: search, mode: 'insensitive' } } },
        { livro: { autor: { contains: search, mode: 'insensitive' } } },
        { user: { nome: { contains: search, mode: 'insensitive' } } }
      ]
    } : {};

    const resenhas = await prisma.leitura.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nome: true
          }
        },
        livro: true
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.leitura.count({ where: whereClause });

    const resenhasFormatadas = resenhas.map(resenha => ({
      id: resenha.id,
      user: resenha.user,
      userId: resenha.userId,
      status: resenha.status,
      nota: resenha.nota,
      resenha: resenha.resenha,
      titulo: resenha.livro.titulo,
      autor: resenha.livro.autor,
      imagem: resenha.livro.imagem || ""
    }));

    res.json({
      resenhas: resenhasFormatadas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar todas as resenhas:", error);
    res.status(500).json({ erro: "Erro ao buscar resenhas" });
  }
});

// Rota para avaliações de um usuário específico
app.get("/api/usuario/:id/avaliacoes", async (req, res) => {
  const userId = req.params.id;

  try {
    const avaliacoes = await prisma.leitura.findMany({
      where: { userId },
      include: { livro: true },
      orderBy: { id: 'desc' }
    });

    const avaliacoesFormatadas = avaliacoes.map(avaliacao => ({
      id: avaliacao.id,
      idGoogleLivro: avaliacao.livroId,
      status: avaliacao.status,
      nota: avaliacao.nota,
      resenha: avaliacao.resenha,
      titulo: avaliacao.livro.titulo,
      autor: avaliacao.livro.autor,
      imagem: avaliacao.livro.imagem || "",
      createdAt: new Date().toISOString()
    }));

    res.json(avaliacoesFormatadas);
  } catch (error) {
    console.error("Erro ao buscar avaliações do usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para estatísticas de um usuário
app.get("/api/usuario/:id/estatisticas", async (req, res) => {
  const userId = req.params.id;

  try {
    const totalAvaliacoes = await prisma.leitura.count({
      where: { userId }
    });

    const statusCounts = await prisma.leitura.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true }
    });

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});

    const mediaNotas = await prisma.leitura.aggregate({
      where: { userId },
      _avg: { nota: true }
    });

    res.json({
      totalAvaliacoes,
      lidos: statusMap.lido || 0,
      lendo: statusMap.lendo || 0,
      queroLer: statusMap.nao_li || 0,
      mediaNotas: mediaNotas._avg.nota ? Math.round(mediaNotas._avg.nota * 10) / 10 : 0
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota temporária para buscar usuário por email
app.get("/api/buscar-email/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        senha: true,
        bio: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota temporária para buscar usuário por email via query
app.get("/api/buscar-usuario", async (req, res) => {
  const email = req.query.email;

  try {
    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        senha: true,
        bio: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(3002, () => {
  console.log('Servidor rodando em http://localhost:3002');
});
