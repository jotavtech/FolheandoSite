import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Avaliacoes() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      
      <main className="flex-1 py-10 px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Principais Avaliações</h1>
            
            <Button className="bg-[#3A4257] text-white">
              Escrever uma Avaliação
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex gap-4 mb-4">
                  <BookCard type="small" className="w-24 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Título do Livro</h3>
                    <p className="text-sm text-gray-600">Autor do Livro</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ac nisi eget metus 
                    pulvinar elementum. Praesent eget felis sapien. Donec facilisis, nisl in lacinia luctus...
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Avaliado por: Usuário</span>
                    <Button variant="link" size="sm" className="text-[#3A4257] p-0 h-auto">
                      Ler mais
                    </Button>
                  </div>
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