import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CadastroLivro from "@/pages/CadastroLivro";
import Livros from "@/pages/Livros";
import LivroDetalhes from "@/pages/LivroDetalhes";
import LivrosRecomendados from "@/pages/LivrosRecomendados";
import Avaliacoes from "@/pages/Avaliacoes";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import AvaliarLivro from "@/pages/AvaliarLivro";
import QuizPreferencias from "@/pages/QuizPreferencias";

// Import CSS files
import "@/styles/animations.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cadastro-livro" component={CadastroLivro} />
      <Route path="/livros" component={Livros} />
      <Route path="/livro/:id" component={LivroDetalhes} />
      <Route path="/livros-recomendados" component={LivrosRecomendados} />
      <Route path="/avaliar-livro/:id" component={AvaliarLivro} />
      <Route path="/quiz-preferencias" component={QuizPreferencias} />
      <Route path="/avaliacoes" component={Avaliacoes} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <PreferencesProvider>
          <Router />
          <Toaster />
        </PreferencesProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
