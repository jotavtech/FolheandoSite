import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, BookOpen, BookPlus, Star, LogOut, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useUser, useUserActions } from "@/contexts/UserContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { ChevronDown } from "lucide-react";

// Defina a interface do usuário
interface Usuario {
  id: string;
  nome: string;
  foto: string | null;
}

const Header = () => {
  const [, navigate] = useLocation();
  const user = useUser();
  const { logout } = useUserActions();
  const { hasCompletedQuiz } = usePreferences();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout(); // Usar a função do contexto
  };

  return (
    <div>
      <header className="bg-white shadow-sm py-6 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-3xl md:text-4xl font-bold text-[#3A4257] cursor-pointer hover:text-[#2A3142] transition-colors"
              onClick={() => navigate('/')}
            >
              Folheando
            </h1>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-lg font-medium">
                Início
              </Link>
              <Link href="/livros" className="text-gray-600 hover:text-gray-900 text-lg font-medium">
                Livros
              </Link>
              {hasCompletedQuiz && (
                <Link href="/livros-recomendados" className="text-gray-600 hover:text-gray-900 text-lg font-medium flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Recomendados
                </Link>
              )}
              <Link href="/avaliacoes" className="text-gray-600 hover:text-gray-900 text-lg font-medium">
                Avaliações
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 text-lg"
                >
                  <span>Olá, {user.name}</span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Meu Perfil
                    </button>
                    {!hasCompletedQuiz && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/quiz-preferencias');
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Quiz de Preferências
                      </button>
                    )}
                    <hr className="border-gray-200 my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-[#3A4257] text-white px-6 py-3 rounded-md hover:bg-[#2A3142] text-lg">
                Entrar
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="/" className="text-gray-700 hover:text-gray-900 text-lg font-medium">
                    Início
                  </Link>
                  <Link href="/livros" className="text-gray-700 hover:text-gray-900 text-lg font-medium">
                    Livros
                  </Link>
                  {hasCompletedQuiz && (
                    <Link href="/livros-recomendados" className="text-gray-700 hover:text-gray-900 text-lg font-medium flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Recomendados
                    </Link>
                  )}
                  <Link href="/avaliacoes" className="text-gray-700 hover:text-gray-900 text-lg font-medium">
                    Avaliações
                  </Link>
                  {user && (
                    <>
                      <hr className="border-gray-200" />
                      <Link href="/profile" className="text-gray-700 hover:text-gray-900 text-lg font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      {!hasCompletedQuiz && (
                        <Link href="/quiz-preferencias" className="text-gray-700 hover:text-gray-900 text-lg font-medium flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Quiz de Preferências
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-gray-700 hover:text-gray-900 text-lg font-medium text-left flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Barra degradê */}
      <div className="h-2 w-full bg-gradient-to-r from-black to-white"></div>
    </div>
  );
};

export default Header;