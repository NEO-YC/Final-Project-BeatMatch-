import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import Header from "./pages/Header";
import AuthForms from "./components/AuthForms";
import CreateMusicianProfile from "./pages/CreateMusicianProfile";
import EditMusicianProfile from "./pages/EditMusicianProfile";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Footer from "./pages/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MusicianProfile from "./pages/MusicianProfile";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [isMusician, setIsMusician] = useState(false);

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
          if (profile && profile.musicianProfile) {
            setIsMusician(true);
          } else {
            setIsMusician(false);
          }
        } catch (err) {
          setIsMusician(false);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setUser(null);
        setIsMusician(false);
      }
    } else {
      setUser(null);
      setIsMusician(false);
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
            <Route path="/" element={<Home isLoggedIn={!!user} isMusician={isMusician} userName={user?.displayName} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<AuthForms />} />
            <Route path="/login" element={<AuthForms />} />
            <Route path="/musician/create" element={<CreateMusicianProfile />} />
            <Route path="/musician/edit" element={<EditMusicianProfile />} />
            <Route path="/musician/:id" element={<MusicianProfile />} /> //search for musician by id
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
