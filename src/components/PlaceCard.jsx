import { useRef, useState } from 'react';

function PlaceCard({ place, isLoggedIn, openLogin }) {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showReserve, setShowReserve] = useState(false);

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
        {isLoggedIn && (
          <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-slate-900/80 text-white shadow-md grid place-items-center hover:scale-105 transition">❤</button>
        )}
        <button
          onClick={toggleMute}
          className={`absolute top-3 ${isLoggedIn ? 'right-14' : 'right-3'} h-9 px-3 rounded-full bg-slate-900/80 text-white shadow-md flex items-center gap-1 hover:scale-105 transition`}
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
              {place.distance}
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
            {place.category}
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
          <button
            onClick={() => (isLoggedIn ? setShowReserve((v) => !v) : openLogin())}
            className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold"
          >
            {showReserve ? 'Затвори' : 'Резервирай'}
          </button>
        </div>

        {showReserve && (
          <form className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Име</label>
              <input type="text" placeholder="Име и фамилия" className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Хора</label>
              <input type="number" min="1" defaultValue="2" className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Телефон</label>
              <input type="tel" placeholder="08xxxxxxxx" className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowReserve(false)} className="px-3 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm">Отмени</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 font-semibold">Изпрати</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PlaceCard;


