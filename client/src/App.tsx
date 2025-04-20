import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CadastroLivro from "@/pages/CadastroLivro";
import Livros from "@/pages/Livros";
import Avaliacoes from "@/pages/Avaliacoes";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile"; // Importe o componente Profile

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cadastro-livro" component={CadastroLivro} />
      <Route path="/livros" component={Livros} />
      <Route path="/avaliacoes" component={Avaliacoes} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} /> {/* Adicione a rota para o perfil */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;