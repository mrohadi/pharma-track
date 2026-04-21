// PharmaTrack — Driver Mobile Pages (inside IOSDevice)

function MapSVG({ route = true }) {
  return (
    <div style={{ width:'100%', height:'100%', position:'relative', background:'#e8eef4', overflow:'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 390 340" preserveAspectRatio="xMidYMid slice">
        <rect width="390" height="340" fill="#e8eef4"/>
        {/* blocks */}
        {[[0,0,70,90],[80,0,90,90],[180,0,90,90],[280,0,110,90],[0,100,70,80],[0,190,70,80],[0,280,70,60],[80,190,90,80],[80,280,90,60],[180,190,90,80],[180,280,90,60],[280,190,110,80],[280,280,110,60],[80,100,90,80],[280,100,110,80]].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} fill={i%3===0?'#d4dde8':i%3===1?'#cdd8e4':'#d8e2ec'} rx="2"/>
        ))}
        {/* roads horiz */}
        <rect x="0" y="90"  width="390" height="10" fill="white" opacity="0.85"/>
        <rect x="0" y="180" width="390" height="10" fill="white" opacity="0.85"/>
        <rect x="0" y="270" width="390" height="10" fill="white" opacity="0.85"/>
        {/* roads vert */}
        <rect x="70"  y="0" width="10" height="340" fill="white" opacity="0.85"/>
        <rect x="170" y="0" width="10" height="340" fill="white" opacity="0.85"/>
        <rect x="270" y="0" width="10" height="340" fill="white" opacity="0.85"/>
        {/* road labels */}
        {[['Rizal St',35,175],['EDSA',160,175],['Ayala Ave',255,175],['Shaw Blvd',195,95]].map(([t,x,y])=>(
          <text key={t} x={x} y={y} fontSize="8" fill="#9aaccb" fontFamily="system-ui" textAnchor="middle">{t}</text>
        ))}
        {route && <>
          {/* dashed route */}
          <path d="M 75 310 L 75 185 L 175 185 L 175 95 L 275 95" stroke="oklch(0.52 0.18 250)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7,4"/>
          {/* driver current pos */}
          <circle cx="75" cy="310" r="9" fill="oklch(0.52 0.18 250)" opacity="0.25"/>
          <circle cx="75" cy="310" r="6" fill="oklch(0.52 0.18 250)"/>
          <circle cx="75" cy="310" r="3" fill="white"/>
          {/* destination pin */}
          <ellipse cx="275" cy="104" rx="6" ry="2.5" fill="rgba(0,0,0,0.15)"/>
          <path d="M275 64 C265 64 258 71 258 80 C258 92 275 104 275 104 C275 104 292 92 292 80 C292 71 285 64 275 64Z" fill="oklch(0.55 0.2 25)"/>
          <circle cx="275" cy="80" r="5" fill="white"/>
        </>}
      </svg>
      {/* Map attribution badge */}
      <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(255,255,255,0.85)', borderRadius:6, padding:'3px 7px', fontSize:9, color:'#777', fontFamily:'system-ui' }}>Peta PharmaTrack</div>
    </div>
  );
}

