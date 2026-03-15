import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold px-4 py-2 border-2 border-white rounded-full">Esgotado</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-zinc-900 leading-tight">{product.name}</h3>
          <span className="font-bold text-emerald-600">R$ {product.price.toFixed(2)}</span>
        </div>
        <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock <= 0}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar ao Carrinho
        </button>
      </div>
    </motion.div>
  );
};
