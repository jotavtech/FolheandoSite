import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Livros() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      
      <main className="flex-1 py-10 px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Catálogo de Livros</h1>
            
            <div className="w-full md:w-auto flex gap-2">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input placeholder="Buscar livros..." className="pl-8" />
              </div>
              <Button className="bg-[#3A4257] text-white">
                Cadastrar Livro
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex flex-col">
                <BookCard type="medium" className="mb-2 h-40" />
                <div className="mt-2">
                  <h3 className="font-medium">Título do Livro</h3>
                  <p className="text-sm text-gray-600">Autor do Livro</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 flex justify-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">&lt;</Button>
              <Button variant="outline" size="sm" className="bg-[#3A4257] text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">&gt;</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};