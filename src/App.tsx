import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-white font-sans text-zinc-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <footer className="bg-zinc-900 text-white py-20 mt-20">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white overflow-hidden">
                    <span className="text-zinc-900 font-black text-xs">AMEW</span>
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase">A.M.E.W. <span className="text-yellow-400 italic">LUZ</span></span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Especialistas em soluções elétricas e hidráulicas. Caixas de luz, hidrômetros e projetos de engenharia com conformidade técnica total.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-zinc-500">Navegação</h4>
                <ul className="space-y-4 text-zinc-400 font-medium">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/produtos" className="hover:text-white transition-colors">Produtos</Link></li>
                  <li><a href="/#orcamento" className="hover:text-white transition-colors">Orçamento de Projetos</a></li>
                  <li><Link to="/contato" className="hover:text-white transition-colors">Contato</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-zinc-500">Contato</h4>
                <ul className="space-y-4 text-zinc-400 font-medium">
                  <li>São Paulo - SP</li>
                  <li>(11) 97187-8021</li>
                  <li>amewengenhariaeletrica@gmail.com</li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/10 text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">© 2026 AMEW Engenharia. Todos os direitos reservados.</p>
            </div>
          </footer>
          <WhatsAppWidget />
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </CartProvider>
  );
}
