import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function BusinessProfilePage({ fullName, email, lastSignInAt, accountType }) {
  // Profile-like settings
  const [nameInput, setNameInput] = useState(fullName || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('Липсва метод на плащане');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pmName, setPmName] = useState('');
  const [pmCard, setPmCard] = useState('');
  const [pmExp, setPmExp] = useState('');
  const [pmCvc, setPmCvc] = useState('');
  const [pmSaving, setPmSaving] = useState(false);
  const [pmMsg, setPmMsg] = useState('');

  // Add place (moved to modal)
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    rating: '',
    distance: '',
    image: '',
    youtube_id: '',
    video: '',
    tonight_name: '',
    tonight_role: '',
    description: '',
    features: '',
    working_hours: '',
    vip: false,
    adult_only: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Manage existing places by this account
  const [myPlaces, setMyPlaces] = useState([]);
  const [loadingMyPlaces, setLoadingMyPlaces] = useState(true);
  const [editingPlace, setEditingPlace] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameMsg('');
    if (!nameInput.trim()) {
      setNameMsg('Моля, въведете име.');
      return;
    }
    try {
      setSavingName(true);
      const { error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } });
      if (error) throw error;
      setNameMsg('Името е обновено успешно.');
    } catch (err) {
      setNameMsg('Грешка при запис: ' + (err?.message || 'Опитайте отново.'));
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    if (!newPass || newPass.length < 6) {
      setPassMsg('Паролата трябва да е поне 6 символа.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg('Паролите не съвпадат.');
      return;
    }
    try {
      setSavingPass(true);
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setCurPass('');
      setNewPass('');
      setConfirmPass('');
      setPassMsg('Паролата е сменена успешно.');
      setTimeout(() => setShowPassModal(false), 600);
    } catch (err) {
      setPassMsg('Грешка при смяна на парола: ' + (err?.message || 'Опитайте отново.'));
    } finally {
      setSavingPass(false);
    }
  };

  const maskCard = (num) => {
    const digits = (num || '').replace(/\D/g, '');
    if (digits.length < 4) return '**** **** **** ****';
    const last4 = digits.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setPmMsg('');
    if (!pmName.trim() || !pmCard.trim() || !pmExp.trim()) {
      setPmMsg('Моля, попълнете всички полета.');
      return;
    }
    try {
      setPmSaving(true);
      setPaymentMethod(`${pmName.trim()} • ${maskCard(pmCard)}`);
      setPmName('');
      setPmCard('');
      setPmExp('');
      setPmCvc('');
      setPmMsg('Запазено успешно.');
      setTimeout(() => setShowPaymentModal(false), 600);
    } catch (err) {
      setPmMsg('Грешка при запазване.');
    } finally {
      setPmSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.name.trim()) {
      setMsg('Моля, въведете име на мястото.');
      return;
    }
    try {
      setSaving(true);
      const tonight = (form.tonight_name || form.tonight_role)
        ? { name: form.tonight_name || null, role: form.tonight_role || null }
        : null;
      const featuresArray = form.features
        ? form.features.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const payload = {
        name: form.name.trim(),
        category: form.category || null,
        rating: form.rating ? Number(form.rating) : null,
        distance: form.distance || null,
        image: form.image || null,
        youtube_id: form.youtube_id || null,
        video: form.video || null,
        tonight,
        description: form.description || null,
        features: featuresArray.length ? featuresArray : null,
        working_hours: form.working_hours || null,
        vip: !!form.vip,
        adult_only: !!form.adult_only,
      };
      if (editingPlace) {
        const { error } = await supabase.from('places').update(payload).eq('id', editingPlace.id);
        if (error) throw error;
        setMsg('Мястото е обновено успешно.');
        // Refresh list
        await loadMyPlaces();
        setEditingPlace(null);
        setShowPlaceModal(false);
      } else {
        const { error } = await supabase.from('places').insert(payload);
        if (error) throw error;
        setMsg('Мястото е добавено успешно.');
        // Refresh list
        await loadMyPlaces();
      }
      setForm({
        name: '', category: '', rating: '', distance: '', image: '', youtube_id: '', video: '',
        tonight_name: '', tonight_role: '', description: '', features: '', working_hours: '', vip: false, adult_only: false,
      });
    } catch (err) {
      setMsg('Грешка при запис: ' + (err?.message || 'Опитайте отново.'));
    } finally {
      setSaving(false);
    }
  };

  const loadMyPlaces = async () => {
    try {
      setLoadingMyPlaces(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setMyPlaces([]);
        return;
      }
      const { data, error } = await supabase
        .from('places')
        .select('id, name, category, rating, distance, image, youtube_id, video, tonight, description, features, working_hours, vip, adult_only')
        .eq('user_id', userId)
        .order('id', { ascending: true });
      if (error) throw error;
      setMyPlaces(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load my places', e);
    } finally {
      setLoadingMyPlaces(false);
    }
  };

  useEffect(() => {
    loadMyPlaces();
  }, []);

  const openCreatePlace = () => {
    setEditingPlace(null);
    setForm({
      name: '', category: '', rating: '', distance: '', image: '', youtube_id: '', video: '',
      tonight_name: '', tonight_role: '', description: '', features: '', working_hours: '', vip: false, adult_only: false,
    });
    setMsg('');
    setShowPlaceModal(true);
  };

  const openEditPlace = (place) => {
    setEditingPlace(place);
    setForm({
      name: place.name || '',
      category: place.category || '',
      rating: place.rating || '',
      distance: place.distance || '',
      image: place.image || '',
      youtube_id: place.youtube_id || '',
      video: place.video || '',
      tonight_name: place.tonight?.name || '',
      tonight_role: place.tonight?.role || '',
      description: place.description || '',
      features: (place.features || []).join(', '),
      working_hours: place.working_hours || '',
      vip: !!place.vip,
      adult_only: !!place.adult_only,
    });
    setMsg('');
    setShowPlaceModal(true);
  };

  const handleDeletePlace = async (id) => {
    try {
      setDeletingId(id);
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) throw error;
      setMyPlaces((arr) => arr.filter((p) => p.id !== id));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Delete failed', e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="business-profile" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">Бизнес профил</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div>
            <div className="text-white font-bold text-lg">{fullName || 'Бизнес акаунт'}</div>
            <div className="text-slate-400 text-sm">{email || 'user@example.com'}</div>
          </div>
          <div className="mt-8 text-sm text-slate-400">
            <b>Тип акаунт:</b> <br /> <span className="text-slate-200 text-blue-500">ФИРМЕН</span>
          </div>
          <div className="mt-2 text-sm text-slate-400">
            <b>Последно влизане:</b> <br /> {lastSignInAt ? new Date(lastSignInAt).toLocaleString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            <b>Метод на плащане:</b> <br /> <span className="text-slate-200">{paymentMethod}</span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h2 className="text-lg font-bold text-white mb-4">Настройки на профила</h2>
            <form className="grid grid-cols-1 sm:grid-cols-3 gap-3" onSubmit={handleSaveName}>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Име и фамилия</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]"
                />
              </div>
              <div className="sm:col-span-1 flex items-end">
                <button type="submit" disabled={savingName} className="w-full px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed">{savingName ? 'Запис...' : 'Запази'}</button>
              </div>
              {nameMsg && <div className="sm:col-span-3 text-sm text-slate-300">{nameMsg}</div>}
            </form>

            <div className="mt-6 h-px bg-slate-800" />
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setShowPassModal(true)} className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold">Смени парола</button>
              <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all font-semibold">Метод на плащане</button>
              <button onClick={openCreatePlace} className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all font-semibold">Добави място</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h2 className="text-lg font-bold text-white mb-4">Моите места</h2>
        {loadingMyPlaces ? (
          <div className="text-slate-400 text-sm">Зареждане...</div>
        ) : myPlaces.length === 0 ? (
          <div className="text-slate-400 text-sm">Все още няма добавени места от този акаунт.</div>
        ) : (
          <div className="space-y-3">
            {myPlaces.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">{p.name}</div>
                  <div className="text-slate-400 text-xs">{p.category || '—'} • Рейтинг: {p.rating ?? '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditPlace(p)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700">Редактирай</button>
                  <button onClick={() => handleDeletePlace(p.id)} disabled={deletingId === p.id} className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-sm hover:bg-red-600 disabled:opacity-60">
                    {deletingId === p.id ? 'Изтриване...' : 'Изтрий'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPlaceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 relative border border-slate-800">
            <button onClick={() => setShowPlaceModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl">×</button>
            <h2 className="text-lg font-bold text-white mb-4">{editingPlace ? 'Редактирай място' : 'Добави ново място'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Име</label>
            <input value={form.name} onChange={update('name')} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Категория</label>
            <input value={form.category} onChange={update('category')} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Рейтинг</label>
              <input value={form.rating} onChange={update('rating')} type="number" step="0.1" min="0" max="5" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Дистанция</label>
              <input value={form.distance} onChange={update('distance')} type="text" placeholder="напр. 0.5 km" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Снимка (URL)</label>
            <input value={form.image} onChange={update('image')} type="url" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">YouTube ID</label>
            <input value={form.youtube_id} onChange={update('youtube_id')} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Видео (URL)</label>
            <input value={form.video} onChange={update('video')} type="url" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Изпълнител (тази вечер)</label>
            <input value={form.tonight_name} onChange={update('tonight_name')} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Роля (DJ/Шеф и т.н.)</label>
            <input value={form.tonight_role} onChange={update('tonight_role')} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Описание</label>
            <textarea value={form.description} onChange={update('description')} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Особености (разделени със запетая)</label>
            <input value={form.features} onChange={update('features')} type="text" placeholder="Паркинг, WiFi, ..." className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Работно време</label>
            <input value={form.working_hours} onChange={update('working_hours')} type="text" placeholder="22:00 - 05:00" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
          </div>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-slate-300 text-sm"><input checked={form.vip} onChange={update('vip')} type="checkbox" /> VIP</label>
            <label className="inline-flex items-center gap-2 text-slate-300 text-sm"><input checked={form.adult_only} onChange={update('adult_only')} type="checkbox" /> 18+</label>
          </div>
          {msg && <div className="md:col-span-2 text-sm text-slate-300">{msg}</div>}
              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowPlaceModal(false)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm">Отмени</button>
          <div className="md:col-span-2 flex items-center justify-end">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Запис...' : (editingPlace ? 'Запази промените' : 'Добави място')}
            </button>
          </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-800">
            <button onClick={() => setShowPassModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl">×</button>
            <h3 className="text-xl font-bold text-white mb-4">Смяна на парола</h3>
            <form className="grid grid-cols-1 gap-3" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1 whitespace-nowrap">Текуща парола</label>
                <input value={curPass} onChange={(e) => setCurPass(e.target.value)} type="password" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1 whitespace-nowrap">Нова парола</label>
                <input value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1 whitespace-nowrap">Потвърди парола</label>
                <input value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} type="password" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
              </div>
              {passMsg && <div className="text-sm text-slate-300">{passMsg}</div>}
              <div className="flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowPassModal(false)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm">Отмени</button>
                <button type="submit" disabled={savingPass} className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed">{savingPass ? 'Запис...' : 'Смени'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-800">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl">×</button>
            <h3 className="text-xl font-bold text-white mb-4">Добавяне на метод на плащане</h3>
            <form className="grid grid-cols-1 gap-3" onSubmit={handleSavePayment}>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Име на картодържател</label>
                <input value={pmName} onChange={(e) => setPmName(e.target.value)} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Номер на карта</label>
                <input value={pmCard} onChange={(e) => setPmCard(e.target.value)} inputMode="numeric" pattern="[0-9\s]*" placeholder="1234 5678 9012 3456" type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Валидна до</label>
                  <input value={pmExp} onChange={(e) => setPmExp(e.target.value)} placeholder="MM/YY" type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">CVC</label>
                  <input value={pmCvc} onChange={(e) => setPmCvc(e.target.value)} inputMode="numeric" maxLength={4} type="text" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#bc13fe]" />
                </div>
              </div>
              {pmMsg && <div className="text-sm text-slate-300">{pmMsg}</div>}
              <div className="flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm">Отмени</button>
                <button type="submit" disabled={pmSaving} className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed">{pmSaving ? 'Запис...' : 'Запази'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default BusinessProfilePage;


