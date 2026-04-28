/* Activity Detail — Event with QR, Program with sessions, Volunteering hub */

const Detail = () => {
  const { activeActivity, go } = useApp();
  const live = useActivity(activeActivity);
  const a = live || SAMA.ACTIVITIES.find(x => x.id === activeActivity) || SAMA.ACTIVITIES[0];
  const [tab, setTab] = React.useState("overview");
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
    actions.push(stageAction("Mark complete", ()=>{markComplete(a.id); toast.push({text:"Completed — surveys + certificates auto-sent", icon:Icon.CheckCircle});}, Icon.CheckCircle, "default"));
    actions.push(stageAction("Cancel", ()=>{cancel(a.id, "No longer needed"); toast.push({text:"Cancelled"});}, Icon.X, "outline"));
  }

  const tabs = {
    Event:   [["overview","Overview","Gauge"],["registrations","Registrations","ClipboardCheck"],["checkin","Check-in","Qr"],["logistics","Logistics","Pin"],["comms","Comms","Send"],["docs","Documents","Doc"],["feedback","Feedback","Star"],["activity","Activity log","Clock"]],
    Program: [["overview","Overview","Gauge"],["sessions","Sessions","Cal"],["roster","Roster","Users"],["attendance","Attendance","ClipboardCheck"],["comms","Comms","Send"],["activity","Activity log","Clock"]],
    Volunteering: [["overview","Overview","Gauge"],["applicants","Applicants","Users"],["hours","Hours & certs","Medal"],["comms","Comms","Send"],["activity","Activity log","Clock"]],
    Task: [["overview","Overview","Gauge"],["subtasks","Subtasks","ClipboardCheck"],["activity","Activity log","Clock"]],
    External: [["overview","Overview","Gauge"],["activity","Activity log","Clock"]],
  }[a.type] || [];

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
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Input icon={Icon.Search} placeholder="Search registrations…" size="sm" className="w-[260px]"/>
          <Segmented size="sm" value={filter} onChange={setFilter} items={[{value:"All",label:"All 47"},{value:"Confirmed",label:"Confirmed 38"},{value:"Waitlist",label:"Waitlist 12"},{value:"Cancelled",label:"Cancelled 4"}]}/>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" icon={Icon.Download}>Export CSV</Btn>
          <Btn variant="outline" size="sm" icon={Icon.Send}>Email selected</Btn>
          <Btn variant="default" size="sm" icon={Icon.Plus}>Add registrant</Btn>
          <Btn variant="default" size="sm" icon={Icon.Medal} onClick={() => setCertOpen(true)}>Issue certificates</Btn>
        </div>
      </div>

      {certOpen && <CertModal onClose={() => setCertOpen(false)} activityTitle={a.title}/>}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
              <th className="w-8"><input type="checkbox"/></th>
              <th>Student</th>
              <th>Department</th>
              <th>Registered</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Dietary</th>
              <th>Check-in</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {SAMA.PEOPLE.slice(0,12).map((p,i) => (
              <tr key={p.id} className="border-b hairline-2 hover:bg-[#fafafa]">
                <td className="px-3 py-2"><input type="checkbox" defaultChecked={i<3}/></td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><Avatar name={p.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{p.name}</div><div className="text-[11px] text-[var(--mute)]">{p.sid}</div></div></div></td>
                <td className="px-3 py-2 text-[var(--mute)]">{p.dept}</td>
                <td className="px-3 py-2 text-[11.5px] font-mono text-[var(--mute)]">{`Oct ${14+i%6}, ${9+i%7}:${(i*7%60).toString().padStart(2,"0")}`}</td>
                <td className="px-3 py-2">{i>=8 ? <Chip tone="amber">Waitlist</Chip> : <Chip tone="green">Confirmed</Chip>}</td>
                <td className="px-3 py-2 text-[var(--mute)]">{["Free","Free","Free","AED 30","Free","Free","Free","AED 30"][i%8]}</td>
                <td className="px-3 py-2 text-[11.5px] text-[var(--mute)]">{["—","Vegetarian","Halal","—","Vegan","—","—","Gluten-free"][i%8]}</td>
                <td className="px-3 py-2">{i<5 ? <span className="chip bg-[var(--ok-wash)] text-[var(--ok)]"><Icon.Check width={10} height={10}/> in</span> : <span className="text-[11.5px] text-[var(--mute-2)]">pending</span>}</td>
                <td className="px-3 py-2"><button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={13} height={13}/></button></td>
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
  const sessions = Array.from({length:12}).map((_,i) => ({
    id:i+1, date:`2025-${(9 + Math.floor(i/4)).toString().padStart(2,"0")}-${(((i%4)*7)+6).toString().padStart(2,"0")}`,
    label:`Week ${i+1}`, status: i<5?"Completed":i===5?"Today":"Upcoming", attendance: i<5? Math.round(14 + Math.random()*5) : null, total:18
  }));
  return (
    <div className="p-6 grid grid-cols-[1fr,320px] gap-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">12 sessions · Tue & Thu · 5:30 — 7:00 PM</div>
          <Btn variant="outline" size="sm" icon={Icon.Plus}>Add session</Btn>
        </div>
        {sessions.map((s,i) => (
          <Card key={s.id} className={cx("p-3 flex items-center gap-4", s.status==="Today" && "ring-2 ring-[var(--accent)]/30")}>
            <div className="w-12 text-center">
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
                {s.attendance != null && <span className="flex items-center gap-1"><Icon.Users width={11} height={11}/>{s.attendance}/{s.total}</span>}
              </div>
            </div>
            {s.status==="Completed" && (
              <div className="w-[120px]"><Progress value={s.attendance/s.total*100} color="var(--ok)"/><div className="text-[10.5px] font-mono text-[var(--mute)] mt-1 text-right">{Math.round(s.attendance/s.total*100)}% attended</div></div>
            )}
            <button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.ChevRight width={14} height={14}/></button>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
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
const FeedbackTab = ({ a }) => (<div className="p-6"><Card className="p-5"><div className="flex items-baseline justify-between mb-4"><div className="text-[13.5px] font-semibold">Post-event feedback</div><div className="text-[11.5px] text-[var(--mute)]">34 responses · 72% response rate</div></div><div className="grid grid-cols-4 gap-4">{[["Overall","4.6"],["Content","4.8"],["Venue","4.2"],["Would recommend","92%"]].map(([l,v])=>(<div key={l}><div className="text-[11px] text-[var(--mute)]">{l}</div><div className="text-[26px] font-semibold tracking-tight">{v}</div><div className="flex gap-0.5 mt-1">{Array.from({length:5}).map((_,i)=><Icon.Star key={i} width={11} height={11} className={i<4?"text-[var(--amber)]":"text-[var(--line)]"}/>)}</div></div>))}</div></Card></div>);
const RosterTab = ({ a }) => <RegistrationsTab a={a}/>;
const AttendanceTab = ({ a }) => (<div className="p-6"><Card className="p-5"><div className="text-[13.5px] font-semibold mb-3">Session-by-session attendance</div><div className="grid grid-cols-[200px,repeat(12,1fr)] gap-1 text-[10.5px]"><div className="font-medium">Student</div>{Array.from({length:12}).map((_,i)=><div key={i} className="text-center font-mono text-[var(--mute)]">W{i+1}</div>)}{SAMA.PEOPLE.slice(0,10).map(p=>(<React.Fragment key={p.id}><div className="flex items-center gap-1.5 truncate"><Avatar name={p.name} size={16}/><span className="truncate">{p.name.split(" ")[0]}</span></div>{Array.from({length:12}).map((_,w)=>{const r=Math.random(); return <div key={w} className={cx("h-6 rounded-[3px]", w>5?"bg-[#f1f2ef]": r>.85?"bg-[var(--bad-wash)]": r>.7?"bg-[var(--warn-wash)]":"bg-[var(--ok-wash)]")}/>;})}</React.Fragment>))}</div></Card></div>);
const SubtasksTab = ({ a }) => (<div className="p-6"><Card className="p-4"><div className="text-[13.5px] font-semibold mb-3">Subtasks · {a.subtasksDone||0}/{a.subtasks||4}</div>{["Book catering","Send calendar invite","Prepare handouts","Confirm AV setup"].map((t,i)=>(<div key={i} className="flex items-center gap-3 py-2.5 border-b hairline-2 last:border-0"><input type="checkbox" defaultChecked={i<(a.subtasksDone||2)}/><span className={cx("text-[13px] flex-1", i<(a.subtasksDone||2)&&"line-through text-[var(--mute)]")}>{t}</span><Avatar name={["Jane Doe","Hassan Q","Reem Abdulla","Fatima L"][i]} size={22}/><span className="text-[11.5px] text-[var(--mute)] font-mono">Oct {18+i}</span></div>))}</Card></div>);
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

window.Detail = Detail;
