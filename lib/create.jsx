/* Create Activity — streamlined single-screen quick-create with smart defaults */

const Create = () => {
  const { createType, setRoute, go } = useApp();
  const [type, setType] = React.useState(createType || "Event");
  const [step, setStep] = React.useState("essentials"); // essentials | extras | review
  const [title, setTitle] = React.useState("");
  const [smart, setSmart] = React.useState({
    category: "Academic", venue: "Main Auditorium", capacity: 200, qr: true, public: true, public2: false,
    date: "Oct 22, 2025", time:"5:00 PM", endTime:"7:00 PM", owner:"Jane Doe",
    target: 4,
  });
  const toast = useToast();

  const buildDraft = (status) => ({
    title: title || `Untitled ${type}`,
    type, status,
    date: smart.date, dateIso: "2025-10-22",
    time: `${smart.time} – ${smart.endTime}`,
    venue: smart.venue, capacity: Number(smart.capacity)||0,
    category: smart.category, qr: smart.qr, public: smart.public,
    tags: ["new"],
  });

  const onSaveDraft = () => {
    const a = createActivity(buildDraft("Draft"));
    toast.push({text:"Draft saved", icon:Icon.CheckCircle});
    go("activity", a.id);
  };
  const onSubmit = () => {
    const a = createActivity(buildDraft("Pending Approval"));
    toast.push({text:"Submitted to Reem Abdulla for approval", icon:Icon.Send});
    go("activity", a.id);
  };

  React.useEffect(()=>{ if (createType) setType(createType); }, [createType]);

  const suggestions = [
    { icon:"Sparkle", title:"Career Workshop — Resume Clinic", hint:"Event · Conference Hall · 60 seats" },
    { icon:"Heart",   title:"Ramadan Community Meals",         hint:"Volunteering · Mar 2026 · 6 hrs target" },
    { icon:"Rocket",  title:"Freshman Pitch Night",            hint:"Event · Outdoor Plaza · 400 seats" },
  ];

  const m = SAMA.TYPE_META[type];

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 overflow-y-auto thin-scroll">
        <div className="max-w-[760px] mx-auto px-8 py-7">
          {/* Hero */}
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--mute)] font-semibold mb-1">New activity</div>
              <h1 className="text-[24px] font-semibold tracking-tight">What are you planning?</h1>
              <p className="text-[13px] text-[var(--mute)] mt-1">We'll only ask for what this activity type actually needs. You can refine anything later.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Btn variant="ghost" size="sm" onClick={()=>go("hub")}>Cancel</Btn>
              <Btn variant="outline" size="sm" icon={Icon.Copy} onClick={onSaveDraft}>Save draft</Btn>
              <Btn variant="accent" size="sm" icon={Icon.Send} onClick={onSubmit}>Submit for approval</Btn>
            </div>
          </div>

          {/* Smart suggestions */}
          <div className="mb-5 p-3 rounded-[10px] border hairline bg-gradient-to-br from-[var(--accent-wash)] to-white relative overflow-hidden">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-[7px] bg-white shadow-soft flex items-center justify-center text-[var(--accent)]"><Icon.Sparkle width={15} height={15}/></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold">Start from a template or recent draft</div>
                <div className="text-[11.5px] text-[var(--mute)]">Based on your role and the season, here's what the team usually creates next.</div>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {suggestions.map((s,i)=>{
                    const I = Icon[s.icon];
                    return (
                      <button key={i} onClick={()=>setTitle(s.title)} className="bg-white border hairline rounded-[8px] p-2 text-left hover:border-[#c6c9d1] hover:shadow-soft transition-all">
                        <div className="flex items-center gap-1.5"><I width={13} height={13} className="text-[var(--accent)]"/><span className="text-[12px] font-medium">{s.title}</span></div>
                        <div className="text-[10.5px] text-[var(--mute)] mt-1 leading-snug">{s.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="mb-5">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Activity type</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {["Event","Program","Volunteering","Task","External"].map(t => {
                const mm = SAMA.TYPE_META[t];
                const I = Icon[mm.icon];
                const active = type===t;
                return (
                  <button key={t} onClick={()=>setType(t)} className={cx("p-2.5 rounded-[10px] border text-left transition-all", active ? "border-transparent shadow-soft" : "border-[var(--line)] hover:border-[#c6c9d1]")} style={{background: active ? mm.wash : "white"}}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{background:active ? "white" : mm.wash, color:mm.ink}}><I width={14} height={14}/></div>
                      {active && <Icon.CheckCircle width={14} height={14} className="ml-auto" style={{color:mm.ink}}/>}
                    </div>
                    <div className="text-[12.5px] font-semibold" style={{color:active ? mm.ink : "var(--ink)"}}>{t}</div>
                    <div className="text-[10.5px] text-[var(--mute)] mt-0.5">{typeHint(t)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <Card className="p-4 mb-3">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Title</label>
            <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder={`e.g. ${typePlaceholder(type)}`} className="w-full text-[18px] font-semibold mt-1.5 border-0 outline-none bg-transparent placeholder:text-[#c2c7d0]"/>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="text-[10.5px] uppercase tracking-wider text-[var(--mute)] font-semibold mr-1">Suggested tags</span>
              {["freshman","workshop","hybrid","members-only"].map(t => (
                <button key={t} className="chip bg-[#f1f2ef] hover:bg-[#e8eaef] text-[var(--ink-2)]">#{t}</button>
              ))}
            </div>
          </Card>

          {/* Conditional fields based on type */}
          {(type==="Event" || type==="Program") && <LogisticsBlock smart={smart} setSmart={setSmart} type={type}/>}
          {type==="Volunteering" && <VolunteerBlock smart={smart} setSmart={setSmart}/>}
          {type==="Task" && <TaskBlock/>}
          {type==="External" && <ExternalBlock/>}

          {/* Assign & publish */}
          <Card className="p-4 mb-3">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Ownership & visibility</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary organiser">
                <OwnerSelect value={smart.owner} onChange={v=>setSmart({...smart, owner:v})}/>
              </Field>
              <Field label="Co-organisers (optional)">
                <div className="flex items-center gap-1.5 h-8 px-2 border hairline rounded-[7px] bg-white cursor-text">
                  <AvatarStack people={[SAMA.PEOPLE[8], SAMA.PEOPLE[9]]} size={20}/>
                  <button className="text-[12px] text-[var(--mute)] flex items-center gap-1">+ add</button>
                </div>
              </Field>
              <div className="col-span-2 flex items-center justify-between p-2.5 bg-[#fafafa] rounded-[8px] border hairline-2">
                <div>
                  <div className="text-[13px] font-medium">Public on student portal</div>
                  <div className="text-[11.5px] text-[var(--mute)]">Registration opens as soon as this activity is approved.</div>
                </div>
                <Switch on={smart.public} onToggle={v=>setSmart({...smart, public:v})}/>
              </div>
              <div className="col-span-2 flex items-center justify-between p-2.5 bg-[#fafafa] rounded-[8px] border hairline-2">
                <div>
                  <div className="text-[13px] font-medium flex items-center gap-1.5">Auto post-event actions <Chip tone="indigo">Smart</Chip></div>
                  <div className="text-[11.5px] text-[var(--mute)]">When this activity completes, auto-send feedback survey + issue attendance certificates.</div>
                </div>
                <Switch on={true} onToggle={()=>{}}/>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <div className="text-[11.5px] text-[var(--mute)]">
              <span className="text-[var(--ink)] font-medium">⌘S</span> saves draft · <span className="text-[var(--ink)] font-medium">⌘⏎</span> submits for approval
            </div>
            <Btn variant="accent" icon={Icon.Send} onClick={onSubmit}>Submit for approval</Btn>
          </div>
        </div>
      </div>

      {/* Right preview pane */}
      <div className="w-[340px] shrink-0 border-l hairline bg-[#fafafa] p-4 overflow-y-auto thin-scroll hidden xl:block">
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Live preview · Student portal card</div>
        <div className="bg-white rounded-[12px] border hairline shadow-soft overflow-hidden">
          <BannerVisual kind={m.label.toLowerCase()==="volunteering"?"community":m.label.toLowerCase()==="program"?"sports":"academic"} className="h-[110px] relative">
            <div className="absolute top-2.5 left-2.5"><TypeChip type={type} subtle={false}/></div>
          </BannerVisual>
          <div className="p-3">
            <div className="text-[14px] font-semibold leading-tight line-clamp-2 min-h-[2.7em]">{title || `Your ${type.toLowerCase()} title appears here`}</div>
            <div className="mt-2 space-y-1 text-[11.5px] text-[var(--mute)]">
              <div className="flex items-center gap-1.5"><Icon.Cal width={11} height={11}/>{smart.date} · {smart.time}</div>
              <div className="flex items-center gap-1.5"><Icon.Pin width={11} height={11}/>{smart.venue}</div>
              <div className="flex items-center gap-1.5"><Icon.Users width={11} height={11}/>{smart.capacity} seats</div>
            </div>
            <button className="mt-3 w-full h-8 rounded-[7px] bg-[var(--ink)] text-white text-[12px] font-medium">Register</button>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">Approval flow</div>
          <div className="space-y-1">
            <FlowStep n={1} title="You submit" by="Jane Doe · Coordinator" done/>
            <FlowStep n={2} title="Ops Manager reviews" by="Reem Abdulla · typically in 4h" current/>
            <FlowStep n={3} title="Activity goes live" hint="Student portal + notifications"/>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-[10px] bg-white border hairline">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold mb-1.5"><Icon.Shield width={13} height={13} className="text-[var(--ok)]"/> Auto-checks passed</div>
          <ul className="text-[11.5px] text-[var(--mute)] space-y-1">
            <li className="flex items-center gap-1.5"><Icon.Check width={11} height={11} className="text-[var(--ok)]"/> Venue is free on {smart.date}</li>
            <li className="flex items-center gap-1.5"><Icon.Check width={11} height={11} className="text-[var(--ok)]"/> No clash with exam period</li>
            <li className="flex items-center gap-1.5"><Icon.AlertTri width={11} height={11} className="text-[var(--warn)]"/> 2 similar events this week — review below</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const typeHint = (t) => ({
  Event:"Date, venue, registration", Program:"Recurring sessions", Volunteering:"Hours, outcomes, certs", Task:"Assignees & subtasks", External:"Third-party URL"
})[t];

const typePlaceholder = (t) => ({
  Event:"Guest Lecture: AI Ethics", Program:"Men's Football — 25/26 Season", Volunteering:"Beach Cleanup Drive", Task:"Submit Q1 Budget Report", External:"Global Tech Conference 2025"
})[t];

const Field = ({ label, children, hint }) => (
  <div>
    <div className="text-[11px] font-medium text-[var(--mute)] mb-1 flex items-center justify-between"><span>{label}</span>{hint && <span className="text-[10px] font-normal">{hint}</span>}</div>
    {children}
  </div>
);

const OwnerSelect = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5 h-8 px-2 border hairline rounded-[7px] bg-white">
    <Avatar name={value} size={20}/>
    <span className="text-[12.5px] flex-1">{value}</span>
    <Icon.ChevDown width={12} height={12} className="text-[var(--mute)]"/>
  </div>
);

const LogisticsBlock = ({ smart, setSmart, type }) => (
  <Card className="p-4 mb-3">
    <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Logistics</div>
    {type === "Program" ? (
      <>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Field label="Frequency"><SelectBox value="Tue · Thu"/></Field>
          <Field label="Starts"><SelectBox value="Sep 15, 2025"/></Field>
          <Field label="Ends"><SelectBox value="Dec 19, 2025"/></Field>
        </div>
        <div className="p-2.5 rounded-[8px] bg-[var(--accent-wash)]/50 flex items-center gap-2">
          <Icon.Sparkle width={14} height={14} className="text-[var(--accent)]"/>
          <span className="text-[12px]"><b>28 sessions</b> will be generated · 2 skipped for public holidays · <button className="text-[var(--accent)] hover:underline">preview</button></span>
        </div>
      </>
    ) : (
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Field label="Date"><SelectBox value={smart.date} icon={Icon.Cal}/></Field>
        <Field label="From"><SelectBox value={smart.time} icon={Icon.Clock}/></Field>
        <Field label="To"><SelectBox value={smart.endTime} icon={Icon.Clock}/></Field>
        <Field label="Capacity"><SelectBox value={smart.capacity} icon={Icon.Users}/></Field>
      </div>
    )}
    <div className="grid grid-cols-2 gap-3">
      <Field label="Venue" hint="checks conflicts">
        <SelectBox value={smart.venue} icon={Icon.Pin}/>
      </Field>
      <Field label="Category">
        <SelectBox value={smart.category} icon={Icon.Tag}/>
      </Field>
    </div>
    {type === "Event" && (
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Toggle on={smart.qr} onToggle={v=>setSmart({...smart,qr:v})} icon={Icon.Qr} label="QR check-in" hint="Unique code per attendee"/>
        <Toggle on={true} onToggle={()=>{}} icon={Icon.ClipboardCheck} label="Waitlist" hint="Auto-promote on cancels"/>
      </div>
    )}
  </Card>
);

const VolunteerBlock = ({ smart, setSmart }) => (
  <Card className="p-4 mb-3">
    <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Volunteering details</div>
    <div className="grid grid-cols-3 gap-3">
      <Field label="Organisation"><SelectBox value="Red Crescent"/></Field>
      <Field label="Location"><SelectBox value="Corniche Beach" icon={Icon.Pin}/></Field>
      <Field label="Target hours per volunteer"><SelectBox value={`${smart.target} hours`} icon={Icon.Clock}/></Field>
      <Field label="Max volunteers"><SelectBox value="80"/></Field>
      <Field label="Applications"><SelectBox value="Open to students"/></Field>
      <Field label="Certificate"><SelectBox value="Auto-issue on complete" icon={Icon.Medal}/></Field>
    </div>
  </Card>
);

const TaskBlock = () => (
  <Card className="p-4 mb-3">
    <div className="flex items-center justify-between mb-3">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Subtasks</div>
      <button className="text-[12px] text-[var(--accent)] flex items-center gap-1"><Icon.Plus width={12} height={12}/>Add</button>
    </div>
    {["Book catering","Send calendar invite","Prepare handouts"].map((t,i) => (
      <div key={i} className="flex items-center gap-2.5 py-2 border-b hairline-2 last:border-0">
        <input type="checkbox" className="rounded"/>
        <span className="text-[13px] flex-1">{t}</span>
        <Avatar name={["Jane Doe","Hassan Q","Reem Abdulla"][i]} size={20}/>
        <span className="text-[11.5px] text-[var(--mute)] font-mono">Oct {20+i}</span>
      </div>
    ))}
  </Card>
);

const ExternalBlock = () => (
  <Card className="p-4 mb-3">
    <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">External event</div>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Organiser name"><SelectBox value="GITEX Global"/></Field>
      <Field label="Location"><SelectBox value="Dubai World Trade Centre"/></Field>
      <div className="col-span-2"><Field label="Registration URL"><SelectBox value="https://gitex.com/register"/></Field></div>
    </div>
  </Card>
);

const SelectBox = ({ value, icon:I }) => (
  <div className="flex items-center gap-1.5 h-8 px-2.5 border hairline rounded-[7px] bg-white text-[12.5px] hover:border-[#c6c9d1]">
    {I && <I width={12} height={12} className="text-[var(--mute)]"/>}
    <span className="flex-1 truncate">{value}</span>
    <Icon.ChevDown width={12} height={12} className="text-[var(--mute)]"/>
  </div>
);

const Toggle = ({ on, onToggle, icon:I, label, hint }) => (
  <button onClick={()=>onToggle(!on)} className={cx("flex items-start gap-2.5 p-2.5 rounded-[8px] border text-left transition-all", on ? "bg-[var(--accent-wash)] border-[var(--accent)]/30" : "hairline bg-white hover:border-[#c6c9d1]")}>
    <div className={cx("w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0", on ? "bg-white text-[var(--accent-ink)]" : "bg-[#f1f2ef] text-[var(--mute)]")}><I width={14} height={14}/></div>
    <div className="flex-1">
      <div className="text-[12.5px] font-semibold">{label}</div>
      <div className="text-[11px] text-[var(--mute)] leading-snug mt-0.5">{hint}</div>
    </div>
    <div className={cx("w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0", on ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[#c2c7d0]")}>
      {on && <Icon.Check width={10} height={10} className="text-white"/>}
    </div>
  </button>
);

const FlowStep = ({ n, title, by, hint, done, current }) => (
  <div className={cx("flex items-start gap-2.5 p-2 rounded-[8px]", current && "bg-[var(--accent-wash)]")}>
    <div className={cx("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-semibold", done ? "bg-[var(--ok)] text-white" : current ? "bg-[var(--accent)] text-white" : "bg-[#e8eaef] text-[var(--mute)]")}>
      {done ? <Icon.Check width={12} height={12}/> : n}
    </div>
    <div>
      <div className="text-[12px] font-medium">{title}</div>
      <div className="text-[10.5px] text-[var(--mute)]">{by || hint}</div>
    </div>
  </div>
);

window.Create = Create;
