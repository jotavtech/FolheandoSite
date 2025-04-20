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
  // submittedQuery agora inicializado para carregar livros iniciais
  const [submittedQuery, setSubmittedQuery] = useState<string>("livros");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const maxResults = 10;

  const observerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number>();

  async function fetchBooks(query: string, start: number) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3000/buscar-livros?q=${encodeURIComponent(query)}&startIndex=${start}&maxResults=${maxResults}&orderBy=newest`
      );
      if (!res.ok) throw new Error(`Erro: ${res.status}`);
      const data: Book[] = await res.json();
      if (!Array.isArray(data)) throw new Error("API inválida");
      setBooks(prev => 
        start === 0
          ? data
          : [...prev, ...data.filter(nb => !prev.some(pb => pb.idGoogle === nb.idGoogle))]
      );
    } catch (err) {
      setError("Não foi possível carregar os livros.");
    } finally {
      setIsLoading(false);
    }
  }

  // Sempre carrega ao submeter ou ao mudar página/searchedQuery
  useEffect(() => {
    fetchBooks(submittedQuery, startIndex);
  }, [submittedQuery, startIndex]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading) {
        setStartIndex(prev => prev + maxResults);
      }
    }, { threshold: 1.0 });
    const cur = observerRef.current;
    if (cur) obs.observe(cur);
    return () => { if (cur) obs.unobserve(cur); };
  }, [isLoading]);

  // Sugestões quando digita
  useEffect(() => {
    if (!searchQuery) { setSuggestions([]); return; }
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/buscar-livros?q=${encodeURIComponent(searchQuery)}&startIndex=0&maxResults=5&orderBy=newest`
        );
        const data: Book[] = await res.json();
        setSuggestions(data.map(b => b.titulo));
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBooks([]);
    setStartIndex(0);
    setSubmittedQuery(searchQuery || "livros");
    setSuggestions([]);
  };

  const applySuggestion = (title: string) => {
    setSearchQuery(title);
    setSuggestions([]);
    setBooks([]);
    setStartIndex(0);
    setSubmittedQuery(title);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      <main className="flex-1 py-10 px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Catálogo de Livros</h1>
            <form onSubmit={handleSearch} className="w-full md:w-auto relative flex gap-2">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Buscar livros..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => applySuggestion(s)}
                      >{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" className="bg-[#3A4257] text-white">Buscar</Button>
              <Button
                type="button"
                onClick={() => navigate('/cadastro-livro')}
                className="bg-emerald-600 text-white"
              >
                Cadastrar Livro
              </Button>
            </form>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {!isLoading && books.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <p className="text-gray-600 text-xl">Nenhum livro encontrado.</p>
              <Button onClick={() => applySuggestion(submittedQuery)} className="bg-[#3A4257] text-white">Tentar novamente</Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {books.map(book => (
              <div
                key={book.idGoogle}
                className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/livro/${book.idGoogle}`)}
              >
                <BookCard type="medium" className="mb-2 h-40" imageUrl={book.imagem} />
                <div className="mt-2">
                  <h3 className="font-medium">{book.titulo}</h3>
                  <p className="text-sm text-gray-600">{book.autores.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center animate-pulse">
              <div className="h-10 w-10 border-t-2 border-b-2 border-[#3A4257] rounded-full" />
            </div>
          )}

          <div ref={observerRef} className="h-16 w-full" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
