import React, { useState, useRef, useEffect } from 'react'
import { generatePdfFromElement } from './pdfUtils'

const ACTIVITY_PRESETS = [
  'City Tour', 'City Walk', 'Beach Time', 'Museum Visit', 'Theme Park', 'Free Time', 'Shopping', 'Dinner Cruise'
]

const TEMPLATES = [
  {
    id: 'singapore-4d',
    title: 'Singapore - 4 Days',
    travelers: 2,
    hotel: { name: 'Marina Bay Hotel', city: 'Singapore', checkin: '', checkout: '', nights: 3 },
    flight: { dep: 'DEL', arr: 'SIN' },
    payment: [{installment:'Installment 1', amount:'₹10,000', due:''}],
    days: [
      { date: '', morning: 'Arrival & City Intro', afternoon: 'Marina Bay Sands visit', evening: 'Night Safari' },
      { date: '', morning: 'Gardens by the Bay', afternoon: 'Sentosa Beach', evening: 'Dinner at Clarke Quay' },
      { date: '', morning: 'Singapore Zoo', afternoon: 'Shopping', evening: 'Leisure' },
      { date: '', morning: 'Check-out & Transfer', afternoon: '', evening: '' }
    ]
  },
  {
    id: 'beach-weekend',
    title: 'Beach Weekend - 3 Days',
    travelers: 4,
    hotel: { name: 'Seaside Resort', city: 'Goa', checkin: '', checkout: '', nights: 2 },
    flight: { dep: '', arr: '' },
    payment: [{installment:'Full Payment', amount:'₹8,000', due:''}],
    days: [
      { date: '', morning: 'Arrival & Beach Time', afternoon: 'Water Sports', evening: 'Beach BBQ' },
      { date: '', morning: 'Sightseeing', afternoon: 'Relax at Resort', evening: 'Local Market' },
      { date: '', morning: 'Pack & Checkout', afternoon: '', evening: '' }
    ]
  }
]

