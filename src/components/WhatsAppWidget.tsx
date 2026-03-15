import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const phoneNumber = '5511971878021';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const encodedMessage = encodeURIComponent(message || 'Olá! Gostaria de saber mais sobre os produtos da AMEW.');
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-[32px] shadow-2xl border border-black/5 overflow-hidden"
          >
            <div className="bg-zinc-900 p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Atendimento AMEW</h3>
                  <p className="text-xs text-zinc-400">Online agora</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-300">Olá! Como podemos ajudar você hoje?</p>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none text-sm"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all"
              >
                Iniciar Conversa <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all relative"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </motion.button>
    </div>
  );
};
