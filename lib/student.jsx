/* Student portal — mobile + web experience */

const Student = () => {
  const [view, setView] = React.useState("mobile"); // mobile | web
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold tracking-tight">Student portal · Preview</h1><div className="text-[12px] text-[var(--mute)]">What students see when they open SAMA on phone or desktop.</div></div>
        <Segmented size="sm" value={view} onChange={setView} items={[{value:"mobile",label:"Mobile app"},{value:"web",label:"Web portal"}]}/>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll bg-[#e8eaef] grid-lines p-8 flex items-start justify-center gap-8">
        {view==="mobile" ? <><Phone kind="home"/><Phone kind="detail"/><Phone kind="ticket"/></> : <WebPortal/>}
      </div>
    </div>
  );
};

const Phone = ({ kind }) => (
  <div className="w-[320px] h-[660px] bg-black rounded-[40px] p-2 shadow-float shrink-0">
    <div className="w-full h-full bg-[#f7f7f5] rounded-[34px] overflow-hidden relative">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10"/>
      <div className="h-8 flex items-center justify-between px-5 pt-2 text-[11px] font-semibold">
        <span>9:41</span><span className="flex gap-1 items-center"><Icon.Wifi width={11} height={11}/><Icon.Battery width={14} height={11}/></span>
      </div>
      {kind==="home" && <PhoneHome/>}
      {kind==="detail" && <PhoneDetail/>}
      {kind==="ticket" && <PhoneTicket/>}
      <div className="absolute bottom-0 inset-x-0 h-14 border-t hairline bg-white flex items-center justify-around px-4">
        {[["Home","Gauge",true],["Explore","Search"],["Tickets","Qr"],["Hours","Medal"],["Profile","User"]].map(([l,i,a],j)=>{const I=Icon[i];return <button key={j} className={cx("flex flex-col items-center gap-0.5", a?"text-[var(--ink)]":"text-[var(--mute-2)]")}><I width={16} height={16}/><span className="text-[9px]">{l}</span></button>})}
      </div>
    </div>
  </div>
);

const PhoneHome = () => (
  <div className="h-[calc(100%-88px)] overflow-y-auto no-scroll">
    <div className="px-5 pt-3 pb-2">
      <div className="text-[11px] text-[var(--mute)]">Wednesday · Oct 15</div>
      <div className="text-[22px] font-semibold tracking-tight">Hey Fatima</div>
      <div className="text-[11.5px] text-[var(--mute)] mt-0.5">You have 2 activities this week, 14 volunteer hours this term.</div>
    </div>
    <div className="px-5 mt-2 flex gap-2 overflow-x-auto no-scroll">
      {[["Near you","Pin","var(--accent)"],["For you","Sparkle","var(--teal)"],["Community","Heart","var(--rose)"],["Career","Rocket","var(--amber)"]].map(([l,i,c],j)=>{const I=Icon[i];return <button key={j} className="shrink-0 px-3 h-8 rounded-full bg-white border hairline flex items-center gap-1.5 text-[11.5px] font-medium"><I width={12} height={12} style={{color:c}}/>{l}</button>})}
    </div>
    <div className="px-5 mt-4">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Upcoming for you</div>
      <div className="rounded-[14px] overflow-hidden bg-white border hairline shadow-soft">
        <BannerVisual kind="academic" className="h-24"/>
        <div className="p-3">
          <TypeChip type="Event"/>
          <div className="text-[14px] font-semibold mt-1.5">AI Ethics Workshop</div>
          <div className="text-[11px] text-[var(--mute)] mt-1 space-y-0.5"><div className="flex items-center gap-1"><Icon.Cal width={10} height={10}/>Oct 22 · 5:00 PM</div><div className="flex items-center gap-1"><Icon.Pin width={10} height={10}/>Conference Hall B</div></div>
          <div className="mt-2 flex items-center gap-1.5"><AvatarStack people={SAMA.PEOPLE.slice(0,3)} size={16}/><span className="text-[10.5px] text-[var(--mute)]">+44 going</span></div>
        </div>
      </div>
    </div>
    <div className="px-5 mt-4">
      <div className="flex items-center justify-between mb-2"><div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Discover</div><button className="text-[10.5px] text-[var(--accent)]">See all</button></div>
      {SAMA.ACTIVITIES.slice(2,6).map(a => (
        <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b hairline-2 last:border-0">
          <div className="w-11 h-11 rounded-[9px] shrink-0 flex items-center justify-center" style={{background:SAMA.TYPE_META[a.type].wash,color:SAMA.TYPE_META[a.type].ink}}>{React.createElement(Icon[SAMA.TYPE_META[a.type].icon],{width:14,height:14})}</div>
          <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium truncate">{a.title}</div><div className="text-[10.5px] text-[var(--mute)]">{a.date} · {a.venue}</div></div>
          <Icon.ChevRight width={12} height={12} className="text-[var(--mute-2)]"/>
        </div>
      ))}
    </div>
  </div>
);

