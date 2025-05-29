import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import Slider from "@/components/Slider";
import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import { SECTION_TITLES } from "@/lib/constants";

interface Livro {
  idGoogle: string;
  titulo: string;
  autores: string[];
  imagem: string;
  mediaNotas?: number;
}

interface Depoimento {
  id: number;
  nome: string;
  usuario: string;
  avatar: string;
  comentario: string;
  livroFavorito: string;
  nota: number;
  cor: string;
}

const Home = () => {
  const [, navigate] = useLocation();
  const [livrosDestaque, setLivrosDestaque] = useState<Livro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Depoimentos da comunidade
  const [depoimentos] = useState<Depoimento[]>([
    {
      id: 1,
      nome: "Maria Silva",
      usuario: "@mariabooks",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=64&h=64&fit=crop&crop=face",
      comentario: "O Folheando mudou completamente minha forma de escolher livros. As resenhas são detalhadas e me ajudam a descobrir verdadeiras joias literárias!",
      livroFavorito: "O Alquimista",
      nota: 5,
      cor: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      nome: "João Santos",
      usuario: "@joao_leitor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      comentario: "Incrível como encontrei uma comunidade tão engajada de leitores. Compartilhar minhas opiniões aqui me motivou a ler ainda mais!",
      livroFavorito: "1984",
      nota: 5,
      cor: "from-blue-500 to-teal-500"
    },
    {
      id: 3,
      nome: "Ana Costa",
      usuario: "@ana_reads",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      comentario: "A plataforma é intuitiva e as avaliações são muito úteis. Consegui expandir meus horizontes literários de forma incrível!",
      livroFavorito: "Orgulho e Preconceito",
      nota: 5,
      cor: "from-green-500 to-blue-500"
    },
    {
      id: 4,
      nome: "Pedro Lima",
      usuario: "@pedro_fantasy",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      comentario: "Finalmente encontrei um lugar onde posso discutir livros de fantasia com pessoas que realmente entendem do assunto. Recomendo!",
      livroFavorito: "Harry Potter",
      nota: 5,
      cor: "from-orange-500 to-red-500"
    },
    {
      id: 5,
      nome: "Carla Mendes",
      usuario: "@carla_classics",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
      comentario: "As recomendações personalizadas são precisas demais! Descobri autores que nem sabia que existiam através das avaliações da comunidade.",
      livroFavorito: "Dom Casmurro",
      nota: 5,
      cor: "from-pink-500 to-rose-500"
    }
  ]);

  const fetchLivrosDestaque = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Primeiro tenta buscar da API real
      const res = await fetch('http://localhost:5000/api/livros-destaque');
      
      if (!res.ok) {
        throw new Error('API não disponível');
      }
      
      const data: Livro[] = await res.json();
      setLivrosDestaque(data);
    } catch (err) {
      console.log("API não disponível, usando dados mockados:", err);
      
      // Fallback para dados mockados
      const mockLivros: Livro[] = [
        {
          idGoogle: "example1",
          titulo: "O Alquimista",
          autores: ["Paulo Coelho"],
          imagem: "https://books.google.com/books/content?id=CoUdBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 8.5
        },
        {
          idGoogle: "example2",
          titulo: "1984",
          autores: ["George Orwell"],
          imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 9.2
        },
        {
          idGoogle: "example3",
          titulo: "O Senhor dos Anéis",
          autores: ["J.R.R. Tolkien"],
          imagem: "https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 9.8
        },
        {
          idGoogle: "example4",
          titulo: "Dom Casmurro",
          autores: ["Machado de Assis"],
          imagem: "https://books.google.com/books/content?id=VSkuAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 7.8
        },
        {
          idGoogle: "example5",
          titulo: "O Cortiço",
          autores: ["Aluísio Azevedo"],
          imagem: "https://books.google.com/books/content?id=TjQOAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 8.3
        },
        {
          idGoogle: "example6",
          titulo: "Orgulho e Preconceito",
          autores: ["Jane Austen"],
          imagem: "https://books.google.com/books/content?id=s7NItwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 8.9
        },
        {
          idGoogle: "example7",
          titulo: "Harry Potter e a Pedra Filosofal",
          autores: ["J.K. Rowling"],
          imagem: "https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 9.5
        },
        {
          idGoogle: "example8",
          titulo: "Fahrenheit 451",
          autores: ["Ray Bradbury"],
          imagem: "https://books.google.com/books/content?id=4Q_QDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          mediaNotas: 8.7
        }
      ];
      
      setLivrosDestaque(mockLivros);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivrosDestaque();
  }, []);

  // Controles do carousel com animação suave
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % depoimentos.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + depoimentos.length) % depoimentos.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  // Auto-play do carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isTransitioning]);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#4A5568] to-[#6B7F9E] text-white py-24 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            Bem-vindo ao Folheando
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Descubra livros incríveis através das avaliações da nossa comunidade. 
            Compartilhe suas experiências literárias e encontre sua próxima grande leitura.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              className="bg-white text-[#4A5568] hover:bg-gray-100 px-10 py-4 text-xl font-semibold"
              onClick={() => navigate('/livros')}
            >
              Explorar Livros
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#4A5568] px-10 py-4 text-xl font-semibold"
              onClick={() => navigate('/avaliacoes')}
            >
              Ver Avaliações
            </Button>
          </div>
        </div>
      </section>

      {/* Seção de Livros em Destaque */}
      <section className="py-20 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Livros em Destaque</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Confira algumas das obras mais comentadas e bem avaliadas pela nossa comunidade
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3A4257]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-xl mb-6">{error}</p>
              <Button 
                onClick={fetchLivrosDestaque} 
                className="bg-[#3A4257] text-white px-8 py-4 text-lg"
              >
                Tentar novamente
              </Button>
            </div>
          ) : livrosDestaque.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {livrosDestaque.map((livro) => (
                <div
                  key={livro.idGoogle}
                  className="cursor-pointer transition-transform hover:scale-105 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg"
                >
                  <div onClick={() => navigate(`/livro/${livro.idGoogle}`)}>
                    <BookCard 
                      type="medium" 
                      className="w-full h-64 mb-6" 
                      imageUrl={livro.imagem}
                      altText={livro.titulo}
                    />
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2">{livro.titulo}</h3>
                    <p className="text-gray-600 text-base mb-4">{livro.autores.join(", ")}</p>
                    {livro.mediaNotas && (
                      <div className="flex items-center mb-4">
                        <span className="text-[#3A4257] font-medium text-base">
                          ⭐ {livro.mediaNotas.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-[#3A4257] text-white hover:bg-[#2A3142] py-2 text-sm"
                      onClick={() => navigate(`/livro/${livro.idGoogle}`)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white py-2 text-sm"
                      onClick={() => navigate(`/avaliar-livro/${livro.idGoogle}`)}
                    >
                      Avaliar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl">Nenhum livro em destaque no momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Seção Nossa Comunidade com Depoimentos */}
      <section className="relative py-20 px-8 md:px-12 lg:px-16 overflow-hidden">
        {/* Fundo embaçado */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A5568]/10 to-[#6B7F9E]/10 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-lg"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Nossa Comunidade</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja o que nossos leitores estão dizendo sobre suas experiências no Folheando
            </p>
          </div>

          {/* Carousel de Depoimentos com slide suave */}
          <div className="relative overflow-hidden">
            {/* Controles */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all group disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all group disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
            </button>

            {/* Container do Carousel */}
            <div className="px-16">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                  width: `${depoimentos.length * (100 / 3)}%`
                }}
              >
                {depoimentos.map((depoimento, index) => (
                  <div
                    key={depoimento.id}
                    className="w-1/3 px-4 flex-shrink-0"
                  >
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 h-full transform transition-all duration-300 hover:scale-105">
                      {/* Header do Card */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${depoimento.cor} p-0.5`}>
                          <img
                            src={depoimento.avatar}
                            alt={depoimento.nome}
                            className="w-full h-full rounded-full object-cover bg-white"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(depoimento.nome)}&background=random`;
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{depoimento.nome}</h4>
                          <p className="text-gray-500 text-sm">{depoimento.usuario}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: depoimento.nota }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comentário */}
                      <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                        "{depoimento.comentario}"
                      </p>

                      {/* Livro Favorito */}
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Livro favorito atual:</p>
                        <p className="font-semibold text-[#3A4257]">{depoimento.livroFavorito}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-8">
            {depoimentos.map((_, index) => (
              <button
                key={index}
                onClick={() => !isTransitioning && setCurrentSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all disabled:opacity-50 ${
                  index === currentSlide
                    ? 'bg-[#3A4257] scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Botão Adicionar Comentário */}
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/avaliacoes')}
              className="bg-[#3A4257] text-white hover:bg-[#2A3142] px-8 py-4 text-lg rounded-xl shadow-lg gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Adicionar seu comentário
            </Button>
          </div>

          {/* Estatísticas da Comunidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
            <div className="text-center bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <div className="text-5xl md:text-6xl font-bold text-[#3A4257] mb-4">1.2K+</div>
              <p className="text-xl text-gray-600">Livros Catalogados</p>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <div className="text-5xl md:text-6xl font-bold text-[#3A4257] mb-4">3.5K+</div>
              <p className="text-xl text-gray-600">Avaliações Compartilhadas</p>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <div className="text-5xl md:text-6xl font-bold text-[#3A4257] mb-4">850+</div>
              <p className="text-xl text-gray-600">Leitores Ativos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#3A4257] text-white py-20 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Pronto para começar?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
            Cadastre-se hoje e comece a descobrir e compartilhar suas leituras favoritas
          </p>
          <Button 
            className="bg-white text-[#3A4257] hover:bg-gray-100 px-12 py-4 text-xl font-semibold"
            onClick={() => navigate('/login')}
          >
            Cadastrar-se Agora
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
