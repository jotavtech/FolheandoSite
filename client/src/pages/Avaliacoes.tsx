import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Livro {
  idGoogle: string;
  titulo: string;
  autor: string;
  imagem: string;
}

interface Avaliacao {
  id: number;
  user: Usuario;
  userId: number;
  livroId: string;
  status: string;
  nota: number;
  resenha: string;
  livro: Livro;
}

const statusMap = {
  "Lido": "lido",
  "Lendo": "lendo",
  "Quero ler": "nao_li"
};

export default function Avaliacoes() {
  const [, navigate] = useLocation();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
  const [status, setStatus] = useState("Lido");
  const [nota, setNota] = useState(5);
  const [textoResenha, setTextoResenha] = useState("");
  const [suggestions, setSuggestions] = useState<Livro[]>([]);

  useEffect(() => {
    // Carregar usuário
    const u = localStorage.getItem("usuario");
    if (u) setUsuario(JSON.parse(u));

    // Carregar avaliações
    fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/resenhas");
      if (!res.ok) throw new Error(`Erro: ${res.status}`);
      const data = await res.json();
      setAvaliacoes(data);
    } catch (err) {
      setError("Não foi possível carregar as avaliações.");
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar livros para sugestões
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/buscar-livros?q=${encodeURIComponent(searchQuery)}&startIndex=0&maxResults=5&orderBy=newest`
        );
        if (!res.ok) throw new Error(`Erro: ${res.status}`);
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSubmitAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !selectedBook) return;

    try {
      const payload = {
        userId: usuario.id,
        livroId: selectedBook.idGoogle,
        status: statusMap[status as keyof typeof statusMap],
        nota,
        resenha: textoResenha,
        titulo: selectedBook.titulo,
        autor: selectedBook.autor,
        imagem: selectedBook.imagem,
      };

      const res = await fetch("http://localhost:3000/resenhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro: ${res.status}`);

      // Limpar formulário e fechar diálogo
      setSelectedBook(null);
      setStatus("Lido");
      setNota(5);
      setTextoResenha("");
      setSearchQuery("");
      setIsDialogOpen(false);

      // Recarregar avaliações
      fetchAvaliacoes();
    } catch (err) {
      setError("Não foi possível enviar a avaliação.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      
      <main className="flex-1 py-10 px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Principais Avaliações</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3A4257] text-white hover:bg-[#4F5D7E] transition-colors">
                  Escrever uma Avaliação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nova Avaliação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitAvaliacao} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar Livro</Label>
                    <div className="relative">
                      <Input
                        id="search"
                        placeholder="Digite o título do livro..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {suggestions.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                          {suggestions.map((book) => (
                            <li
                              key={book.idGoogle}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                              onClick={() => {
                                setSelectedBook(book);
                                setSearchQuery(book.titulo);
                                setSuggestions([]);
                              }}
                            >
                              <img
                                src={book.imagem}
                                alt={book.titulo}
                                className="w-8 h-12 object-cover"
                              />
                              <div>
                                <p className="font-medium">{book.titulo}</p>
                                <p className="text-sm text-gray-600">{book.autor}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {selectedBook && (
                    <>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lido">Lido</SelectItem>
                            <SelectItem value="Lendo">Lendo</SelectItem>
                            <SelectItem value="Quero ler">Quero ler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Nota</Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNota(n)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  n <= nota
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resenha">Resenha</Label>
                        <Textarea
                          id="resenha"
                          placeholder="Escreva sua resenha..."
                          value={textoResenha}
                          onChange={(e) => setTextoResenha(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#3A4257] text-white hover:bg-[#4F5D7E] transition-colors"
                      >
                        Enviar Avaliação
                      </Button>
                    </>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-md shadow-sm animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-32 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 mb-4">
                    <BookCard type="small" className="w-24 flex-shrink-0" imageUrl={avaliacao.livro.imagem} />
                    <div>
                      <h3 className="font-medium">{avaliacao.livro.titulo}</h3>
                      <p className="text-sm text-gray-600">{avaliacao.livro.autor}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < avaliacao.nota
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm">{avaliacao.resenha}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Avaliado por: {avaliacao.user.nome}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#3A4257] p-0 h-auto"
                        onClick={() => navigate(`/livro/${avaliacao.livroId}`)}
                      >
                        Ver livro
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}