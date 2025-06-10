import { connectToDatabase, User, Livro, Resenha, Estante } from './database';
import bcrypt from 'bcrypt';

// Dados de exemplo para popular o banco
const sampleUsers = [
  { username: "joao_silva", nome: "João Silva", email: "joao@exemplo.com", senha: "123456" },
  { username: "maria_santos", nome: "Maria Santos", email: "maria@exemplo.com", senha: "123456" },
  { username: "pedro_costa", nome: "Pedro Costa", email: "pedro@exemplo.com", senha: "123456" },
  { username: "ana_oliveira", nome: "Ana Oliveira", email: "ana@exemplo.com", senha: "123456" },
  { username: "carlos_ferreira", nome: "Carlos Ferreira", email: "carlos@exemplo.com", senha: "123456" },
  { username: "lucia_mendes", nome: "Lucia Mendes", email: "lucia@exemplo.com", senha: "123456" }
];

const sampleBooks = [
  {
    idGoogle: "CoUdBAAAQBAJ",
    titulo: "O Alquimista",
    autores: ["Paulo Coelho"],
    descricao: "A história de Santiago, um jovem pastor andaluz que sai em busca de um tesouro...",
    imagem: "https://books.google.com/books/content?id=CoUdBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
  },
  {
    idGoogle: "kotPYEqx7kMC",
    titulo: "1984",
    autores: ["George Orwell"],
    descricao: "Um romance distópico que retrata uma sociedade totalitária onde o governo controla tudo...",
    imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
  },
  {
    idGoogle: "aWZzLPhY4o0C",
    titulo: "O Senhor dos Anéis",
    autores: ["J.R.R. Tolkien"],
    descricao: "Uma épica jornada fantástica através da Terra Média...",
    imagem: "https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&source=gbs_api"
  },
  {
    idGoogle: "VSkuAAAAYAAJ",
    titulo: "Dom Casmurro",
    autores: ["Machado de Assis"],
    descricao: "A história de Bentinho e sua obsessão por Capitu...",
    imagem: "https://books.google.com/books/content?id=VSkuAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
  },
  {
    idGoogle: "qKN9c0f7wboC",
    titulo: "O Cortiço",
    autores: ["Aluísio Azevedo"],
    descricao: "Um retrato da vida no cortiço João Romão no Rio de Janeiro do século XIX...",
    imagem: "https://books.google.com/books/content?id=qKN9c0f7wboC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
  },
  {
    idGoogle: "Ux7mt48p5LMC",
    titulo: "Senhora",
    autores: ["José de Alencar"],
    descricao: "A história de Aurélia Camargo e sua relação complexa com Fernando Seixas...",
    imagem: "https://books.google.com/books/content?id=Ux7mt48p5LMC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
  }
];

