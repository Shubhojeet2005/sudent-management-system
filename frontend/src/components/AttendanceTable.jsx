import React from 'react'

export default function AttendanceTable({rows}){
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Course</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows?.length?rows.map((r,i)=>(
            <tr key={i}><td>{new Date(r.date).toLocaleDateString()}</td><td>{r.courseName}</td><td>{r.status}</td></tr>
          )):<tr><td colSpan={3} className="small">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
