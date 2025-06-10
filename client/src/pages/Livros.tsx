import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Search, BookOpen, Filter, Sparkles, TrendingUp } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "@/styles/animations.css";

interface Book {
  idGoogle: string;
  titulo: string;
  autores: string[];
  descricao: string;
  imagem: string;
}

export default function Livros() {
  const [, navigate] = useLocation();

  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("livros populares");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const maxResults = 20; // Aumentei para 20 resultados por página

  const observerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number>();

  // Animação de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Função para buscar livros na Google Books API
  async function fetchBooks(query: string, start: number, isNewSearch: boolean = false) {
    if (!query.trim()) return;
    
    setIsLoading(true);
    if (isNewSearch) {
    setError(null);
      setBooks([]);
    }
    
    try {
      // Buscar diretamente na API do Google Books
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&startIndex=${start}&maxResults=${maxResults}&orderBy=relevance&printType=books&langRestrict=pt`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        if (isNewSearch) {
          setBooks([]);
          setError("Nenhum livro encontrado para sua busca.");
        }
        setHasMore(false);
        return;
      }

      // Transformar dados da API para o formato esperado
      const newBooks: Book[] = data.items.map((item: any) => ({
        idGoogle: item.id,
        titulo: item.volumeInfo.title || "Título não disponível",
        autores: item.volumeInfo.authors || ["Autor desconhecido"],
        descricao: item.volumeInfo.description?.replace(/<[^>]+>/g, "") || "Descrição não disponível",
        imagem: item.volumeInfo.imageLinks?.thumbnail || 
               item.volumeInfo.imageLinks?.smallThumbnail || 
               "https://via.placeholder.com/128x192?text=Sem+Capa"
      }));

      // Filtrar duplicatas
      const filteredBooks = newBooks.filter(newBook => 
        !books.some(existingBook => existingBook.idGoogle === newBook.idGoogle)
      );

      if (isNewSearch) {
        setBooks(filteredBooks);
      } else {
        setBooks(prev => [...prev, ...filteredBooks]);
      }

      // Verificar se há mais resultados
      setHasMore(data.totalItems > start + maxResults);
      
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
      setError("Erro ao buscar livros. Tente novamente.");
      if (isNewSearch) {
        setBooks([]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Carregar livros iniciais
  useEffect(() => {
    fetchBooks(submittedQuery, 0, true);
  }, [submittedQuery]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading && hasMore && books.length > 0) {
        setStartIndex(prev => {
          const newIndex = prev + maxResults;
          fetchBooks(submittedQuery, newIndex, false);
          return newIndex;
        });
      }
    }, { threshold: 1.0 });
    
    const cur = observerRef.current;
    if (cur) obs.observe(cur);
    return () => { if (cur) obs.unobserve(cur); };
  }, [isLoading, hasMore, books.length, submittedQuery]);

  // Sugestões quando digita
  useEffect(() => {
    if (!searchQuery.trim()) { 
      setSuggestions([]); 
      return; 
    }
    
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const encodedQuery = encodeURIComponent(searchQuery);
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=5&printType=books&langRestrict=pt`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items) {
          const suggestions = data.items
            .map((item: any) => item.volumeInfo.title)
            .filter((title: string) => title && title.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5);
          setSuggestions(suggestions);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setBooks([]);
    setStartIndex(0);
    setSubmittedQuery(searchQuery);
    setSuggestions([]);
    setHasMore(true);
  };

  const applySuggestion = (title: string) => {
    setSearchQuery(title);
    setSuggestions([]);
    setBooks([]);
    setStartIndex(0);
    setSubmittedQuery(title);
    setHasMore(true);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setBooks([]);
    setStartIndex(0);
    setSubmittedQuery(query);
    setSuggestions([]);
    setHasMore(true);
  };

  const quickSearchTerms = [
    "ficção científica",
    "romance brasileiro",
    "suspense",
    "fantasia",
    "biografias",
    "autoajuda",
    "história do brasil",
    "clássicos da literatura"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      <main className="flex-1 py-16 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">

          {/* Header com animação */}
          <div className={`flex flex-col md:flex-row justify-between items-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <BookOpen className="w-10 h-10 text-[#3A4257] animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#3A4257] to-[#6B7F9E] bg-clip-text text-transparent">
                Catálogo de Livros
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse delay-300" />
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto relative flex gap-3 animate-fade-in-up delay-500">
              <div className="relative flex-1 md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 transition-colors duration-300" />
                <Input
                  placeholder="Buscar livros por título, autor, ISBN..."
                  className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-[#3A4257] transition-all duration-300 hover:shadow-lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-fade-in-up">
                    {suggestions.map((title, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => applySuggestion(title)}
                      >
                        <span className="text-sm text-gray-700">{title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="submit" 
                className="bg-[#3A4257] text-white h-12 px-8 text-lg hover:bg-[#2A3142] transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </form>
          </div>

          {/* Busca rápida com animações */}
          <div className="mb-8 animate-fade-in-up delay-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#3A4257]" />
              <h3 className="text-lg font-semibold text-gray-700">Busca Rápida:</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickSearchTerms.map((term, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(term)}
                  className={`border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white transition-all duration-300 transform hover:scale-105 animate-fade-in-up`}
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          {/* Indicador de busca atual */}
          {submittedQuery && (
            <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border-l-4 border-[#3A4257] animate-fade-in-up delay-300">
              <p className="text-gray-700">
                <span className="font-medium">Buscando por:</span> 
                <span className="text-[#3A4257] font-semibold ml-2">"{submittedQuery}"</span>
                {books.length > 0 && (
                  <span className="text-gray-500 ml-2">
                    - {books.length} livro{books.length !== 1 ? 's' : ''} encontrado{books.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Loading state melhorado */}
          {isLoading && books.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3A4257]"></div>
                <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border-4 border-[#3A4257] opacity-20"></div>
              </div>
              <p className="text-xl text-gray-600 animate-pulse">Explorando a biblioteca...</p>
              <p className="text-sm text-gray-500 mt-2 animate-pulse delay-500">Encontrando os melhores livros para você</p>
            </div>
          )}

          {/* Error state melhorado */}
          {error && (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-red-800 mb-2">Oops! Algo deu errado</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button 
                  onClick={() => fetchBooks(submittedQuery, 0, true)} 
                  className="bg-red-600 text-white hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {/* Grid de livros com animações */}
          {books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {books.map((book, index) => (
              <div
                key={book.idGoogle}
                  className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 animate-fade-in-up hover-lift`}
                  style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/livro/${book.idGoogle}`)}
              >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 p-6 h-full flex flex-col">
                    <div className="relative overflow-hidden rounded-lg mb-4 group-hover:shadow-lg transition-shadow duration-300">
                      <BookCard 
                        type="medium" 
                        className="w-full h-48 md:h-56 transition-transform duration-500 group-hover:scale-110" 
                        imageUrl={book.imagem}
                        altText={book.titulo}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white font-medium text-sm">Ver Detalhes</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#3A4257] transition-colors duration-300">
                        {book.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                        {book.autores.join(", ")}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-3 flex-1 mb-4">
                        {book.descricao}
                      </p>
                      
                      <div className="flex gap-2 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white transition-all duration-300 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/livro/${book.idGoogle}`);
                          }}
                        >
                          Detalhes
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-[#3A4257] text-white hover:bg-[#2A3142] transition-all duration-300 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/avaliar-livro/${book.idGoogle}`);
                          }}
                        >
                          Avaliar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results state melhorado */}
          {!isLoading && books.length === 0 && submittedQuery && !error && (
            <div className="text-center py-20 animate-fade-in-up">
              <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">Nenhum livro encontrado</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Não encontramos livros para "<span className="font-medium text-[#3A4257]">{submittedQuery}</span>". 
                Tente usar termos diferentes ou confira nossas sugestões.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {quickSearchTerms.slice(0, 4).map((term, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch(term)}
                    className="border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white transition-all duration-300"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading mais livros com animação */}
          {isLoading && books.length > 0 && (
            <div className="flex justify-center items-center py-12 animate-fade-in-up">
              <div className="relative mr-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A4257]"></div>
                <div className="animate-ping absolute inset-0 rounded-full h-8 w-8 border-2 border-[#3A4257] opacity-20"></div>
              </div>
              <span className="text-gray-600 animate-pulse">Carregando mais livros...</span>
          </div>
          )}

          {/* Sentinel para infinite scroll */}
          <div ref={observerRef} className="h-10" />

          {/* Fim dos resultados */}
          {!hasMore && books.length > 0 && (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                <Sparkles className="w-12 h-12 text-[#3A4257] mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600 font-medium">Você viu todos os livros disponíveis!</p>
                <p className="text-gray-500 text-sm mt-2">Tente uma nova busca para descobrir mais títulos.</p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