function DayCard({day, index, updateDay, removeDay, quickAdd, cloneDay, moveDay}){
  const [target, setTarget] = React.useState('afternoon')
  return (
    <div className="p-4 border rounded-lg bg-white mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Day {index+1}</h3>
        <div className="flex items-center gap-2">
          <input type="date" className="p-1 border rounded text-sm" value={day.date||''} onChange={e=>updateDay(index,{...day,date:e.target.value})} />
          <button title="Clone" className="text-sm text-blue-600" onClick={()=>cloneDay(index)}>Clone</button>
          <button title="Move up" className="text-sm text-gray-600" onClick={()=>moveDay(index,'up')}>↑</button>
          <button title="Move down" className="text-sm text-gray-600" onClick={()=>moveDay(index,'down')}>↓</button>
          <button className="text-sm text-red-600" onClick={()=>removeDay(index)}>Remove</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <textarea placeholder="Morning" value={day.morning} onChange={e=>updateDay(index,{...day,morning:e.target.value})} className="p-2 border rounded resize-none h-20" />
        <textarea placeholder="Afternoon" value={day.afternoon} onChange={e=>updateDay(index,{...day,afternoon:e.target.value})} className="p-2 border rounded resize-none h-20" />
        <textarea placeholder="Evening" value={day.evening} onChange={e=>updateDay(index,{...day,evening:e.target.value})} className="p-2 border rounded resize-none h-20" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-600">Add to:</div>
          <div className="flex gap-1">
            <button onClick={()=>setTarget('morning')} className={`px-2 py-1 text-xs rounded ${target==='morning'?'bg-violet-600 text-white':'bg-gray-100'}`}>M</button>
            <button onClick={()=>setTarget('afternoon')} className={`px-2 py-1 text-xs rounded ${target==='afternoon'?'bg-violet-600 text-white':'bg-gray-100'}`}>A</button>
            <button onClick={()=>setTarget('evening')} className={`px-2 py-1 text-xs rounded ${target==='evening'?'bg-violet-600 text-white':'bg-gray-100'}`}>E</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ACTIVITY_PRESETS.map((a,idx)=> (
            <button key={idx} onClick={()=> quickAdd(index,a,target)} className="text-xs px-2 py-1 bg-gray-100 rounded border">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [title,setTitle]=useState('Singapore Itinerary')
  const [travelers,setTravelers]=useState(2)
  const [days,setDays]=useState([{morning:'',afternoon:'',evening:'',date:''}])
  const [hotel,setHotel]=useState({name:'',city:'',checkin:'',checkout:'',nights:0})
  const [flight,setFlight]=useState({dep:'',arr:''})
  const [payment,setPayment]=useState([{installment:'1',amount:'',due:''}])
  const [showTemplates, setShowTemplates] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  // load draft if present
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('itinerary:draft')
      if(raw){ setHasDraft(true) }
    }catch(e){}
  },[])

  // autosave (throttled)
  useEffect(()=>{
    const id = setTimeout(()=>{
      const payload = { title, travelers, days, hotel, flight, payment }
      try{ localStorage.setItem('itinerary:draft', JSON.stringify(payload)); setHasDraft(true) }catch(e){}
    }, 800)
    return ()=> clearTimeout(id)
  },[title,travelers,days,hotel,flight,payment])

  function loadDraft(){
    try{
      const raw = localStorage.getItem('itinerary:draft')
      if(!raw) return
      const p = JSON.parse(raw)
      setTitle(p.title||'')
      setTravelers(p.travelers||1)
      setDays(p.days||[])
      setHotel(p.hotel||{})
      setFlight(p.flight||{})
      setPayment(p.payment||[])
      setHasDraft(false)
    }catch(e){ console.error(e) }
  }

  function clearDraft(){ localStorage.removeItem('itinerary:draft'); setHasDraft(false) }

  const pdfRef = useRef()

  function addDay(){
    setDays(d=>[...d,{morning:'',afternoon:'',evening:'',date:''}])
  }
  function cloneDay(i){
    setDays(d=>{ const item = d[i]; const copy = {...item}; const out = [...d]; out.splice(i+1,0,copy); return out })
  }
  function moveDay(i, dir){
    setDays(d=>{
      const out = [...d]
      const j = dir==='up'? i-1 : i+1
      if(j<0 || j>=out.length) return out
      const temp = out[j]; out[j]=out[i]; out[i]=temp; return out
    })
  }
  function updateDay(i, val){
    setDays(d=>d.map((it,idx)=> idx===i?val:it))
  }
  function removeDay(i){
    setDays(d=>d.filter((_,idx)=>idx!==i))
  }

  function quickAdd(i, activity, target = 'afternoon'){
    setDays(d=>d.map((it,idx)=> {
      if(idx!==i) return it
      const existing = it[target] || ''
      const newVal = existing ? existing + '; ' + activity : activity
      return {...it, [target]: newVal}
    }))
  }

  function addPayment(){
    setPayment(p=>[...p,{installment:`Installment ${p.length+1}`,amount:'',due:''}])
  }

  function loadTemplate(id){
    const t = TEMPLATES.find(x=>x.id===id)
    if(!t) return
    setTitle(t.title)
    setTravelers(t.travelers)
    setHotel(t.hotel)
    setFlight(t.flight)
    setPayment(t.payment)
    setDays(t.days)
    setShowTemplates(false)
  }

  function generatePDF(){
    const element = pdfRef.current
    const filename = `${title.replace(/\s+/g,'_')}.pdf`
    generatePdfFromElement(element, filename)
  }

  // compute nights from hotel dates when possible
  React.useEffect(()=>{
    try{
      if(hotel.checkin && hotel.checkout){
        const ci = new Date(hotel.checkin)
        const co = new Date(hotel.checkout)
        const diff = Math.round((co - ci) / (1000*60*60*24))
        setHotel(h=>({...h,nights: diff>0?diff:0}))
      }
    }catch(e){}
  },[hotel.checkin, hotel.checkout])

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-3">Choose a template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEMPLATES.map(t=> (
                <div key={t.id} className="p-3 border rounded">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{t.days.length} days · {t.travelers} travelers</div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={()=>loadTemplate(t.id)}>Use</button>
                    <button className="btn btn-ghost" onClick={()=>setShowTemplates(false)}>Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Itinerary Details</h2>
            <div className="mb-3 text-sm text-gray-600">Tip: Use templates to start quickly or edit fields directly. Your work autosaves.</div>
            <div className="flex gap-2 mb-3">
              <button className="btn btn-ghost" onClick={()=>setShowTemplates(true)}>Start from Template</button>
              {hasDraft && <button className="btn" onClick={loadDraft}>Restore Draft</button>}
              {hasDraft && <button className="btn btn-ghost" onClick={clearDraft}>Clear Draft</button>}
            </div>
            <label className="block mb-2 text-sm">Trip Title</label>
            <input className="w-full p-2 border rounded mb-3" value={title} onChange={e=>setTitle(e.target.value)} />

            <label className="block mb-2 text-sm">Travelers</label>
            <input type="number" className="w-full p-2 border rounded mb-3" value={travelers} onChange={e=>setTravelers(e.target.value)} />

            <h3 className="font-semibold mt-3">Hotel</h3>
            <input placeholder="Hotel name" className="w-full p-2 border rounded mb-2" value={hotel.name} onChange={e=>setHotel({...hotel,name:e.target.value})} />
            <input placeholder="City" className="w-full p-2 border rounded mb-2" value={hotel.city} onChange={e=>setHotel({...hotel,city:e.target.value})} />
            <div className="flex gap-2">
              <input type="date" className="w-1/2 p-2 border rounded" value={hotel.checkin} onChange={e=>setHotel({...hotel,checkin:e.target.value})} />
              <input type="date" className="w-1/2 p-2 border rounded" value={hotel.checkout} onChange={e=>setHotel({...hotel,checkout:e.target.value})} />
            </div>

            <h3 className="font-semibold mt-3">Flight / Transport</h3>
            <input placeholder="Departure" className="w-full p-2 border rounded mb-2" value={flight.dep} onChange={e=>setFlight({...flight,dep:e.target.value})} />
            <input placeholder="Arrival" className="w-full p-2 border rounded mb-2" value={flight.arr} onChange={e=>setFlight({...flight,arr:e.target.value})} />

            <h3 className="font-semibold mt-3">Payment Plan</h3>
            <div className="border rounded p-3 bg-gray-50">
              <div className="grid grid-cols-3 gap-2 font-semibold text-sm mb-2">
                <div>Installment</div>
                <div>Amount</div>
                <div>Due</div>
              </div>
              {payment.map((p,idx)=> (
                <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                  <input className="p-2 border rounded text-sm" value={p.installment} onChange={e=> setPayment(prev=> prev.map((it,i)=> i===idx?{...it,installment:e.target.value}:it))} />
                  <input className="p-2 border rounded text-sm" placeholder="Amount" value={p.amount} onChange={e=> setPayment(prev=> prev.map((it,i)=> i===idx?{...it,amount:e.target.value}:it))} />
                  <input className="p-2 border rounded text-sm" placeholder="Due" value={p.due} onChange={e=> setPayment(prev=> prev.map((it,i)=> i===idx?{...it,due:e.target.value}:it))} />
                </div>
              ))}
              <div className="mt-2">
                <button className="px-3 py-1 bg-purple-600 text-white rounded" onClick={addPayment}>Add Installment</button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={addDay}>Add Day</button>
              <div className="ml-auto">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={generatePDF}>Get Itinerary</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-6 bg-white rounded shadow mb-4 pdf-card">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Preview (PDF content)</h2>
              <div className="pdf-header-actions">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={generatePDF}>Download PDF</button>
              </div>
            </div>

            <div className="pdf-wrapper">
              <div ref={pdfRef} className="pdf-page">
                <div className="preview-hero no-break">
                  <div className="preview-avatar">VB</div>
                  <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <div className="preview-meta">{days.length} days · {travelers} travelers</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm">{hotel.city}</div>
                    <div className="text-sm">{hotel.checkin} - {hotel.checkout}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="section-title mb-2">Hotel</div>
                    <div className="summary-card no-break">
                      <div className="font-semibold">{hotel.name || 'Hotel Name'}</div>
                      <div>{hotel.city}</div>
                      <div>{hotel.checkin} - {hotel.checkout} ({hotel.nights} nights)</div>
                    </div>
                  </div>

                  <div>
                    <div className="section-title mb-2">Flight</div>
                    <div className="summary-card no-break">
                      <div>Departure: {flight.dep}</div>
                      <div>Arrival: {flight.arr}</div>
                    </div>
                  </div>

                  <div>
                    <div className="section-title mb-2">Payment</div>
                    <div className="summary-card no-break">
                      <div className="payment-table-container">
                        <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-600"><th>Installment</th><th>Amount</th><th>Due</th></tr>
                        </thead>
                        <tbody>
                          {payment.map((p,idx)=> (
                            <tr key={idx}>
                              <td className="py-1" data-label="Installment">{p.installment}</td>
                              <td data-label="Amount">{p.amount}</td>
                              <td data-label="Due">{p.due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="spacer" />

                <div>
                    {days.map((d,idx)=> (
                    <div key={idx} className="mb-4 p-3 border rounded no-break">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Day {idx+1}</div>
                        <div className="text-sm text-gray-500">Date: {d.date || 'TBD'}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <div className="font-semibold text-sm">Morning</div>
                          <div className="text-sm">{d.morning || '—'}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Afternoon</div>
                          <div className="text-sm">{d.afternoon || '—'}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Evening</div>
                          <div className="text-sm">{d.evening || '—'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded shadow">
            <h2 className="text-lg font-bold mb-4">Days</h2>
            {days.map((d,i)=> (
              <DayCard key={i} day={d} index={i} updateDay={updateDay} removeDay={removeDay} quickAdd={quickAdd} cloneDay={cloneDay} moveDay={moveDay} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
