/* App entry — routing, role context, tweaks */

const TOKENS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "accent": "indigo",
  "hubDefault": "list",
  "role": "coord"
}/*EDITMODE-END*/;

const ACCENTS = {
  indigo: { accent:"#3a3dd9", ink:"#1f209a", wash:"#ecedff" },
  teal:   { accent:"#0a7a78", ink:"#065351", wash:"#daeeec" },
  rose:   { accent:"#b43664", ink:"#7e1f45", wash:"#f6e1ea" },
  amber:  { accent:"#a65e0a", ink:"#6e3d06", wash:"#fbecd2" },
};

const App = () => {
  const [route, setRoute] = React.useState(() => localStorage.getItem("sama.route") || "home");
  const [activeActivity, setActiveActivity] = React.useState(() => localStorage.getItem("sama.act") || "a1");
  const [activePerson, setActivePerson] = React.useState(null);
  const [createType, setCreateType] = React.useState(null);
  const [role, setRole] = React.useState(TOKENS.role);
  const [hubLayout, setHubLayout] = React.useState(TOKENS.hubDefault);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [accent, setAccent] = React.useState(TOKENS.accent);
  const [density, setDensity] = React.useState(TOKENS.density);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const [semester, setSemester] = React.useState(SAMA.SEMESTERS[0]);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifUnread = SAMA.NOTIFS.filter(n => !n.read).length;

  const go = (r, param) => {
    setRoute(r);
    localStorage.setItem("sama.route", r);
    if (r === "activity" && param) { setActiveActivity(param); localStorage.setItem("sama.act", param); }
    if (r === "people" && param) setActivePerson(param);
    if (r === "create") setCreateType(param || null);
    if (r === "calendar") setHubLayout("calendar");
  };

  // Apply accent
  React.useEffect(()=>{
    const a = ACCENTS[accent] || ACCENTS.indigo;
    document.documentElement.style.setProperty("--accent", a.accent);
    document.documentElement.style.setProperty("--accent-ink", a.ink);
    document.documentElement.style.setProperty("--accent-wash", a.wash);
  },[accent]);

  // ⌘K shortcut
  React.useEffect(()=>{
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(p=>!p); }
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "INPUT") {
        // noop, reserved
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  },[]);

  // Tweaks bridge
  React.useEffect(()=>{
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({type:"__edit_mode_available"},"*");
    return () => window.removeEventListener("message", onMsg);
  },[]);

  const pushToast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(s => [...s, { id, ...t }]);
    setTimeout(() => setToasts(s => s.filter(x=>x.id!==id)), 3400);
  };

  const openCmd = () => setPaletteOpen(true);
  const ctx = { route, setRoute, go, activeActivity, activePerson, createType, setCreateType, role, setRole, hubLayout, setHubLayout, paletteOpen, setPaletteOpen, openCmd, semester, setSemester, notifOpen, setNotifOpen, notifUnread, breadcrumb: null, pageTitle: "" };

  return (
    <ToastProvider>
      <AppCtx.Provider value={ctx}>
          <div className={cx("h-screen flex", density==="compact" && "text-[12.5px]")}>
            <Sidebar/>
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar/>
              <main className="flex-1 overflow-hidden bg-[var(--bg)]">
                {route === "home" && <Home/>}
                {route === "hub" && <Hub/>}
                {route === "calendar" && <Hub/>}
                {route === "create" && <Create/>}
                {route === "activity" && <Detail/>}
                {route === "approvals" && <Approvals/>}
                {route === "people" && <People/>}
                {route === "reports" && <Reports/>}
                {route === "notifications" && <Notifications/>}
                {route === "student" && <Student/>}
                {route === "health" && <Health/>}
                {route === "counselor" && <Counselor/>}
                {(route === "transport" || route === "docs" || route === "certs" || route === "feedback" || route === "venues") && <Modules/>}
              </main>
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)}/>
          <NotifDrawer open={notifOpen} onClose={()=>setNotifOpen(false)}/>
          {tweaksOpen && <TweaksPanel accent={accent} setAccent={(v)=>{setAccent(v); persist({accent:v});}} density={density} setDensity={(v)=>{setDensity(v); persist({density:v});}} role={role} setRole={(v)=>{setRole(v); persist({role:v});}} hubDefault={hubLayout} setHubDefault={(v)=>{setHubLayout(v); persist({hubDefault:v});}}/>}
          <Toasts items={toasts}/>
      </AppCtx.Provider>
    </ToastProvider>
  );
};

