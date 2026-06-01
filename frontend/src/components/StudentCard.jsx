import React from 'react'

export default function StudentCard({student}){
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700}}>{student?.fullName || 'Name'}</div>
          <div className="small">{student?.enrollmentNo}</div>
        </div>
        <div className="small">Semester {student?.semester}</div>
      </div>
    </div>
  )
}
