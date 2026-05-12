/* Activity Detail — Event with QR, Program with sessions, Volunteering hub */

const Detail = () => {
  const { activeActivity, go } = useApp();
  const live = useActivity(activeActivity);
  const a = live || SAMA.ACTIVITIES.find(x => x.id === activeActivity) || SAMA.ACTIVITIES[0];
  const [tab, setTab] = React.useState("overview");
  const [closeModalOpen, setCloseModalOpen] = React.useState(false);
  const m = SAMA.TYPE_META[a.type];
  const owner = SAMA.PEOPLE.find(p => p.id === a.owner);
  const toast = useToast();

  const stageAction = (label, fn, icon, variant="default") => ({label, fn, icon, variant});
  const actions = [];
  if (a.status === "Draft") actions.push(stageAction("Submit for approval", ()=>{submitForApproval(a.id); toast.push({text:"Submitted to Reem Abdulla", icon:Icon.Send});}, Icon.Send, "default"));
  if (a.status === "Pending Approval") {
    actions.push(stageAction("Approve", ()=>{approve(a.id); toast.push({text:"Approved — now live", icon:Icon.CheckCircle});}, Icon.Check, "default"));
    actions.push(stageAction("Reject", ()=>{reject(a.id, "Policy"); toast.push({text:"Rejected"});}, Icon.X, "outline"));
    actions.push(stageAction("Request changes", ()=>{requestChanges(a.id, "Please revise"); toast.push({text:"Sent back to draft"});}, Icon.Send, "outline"));
  }
  if (a.status === "Active") {
    actions.push(stageAction("Close activity", ()=>setCloseModalOpen(true), Icon.CheckCircle, "default"));
    actions.push(stageAction("Cancel", ()=>{cancel(a.id, "No longer needed"); toast.push({text:"Cancelled"});}, Icon.X, "outline"));
  }

  /* Inject "Pending" tab for requires-approval activities */
  const pendingCount = a.requiresApproval
    ? (a.id === "a3" ? SAMA.PENDING_A3.length : a.id === "a26" ? SAMA.PENDING_A26.length : 3)
    : 0;

  const baseTabs = {
    Event:       [["overview","Overview","Gauge"],["registrations","Registrations","ClipboardCheck"],["checkin","Check-in","Qr"],["logistics","Logistics","Pin"],["comms","Comms","Send"],["docs","Documents","Doc"],["feedback","Feedback","Star"],["activity","Activity log","Clock"]],
    Program:     [["overview","Overview","Gauge"],["sessions","Sessions","Cal"],["roster","Roster","Users"],["attendance","Attendance","ClipboardCheck"],["comms","Comms","Send"],["activity","Activity log","Clock"]],
    Volunteering:[["overview","Overview","Gauge"],["applicants","Applicants","Users"],["hours","Hours & certs","Medal"],["comms","Comms","Send"],["activity","Activity log","Clock"]],
    Task:        [["overview","Overview","Gauge"],["subtasks","Subtasks","ClipboardCheck"],["activity","Activity log","Clock"]],
    External:    [["overview","Overview","Gauge"],["activity","Activity log","Clock"]],
  }[a.type] || [];

  const tabs = a.requiresApproval && pendingCount > 0
    ? [baseTabs[0], ["pending","Pending","Flag"], ...baseTabs.slice(1)]
    : baseTabs;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hero header */}
      <div className="border-b hairline bg-[var(--surface)]">
        <BannerVisual kind={a.type==="Volunteering"?"community":a.type==="Program"?"sports":"academic"} className="h-[200px] relative">
          {/* Top row: back + breadcrumb */}
          <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={()=>go("hub")} className="w-7 h-7 rounded-[7px] bg-white/90 backdrop-blur hover:bg-white flex items-center justify-center text-[var(--ink)]"><Icon.ChevLeft width={14} height={14}/></button>
              <div className="text-[11.5px] text-white/85 flex items-center gap-1.5">
                <span className="hover:text-white cursor-pointer">Activity Hub</span>
                <span className="text-white/50">/</span>
                <span className="hover:text-white cursor-pointer">{a.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="h-7 px-2.5 rounded-[7px] bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[12px] font-medium flex items-center gap-1.5"><Icon.Share width={12} height={12}/>Share</button>
              <button className="h-7 px-2.5 rounded-[7px] bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[12px] font-medium flex items-center gap-1.5"><Icon.Copy width={12} height={12}/>Duplicate</button>
              <button className="h-7 px-2.5 rounded-[7px] bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[12px] font-medium flex items-center gap-1.5"><Icon.Edit width={12} height={12}/>Edit</button>
              {actions.map((act, i) => (
                <button key={i} onClick={act.fn} className={cx("h-7 px-2.5 rounded-[7px] text-[12px] font-semibold flex items-center gap-1.5", act.variant === "default" ? "bg-white text-[var(--ink)]" : "bg-white/15 hover:bg-white/25 backdrop-blur text-white")}>
                  <act.icon width={12} height={12}/>{act.label}
                </button>
              ))}
              {a.qr && a.status === "Active" && <button onClick={()=>setTab("checkin")} className="h-7 px-2.5 rounded-[7px] bg-white text-[var(--ink)] text-[12px] font-semibold flex items-center gap-1.5"><Icon.Qr width={12} height={12}/>Check-in mode</button>}
            </div>
          </div>

          {/* Bottom: title + meta over banner */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/55 via-black/20 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <TypeChip type={a.type}/>
              <StatusChip status={a.status}/>
              {a.tags && a.tags.slice(0,3).map(t => <span key={t} className="chip bg-white/20 text-white border-white/0">#{t}</span>)}
            </div>
            <h1 className="text-[24px] font-semibold tracking-tight leading-tight text-white">{a.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-[12.5px] text-white/90 flex-wrap">
              <span className="flex items-center gap-1.5"><Icon.Cal width={12} height={12}/>{a.date}{a.time && ` · ${a.time}`}</span>
              {a.venue && <span className="flex items-center gap-1.5"><Icon.Pin width={12} height={12}/>{a.venue}</span>}
              {owner && <span className="flex items-center gap-1.5"><Avatar name={owner.name} size={16}/>{owner.name}</span>}
              {a.capacity && <span className="flex items-center gap-1.5"><Icon.Users width={12} height={12}/>{a.registered}/{a.capacity} registered</span>}
            </div>
          </div>
        </BannerVisual>

        <div className="px-6 flex items-center gap-0.5 border-t hairline-2 overflow-x-auto thin-scroll">
          {tabs.map(([id,label,icon]) => {
            const I = Icon[icon];
            return (
              <button key={id} onClick={()=>setTab(id)} className={cx("px-3 h-10 text-[12.5px] font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors", tab===id ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--mute)] hover:text-[var(--ink)]")}>
                <I width={13} height={13}/>{label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        {tab === "overview" && <OverviewTab a={a}/>}
        {tab === "pending" && <PendingRegistrationsTab a={a}/>}
        {tab === "registrations" && <RegistrationsTab a={a}/>}
        {tab === "checkin" && <CheckinTab a={a}/>}
        {tab === "sessions" && <SessionsTab a={a}/>}
        {tab === "applicants" && <ApplicantsTab a={a}/>}
        {tab === "hours" && <HoursTab a={a}/>}
        {tab === "logistics" && <LogisticsTab a={a}/>}
        {tab === "comms" && <CommsTab a={a}/>}
        {tab === "docs" && <DocsTab a={a}/>}
        {tab === "feedback" && <FeedbackTab a={a}/>}
        {tab === "roster" && <RosterTab a={a}/>}
        {tab === "attendance" && <AttendanceTab a={a}/>}
        {tab === "subtasks" && <SubtasksTab a={a}/>}
        {tab === "activity" && <ActivityLogTab a={a}/>}
      </div>
      {closeModalOpen && <CloseActivityModal a={a} onClose={()=>setCloseModalOpen(false)} onConfirm={()=>{markComplete(a.id); setCloseModalOpen(false); toast.push({text:"Activity closed · surveys dispatched · certificates generating", icon:Icon.CheckCircle});}}/>}
    </div>
  );
};

/* ============================================================ Overview */
const OverviewTab = ({ a }) => {
  const m = SAMA.TYPE_META[a.type];
  return (
    <div className="p-6 grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-5">
        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {a.capacity ? (
            <>
              <Stat label="Registered" value={a.registered} total={a.capacity} accent={m.dot}/>
              <Stat label="Waitlist" value="12" hint="+3 today"/>
              <Stat label="Check-ins ready" value={a.qr ? "QR active" : "Manual"} hint={a.qr ? "Code regenerates 5m" : ""}/>
              <Stat label="Budget used" value="AED 4,200" hint="of 6,000"/>
            </>
          ) : a.targetHours ? (
            <>
              <Stat label="Applicants" value={a.applicants || 0} total="80"/>
              <Stat label="Confirmed" value={a.confirmed || 0}/>
              <Stat label="Hours logged" value={a.hoursLogged || 0}/>
              <Stat label="Certificates" value={a.certs || 0} hint="auto-issued"/>
            </>
          ) : (
            <>
              <Stat label="Subtasks" value={`${a.subtasksDone||0}/${a.subtasks||0}`}/>
              <Stat label="Assignees" value="3"/>
              <Stat label="Days to deadline" value="4" hint="Tight"/>
              <Stat label="Blockers" value="0" hint="all green"/>
            </>
          )}
        </div>

        {/* Description */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">About this activity</div>
            <button className="text-[11.5px] text-[var(--accent)] hover:underline">Edit</button>
          </div>
          <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">{a.desc || "Hosting an interactive workshop exploring how machine learning systems make decisions, and what we owe users when they do. Recommended for all majors. Light refreshments provided. Sign-language interpretation available on request — check the accessibility options below."}</p>
          <div className="mt-3 flex items-center gap-2">
            <Chip tone="indigo">{a.type}</Chip>
            {a.tags && a.tags.map(t => <span key={t} className="chip bg-[#f1f2ef]">#{t}</span>)}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Lifecycle · live status: <span className="text-[var(--ink)] font-semibold">{a.status}</span></div>
          <div className="relative">
            <div className="absolute top-3 left-3 bottom-3 w-px bg-[var(--line)]"/>
            {(() => {
              const stageMap = {
                "created":         {ic:"CheckCircle", color:"var(--ok)",     title:"Draft created"},
                "submitted":       {ic:"CheckCircle", color:"var(--ok)",     title:"Submitted for approval"},
                "approved":        {ic:"CheckCircle", color:"var(--ok)",     title:"Approved by Ops"},
                "published":       {ic:"CheckCircle", color:"var(--ok)",     title:"Published — registration opened"},
                "rejected":        {ic:"X",           color:"var(--bad)",    title:"Rejected"},
                "changes-requested":{ic:"AlertTri",   color:"var(--warn)",   title:"Changes requested"},
                "completed":       {ic:"CheckCircle", color:"var(--ok)",     title:"Completed · surveys + certificates sent"},
                "cancelled":       {ic:"X",           color:"var(--bad)",    title:"Cancelled"},
              };
              const past = (a.history || []).map(h => ({ ...stageMap[h.stage] || {ic:"Dot",color:"var(--mute-2)",title:h.stage}, by: `${h.by} · ${h.when}${h.reason?` · ${h.reason}`:""}` }));
              const future = [];
              if (a.status === "Pending Approval") future.push({ic:"Dot", color:"var(--accent)", title:"Awaiting Ops approval", by:"Reem Abdulla · SLA 24h", pulse:true});
              if (a.status === "Active") future.push({ic:"Dot", color:"var(--mute-2)", title:"Event day", by:`${a.date} · QR activates 30m prior`});
              if (a.status === "Active" || a.status === "Completed") future.push({ic:"Dot", color:"var(--mute-2)", title:"Post-event", by:"Feedback + certificates auto-send"});
              return [...past, ...future].map((s,i) => {
              const I = Icon[s.ic] || Icon.Dot;
              return (
                <div key={i} className="flex items-start gap-2.5 py-1.5 relative">
                  <div className={cx("w-6 h-6 rounded-full bg-white border flex items-center justify-center shrink-0 z-10", s.pulse && "pulse-dot")} style={{borderColor:s.color}}>
                    <I width={12} height={12} style={{color:s.color}}/>
                  </div>
                  <div>
                    <div className="text-[12.5px] font-medium">{s.title}</div>
                    <div className="text-[11px] text-[var(--mute)]">{s.by}</div>
                  </div>
                </div>
              );
            });
            })()}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        {/* People */}
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Organising team</div>
          {SAMA.PEOPLE.slice(7,11).map(p => (
            <div key={p.id} className="flex items-center gap-2.5 py-1.5">
              <Avatar name={p.name} size={26}/>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-[var(--mute)]">{p.role} · {p.dept || "Activities"}</div>
              </div>
              <button className="text-[11px] text-[var(--mute)] hover:text-[var(--ink)]"><Icon.Send width={12} height={12}/></button>
            </div>
          ))}
          <button className="text-[11.5px] text-[var(--accent)] mt-2 hover:underline flex items-center gap-1"><Icon.Plus width={12} height={12}/>Add member</button>
        </Card>

        {/* Attached assets */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Linked resources</div>
            <button className="text-[11.5px] text-[var(--accent)] hover:underline">Manage</button>
          </div>
          <div className="space-y-1.5">
            <ResourceRow icon="Bus"    title="Transport · 2 buses booked" hint="Pickup 4:15 PM, Gate 3"/>
            <ResourceRow icon="Pin"      title="Venue · Conference Hall B" hint="Approved by Facilities"/>
            <ResourceRow icon="Doc"      title="Event brief v2.pdf" hint="2.4 MB · edited 2 days ago"/>
            <ResourceRow icon="Medal"    title="Certificate template" hint="Attendance · bilingual"/>
            <ResourceRow icon="Star"     title="Feedback survey" hint="6 questions · auto-send"/>
          </div>
        </Card>

        {/* Comms status */}
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Communications</div>
          <div className="space-y-2">
            <CommRow label="Announcement" sent="Sent to 1,248 students" when="5 days ago" tone="green"/>
            <CommRow label="Reminder · T-3 days" sent="Scheduled" when="Oct 19, 9:00 AM" tone="scheduled"/>
            <CommRow label="Reminder · T-1 day" sent="Scheduled" when="Oct 21, 9:00 AM" tone="scheduled"/>
            <CommRow label="Thank you + feedback" sent="Auto · post-event" when="Oct 22, 8:00 PM" tone="scheduled"/>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Stat = ({ label, value, total, hint, accent }) => (
  <Card className="p-3">
    <div className="text-[11px] text-[var(--mute)] font-medium">{label}</div>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-[22px] font-semibold tracking-tight">{value}</span>
      {total && <span className="text-[12px] text-[var(--mute)]">/ {total}</span>}
    </div>
    {total && <div className="mt-1.5"><Progress value={typeof value==="number" ? value/total*100 : 50} color={accent}/></div>}
    {hint && <div className="text-[10.5px] text-[var(--mute)] mt-1">{hint}</div>}
  </Card>
);

const ResourceRow = ({ icon, title, hint }) => {
  const I = Icon[icon];
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-[7px] hover:bg-[#fafafa] cursor-pointer">
      <div className="w-8 h-8 rounded-[7px] bg-[#f1f2ef] flex items-center justify-center text-[var(--ink-2)]"><I width={14} height={14}/></div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium truncate">{title}</div>
        <div className="text-[11px] text-[var(--mute)] truncate">{hint}</div>
      </div>
      <Icon.ChevRight width={13} height={13} className="text-[var(--mute-2)]"/>
    </div>
  );
};

const CommRow = ({ label, sent, when, tone }) => {
  const dot = tone==="ok"?"var(--ok)":"var(--mute-2)";
  return (
    <div className="flex items-center gap-2 p-2 rounded-[7px] bg-[#fafafa]">
      <span className="w-2 h-2 rounded-full" style={{background:dot}}/>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate">{label}</div>
        <div className="text-[10.5px] text-[var(--mute)]">{sent} · {when}</div>
      </div>
      <button className="text-[11px] text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={12} height={12}/></button>
    </div>
  );
};

/* ============================================================ Check-in (QR) */
const CheckinTab = ({ a }) => {
  const [scanned, setScanned] = React.useState(47);
  const [live, setLive] = React.useState(true);
  const capacity = a.capacity || 120;
  return (
    <div className="p-6 grid grid-cols-[380px,1fr] gap-5">
      <Card className="p-5 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Rotating QR</div>
          <span className="chip bg-[var(--ok-wash)] text-[var(--ok)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] pulse-dot"/> live</span>
        </div>
        <div className="mt-3 aspect-square bg-white border hairline rounded-[12px] p-4 flex items-center justify-center">
          <QRVisual/>
        </div>
        <div className="text-center mt-3">
          <div className="text-[12px] text-[var(--mute)]">Code regenerates in</div>
          <div className="text-[26px] font-semibold tracking-tight font-mono">04:23</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Btn variant="outline" size="sm" icon={Icon.Download}>Export</Btn>
          <Btn variant="outline" size="sm" icon={Icon.Share}>Project</Btn>
        </div>
        <div className="mt-4 text-[11px] text-[var(--mute)] text-center">Students scan from their portal badge. Offline mode caches last 2 hours.</div>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Checked in" value={scanned} total={capacity} accent="var(--ok)"/>
          <Stat label="No-show forecast" value="18%" hint="below avg"/>
          <Stat label="Walk-ins accepted" value="3" hint="under waitlist"/>
          <Stat label="Queue wait" value="34s" hint="p50"/>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b hairline-2">
            <div>
              <div className="text-[13.5px] font-semibold">Live check-in feed</div>
              <div className="text-[11px] text-[var(--mute)]">Last update 2s ago</div>
            </div>
            <div className="flex items-center gap-2">
              <Input icon={Icon.Search} placeholder="Search by name or SID…" className="w-[220px]" size="sm"/>
              <Btn variant="outline" size="sm" icon={Icon.Filter}>Filter</Btn>
            </div>
          </div>
          <div className="divide-y hairline-2">
            {SAMA.PEOPLE.slice(0,8).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa]">
                <div className="w-7 text-[11px] text-[var(--mute)] font-mono">#{47-i}</div>
                <Avatar name={p.name} size={28}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-[var(--mute)]">{p.sid} · {p.dept}</div>
                </div>
                {i === 2 && <Chip tone="amber">Walk-in</Chip>}
                {i === 4 && <Chip tone="indigo">Waitlist promoted</Chip>}
                <span className="text-[11px] text-[var(--mute)] font-mono w-[56px] text-right">{`17:${(12 - i).toString().padStart(2,"0")}`}</span>
                <button className="w-6 h-6 rounded-[5px] hover:bg-[#eeefef] flex items-center justify-center text-[var(--mute)]"><Icon.DotsV width={12} height={12}/></button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const QRVisual = () => {
  const cells = 25;
  const rand = (x,y) => ((x*31+y*17)^(x+y*3)) % 100 < 52;
  return (
    <svg viewBox="0 0 25 25" className="w-full h-full">
      {Array.from({length: cells}).map((_,y) =>
        Array.from({length: cells}).map((_,x) => {
          const corner = (x<7 && y<7) || (x>=18 && y<7) || (x<7 && y>=18);
          const inner = (x>=2 && x<=4 && y>=2 && y<=4) || (x>=20 && x<=22 && y>=2 && y<=4) || (x>=2 && x<=4 && y>=20 && y<=22);
          const on = corner ? !((x===1||x===5||x===19||x===23) || (y===1||y===5||y===19||y===23)) : rand(x,y);
          if (!on) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0e1014" rx="0.1"/>;
        })
      )}
      <rect x="11" y="11" width="3" height="3" fill="#3a3dd9" rx="0.5"/>
    </svg>
  );
};

/* ============================================================ Registrations */
const RegistrationsTab = ({ a }) => {
  const [filter, setFilter] = React.useState("All");
  const [certOpen, setCertOpen] = React.useState(false);
  const toast = useToast();

  const PAID = ["Free","Free","Free","AED 30","Free","Free","Free","AED 30","Free","Free","Free","AED 30"];
  const DIET = ["—","Vegetarian","Halal","—","Vegan","—","—","Gluten-free","—","Halal","—","Vegan"];

  const [people, setPeople] = React.useState(() => SAMA.PEOPLE.slice(0,12).map((p,i) => ({
    ...p,
    status: i>=8 ? "Waitlist" : "Confirmed",
    waitlistPos: i>=8 ? i-7 : null,
    paid: PAID[i],
    dietary: DIET[i],
    registered: `Oct ${14+i%6}, ${9+i%7}:${(i*7%60).toString().padStart(2,"0")}`,
    checkedIn: i<5,
  })));

  const promote = id => {
    setPeople(prev => {
      const promoted = prev.map(p => p.id===id ? { ...p, status:"Confirmed", waitlistPos:null } : p);
      return promoted.map(p => p.status==="Waitlist" ? { ...p, waitlistPos: promoted.filter(x => x.status==="Waitlist" && x.waitlistPos < p.waitlistPos).length + 1 } : p);
    });
    toast.push({ text:"Promoted to confirmed · email sent", icon:Icon.CheckCircle });
  };

  const removePerson = id => {
    setPeople(prev => {
      const removed = prev.filter(p => p.id !== id);
      return removed.map((p,i) => p.status==="Waitlist" ? { ...p, waitlistPos: removed.filter(x => x.status==="Waitlist" && x.waitlistPos < p.waitlistPos).length + 1 } : p);
    });
    toast.push({ text:"Removed from list" });
  };

  const counts = {
    All: people.length,
    Confirmed: people.filter(p => p.status==="Confirmed").length,
    Waitlist: people.filter(p => p.status==="Waitlist").length,
    Cancelled: 4,
  };

  const filtered = filter==="All" ? people : people.filter(p => p.status===filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Input icon={Icon.Search} placeholder="Search registrations…" size="sm" className="w-[260px]"/>
          <Segmented size="sm" value={filter} onChange={setFilter} items={[
            {value:"All",label:`All ${counts.All}`},
            {value:"Confirmed",label:`Confirmed ${counts.Confirmed}`},
            {value:"Waitlist",label:`Waitlist ${counts.Waitlist}`},
            {value:"Cancelled",label:`Cancelled ${counts.Cancelled}`},
          ]}/>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" icon={Icon.Download}>Export CSV</Btn>
          <Btn variant="outline" size="sm" icon={Icon.Send}>Email selected</Btn>
          <Btn variant="default" size="sm" icon={Icon.Plus}>Add registrant</Btn>
          <Btn variant="default" size="sm" icon={Icon.Medal} onClick={() => setCertOpen(true)}>Issue certificates</Btn>
        </div>
      </div>

      {certOpen && <CertModal onClose={() => setCertOpen(false)} activityTitle={a.title}/>}

      {filter==="Waitlist" && counts.Waitlist > 0 && (
        <div className="mb-3 p-3 rounded-[10px] bg-[var(--warn-wash)] border border-[var(--warn)]/20 flex items-center gap-3">
          <Icon.AlertTri width={16} height={16} className="text-[var(--warn)]"/>
          <div className="text-[12px] text-[var(--ink-2)] flex-1">
            <b>{counts.Waitlist} on waitlist.</b> Promote individuals manually or wait for the system to auto-promote when a confirmed seat opens.
          </div>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
              <th className="w-8"><input type="checkbox"/></th>
              <th>Student</th><th>Department</th><th>Registered</th><th>Status</th>
              <th>Paid</th><th>Dietary</th><th>Check-in</th>
              <th className="w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b hairline-2 hover:bg-[#fafafa] group">
                <td className="px-3 py-2"><input type="checkbox"/></td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><Avatar name={p.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{p.name}</div><div className="text-[11px] text-[var(--mute)]">{p.sid}</div></div></div></td>
                <td className="px-3 py-2 text-[var(--mute)]">{p.dept}</td>
                <td className="px-3 py-2 text-[11.5px] font-mono text-[var(--mute)]">{p.registered}</td>
                <td className="px-3 py-2">
                  {p.status==="Waitlist" ? <Chip tone="amber">Waitlist · #{p.waitlistPos}</Chip> : <Chip tone="green">Confirmed</Chip>}
                </td>
                <td className="px-3 py-2 text-[var(--mute)]">{p.paid}</td>
                <td className="px-3 py-2 text-[11.5px] text-[var(--mute)]">{p.dietary}</td>
                <td className="px-3 py-2">{p.checkedIn ? <span className="chip bg-[var(--ok-wash)] text-[var(--ok)]"><Icon.Check width={10} height={10}/> in</span> : <span className="text-[11.5px] text-[var(--mute-2)]">pending</span>}</td>
                <td className="px-3 py-2">
                  {p.status==="Waitlist" ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => promote(p.id)} className="text-[11.5px] text-[var(--accent)] font-semibold hover:underline">Promote</button>
                      <span className="text-[var(--mute-2)]">·</span>
                      <button onClick={() => removePerson(p.id)} className="text-[11.5px] text-[var(--bad)] hover:underline">Remove</button>
                    </div>
                  ) : (
                    <button className="text-[var(--mute)] hover:text-[var(--ink)] opacity-0 group-hover:opacity-100"><Icon.DotsV width={13} height={13}/></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ============================================================ Sessions (Program) */
const SessionsTab = ({ a }) => {
  const [selectedIdx, setSelectedIdx] = React.useState(null);
  const [attendanceMap, setAttendanceMap] = React.useState({});
  const toast = useToast();

  const sessions = Array.from({length:12}).map((_,i) => ({
    id:i+1,
    date:`2025-${(9+Math.floor(i/4)).toString().padStart(2,"0")}-${(((i%4)*7)+6).toString().padStart(2,"0")}`,
    label:`Week ${i+1}`,
    status: i<5?"Completed":i===5?"Today":"Upcoming",
    attended: i<5 ? [14,16,15,17,13][i] : null,
    total:18,
  }));

  const enrolled = SAMA.PEOPLE.slice(0, 18);
  const sel = selectedIdx !== null ? sessions[selectedIdx] : null;
  const markedCount = Object.values(attendanceMap).filter(Boolean).length;

  const toggleAttend = pid => setAttendanceMap(prev => ({ ...prev, [pid]: !prev[pid] }));
  const markAll = () => { const m = {}; enrolled.forEach(p => { m[p.id] = true; }); setAttendanceMap(m); };

  return (
    <div className="p-6 grid grid-cols-[1fr,320px] gap-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">12 sessions · Tue & Thu · 5:30 — 7:00 PM</div>
          <Btn variant="outline" size="sm" icon={Icon.Plus}>Add session</Btn>
        </div>
        {sessions.map((s,i) => (
          <Card key={s.id} onClick={() => setSelectedIdx(i===selectedIdx ? null : i)} className={cx("p-3 flex items-center gap-4 cursor-pointer transition-colors", s.status==="Today" && "ring-2 ring-[var(--accent)]/30", selectedIdx===i ? "border-[var(--accent)] bg-[var(--accent-wash)]/30" : "hover:border-[var(--mute-2)]")}>
            <div className="w-12 text-center shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-[var(--mute)]">{s.date.split("-")[1]==="09"?"Sep":s.date.split("-")[1]==="10"?"Oct":"Nov"}</div>
              <div className="text-[20px] font-semibold tracking-tight">{s.date.split("-")[2]}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-semibold">{s.label}</span>
                {s.status==="Completed" && <Chip tone="green">Completed</Chip>}
                {s.status==="Today" && <Chip tone="indigo">Today</Chip>}
                {s.status==="Upcoming" && <Chip tone="slate">Upcoming</Chip>}
              </div>
              <div className="text-[11.5px] text-[var(--mute)] mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><Icon.Pin width={11} height={11}/>Sports Field A</span>
                <span className="flex items-center gap-1"><Icon.User width={11} height={11}/>Coach Martinez</span>
                {s.attended != null && <span className="flex items-center gap-1"><Icon.Users width={11} height={11}/>{s.attended}/{s.total}</span>}
              </div>
            </div>
            {s.attended != null && (
              <div className="w-[100px] shrink-0"><Progress value={s.attended/s.total*100} color="var(--ok)"/><div className="text-[10.5px] font-mono text-[var(--mute)] mt-1 text-right">{Math.round(s.attended/s.total*100)}%</div></div>
            )}
            {(s.status==="Today"||s.status==="Upcoming") && selectedIdx!==i && (
              <span className="text-[11.5px] text-[var(--accent)] font-medium shrink-0">Take attendance →</span>
            )}
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {sel ? (
          <Card className="p-0 overflow-hidden flex flex-col" style={{maxHeight:"600px"}}>
            <div className="px-4 py-3 border-b hairline-2 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[13px] font-semibold">{sel.label} · Attendance</div>
                <div className="text-[11px] text-[var(--mute)]">{markedCount}/{enrolled.length} marked present</div>
              </div>
              <button onClick={() => setSelectedIdx(null)} className="w-7 h-7 rounded-[7px] hover:bg-[#eeefef] flex items-center justify-center"><Icon.X width={13} height={13}/></button>
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll divide-y hairline-2">
              {enrolled.map(p => {
                const present = !!attendanceMap[p.id];
                return (
                  <div key={p.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#fafafa]">
                    <Avatar name={p.name} size={24}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium truncate">{p.name}</div>
                      <div className="text-[10.5px] text-[var(--mute)]">{p.dept}</div>
                    </div>
                    <button onClick={() => toggleAttend(p.id)} className={cx("h-7 px-2.5 rounded-[6px] text-[11.5px] font-medium flex items-center gap-1 transition-colors", present ? "bg-[var(--ok-wash)] text-[var(--ok)]" : "border hairline text-[var(--mute-2)] hover:text-[var(--ink)]")}>
                      {present ? <><Icon.Check width={11} height={11}/>Present</> : "Absent"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="px-3 py-3 border-t hairline-2 flex gap-2 shrink-0">
              <Btn variant="outline" size="sm" className="flex-1" onClick={markAll}>Mark all present</Btn>
              <Btn variant="default" size="sm" className="flex-1" onClick={() => { toast.push({ text:`Attendance saved · ${markedCount}/${enrolled.length} present`, icon:Icon.Check }); setSelectedIdx(null); }}>Save</Btn>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Attendance trend</div>
              <AttendanceSpark/>
              <div className="mt-2 flex items-baseline justify-between">
                <div><div className="text-[22px] font-semibold tracking-tight">87%</div><div className="text-[11px] text-[var(--mute)]">average attendance</div></div>
                <Chip tone="green">↑ 6% vs last term</Chip>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Waivers & health</div>
              <RowStat label="Medical cleared" value="18/18" ok/>
              <RowStat label="Waivers signed" value="18/18" ok/>
              <RowStat label="Emergency contacts" value="17/18" warn/>
            </Card>
            <div className="text-[11.5px] text-[var(--mute)] text-center pt-1">Click a session to take attendance</div>
          </>
        )}
      </div>
    </div>
  );
};

const AttendanceSpark = () => {
  const pts = [14,16,15,17,13,18,16,18,17,17];
  const path = pts.map((v,i) => `${i===0?"M":"L"} ${i*(200/9)} ${40 - (v-12)*5}`).join(" ");
  return (
    <svg viewBox="0 0 200 48" className="w-full h-[48px]">
      <path d={`${path} L 200 48 L 0 48 Z`} fill="var(--accent-wash)"/>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
      {pts.map((v,i) => <circle key={i} cx={i*(200/9)} cy={40-(v-12)*5} r="2" fill="var(--accent)"/>)}
    </svg>
  );
};

const RowStat = ({ label, value, ok, warn }) => (
  <div className="flex items-center justify-between py-1.5 border-b hairline-2 last:border-0">
    <span className="text-[12.5px] text-[var(--ink-2)]">{label}</span>
    <div className="flex items-center gap-1.5">
      {ok && <Icon.CheckCircle width={13} height={13} className="text-[var(--ok)]"/>}
      {warn && <Icon.AlertTri width={13} height={13} className="text-[var(--warn)]"/>}
      <span className="text-[12px] font-mono">{value}</span>
    </div>
  </div>
);

/* ============================================================ Simple placeholders for other tabs */
const ApplicantsTab = ({ a }) => (
  <div className="p-6"><Card className="p-5"><div className="text-[13.5px] font-semibold mb-2">Volunteer applicants</div><div className="text-[12.5px] text-[var(--mute)]">38 applicants · 28 confirmed · 10 shortlisted</div>
  <div className="mt-4 grid grid-cols-3 gap-3">{SAMA.PEOPLE.slice(0,9).map(p=>(<div key={p.id} className="flex items-center gap-2 p-2.5 rounded-[8px] border hairline"><Avatar name={p.name} size={26}/><div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium truncate">{p.name}</div><div className="text-[11px] text-[var(--mute)]">{p.dept}</div></div><Chip tone={Math.random()>.4?"ok":"neutral"}>Confirmed</Chip></div>))}</div></Card></div>
);
const HoursTab = ({ a }) => {
  const [certOpen, setCertOpen] = React.useState(false);
  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <Stat label="Total hours logged" value="214"/>
      <Stat label="Certificates issued" value="28" hint="auto-issue at 4hr+"/>
      <Stat label="Avg per volunteer" value="5.4 hrs"/>
      <div className="col-span-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold">Volunteer hours log</div>
            <Btn variant="default" size="sm" icon={Icon.Medal} onClick={() => setCertOpen(true)}>Issue certificates</Btn>
          </div>
          <div className="divide-y hairline-2">
            {SAMA.PEOPLE.slice(0,6).map((p,i) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <Avatar name={p.name} size={24}/>
                <div className="flex-1"><div className="text-[12.5px] font-medium">{p.name}</div><div className="text-[11px] text-[var(--mute)]">{p.sid}</div></div>
                <div className="text-[11px] font-mono">{["4.0","6.5","3.5","8.0","5.5","4.5"][i]} hrs</div>
                <Chip tone="green">Cert issued</Chip>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {certOpen && <CertModal onClose={() => setCertOpen(false)} activityTitle={a.title}/>}
    </div>
  );
};
const LogisticsTab = ({ a }) => (
  <div className="p-6 grid grid-cols-2 gap-4">
    <Card className="p-4"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Transport</div><ResourceRow icon="Bus" title="Bus 1 · 45 seats" hint="Gate 3, 4:15 PM · Driver A. Siddiqui"/><ResourceRow icon="Bus" title="Bus 2 · 45 seats" hint="Gate 3, 4:25 PM · Driver H. Patel"/><div className="text-[11.5px] text-[var(--mute)] mt-3">Return 9:15 PM · same gates</div></Card>
    <Card className="p-4"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Venue</div><div className="flex items-center gap-3"><div className="w-16 h-16 rounded-[8px] bg-[var(--accent-wash)] flex items-center justify-center"><Icon.Pin width={20} height={20} className="text-[var(--accent)]"/></div><div><div className="text-[13px] font-semibold">{a.venue || "Conference Hall B"}</div><div className="text-[11.5px] text-[var(--mute)]">Capacity 300 · AV ready · Step-free</div></div></div></Card>
    <Card className="p-4 col-span-2"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Budget</div><div className="grid grid-cols-4 gap-4">{[["Venue","800"],["Catering","2,100"],["Speaker","1,200"],["Swag","100"]].map(([l,v])=>(<div key={l}><div className="text-[11px] text-[var(--mute)]">{l}</div><div className="text-[16px] font-semibold">AED {v}</div></div>))}</div><Progress value={70} className="mt-3"/><div className="text-[11px] text-[var(--mute)] mt-1">AED 4,200 of 6,000 allocated</div></Card>
  </div>
);
const CommsTab = ({ a }) => (<div className="p-6"><Card className="p-5"><div className="text-[13.5px] font-semibold mb-3">Communication log</div><div className="space-y-2.5">{[{t:"Announcement · Registration open",d:"5 days ago",r:"1,248 recipients"},{t:"Reminder · T-3 days",d:"Scheduled Oct 19",r:"Will send to 47 confirmed"},{t:"Reminder · T-1 day",d:"Scheduled Oct 21",r:"Will send to 47 confirmed"},{t:"Thank you + feedback",d:"Auto post-event",r:"Will send after check-in close"}].map((x,i)=>(<div key={i} className="flex items-center gap-3 p-3 rounded-[8px] border hairline-2"><div className="w-8 h-8 rounded-[7px] bg-[var(--accent-wash)] flex items-center justify-center"><Icon.Send width={14} height={14} className="text-[var(--accent)]"/></div><div className="flex-1"><div className="text-[12.5px] font-medium">{x.t}</div><div className="text-[11px] text-[var(--mute)]">{x.d} · {x.r}</div></div><Btn variant="ghost" size="sm">View</Btn></div>))}</div></Card></div>);
const DocsTab = ({ a }) => (<div className="p-6 grid grid-cols-3 gap-3">{["Event brief v2.pdf","Risk assessment.pdf","Speaker contract.pdf","Venue permit.pdf","Catering invoice.pdf","Final agenda.docx"].map((d,i)=>(<Card key={i} className="p-4"><div className="w-10 h-10 rounded-[7px] bg-[var(--accent-wash)] flex items-center justify-center mb-2.5"><Icon.Doc width={16} height={16} className="text-[var(--accent)]"/></div><div className="text-[12.5px] font-medium">{d}</div><div className="text-[11px] text-[var(--mute)] mt-0.5">2.4 MB · edited 2d ago</div></Card>))}</div>);
const FeedbackTab = ({ a }) => {
  const [view, setView] = React.useState("configure");
  const [autoSend, setAutoSend] = React.useState(true);
  const [delay, setDelay] = React.useState("2");
  const [customQs, setCustomQs] = React.useState([]);
  const [newQ, setNewQ] = React.useState("");
  const toast = useToast();

  const DEFAULT_QUESTIONS = [
    { text:"Overall rating (1–5 stars)", type:"Rating" },
    { text:"What did you enjoy most about this activity?", type:"Open text" },
    { text:"What could be improved?", type:"Open text" },
    { text:"Would you attend again?", type:"Yes / No / Maybe" },
    { text:"How did you hear about this activity?", type:"Multiple choice" },
  ];

  const addQuestion = () => {
    if (!newQ.trim()) return;
    setCustomQs(prev => [...prev, { text: newQ.trim(), type:"Open text" }]);
    setNewQ("");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[13.5px] font-semibold">Post-activity feedback survey</div>
        <Segmented size="sm" value={view} onChange={setView} items={[{value:"configure",label:"Configure"},{value:"results",label:"Results · 34"}]}/>
      </div>

      {view === "configure" && (
        <div className="grid grid-cols-[1fr,300px] gap-5">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Default questions <span className="normal-case font-normal text-[var(--mute-2)]">· always included</span></div>
              <div className="space-y-2">
                {DEFAULT_QUESTIONS.map((q,i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-[8px] bg-[#fafafa]">
                    <div className="w-5 h-5 rounded-full bg-[var(--ink)] text-white text-[10px] flex items-center justify-center font-semibold shrink-0">{i+1}</div>
                    <div className="flex-1"><div className="text-[12.5px] font-medium">{q.text}</div><div className="text-[11px] text-[var(--mute)]">{q.type}</div></div>
                    <Icon.Shield width={12} height={12} className="text-[var(--mute-2)]"/>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Custom questions</div>
              {customQs.length > 0 && (
                <div className="space-y-2 mb-3">
                  {customQs.map((q,i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-[8px] border hairline">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent-wash)] text-[var(--accent-ink)] text-[10px] flex items-center justify-center font-semibold shrink-0">{DEFAULT_QUESTIONS.length+i+1}</div>
                      <div className="flex-1 text-[12.5px]">{q.text}</div>
                      <button onClick={() => setCustomQs(prev => prev.filter((_,j) => j!==i))} className="text-[var(--mute)] hover:text-[var(--bad)]"><Icon.X width={12} height={12}/></button>
                    </div>
                  ))}
                </div>
              )}
              {customQs.length === 0 && <div className="text-[12px] text-[var(--mute)] mb-3">No custom questions yet.</div>}
              <div className="flex gap-2">
                <input value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key==="Enter" && addQuestion()}
                  placeholder="Type a question and press Enter…"
                  className="flex-1 h-8 px-3 rounded-[7px] border hairline text-[12.5px] bg-white focus:outline-none focus:border-[var(--accent)]"/>
                <Btn variant="outline" size="sm" icon={Icon.Plus} onClick={addQuestion}>Add</Btn>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Send settings</div>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex-1">
                    <div className="text-[12.5px] font-medium">Auto-send on completion</div>
                    <div className="text-[11px] text-[var(--mute)] mt-0.5">Sends when activity is marked complete</div>
                  </div>
                  <div className={cx("w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-0.5", autoSend?"bg-[var(--ok)]":"bg-[var(--line)]")} onClick={() => setAutoSend(v=>!v)}>
                    <div className={cx("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", autoSend?"translate-x-4":"translate-x-0.5")}/>
                  </div>
                </label>
                {autoSend && (
                  <div>
                    <div className="text-[11.5px] text-[var(--mute)] mb-1.5">Delay after completion</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {[["0","Now"],["1","1h"],["2","2h"],["4","4h"],["24","24h"]].map(([v,label]) => (
                        <button key={v} onClick={() => setDelay(v)} className={cx("px-3 h-7 rounded-[6px] text-[11.5px] font-medium transition-colors", delay===v?"bg-[var(--ink)] text-white":"border hairline text-[var(--mute)] hover:text-[var(--ink)]")}>{label}</button>
                      ))}
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[var(--accent)]"/>
                  <span className="text-[12px]">Anonymous responses</span>
                </label>
              </div>
            </Card>

            <div className="rounded-[12px] bg-[var(--ink)] text-white p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold opacity-70 mb-1">Send now</div>
              <div className="text-[12px] opacity-75 mb-3 leading-relaxed">Send immediately to all 47 confirmed participants.</div>
              <Btn variant="outline" className="w-full border-white/30 text-white hover:bg-white/10" size="sm" icon={Icon.Send}
                onClick={() => { toast.push({ text:"Survey sent to 47 participants", icon:Icon.Send }); }}>
                Send survey now
              </Btn>
            </div>
          </div>
        </div>
      )}

      {view === "results" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[["Overall rating","4.6",4],["Content quality","4.8",5],["Venue & logistics","4.2",4],["Would attend again","92%",0]].map(([l,v,stars]) => (
              <Card key={l} className="p-4 text-center">
                <div className="text-[11px] text-[var(--mute)] mb-1">{l}</div>
                <div className="text-[28px] font-semibold tracking-tight">{v}</div>
                {stars > 0 && <div className="flex justify-center gap-0.5 mt-1">{Array.from({length:5}).map((_,i)=><Icon.Star key={i} width={12} height={12} className={i<stars?"text-[var(--amber)]":"text-[var(--line)]"}/>)}</div>}
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-[1fr,260px] gap-4">
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Individual responses</div>
              <div className="space-y-3">
                {[["Fatima Al-Nuaimi",5,"Loved the interactive format. The speaker was engaging and the Q&A was the best part."],
                  ["Hassan Qureshi",4,"Good content but the venue was a bit crowded. More time for Q&A please."],
                  ["Amina Khalil",5,"Excellent session. Learned a lot about practical applications. Please do a part 2!"],
                  ["Tariq Mansour",3,"Content was interesting but ran 30 min over. Schedule management needs work."]
                ].map(([name,rating,comment],i) => (
                  <div key={i} className="p-3 rounded-[8px] bg-[#fafafa] border hairline-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar name={name} size={20}/>
                      <span className="text-[12.5px] font-medium flex-1">{name}</span>
                      <span className="text-[var(--amber)] text-[12px]">{"★".repeat(rating)}{"☆".repeat(5-rating)}</span>
                    </div>
                    <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">{comment}</div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Response rate</div>
                <div className="text-[28px] font-semibold">72%</div>
                <div className="text-[11.5px] text-[var(--mute)]">34 of 47 participants</div>
                <Progress value={72} color="var(--ok)" className="mt-2"/>
              </Card>
              <Card className="p-4">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">How they heard</div>
                {[["Student portal","42%"],["Email","28%"],["WhatsApp","18%"],["Friend","12%"]].map(([l,v])=>(
                  <div key={l} className="flex items-center gap-2 py-1.5">
                    <div className="text-[12px] flex-1">{l}</div>
                    <div className="text-[11px] font-mono text-[var(--mute)]">{v}</div>
                    <div className="w-14 h-1.5 bg-[#eef0f3] rounded-full overflow-hidden"><div className="h-full bg-[var(--accent)] rounded-full" style={{width:v}}/></div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const RosterTab = ({ a }) => {
  const POSITIONS = ["Striker","Midfielder","Defender","Goalkeeper"];
  const STATUSES = ["Starter","Reserve","Trialist","Injured","Suspended"];
  const STATUS_TONE = { Starter:"green", Reserve:"slate", Trialist:"indigo", Injured:"amber", Suspended:"red" };
  const KIT_SIZES = ["S","M","M","L","L","M","XL","M","L","S","M","L","XL","M","L","S"];

  const [players, setPlayers] = React.useState(() => SAMA.PEOPLE.slice(0,16).map((p,i) => ({
    ...p, jersey: i+1, position: POSITIONS[i%POSITIONS.length],
    status: i<11 ? "Starter" : i<14 ? "Reserve" : i===14 ? "Injured" : "Trialist",
    kitSize: KIT_SIZES[i], kitIssued: i<13,
  })));
  const toast = useToast();

  const cycleStatus = id => setPlayers(prev => prev.map(p => p.id !== id ? p : { ...p, status: STATUSES[(STATUSES.indexOf(p.status)+1) % STATUSES.length] }));
  const toggleKit  = id => setPlayers(prev => prev.map(p => p.id !== id ? p : { ...p, kitIssued: !p.kitIssued }));

  const stats = {
    total: players.length,
    starters: players.filter(p => p.status==="Starter").length,
    reserves: players.filter(p => p.status==="Reserve").length,
    sidelined: players.filter(p => ["Injured","Suspended"].includes(p.status)).length,
    kitIssued: players.filter(p => p.kitIssued).length,
  };

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <Stat label="Squad size" value={stats.total}/>
        <Stat label="Starters" value={stats.starters} accent="var(--ok)"/>
        <Stat label="Reserves" value={stats.reserves}/>
        <Stat label="Sidelined" value={stats.sidelined} hint="injured/suspended"/>
        <Stat label="Kit issued" value={`${stats.kitIssued}/${stats.total}`}/>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b hairline-2">
          <div>
            <div className="text-[13.5px] font-semibold">Team roster</div>
            <div className="text-[11px] text-[var(--mute)]">Click status chip to cycle · click kit badge to toggle</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" icon={Icon.Download} onClick={() => toast.push({ text:"Team sheet PDF generated" })}>Team sheet PDF</Btn>
            <Btn variant="outline" size="sm" icon={Icon.Plus}>Add player</Btn>
          </div>
        </div>
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
              <th className="w-12">#</th><th>Player</th><th>Position</th><th>Status</th><th>Kit size</th><th>Kit issued</th><th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                <td className="px-4 py-2 font-mono font-semibold text-[var(--ink)]">#{p.jersey}</td>
                <td className="px-4 py-2"><div className="flex items-center gap-2"><Avatar name={p.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{p.name}</div><div className="text-[11px] text-[var(--mute)]">{p.sid}</div></div></div></td>
                <td className="px-4 py-2 text-[var(--mute)]">{p.position}</td>
                <td className="px-4 py-2"><button onClick={() => cycleStatus(p.id)}><Chip tone={STATUS_TONE[p.status]}>{p.status}</Chip></button></td>
                <td className="px-4 py-2 text-[var(--mute)] font-mono">{p.kitSize}</td>
                <td className="px-4 py-2"><button onClick={() => toggleKit(p.id)}>{p.kitIssued ? <Chip tone="green">Issued</Chip> : <Chip tone="slate">Pending</Chip>}</button></td>
                <td className="px-4 py-2"><button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={13} height={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
const AttendanceTab = ({ a }) => (<div className="p-6"><Card className="p-5"><div className="text-[13.5px] font-semibold mb-3">Session-by-session attendance</div><div className="grid grid-cols-[200px,repeat(12,1fr)] gap-1 text-[10.5px]"><div className="font-medium">Student</div>{Array.from({length:12}).map((_,i)=><div key={i} className="text-center font-mono text-[var(--mute)]">W{i+1}</div>)}{SAMA.PEOPLE.slice(0,10).map(p=>(<React.Fragment key={p.id}><div className="flex items-center gap-1.5 truncate"><Avatar name={p.name} size={16}/><span className="truncate">{p.name.split(" ")[0]}</span></div>{Array.from({length:12}).map((_,w)=>{const r=Math.random(); return <div key={w} className={cx("h-6 rounded-[3px]", w>5?"bg-[#f1f2ef]": r>.85?"bg-[var(--bad-wash)]": r>.7?"bg-[var(--warn-wash)]":"bg-[var(--ok-wash)]")}/>;})}</React.Fragment>))}</div></Card></div>);
const SubtasksTab = ({ a }) => {
  const STATUS_CYCLE = ["To Do", "In Progress", "Blocked", "Done"];
  const STATUS_TONE  = { "To Do":"slate", "In Progress":"indigo", "Blocked":"red", "Done":"green" };
  const PRIORITY_TONE = { Low:"slate", Medium:"amber", High:"red", Urgent:"red" };

  const [tasks, setTasks] = React.useState([
    { id:1, title:"Book catering",          status:"Done",        priority:"High",   assignee:"Jane Doe",     due:"Oct 18" },
    { id:2, title:"Send calendar invite",   status:"Done",        priority:"Medium", assignee:"Hassan Q",     due:"Oct 19" },
    { id:3, title:"Prepare handouts",       status:"In Progress", priority:"High",   assignee:"Reem Abdulla", due:"Oct 20" },
    { id:4, title:"Confirm AV setup",       status:"To Do",       priority:"Urgent", assignee:"Fatima L",     due:"Oct 21" },
    { id:5, title:"Print name badges",      status:"Blocked",     priority:"Medium", assignee:"Jane Doe",     due:"Oct 21" },
    { id:6, title:"Prepare welcome slides", status:"To Do",       priority:"Low",    assignee:"Hassan Q",     due:"Oct 22" },
  ]);
  const toast = useToast();

  const cycleStatus = id => setTasks(prev => prev.map(t =>
    t.id !== id ? t : { ...t, status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status)+1) % STATUS_CYCLE.length] }
  ));

  const done    = tasks.filter(t => t.status === "Done").length;
  const blocked = tasks.filter(t => t.status === "Blocked").length;
  const inprog  = tasks.filter(t => t.status === "In Progress").length;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total subtasks" value={tasks.length}/>
        <Stat label="Done" value={done} total={tasks.length} accent="var(--ok)"/>
        <Stat label="In progress" value={inprog}/>
        <Stat label="Blocked" value={blocked} hint={blocked > 0 ? "needs attention" : "all clear"}/>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b hairline-2">
          <div className="text-[13.5px] font-semibold">Subtasks</div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-[var(--mute)]">Click status to cycle · click checkbox to mark done</span>
            <Btn variant="outline" size="sm" icon={Icon.Plus} onClick={() => toast.push({ text:"New subtask added" })}>Add subtask</Btn>
          </div>
        </div>
        <div className="divide-y hairline-2">
          {tasks.map(t => (
            <div key={t.id} className={cx("flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] group", t.status==="Done" && "opacity-55")}>
              <div
                className="w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                style={{ borderColor: t.status==="Done" ? "var(--ok)" : "var(--line)", background: t.status==="Done" ? "var(--ok)" : "transparent" }}
                onClick={() => cycleStatus(t.id)}>
                {t.status==="Done" && <Icon.Check width={9} height={9} className="text-white"/>}
              </div>
              <span className={cx("text-[13px] flex-1", t.status==="Done" && "line-through text-[var(--mute)]")}>{t.title}</span>
              <button onClick={() => cycleStatus(t.id)} title="Click to cycle status">
                <Chip tone={STATUS_TONE[t.status]}>{t.status}</Chip>
              </button>
              <Chip tone={PRIORITY_TONE[t.priority]}>{t.priority}</Chip>
              <div className="flex items-center gap-1.5">
                <Avatar name={t.assignee} size={20}/>
                <span className="text-[11.5px] text-[var(--mute)]">{t.assignee.split(" ")[0]}</span>
              </div>
              <span className={cx("text-[11.5px] font-mono w-[54px] text-right shrink-0", t.status==="Blocked" ? "text-[var(--bad)]" : "text-[var(--mute)]")}>
                {t.status==="Blocked" ? "Blocked" : t.due}
              </span>
              <button className="text-[var(--mute)] hover:text-[var(--ink)] opacity-0 group-hover:opacity-100"><Icon.DotsV width={13} height={13}/></button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
const ActivityLogTab = ({ a }) => (<div className="p-6"><Card className="p-4"><div className="text-[13.5px] font-semibold mb-3">Audit trail</div><div className="space-y-2">{[["created","Jane Doe","8 days ago"],["edited venue","Jane Doe","7 days ago"],["submitted for approval","Jane Doe","6 days ago"],["approved","Reem Abdulla","5 days ago"],["registration opened","System","5 days ago"],["added comms schedule","Jane Doe","4 days ago"],["47 students registered","System","ongoing"]].map(([t,by,when],i)=>(<div key={i} className="flex items-center gap-3 py-1.5 text-[12px]"><div className="w-1.5 h-1.5 rounded-full bg-[var(--mute-2)]"/><span className="text-[var(--ink)]">{t}</span><span className="text-[var(--mute)]">by {by}</span><span className="flex-1"/><span className="text-[var(--mute-2)] font-mono text-[11px]">{when}</span></div>))}</div></Card></div>);

/* ============================================================ Certificate Modal */
const CertModal = ({ onClose, activityTitle }) => {
  const [step, setStep] = React.useState(1);
  const [certType, setCertType] = React.useState("Attendance");
  const [recipients, setRecipients] = React.useState("all_confirmed");
  const toast = useToast();

  const recipientCount = { all_confirmed: 38, attended: 32, selection: 5 }[recipients];

  React.useEffect(() => {
    if (step !== 3) return;
    const t = setTimeout(() => setStep(4), 2200);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-[16px] shadow-float w-[580px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b hairline flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold">Issue certificates</div>
            <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{activityTitle}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-[7px] hover:bg-[#eeefef] flex items-center justify-center"><Icon.X width={14} height={14}/></button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Certificate type</div>
              <div className="grid grid-cols-2 gap-2">
                {[["Attendance","For attending the activity","ClipboardCheck"],["Completion","For completing a program","Medal"],["Volunteering Hours","For volunteer work","Heart"],["Achievement","For exceptional performance","Rocket"]].map(([t,desc,ic]) => {
                  const I = Icon[ic];
                  return (
                    <button key={t} onClick={() => setCertType(t)} className={cx("p-3 rounded-[10px] border text-left transition-colors", certType === t ? "border-[var(--accent)] bg-[var(--accent-wash)]" : "border-[var(--line)] hover:border-[var(--mute-2)]")}>
                      <div className="flex items-center gap-2 mb-1"><I width={13} height={13} className={certType===t?"text-[var(--accent)]":"text-[var(--mute)]"}/><span className="text-[12.5px] font-semibold">{t}</span></div>
                      <div className="text-[11px] text-[var(--mute)]">{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Issue to</div>
              <div className="space-y-1.5">
                {[["all_confirmed","All confirmed participants","38 people"],["attended","Only those who attended","32 people"],["selection","Custom selection","Choose manually"]].map(([v,label,hint]) => (
                  <label key={v} className={cx("flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer transition-colors", recipients===v ? "border-[var(--accent)] bg-[var(--accent-wash)]" : "border-[var(--line)] hover:border-[var(--mute-2)]")}>
                    <input type="radio" name="recipients" value={v} checked={recipients===v} onChange={() => setRecipients(v)} className="accent-[var(--accent)]"/>
                    <div className="flex-1"><div className="text-[12.5px] font-medium">{label}</div><div className="text-[11px] text-[var(--mute)]">{hint}</div></div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="outline" onClick={onClose}>Cancel</Btn>
              <Btn variant="default" trailingIcon={Icon.ChevRight} onClick={() => setStep(2)}>Preview certificate</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Certificate preview</div>
            <div className="border hairline rounded-[12px] bg-[#fdfcf9] overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] via-[var(--teal)] to-[var(--accent)]"/>
              <div className="p-8 text-center space-y-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-[var(--ink)] flex items-center justify-center mx-auto"><span className="text-white text-[11px] font-bold tracking-wide">SAMA</span></div>
                <div className="text-[9.5px] uppercase tracking-widest text-[var(--mute)] font-semibold">University of Applied Sciences · Student Activities</div>
                <div className="text-[9.5px] uppercase tracking-widest text-[var(--mute)]">Certificate of {certType}</div>
                <div className="text-[10.5px] text-[var(--mute)] pt-1">This certifies that</div>
                <div className="text-[24px] font-semibold tracking-tight" style={{fontFamily:"Georgia,serif"}}>Fatima Al-Nuaimi</div>
                <div className="text-[11px] text-[var(--mute)] max-w-[300px] mx-auto leading-relaxed">
                  has {certType==="Volunteering Hours"?"contributed 4 volunteer hours to":certType==="Achievement"?"demonstrated exceptional performance at":certType==="Completion"?"successfully completed":"attended"}
                </div>
                <div className="text-[14px] font-semibold">{activityTitle}</div>
                <div className="text-[10.5px] text-[var(--mute)]">October 22, 2025</div>
                <div className="pt-4 border-t hairline-2 flex items-center justify-between text-[9.5px] text-[var(--mute-2)] font-mono">
                  <span>SAMA-25-3814</span><span>verify.sama.ae/cert</span>
                </div>
              </div>
            </div>
            <div className="text-[11.5px] text-[var(--mute)] text-center">{recipientCount} certificates will be generated and emailed. Each has a unique verification code.</div>
            <div className="flex justify-between gap-2">
              <Btn variant="ghost" icon={Icon.ChevLeft} onClick={() => setStep(1)}>Back</Btn>
              <div className="flex gap-2">
                <Btn variant="outline" onClick={onClose}>Cancel</Btn>
                <Btn variant="default" icon={Icon.Medal} onClick={() => setStep(3)}>Generate & send {recipientCount} certificates</Btn>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-14 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-wash)] flex items-center justify-center">
              <Icon.Medal width={30} height={30} className="text-[var(--accent)] animate-pulse"/>
            </div>
            <div className="text-[15px] font-semibold">Generating certificates…</div>
            <div className="text-[12px] text-[var(--mute)]">Creating {recipientCount} PDFs and queuing emails</div>
            <div className="w-52 h-1.5 bg-[#eef0f3] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[var(--accent)] rounded-full" style={{width:"100%", transition:"width 2.2s ease", animation:"none"}}/>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-14 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[var(--ok-wash)] flex items-center justify-center">
              <Icon.CheckCircle width={30} height={30} className="text-[var(--ok)]"/>
            </div>
            <div className="text-[15px] font-semibold">{recipientCount} certificates sent</div>
            <div className="text-[12px] text-[var(--mute)] text-center leading-relaxed">Each participant received an email with their PDF attached.<br/>Certificates are also available in the student portal.</div>
            <div className="flex gap-2 mt-3">
              <Btn variant="outline" icon={Icon.Download}>Download all as ZIP</Btn>
              <Btn variant="default" onClick={() => { toast.push({ text: `${recipientCount} certificates issued`, icon: Icon.Medal }); onClose(); }}>Done</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================ Pending Registrations Tab */
const PendingRegistrationsTab = ({ a }) => {
  const toast = useToast();

  const SEED = a.id === "a3" ? SAMA.PENDING_A3
    : a.id === "a26" ? SAMA.PENDING_A26
    : [
        { pid:"p4",  applied:"Oct 17, 2025", reason:"Interested in developing skills directly relevant to my major." },
        { pid:"p9",  applied:"Oct 18, 2025", reason:"Want to contribute and gain practical hands-on experience." },
        { pid:"p16", applied:"Oct 19, 2025", reason:"This activity aligns perfectly with my career goals." },
      ];

  const [pending, setPending] = React.useState(SEED);

  const approve = pid => {
    const person = SAMA.PEOPLE.find(p => p.id === pid);
    setPending(prev => prev.filter(p => p.pid !== pid));
    toast.push({ text:`${person?.name || "Applicant"} approved · confirmation email sent`, icon:Icon.CheckCircle });
  };

  const decline = pid => {
    const person = SAMA.PEOPLE.find(p => p.id === pid);
    setPending(prev => prev.filter(p => p.pid !== pid));
    toast.push({ text:`${person?.name || "Applicant"} declined · notified by email` });
  };

  const approveAll = () => {
    const count = pending.length;
    setPending([]);
    toast.push({ text:`${count} applicants approved · emails sent`, icon:Icon.CheckCircle });
  };

  if (pending.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--ok-wash)] flex items-center justify-center mb-3">
          <Icon.CheckCircle width={22} height={22} className="text-[var(--ok)]"/>
        </div>
        <div className="text-[14px] font-semibold">All requests reviewed</div>
        <div className="text-[12.5px] text-[var(--mute)] mt-1">No pending registration requests for this activity.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13.5px] font-semibold">Pending registration requests</div>
          <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{pending.length} awaiting review · approve or decline each applicant</div>
        </div>
        <Btn variant="outline" size="sm" icon={Icon.Check} onClick={approveAll}>Approve all</Btn>
      </div>

      <div className="space-y-3">
        {pending.map(({ pid, applied, reason }) => {
          const person = SAMA.PEOPLE.find(p => p.id === pid) || { name:"Applicant", sid:"—", dept:"—", year:"" };
          return (
            <Card key={pid} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar name={person.name} size={36}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-semibold">{person.name}</span>
                    <span className="text-[11.5px] text-[var(--mute)] font-mono">{person.sid}</span>
                    <Chip tone="slate">{person.dept}</Chip>
                    {person.year && <Chip tone="indigo">{person.year}</Chip>}
                  </div>
                  <div className="text-[11.5px] text-[var(--mute)] mt-0.5 flex items-center gap-1">
                    <Icon.Cal width={11} height={11}/> Applied {applied}
                  </div>
                  <div className="mt-2 p-3 rounded-[8px] bg-[#fafafa] border hairline-2">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-1">Application statement</div>
                    <div className="text-[12.5px] text-[var(--ink-2)] leading-relaxed">{reason}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 pt-1">
                  <Btn variant="default" size="sm" icon={Icon.Check} onClick={() => approve(pid)}>Approve</Btn>
                  <Btn variant="outline" size="sm" icon={Icon.X} onClick={() => decline(pid)}>Decline</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================ Close Activity Modal */
const CloseActivityModal = ({ a, onClose, onConfirm }) => {
  const [items, setItems] = React.useState([
    { id:"attendance", label:"Attendance recorded",       hint:"Session records are finalised",          checked:true,  required:true  },
    { id:"budget",     label:"Budget reconciled",         hint:"All expenses logged and accounted for",  checked:true,  required:true  },
    { id:"media",      label:"Photos / media uploaded",   hint:"Optional — adds to activity archive",    checked:false, required:false },
    { id:"report",     label:"Post-event report filed",   hint:"Optional — attached to Documents tab",   checked:false, required:false },
  ]);

  const toggle = id => setItems(prev => prev.map(it => it.id === id ? { ...it, checked:!it.checked } : it));
  const requiredDone = items.filter(it => it.required).every(it => it.checked);
  const confirmedCount = a.registered || 47;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-[16px] shadow-float w-[520px] overflow-hidden">
        <div className="px-6 py-4 border-b hairline flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold">Close activity</div>
            <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{a.title}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-[7px] hover:bg-[#eeefef] flex items-center justify-center"><Icon.X width={14} height={14}/></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Pre-close checklist</div>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} onClick={() => toggle(it.id)} className={cx("flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer transition-colors select-none", it.checked ? "border-[var(--ok)]/40 bg-[var(--ok-wash)]" : "border-[var(--line)] hover:border-[var(--mute-2)]")}>
                  <div className={cx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", it.checked ? "bg-[var(--ok)] border-[var(--ok)]" : "border-[var(--line)]")}>
                    {it.checked && <Icon.Check width={10} height={10} className="text-white"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-medium">{it.label}</span>
                      {!it.required && <span className="text-[10.5px] text-[var(--mute-2)]">optional</span>}
                    </div>
                    <div className="text-[11px] text-[var(--mute)]">{it.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] bg-[var(--accent-wash)] border border-[var(--accent)]/20 p-4 space-y-2">
            <div className="text-[12px] font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <Icon.Send width={13} height={13} className="text-[var(--accent)]"/>
              What happens when you close
            </div>
            <div className="space-y-1.5 text-[12px] text-[var(--ink-2)]">
              <div className="flex items-start gap-2"><Icon.CheckCircle width={13} height={13} className="text-[var(--ok)] mt-0.5 shrink-0"/>Feedback survey dispatched to {confirmedCount} confirmed attendees</div>
              <div className="flex items-start gap-2"><Icon.Medal width={13} height={13} className="text-[var(--accent)] mt-0.5 shrink-0"/>Certificates generated after survey submission (or 48h auto-issue)</div>
              <div className="flex items-start gap-2"><Icon.Shield width={13} height={13} className="text-[var(--mute-2)] mt-0.5 shrink-0"/>Activity archived · registration permanently locked</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t hairline flex items-center justify-between">
          <button onClick={onClose} className="text-[12.5px] text-[var(--mute)] hover:text-[var(--ink)]">Cancel</button>
          <div className="flex items-center gap-2">
            {!requiredDone && (
              <span className="text-[11.5px] text-[var(--warn)] flex items-center gap-1.5">
                <Icon.AlertTri width={13} height={13}/>Complete required items first
              </span>
            )}
            <Btn variant="default" icon={Icon.CheckCircle} onClick={onConfirm}
              className={cx(!requiredDone && "opacity-50 pointer-events-none")}>
              Close activity
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Detail = Detail;
