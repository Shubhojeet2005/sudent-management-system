import React from 'react'
import NoticeBoard from '../components/NoticeBoard'
export default function NoticePage(){
  return (<div className="container"><div className="header"><h2>Notices</h2></div><NoticeBoard notices={[{title:'Exam Schedule',date:Date.now(),message:'Final exams start next month'}]} /></div>)
}
