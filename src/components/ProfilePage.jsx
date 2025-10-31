import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function ProfilePage({ fullName, email, lastSignInAt, accountType, onFullNameChange }) {
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
      onFullNameChange?.(nameInput.trim());
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
      // Here you would call your backend to save payment method safely
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
  return (
    <section id="profile" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">Профил</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div>
            <div className="text-white font-bold text-lg">{fullName || 'Потребител'}</div>
            <div className="text-slate-400 text-sm">{email || 'user@example.com'}</div>
          </div>
          <div className="mt-12 text-sm text-slate-400">
            <b>Тип акаунт:</b> <br /> <span className="text-slate-200 text-green-500">Потребителски</span>
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Любими</h2>
              <span className="text-slate-400 text-sm">скоро</span>
            </div>
            <p className="text-slate-400 text-sm">Все още няма любими места.</p>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Моите резервации</h2>
              <span className="text-slate-400 text-sm">скоро</span>
            </div>
            <p className="text-slate-400 text-sm">Нямаш активни резервации.</p>
          </div>

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
        </div>
      </div>

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

export default ProfilePage;


