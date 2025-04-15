import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import { Menu, BookOpen, BookPlus, Star } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [navItems] = useState([
    { label: "Início", href: "/" },
    { label: "Livros", href: "/livros", icon: BookOpen },
    { label: "Cadastrar Livro", href: "/cadastro-livro", icon: BookPlus },
    { label: "Avaliações", href: "/avaliacoes", icon: Star },
  ]);

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
          <Link href="/login">
            <Button className="bg-[#3A4257] text-white px-4 py-1 rounded-sm text-sm h-8">
              Entrar
            </Button>
          </Link>
          
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