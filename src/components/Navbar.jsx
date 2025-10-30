function Navbar({ isLoggedIn, onOpenLogin, onOpenRegister, onLogout }) {
  return (
    <nav className="bg-slate-900/80 backdrop-blur shadow-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-extrabold text-white flex items-center">
              <span className="text-[#00c8ff] filter drop-shadow-[0_0_8px_#00c8ff]">X</span>IT
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#places" className="text-slate-300 hover:text-[#ec4899] transition-colors font-semibold">
              Места
            </a>
            <a href="#about" className="text-slate-300 hover:text-[#ec4899] transition-colors font-semibold">
              За нас
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <a href="#profile" className="px-4 py-2 text-slate-300 hover:text-[#ec4899] transition-colors font-semibold">Профил</a>
                <button
                  onClick={onLogout}
                  className="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all font-semibold"
                >
                  Изход
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-slate-300 hover:text-[#ec4899] transition-colors font-semibold"
                >
                  Вход
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Регистрация
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


