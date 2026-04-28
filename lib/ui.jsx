/* Shared UI primitives: Button, Badge, Chip, Avatar, Card, Input, Menu, Tooltip, Toast, Segmented, Drawer, EmptyState */

const cx = (...xs) => xs.filter(Boolean).join(" ");

const Btn = ({ variant="default", size="md", className="", children, icon:IconComp, trailingIcon:TIcon, as:Tag="button", ...rest }) => {
  const sizes = {
    sm: "h-7 px-2.5 text-[12px] gap-1.5 rounded-[6px]",
    md: "h-8 px-3 text-[13px] gap-1.5 rounded-[7px]",
    lg: "h-10 px-4 text-sm gap-2 rounded-[8px]",
    icon:"h-8 w-8 rounded-[7px] justify-center",
    iconSm:"h-7 w-7 rounded-[6px] justify-center",
  };
  const variants = {
    default: "bg-[var(--ink)] text-white hover:bg-[#22252c] active:bg-black",
    accent:  "bg-[var(--accent)] text-white hover:bg-[#2e31c3] active:bg-[#1f209a]",
    outline: "bg-white hover:bg-[#fafafa] border hairline text-[var(--ink)]",
    ghost:   "hover:bg-black/5 text-[var(--ink-2)]",
    subtle:  "bg-[#eeefef] hover:bg-[#e4e5e7] text-[var(--ink)]",
    danger:  "bg-[var(--bad)] text-white hover:bg-[#9a1d13]",
    soft:    "bg-[var(--accent-wash)] text-[var(--accent-ink)] hover:bg-[#e0e2ff]",
  };
  return (
    <Tag {...rest} className={cx("inline-flex items-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 select-none whitespace-nowrap", sizes[size], variants[variant], className)}>
      {IconComp ? <IconComp width={size==="sm"?14:size==="lg"?18:16} height={size==="sm"?14:size==="lg"?18:16}/> : null}
      {children}
      {TIcon ? <TIcon width={14} height={14}/> : null}
    </Tag>
  );
};

const Chip = ({ tone="slate", subtle=true, icon:IconComp, children, className="" }) => {
  const tones = {
    slate:  subtle ? "bg-[#eef0f3] text-[#3d4454]"   : "bg-[#3d4454] text-white",
    green:  subtle ? "bg-[var(--ok-wash)] text-[var(--ok)]"   : "bg-[var(--ok)] text-white",
    amber:  subtle ? "bg-[var(--warn-wash)] text-[var(--warn)]" : "bg-[var(--warn)] text-white",
    red:    subtle ? "bg-[var(--bad-wash)] text-[var(--bad)]"   : "bg-[var(--bad)] text-white",
    indigo: subtle ? "bg-[var(--accent-wash)] text-[var(--accent-ink)]" : "bg-[var(--accent)] text-white",
    teal:   subtle ? "bg-[#d8efee] text-[#0a5f5d]" : "bg-[#0a7a78] text-white",
    rose:   subtle ? "bg-[#fde4ee] text-[#8a2952]" : "bg-[#b43664] text-white",
  };
  return (
    <span className={cx("chip", tones[tone], className)}>
      {IconComp ? <IconComp width={11} height={11}/> : null}
      {children}
    </span>
  );
};

const StatusChip = ({ status }) => {
  const meta = SAMA.STATUS_META[status] || { tone:"slate", label:status };
  const dotColor = {
    slate:  "#8790a0",
    green:  "var(--ok)",
    amber:  "var(--warn)",
    red:    "var(--bad)",
    indigo: "var(--accent)",
  }[meta.tone];
  return (
    <Chip tone={meta.tone}>
      <span className="inline-block w-[6px] h-[6px] rounded-full" style={{background:dotColor}}/>
      {meta.label}
    </Chip>
  );
};

