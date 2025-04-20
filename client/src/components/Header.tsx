import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, BookOpen, BookPlus, Star, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Defina a interface do usuário
interface Usuario {
  id: string;
  nome: string;
  foto: string | null;
}

const Header = () => {
  const [navItems] = useState([
    { label: "Início", href: "/" },
    { label: "Livros", href: "/livros", icon: BookOpen },
    { label: "Cadastrar Livro", href: "/cadastro-livro", icon: BookPlus },
    { label: "Avaliações", href: "/avaliacoes", icon: Star },
  ]);
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Carregar dados do usuário
    const carregarUsuario = async () => {
      try {
        const res = await fetch(`http://localhost:3000/usuarios/${userId}`);
        if (res.ok) {
          const user = await res.json();
          setUsuario(user);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarUsuario();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <div>
      <header className="w-full bg-[#F5F5F0] py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Folheando</h1>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span className="text-gray-800 hover:text-gray-600 cursor-pointer">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center space-x-3">
          {!isLoading && (
            usuario ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <img 
                      src={usuario.foto || 'https://via.placeholder.com/40'} 
                      alt="Foto do usuário" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium hidden sm:inline">{usuario.nome}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      Meu Perfil
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-[#3A4257] text-white px-4 py-1 rounded-sm text-sm h-8">
                  Entrar
                </Button>
              </Link>
            )
          )}
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col mt-6">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <span className="text-gray-800 hover:text-gray-600 block py-2 cursor-pointer">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                  {usuario && (
                    <li>
                      <Link href="/profile">
                        <span className="text-gray-800 hover:text-gray-600 block py-2 cursor-pointer">Meu Perfil</span>
                      </Link>
                    </li>
                  )}
                  {usuario && (
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="text-gray-800 hover:text-gray-600 block py-2 cursor-pointer w-full text-left"
                      >
                        Sair
                      </button>
                    </li>
                  )}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="h-1 w-full bg-gradient-to-r from-black to-white"></div>
    </div>
  );
};

export default Header;