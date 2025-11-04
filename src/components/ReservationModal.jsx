import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function ReservationModal({ onClose, place, onSuccess }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Моля, въведете име.');
      return;
    }
    if (!phone.trim()) {
      setError('Моля, въведете телефон.');
      return;
    }
    if (guests < 1) {
      setError('Броят хора трябва да е поне 1.');
      return;
    }

    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          place_id: place.id,
          user_id: userId,
          name: name.trim(),
          phone: phone.trim(),
          guests: parseInt(guests, 10),
          notes: notes.trim() || null,
          status: 'pending',
        });

      if (insertError) throw insertError;
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Грешка при изпращане на резервацията. Опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative border border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl transition-colors"
        >
          ×
        </button>
        
        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#bc13fe]/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-12 w-12 text-[#bc13fe]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Резервацията е изпратена!</h2>
            <p className="text-slate-400 text-sm md:text-base">Ще получите потвърждение скоро.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Резервирай място</h2>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#bc13fe]"></span>
                <p className="text-slate-300 font-medium">{place?.name}</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-5 p-3 text-sm text-red-300 bg-red-950/50 border border-red-800/50 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                  Име и фамилия *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent transition-all"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent transition-all"
                    placeholder="08xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                    Брой хора *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent transition-all"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                  Бележки (по избор)
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent resize-none transition-all"
                  placeholder="Специални изисквания или заявки..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-semibold transition-all"
                >
                  Отмени
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#bc13fe]/20"
                >
                  {loading ? 'Изпращане...' : 'Изпрати резервация'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReservationModal;

