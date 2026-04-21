// PharmaTrack — Pharmacy Pages

const pharmOrders = [
  { id:'#4831', patient:'Budi Santoso',    address:'Jl. Sudirman No. 12, Jakarta Pusat', items:'Metformin 500mg × 2, Amlodipine 5mg × 1', driver:'Ari W.',   status:'Terkirim',         time:'2 mnt lalu',  total:'Rp95.000' },
  { id:'#4830', patient:'Siti Rahayu',     address:'Jl. Gatot Subroto, Jakarta Sel.',    items:'Losartan 50mg × 3',                         driver:'Doni S.',  status:'Dalam Perjalanan', time:'8 mnt lalu',  total:'Rp48.000' },
  { id:'#4829', patient:'Eko Prasetyo',    address:'Jl. Thamrin No. 5, Jakarta Pusat',   items:'Insulin Glargine × 1, Syringe × 10',        driver:'Fajar R.', status:'Dalam Perjalanan', time:'12 mnt lalu', total:'Rp162.000' },
  { id:'#4828', patient:'Dewi Lestari',    address:'Jl. Pemuda No. 45, Jakarta Timur',   items:'Atorvastatin 20mg × 2',                     driver:'—',        status:'Menunggu',          time:'18 mnt lalu', total:'Rp63.000' },
  { id:'#4827', patient:'Hendra Gunawan',  address:'Jl. Kalimalang, Jakarta Timur',      items:'Amoxicillin 500mg × 1, Ibuprofen × 2',      driver:'—',        status:'Menunggu',          time:'22 mnt lalu', total:'Rp117.000' },
  { id:'#4826', patient:'Rina Wulandari',  address:'Jl. MT Haryono No. 8, Jaktim',      items:'Omeprazole 20mg × 1',                       driver:'Reza A.',  status:'Terkirim',         time:'35 mnt lalu', total:'Rp54.000' },
];

const statusColor = { 'Terkirim':'green', 'Dalam Perjalanan':'amber', 'Menunggu':'blue', 'Dibatalkan':'red' };

