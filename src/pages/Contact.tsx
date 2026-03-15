import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Mensagem enviada com sucesso!');
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-6 leading-none">
            Vamos criar algo <span className="text-emerald-600 italic">mágico</span> juntos?
          </h1>
          <p className="text-xl text-zinc-500 mb-12 leading-relaxed">
            Tem alguma dúvida sobre nossas caixas ou quer um pedido personalizado? Nossa equipe está pronta para te ajudar.
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">E-mail</p>
                <p className="text-lg font-bold">amewengenhariaeletrica@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Telefones</p>
                <p className="text-lg font-bold">(11) 4558-6016</p>
                <p className="text-lg font-bold">(11) 97187-8021 (WhatsApp)</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Localização</p>
                <p className="text-lg font-bold">Av. Santo Antonio, 1968</p>
                <p className="text-md text-zinc-600">Bela Vista - Osasco, SP</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[40px] border border-black/5 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Nome</label>
                <input required type="text" className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">E-mail</label>
                <input required type="email" className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="seu@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Assunto</label>
              <input required type="text" className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Como podemos ajudar?" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Mensagem</label>
              <textarea required className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none" placeholder="Escreva sua mensagem aqui..."></textarea>
            </div>
            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Enviando...' : (
                <>
                  Enviar Mensagem <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
