import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useUserActions } from "@/contexts/UserContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { setUser } = useUserActions();
  
  const [formCadastro, setFormCadastro] = useState({
    username: "",
    nome: "",
    email: "",
    senha: "",
    confirmPassword: ""
  });

  const [formLogin, setFormLogin] = useState({
    email: "",
    senha: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangeCadastro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormCadastro({ ...formCadastro, [e.target.name]: e.target.value });
    setError("");
  };

  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormLogin({ ...formLogin, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formCadastro.senha !== formCadastro.confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3002/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formCadastro.username,
          nome: formCadastro.nome,
          email: formCadastro.email,
          senha: formCadastro.senha
        }),
      });

      if (resposta.ok) {
        alert("Usuário cadastrado com sucesso! Agora você pode fazer login.");
        setFormCadastro({
          username: "",
          nome: "",
          email: "",
          senha: "",
          confirmPassword: ""
        });
      } else {
        const erro = await resposta.json();
        setError("Erro ao cadastrar: " + (erro?.message || erro?.erro || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("Erro ao conectar com a API:", err);
      setError("Erro ao conectar com o servidor. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const resposta = await fetch("http://localhost:3002/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formLogin.email,
          senha: formLogin.senha
        }),
      });

      if (resposta.ok) {
        const usuario = await resposta.json();
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('userId', usuario.id);
        localStorage.setItem('userName', usuario.nome || usuario.name);
        localStorage.setItem('userEmail', usuario.email);
        
        // Atualizar contexto do usuário
        setUser({
          id: usuario.id,
          name: usuario.nome || usuario.name,
          email: usuario.email
        });
        
        // Redirecionar para home
        navigate('/');
      } else {
        const erro = await resposta.json();
        setError(erro?.error || 'Email ou senha incorretos.');
      }
    } catch (err) {
      console.error("Erro ao conectar com a API:", err);
      setError("Erro ao conectar com o servidor. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />

      <main className="flex-1 py-20 px-8 md:px-12 lg:px-16 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
              <TabsTrigger value="login" className="text-lg">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="text-lg">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Mensagem de erro */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-center">{error}</p>
              </div>
            )}

            {/* Login */}
            <TabsContent value="login">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl md:text-4xl mb-4">Bem-vindo de volta!</CardTitle>
                <CardDescription className="text-lg">
                  Entre em sua conta para continuar explorando livros
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label className="block text-lg font-medium mb-3">Email</Label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Digite seu email"
                      value={formLogin.email}
                      onChange={handleChangeLogin}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-medium mb-3">Senha</Label>
                    <Input
                      type="password"
                      name="senha"
                      placeholder="Digite sua senha"
                      value={formLogin.senha}
                      onChange={handleChangeLogin}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#3A4257] text-white hover:bg-[#2A3142] h-12 text-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Entrando...
                      </div>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Cadastro */}
            <TabsContent value="register">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl md:text-4xl mb-4">Criar conta</CardTitle>
                <CardDescription className="text-lg">
                  Junte-se à nossa comunidade de leitores
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleCadastro} className="space-y-6">
                  <div>
                    <Label className="block text-lg font-medium mb-3">Username</Label>
                    <Input
                      type="text"
                      name="username"
                      placeholder="Escolha um username"
                      value={formCadastro.username}
                      onChange={handleChangeCadastro}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-medium mb-3">Nome completo</Label>
                    <Input
                      type="text"
                      name="nome"
                      placeholder="Digite seu nome completo"
                      value={formCadastro.nome}
                      onChange={handleChangeCadastro}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-medium mb-3">Email</Label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Digite seu email"
                      value={formCadastro.email}
                      onChange={handleChangeCadastro}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-medium mb-3">Senha</Label>
                    <Input
                      type="password"
                      name="senha"
                      placeholder="Digite sua senha"
                      value={formCadastro.senha}
                      onChange={handleChangeCadastro}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-medium mb-3">Confirmar senha</Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirme sua senha"
                      value={formCadastro.confirmPassword}
                      onChange={handleChangeCadastro}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#3A4257] text-white hover:bg-[#2A3142] h-12 text-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Criando conta...
                      </div>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
