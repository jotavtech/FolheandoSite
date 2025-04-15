import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
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
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Entre com seu e-mail e senha para acessar sua conta.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
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
                    <Input id="password" type="password" placeholder="********" />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#3A4257] hover:bg-[#2a3044]">
                    Entrar
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para criar sua conta.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <Input id="register-name" placeholder="João Silva" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input id="register-email" type="email" placeholder="seu@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input id="register-password" type="password" placeholder="********" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                    <Input id="register-confirm-password" type="password" placeholder="********" />
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