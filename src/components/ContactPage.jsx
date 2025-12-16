import { useState } from 'react';

function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      return;
    }

    // Тук по-късно можем да добавим реално изпращане (Supabase / email service)
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-sm font-semibold tracking-wide text-[#ec4899] uppercase mb-2">
          Свържи се с нас
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Контакт с екипа на Drink Tonight
        </h1>
        <p className="text-slate-300 max-w-2xl">
          Имаш идея, партньорство, технически въпрос или просто искаш да ни дадеш обратна връзка?
          Пиши ни и ще се свържем с теб възможно най-скоро.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)] gap-10">
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5" htmlFor="name">
                Име
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Как да се обърнем към теб?"
                className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5" htmlFor="email">
                Имейл
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5" htmlFor="message">
                Съобщение
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Разкажи ни повече..."
                className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe] focus:border-transparent resize-none"
              />
            </div>

            {status === 'success' && (
              <p className="text-sm text-emerald-400">
                Благодарим ти! Съобщението е изпратено. Ще се свържем с теб скоро.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-400">
                Моля, попълни всички полета, преди да изпратиш съобщението.
              </p>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#bc13fe] text-white text-sm font-semibold shadow-lg hover:brightness-110 hover:shadow-[#bc13fe]/40 transition-all"
            >
              Изпрати съобщението
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Данни за контакт</h2>
            <p className="text-sm text-slate-300 mb-4">
              Използвай формата или ни пиши директно, ако предпочиташ.
            </p>
            <div className="space-y-3 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Имейл:</span>{' '}
                <span className="text-[#00c8ff]">support@drink-tonight.bg</span>
              </p>
              <p>
                <span className="text-slate-400">За партньорства:</span>{' '}
                <span className="text-[#00c8ff]">partners@drink-tonight.bg</span>
              </p>
              <p>
                <span className="text-slate-400">Телефон:</span>{' '}
                <span className="text-slate-100">+359 88 000 0000</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">За собственици на заведения</h3>
            <p className="text-sm text-slate-300">
              Ако искаш твоето заведение да бъде част от Drink Tonight, изпрати ни кратко описание и
              контакт за връзка. Ще ти отговорим с повече детайли и следващи стъпки.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default ContactPage;


