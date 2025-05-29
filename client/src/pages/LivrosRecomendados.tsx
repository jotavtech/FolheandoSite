import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, BookOpen, RefreshCw, Heart, Star, Filter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePreferences } from "@/contexts/PreferencesContext";
import "@/styles/animations.css";

interface Book {
  idGoogle: string;
  titulo: string;
  autores: string[];
  descricao: string;
  imagem: string;
  categoria?: string;
  pageCount?: number;
}

const genreMapping = {
  fiction: ['fiction', 'novel', 'literatura'],
  mystery: ['mystery', 'suspense', 'thriller', 'crime'],
  romance: ['romance', 'love', 'amor'],
  fantasy: ['fantasy', 'fantasia', 'magic'],
  scifi: ['science fiction', 'sci-fi', 'ficção científica', 'technology'],
  biography: ['biography', 'biografia', 'memoir'],
  selfhelp: ['self help', 'autoajuda', 'self-improvement'],
  history: ['history', 'história', 'historical']
};

const themeMapping = {
  adventure: ['adventure', 'aventura', 'journey', 'exploration'],
  psychology: ['psychology', 'psicologia', 'mind', 'behavior'],
  philosophy: ['philosophy', 'filosofia', 'wisdom', 'ethics'],
  technology: ['technology', 'tecnologia', 'innovation', 'digital'],
  nature: ['nature', 'natureza', 'environment', 'wildlife'],
  culture: ['culture', 'cultura', 'society', 'tradition'],
  spirituality: ['spirituality', 'espiritualidade', 'meditation'],
  business: ['business', 'negócios', 'entrepreneur', 'success']
};

