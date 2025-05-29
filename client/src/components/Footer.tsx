import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#3A4257] text-white py-12 px-8 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Sobre */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Sobre o Folheando</h3>
            <p className="text-gray-300 leading-relaxed text-base">
              Compartilhe suas leituras e descubra novos livros através das avaliações de outros leitores.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Links Úteis</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-base">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/livros" className="text-gray-300 hover:text-white transition-colors text-base">
                  Livros
                </Link>
              </li>
              <li>
                <Link href="/avaliacoes" className="text-gray-300 hover:text-white transition-colors text-base">
                  Avaliações
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Contato</h3>
            <div className="space-y-3">
              <p className="text-gray-300 text-base">
                Email: contato@folheando.com
              </p>
              <p className="text-gray-300 text-base">
                Telefone: (11) 99999-9999
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-12 pt-8 text-center">
          <p className="text-gray-300 text-base">
            © 2024 Folheando. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
