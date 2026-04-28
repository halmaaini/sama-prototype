/* Consolidated modules: Transportation, Documents, Certificates, Feedback */

const Modules = () => {
  const { route } = useApp();
  if (route === "transport") return <Transport/>;
  if (route === "docs") return <Documents/>;
  if (route === "certs") return <Certificates/>;
  if (route === "feedback") return <Feedback/>;
  if (route === "venues") return <Venues/>;
  return null;
};

/* ============================================================ Transportation */
const Transport = () => {
  const routes = [
    { id:"R1", name:"Carnival Route A", activity:"Freshman Carnival", bus:"Bus 1", driver:"A. Siddiqui", seats:"42/45", depart:"Oct 22 · 4:15 PM", pickup:"Gate 3", dropoff:"Outdoor Plaza", status:"Confirmed" },
    { id:"R2", name:"Carnival Route B", activity:"Freshman Carnival", bus:"Bus 2", driver:"H. Patel",    seats:"38/45", depart:"Oct 22 · 4:25 PM", pickup:"Gate 3", dropoff:"Outdoor Plaza", status:"Confirmed" },
    { id:"R3", name:"Beach Cleanup",    activity:"Beach Cleanup",      bus:"Bus 3", driver:"Y. Kamal",    seats:"28/45", depart:"Nov 2 · 7:00 AM",  pickup:"Main Gate",  dropoff:"Corniche Beach", status:"Confirmed" },
    { id:"R4", name:"Museum Field Trip",activity:"Cultural Trip",      bus:"Bus 1", driver:"A. Siddiqui", seats:"30/45", depart:"Nov 8 · 9:00 AM",  pickup:"Gate 3", dropoff:"National Museum", status:"Draft" },
    { id:"R5", name:"Debate Trip · DXB",activity:"Debate Club",        bus:"Coach", driver:"External",    seats:"12/30", depart:"Nov 12 · 6:00 AM", pickup:"Gate 1", dropoff:"Dubai WTC", status:"Pending" },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Transportation</h1>
          <div className="text-[12px] text-[var(--mute)]">Buses, drivers, pickups · auto-matches to activities with off-campus venues.</div>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" icon={Icon.Download}>Driver roster</Btn>
          <Btn variant="default" size="sm" icon={Icon.Plus}>New route</Btn>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll p-6 grid grid-cols-[1fr,320px] gap-5">
        <div className="space-y-3">
          {routes.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-[9px] bg-[var(--accent-wash)] flex items-center justify-center shrink-0"><Icon.Bus width={20} height={20} className="text-[var(--accent)]"/></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><span className="text-[14px] font-semibold">{r.name}</span><StatusChip status={r.status}/></div>
                  <div className="text-[12px] text-[var(--mute)] flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1"><Icon.Sparkle width={11} height={11}/>{r.activity}</span>
                    <span className="flex items-center gap-1"><Icon.Cal width={11} height={11}/>{r.depart}</span>
                    <span className="flex items-center gap-1"><Icon.User width={11} height={11}/>{r.driver}</span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                    <div className="p-2 rounded-[7px] bg-[#fafafa]"><div className="text-[10.5px] text-[var(--mute)]">Pickup</div><div className="text-[12.5px] font-medium flex items-center gap-1.5"><Icon.Pin width={11} height={11}/>{r.pickup}</div></div>
                    <div className="text-[var(--mute-2)]"><Icon.ArrowRight width={18} height={18}/></div>
                    <div className="p-2 rounded-[7px] bg-[#fafafa]"><div className="text-[10.5px] text-[var(--mute)]">Drop-off</div><div className="text-[12.5px] font-medium flex items-center gap-1.5"><Icon.Pin width={11} height={11}/>{r.dropoff}</div></div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[var(--mute)]">Seats</div>
                  <div className="text-[18px] font-semibold font-mono">{r.seats}</div>
                  <Progress value={parseInt(r.seats)/45*100} className="mt-1 w-[90px]"/>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Fleet at a glance</div>
            {[["Bus 1 · 45 seats","In use · Oct 22"],["Bus 2 · 45 seats","In use · Oct 22"],["Bus 3 · 45 seats","Available"],["Minivan · 12 seats","Available"]].map(([t,s],i)=>(<div key={i} className="flex items-center gap-2.5 py-2 border-b hairline-2 last:border-0"><Icon.Bus width={14} height={14} className="text-[var(--mute)]"/><div className="flex-1"><div className="text-[12.5px] font-medium">{t}</div><div className="text-[10.5px] text-[var(--mute)]">{s}</div></div><span className={cx("w-2 h-2 rounded-full", s.startsWith("In use")?"bg-[var(--warn)]":"bg-[var(--ok)]")}/></div>))}
          </Card>
          <Card className="p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Next 7 days</div>
            <MiniBars/>
          </Card>
        </div>
      </div>
    </div>
  );
};

const MiniBars = () => (
  <div className="flex items-end gap-1.5 h-24">
    {[2,3,0,1,4,3,2].map((v,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-[3px] bg-[var(--accent)]" style={{height:`${v*20}px`, opacity: v===0?0.15:1}}/><div className="text-[10px] text-[var(--mute)] font-mono">{["M","T","W","T","F","S","S"][i]}</div></div>))}
  </div>
);

/* ============================================================ Documents */
const Documents = () => {
  const folders = [{n:"Event briefs",c:18},{n:"Risk assessments",c:24},{n:"Contracts",c:9},{n:"Certificates · templates",c:6},{n:"Permits",c:12},{n:"Images & media",c:148}];
  const files = Array.from({length:8}).map((_,i)=>({name:["Freshman Carnival brief.pdf","Risk assessment - Beach Cleanup.pdf","Speaker contract - Dr Al-Kindi.pdf","Cert template - bilingual.pdf","Venue permit - Conference B.pdf","Photo release form.pdf","Budget breakdown Q2.xlsx","Final agenda AI Workshop.docx"][i],size:["2.4 MB","1.1 MB","3.8 MB","812 KB","621 KB","484 KB","1.9 MB","288 KB"][i],ago:["2d","5d","1w","3w","1mo","1mo","2mo","2mo"][i],tag:["Brief","Risk","Contract","Template","Permit","Form","Finance","Agenda"][i]}));
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold tracking-tight">Documents</h1><div className="text-[12px] text-[var(--mute)]">Templates, briefs, permits — versioned and linked to activities.</div></div>
        <div className="flex items-center gap-2"><Input icon={Icon.Search} placeholder="Search files…" size="sm" className="w-[240px]"/><Btn variant="default" size="sm" icon={Icon.Upload}>Upload</Btn></div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll p-6">
        <div className="grid grid-cols-6 gap-3 mb-5">
          {folders.map(f => (<Card key={f.n} className="p-4 hover:shadow-soft cursor-pointer transition-shadow"><div className="w-9 h-9 rounded-[7px] bg-[var(--accent-wash)] flex items-center justify-center mb-2"><Icon.Layers width={16} height={16} className="text-[var(--accent)]"/></div><div className="text-[12.5px] font-semibold truncate">{f.n}</div><div className="text-[11px] text-[var(--mute)]">{f.c} files</div></Card>))}
        </div>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Recent</div>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]"><tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium"><th>Name</th><th className="w-[120px]">Tag</th><th className="w-[100px]">Size</th><th className="w-[120px]">Modified</th><th className="w-[140px]">Linked to</th><th className="w-8"></th></tr></thead>
            <tbody>{files.map((f,i)=>(<tr key={i} className="border-b hairline-2 hover:bg-[#fafafa]"><td className="px-3 py-2"><div className="flex items-center gap-2"><Icon.Doc width={14} height={14} className="text-[var(--accent)]"/><span className="font-medium">{f.name}</span></div></td><td className="px-3 py-2"><Chip tone="slate">{f.tag}</Chip></td><td className="px-3 py-2 text-[var(--mute)] font-mono text-[11px]">{f.size}</td><td className="px-3 py-2 text-[var(--mute)]">{f.ago} ago</td><td className="px-3 py-2 text-[11.5px] text-[var(--mute)] truncate">{SAMA.ACTIVITIES[i%6].title}</td><td className="px-3 py-2"><button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={13} height={13}/></button></td></tr>))}</tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

/* ============================================================ Certificates */
const Certificates = () => {
  const certs = SAMA.PEOPLE.slice(0,8).map((p,i)=>({p,kind:["Attendance","Volunteer · 6hrs","Leadership","Attendance","Volunteer · 12hrs","Attendance","Achievement","Attendance"][i],act:SAMA.ACTIVITIES[i%6].title,issued:`Oct ${10+i%20}, 2025`,verified:true,serial:`SAMA-25-${(3400+i).toString().padStart(4,"0")}`}));
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold tracking-tight">Certificates</h1><div className="text-[12px] text-[var(--mute)]">Bilingual templates · auto-issued on eligibility · verifiable via QR.</div></div>
        <div className="flex items-center gap-2"><Btn variant="outline" size="sm" icon={Icon.Edit}>Templates</Btn><Btn variant="default" size="sm" icon={Icon.Plus}>Issue certificate</Btn></div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll p-6 grid grid-cols-[1fr,380px] gap-5">
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Stat label="Issued this term" value="184"/>
            <Stat label="Auto-issued" value="162" hint="88%"/>
            <Stat label="Pending review" value="12" hint="manual approval"/>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]"><tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium"><th>Student</th><th>Certificate</th><th>Activity</th><th>Issued</th><th>Serial</th><th></th></tr></thead>
              <tbody>{certs.map((c,i)=>(<tr key={i} className="border-b hairline-2 hover:bg-[#fafafa]"><td className="px-3 py-2"><div className="flex items-center gap-2"><Avatar name={c.p.name} size={22}/><div><div className="font-medium">{c.p.name}</div><div className="text-[11px] text-[var(--mute)]">{c.p.sid}</div></div></div></td><td className="px-3 py-2"><Chip tone="indigo">{c.kind}</Chip></td><td className="px-3 py-2 text-[var(--mute)] truncate">{c.act}</td><td className="px-3 py-2 text-[var(--mute)] font-mono text-[11px]">{c.issued}</td><td className="px-3 py-2 font-mono text-[10.5px] text-[var(--mute)]">{c.serial}</td><td className="px-3 py-2"><span className="chip bg-[var(--ok-wash)] text-[var(--ok)]"><Icon.Shield width={10} height={10}/>verified</span></td></tr>))}</tbody>
            </table>
          </Card>
        </div>
        <CertPreview/>
      </div>
    </div>
  );
};

const CertPreview = () => (
  <div className="sticky top-0">
    <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Template preview</div>
    <div className="aspect-[1.414/1] bg-gradient-to-br from-white to-[#fafaf5] border-2 hairline rounded-[12px] p-6 relative overflow-hidden shadow-soft">
      <div className="absolute top-3 right-3 w-9 h-9 rounded-full border-2 border-[var(--accent)] flex items-center justify-center"><div className="w-5 h-5 rounded-full bg-[var(--accent)]"/></div>
      <div className="text-[9px] uppercase tracking-[0.28em] text-[var(--mute)] font-semibold">Certificate of Participation</div>
      <div className="font-serif text-[30px] leading-none mt-3">Certified that</div>
      <div className="text-[18px] font-semibold tracking-tight mt-2 border-b hairline pb-1">Fatima Al-Nuaimi</div>
      <div className="text-[11px] text-[var(--mute)] mt-2 leading-relaxed">has successfully attended and contributed to</div>
      <div className="font-serif text-[20px] mt-1">AI Ethics Workshop</div>
      <div className="text-[10px] text-[var(--mute)] mt-3">Awarded 22 October 2025 · Vice President of Student Affairs</div>
      <div className="absolute bottom-4 right-4 w-14 h-14 bg-white border hairline rounded-[6px] p-1"><QRVisual/></div>
      <div className="absolute bottom-4 left-4 text-[8px] font-mono text-[var(--mute)]">SERIAL · SAMA-25-3407<br/>verify.sama.edu/3407</div>
    </div>
    <div className="flex gap-2 mt-3"><Btn variant="outline" size="sm" icon={Icon.Edit} className="flex-1">Edit template</Btn><Btn variant="outline" size="sm" icon={Icon.Download} className="flex-1">Export PDF</Btn></div>
  </div>
);

/* ============================================================ Feedback */
const Feedback = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold tracking-tight">Feedback</h1><div className="text-[12px] text-[var(--mute)]">Surveys, response rates, and sentiment across every activity.</div></div>
        <Btn variant="default" size="sm" icon={Icon.Plus}>New survey</Btn>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll p-6">
        <div className="grid grid-cols-4 gap-3 mb-5">
          <Stat label="Avg rating" value="4.5" hint="across 2,318 responses"/>
          <Stat label="Response rate" value="64%" hint="↑ 8 pp vs last term"/>
          <Stat label="NPS" value="+48" hint="Promoters 62%"/>
          <Stat label="Open surveys" value="18"/>
        </div>
        <Card className="p-0 overflow-hidden mb-5">
          <div className="px-4 py-3 border-b hairline-2 flex items-center justify-between"><div className="text-[13.5px] font-semibold">Recent surveys</div><Btn variant="ghost" size="sm">View all</Btn></div>
          <table className="w-full text-[12.5px]"><thead className="bg-[#fafafa] text-left text-[var(--mute)]"><tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium"><th>Activity</th><th>Responses</th><th>Rating</th><th>Response rate</th><th>Sentiment</th><th>Status</th></tr></thead>
            <tbody>{[["AI Ethics Workshop",34,4.6,"72%","positive","Closed"],["Freshman Carnival",142,4.8,"68%","positive","Open"],["Beach Cleanup",28,4.3,"80%","neutral","Closed"],["Men's Football 24/25",22,4.1,"55%","neutral","Open"]].map((r,i)=>(<tr key={i} className="border-b hairline-2 hover:bg-[#fafafa]"><td className="px-3 py-2 font-medium">{r[0]}</td><td className="px-3 py-2 font-mono text-[11px]">{r[1]}</td><td className="px-3 py-2"><div className="flex items-center gap-1.5"><span className="font-semibold">{r[2]}</span><div className="flex gap-0.5">{Array.from({length:5}).map((_,j)=><Icon.Star key={j} width={10} height={10} className={j<Math.floor(r[2])?"text-[var(--amber)]":"text-[var(--line)]"}/>)}</div></div></td><td className="px-3 py-2"><div className="flex items-center gap-2 w-[120px]"><Progress value={parseInt(r[3])} color={parseInt(r[3])>65?"var(--ok)":"var(--warn)"}/><span className="text-[11px] font-mono text-[var(--mute)]">{r[3]}</span></div></td><td className="px-3 py-2"><Chip tone={r[4]==="positive"?"green":"slate"}>{r[4]}</Chip></td><td className="px-3 py-2"><StatusChip status={r[5]==="Open"?"Active":"Completed"}/></td></tr>))}</tbody></table>
        </Card>
        <div className="grid grid-cols-2 gap-5">
          <Card className="p-4"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Rating distribution · all activities</div><div className="space-y-2">{[[5,68],[4,22],[3,6],[2,2],[1,2]].map(([s,p])=>(<div key={s} className="flex items-center gap-3"><div className="w-10 flex gap-0.5">{Array.from({length:s}).map((_,i)=><Icon.Star key={i} width={10} height={10} className="text-[var(--amber)]"/>)}</div><div className="flex-1"><Progress value={p} color="var(--amber)"/></div><div className="w-10 text-[11px] font-mono text-right">{p}%</div></div>))}</div></Card>
          <Card className="p-4"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Top mentioned themes</div><div className="flex flex-wrap gap-1.5">{[["speaker",48],["venue",34],["food",28],["timing",22],["AV setup",18],["registration",14],["engagement",42],["organisation",38],["parking",12]].map(([t,n])=><span key={t} className="px-2 py-1 rounded-full bg-[#f1f2ef] text-[12px]" style={{fontSize:`${10+n/4}px`}}>{t} <span className="text-[var(--mute-2)] font-mono text-[10px]">{n}</span></span>)}</div><div className="mt-4 text-[11.5px] text-[var(--mute)] italic border-l-2 border-[var(--line)] pl-3">"The speaker was fantastic and answered every question. Venue was a little cold though."</div></Card>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ Venues */
const Venues = () => (
  <div className="flex flex-col h-full">
    <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
      <div><h1 className="text-[20px] font-semibold tracking-tight">Venues</h1><div className="text-[12px] text-[var(--mute)]">On- and off-campus spaces · live availability.</div></div>
      <Btn variant="default" size="sm" icon={Icon.Plus}>New venue</Btn>
    </div>
    <div className="flex-1 overflow-y-auto thin-scroll p-6 grid grid-cols-3 gap-4">
      {SAMA.VENUES.map(v => (
        <Card key={v.id} className="overflow-hidden">
          <div className="h-28 stripe-placeholder relative flex items-center justify-center"><Icon.Pin width={28} height={28} className="text-[var(--mute-2)]"/><Chip tone={v.available?"green":"amber"} className="absolute top-2 right-2">{v.available?"Available":"Booked today"}</Chip></div>
          <div className="p-3.5">
            <div className="text-[14px] font-semibold">{v.name}</div>
            <div className="text-[11.5px] text-[var(--mute)]">{v.kind} · Capacity {v.capacity}</div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">{v.features.map(f => <span key={f} className="chip bg-[#f1f2ef]">{f}</span>)}</div>
            <div className="mt-3 flex gap-2"><Btn variant="outline" size="sm" className="flex-1">Book</Btn><Btn variant="ghost" size="sm" icon={Icon.Cal}/></div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

window.Modules = Modules;
