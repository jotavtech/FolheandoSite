import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const maxResults = 20; // Aumentei para 20 resultados por página

  const observerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number>();

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      <main className="flex-1 py-16 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-0">Catálogo de Livros</h1>
            <form onSubmit={handleSearch} className="w-full md:w-auto relative flex gap-3">
              <div className="relative flex-1 md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Buscar livros por título, autor, ISBN..."
                  className="pl-10 h-12 text-lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-base border-b last:border-b-0"
                        onClick={() => applySuggestion(s)}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" className="bg-[#3A4257] text-white h-12 px-8 text-lg" disabled={isLoading}>
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/cadastro-livro')}
                className="bg-emerald-600 text-white h-12 px-8 text-lg"
              >
                Cadastrar Livro
              </Button>
            </form>
          </div>

          {/* Buscas rápidas */}
          <div className="mb-8">
            <p className="text-lg mb-4 text-gray-600">Buscas populares:</p>
            <div className="flex flex-wrap gap-3">
              {[
                "Romance brasileiro", 
                "Ficção científica", 
                "Literatura clássica", 
                "Suspense", 
                "Fantasia", 
                "Biografia",
                "História do Brasil",
                "Autoajuda"
              ].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(term)}
                  className="border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 mb-6 text-xl text-center p-6 bg-red-50 rounded-lg">
              <p>{error}</p>
              <Button 
                onClick={() => fetchBooks(submittedQuery, 0, true)} 
                className="mt-4 bg-[#3A4257] text-white"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && books.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-96 gap-6">
              <p className="text-gray-600 text-2xl text-center">
                Nenhum livro encontrado para "{submittedQuery}".
              </p>
              <Button 
                onClick={() => handleQuickSearch("livros populares")} 
                className="bg-[#3A4257] text-white h-12 px-8 text-lg"
              >
                Ver livros populares
              </Button>
            </div>
          )}

          {books.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-lg text-gray-600">
                  {books.length} livro(s) encontrado(s) para "{submittedQuery}"
                  {hasMore && " (carregando mais resultados...)"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {books.map(book => (
                  <div
                    key={book.idGoogle}
                    className="flex flex-col p-4 rounded-lg hover:bg-white/50 transition-all duration-200"
                  >
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/livro/${book.idGoogle}`)}
                    >
                      <BookCard type="medium" className="mb-4 h-48 md:h-56" imageUrl={book.imagem} />
                      <div className="mt-3 mb-4">
                        <h3 className="font-medium text-base md:text-lg mb-2 line-clamp-2" title={book.titulo}>
                          {book.titulo}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 line-clamp-1" title={book.autores.join(", ")}>
                          {book.autores.join(", ")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        className="flex-1 bg-[#3A4257] text-white hover:bg-[#2A3142] py-2 text-xs"
                        onClick={() => navigate(`/livro/${book.idGoogle}`)}
                      >
                        Detalhes
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white py-2 text-xs"
                        onClick={() => navigate(`/avaliar-livro/${book.idGoogle}`)}
                      >
                        Avaliar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {isLoading && books.length === 0 && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="h-16 w-16 border-t-4 border-b-4 border-[#3A4257] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg text-gray-600">Buscando livros...</p>
              </div>
            </div>
          )}

          {isLoading && books.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="h-12 w-12 border-t-4 border-b-4 border-[#3A4257] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Carregando mais livros...</p>
              </div>
            </div>
          )}

          <div ref={observerRef} className="h-20 w-full" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