export default function LivrosRecomendados() {
  const [, navigate] = useLocation();
  const { preferences, hasCompletedQuiz } = usePreferences();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!hasCompletedQuiz) {
      navigate('/quiz-preferencias');
      return;
    }
    fetchRecommendedBooks();
  }, [hasCompletedQuiz, navigate]);

  const buildSearchQuery = () => {
    if (!preferences) return 'livros populares';

    const queries: string[] = [];

    // Adicionar gêneros preferidos
    preferences.genres.forEach(genre => {
      const terms = genreMapping[genre as keyof typeof genreMapping];
      if (terms) {
        queries.push(terms[0]);
      }
    });

    // Adicionar temas favoritos
    preferences.favoriteThemes.forEach(theme => {
      const terms = themeMapping[theme as keyof typeof themeMapping];
      if (terms) {
        queries.push(terms[0]);
      }
    });

    // Se não tiver preferências específicas, usar busca padrão
    if (queries.length === 0) {
      return 'best books literatura brasileira';
    }

    return queries.slice(0, 3).join(' OR '); // Limitar a 3 termos para evitar queries muito complexas
  };

  const fetchRecommendedBooks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const query = buildSearchQuery();
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=20&orderBy=relevance&printType=books&langRestrict=pt`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar recomendações');
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        // Fallback para busca mais ampla
        const fallbackUrl = `https://www.googleapis.com/books/v1/volumes?q=bestsellers+literatura&maxResults=20&orderBy=relevance&printType=books&langRestrict=pt`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.items) {
          setBooks(transformBooks(fallbackData.items));
        } else {
          setError("Não foi possível carregar recomendações no momento.");
        }
        return;
      }

      const transformedBooks = transformBooks(data.items);
      const filteredBooks = filterBooksByPreferences(transformedBooks);
      
      setBooks(filteredBooks);
      
    } catch (err) {
      console.error("Erro ao buscar livros recomendados:", err);
      setError("Erro ao carregar recomendações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const transformBooks = (items: any[]): Book[] => {
    return items.map((item: any) => ({
      idGoogle: item.id,
      titulo: item.volumeInfo.title || "Título não disponível",
      autores: item.volumeInfo.authors || ["Autor desconhecido"],
      descricao: item.volumeInfo.description?.replace(/<[^>]+>/g, "") || "Descrição não disponível",
      imagem: item.volumeInfo.imageLinks?.thumbnail || 
             item.volumeInfo.imageLinks?.smallThumbnail || 
             "https://via.placeholder.com/128x192?text=Sem+Capa",
      categoria: item.volumeInfo.categories?.[0] || "",
      pageCount: item.volumeInfo.pageCount || 0
    }));
  };

  const filterBooksByPreferences = (books: Book[]): Book[] => {
    if (!preferences) return books;

    return books.filter(book => {
      // Filtrar por tamanho do livro
      if (preferences.bookLength !== 'any' && book.pageCount && book.pageCount > 0) {
        const pageCount = book.pageCount;
        switch (preferences.bookLength) {
          case 'short':
            if (pageCount > 200) return false;
            break;
          case 'medium':
            if (pageCount < 200 || pageCount > 400) return false;
            break;
          case 'long':
            if (pageCount < 400) return false;
            break;
        }
      }

      return true;
    }).slice(0, 16); // Limitar a 16 livros
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await fetchRecommendedBooks();
    setRefreshing(false);
  };

  const getPreferencesSummary = () => {
    if (!preferences) return '';

    const parts: string[] = [];
    
    if (preferences.genres.length > 0) {
      parts.push(`Gêneros: ${preferences.genres.join(', ')}`);
    }
    
    if (preferences.favoriteThemes.length > 0) {
      parts.push(`Temas: ${preferences.favoriteThemes.join(', ')}`);
    }
    
    if (preferences.bookLength !== 'any') {
      const lengthLabels = {
        short: 'Livros curtos',
        medium: 'Livros médios', 
        long: 'Livros longos'
      };
      parts.push(`Tamanho: ${lengthLabels[preferences.bookLength]}`);
    }

    return parts.join(' • ');
  };

  if (!hasCompletedQuiz) {
    return null; // Será redirecionado
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Header />
      
      <main className="py-16 px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Header com preferências */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#3A4257]">
                Seus Livros Recomendados
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse delay-300" />
            </div>
            
            <p className="text-gray-600 text-xl mb-6">
              Selecionados especialmente para você com base em suas preferências
            </p>
            
            {/* Resumo das preferências */}
            <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-[#3A4257]" />
                <span className="font-semibold text-[#3A4257]">Suas Preferências:</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {getPreferencesSummary()}
              </p>
              <div className="flex gap-3 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/quiz-preferencias')}
                  className="text-sm"
                >
                  Refazer Quiz
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshRecommendations}
                  disabled={refreshing}
                  className="text-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <LoadingSpinner 
              size="lg" 
              variant="books" 
              message="Encontrando livros perfeitos para você..."
              subMessage="Analisando suas preferências e buscando as melhores opções"
              className="py-20"
            />
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-red-800 mb-2">Oops! Algo deu errado</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button 
                  onClick={fetchRecommendedBooks} 
                  className="bg-red-600 text-white hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {/* Grid de Livros Recomendados */}
          {!isLoading && !error && books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in-up delay-300">
              {books.map((book, index) => (
                <div
                  key={book.idGoogle}
                  className="group cursor-pointer transition-all duration-500 transform hover:scale-105 hover-lift"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/livro/${book.idGoogle}`)}
                >
                  <Card className="bg-white hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                    {/* Badge de Recomendação */}
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Recomendado
                        </Badge>
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <BookCard 
                          type="medium" 
                          className="w-full h-64 transition-transform duration-500 group-hover:scale-110" 
                          imageUrl={book.imagem}
                          altText={book.titulo}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <span className="text-white font-medium text-sm">Ver Detalhes</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#3A4257] transition-colors duration-300 text-[#3A4257]">
                        {book.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                        {book.autores.join(", ")}
                      </p>
                      
                      {book.categoria && (
                        <Badge variant="outline" className="mb-3 w-fit text-xs">
                          {book.categoria}
                        </Badge>
                      )}
                      
                      <p className="text-gray-500 text-xs line-clamp-3 flex-1 mb-4">
                        {book.descricao}
                      </p>
                      
                      {book.pageCount && book.pageCount > 0 && (
                        <p className="text-gray-500 text-xs mb-4">
                          📖 {book.pageCount} páginas
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-[#3A4257] text-[#3A4257] hover:bg-[#3A4257] hover:text-white transition-all duration-300 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/livro/${book.idGoogle}`);
                          }}
                        >
                          Detalhes
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-[#3A4257] text-white hover:bg-[#2A3142] transition-all duration-300 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/avaliar-livro/${book.idGoogle}`);
                          }}
                        >
                          Avaliar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && books.length === 0 && (
            <div className="text-center py-20 animate-fade-in-up">
              <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                Ainda não encontramos recomendações
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Estamos trabalhando para encontrar livros que combinem perfeitamente com suas preferências.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={fetchRecommendedBooks}
                  className="bg-[#3A4257] text-white hover:bg-[#2A3142]"
                >
                  Tentar novamente
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/livros')}
                >
                  Ver todos os livros
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
      
      <Footer />
    </div>
  );
} 