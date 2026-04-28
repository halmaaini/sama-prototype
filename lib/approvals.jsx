/* Approvals inbox + review drawer — live-wired to the store */

const Approvals = () => {
  const { go } = useApp();
  const all = useActivities();
  const toast = useToast();
  const [filter, setFilter] = React.useState("pending");

  const pending = all.filter(a => a.status === "Pending Approval");
  const approved = all.filter(a => a.status === "Active" || a.status === "Completed");
  const rejected = all.filter(a => a.status === "Rejected");

  const visible = filter === "pending" ? pending : filter === "approved" ? approved : rejected;
  const [activeId, setActiveId] = React.useState(null);
  const sel = visible.find(i=>i.id===activeId) || visible[0];

  React.useEffect(() => {
    if (!sel && visible[0]) setActiveId(visible[0].id);
  }, [filter, visible.length]);

  const checks = sel ? { venue:true, clash:true, budget: (sel.capacity||0) <= 500, waiver:true } : {};

  const onApprove = () => {
    if (!sel) return;
    approve(sel.id);
    toast.push({text:`Approved — ${sel.title} is now live`, icon:Icon.CheckCircle});
  };
  const onReject = () => {
    if (!sel) return;
    reject(sel.id, "Does not meet policy");
    toast.push({text:`Rejected — submitter notified`, icon:Icon.X});
  };
  const onRequestChanges = () => {
    if (!sel) return;
    requestChanges(sel.id, "Please revise budget and resubmit");
    toast.push({text:`Sent back to draft with comments`, icon:Icon.Send});
  };

  return (
    <div className="h-full grid grid-cols-[360px,1fr] overflow-hidden">
      <div className="border-r hairline flex flex-col bg-[var(--surface)]">
        <div className="px-4 pt-4 pb-2 border-b hairline">
          <h1 className="text-[18px] font-semibold tracking-tight flex items-center gap-2">Approvals <Chip tone="amber">{pending.length} pending</Chip></h1>
          <div className="text-[11.5px] text-[var(--mute)] mt-0.5">SLA · 24h. Escalations route to Dean's office.</div>
          <div className="mt-3 flex items-center gap-1">
            <Segmented size="sm" value={filter} onChange={setFilter} items={[
              {value:"pending",label:`Pending ${pending.length}`},
              {value:"approved",label:`Approved ${approved.length}`},
              {value:"rejected",label:`Rejected ${rejected.length}`},
            ]}/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll">
          {visible.length === 0 && <div className="p-6 text-[12px] text-[var(--mute)] text-center">No items in this bucket yet.</div>}
          {visible.map(a => (
            <button key={a.id} onClick={()=>setActiveId(a.id)} className={cx("w-full text-left px-4 py-3 border-b hairline-2 hover:bg-[#fafafa] transition-colors relative", sel?.id===a.id && "bg-[var(--accent-wash)]/40")}>
              {sel?.id===a.id && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--ink)]"/>}
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-[var(--warn)]"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5"><TypeChip type={a.type}/></div>
                  <div className="text-[13px] font-semibold truncate">{a.title}</div>
                  <div className="text-[11px] text-[var(--mute)] mt-0.5 flex items-center gap-2">
                    <Avatar name="Jane Doe" size={14}/><span className="truncate">Jane Doe</span>
                    <span>·</span><span>{a.date}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col overflow-hidden">
        {!sel ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[var(--mute)]">Select an item from the inbox.</div>
        ) : (
        <>
        <div className="px-6 py-4 border-b hairline flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5"><TypeChip type={sel.type}/><StatusChip status={sel.status}/></div>
            <h2 className="text-[20px] font-semibold tracking-tight">{sel.title}</h2>
            <div className="text-[12.5px] text-[var(--mute)] mt-1">{sel.date} · {sel.venue} · capacity {sel.capacity||"—"}</div>
          </div>
          {sel.status === "Pending Approval" && (
            <div className="flex items-center gap-2">
              <Btn variant="outline" size="sm" icon={Icon.Send} onClick={onRequestChanges}>Request changes</Btn>
              <Btn variant="outline" size="sm" icon={Icon.X} onClick={onReject}>Reject</Btn>
              <Btn variant="default" size="sm" icon={Icon.Check} onClick={onApprove}>Approve</Btn>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll p-6 grid grid-cols-[1fr,340px] gap-5">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Auto checks</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[["venue","Venue availability","Free on this date"],["clash","Calendar clash","No conflicts found"],["budget","Budget policy","Within term limit"],["waiver","Waivers & permits","All required uploaded"]].map(([k,l,h])=>{
                  const ok = checks[k];
                  return (
                    <div key={k} className={cx("p-3 rounded-[8px] border flex items-start gap-2.5", ok ? "border-[var(--ok-wash)] bg-[var(--ok-wash)]/40" : "border-[var(--warn-wash)] bg-[var(--warn-wash)]/40")}>
                      {ok ? <Icon.CheckCircle width={16} height={16} className="text-[var(--ok)] shrink-0 mt-0.5"/> : <Icon.AlertTri width={16} height={16} className="text-[var(--warn)] shrink-0 mt-0.5"/>}
                      <div><div className="text-[12.5px] font-semibold">{l}</div><div className="text-[11px] text-[var(--mute)] mt-0.5">{h}</div></div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Submission summary</div>
              <dl className="grid grid-cols-2 gap-y-2.5 text-[12.5px]">
                {[["Type",sel.type],["Date",`${sel.date} · ${sel.time||""}`],["Venue",sel.venue||"—"],["Capacity",sel.capacity||"—"],["Category",sel.category||"—"],["QR check-in",sel.qr?"Enabled":"Off"]].map(([k,v])=>(
                  <div key={k} className="flex gap-3"><dt className="text-[var(--mute)] w-[120px]">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-3"><Btn variant="outline" size="sm" icon={Icon.ChevRight} onClick={()=>go("activity", sel.id)}>Open full activity</Btn></div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Approval chain</div>
              <FlowStep n={1} title="Coordinator submits" by="Jane Doe" done/>
              <FlowStep n={2} title="Ops review" by={sel.status === "Pending Approval" ? "You · pending" : "Reem Abdulla · done"} done={sel.status !== "Pending Approval"} current={sel.status === "Pending Approval"}/>
              <FlowStep n={3} title="Goes live" hint={sel.status === "Active" || sel.status === "Completed" ? "Published to portal" : "On approval"} done={sel.status === "Active" || sel.status === "Completed"}/>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

window.Approvals = Approvals;
