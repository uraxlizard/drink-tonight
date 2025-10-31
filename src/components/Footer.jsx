function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900/80 backdrop-blur border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="text-2xl font-extrabold text-white flex items-center mb-3">
              <span className="text-[#00c8ff] filter drop-shadow-[0_0_8px_#00c8ff]">X</span>IT
            </div>
            <p className="text-slate-400 leading-relaxed">
              Твоя навигатор за нощен живот.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Открий</h4>
            <ul className="space-y-2">
              <li><a href="#places" className="transition-colors hover:text-[#ec4899]">Места</a></li>
              <li><a href="#about" className="transition-colors hover:text-[#ec4899]">За нас</a></li>
              <li><a href="#contact" className="transition-colors hover:text-[#ec4899]">Контакти</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Акаунт</h4>
            <ul className="space-y-2">
              <li><a href="#" className="transition-colors hover:text-[#ec4899]">Вход</a></li>
              <li><a href="#" className="transition-colors hover:text-[#ec4899]">Регистрация</a></li>
              <li><a href="#profile" className="transition-colors hover:text-[#ec4899]">Профил</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Поддръжка</h4>
            <ul className="space-y-2">
              <li><a href="#" className="transition-colors hover:text-[#ec4899]">Помощен център</a></li>
              <li><a href="#" className="transition-colors hover:text-[#ec4899]">Контакт</a></li>
              <li><a href="#" className="transition-colors hover:text-[#ec4899]">Поверителност</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-800 text-center text-slate-500">
          <p>
            <span className="text-[#00c8ff] font-semibold">XIT</span> · &copy; {year} · Всички права запазени. Създадено от <a href="https://github.com/uraxlizard" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#ec4899]">Angel Boyarov</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


