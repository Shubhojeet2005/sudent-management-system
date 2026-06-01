import React from 'react'
import { NavLink } from 'react-router-dom'

const NavItem = ({to, children}) => (
  <NavLink to={to} style={({isActive})=>({padding:'8px',borderRadius:6,background:isActive?"#eef2ff":"transparent",textDecoration:'none',color:'#111827'})}>{children}</NavLink>
)

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div style={{marginBottom:16,fontWeight:700}}>Navigation</div>
      <div className="list">
        <NavItem to="/">Dashboard</NavItem>
        <NavItem to="/students">Students</NavItem>
        <NavItem to="/attendance">Attendance</NavItem>
        <NavItem to="/results">Results</NavItem>
        <NavItem to="/courses">Courses</NavItem>
        <NavItem to="/faculty">Faculty</NavItem>
        <NavItem to="/notice">Notices</NavItem>
        <NavItem to="/profile">Profile</NavItem>
      </div>
    </aside>
  )
}
