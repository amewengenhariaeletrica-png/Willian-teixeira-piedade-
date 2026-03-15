import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, QrCode, CheckCircle2, ArrowLeft, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Checkout: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [formData, setFormData] = useState({
    name: '',
    email: auth.currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async (method: string) => {
    if (!auth.currentUser) {
      toast.error('Você precisa estar logado para finalizar a compra.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: auth.currentUser.uid,
        items: cart,
        total,
        status: method === 'WhatsApp' ? 'pending' : 'paid',
        paymentMethod: method,
        customerInfo: formData,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      if (method === 'WhatsApp') {
        const orderId = docRef.id.slice(-6).toUpperCase();
        const itemsList = cart.map(item => `- ${item.quantity}x ${item.name}`).join('%0A');
        const message = `*NOVO PEDIDO AMEWLUZ - #${orderId}*%0A%0A` +
          `*Cliente:* ${formData.name}%0A` +
          `*Telefone:* ${formData.phone}%0A` +
          `*Endereço:* ${formData.address}, ${formData.city}%0A%0A` +
          `*Itens:*%0A${itemsList}%0A%0A` +
          `*Total:* R$ ${total.toFixed(2)}%0A%0A` +
          `Olá! Acabei de realizar um pedido no site e gostaria de combinar o pagamento.`;
        
        window.open(`https://wa.me/5511971878021?text=${message}`, '_blank');
      }

      clearCart();
      setStep('success');
      toast.success('Pedido realizado com sucesso!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pedido.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4">Pedido Confirmado!</h1>
        <p className="text-zinc-500 text-lg mb-10">
          Obrigado pela sua compra. Você receberá um e-mail com os detalhes do pedido em breve.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-zinc-900 text-white px-10 py-4 rounded-full font-bold hover:bg-zinc-800 transition-colors"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          {step === 'info' ? (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold mb-8">Informações de Entrega</h2>
              <form onSubmit={handleInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Nome Completo</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">E-mail</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Telefone / WhatsApp</label>
                    <input
                      required
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Endereço</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Cidade</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">CEP</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.zip}
                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all"
                >
                  Continuar para Pagamento
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button onClick={() => setStep('info')} className="flex items-center gap-2 text-zinc-500 mb-6 hover:text-zinc-900">
                <ArrowLeft className="w-4 h-4" /> Voltar para entrega
              </button>
              <h2 className="text-3xl font-bold mb-8">Forma de Pagamento</h2>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handlePayment('PIX')}
                  disabled={loading}
                  className="flex items-center justify-between p-6 border-2 border-zinc-100 rounded-2xl hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">PIX</p>
                      <p className="text-sm text-zinc-500">Aprovação instantânea</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 border-2 border-zinc-200 rounded-full group-hover:border-emerald-500" />
                </button>
                
                <button
                  onClick={() => handlePayment('Cartão')}
                  disabled={loading}
                  className="flex items-center justify-between p-6 border-2 border-zinc-100 rounded-2xl hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Cartão de Crédito</p>
                      <p className="text-sm text-zinc-500">Até 12x sem juros</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 border-2 border-zinc-200 rounded-full group-hover:border-emerald-500" />
                </button>

                <button
                  onClick={() => handlePayment('WhatsApp')}
                  disabled={loading}
                  className="flex items-center justify-between p-6 border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 transition-all group bg-emerald-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Finalizar via WhatsApp</p>
                      <p className="text-sm text-zinc-500">Combine a entrega e receba o link de pagamento</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 border-2 border-zinc-200 rounded-full group-hover:border-emerald-500" />
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-zinc-400 font-bold">Pagamento Online Direto</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.loading('Redirecionando para o Mercado Pago...');
                    setTimeout(() => {
                      handlePayment('Mercado Pago');
                    }, 2000);
                  }}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 p-6 bg-[#009EE3] text-white rounded-2xl hover:bg-[#0089C7] transition-all font-bold text-lg"
                >
                  Pagar com Mercado Pago
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="bg-zinc-50 p-10 rounded-3xl border border-black/5 h-fit">
          <h3 className="text-xl font-bold mb-6">Resumo do Pedido</h3>
          <div className="space-y-4 mb-8">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold bg-zinc-200 w-6 h-6 rounded-full flex items-center justify-center">{item.quantity}</span>
                  <span className="text-zinc-600">{item.name}</span>
                </div>
                <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-emerald-600">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