const sampleReviews = [
  {
    resenha: "Uma obra extraordinária que mudou minha perspectiva sobre a vida. A narrativa é envolvente e os personagens são muito bem desenvolvidos. Recomendo fortemente para quem gosta de ficção contemporânea.",
    nota: 9,
    status: "lido"
  },
  {
    resenha: "Uma obra clássica que todos deveriam ler. A profundidade dos temas abordados é impressionante e a escrita é magistral. Orwell conseguiu criar um mundo distópico que ainda hoje ressoa com nossa realidade.",
    nota: 8,
    status: "lido"
  },
  {
    resenha: "Simplesmente perfeito! Uma história que te prende do início ao fim. Os detalhes são incríveis e a construção do mundo é fantástica. Uma obra-prima que transcende gerações.",
    nota: 10,
    status: "lido"
  },
  {
    resenha: "Um bom livro, mas esperava mais. A história é interessante, mas alguns momentos são um pouco lentos. Ainda assim, é uma obra importante da literatura brasileira.",
    nota: 7,
    status: "lido"
  },
  {
    resenha: "Uma obra-prima da literatura brasileira. A forma como o autor retrata a sociedade é genial. Conseguiu capturar perfeitamente a essência da época e criar personagens inesquecíveis.",
    nota: 9,
    status: "lido"
  },
  {
    resenha: "Um romance envolvente que explora temas profundos sobre amor e sociedade. A autora conseguiu criar personagens memoráveis e uma crítica social sutil mas poderosa.",
    nota: 8,
    status: "lido"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando população do banco de dados...');
    
    await connectToDatabase();
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await User.deleteMany({});
    await Livro.deleteMany({});
    await Resenha.deleteMany({});
    await Estante.deleteMany({});
    
    // Criar usuários
    console.log('👥 Criando usuários...');
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.senha, 10);
      const user = new User({
        ...userData,
        senha: hashedPassword
      });
      const savedUser = await user.save();
      users.push(savedUser);
      console.log(`✅ Usuário criado: ${userData.nome}`);
    }
    
    // Criar livros
    console.log('📚 Criando livros...');
    const books = [];
    for (const bookData of sampleBooks) {
      const book = new Livro(bookData);
      const savedBook = await book.save();
      books.push(savedBook);
      console.log(`✅ Livro criado: ${bookData.titulo}`);
    }
    
    // Criar resenhas
    console.log('📝 Criando resenhas...');
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const user = users[i];
      const book = books[i];
      
      const review = new Resenha({
        userId: user._id,
        livroId: book._id,
        idGoogleLivro: book.idGoogle,
        titulo: book.titulo,
        autor: book.autores[0],
        imagem: book.imagem,
        ...reviewData
      });
      
      await review.save();
      
      // Criar entrada na estante
      const estanteEntry = new Estante({
        userId: user._id,
        livroId: book._id,
        idGoogleLivro: book.idGoogle,
        status: reviewData.status,
        progresso: reviewData.status === 'lido' ? 100 : 0,
        dataFim: reviewData.status === 'lido' ? new Date() : undefined
      });
      
      await estanteEntry.save();
      
      console.log(`✅ Resenha criada: ${book.titulo} por ${user.nome}`);
    }
    
    // Criar algumas resenhas extras para o mesmo livro
    console.log('📖 Criando resenhas adicionais...');
    const alquimista = books[0]; // O Alquimista
    const orwell1984 = books[1]; // 1984
    
    // Mais resenhas para O Alquimista
    const extraAlquimistaReview = new Resenha({
      userId: users[2]._id, // Pedro
      livroId: alquimista._id,
      idGoogleLivro: alquimista.idGoogle,
      titulo: alquimista.titulo,
      autor: alquimista.autores[0],
      imagem: alquimista.imagem,
      resenha: "Um livro inspirador que nos ensina sobre seguir nossos sonhos. A linguagem é simples mas profunda. Paulo Coelho consegue transmitir mensagens importantes de forma acessível.",
      nota: 8,
      status: "lido"
    });
    await extraAlquimistaReview.save();
    
    // Mais resenhas para 1984
    const extra1984Review = new Resenha({
      userId: users[3]._id, // Ana
      livroId: orwell1984._id,
      idGoogleLivro: orwell1984.idGoogle,
      titulo: orwell1984.titulo,
      autor: orwell1984.autores[0],
      imagem: orwell1984.imagem,
      resenha: "Uma obra visionária que se tornou ainda mais relevante nos dias atuais. A descrição da sociedade de vigilância é assustadoramente precisa. Leitura obrigatória para entender os perigos do totalitarismo.",
      nota: 9,
      status: "lido"
    });
    await extra1984Review.save();
    
    console.log('✅ Resenhas adicionais criadas');
    
    // Estatísticas finais
    const totalUsers = await User.countDocuments();
    const totalBooks = await Livro.countDocuments();
    const totalReviews = await Resenha.countDocuments();
    const totalEstante = await Estante.countDocuments();
    
    console.log('\n📊 Banco de dados populado com sucesso!');
    console.log(`👥 Usuários: ${totalUsers}`);
    console.log(`📚 Livros: ${totalBooks}`);
    console.log(`📝 Resenhas: ${totalReviews}`);
    console.log(`📖 Entradas na estante: ${totalEstante}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular o banco de dados:', error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase }; 