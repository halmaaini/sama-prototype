/* Command palette (⌘K) */

const CommandPalette = ({ open, onClose }) => {
  const { go, setHubLayout, hubLayout, setRole } = useApp();
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef(null);
  const [sel, setSel] = React.useState(0);

  React.useEffect(()=>{
    if (open) { setQ(""); setSel(0); setTimeout(()=>inputRef.current?.focus(), 20); }
  }, [open]);

  const activities = SAMA.ACTIVITIES.map(a => ({
    id:`act-${a.id}`, kind:"Activity", label:a.title, hint:`${a.type} · ${a.date}`, icon:SAMA.TYPE_META[a.type].icon, path:"activity", params:{id:a.id}, activity:a
  }));
  const people = SAMA.PEOPLE.filter(p=>p.role==="Student").map(p => ({
    id:`per-${p.id}`, kind:"Person", label:p.name, hint:`${p.sid} · ${p.dept}`, icon:"User", path:"people", params:{id:p.id}, avatar:p.avatar
  }));
  const items = [...SAMA.CMD_ITEMS, ...activities, ...people];
  const filtered = q
    ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase()) || (i.hint||"").toLowerCase().includes(q.toLowerCase()))
    : SAMA.CMD_ITEMS;

  const run = (it) => {
    onClose();
    if (it.action === "toggle-hub") { setHubLayout(hubLayout === "list" ? "board" : "list"); return; }
    if (it.path === "student") { go("student"); return; }
    if (it.path === "create") { go("create", it.params?.type); return; }
    if (it.path === "activity") { go("activity", it.params?.id); return; }
    if (it.path) go(it.path);
  };

  React.useEffect(()=>{
    const k = (e) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(filtered.length-1, s+1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s-1)); }
      if (e.key === "Enter") { e.preventDefault(); filtered[sel] && run(filtered[sel]); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, filtered, sel]);

  if (!open) return null;

  const grouped = {};
  filtered.forEach(it => { (grouped[it.kind] = grouped[it.kind] || []).push(it); });
  let idx = -1;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-[var(--ink)]/35 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="absolute left-1/2 top-[12vh] -translate-x-1/2 w-[620px] max-w-[90vw] bg-white rounded-[14px] shadow-float border hairline overflow-hidden anim-fade-up">
        <div className="flex items-center gap-2.5 px-3.5 h-12 border-b hairline">
          <Icon.Search width={16} height={16} className="text-[var(--mute)]"/>
          <input ref={inputRef} value={q} onChange={e=>{setQ(e.target.value); setSel(0);}} placeholder="Type a command, search activities or people…" className="flex-1 text-[14px] outline-none"/>
          <Kbd>esc</Kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto thin-scroll p-1.5">
          {Object.entries(grouped).length === 0 ? (
            <div className="text-center py-8 text-[13px] text-[var(--mute)]">Nothing matches "{q}"</div>
          ) : Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <div className="px-2.5 py-1.5 text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)]">{group}</div>
              {list.map(it => {
                idx++;
                const cur = idx;
                const IconC = Icon[it.icon] || Icon.Sparkle;
                return (
                  <button key={it.id} onMouseEnter={()=>setSel(cur)} onClick={()=>run(it)} className={cx("w-full flex items-center gap-2.5 px-2.5 h-9 rounded-[7px] text-left transition-colors", sel===cur ? "bg-[#eeefef]" : "hover:bg-[#f4f4f2]")}>
                    <span className="w-6 h-6 rounded-[6px] bg-white border hairline flex items-center justify-center text-[var(--mute)]"><IconC width={13} height={13}/></span>
                    <span className="text-[13px] text-[var(--ink)] truncate">{it.label}</span>
                    {it.hint && <span className="text-[11.5px] text-[var(--mute)] truncate">{it.hint}</span>}
                    <span className="flex-1"/>
                    {sel===cur && <Icon.ArrowRight width={13} height={13} className="text-[var(--mute)]"/>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 px-3.5 h-9 border-t hairline bg-[#fafafa] text-[11px] text-[var(--mute)]">
          <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span>
          <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> Open</span>
          <span className="flex items-center gap-1.5"><Kbd>⌘</Kbd><Kbd>K</Kbd> Toggle</span>
          <span className="ml-auto">{filtered.length} result{filtered.length!==1?"s":""}</span>
        </div>
      </div>
    </div>
  );
};

window.CommandPalette = CommandPalette;
