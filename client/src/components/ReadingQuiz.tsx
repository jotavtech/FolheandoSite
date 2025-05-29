import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen, Heart, Star, Sparkles, Check } from 'lucide-react';
import { usePreferences, UserPreferences } from '@/contexts/PreferencesContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import "@/styles/animations.css";

interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  type: 'multiple' | 'single' | 'scale';
  options: Array<{
    id: string;
    label: string;
    icon?: any;
    description?: string;
  }>;
  field: keyof UserPreferences;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'genres',
    title: '📚 Quais gêneros te encantam?',
    subtitle: 'Escolha todos que despertam sua curiosidade',
    type: 'multiple',
    field: 'genres',
    options: [
      { id: 'fiction', label: 'Ficção', icon: BookOpen, description: 'Histórias imaginárias cativantes' },
      { id: 'mystery', label: 'Mistério/Suspense', icon: '🕵️', description: 'Enigmas para decifrar' },
      { id: 'romance', label: 'Romance', icon: Heart, description: 'Histórias de amor envolventes' },
      { id: 'fantasy', label: 'Fantasia', icon: '🧙‍♂️', description: 'Mundos mágicos e criaturas fantásticas' },
      { id: 'scifi', label: 'Ficção Científica', icon: '🚀', description: 'Futurismo e tecnologia' },
      { id: 'biography', label: 'Biografias', icon: '👤', description: 'Vidas reais inspiradoras' },
      { id: 'selfhelp', label: 'Autoajuda', icon: '💪', description: 'Crescimento pessoal' },
      { id: 'history', label: 'História', icon: '📜', description: 'Eventos e épocas passadas' }
    ]
  },
  {
    id: 'bookLength',
    title: '⏱️ Qual o tamanho ideal do livro?',
    subtitle: 'Considere seu tempo disponível para leitura',
    type: 'single',
    field: 'bookLength',
    options: [
      { id: 'short', label: 'Livros Curtos', description: 'Até 200 páginas - leitura rápida' },
      { id: 'medium', label: 'Livros Médios', description: '200-400 páginas - equilibrio perfeito' },
      { id: 'long', label: 'Livros Longos', description: '400+ páginas - imersão profunda' },
      { id: 'any', label: 'Não importa', description: 'O que importa é uma boa história' }
    ]
  },
  {
    id: 'readingFrequency',
    title: '📅 Com que frequência você lê?',
    subtitle: 'Isso nos ajuda a recomendar o ritmo ideal',
    type: 'single',
    field: 'readingFrequency',
    options: [
      { id: 'daily', label: 'Diariamente', description: 'Leio todos os dias' },
      { id: 'weekly', label: 'Algumas vezes por semana', description: 'Leio regularmente' },
      { id: 'monthly', label: 'Algumas vezes por mês', description: 'Leio quando posso' },
      { id: 'occasionally', label: 'Ocasionalmente', description: 'Leio de vez em quando' }
    ]
  },
  {
    id: 'favoriteThemes',
    title: '🎭 Que temas despertam seu interesse?',
    subtitle: 'Múltiplas escolhas permitidas',
    type: 'multiple',
    field: 'favoriteThemes',
    options: [
      { id: 'adventure', label: 'Aventura', description: 'Jornadas épicas e descobertas' },
      { id: 'psychology', label: 'Psicologia', description: 'Mente humana e comportamento' },
      { id: 'philosophy', label: 'Filosofia', description: 'Reflexões profundas sobre a vida' },
      { id: 'technology', label: 'Tecnologia', description: 'Inovação e futuro digital' },
      { id: 'nature', label: 'Natureza', description: 'Meio ambiente e vida selvagem' },
      { id: 'culture', label: 'Cultura', description: 'Tradições e sociedades' },
      { id: 'spirituality', label: 'Espiritualidade', description: 'Crescimento espiritual' },
      { id: 'business', label: 'Negócios', description: 'Empreendedorismo e sucesso' }
    ]
  },
  {
    id: 'moodPreference',
    title: '🎭 Que tipo de atmosfera prefere?',
    subtitle: 'Escolha o clima que mais combina com você',
    type: 'single',
    field: 'moodPreference',
    options: [
      { id: 'light', label: 'Leve e Divertida', description: 'Histórias alegres e descontraídas' },
      { id: 'serious', label: 'Séria e Profunda', description: 'Reflexões e temas complexos' },
      { id: 'mixed', label: 'Varia com o humor', description: 'Gosto de alternar entre os dois' }
    ]
  }
];

