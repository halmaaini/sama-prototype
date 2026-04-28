/* Activity Hub — multi-layout (list, board, calendar) with smart filters and inline actions */

const Hub = () => {
  const { go, hubLayout, setHubLayout, role } = useApp();
  const activities = useActivities();
  const [q, setQ] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [sort, setSort] = React.useState("date");
  const [savedView, setSavedView] = React.useState("all");
  const [selected, setSelected] = React.useState(new Set());
  const toast = useToast();

  const SAVED_VIEWS = [
    { id:"all",      label:"All activities",       count:activities.length },
    { id:"mine",     label:"Assigned to me",       count:role==="coord"?5:17 },
    { id:"pending",  label:"Needs approval",        count:activities.filter(a=>a.status==="Pending Approval").length },
    { id:"thisweek", label:"This week",             count:4 },
    { id:"risk",     label:"At risk",               count:2 },
  ];

  const list = activities.filter(a => {
    if (q && !a.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (typeFilter !== "All" && a.type !== typeFilter) return false;
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (savedView === "pending" && a.status !== "Pending Approval") return false;
    return true;
  });

  const sorted = [...list].sort((a,b) => {
    if (sort === "date") return a.dateIso.localeCompare(b.dateIso);
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  return (
    <div className="flex flex-col h-full">
      <HubHeader layout={hubLayout} setLayout={setHubLayout} savedView={savedView} setSavedView={setSavedView} views={SAVED_VIEWS} onNew={()=>go("create")} totalCount={activities.length}/>

      {/* Filter bar */}
      <div className="px-5 py-2.5 border-b hairline bg-[var(--surface)] flex items-center gap-2 flex-wrap">
        <Input icon={Icon.Search} placeholder="Filter by title, tag, venue…" value={q} onChange={e=>setQ(e.target.value)} className="w-[280px]" />
        <TypeFilter value={typeFilter} onChange={setTypeFilter}/>
        <Divider vertical/>
        <FilterChip label="Status" value={statusFilter} onChange={setStatusFilter} options={["All","Active","Draft","Pending Approval","Completed","Cancelled"]}/>
        <FilterChip label="Owner"  value="All"          onChange={()=>{}} options={["All","Me","Jane Doe","Hassan Qureshi","Reem Abdulla"]}/>
        <FilterChip label="Venue"  value="All"          onChange={()=>{}} options={["All", ...SAMA.VENUES.map(v=>v.name)]}/>
        <FilterChip label="Tag"    value="All"          onChange={()=>{}} options={["All","freshman","sports","community","career","academic"]}/>
        <span className="flex-1"/>
        <Segmented size="sm" value={sort} onChange={setSort} items={[{value:"date",label:"Date"},{value:"title",label:"A–Z"},{value:"status",label:"Status"}]}/>
      </div>

      <div className="flex-1 overflow-auto thin-scroll relative">
        {selected.size > 0 && (
          <BulkBar count={selected.size} clear={()=>setSelected(new Set())} onAction={(act)=>{
            toast.push({ text:`${act} applied to ${selected.size} activities`, icon:Icon.Check });
            setSelected(new Set());
          }}/>
        )}
        {hubLayout === "list"     && <HubList rows={sorted} selected={selected} setSelected={setSelected}/>}
        {hubLayout === "board"    && <HubBoard rows={sorted}/>}
        {hubLayout === "calendar" && <HubCalendar rows={sorted}/>}
        {hubLayout === "timeline" && <HubTimeline rows={sorted}/>}
      </div>
    </div>
  );
};

const HubHeader = ({ layout, setLayout, savedView, setSavedView, views, onNew, totalCount }) => {
  return (
    <div className="px-5 pt-4 pb-3 border-b hairline bg-[var(--surface)]">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight flex items-center gap-2.5">Activity Hub <span className="text-[var(--mute)] font-normal text-[13px]">{totalCount} total</span></h1>
          <div className="text-[12px] text-[var(--mute)] mt-0.5">Every event, program, volunteer drive, external, and task in one place.</div>
        </div>
        <div className="flex items-center gap-1.5">
          <Btn variant="outline" size="sm" icon={Icon.Download}>Export</Btn>
          <Btn variant="outline" size="sm" icon={Icon.Upload}>Import</Btn>
          <Btn variant="default" size="sm" icon={Icon.Plus} onClick={onNew}>New activity</Btn>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Saved Views */}
        <div className="flex items-center gap-1 overflow-x-auto thin-scroll">
          {views.map(v => (
            <button key={v.id} onClick={()=>setSavedView(v.id)} className={cx(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-[7px] text-[12.5px] font-medium transition-colors whitespace-nowrap",
              savedView === v.id ? "bg-[#eeefef] text-[var(--ink)]" : "text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[#f4f4f2]"
            )}>
              {v.label}
              <span className="text-[10.5px] text-[var(--mute)] font-mono">{v.count}</span>
            </button>
          ))}
          <Tooltip label="New saved view"><button className="w-7 h-7 rounded-[7px] hover:bg-[#f4f4f2] text-[var(--mute)] flex items-center justify-center ml-1"><Icon.Plus width={12} height={12}/></button></Tooltip>
        </div>

        <Segmented value={layout} onChange={setLayout} size="sm" items={[
          { value:"list",     icon:Icon.List,  label:"List" },
          { value:"board",    icon:Icon.Board, label:"Board" },
          { value:"calendar", icon:Icon.Cal,   label:"Calendar" },
          { value:"timeline", icon:Icon.Route, label:"Timeline" },
        ]}/>
      </div>
    </div>
  );
};

const TypeFilter = ({ value, onChange }) => (
  <div className="inline-flex items-center bg-white border hairline rounded-[7px] h-8 px-1 gap-[2px]">
    {["All","Event","Program","Volunteering","Task","External"].map(t => {
      const active = value === t;
      const m = SAMA.TYPE_META[t];
      return (
        <button key={t} onClick={()=>onChange(t)} className={cx(
          "h-[26px] px-2 rounded-[5px] text-[12px] font-medium flex items-center gap-1.5 transition-all",
          active ? "bg-[var(--ink)] text-white" : "text-[var(--mute)] hover:text-[var(--ink)]"
        )}>
          {m && <span className="w-[5px] h-[5px] rounded-full" style={{background: active ? "white" : m.dot}}/>}
          {t}
        </button>
      );
    })}
  </div>
);

const FilterChip = ({ label, value, options, onChange }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className={cx("inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[7px] text-[12.5px] transition-colors", value!=="All" ? "bg-[var(--accent-wash)] text-[var(--accent-ink)] font-medium" : "text-[var(--mute)] hover:bg-[#f4f4f2]")}>
        <span>{label}</span>
        {value !== "All" && <span className="font-medium">: {value}</span>}
        <Icon.ChevDown width={12} height={12}/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={()=>setOpen(false)}/>
          <div className="absolute top-full mt-1.5 left-0 bg-white border hairline rounded-[10px] shadow-float p-1 z-20 min-w-[180px] anim-fade-up">
            {options.map(o => (
              <button key={o} onClick={()=>{onChange(o);setOpen(false);}} className={cx("w-full text-left px-2 py-1.5 rounded-[6px] hover:bg-[#f4f4f2] text-[12.5px] flex items-center justify-between", o===value && "font-medium")}>
                {o}
                {o===value && <Icon.Check width={12} height={12} className="text-[var(--accent)]"/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const BulkBar = ({ count, clear, onAction }) => (
  <div className="sticky top-0 z-10 mx-5 mt-3 bg-[var(--ink)] text-white rounded-[10px] shadow-float flex items-center gap-3 px-3 py-2 anim-fade-up">
    <div className="text-[12.5px] font-medium">{count} selected</div>
    <Divider vertical className="bg-white/20"/>
    <button onClick={()=>onAction("Duplicate")} className="text-[12.5px] px-2 py-0.5 rounded-[5px] hover:bg-white/10 flex items-center gap-1.5"><Icon.Copy width={13} height={13}/> Duplicate</button>
    <button onClick={()=>onAction("Archive")} className="text-[12.5px] px-2 py-0.5 rounded-[5px] hover:bg-white/10 flex items-center gap-1.5"><Icon.Layers width={13} height={13}/> Archive</button>
    <button onClick={()=>onAction("Reassign")} className="text-[12.5px] px-2 py-0.5 rounded-[5px] hover:bg-white/10 flex items-center gap-1.5"><Icon.User width={13} height={13}/> Reassign</button>
    <button onClick={()=>onAction("Export CSV")} className="text-[12.5px] px-2 py-0.5 rounded-[5px] hover:bg-white/10 flex items-center gap-1.5"><Icon.Download width={13} height={13}/> Export</button>
    <span className="flex-1"/>
    <button onClick={clear} className="text-[12px] text-white/70 hover:text-white">Clear</button>
  </div>
);

/* ------------- List layout ------------- */
const HubList = ({ rows, selected, setSelected }) => {
  const { go } = useApp();
  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOn = rows.length > 0 && rows.every(r => selected.has(r.id));
  const toggleAll = () => setSelected(allOn ? new Set() : new Set(rows.map(r=>r.id)));

  return (
    <div className="px-5 py-3">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-[var(--mute)] [&>th]:font-medium [&>th]:py-1.5 [&>th]:px-2 border-b hairline">
            <th className="w-8"><input type="checkbox" checked={allOn} onChange={toggleAll}/></th>
            <th>Activity</th>
            <th className="w-[110px]">Type</th>
            <th className="w-[140px]">Date</th>
            <th className="w-[180px]">Venue</th>
            <th className="w-[140px]">Owner</th>
            <th className="w-[180px]">Progress</th>
            <th className="w-[120px]">Status</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(a => {
            const owner = SAMA.PEOPLE.find(p=>p.id===a.owner);
            const pct = a.capacity ? Math.min(100, (a.registered||0)/a.capacity*100) : (a.subtasks ? (a.subtasksDone/a.subtasks)*100 : null);
            return (
              <tr key={a.id} className={cx("border-b hairline-2 hover:bg-[#fafafa] group cursor-pointer", selected.has(a.id) && "bg-[var(--accent-wash)]/50")}
                  onClick={(e)=>{ if (e.target.tagName !== "INPUT") go("activity", a.id); }}>
                <td className="py-2 px-2" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={selected.has(a.id)} onChange={()=>toggle(a.id)}/></td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[7px] flex items-center justify-center shrink-0" style={{background: SAMA.TYPE_META[a.type].wash, color: SAMA.TYPE_META[a.type].ink}}>
                      {React.createElement(Icon[SAMA.TYPE_META[a.type].icon], { width:14, height:14 })}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--ink)] truncate">{a.title}</div>
                      <div className="text-[11px] text-[var(--mute)] flex items-center gap-1.5 mt-0.5">
                        {a.tags && a.tags.slice(0,2).map(t => <span key={t}>#{t}</span>)}
                        {a.qr && <><span>·</span><Icon.Qr width={11} height={11}/></>}
                        {a.public && <><span>·</span><Icon.Globe width={11} height={11}/></>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-2"><TypeChip type={a.type}/></td>
                <td className="py-2 px-2 text-[12px] text-[var(--ink-2)]"><div className="flex items-center gap-1.5"><Icon.Cal width={11} height={11} className="text-[var(--mute)]"/>{a.date}</div>{a.time && <div className="text-[11px] text-[var(--mute)] ml-[18px]">{a.time}</div>}</td>
                <td className="py-2 px-2 text-[12px] text-[var(--mute)] truncate">{a.venue || "—"}</td>
                <td className="py-2 px-2">{owner ? <div className="flex items-center gap-1.5"><Avatar name={owner.name} size={20}/><span className="text-[12px] truncate">{owner.name.split(" ")[0]}</span></div> : "—"}</td>
                <td className="py-2 px-2">
                  {pct != null ? (
                    <div className="flex items-center gap-2">
                      <Progress value={pct}/>
                      <span className="text-[11px] font-mono text-[var(--mute)] w-[44px] text-right">
                        {a.capacity ? `${a.registered}/${a.capacity}` : `${a.subtasksDone}/${a.subtasks}`}
                      </span>
                    </div>
                  ) : <span className="text-[11px] text-[var(--mute)]">—</span>}
                </td>
                <td className="py-2 px-2"><StatusChip status={a.status}/></td>
                <td className="py-2 px-2" onClick={e=>e.stopPropagation()}>
                  <button className="w-7 h-7 rounded-[6px] opacity-0 group-hover:opacity-100 hover:bg-[#eeefef] text-[var(--mute)] flex items-center justify-center"><Icon.DotsV width={13} height={13}/></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {rows.length === 0 && <EmptyState title="No activities match these filters" body="Try broadening your filters, or create a new activity."/>}
    </div>
  );
};

/* ------------- Board layout ------------- */
const HubBoard = ({ rows }) => {
  const cols = ["Draft","Pending Approval","Active","Completed"];
  return (
    <div className="flex gap-3 p-4 min-h-full">
      {cols.map(col => {
        const items = rows.filter(r => r.status === col);
        return (
          <div key={col} className="w-[300px] shrink-0 bg-[#f1f2ef] rounded-[10px] p-2.5 flex flex-col">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-semibold">{col}</span>
                <span className="text-[10.5px] font-mono text-[var(--mute)]">{items.length}</span>
              </div>
              <button className="w-5 h-5 rounded-[5px] hover:bg-black/5 text-[var(--mute)] flex items-center justify-center"><Icon.Plus width={12} height={12}/></button>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto thin-scroll">
              {items.map(a => <BoardCard key={a.id} a={a}/>)}
              {items.length === 0 && <div className="text-[11.5px] text-[var(--mute)] text-center py-6 border-2 border-dashed hairline rounded-[8px]">No items</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BoardCard = ({ a }) => {
  const { go } = useApp();
  const owner = SAMA.PEOPLE.find(p=>p.id===a.owner);
  const m = SAMA.TYPE_META[a.type];
  const pct = a.capacity ? Math.min(100,(a.registered||0)/a.capacity*100) : null;
  return (
    <button onClick={()=>go("activity",a.id)} className="text-left bg-white border hairline rounded-[8px] p-2.5 hover:shadow-soft hover:border-[#d7d9df] transition-all group">
      <div className="flex items-center justify-between mb-1.5">
        <TypeChip type={a.type}/>
        <span className="text-[10.5px] text-[var(--mute)]">{a.date}</span>
      </div>
      <div className="font-medium text-[13px] leading-snug text-[var(--ink)] mb-1.5 line-clamp-2">{a.title}</div>
      {a.venue && <div className="text-[11px] text-[var(--mute)] flex items-center gap-1"><Icon.Pin width={10} height={10}/>{a.venue}</div>}
      {pct != null && (
        <div className="mt-2.5">
          <Progress value={pct} color={m.dot}/>
          <div className="text-[10.5px] font-mono text-[var(--mute)] mt-1">{a.registered}/{a.capacity} registered</div>
        </div>
      )}
      <div className="mt-2.5 flex items-center justify-between">
        {owner && <Avatar name={owner.name} size={18}/>}
        <div className="flex items-center gap-1 text-[10.5px] text-[var(--mute)]">
          {a.qr && <Icon.Qr width={12} height={12}/>}
          {a.public && <Icon.Globe width={12} height={12}/>}
        </div>
      </div>
    </button>
  );
};

/* ------------- Calendar layout ------------- */
const HubCalendar = ({ rows }) => {
  const weeks = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ];
  const byDay = {};
  rows.forEach(r => {
    const d = parseInt(r.dateIso.split("-")[2]);
    if (r.dateIso.startsWith("2025-10") && d) {
      (byDay[d] = byDay[d] || []).push(r);
    }
  });
  // Add some for September and November so it looks varied
  const add = (d, ids) => { byDay[d] = ids.map(id => SAMA.ACTIVITIES.find(a=>a.id===id)).filter(Boolean); };
  add(10, ["a1"]); add(5, ["a3"]); add(15, ["a11"]); add(20, ["a16"]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" icon={Icon.ChevLeft}>Sep</Btn>
          <h3 className="text-[15px] font-semibold tracking-tight px-2">October 2025</h3>
          <Btn variant="outline" size="sm" trailingIcon={Icon.ChevRight}>Nov</Btn>
          <Btn variant="ghost" size="sm">Today</Btn>
        </div>
        <Segmented size="sm" value="month" onChange={()=>{}} items={[{value:"month",label:"Month"},{value:"week",label:"Week"},{value:"day",label:"Day"}]}/>
      </div>
      <div className="grid grid-cols-7 border hairline rounded-[10px] overflow-hidden bg-white">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} className="px-2 py-1.5 text-[11px] font-semibold text-[var(--mute)] border-b hairline-2 bg-[#fafafa]">{d}</div>
        ))}
        {weeks.flat().map((d, i) => (
          <div key={i} className={cx("min-h-[108px] p-1.5 border-b border-r hairline-2 relative", !d && "bg-[#fafafa]")}>
            {d && (
              <>
                <div className="text-[11px] font-medium mb-1 flex items-center gap-1.5">
                  {d === 12 && <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-white text-[10px] font-semibold flex items-center justify-center">{d}</span>}
                  {d !== 12 && d}
                </div>
                <div className="space-y-1">
                  {(byDay[d] || []).slice(0,3).map(a => (
                    <div key={a.id} className="text-[10.5px] px-1.5 py-0.5 rounded-[4px] truncate cursor-pointer hover:opacity-80" style={{background: SAMA.TYPE_META[a.type].wash, color: SAMA.TYPE_META[a.type].ink}}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{background:SAMA.TYPE_META[a.type].dot}}/>{a.title}
                    </div>
                  ))}
                  {(byDay[d]||[]).length > 3 && <div className="text-[10px] text-[var(--mute)]">+{(byDay[d]||[]).length - 3} more</div>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------- Timeline layout ------------- */
const HubTimeline = ({ rows }) => {
  const weeks = ["W36","W37","W38","W39","W40","W41","W42","W43","W44","W45","W46","W47","W48"];
  const bars = rows.slice(0, 10).map((a, i) => {
    const start = Math.floor(Math.random()*6);
    const len = 1 + Math.floor(Math.random()*4);
    return { a, start, len:Math.min(len, weeks.length-start) };
  });
  return (
    <div className="p-4">
      <div className="bg-white border hairline rounded-[10px] overflow-hidden">
        <div className="grid" style={{gridTemplateColumns:`240px repeat(${weeks.length}, 1fr)`}}>
          <div className="px-3 py-2 text-[11px] font-semibold text-[var(--mute)] bg-[#fafafa] border-b hairline border-r">Activity</div>
          {weeks.map(w => <div key={w} className="px-2 py-2 text-[11px] font-semibold text-[var(--mute)] bg-[#fafafa] border-b hairline border-r text-center">{w}</div>)}
          {bars.map((b,i) => (
            <React.Fragment key={i}>
              <div className="px-3 py-2.5 border-b hairline-2 border-r flex items-center gap-2 truncate">
                <span className="w-[6px] h-[6px] rounded-full" style={{background:SAMA.TYPE_META[b.a.type].dot}}/>
                <span className="text-[12.5px] truncate">{b.a.title}</span>
              </div>
              {weeks.map((w, wi) => (
                <div key={wi} className="relative h-10 border-b hairline-2 border-r">
                  {wi === b.start && (
                    <div className="absolute top-1.5 bottom-1.5 rounded-[6px] px-2 flex items-center text-[10.5px] text-white font-medium truncate" style={{background:SAMA.TYPE_META[b.a.type].dot, width:`calc(${b.len*100}% + ${(b.len-1)*1}px)`, left:4}}>
                      {b.a.title}
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Hub = Hub;
