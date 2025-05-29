import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

interface Usuario {
  id: number;
  nome: string;
}

interface Livro {
  idGoogle: string;
  titulo: string;
  autor: string;
  imagem: string;
}

interface Resenha {
  id: number;
  user: Usuario;
  userId: number;
  status: string;
  nota: number;
  resenha: string;
  livro: Livro;
  titulo: string;
  autor: string;
  imagem: string;
}

export default function Avaliacoes() {
  const [, navigate] = useLocation();
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [filteredResenhas, setFilteredResenhas] = useState<Resenha[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  
  const itemsPerPage = 6;
  const debounceRef = useRef<number>();

  // Buscar todas as resenhas
  const fetchResenhas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Primeiro tenta buscar da API real
      const res = await fetch('http://localhost:5000/api/resenhas-todas');
      
      if (!res.ok) {
        throw new Error('API não disponível');
      }
      
      const data: Resenha[] = await res.json();
      setResenhas(data);
      setFilteredResenhas(data);
    } catch (err) {
      console.log("API não disponível, usando dados mockados:", err);
      
      // Fallback para dados mockados com imagens reais do Google Books
      const mockResenhas: Resenha[] = [
        {
          id: 1,
          user: { id: 1, nome: "João Silva" },
          userId: 1,
          status: "lido",
          nota: 9,
          resenha: "Um livro extraordinário que mudou minha perspectiva sobre a vida. A narrativa é envolvente e os personagens são muito bem desenvolvidos. Recomendo fortemente para quem gosta de ficção contemporânea.",
          livro: {
            idGoogle: "example1",
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
            idGoogle: "example2",
            titulo: "1984",
            autor: "George Orwell",
            imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "1984",
          autor: "George Orwell",
          imagem: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 3,
          user: { id: 3, nome: "Pedro Costa" },
          userId: 3,
          status: "lido",
          nota: 10,
          resenha: "Simplesmente perfeito! Uma história que te prende do início ao fim. Os detalhes são incríveis e a construção do mundo é fantástica. Tolkien criou uma obra-prima que transcende gerações.",
          livro: {
            idGoogle: "example3",
            titulo: "O Senhor dos Anéis",
            autor: "J.R.R. Tolkien",
            imagem: "https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "O Senhor dos Anéis",
          autor: "J.R.R. Tolkien",
          imagem: "https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 4,
          user: { id: 4, nome: "Ana Oliveira" },
          userId: 4,
          status: "lido",
          nota: 7,
          resenha: "Um bom livro, mas esperava mais. A história é interessante, mas alguns momentos são um pouco lentos. Ainda assim, é uma obra importante da literatura brasileira.",
          livro: {
            idGoogle: "example4",
            titulo: "Dom Casmurro",
            autor: "Machado de Assis",
            imagem: "https://books.google.com/books/content?id=VSkuAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "Dom Casmurro",
          autor: "Machado de Assis",
          imagem: "https://books.google.com/books/content?id=VSkuAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 5,
          user: { id: 5, nome: "Carlos Ferreira" },
          userId: 5,
          status: "lido",
          nota: 9,
          resenha: "Uma obra-prima da literatura brasileira. A forma como o autor retrata a sociedade da época é genial. Aluísio Azevedo conseguiu capturar a essência do naturalismo brasileiro.",
          livro: {
            idGoogle: "example5",
            titulo: "O Cortiço",
            autor: "Aluísio Azevedo",
            imagem: "https://books.google.com/books/content?id=TjQOAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "O Cortiço",
          autor: "Aluísio Azevedo",
          imagem: "https://books.google.com/books/content?id=TjQOAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 6,
          user: { id: 6, nome: "Lucia Mendes" },
          userId: 6,
          status: "lido",
          nota: 8,
          resenha: "Um romance envolvente que explora temas profundos sobre amor e sociedade. Jane Austen conseguiu criar personagens memoráveis e uma crítica social sutil mas poderosa.",
          livro: {
            idGoogle: "example6",
            titulo: "Orgulho e Preconceito",
            autor: "Jane Austen",
            imagem: "https://books.google.com/books/content?id=s7NItwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "Orgulho e Preconceito",
          autor: "Jane Austen",
          imagem: "https://books.google.com/books/content?id=s7NItwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 7,
          user: { id: 7, nome: "Roberto Lima" },
          userId: 7,
          status: "lido",
          nota: 9,
          resenha: "Uma aventura épica que marcou minha infância e continua sendo relevante hoje. A jornada de Santiago é inspiradora e cheia de lições de vida.",
          livro: {
            idGoogle: "example7",
            titulo: "Harry Potter e a Pedra Filosofal",
            autor: "J.K. Rowling",
            imagem: "https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "Harry Potter e a Pedra Filosofal",
          autor: "J.K. Rowling",
          imagem: "https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        },
        {
          id: 8,
          user: { id: 8, nome: "Fernanda Costa" },
          userId: 8,
          status: "lido",
          nota: 8,
          resenha: "Um clássico da ficção científica que continua atual. A visão de Bradbury sobre o futuro é ao mesmo tempo assustadora e fascinante.",
          livro: {
            idGoogle: "example8",
            titulo: "Fahrenheit 451",
            autor: "Ray Bradbury",
            imagem: "https://books.google.com/books/content?id=4Q_QDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          },
          titulo: "Fahrenheit 451",
          autor: "Ray Bradbury",
          imagem: "https://books.google.com/books/content?id=4Q_QDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
        }
      ];
      
      setResenhas(mockResenhas);
      setFilteredResenhas(mockResenhas);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResenhas();
  }, []);

  // Filtrar resenhas baseado na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResenhas(resenhas);
      setCurrentPage(1);
      return;
    }

    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const filtered = resenhas.filter(resenha => 
        resenha.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resenha.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resenha.user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resenha.resenha.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResenhas(filtered);
      setCurrentPage(1);
    }, 300);
  }, [searchQuery, resenhas]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const toggleExpandReview = (id: number) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(nota / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Paginação
  const totalPages = Math.ceil(filteredResenhas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResenhas = filteredResenhas.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      
      {/* Seção principal - tela cheia */}
      <main className="flex-1 min-h-screen py-16 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto h-full">
          {/* Cabeçalho com busca */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-0">Principais Avaliações</h1>
            
            <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative flex gap-3">
                <div className="relative flex-1 md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    placeholder="Buscar por livro, autor ou usuário..."
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
              
              <Button 
                className="bg-[#3A4257] text-white h-12 px-8 text-lg"
                onClick={() => navigate('/livros')}
              >
                Escrever uma Avaliação
              </Button>
            </div>
          </div>

          {/* Loading e Error States */}
          {isLoading && (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3A4257]"></div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-center py-12">
              <p className="text-xl">{error}</p>
              <Button 
                onClick={fetchResenhas} 
                className="mt-6 bg-[#3A4257] text-white h-12 px-8 text-lg"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Resultados da busca */}
          {!isLoading && !error && (
            <>
              {searchQuery && (
                <div className="mb-8">
                  <p className="text-gray-600 text-xl">
                    {filteredResenhas.length} resultado(s) encontrado(s) para "{searchQuery}"
                  </p>
                </div>
              )}

              {filteredResenhas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6">
                  <p className="text-gray-600 text-2xl">Nenhuma avaliação encontrada.</p>
                  <Button 
                    onClick={() => setSearchQuery("")} 
                    className="bg-[#3A4257] text-white h-12 px-8 text-lg"
                  >
                    Ver todas as avaliações
                  </Button>
                </div>
              ) : (
                <>
                  {/* Grid de avaliações */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {currentResenhas.map((resenha) => (
                      <div key={resenha.id} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <div className="flex gap-6 mb-6">
                          <div className="flex-shrink-0">
                            <BookCard 
                              type="small" 
                              className="w-24 h-36" 
                              imageUrl={resenha.imagem}
                              altText={resenha.titulo}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-2">{resenha.titulo}</h3>
                            <p className="text-lg text-gray-600 mb-3">{resenha.autor}</p>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex">
                                {renderStars(resenha.nota)}
                              </div>
                              <span className="text-lg font-medium">{resenha.nota}/10</span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Avaliado por: <span className="font-medium">{resenha.user.nome}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-6">
                          <p className="text-base text-gray-700 leading-relaxed">
                            {expandedReview === resenha.id 
                              ? resenha.resenha 
                              : `${resenha.resenha.substring(0, 150)}${resenha.resenha.length > 150 ? '...' : ''}`
                            }
                          </p>
                          {resenha.resenha.length > 150 && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-[#3A4257] p-0 h-auto mt-3 text-base"
                              onClick={() => toggleExpandReview(resenha.id)}
                            >
                              {expandedReview === resenha.id ? 'Ler menos' : 'Ler mais'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => goToPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="h-12 px-6"
                        >
                          &lt;
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          if (pageNum > totalPages) return null;
                          
                          return (
                            <Button 
                              key={pageNum}
                              variant="outline" 
                              size="lg"
                              className={pageNum === currentPage ? "bg-[#3A4257] text-white h-12 px-6" : "h-12 px-6"}
                              onClick={() => goToPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="h-12 px-6"
                        >
                          &gt;
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}