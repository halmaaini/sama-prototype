/* Counselor Module — student counseling sessions, cases, appointments, records */

const Counselor = () => {
  const [tab, setTab] = React.useState("sessions");
  const tabs = [
    ["sessions","Sessions","Doc"],
    ["cases","Active cases","Flag"],
    ["appointments","Appointments","Cal"],
    ["records","Student files","Sparkle"],
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Student Counseling</h1>
            <div className="text-[12px] text-[var(--mute)] mt-0.5">Counseling sessions, ongoing cases, appointments, and confidential student files.</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" icon={Icon.Download}>Export</Btn>
            <Btn variant="default" size="sm" icon={Icon.Plus}>{tab==="sessions"?"Log session":tab==="cases"?"Open case":tab==="appointments"?"New appointment":"New file"}</Btn>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <Stat label="Sessions today" value="6" hint="2 walk-in"/>
          <Stat label="Active cases" value="14" hint="3 high priority"/>
          <Stat label="Upcoming appts" value="9" hint="next 7 days"/>
          <Stat label="Files on record" value="87" hint="this semester"/>
        </div>
        <div className="flex items-center gap-0.5 mt-4 -mb-4">
          {tabs.map(([id,label,icon]) => {
            const I = Icon[icon];
            return (
              <button key={id} onClick={() => setTab(id)} className={cx("px-3 h-9 text-[12.5px] font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors", tab===id ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--mute)] hover:text-[var(--ink)]")}>
                <I width={13} height={13}/>{label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        {tab === "sessions"     && <SessionsTabC/>}
        {tab === "cases"        && <CasesTab/>}
        {tab === "appointments" && <AppointmentsTabC/>}
        {tab === "records"      && <FilesTab/>}
      </div>
    </div>
  );
};

/* ============================================================ Sessions */
const SessionsTabC = () => {
  const SESSIONS = [
    { name:"Fatima Al-Nuaimi", sid:"20250314", time:"Today 9:00 AM",  topic:"Exam anxiety",         counselor:"Dr. Maya",  type:"Scheduled", status:"Closed",   summary:"CBT techniques, breathing exercises. Follow-up in 1 week." },
    { name:"Hassan Qureshi",   sid:"20250288", time:"Today 10:00 AM", topic:"Academic difficulty", counselor:"Dr. Maya",  type:"Scheduled", status:"Closed",   summary:"Time management plan, study schedule. Referred to academic advisor." },
    { name:"Amina Khalil",     sid:"20250451", time:"Today 11:00 AM", topic:"Family conflict",     counselor:"Dr. Yusuf", type:"Walk-in",   status:"Open",     summary:"Initial intake, building rapport. Next session Wednesday." },
    { name:"Tariq Mansour",    sid:"20250199", time:"Today 1:30 PM",  topic:"Career uncertainty",  counselor:"Dr. Maya",  type:"Scheduled", status:"Closed",   summary:"Career interest inventory completed. Resources shared." },
    { name:"Layla Ibrahim",    sid:"20250377", time:"Today 2:30 PM",  topic:"Stress & sleep",      counselor:"Dr. Yusuf", type:"Walk-in",   status:"Closed",   summary:"Sleep hygiene strategies. Wellness app recommended." },
    { name:"Omar Al-Mansoori", sid:"20250122", time:"Today 3:30 PM",  topic:"Adjustment · transfer",counselor:"Dr. Maya", type:"Scheduled", status:"Open",     summary:"Settling in concerns. Connected with peer mentor." },
  ];
  const [filter, setFilter] = React.useState("All");
  const [q, setQ] = React.useState("");
  const tones = { "Walk-in":"amber", "Scheduled":"indigo", "Crisis":"red" };
  const statusTones = { "Open":"red", "Closed":"slate", "Referred":"amber" };

  const filtered = SESSIONS.filter(s =>
    (filter==="All" || s.type===filter) &&
    (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.sid.includes(q) || s.topic.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <Input icon={Icon.Search} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, SID, topic…" size="sm" className="w-[280px]"/>
        <Segmented size="sm" value={filter} onChange={setFilter} items={[{value:"All",label:"All"},{value:"Walk-in",label:"Walk-in"},{value:"Scheduled",label:"Scheduled"}]}/>
        <span className="text-[11.5px] text-[var(--mute)] ml-auto flex items-center gap-1.5"><Icon.Lock width={11} height={11}/>All sessions are confidential</span>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
              <th>Student</th><th>Time</th><th>Topic</th><th>Counselor</th><th>Type</th><th>Status</th><th>Summary</th><th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i) => (
              <tr key={i} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                <td className="px-4 py-2"><div className="flex items-center gap-2"><Avatar name={s.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{s.name}</div><div className="text-[11px] text-[var(--mute)]">{s.sid}</div></div></div></td>
                <td className="px-4 py-2 text-[var(--mute)] font-mono text-[11.5px]">{s.time}</td>
                <td className="px-4 py-2">{s.topic}</td>
                <td className="px-4 py-2 text-[var(--mute)]">{s.counselor}</td>
                <td className="px-4 py-2"><Chip tone={tones[s.type]}>{s.type}</Chip></td>
                <td className="px-4 py-2"><Chip tone={statusTones[s.status]}>{s.status}</Chip></td>
                <td className="px-4 py-2 text-[var(--mute)] text-[11.5px] truncate max-w-[220px]">{s.summary}</td>
                <td className="px-4 py-2"><button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={13} height={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ============================================================ Cases */
const CasesTab = () => {
  const PRIORITY_TONE = { Low:"slate", Medium:"amber", High:"red", Crisis:"red" };
  const STATUS_TONE = { Active:"indigo", "Follow-up":"amber", Closed:"green", Referred:"slate" };

  const CASES = [
    { id:1, name:"Fatima Al-Nuaimi", sid:"20250314", category:"Mental health · anxiety",     priority:"Medium", status:"Active",    opened:"Sep 14, 2025", sessions:4, counselor:"Dr. Maya",  notes:"CBT progressing well. Coping with exam stress. Continued weekly sessions." },
    { id:2, name:"Omar Al-Mansoori", sid:"20250122", category:"Adjustment · transfer student",priority:"Low",    status:"Active",    opened:"Sep 22, 2025", sessions:2, counselor:"Dr. Maya",  notes:"Settling in well. Peer mentor matched. One more session planned." },
    { id:3, name:"Amina Khalil",     sid:"20250451", category:"Family conflict",              priority:"High",   status:"Active",    opened:"Oct 14, 2025", sessions:1, counselor:"Dr. Yusuf", notes:"Initial intake. Building rapport. Considering family session if appropriate." },
    { id:4, name:"Hassan Qureshi",   sid:"20250288", category:"Academic difficulty",          priority:"Medium", status:"Follow-up", opened:"Sep 8, 2025",  sessions:3, counselor:"Dr. Maya",  notes:"Improvement in time management. Referred to academic advisor for course planning." },
    { id:5, name:"Tariq Mansour",    sid:"20250199", category:"Career counseling",            priority:"Low",    status:"Closed",    opened:"Aug 30, 2025", sessions:2, counselor:"Dr. Maya",  notes:"Career interest inventory completed. Major confirmed. Case closed." },
    { id:6, name:"Sara Al-Shamsi",   sid:"20250488", category:"Mental health · depression",   priority:"High",   status:"Referred",  opened:"Oct 2, 2025",  sessions:5, counselor:"Dr. Yusuf", notes:"Referred to external psychiatric services with student's consent. Continuing supportive sessions." },
  ];

  return (
    <div className="p-6 space-y-3">
      {CASES.map(c => (
        <Card key={c.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--accent-wash)] flex items-center justify-center shrink-0">
              <Icon.Flag width={18} height={18} className="text-[var(--accent)]"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Avatar name={c.name} size={22}/>
                <div className="text-[13.5px] font-semibold">{c.name}</div>
                <span className="text-[11.5px] text-[var(--mute)]">{c.sid}</span>
                <Chip tone={PRIORITY_TONE[c.priority]}>{c.priority} priority</Chip>
                <Chip tone={STATUS_TONE[c.status]}>{c.status}</Chip>
                <Chip tone="slate"><Icon.Lock width={9} height={9}/>Confidential</Chip>
              </div>
              <div className="mt-1.5 text-[13px] font-medium">{c.category}</div>
              <div className="text-[11.5px] text-[var(--mute)] mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Icon.Cal width={11} height={11}/>Opened {c.opened}</span>
                <span className="flex items-center gap-1"><Icon.Doc width={11} height={11}/>{c.sessions} session{c.sessions!==1?"s":""}</span>
                <span className="flex items-center gap-1"><Icon.User width={11} height={11}/>{c.counselor}</span>
              </div>
              <div className="mt-2 text-[12px] text-[var(--ink-2)]">{c.notes}</div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <Btn variant="outline" size="sm" icon={Icon.Plus}>Add note</Btn>
              {c.status !== "Closed" && <Btn variant="ghost" size="sm" icon={Icon.CheckCircle}>Close case</Btn>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ============================================================ Appointments */
const AppointmentsTabC = () => {
  const [view, setView] = React.useState("upcoming");
  const SEED = [
    { id:1, name:"Fatima Al-Nuaimi", sid:"20250314", date:"Today",    time:"4:00 PM",  counselor:"Dr. Maya",  reason:"Anxiety follow-up",    status:"Confirmed" },
    { id:2, name:"Amina Khalil",     sid:"20250451", date:"Tomorrow", time:"10:00 AM", counselor:"Dr. Yusuf", reason:"Family conflict",      status:"Confirmed" },
    { id:3, name:"Omar Al-Mansoori", sid:"20250122", date:"Tomorrow", time:"2:00 PM",  counselor:"Dr. Maya",  reason:"Adjustment check-in",  status:"Confirmed" },
    { id:4, name:"Layla Ibrahim",    sid:"20250377", date:"Oct 30",   time:"11:00 AM", counselor:"Dr. Yusuf", reason:"Stress management",    status:"Confirmed" },
    { id:5, name:"Sara Al-Shamsi",   sid:"20250488", date:"Oct 31",   time:"9:00 AM",  counselor:"Dr. Yusuf", reason:"Continuing support",   status:"Confirmed" },
    { id:6, name:"Hassan Qureshi",   sid:"20250288", date:"Nov 2",    time:"3:00 PM",  counselor:"Dr. Maya",  reason:"Academic check-in",    status:"Pending"   },
    { id:7, name:"Khalid Al-Falasi", sid:"20250612", date:"Nov 4",    time:"1:00 PM",  counselor:"Dr. Maya",  reason:"Initial consultation", status:"Confirmed" },
    { id:8, name:"Aisha Farhat",     sid:"20250155", date:"Nov 5",    time:"10:30 AM", counselor:"Dr. Yusuf", reason:"Career counseling",    status:"Confirmed" },
    { id:9, name:"Noor Al-Hashimi",  sid:"20250341", date:"Nov 6",    time:"4:30 PM",  counselor:"Dr. Maya",  reason:"Self-referral",        status:"Pending"   },
  ];
  const PAST = [
    { id:10, name:"Tariq Mansour", sid:"20250199", date:"Sep 28", time:"1:00 PM", counselor:"Dr. Maya",  reason:"Career counseling", status:"Completed" },
    { id:11, name:"Maria Costa",   sid:"20250507", date:"Sep 14", time:"3:00 PM", counselor:"Dr. Yusuf", reason:"Initial intake",    status:"Completed" },
  ];

  const [appts, setAppts] = React.useState(SEED);
  const [rescheduleTarget, setRescheduleTarget] = React.useState(null);
  const toast = useToast();
  const STATUS_TONE = { Confirmed:"green", Pending:"amber", Completed:"slate", Cancelled:"red", Rescheduled:"indigo" };

  const cancelAppt = (id) => {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status:"Cancelled" } : a));
    toast.push({ text:"Appointment cancelled · student notified", icon:Icon.X });
  };
  const saveReschedule = (newDate, newTime) => {
    const label = newDate ? new Date(newDate).toLocaleDateString("en-GB", { day:"numeric", month:"short" }) : rescheduleTarget.date;
    setAppts(prev => prev.map(a => a.id === rescheduleTarget.id ? { ...a, date:label, time:newTime, status:"Rescheduled" } : a));
    toast.push({ text:`Rescheduled to ${label} at ${newTime}`, icon:Icon.Cal });
    setRescheduleTarget(null);
  };

  const list = view === "upcoming" ? appts : PAST;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <Segmented size="sm" value={view} onChange={setView} items={[{value:"upcoming",label:`Upcoming · ${appts.filter(a=>a.status!=="Cancelled").length}`},{value:"past",label:`Past · ${PAST.length}`}]}/>
        <span className="text-[11.5px] text-[var(--mute)] ml-auto">2 counselors · 3 rooms · 1 group room</span>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
              <th>Student</th><th>Date</th><th>Time</th><th>Counselor</th><th>Reason</th><th>Status</th><th className="w-36"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className={cx("border-b hairline-2 last:border-0 hover:bg-[#fafafa]", a.status==="Cancelled" && "opacity-50")}>
                <td className="px-4 py-2"><div className="flex items-center gap-2"><Avatar name={a.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{a.name}</div><div className="text-[11px] text-[var(--mute)]">{a.sid}</div></div></div></td>
                <td className="px-4 py-2 font-medium">{a.date}</td>
                <td className="px-4 py-2 font-mono text-[var(--mute)]">{a.time}</td>
                <td className="px-4 py-2 text-[var(--mute)]">{a.counselor}</td>
                <td className="px-4 py-2">{a.reason}</td>
                <td className="px-4 py-2"><Chip tone={STATUS_TONE[a.status]}>{a.status}</Chip></td>
                <td className="px-4 py-2 text-right">
                  {view === "upcoming" && a.status !== "Cancelled" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={()=>setRescheduleTarget(a)} className="text-[11.5px] text-[var(--accent)] hover:underline">Reschedule</button>
                      <span className="text-[var(--mute-2)]">·</span>
                      <button onClick={()=>cancelAppt(a.id)} className="text-[11.5px] text-[var(--bad)] hover:underline">Cancel</button>
                    </div>
                  ) : view === "past" ? (
                    <button className="text-[11.5px] text-[var(--accent)] hover:underline">View notes</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {rescheduleTarget && <RescheduleModal appt={{...rescheduleTarget, doctor:rescheduleTarget.counselor}} onSave={saveReschedule} onClose={()=>setRescheduleTarget(null)}/>}
    </div>
  );
};

/* ============================================================ Files */
const FilesTab = () => {
  const [sel, setSel] = React.useState(0);
  const [q, setQ] = React.useState("");

  const FILES = SAMA.PEOPLE.slice(0, 8).map((p,i) => ({
    ...p,
    referredBy:   ["Self-referral","Faculty (Dr. Salim)","Self-referral","Resident Assistant","Faculty (Prof. Abeer)","Self-referral","Friend","Self-referral"][i],
    primaryConcern: ["Anxiety · exam stress","Academic difficulty","Family conflict","Adjustment","Mental health · depression","Career uncertainty","Stress & sleep","Mild depression"][i],
    riskLevel:    ["Low","Low","Medium","Low","High","Low","Low","Medium"][i],
    sessions:     [4, 3, 1, 2, 5, 2, 3, 2][i],
    firstSession: ["Sep 14, 2025","Sep 8, 2025","Oct 14, 2025","Sep 22, 2025","Oct 2, 2025","Aug 30, 2025","Sep 18, 2025","Sep 30, 2025"][i],
    lastSession:  ["Today","Yesterday","Today","Last Wed","2 days ago","Sep 28","Today","Oct 18"][i],
    counselor:    ["Dr. Maya","Dr. Maya","Dr. Yusuf","Dr. Maya","Dr. Yusuf","Dr. Maya","Dr. Yusuf","Dr. Maya"][i],
    plan:         "Weekly sessions, CBT-based approach. Wellness check-ins. Coordinated with academic advisor where appropriate.",
    nextStep:     ["Continue weekly CBT sessions","Bi-weekly check-ins","Family session if appropriate","One more session","Continue + external psychiatrist","Closed","Monthly maintenance","Continue weekly"][i],
  }));

  const filtered = FILES.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.sid?.includes(q));
  const r = filtered[sel] || filtered[0] || FILES[0];

  const RISK_TONE = { Low:"green", Medium:"amber", High:"red" };

  return (
    <div className="grid grid-cols-[320px,1fr] h-full">
      <div className="border-r hairline bg-[var(--surface)] flex flex-col">
        <div className="p-3 border-b hairline">
          <Input icon={Icon.Search} value={q} onChange={e=>{ setQ(e.target.value); setSel(0); }} placeholder="Search students…" size="sm"/>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll">
          {filtered.map((person,i) => (
            <button key={person.id} onClick={() => setSel(i)} className={cx("w-full flex items-center gap-2.5 px-3 py-2.5 border-b hairline-2 hover:bg-[#fafafa] text-left", sel===i && "bg-[var(--accent-wash)]/40")}>
              <Avatar name={person.name} size={28}/>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium truncate">{person.name}</div>
                <div className="text-[11px] text-[var(--mute)] truncate">{person.sid} · {person.dept}</div>
              </div>
              <span className={cx("w-2 h-2 rounded-full",
                person.riskLevel === "High" ? "bg-[var(--bad)]" :
                person.riskLevel === "Medium" ? "bg-[var(--warn)]" : "bg-[var(--ok)]")}/>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto thin-scroll p-6 space-y-4">
        {r && (
          <>
            <div className="flex items-center gap-4">
              <Avatar name={r.name} size={56}/>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[18px] font-semibold tracking-tight">{r.name}</div>
                  <Chip tone="slate"><Icon.Lock width={9} height={9}/>Confidential file</Chip>
                </div>
                <div className="text-[12px] text-[var(--mute)]">{r.sid} · {r.dept} · primary counselor: {r.counselor}</div>
              </div>
              <div className="flex gap-2">
                <Btn variant="outline" size="sm" icon={Icon.Doc}>Session log</Btn>
                <Btn variant="default" size="sm" icon={Icon.Plus}>Log new session</Btn>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Stat label="Risk level" value={r.riskLevel}/>
              <Stat label="Total sessions" value={r.sessions}/>
              <Stat label="First session" value={r.firstSession}/>
              <Stat label="Last session" value={r.lastSession}/>
            </div>

            {r.riskLevel === "High" && (
              <div className="p-3 rounded-[10px] bg-[var(--bad-wash)] border border-[var(--bad)]/20 flex items-center gap-3">
                <Icon.AlertTri width={16} height={16} className="text-[var(--bad)]"/>
                <div className="text-[12px] text-[var(--ink-2)] flex-1"><b>High-risk case.</b> Crisis protocols available. External services engaged with consent.</div>
                <Btn variant="default" size="sm" icon={Icon.Phone}>Crisis line</Btn>
              </div>
            )}

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Intake summary</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
                <div><div className="text-[10.5px] text-[var(--mute)]">Referred by</div><div className="font-medium">{r.referredBy}</div></div>
                <div><div className="text-[10.5px] text-[var(--mute)]">Primary concern</div><div className="font-medium">{r.primaryConcern}</div></div>
                <div><div className="text-[10.5px] text-[var(--mute)]">Risk level</div><div className="font-medium"><Chip tone={RISK_TONE[r.riskLevel]}>{r.riskLevel}</Chip></div></div>
                <div><div className="text-[10.5px] text-[var(--mute)]">Counselor</div><div className="font-medium">{r.counselor}</div></div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Treatment plan</div>
              <div className="text-[12.5px] text-[var(--ink-2)] leading-relaxed">{r.plan}</div>
              <div className="mt-3 p-3 rounded-[8px] bg-[#fafafa] border hairline-2">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-1">Next step</div>
                <div className="text-[12.5px]">{r.nextStep}</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Recent session notes</div>
                <span className="text-[10.5px] text-[var(--mute-2)]">Notes are confidential — visible to assigned counselors only</span>
              </div>
              <div className="space-y-2">
                {[{date:r.lastSession, note:"Made progress on coping techniques. Mood improved from 4/10 to 6/10. Continued homework assignments."},
                  {date:"2 weeks ago", note:"Discussed sleep hygiene and academic pressure. Introduced grounding exercises. Student receptive."},
                  {date:"3 weeks ago", note:"Initial intake. Built rapport. Identified primary triggers. Established goals together."}].map((n,i) => (
                  <div key={i} className="p-3 rounded-[8px] bg-[#fafafa] border hairline-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-[var(--mute)]">{n.date}</span>
                      <span className="text-[10.5px] text-[var(--mute-2)]">{r.counselor}</span>
                    </div>
                    <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">{n.note}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

window.Counselor = Counselor;
