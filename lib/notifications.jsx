/* Notifications center */

const Notifications = () => {
  const [filter, setFilter] = React.useState("all");
  const items = [
    { kind:"approval", icon:"Shield", title:"Freshman Welcome Carnival awaiting your review", body:"Submitted by Jane Doe · SLA 2h 14m", when:"2h", priority:"high", unread:true },
    { kind:"rsvp", icon:"ClipboardCheck", title:"47 new registrations for AI Ethics Workshop", body:"Capacity filling — 24% remaining", when:"3h", unread:true },
    { kind:"flag", icon:"AlertTri", title:"Calendar clash detected", body:"Photography Club and Film Night overlap Nov 6", when:"5h", unread:true },
    { kind:"feedback", icon:"Star", title:"Beach Cleanup feedback closed · avg 4.3", body:"28 responses · 3 action items flagged", when:"1d" },
    { kind:"cert", icon:"Medal", title:"28 certificates auto-issued", body:"Volunteering hours threshold reached", when:"1d" },
    { kind:"system", icon:"Rocket", title:"Term 1 budget 67% utilised", body:"On track. Sports allocation trending high.", when:"2d" },
    { kind:"message", icon:"Send", title:"Reem Abdulla commented on 'AI Ethics Workshop'", body:"\"Catering line item a little high — can we negotiate?\"", when:"2d" },
    { kind:"rsvp", icon:"Users", title:"Waitlist promoted 3 students", body:"Confirmed for Men's Football Nov 2", when:"3d" },
  ];
  const shown = filter==="all" ? items : items.filter(i => i.unread);
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold tracking-tight">Notifications</h1><div className="text-[12px] text-[var(--mute)]">Approvals, registrations, flags — what needs your attention.</div></div>
        <div className="flex items-center gap-2"><Segmented size="sm" value={filter} onChange={setFilter} items={[{value:"all",label:"All"},{value:"unread",label:"Unread 3"}]}/><Btn variant="outline" size="sm" icon={Icon.Check}>Mark all read</Btn><Btn variant="outline" size="sm" icon={Icon.Settings}>Preferences</Btn></div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll p-6 max-w-[900px] mx-auto w-full">
        <div className="space-y-2">
          {shown.map((n,i) => {
            const I = Icon[n.icon];
            const tone = n.priority==="high"?"bad":n.kind==="feedback"?"amber":n.kind==="cert"?"indigo":"accent";
            const colors = { bad:"var(--bad)", amber:"var(--amber)", indigo:"var(--accent)", accent:"var(--accent)" };
            return (
              <Card key={i} className={cx("p-3.5 flex items-start gap-3 hover:shadow-soft transition-shadow cursor-pointer", n.unread && "bg-[var(--accent-wash)]/30")}>
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{background:`${colors[tone]}15`, color:colors[tone]}}><I width={16} height={16}/></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold truncate">{n.title}</span>
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"/>}
                    {n.priority==="high" && <Chip tone="amber">High priority</Chip>}
                  </div>
                  <div className="text-[11.5px] text-[var(--mute)] mt-0.5">{n.body}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-[var(--mute-2)] font-mono">{n.when}</span>
                  <button className="w-6 h-6 rounded-[5px] hover:bg-[#eeefef] text-[var(--mute)] flex items-center justify-center"><Icon.DotsV width={12} height={12}/></button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

window.Notifications = Notifications;
