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

const PersonDetail = ({ p }) => {
  const [transcriptOpen, setTranscriptOpen] = React.useState(false);
  return (
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
          {p.role === "Student" && <Btn variant="default" size="sm" icon={Icon.Doc} onClick={() => setTranscriptOpen(true)}>Generate transcript</Btn>}
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
    {transcriptOpen && <TranscriptModal person={p} onClose={() => setTranscriptOpen(false)}/>}
  </div>
  );
};

/* ============================================================ Transcript Modal */
const TranscriptModal = ({ person, onClose }) => {
  const [step, setStep] = React.useState(1);
  const [scope, setScope] = React.useState("current");
  const toast = useToast();
  const SEMESTERS = ["Fall 2025–26","Spring 2024–25","Fall 2024–25","Spring 2023–24"];
  const [semester, setSemester] = React.useState(SEMESTERS[0]);

  const verifyCode = `SAMA-TX-${person.id || 1}-${Math.floor(Math.random()*9000+1000)}`;
  const today = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  const participations = [
    { title:"AI Ethics Workshop", type:"Event", role:"Attendee", date:"Oct 22, 2025", hours:null },
    { title:"Beach Cleanup — Corniche", type:"Volunteering", role:"Volunteer", date:"Nov 2, 2025", hours:4 },
    { title:"Career Fair 2025", type:"Event", role:"Attendee", date:"Nov 18, 2025", hours:null },
    { title:"Football Training Season", type:"Program", role:"Player · #14", date:"Sep 2025–", hours:null },
    { title:"Red Crescent Visit", type:"Volunteering", role:"Volunteer", date:"Sep 14, 2025", hours:6 },
    { title:"Freshmen Orientation", type:"Event", role:"Volunteer", date:"Aug 28, 2025", hours:4 },
  ];
  const certs = [
    { name:"Leadership in Action", type:"Achievement", date:"Apr 2025" },
    { name:"Beach Cleanup",        type:"Volunteering Hours", date:"Nov 2024" },
    { name:"Career Fair 2024",     type:"Attendance", date:"Oct 2024" },
  ];
  const totalHours = participations.reduce((s,p) => s + (p.hours || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-[16px] shadow-float w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b hairline flex items-center justify-between shrink-0">
          <div>
            <div className="text-[15px] font-semibold">Generate Participation Transcript</div>
            <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{person.name} · {person.sid}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-[7px] hover:bg-[#eeefef] flex items-center justify-center"><Icon.X width={14} height={14}/></button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-5 overflow-y-auto thin-scroll">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Scope</div>
              <div className="space-y-1.5">
                {[["all","All time","Includes every confirmed participation"],["current","Current semester","Fall 2025–26 only"],["specific","Specific semester","Choose one below"]].map(([v,label,hint]) => (
                  <label key={v} className={cx("flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer transition-colors", scope===v ? "border-[var(--accent)] bg-[var(--accent-wash)]" : "border-[var(--line)] hover:border-[var(--mute-2)]")}>
                    <input type="radio" name="scope" value={v} checked={scope===v} onChange={() => setScope(v)} className="accent-[var(--accent)]"/>
                    <div className="flex-1"><div className="text-[12.5px] font-medium">{label}</div><div className="text-[11px] text-[var(--mute)]">{hint}</div></div>
                  </label>
                ))}
              </div>
              {scope==="specific" && (
                <div className="mt-2">
                  <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full h-9 px-3 rounded-[7px] border hairline text-[12.5px] bg-white">
                    {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="text-[11.5px] text-[var(--mute)] p-3 rounded-[8px] bg-[#fafafa] border hairline-2">
              <Icon.Shield width={11} height={11} className="inline mr-1"/>
              Only confirmed and completed participations are included. Waitlisted, cancelled, and pending records are excluded.
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="outline" onClick={onClose}>Cancel</Btn>
              <Btn variant="default" trailingIcon={Icon.ChevRight} onClick={() => setStep(2)}>Preview transcript</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto thin-scroll bg-[#e8eaef] p-6">
              <div className="bg-white shadow-float mx-auto" style={{width:"560px"}}>
                <div className="h-2 bg-gradient-to-r from-[var(--accent)] via-[var(--teal)] to-[var(--accent)]"/>
                <div className="p-8">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-[var(--ink)]">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--mute)] font-semibold">University of Applied Sciences</div>
                      <div className="text-[15px] font-semibold mt-1" style={{fontFamily:"Georgia,serif"}}>Department of Student Activities</div>
                    </div>
                    <div className="w-12 h-12 rounded-[10px] bg-[var(--ink)] text-white flex items-center justify-center font-serif text-[24px]">s</div>
                  </div>

                  <div className="text-center mt-5">
                    <div className="text-[10.5px] uppercase tracking-widest text-[var(--mute)]">Official Participation Transcript</div>
                    <div className="text-[20px] font-semibold tracking-tight mt-1" style={{fontFamily:"Georgia,serif"}}>{person.name}</div>
                    <div className="text-[11.5px] text-[var(--mute)] mt-0.5">SID {person.sid || "20250000"} · {person.dept || "Engineering"}</div>
                    <div className="text-[10.5px] text-[var(--mute-2)] mt-1">Scope: {scope==="all"?"All time":scope==="current"?"Fall 2025–26":semester}</div>
                  </div>

                  <div className="mt-6">
                    <div className="text-[10px] uppercase tracking-widest font-semibold text-[var(--mute)] mb-2">Confirmed Participations</div>
                    <table className="w-full text-[10.5px]">
                      <thead className="border-b hairline-2 text-left text-[var(--mute)]">
                        <tr className="[&>th]:py-1.5 [&>th]:font-medium">
                          <th>Activity</th><th>Type</th><th>Role</th><th>Date</th><th className="text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participations.map((row,i) => (
                          <tr key={i} className="border-b hairline-2 last:border-0">
                            <td className="py-1.5 font-medium">{row.title}</td>
                            <td className="py-1.5 text-[var(--mute)]">{row.type}</td>
                            <td className="py-1.5 text-[var(--mute)]">{row.role}</td>
                            <td className="py-1.5 text-[var(--mute)] font-mono">{row.date}</td>
                            <td className="py-1.5 text-right font-mono">{row.hours ? `${row.hours}h` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[var(--ink)] font-semibold">
                          <td colSpan="4" className="pt-1.5">Total volunteer hours</td>
                          <td className="pt-1.5 text-right font-mono">{totalHours}h</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-5">
                    <div className="text-[10px] uppercase tracking-widest font-semibold text-[var(--mute)] mb-2">Certificates Awarded</div>
                    <div className="space-y-1">
                      {certs.map((c,i) => (
                        <div key={i} className="flex items-center justify-between text-[10.5px] py-1 border-b hairline-2 last:border-0">
                          <div><span className="font-medium">{c.name}</span> <span className="text-[var(--mute)]">· {c.type}</span></div>
                          <span className="text-[var(--mute)] font-mono">{c.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t hairline-2 grid grid-cols-3 gap-3 text-[9.5px] text-[var(--mute)]">
                    <div>
                      <div className="font-semibold text-[var(--ink)] uppercase tracking-wider mb-0.5">Issued</div>
                      <div>{today}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--ink)] uppercase tracking-wider mb-0.5">Generated by</div>
                      <div>Reem Abdulla, Ops Mgr</div>
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--ink)] uppercase tracking-wider mb-0.5">Verification</div>
                      <div className="font-mono">{verifyCode}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[9px] text-[var(--mute-2)] text-center">Verify authenticity at verify.sama.ae/transcript using the code above.</div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t hairline bg-white shrink-0 flex justify-between">
              <Btn variant="ghost" icon={Icon.ChevLeft} onClick={() => setStep(1)}>Back</Btn>
              <div className="flex gap-2">
                <Btn variant="outline" icon={Icon.Send} onClick={() => toast.push({ text:`Transcript emailed to ${person.email||"student"}`, icon:Icon.Send })}>Email to student</Btn>
                <Btn variant="default" icon={Icon.Download} onClick={() => { toast.push({ text:"Transcript PDF downloaded", icon:Icon.Download }); onClose(); }}>Download PDF</Btn>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AttendanceSpark2 = () => {
  const pts=[3,5,4,6,5,8,7,9,8,10];
  const path = pts.map((v,i)=>`${i===0?"M":"L"} ${i*(220/9)} ${60-v*5}`).join(" ");
  return <svg viewBox="0 0 220 64" className="w-full h-16"><path d={`${path} L 220 64 L 0 64 Z`} fill="var(--accent-wash)"/><path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5"/></svg>;
};

window.People = People;
