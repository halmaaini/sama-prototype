/* Student portal — web experience */

const Student = () => (
  <div className="h-full flex flex-col">
    <div className="px-6 py-4 border-b hairline bg-[var(--surface)]">
      <h1 className="text-[20px] font-semibold tracking-tight">Student portal · Preview</h1>
      <div className="text-[12px] text-[var(--mute)]">What students see when they sign in to SAMA.</div>
    </div>
    <div className="flex-1 overflow-y-auto thin-scroll bg-[#e8eaef] grid-lines p-8 flex items-start justify-center">
      <WebPortal/>
    </div>
  </div>
);

const WebPortal = () => {
  const [page, setPage] = React.useState("home");
  const tabs = [["home","Home"],["explore","Explore"],["my","My activities"],["volunteering","Volunteering"],["certs","Certificates"]];
  return (
    <div className="w-[960px] rounded-[14px] overflow-hidden border hairline shadow-float bg-white shrink-0">
      <div className="h-10 bg-[var(--ink)] flex items-center gap-3 px-4 text-white">
        <LogoMark/><span className="text-[13px] font-semibold">SAMA Student Portal</span>
        <nav className="ml-6 flex gap-4 text-[11.5px]">
          {tabs.map(([id,label]) => (
            <button key={id} onClick={() => setPage(id)} className={cx("transition-colors", page===id?"text-white":"text-white/55 hover:text-white/80")}>{label}</button>
          ))}
        </nav>
        <span className="flex-1"/><Icon.Bell width={13} height={13}/><Avatar name="Fatima Al-Nuaimi" size={22}/>
      </div>
      <div className="bg-[#fafafa] min-h-[540px]">
        {page === "home"         && <WebHome/>}
        {page === "explore"      && <WebExplore/>}
        {page === "my"           && <WebMyActivities/>}
        {page === "volunteering" && <WebVolunteering/>}
        {page === "certs"        && <WebCertificates/>}
      </div>
    </div>
  );
};