const TypeChip = ({ type, subtle=true }) => {
  const m = SAMA.TYPE_META[type];
  if (!m) return null;
  return (
    <span className="chip" style={{ background: subtle ? m.wash : m.dot, color: subtle ? m.ink : "white" }}>
      <span className="w-[6px] h-[6px] rounded-full" style={{background: subtle ? m.dot : "rgba(255,255,255,.7)"}}/>
      {m.label}
    </span>
  );
};

const Avatar = ({ name="", initials, size=28, color, className="", ring=false }) => {
  const letters = (initials || name.split(" ").map(x=>x[0]).slice(0,2).join("")).toUpperCase();
  const hash = [...letters].reduce((a,c)=>a+c.charCodeAt(0),0);
  const palette = ["#3a3dd9","#0a7a78","#b43664","#b9812d","#7b5dea","#495266","#4e6e8a"];
  const bg = color || palette[hash % palette.length];
  return (
    <div className={cx("inline-flex items-center justify-center rounded-full shrink-0 font-semibold text-white", ring && "ring-2 ring-white", className)}
         style={{ width:size, height:size, background:bg, fontSize: Math.round(size*0.38), letterSpacing:"-0.02em" }}>
      {letters}
    </div>
  );
};

const AvatarStack = ({ people=[], max=4, size=22 }) => {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p,i) => (
        <div key={p.id||i} style={{ marginLeft: i===0 ? 0 : -7 }}>
          <Avatar name={p.name} size={size} ring={true}/>
        </div>
      ))}
      {rest > 0 && (
        <div className="ml-[-7px] rounded-full bg-white ring-2 ring-white border hairline flex items-center justify-center text-[10px] font-semibold text-[var(--mute)]" style={{ width:size, height:size }}>
          +{rest}
        </div>
      )}
    </div>
  );
};

const Card = ({ className="", children, ...rest }) => (
  <div {...rest} className={cx("bg-[var(--surface)] border hairline rounded-[10px] shadow-soft", className)}>
    {children}
  </div>
);

const CardHeader = ({ title, hint, actions, className="" }) => (
  <div className={cx("flex items-center justify-between px-4 py-3 border-b hairline", className)}>
    <div>
      <div className="text-[13px] font-semibold tracking-tight">{title}</div>
      {hint && <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{hint}</div>}
    </div>
    {actions}
  </div>
);

const Input = ({ icon:IconComp, trailingIcon:T, className="", ...rest }) => (
  <div className={cx("relative flex items-center", className)}>
    {IconComp && <IconComp width={14} height={14} className="absolute left-2.5 text-[var(--mute)] pointer-events-none"/>}
    <input {...rest} className={cx(
      "w-full bg-white border hairline rounded-[7px] h-8 text-[13px] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-shadow",
      IconComp ? "pl-8" : "pl-2.5",
      T ? "pr-8" : "pr-2.5"
    )}/>
    {T && <T width={14} height={14} className="absolute right-2.5 text-[var(--mute)] pointer-events-none"/>}
  </div>
);

const Segmented = ({ items, value, onChange, size="md" }) => (
  <div className={cx("inline-flex bg-[#eeefef] rounded-[8px] p-[3px] gap-[2px]", size==="sm" ? "text-[11.5px]" : "text-[12.5px]")}>
    {items.map(it => {
      const active = it.value === value;
      return (
        <button key={it.value} onClick={()=>onChange(it.value)}
          className={cx(
            "px-2.5 font-medium rounded-[6px] flex items-center gap-1.5 transition-all",
            size==="sm" ? "h-[22px]" : "h-[26px]",
            active ? "bg-white text-[var(--ink)] shadow-soft" : "text-[var(--mute)] hover:text-[var(--ink)]"
          )}>
          {it.icon ? <it.icon width={12} height={12}/> : null}
          {it.label}
        </button>
      );
    })}
  </div>
);

const Dot = ({ color="#c2c7d0", size=6, className="" }) => <span className={cx("inline-block rounded-full", className)} style={{ width:size, height:size, background:color }}/>;

