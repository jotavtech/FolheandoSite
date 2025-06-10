import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
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

interface AvaliacaoForm {
  nota: number;
  status: string;
  resenha: string;
}

const statusOptions = {
  "lido": "Lido",
  "lendo": "Lendo", 
  "quero_ler": "Quero ler"
};

export default function AvaliarLivro() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const [livro, setLivro] = useState<Livro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  
  const [avaliacao, setAvaliacao] = useState<AvaliacaoForm>({
    nota: 5,
    status: "lido",
    resenha: ""
  });

  // Carregar usuário logado
  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuario');
    if (!usuarioLogado) {
      navigate('/login');
      return;
    }
    setUsuario(JSON.parse(usuarioLogado));
  }, [navigate]);

  // Carregar dados do livro
  useEffect(() => {
    if (!id) return;

    const fetchLivro = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
        const data = await response.json();
        
        if (data.volumeInfo) {
          setLivro({
            idGoogle: data.id,
            titulo: data.volumeInfo.title || "Sem título",
            autores: data.volumeInfo.authors || ["Desconhecido"],
            descricao: data.volumeInfo.description?.replace(/<[^>]+>/g, "") || "Sem descrição",
            imagem: data.volumeInfo.imageLinks?.thumbnail || "",
          });
        } else {
          setError("Livro não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar o livro");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivro();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuario || !livro) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        userId: usuario.id,
        idGoogleLivro: id,
        status: avaliacao.status,
        nota: avaliacao.nota,
        resenha: avaliacao.resenha,
        titulo: livro.titulo,
        autor: livro.autores.join(", "),
        imagem: livro.imagem,
      };

      const response = await fetch("http://localhost:3002/api/resenhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Avaliação enviada com sucesso!");
        navigate(`/livro/${id}`);
      } else {
        const errorData = await response.json();
        alert("Erro ao enviar avaliação: " + (errorData?.erro || "Erro desconhecido"));
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 10 }).map((_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 ${
          interactive ? 'cursor-pointer' : ''
        } ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={interactive ? () => setAvaliacao(prev => ({ ...prev, nota: i + 1 })) : undefined}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3A4257]"></div>
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
      
      <main className="flex-1 py-16 px-8 md:px-12 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Avaliar Livro
              </h1>
              <p className="text-lg text-gray-600">
                Compartilhe sua opinião sobre este livro com outros leitores
              </p>
            </div>

            {/* Informações do Livro */}
            <div className="flex flex-col lg:flex-row gap-8 mb-10 p-6 bg-gray-50 rounded-lg">
              <div className="lg:w-1/4">
                <BookCard 
                  type="medium" 
                  className="w-full h-64 mx-auto" 
                  imageUrl={livro.imagem}
                  altText={livro.titulo}
                />
              </div>
              <div className="lg:w-3/4">
                <h2 className="text-2xl font-bold mb-3">{livro.titulo}</h2>
                <p className="text-lg text-gray-600 mb-4">
                  {livro.autores.join(", ")}
                </p>
                <p className="text-gray-700 leading-relaxed line-clamp-4">
                  {livro.descricao}
                </p>
              </div>
            </div>

            {/* Formulário de Avaliação */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Status de Leitura */}
              <div>
                <label className="block text-xl font-semibold mb-4">
                  Status de Leitura
                </label>
                <Select 
                  value={avaliacao.status} 
                  onValueChange={(value) => setAvaliacao(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full h-12 text-lg">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-lg">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nota */}
              <div>
                <label className="block text-xl font-semibold mb-4">
                  Sua Nota (1 a 10)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {renderStars(avaliacao.nota, true)}
                  </div>
                  <span className="text-2xl font-bold text-[#3A4257]">
                    {avaliacao.nota}/10
                  </span>
                </div>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={avaliacao.nota}
                  onChange={(e) => setAvaliacao(prev => ({ ...prev, nota: Number(e.target.value) }))}
                  className="mt-4 w-full"
                />
              </div>

              {/* Resenha/Crítica */}
              <div>
                <label className="block text-xl font-semibold mb-4">
                  Sua Crítica/Resenha
                </label>
                <Textarea
                  value={avaliacao.resenha}
                  onChange={(e) => setAvaliacao(prev => ({ ...prev, resenha: e.target.value }))}
                  placeholder="Escreva sua opinião sobre o livro... O que você achou da história? Dos personagens? Do estilo do autor? Recomendaria para outros leitores?"
                  rows={8}
                  className="text-lg resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Mínimo 50 caracteres ({avaliacao.resenha.length}/50)
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-6 justify-center pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/livro/${id}`)}
                  className="px-8 py-3 text-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || avaliacao.resenha.length < 50}
                  className="bg-[#3A4257] text-white hover:bg-[#2A3142] px-8 py-3 text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Publicar Avaliação'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 