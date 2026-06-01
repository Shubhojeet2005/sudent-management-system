import React from 'react'

export default function NoticeBoard({notices=[]}){
  return (
    <div className="card">
      <h3>Notices</h3>
      <div className="list">
        {notices.length?notices.map((n,i)=>(
          <div key={i} style={{padding:8,borderBottom:'1px solid #eef2ff'}}>
            <div style={{fontWeight:700}}>{n.title}</div>
            <div className="small">{new Date(n.date).toLocaleDateString()}</div>
            <div className="small">{n.message}</div>
          </div>
        )):<div className="small">No notices</div>}
      </div>
    </div>
  )
}
