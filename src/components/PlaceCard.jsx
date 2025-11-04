import { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function PlaceCard({ place, isLoggedIn, accountType, userId, openLogin }) {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const [reservationGuests, setReservationGuests] = useState(2);
  const [reservationNotes, setReservationNotes] = useState('');
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const sendYouTubeCommand = (command) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
  };

  const toggleMute = () => {
    const next = !isMuted;
    if (place.youtubeId) {
      sendYouTubeCommand(next ? 'mute' : 'unMute');
    } else {
      const el = videoRef.current;
      if (el) {
        el.muted = next;
        if (!next) {
          const playPromise = el.play?.();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => {});
          }
        }
      }
    }
    setIsMuted(next);
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setReservationError('');
    
    if (!reservationName.trim()) {
      setReservationError('Моля, въведете име.');
      return;
    }
    if (!reservationPhone.trim()) {
      setReservationError('Моля, въведете телефон.');
      return;
    }
    if (reservationGuests < 1) {
      setReservationError('Броят хора трябва да е поне 1.');
      return;
    }

    try {
      setReservationLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          place_id: place.id,
          user_id: userId,
          name: reservationName.trim(),
          phone: reservationPhone.trim(),
          guests: parseInt(reservationGuests, 10),
          notes: reservationNotes.trim() || null,
          status: 'pending',
        });

      if (insertError) throw insertError;
      
      setReservationSuccess(true);
      // Reset form
      setReservationName('');
      setReservationPhone('');
      setReservationGuests(2);
      setReservationNotes('');
      
      setTimeout(() => {
        setReservationSuccess(false);
        setShowReservationForm(false);
      }, 2000);
    } catch (err) {
      setReservationError(err.message || 'Грешка при изпращане на резервацията. Опитайте отново.');
    } finally {
      setReservationLoading(false);
    }
  };

  return (
    <div
      className={`group bg-slate-900 rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${place.vip ? 'border-pink-500/60 shadow-[0_0_30px_rgba(236,72,153,0.35)]' : 'border-slate-800'} snap-start flex flex-col`}
    >
      {/* Media */}
      <div className="relative aspect-video overflow-hidden bg-black">
        {place.youtubeId ? (
          <iframe
            ref={iframeRef}
            title={place.name}
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${place.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${place.youtubeId}&controls=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            allow="autoplay; encrypted-media;"
            allowFullScreen
          />
        ) : place.video ? (
          <video
            ref={videoRef}
            src={place.video}
            poster={place.image}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />
        ) : (
          <img
            src={place.image}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <button
          onClick={toggleMute}
          className="absolute top-3 right-3 h-9 px-3 rounded-full bg-slate-900/80 text-white shadow-md flex items-center gap-1 hover:scale-105 transition"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {place.tonight && (
            <div className="px-3 py-1 rounded-full border border-fuchsia-400/40 text-fuchsia-200 bg-slate-900/70 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400"></span>
              Тази вечер: {place.tonight.name}
            </div>
          )}
          {place.adultOnly && (
            <div className="h-9 w-9 rounded-full bg-[#bc13fe] text-white text-[11px] font-extrabold flex items-center justify-center border border-[#bc13fe]/60 shadow-[0_0_14px_#bc13fe]">
              18+
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-[#ec4899] text-white text-xs font-bold shadow">
              {place.distance}м
            </div>
            <div className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-xs font-bold shadow flex items-center gap-1">
              <span className="text-[#ec4899]">★</span>
              <span>{place.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Place Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-white tracking-tight">{place.name}</h3>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 text-xs font-bold border border-fuchsia-500/25">
            Категория: {place.category}
          </span>
        </div>
        <p className="mt-2 text-slate-300 line-clamp-2">{place.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {place.features.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-xs font-semibold"
            >
              {feature}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-slate-400">Работно време: {place.workingHours}</div>
          {!(accountType === 'business' && userId && place.userId === userId) && (
            <button
              onClick={() => (isLoggedIn ? setShowReservationForm(!showReservationForm) : openLogin())}
              className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold"
            >
              {showReservationForm ? 'Затвори' : 'Резервирай'}
            </button>
          )}
        </div>

        {showReservationForm && isLoggedIn && (
          <div className="mt-5 pt-5 border-t border-slate-800">
            {reservationSuccess ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#bc13fe]/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-6 w-6 text-[#bc13fe]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-green-400 font-semibold">Резервацията е изпратена успешно!</p>
              </div>
            ) : (
              <>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Форма за резервация</h4>
                {reservationError && (
                  <div className="mb-4 p-3 text-sm text-red-300 bg-red-950/50 border border-red-800/50 rounded-lg">
                    {reservationError}
                  </div>
                )}
                <form onSubmit={handleReservationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                      Име и фамилия *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent transition-all"
                      placeholder="Иван Иванов"
                      value={reservationName}
                      onChange={(e) => setReservationName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent transition-all"
                        placeholder="08xxxxxxxx"
                        value={reservationPhone}
                        onChange={(e) => setReservationPhone(e.target.value)}
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
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent transition-all"
                        value={reservationGuests}
                        onChange={(e) => setReservationGuests(parseInt(e.target.value, 10) || 1)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-2 font-semibold">
                      Бележки (по избор)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent resize-none transition-all"
                      placeholder="Специални изисквания или заявки..."
                      value={reservationNotes}
                      onChange={(e) => setReservationNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReservationForm(false);
                        setReservationError('');
                        setReservationName('');
                        setReservationPhone('');
                        setReservationGuests(2);
                        setReservationNotes('');
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-semibold transition-all"
                    >
                      Отмени
                    </button>
                    <button
                      type="submit"
                      disabled={reservationLoading}
                      className="px-5 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#bc13fe]/20"
                    >
                      {reservationLoading ? 'Изпращане...' : 'Изпрати'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceCard;


