import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ProjectPrice } from '../types';
import { Calculator, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProjectCalculator: React.FC = () => {
  const [prices, setPrices] = useState<ProjectPrice[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectPrice | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const q = query(collection(db, 'project_prices'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectPrice));
        setPrices(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (error) {
        console.error('Error fetching project prices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const total = selectedProject ? selectedProject.basePrice * quantity : 0;

  const handleWhatsApp = () => {
    if (!selectedProject) return;
    const message = `Olá! Gostaria de um orçamento para:
Projeto: ${selectedProject.name}
Quantidade: ${quantity} ${selectedProject.unitName}
Valor Estimado: R$ ${total.toFixed(2)}`;
    window.open(`https://wa.me/5511971878021?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return null;
  if (prices.length === 0) return null;

  return (
    <section id="orcamento" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-zinc-900 rounded-[40px] overflow-hidden relative border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest mb-6 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" /> Orçamento Instantâneo
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
              Calcule seu <span className="text-emerald-400 italic">Projeto Elétrico</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
              Selecione o tipo de projeto e informe a metragem ou quantidade de pontos para receber uma estimativa automática de valores.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold">Transparência Total</p>
                  <p className="text-sm text-zinc-500">Valores baseados em nossa tabela atualizada.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <MessageCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold">Suporte via WhatsApp</p>
                  <p className="text-sm text-zinc-500">Tire suas dúvidas técnicas em tempo real.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-2xl">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Tipo de Projeto</label>
                <div className="grid grid-cols-1 gap-3">
                  {prices.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedProject?.id === p.id 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                          : 'border-zinc-100 hover:border-zinc-200 text-zinc-600'
                      }`}
                    >
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs opacity-60">R$ {p.basePrice.toFixed(2)} / {p.unitName}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedProject && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      Quantidade ({selectedProject.unitName})
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xl"
                    />
                  </div>

                  <div className="p-6 bg-zinc-900 rounded-3xl text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest mb-1">Total Estimado</p>
                        <p className="text-3xl font-black text-emerald-400">R$ {total.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={handleWhatsApp}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleWhatsApp}
                    className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                  >
                    Solicitar Orçamento Formal <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
