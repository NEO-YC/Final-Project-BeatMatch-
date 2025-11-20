import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./pages/Header"
import AuthForms from "./components/AuthForms"
import Footer from "./pages/Footer"

function App() {







  return (
    <>
      <div>
        <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/*" element={<div>בית</div>} />
          <Route path="/authforms" element={<AuthForms />} />
        

        </Routes>

          <Footer /> 
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
