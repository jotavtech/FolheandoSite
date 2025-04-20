import { useState, useEffect, ChangeEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { SECTION_TITLES } from "@/lib/constants";

// Interfaces para tipagem
interface Usuario {
  id: string;
  nome: string;
  bio: string;
  foto: string | null;
}

interface Livro {
  id: string;
  titulo: string;
  autor: string;
}

interface Resenha {
  id: string;
  livro: Livro;
  nota: number | null;
  resenha: string | null;
  status: string;
}

interface ItemLeitura {
  id: string;
  livro: Livro;
  status?: string;
}

// Estender SECTION_TITLES se necessário
interface SectionTitlesExtended {
  welcome: string;
  discover: string;
  questioned: string;
  registerFavorite: string;
  writeFavorite: string;
  registerBook: string;
  registerByContent: string;
  principle: string;
  topReviews: string;
  writeAnalysis: string;
  // Adicionar propriedades ausentes
  wishlist: string;
  userReviews: string;
  [key: string]: string;
}

const Profile = () => {
  const [, setLocation] = useLocation();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [listaDesejos, setListaDesejos] = useState<ItemLeitura[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cast para o tipo estendido (apenas para evitar erros TypeScript)
  const extendedSectionTitles = SECTION_TITLES as SectionTitlesExtended;

  useEffect(() => {
    // Verificar se o usuário está logado
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Usuário não está logado.");
      setLocation('/login');
      return;
    }

    // Carregar dados do usuário
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          carregarPerfil(userId),
          carregarResenhas(userId),
          carregarListaDesejos(userId)
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Ocorreu um erro ao carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [setLocation]);

  const carregarPerfil = async (userId: string): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${userId}`);
      if (!res.ok) throw new Error("Falha ao carregar perfil");
      const user: Usuario = await res.json();
      setUsuario(user);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      throw error;
    }
  };

  const carregarResenhas = async (userId: string): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:3000/resenhas-usuario/${userId}`);
      if (!res.ok) throw new Error("Falha ao carregar resenhas");
      const data: Resenha[] = await res.json();
      const resenhasValidas = data.filter((r: Resenha) => r.status === 'lido' || r.status === 'lendo');
      setResenhas(resenhasValidas);
    } catch (error) {
      console.error("Erro ao carregar resenhas:", error);
      throw error;
    }
  };

  const carregarListaDesejos = async (userId: string): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:3000/leitura/usuario/${userId}`);
      if (!res.ok) throw new Error("Falha ao carregar lista de desejos");
      const data: ItemLeitura[] = await res.json();
      setListaDesejos(data);
    } catch (error) {
      console.error("Erro ao carregar lista de desejos:", error);
      throw error;
    }
  };

  const handleEditarPerfil = async (): Promise<void> => {
    if (!usuario) return;
    
    const novoNome = prompt("Editar nome:", usuario.nome || '');
    if (novoNome === null || novoNome.trim() === '') return;

    const novaBio = prompt("Editar bio:", usuario.bio || '');
    if (novaBio === null) return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error("Usuário não está logado");
      
      const res = await fetch(`http://localhost:3000/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome.trim(), bio: novaBio.trim() })
      });

      if (!res.ok) throw new Error("Falha ao atualizar perfil");
      
      // Recarregar perfil com dados atualizados
      await carregarPerfil(userId);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar perfil:", error);
      alert("Ocorreu um erro ao atualizar o perfil.");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error("Usuário não está logado");
      
      const formData = new FormData();
      formData.append('foto', arquivo);

      const res = await fetch(`http://localhost:3000/upload-foto/${userId}`, {
        method: 'POST',
        body: formData
      });

      const dados = await res.json();
      if (res.ok) {
        alert('Foto atualizada!');
        // Atualize o estado do usuário de maneira segura para TypeScript
        setUsuario(prev => prev ? {...prev, foto: dados.foto} : null);
      } else {
        throw new Error(dados.message || "Erro ao enviar foto");
      }
    } catch (error) {
      console.error("Erro ao enviar foto:", error);
      alert("Ocorreu um erro ao atualizar a foto.");
    }
  };

  const handleSair = (): void => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F0]">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />

      {/* Profile Info Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#F5F5F0]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-32 h-32">
            <img 
              src={usuario?.foto || 'https://via.placeholder.com/150'} 
              alt="Foto de perfil" 
              className="w-32 h-32 rounded-full object-cover"
            />
            <label htmlFor="inputFoto" className="cursor-pointer absolute bottom-0 right-0 bg-[#3A4257] text-white p-2 rounded-full">
              <span className="text-xs">Editar</span>
            </label>
            <input 
              type="file" 
              id="inputFoto" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-medium mb-2">{usuario?.nome || 'Usuário'}</h2>
            <p className="text-gray-700 mb-4">{usuario?.bio || 'Sem biografia'}</p>
            <div className="flex gap-4">
              <Button 
                className="bg-[#3A4257] text-white px-6 py-2 text-sm"
                onClick={handleEditarPerfil}
              >
                Editar Perfil
              </Button>
              <Button 
                className="bg-[#6B7F9E] text-white px-6 py-2 text-sm"
                onClick={handleSair}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* User's Reading List Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#222222] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{extendedSectionTitles.wishlist || 'Quero Ler'}</h2>
            <Link href="/busca">
              <Button className="bg-[#4F5D7E] text-white">
                Buscar Livros
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listaDesejos.length > 0 ? (
              listaDesejos.map((item) => (
                <Link key={item.livro.id} href={`/livro/${item.livro.id}`}>
                  <div className="bg-[#F5F5F0] text-black p-4 rounded cursor-pointer hover:shadow-lg transition-shadow">
                    <p className="font-semibold">{item.livro.titulo}</p>
                    <p className="text-sm text-gray-600">{item.livro.autor || 'Autor desconhecido'}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-4">
                <p>Nenhum livro marcado como "Quero ler".</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* User's Reviews Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#6B7F9E] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{extendedSectionTitles.userReviews || 'Minhas Avaliações'}</h2>
            <Link href="/avaliacoes">
              <Button className="bg-[#4F5D7E] text-white">
                Ver Todas
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resenhas.length > 0 ? (
              resenhas.map((resenha) => (
                <div key={resenha.id} className="bg-[#F5F5F0] text-black p-4 rounded">
                  <p className="font-semibold">{resenha.livro.titulo}</p>
                  <div className="flex items-center my-1">
                    <span className="text-sm font-medium mr-2">Nota:</span>
                    <span className="text-amber-500">{resenha.nota || 'N/A'} ★</span>
                  </div>
                  <p className="text-sm text-gray-600">{resenha.resenha || '(sem texto)'}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-4">
                <p>Nenhuma resenha disponível.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;