const Kbd = ({ children }) => <span className="kbd">{children}</span>;

const Tooltip = ({ label, children, side="top" }) => (
  <span className="group relative inline-flex">
    {children}
    <span className={cx(
      "pointer-events-none absolute z-50 px-2 py-1 rounded-[6px] bg-[var(--ink)] text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity",
      side==="top"    && "bottom-full mb-1 left-1/2 -translate-x-1/2",
      side==="bottom" && "top-full mt-1 left-1/2 -translate-x-1/2",
      side==="right"  && "left-full ml-1 top-1/2 -translate-y-1/2"
    )}>{label}</span>
  </span>
);

const Progress = ({ value=0, max=100, className="", color="var(--accent)", showPct=false }) => {
  const pct = Math.min(100, Math.max(0, (value/max)*100));
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-[#eef0f3] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:color }}/>
      </div>
      {showPct && <span className="text-[11px] font-mono text-[var(--mute)]" style={{minWidth:"3ch"}}>{Math.round(pct)}%</span>}
    </div>
  );
};

const Ring = ({ value=0, size=38, stroke=3, color="var(--accent)", bg="#e8eaef", label, labelSize=11 }) => {
  const r = (size - stroke)/2;
  const c = 2*Math.PI*r;
  const off = c - (Math.min(100, value)/100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width:size, height:size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke={bg} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{transition:"stroke-dashoffset .5s"}}/>
      </svg>
      <div className="absolute font-semibold text-[var(--ink)]" style={{ fontSize:labelSize }}>{label ?? `${Math.round(value)}%`}</div>
    </div>
  );
};

const EmptyState = ({ icon:IconComp=Icon.Sparkle, title, body, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-8">
    <div className="w-12 h-12 rounded-[10px] bg-[var(--accent-wash)] flex items-center justify-center text-[var(--accent-ink)] mb-4 shadow-soft">
      <IconComp width={22} height={22}/>
    </div>
    <div className="font-semibold text-[14px] text-[var(--ink)]">{title}</div>
    {body && <div className="text-[12.5px] text-[var(--mute)] mt-1.5 max-w-[340px] leading-relaxed">{body}</div>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const BannerVisual = ({ kind="academic", className="", children }) => {
  const maps = {
    academic:  { a:"#3a3dd9", b:"#7b5dea", grain:22 },
    sports:    { a:"#0a7a78", b:"#13a79c", grain:30 },
    community: { a:"#b43664", b:"#d86a8e", grain:25 },
    career:    { a:"#b9812d", b:"#e0a44f", grain:20 },
    default:   { a:"#495266", b:"#6a7486", grain:24 },
  };
  const p = maps[kind] || maps.default;
  return (
    <div className={cx("relative overflow-hidden", className)} style={{background:`linear-gradient(135deg, ${p.a} 0%, ${p.b} 100%)`}}>
      <svg className="absolute inset-0 w-full h-full opacity-[.18]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`dots-${kind}`} x="0" y="0" width={p.grain} height={p.grain} patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${kind})`}/>
      </svg>
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"/>
      {children}
    </div>
  );
};

const Switch = ({ on=false, onToggle, label, hint, size="md" }) => {
  const w = size === "sm" ? 28 : 34;
  const h = size === "sm" ? 16 : 20;
  const d = h - 4;
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <span onClick={()=>onToggle && onToggle(!on)} className={cx("relative inline-flex items-center transition-colors rounded-full", on ? "bg-[var(--ink)]" : "bg-[#d9dce3]")} style={{ width:w, height:h }}>
        <span className="absolute bg-white rounded-full shadow-soft transition-all" style={{ width:d, height:d, left: on ? w - d - 2 : 2, top:2 }}/>
      </span>
      {(label || hint) && (
        <span className="flex flex-col">
          {label && <span className="text-[13px] font-medium">{label}</span>}
          {hint && <span className="text-[11.5px] text-[var(--mute)]">{hint}</span>}
        </span>
      )}
    </label>
  );
};

const Divider = ({ vertical, className="" }) => vertical
  ? <span className={cx("inline-block w-px bg-[var(--line)] self-stretch mx-1", className)}/>
  : <div className={cx("h-px bg-[var(--line)]", className)}/>;

const SectionLabel = ({ children, className="" }) => (
  <div className={cx("text-[10.5px] uppercase tracking-[0.08em] font-semibold text-[var(--mute)]", className)}>{children}</div>
);

const Sparkline = ({ values=[], width=80, height=22, color="var(--accent)", fill=true }) => {
  if (values.length === 0) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v,i) => `${i*step},${height - ((v-min)/range) * (height-2) - 1}`);
  return (
    <svg width={width} height={height} className="overflow-visible">
      {fill && (
        <polygon points={`0,${height} ${pts.join(" ")} ${width},${height}`} fill={color} opacity=".12"/>
      )}
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]} r="2" fill={color}/>
    </svg>
  );
};

