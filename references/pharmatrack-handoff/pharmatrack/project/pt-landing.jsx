// PharmaTrack — Landing Page

function LandingPage({ onGetStarted }) {
  const features = [
    { icon: '💊', title: 'Manajemen Order Cerdas', desc: 'Apotek membuat dan mengelola order dengan pelacakan status real-time dari pickup hingga pintu pasien.' },
    { icon: '🚴', title: 'Dispatch Driver Otomatis', desc: 'Driver menerima notifikasi instan, navigasi efisien, dan konfirmasi pengiriman langsung dari ponsel.' },
    { icon: '📊', title: 'Pusat Kendali Admin', desc: 'Visibilitas penuh atas semua order, pengguna, dan metrik performa di seluruh jaringan.' },
    { icon: '🔔', title: 'Notifikasi Real-Time', desc: 'Setiap pihak mendapat informasi di setiap langkah — tidak ada update yang terlewat.' },
    { icon: '📍', title: 'Pelacakan Langsung', desc: 'Pasien dan apotek melacak pengiriman di peta langsung dari dispatch hingga tiba.' },
    { icon: '🔒', title: 'Aman & Terpercaya', desc: 'Data pasien dilindungi dengan akses berbasis peran dan log siap audit yang sudah terintegrasi.' },
  ];

  const stats = [
    { value: '98%', label: 'Tingkat ketepatan waktu' },
    { value: '3.200+', label: 'Apotek aktif' },
    { value: '12 mnt', label: 'Rata-rata waktu dispatch' },
    { value: '4,9★', label: 'Kepuasan driver' },
  ];

  const steps = [
    { n:'01', title:'Apotek Membuat Order', desc:'Masukkan detail pasien, obat-obatan, dan alamat pengiriman dalam hitungan detik.' },
    { n:'02', title:'Driver Dikirim', desc:'Driver terdekat yang tersedia mendapat notifikasi instan dan menerima tugas.' },
    { n:'03', title:'Terkirim & Dikonfirmasi', desc:'Pasien menerima obat; bukti pengiriman digital tersimpan otomatis.' },
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", background:'#fff', minHeight:'100vh', color:PT.text }}>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)', borderBottom:`1px solid ${PT.border}`, padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <PTLogo size={32}/>
          <span style={{ fontWeight:800, fontSize:17, color:PT.text, letterSpacing:'-0.3px' }}>PharmaTrack</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <PTButton variant="ghost" size="sm">Fitur</PTButton>
          <PTButton variant="ghost" size="sm">Harga</PTButton>
          <PTButton variant="ghost" size="sm">Kontak</PTButton>
          <PTButton variant="secondary" size="sm" onClick={onGetStarted}>Masuk</PTButton>
          <PTButton variant="primary" size="sm" onClick={onGetStarted}>Mulai Sekarang</PTButton>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:'80px 40px 60px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:PT.primaryLight, color:PT.primaryText, borderRadius:999, padding:'5px 14px', fontSize:12, fontWeight:700, marginBottom:22 }}>
            <span style={{ width:7, height:7, borderRadius:999, background:PT.primary, display:'inline-block' }}/>
            Kini hadir di 40+ kota
          </div>
          <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.08, margin:'0 0 20px', letterSpacing:'-1.5px', color:PT.text }}>
            Pengiriman obat,<br/>
            <span style={{ color:PT.primary }}>lebih cerdas.</span>
          </h1>
          <p style={{ fontSize:17, color:PT.muted, lineHeight:1.7, margin:'0 0 36px', maxWidth:440 }}>
            PharmaTrack menghubungkan apotek, driver, dan administrator dalam satu platform cerdas — memastikan setiap resep sampai ke tangan pasien dengan cepat.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <PTButton size="lg" onClick={onGetStarted}>Mulai gratis →</PTButton>
            <PTButton variant="ghost" size="lg">Tonton demo ▶</PTButton>
          </div>
          <div style={{ display:'flex', gap:24, marginTop:32, flexWrap:'wrap' }}>
            {['Tanpa biaya setup', 'Gratis 30 hari', 'Batalkan kapan saja'].map(t=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:PT.muted, fontWeight:500 }}>
                <span style={{ color:PT.success, fontWeight:800 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Hero illustration placeholder */}
        <div style={{ position:'relative' }}>
          <div style={{ borderRadius:20, overflow:'hidden', border:`1px solid ${PT.border}`, boxShadow:'0 24px 64px rgba(0,0,0,0.10)', background:'oklch(0.96 0.015 250)' }}>
            {/* Mock dashboard preview */}
            <div style={{ background:PT.sidebar, padding:'14px 18px', display:'flex', alignItems:'center', gap:8 }}>
              <PTLogo size={22} white/>
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600 }}>PharmaTrack Dashboard</span>
              <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:999, background:c }}/>)}
              </div>
            </div>
            <div style={{ padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[{l:'Orders Today',v:'142',ic:'📦',col:PT.primary},{l:'Delivered',v:'118',ic:'✅',col:PT.success},{l:'In Transit',v:'19',ic:'🚴',col:PT.warning},{l:'Pharmacies',v:'24',ic:'🏥',col:PT.teal}].map(s=>(
                <div key={s.l} style={{ background:'#fff', borderRadius:10, padding:12, border:`1px solid ${PT.border}` }}>
                  <div style={{ fontSize:11, color:PT.muted, fontWeight:500 }}>{s.l}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:PT.text, marginTop:4 }}>{s.v}</div>
                  <div style={{ fontSize:18, marginTop:4 }}>{s.ic}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'0 16px 16px' }}>
              <div style={{ background:'#fff', borderRadius:10, border:`1px solid ${PT.border}`, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${PT.border}`, fontSize:12, fontWeight:700, color:PT.text }}>Order Terbaru</div>
                {[{id:'#4821',ph:'MediPlus',status:'Terkirim',col:'green'},{id:'#4822',ph:'QuickCare Rx',status:'Dalam Perjalanan',col:'amber'},{id:'#4823',ph:'City Pharma',status:'Menunggu',col:'blue'}].map(o=>(
                  <div key={o.id} style={{ padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${PT.border}`, fontSize:12 }}>
                    <span style={{ fontWeight:600, color:PT.text }}>{o.id}</span>
                    <span style={{ color:PT.muted }}>{o.ph}</span>
                    <PTBadge label={o.status} color={o.col}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Floating badge */}
          <div style={{ position:'absolute', bottom:-18, left:-18, background:'#fff', borderRadius:12, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', border:`1px solid ${PT.border}`, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22 }}>🚴</span>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:PT.text }}>Driver dalam perjalanan</div>
              <div style={{ fontSize:11, color:PT.success, fontWeight:600 }}>ETA 8 menit</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background:PT.primary, padding:'32px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {stats.map(s=>(
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, fontWeight:900, color:'#fff', letterSpacing:'-1px' }}>{s.value}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', fontWeight:500, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'72px 40px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:13, fontWeight:700, color:PT.primary, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Semua yang Anda butuhkan</div>
          <h2 style={{ fontSize:36, fontWeight:800, margin:0, letterSpacing:'-0.8px' }}>Dirancang untuk setiap peran di tim</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {features.map(f=>(
            <div key={f.title} style={{ padding:24, borderRadius:16, border:`1px solid ${PT.border}`, background:'#fff', transition:'box-shadow 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
            >
              <div style={{ fontSize:32, marginBottom:12 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:15, color:PT.text, marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13.5, color:PT.muted, lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'72px 40px', background:PT.bg }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:700, color:PT.primary, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Cara kerjanya</div>
            <h2 style={{ fontSize:36, fontWeight:800, margin:0, letterSpacing:'-0.8px' }}>Mudah dalam 3 langkah</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, position:'relative' }}>
            {steps.map((s,i)=>(
              <div key={s.n} style={{ textAlign:'center', padding:24 }}>
                <div style={{ width:56, height:56, borderRadius:16, background:PT.primary, color:'#fff', fontWeight:900, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:`0 8px 20px color-mix(in oklch, ${PT.primary} 35%, transparent)` }}>{s.n}</div>
                <div style={{ fontWeight:700, fontSize:16, color:PT.text, marginBottom:10 }}>{s.title}</div>
                <div style={{ fontSize:13.5, color:PT.muted, lineHeight:1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section style={{ padding:'72px 40px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontSize:36, fontWeight:800, margin:0, letterSpacing:'-0.8px' }}>Every stakeholder, perfectly connected</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:720, margin:'0 auto' }}>
          {[
            { role:'Apotek', icon:'🏥', color:PT.teal, colorL:PT.tealLight, desc:'Kirim resep, pantau status order secara langsung, dan tinjau riwayat — tanpa perlu telepon.', perks:['Buat order','Pelacakan langsung','Riwayat order','Rating driver'] },
            { role:'Driver', icon:'🚴', color:PT.success, colorL:PT.successLight, desc:'Aplikasi mobile-first. Terima pengiriman, navigasi rute, konfirmasi serah terima, dan pantau penghasilan.', perks:['Notifikasi tugas','Navigasi rute','Bukti pengiriman','Dasbor penghasilan'] },
          ].map(r=>(
            <div key={r.role} style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${PT.border}` }}>
              <div style={{ background:r.colorL, padding:'28px 24px 20px' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{r.icon}</div>
                <div style={{ fontWeight:800, fontSize:20, color:PT.text }}>{r.role}</div>
              </div>
              <div style={{ padding:24 }}>
                <p style={{ fontSize:13.5, color:PT.muted, lineHeight:1.65, margin:'0 0 16px' }}>{r.desc}</p>
                {r.perks.map(p=>(
                  <div key={p} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:PT.text, fontWeight:500, marginBottom:8 }}>
                    <span style={{ color:r.color, fontWeight:800 }}>✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'72px 40px', background:PT.sidebar }}>
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center' }}>
          <PTLogo size={48} white/>
          <h2 style={{ fontSize:36, fontWeight:800, color:'#fff', margin:'20px 0 12px', letterSpacing:'-0.8px' }}>Siap mempercepat pengiriman apotek Anda?</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.55)', marginBottom:32 }}>Bergabung dengan ribuan apotek yang telah menggunakan PharmaTrack.</p>
          <PTButton variant="white" size="lg" onClick={onGetStarted}>Mulai gratis sekarang →</PTButton>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:PT.sidebar, borderTop:'1px solid rgba(255,255,255,0.07)', padding:'28px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <PTLogo size={22} white/>
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>© 2026 PharmaTrack. Hak cipta dilindungi.</span>
          </div>
          <div style={{ display:'flex', gap:24 }}>
            {['Privasi','Ketentuan','Dukungan'].map(l=><a key={l} href="#" style={{ color:'rgba(255,255,255,0.38)', fontSize:13, textDecoration:'none', fontWeight:500 }}>{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { LandingPage });
