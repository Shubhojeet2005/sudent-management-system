import { useState } from 'react'

export const useFetch = (fn)=>{
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const run = async (...args)=>{
    setLoading(true); setError(null)
    try{ const res = await fn(...args); setLoading(false); return res }
    catch(e){ setError(e); setLoading(false); throw e }
  }
  return {loading,error,run}
}
