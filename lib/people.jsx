/* People Registry — students + staff with filters */

const People = () => {
  const { activePerson, go } = useApp();
  const [tab, setTab] = React.useState("students");
  const [q, setQ] = React.useState("");
  const list = SAMA.PEOPLE.filter(p => {
    if (tab === "students" && p.role !== "Student") return false;
    if (tab === "staff" && p.role === "Student") return false;
    if (q && !(p.name.toLowerCase().includes(q.toLowerCase()) || (p.sid||"").toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  const [sel, setSel] = React.useState(list[0]?.id);
  React.useEffect(()=>{ if (activePerson) setSel(activePerson); },[activePerson]);
  const p = SAMA.PEOPLE.find(x=>x.id===sel) || list[0];

  return (
    <div className="h-full grid grid-cols-[360px,1fr]">
      <div className="border-r hairline bg-[var(--surface)] flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b hairline">
          <h1 className="text-[18px] font-semibold tracking-tight">People</h1>
          <div className="text-[11.5px] text-[var(--mute)] mt-0.5">1,842 students · 58 staff · 14 partners</div>
          <div className="mt-3"><Segmented size="sm" value={tab} onChange={setTab} items={[{value:"students",label:"Students"},{value:"staff",label:"Staff"},{value:"partners",label:"Partners"}]}/></div>
          <div className="mt-2"><Input icon={Icon.Search} size="sm" placeholder="Search name or SID…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll">
          {list.map(person => (
            <button key={person.id} onClick={()=>setSel(person.id)} className={cx("w-full flex items-center gap-2.5 px-4 py-2.5 border-b hairline-2 hover:bg-[#fafafa] text-left", sel===person.id && "bg-[var(--accent-wash)]/40")}>
              <Avatar name={person.name} size={32}/>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{person.name}</div>
                <div className="text-[11px] text-[var(--mute)] truncate">{person.sid || person.role} · {person.dept || ""}</div>
              </div>
              {person.leader && <Icon.Medal width={13} height={13} className="text-[var(--amber)]"/>}
            </button>
          ))}
        </div>
      </div>
      {p && <PersonDetail p={p}/>}
    </div>
  );
};

const PersonDetail = ({ p }) => (
  <div className="overflow-y-auto thin-scroll">
    <div className="p-6 border-b hairline bg-[var(--surface)] flex items-start gap-5">
      <Avatar name={p.name} size={72}/>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[22px] font-semibold tracking-tight">{p.name}</h2>
          {p.leader && <Chip tone="indigo">Club leader</Chip>}
        </div>
        <div className="text-[12.5px] text-[var(--mute)]">{p.sid || p.role} · {p.dept} · {p.year || ""} · {p.email}</div>
        <div className="mt-3 flex items-center gap-1.5">
          <Btn variant="outline" size="sm" icon={Icon.Send}>Message</Btn>
          <Btn variant="outline" size="sm" icon={Icon.Medal}>Issue certificate</Btn>
          <Btn variant="outline" size="sm" icon={Icon.Download}>Export record</Btn>
        </div>
      </div>
      {p.role === "Student" && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-[22px] font-semibold">{p.engagement || 68}</div><div className="text-[10.5px] text-[var(--mute)]">Engagement</div></div>
          <div><div className="text-[22px] font-semibold">{p.hours || 14}</div><div className="text-[10.5px] text-[var(--mute)]">Volunteer hrs</div></div>
          <div><div className="text-[22px] font-semibold">{p.attended || 11}</div><div className="text-[10.5px] text-[var(--mute)]">Attended</div></div>
        </div>
      )}
    </div>
    <div className="p-6 grid grid-cols-[1fr,320px] gap-5">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Activity history</div>
          {SAMA.ACTIVITIES.slice(0,6).map(a => (
            <div key={a.id} className="flex items-center gap-3 py-2 border-b hairline-2 last:border-0">
              <div className="w-8 h-8 rounded-[7px] flex items-center justify-center" style={{background:SAMA.TYPE_META[a.type].wash,color:SAMA.TYPE_META[a.type].ink}}>{React.createElement(Icon[SAMA.TYPE_META[a.type].icon],{width:13,height:13})}</div>
              <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium truncate">{a.title}</div><div className="text-[11px] text-[var(--mute)]">{a.date} · {a.type}</div></div>
              <Chip tone="green">Attended</Chip>
            </div>
          ))}
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Certificates earned</div>
          <div className="grid grid-cols-3 gap-2">{[["Attendance","Oct 2025"],["Volunteer · 6hrs","Sep 2025"],["Leadership","Apr 2025"]].map(([k,d])=>(<div key={k} className="p-2.5 rounded-[8px] border hairline bg-[#fafafa]"><Icon.Medal width={16} height={16} className="text-[var(--amber)] mb-1"/><div className="text-[12px] font-medium">{k}</div><div className="text-[10.5px] text-[var(--mute)]">{d}</div></div>))}</div>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Clubs & teams</div>{["Debate Club · Member","Robotics Team · Lead","Red Crescent · Volunteer"].map((c,i)=><div key={i} className="py-1.5 text-[12.5px] border-b hairline-2 last:border-0">{c}</div>)}</Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Engagement trend</div><AttendanceSpark2/></Card>
      </div>
    </div>
  </div>
);

const AttendanceSpark2 = () => {
  const pts=[3,5,4,6,5,8,7,9,8,10];
  const path = pts.map((v,i)=>`${i===0?"M":"L"} ${i*(220/9)} ${60-v*5}`).join(" ");
  return <svg viewBox="0 0 220 64" className="w-full h-16"><path d={`${path} L 220 64 L 0 64 Z`} fill="var(--accent-wash)"/><path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5"/></svg>;
};

window.People = People;
