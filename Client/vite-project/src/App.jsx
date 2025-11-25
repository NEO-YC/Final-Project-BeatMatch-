import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./pages/Header"
import AuthForms from "./components/AuthForms"
// ייבוא הדף שיצרתי עבור יצירת/עדכון פרופיל מוזיקאי
import CreateMusicianProfile from "./pages/CreateMusicianProfile"
import EditMusicianProfile from "./pages/EditMusicianProfile"
import Home from "./pages/Home"

function App() {







  return (
    <>
      <div>
        <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/authforms" element={<AuthForms />} />
          <Route path="/musician/create" element={<CreateMusicianProfile />} />
          <Route path="/musician/edit" element={<EditMusicianProfile />} />
        

          
        </Routes>
          
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