export default function ReadingQuiz({ onComplete }: { onComplete?: () => void }) {
  const [, navigate] = useLocation();
  const { setPreferences } = usePreferences();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserPreferences>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  const handleAnswer = (value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [question.field]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      completeQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const completeQuiz = async () => {
    setIsCompleting(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalPreferences: UserPreferences = {
      genres: (answers.genres as string[]) || [],
      authorTypes: [],
      bookLength: (answers.bookLength as UserPreferences['bookLength']) || 'any',
      readingFrequency: (answers.readingFrequency as UserPreferences['readingFrequency']) || 'weekly',
      favoriteThemes: (answers.favoriteThemes as string[]) || [],
      languagePreference: 'portuguese',
      moodPreference: (answers.moodPreference as UserPreferences['moodPreference']) || 'mixed'
    };

    setPreferences(finalPreferences);
    setShowResults(true);
    
    setTimeout(() => {
      onComplete?.();
      navigate('/livros-recomendados');
    }, 3000);
  };

  const isAnswered = () => {
    const answer = answers[question.field];
    if (question.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const getSelectedValues = (): string[] => {
    const answer = answers[question.field];
    if (question.type === 'multiple') {
      return Array.isArray(answer) ? answer : [];
    }
    return answer ? [answer as string] : [];
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center bg-white">
          <CardContent className="p-8">
            <LoadingSpinner 
              size="lg" 
              variant="books" 
              message="Analisando suas preferências..."
              subMessage="Criando recomendações personalizadas"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center bg-white animate-fade-in-up">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#3A4257]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-[#3A4257]" />
              </div>
              <h2 className="text-2xl font-bold text-[#3A4257] mb-2">
                Perfeito! 🎉
              </h2>
              <p className="text-gray-600">
                Suas preferências foram salvas com sucesso. Redirecionando para suas recomendações...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[#3A4257]" />
            <h1 className="text-3xl font-bold text-[#3A4257]">
              Descubra seus gostos literários
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">
            Algumas perguntas rápidas para personalizar suas recomendações
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 animate-fade-in-up delay-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Pergunta {currentQuestion + 1} de {quizQuestions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% completo
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className={`bg-white transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} animate-fade-in-up delay-300`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-[#3A4257] mb-2">
              {question.title}
            </CardTitle>
            <p className="text-gray-600">
              {question.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = getSelectedValues().includes(option.id);
              
              return (
                <div
                  key={option.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up group ${
                    isSelected 
                      ? 'border-[#3A4257] bg-[#3A4257] bg-opacity-10' 
                      : 'border-gray-200 hover:border-[#3A4257]'
                  }`}
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                  onClick={() => {
                    if (question.type === 'multiple') {
                      const current = getSelectedValues();
                      const newSelection = isSelected 
                        ? current.filter(v => v !== option.id)
                        : [...current, option.id];
                      handleAnswer(newSelection);
                    } else {
                      handleAnswer(option.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? 'border-[#3A4257] bg-[#3A4257]' 
                        : 'border-gray-300 group-hover:border-[#3A4257]'
                    }`}>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {typeof option.icon === 'string' ? (
                          <span className="text-xl">{option.icon}</span>
                        ) : option.icon && (
                          <option.icon className="w-5 h-5 text-[#3A4257]" />
                        )}
                        <h3 className={`font-semibold transition-colors ${
                          isSelected ? 'text-[#3A4257]' : 'text-gray-900 group-hover:text-[#3A4257]'
                        }`}>
                          {option.label}
                        </h3>
                      </div>
                      {option.description && (
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8 animate-fade-in-up delay-500">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={!isAnswered()}
            className="flex items-center gap-2 bg-[#3A4257] text-white hover:bg-[#2A3142]"
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Finalizar' : 'Próximo'}
            {currentQuestion === quizQuestions.length - 1 ? (
              <Star className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 