function DriverHome({ onTab }) {
  const [activeJob, setActiveJob] = React.useState(null);
  const jobs = [
    { id:'#4828', pharmacy:'Apotek Sehat Jakarta', patient:'Dewi Lestari', address:'Jl. Pemuda No. 45, Jakarta Timur', distance:'2,4 km', est:'12 mnt', pay:'Rp32.000', items:'Atorvastatin 20mg × 2' },
    { id:'#4827', pharmacy:'Guardian Kelapa Gading', patient:'Hendra Gunawan', address:'Jl. Kalimalang, Jakarta Timur', distance:'3,8 km', est:'19 mnt', pay:'Rp41.000', items:'Amoxicillin 500mg × 1' },
  ];
  return (
    <div style={{ background:PT.bg, minHeight:'100%', paddingBottom:90 }}>
      {/* Header */}
      <div style={{ background:PT.sidebar, padding:'56px 16px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:500 }}>Selamat pagi 👋</div>
            <div style={{ color:'#fff', fontSize:20, fontWeight:800, marginTop:2, letterSpacing:'-0.3px' }}>Ari Wibowo</div>
          </div>
          <div style={{ width:38, height:38, borderRadius:999, background:PT.primary, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16 }}>C</div>
        </div>
        {/* Today stats */}
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          {[{l:'Terkirim',v:'9'},{l:'Penghasilan',v:'Rp285.000'},{l:'Rating',v:'⭐ 4.9'}].map(s=>(
            <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 10px 8px', textAlign:'center' }}>
              <div style={{ color:'#fff', fontWeight:800, fontSize:16 }}>{s.v}</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:500, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {/* Online toggle */}
        <div style={{ background:'#fff', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, border:`1px solid ${PT.border}` }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:PT.text }}>Status Saya</div>
            <div style={{ fontSize:12, color:PT.success, fontWeight:600, marginTop:2 }}>● Online — Menerima order</div>
          </div>
          <div style={{ width:44, height:26, background:PT.success, borderRadius:999, position:'relative', cursor:'pointer' }}>
            <div style={{ width:22, height:22, borderRadius:999, background:'#fff', position:'absolute', top:2, right:2, boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
          </div>
        </div>

        {/* Available jobs */}
        <div style={{ fontWeight:700, fontSize:15, color:PT.text, marginBottom:10 }}>Pekerjaan Tersedia ({jobs.length})</div>
        {jobs.map(job=>(
          <div key={job.id} style={{ background:'#fff', borderRadius:12, border:`1.5px solid ${activeJob===job.id?PT.primary:PT.border}`, marginBottom:10, overflow:'hidden', transition:'border-color 0.15s' }}
            onClick={()=>setActiveJob(job.id)}>
            <div style={{ padding:'12px 14px', borderBottom:`1px solid ${PT.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:PT.text }}>{job.id} · {job.pharmacy}</div>
                  <div style={{ fontSize:12, color:PT.muted, marginTop:2 }}>📍 {job.address}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:800, fontSize:16, color:PT.success }}>{job.pay}</div>
                  <div style={{ fontSize:11, color:PT.muted }}>{job.distance}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:PT.muted, marginTop:6 }}>💊 {job.items}</div>
            </div>
            <div style={{ display:'flex', gap:8, padding:'10px 14px' }}>
              <button onClick={e=>{ e.stopPropagation(); onTab('active'); }}
                style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:PT.primary, color:'#fff', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Terima · {job.est}
              </button>
              <button onClick={e=>e.stopPropagation()}
                style={{ width:36, borderRadius:9, border:`1.5px solid ${PT.border}`, background:'#fff', cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <DriverBottomNav active="home" onTab={onTab}/>
    </div>
  );
}

function DriverActive({ onTab }) {
  const [status, setStatus] = React.useState('pickup');
  const order = { id:'#4830', patient:'Siti Rahayu', address:'Jl. Gatot Subroto, Jakarta Sel.', items:'Losartan 50mg × 3', pharmacy:'Kimia Farma Sudirman', pharmacyAddr:'Jl. Sudirman No. 1, Jakarta' };

  const statuses = [
    { id:'pickup',  label:'Menuju Apotek',       icon:'🏥', desc:'Ambil order dari Kimia Farma Sudirman' },
    { id:'picked',  label:'Order Diambil',       icon:'📦', desc:'Dalam perjalanan ke pasien' },
    { id:'arrived', label:'Tiba di Lokasi',      icon:'📍', desc:'Serahkan obat ke pasien' },
    { id:'done',    label:'Berhasil Dikirim!',   icon:'✅', desc:'Ketuk konfirmasi untuk menyelesaikan' },
  ];
  const si = statuses.findIndex(s=>s.id===status);
  const cur = statuses[si];

  return (
    <div style={{ background:PT.bg, display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Map */}
      <div style={{ height:220, flexShrink:0, position:'relative' }}>
        <MapSVG route/>
        {/* ETA overlay */}
        <div style={{ position:'absolute', top:56, left:12, background:'rgba(255,255,255,0.95)', borderRadius:10, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:18, fontWeight:900, color:PT.text }}>14 min</div>
          <div style={{ fontSize:11, color:PT.muted, fontWeight:500 }}>2,3 km lagi</div>
        </div>
        <div style={{ position:'absolute', top:56, right:12, background:'rgba(255,255,255,0.95)', borderRadius:10, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', cursor:'pointer' }}>
          <div style={{ fontSize:18 }}>🧭</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 90px' }}>
        {/* Status steps */}
        <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:12, border:`1px solid ${PT.border}` }}>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {statuses.map((s,i)=>(
              <div key={s.id} style={{ flex:1, height:4, borderRadius:99, background:i<=si?PT.primary:PT.border, transition:'background 0.3s' }}/>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:24 }}>{cur.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:PT.text }}>{cur.label}</div>
              <div style={{ fontSize:12, color:PT.muted }}>{cur.desc}</div>
            </div>
          </div>
        </div>

        {/* Order card */}
        <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:12, border:`1px solid ${PT.border}` }}>
          <div style={{ fontWeight:700, fontSize:13, color:PT.text, marginBottom:10 }}>Order {order.id}</div>
          <div style={{ fontSize:12.5, color:PT.muted, lineHeight:1.9 }}>
            <div>👤 Pasien: <strong style={{color:PT.text}}>{order.patient}</strong></div>
            <div>📍 {order.address}</div>
            <div>💊 {order.items}</div>
            <div>🏥 Dari: {order.pharmacy}</div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button style={{ flex:1, padding:'9px 0', borderRadius:9, border:`1.5px solid ${PT.border}`, background:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, color:PT.text, cursor:'pointer' }}>📞 Hubungi Pasien</button>
            <button style={{ flex:1, padding:'9px 0', borderRadius:9, border:`1.5px solid ${PT.border}`, background:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, color:PT.text, cursor:'pointer' }}>💬 Pesan</button>
          </div>
        </div>

        {/* Action button */}
        {status !== 'done' ? (
          <button onClick={()=>setStatus(statuses[si+1]?.id||'done')}
            style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:PT.primary, color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 16px color-mix(in oklch, ${PT.primary} 40%, transparent)` }}>
            {si===0?'Saya Tiba di Apotek →':si===1?'Order Sudah Diambil →':si===2?'Konfirmasi Pengiriman →':'Tandai Selesai →'}
          </button>
        ) : (
          <button onClick={()=>onTab('history')}
            style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:PT.success, color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 16px color-mix(in oklch, ${PT.success} 40%, transparent)` }}>
            ✓ Pengiriman Selesai — Cari Tugas Berikutnya
          </button>
        )}
      </div>
      <DriverBottomNav active="active" onTab={onTab}/>
    </div>
  );
}

function DriverHistory({ onTab }) {
  const trips = [
    { id:'#4829', patient:'Eko Prasetyo',   addr:'Jl. Thamrin No. 5, Jakpus', pay:'Rp45.000', time:'12 mnt lalu', rating:5, items:'Insulin Glargine × 1' },
    { id:'#4826', patient:'Rina Wulandari', addr:'Jl. MT Haryono, Jaktim',    pay:'Rp32.000', time:'35 mnt lalu', rating:5, items:'Omeprazole 20mg × 1' },
    { id:'#4821', patient:'Agus Susanto',   addr:'Jl. Gatot Subroto, Jaksel', pay:'Rp38.000', time:'1 jam lalu',  rating:4, items:'Atorvastatin 20mg × 2' },
    { id:'#4815', patient:'Fitri Handayani',addr:'Jl. Pemuda, Jaktim',        pay:'Rp42.000', time:'2 jam lalu',  rating:5, items:'Metformin 500mg × 3' },
    { id:'#4810', patient:'Yoga Pratama',   addr:'Jl. Sudirman, Jakpus',      pay:'Rp35.000', time:'3 jam lalu',  rating:5, items:'Losartan 50mg × 1' },
  ];

  return (
    <div style={{ background:PT.bg, minHeight:'100%', paddingBottom:90 }}>
      <div style={{ background:PT.sidebar, padding:'56px 16px 16px' }}>
        <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:500, marginBottom:2 }}>Pengiriman Anda</div>
        <div style={{ color:'#fff', fontSize:20, fontWeight:800, letterSpacing:'-0.3px' }}>History</div>
        {/* Earnings summary */}
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          {[{l:'Penghasilan Hari Ini',v:'Rp285.000'},{l:'Total Perjalanan',v:'412'},{l:'Rata-rata Rating',v:'⭐ 4.9'}].map(s=>(
            <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 8px 8px', textAlign:'center' }}>
              <div style={{ color:'#fff', fontWeight:800, fontSize:15 }}>{s.v}</div>
              <div style={{ color:'rgba(255,255,255,0.45)', fontSize:9.5, fontWeight:500, marginTop:2, lineHeight:1.3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {trips.map(t=>(
          <div key={t.id} style={{ background:'#fff', borderRadius:12, border:`1px solid ${PT.border}`, marginBottom:10, padding:'12px 14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13.5, color:PT.text }}>{t.id} · {t.patient}</div>
                <div style={{ fontSize:12, color:PT.muted, marginTop:2 }}>📍 {t.addr}</div>
                <div style={{ fontSize:12, color:PT.muted }}>💊 {t.items}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:800, fontSize:16, color:PT.success }}>{t.pay}</div>
                <div style={{ fontSize:11, color:PT.muted }}>{t.time}</div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, paddingTop:8, borderTop:`1px solid ${PT.border}` }}>
              <PTBadge label="Delivered" color="green" dot/>
              <div style={{ fontSize:12, color:PT.warning, fontWeight:600 }}>{'⭐'.repeat(t.rating)}</div>
            </div>
          </div>
        ))}
      </div>
      <DriverBottomNav active="history" onTab={onTab}/>
    </div>
  );
}

function DriverBottomNav({ active, onTab }) {
  const tabs = [
    { id:'home',    icon:'🏠', label:'Beranda' },
    { id:'active',  icon:'🚴', label:'Aktif' },
    { id:'history', icon:'📋', label:'Riwayat' },
    { id:'profile', icon:'👤', label:'Profil' },
  ];
  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:74, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)', borderTop:`1px solid ${PT.border}`, display:'flex', zIndex:50 }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onTab(t.id)}
          style={{ flex:1, border:'none', background:'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, paddingBottom:8, fontFamily:'inherit' }}>
          <span style={{ fontSize:22 }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight:600, color:active===t.id?PT.primary:PT.muted }}>{t.label}</span>
          {active===t.id && <div style={{ width:4, height:4, borderRadius:99, background:PT.primary, marginTop:1 }}/>}
        </button>
      ))}
    </div>
  );
}

function DriverApp() {
  const [tab, setTab] = React.useState('home');
  const pages = { home:<DriverHome onTab={setTab}/>, active:<DriverActive onTab={setTab}/>, history:<DriverHistory onTab={setTab}/>, profile:<DriverHome onTab={setTab}/> };
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", height:'100%', position:'relative', overflow:'hidden' }}>
      {pages[tab]||<DriverHome onTab={setTab}/>}
    </div>
  );
}

Object.assign(window, { DriverApp });