function PharmacyDashboard({ onNav }) {
  return (
    <div style={{ padding:28 }}>
      <PTPageHeader title="Dashboard"
        subtitle="Apotek Sehat Jakarta · Hari ini, 19 April 2026"
        actions={<PTButton variant="primary" size="sm" onClick={()=>onNav('create')}>+ New Order</PTButton>}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        <PTStat label="Order Hari Ini" value="18"  sub="↑ 4 dari kemarin"     icon="📦" color="blue"/>
        <PTStat label="Terkirim"      value="12"  sub="67% berhasil"          icon="✅" color="green"/>
        <PTStat label="Dalam Perjalanan" value="4" sub="Rata-rata ETA 14 mnt" icon="🚴" color="amber"/>
        <PTStat label="Menunggu"      value="2"   sub="Menunggu driver"       icon="⏳" color="teal"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:24 }}>
        {/* Pending orders */}
        <PTCard pad={0}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${PT.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight:700, fontSize:15, color:PT.text }}>Order Tertunda</div>
            <PTBadge label="2 menunggu" color="blue" dot/>
          </div>
          {pharmOrders.filter(o=>o.status==='Pending').map(o=>(
            <div key={o.id} style={{ padding:'14px 20px', borderBottom:`1px solid ${PT.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div>
                  <span style={{ fontWeight:700, color:PT.text, fontSize:14 }}>{o.id}</span>
                  <span style={{ color:PT.muted, fontSize:13, marginLeft:8 }}>{o.patient}</span>
                </div>
                <PTBadge label={o.status} color={statusColor[o.status]} dot/>
              </div>
              <div style={{ fontSize:12.5, color:PT.muted, marginBottom:8 }}>📍 {o.address}</div>
              <div style={{ fontSize:12.5, color:PT.textSub, marginBottom:10 }}>💊 {o.items}</div>
              <div style={{ display:'flex', gap:8 }}>
                <PTButton variant="primary" size="sm" onClick={()=>window.showToast(`Driver sedang dicari untuk order ${o.id}.`,'info')}>Dispatch Driver</PTButton>
                <PTButton variant="ghost" size="sm" onClick={()=>window.showToast(`Membuka form edit order ${o.id}.`,'info')}>Edit</PTButton>
                <PTButton variant="danger" size="sm" onClick={()=>window.showToast(`Order ${o.id} telah dibatalkan.`,'error')}>Cancel</PTButton>
              </div>
            </div>
          ))}
          {pharmOrders.filter(o=>o.status==='In Transit').map(o=>(
            <div key={o.id} style={{ padding:'14px 20px', borderBottom:`1px solid ${PT.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div>
                  <span style={{ fontWeight:700, color:PT.text, fontSize:14 }}>{o.id}</span>
                  <span style={{ color:PT.muted, fontSize:13, marginLeft:8 }}>{o.patient}</span>
                </div>
                <PTBadge label={o.status} color={statusColor[o.status]} dot/>
              </div>
              <div style={{ fontSize:12.5, color:PT.muted, marginBottom:4 }}>📍 {o.address}</div>
              <div style={{ fontSize:12.5, color:PT.muted }}>🚴 Driver: <strong style={{color:PT.text}}>{o.driver}</strong> · ETA ~14 mnt</div>
            </div>
          ))}
        </PTCard>

        {/* Quick actions + tips */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <PTCard>
            <div style={{ fontWeight:700, fontSize:14, color:PT.text, marginBottom:14 }}>Aksi Cepat</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <PTButton variant="primary" size="md" style={{ width:'100%' }} onClick={()=>onNav('create')}>+ Buat Order</PTButton>
              <PTButton variant="secondary" size="md" style={{ width:'100%' }} onClick={()=>onNav('history')}>Lihat Riwayat</PTButton>
            </div>
          </PTCard>

          <PTCard>
            <div style={{ fontWeight:700, fontSize:14, color:PT.text, marginBottom:12 }}>Ringkasan Hari Ini</div>
            {[{l:'Total Penjualan',v:'Rp1.440.000'},{l:'Rata-rata Waktu Kirim',v:'19 mnt'},{l:'Rating Driver',v:'⭐ 4.8'}].map(s=>(
              <div key={s.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${PT.border}`, fontSize:13 }}>
                <span style={{ color:PT.muted }}>{s.l}</span>
                <span style={{ fontWeight:700, color:PT.text }}>{s.v}</span>
              </div>
            ))}
          </PTCard>
        </div>
      </div>
    </div>
  );
}

function PharmacyCreateOrder({ onNav }) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    patientName:'', patientPhone:'', address:'', barangay:'', city:'Manila',
    items:[{ name:'', qty:'1', notes:'' }],
    priority:'standard', paymentMode:'cod', notes:'',
  });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const addItem = () => setForm(f=>({...f, items:[...f.items, {name:'',qty:'1',notes:''}]}));
  const removeItem = i => setForm(f=>({...f, items:f.items.filter((_,idx)=>idx!==i)}));
  const setItem = (i,k,v) => setForm(f=>({ ...f, items:f.items.map((it,idx)=>idx===i?{...it,[k]:v}:it) }));

  const steps = ['Data Pasien','Obat-obatan','Opsi Pengiriman','Konfirmasi'];

  return (
    <div style={{ padding:28 }}>
      <PTPageHeader title="Buat Order Baru" subtitle="Lengkapi detail pengiriman"
        actions={<PTButton variant="ghost" size="sm" onClick={()=>onNav('dashboard')}>← Back</PTButton>}/>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
        {steps.map((s,i)=>(
          <React.Fragment key={s}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{ width:34, height:34, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, background:i+1<step?PT.success:i+1===step?PT.primary:PT.border, color:i+1<=step?'#fff':PT.muted, transition:'all 0.2s' }}>
                {i+1<step ? '✓' : i+1}
              </div>
              <span style={{ fontSize:11.5, fontWeight:i+1===step?700:500, color:i+1===step?PT.primary:PT.muted, whiteSpace:'nowrap' }}>{s}</span>
            </div>
            {i<steps.length-1 && <div style={{ flex:1, height:2, background:i+1<step?PT.success:PT.border, margin:'0 6px', marginBottom:18, transition:'background 0.3s' }}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <PTCard>
          {step===1 && (
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:PT.text, marginBottom:18 }}>Informasi Pasien</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <PTInput label="Nama Lengkap Pasien" placeholder="Budi Santoso" icon="👤" value={form.patientName} onChange={set('patientName')} style={{ gridColumn:'1/-1' }}/>
                <PTInput label="Nomor Kontak" placeholder="+62 812 3456 7890"  icon="📱" value={form.patientPhone} onChange={set('patientPhone')}/>
                <PTInput label="Kota / Kabupaten" placeholder="Jakarta Selatan" value={form.city} onChange={set('city')}/>
                <PTInput label="Kecamatan" placeholder="Tebet" value={form.barangay} onChange={set('barangay')} style={{ gridColumn:'1/-1' }}/>
                <PTInput label="Alamat Lengkap" placeholder="Jl. Sudirman No. 12, Apt 4B" icon="📍" value={form.address} onChange={set('address')} style={{ gridColumn:'1/-1' }}/>
              </div>
            </div>
          )}

          {step===2 && (
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:PT.text, marginBottom:18 }}>Obat-obatan</div>
              {form.items.map((item,i)=>(
                <div key={i} style={{ background:PT.bg, borderRadius:10, padding:14, marginBottom:12, position:'relative' }}>
                  <div style={{ fontWeight:600, fontSize:13, color:PT.muted, marginBottom:10 }}>Item {i+1}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10 }}>
                    <PTInput placeholder="Nama obat, dosis, bentuk sediaan…" value={item.name} onChange={e=>setItem(i,'name',e.target.value)}/>
                    <div style={{ width:80 }}>
                      <PTInput placeholder="Qty" value={item.qty} onChange={e=>setItem(i,'qty',e.target.value)}/>
                    </div>
                  </div>
                  <PTInput placeholder="Instruksi khusus (opsional)" value={item.notes} onChange={e=>setItem(i,'notes',e.target.value)} style={{ marginTop:8 }}/>
                  {form.items.length>1 && (
                    <button onClick={()=>removeItem(i)}
                      style={{ position:'absolute', top:10, right:10, border:'none', background:PT.dangerLight, color:PT.danger, borderRadius:6, width:24, height:24, cursor:'pointer', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  )}
                </div>
              ))}
              <PTButton variant="secondary" size="sm" onClick={addItem}>+ Tambah obat</PTButton>
            </div>
          )}

          {step===3 && (
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:PT.text, marginBottom:18 }}>Opsi Pengiriman</div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:PT.text, marginBottom:8 }}>Tingkat Prioritas</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                    {[{v:'standard',l:'Reguler',d:'1-2 jam',i:'🚴'},{v:'express',l:'Express',d:'30-45 mnt',i:'⚡'},{v:'urgent',l:'Urgen',d:'< 20 mnt',i:'🚨'}].map(p=>(
                      <div key={p.v} onClick={()=>setForm(f=>({...f,priority:p.v}))}
                        style={{ padding:'12px 10px', borderRadius:10, border:`2px solid ${form.priority===p.v?PT.primary:PT.border}`, textAlign:'center', cursor:'pointer', background:form.priority===p.v?PT.primaryLight:'#fff', transition:'all 0.15s' }}>
                        <div style={{ fontSize:22, marginBottom:4 }}>{p.i}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:form.priority===p.v?PT.primaryText:PT.text }}>{p.l}</div>
                        <div style={{ fontSize:11, color:PT.muted }}>{p.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <PTSelect label="Payment Mode"
                  options={[{value:'cod',label:'Bayar di Tempat (COD)'},{value:'transfer',label:'Transfer Bank'},{value:'gopay',label:'GoPay'},{value:'ovo',label:'OVO'},{value:'dana',label:'Dana'}]}
                  value={form.paymentMode} onChange={set('paymentMode')}/>
                <PTInput label="Catatan Order (opsional)" placeholder="Instruksi pengiriman khusus…" value={form.notes} onChange={set('notes')}/>
              </div>
            </div>
          )}

          {step===4 && (
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:PT.text, marginBottom:18 }}>Konfirmasi Order</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Pasien', value: form.patientName||'—' },
                  { label:'Kontak', value: form.patientPhone||'—' },
                  { label:'Alamat', value: [form.address, form.barangay, form.city].filter(Boolean).join(', ')||'—' },
                  { label:'Obat', value: form.items.filter(i=>i.name).map(i=>`${i.name} ×${i.qty}`).join(', ')||'—' },
                  { label:'Prioritas', value: form.priority==='standard'?'Reguler':form.priority==='express'?'Express':'Urgen' },
                  { label:'Pembayaran', value: form.paymentMode.toUpperCase() },
                ].map(r=>(
                  <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${PT.border}`, fontSize:14 }}>
                    <span style={{ color:PT.muted, fontWeight:500 }}>{r.label}</span>
                    <span style={{ fontWeight:600, color:PT.text, textAlign:'right', maxWidth:280 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
            {step>1 && <PTButton variant="ghost" size="md" onClick={()=>setStep(s=>s-1)}>← Back</PTButton>}
            {step<4
              ? <PTButton variant="primary" size="md" onClick={()=>setStep(s=>s+1)}>Lanjut →</PTButton>
              : <PTButton variant="success" size="md" onClick={()=>onNav('history')}>✓ Kirim Order</PTButton>
            }
          </div>
        </PTCard>

        {/* Side summary */}
        <div>
          <PTCard>
            <div style={{ fontWeight:700, fontSize:14, color:PT.text, marginBottom:14 }}>Ringkasan Order</div>
            <div style={{ fontSize:13, color:PT.muted, lineHeight:1.8 }}>
              {form.patientName && <div>👤 <strong style={{color:PT.text}}>{form.patientName}</strong></div>}
              {form.address && <div>📍 {form.address}</div>}
              {form.items.filter(i=>i.name).length>0 && (
                <div>💊 {form.items.filter(i=>i.name).length} medication(s)</div>
              )}
              {!form.patientName && !form.address && <div style={{color:PT.muted, fontStyle:'italic'}}>Isi formulir untuk melihat pratinjau.</div>}
            </div>
          </PTCard>
          <div style={{ marginTop:12, padding:14, background:PT.primaryLight, borderRadius:12, border:`1px solid ${PT.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:PT.primaryText, marginBottom:6 }}>💡 Tips</div>
            <div style={{ fontSize:12.5, color:PT.primaryText, lineHeight:1.6 }}>Periksa kembali nama obat dan dosis sebelum mengirim. Driver tidak dapat memverifikasi resep.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyHistory({ onNav }) {
  const [filter, setFilter] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const filters = ['Semua','Menunggu','Dalam Perjalanan','Terkirim','Dibatalkan'];
  const filtered = pharmOrders.filter(o=>{
    if(filter!=='Semua' && o.status!==filter) return false;
    if(search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.patient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding:28 }}>
      <PTPageHeader title="Riwayat Order" subtitle="Semua order dari Apotek Sehat Jakarta"
        actions={<PTButton variant="primary" size="sm" onClick={()=>onNav('create')}>+ New Order</PTButton>}/>

      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', background:'#fff', borderRadius:10, border:`1px solid ${PT.border}`, overflow:'hidden' }}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:'7px 16px', border:'none', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', background:filter===f?PT.primary:'transparent', color:filter===f?'#fff':PT.muted, transition:'all 0.15s' }}>
              {f}
            </button>
          ))}
        </div>
        <PTInput placeholder="Cari pasien, ID order…" icon="🔍" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:260 }}/>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(o=>(
          <PTCard key={o.id} style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontWeight:800, fontSize:15, color:PT.text }}>{o.id}</span>
                <PTBadge label={o.status} color={statusColor[o.status]} dot/>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:15, color:PT.text }}>{o.total}</div>
                <div style={{ fontSize:12, color:PT.muted, marginTop:2 }}>{o.time}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:13, color:PT.muted }}>
              <div>👤 <span style={{color:PT.text, fontWeight:500}}>{o.patient}</span></div>
              <div>🚴 <span style={{color:PT.text, fontWeight:500}}>{o.driver}</span></div>
              <div style={{ gridColumn:'1/-1' }}>📍 {o.address}</div>
              <div style={{ gridColumn:'1/-1' }}>💊 {o.items}</div>
            </div>
            {o.status==='Terkirim' && (
              <div style={{ marginTop:10, padding:'8px 12px', background:PT.successLight, borderRadius:8, fontSize:12.5, color:PT.success, fontWeight:600 }}>
                ✓ Berhasil dikirim · {o.time}
              </div>
            )}
          </PTCard>
        ))}
        {filtered.length===0 && (
          <div style={{ padding:60, textAlign:'center', color:PT.muted, fontSize:14 }}>Tidak ada order ditemukan.</div>
        )}
      </div>
    </div>
  );
}

function PharmacySettings() {
  const [profile, setProfile] = React.useState({
    namaApotek:'MediPlus Ortigas', picName:'Ana Reyes, S.Farm', email:'medplus@pharmatrack.ph',
    phone:'+62 812 3456 7890', npwp:'12.345.678.9-001.000',
    noSIA:'SIA/123/IV/2025', noSIPA:'SIPA-JKT/0001/2024',
    province:'DKI Jakarta', city:'Jakarta Timur', address:'Jl. Perintis Kemerdekaan No. 12',
  });
  const [notif, setNotif] = React.useState({ orderUpdate:true, driverArrival:true, promoInfo:false });
  const [pw, setPw] = React.useState({ current:'', next:'', confirm:'' });
  const setP = k => e => setProfile(p=>({...p,[k]:e.target.value}));
  const setPw_ = k => e => setPw(p=>({...p,[k]:e.target.value}));

  const save = section => {
    if (section==='password') {
      if (!pw.current) return window.showToast('Masukkan password saat ini.','error');
      if (pw.next.length<8) return window.showToast('Password baru minimal 8 karakter.','error');
      if (pw.next!==pw.confirm) return window.showToast('Konfirmasi password tidak cocok.','error');
      setPw({current:'',next:'',confirm:''});
    }
    window.showToast(`${section==='password'?'Password':'Data apotek'} berhasil diperbarui.`,'success');
  };

  return (
    <div style={{ padding:28, maxWidth:720 }}>
      <PTPageHeader title="Pengaturan" subtitle="Kelola profil apotek dan preferensi akun"/>

      {/* Profile photo area */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28, padding:20, background:'#fff', borderRadius:14, border:`1px solid ${PT.border}` }}>
        <div style={{ width:64, height:64, borderRadius:16, background:PT.tealLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🏥</div>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:PT.text }}>{profile.namaApotek}</div>
          <div style={{ fontSize:13, color:PT.muted, marginTop:2 }}>{profile.email}</div>
          <PTBadge label="Terverifikasi ✓" color="green" style={{ marginTop:6 }}/>
        </div>
        <PTButton variant="secondary" size="sm" style={{ marginLeft:'auto' }} onClick={()=>window.showToast('Fitur upload foto segera hadir.','info')}>Ganti Foto</PTButton>
      </div>

      {/* Pharmacy Info */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:PT.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Informasi Apotek</div>
        <PTCard>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <PTInput label="Nama Apotek" value={profile.namaApotek} onChange={setP('namaApotek')} style={{ gridColumn:'1/-1' }}/>
            <PTInput label="Nama PIC / Apoteker" value={profile.picName} onChange={setP('picName')} style={{ gridColumn:'1/-1' }}/>
            <PTInput label="Email" type="email" value={profile.email} onChange={setP('email')}/>
            <PTInput label="No. Telepon / WhatsApp" value={profile.phone} onChange={setP('phone')}/>
            <PTInput label="NPWP" value={profile.npwp} onChange={setP('npwp')} style={{ gridColumn:'1/-1' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
            <PTButton variant="primary" size="md" onClick={()=>save('profil')}>Simpan Perubahan</PTButton>
          </div>
        </PTCard>
      </div>

      {/* Legal docs */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:PT.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Dokumen Legalitas</div>
        <PTCard>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <PTInput label="No. SIA (Surat Izin Apotek)" value={profile.noSIA} onChange={setP('noSIA')}/>
            <PTInput label="No. SIPA (Izin Praktik Apoteker)" value={profile.noSIPA} onChange={setP('noSIPA')}/>
          </div>
          <div style={{ padding:'10px 14px', background:PT.warningLight, borderRadius:10, fontSize:12.5, color:'oklch(0.48 0.14 75)', fontWeight:500, marginBottom:14 }}>
            ⚠️ Perubahan dokumen legalitas memerlukan verifikasi ulang oleh admin (1×24 jam).
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <PTButton variant="primary" size="md" onClick={()=>save('dokumen')}>Ajukan Pembaruan</PTButton>
          </div>
        </PTCard>
      </div>

      {/* Address */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:PT.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Alamat Apotek</div>
        <PTCard>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <PTSelect label="Provinsi" value={profile.province} onChange={setP('province')} options={['DKI Jakarta','Jawa Barat','Jawa Tengah','Jawa Timur','Banten','Sumatera Utara','Sulawesi Selatan','Bali','Kalimantan Timur','Yogyakarta'].map(p=>({value:p,label:p}))}/>
            <PTInput label="Kota / Kabupaten" value={profile.city} onChange={setP('city')}/>
            <PTInput label="Alamat Lengkap" value={profile.address} onChange={setP('address')} style={{ gridColumn:'1/-1' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
            <PTButton variant="primary" size="md" onClick={()=>save('alamat')}>Simpan Alamat</PTButton>
          </div>
        </PTCard>
      </div>

      {/* Notifications */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:PT.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Notifikasi</div>
        <PTCard>
          {[
            { k:'orderUpdate',   label:'Update status order',    desc:'Notifikasi saat driver pickup dan delivered' },
            { k:'driverArrival', label:'Driver tiba di apotek',  desc:'Pemberitahuan ketika driver sedang menuju apotek' },
            { k:'promoInfo',     label:'Info & promo platform',  desc:'Berita terbaru dan penawaran dari PharmaTrack' },
          ].map(n=>(
            <div key={n.k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:`1px solid ${PT.border}` }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:PT.text }}>{n.label}</div>
                <div style={{ fontSize:12.5, color:PT.muted, marginTop:2 }}>{n.desc}</div>
              </div>
              <div onClick={()=>{ setNotif(p=>({...p,[n.k]:!p[n.k]})); window.showToast(`Notifikasi "${n.label}" ${!notif[n.k]?'diaktifkan':'dinonaktifkan'}.`, !notif[n.k]?'success':'info'); }}
                style={{ width:44, height:26, borderRadius:999, background:notif[n.k]?PT.success:PT.border, position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
                <div style={{ width:22, height:22, borderRadius:999, background:'#fff', position:'absolute', top:2, transition:'left 0.2s', left:notif[n.k]?20:2, boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
              </div>
            </div>
          ))}
        </PTCard>
      </div>

      {/* Security */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:PT.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Keamanan Akun</div>
        <PTCard>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <PTInput label="Password Saat Ini" type="password" placeholder="••••••••" icon="🔒" value={pw.current} onChange={setPw_('current')}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <PTInput label="Password Baru" type="password" placeholder="Min. 8 karakter" icon="🔒" value={pw.next} onChange={setPw_('next')}/>
              <PTInput label="Konfirmasi Password" type="password" placeholder="Ulangi" icon="🔒" value={pw.confirm} onChange={setPw_('confirm')}/>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
            <PTButton variant="primary" size="md" onClick={()=>save('password')}>Perbarui Password</PTButton>
          </div>
        </PTCard>
      </div>
    </div>
  );
}

function PharmacyApp() {
  const [page, setPage] = React.useState('dashboard');
  const nav = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'create',    icon:'➕', label:'Order Baru' },
    { id:'history',   icon:'📋', label:'Riwayat Order' },
    { id:'drivers',   icon:'🚴', label:'Driver' },
    { id:'settings',  icon:'⚙️', label:'Settings' },
  ];
  const pages = {
    dashboard: <PharmacyDashboard onNav={setPage}/>,
    create:    <PharmacyCreateOrder onNav={setPage}/>,
    history:   <PharmacyHistory onNav={setPage}/>,
    settings:  <PharmacySettings/>,
  };
  return (
    <PTSidebarLayout navItems={nav} active={page} onNav={setPage} role="Apotek" userName="Apotek Sehat Jakarta" userEmail="apotek.sehat@pharmatrack.id">
      {pages[page] || <PharmacyDashboard onNav={setPage}/>}
    </PTSidebarLayout>
  );
}

Object.assign(window, { PharmacyApp });
