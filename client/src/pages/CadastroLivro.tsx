import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function CadastroLivro() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      
      <main className="flex-1 py-10 px-6 md:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Cadastrar novo livro</h1>
          
          <Card>
            <CardContent className="p-6">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do livro</Label>
                  <Input id="title" placeholder="Digite o título do livro" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input id="author" placeholder="Digite o nome do autor" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" placeholder="Ex: Romance, Ficção, História..." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Ano de publicação</Label>
                  <Input id="year" placeholder="Ex: 2023" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Escreva uma breve descrição do livro"
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cover">Capa do livro (opcional)</Label>
                  <Input id="cover" type="file" />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-[#3A4257] hover:bg-[#2a3044] text-white"
                >
                  Cadastrar Livro
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};