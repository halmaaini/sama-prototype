/* Health Module — clinic visits, injuries, appointments, records */

const Health = () => {
  const [tab, setTab] = React.useState("visits");
  const tabs = [
    ["visits","Visits","Doc"],
    ["injuries","Injuries","AlertTri"],
    ["appointments","Appointments","Cal"],
    ["records","Health records","Heart"],
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Health & Clinic</h1>
            <div className="text-[12px] text-[var(--mute)] mt-0.5">Clinic visits, injury reports, appointments, and student health records.</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" icon={Icon.Download}>Export</Btn>
            <Btn variant="default" size="sm" icon={Icon.Plus}>{tab==="visits"?"Log visit":tab==="injuries"?"Report injury":tab==="appointments"?"New appointment":"Add record"}</Btn>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <Stat label="Visits today" value="8" hint="3 walk-in"/>
          <Stat label="Open injuries" value="3" hint="1 severe"/>
          <Stat label="Upcoming appts" value="12" hint="next 7 days"/>
          <Stat label="Records on file" value="1,842" hint="all students"/>
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
        {tab === "visits"       && <VisitsTab/>}
        {tab === "injuries"     && <InjuriesTab/>}
        {tab === "appointments" && <AppointmentsTab/>}
        {tab === "records"      && <RecordsTab/>}
      </div>
    </div>
  );
};

