import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translateError } from '../lib/errorTranslations';

function BusinessProfilePage({ fullName, email, lastSignInAt, accountType, activeTab = 'settings' }) {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);

  // Reservations
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservationsPage, setReservationsPage] = useState(1);
  const [reservationsTab, setReservationsTab] = useState('active'); // 'active' or 'completed'

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
      setNameMsg('Грешка при запис: ' + translateError(err));
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
      setPassMsg('Грешка при смяна на парола: ' + translateError(err));
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
      } else {
        const { error } = await supabase.from('places').insert(payload);
        if (error) throw error;
        setMsg('Мястото е добавено успешно.');
        // Refresh list
        await loadMyPlaces();
      }
      // Close modal after successful save (create or edit)
      setShowPlaceModal(false);
      // Refresh reservations in case place names changed
      await loadReservations();
      setForm({
        name: '', category: '', rating: '', distance: '', image: '', youtube_id: '', video: '',
        tonight_name: '', tonight_role: '', description: '', features: '', working_hours: '', vip: false, adult_only: false,
      });
    } catch (err) {
      setMsg('Грешка при запис: ' + translateError(err));
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
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoadingReservations(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setReservations([]);
        return;
      }
      
      // Get all places owned by this user (with names)
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('id, name')
        .eq('user_id', userId);
      
      if (placesError) throw placesError;
      
      if (!placesData || placesData.length === 0) {
        setReservations([]);
        return;
      }
      
      const placeIds = placesData.map((p) => p.id);
      const placesMap = new Map(placesData.map((p) => [p.id, p.name]));
      
      // Get reservations for these places
      const { data, error } = await supabase
        .from('reservations')
        .select('id, place_id, name, phone, guests, status, notes, created_at')
        .in('place_id', placeIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map place names from placesMap
      const reservationsWithPlaceNames = (data || []).map((res) => ({
        ...res,
        placeName: placesMap.get(res.place_id) || 'Място',
      }));
      
      setReservations(reservationsWithPlaceNames);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load reservations', e);
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Reset page if current page is beyond available pages
  useEffect(() => {
    const itemsPerPage = 5;
    const totalPages = Math.ceil(myPlaces.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [myPlaces.length, currentPage]);

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

  const confirmDeletePlace = (place) => {
    setPlaceToDelete(place);
    setShowDeleteModal(true);
  };

  const handleDeletePlace = async () => {
    if (!placeToDelete) return;
    const id = placeToDelete.id;
    try {
      setDeletingId(id);
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) throw error;
      setMyPlaces((arr) => {
        const newArr = arr.filter((p) => p.id !== id);
        // Reset to page 1 if current page would be empty after deletion
        const itemsPerPage = 5;
        const totalPages = Math.ceil(newArr.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(1);
        }
        return newArr;
      });
      // Refresh reservations after place deletion
      await loadReservations();
      setShowDeleteModal(false);
      setPlaceToDelete(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Delete failed', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTabChange = (tab) => {
    if (typeof window !== 'undefined') {
      window.location.hash = `#profile/${tab}`;
    }
  };

  return (
    <section id="business-profile" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">Бизнес профил</h1>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b border-slate-800">
        <button
          onClick={() => handleTabChange('settings')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'text-[#bc13fe] border-[#bc13fe]'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Настройки
        </button>
        <button
          onClick={() => handleTabChange('places')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'places'
              ? 'text-[#bc13fe] border-[#bc13fe]'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Моите места
        </button>
        <button
          onClick={() => handleTabChange('reservations')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'reservations'
              ? 'text-[#bc13fe] border-[#bc13fe]'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Резервации
        </button>
      </div>

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
          {activeTab === 'settings' && (
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
            </div>
          </div>
          )}

          {activeTab === 'places' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Моите места</h2>
                <button onClick={openCreatePlace} className="px-4 py-2 rounded-lg bg-[#bc13fe] text-white hover:brightness-110 transition-all font-semibold">Добави място</button>
              </div>
        {loadingMyPlaces ? (
          <div className="text-slate-400 text-sm">Зареждане...</div>
        ) : myPlaces.length === 0 ? (
          <div className="text-slate-400 text-sm">Все още няма добавени места от този акаунт.</div>
        ) : (() => {
          const itemsPerPage = 5;
          const totalPages = Math.ceil(myPlaces.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedPlaces = myPlaces.slice(startIndex, endIndex);

          return (
            <>
              <div className="space-y-3">
                {paginatedPlaces.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{p.name}</div>
                      <div className="text-slate-400 text-xs">{p.category || '—'} • Рейтинг: {p.rating ?? '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditPlace(p)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700">Редактирай</button>
                      <button onClick={() => confirmDeletePlace(p)} disabled={deletingId === p.id} className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-sm hover:bg-red-600 disabled:opacity-60">
                        {deletingId === p.id ? 'Изтриване...' : 'Изтрий'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Предишна
                  </button>
                  <span className="text-slate-400 text-sm">
                    Страница {currentPage} от {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Следваща
                  </button>
                </div>
              )}
            </>
          );
        })()}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Резервации</h2>
          <div className="flex items-center gap-2">
            {(() => {
              const activeCount = reservations.filter((r) => r.status !== 'completed').length;
              const completedCount = reservations.filter((r) => r.status === 'completed').length;
              
              return (
                <>
                  <button
                    onClick={() => {
                      setReservationsTab('active');
                      setReservationsPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      reservationsTab === 'active'
                        ? 'bg-[#bc13fe] text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Активни
                    {activeCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        reservationsTab === 'active'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        {activeCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setReservationsTab('completed');
                      setReservationsPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      reservationsTab === 'completed'
                        ? 'bg-[#bc13fe] text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Завършени
                    {completedCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        reservationsTab === 'completed'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        {completedCount}
                      </span>
                    )}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
        {loadingReservations ? (
          <div className="text-slate-400 text-sm">Зареждане...</div>
        ) : (() => {
          // Filter reservations based on active tab
          const filteredReservations = reservationsTab === 'completed'
            ? reservations.filter((r) => r.status === 'completed')
            : reservations.filter((r) => r.status !== 'completed');

          if (filteredReservations.length === 0) {
            return (
              <div className="text-slate-400 text-sm">
                {reservationsTab === 'completed'
                  ? 'Все още няма завършени резервации.'
                  : 'Все още няма активни резервации за вашите места.'}
              </div>
            );
          }

          const itemsPerPage = 5;
          const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
          const startIndex = (reservationsPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

          const getStatusColor = (status) => {
            switch (status) {
              case 'confirmed':
                return 'bg-green-500/20 text-green-300 border-green-500/40';
              case 'completed':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              case 'cancelled':
                return 'bg-red-500/20 text-red-300 border-red-500/40';
              default:
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
            }
          };

          const getStatusText = (status) => {
            switch (status) {
              case 'confirmed':
                return 'Потвърдена';
              case 'completed':
                return 'Завършена';
              case 'cancelled':
                return 'Отменена';
              default:
                return 'Изчаква';
            }
          };

          const handleMarkCompleted = async (reservationId) => {
            try {
              const { error } = await supabase
                .from('reservations')
                .update({ status: 'completed' })
                .eq('id', reservationId);
              
              if (error) throw error;
              
              // Refresh reservations
              await loadReservations();
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('Failed to mark reservation as completed', e);
            }
          };

          return (
            <>
              <div className="space-y-3">
                {paginatedReservations.map((reservation) => (
                  <div key={reservation.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-base">{reservation.name}</div>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <div className="mb-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">За място:</span>
                        <span className="text-[#bc13fe] font-semibold text-sm">{reservation.placeName || 'Място'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400">Телефон:</span>{' '}
                        <span className="text-slate-200">{reservation.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Хора:</span>{' '}
                        <span className="text-slate-200">{reservation.guests}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Дата:</span>{' '}
                        <span className="text-slate-200">
                          {new Date(reservation.created_at).toLocaleString('bg-BG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {reservation.notes && (
                        <div className="col-span-2 mt-2">
                          <span className="text-slate-400">Бележки:</span>{' '}
                          <span className="text-slate-200">{reservation.notes}</span>
                        </div>
                      )}
                    </div>
                    {reservationsTab === 'active' && reservation.status !== 'completed' && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={() => handleMarkCompleted(reservation.id)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold text-sm"
                        >
                          Завършена
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setReservationsPage((prev) => Math.max(1, prev - 1))}
                    disabled={reservationsPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Предишна
                  </button>
                  <span className="text-slate-400 text-sm">
                    Страница {reservationsPage} от {totalPages}
                  </span>
                  <button
                    onClick={() => setReservationsPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={reservationsPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Следваща
                  </button>
                </div>
              )}
            </>
          );
        })()}
            </div>
          )}
        </div>
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

      {showDeleteModal && placeToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative border border-slate-800">
            <button onClick={() => { setShowDeleteModal(false); setPlaceToDelete(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl">×</button>
            <h3 className="text-xl font-bold text-white mb-4">Потвърждение за изтриване</h3>
            <p className="text-slate-300 mb-6">
              Сигурни ли сте, че искате да изтриете мястото <strong className="text-white">{placeToDelete.name}</strong>? Това действие не може да бъде отменено.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setPlaceToDelete(null); }}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm"
              >
                Отмени
              </button>
              <button
                onClick={handleDeletePlace}
                disabled={deletingId === placeToDelete.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingId === placeToDelete.id ? 'Изтриване...' : 'Изтрий'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BusinessProfilePage;


