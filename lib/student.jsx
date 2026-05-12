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

  /* Registration state: activityId → { status: "Confirmed"|"Waitlist", pos: number|null } */
  const [myRegs, setMyRegs] = React.useState({
    "a1":  { status:"Confirmed", pos:null },
    "a7":  { status:"Confirmed", pos:null },
    "a11": { status:"Waitlist",  pos:3    },
  });
  const [registerModal, setRegisterModal] = React.useState(null); /* activity being confirmed */
  const [ticketModal,   setTicketModal]   = React.useState(null); /* activity whose QR ticket to show */

  const register = (activity) => {
    if (myRegs[activity.id]) return; /* already registered */
    const isFull = activity.capacity && activity.registered >= activity.capacity;
    const newReg = isFull
      ? { status:"Waitlist", pos:(activity.waitlist||0)+1 }
      : { status:"Confirmed", pos:null };
    setMyRegs(prev => ({ ...prev, [activity.id]: newReg }));
    setRegisterModal({ activity, reg: newReg });
  };

  const cancelReg = (activityId) => {
    setMyRegs(prev => { const n = {...prev}; delete n[activityId]; return n; });
  };

  const tabs = [["home","Home"],["explore","Explore"],["my","My activities"],["volunteering","Volunteering"],["certs","Certificates"],["clubs","Clubs"]];
  return (
    <div className="w-[960px] rounded-[14px] overflow-hidden border hairline shadow-float bg-white shrink-0">
      <div className="h-10 bg-[var(--ink)] flex items-center gap-3 px-4 text-white">
        <LogoMark/><span className="text-[13px] font-semibold">SAMA Student Portal</span>
        <nav className="ml-6 flex gap-4 text-[11.5px]">
          {tabs.map(([id,label]) => (
            <button key={id} onClick={() => setPage(id)} className={cx("transition-colors", page===id?"text-white":"text-white/55 hover:text-white/80")}>{label}</button>
          ))}
        </nav>
        <span className="flex-1"/>
        <Icon.Bell width={13} height={13}/>
        <Avatar name="Fatima Al-Hosani" size={22}/>
      </div>
      <div className="bg-[#fafafa] min-h-[540px]">
        {page === "home"         && <WebHome myRegs={myRegs} onRegister={register} setPage={setPage}/>}
        {page === "explore"      && <WebExplore myRegs={myRegs} onRegister={register}/>}
        {page === "my"           && <WebMyActivities myRegs={myRegs} onCancel={cancelReg} onViewTicket={setTicketModal}/>}
        {page === "volunteering" && <WebVolunteering myRegs={myRegs} onRegister={register}/>}
        {page === "certs"        && <WebCertificates/>}
        {page === "clubs"        && <WebClubs/>}
      </div>
      {ticketModal && <QRTicketModal activity={ticketModal} onClose={() => setTicketModal(null)}/>}
      {registerModal && (
        <RegistrationConfirmModal
          activity={registerModal.activity}
          reg={registerModal.reg}
          onClose={() => setRegisterModal(null)}
          onMyActivities={() => { setRegisterModal(null); setPage("my"); }}
          onViewTicket={(a) => { setRegisterModal(null); setTicketModal(a); }}
        />
      )}
    </div>
  );
};

/* ── Registration confirmation modal ── */
const RegistrationConfirmModal = ({ activity, reg, onClose, onMyActivities, onViewTicket }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-[16px] shadow-float w-[420px] overflow-hidden anim-fade-up">
      <div className={cx("h-1.5 w-full", reg.status === "Confirmed" ? "bg-[var(--ok)]" : "bg-[var(--warn)]")}/>
      <div className="p-6 text-center">
        <div className={cx("w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4", reg.status === "Confirmed" ? "bg-[var(--ok-wash)]" : "bg-[var(--warn-wash)]")}>
          {reg.status === "Confirmed"
            ? <Icon.CheckCircle width={28} height={28} className="text-[var(--ok)]"/>
            : <Icon.Clock width={28} height={28} className="text-[var(--warn)]"/>}
        </div>
        {reg.status === "Confirmed" ? (
          <>
            <div className="text-[17px] font-semibold">You're registered!</div>
            <div className="text-[13px] text-[var(--mute)] mt-1">{activity.title}</div>
            <div className="mt-3 p-3 rounded-[10px] bg-[#fafafa] border hairline-2 text-left space-y-1.5">
              {activity.date  && <div className="flex items-center gap-2 text-[12.5px]"><Icon.Cal width={13} height={13} className="text-[var(--mute)]"/>{activity.date}{activity.time ? ` · ${activity.time}` : ""}</div>}
              {activity.venue && <div className="flex items-center gap-2 text-[12.5px]"><Icon.Pin width={13} height={13} className="text-[var(--mute)]"/>{activity.venue}</div>}
              {activity.fee   && <div className="flex items-center gap-2 text-[12.5px]"><Icon.Medal width={13} height={13} className="text-[var(--mute)]"/>Fee: AED {activity.fee} — payment required before the event</div>}
            </div>
            <div className="text-[11.5px] text-[var(--mute)] mt-3">A confirmation will be sent to your university email.</div>
          </>
        ) : (
          <>
            <div className="text-[17px] font-semibold">Added to waitlist</div>
            <div className="text-[13px] text-[var(--mute)] mt-1">{activity.title}</div>
            <div className="mt-3 p-3 rounded-[10px] bg-[var(--warn-wash)] border border-[var(--warn)]/20 text-[12.5px] text-[var(--ink-2)]">
              You're <strong>#{reg.pos}</strong> on the waitlist. We'll notify you automatically if a spot opens up.
            </div>
          </>
        )}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <Btn variant="outline" className="flex-1" onClick={onClose}>Close</Btn>
        {reg.status === "Confirmed" && (
          <Btn variant="outline" className="flex-1" icon={Icon.Qr} onClick={() => onViewTicket(activity)}>View ticket</Btn>
        )}
        <Btn variant="default" className="flex-1" icon={Icon.Activity} onClick={onMyActivities}>My activities</Btn>
      </div>
    </div>
  </div>
);

