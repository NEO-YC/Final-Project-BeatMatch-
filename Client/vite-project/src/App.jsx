import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import Header from "./pages/Header";
import AuthForms from "./components/AuthForms";
import CreateMusicianProfile from "./pages/CreateMusicianProfile";
import EditMusicianProfile from "./pages/EditMusicianProfile";
import PaymentSuccess from "./pages/PaymentSuccess";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Footer from "./pages/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MusicianProfile from "./pages/MusicianProfile";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import MyEvents from "./pages/MyEvents";
import AdminDashboard from "./pages/AdminDashboard";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [isMusician, setIsMusician] = useState(false);
  const [profileActive, setProfileActive] = useState(null);

  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const displayName = userName || decoded.email?.split('@')[0] || 'משתמש';
        setUser({ 
          email: decoded.email, 
          userId: decoded.userId,
          displayName: displayName
        });
        
        // Check if user is a musician
        try {
          const profile = await api.getMyMusicianProfile();
          console.log('[App] RAW Profile response:', JSON.stringify(profile, null, 2));
          
          if (profile && profile.musicianProfile) {
            setIsMusician(true);
            const isActive = !!profile.musicianProfile.isActive;
            setProfileActive(isActive);
            console.log('[App] Musician detected!');
            console.log('[App] isActive value:', profile.musicianProfile.isActive);
            console.log('[App] isActive converted:', isActive);
            console.log('[App] profileActive state will be set to:', isActive);
          } else {
            setIsMusician(false);
            setProfileActive(null);
            console.log('[App] Not a musician or no profile');
          }
        } catch (err) {
          console.error('[App] Error loading musician profile:', err);
          setIsMusician(false);
          setProfileActive(null);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setUser(null);
        setIsMusician(false);
        setProfileActive(null);
      }
    } else {
      setUser(null);
      setIsMusician(false);
      setProfileActive(null);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  return (
    <div className="app-shell">
      <BrowserRouter>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home isLoggedIn={!!user} isMusician={isMusician} profileActive={profileActive} user={user} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<AuthForms />} />
            <Route path="/login" element={<AuthForms />} />
            <Route path="/musician/create" element={<CreateMusicianProfile />} />
            <Route path="/musician/edit" element={<EditMusicianProfile />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/musician/:id" element={<MusicianProfile />} /> //search for musician by id
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<Events />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
