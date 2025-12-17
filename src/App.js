import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const dispatch = useDispatch();
  const {
    ui: { showRegisterModal, showLoginModal, currentPage },
    auth: { isLoggedIn, fullName, email, lastSignInAt, accountType, userId },
    places: { list: places },
    notifications: { reservationNotifications, reservationDetails }
  } = useSelector((state) => state);

  const getPageFromHash = () => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#profile')) return 'profile';
    if (hash.startsWith('#about')) return 'about';
    if (hash.startsWith('#contact')) return 'contact';
    if (hash.startsWith('#map')) return 'map';
    return 'home';
  };

  const getProfileTab = (accType) => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#profile/')) {
      const tab = hash.replace('#profile/', '');
      // For business accounts: settings, places, reservations
      // For normal accounts: settings, reservations, favorites
      const validTabs = accType === 'business' 
        ? ['settings', 'places', 'reservations']
        : ['settings', 'reservations', 'favorites'];
      return validTabs.includes(tab) ? tab : 'settings';
    }
    return 'settings'; // default tab
  };

  // Initialize currentPage from hash on mount
  useEffect(() => {
    dispatch({ type: 'ui/setCurrentPage', payload: getPageFromHash() });
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const session = data.session;
      const meta = session?.user?.user_metadata || {};
      const identities = session?.user?.identities || [];
      const identityData = identities[0]?.identity_data || {};
      const nameFromMeta = meta.full_name || meta.fullName || meta.name;
      const name = nameFromMeta || identityData.full_name || identityData.name || '';
      const acc = meta.accountType || identityData.accountType;
      const normalized = acc === 'business' || acc === 'firm' ? 'business' : 'normal';
      dispatch({
        type: 'auth/setSession',
        payload: {
          isLoggedIn: !!session,
          fullName: name,
          email: session?.user?.email || identityData.email || meta.email || '',
          createdAt: session?.user?.created_at || identityData.created_at || '',
          lastSignInAt: session?.user?.last_sign_in_at || identityData.last_sign_in_at || '',
          accountType: normalized,
          userId: session?.user?.id || null
        }
      });
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const meta = session?.user?.user_metadata || {};
      const identities = session?.user?.identities || [];
      const identityData = identities[0]?.identity_data || {};
      const nameFromMeta = meta.full_name || meta.fullName || meta.name;
      const name = nameFromMeta || identityData.full_name || identityData.name || '';
      const acc = meta.accountType || identityData.accountType;
      const normalized = acc === 'business' || acc === 'firm' ? 'business' : 'normal';
      dispatch({
        type: 'auth/setSession',
        payload: {
          isLoggedIn: !!session,
          fullName: name,
          email: session?.user?.email || identityData.email || meta.email || '',
          createdAt: session?.user?.created_at || identityData.created_at || '',
          lastSignInAt: session?.user?.last_sign_in_at || identityData.last_sign_in_at || '',
          accountType: normalized,
          userId: session?.user?.id || null
        }
      });
    });
    const onHash = () => {
      dispatch({ type: 'ui/setCurrentPage', payload: getPageFromHash() });
    };
    window.addEventListener('hashchange', onHash);
    return () => {
      isMounted = false;
      subscription.subscription?.unsubscribe?.();
      window.removeEventListener('hashchange', onHash);
    };
  }, [dispatch]);

  // Places data from Supabase
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
        dispatch({ type: 'places/setPlaces', payload: mapped });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // Load reservation notifications for business accounts
  useEffect(() => {
    if (!isLoggedIn || accountType !== 'business' || !userId) {
      dispatch({
        type: 'notifications/setReservations',
        payload: { count: 0, details: [] }
      });
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
            dispatch({
              type: 'notifications/setReservations',
              payload: { count: 0, details: [] }
            });
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
          dispatch({
            type: 'notifications/setReservations',
            payload: {
              count: reservationsWithPlaceNames.length,
              details: reservationsWithPlaceNames
            }
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load reservation notifications', e);
        if (!cancelled) {
          dispatch({
            type: 'notifications/setReservations',
            payload: { count: 0, details: [] }
          });
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
  }, [isLoggedIn, accountType, userId, dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        isLoggedIn={isLoggedIn}
        accountType={accountType}
        reservationNotifications={reservationNotifications}
        reservationDetails={reservationDetails}
        onOpenLogin={() => dispatch({ type: 'ui/showLoginModal' })}
        onOpenRegister={() => dispatch({ type: 'ui/showRegisterModal' })}
        onLogout={() => {
          supabase.auth.signOut();
          window.location.hash = '';
          dispatch({ type: 'auth/logout' });
          dispatch({ type: 'ui/setCurrentPage', payload: 'home' });
        }}
      />

      {currentPage === 'profile' && isLoggedIn ? (
        accountType === 'business' ? (
          <BusinessProfilePage
            fullName={fullName}
            email={email}
            lastSignInAt={lastSignInAt}
            accountType={accountType}
            activeTab={getProfileTab(accountType)}
          />
        ) : (
          <ProfilePage
            fullName={fullName}
            email={email}
            lastSignInAt={lastSignInAt}
            accountType={accountType}
            activeTab={getProfileTab(accountType)}
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
          onOpenLogin={() => dispatch({ type: 'ui/showLoginModal' })}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => dispatch({ type: 'ui/hideModals' })}
          onSwitchToLogin={() => dispatch({ type: 'ui/showLoginModal' })}
          onRegisterSuccess={async () => {
            dispatch({ type: 'ui/hideModals' });
            // Reload session from Supabase to get fresh user data
            const { data } = await supabase.auth.getSession();
            const session = data?.session;
            if (session) {
              const meta = session.user?.user_metadata || {};
              const identities = session.user?.identities || [];
              const identityData = identities[0]?.identity_data || {};
              const nameFromMeta = meta.full_name || meta.fullName || meta.name;
              const name = nameFromMeta || identityData.full_name || identityData.name || '';
              const acc = meta.accountType || identityData.accountType;
              const normalized = acc === 'business' || acc === 'firm' ? 'business' : 'normal';
              dispatch({
                type: 'auth/setSession',
                payload: {
                  isLoggedIn: true,
                  fullName: name,
                  email: session.user?.email || identityData.email || meta.email || '',
                  createdAt: session.user?.created_at || identityData.created_at || '',
                  lastSignInAt: session.user?.last_sign_in_at || identityData.last_sign_in_at || '',
                  accountType: normalized,
                  userId: session.user?.id || null
                }
              });
            }
          }}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => dispatch({ type: 'ui/hideModals' })}
          onSwitchToRegister={() => dispatch({ type: 'ui/showRegisterModal' })}
          onLoginSuccess={async () => {
            dispatch({ type: 'ui/hideModals' });
            // Reload session from Supabase to get fresh user data
            const { data } = await supabase.auth.getSession();
            const session = data?.session;
            if (session) {
              const meta = session.user?.user_metadata || {};
              const identities = session.user?.identities || [];
              const identityData = identities[0]?.identity_data || {};
              const nameFromMeta = meta.full_name || meta.fullName || meta.name;
              const name = nameFromMeta || identityData.full_name || identityData.name || '';
              const acc = meta.accountType || identityData.accountType;
              const normalized = acc === 'business' || acc === 'firm' ? 'business' : 'normal';
              dispatch({
                type: 'auth/setSession',
                payload: {
                  isLoggedIn: true,
                  fullName: name,
                  email: session.user?.email || identityData.email || meta.email || '',
                  createdAt: session.user?.created_at || identityData.created_at || '',
                  lastSignInAt: session.user?.last_sign_in_at || identityData.last_sign_in_at || '',
                  accountType: normalized,
                  userId: session.user?.id || null
                }
              });
            }
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
