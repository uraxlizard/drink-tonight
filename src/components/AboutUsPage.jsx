import { useState } from 'react';

function AboutUsPage() {
  const sections = [
    {
      id: 'mission',
      title: 'Нашата мисия',
      tag: 'Защо създадохме Drink Tonight',
      description:
        'Искаме да направим излизането вечер по-лесно, по-сигурно и по-вълнуващо – както за гостите, така и за собствениците на заведения.',
      points: [
        'Събираме най-добрите барове, клубове и заведения на едно място.',
        'Даваме реална информация за обстановката тази вечер – не само статични снимки.',
        'Помагаме на бизнеса да запълва свободните места с реални гости, а не със сложни кампании.'
      ]
    },
    {
      id: 'team',
      title: 'Екипът зад проекта',
      tag: 'Хората, които стоят зад идеята',
      description:
        'Drink Tonight е създаден от малък, но амбициозен екип – любители на нощния живот, разработчици и хора от ресторантьорския бранш.',
      points: [
        'Комбинираме опит в софтуерното развитие, маркетинг и управление на заведения.',
        'Работим в тясно партньорство със собственици на барове и клубове.',
        'Слушаме активно обратната връзка от потребителите и подобряваме платформата постоянно.'
      ]
    },
    {
      id: 'how-it-works',
      title: 'Как работи платформата',
      tag: 'За гости и за бизнеси',
      description:
        'Drink Tonight свързва хората, които търсят къде да излязат тази вечер, с местата, които имат какво да предложат точно сега.',
      points: [
        'Потребителите разглеждат заведения, филтрират по категория и атмосфера и виждат актуална информация за вечерта.',
        'Собствениците на заведения могат да управляват профила си, да получават резервации и да следят интереса към своето място.',
        'Резервациите се запазват лесно, а бизнесите получават ясни и подредени заявки.'
      ]
    },
    {
      id: 'join-us',
      title: 'Присъедини се към нас',
      tag: 'За партньори и заведения',
      description:
        'Ако управляваш бар, клуб или друго място за забавление, Drink Tonight може да ти помогне да привлечеш нови гости и да запълниш свободните маси.',
      points: [
        'Създаваме атрактивен профил на твоето заведение с ключова информация и визия.',
        'Получаваш резервации директно през платформата – без сложни интеграции.',
        'Подготвяме още функционалности за лоялност, специални оферти и кампании.'
      ]
    }
  ];

  const defaultSectionId = sections[0].id;
  const currentHash = typeof window !== 'undefined' ? window.location.hash : '#about';
  const fromHash = currentHash.startsWith('#about/')
    ? currentHash.replace('#about/', '')
    : defaultSectionId;

  const initialSection = sections.find((s) => s.id === fromHash) || sections[0];

  const [activeId, setActiveId] = useState(initialSection.id);

  const activeSection = sections.find((s) => s.id === activeId) || sections[0];

  const handleSelect = (id) => {
    setActiveId(id);
    if (typeof window !== 'undefined') {
      window.location.hash = `#about/${id}`;
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-sm font-semibold tracking-wide text-[#ec4899] uppercase mb-2">
          За платформата
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Защо да избереш Drink Tonight
        </h1>
        <p className="text-slate-300 max-w-2xl">
          Тук можеш да научиш повече за това кой стои зад платформата, как работи тя и как може да
          бъде полезна както за теб като гост, така и за твоя бизнес.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
        <aside className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                onClick={() => handleSelect(section.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${
                  isActive
                    ? 'bg-[#bc13fe] text-white shadow-lg shadow-[#bc13fe]/40'
                    : 'bg-slate-900/0 text-slate-300 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wide font-semibold opacity-80">
                  {section.tag}
                </div>
                <div className="text-sm font-bold mt-0.5">{section.title}</div>
              </button>
            );
          })}
        </aside>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {activeSection.title}
            </h2>
            <p className="text-sm text-[#ec4899] font-semibold uppercase tracking-wide">
              {activeSection.tag}
            </p>
          </div>
          <p className="text-slate-200 mb-6 leading-relaxed">{activeSection.description}</p>
          <ul className="space-y-3">
            {activeSection.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full bg-[#bc13fe]/20 text-[#bc13fe] flex items-center justify-center text-xs shrink-0">
                  ✓
                </span>
                <span className="text-slate-200 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

export default AboutUsPage;


