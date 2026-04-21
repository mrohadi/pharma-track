// PharmaTrack — Admin Pages

const adminOrders = [
  { id:'#4831', patient:'Maria Santos',   pharmacy:'MediPlus Ortigas',   driver:'Carlo R.',  status:'Delivered',  time:'2m ago',   total:'₱320' },
  { id:'#4830', patient:'Jose Reyes',     pharmacy:'QuickCare Rx BGC',   driver:'Luis M.',   status:'In Transit', time:'8m ago',   total:'₱150' },
  { id:'#4829', patient:'Ana Cruz',       pharmacy:'City Pharma Makati', driver:'Gio P.',    status:'In Transit', time:'12m ago',  total:'₱540' },
  { id:'#4828', patient:'Ben Tan',        pharmacy:'MediPlus Ortigas',   driver:'—',         status:'Pending',    time:'18m ago',  total:'₱210' },
  { id:'#4827', patient:'Clara Lim',      pharmacy:'RxExpress QC',       driver:'—',         status:'Pending',    time:'22m ago',  total:'₱390' },
  { id:'#4826', patient:'Danny Gomez',    pharmacy:'HealthFirst SM',     driver:'Renz A.',   status:'Delivered',  time:'35m ago',  total:'₱180' },
  { id:'#4825', patient:'Eva Dela Rosa',  pharmacy:'City Pharma Makati', driver:'Carlo R.',  status:'Delivered',  time:'1h ago',   total:'₱460' },
  { id:'#4824', patient:'Frank Villanueva',pharmacy:'QuickCare Rx BGC',  driver:'Luis M.',   status:'Cancelled',  time:'1h ago',   total:'₱120' },
];

const adminUsers = {
  pharmacies: [
    { id:'PH-001', name:'Apotek Sehat Jakarta',   contact:'Siti Rahayu, S.Farm', orders:342, status:'Active',    joined:'Jan 2025' },
    { id:'PH-002', name:'Kimia Farma Sudirman',   contact:'Budi Santoso',        orders:218, status:'Active',    joined:'Mar 2025' },
    { id:'PH-003', name:'Apotek K-24 Gatot',      contact:'Dewi Lestari',        orders:189, status:'Active',    joined:'Feb 2025' },
    { id:'PH-004', name:'Guardian Kelapa Gading', contact:'Hendra Gunawan',      orders:97,  status:'Active',    joined:'Apr 2025' },
    { id:'PH-005', name:'Apotek Kimia Farma TB',  contact:'Rina Wulandari',      orders:64,  status:'Suspended', joined:'Jun 2025' },
  ],
  drivers: [
    { id:'DR-001', name:'Ari Wibowo',     phone:'+62 812 111 2222', deliveries:412, rating:'4.9', status:'Active',   joined:'Des 2024' },
    { id:'DR-002', name:'Doni Saputra',   phone:'+62 817 333 4444', deliveries:381, rating:'4.8', status:'Active',   joined:'Jan 2025' },
    { id:'DR-003', name:'Fajar Ramadhan', phone:'+62 818 555 6666', deliveries:294, rating:'4.7', status:'Active',   joined:'Feb 2025' },
    { id:'DR-004', name:'Reza Aditya',    phone:'+62 819 777 8888', deliveries:203, rating:'4.9', status:'Active',   joined:'Mar 2025' },
    { id:'DR-005', name:'Yoga Pratama',   phone:'+62 820 999 0000', deliveries:58,  rating:'4.5', status:'Inactive', joined:'Agu 2025' },
  ],
};

const statusColor = { 'Delivered':'green', 'In Transit':'amber', 'Pending':'blue', 'Cancelled':'red', 'Active':'green', 'Suspended':'red', 'Inactive':'gray' };

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d=>d.v));
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background: color||PT.primary, opacity:0.15+0.85*(d.v/max), transition:'height 0.4s', height:`${(d.v/max)*72}px` }}/>
          <span style={{ fontSize:10, color:PT.muted, fontWeight:500 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const weekData = [
    {l:'Mon',v:98},{l:'Tue',v:134},{l:'Wed',v:112},{l:'Thu',v:156},{l:'Fri',v:142},{l:'Sat',v:87},{l:'Sun',v:63},
  ];
  return (
    <div style={{ padding:28 }}>
      <PTPageHeader title="Dasbor" subtitle={`Selamat pagi, Admin · ${new Date().toLocaleDateString('id-ID',{weekday:'long',month:'long',day:'numeric'})}`}
        actions={<PTButton variant="secondary" size="sm">Unduh Laporan</PTButton>}/>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        <PTStat label="Order Hari Ini"    value="142" sub="↑ 12% dari kemarin" icon="📦" color="blue"/>
        <PTStat label="Terkirim"          value="118" sub="83% berhasil"   icon="✅" color="green"/>
        <PTStat label="Driver Aktif"      value="19"  sub="3 sedang istirahat"         icon="🚴" color="amber"/>
        <PTStat label="Apotek Aktif"      value="24"  sub="Semua wilayah"        icon="🏥" color="teal"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:24 }}>
        {/* Orders chart */}
        <PTCard>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:PT.text }}>Order Minggu Ini</div>
              <div style={{ fontSize:12, color:PT.muted, marginTop:2 }}>792 total · 13–19 April</div>
            </div>
            <PTBadge label="This week" color="blue"/>
          </div>
          <BarChart data={weekData}/>
        </PTCard>

        {/* Delivery status donut-style */}
        <PTCard>
          <div style={{ fontWeight:700, fontSize:15, color:PT.text, marginBottom:16 }}>Status Pengiriman</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[{l:'Terkirim',v:83,c:PT.success},{l:'Dalam Perjalanan',v:13,c:PT.warning},{l:'Menunggu',v:4,c:PT.primary}].map(s=>(
              <div key={s.l}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                  <span style={{ fontWeight:500, color:PT.text }}>{s.l}</span>
                  <span style={{ fontWeight:700, color:PT.text }}>{s.v}%</span>
                </div>
                <div style={{ height:7, background:PT.bg, borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${s.v}%`, background:s.c, borderRadius:99, transition:'width 0.6s' }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, padding:'10px 14px', background:PT.bg, borderRadius:10 }}>
            <div style={{ fontSize:11, color:PT.muted, fontWeight:500 }}>Rata-rata waktu kirim</div>
            <div style={{ fontSize:22, fontWeight:800, color:PT.text, marginTop:2 }}>22 mnt</div>
          </div>
        </PTCard>
      </div>

      {/* Recent orders */}
      <PTCard pad={0}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${PT.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:700, fontSize:15, color:PT.text }}>Order Terbaru</div>
          <PTButton variant="secondary" size="sm">Lihat semua</PTButton>
        </div>
        <PTTable
          cols={[{key:'id',label:'Order ID'},{key:'patient',label:'Pasien'},{key:'pharmacy',label:'Apotek'},{key:'driver',label:'Driver'},{key:'statusBadge',label:'Status'},{key:'time',label:'Waktu'},{key:'total',label:'Total'}]}
          rows={adminOrders.slice(0,5).map(o=>({...o, statusBadge:<PTBadge label={o.status} color={statusColor[o.status]} dot/>}))}
        />
      </PTCard>
    </div>
  );
}

function AdminOrders() {
  const [filter, setFilter] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const filters = ['Semua','Menunggu','Dalam Perjalanan','Terkirim','Dibatalkan'];
  const filtered = adminOrders.filter(o=>{
    if(filter!=='Semua' && o.status!==filter) return false;
    if(search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.patient.toLowerCase().includes(search.toLowerCase()) && !o.pharmacy.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div style={{ padding:28 }}>
      <PTPageHeader title="Order" subtitle="Kelola dan pantau semua order pengiriman"
        actions={<PTButton variant="primary" size="sm">+ Order Baru</PTButton>}/>

      {/* Filters + search */}
      <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', background:'#fff', borderRadius:10, border:`1px solid ${PT.border}`, overflow:'hidden' }}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:'7px 16px', border:'none', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', background:filter===f?PT.primary:'transparent', color:filter===f?'#fff':PT.muted, transition:'all 0.15s' }}>
              {f}
            </button>
          ))}
        </div>
        <PTInput placeholder="Cari order, pasien, apotek…" icon="🔍" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, maxWidth:320 }}/>
        <PTButton variant="ghost" size="sm">Ekspor CSV</PTButton>
      </div>

      <PTCard pad={0}>
        <PTTable
          cols={[{key:'id',label:'Order ID'},{key:'patient',label:'Pasien'},{key:'pharmacy',label:'Apotek'},{key:'driver',label:'Driver'},{key:'statusBadge',label:'Status'},{key:'total',label:'Total'},{key:'time',label:'Waktu'},{key:'actions',label:''}]}
          rows={filtered.map(o=>({
            ...o,
            statusBadge:<PTBadge label={o.status} color={statusColor[o.status]} dot/>,
            actions:(
              <div style={{ display:'flex', gap:6 }}>
                <PTButton variant="secondary" size="sm" onClick={()=>window.showToast(`Membuka detail order ${o.id}.`,'info')}>View</PTButton>
                {o.status==='Pending' && <PTButton variant="success" size="sm" onClick={()=>window.showToast(`Driver ditugaskan untuk order ${o.id}.`,'success')}>Assign</PTButton>}
              </div>
            )
          }))}
        />
        {filtered.length===0 && (
          <div style={{ padding:40, textAlign:'center', color:PT.muted, fontSize:14 }}>Tidak ada order yang sesuai filter.</div>
        )}
      </PTCard>

      {/* Pagination */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
        <span style={{ fontSize:13, color:PT.muted }}>Menampilkan {filtered.length} dari {adminOrders.length} order</span>
        <div style={{ display:'flex', gap:6 }}>
          {[1,2,3,'…',12].map((p,i)=>(
            <button key={i} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${p===1?PT.primary:PT.border}`, background:p===1?PT.primaryLight:'#fff', color:p===1?PT.primaryText:PT.muted, fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [tab, setTab] = React.useState('pharmacies');
  const [search, setSearch] = React.useState('');

  const pharmacyRows = adminUsers.pharmacies.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())).map(p=>({
    ...p,
    statusBadge: <PTBadge label={p.status} color={statusColor[p.status]} dot/>,
    actions: <div style={{display:'flex',gap:6}}><PTButton variant="secondary" size="sm" onClick={()=>window.showToast(`Membuka detail ${p.name}.`,'info')}>Edit</PTButton><PTButton variant={p.status==='Active'?'danger':'success'} size="sm" onClick={()=>window.showToast(`${p.name} telah di${p.status==='Active'?'suspend':'aktifkan'}.`, p.status==='Active'?'warning':'success')}>{p.status==='Active'?'Suspend':'Activate'}</PTButton></div>
  }));

  const driverRows = adminUsers.drivers.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase())).map(d=>({
    ...d,
    ratingBadge: <span style={{fontWeight:700,color:PT.warning}}>⭐ {d.rating}</span>,
    statusBadge: <PTBadge label={d.status} color={statusColor[d.status]} dot/>,
    actions: <div style={{display:'flex',gap:6}}><PTButton variant="secondary" size="sm" onClick={()=>window.showToast(`Membuka profil ${d.name}.`,'info')}>View</PTButton><PTButton variant="ghost" size="sm" onClick={()=>window.showToast(`Pesan terkirim ke ${d.name}.`,'success')}>Message</PTButton></div>
  }));

  return (
    <div style={{ padding:28 }}>
      <PTPageHeader title="Manajemen Pengguna" subtitle="Kelola apotek dan driver terdaftar"
        actions={<PTButton variant="primary" size="sm">+ Undang Pengguna</PTButton>}/>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        <PTStat label="Total Apotek" value="24"  icon="🏥" color="teal"/>
        <PTStat label="Driver Aktif"      value="19"  icon="🚴" color="green"/>
        <PTStat label="Menunggu Persetujuan"value="3"   icon="⏳" color="amber"/>
        <PTStat label="Pengguna Disuspend"  value="2"   icon="🚫" color="red"/>
      </div>

      <PTCard pad={0}>
        <div style={{ padding:'0 20px', borderBottom:`1px solid ${PT.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex' }}>
            {['pharmacies','drivers'].map(t=>(
              <button key={t} onClick={()=>{ setTab(t); setSearch(''); }}
                style={{ padding:'14px 20px', border:'none', fontFamily:'inherit', fontSize:13.5, fontWeight:600, cursor:'pointer', background:'transparent', color:tab===t?PT.primary:PT.muted, borderBottom:`2px solid ${tab===t?PT.primary:'transparent'}`, transition:'all 0.15s' }}>
                {t==='pharmacies'?'Apotek':'Driver'}
              </button>
            ))}
          </div>
          <PTInput placeholder={`Cari ${tab==='pharmacies'?'apotek':'driver'}…`} icon="🔍" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:240 }}/>
        </div>

        {tab==='pharmacies' ? (
          <PTTable
            cols={[{key:'id',label:'ID'},{key:'name',label:'Apotek'},{key:'contact',label:'Kontak'},{key:'orders',label:'Total Order'},{key:'statusBadge',label:'Status'},{key:'joined',label:'Bergabung'},{key:'actions',label:''}]}
            rows={pharmacyRows}
          />
        ) : (
          <PTTable
            cols={[{key:'id',label:'ID'},{key:'name',label:'Driver'},{key:'phone',label:'Telepon'},{key:'deliveries',label:'Pengiriman'},{key:'ratingBadge',label:'Rating'},{key:'statusBadge',label:'Status'},{key:'joined',label:'Bergabung'},{key:'actions',label:''}]}
            rows={driverRows}
          />
        )}
      </PTCard>
    </div>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:13, fontWeight:700, color:PT.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>{title}</div>
      <PTCard>{children}</PTCard>
    </div>
  );
}

function AdminSettings() {
  const [profile, setProfile] = React.useState({ name:'Alex Mendoza', email:'alex@pharmatrack.ph', phone:'+63 917 123 4567', role:'Super Admin' });
  const [notif, setNotif] = React.useState({ newOrder:true, driverAlert:true, systemUpdate:false, weeklyReport:true });
  const [pw, setPw] = React.useState({ current:'', next:'', confirm:'' });
  const [saved, setSaved] = React.useState('');
  const setP = k => e => setProfile(p=>({...p,[k]:e.target.value}));
  const setPw_ = k => e => setPw(p=>({...p,[k]:e.target.value}));

  const save = section => {
    if (section==='password') {
      if (!pw.current) return window.showToast('Masukkan password saat ini.','error');
      if (pw.next.length<8) return window.showToast('Password baru minimal 8 karakter.','error');
      if (pw.next!==pw.confirm) return window.showToast('Konfirmasi password tidak cocok.','error');
      setPw({current:'',next:'',confirm:''});
    }
    window.showToast(`${section==='password'?'Password':'Pengaturan'} berhasil diperbarui.`,'success');
  };

  return (
    <div style={{ padding:28, maxWidth:720 }}>
      <PTPageHeader title="Pengaturan" subtitle="Kelola akun dan konfigurasi sistem"/>

      <SettingsSection title="Profil Admin">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <PTInput label="Nama Lengkap" value={profile.name} onChange={setP('name')} style={{ gridColumn:'1/-1' }}/>
          <PTInput label="Email" type="email" value={profile.email} onChange={setP('email')}/>
          <PTInput label="No. Telepon" value={profile.phone} onChange={setP('phone')}/>
          <PTInput label="Peran" value={profile.role} onChange={setP('role')} style={{ gridColumn:'1/-1' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
          <PTButton variant="primary" size="md" onClick={()=>save('profil')}>Simpan Perubahan</PTButton>
        </div>
      </SettingsSection>

      <SettingsSection title="Notifikasi">
        {[
          { k:'newOrder',     label:'Order baru masuk',           desc:'Notifikasi setiap ada order baru dari apotek' },
          { k:'driverAlert',  label:'Peringatan driver',          desc:'Notifikasi jika driver tidak merespons dalam 5 menit' },
          { k:'systemUpdate', label:'Pembaruan sistem',           desc:'Info versi terbaru dan maintenance terjadwal' },
          { k:'weeklyReport', label:'Laporan mingguan',           desc:'Ringkasan performa dikirim setiap Senin pagi' },
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
      </SettingsSection>

      <SettingsSection title="Keamanan Akun">
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
      </SettingsSection>

      <SettingsSection title="Zona Bahaya">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:PT.text }}>Hapus semua data sesi</div>
            <div style={{ fontSize:12.5, color:PT.muted, marginTop:2 }}>Logout dari semua perangkat yang aktif</div>
          </div>
          <PTButton variant="danger" size="sm" onClick={()=>window.showToast('Semua sesi aktif telah dihapus.','warning')}>Logout Semua</PTButton>
        </div>
      </SettingsSection>
    </div>
  );
}

function AdminApp() {
  const [page, setPage] = React.useState('dashboard');
  const nav = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'orders',    icon:'📦', label:'Orders', badge:'3' },
    { id:'users',     icon:'👥', label:'Users' },
    { id:'analytics', icon:'📈', label:'Analytics' },
    { id:'settings',  icon:'⚙️', label:'Settings' },
  ];
  const pages = { dashboard:<AdminDashboard/>, orders:<AdminOrders/>, users:<AdminUsers/>, analytics:<AdminDashboard/>, settings:<AdminSettings/> };
  return (
    <PTSidebarLayout navItems={nav} active={page} onNav={setPage} role="Administrator" userName="Alex Mendoza" userEmail="alex@pharmatrack.ph">
      {pages[page]||<AdminDashboard/>}
    </PTSidebarLayout>
  );
}

Object.assign(window, { AdminApp });
