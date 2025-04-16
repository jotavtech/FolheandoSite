import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
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

  const handleChangeCadastro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormCadastro({ ...formCadastro, [e.target.name]: e.target.value });
  };

  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormLogin({ ...formLogin, [e.target.name]: e.target.value });
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formCadastro.senha !== formCadastro.confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/cadastro", {
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
        alert("Usuário cadastrado com sucesso!");
        setFormCadastro({
          username: "",
          nome: "",
          email: "",
          senha: "",
          confirmPassword: ""
        });
        window.location.href = "login.html"; // ou usar navegação via Wouter se preferir
      } else {
        const erro = await resposta.json();
        alert("Erro ao cadastrar: " + (erro?.erro || "Desconhecido"));
      }
    } catch (err) {
      alert("Erro de conexão com o servidor");
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resposta = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formLogin)
      });

      if (resposta.ok) {
        const usuario = await resposta.json();
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('userId', usuario.id); // ESSENCIAL
        window.location.href = "/";
      } else {
        alert('Login inválido.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />

      <main className="flex-1 py-10 px-6 md:px-8 lg:px-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Entre com seu e-mail e senha para acessar sua conta.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formLogin.email}
                      onChange={handleChangeLogin}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <Link href="/recuperar-senha">
                        <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                          Esqueceu a senha?
                        </span>
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="senha"
                      type="password"
                      placeholder="********"
                      value={formLogin.senha}
                      onChange={handleChangeLogin}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#3A4257] hover:bg-[#2a3044]">
                    Entrar
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Cadastro */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para criar sua conta.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form className="space-y-4" onSubmit={handleCadastro}>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Nome de Usuário</Label>
                    <Input
                      id="register-username"
                      name="username"
                      placeholder="joaosilva123"
                      value={formCadastro.username}
                      onChange={handleChangeCadastro}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-nome">Nome Completo</Label>
                    <Input
                      id="register-nome"
                      name="nome"
                      placeholder="João Silva"
                      value={formCadastro.nome}
                      onChange={handleChangeCadastro}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formCadastro.email}
                      onChange={handleChangeCadastro}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      name="senha"
                      type="password"
                      placeholder="********"
                      value={formCadastro.senha}
                      onChange={handleChangeCadastro}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                    <Input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={formCadastro.confirmPassword}
                      onChange={handleChangeCadastro}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#3A4257] hover:bg-[#2a3044]">
                    Cadastrar
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
