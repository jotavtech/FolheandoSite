import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import Slider from "@/components/Slider";
import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "wouter";
import { SECTION_TITLES } from "@/lib/constants";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      <Header />

      {/* Welcome Section */}
      <section className="py-8 px-6 md:px-8 lg:px-12 bg-[#F5F5F0]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-medium mb-2">Bem-vindo de volta!</h2>
              <Link href="/login">
              <Button className="bg-[#3A4257] text-white px-4 py-1 rounded-sm text-sm h-8">
                Entrar
              </Button>
              </Link>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative h-24 w-full md:w-40 overflow-hidden rounded-md">
                <div className="w-full h-full bg-[#6B7F9E]/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Books Section */}
      <section className="py-8 px-6 md:px-8 lg:px-12 bg-[#F5F5F0]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-medium">Descubra livros, avalie-os!</h2>
            </div>
            <div>
              <Link href="/livros">
              <Button className="bg-[#3A4257] text-white px-4 py-1 rounded-sm text-sm h-8">
                Ver mais
              </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="relative h-24 w-full md:w-40 overflow-hidden rounded-md">
              <div className="w-full h-full bg-[#6B7F9E]/20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Favorite Books Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#222222] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.questioned}</h2>
            <Link href="/livros">
              <Button className="bg-[#4F5D7E] text-white mt-4 md:mt-0">
                Ver Todos
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <BookCard type="medium" />
            <BookCard type="medium" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <BookCard type="medium" />
            <BookCard type="medium" />
          </div>
        </div>
      </section>

      {/* Register Your Book Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#6B7F9E] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.registerBook}</h2>
            <Link href="/cadastro-livro">
              <Button className="bg-[#4F5D7E] text-white mt-4 md:mt-0">
                Cadastrar Livro
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <BookCard type="large" className="w-full md:w-1/2" />
            <div className="bg-[#F5F5F0] rounded-md p-4 h-64 w-full md:w-1/2 flex flex-col">
              <div className="flex-1 flex flex-col justify-center items-center">
                <p className="text-gray-700 text-center mb-4">Ajude nossa comunidade a crescer com sua contribuição!</p>
                <Link href="/cadastro-livro">
                  <Button className="bg-[#3A4257] text-white px-8 py-2 rounded-sm">
                    Cadastrar um Novo Livro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#6B7F9E] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.principle}</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-[#F5F5F0] rounded-md p-4 h-40 w-full md:w-1/2 flex flex-col">
              <div className="flex-1 flex">
                <div className="w-1/3 h-full bg-gray-200 rounded mr-4"></div>
                <div className="w-2/3 bg-white p-3 rounded">
                  <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
                  <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
                  <div className="h-4 bg-gray-300 w-3/4 rounded"></div>
                  <div className="mt-4">
                    <Button className="bg-[#4F5D7E] text-white px-6 py-1 rounded-sm text-sm">
                      Saiba mais
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F5F0] rounded-md p-4 h-40 w-full md:w-1/2 flex items-center justify-center">
              <div className="w-full h-full flex flex-col justify-end">
                <div className="h-8 bg-gray-300 w-20 mb-2 rounded mx-auto"></div>
                <Link href="/livros">
                  <Button className="bg-[#4F5D7E] text-white px-8 py-2 rounded-sm text-sm mx-auto">
                    Explorar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Reviews Section */}
      <section className="py-10 px-6 md:px-8 lg:px-12 bg-[#222222] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-center md:text-left">{SECTION_TITLES.topReviews}</h2>
            <Link href="/avaliacoes">
              <Button className="bg-[#4F5D7E] text-white mt-4 md:mt-0">
                Ver Todas
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <BookCard type="medium" />
            <BookCard type="medium" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <BookCard type="medium" />
            <BookCard type="medium" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
