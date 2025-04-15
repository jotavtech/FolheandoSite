import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SECTION_TITLES } from "@/lib/constants";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />

      {/* Profile Info Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#F5F5F0]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-300" />
          <div className="flex-1">
            <h2 className="text-2xl font-medium mb-2">João Vitor</h2>
            <p className="text-gray-700 mb-4">Leitor apaixonado por aventuras e ficção científica.</p>
            <div className="flex gap-4">
              <Link href="/editar-perfil">
                <Button className="bg-[#3A4257] text-white px-6 py-2 text-sm">
                  Editar Perfil
                </Button>
              </Link>
              <Link href="/logout">
                <Button className="bg-[#6B7F9E] text-white px-6 py-2 text-sm">
                  Sair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User's Books Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#222222] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{SECTION_TITLES.userBooks}</h2>
            <Link href="/cadastro-livro">
              <Button className="bg-[#4F5D7E] text-white">
                Adicionar Livro
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F5F0] text-black p-4 rounded">
              <p className="font-semibold">Livro 1</p>
              <p className="text-sm text-gray-600">Descrição curta do livro.</p>
            </div>
            <div className="bg-[#F5F5F0] text-black p-4 rounded">
              <p className="font-semibold">Livro 2</p>
              <p className="text-sm text-gray-600">Descrição curta do livro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* User's Reviews Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#6B7F9E] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{SECTION_TITLES.userReviews}</h2>
            <Link href="/avaliacoes">
              <Button className="bg-[#4F5D7E] text-white">
                Ver Todas
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F5F0] text-black p-4 rounded">
              <p className="font-semibold">Avaliação 1</p>
              <p className="text-sm text-gray-600">“Gostei muito da narrativa desse livro!”</p>
            </div>
            <div className="bg-[#F5F5F0] text-black p-4 rounded">
              <p className="font-semibold">Avaliação 2</p>
              <p className="text-sm text-gray-600">“Achei o desenvolvimento dos personagens incrível.”</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;
