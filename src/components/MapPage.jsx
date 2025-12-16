import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

// Примерни места около центъра на София
const PLACES = [
  {
    id: 1,
    name: 'Neon Bar',
    category: 'Коктейл бар',
    lat: 42.6977,
    lng: 23.3219,
    description: 'Авторски коктейли, неонова атмосфера и DJ сетове през уикенда.'
  },
  {
    id: 2,
    name: 'Basement Club',
    category: 'Нощен клуб',
    lat: 42.6995,
    lng: 23.3235,
    description: 'Дълбок бас, хип-хоп & RnB парти до късно.'
  },
  {
    id: 3,
    name: 'Rooftop Lounge',
    category: 'Sky bar',
    lat: 42.6965,
    lng: 23.3195,
    description: 'Панорамен изглед към града, по-лежерна атмосфера и шиша.'
  },
  {
    id: 4,
    name: 'Craft Tap House',
    category: 'Бирария',
    lat: 42.6988,
    lng: 23.318,
    description: 'Над 30 вида крафт бира и приятелска атмосфера.'
  },
  {
    id: 5,
    name: 'Electro Warehouse',
    category: 'Underground',
    lat: 42.6955,
    lng: 23.3245,
    description: 'Техно, хаус и специални ивенти в индустриална среда.'
  }
];

function MapPage() {
  const [hoveredPlace, setHoveredPlace] = useState(null);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#00c8ff] uppercase mb-1">
            Карта на нощния живот
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Къде да излезеш тази вечер
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base">
            Разгледай карта с подбрани примерни локации. В реалната версия тук ще виждаш
            заведенията от Drink Tonight с актуална информация за тази вечер.
          </p>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl shadow-slate-950/40 h-[460px] bg-slate-950">
        <MapContainer
          center={[42.6977, 23.3219]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {PLACES.map((place) => (
            <CircleMarker
              key={place.id}
              center={[place.lat, place.lng]}
              radius={10}
              pathOptions={{
                color: '#bc13fe',
                fillColor: '#bc13fe',
                fillOpacity: hoveredPlace?.id === place.id ? 0.7 : 0.4
              }}
              eventHandlers={{
                mouseover: () => setHoveredPlace(place),
                mouseout: () => setHoveredPlace((current) => (current?.id === place.id ? null : current))
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={0.9}>
                <div className="text-xs">
                  <div className="font-semibold">{place.name}</div>
                  <div className="text-[10px] text-slate-200">{place.category}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {hoveredPlace && (
          <div className="pointer-events-none absolute bottom-4 left-4 max-w-sm">
            <div className="pointer-events-auto rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-4 sm:p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#ec4899] font-semibold">
                    Избрано място
                  </p>
                  <h2 className="text-lg font-bold text-white">{hoveredPlace.name}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{hoveredPlace.category}</p>
                </div>
              </div>
              <p className="text-sm text-slate-200 mt-3 leading-relaxed">
                {hoveredPlace.description}
              </p>
              <p className="mt-3 text-[11px] text-slate-400">
                * Данните са примерни. В бъдеще тук ще виждаш реални заведения от Drink Tonight.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MapPage;


