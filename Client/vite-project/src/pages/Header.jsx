import React from 'react'   
import { NavLink } from 'react-router-dom'
import "./Header.css"

function Header() {
    






  return (
    <div>
        <header>
        <h1>MUSIC PROJECT</h1>
        </header>
        <nav>
            <NavLink to="/">Home </NavLink>
            <NavLink to="/authforms">טופס הרשמה והתחברות </NavLink>
     
        </nav>
    </div>
  )
}

export default Header