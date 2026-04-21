// PharmaTrack — Auth (Login + Signup) — Indonesian registration

const ID_PROVINCES = ['DKI Jakarta','Jawa Barat','Jawa Tengah','Jawa Timur','Banten','Sumatera Utara','Sulawesi Selatan','Bali','Kalimantan Timur','Yogyakarta'];
const ID_BANKS = ['BCA','BRI','BNI','Mandiri','BSI','CIMB Niaga','Danamon','Permata','GoPay','OVO','Dana','ShopeePay'];

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
      {steps.map((s,i)=>(
        <React.Fragment key={s}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ width:30, height:30, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, transition:'all 0.2s',
              background: i+1<current ? PT.success : i+1===current ? PT.primary : PT.border,
              color: i+1<=current ? '#fff' : PT.muted }}>
              {i+1<current ? '✓' : i+1}
            </div>
            <span style={{ fontSize:10.5, fontWeight:i+1===current?700:500, color:i+1===current?PT.primary:PT.muted, whiteSpace:'nowrap' }}>{s}</span>
          </div>
          {i<steps.length-1 && <div style={{ flex:1, height:2, background:i+1<current?PT.success:PT.border, margin:'0 6px', marginBottom:16, transition:'background 0.3s' }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Pharmacy multi-step registration ──────────────────────────
function PharmacySignup({ onDone }) {
  const [step, setStep] = React.useState(1);
  const [f, setF] = React.useState({
    picName:'', email:'', phone:'', password:'', confirmPassword:'',
    namaApotek:'', npwp:'', noSIA:'', noSIPA:'', province:'DKI Jakarta', city:'', address:'',
    bankName:'BCA', accountNo:'', accountName:'',
    agreed: false,
  });
  const set = k => e => setF(p=>({...p,[k]: e.target?.value ?? e}));

  const next = () => {
    if (step===1) {
      if (!f.picName||!f.email||!f.phone) return window.showToast('Mohon lengkapi semua kolom wajib.','error');
      if (!f.email.includes('@')) return window.showToast('Format email tidak valid.','error');
      window.showToast('Data akun tersimpan.','success');
    }
    if (step===2) {
      if (!f.namaApotek||!f.noSIA||!f.noSIPA) return window.showToast('Mohon isi Nama Apotek, No. SIA, dan No. SIPA.','error');
      window.showToast('Data apotek tersimpan.','success');
    }
    if (step===3) {
      if (!f.password||f.password.length<8) return window.showToast('Password minimal 8 karakter.','error');
      if (f.password!==f.confirmPassword) return window.showToast('Password tidak cocok.','error');
      if (!f.agreed) return window.showToast('Harap setujui Syarat & Ketentuan.','error');
      window.showToast('Pendaftaran apotek berhasil! Menunggu verifikasi admin.','success');
      setTimeout(()=>onDone(), 1200);
      return;
    }
    setStep(s=>s+1);
  };

  return (
    <div>
      <StepIndicator steps={['Akun','Data Apotek','Konfirmasi']} current={step}/>

      {step===1 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div style={{ padding:'10px 14px', background:PT.primaryLight, borderRadius:10, fontSize:12.5, color:PT.primaryText, fontWeight:500 }}>
            📋 Daftarkan apotek Anda. Pendaftaran akan diverifikasi oleh admin dalam 1×24 jam.
          </div>
          <PTInput label="Nama PIC / Apoteker *" placeholder="dr. Siti Rahayu, S.Farm" icon="👤" value={f.picName} onChange={set('picName')}/>
          <PTInput label="Email *" placeholder="apotek@example.co.id" type="email" icon="✉️" value={f.email} onChange={set('email')}/>
          <PTInput label="No. Telepon / WhatsApp *" placeholder="+62 812 3456 7890" icon="📱" value={f.phone} onChange={set('phone')}/>
        </div>
      )}

      {step===2 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <PTInput label="Nama Apotek *" placeholder="Apotek Sehat Sejahtera" icon="🏥" value={f.namaApotek} onChange={set('namaApotek')}/>
          <PTInput label="No. SIA (Surat Izin Apotek) *" placeholder="SIA/123/IV/2025" icon="📄" value={f.noSIA} onChange={set('noSIA')}/>
          <PTInput label="No. SIPA (Izin Praktik Apoteker) *" placeholder="SIPA-JKT/0001/2024" icon="📄" value={f.noSIPA} onChange={set('noSIPA')}/>
          <PTInput label="NPWP Apotek" placeholder="12.345.678.9-001.000" icon="🪪" value={f.npwp} onChange={set('npwp')}/>
          <PTSelect label="Provinsi *" value={f.province} onChange={set('province')} options={ID_PROVINCES.map(p=>({value:p,label:p}))}/>
          <PTInput label="Kota / Kabupaten *" placeholder="Jakarta Selatan" value={f.city} onChange={set('city')}/>
          <PTInput label="Alamat Lengkap *" placeholder="Jl. Sudirman No. 12, RT 03/RW 05" icon="📍" value={f.address} onChange={set('address')}/>
        </div>
      )}

      {step===3 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <PTInput label="Password *" placeholder="Min. 8 karakter" type="password" icon="🔒" value={f.password} onChange={set('password')}/>
          {f.password.length>0 && (
            <div>
              <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{ flex:1, height:3, borderRadius:99, background:f.password.length>=i*3?(i<=2?PT.warning:PT.success):PT.border, transition:'background 0.2s' }}/>
                ))}
              </div>
              <span style={{ fontSize:11, color:PT.muted }}>{f.password.length<6?'Lemah':f.password.length<10?'Cukup':'Kuat'}</span>
            </div>
          )}
          <PTInput label="Konfirmasi Password *" placeholder="Ulangi password" type="password" icon="🔒" value={f.confirmPassword} onChange={set('confirmPassword')}/>

          <div style={{ padding:'12px 14px', background:'oklch(0.96 0.008 250)', borderRadius:10, border:`1px solid ${PT.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:PT.text, marginBottom:8 }}>Ringkasan Pendaftaran</div>
            {[{l:'Nama PIC',v:f.picName},{l:'Email',v:f.email},{l:'Apotek',v:f.namaApotek},{l:'No. SIA',v:f.noSIA},{l:'Provinsi',v:f.province}].map(r=>(
              <div key={r.l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:`1px solid ${PT.border}` }}>
                <span style={{ color:PT.muted }}>{r.l}</span>
                <span style={{ fontWeight:600, color:PT.text }}>{r.v||'—'}</span>
              </div>
            ))}
          </div>

          <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12.5, color:PT.muted, cursor:'pointer' }}>
            <input type="checkbox" checked={f.agreed} onChange={e=>setF(p=>({...p,agreed:e.target.checked}))} style={{ accentColor:PT.primary, marginTop:2 }}/>
            Saya menyetujui <a href="#" style={{ color:PT.primary, fontWeight:600, textDecoration:'none' }}>Syarat & Ketentuan</a> serta <a href="#" style={{ color:PT.primary, fontWeight:600, textDecoration:'none' }}>Kebijakan Privasi</a> PharmaTrack.
          </label>
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        {step>1 && <PTButton variant="ghost" size="md" onClick={()=>setStep(s=>s-1)} style={{ flex:1 }}>← Kembali</PTButton>}
        <PTButton variant="primary" size="md" onClick={next} style={{ flex:2 }}>
          {step<3 ? 'Lanjut →' : 'Daftarkan Apotek ✓'}
        </PTButton>
      </div>
    </div>
  );
}

// ── Driver multi-step registration ────────────────────────────
function DriverSignup({ onDone }) {
  const [step, setStep] = React.useState(1);
  const [f, setF] = React.useState({
    namaLengkap:'', nik:'', email:'', phone:'', domisili:'DKI Jakarta',
    simType:'C', noSIM:'', expSIM:'', jenisKendaraan:'Motor', nopol:'', merekKendaraan:'',
    bankName:'BCA', accountNo:'', accountName:'',
    password:'', confirmPassword:'', agreed:false,
  });
  const set = k => e => setF(p=>({...p,[k]: e.target?.value ?? e}));

  const next = () => {
    if (step===1) {
      if (!f.namaLengkap||!f.nik||!f.phone) return window.showToast('Mohon lengkapi semua kolom wajib.','error');
      if (f.nik.length!==16) return window.showToast('NIK harus 16 digit.','error');
      window.showToast('Data pribadi tersimpan.','success');
    }
    if (step===2) {
      if (!f.noSIM||!f.nopol||!f.merekKendaraan) return window.showToast('Mohon isi data kendaraan dan SIM.','error');
      window.showToast('Data kendaraan tersimpan.','success');
    }
    if (step===3) {
      if (!f.accountNo||!f.accountName) return window.showToast('Mohon isi data rekening untuk pencairan penghasilan.','error');
      window.showToast('Data rekening tersimpan.','success');
    }
    if (step===4) {
      if (!f.password||f.password.length<8) return window.showToast('Password minimal 8 karakter.','error');
      if (f.password!==f.confirmPassword) return window.showToast('Password tidak cocok.','error');
      if (!f.agreed) return window.showToast('Harap setujui Syarat & Ketentuan.','error');
      window.showToast('Pendaftaran driver berhasil! Sedang diverifikasi.','success');
      setTimeout(()=>onDone(), 1200);
      return;
    }
    setStep(s=>s+1);
  };

  return (
    <div>
      <StepIndicator steps={['Pribadi','Kendaraan','Rekening','Akun']} current={step}/>

      {step===1 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div style={{ padding:'10px 14px', background:PT.primaryLight, borderRadius:10, fontSize:12.5, color:PT.primaryText, fontWeight:500 }}>
            🚴 Daftar sebagai mitra pengemudi. Verifikasi dokumen diperlukan sebelum mulai bertugas.
          </div>
          <PTInput label="Nama Lengkap (sesuai KTP) *" placeholder="Budi Santoso" icon="👤" value={f.namaLengkap} onChange={set('namaLengkap')}/>
          <PTInput label="NIK (16 digit) *" placeholder="3271012345670001" icon="🪪" value={f.nik} onChange={set('nik')}/>
          <PTInput label="No. Telepon / WhatsApp *" placeholder="+62 812 3456 7890" icon="📱" value={f.phone} onChange={set('phone')}/>
          <PTInput label="Email" placeholder="budi@example.com" type="email" icon="✉️" value={f.email} onChange={set('email')}/>
          <PTSelect label="Domisili / Provinsi *" value={f.domisili} onChange={set('domisili')} options={ID_PROVINCES.map(p=>({value:p,label:p}))}/>
        </div>
      )}

      {step===2 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:PT.text, marginBottom:8 }}>Jenis Kendaraan *</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[{v:'Motor',i:'🏍️'},{v:'Mobil',i:'🚗'}].map(j=>(
                <div key={j.v} onClick={()=>setF(p=>({...p,jenisKendaraan:j.v}))}
                  style={{ padding:'12px', borderRadius:10, border:`2px solid ${f.jenisKendaraan===j.v?PT.primary:PT.border}`, textAlign:'center', cursor:'pointer', background:f.jenisKendaraan===j.v?PT.primaryLight:'#fff', transition:'all 0.15s' }}>
                  <div style={{ fontSize:26, marginBottom:4 }}>{j.i}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:f.jenisKendaraan===j.v?PT.primaryText:PT.text }}>{j.v}</div>
                </div>
              ))}
            </div>
          </div>
          <PTInput label="Merek & Tipe Kendaraan *" placeholder="Honda Beat 2023" icon="🏍️" value={f.merekKendaraan} onChange={set('merekKendaraan')}/>
          <PTInput label="Nomor Polisi *" placeholder="B 1234 XYZ" icon="🔖" value={f.nopol} onChange={set('nopol')}/>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:PT.text, marginBottom:8 }}>Golongan SIM *</div>
            <div style={{ display:'flex', gap:8 }}>
              {['C','A','B1'].map(s=>(
                <button key={s} onClick={()=>setF(p=>({...p,simType:s}))}
                  style={{ padding:'8px 18px', borderRadius:9, border:`2px solid ${f.simType===s?PT.primary:PT.border}`, background:f.simType===s?PT.primaryLight:'#fff', color:f.simType===s?PT.primaryText:PT.text, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
                  SIM {s}
                </button>
              ))}
            </div>
          </div>
          <PTInput label="Nomor SIM *" placeholder="1234567890123456" icon="📄" value={f.noSIM} onChange={set('noSIM')}/>
          <PTInput label="Masa Berlaku SIM *" placeholder="31/12/2027" icon="📅" value={f.expSIM} onChange={set('expSIM')}/>
        </div>
      )}

      {step===3 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div style={{ padding:'10px 14px', background:PT.successLight, borderRadius:10, fontSize:12.5, color:PT.success, fontWeight:500 }}>
            💰 Data rekening digunakan untuk pencairan penghasilan harian Anda.
          </div>
          <PTSelect label="Bank / E-Wallet *" value={f.bankName} onChange={set('bankName')} options={ID_BANKS.map(b=>({value:b,label:b}))}/>
          <PTInput label="Nomor Rekening *" placeholder="1234567890" icon="🏦" value={f.accountNo} onChange={set('accountNo')}/>
          <PTInput label="Nama Pemilik Rekening *" placeholder="BUDI SANTOSO" icon="👤" value={f.accountName} onChange={set('accountName')}/>
          <div style={{ padding:'10px 14px', background:'oklch(0.96 0.008 250)', borderRadius:10, border:`1px solid ${PT.border}`, fontSize:12, color:PT.muted, lineHeight:1.6 }}>
            ⚠️ Pastikan nama pemilik rekening sesuai dengan nama di KTP Anda. Rekening yang tidak sesuai dapat menghambat proses pencairan.
          </div>
        </div>
      )}

      {step===4 && (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <PTInput label="Password *" placeholder="Min. 8 karakter" type="password" icon="🔒" value={f.password} onChange={set('password')}/>
          {f.password.length>0 && (
            <div>
              <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i=>(<div key={i} style={{ flex:1, height:3, borderRadius:99, background:f.password.length>=i*3?(i<=2?PT.warning:PT.success):PT.border, transition:'background 0.2s' }}/>))}
              </div>
              <span style={{ fontSize:11, color:PT.muted }}>{f.password.length<6?'Lemah':f.password.length<10?'Cukup':'Kuat'}</span>
            </div>
          )}
          <PTInput label="Konfirmasi Password *" placeholder="Ulangi password" type="password" icon="🔒" value={f.confirmPassword} onChange={set('confirmPassword')}/>

          <div style={{ padding:'12px 14px', background:'oklch(0.96 0.008 250)', borderRadius:10, border:`1px solid ${PT.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:PT.text, marginBottom:8 }}>Ringkasan Pendaftaran</div>
            {[{l:'Nama',v:f.namaLengkap},{l:'NIK',v:f.nik},{l:'Kendaraan',v:`${f.jenisKendaraan} · ${f.merekKendaraan}`},{l:'Nopol',v:f.nopol},{l:'Rekening',v:`${f.bankName} - ${f.accountNo}`}].map(r=>(
              <div key={r.l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:`1px solid ${PT.border}` }}>
                <span style={{ color:PT.muted }}>{r.l}</span>
                <span style={{ fontWeight:600, color:PT.text }}>{r.v||'—'}</span>
              </div>
            ))}
          </div>

          <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12.5, color:PT.muted, cursor:'pointer' }}>
            <input type="checkbox" checked={f.agreed} onChange={e=>setF(p=>({...p,agreed:e.target.checked}))} style={{ accentColor:PT.primary, marginTop:2 }}/>
            Saya menyetujui <a href="#" style={{ color:PT.primary, fontWeight:600, textDecoration:'none' }}>Syarat & Ketentuan</a> dan <a href="#" style={{ color:PT.primary, fontWeight:600, textDecoration:'none' }}>Kebijakan Privasi</a> PharmaTrack.
          </label>
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        {step>1 && <PTButton variant="ghost" size="md" onClick={()=>setStep(s=>s-1)} style={{ flex:1 }}>← Kembali</PTButton>}
        <PTButton variant="primary" size="md" onClick={next} style={{ flex:2 }}>
          {step<4 ? 'Lanjut →' : 'Daftar Sekarang ✓'}
        </PTButton>
      </div>
    </div>
  );
}

