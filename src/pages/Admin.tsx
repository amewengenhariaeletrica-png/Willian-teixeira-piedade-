import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Product, Order, FeaturedItem, ProjectPrice } from '../types';
import { Plus, Trash2, Package, ShoppingCart, LayoutDashboard, Settings, Edit2, Upload, X, Star, CreditCard, Sparkles, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { optimizeImage } from '../utils/imageOptimizer';

export const Admin: React.FC = () => {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [projectPrices, setProjectPrices] = useState<ProjectPrice[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'featured' | 'payments' | 'projects'>('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState({
    amount: '',
    description: '',
    generatedLink: ''
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: ''
  });
  const [newFeatured, setNewFeatured] = useState({
    title: '',
    category: 'enel' as 'enel' | 'sabesp',
    imageUrl: ''
  });
  const [newProjectPrice, setNewProjectPrice] = useState({
    name: '',
    basePrice: 0,
    unitName: 'm²',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimizedBase64 = await optimizeImage(file);
      
      if (activeTab === 'featured') {
        setNewFeatured({ ...newFeatured, imageUrl: optimizedBase64 });
      } else if (editingProduct) {
        setEditingProduct({ ...editingProduct, imageUrl: optimizedBase64 });
      } else {
        setNewProduct({ ...newProduct, imageUrl: optimizedBase64 });
      }
      toast.success('Imagem otimizada e carregada!');
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Erro ao otimizar imagem. Tente uma imagem menor.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOptimizeUrl = async (url: string) => {
    if (!url || !url.startsWith('http') || url.startsWith('data:image')) return;
    
    setIsUploading(true);
    try {
      const optimizedBase64 = await optimizeImage(url);
      if (activeTab === 'featured') {
        setNewFeatured({ ...newFeatured, imageUrl: optimizedBase64 });
      } else if (editingProduct) {
        setEditingProduct({ ...editingProduct, imageUrl: optimizedBase64 });
      } else {
        setNewProduct({ ...newProduct, imageUrl: optimizedBase64 });
      }
      toast.success('Link otimizado com sucesso!');
    } catch (error) {
      // If optimization fails (likely CORS), we just keep the original URL
      console.warn('Could not optimize external URL due to CORS or other error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchData = async () => {
    try {
      const pSnapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

      const oSnapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(oSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

      const fSnapshot = await getDocs(query(collection(db, 'featured'), orderBy('createdAt', 'desc')));
      setFeaturedItems(fSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedItem)));

      const prSnapshot = await getDocs(query(collection(db, 'project_prices'), orderBy('createdAt', 'desc')));
      setProjectPrices(prSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectPrice)));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados do servidor.');
    }
  };

  const handleAddFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatured.imageUrl) {
      toast.error('Por favor, adicione uma imagem.');
      return;
    }

    try {
      await addDoc(collection(db, 'featured'), {
        ...newFeatured,
        createdAt: serverTimestamp()
      });
      toast.success('Destaque adicionado!');
      setShowAddForm(false);
      setNewFeatured({ title: '', category: 'enel', imageUrl: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar destaque.');
    }
  };

  const handleDeleteFeatured = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'featured', id));
      toast.success('Destaque excluído.');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir destaque.');
    }
  };

  const handleAddProjectPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'project_prices'), {
        ...newProjectPrice,
        createdAt: serverTimestamp()
      });
      toast.success('Preço de projeto adicionado!');
      setShowAddForm(false);
      setNewProjectPrice({ name: '', basePrice: 0, unitName: 'm²', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar preço de projeto.');
    }
  };

  const handleDeleteProjectPrice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'project_prices', id));
      toast.success('Preço de projeto excluído.');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir preço de projeto.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentImageUrl = editingProduct ? editingProduct.imageUrl : newProduct.imageUrl;
    if (!currentImageUrl) {
      toast.error('Por favor, adicione uma imagem (upload ou link).');
      return;
    }

    try {
      if (editingProduct) {
        const { id, ...updateData } = editingProduct;
        await updateDoc(doc(db, 'products', id), updateData);
        toast.success('Produto atualizado!');
        setEditingProduct(null);
      } else {
        await addDoc(collection(db, 'products'), {
          ...newProduct,
          createdAt: serverTimestamp()
        });
        toast.success('Produto adicionado!');
      }
      setShowAddForm(false);
      setNewProduct({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Produto excluído.');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir produto.');
    }
  };

  const handleSeedDatabase = async () => {
    const defaultProducts = [
      {
        name: 'Caixa de Luz 8 Medidores - Visor Lateral',
        description: 'Caixa de luz completa para 8 medidores com visor lateral. Fabricada em policarbonato resistente. Inclui instalação elétrica e entrega ligado! Padrão Enel homologado.',
        price: 2850.00,
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1558444479-c84829091c22?auto=format&fit=crop&q=80&w=800',
        createdAt: serverTimestamp()
      },
      {
        name: 'Caixa Sabesp Padrão - Hidrômetro',
        description: 'Caixa para hidrômetro padrão Sabesp. Material reforçado para máxima durabilidade e economia na sua conta de água.',
        price: 195.00,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        createdAt: serverTimestamp()
      },
      {
        name: 'Caixa de Luz Individual Enel',
        description: 'Caixa de luz monofásica/bifásica padrão Enel. Pronta para instalação com ART elétrica e civil inclusa.',
        price: 480.00,
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
        createdAt: serverTimestamp()
      }
    ];

    try {
      for (const p of defaultProducts) {
        await addDoc(collection(db, 'products'), p);
      }

      const defaultProjectPrices = [
        {
          name: 'Projeto Elétrico Residencial',
          basePrice: 15.00,
          unitName: 'm²',
          description: 'Projeto completo com planta baixa, diagramas e lista de materiais.',
          createdAt: serverTimestamp()
        },
        {
          name: 'Projeto de Entrada de Energia (Enel)',
          basePrice: 450.00,
          unitName: 'unidade',
          description: 'Aprovação de projeto junto à concessionária Enel.',
          createdAt: serverTimestamp()
        }
      ];

      for (const pr of defaultProjectPrices) {
        await addDoc(collection(db, 'project_prices'), pr);
      }

      toast.success('Dados padrão adicionados!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao popular banco de dados.');
    }
  };

  const ADMIN_EMAIL = "amewengenhariaeletrica@gmail.com";

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-zinc-50 rounded-[40px] p-12 border border-black/5 inline-block">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-zinc-500">Apenas o administrador principal ({ADMIN_EMAIL}) tem permissão para acessar o painel e realizar alterações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Painel Administrativo</h1>
        <div className="flex bg-zinc-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            <Package className="w-5 h-5" /> Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            <ShoppingCart className="w-5 h-5" /> Pedidos
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'featured' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            <Star className="w-5 h-5" /> Destaques
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'payments' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            <CreditCard className="w-5 h-5" /> Pagamentos
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'projects' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            <Calculator className="w-5 h-5" /> Projetos
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
              <button
                onClick={handleSeedDatabase}
                className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1 rounded-lg font-bold transition-colors"
              >
                Popular com Padrão Enel/Sabesp
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" /> Novo Produto
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
              <h3 className="text-xl font-bold mb-6">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                      value={editingProduct ? editingProduct.name : newProduct.name} 
                      onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                      value={editingProduct ? editingProduct.price : newProduct.price} 
                      onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value)}) : setNewProduct({...newProduct, price: parseFloat(e.target.value)})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estoque</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                      value={editingProduct ? editingProduct.stock : newProduct.stock} 
                      onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock: parseInt(e.target.value)}) : setNewProduct({...newProduct, stock: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                    <div className="flex flex-col gap-4">
                      {/* Preview */}
                      {(editingProduct?.imageUrl || newProduct.imageUrl) && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-200">
                          <img 
                            src={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Preview" 
                          />
                          <button 
                            type="button"
                            onClick={() => editingProduct ? setEditingProduct({...editingProduct, imageUrl: ''}) : setNewProduct({...newProduct, imageUrl: ''})}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-4">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={`w-8 h-8 mb-3 ${isUploading ? 'animate-bounce text-emerald-500' : 'text-zinc-400'}`} />
                            <p className="mb-2 text-sm text-zinc-500 font-bold">
                              {isUploading ? 'Carregando...' : 'Clique para buscar na galeria'}
                            </p>
                            <p className="text-xs text-zinc-400">PNG, JPG ou WEBP (Máx. 1MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </label>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200"></span>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-400 font-bold">Ou use um link</span>
                          </div>
                        </div>

                        <input 
                          type="text" 
                          placeholder="Cole o link da imagem aqui"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm" 
                          value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl} 
                          onChange={e => editingProduct ? setEditingProduct({...editingProduct, imageUrl: e.target.value}) : setNewProduct({...newProduct, imageUrl: e.target.value})} 
                          onBlur={e => handleOptimizeUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 h-32" 
                      value={editingProduct ? editingProduct.description : newProduct.description} 
                      onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowAddForm(false); setEditingProduct(null); }} 
                    className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="bg-zinc-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-zinc-800">
                    {editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-6 p-4 bg-white rounded-2xl border border-black/5">
                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-sm text-zinc-500">R$ {p.price.toFixed(2)} • Estoque: {p.stock}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(p)} 
                    className="p-3 text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)} 
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-8">
          <div className="space-y-6">
            {orders.map(o => (
              <div key={o.id} className="bg-white p-8 rounded-3xl border border-black/5">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Pedido #{o.id?.slice(-6).toUpperCase()}</p>
                    <p className="font-bold text-lg">{o.customerInfo.name}</p>
                    <p className="text-sm text-zinc-500">{o.customerInfo.email} • {o.customerInfo.phone}</p>
                    <p className="text-sm text-zinc-500">{o.customerInfo.address}, {o.customerInfo.city} - {o.customerInfo.zip}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-bold mb-2">
                      {o.status.toUpperCase()}
                    </span>
                    <p className="text-2xl font-bold">R$ {o.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-zinc-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'payments' ? (
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-xl max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">Gerador de Link de Pagamento</h2>
            <p className="text-zinc-500 mb-8">
              Crie links de pagamento rápidos para enviar aos seus clientes via WhatsApp ou E-mail.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="0,00"
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xl"
                  value={paymentLinkData.amount}
                  onChange={e => setPaymentLinkData({ ...paymentLinkData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Descrição do Serviço/Produto</label>
                <input 
                  type="text" 
                  placeholder="Ex: Caixa de Luz 8 Medidores"
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={paymentLinkData.description}
                  onChange={e => setPaymentLinkData({ ...paymentLinkData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    const link = `https://link.mercadopago.com.br/amew-pagamento?value=${paymentLinkData.amount}&desc=${encodeURIComponent(paymentLinkData.description)}`;
                    setPaymentLinkData({ ...paymentLinkData, generatedLink: link });
                    toast.success('Link Mercado Pago gerado!');
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
                >
                  <CreditCard className="w-5 h-5" /> Link Mercado Pago
                </button>
                <button 
                  onClick={() => {
                    const msg = `Olá! Segue o link para pagamento de R$ ${paymentLinkData.amount} referente a: ${paymentLinkData.description}`;
                    const link = `https://wa.me/5511971878021?text=${encodeURIComponent(msg)}`;
                    setPaymentLinkData({ ...paymentLinkData, generatedLink: link });
                    toast.success('Link WhatsApp gerado!');
                  }}
                  className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all"
                >
                  <ShoppingCart className="w-5 h-5" /> Cobrar via WhatsApp
                </button>
              </div>

              {paymentLinkData.generatedLink && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-zinc-900 text-white rounded-3xl"
                >
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2">Link Gerado</p>
                  <div className="flex items-center gap-4">
                    <input 
                      readOnly
                      value={paymentLinkData.generatedLink}
                      className="flex-1 bg-white/10 border-none rounded-xl px-4 py-2 text-sm outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(paymentLinkData.generatedLink);
                        toast.success('Copiado para a área de transferência!');
                      }}
                      className="bg-white text-zinc-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-zinc-100"
                    >
                      Copiar
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'projects' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tabela de Preços de Projetos</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" /> Novo Preço
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Novo Tipo de Projeto</h3>
              <form onSubmit={handleAddProjectPrice} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Projeto</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: Projeto Elétrico Residencial"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                      value={newProjectPrice.name} 
                      onChange={e => setNewProjectPrice({...newProjectPrice, name: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preço Base (R$)</label>
                      <input 
                        required 
                        type="number" 
                        step="0.01"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                        value={newProjectPrice.basePrice} 
                        onChange={e => setNewProjectPrice({...newProjectPrice, basePrice: parseFloat(e.target.value)})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unidade</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Ex: m², ponto, unidade"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                        value={newProjectPrice.unitName} 
                        onChange={e => setNewProjectPrice({...newProjectPrice, unitName: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição/Detalhes</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 h-32" 
                      placeholder="O que está incluso neste preço?"
                      value={newProjectPrice.description} 
                      onChange={e => setNewProjectPrice({...newProjectPrice, description: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-50">Cancelar</button>
                  <button type="submit" className="bg-zinc-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-zinc-800">Salvar Preço</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {projectPrices.map(p => (
              <div key={p.id} className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-black/5">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-zinc-500">R$ {p.basePrice.toFixed(2)} por {p.unitName}</p>
                  {p.description && <p className="text-xs text-zinc-400 mt-1">{p.description}</p>}
                </div>
                <button 
                  onClick={() => handleDeleteProjectPrice(p.id)} 
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gerenciar Destaques</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" /> Novo Destaque
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Novo Destaque</h3>
              <form onSubmit={handleAddFeatured} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título (Opcional)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200" 
                      value={newFeatured.title} 
                      onChange={e => setNewFeatured({...newFeatured, title: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200"
                      value={newFeatured.category}
                      onChange={e => setNewFeatured({...newFeatured, category: e.target.value as 'enel' | 'sabesp'})}
                    >
                      <option value="enel">Padrão Enel</option>
                      <option value="sabesp">Caixa Sabesp</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-2">Imagem do Destaque</label>
                  <div className="flex flex-col gap-4">
                    {newFeatured.imageUrl && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-200">
                        <img src={newFeatured.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => setNewFeatured({...newFeatured, imageUrl: ''})}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-3 ${isUploading ? 'animate-bounce text-emerald-500' : 'text-zinc-400'}`} />
                        <p className="text-sm text-zinc-500 font-bold">Clique para buscar na galeria</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-zinc-200"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-zinc-400 font-bold">Ou use um link</span>
                      </div>
                    </div>

                    <input 
                      type="text" 
                      placeholder="Cole o link da imagem aqui"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm" 
                      value={newFeatured.imageUrl} 
                      onChange={e => setNewFeatured({...newFeatured, imageUrl: e.target.value})} 
                      onBlur={e => handleOptimizeUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-50">Cancelar</button>
                  <button type="submit" className="bg-zinc-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-zinc-800">Salvar Destaque</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden group">
                <div className="aspect-video relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => handleDeleteFeatured(item.id)}
                      className="p-2 bg-white/90 text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-zinc-900/80 text-white text-[10px] font-bold rounded-full uppercase tracking-widest backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                {item.title && (
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900">{item.title}</h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
