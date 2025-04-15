import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="py-6 px-6 md:px-8 lg:px-12 bg-[#6B7F9E] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-medium">Folheando</h2>
            <p className="text-sm mt-1">© {new Date().getFullYear()} Todos os direitos reservados</p>
          </div>
          <div>
            <nav>
              <ul className="flex flex-wrap space-x-4">
                <li><Link href="/"><span className="text-sm cursor-pointer">Início</span></Link></li>
                <li><Link href="/livros"><span className="text-sm cursor-pointer">Livros</span></Link></li>
                <li><Link href="/cadastro-livro"><span className="text-sm cursor-pointer">Cadastrar Livro</span></Link></li>
                <li><Link href="/avaliacoes"><span className="text-sm cursor-pointer">Avaliações</span></Link></li>
                <li><Link href="/login"><span className="text-sm cursor-pointer">Entrar</span></Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
