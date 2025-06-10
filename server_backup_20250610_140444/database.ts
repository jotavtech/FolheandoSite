import mongoose from 'mongoose';

const DATABASE_URL = "mongodb+srv://folheando:sAluugZPmRovV1dn@folheando.flwc5va.mongodb.net/folheando?retryWrites=true&w=majority&appName=folheando";

export async function connectToDatabase() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o MongoDB:', error);
    process.exit(1);
  }
}

export { mongoose };

// Schemas do banco de dados

// Schema do usuário
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: "",
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schema do livro
const livroSchema = new mongoose.Schema({
  idGoogle: {
    type: String,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  autores: [{
    type: String,
    required: true
  }],
  descricao: {
    type: String,
    default: ""
  },
  imagem: {
    type: String,
    default: ""
  },
  isbn: {
    type: String,
    default: ""
  },
  dataPublicacao: {
    type: String,
    default: ""
  },
  editora: {
    type: String,
    default: ""
  },
  categoria: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schema da resenha
const resenhaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  livroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livro',
    required: true
  },
  idGoogleLivro: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['lendo', 'lido', 'quero_ler', 'pausado', 'abandonado'],
    required: true
  },
  nota: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  resenha: {
    type: String,
    required: true,
    maxlength: 2000
  },
  titulo: {
    type: String,
    required: true
  },
  autor: {
    type: String,
    required: true
  },
  imagem: {
    type: String,
    default: ""
  },
  curtidas: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schema da lista de leitura (estante)
const estanteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  livroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livro',
    required: true
  },
  idGoogleLivro: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['lendo', 'lido', 'quero_ler', 'pausado', 'abandonado'],
    required: true
  },
  progresso: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  dataInicio: {
    type: Date
  },
  dataFim: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Modelos
export const User = mongoose.model('User', userSchema);
export const Livro = mongoose.model('Livro', livroSchema);
export const Resenha = mongoose.model('Resenha', resenhaSchema);
export const Estante = mongoose.model('Estante', estanteSchema);

// Função para salvar um livro vindo da API do Google Books
export async function salvarLivroGoogleBooks(livroData: any) {
  try {
    const livroExistente = await Livro.findOne({ idGoogle: livroData.idGoogle });
    if (livroExistente) {
      return livroExistente;
    }

    const novoLivro = new Livro({
      idGoogle: livroData.idGoogle,
      titulo: livroData.titulo,
      autores: Array.isArray(livroData.autores) ? livroData.autores : [livroData.autores],
      descricao: livroData.descricao || "",
      imagem: livroData.imagem || "",
      isbn: livroData.isbn || "",
      dataPublicacao: livroData.dataPublicacao || "",
      editora: livroData.editora || "",
      categoria: livroData.categoria || []
    });

    const livroSalvo = await novoLivro.save();
    return livroSalvo;
  } catch (error) {
    console.error('Erro ao salvar livro:', error);
    throw error;
  }
} 