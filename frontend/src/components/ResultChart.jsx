import React from 'react'

export default function ResultChart({data=[]}){
  // simple svg bar chart
  const max = Math.max(...data.map(d=>d.score), 100)
  return (
    <div className="card">
      <div style={{display:'flex',gap:12,alignItems:'end'}}>
        {data.map((d,i)=> (
          <div key={i} style={{textAlign:'center'}}>
            <div style={{height: (d.score/max)*120 + 'px',width:24,background:'#2563eb',borderRadius:4,marginBottom:6}}></div>
            <div className="small">{d.subject}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
