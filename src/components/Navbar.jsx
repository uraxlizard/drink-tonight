import { useEffect, useState, useRef } from 'react';

function Navbar({ isLoggedIn, accountType, reservationNotifications, reservationDetails, onOpenLogin, onOpenRegister, onLogout }) {
  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const onHash = () => setCurrentHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const linkBase = 'transition-colors font-semibold';
  const inactive = 'text-slate-300 hover:text-[#ec4899]';
  const active = 'text-[#bc13fe]';
  const linkClass = (hash) => `${linkBase} ${currentHash === hash || (hash === '' && (currentHash === '' || currentHash === '#')) ? active : inactive}`;
  return (
    <nav className="bg-slate-900/80 backdrop-blur shadow-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-extrabold text-white flex items-center">
              <span className="text-[#00c8ff] filter drop-shadow-[0_0_8px_#00c8ff]">X</span>IT
            </span>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className={linkClass('')}>НАЧАЛО</a>
              <a href="#map" className={linkClass('#map')}>МЕСТА</a>
              <a href="#about" className={linkClass('#about')}>ЗА НАС</a>
              <a href="#contact" className={linkClass('#contact')}>КОНТАКТИ</a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <a href="#profile" className={`px-4 py-2 ${linkClass('#profile')} flex items-center gap-2`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>

                  ПРОФИЛ
                </a>
                {accountType === 'business' && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-slate-300 hover:text-[#bc13fe] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                      {reservationNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ec4899] text-white text-xs font-bold flex items-center justify-center border-2 border-slate-900">
                          {reservationNotifications > 9 ? '9+' : reservationNotifications}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-slate-800">
                          <h3 className="text-lg font-bold text-white">Известия</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {reservationDetails.length === 0 ? (
                            <div className="p-6 text-center">
                              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-800/50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-slate-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                              </div>
                              <p className="text-slate-400 text-sm">Няма нови известия</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-800">
                              {reservationDetails.map((reservation) => (
                                <a
                                  key={reservation.id}
                                  href="#profile"
                                  onClick={() => setShowNotifications(false)}
                                  className="block p-4 hover:bg-slate-800/50 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white font-semibold text-sm truncate">{reservation.name}</div>
                                      <div className="text-slate-400 text-xs mt-1 truncate">{reservation.placeName}</div>
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold border ${
                                      reservation.status === 'confirmed' 
                                        ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                    }`}>
                                      {reservation.status === 'confirmed' ? 'Потвърдена' : 'Изчаква'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {reservation.guests} {reservation.guests === 1 ? 'човек' : 'души'} • {new Date(reservation.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {reservationDetails.length > 0 && (
                          <div className="p-3 border-t border-slate-800">
                            <a
                              href="#profile"
                              onClick={() => setShowNotifications(false)}
                              className="block text-center text-sm text-[#bc13fe] hover:brightness-110 font-semibold"
                            >
                              Виж всички резервации
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all font-semibold"
                >
                  ИЗХОД
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-slate-300 hover:text-[#ec4899] transition-colors font-semibold"
                >
                  ВХОД
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  РЕГИСТРАЦИЯ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


