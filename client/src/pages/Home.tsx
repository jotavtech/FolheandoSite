import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import Slider from "@/components/Slider";
import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "wouter";
import { SECTION_TITLES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Book {
  idGoogle: string;
  titulo: string;
  autores: string[];
  descricao: string;
  imagem: string;
}

const Home = () => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [discoverBooks, setDiscoverBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch favorite books
        const favoriteRes = await fetch(
          `http://localhost:3000/buscar-livros?q=best+books&startIndex=0&maxResults=4&orderBy=newest`
        );
        if (!favoriteRes.ok) throw new Error(`Erro: ${favoriteRes.status}`);
        const favoriteData: Book[] = await favoriteRes.json();
        setFavoriteBooks(favoriteData);

        // Fetch top reviewed books
        const topRes = await fetch(
          `http://localhost:3000/buscar-livros?q=popular+books&startIndex=0&maxResults=4&orderBy=newest`
        );
        if (!topRes.ok) throw new Error(`Erro: ${topRes.status}`);
        const topData: Book[] = await topRes.json();
        setTopBooks(topData);

        // Fetch discover books
        const discoverRes = await fetch(
          `http://localhost:3000/buscar-livros?q=classic+books&startIndex=0&maxResults=2&orderBy=newest`
        );
        if (!discoverRes.ok) throw new Error(`Erro: ${discoverRes.status}`);
        const discoverData: Book[] = await discoverRes.json();
        setDiscoverBooks(discoverData);

        // Fetch featured books
        const featuredRes = await fetch(
          `http://localhost:3000/buscar-livros?q=featured+books&startIndex=0&maxResults=1&orderBy=newest`
        );
        if (!featuredRes.ok) throw new Error(`Erro: ${featuredRes.status}`);
        const featuredData: Book[] = await featuredRes.json();
        setFeaturedBooks(featuredData);
      } catch (err) {
        setError("Não foi possível carregar os livros.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />

      {/* Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-8 px-6 md:px-8 lg:px-12 bg-[#F5F5F0]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 md:mb-0"
            >
              <h2 className="text-xl font-medium mb-2">Bem-vindo de volta!</h2>
              <Link href="/login">
                <Button className="bg-[#3A4257] text-white px-4 py-1 rounded-sm text-sm h-8 hover:bg-[#4F5D7E] transition-colors">
                  Entrar
                </Button>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full md:w-auto"
            >
              {featuredBooks[0] && (
                <div className="relative h-24 w-full md:w-40 overflow-hidden rounded-md shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src={featuredBooks[0].imagem}
                    alt={featuredBooks[0].titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Discover Books Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="py-8 px-6 md:px-8 lg:px-12 bg-[#F5F5F0]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-medium">Descubra livros, avalie-os!</h2>
            </div>
            <div>
              <Link href="/livros">
                <Button className="bg-[#3A4257] text-white px-4 py-1 rounded-sm text-sm h-8 hover:bg-[#4F5D7E] transition-colors">
                  Ver mais
                </Button>
              </Link>
            </div>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {discoverBooks.map((book, index) => (
              <motion.div
                key={book.idGoogle}
                variants={itemVariants}
                className="relative h-48 w-full overflow-hidden rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src={book.imagem}
                  alt={book.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-medium">{book.titulo}</h3>
                  <p className="text-white/80 text-sm">{book.autores.join(", ")}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Favorite Books Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-10 px-6 md:px-8 lg:px-12 bg-[#222222] text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.questioned}</h2>
            <Link href="/livros">
              <Button className="bg-[#4F5D7E] text-white mt-4 md:mt-0 hover:bg-[#5D6E8F] transition-colors">
                Ver Todos
              </Button>
            </Link>
          </div>
          
          {error && <div className="text-red-600 mb-4">{error}</div>}
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <BookCard type="medium" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4"
            >
              {favoriteBooks.map((book, index) => (
                <motion.div
                  key={book.idGoogle}
                  variants={itemVariants}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <Link href={`/livro/${book.idGoogle}`}>
                    <div className="cursor-pointer hover:opacity-80 transition-opacity">
                      <BookCard type="medium" imageUrl={book.imagem} />
                      <div className="mt-2">
                        <h3 className="font-medium">{book.titulo}</h3>
                        <p className="text-sm text-gray-400">{book.autores.join(", ")}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Register Your Book Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="py-10 px-6 md:px-8 lg:px-12 bg-[#6B7F9E] text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.registerBook}</h2>
            <Link href="/cadastro-livro">
              <Button className="bg-[#4F5D7E] text-white mt-4 md:mt-0 hover:bg-[#5D6E8F] transition-colors">
                Cadastrar Livro
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {featuredBooks[0] && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="w-full md:w-1/2"
              >
                <BookCard type="large" imageUrl={featuredBooks[0].imagem} />
              </motion.div>
            )}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="bg-[#F5F5F0] rounded-md p-4 h-64 w-full md:w-1/2 flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center items-center">
                <p className="text-gray-700 text-center mb-4">Ajude nossa comunidade a crescer com sua contribuição!</p>
                <Link href="/cadastro-livro">
                  <Button className="bg-[#3A4257] text-white px-8 py-2 rounded-sm hover:bg-[#4F5D7E] transition-colors">
                    Cadastrar um Novo Livro
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Top Reviews Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="py-10 px-6 md:px-8 lg:px-12 bg-[#222222] text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.topReviews}</h2>
            <Link href="/avaliacoes">
              <Button className="bg-[#4F5D7E] text-white mt-4 md:mt-0 hover:bg-[#5D6E8F] transition-colors">
                Ver Todas
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <BookCard type="medium" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4"
            >
              {topBooks.map((book, index) => (
                <motion.div
                  key={book.idGoogle}
                  variants={itemVariants}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <Link href={`/livro/${book.idGoogle}`}>
                    <div className="cursor-pointer hover:opacity-80 transition-opacity">
                      <BookCard type="medium" imageUrl={book.imagem} />
                      <div className="mt-2">
                        <h3 className="font-medium">{book.titulo}</h3>
                        <p className="text-sm text-gray-400">{book.autores.join(", ")}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Home;
