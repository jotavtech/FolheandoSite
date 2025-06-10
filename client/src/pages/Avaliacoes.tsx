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
  id: string;
  nome: string;
}

interface Livro {
  idGoogle: string;
  titulo: string;
  autor: string;
  imagem: string;
}

interface Resenha {
  id: string;
  user: Usuario;
  userId: string;
  status: string;
  nota: number;
  resenha: string;
  livro: Livro;
  titulo: string;
  autor: string;
  imagem: string;
  createdAt?: string;
}

interface ApiResponse {
  resenhas: Resenha[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function Avaliacoes() {
  const [, navigate] = useLocation();
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [filteredResenhas, setFilteredResenhas] = useState<Resenha[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  
  const itemsPerPage = 6;
  const debounceRef = useRef<number>();

  // Buscar resenhas da API
  const fetchResenhas = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search })
      });

      console.log(`Buscando resenhas da API: page=${page}, search="${search}"`);
      const response = await fetch(`http://localhost:3002/api/resenhas-todas?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.resenhas && Array.isArray(data.resenhas)) {
        setResenhas(data.resenhas);
        setFilteredResenhas(data.resenhas);
        setTotalPages(data.pagination.pages);
        console.log(`Carregadas ${data.resenhas.length} resenhas da API`);
      } else {
        setResenhas([]);
        setFilteredResenhas([]);
        setTotalPages(0);
        setError("Nenhuma resenha encontrada no banco de dados.");
      }
    } catch (err) {
      console.error("Erro ao buscar resenhas da API:", err);
      setError("Erro ao conectar com o servidor. Verifique se o servidor está rodando.");
      setResenhas([]);
      setFilteredResenhas([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResenhas(1, "");
  }, []);

  // Busca com debounce
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (searchQuery.trim()) {
        fetchResenhas(1, searchQuery);
      } else {
        fetchResenhas(1, "");
      }
      setCurrentPage(1);
    }, 500);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const toggleExpandReview = (id: string) => {
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

  const goToPage = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      fetchResenhas(page, searchQuery);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800 text-lg mb-4">{error}</p>
                <Button 
                  onClick={() => fetchResenhas(1, searchQuery)} 
                  className="bg-[#3A4257] text-white h-12 px-8 text-lg"
                >
                  Tentar novamente
                </Button>
                  </div>
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
                  <div className="text-center">
                    <p className="text-gray-600 text-2xl mb-4">Nenhuma avaliação encontrada.</p>
                    {searchQuery ? (
                      <div className="space-y-4">
                        <p className="text-gray-500 text-lg">Tente buscar por outro termo ou</p>
                        <Button 
                          onClick={() => setSearchQuery("")} 
                          className="bg-[#3A4257] text-white h-12 px-8 text-lg"
                        >
                          Ver todas as avaliações
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-500 text-lg">Seja o primeiro a avaliar um livro!</p>
                        <Button 
                          onClick={() => navigate('/livros')} 
                          className="bg-[#3A4257] text-white h-12 px-8 text-lg"
                        >
                          Avaliar um livro
                    </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Grid de avaliações */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {filteredResenhas.map((resenha) => (
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