/* Inline editable text */
const Inline = ({ value, onChange, className="", as:Tag="span", placeholder="Click to edit" }) => {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value);
  React.useEffect(()=>setVal(value),[value]);
  const commit = () => { setEditing(false); onChange && onChange(val); };
  if (editing) {
    return <input autoFocus value={val} onChange={e=>setVal(e.target.value)} onBlur={commit} onKeyDown={e=>e.key==="Enter"&&commit()} className={cx("bg-[var(--accent-wash)] outline-none border-b-2 border-[var(--accent)] px-0.5 -mx-0.5", className)}/>;
  }
  return <Tag onDoubleClick={()=>setEditing(true)} onClick={e=>{if(e.altKey)setEditing(true);}} className={cx("inline-edit cursor-text rounded-[3px] hover:bg-[#f0f1f4]/70 -mx-1 px-1", className)} title="Double-click or ⌥+click to edit">{val || <span className="text-[var(--mute)] italic">{placeholder}</span>}</Tag>;
};

/* Modal / Drawer */
const Drawer = ({ open, onClose, children, width=560 }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" style={{animation:"fadeUp .24s"}}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="absolute right-0 top-0 bottom-0 bg-[var(--surface)] shadow-float flex flex-col anim-fade-up" style={{ width, animation:"slideIn .28s ease-out" }}>
        {children}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
    </div>
  );
};

const Modal = ({ open, onClose, children, width=520 }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative bg-[var(--surface)] rounded-[12px] shadow-float anim-fade-up" style={{ width }}>{children}</div>
    </div>
  );
};

/* Toast */
const ToastCtx = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(xs => [...xs, { id, ...t }]);
    setTimeout(()=> setToasts(xs => xs.filter(x=>x.id!==id)), t.duration || 2800);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2">
        {toasts.map(t => (
          <div key={t.id} className="bg-[var(--ink)] text-white px-3.5 py-2 rounded-[8px] shadow-float flex items-center gap-2 text-[12.5px] anim-fade-up">
            {t.icon ? <t.icon width={14} height={14}/> : <Icon.CheckCircle width={14} height={14}/>}
            <span>{t.text}</span>
            {t.action && <button onClick={t.action.onClick} className="ml-2 text-[var(--accent-wash)] underline decoration-dotted underline-offset-2">{t.action.label}</button>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => React.useContext(ToastCtx);

window.UI = { cx, Btn, Chip, StatusChip, TypeChip, Avatar, AvatarStack, Card, CardHeader, Input, Segmented, Dot, Kbd, Tooltip, Progress, Ring, EmptyState, BannerVisual, Switch, Divider, SectionLabel, Sparkline, Inline, Drawer, Modal, ToastProvider, useToast };
Object.assign(window, window.UI);
