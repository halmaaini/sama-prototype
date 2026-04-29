/* Clubs Module — directory of student clubs with members, activities, requests */

const Clubs = () => {
  const { go } = useApp();
  const [sel, setSel] = React.useState(SAMA.CLUBS[0].id);
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("All");
  const [tab, setTab] = React.useState("overview");

  // Pending requests state per club — seeded from CLUBS.pendingRequests count
  const seedRequests = () => {
    const map = {};
    SAMA.CLUBS.forEach((c, ci) => {
      const reasons = [
        "Interested in joining the events team",
        "Want to learn and contribute to projects",
        "Recommended by a friend",
        "Looking for community and skill-building",
        "Returning member from last semester",
      ];
      map[c.id] = Array.from({length: c.pendingRequests}).map((_, i) => {
        const p = SAMA.PEOPLE[(ci*4 + i + 7) % SAMA.PEOPLE.length];
        return { id:`${c.id}-r${i}`, person:p, applied:`Oct ${10+i*3}, 2025`, reason: reasons[(ci+i) % reasons.length] };
      });
    });
    return map;
  };
  const [requests, setRequests] = React.useState(seedRequests);

  const toast = useToast();

  const clubs = SAMA.CLUBS.filter(c => {
    if (filter === "Active" && c.status !== "Active") return false;
    if (filter === "Pending" && c.status !== "Pending") return false;
    if (q && !(c.name.toLowerCase().includes(q.toLowerCase()) || c.leader.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const club = SAMA.CLUBS.find(c => c.id === sel) || clubs[0] || SAMA.CLUBS[0];
  const clubRequests = requests[club.id] || [];

  // Members: leader + officers + members, derived deterministically
  const memberSize = Math.min(club.members, 14);
  const members = SAMA.PEOPLE.slice(0, memberSize).map((p, i) => ({
    ...p,
    role: i === 0 ? "Leader" : (i === 1 ? "Vice" : i === 2 ? "Secretary" : "Member"),
    joined: ["Sep 2024","Oct 2024","Nov 2024","Jan 2025","Feb 2025","Mar 2025","May 2025","Aug 2025","Sep 2025","Sep 2025","Oct 2025","Oct 2025","Oct 2025","Oct 2025"][i],
  }));
  members[0] = { ...members[0], name: club.leader };

  // Activities owned by this club's leader
  const clubActivities = SAMA.ACTIVITIES.filter(a => a.owner === club.leaderId);
  const totalHours = clubActivities.reduce((s, a) => s + (a.hoursTarget || 0), 0);

  const approve = (rid) => {
    setRequests(prev => ({ ...prev, [club.id]: prev[club.id].filter(r => r.id !== rid) }));
    toast.push({ text:"Approved · welcome email sent", icon:Icon.CheckCircle });
  };
  const decline = (rid) => {
    setRequests(prev => ({ ...prev, [club.id]: prev[club.id].filter(r => r.id !== rid) }));
    toast.push({ text:"Application declined" });
  };

  const tabs = [
    ["overview","Overview","Building"],
    ["members","Members","Users"],
    ["activities","Activities","Star"],
    ["requests","Pending requests","Flag"],
  ];

  const totalPending = Object.values(requests).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="h-full grid grid-cols-[340px,1fr]">
      {/* Sidebar */}
      <div className="border-r hairline bg-[var(--surface)] flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b hairline">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-semibold tracking-tight">Clubs</h1>
            <Btn variant="default" size="sm" icon={Icon.Plus} onClick={() => toast.push({ text:"Create new club — coming soon" })}>New club</Btn>
          </div>
          <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{SAMA.CLUBS.length} clubs · {totalPending} pending applications</div>
          <div className="mt-3"><Segmented size="sm" value={filter} onChange={setFilter} items={[{value:"All",label:"All"},{value:"Active",label:"Active"},{value:"Pending",label:"Pending"}]}/></div>
          <div className="mt-2"><Input icon={Icon.Search} size="sm" placeholder="Search clubs or leaders…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll">
          {clubs.map(c => {
            const pendingCount = (requests[c.id] || []).length;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className={cx("w-full flex items-center gap-3 px-4 py-3 border-b hairline-2 hover:bg-[#fafafa] text-left", sel===c.id && "bg-[var(--accent-wash)]/40")}>
                <div className="w-1.5 self-stretch rounded-full" style={{background: c.color}}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="text-[13px] font-medium truncate flex-1">{c.name}</div>
                    {c.joined && <Icon.Star width={11} height={11} className="text-[var(--amber)] shrink-0"/>}
                  </div>
                  <div className="text-[11px] text-[var(--mute)] truncate">{c.leader} · {c.members} members</div>
                </div>
                {pendingCount > 0 && (
                  <span className="chip bg-[var(--warn-wash)] text-[var(--warn)] shrink-0">{pendingCount}</span>
                )}
              </button>
            );
          })}
          {clubs.length === 0 && <div className="p-6 text-center text-[12px] text-[var(--mute)]">No clubs match your search.</div>}
        </div>
      </div>

      {/* Detail */}
      <div className="overflow-y-auto thin-scroll flex flex-col">
        <div className="border-b hairline">
          <div className="h-2.5" style={{background: club.color}}/>
          <div className="p-6 pb-4 flex items-start gap-5">
            <div className="w-14 h-14 rounded-[12px] flex items-center justify-center text-white text-[22px] font-semibold shadow-soft shrink-0" style={{background: club.color}}>
              {club.name.split(" ").filter(w => w[0] && w[0].match(/[A-Z]/)).slice(0,2).map(w => w[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-[22px] font-semibold tracking-tight">{club.name}</h2>
                <Chip tone="indigo">{club.category}</Chip>
                <Chip tone={club.status==="Active"?"green":"amber"}>{club.status}</Chip>
                {club.joined && <Chip tone="amber"><Icon.Star width={10} height={10}/>You're a member</Chip>}
              </div>
              <div className="text-[12.5px] text-[var(--mute)]">Founded {club.founded} · advised by {club.advisor} · {club.email}</div>
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <Btn variant="outline" size="sm" icon={Icon.Send}>Message leader</Btn>
                <Btn variant="outline" size="sm" icon={Icon.Edit}>Edit club</Btn>
                <Btn variant="ghost" size="sm" icon={Icon.X}>Suspend</Btn>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center shrink-0">
              <div><div className="text-[22px] font-semibold">{club.members}</div><div className="text-[10.5px] text-[var(--mute)]">Members</div></div>
              <div><div className="text-[22px] font-semibold">{clubActivities.length}</div><div className="text-[10.5px] text-[var(--mute)]">Activities</div></div>
            </div>
          </div>
          <div className="px-6 flex items-center gap-0.5 -mb-px">
            {tabs.map(([id, label, icon]) => {
              const I = Icon[icon];
              const isReqTab = id === "requests";
              const reqBadge = isReqTab && clubRequests.length > 0;
              return (
                <button key={id} onClick={() => setTab(id)} className={cx("px-3 h-9 text-[12.5px] font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors", tab===id ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--mute)] hover:text-[var(--ink)]")}>
                  <I width={13} height={13}/>{label}
                  {reqBadge && <span className="chip bg-[var(--warn-wash)] text-[var(--warn)]">{clubRequests.length}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {tab === "overview" && (
            <div className="p-6 grid grid-cols-[1fr,300px] gap-5">
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">About</div>
                  <div className="text-[13px] leading-relaxed text-[var(--ink-2)]">{club.description}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Recent activities</div>
                  {clubActivities.length === 0 ? (
                    <div className="text-[12px] text-[var(--mute)]">No activities yet.</div>
                  ) : clubActivities.slice(0,4).map(a => (
                    <div key={a.id} onClick={() => go("activity", a.id)} className="flex items-center gap-3 py-2 border-b hairline-2 last:border-0 cursor-pointer hover:bg-[#fafafa] -mx-2 px-2 rounded-[6px]">
                      <div className="w-8 h-8 rounded-[7px] flex items-center justify-center" style={{background:SAMA.TYPE_META[a.type].wash, color:SAMA.TYPE_META[a.type].ink}}>
                        {React.createElement(Icon[SAMA.TYPE_META[a.type].icon], { width:13, height:13 })}
                      </div>
                      <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium truncate">{a.title}</div><div className="text-[11px] text-[var(--mute)]">{a.date} · {a.type}</div></div>
                      <Chip tone={a.status==="Active"?"green":a.status==="Completed"?"slate":"amber"}>{a.status}</Chip>
                    </div>
                  ))}
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Leadership</div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar name={club.leader} size={32}/>
                    <div className="flex-1"><div className="text-[12.5px] font-medium">{club.leader}</div><div className="text-[11px] text-[var(--mute)]">President · Club Leader</div></div>
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar name={club.advisor} size={32}/>
                    <div className="flex-1"><div className="text-[12.5px] font-medium">{club.advisor}</div><div className="text-[11px] text-[var(--mute)]">Faculty advisor</div></div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Meetings & contact</div>
                  <div className="space-y-2 text-[12.5px]">
                    <div className="flex items-center gap-2"><Icon.Cal width={12} height={12} className="text-[var(--mute)]"/>{club.meeting}</div>
                    <div className="flex items-center gap-2"><Icon.Pin width={12} height={12} className="text-[var(--mute)]"/>{club.room}</div>
                    <div className="flex items-center gap-2"><Icon.Send width={12} height={12} className="text-[var(--mute)]"/>{club.email}</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-2">This term</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div><div className="text-[18px] font-semibold">{clubActivities.length}</div><div className="text-[10px] text-[var(--mute)]">Activities</div></div>
                    <div><div className="text-[18px] font-semibold">{totalHours}</div><div className="text-[10px] text-[var(--mute)]">Vol hours</div></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "members" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">{club.members} members</div>
                <Btn variant="outline" size="sm" icon={Icon.Plus}>Add member</Btn>
              </div>
              <Card className="p-0 overflow-hidden">
                <table className="w-full text-[12.5px]">
                  <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
                    <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                      <th>Member</th><th>Department</th><th>Role</th><th>Joined</th><th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m,i) => (
                      <tr key={i} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                        <td className="px-4 py-2"><div className="flex items-center gap-2"><Avatar name={m.name} size={22}/><div><div className="font-medium text-[var(--ink)]">{m.name}</div><div className="text-[11px] text-[var(--mute)]">{m.sid || m.email}</div></div></div></td>
                        <td className="px-4 py-2 text-[var(--mute)]">{m.dept}</td>
                        <td className="px-4 py-2"><Chip tone={m.role==="Leader"?"indigo":m.role==="Vice"?"teal":m.role==="Secretary"?"teal":"slate"}>{m.role}</Chip></td>
                        <td className="px-4 py-2 text-[var(--mute)] text-[11.5px]">{m.joined}</td>
                        <td className="px-4 py-2"><button className="text-[var(--mute)] hover:text-[var(--ink)]"><Icon.DotsV width={13} height={13}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              {club.members > memberSize && (
                <div className="text-center text-[11.5px] text-[var(--mute)] mt-3">Showing {memberSize} of {club.members} · <button className="text-[var(--accent)] hover:underline">View all</button></div>
              )}
            </div>
          )}

          {tab === "activities" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)]">Activities organised by this club</div>
                <Btn variant="default" size="sm" icon={Icon.Plus} onClick={() => go("create")}>New activity</Btn>
              </div>
              {clubActivities.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-[13px] font-medium mb-1">No activities yet</div>
                  <div className="text-[12px] text-[var(--mute)] mb-3">This club hasn't organised any activities. Club leader can create one.</div>
                  <Btn variant="outline" size="sm" icon={Icon.Plus} onClick={() => go("create")}>Create activity</Btn>
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden">
                  <table className="w-full text-[12.5px]">
                    <thead className="bg-[#fafafa] border-b hairline-2 text-left text-[var(--mute)]">
                      <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                        <th>Activity</th><th>Type</th><th>Date</th><th>Status</th><th>Registrations</th><th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubActivities.map(a => (
                        <tr key={a.id} onClick={() => go("activity", a.id)} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa] cursor-pointer">
                          <td className="px-4 py-2 font-medium">{a.title}</td>
                          <td className="px-4 py-2"><TypeChip type={a.type}/></td>
                          <td className="px-4 py-2 text-[var(--mute)] font-mono text-[11.5px]">{a.date}</td>
                          <td className="px-4 py-2"><StatusChip status={a.status}/></td>
                          <td className="px-4 py-2 text-[var(--mute)]">{a.registered ? `${a.registered}${a.capacity ? `/${a.capacity}` : ""}` : "—"}</td>
                          <td className="px-4 py-2"><Icon.ChevRight width={13} height={13} className="text-[var(--mute-2)]"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {tab === "requests" && (
            <div className="p-6">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">{clubRequests.length} pending application{clubRequests.length===1?"":"s"}</div>
              {clubRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <Icon.CheckCircle width={28} height={28} className="text-[var(--ok)] mx-auto mb-2"/>
                  <div className="text-[13px] font-medium mb-1">All caught up</div>
                  <div className="text-[12px] text-[var(--mute)]">No pending membership requests for this club.</div>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {clubRequests.map(r => (
                    <Card key={r.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar name={r.person.name} size={36}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-[13.5px] font-semibold">{r.person.name}</div>
                            <span className="text-[11.5px] text-[var(--mute)]">{r.person.sid || r.person.email}</span>
                            <Chip tone="slate">{r.person.dept}</Chip>
                          </div>
                          <div className="text-[11.5px] text-[var(--mute)] mt-0.5 flex items-center gap-1"><Icon.Cal width={11} height={11}/>Applied {r.applied}</div>
                          <div className="mt-2 text-[12px] text-[var(--ink-2)] italic">"{r.reason}"</div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Btn variant="outline" size="sm" icon={Icon.X} onClick={() => decline(r.id)}>Decline</Btn>
                          <Btn variant="default" size="sm" icon={Icon.Check} onClick={() => approve(r.id)}>Approve</Btn>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.Clubs = Clubs;
