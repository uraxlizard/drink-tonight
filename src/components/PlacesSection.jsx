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

      <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl space-y-6 snap-y snap-mandatory">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} isLoggedIn={isLoggedIn} openLogin={onOpenLogin} />
        ))}
      </div>
    </section>
  );
}

export default PlacesSection;


