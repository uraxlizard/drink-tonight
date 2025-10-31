import { useEffect, useState } from 'react';

function Navbar({ isLoggedIn, accountType, onOpenLogin, onOpenRegister, onLogout }) {
  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    const onHash = () => setCurrentHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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
              <a href="#places" className={linkClass('#places')}>МЕСТА</a>
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


