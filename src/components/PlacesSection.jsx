import PlaceCard from './PlaceCard';

function PlacesSection({ places, isLoggedIn, onOpenLogin }) {
  return (
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

      {places.length === 0 ? (
        <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-800/70 text-[#bc13fe]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path fillRule="evenodd" d="M4.5 5.25a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v13.5a.75.75 0 0 1-1.28.53l-3.22-3.22H7.5a3 3 0 0 1-3-3V5.25Zm3-1.5a1.5 1.5 0 0 0-1.5 1.5V12a1.5 1.5 0 0 0 1.5 1.5h8.25a.75.75 0 0 1 .53.22l2.22 2.22V5.25a1.5 1.5 0 0 0-1.5-1.5h-9Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-white">Няма налични места</h3>
            <p className="mt-2 text-sm text-slate-400">Все още няма записи в базата данни. Опитайте по-късно или добавете първото място.</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl space-y-6 snap-y snap-mandatory">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} isLoggedIn={isLoggedIn} openLogin={onOpenLogin} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PlacesSection;


