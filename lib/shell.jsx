/* App shell: sidebar, top bar, global context */

const AppCtx = React.createContext(null);

const useApp = () => React.useContext(AppCtx);

const NAV = [
  { id:"hub",           label:"Activity Hub",    icon:"Home",          badge:null },
  { id:"approvals",     label:"Approvals",        icon:"ClipboardCheck", badge:3 },
  { id:"calendar",      label:"Calendar",         icon:"Cal",           badge:null },
  { id:"people",        label:"People Registry",  icon:"Users",         badge:null },
  { id:"reports",       label:"Reports",          icon:"Chart",         badge:null },
];
const NAV_SECONDARY = [
  { id:"docs",          label:"Documents",        icon:"Doc" },
  { id:"transport",     label:"Transportation",   icon:"Bus" },
  { id:"venues",        label:"Venues",           icon:"Pin" },
  { id:"certs",         label:"Certificates",     icon:"Medal" },
  { id:"feedback",      label:"Feedback",         icon:"Star" },
  { id:"notifications", label:"Notifications",    icon:"Bell", badge:3 },
];

const Sidebar = () => {
  const { route, go, collapsed, setCollapsed, role, setRole } = useApp();
  return (
    <aside className={cx("shrink-0 bg-[var(--surface)] border-r hairline flex flex-col transition-[width] duration-200", collapsed ? "w-[60px]" : "w-[232px]")}>
      <div className="h-[52px] flex items-center justify-between px-3 border-b hairline shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <LogoMark/>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight">SAMA</span>
              <span className="text-[10px] font-medium text-[var(--mute)] uppercase tracking-wider">Staff</span>
            </div>
          </div>
        ) : <div className="mx-auto"><LogoMark/></div>}
        {!collapsed && (
          <Tooltip label="Collapse sidebar"><button onClick={()=>setCollapsed(true)} className="w-6 h-6 rounded-md hover:bg-black/5 text-[var(--mute)] flex items-center justify-center"><Icon.ChevLeft width={14} height={14}/></button></Tooltip>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto thin-scroll py-2 px-2">
        <div className="space-y-[2px]">
          {NAV.map(n => <NavItem key={n.id} item={n} active={route===n.id} collapsed={collapsed} onClick={()=>go(n.id)}/>)}
        </div>

        {!collapsed && <div className="mt-5 mb-1.5 px-2"><SectionLabel>Modules</SectionLabel></div>}
        <div className={cx("space-y-[2px]", collapsed && "mt-3 pt-3 border-t hairline")}>
          {NAV_SECONDARY.map(n => <NavItem key={n.id} item={n} active={route===n.id} collapsed={collapsed} onClick={()=>go(n.id)}/>)}
        </div>

        {!collapsed && (
          <>
            <div className="mt-5 mb-1.5 px-2 flex items-center justify-between">
              <SectionLabel>Pinned</SectionLabel>
              <button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.Plus width={12} height={12}/></button>
            </div>
            <div className="space-y-[2px]">
              <PinnedLink label="Freshman Orientation" type="Event" onClick={()=>go("activity","a1")}/>
              <PinnedLink label="Coding Bootcamp" type="Program" onClick={()=>go("activity","a7")}/>
              <PinnedLink label="Beach Cleanup" type="Volunteering" onClick={()=>go("activity","a3")}/>
            </div>
          </>
        )}
      </nav>

      <div className="p-2 border-t hairline shrink-0">
        {!collapsed ? (
          <RoleBlock role={role} setRole={setRole}/>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <Tooltip label={role==="ops" ? "Ops Manager" : role==="coord" ? "Coordinator" : "Club Leader"} side="right">
              <Avatar name={role==="ops"?"Reem Abdulla":role==="coord"?"Jane Doe":"Aisha Farhat"} size={26}/>
            </Tooltip>
            <button onClick={()=>setCollapsed(false)} className="w-6 h-6 rounded-md hover:bg-black/5 text-[var(--mute)] flex items-center justify-center"><Icon.ChevRight width={14} height={14}/></button>
          </div>
        )}
      </div>
    </aside>
  );
};

