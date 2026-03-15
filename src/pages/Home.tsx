import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, FeaturedItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProjectCalculator } from '../components/ProjectCalculator';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Package, ShieldCheck, Truck, ChevronLeft, ChevronRight, Calculator, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Featured Products
        const qProducts = query(collection(db, 'products'), limit(8));
        const pSnapshot = await getDocs(qProducts);
        let products = pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        if (products.length === 0) {
          products = [
            {
              id: 'enel-8',
              name: 'Caixa de Luz 8 Medidores',
              description: 'Visor lateral completa, policarbonato resistente. Entregamos ligado!',
              price: 2850.00,
              stock: 5,
              imageUrl: 'https://images.unsplash.com/photo-1558444479-c84829091c22?auto=format&fit=crop&q=80&w=800',
              createdAt: new Date()
            },
            {
              id: 'sabesp-std',
              name: 'Caixa Sabesp Padrão',
              description: 'Economia e segurança para sua conta de água. Padrão homologado.',
              price: 195.00,
              stock: 25,
              imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
              createdAt: new Date()
            }
          ];
        }
        setFeaturedProducts(products);

        // Fetch Featured Items (Highlights)
        const qFeatured = query(collection(db, 'featured'), limit(10));
        const fSnapshot = await getDocs(qFeatured);
        const items = fSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedItem));
        setFeaturedItems(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  const scrollToCalculator = () => {
    const element = document.getElementById('orcamento');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://images.unsplash.com/photo-1558444479-c84829091c22?auto=format&fit=crop&q=80&w=2000" 
            alt="Caixa de Luz Padrão" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl text-white"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none uppercase">
              AMEW<span className="text-yellow-400 italic">LUZ</span>
            </h1>
            <p className="text-xl text-zinc-300 mb-10 leading-relaxed font-medium">
              Especialistas em Caixas de Luz e Hidrômetros. Qualidade, segurança e conformidade técnica para sua instalação.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/produtos" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all">
                Ver Coleção <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={scrollToCalculator}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all"
              >
                <Calculator className="w-5 h-5" /> Orçamento de Projetos
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Entrega Rápida", desc: "Enviamos nossos produtos para toda SP com agilidade e segurança." },
            { icon: ShieldCheck, title: "Padrão Homologado", desc: "Produtos que atendem 100% às normas técnicas exigidas pelas concessionárias." },
            { icon: Package, title: "Pronta Entrega", desc: "Amplo estoque de caixas de luz e hidrômetros para sua obra." }
          ].map((f, i) => (
            <div key={i} className="p-8 bg-zinc-50 rounded-3xl border border-black/5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-2xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access to Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={scrollToCalculator}
          className="w-full group relative overflow-hidden bg-emerald-600 rounded-[40px] p-12 text-left transition-all hover:bg-emerald-700"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
            <Calculator className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> Novidade
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight uppercase tracking-tighter">
              Precisa de um <span className="text-yellow-400 italic">Projeto Elétrico?</span>
            </h2>
            <p className="text-xl text-emerald-50 mb-8 font-medium">
              Calcule agora o valor do seu projeto residencial ou comercial e receba o orçamento no WhatsApp.
            </p>
            <div className="inline-flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg group-hover:gap-5 transition-all">
              Acessar Calculadora de Projetos <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>
      </section>

      {/* Project Calculator Section */}
      <ProjectCalculator />

      {/* Consultancy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900 rounded-[40px] overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover"
              alt="Consultoria Técnica"
            />
          </div>
          <div className="relative z-10 p-12 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-yellow-400 text-zinc-900 text-xs font-bold rounded-full uppercase tracking-widest mb-6">
                Serviço Especializado
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
                Consultoria de <span className="text-yellow-400 italic">Notas Técnicas</span>
              </h2>
              <p className="text-lg text-zinc-300 mb-10 leading-relaxed">
                Nossa equipe técnica analisa seu projeto e garante que sua instalação esteja em total conformidade com as normas da Enel e Sabesp, evitando reprovações.
              </p>
              <a 
                href="https://wa.me/5511971878021?text=Olá! Gostaria de saber mais sobre a Consultoria de Notas Técnicas da AMEW."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-lg shadow-emerald-500/20"
              >
                Falar com Consultor <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Análise de Projetos", icon: ShieldCheck },
                { label: "Normas Enel/Sabesp", icon: Package },
                { label: "Evite Reprovações", icon: ShieldCheck },
                { label: "Suporte Especializado", icon: Truck }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                  <item.icon className="w-8 h-8 text-yellow-400 mb-4" />
                  <p className="text-white font-bold text-sm leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Showcase */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative group overflow-hidden rounded-[40px] bg-zinc-900 aspect-[21/9]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={featuredItems[currentSlide].imageUrl} 
                  alt={featuredItems[currentSlide].title} 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-20">
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                    {featuredItems[currentSlide].title || 'Destaques AMEW'}
                  </h2>
                  <Link to="/produtos" className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition-colors w-fit">
                    Ver Produtos <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {featuredItems.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredItems.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-yellow-400' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2">Destaques da Semana</h2>
            <p className="text-zinc-500">As caixas mais desejadas pelos nossos clientes.</p>
          </div>
          <Link to="/produtos" className="text-yellow-600 font-bold flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-zinc-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
