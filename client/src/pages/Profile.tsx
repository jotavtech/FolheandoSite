import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Edit, Camera, Calendar, TrendingUp } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  bio?: string;
  foto?: string;
  dataEntrada?: string;
}

interface Avaliacao {
  id: number;
  livroId: string;
  titulo: string;
  autor: string;
  imagem: string;
  nota: number;
  status: string;
  resenha: string;
  dataAvaliacao: string;
}

interface EstatisticasUsuario {
  totalAvaliacoes: number;
  livrosLidos: number;
  livrosLendo: number;
  livrosDesejados: number;
  notaMedia: number;
}

const statusMap = {
  "lido": { label: "Lido", color: "bg-green-100 text-green-800" },
  "lendo": { label: "Lendo", color: "bg-blue-100 text-blue-800" },
  "quero_ler": { label: "Quero ler", color: "bg-yellow-100 text-yellow-800" }
};

export default function Profile() {
  const [, navigate] = useLocation();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasUsuario>({
    totalAvaliacoes: 0,
    livrosLidos: 0,
    livrosLendo: 0,
    livrosDesejados: 0,
    notaMedia: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState("");

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuario');
    if (!usuarioLogado) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(usuarioLogado);
    setUsuario(userData);
    setEditedBio(userData.bio || "");
    
    carregarDadosUsuario(userData.id);
  }, [navigate]);

  const carregarDadosUsuario = async (userId: string) => {
    setIsLoading(true);
    try {
      // Carregar avaliações do usuário
      await carregarAvaliacoes(userId);
      // Carregar estatísticas
      await carregarEstatisticas(userId);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

  const carregarAvaliacoes = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/usuario/${userId}/avaliacoes`);
      
      if (!response.ok) {
        throw new Error('API não disponível');
      }
      
      const data = await response.json();
      setAvaliacoes(data);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      setAvaliacoes([]);
    }
  };

  const carregarEstatisticas = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/usuario/${userId}/estatisticas`);
      
      if (!response.ok) {
        throw new Error('API não disponível');
      }
      
      const data = await response.json();
      setEstatisticas(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setEstatisticas({
        totalAvaliacoes: 0,
        livrosLidos: 0,
        livrosLendo: 0,
        livrosDesejados: 0,
        notaMedia: 0
      });
    }
  };

  const handleSalvarBio = async () => {
    if (!usuario) return;
    
    try {
      const response = await fetch(`http://localhost:3002/api/usuario/${usuario.id}/bio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editedBio })
      });

      if (response.ok) {
        setUsuario(prev => prev ? { ...prev, bio: editedBio } : null);
        
        // Atualizar localStorage
        const updatedUser = { ...usuario, bio: editedBio };
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        alert("Bio atualizada com sucesso!");
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      console.error("Erro ao salvar bio:", error);
      alert("Erro ao salvar a bio. Tente novamente.");
    }
  };

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(nota / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3A4257] mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Carregando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar perfil</h1>
            <Button onClick={() => navigate('/login')} className="bg-[#3A4257] text-white">
              Fazer Login
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
        <div className="max-w-7xl mx-auto">
          
          {/* Header do Perfil */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Avatar e Informações Básicas */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#3A4257] to-[#6B7F9E] p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      {usuario.foto ? (
                        <img 
                          src={usuario.foto} 
                          alt={usuario.nome}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-[#3A4257]">
                          {usuario.nome.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-[#3A4257] text-white rounded-full shadow-lg hover:bg-[#2A3142] transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-center md:text-left mt-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {usuario.nome}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">{usuario.email}</p>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Membro desde Janeiro 2024</span>
                  </div>
                </div>
              </div>

              {/* Bio e Ações */}
              <div className="flex-1">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold">Sobre</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        placeholder="Conte um pouco sobre você e seus gostos literários..."
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSalvarBio} size="sm" className="bg-[#3A4257] text-white">
                          Salvar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsEditing(false);
                            setEditedBio(usuario.bio || "");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {usuario.bio || "Nenhuma biografia adicionada ainda. Clique no ícone de edição para adicionar informações sobre você!"}
                    </p>
                  )}
          </div>
          
                <div className="flex gap-3">
              <Button 
                    onClick={() => navigate('/livros')}
                    className="bg-[#3A4257] text-white px-6 py-2"
              >
                    Explorar Livros
              </Button>
              <Button 
                    variant="outline"
                    onClick={handleLogout}
                    className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-2"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-[#3A4257] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#3A4257]">{estatisticas.totalAvaliacoes}</div>
                <p className="text-sm text-gray-600">Avaliações</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{estatisticas.livrosLidos}</div>
                <p className="text-sm text-gray-600">Lidos</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{estatisticas.livrosLendo}</div>
                <p className="text-sm text-gray-600">Lendo</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{estatisticas.livrosDesejados}</div>
                <p className="text-sm text-gray-600">Desejados</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2 fill-current" />
                <div className="text-2xl font-bold text-yellow-600">{estatisticas.notaMedia.toFixed(1)}</div>
                <p className="text-sm text-gray-600">Nota Média</p>
              </CardContent>
            </Card>
          </div>

          {/* Últimas Avaliações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Suas Últimas Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {avaliacoes.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhuma avaliação ainda
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comece avaliando alguns livros para ver suas resenhas aqui.
                  </p>
                  <Button 
                    onClick={() => navigate('/livros')}
                    className="bg-[#3A4257] text-white"
                  >
                    Explorar Livros
                  </Button>
                  </div>
              ) : (
                <div className="space-y-6">
                  {avaliacoes.map((avaliacao) => (
                    <div key={avaliacao.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <BookCard 
                            type="small"
                            className="w-20 h-28"
                            imageUrl={avaliacao.imagem}
                            altText={avaliacao.titulo}
                          />
              </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg mb-1">{avaliacao.titulo}</h4>
                              <p className="text-gray-600 mb-2">{avaliacao.autor}</p>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex">{renderStars(avaliacao.nota)}</div>
                                <span className="font-medium">{avaliacao.nota}/10</span>
                                <Badge className={statusMap[avaliacao.status as keyof typeof statusMap]?.color}>
                                  {statusMap[avaliacao.status as keyof typeof statusMap]?.label}
                                </Badge>
          </div>
        </div>
                            <span className="text-sm text-gray-500">
                              {new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <p className="text-gray-700 leading-relaxed">
                            {avaliacao.resenha}
                          </p>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/livro/${avaliacao.livroId}`)}
                            >
                              Ver Livro
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/avaliar-livro/${avaliacao.livroId}`)}
                            >
                              Editar Avaliação
              </Button>
                          </div>
          </div>
                  </div>
                </div>
                  ))}
                  
                  {avaliacoes.length > 0 && (
                    <div className="text-center pt-6">
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/avaliacoes')}
                        className="border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white"
                      >
                        Ver Todas as Avaliações
                      </Button>
              </div>
            )}
          </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
}