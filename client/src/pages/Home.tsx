import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Slider from "@/components/Slider";
import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Plus, Star, BookOpen, Users, TrendingUp, Sparkles } from "lucide-react";
import { SECTION_TITLES } from "@/lib/constants";
import "@/styles/animations.css";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Verificar se usuário está logado
  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        setIsLoggedIn(true);
        setUserName(userData.nome || userData.name || 'Usuário');
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
      }
    }
  }, []);

  // Animação de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      const res = await fetch('http://localhost:3002/api/livros-destaque');
      
      if (!res.ok) {
        throw new Error('API não disponível');
      }
      
      const data: Livro[] = await res.json();
      setLivrosDestaque(data);
    } catch (err) {
      console.error("Erro ao carregar livros em destaque:", err);
      setError("Não foi possível carregar os livros em destaque. Verifique se o servidor está rodando.");
      setLivrosDestaque([]);
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
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden">
      <Header />

      {/* Hero Section com animações */}
      <section className="bg-gradient-to-r from-[#4A5568] to-[#6B7F9E] text-white py-24 px-8 md:px-12 lg:px-16 relative overflow-hidden">
        {/* Elementos de fundo animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-bounce delay-500"></div>
            </div>
        
        <div className={`max-w-7xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up delay-200">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            <span className="text-xl font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {isLoggedIn ? `Bem-vindo de volta, ${userName}!` : 'Descubra sua próxima leitura'}
            </span>
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 animate-fade-in-up delay-300 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {isLoggedIn ? 'Continue Sua Jornada Literária' : 'Bem-vindo ao Folheando'}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-500">
            {isLoggedIn 
              ? 'Explore novos mundos, compartilhe suas descobertas e encontre sua próxima grande leitura na nossa comunidade de leitores apaixonados.'
              : 'Descubra livros incríveis através das avaliações da nossa comunidade. Compartilhe suas experiências literárias e encontre sua próxima grande leitura.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-700">
            <Button 
              className="bg-white text-[#4A5568] hover:bg-gray-100 px-10 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-xl group"
              onClick={() => navigate('/livros')}
            >
              <BookOpen className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              {isLoggedIn ? 'Explorar Biblioteca' : 'Explorar Livros'}
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-[#4A5568] hover:bg-white hover:text-[#4A5568] px-10 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-xl group"
              onClick={() => navigate('/avaliacoes')}
            >
              <Users className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Ver Avaliações
            </Button>
          </div>
        </div>
      </section>

      {/* Seção de Livros em Destaque com animações */}
      <section className="py-20 px-8 md:px-12 lg:px-16 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-[#3A4257] animate-bounce" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#3A4257] to-[#6B7F9E] bg-clip-text text-transparent">
                Livros em Destaque
              </h2>
              <TrendingUp className="w-8 h-8 text-[#3A4257] animate-bounce delay-200" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Confira algumas das obras mais comentadas e bem avaliadas pela nossa comunidade
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner 
              size="lg" 
              variant="books" 
              message="Carregando livros incríveis..."
              subMessage="Descobrindo as melhores obras para você"
              className="py-20"
            />
          ) : error ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-red-600 text-xl mb-6">{error}</p>
                <Button 
                  onClick={fetchLivrosDestaque} 
                  className="bg-[#3A4257] text-white px-8 py-4 text-lg hover:bg-[#2A3142] transform hover:scale-105 transition-all duration-300"
                >
                  Tentar novamente
              </Button>
              </div>
            </div>
          ) : livrosDestaque.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {livrosDestaque.map((livro, index) => (
                <div
                  key={livro.idGoogle}
                  className={`cursor-pointer transition-all duration-500 hover:scale-105 p-6 bg-white rounded-xl shadow-sm hover:shadow-2xl group transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div onClick={() => navigate(`/livro/${livro.idGoogle}`)}>
                    <div className="relative overflow-hidden rounded-lg mb-6 group-hover:shadow-lg transition-shadow duration-300">
                      <BookCard 
                        type="medium" 
                        className="w-full h-64 mb-0 transition-transform duration-300 group-hover:scale-110" 
                        imageUrl={livro.imagem}
                        altText={livro.titulo}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white font-medium">Ver Detalhes</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-[#3A4257] transition-colors duration-300">{livro.titulo}</h3>
                    <p className="text-gray-600 text-base mb-4">{livro.autores.join(", ")}</p>
                    {livro.mediaNotas && (
                      <div className="flex items-center mb-4">
                        <span className="text-[#3A4257] font-medium text-base flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {livro.mediaNotas.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-[#3A4257] text-white hover:bg-[#2A3142] py-2 text-sm transform hover:scale-105 transition-all duration-300"
                      onClick={() => navigate(`/livro/${livro.idGoogle}`)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white py-2 text-sm transform hover:scale-105 transition-all duration-300"
                      onClick={() => navigate(`/avaliar-livro/${livro.idGoogle}`)}
                    >
                      Avaliar
                    </Button>
            </div>
          </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6 animate-pulse" />
              <p className="text-gray-600 text-xl">Nenhum livro em destaque no momento.</p>
          </div>
          )}
        </div>
      </section>

      {/* Seção Nossa Comunidade com Depoimentos - animações melhoradas */}
      <section className="relative py-20 px-8 md:px-12 lg:px-16 overflow-hidden">
        {/* Fundo embaçado com animações */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A5568]/10 to-[#6B7F9E]/10 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-lg"></div>
        
        {/* Elementos decorativos animados */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full blur-xl opacity-30 animate-float delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="w-8 h-8 text-[#3A4257] animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#3A4257] to-[#6B7F9E] bg-clip-text text-transparent">
                Nossa Comunidade
              </h2>
              <Users className="w-8 h-8 text-[#3A4257] animate-pulse delay-300" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja o que nossos leitores estão dizendo sobre suas experiências no Folheando
            </p>
          </div>
          
          {/* Carousel de Depoimentos com animações melhoradas */}
          <div className="relative overflow-hidden">
            {/* Controles com animações */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:bg-white transition-all group disabled:opacity-50 transform hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:bg-white transition-all group disabled:opacity-50 transform hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
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
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 h-full transform transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
                      {/* Header do Card com animações */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${depoimento.cor} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
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
                          <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#3A4257] transition-colors duration-300">{depoimento.nome}</h4>
                          <p className="text-gray-500 text-sm">{depoimento.usuario}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: depoimento.nota }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                          </div>
                        </div>
          </div>
          
                      {/* Comentário */}
                      <p className="text-gray-700 text-lg leading-relaxed mb-6 italic group-hover:text-gray-900 transition-colors duration-300">
                        "{depoimento.comentario}"
                      </p>

                      {/* Livro Favorito */}
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Livro favorito atual:</p>
                        <p className="font-semibold text-[#3A4257] group-hover:text-[#2A3142] transition-colors duration-300">{depoimento.livroFavorito}</p>
          </div>
        </div>
          </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicadores com animações */}
          <div className="flex justify-center gap-2 mt-8">
            {depoimentos.map((_, index) => (
              <button
                key={index}
                onClick={() => !isTransitioning && setCurrentSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 disabled:opacity-50 transform hover:scale-125 ${
                  index === currentSlide
                    ? 'bg-[#3A4257] scale-125 shadow-lg'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          {/* Botão Adicionar Comentário */}
          <div className="text-center mt-12 animate-fade-in-up delay-1000">
            <Button
              onClick={() => navigate('/avaliacoes')}
              className="bg-[#3A4257] text-white hover:bg-[#2A3142] px-8 py-4 text-lg rounded-xl shadow-lg gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Adicionar seu comentário
                    </Button>
                  </div>

          {/* Estatísticas da Comunidade com animações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
            {[
              { number: "1.2K+", label: "Livros Catalogados", icon: BookOpen, delay: "0ms" },
              { number: "3.5K+", label: "Avaliações Compartilhadas", icon: Star, delay: "200ms" },
              { number: "850+", label: "Leitores Ativos", icon: Users, delay: "400ms" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl group animate-fade-in-up"
                style={{ animationDelay: stat.delay }}
              >
                <stat.icon className="w-12 h-12 text-[#3A4257] mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-5xl md:text-6xl font-bold text-[#3A4257] mb-4 group-hover:text-[#2A3142] transition-colors duration-300">{stat.number}</div>
                <p className="text-xl text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - condicional para usuários não logados */}
      {!isLoggedIn && (
        <section className="bg-gradient-to-r from-[#3A4257] to-[#4A5568] text-white py-20 px-8 md:px-12 lg:px-16 relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto text-center relative z-10 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
              <span className="text-xl font-medium">Junte-se à nossa comunidade</span>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
          </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Pronto para começar?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
              Cadastre-se hoje e comece a descobrir e compartilhar suas leituras favoritas
            </p>
            <Button 
              className="bg-white text-[#3A4257] hover:bg-gray-100 px-12 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-xl group"
              onClick={() => navigate('/login')}
            >
              <Users className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Cadastrar-se Agora
            </Button>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
