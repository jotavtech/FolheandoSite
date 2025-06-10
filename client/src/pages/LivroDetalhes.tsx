import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface Livro {
  idGoogle: string;
  titulo: string;
  autores: string[];
  descricao: string;
  imagem: string;
}

interface Usuario {
  id: number;
  nome: string;
}

interface Resenha {
  id: number;
  user: Usuario;
  userId: number;
  status: string;
  nota: number;
  resenha: string;
}

const statusMap = {
  "Lido": "lido",
  "Lendo": "lendo",
  "Quero ler": "nao_li"
};

export default function LivroDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const [livro, setLivro] = useState<Livro | null>(null);
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [jaResenhou, setJaResenhou] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const [status, setStatus] = useState("Lido");
  const [nota, setNota] = useState(5);
  const [textoResenha, setTextoResenha] = useState("");

  // 2) carrega o usuário
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) setUsuario(JSON.parse(u));
  }, []);

  // 3) carrega o livro e depois as resenhas
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    // 3a) livro do Google Books
    fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.volumeInfo) {
          setLivro({
            idGoogle: data.id,
            titulo: data.volumeInfo.title || "Sem título",
            autores: data.volumeInfo.authors || ["Desconhecido"],
            descricao: data.volumeInfo.description?.replace(/<[^>]+>/g, "") || "Sem descrição",
            imagem: data.volumeInfo.imageLinks?.thumbnail || 
                   data.volumeInfo.imageLinks?.smallThumbnail || 
                   "https://via.placeholder.com/300x450?text=Sem+Capa",
          });
        } else {
          setError("Livro não encontrado");
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar livro:", err);
        setError("Erro ao carregar informações do livro");
      })
      .finally(() => setIsLoading(false));

    // 3b) resenhas do seu backend
    fetch(`http://localhost:3002/api/resenhas/${id}`)
      .then((r) => r.json())
      .then((arr: Resenha[]) => {
        setResenhas(arr);
        if (usuario) {
          setJaResenhou(arr.some((r) => r.userId === usuario.id));
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar resenhas:", err);
        setResenhas([]);
      });

  }, [id, usuario]);

  // 4) form de resenha
  const enviarResenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !livro) return;
    
    const payload = {
      userId: usuario.id,
      idGoogleLivro: id,
      status: statusMap[status as keyof typeof statusMap],
      nota,
      resenha: textoResenha,
      titulo: livro.titulo,
      autor: livro.autores.join(", "),
      imagem: livro.imagem,
    };
    
    try {
    const url = editandoId
        ? `http://localhost:3002/api/resenhas/${editandoId}`
        : "http://localhost:3002/api/resenhas";
    const method = editandoId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
      
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Erro ao salvar resenha");
      }
    } catch (err) {
      console.error("Erro ao enviar resenha:", err);
      alert("Erro de conexão ao salvar resenha");
    }
  };

  const editar = (r: Resenha) => {
    setStatus(
      (Object.keys(statusMap) as Array<keyof typeof statusMap>)
        .find((k) => statusMap[k] === r.status) || "Lido"
    );
    setNota(r.nota);
    setTextoResenha(r.resenha);
    setEditandoId(r.id);
  };

  const apagar = async (rid: number) => {
    if (!confirm("Apagar resenha?")) return;
    try {
      await fetch(`http://localhost:3002/api/resenhas/${rid}`, { method: "DELETE" });
    window.location.reload();
    } catch (err) {
      console.error("Erro ao apagar resenha:", err);
      alert("Erro ao apagar resenha");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const toggleExpandReview = (id: number) => {
    setExpandedReviews(prev => 
      prev.includes(id) 
        ? prev.filter(reviewId => reviewId !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3A4257] mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Carregando livro...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !livro) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Livro não encontrado"}
            </h1>
            <Button onClick={() => navigate('/livros')} className="bg-[#3A4257] text-white">
              Voltar para Livros
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      <main className="flex-1 py-16 px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        
        {/* Botão Voltar */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/livros')}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Livros
        </Button>

        {/* Informações do Livro */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <BookCard 
                type="large" 
                className="w-full max-w-sm mx-auto" 
                imageUrl={livro.imagem}
                altText={livro.titulo}
              />
            </div>
            <div className="lg:w-2/3">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{livro.titulo}</h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-6">
                <span className="font-semibold">Autor(es):</span> {livro.autores.join(", ")}
              </p>
              
              {/* Ações */}
              <div className="flex gap-4 mb-8">
                <Button 
                  className="bg-[#3A4257] text-white px-8 py-3 text-lg"
                  onClick={() => navigate(`/avaliar-livro/${id}`)}
                >
                  Avaliar Livro
                </Button>
                <Button 
                  variant="outline"
                  className="border-[#3A4257] text-[#3A4257] px-8 py-3 text-lg"
                  onClick={() => document.getElementById('resenhas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Avaliações ({resenhas.length})
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-2xl font-semibold mb-4">Sinopse</h3>
                <p className="text-lg text-gray-800 leading-relaxed">{livro.descricao}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Resenhas */}
        <div id="resenhas" className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-8">
            Avaliações dos Leitores ({resenhas.length})
          </h2>
          
          {resenhas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-6">
                Este livro ainda não foi avaliado.
              </p>
              <Button 
                className="bg-[#3A4257] text-white px-8 py-3 text-lg"
                onClick={() => navigate(`/avaliar-livro/${id}`)}
              >
                Seja o primeiro a avaliar!
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {resenhas.map((r) => (
                <div key={r.id} className="p-6 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <strong className="text-xl">{r.user.nome}</strong>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(r.nota)}</div>
                        <span className="text-lg font-medium">{r.nota}/10</span>
                      </div>
                    </div>
                    {usuario?.id === r.userId && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => editar(r)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => apagar(r.id)}
                        >
                          Apagar
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {expandedReviews.includes(r.id) || r.resenha.length <= 200
                        ? r.resenha 
                        : `${r.resenha.substring(0, 200)}...`
                      }
                    </p>
                    {r.resenha.length > 200 && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-[#3A4257] p-0 h-auto mt-2"
                        onClick={() => toggleExpandReview(r.id)}
                      >
                        {expandedReviews.includes(r.id) ? 'Ler menos' : 'Ler mais'}
                      </Button>
                    )}
                  </div>
          </div>
        ))}
            </div>
          )}
        </div>

        {/* Formulário de Resenha (apenas se não resenhou e está logado) */}
        {!jaResenhou && usuario && (
          <form
            onSubmit={enviarResenha}
            className="mt-12 bg-white p-8 md:p-12 rounded-xl shadow-lg space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-semibold mb-6">Escrever Avaliação</h3>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full h-12 text-lg">
                <SelectValue placeholder="Selecione status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusMap).map((k) => (
                  <SelectItem key={k} value={k} className="text-lg">
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <label className="block text-lg font-medium mb-2">Nota (1 a 10)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={nota}
              onChange={(e) => setNota(Number(e.target.value))}
              placeholder="Nota (1 a 10)"
                className="h-12 text-lg"
            />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Sua avaliação</label>
            <Textarea
              value={textoResenha}
              onChange={(e) => setTextoResenha(e.target.value)}
                placeholder="Escreva sua avaliação sobre o livro..."
                rows={6}
                className="text-lg"
                required
            />
            </div>

            <Button 
              type="submit"
              className="bg-[#3A4257] text-white px-8 py-4 text-xl"
            >
              {editandoId ? "Atualizar" : "Enviar"} Avaliação
            </Button>
          </form>
        )}

        {/* Mensagem para usuários não logados */}
        {!usuario && (
          <div className="mt-12 bg-gray-50 p-8 rounded-xl text-center">
            <h3 className="text-2xl font-semibold mb-4">Quer avaliar este livro?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Faça login ou cadastre-se para compartilhar sua opinião sobre este livro.
            </p>
            <Button 
              className="bg-[#3A4257] text-white px-8 py-3 text-lg"
              onClick={() => navigate('/login')}
            >
              Fazer Login
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