/* ============================================================ Visits */
const VisitsTab = () => {
  const VISITS = [
    { name:"Fatima Al-Nuaimi", sid:"20250314", time:"Today 9:14 AM",  reason:"Headache · sinus pressure", doctor:"Dr. Hala", type:"Walk-in",   status:"Closed",   notes:"OTC pain relief, rest 24h" },
    { name:"Hassan Qureshi",   sid:"20250288", time:"Today 9:42 AM",  reason:"Sprained ankle follow-up", doctor:"Dr. Khaled", type:"Follow-up", status:"Closed",   notes:"Recovery on track, light activity" },
    { name:"Amina Khalil",     sid:"20250451", time:"Today 10:20 AM", reason:"Allergy reaction · pollen",doctor:"Dr. Hala", type:"Walk-in",   status:"Closed",   notes:"Antihistamine prescribed" },
    { name:"Tariq Mansour",    sid:"20250199", time:"Today 11:05 AM", reason:"Pre-tournament fitness",   doctor:"Dr. Khaled", type:"Scheduled", status:"Cleared",  notes:"Cleared for football tournament" },
    { name:"Layla Ibrahim",    sid:"20250377", time:"Today 11:38 AM", reason:"Fever · 38.2°C",           doctor:"Dr. Hala", type:"Walk-in",   status:"Referred", notes:"Sent home, follow-up tomorrow" },
    { name:"Omar Al-Mansoori", sid:"20250122", time:"Today 1:15 PM",  reason:"Knee pain · post-training",doctor:"Dr. Khaled", type:"Walk-in",   status:"Open",     notes:"Awaiting MRI booking" },
    { name:"Sara Al-Shamsi",   sid:"20250488", time:"Today 2:42 PM",  reason:"Routine check-up",         doctor:"Dr. Hala", type:"Scheduled", status:"Closed",   notes:"All vitals normal" },
    { name:"Yousef Al-Nahyan", sid:"20250266", time:"Today 3:30 PM",  reason:"Cut on hand · bandage",    doctor:"Dr. Hala", type:"Walk-in",   status:"Closed",   notes:"Cleaned and bandaged" },
  ];
  const [filter, setFilter] = React.useState("All");
  const [q, setQ] = React.useState("");
  const tones = { "Walk-in":"amber", "Scheduled":"indigo", "Follow-up":"slate" };
  const statusTones = { "Open":"red", "Cleared":"green", "Closed":"slate", "Referred":"amber" };

  const filtered = VISITS.filter(v =>
    (filter==="All" || v.type===filter) &&
    (!q || v.name.toLowerCase().includes(q.toLowerCase()) || v.sid.includes(q) || v.reason.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <Input icon={Icon.Search} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, SID, reason…" size="sm" className="w-[280px]"/>
        <Segmented size="sm" value={filter} onChange={setFilter} items={[{value:"All",label:"All"},{value:"Walk-in",label:"Walk-in"},{value:"Scheduled",label:"Scheduled"},{value:"Follow-up",label:"Follow-up"}]}/>
        <span className="text-[11.5px] text-[var(--mute)] ml-auto">{filtered.length} visits</span>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
              <th>Patient</th><th>Time</th><th>Reason</th><th>Doctor</th><th>Type</th><th>Status</th><th>Notes</th><th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v,i) => (
              <tr key={i} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                <td className="px-4 py-2"><div className="flex items-center gap-2"><Avatar name={v.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{v.name}</div><div className="text-[11px] text-[var(--mute)]">{v.sid}</div></div></div></td>
                <td className="px-4 py-2 text-[var(--mute)] font-mono text-[11.5px]">{v.time}</td>
                <td className="px-4 py-2">{v.reason}</td>
                <td className="px-4 py-2 text-[var(--mute)]">{v.doctor}</td>
                <td className="px-4 py-2"><Chip tone={tones[v.type]}>{v.type}</Chip></td>
                <td className="px-4 py-2"><Chip tone={statusTones[v.status]}>{v.status}</Chip></td>
                <td className="px-4 py-2 text-[var(--mute)] text-[11.5px] truncate max-w-[200px]">{v.notes}</td>
                <td className="px-4 py-2"><button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={13} height={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ============================================================ Injuries */
const InjuriesTab = () => {
  const SEVERITY_TONE = { Minor:"slate", Moderate:"amber", Severe:"red" };
  const STATUS_TONE  = { Open:"red", Recovering:"amber", Closed:"green" };

  const [items, setItems] = React.useState([
    { id:1, name:"Hassan Qureshi", sid:"20250288", activity:"Football Training · Week 5", injury:"Sprained ankle",      severity:"Moderate", status:"Recovering", reported:"Oct 8, 2025",  followUps:2, notes:"Wearing brace, light training only" },
    { id:2, name:"Omar Al-Mansoori", sid:"20250122", activity:"Football Training · Week 6", injury:"Knee strain",        severity:"Severe",   status:"Open",       reported:"Oct 14, 2025", followUps:1, notes:"Awaiting MRI · suspended from training" },
    { id:3, name:"Maria Costa",    sid:"20250507", activity:"Beach Cleanup",                injury:"Cut on hand",        severity:"Minor",    status:"Closed",     reported:"Sep 30, 2025", followUps:0, notes:"Healed in 5 days" },
    { id:4, name:"Layla Ibrahim",  sid:"20250377", activity:"Cultural Night Setup",         injury:"Sprained wrist",     severity:"Minor",    status:"Recovering", reported:"Oct 11, 2025", followUps:1, notes:"Brace + rest · 2 weeks" },
    { id:5, name:"Yousef Al-Nahyan", sid:"20250266", activity:"Inter-uni Football Match",   injury:"Concussion check",   severity:"Moderate", status:"Closed",     reported:"Sep 22, 2025", followUps:3, notes:"Cleared after 14-day protocol" },
  ]);

  return (
    <div className="p-6 space-y-3">
      {items.map(it => (
        <Card key={it.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--bad-wash)] flex items-center justify-center shrink-0">
              <Icon.AlertTri width={18} height={18} className="text-[var(--bad)]"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Avatar name={it.name} size={22}/>
                <div className="text-[13.5px] font-semibold">{it.name}</div>
                <span className="text-[11.5px] text-[var(--mute)]">{it.sid}</span>
                <Chip tone={SEVERITY_TONE[it.severity]}>{it.severity}</Chip>
                <Chip tone={STATUS_TONE[it.status]}>{it.status}</Chip>
              </div>
              <div className="mt-1.5 text-[13px] font-medium">{it.injury}</div>
              <div className="text-[11.5px] text-[var(--mute)] mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Icon.Pin width={11} height={11}/>{it.activity}</span>
                <span className="flex items-center gap-1"><Icon.Cal width={11} height={11}/>Reported {it.reported}</span>
                <span className="flex items-center gap-1"><Icon.Clock width={11} height={11}/>{it.followUps} follow-up{it.followUps!==1?"s":""}</span>
              </div>
              <div className="mt-2 text-[12px] text-[var(--ink-2)]">{it.notes}</div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <Btn variant="outline" size="sm" icon={Icon.Plus}>Follow-up</Btn>
              {it.status !== "Closed" && <Btn variant="ghost" size="sm" icon={Icon.CheckCircle}>Mark closed</Btn>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ============================================================ Appointments */
const AppointmentsTab = () => {
  const [view, setView] = React.useState("upcoming");
  const APPTS = [
    { name:"Khalid Al-Falasi",  sid:"20250612", date:"Today",      time:"4:00 PM",  doctor:"Dr. Khaled", reason:"Pre-tournament check",     status:"Confirmed" },
    { name:"Noor Al-Hashimi",   sid:"20250341", date:"Tomorrow",   time:"10:30 AM", doctor:"Dr. Hala",   reason:"Allergy follow-up",        status:"Confirmed" },
    { name:"Hassan Qureshi",    sid:"20250288", date:"Tomorrow",   time:"2:15 PM",  doctor:"Dr. Khaled", reason:"Ankle injury follow-up",   status:"Confirmed" },
    { name:"Omar Al-Mansoori",  sid:"20250122", date:"Oct 30",     time:"11:00 AM", doctor:"Dr. Khaled", reason:"MRI results review",       status:"Pending"   },
    { name:"Sara Al-Shamsi",    sid:"20250488", date:"Oct 31",     time:"9:30 AM",  doctor:"Dr. Hala",   reason:"Annual check-up",          status:"Confirmed" },
    { name:"Aisha Farhat",      sid:"20250155", date:"Nov 2",      time:"3:00 PM",  doctor:"Dr. Hala",   reason:"Vaccination · flu shot",   status:"Confirmed" },
    { name:"Tariq Mansour",     sid:"20250199", date:"Nov 4",      time:"1:00 PM",  doctor:"Dr. Khaled", reason:"Sports physical exam",     status:"Confirmed" },
    { name:"Layla Ibrahim",     sid:"20250377", date:"Nov 5",      time:"10:15 AM", doctor:"Dr. Hala",   reason:"Wrist follow-up",          status:"Confirmed" },
  ];
  const PAST = [
    { name:"Maria Costa",  sid:"20250507", date:"Sep 30",  time:"2:00 PM", doctor:"Dr. Hala",   reason:"Cut on hand", status:"Completed" },
    { name:"Yousef A.",    sid:"20250266", date:"Sep 22",  time:"4:30 PM", doctor:"Dr. Khaled", reason:"Concussion check", status:"Completed" },
  ];
  const list = view === "upcoming" ? APPTS : PAST;
  const STATUS_TONE = { Confirmed:"green", Pending:"amber", Completed:"slate", Cancelled:"red" };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <Segmented size="sm" value={view} onChange={setView} items={[{value:"upcoming",label:`Upcoming · ${APPTS.length}`},{value:"past",label:`Past · ${PAST.length}`}]}/>
        <span className="text-[11.5px] text-[var(--mute)] ml-auto">Both clinic doctors available · 2 rooms</span>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
              <th>Patient</th><th>Date</th><th>Time</th><th>Doctor</th><th>Reason</th><th>Status</th><th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((a,i) => (
              <tr key={i} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                <td className="px-4 py-2"><div className="flex items-center gap-2"><Avatar name={a.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{a.name}</div><div className="text-[11px] text-[var(--mute)]">{a.sid}</div></div></div></td>
                <td className="px-4 py-2 font-medium">{a.date}</td>
                <td className="px-4 py-2 font-mono text-[var(--mute)]">{a.time}</td>
                <td className="px-4 py-2 text-[var(--mute)]">{a.doctor}</td>
                <td className="px-4 py-2">{a.reason}</td>
                <td className="px-4 py-2"><Chip tone={STATUS_TONE[a.status]}>{a.status}</Chip></td>
                <td className="px-4 py-2 text-right">
                  {view==="upcoming" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="text-[11.5px] text-[var(--accent)] hover:underline">Reschedule</button>
                      <span className="text-[var(--mute-2)]">·</span>
                      <button className="text-[11.5px] text-[var(--bad)] hover:underline">Cancel</button>
                    </div>
                  ) : <button className="text-[11.5px] text-[var(--accent)] hover:underline">View notes</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ============================================================ Records */
const RecordsTab = () => {
  const [sel, setSel] = React.useState(0);
  const [q, setQ] = React.useState("");

  const RECORDS = SAMA.PEOPLE.slice(0, 10).map((p,i) => ({
    ...p,
    bloodType:    ["O+","A-","B+","O+","AB+","A+","O-","B-","A+","O+"][i],
    allergies:    [["Pollen","Peanuts"],["Penicillin"],[],["Dust"],["Bee stings","Shellfish"],[],["Latex"],[],["Aspirin"],[]][i],
    conditions:   [[],["Asthma · mild"],[],[],["Type 1 Diabetes"],[],[],["Migraine"],[],[]][i],
    medications:  [[],["Salbutamol inhaler"],[],[],["Insulin"],[],[],["Sumatriptan as needed"],[],[]][i],
    emergency:    [["Mariam Al-Nuaimi (mother)","+971 50 123 4567"],["Salim Qureshi (father)","+971 55 432 1098"],["Fatima Khalil (sister)","+971 50 555 8821"],["Ali Mansour (brother)","+971 56 778 9900"],["Hala Ibrahim (mother)","+971 50 234 5678"],["Khalid Al-Mansoori (father)","+971 55 677 8899"],["Amal Al-Shamsi (sister)","+971 50 333 4455"],["Mohammed A. (father)","+971 56 121 2323"],["Reem Farhat (mother)","+971 55 343 4545"],["Saeed Al-Falasi (father)","+971 50 565 6767"]][i],
    clearance:    ["Active","Active","Expired","Active","Active","Pending","Active","Active","Active","Active"][i],
    clearanceExp: ["Apr 2026","Jun 2026","Mar 2025","May 2026","Jul 2026","—","Aug 2026","May 2026","Jun 2026","Sep 2026"][i],
    lastVisit:    ["Today","Today","Sep 30, 2025","—","Today","Sep 22, 2025","Oct 11, 2025","Today","—","Today"][i],
  }));

  const filtered = RECORDS.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.sid?.includes(q));
  const r = filtered[sel] || filtered[0] || RECORDS[0];

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
              {person.clearance === "Active" ? <Icon.CheckCircle width={13} height={13} className="text-[var(--ok)]"/>
                : person.clearance === "Expired" ? <Icon.AlertTri width={13} height={13} className="text-[var(--bad)]"/>
                : <Icon.Clock width={13} height={13} className="text-[var(--warn)]"/>}
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
                <div className="text-[18px] font-semibold tracking-tight">{r.name}</div>
                <div className="text-[12px] text-[var(--mute)]">{r.sid} · {r.dept} · {r.email}</div>
              </div>
              <div className="flex gap-2">
                <Btn variant="outline" size="sm" icon={Icon.Doc}>Visit history</Btn>
                <Btn variant="default" size="sm" icon={Icon.Edit}>Edit record</Btn>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Stat label="Blood type" value={r.bloodType}/>
              <Stat label="Last visit" value={r.lastVisit || "—"}/>
              <Stat label="Allergies" value={r.allergies.length}/>
              <Stat label="Medical clearance" value={r.clearance} hint={r.clearanceExp !== "—" ? `expires ${r.clearanceExp}`:"renewal needed"}/>
            </div>

            {r.clearance === "Expired" && (
              <div className="p-3 rounded-[10px] bg-[var(--bad-wash)] border border-[var(--bad)]/20 flex items-center gap-3">
                <Icon.AlertTri width={16} height={16} className="text-[var(--bad)]"/>
                <div className="text-[12px] text-[var(--ink-2)] flex-1"><b>Clearance expired.</b> Student is not cleared for sports activities until renewal.</div>
                <Btn variant="default" size="sm">Issue clearance</Btn>
              </div>
            )}

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Allergies</div>
              {r.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{r.allergies.map(a => <Chip key={a} tone="red">⚠ {a}</Chip>)}</div>
              ) : <div className="text-[12px] text-[var(--mute)]">None recorded.</div>}
            </Card>

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Conditions</div>
              {r.conditions.length > 0 ? (
                <div className="space-y-1.5">{r.conditions.map(c => <div key={c} className="flex items-center gap-2 text-[12.5px]"><Icon.Heart width={12} height={12} className="text-[var(--bad)]"/>{c}</div>)}</div>
              ) : <div className="text-[12px] text-[var(--mute)]">None recorded.</div>}
            </Card>

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Current medications</div>
              {r.medications.length > 0 ? (
                <div className="space-y-1.5">{r.medications.map(m => <div key={m} className="text-[12.5px]">• {m}</div>)}</div>
              ) : <div className="text-[12px] text-[var(--mute)]">None recorded.</div>}
            </Card>

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Emergency contact</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-wash)] flex items-center justify-center"><Icon.User width={16} height={16} className="text-[var(--accent)]"/></div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{r.emergency[0]}</div>
                  <div className="text-[11.5px] text-[var(--mute)] font-mono">{r.emergency[1]}</div>
                </div>
                <Btn variant="outline" size="sm" icon={Icon.Send}>Call</Btn>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

window.Health = Health;
