import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Phone, User, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const Navbar: React.FC = () => {
  const { cart } = useCart();
  const [user] = useAuthState(auth);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-zinc-900 overflow-hidden">
              <span className="text-zinc-900 font-black text-xs">AMEW</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none text-zinc-900">A.M.E.W.</span>
              <span className="text-sm font-bold text-yellow-600 leading-none">LUZ</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/produtos" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Produtos</Link>
            <a href="/#orcamento" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Orçamento de Projetos</a>
            <Link to="/contato" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Contato</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/carrinho" className="relative p-2 text-zinc-600 hover:text-emerald-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                {user.email === "amewengenhariaeletrica@gmail.com" && (
                  <Link to="/admin" className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-bold">Painel</span>
                  </Link>
                )}
                <button 
                  onClick={() => auth.signOut()}
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-2"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
