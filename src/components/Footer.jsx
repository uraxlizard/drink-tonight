function Footer() {
  return (
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
  );
}

export default Footer;


