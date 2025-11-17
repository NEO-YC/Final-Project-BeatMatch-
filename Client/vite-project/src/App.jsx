import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./pages/Header"
import AuthForms from "./components/AuthForms"

function App() {







  return (
    <>
      <div>
        <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/*" element={<div>HOME</div>} />
          <Route path="/authforms" element={<AuthForms />} />
        

          
        </Routes>
          
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
