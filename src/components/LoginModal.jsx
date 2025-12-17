import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translateError } from '../lib/errorTranslations';

function LoginModal({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      onLoginSuccess?.();
      onClose();
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
        >
          ×
        </button>
        <h2 className="text-3xl font-extrabold text-white mb-2">Добре дошъл отново</h2>
        <p className="text-slate-400 mb-6">Влез в акаунта си</p>
        {error && (
          <div className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Имейл
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
              placeholder="ivan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Парола
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-slate-400">Запомни ме</span>
            </label>
            <a href="#" className="text-sm text-[#bc13fe] hover:brightness-110">
              Забравена парола?
            </a>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#bc13fe] text-white rounded-lg hover:brightness-110 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Моля изчакайте…' : 'Вход'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Нямаш акаунт?{' '}
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister?.();
            }}
            className="text-[#bc13fe] hover:brightness-110 font-semibold"
          >
            Регистрация
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;


