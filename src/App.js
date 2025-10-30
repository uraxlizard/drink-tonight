import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PlacesSection from './components/PlacesSection';
import RegisterModal from './components/RegisterModal';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';
import { supabase } from './lib/supabaseClient';

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setIsLoggedIn(!!data.session);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => {
      isMounted = false;
      subscription.subscription?.unsubscribe?.();
    };
  }, []);

  // Mock data for places - will be replaced with API data later
  const places = [
    {
      id: 1,
      name: "Club 33 - София",
      category: "Folk CLUB",
      rating: 3.9,
      distance: "0.5 km",
      image: "https://zavedenia-sofia.com/files/objects/47/main_image/8f198bf1a4a511ff2a80ae50297b46c0.jpg",
      youtubeId: "suH-vw1CR2A",
      video: "https://videos.pexels.com/video-files/3373847/3373847-uhd_2560_1440_30fps.mp4",
      tonight: { name: "Азис", role: "Специален гост" },
      description: "„CLUB 33″ e последният проект на създателите на култовия „Night Flight“.",
      features: ["Паркинг", "Възможност за плащане с карта"],
      workingHours: "22:00 - 05:00",
      vip: true,
      adultOnly: true
    },
    {
      id: 2,
      name: "Brew & Bites",
      category: "Gastropub",
      rating: 4.6,
      distance: "1.2 km",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4",
      tonight: { name: "Chef Petrov", role: "Burger Week Special" },
      description: "Local brewery with delicious pub food and great atmosphere",
      features: ["Craft Beer", "Comfort Food", "Pet Friendly"],
      vip: false,
      adultOnly: true
    },
    {
      id: 3,
      name: "Rooftop Lounge",
      category: "Rooftop Bar",
      rating: 4.9,
      distance: "0.8 km",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/3404863/3404863-uhd_2560_1440_24fps.mp4",
      tonight: { name: "Bella Jazz Trio", role: "Acoustic Live" },
      description: "Stunning city views with premium drinks and small plates",
      features: ["City Views", "Premium Drinks", "Reservations"],
      vip: false,
      adultOnly: false
    },
    {
      id: 4,
      name: "Cozy Corner Café",
      category: "Café & Bar",
      rating: 4.5,
      distance: "1.5 km",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/2675517/2675517-uhd_2560_1440_25fps.mp4",
      tonight: { name: "Latte Art Challenge", role: "Barista Show" },
      description: "Perfect spot for coffee by day, cocktails by night",
      features: ["Coffee", "Brunch", "WiFi"],
      vip: false,
      adultOnly: false
    },
    {
      id: 5,
      name: "Wine & Dine",
      category: "Wine Bar",
      rating: 4.7,
      distance: "2.0 km",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/854083/854083-hd_1920_1080_25fps.mp4",
      tonight: { name: "Sommelier Elena", role: "Wine Tasting" },
      description: "Extensive wine selection paired with Mediterranean cuisine",
      features: ["Wine Tasting", "Fine Dining", "Romantic"],
      vip: false,
      adultOnly: true
    },
    {
      id: 6,
      name: "The Craft Taproom",
      category: "Taproom",
      rating: 4.6,
      distance: "1.8 km",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      video: "https://videos.pexels.com/video-files/3180268/3180268-uhd_2560_1440_30fps.mp4",
      tonight: { name: "Indie Night", role: "Local Bands" },
      description: "40+ craft beers on tap with mouth-watering burgers",
      features: ["Many Taps", "Burgers", "Sports TV"],
      vip: false,
      adultOnly: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenRegister={() => setShowRegisterModal(true)}
        onLogout={() => supabase.auth.signOut()}
      />

      {/* No hero section per request */}

      <PlacesSection places={places} isLoggedIn={isLoggedIn} onOpenLogin={() => setShowLoginModal(true)} />

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
