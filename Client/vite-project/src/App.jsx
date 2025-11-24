import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./pages/Header"
import AuthForms from "./components/AuthForms"
// ייבוא הדף שיצרתי עבור יצירת/עדכון פרופיל מוזיקאי
import CreateMusicianProfile from "./pages/CreateMusicianProfile"

function App() {







  return (
    <>
      <div>
        <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<div>HOME</div>} />
          <Route path="/authforms" element={<AuthForms />} />
          <Route path="/musician/create" element={<CreateMusicianProfile />} />
        

          
        </Routes>
          
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