const NavItem = ({ item, active, collapsed, onClick }) => {
  const I = Icon[item.icon];
  return (
    <button onClick={onClick} className={cx(
      "w-full flex items-center gap-2.5 rounded-[7px] text-[13px] font-medium transition-colors group relative",
      collapsed ? "h-8 w-8 mx-auto justify-center" : "h-8 px-2.5",
      active ? "bg-[#eeefef] text-[var(--ink)]" : "text-[#474d5a] hover:bg-[#f4f4f2] hover:text-[var(--ink)]"
    )}>
      {active && !collapsed && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[var(--ink)]"/>}
      <I width={16} height={16}/>
      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
      {!collapsed && item.badge != null && <span className="chip bg-[var(--ink)] text-white text-[10px] px-1.5">{item.badge}</span>}
    </button>
  );
};

const PinnedLink = ({ label, type, onClick }) => {
  const m = SAMA.TYPE_META[type];
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 rounded-[7px] h-7 px-2.5 text-[12.5px] text-[#474d5a] hover:bg-[#f4f4f2] hover:text-[var(--ink)] transition-colors">
      <span className="w-[6px] h-[6px] rounded-full" style={{background:m.dot}}/>
      <span className="flex-1 text-left truncate">{label}</span>
    </button>
  );
};

const RoleBlock = ({ role, setRole }) => {
  const [open, setOpen] = React.useState(false);
  const { go } = useApp();
  const profile = role==="ops" ? { name:"Reem Abdulla", sub:"Ops Manager" }
                : role==="coord" ? { name:"Jane Doe", sub:"Coordinator" }
                : role==="student" ? { name:"Fatima Al-Nuaimi", sub:"Student · Engineering" }
                : { name:"Aisha Farhat", sub:"Club Leader · CS Club" };
  const pickRole = (id) => {
    setRole(id);
    setOpen(false);
    if (id === "student") go("student");
    else if (role === "student") go("home");
  };
  return (
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-[8px] hover:bg-[#f4f4f2] transition-colors">
        <Avatar name={profile.name} size={28}/>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12.5px] font-semibold truncate leading-tight">{profile.name}</div>
          <div className="text-[10.5px] text-[var(--mute)] truncate mt-0.5">{profile.sub}</div>
        </div>
        <Icon.ChevUp width={12} height={12} className="text-[var(--mute)]"/>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border hairline rounded-[10px] shadow-float p-1.5 anim-fade-up z-20">
          <div className="px-2 py-1.5 border-b hairline mb-1">
            <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)]">View as</div>
          </div>
          {[{id:"ops",label:"Ops Manager",hint:"Full access, approvals"},{id:"coord",label:"Coordinator",hint:"Their activities"},{id:"club",label:"Club Leader",hint:"Single club"},{id:"student",label:"Student",hint:"Student portal view"}].map(opt => (
            <button key={opt.id} onClick={()=>pickRole(opt.id)} className={cx("w-full flex items-start gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f4f4f2] text-left", role===opt.id && "bg-[#eef0f3]")}>
              <span className="mt-0.5">{role===opt.id ? <Icon.CheckCircle width={14} height={14} className="text-[var(--accent)]"/> : <Icon.Circle width={14} height={14} className="text-[#c2c7d0]"/>}</span>
              <span>
                <div className="text-[12.5px] font-medium leading-tight">{opt.label}</div>
                <div className="text-[11px] text-[var(--mute)] mt-0.5">{opt.hint}</div>
              </span>
            </button>
          ))}
          <Divider className="my-1"/>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f4f4f2] text-left text-[12.5px]"><Icon.Settings width={14} height={14}/> Settings</button>
        </div>
      )}
    </div>
  );
};

const LogoMark = () => (
  <div className="w-7 h-7 rounded-[7px] bg-[var(--ink)] text-white flex items-center justify-center shadow-soft relative overflow-hidden">
    <span className="font-serif text-[18px] leading-none relative z-10">s</span>
    <span className="absolute right-[3px] top-[3px] w-1.5 h-1.5 rounded-full bg-[var(--accent)]"/>
  </div>
);

const TopBar = () => {
  const { semester, setSemester, openCmd, role, pageTitle, breadcrumb, notifOpen, setNotifOpen, notifUnread } = useApp();
  return (
    <header className="h-[52px] flex items-center justify-between px-4 border-b hairline bg-[var(--surface)] shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumb}
      </div>

      <div className="flex-1 max-w-lg px-6">
        <button onClick={openCmd} className="w-full flex items-center gap-2 h-8 px-2.5 rounded-[8px] bg-[#f0f1f3] hover:bg-[#e9eaed] transition-colors text-[12.5px] text-[var(--mute)] group">
          <Icon.Search width={14} height={14}/>
          <span>Search activities, people, documents…</span>
          <span className="flex-1"/>
          <Kbd>⌘</Kbd><Kbd>K</Kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <SemesterPicker semester={semester} setSemester={setSemester}/>
        <Tooltip label="Help"><button className="w-8 h-8 rounded-[7px] hover:bg-black/5 text-[var(--mute)] flex items-center justify-center"><Icon.Info width={15} height={15}/></button></Tooltip>
        <Tooltip label="Notifications">
          <button onClick={()=>setNotifOpen(true)} className="w-8 h-8 rounded-[7px] hover:bg-black/5 text-[var(--mute)] flex items-center justify-center relative">
            <Icon.Bell width={15} height={15}/>
            {notifUnread > 0 && <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-[var(--bad)] ring-2 ring-white pulse-dot"/>}
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

const SemesterPicker = ({ semester, setSemester }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[7px] hover:bg-black/5 text-[12.5px] font-medium">
        <Icon.Cal width={13} height={13} className="text-[var(--mute)]"/>
        {semester}
        <Icon.ChevDown width={12} height={12} className="text-[var(--mute)]"/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={()=>setOpen(false)}/>
          <div className="absolute right-0 top-full mt-1.5 bg-white border hairline rounded-[10px] shadow-float p-1 z-30 min-w-[180px] anim-fade-up">
            {SAMA.SEMESTERS.map(s => (
              <button key={s} onClick={()=>{setSemester(s);setOpen(false);}} className={cx("w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-[#f4f4f2] text-left text-[12.5px]", s===semester && "font-medium")}>
                {s}
                {s===semester && <Icon.Check width={12} height={12} className="text-[var(--accent)]"/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* Breadcrumb */
const Breadcrumb = ({ items=[] }) => (
  <nav className="flex items-center gap-1.5 text-[13px] min-w-0">
    {items.map((it, i) => (
      <React.Fragment key={i}>
        {i > 0 && <Icon.ChevRight width={12} height={12} className="text-[#c2c7d0] shrink-0"/>}
        {it.onClick
          ? <button onClick={it.onClick} className="text-[var(--mute)] hover:text-[var(--ink)] truncate">{it.label}</button>
          : <span className={cx(i===items.length-1 ? "font-semibold text-[var(--ink)]" : "text-[var(--mute)]", "truncate")}>{it.label}</span>}
      </React.Fragment>
    ))}
  </nav>
);

window.Shell = { AppCtx, useApp, Sidebar, TopBar, Breadcrumb, LogoMark };
Object.assign(window, window.Shell);