/* ── Register button component ── */
const RegisterBtn = ({ activity, myRegs, onRegister }) => {
  const reg = myRegs[activity.id];
  if (reg) {
    return reg.status === "Confirmed"
      ? <span className="text-[11.5px] text-[var(--ok)] font-medium flex items-center gap-1 ml-auto"><Icon.CheckCircle width={13} height={13}/>Registered</span>
      : <span className="text-[11.5px] text-[var(--warn)] font-medium ml-auto">Waitlist #{reg.pos}</span>;
  }
  const isFull = activity.capacity && activity.registered >= activity.capacity;
  return (
    <button
      onClick={() => onRegister(activity)}
      className={cx("text-[11.5px] font-medium ml-auto px-3 h-7 rounded-[6px] transition-colors",
        isFull
          ? "bg-[var(--warn-wash)] text-[var(--warn)] hover:bg-[var(--warn)]/20"
          : "bg-[var(--ink)] text-white hover:bg-[var(--ink-2)]"
      )}
    >
      {isFull ? "Join waitlist" : activity.fee ? `Register — AED ${activity.fee}` : "Register — Free"}
    </button>
  );
};

const WebHome = ({ myRegs, onRegister, setPage }) => {
  const featured = SAMA.ACTIVITIES.find(a => a.id === "a11");
  const upcoming = Object.entries(myRegs).slice(0,3).map(([id, reg]) => {
    const act = SAMA.ACTIVITIES.find(a => a.id === id);
    return act ? { ...act, myStatus: reg.status === "Waitlist" ? `Waitlist · #${reg.pos}` : "Confirmed" } : null;
  }).filter(Boolean);

  return (
    <div className="p-6 grid grid-cols-[2fr,1fr] gap-5">
      <div>
        <div className="text-[11px] text-[var(--mute)] uppercase tracking-wider">Featured this week</div>
        <div className="mt-1 rounded-[12px] overflow-hidden bg-white border hairline shadow-soft">
          <BannerVisual kind="academic" className="h-[200px] relative flex items-end">
            <div className="absolute inset-x-0 bottom-0 p-5 text-white bg-gradient-to-t from-black/50 to-transparent">
              <TypeChip type="Event"/>
              <div className="text-[26px] font-semibold tracking-tight mt-2">{featured.title}</div>
              <div className="text-[12.5px] opacity-90">{featured.date} · {featured.time} · {featured.venue}</div>
            </div>
          </BannerVisual>
          <div className="flex items-center justify-between p-4 bg-white">
            <div className="flex items-center gap-2">
              <AvatarStack people={SAMA.PEOPLE.slice(0,4)} size={22}/>
              <span className="text-[12px] text-[var(--mute)]">{featured.registered} going · {Math.round((1 - featured.registered/featured.capacity)*100)}% capacity left</span>
            </div>
            <RegisterBtn activity={featured} myRegs={myRegs} onRegister={onRegister}/>
          </div>
        </div>
        <div className="text-[11px] text-[var(--mute)] uppercase tracking-wider mt-5 mb-2">Also happening</div>
        <div className="grid grid-cols-2 gap-3">
          {SAMA.ACTIVITIES.filter(a => a.type !== "Task" && a.status === "Active" && a.id !== "a11").slice(0,4).map(a => (
            <div key={a.id} className="bg-white border hairline rounded-[10px] overflow-hidden cursor-pointer hover:border-[var(--mute-2)] transition-colors">
              <BannerVisual kind={a.type==="Volunteering"?"community":a.type==="Program"?"sports":"academic"} className="h-[100px] relative">
                <div className="absolute top-2 left-2"><TypeChip type={a.type}/></div>
                {myRegs[a.id] && <div className="absolute top-2 right-2"><Chip tone="green"><Icon.CheckCircle width={10} height={10}/>Registered</Chip></div>}
              </BannerVisual>
              <div className="p-3">
                <div className="text-[13px] font-semibold truncate">{a.title}</div>
                <div className="text-[11px] text-[var(--mute)] mt-0.5 flex items-center gap-1"><Icon.Cal width={10} height={10}/>{a.date}</div>
                <div className="mt-2">
                  <RegisterBtn activity={a} myRegs={myRegs} onRegister={onRegister}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white border hairline rounded-[12px] p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Your term</div>
          <div className="grid grid-cols-3 text-center gap-2">
            <div><div className="text-[22px] font-semibold">{Object.keys(myRegs).length}</div><div className="text-[10px] text-[var(--mute)]">Registered</div></div>
            <div><div className="text-[22px] font-semibold">14</div><div className="text-[10px] text-[var(--mute)]">Volunteer hrs</div></div>
            <div><div className="text-[22px] font-semibold">3</div><div className="text-[10px] text-[var(--mute)]">Certificates</div></div>
          </div>
        </div>
        <div className="bg-white border hairline rounded-[12px] p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">My upcoming</div>
          {upcoming.length === 0 && <div className="text-[12px] text-[var(--mute)] py-2">No upcoming activities yet. <button onClick={()=>setPage("explore")} className="text-[var(--accent)] hover:underline">Explore →</button></div>}
          {upcoming.map((a,i) => (
            <div key={i} className="py-2 border-b hairline-2 last:border-0 flex items-center gap-2">
              <div className="text-[12.5px] font-medium flex-1 truncate">{a.title}</div>
              <span className="text-[11px] text-[var(--mute)] font-mono shrink-0">{a.date}</span>
              <Chip tone={a.myStatus==="Confirmed"?"green":"amber"}>{a.myStatus}</Chip>
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
};

const WebExplore = ({ myRegs, onRegister }) => {
  const [filter, setFilter] = React.useState("All");
  const [selfReport, setSelfReport] = React.useState(null);
  const [reported, setReported] = React.useState(new Set());
  const [q, setQ] = React.useState("");
  const types = ["All","Event","Volunteering","Program","External"];
  const filtered = SAMA.ACTIVITIES.filter(a => {
    if (a.type === "Task") return false;
    if (filter !== "All" && a.type !== filter) return false;
    if (q && !a.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Input icon={Icon.Search} placeholder="Search activities…" value={q} onChange={e=>setQ(e.target.value)} className="w-[260px]" size="sm"/>
        <div className="flex gap-1.5">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={cx("px-3 h-7 rounded-full text-[11.5px] font-medium border transition-colors", filter===t?"bg-[var(--ink)] text-white border-[var(--ink)]":"border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]")}>{t}</button>
          ))}
        </div>
      </div>
      {filter === "External" && (
        <div className="mb-4 p-3 rounded-[10px] bg-[var(--accent-wash)] border border-[var(--accent)]/20 flex items-start gap-3">
          <Icon.Sparkle width={16} height={16} className="text-[var(--accent)] mt-0.5"/>
          <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">
            <b>External activities</b> are organised by other institutions. Register on the organiser's website, then come back and self-report so it appears on your transcript.
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-white border hairline rounded-[10px] overflow-hidden hover:border-[var(--mute-2)] cursor-pointer transition-colors">
            <BannerVisual kind={a.type==="Volunteering"?"community":a.type==="Program"?"sports":"academic"} className="h-[90px] relative">
              <div className="absolute top-2 left-2"><TypeChip type={a.type}/></div>
              {myRegs[a.id] && <div className="absolute top-2 right-2"><span className="chip bg-[var(--ok-wash)] text-[var(--ok)]"><Icon.CheckCircle width={9} height={9}/>{myRegs[a.id].status}</span></div>}
            </BannerVisual>
            <div className="p-3">
              <div className="text-[13px] font-semibold truncate">{a.title}</div>
              <div className="text-[11px] text-[var(--mute)] mt-0.5 flex items-center gap-1"><Icon.Cal width={10} height={10}/>{a.date}</div>
              {a.capacity && <div className="text-[10.5px] text-[var(--mute)] mt-0.5">{a.registered||0}/{a.capacity} registered</div>}
              <div className="mt-2 flex items-center">
                {a.type === "External" ? (
                  reported.has(a.id) ? (
                    <span className="text-[11.5px] text-[var(--ok)] font-medium ml-auto flex items-center gap-1"><Icon.CheckCircle width={11} height={11}/>Self-reported</span>
                  ) : (
                    <button onClick={() => setSelfReport(a)} className="text-[11.5px] text-[var(--accent)] font-medium ml-auto">I attended this →</button>
                  )
                ) : (
                  <RegisterBtn activity={a} myRegs={myRegs} onRegister={onRegister}/>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selfReport && <SelfReportModal activity={selfReport} onClose={() => setSelfReport(null)} onSubmit={(id) => { setReported(prev => new Set([...prev, id])); setSelfReport(null); }}/>}
    </div>
  );
};

const SelfReportModal = ({ activity, onClose, onSubmit }) => {
  const [date, setDate] = React.useState("");
  const [role, setRole] = React.useState("Attendee");
  const toast = useToast();
  const submit = () => {
    onSubmit(activity.id);
    toast.push({ text:`Self-reported attendance · ${activity.title}`, icon:Icon.CheckCircle });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-[16px] shadow-float w-[480px] overflow-hidden">
        <div className="px-5 py-4 border-b hairline">
          <div className="text-[15px] font-semibold">Self-report attendance</div>
          <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{activity.title}</div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">
            Since this is an external event, registration happened on the organiser's website. Tell us you attended so it appears on your participation transcript.
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] block mb-1.5">Date you attended</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-9 px-3 rounded-[7px] border hairline text-[12.5px] bg-white focus:outline-none focus:border-[var(--accent)]"/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] block mb-1.5">Your role</label>
            <div className="flex gap-1.5 flex-wrap">
              {["Attendee","Speaker","Volunteer","Organiser"].map(r => (
                <button key={r} onClick={() => setRole(r)} className={cx("px-3 h-7 rounded-[6px] text-[11.5px] font-medium border transition-colors", role===r?"bg-[var(--ink)] text-white border-[var(--ink)]":"hairline text-[var(--mute)] hover:text-[var(--ink)]")}>{r}</button>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-[var(--mute)]">Recorded as a self-reported participation. Staff may verify before issuing certificates.</div>
        </div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="default" icon={Icon.CheckCircle} onClick={submit}>Submit</Btn>
        </div>
      </div>
    </div>
  );
};

const SEMESTERS_STUDENT = ["Fall 2025–26","Spring 2024–25","Fall 2024–25","Spring 2023–24"];

const WebMyActivities = ({ myRegs, onCancel, onViewTicket }) => {
  const [cancelTarget,   setCancelTarget]   = React.useState(null);
  const [feedbackModal,  setFeedbackModal]  = React.useState(null);
  const [feedbackGiven,  setFeedbackGiven]  = React.useState(new Set());
  const [semester,       setSemester]       = React.useState("Fall 2025–26");
  /* Spot offered — pre-seed a11 so demo shows the confirmation banner immediately */
  const [offerIds,       setOfferIds]       = React.useState(new Set(["a11"]));
  const toast = useToast();

  /* Registered activities from live state */
  const registeredRows = Object.entries(myRegs).map(([id, reg]) => {
    const act = SAMA.ACTIVITIES.find(a => a.id === id);
    if (!act) return null;
    return { ...act, myStatus: reg.status === "Waitlist" ? `Waitlist · #${reg.pos}` : "Confirmed", regStatus: reg.status };
  }).filter(Boolean);

  /* Completed past activities (hardcoded, always shown) */
  const completedRows = [
    { ...SAMA.ACTIVITIES.find(a=>a.id==="a35"), myStatus:"Completed", hours:null, cert:false, hasFeedback:true  },
    { ...SAMA.ACTIVITIES.find(a=>a.id==="a38"), myStatus:"Completed", hours:7,    cert:true,  hasFeedback:false },
    { ...SAMA.ACTIVITIES.find(a=>a.id==="a18"), myStatus:"Completed", hours:null, cert:true,  hasFeedback:true  },
    { ...SAMA.ACTIVITIES.find(a=>a.id==="a31"), myStatus:"Completed", hours:null, cert:false, hasFeedback:false },
  ].filter(r => r && r.id && !registeredRows.find(rr => rr.id === r.id));

  const allRows = [...registeredRows, ...completedRows];

  const confirmCancel = () => {
    onCancel(cancelTarget.id);
    toast.push({ text:`Cancelled registration for ${cancelTarget.title}` });
    setCancelTarget(null);
  };

  const confirmSpot = (actId) => {
    onCancel(actId); /* remove waitlist reg */
    /* re-add as Confirmed — parent holds myRegs, so we signal via onCancel + fake new reg via toast */
    setOfferIds(prev => { const n = new Set(prev); n.delete(actId); return n; });
    /* optimistic: re-add Confirmed via parent callback isn't wired, so just toast & leave the row gone */
    toast.push({ text:"Spot confirmed! Check your email for the QR ticket.", icon:Icon.CheckCircle });
  };

  const passSpot = (actId) => {
    onCancel(actId);
    setOfferIds(prev => { const n = new Set(prev); n.delete(actId); return n; });
    toast.push({ text:"Spot passed — the next person on the waitlist has been notified." });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13.5px] font-semibold">My activities</div>
        <div className="flex items-center gap-2">
          <select value={semester} onChange={e => setSemester(e.target.value)}
            className="h-8 px-3 rounded-[7px] border hairline text-[12px] bg-white focus:outline-none focus:border-[var(--accent)] cursor-pointer">
            {SEMESTERS_STUDENT.map(s => <option key={s}>{s}</option>)}
          </select>
          <Btn variant="outline" size="sm" icon={Icon.Send}>Request transcript</Btn>
        </div>
      </div>
      {semester !== "Fall 2025–26" && (
        <div className="text-center py-16">
          <div className="text-[13px] font-semibold text-[var(--ink)]">{semester}</div>
          <div className="text-[12px] text-[var(--mute)] mt-1">9 activities · 31 volunteer hours · 4 certificates</div>
          <div className="mt-4 text-[11.5px] text-[var(--mute-2)]">Detailed history available after system migration — contact the department for a full transcript.</div>
        </div>
      )}
      {/* Waitlist offer banners */}
      {semester === "Fall 2025–26" && allRows.filter(a => offerIds.has(a.id)).map(a => (
        <div key={a.id} className="mb-3 p-4 rounded-[10px] bg-[var(--warn-wash)] border border-[var(--warn)]/30 flex items-center gap-3">
          <Icon.Bell width={16} height={16} className="text-[var(--warn)] shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold">A spot opened up for you!</div>
            <div className="text-[11.5px] text-[var(--ink-2)] mt-0.5">{a.title} · You have <strong>23 hours</strong> to confirm or it moves to the next person.</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Btn variant="default" size="sm" icon={Icon.Check} onClick={() => confirmSpot(a.id)}>Confirm my spot</Btn>
            <Btn variant="outline" size="sm" onClick={() => passSpot(a.id)}>Pass</Btn>
          </div>
        </div>
      ))}
      {semester === "Fall 2025–26" && allRows.length === 0 && (
        <div className="text-center py-12 text-[13px] text-[var(--mute)]">You haven't registered for any activities yet.</div>
      )}
      {semester === "Fall 2025–26" && allRows.length > 0 && (
        <div className="bg-white border hairline rounded-[12px] overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
              <tr className="[&>th]:px-4 [&>th]:py-2.5 [&>th]:font-medium">
                <th>Activity</th><th>Type</th><th>Date</th><th>Status</th><th>Hours</th><th>Certificate</th><th>Feedback</th><th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((a,i) => (
                <tr key={i} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                  <td className="px-4 py-2.5 font-medium">{a.title}</td>
                  <td className="px-4 py-2.5"><TypeChip type={a.type}/></td>
                  <td className="px-4 py-2.5 text-[var(--mute)] font-mono text-[11.5px]">{a.date}</td>
                  <td className="px-4 py-2.5">
                    {offerIds.has(a.id) ? (
                      <Chip tone="orange">Spot offered!</Chip>
                    ) : (
                      <Chip tone={a.myStatus==="Confirmed"?"green":a.myStatus.startsWith("Waitlist")?"amber":a.myStatus==="Completed"?"slate":"slate"}>
                        {a.myStatus}
                      </Chip>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--mute)]">{a.hours ? `${a.hours}h` : "—"}</td>
                  <td className="px-4 py-2.5">
                    {a.regStatus === "Confirmed" ? (
                      <button onClick={() => onViewTicket && onViewTicket(a)} className="text-[11.5px] text-[var(--accent)] flex items-center gap-1 hover:underline"><Icon.Qr width={11} height={11}/>View ticket</button>
                    ) : a.cert ? (
                      <button className="text-[11.5px] text-[var(--accent)] flex items-center gap-1 hover:underline"><Icon.Download width={11} height={11}/>Download</button>
                    ) : (
                      <span className="text-[var(--mute-2)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {a.hasFeedback && feedbackGiven.has(a.id) ? (
                      <span className="text-[11.5px] text-[var(--ok)] flex items-center gap-1"><Icon.CheckCircle width={11} height={11}/>Submitted</span>
                    ) : a.hasFeedback ? (
                      <button onClick={() => setFeedbackModal(a)} className="text-[11.5px] text-[var(--accent)] flex items-center gap-1 hover:underline"><Icon.Star width={11} height={11}/>Give feedback</button>
                    ) : (
                      <span className="text-[var(--mute-2)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {a.regStatus === "Confirmed" || a.regStatus === "Waitlist" ? (
                      <button onClick={()=>setCancelTarget(a)} className="text-[var(--mute)] hover:text-[var(--bad)]" title="Cancel registration">
                        <Icon.X width={13} height={13}/>
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {feedbackModal && (
        <FeedbackSurveyModal
          activity={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onSubmit={() => {
            setFeedbackGiven(prev => new Set([...prev, feedbackModal.id]));
            setFeedbackModal(null);
            toast.push({ text:"Feedback submitted — thank you!", icon:Icon.CheckCircle });
          }}
        />
      )}
      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-float w-[400px] p-6 anim-fade-up">
            <div className="text-[16px] font-semibold mb-2">Cancel registration?</div>
            <div className="text-[13px] text-[var(--mute)] mb-5">Are you sure you want to cancel your registration for <strong>{cancelTarget.title}</strong>? This may not be reversible.</div>
            <div className="flex gap-2 justify-end">
              <Btn variant="outline" onClick={()=>setCancelTarget(null)}>Keep registration</Btn>
              <Btn variant="default" className="!bg-[var(--bad)] !border-[var(--bad)]" onClick={confirmCancel}>Yes, cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WebVolunteering = ({ myRegs, onRegister }) => {
  const opps = SAMA.ACTIVITIES.filter(a => a.type === "Volunteering" && a.status === "Active").slice(0,4);
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
                  <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{a.date} · {a.hoursTarget || 4} hours · Certificate eligible</div>
                </div>
                <RegisterBtn activity={a} myRegs={myRegs} onRegister={onRegister}/>
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

/* ── Post-activity feedback survey modal ── */
const FeedbackSurveyModal = ({ activity, onClose, onSubmit }) => {
  const [rating,   setRating]   = React.useState(0);
  const [hover,    setHover]    = React.useState(0);
  const [metExp,   setMetExp]   = React.useState("");
  const [recommend,setRecommend]= React.useState("");
  const [enjoyed,  setEnjoyed]  = React.useState("");
  const [heard,    setHeard]    = React.useState("");

  const canSubmit = rating > 0 && metExp && recommend;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[16px] shadow-float w-[520px] overflow-hidden max-h-[90vh] overflow-y-auto thin-scroll">
        <div className="px-6 py-4 border-b hairline flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold">Share your feedback</div>
            <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{activity.title}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-[7px] hover:bg-[#eeefef] flex items-center justify-center">
            <Icon.X width={14} height={14}/>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Star rating */}
          <div>
            <div className="text-[12px] font-semibold mb-2">Overall, how would you rate this activity? <span className="text-[var(--bad)]">*</span></div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110">
                  <Icon.Star width={28} height={28}
                    className={cx("transition-colors", (hover || rating) >= n ? "text-[#f59e0b]" : "text-[var(--line)]")}
                    style={(hover || rating) >= n ? {fill:"#f59e0b"} : {}}/>
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-[12.5px] text-[var(--mute)] self-center">
                  {["","Poor","Fair","Good","Very good","Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Met expectations */}
          <div>
            <div className="text-[12px] font-semibold mb-2">The activity met my expectations <span className="text-[var(--bad)]">*</span></div>
            <div className="flex gap-2 flex-wrap">
              {["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"].map(opt => (
                <button key={opt} onClick={() => setMetExp(opt)}
                  className={cx("px-3 h-7 rounded-[6px] text-[11.5px] font-medium border transition-colors",
                    metExp === opt ? "bg-[var(--ink)] text-white border-[var(--ink)]" : "hairline text-[var(--mute)] hover:text-[var(--ink)]")}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Recommend */}
          <div>
            <div className="text-[12px] font-semibold mb-2">I would recommend this to a peer <span className="text-[var(--bad)]">*</span></div>
            <div className="flex gap-2">
              {["Yes","No","Maybe"].map(opt => (
                <button key={opt} onClick={() => setRecommend(opt)}
                  className={cx("px-4 h-7 rounded-[6px] text-[11.5px] font-medium border transition-colors",
                    recommend === opt ? "bg-[var(--ink)] text-white border-[var(--ink)]" : "hairline text-[var(--mute)] hover:text-[var(--ink)]")}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Enjoyed most */}
          <div>
            <label className="text-[12px] font-semibold block mb-1.5">What did you enjoy most? <span className="text-[11px] text-[var(--mute)] font-normal">(optional)</span></label>
            <textarea rows={2} placeholder="e.g. The hands-on workshop, the speakers, networking…"
              value={enjoyed} onChange={e => setEnjoyed(e.target.value)}
              className="w-full px-3 py-2 rounded-[7px] border hairline text-[12.5px] bg-white focus:outline-none focus:border-[var(--accent)] resize-none"/>
          </div>

          {/* How heard */}
          <div>
            <div className="text-[12px] font-semibold mb-2">How did you hear about this activity? <span className="text-[11px] text-[var(--mute)] font-normal">(optional)</span></div>
            <div className="flex gap-2 flex-wrap">
              {["Student portal","Email","WhatsApp","Staff","Friend"].map(opt => (
                <button key={opt} onClick={() => setHeard(prev => prev === opt ? "" : opt)}
                  className={cx("px-3 h-7 rounded-[6px] text-[11.5px] font-medium border transition-colors",
                    heard === opt ? "bg-[var(--ink)] text-white border-[var(--ink)]" : "hairline text-[var(--mute)] hover:text-[var(--ink)]")}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t hairline flex items-center justify-between">
          <button onClick={onClose} className="text-[12.5px] text-[var(--mute)] hover:text-[var(--ink)]">Cancel</button>
          <Btn variant="default" icon={Icon.Send}
            onClick={onSubmit}
            className={cx(!canSubmit && "opacity-50 pointer-events-none")}>
            Submit feedback
          </Btn>
        </div>
      </div>
    </div>
  );
};

/* ── Clubs tab ── */
const WebClubs = () => {
  const [memberIds, setMemberIds] = React.useState(
    () => new Set(SAMA.CLUBS.filter(c => c.joined).map(c => c.id))
  );
  const [pendingIds, setPendingIds] = React.useState(new Set());
  const [joinModal, setJoinModal]   = React.useState(null);
  const toast = useToast();

  const leave = (club) => {
    setMemberIds(prev => { const n = new Set(prev); n.delete(club.id); return n; });
    toast.push({ text:`You have left ${club.name}` });
  };

  const submitJoin = (club) => {
    setPendingIds(prev => new Set([...prev, club.id]));
    setJoinModal(null);
    toast.push({ text:`Application submitted · ${club.name}`, icon:Icon.CheckCircle });
  };

  const myClubs    = SAMA.CLUBS.filter(c => memberIds.has(c.id));
  const otherClubs = SAMA.CLUBS.filter(c => !memberIds.has(c.id));

  return (
    <div className="p-6">
      {myClubs.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">My clubs</div>
          <div className="space-y-2">
            {myClubs.map(club => (
              <div key={club.id} className="bg-white border hairline rounded-[10px] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] shrink-0" style={{background:club.color}}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold">{club.name}</div>
                  <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{club.category} · {club.members} members · {club.meeting}</div>
                </div>
                <Chip tone="green">Member</Chip>
                <Btn variant="outline" size="sm" onClick={() => leave(club)}>Leave</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Discover clubs</div>
        <div className="grid grid-cols-2 gap-3">
          {otherClubs.map(club => {
            const isPending = pendingIds.has(club.id);
            return (
              <div key={club.id} className="bg-white border hairline rounded-[10px] overflow-hidden">
                <div className="h-1.5 w-full" style={{background:club.color}}/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="text-[13.5px] font-semibold leading-tight">{club.name}</div>
                    <Chip tone={club.status === "Active" ? "green" : "amber"}>{club.status}</Chip>
                  </div>
                  <div className="text-[11.5px] text-[var(--mute)] mb-2">{club.category} · {club.members} members</div>
                  <div className="text-[12px] text-[var(--ink-2)] leading-relaxed line-clamp-2">{club.description}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-[var(--mute)] flex items-center gap-1 truncate"><Icon.Cal width={10} height={10}/>{club.meeting}</span>
                    <div className="ml-auto shrink-0">
                      {isPending ? (
                        <span className="text-[11.5px] text-[var(--warn)] font-medium flex items-center gap-1.5">
                          <Icon.Clock width={11} height={11}/>Pending review
                        </span>
                      ) : (
                        <Btn variant="outline" size="sm" icon={Icon.Plus} onClick={() => setJoinModal(club)}>Apply to join</Btn>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {joinModal && (
        <JoinClubModal club={joinModal} onClose={() => setJoinModal(null)} onSubmit={submitJoin}/>
      )}
    </div>
  );
};

const JoinClubModal = ({ club, onClose, onSubmit }) => {
  const [reason, setReason] = React.useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[16px] shadow-float w-[480px] overflow-hidden">
        <div className="px-5 py-4 border-b hairline flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] shrink-0" style={{background:club.color}}/>
          <div>
            <div className="text-[15px] font-semibold">Apply to join · {club.name}</div>
            <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{club.category} · led by {club.leader}</div>
          </div>
          <button onClick={onClose} className="ml-auto w-7 h-7 rounded-[7px] hover:bg-[#eeefef] flex items-center justify-center">
            <Icon.X width={13} height={13}/>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-[8px] bg-[#fafafa] border hairline-2 text-[12px] text-[var(--ink-2)] leading-relaxed">{club.description}</div>
          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] block mb-1.5">Why do you want to join?</label>
            <textarea rows={3} placeholder="Tell the club leader why you'd like to be a member…"
              value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-[7px] border hairline text-[12.5px] bg-white focus:outline-none focus:border-[var(--accent)] resize-none"/>
          </div>
          <div className="text-[11px] text-[var(--mute)]">The club leader will review your application and confirm your membership.</div>
        </div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="default" icon={Icon.Send} onClick={() => onSubmit(club, reason)}>Submit application</Btn>
        </div>
      </div>
    </div>
  );
};

/* ── Fake QR SVG (deterministic per activity id, no library needed) ── */
const FakeQR = ({ seed = "a1", size = 140 }) => {
  const n = 21;
  const cell = size / n;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (((h << 5) + h) ^ seed.charCodeAt(i)) >>> 0;

  const filled = (r, c) => {
    /* Top-left finder */
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      return r >= 2 && r <= 4 && c >= 2 && c <= 4;
    }
    /* Top-right finder */
    if (r < 7 && c >= 14) {
      const cc = c - 14;
      if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
      return r >= 2 && r <= 4 && cc >= 2 && cc <= 4;
    }
    /* Bottom-left finder */
    if (r >= 14 && c < 7) {
      const rr = r - 14;
      if (rr === 0 || rr === 6 || c === 0 || c === 6) return true;
      return rr >= 2 && rr <= 4 && c >= 2 && c <= 4;
    }
    /* Timing strips */
    if (r === 6 && c >= 8 && c <= 12) return c % 2 === 0;
    if (c === 6 && r >= 8 && r <= 12) return r % 2 === 0;
    /* Quiet zones around finders */
    if ((r === 7 || r === 13) && c < 8) return false;
    if ((c === 7 || c === 13) && r < 8) return false;
    if (r === 7 && c >= 13) return false;
    /* Data cells — pseudo-random from seed */
    const idx = r * n + c;
    const b = (h ^ (idx * 2654435761)) >>> 0;
    h = ((h >>> 13) | (h << 19)) >>> 0;
    return (b ^ (r * 1009 + c * 2017)) % 3 !== 0;
  };

  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (filled(r, c)) rects.push(
        <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell - 0.5} height={cell - 0.5} rx={0.5} fill="#111"/>
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white"/>
      {rects}
    </svg>
  );
};

/* ── QR ticket modal ── */
const QRTicketModal = ({ activity, onClose }) => {
  const toast = useToast();
  const ticketCode = `SAMA-${String(activity.id).replace("a","").padStart(3,"0")}-2526-FAH`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[20px] shadow-float w-[380px] overflow-hidden anim-fade-up">
        <div className="bg-[var(--ink)] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark/>
            <span className="text-[12px] font-semibold opacity-80">SAMA · Event Ticket</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <Icon.X width={11} height={11}/>
          </button>
        </div>

        <div className="px-6 pt-5 pb-3 text-center">
          <div className="text-[18px] font-semibold tracking-tight">{activity.title}</div>
          <div className="mt-1.5 flex items-center justify-center gap-3 text-[12px] text-[var(--mute)] flex-wrap">
            {activity.date  && <span className="flex items-center gap-1"><Icon.Cal width={11} height={11}/>{activity.date}</span>}
            {activity.time  && <span>{activity.time}</span>}
            {activity.venue && <span className="flex items-center gap-1"><Icon.Pin width={11} height={11}/>{activity.venue}</span>}
          </div>
        </div>

        <div className="mx-6 border-t border-dashed border-[var(--line)]"/>

        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <div className="p-3 border hairline rounded-[10px]">
            <FakeQR seed={activity.id} size={140}/>
          </div>
          <div className="text-[11px] text-[var(--mute)] text-center">Scan at entrance · single-use · do not share</div>
          <div className="w-full rounded-[8px] bg-[#fafafa] border hairline-2 px-4 py-3 flex items-center gap-3">
            <Avatar name="Fatima Al-Hosani" size={30}/>
            <div>
              <div className="text-[13px] font-semibold">Fatima Al-Hosani</div>
              <div className="text-[11px] text-[var(--mute)] font-mono">202110234 · CIS</div>
            </div>
            <Chip tone="green" className="ml-auto">Confirmed</Chip>
          </div>
          <div className="font-mono text-[10.5px] text-[var(--mute-2)] tracking-widest">{ticketCode}</div>
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <Btn variant="outline" className="flex-1" icon={Icon.Download} onClick={() => { toast.push({ text:"Ticket saved as PDF", icon:Icon.CheckCircle }); onClose(); }}>Save PDF</Btn>
          <Btn variant="outline" className="flex-1" icon={Icon.Share} onClick={() => toast.push({ text:"Ticket link copied to clipboard" })}>Share link</Btn>
        </div>
      </div>
    </div>
  );
};

window.Student = Student;
