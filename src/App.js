import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PlacesSection from './components/PlacesSection';
import ProfilePage from './components/ProfilePage';
import BusinessProfilePage from './components/BusinessProfilePage';
import AboutUsPage from './components/AboutUsPage';
import ContactPage from './components/ContactPage';
import MapPage from './components/MapPage';
import RegisterModal from './components/RegisterModal';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';
import { supabase } from './lib/supabaseClient';

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [lastSignInAt, setLastSignInAt] = useState('');
  const [accountType, setAccountType] = useState('normal');
  const [userId, setUserId] = useState(null);

  const getPageFromHash = () => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#profile')) return 'profile';
    if (hash.startsWith('#about')) return 'about';
    if (hash.startsWith('#contact')) return 'contact';
    if (hash.startsWith('#map')) return 'map';
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromHash());
  const [reservationNotifications, setReservationNotifications] = useState(0);
  const [reservationDetails, setReservationDetails] = useState([]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const session = data.session;
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
      const meta = session?.user?.user_metadata || {};
      const identities = session?.user?.identities || [];
      const identityData = identities[0]?.identity_data || {};
      const nameFromMeta = meta.full_name || meta.fullName || meta.name;
      const name = nameFromMeta || identityData.full_name || identityData.name || '';
      setFullName(name);
      setEmail(session?.user?.email || identityData.email || meta.email || '');
      setCreatedAt(session?.user?.created_at || identityData.created_at || '');
      setLastSignInAt(session?.user?.last_sign_in_at || identityData.last_sign_in_at || '');
      const acc = meta.accountType || identityData.accountType;
      const normalized = acc === 'business' || acc === 'firm' ? 'business' : 'normal';
      setAccountType(normalized);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
      const meta = session?.user?.user_metadata || {};
      const identities = session?.user?.identities || [];
      const identityData = identities[0]?.identity_data || {};
      const nameFromMeta = meta.full_name || meta.fullName || meta.name;
      const name = nameFromMeta || identityData.full_name || identityData.name || '';
      setFullName(name);
      setEmail(session?.user?.email || identityData.email || meta.email || '');
      setCreatedAt(session?.user?.created_at || identityData.created_at || '');
      setLastSignInAt(session?.user?.last_sign_in_at || identityData.last_sign_in_at || '');
      const acc = meta.accountType || identityData.accountType;
      const normalized = acc === 'business' || acc === 'firm' ? 'business' : 'normal';
      setAccountType(normalized);
    });
    const onHash = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => {
      isMounted = false;
      subscription.subscription?.unsubscribe?.();
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  // Places data from Supabase
  const [places, setPlaces] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, name, category, rating, distance, image, youtube_id, video, tonight, description, features, working_hours, vip, adult_only, user_id')
        .order('id', { ascending: true });
      if (error) {
        console.warn('Failed to load places from Supabase, using fallback.', error);
        return;
      }
      if (!cancelled) {
        const mapped = (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          rating: Number(row.rating),
          distance: row.distance,
          image: row.image,
          youtubeId: row.youtube_id || null,
          video: row.video || null,
          tonight: row.tonight || null,
          description: row.description,
          features: row.features || [],
          workingHours: row.working_hours || null,
          vip: !!row.vip,
          adultOnly: !!row.adult_only,
          userId: row.user_id || null,
        }));
        setPlaces(mapped);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load reservation notifications for business accounts
  useEffect(() => {
    if (!isLoggedIn || accountType !== 'business' || !userId) {
      setReservationNotifications(0);
      setReservationDetails([]);
      return;
    }

    let cancelled = false;
    const loadNotifications = async () => {
      try {
        // Get all place IDs owned by this user
        const { data: placesData, error: placesError } = await supabase
          .from('places')
          .select('id')
          .eq('user_id', userId);
        
        if (placesError) throw placesError;
        
        if (!placesData || placesData.length === 0) {
          if (!cancelled) {
            setReservationNotifications(0);
            setReservationDetails([]);
          }
          return;
        }
        
        const placeIds = placesData.map((p) => p.id);
        const placesMap = new Map(placesData.map((p) => [p.id, p.name]));
        
        // Get pending/confirmed reservations with details
        const { data, error } = await supabase
          .from('reservations')
          .select('id, place_id, name, phone, guests, status, created_at')
          .in('place_id', placeIds)
          .in('status', ['pending', 'confirmed'])
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (!cancelled) {
          const reservationsWithPlaceNames = (data || []).map((res) => ({
            ...res,
            placeName: placesMap.get(res.place_id) || 'Място',
          }));
          setReservationDetails(reservationsWithPlaceNames);
          setReservationNotifications(reservationsWithPlaceNames.length);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load reservation notifications', e);
        if (!cancelled) {
          setReservationNotifications(0);
          setReservationDetails([]);
        }
      }
    };

    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoggedIn, accountType, userId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        isLoggedIn={isLoggedIn}
        accountType={accountType}
        reservationNotifications={reservationNotifications}
        reservationDetails={reservationDetails}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenRegister={() => setShowRegisterModal(true)}
        onLogout={() => { supabase.auth.signOut(); window.location.hash = ''; setCurrentPage('home'); }}
      />

      {currentPage === 'profile' && isLoggedIn ? (
        accountType === 'business' ? (
          <BusinessProfilePage
            fullName={fullName}
            email={email}
            lastSignInAt={lastSignInAt}
            accountType={accountType}
          />
        ) : (
          <ProfilePage
            fullName={fullName}
            email={email}
            lastSignInAt={lastSignInAt}
            accountType={accountType}
          />
        )
      ) : currentPage === 'about' ? (
        <AboutUsPage />
      ) : currentPage === 'contact' ? (
        <ContactPage />
      ) : currentPage === 'map' ? (
        <MapPage />
      ) : (
        <PlacesSection
          places={places}
          isLoggedIn={isLoggedIn}
          accountType={accountType}
          userId={userId}
          onOpenLogin={() => setShowLoginModal(true)}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => setShowLoginModal(true)}
          onRegisterSuccess={() => setIsLoggedIn(true)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => setShowRegisterModal(true)}
          onLoginSuccess={() => setIsLoggedIn(true)}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