const PhoneDetail = () => (
  <div className="h-[calc(100%-88px)] overflow-y-auto no-scroll">
    <BannerVisual kind="community" className="h-[180px] relative"><div className="absolute top-2 left-2"><TypeChip type="Volunteering"/></div></BannerVisual>
    <div className="px-5 py-3">
      <div className="text-[16px] font-semibold tracking-tight">Beach Cleanup — Corniche</div>
      <div className="text-[11px] text-[var(--mute)] mt-1 space-y-0.5"><div className="flex items-center gap-1"><Icon.Cal width={10} height={10}/>Nov 2 · 7:00 — 11:00 AM</div><div className="flex items-center gap-1"><Icon.Pin width={10} height={10}/>Corniche Beach · Transport provided</div><div className="flex items-center gap-1"><Icon.Clock width={10} height={10}/>4 hours · Certificate eligible</div></div>
      <div className="mt-3 flex items-center gap-2"><AvatarStack people={SAMA.PEOPLE.slice(1,5)} size={22}/><span className="text-[11px] text-[var(--mute)]">28 confirmed · 12 spots left</span></div>
      <div className="mt-3 text-[12px] leading-relaxed text-[var(--ink-2)]">Join Red Crescent and SAMA for a community cleanup. Gloves, bags, breakfast, and certificate provided. Bus pickup from Gate 3.</div>
      <div className="mt-3 flex gap-1.5 flex-wrap">{["outdoor","community","morning","certified"].map(t=><span key={t} className="chip bg-[#f1f2ef]">#{t}</span>)}</div>
      <div className="mt-4 p-3 rounded-[10px] bg-[#f1f2ef] flex items-center gap-3"><Icon.Truck width={16} height={16} className="text-[var(--ink-2)]"/><div className="text-[11.5px] text-[var(--ink-2)]"><b>Bus 3</b> departs Gate 3 · 6:45 AM</div></div>
    </div>
    <div className="absolute bottom-14 inset-x-0 px-5 pb-3 bg-gradient-to-t from-white to-white/0 pt-6 border-t hairline bg-white"><button className="w-full h-11 rounded-[10px] bg-[var(--ink)] text-white text-[13px] font-semibold">Register — Free</button></div>
  </div>
);

const PhoneTicket = () => (
  <div className="h-[calc(100%-88px)] overflow-y-auto no-scroll px-5 pt-2">
    <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--mute)]">My ticket</div>
    <div className="text-[15px] font-semibold mt-0.5">AI Ethics Workshop</div>
    <div className="mt-3 rounded-[14px] overflow-hidden bg-gradient-to-br from-[var(--ink)] to-[#2a2e3a] text-white p-4 relative">
      <div className="flex items-center justify-between mb-3"><div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">SAMA Pass</div><Icon.Shield width={14} height={14} className="opacity-70"/></div>
      <div className="text-[12px] opacity-70">Attendee</div>
      <div className="text-[17px] font-semibold leading-tight">Fatima Al-Nuaimi</div>
      <div className="text-[10.5px] opacity-70 mt-0.5">SID · 20250314 · Engineering</div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-[10.5px]">
        <div><div className="opacity-60">DATE</div><div className="font-semibold">Oct 22, 5:00 PM</div></div>
        <div><div className="opacity-60">VENUE</div><div className="font-semibold">Conf Hall B</div></div>
        <div><div className="opacity-60">SEAT</div><div className="font-semibold">General</div></div>
        <div><div className="opacity-60">PASS</div><div className="font-semibold font-mono">FT-3407</div></div>
      </div>
      <div className="mt-4 bg-white rounded-[8px] p-3"><QRVisual/></div>
      <div className="text-[10px] text-center mt-2 opacity-70 font-mono">Code rotates every 5 minutes</div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2"><button className="h-9 rounded-[8px] border hairline bg-white text-[11.5px] flex items-center justify-center gap-1.5"><Icon.Cal width={12} height={12}/>Add to calendar</button><button className="h-9 rounded-[8px] border hairline bg-white text-[11.5px] flex items-center justify-center gap-1.5"><Icon.Share width={12} height={12}/>Share</button></div>
    <div className="mt-3 text-[10.5px] text-[var(--mute)] text-center">Cancel up to 24h before for a full refund. Waitlist will be notified automatically.</div>
  </div>
);