const WebHome = () => (
  <div className="p-6 grid grid-cols-[2fr,1fr] gap-5">
    <div>
      <div className="text-[11px] text-[var(--mute)] uppercase tracking-wider">Featured this week</div>
      <div className="mt-1 rounded-[12px] overflow-hidden bg-white border hairline shadow-soft">
        <BannerVisual kind="academic" className="h-[200px] relative flex items-end">
          <div className="absolute inset-x-0 bottom-0 p-5 text-white bg-gradient-to-t from-black/50 to-transparent">
            <TypeChip type="Event"/>
            <div className="text-[26px] font-semibold tracking-tight mt-2">AI Ethics Workshop</div>
            <div className="text-[12.5px] opacity-90">Oct 22 · 5 PM · Conference Hall B · Dr. Al-Kindi</div>
          </div>
        </BannerVisual>
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center gap-2"><AvatarStack people={SAMA.PEOPLE.slice(0,4)} size={22}/><span className="text-[12px] text-[var(--mute)]">47 going · 24% capacity left</span></div>
          <button className="h-9 px-4 rounded-[8px] bg-[var(--ink)] text-white text-[12.5px] font-semibold">Register — Free</button>
        </div>
      </div>
      <div className="text-[11px] text-[var(--mute)] uppercase tracking-wider mt-5 mb-2">Also happening</div>
      <div className="grid grid-cols-2 gap-3">
        {SAMA.ACTIVITIES.slice(1,5).map(a => (
          <div key={a.id} className="bg-white border hairline rounded-[10px] overflow-hidden cursor-pointer hover:border-[var(--mute-2)] transition-colors">
            <BannerVisual kind={a.type==="Volunteering"?"community":a.type==="Program"?"sports":"academic"} className="h-[100px] relative">
              <div className="absolute top-2 left-2"><TypeChip type={a.type}/></div>
            </BannerVisual>
            <div className="p-3"><div className="text-[13px] font-semibold truncate">{a.title}</div><div className="text-[11px] text-[var(--mute)] mt-0.5 flex items-center gap-1"><Icon.Cal width={10} height={10}/>{a.date}</div></div>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <div className="bg-white border hairline rounded-[12px] p-4">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Your term</div>
        <div className="grid grid-cols-3 text-center gap-2">
          <div><div className="text-[22px] font-semibold">11</div><div className="text-[10px] text-[var(--mute)]">Attended</div></div>
          <div><div className="text-[22px] font-semibold">14</div><div className="text-[10px] text-[var(--mute)]">Volunteer hrs</div></div>
          <div><div className="text-[22px] font-semibold">3</div><div className="text-[10px] text-[var(--mute)]">Certificates</div></div>
        </div>
      </div>
      <div className="bg-white border hairline rounded-[12px] p-4">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">My upcoming</div>
        {[["AI Ethics Workshop","Oct 22","Confirmed"],["Beach Cleanup","Nov 2","Confirmed"],["Career Fair","Nov 18","Waitlist"]].map(([t,d,s],i) => (
          <div key={i} className="py-2 border-b hairline-2 last:border-0 flex items-center gap-2">
            <div className="text-[12.5px] font-medium flex-1 truncate">{t}</div>
            <span className="text-[11px] text-[var(--mute)] font-mono">{d}</span>
            <Chip tone={s==="Confirmed"?"green":"amber"}>{s}</Chip>
          </div>
        ))}
      </div>
      <div className="bg-[var(--ink)] text-white rounded-[12px] p-4 relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-wider font-semibold opacity-70">Latest cert</div>
        <div className="text-[16px] font-semibold mt-1">Leadership in Action</div>
        <div className="text-[11px] opacity-70 mt-0.5">Apr 2025 · Verified · SAMA-25-2914</div>
        <Icon.Medal width={48} height={48} className="absolute -right-2 -bottom-2 opacity-10"/>
      </div>
    </div>
  </div>
);

const WebExplore = () => {
  const [filter, setFilter] = React.useState("All");
  const types = ["All","Event","Volunteering","Program","External"];
  const filtered = filter === "All" ? SAMA.ACTIVITIES : SAMA.ACTIVITIES.filter(a => a.type === filter);
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Input icon={Icon.Search} placeholder="Search activities…" className="w-[280px]" size="sm"/>
        <div className="flex gap-1.5">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={cx("px-3 h-7 rounded-full text-[11.5px] font-medium border transition-colors", filter===t?"bg-[var(--ink)] text-white border-[var(--ink)]":"border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]")}>{t}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-white border hairline rounded-[10px] overflow-hidden hover:border-[var(--mute-2)] cursor-pointer transition-colors">
            <BannerVisual kind={a.type==="Volunteering"?"community":a.type==="Program"?"sports":"academic"} className="h-[90px] relative">
              <div className="absolute top-2 left-2"><TypeChip type={a.type}/></div>
            </BannerVisual>
            <div className="p-3">
              <div className="text-[13px] font-semibold truncate">{a.title}</div>
              <div className="text-[11px] text-[var(--mute)] mt-0.5 flex items-center gap-1"><Icon.Cal width={10} height={10}/>{a.date}</div>
              <div className="mt-2 flex items-center justify-between">
                {a.capacity && <span className="text-[10.5px] text-[var(--mute)]">{a.registered}/{a.capacity} going</span>}
                <button className="text-[11.5px] text-[var(--accent)] font-medium ml-auto">Register →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WebMyActivities = () => {
  const rows = [
    ...SAMA.ACTIVITIES.slice(0,2).map(a => ({...a, myStatus:"Confirmed", hours:null, cert:false})),
    {...SAMA.ACTIVITIES[2], myStatus:"Waitlist · #3", hours:null, cert:false},
    ...SAMA.ACTIVITIES.slice(3,8).map((a,i) => ({...a, myStatus:"Completed", hours:i%2===0?4:null, cert:i%3===0})),
  ];
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13.5px] font-semibold">My activities · Fall 2025–26</div>
        <Btn variant="outline" size="sm" icon={Icon.Download}>Export transcript</Btn>
      </div>
      <div className="bg-white border hairline rounded-[12px] overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
            <tr className="[&>th]:px-4 [&>th]:py-2.5 [&>th]:font-medium">
              <th>Activity</th><th>Type</th><th>Date</th><th>Status</th><th>Hours</th><th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a,i) => (
              <tr key={i} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                <td className="px-4 py-2.5 font-medium">{a.title}</td>
                <td className="px-4 py-2.5"><TypeChip type={a.type}/></td>
                <td className="px-4 py-2.5 text-[var(--mute)] font-mono text-[11.5px]">{a.date}</td>
                <td className="px-4 py-2.5"><Chip tone={a.myStatus==="Confirmed"?"green":a.myStatus.startsWith("Waitlist")?"amber":"slate"}>{a.myStatus}</Chip></td>
                <td className="px-4 py-2.5 text-[var(--mute)]">{a.hours ? `${a.hours}h` : "—"}</td>
                <td className="px-4 py-2.5">{a.cert ? <button className="text-[11.5px] text-[var(--accent)] flex items-center gap-1 hover:underline"><Icon.Download width={11} height={11}/>Download</button> : <span className="text-[var(--mute-2)]">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WebVolunteering = () => {
  const opps = SAMA.ACTIVITIES.filter(a => a.type === "Volunteering").slice(0,4);
  return (
    <div className="p-6">
      <div className="text-[13.5px] font-semibold mb-4">Volunteering</div>
      <div className="grid grid-cols-[1fr,260px] gap-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Open opportunities</div>
          <div className="space-y-3">
            {opps.length > 0 ? opps.map(a => (
              <div key={a.id} className="bg-white border hairline rounded-[10px] p-4 flex items-center gap-4 hover:border-[var(--mute-2)] cursor-pointer transition-colors">
                <div className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0" style={{background:SAMA.TYPE_META.Volunteering.wash, color:SAMA.TYPE_META.Volunteering.ink}}><Icon.Heart width={18} height={18}/></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{a.title}</div>
                  <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{a.date} · {a.targetHours || 4} hours · Certificate eligible</div>
                </div>
                <button className="h-8 px-3 rounded-[8px] bg-[var(--ink)] text-white text-[11.5px] font-medium shrink-0">Apply</button>
              </div>
            )) : <div className="text-[12px] text-[var(--mute)]">No open opportunities right now.</div>}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border hairline rounded-[12px] p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">My volunteer hours</div>
            <div className="text-[32px] font-semibold tracking-tight">14h</div>
            <div className="text-[11.5px] text-[var(--mute)]">Fall 2025–26 · all time: 38h</div>
            <Progress value={56} color="var(--ok)" className="mt-3"/>
            <div className="text-[11px] text-[var(--mute)] mt-1">56% toward 25h semester goal</div>
          </div>
          <div className="bg-white border hairline rounded-[12px] p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Recent</div>
            {[["Beach Cleanup","4h","Nov 2024"],["Campus Fair","3h","Oct 2024"],["Red Crescent","7h","Sep 2024"]].map(([t,h,d],i) => (
              <div key={i} className="py-2 border-b hairline-2 last:border-0 flex items-center gap-2">
                <div className="flex-1 text-[12px] font-medium truncate">{t}</div>
                <span className="text-[11px] font-mono text-[var(--ok)]">{h}</span>
                <span className="text-[11px] text-[var(--mute)]">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WebCertificates = () => (
  <div className="p-6">
    <div className="text-[13.5px] font-semibold mb-4">My certificates · 3 issued</div>
    <div className="grid grid-cols-3 gap-4">
      {[["Leadership in Action","Apr 2025","Achievement","SAMA-25-2914"],
        ["Beach Cleanup","Nov 2024","Volunteering Hours","SAMA-24-1832"],
        ["Career Fair 2024","Oct 2024","Attendance","SAMA-24-0741"]].map(([title,date,type,code],i) => (
        <div key={i} className="bg-white border hairline rounded-[12px] overflow-hidden shadow-soft">
          <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] via-[var(--teal)] to-[var(--accent)]"/>
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-wash)] flex items-center justify-center mx-auto mb-3"><Icon.Medal width={22} height={22} className="text-[var(--accent)]"/></div>
            <div className="text-[13px] font-semibold">{title}</div>
            <div className="text-[11px] text-[var(--mute)] mt-1">{type}</div>
            <div className="text-[10.5px] text-[var(--mute-2)] mt-0.5">{date}</div>
            <div className="mt-3 pt-3 border-t hairline-2 font-mono text-[9.5px] text-[var(--mute-2)]">{code}</div>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <button className="flex-1 h-8 rounded-[7px] border hairline text-[11.5px] flex items-center justify-center gap-1.5 hover:bg-[#fafafa]"><Icon.Download width={12} height={12}/>Download PDF</button>
            <button className="h-8 px-3 rounded-[7px] border hairline text-[11.5px] flex items-center justify-center hover:bg-[#fafafa]"><Icon.Share width={12} height={12}/></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

window.Student = Student;
