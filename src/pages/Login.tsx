import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao realizar login.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-black/5 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <LogIn className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Bem-vindo de volta</h1>
        <p className="text-zinc-500 mb-10">Acesse sua conta para gerenciar seus pedidos e preferências.</p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-zinc-100 py-4 rounded-2xl font-bold hover:bg-zinc-50 hover:border-zinc-200 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>
      </motion.div>
    </div>
  );
};
