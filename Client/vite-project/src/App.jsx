import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<AuthForms />} />
            <Route path="/login" element={<AuthForms />} />
            <Route path="/musician/create" element={<CreateMusicianProfile />} />
            <Route path="/musician/edit" element={<EditMusicianProfile />} />
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
