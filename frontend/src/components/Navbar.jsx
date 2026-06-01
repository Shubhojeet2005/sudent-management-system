import React from 'react';

export default function Navbar({onToggle}){
  return (
    <header className="header">
      <div className="logo">CollegeMgmt</div>
      <nav className="nav">
        <button className="btn" onClick={onToggle}>Toggle</button>
      </nav>
    </header>
  )
}
