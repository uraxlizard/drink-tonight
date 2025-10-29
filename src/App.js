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
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
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

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock data for places - will be replaced with API data later
  const places = [
    {
      id: 1,
      name: "Club 33 - София",
      category: "Folk CLUB",
      rating: 3.9,
      distance: "0.5 km",
      image: "https://zavedenia-sofia.com/files/objects/47/main_image/8f198bf1a4a511ff2a80ae50297b46c0.jpg",
      youtubeId: "suH-vw1CR2A",
      video: "https://videos.pexels.com/video-files/3373847/3373847-uhd_2560_1440_30fps.mp4",
      tonight: { name: "Азис", role: "Специален гост" },
      description: "„CLUB 33″ e последният проект на създателите на култовия „Night Flight“.",
      features: ["Паркинг", "Възможност за плащане с карта"],
      workingHours: "22:00 - 05:00",
      vip: true,
      adultOnly: true
    },
    {
      id: 2,
      name: "Brew & Bites",
      category: "Gastropub",
      rating: 4.6,
      distance: "1.2 km",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4",
      tonight: { name: "Chef Petrov", role: "Burger Week Special" },
      description: "Local brewery with delicious pub food and great atmosphere",
      features: ["Craft Beer", "Comfort Food", "Pet Friendly"],
      vip: false,
      adultOnly: true
    },
    {
      id: 3,
      name: "Rooftop Lounge",
      category: "Rooftop Bar",
      rating: 4.9,
      distance: "0.8 km",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/3404863/3404863-uhd_2560_1440_24fps.mp4",
      tonight: { name: "Bella Jazz Trio", role: "Acoustic Live" },
      description: "Stunning city views with premium drinks and small plates",
      features: ["City Views", "Premium Drinks", "Reservations"],
      vip: false,
      adultOnly: false
    },
    {
      id: 4,
      name: "Cozy Corner Café",
      category: "Café & Bar",
      rating: 4.5,
      distance: "1.5 km",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/2675517/2675517-uhd_2560_1440_25fps.mp4",
      tonight: { name: "Latte Art Challenge", role: "Barista Show" },
      description: "Perfect spot for coffee by day, cocktails by night",
      features: ["Coffee", "Brunch", "WiFi"],
      vip: false,
      adultOnly: false
    },
    {
      id: 5,
      name: "Wine & Dine",
      category: "Wine Bar",
      rating: 4.7,
      distance: "2.0 km",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/854083/854083-hd_1920_1080_25fps.mp4",
      tonight: { name: "Sommelier Elena", role: "Wine Tasting" },
      description: "Extensive wine selection paired with Mediterranean cuisine",
      features: ["Wine Tasting", "Fine Dining", "Romantic"],
      vip: false,
      adultOnly: true
    },
    {
      id: 6,
      name: "The Craft Taproom",
      category: "Taproom",
      rating: 4.6,
      distance: "1.8 km",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/3180268/3180268-uhd_2560_1440_30fps.mp4",
      tonight: { name: "Indie Night", role: "Local Bands" },
      description: "40+ craft beers on tap with mouth-watering burgers",
      features: ["Many Taps", "Burgers", "Sports TV"],
      vip: false,
      adultOnly: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-slate-900/80 backdrop-blur shadow-md sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-extrabold text-white flex items-center">
                <span className="text-[#00c8ff] filter drop-shadow-[0_0_8px_#00c8ff]">X</span>IT
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#places" className="text-slate-300 hover:text-[#ec4899] transition-colors font-semibold">
                Места
              </a>
              <a href="#about" className="text-slate-300 hover:text-[#ec4899] transition-colors font-semibold">
                За нас
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-slate-300 hover:text-[#ec4899] transition-colors font-semibold"
              >
                Вход
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* No hero section per request */}

      {/* Places Section */}
      <section id="places" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Къде ще бъде довечера?
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Избра ли сме едни от най-добрите места само на минути разтояние от теб!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm font-semibold hover:bg-slate-800">Най-висок рейтинг</button>
            <button className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm font-semibold hover:bg-slate-800">Най-близо</button>
          </div>
        </div>

        {/* Vertical feed */}
        <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl space-y-6 snap-y snap-mandatory">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} isLoggedIn={isLoggedIn} openLogin={() => setShowLoginModal(true)} />
          ))}
        </div>
      </section>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-800">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-2">Създай акаунт</h2>
            <p className="text-slate-400 mb-6">Присъедини се, за да откриваш невероятни места</p>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoggedIn(true);
                setShowRegisterModal(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Име и фамилия
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
                  placeholder="Иван Иванов"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Имейл
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
                  placeholder="ivan@example.com"
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
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#bc13fe] text-white rounded-lg hover:brightness-110 transition-all font-semibold text-lg"
              >
                Регистрация
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-400">
              Вече имаш акаунт?{' '}
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
                className="text-[#bc13fe] hover:brightness-110 font-semibold"
              >
                Вход
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-800">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-2">Добре дошъл отново</h2>
            <p className="text-slate-400 mb-6">Влез в акаунта си</p>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoggedIn(true);
                setShowLoginModal(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Имейл
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
                  placeholder="ivan@example.com"
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
              <button
                type="submit"
                className="w-full py-3 bg-[#bc13fe] text-white rounded-lg hover:brightness-110 transition-all font-semibold text-lg"
              >
                Вход
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-400">
              Нямаш акаунт?{' '}
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
                className="text-[#bc13fe] hover:brightness-110 font-semibold"
              >
                Регистрация
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🍹 Drink Tonight</h3>
              <p className="text-gray-400">
                Открий най-добрите места за напитки и храна във вашия район.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Открий</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Места</a></li>
                <li><a href="#" className="hover:text-white">Карта</a></li>
                <li><a href="#" className="hover:text-white">Категории</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Акаунт</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Вход</a></li>
                <li><a href="#" className="hover:text-white">Регистрация</a></li>
                <li><a href="#" className="hover:text-white">Профил</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Поддръжка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Помощен център</a></li>
                <li><a href="#" className="hover:text-white">Контакт</a></li>
                <li><a href="#" className="hover:text-white">Политика за поверителност</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Drink Tonight. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