const WebPortal = () => (
  <div className="w-[900px] rounded-[14px] overflow-hidden border hairline shadow-float bg-white shrink-0">
    <div className="h-10 bg-[var(--ink)] flex items-center gap-3 px-4 text-white">
      <LogoMark/><span className="text-[13px] font-semibold">SAMA Student Portal</span>
      <nav className="ml-6 flex gap-4 text-[11.5px]">{["Home","Explore","My activities","Volunteering","Certificates"].map((x,i)=><span key={x} className={cx(i===0?"text-white":"text-white/60")}>{x}</span>)}</nav>
      <span className="flex-1"/><Icon.Bell width={13} height={13}/><Avatar name="Fatima Al-Nuaimi" size={22}/>
    </div>
    <div className="p-6 grid grid-cols-[2fr,1fr] gap-5 bg-[#fafafa]">
      <div>
        <div className="text-[11px] text-[var(--mute)] uppercase tracking-wider">Featured this week</div>
        <div className="mt-1 rounded-[12px] overflow-hidden bg-white border hairline shadow-soft">
          <BannerVisual kind="academic" className="h-[200px] relative flex items-end"><div className="absolute inset-x-0 bottom-0 p-5 text-white bg-gradient-to-t from-black/50 to-transparent"><TypeChip type="Event"/><div className="text-[26px] font-semibold tracking-tight mt-2">AI Ethics Workshop</div><div className="text-[12.5px] opacity-90">Oct 22 · 5 PM · Conference Hall B · Dr. Al-Kindi</div></div></BannerVisual>
          <div className="flex items-center justify-between p-4 bg-white"><div className="flex items-center gap-2"><AvatarStack people={SAMA.PEOPLE.slice(0,4)} size={22}/><span className="text-[12px] text-[var(--mute)]">47 going · 24% capacity left</span></div><button className="h-9 px-4 rounded-[8px] bg-[var(--ink)] text-white text-[12.5px] font-semibold">Register — Free</button></div>
        </div>
        <div className="text-[11px] text-[var(--mute)] uppercase tracking-wider mt-5 mb-2">Also happening</div>
        <div className="grid grid-cols-2 gap-3">
          {SAMA.ACTIVITIES.slice(1,5).map(a=>(
            <div key={a.id} className="bg-white border hairline rounded-[10px] overflow-hidden">
              <BannerVisual kind={a.type==="Volunteering"?"community":a.type==="Program"?"sports":"academic"} className="h-[100px] relative"><div className="absolute top-2 left-2"><TypeChip type={a.type}/></div></BannerVisual>
              <div className="p-3"><div className="text-[13px] font-semibold truncate">{a.title}</div><div className="text-[11px] text-[var(--mute)] mt-0.5 flex items-center gap-1"><Icon.Cal width={10} height={10}/>{a.date}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white border hairline rounded-[12px] p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Your term</div>
          <div className="grid grid-cols-3 text-center gap-2"><div><div className="text-[22px] font-semibold">11</div><div className="text-[10px] text-[var(--mute)]">Attended</div></div><div><div className="text-[22px] font-semibold">14</div><div className="text-[10px] text-[var(--mute)]">Volunteer hrs</div></div><div><div className="text-[22px] font-semibold">3</div><div className="text-[10px] text-[var(--mute)]">Certificates</div></div></div>
        </div>
        <div className="bg-white border hairline rounded-[12px] p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">My upcoming</div>
          {[["AI Ethics Workshop","Oct 22"],["Beach Cleanup","Nov 2"],["Career Fair","Nov 18"]].map(([t,d],i)=><div key={i} className="py-2 border-b hairline-2 last:border-0 flex items-center justify-between"><div className="text-[12.5px] font-medium truncate pr-2">{t}</div><div className="text-[11px] text-[var(--mute)] font-mono">{d}</div></div>)}
        </div>
        <div className="bg-[var(--ink)] text-white rounded-[12px] p-4 relative overflow-hidden"><div className="text-[11px] uppercase tracking-wider font-semibold opacity-70">Latest cert</div><div className="text-[16px] font-semibold mt-1">Leadership in Action</div><div className="text-[11px] opacity-70 mt-0.5">Apr 2025 · Verified · SAMA-25-2914</div><Icon.Medal width={48} height={48} className="absolute -right-2 -bottom-2 opacity-10"/></div>
      </div>
    </div>
  </div>
);

window.Student = Student;