const persist = (edits) => window.parent.postMessage({type:"__edit_mode_set_keys", edits},"*");

/* ============================================================ Home dashboard */
const Home = () => {
  const { go, role } = useApp();
  return (
    <div className="h-full overflow-y-auto thin-scroll">
      <div className="px-7 pt-6 pb-5 border-b hairline bg-[var(--surface)]">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--mute)] font-semibold">{role==="coord"?"Activities Coordinator":role==="ops"?"Operations Manager":role==="dean"?"Dean's Office":"Student view"} · Wednesday, Oct 15</div>
            <h1 className="text-[28px] font-semibold tracking-tight mt-1">Good morning, Jane.</h1>
            <p className="text-[13px] text-[var(--mute)] mt-1 max-w-[540px]">Three activities need your eyes today. Budget is healthy, registrations are up 18% on last term, and the freshman carnival is almost full.</p>
          </div>
          <div className="flex items-center gap-2"><Btn variant="outline" size="sm" icon={Icon.Upload}>Import schedule</Btn><Btn variant="default" size="sm" icon={Icon.Plus} onClick={()=>go("create")}>New activity</Btn></div>
        </div>
      </div>
      <div className="px-7 py-6 grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="grid grid-cols-4 gap-3">
            <HomeStat label="Live right now" value="4" hint="events in progress" pulse/>
            <HomeStat label="This week" value="12" hint="activities" delta="+3"/>
            <HomeStat label="Pending approval" value="6" hint="2 high priority" action={()=>go("approvals")}/>
            <HomeStat label="Registrations" value="2,318" hint="↑ 18% vs last term"/>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4"><div><div className="text-[14px] font-semibold">Today's run sheet</div><div className="text-[11.5px] text-[var(--mute)]">What's happening and who's on it.</div></div><Btn variant="ghost" size="sm" trailingIcon={Icon.ChevRight} onClick={()=>go("hub")}>Full schedule</Btn></div>
            <div className="space-y-2">
              {[
                {t:"AI Ethics Workshop", time:"5:00 — 7:00 PM", venue:"Conf Hall B", type:"Event", status:"active"},
                {t:"Robotics Club · Week 6", time:"6:00 — 8:00 PM", venue:"Innovation Lab", type:"Program", status:"active"},
                {t:"Debate Trip · permissions due", time:"Before 6 PM", venue:"Admin", type:"Task", status:"warn"},
                {t:"Art Exhibition Setup", time:"Overnight", venue:"Gallery 2", type:"Event", status:"next"},
              ].map((x,i)=>{
                const m = SAMA.TYPE_META[x.type]; const I = Icon[m.icon];
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-[9px] border hairline-2 hover:bg-[#fafafa] cursor-pointer">
                    <div className="w-9 h-9 rounded-[7px] flex items-center justify-center" style={{background:m.wash, color:m.ink}}><I width={15} height={15}/></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate">{x.t}</div>
                      <div className="text-[11.5px] text-[var(--mute)] flex items-center gap-3"><span className="flex items-center gap-1"><Icon.Clock width={11} height={11}/>{x.time}</span><span className="flex items-center gap-1"><Icon.Pin width={11} height={11}/>{x.venue}</span></div>
                    </div>
                    {x.status==="active" && <Chip tone="green"><span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] pulse-dot"/>Live</Chip>}
                    {x.status==="warn" && <Chip tone="amber">Needs action</Chip>}
                    {x.status==="next" && <Chip tone="slate">Up next</Chip>}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3"><div className="text-[14px] font-semibold">Term engagement</div><Segmented size="sm" value="term" onChange={()=>{}} items={[{value:"week",label:"Week"},{value:"term",label:"Term"}]}/></div>
            <TrendChart/>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3"><div className="text-[14px] font-semibold">Needs approval</div><Chip tone="amber">6</Chip></div>
            {[["Freshman Carnival","SLA 2h 14m","high"],["Debate Trip · Oxford","SLA 4h 30m","high"],["AI Ethics Workshop","SLA 6h 11m","med"]].map(([t,s,p],i)=>(<div key={i} className="py-2 border-b hairline-2 last:border-0 flex items-center gap-2 cursor-pointer hover:bg-[#fafafa]" onClick={()=>go("approvals")}><span className={cx("w-1.5 h-1.5 rounded-full", p==="high"?"bg-[var(--bad)]":"bg-[var(--warn)]")}/><div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium truncate">{t}</div><div className="text-[10.5px] text-[var(--mute)] font-mono">{s}</div></div><Icon.ChevRight width={12} height={12} className="text-[var(--mute-2)]"/></div>))}
            <Btn variant="outline" size="sm" className="w-full mt-3" onClick={()=>go("approvals")}>Open approvals inbox</Btn>
          </Card>
          <Card className="p-4">
            <div className="text-[14px] font-semibold mb-3">Team activity</div>
            {[["Reem Abdulla","approved","AI Ethics Workshop","2h"],["Hassan Qureshi","submitted","Beach Cleanup v2","4h"],["Layla Odeh","commented on","Women's Basketball","5h"],["System","auto-issued 28 certificates","",  "6h"]].map(([who,verb,what,when],i)=>(<div key={i} className="flex items-start gap-2 py-1.5 text-[12px]"><Avatar name={who} size={20}/><div className="flex-1"><div><b>{who}</b> <span className="text-[var(--mute)]">{verb}</span> {what && <span>{what}</span>}</div><div className="text-[10.5px] text-[var(--mute)] font-mono">{when} ago</div></div></div>))}
          </Card>
          <Card className="p-4 bg-[var(--ink)] text-white">
            <div className="flex items-center gap-2 mb-1"><Icon.Sparkle width={14} height={14} className="opacity-70"/><span className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Suggestion</span></div>
            <div className="text-[13.5px] leading-snug">Photography Club and Film Night are both scheduled Nov 6. Want to suggest rescheduling one?</div>
            <div className="mt-3 flex gap-1.5"><button className="text-[11.5px] px-2.5 py-1 rounded-[5px] bg-white text-[var(--ink)] font-medium">Review</button><button className="text-[11.5px] px-2.5 py-1 rounded-[5px] bg-white/10 text-white">Dismiss</button></div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const HomeStat = ({ label, value, hint, delta, pulse, action }) => (
  <Card className={cx("p-3.5 cursor-pointer hover:shadow-soft transition-shadow")} onClick={action}>
    <div className="flex items-center gap-1.5"><div className="text-[11.5px] text-[var(--mute)]">{label}</div>{pulse && <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] pulse-dot"/>}</div>
    <div className="flex items-baseline gap-1.5 mt-1"><div className="text-[26px] font-semibold tracking-tight">{value}</div>{delta && <Chip tone="green">{delta}</Chip>}</div>
    <div className="text-[10.5px] text-[var(--mute)] mt-0.5">{hint}</div>
  </Card>
);

/* ============================================================ Tweaks */
const TweaksPanel = ({ accent, setAccent, density, setDensity, role, setRole, hubDefault, setHubDefault }) => (
  <div className="fixed right-4 bottom-4 w-[280px] bg-white border hairline rounded-[12px] shadow-float z-[70] overflow-hidden">
    <div className="px-3.5 py-2.5 bg-[var(--ink)] text-white flex items-center gap-2"><Icon.Sparkle width={13} height={13}/><span className="text-[12.5px] font-semibold">Tweaks</span><span className="flex-1"/><span className="text-[10.5px] opacity-60">Persisted</span></div>
    <div className="p-3.5 space-y-3">
      <div><div className="text-[10.5px] uppercase tracking-wider text-[var(--mute)] font-semibold mb-1.5">Viewing as</div><div className="grid grid-cols-2 gap-1">{[["coord","Coordinator"],["ops","Ops Manager"],["dean","Dean's office"],["student","Student"]].map(([v,l])=><button key={v} onClick={()=>setRole(v)} className={cx("h-7 rounded-[6px] text-[11.5px] border", role===v?"bg-[var(--ink)] text-white border-[var(--ink)]":"hairline bg-white")}>{l}</button>)}</div></div>
      <div><div className="text-[10.5px] uppercase tracking-wider text-[var(--mute)] font-semibold mb-1.5">Accent</div><div className="flex gap-1.5">{Object.entries(ACCENTS).map(([k,v])=><button key={k} onClick={()=>setAccent(k)} className={cx("w-7 h-7 rounded-[7px] border-2", accent===k?"ring-2 ring-offset-1":"border-transparent")} style={{background:v.accent, borderColor: accent===k?v.accent:"transparent"}}/>)}</div></div>
      <div><div className="text-[10.5px] uppercase tracking-wider text-[var(--mute)] font-semibold mb-1.5">Density</div><Segmented size="sm" value={density} onChange={setDensity} items={[{value:"comfortable",label:"Comfortable"},{value:"compact",label:"Compact"}]}/></div>
      <div><div className="text-[10.5px] uppercase tracking-wider text-[var(--mute)] font-semibold mb-1.5">Default hub layout</div><Segmented size="sm" value={hubDefault} onChange={setHubDefault} items={[{value:"list",label:"List"},{value:"board",label:"Board"},{value:"calendar",label:"Cal"},{value:"timeline",label:"Time"}]}/></div>
    </div>
  </div>
);

/* ============================================================ Toasts */
const Toasts = ({ items }) => (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] flex flex-col gap-2 items-center pointer-events-none">
    {items.map(t => {
      const I = t.icon || Icon.CheckCircle;
      return (
        <div key={t.id} className="bg-[var(--ink)] text-white rounded-[9px] px-3.5 py-2 shadow-float flex items-center gap-2 text-[12.5px] anim-fade-up"><I width={13} height={13} className="text-[var(--ok)]"/>{t.text}</div>
      );
    })}
  </div>
);

/* ============================================================ Notifications drawer */
const NotifDrawer = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose}/>
      <div className="absolute right-0 top-0 bottom-0 w-[380px] bg-[var(--surface)] shadow-float flex flex-col anim-fade-up border-l hairline">
        <div className="flex items-center justify-between px-5 py-4 border-b hairline shrink-0">
          <div>
            <div className="text-[15px] font-semibold">Notifications</div>
            <div className="text-[11.5px] text-[var(--mute)]">{SAMA.NOTIFS.filter(n=>!n.read).length} unread</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[7px] hover:bg-black/5 flex items-center justify-center text-[var(--mute)]"><Icon.X width={15} height={15}/></button>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll p-3 space-y-2">
          {SAMA.NOTIFS.map(n => {
            const iconMap = { waitlist:"Users", approval:"ClipboardCheck", attendance:"Activity", task:"Tasks", cert:"Medal", doc:"Doc" };
            const I = Icon[iconMap[n.type] || "Bell"];
            return (
              <div key={n.id} className={cx("flex items-start gap-3 p-3 rounded-[9px] border hover:bg-[#fafafa] cursor-pointer", n.read ? "hairline bg-white" : "border-[var(--accent-wash)] bg-[var(--accent-wash)]/30")}>
                <div className="w-8 h-8 rounded-[7px] bg-[var(--accent-wash)] flex items-center justify-center shrink-0 text-[var(--accent)]"><I width={14} height={14}/></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium">{n.text}</div>
                  <div className="text-[11px] text-[var(--mute)] mt-0.5 font-mono">{n.when} ago</div>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-1"/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