// ── Main Auth Page ─────────────────────────────────────────────
function AuthPage({ onLogin, defaultTab = 'login' }) {
  const [tab, setTab] = React.useState(defaultTab);
  const [signupRole, setSignupRole] = React.useState('pharmacy');
  const [loginRole, setLoginRole] = React.useState('pharmacy');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
    if (!email || !password) return window.showToast('Email dan password wajib diisi.','error');
    window.showToast(`Selamat datang kembali! Masuk sebagai ${loginRole}.`,'success');
    setTimeout(()=>onLogin(loginRole), 800);
  };

  const loginRoles = [
    { id:'admin',    icon:'🛡️', label:'Admin' },
    { id:'pharmacy', icon:'🏥', label:'Apotek' },
    { id:'driver',   icon:'🚴', label:'Driver' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:PT.bg, display:'flex', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* LEFT PANEL */}
      <div style={{ width:400, background:PT.sidebar, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 36px', position:'relative', overflow:'hidden', flexShrink:0 }}>
        <div style={{ position:'absolute', width:300, height:300, borderRadius:999, background:'rgba(255,255,255,0.03)', top:-80, right:-80 }}/>
        <div style={{ position:'absolute', width:200, height:200, borderRadius:999, background:'rgba(255,255,255,0.03)', bottom:-40, left:-40 }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
            <PTLogo size={36} white/>
            <span style={{ color:'#fff', fontWeight:800, fontSize:18 }}>PharmaTrack</span>
          </div>
          <h2 style={{ color:'#fff', fontSize:26, fontWeight:800, margin:'0 0 12px', lineHeight:1.3, letterSpacing:'-0.5px' }}>Platform pengiriman obat terpercaya di Indonesia.</h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13.5, lineHeight:1.7, margin:'0 0 36px' }}>Menghubungkan apotek, driver, dan administrator dalam satu platform cerdas.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[{icon:'💊',t:'Manajemen order real-time'},{icon:'📍',t:'Pelacakan pengiriman live'},{icon:'📊',t:'Laporan & analitik lengkap'},{icon:'🔒',t:'Data pasien aman & terenkripsi'}].map(i=>(
              <div key={i.t} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{i.icon}</div>
                <span style={{ color:'rgba(255,255,255,0.62)', fontSize:13, fontWeight:500 }}>{i.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 40px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:440 }}>

          {/* Tab switcher */}
          <div style={{ display:'flex', background:PT.border, borderRadius:12, padding:3, marginBottom:24 }}>
            {[['login','Masuk'],['signup','Daftar']].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ flex:1, padding:'9px 0', borderRadius:10, border:'none', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.15s', background:tab===t?'#fff':'transparent', color:tab===t?PT.text:PT.muted, boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>
                {l}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div>
              <h2 style={{ fontSize:22, fontWeight:800, color:PT.text, margin:'0 0 4px', letterSpacing:'-0.4px' }}>Selamat datang kembali</h2>
              <p style={{ color:PT.muted, fontSize:13.5, margin:'0 0 22px' }}>Masuk ke akun PharmaTrack Anda</p>

              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:600, color:PT.text, marginBottom:8 }}>Masuk sebagai</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {loginRoles.map(r=>(
                    <div key={r.id} onClick={()=>setLoginRole(r.id)}
                      style={{ padding:'10px 8px', borderRadius:10, border:`2px solid ${loginRole===r.id?PT.primary:PT.border}`, textAlign:'center', cursor:'pointer', background:loginRole===r.id?PT.primaryLight:'#fff', transition:'all 0.15s' }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{r.icon}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:loginRole===r.id?PT.primaryText:PT.muted }}>{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {loginRole === 'admin' && (
                <div style={{ padding:'10px 14px', background:PT.warningLight, borderRadius:10, fontSize:12.5, color:'oklch(0.48 0.14 75)', fontWeight:500, marginBottom:16 }}>
                  🛡️ Akun Admin hanya dapat diakses melalui undangan dari Super Admin.
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <PTInput label="Email" placeholder="anda@example.co.id" type="email" icon="✉️" value={email} onChange={e=>setEmail(e.target.value)}/>
                <PTInput label="Password" placeholder="••••••••" type="password" icon="🔒" value={password} onChange={e=>setPassword(e.target.value)}/>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'12px 0 20px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:PT.muted, cursor:'pointer' }}>
                  <input type="checkbox" style={{ accentColor:PT.primary }}/> Ingat saya
                </label>
                <a href="#" style={{ fontSize:13, color:PT.primary, textDecoration:'none', fontWeight:600 }}>Lupa password?</a>
              </div>

              <PTButton variant="primary" size="lg" onClick={handleLogin} style={{ width:'100%' }}>Masuk →</PTButton>

              <div style={{ textAlign:'center', marginTop:18 }}>
                <span style={{ fontSize:13, color:PT.muted }}>Belum punya akun? </span>
                <button onClick={()=>setTab('signup')} style={{ fontSize:13, color:PT.primary, fontWeight:700, border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>Daftar gratis</button>
              </div>
            </div>

          ) : (
            <div>
              <h2 style={{ fontSize:22, fontWeight:800, color:PT.text, margin:'0 0 4px', letterSpacing:'-0.4px' }}>Buat Akun Baru</h2>
              <p style={{ color:PT.muted, fontSize:13.5, margin:'0 0 18px' }}>Pilih tipe akun Anda</p>

              {/* Role selector for signup — no admin */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22 }}>
                {[{id:'pharmacy',icon:'🏥',label:'Apotek',desc:'Daftarkan apotek Anda'},{id:'driver',icon:'🚴',label:'Driver',desc:'Bergabung sebagai mitra pengemudi'}].map(r=>(
                  <div key={r.id} onClick={()=>setSignupRole(r.id)}
                    style={{ padding:'14px 12px', borderRadius:12, border:`2px solid ${signupRole===r.id?PT.primary:PT.border}`, cursor:'pointer', background:signupRole===r.id?PT.primaryLight:'#fff', transition:'all 0.15s' }}>
                    <div style={{ fontSize:26, marginBottom:6 }}>{r.icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:signupRole===r.id?PT.primaryText:PT.text }}>{r.label}</div>
                    <div style={{ fontSize:11.5, color:PT.muted, marginTop:3 }}>{r.desc}</div>
                  </div>
                ))}
              </div>

              {/* Admin info box */}
              <div style={{ padding:'10px 14px', background:'oklch(0.96 0.008 250)', borderRadius:10, border:`1px solid ${PT.border}`, fontSize:12.5, color:PT.muted, marginBottom:20, lineHeight:1.6 }}>
                🛡️ <strong style={{color:PT.text}}>Admin?</strong> Akun admin dibuat melalui undangan langsung oleh Super Admin. Hubungi <a href="mailto:admin@pharmatrack.id" style={{color:PT.primary, fontWeight:600}}>admin@pharmatrack.id</a> untuk informasi lebih lanjut.
              </div>

              {signupRole === 'pharmacy'
                ? <PharmacySignup onDone={()=>setTab('login')}/>
                : <DriverSignup   onDone={()=>setTab('login')}/>
              }

              <div style={{ textAlign:'center', marginTop:16 }}>
                <span style={{ fontSize:13, color:PT.muted }}>Sudah punya akun? </span>
                <button onClick={()=>setTab('login')} style={{ fontSize:13, color:PT.primary, fontWeight:700, border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>Masuk</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthPage });
