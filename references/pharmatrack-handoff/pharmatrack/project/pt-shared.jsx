// PharmaTrack — Shared Design System
const PT = {
  primary:      'oklch(0.52 0.18 250)',
  primaryHover: 'oklch(0.46 0.18 250)',
  primaryLight: 'oklch(0.94 0.04 250)',
  primaryText:  'oklch(0.36 0.14 250)',
  teal:         'oklch(0.52 0.15 195)',
  tealLight:    'oklch(0.94 0.05 195)',
  success:      'oklch(0.52 0.15 145)',
  successLight: 'oklch(0.94 0.05 145)',
  warning:      'oklch(0.68 0.14 75)',
  warningLight: 'oklch(0.96 0.05 75)',
  danger:       'oklch(0.55 0.2 25)',
  dangerLight:  'oklch(0.95 0.05 25)',
  bg:           'oklch(0.97 0.008 250)',
  card:         '#ffffff',
  text:         'oklch(0.18 0.02 250)',
  textSub:      'oklch(0.38 0.03 250)',
  muted:        'oklch(0.58 0.03 250)',
  border:       'oklch(0.92 0.012 250)',
  sidebar:      'oklch(0.15 0.04 255)',
  sidebarHover: 'rgba(255,255,255,0.07)',
  sidebarActive:'rgba(255,255,255,0.13)',
};

function PTLogo({ size = 32, white = false }) {
  const bg = white ? 'rgba(255,255,255,0.18)' : PT.primaryLight;
  const c  = white ? '#fff' : PT.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill={bg}/>
      <rect x="14.5" y="7" width="3.5" height="18" rx="1.75" fill={c}/>
      <rect x="7"   y="14.5" width="18" height="3.5" rx="1.75" fill={c}/>
      <circle cx="23" cy="9.5" r="2.5" fill={white ? 'rgba(255,255,255,0.7)' : PT.teal}/>
    </svg>
  );
}

function PTButton({ children, variant='primary', size='md', onClick, style:s={}, disabled, icon }) {
  const [hov, setHov] = React.useState(false);
  const sizes = { sm:{padding:'6px 14px',fontSize:12,borderRadius:8,gap:5}, md:{padding:'10px 20px',fontSize:14,borderRadius:10,gap:6}, lg:{padding:'13px 28px',fontSize:15,borderRadius:12,gap:7} };
  const vars = {
    primary: { background: hov ? PT.primaryHover : PT.primary, color:'#fff', border:'none' },
    secondary:{ background: hov ? PT.primaryLight : 'oklch(0.96 0.03 250)', color:PT.primaryText, border:'none' },
    ghost:   { background:'transparent', color:PT.muted, border:`1.5px solid ${PT.border}` },
    danger:  { background: hov ? 'oklch(0.48 0.2 25)' : PT.danger, color:'#fff', border:'none' },
    success: { background: hov ? 'oklch(0.46 0.15 145)' : PT.success, color:'#fff', border:'none' },
    white:   { background: hov ? 'rgba(255,255,255,0.9)' : '#fff', color:PT.primary, border:'none' },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit', fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, transition:'all 0.15s', ...sizes[size], ...vars[variant], ...s }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

function PTBadge({ label, color='blue', dot=false }) {
  const map = {
    blue:  { bg:PT.primaryLight,  text:PT.primaryText },
    teal:  { bg:PT.tealLight,     text:PT.teal },
    green: { bg:PT.successLight,  text:PT.success },
    amber: { bg:PT.warningLight,  text:'oklch(0.48 0.14 75)' },
    red:   { bg:PT.dangerLight,   text:PT.danger },
    gray:  { bg:'oklch(0.94 0.005 250)', text:PT.muted },
  };
  const c = map[color]||map.gray;
  return (
    <span style={{ padding:'3px 10px', borderRadius:999, fontSize:12, fontWeight:600, background:c.bg, color:c.text, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:5 }}>
      {dot && <span style={{ width:6, height:6, borderRadius:999, background:c.text, flexShrink:0 }}/>}
      {label}
    </span>
  );
}

function PTCard({ children, style:s={}, onClick, pad=20 }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:PT.card, borderRadius:14, padding:pad, border:`1px solid ${PT.border}`, boxShadow: hov&&onClick?'0 4px 16px rgba(0,0,0,0.08)':'0 1px 3px rgba(0,0,0,0.04)', cursor:onClick?'pointer':'default', transition:'box-shadow 0.15s', ...s }}>
      {children}
    </div>
  );
}

function PTStat({ label, value, sub, icon, color='blue' }) {
  const cols = { blue:PT.primary, green:PT.success, amber:PT.warning, red:PT.danger, teal:PT.teal };
  const cc = cols[color]||PT.primary;
  return (
    <PTCard>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:13, color:PT.muted, marginBottom:8, fontWeight:500 }}>{label}</div>
          <div style={{ fontSize:28, fontWeight:800, color:PT.text, letterSpacing:'-0.5px' }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:PT.success, marginTop:5, fontWeight:600 }}>{sub}</div>}
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:`color-mix(in oklch, ${cc} 12%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
          {icon}
        </div>
      </div>
    </PTCard>
  );
}

function PTInput({ label, placeholder, type='text', value, onChange, icon, style:s={} }) {
  const [foc, setFoc] = React.useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, ...s }}>
      {label && <label style={{ fontSize:13, fontWeight:600, color:PT.text }}>{label}</label>}
      <div style={{ position:'relative' }}>
        {icon && <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16, pointerEvents:'none', color:PT.muted }}>{icon}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{ width:'100%', padding: icon?'10px 12px 10px 38px':'10px 14px', border:`1.5px solid ${foc?PT.primary:PT.border}`, borderRadius:10, fontFamily:'inherit', fontSize:14, color:PT.text, background:'#fff', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
        />
      </div>
    </div>
  );
}

function PTSelect({ label, options, value, onChange, style:s={} }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, ...s }}>
      {label && <label style={{ fontSize:13, fontWeight:600, color:PT.text }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ padding:'10px 14px', border:`1.5px solid ${PT.border}`, borderRadius:10, fontFamily:'inherit', fontSize:14, color:PT.text, background:'#fff', outline:'none', cursor:'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function PTAvatar({ name='?', size=36, color }) {
  const colors = [PT.primary, PT.teal, PT.success, PT.warning, PT.danger];
  const bg = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width:size, height:size, borderRadius:999, background:bg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.38, flexShrink:0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PTSidebarLayout({ navItems, active, onNav, children, role, userName, userEmail }) {
  return (
    <div style={{ display:'flex', height:'100vh', background:PT.bg, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width:240, background:PT.sidebar, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'22px 18px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <PTLogo size={34} white/>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:15.5, lineHeight:1.2 }}>PharmaTrack</div>
            <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, marginTop:1 }}>{role}</div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'10px 10px' }}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>onNav(item.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, cursor:'pointer', marginBottom:2, background:active===item.id?PT.sidebarActive:'transparent', color:active===item.id?'#fff':'rgba(255,255,255,0.58)', fontSize:13.5, fontWeight:active===item.id?600:400, transition:'all 0.15s' }}
              onMouseEnter={e=>{ if(active!==item.id) e.currentTarget.style.background=PT.sidebarHover; }}
              onMouseLeave={e=>{ if(active!==item.id) e.currentTarget.style.background='transparent'; }}
            >
              <span style={{ fontSize:17 }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft:'auto', background:PT.danger, color:'#fff', borderRadius:999, fontSize:11, fontWeight:700, padding:'1px 7px' }}>{item.badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding:'14px 14px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <PTAvatar name={userName||'U'} size={34}/>
          <div style={{ minWidth:0 }}>
            <div style={{ color:'#fff', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName}</div>
            <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userEmail}</div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto', minWidth:0 }}>
        {children}
      </div>
    </div>
  );
}

function PTPageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:700, color:PT.text, margin:0 }}>{title}</h1>
        {subtitle && <p style={{ color:PT.muted, fontSize:13.5, margin:'4px 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:'flex', gap:10 }}>{actions}</div>}
    </div>
  );
}

function PTTable({ cols, rows, onRow }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
        <thead>
          <tr style={{ background:'oklch(0.96 0.008 250)' }}>
            {cols.map(c=>(
              <th key={c.key} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:PT.muted, whiteSpace:'nowrap', borderBottom:`1.5px solid ${PT.border}` }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRow&&onRow(row)}
              style={{ borderBottom:`1px solid ${PT.border}`, cursor:onRow?'pointer':'default', transition:'background 0.1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='oklch(0.97 0.006 250)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              {cols.map(c=>(
                <td key={c.key} style={{ padding:'12px 16px', color:PT.text, whiteSpace:'nowrap' }}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Toast System ───────────────────────────────────────────
window.__ptToastListeners = window.__ptToastListeners || [];
window.showToast = (message, type = 'info') => {
  const id = Date.now() + Math.random();
  window.__ptToastListeners.forEach(cb => cb({ id, message, type }));
};

function PTToast({ id, message, type, onRemove }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onRemove(id), 300); }, 3200);
    return () => clearTimeout(t);
  }, []);

  const cfg = {
    success: { bg: PT.success,      icon: '✓',  label: 'Success' },
    error:   { bg: PT.danger,       icon: '✕',  label: 'Error' },
    info:    { bg: PT.primary,      icon: 'ℹ',  label: 'Info' },
    warning: { bg: PT.warning,      icon: '⚠',  label: 'Warning' },
  };
  const c = cfg[type] || cfg.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: '#fff', borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: `1px solid ${PT.border}`,
      minWidth: 280, maxWidth: 360,
      borderLeft: `4px solid ${c.bg}`,
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), opacity 0.28s',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: c.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{c.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: PT.text, marginBottom: 2 }}>{c.label}</div>
        <div style={{ fontSize: 12.5, color: PT.muted, lineHeight: 1.5 }}>{message}</div>
      </div>
      <button onClick={() => onRemove(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: PT.muted, fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
    </div>
  );
}

function PTToastContainer() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    const cb = toast => setToasts(t => [...t, toast]);
    window.__ptToastListeners.push(cb);
    return () => { window.__ptToastListeners = window.__ptToastListeners.filter(x => x !== cb); };
  }, []);
  const remove = id => setToasts(t => t.filter(x => x.id !== id));
  return (
    <div style={{ position: 'fixed', top: 56, right: 20, zIndex: 999999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => <div key={t.id} style={{ pointerEvents: 'all' }}><PTToast {...t} onRemove={remove}/></div>)}
    </div>
  );
}

Object.assign(window, { PT, PTLogo, PTButton, PTBadge, PTCard, PTStat, PTInput, PTSelect, PTAvatar, PTSidebarLayout, PTPageHeader, PTTable, PTToastContainer });
