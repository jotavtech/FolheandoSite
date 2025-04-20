import { useEffect, useState } from "react";
import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface Livro {
  idGoogle: string;
  titulo: string;
  autores: string[];
  descricao: string;
  imagem: string;
}

interface Usuario {
  id: number;
  nome: string;
}

interface Resenha {
  id: number;
  user: Usuario;
  userId: number;
  status: string;
  nota: number;
  resenha: string;
}

const statusMap = {
  "Lido": "lido",
  "Lendo": "lendo",
  "Quero ler": "nao_li"
};

export default function LivroDetalhes() {
  // 1) pega o :id da rota /livro/:id
  const { id } = useParams<{ id: string }>();

  const [livro, setLivro] = useState<Livro | null>(null);
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [jaResenhou, setJaResenhou] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [status, setStatus] = useState("Lido");
  const [nota, setNota] = useState(5);
  const [textoResenha, setTextoResenha] = useState("");

  // 2) carrega o usuário
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) setUsuario(JSON.parse(u));
  }, []);

  // 3) carrega o livro e depois as resenhas
  useEffect(() => {
    if (!id) return;

    // 3a) livro do Google Books
    fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.volumeInfo) {
          setLivro({
            idGoogle: data.id,
            titulo: data.volumeInfo.title || "Sem título",
            autores: data.volumeInfo.authors || ["Desconhecido"],
            descricao: data.volumeInfo.description?.replace(/<[^>]+>/g, "") || "Sem descrição",
            imagem: data.volumeInfo.imageLinks?.thumbnail || "",
          });
        }
      })
      .catch(console.error);

    // 3b) resenhas do seu backend
    fetch(`http://localhost:3000/resenhas/${id}`)
      .then((r) => r.json())
      .then((arr: Resenha[]) => {
        setResenhas(arr);
        if (usuario) {
          setJaResenhou(arr.some((r) => r.userId === usuario.id));
        }
      })
      .catch(console.error);

  }, [id, usuario]);

  // 4) form de resenha
  const enviarResenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !livro) return;
    const payload = {
      userId: usuario.id,
      livroId: id,
      status: statusMap[status as keyof typeof statusMap],
      nota,
      resenha: textoResenha,
      titulo: livro.titulo,
      autor: livro.autores.join(", "),
      imagem: livro.imagem,
    };
    const url = editandoId
      ? `http://localhost:3000/resenhas/${editandoId}`
      : "http://localhost:3000/resenhas";
    const method = editandoId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) window.location.reload();
  };

  const editar = (r: Resenha) => {
    setStatus(
      (Object.keys(statusMap) as Array<keyof typeof statusMap>)
        .find((k) => statusMap[k] === r.status) || "Lido"
    );
    setNota(r.nota);
    setTextoResenha(r.resenha);
    setEditandoId(r.id);
  };

  const apagar = async (rid: number) => {
    if (!confirm("Apagar resenha?")) return;
    await fetch(`http://localhost:3000/resenhas/${rid}`, { method: "DELETE" });
    window.location.reload();
  };

  // 5) enquanto o livro estiver carregando…
  if (!livro) return <div className="p-10">Carregando livro…</div>;

  // 6) renderiza tudo
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />
      <main className="flex-1 py-10 px-6 md:px-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{livro.titulo}</h1>
        <p className="text-gray-700 mb-1">
          Autor(es): {livro.autores.join(", ")}
        </p>
        <img
          src={livro.imagem}
          alt={livro.titulo}
          className="w-40 my-4 rounded shadow-md"
        />
        <p className="text-gray-800 mb-6">{livro.descricao}</p>

        <h2 className="text-xl font-semibold mb-2">Resenhas</h2>
        {resenhas.map((r) => (
          <div key={r.id} className="mb-4 p-4 bg-white rounded shadow">
            <strong>{r.user.nome}</strong> ({r.status}) – Nota: {r.nota}
            <p className="text-gray-700">{r.resenha}</p>
            {usuario?.id === r.userId && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => editar(r)}>
                  Editar
                </Button>
                <Button variant="destructive" onClick={() => apagar(r.id)}>
                  Apagar
                </Button>
              </div>
            )}
          </div>
        ))}

        {!jaResenhou && usuario && (
          <form
            onSubmit={enviarResenha}
            className="mt-8 bg-white p-6 rounded shadow space-y-4"
          >
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusMap).map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min={1}
              max={10}
              value={nota}
              onChange={(e) => setNota(Number(e.target.value))}
              placeholder="Nota (1 a 10)"
            />

            <Textarea
              value={textoResenha}
              onChange={(e) => setTextoResenha(e.target.value)}
              placeholder="Sua resenha..."
            />

            <Button type="submit">
              {editandoId ? "Salvar Edição" : "Enviar Resenha"}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
