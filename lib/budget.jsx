/* Budget tracking tab — §12 of the PRD */

const fmtAed = (n) => {
  if (n == null) return "—";
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0 });
};

const pctOf = (a, b) => (b > 0 ? Math.min(Math.round((a / b) * 100), 100) : 0);

const CATEGORY_TONE = { Catering:"teal", Venue:"indigo", Supplies:"slate", Prizes:"amber", Transport:"rose", Other:"slate" };

/* ── Stat card ──────────────────────────────────────────────────────────── */
const BudgetCard = ({ label, value, sub, tone="neutral" }) => {
  const valueColor = { neutral:"text-[var(--ink)]", ok:"text-[var(--ok)]", warn:"text-[var(--warn)]", bad:"text-[var(--bad)]" }[tone];
  return (
    <Card className="p-4">
      <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-1.5">{label}</div>
      <div className={cx("text-[20px] font-semibold tracking-tight leading-none font-mono", valueColor)}>{value}</div>
      {sub && <div className="text-[11px] text-[var(--mute)] mt-1.5 leading-tight">{sub}</div>}
    </Card>
  );
};

/* ── Alert banner ───────────────────────────────────────────────────────── */
const AlertBanner = ({ tone="warn", children }) => {
  const styles = {
    warn: "border-[var(--warn)] bg-[var(--warn-wash)] text-[var(--warn)]",
    bad:  "border-[var(--bad)]  bg-[var(--bad-wash)]  text-[var(--bad)]",
    info: "border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent-ink)]",
    ok:   "border-[var(--ok)] bg-[var(--ok-wash)] text-[var(--ok)]",
  }[tone];
  const IconComp = tone === "bad" ? Icon.AlertTri : tone === "ok" ? Icon.CheckCircle : tone === "info" ? Icon.Info : Icon.AlertTri;
  return (
    <div className={cx("rounded-[10px] border px-4 py-3 flex items-start gap-3", styles)}>
      <IconComp width={15} height={15} className="shrink-0 mt-0.5"/>
      <div className="text-[12.5px] leading-relaxed">{children}</div>
    </div>
  );
};

/* ── Add transaction modal ──────────────────────────────────────────────── */
const AddTransactionModal = ({ onClose, onAdd }) => {
  const [amount, setAmount]     = React.useState("");
  const [category, setCategory] = React.useState("Catering");
  const [vendor, setVendor]     = React.useState("");
  const [notes, setNotes]       = React.useState("");

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || !vendor.trim()) return;
    onAdd({ id:"bt"+Date.now(), type:"expense", amount:n, category, vendor:vendor.trim(), occurredAt:"Today", source:"coordinator", notes:notes.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-[16px] shadow-float w-[420px]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b hairline">
          <div className="text-[14px] font-semibold">Record expense</div>
          <button onClick={onClose} className="w-7 h-7 rounded-[7px] hover:bg-[#f0f0f0] flex items-center justify-center text-[var(--mute)]">
            <Icon.X width={14} height={14}/>
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <div>
            <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">Amount (AED) <span className="text-[var(--bad)]">*</span></label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full h-9 px-3 rounded-[8px] border hairline text-[13px] font-mono bg-white focus:outline-none focus:border-[var(--accent)]"/>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-[8px] border hairline text-[13px] bg-white focus:outline-none focus:border-[var(--accent)]">
              {["Catering","Venue","Supplies","Prizes","Transport","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">Vendor / payee <span className="text-[var(--bad)]">*</span></label>
            <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Al Rawabi Catering"
              className="w-full h-9 px-3 rounded-[8px] border hairline text-[13px] bg-white focus:outline-none focus:border-[var(--accent)]"/>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-[var(--mute)] block mb-1">Notes <span className="text-[var(--mute-2)]">(optional)</span></label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 50% deposit — balance due on event day"
              className="w-full h-9 px-3 rounded-[8px] border hairline text-[13px] bg-white focus:outline-none focus:border-[var(--accent)]"/>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Btn variant="outline" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn variant="default" className="flex-1" icon={Icon.Plus} onClick={submit}
            disabled={!amount || !vendor}>Record expense</Btn>
        </div>
      </div>
    </div>
  );
};

/* ── Main Budget tab ────────────────────────────────────────────────────── */
const BudgetTab = ({ a }) => {
  const toast   = useToast();
  const { role } = useApp();

  const budgetSeed = (SAMA.BUDGETS || {})[a.id] || null;
  const txnSeed    = (SAMA.BUDGET_TXN || {})[a.id] || [];

  const [budget, setBudget]           = React.useState(budgetSeed);
  const [txns, setTxns]               = React.useState(txnSeed);
  const [showAdd, setShowAdd]         = React.useState(false);
  const [showChange, setShowChange]   = React.useState(false);
  const [chgAmount, setChgAmount]     = React.useState("");
  const [chgReason, setChgReason]     = React.useState("");
  const [pendingChg, setPendingChg]   = React.useState(budgetSeed?.pendingChangeRequest || null);

  const isManager = role === "mgr";

  /* Derived figures */
  const expTxns = txns.filter(t => t.type === "expense");
  const incTxns = txns.filter(t => t.type === "income");
  const actualSpent   = expTxns.reduce((s, t) => s + t.amount, 0);
  const actualRevenue = incTxns.reduce((s, t) => s + t.amount, 0);

  const planned  = budget?.plannedAmount  ?? null;
  const approved = budget?.approvedAmount ?? null;
  const studentContrib = budget?.studentContribution ?? 0;
  const remaining = approved != null ? approved - actualSpent : null;
  const spentPct  = pctOf(actualSpent, approved ?? 0);

  const isOverBudget  = approved != null && actualSpent > approved;
  const isNearLimit   = !isOverBudget && spentPct >= 80;
  const canRecord     = a.status === "Active";

  /* Registration fee validation (detailed mode) */
  const regCount = a.registered || 0;
  const impliedPerStudent = (budget?.mode === "detailed" && studentContrib > 0 && regCount > 0)
    ? Math.round(studentContrib / regCount) : null;
  const showFeeWarn = budget?.mode === "detailed" && impliedPerStudent != null
    && a.fee != null && impliedPerStudent !== a.fee;

  /* Expected revenue (from budget lines or fee × registrations) */
  const expectedRevenue = studentContrib > 0
    ? studentContrib
    : (a.fee && regCount > 0 ? a.fee * regCount : 0);
  const pendingRevenue = Math.max(0, expectedRevenue - actualRevenue);

  /* Actions */
  const addTxn = (txn) => {
    setTxns(prev => [...prev, txn]);
    toast.push({ text: `${fmtAed(txn.amount)} recorded`, icon: Icon.CheckCircle });
  };

  const delTxn = (id) => {
    setTxns(prev => prev.filter(t => t.id !== id));
    toast.push({ text: "Transaction removed" });
  };

  const submitChangeReq = () => {
    const n = parseFloat(chgAmount);
    if (!n || !chgReason.trim()) return;
    setPendingChg({ requestedAmount: n, reason: chgReason.trim(), submittedAt: "just now" });
    setShowChange(false);
    setChgAmount("");
    setChgReason("");
    toast.push({ text: "Budget increase request submitted", icon: Icon.Send });
  };

  const approveChangeReq = () => {
    setBudget(b => ({ ...b, approvedAmount: pendingChg.requestedAmount }));
    setPendingChg(null);
    toast.push({ text: `Budget updated to ${fmtAed(pendingChg.requestedAmount)}`, icon: Icon.CheckCircle });
  };

  const rejectChangeReq = () => {
    setPendingChg(null);
    toast.push({ text: "Budget change request rejected" });
  };

  /* ── No budget set ─────────────────────────────────────────────────── */
  if (!budget) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-6 gap-3">
          {[["Planned","—"],["Approved","—"],["Spent","AED 0"],["Remaining","—"],["Expected revenue","—"],["Received","AED 0"]].map(([l,v]) => (
            <BudgetCard key={l} label={l} value={v}/>
          ))}
        </div>
        <Card className="p-10 flex flex-col items-center text-center border-2 border-dashed hairline">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--accent-wash)] flex items-center justify-center mb-4">
            <Icon.Chart width={22} height={22} className="text-[var(--accent)]"/>
          </div>
          <div className="text-[14px] font-semibold mb-1.5">No budget configured</div>
          <div className="text-[12.5px] text-[var(--mute)] mb-5 max-w-sm leading-relaxed">
            Add a planned budget to track spend, approve allocations, and reconcile student revenue.
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" icon={Icon.Plus}
              onClick={() => setBudget({ mode:"simple", plannedAmount:null, approvedAmount:null, studentContribution:0, currency:"AED", lineItems:[], pendingChangeRequest:null })}>
              Simple budget
            </Btn>
            <Btn variant="default" size="sm" icon={Icon.Chart}
              onClick={() => setBudget({ mode:"detailed", plannedAmount:null, approvedAmount:null, studentContribution:0, currency:"AED", lineItems:[], pendingChangeRequest:null })}>
              Detailed with line items
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Budget is set ─────────────────────────────────────────────────── */
  return (
    <div className="p-6 space-y-4 anim-fade-up">

      {/* PRF reminder banner */}
      <AlertBanner tone="warn">
        <span className="font-semibold">Purchase Request Form required.</span>{" "}
        A PRF must be submitted and approved before spend begins. Use the standard paper process —
        full PRF tracking is coming in a future update.
      </AlertBanner>

      {/* Fee mismatch warning */}
      {showFeeWarn && (
        <AlertBanner tone="warn">
          <span className="font-semibold">Registration fee mismatch.</span>{" "}
          Student-funded budget lines imply AED {impliedPerStudent}/student, but the registration fee is set to AED {a.fee} —
          update one to keep them aligned.
        </AlertBanner>
      )}

      {/* Over-budget */}
      {isOverBudget && (
        <AlertBanner tone="bad">
          <span className="font-semibold">Over budget.</span>{" "}
          Spend ({fmtAed(actualSpent)}) exceeds approved amount ({fmtAed(approved)}) by {fmtAed(actualSpent - approved)}.
          Submit a budget increase request or adjust your transactions.
        </AlertBanner>
      )}

      {/* Near 80% */}
      {isNearLimit && (
        <AlertBanner tone="warn">
          <span className="font-semibold">{spentPct}% of budget used.</span>{" "}
          Approaching the approved limit. Consider requesting a budget increase if more spend is needed.
        </AlertBanner>
      )}

      {/* Pending change request banner */}
      {pendingChg && (
        <div className={cx("rounded-[10px] border px-4 py-3 flex items-start gap-3",
          isManager ? "border-[var(--accent)] bg-[var(--accent-wash)]" : "border-[var(--line)] bg-[#fafafa]")}>
          <Icon.Send width={15} height={15} className={cx("shrink-0 mt-0.5", isManager ? "text-[var(--accent)]" : "text-[var(--mute)]")}/>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold">
              Budget increase request · {fmtAed(pendingChg.requestedAmount)}
            </div>
            <div className="text-[11.5px] text-[var(--mute)] mt-0.5 truncate">
              "{pendingChg.reason}" · {pendingChg.submittedAt}
            </div>
          </div>
          {isManager ? (
            <div className="flex gap-1.5 shrink-0">
              <Btn variant="default" size="sm" onClick={approveChangeReq}>Approve</Btn>
              <Btn variant="outline" size="sm" onClick={rejectChangeReq}>Reject</Btn>
            </div>
          ) : (
            <Chip tone="amber">Awaiting Manager</Chip>
          )}
        </div>
      )}

      {/* Six stat cards */}
      <div className="grid grid-cols-6 gap-3">
        <BudgetCard
          label="Planned"
          value={fmtAed(planned)}
          sub={budget.mode === "detailed" ? "From line items" : "Simple mode"}
        />
        <BudgetCard
          label="Approved"
          value={fmtAed(approved)}
          sub={approved == null ? "Pending Manager approval" : "Set at approval"}
          tone={approved == null ? "neutral" : "neutral"}
        />
        <BudgetCard
          label="Spent"
          value={actualSpent === 0 ? "AED 0" : fmtAed(actualSpent)}
          sub={approved != null ? `${spentPct}% of approved` : ""}
          tone={isOverBudget ? "bad" : isNearLimit ? "warn" : "neutral"}
        />
        <BudgetCard
          label="Remaining"
          value={remaining != null ? fmtAed(Math.abs(remaining)) : "—"}
          sub={remaining != null ? (remaining < 0 ? "Over budget" : "Available") : ""}
          tone={remaining != null && remaining < 0 ? "bad" : remaining != null && remaining < (approved * 0.2) ? "warn" : "neutral"}
        />
        <BudgetCard
          label="Expected revenue"
          value={expectedRevenue > 0 ? fmtAed(expectedRevenue) : "—"}
          sub={studentContrib > 0 ? "From student-funded lines" : a.fee ? `${regCount} × AED ${a.fee}` : "No student fees"}
        />
        <BudgetCard
          label="Received"
          value={actualRevenue > 0 ? fmtAed(actualRevenue) : "AED 0"}
          sub={actualRevenue > 0 ? "Via finance system" : "Awaiting payment"}
          tone={actualRevenue > 0 ? "ok" : "neutral"}
        />
      </div>

      {/* Spend progress bar */}
      {approved != null && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[12.5px] font-medium">Spend progress</div>
            <div className="text-[12px] text-[var(--mute)] font-mono">
              {fmtAed(actualSpent)} of {fmtAed(approved)} approved
            </div>
          </div>
          <Progress
            value={spentPct}
            color={isOverBudget ? "var(--bad)" : isNearLimit ? "var(--warn)" : "var(--ok)"}
          />
          <div className="flex justify-between text-[10.5px] text-[var(--mute)] mt-1.5">
            <span>{spentPct}% used</span>
            <span>{remaining != null && remaining >= 0 ? `${fmtAed(remaining)} remaining` : "Over budget"}</span>
          </div>
        </Card>
      )}

      {/* Main two-column body */}
      <div className="grid grid-cols-[1fr_280px] gap-4">

        {/* ── Left column ─────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Line items table — detailed mode */}
          {budget.mode === "detailed" && budget.lineItems.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b hairline-2 flex items-center justify-between">
                <div className="text-[13px] font-semibold">Budget line items</div>
                <Chip tone="indigo">Detailed mode</Chip>
              </div>
              <table className="w-full text-[12.5px]">
                <thead className="bg-[#fafafa] border-b hairline-2 text-left">
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium [&>th]:text-[var(--mute)]">
                    <th>Description</th>
                    <th>Funded by</th>
                    <th className="text-right">University</th>
                    <th className="text-right">Student</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.lineItems.map(li => {
                    const uniAmt = li.fundedBy === "university" ? li.totalAmount
                      : li.fundedBy === "split" ? Math.round(li.totalAmount * (li.uniPct ?? 50) / 100) : 0;
                    const stuAmt = li.fundedBy === "student" ? li.totalAmount
                      : li.fundedBy === "split" ? Math.round(li.totalAmount * (li.studentPct ?? 50) / 100) : 0;
                    const tone = { university:"indigo", student:"teal", split:"amber" }[li.fundedBy];
                    const label = { university:"University", student:"Student",
                      split:`Split ${li.uniPct ?? 50}/${li.studentPct ?? 50}` }[li.fundedBy];
                    return (
                      <tr key={li.id} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                        <td className="px-4 py-2.5">{li.description}</td>
                        <td className="px-4 py-2.5"><Chip tone={tone}>{label}</Chip></td>
                        <td className="px-4 py-2.5 text-right font-mono text-[var(--mute)]">{uniAmt > 0 ? fmtAed(uniAmt) : "—"}</td>
                        <td className="px-4 py-2.5 text-right font-mono" style={{color:"var(--teal)"}}>{stuAmt > 0 ? fmtAed(stuAmt) : "—"}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium">{fmtAed(li.totalAmount)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#fafafa] border-t hairline text-[12.5px] font-semibold">
                    <td className="px-4 py-2.5">Total</td>
                    <td/>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {fmtAed(budget.lineItems.reduce((s,li) => s + (li.fundedBy==="university" ? li.totalAmount : li.fundedBy==="split" ? Math.round(li.totalAmount*(li.uniPct??50)/100) : 0), 0))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono" style={{color:"var(--teal)"}}>
                      {studentContrib > 0 ? fmtAed(studentContrib) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{fmtAed(planned)}</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          )}

          {/* Simple mode indicator */}
          {budget.mode === "simple" && (
            <div className="flex items-center gap-2.5">
              <Chip tone="slate">Simple mode</Chip>
              <span className="text-[12px] text-[var(--mute)]">No line item breakdown — planned total only</span>
              <button className="text-[12px] text-[var(--accent)] hover:underline">Switch to detailed →</button>
            </div>
          )}

          {/* Expense transactions */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b hairline-2 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[13px] font-semibold">Expense transactions</div>
                <div className="text-[11px] text-[var(--mute)]">
                  {expTxns.length > 0 ? `${expTxns.length} recorded · ${fmtAed(actualSpent)} total` : "No expenses recorded yet"}
                </div>
              </div>
              {canRecord && (
                <Btn variant="outline" size="sm" icon={Icon.Plus} onClick={() => setShowAdd(true)}>Record expense</Btn>
              )}
            </div>

            {expTxns.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-[12.5px] text-[var(--mute)]">
                  {canRecord
                    ? "No expenses recorded yet."
                    : a.status === "Pending Approval"
                      ? "Transactions unlock once the activity is approved."
                      : "No expenses were recorded."}
                </div>
                {canRecord && (
                  <button className="mt-1 text-[12px] text-[var(--accent)] hover:underline" onClick={() => setShowAdd(true)}>
                    Record the first expense →
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-[12.5px]">
                <thead className="bg-[#fafafa] border-b hairline-2 text-left">
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium [&>th]:text-[var(--mute)]">
                    <th>Date</th><th>Vendor</th><th>Category</th><th className="max-w-[180px]">Notes</th><th className="text-right">Amount</th><th className="w-8"/>
                  </tr>
                </thead>
                <tbody>
                  {expTxns.map(t => (
                    <tr key={t.id} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa] group">
                      <td className="px-4 py-2.5 text-[var(--mute)] whitespace-nowrap">{t.occurredAt}</td>
                      <td className="px-4 py-2.5 font-medium">{t.vendor}</td>
                      <td className="px-4 py-2.5"><Chip tone={CATEGORY_TONE[t.category] || "slate"}>{t.category}</Chip></td>
                      <td className="px-4 py-2.5 text-[var(--mute)] max-w-[200px]">
                        <span className="block truncate">{t.notes || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium">{fmtAed(t.amount)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => delTxn(t.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--mute)] hover:text-[var(--bad)]">
                          <Icon.X width={13} height={13}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Income / revenue transactions (system-generated) */}
          {incTxns.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b hairline-2 flex items-center gap-2">
                <div className="text-[13px] font-semibold">Revenue transactions</div>
                <Chip tone="teal">System · read-only</Chip>
                <div className="flex-1"/>
                <div className="text-[13px] font-mono font-semibold" style={{color:"var(--ok)"}}>{fmtAed(actualRevenue)}</div>
              </div>
              <table className="w-full text-[12.5px]">
                <thead className="bg-[#fafafa] border-b hairline-2 text-left">
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium [&>th]:text-[var(--mute)]">
                    <th>Date</th><th>Source</th><th>Notes</th><th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {incTxns.map(t => (
                    <tr key={t.id} className="border-b hairline-2 last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 text-[var(--mute)] whitespace-nowrap">{t.occurredAt}</td>
                      <td className="px-4 py-2.5 font-medium">{t.vendor}</td>
                      <td className="px-4 py-2.5 text-[var(--mute)] max-w-[220px]">
                        <span className="block truncate">{t.notes}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium" style={{color:"var(--ok)"}}>{fmtAed(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* ── Right column ────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Revenue section */}
          {(expectedRevenue > 0 || a.fee) && (
            <Card className="p-4">
              <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Revenue</div>
              {[
                ["Expected",  fmtAed(expectedRevenue),                           studentContrib > 0 ? "From budget lines" : `${regCount} × AED ${a.fee}`],
                ["Received",  actualRevenue > 0 ? fmtAed(actualRevenue) : "AED 0", "Via finance system"],
                ["Pending",   pendingRevenue > 0 ? fmtAed(pendingRevenue) : "AED 0", "Awaiting payment"],
              ].map(([l, v, sub]) => (
                <div key={l} className="flex items-start gap-2 py-2.5 border-b hairline-2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[var(--mute)]">{l}</div>
                    {sub && <div className="text-[10.5px] text-[var(--mute-2)] mt-0.5">{sub}</div>}
                  </div>
                  <div className="text-[13px] font-semibold font-mono">{v}</div>
                </div>
              ))}
              <div className="mt-3">
                <Progress
                  value={expectedRevenue > 0 ? pctOf(actualRevenue, expectedRevenue) : 0}
                  color="var(--teal)"
                />
                <div className="text-[10.5px] text-[var(--mute)] mt-1">
                  {expectedRevenue > 0 ? `${pctOf(actualRevenue, expectedRevenue)}% collected` : "No target set"}
                </div>
              </div>
            </Card>
          )}

          {/* Budget controls */}
          <Card className="p-4">
            <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Budget overview</div>
            <div className="space-y-0">
              {[
                ["Mode",        budget.mode === "detailed" ? "Detailed" : "Simple", null],
                ["Planned",     fmtAed(planned),  null],
                ["Approved",    fmtAed(approved), null],
                ["Net uni cost",approved != null ? fmtAed(approved - actualRevenue) : "—", "Approved minus revenue received"],
              ].map(([l, v, hint]) => (
                <div key={l} className="flex items-center gap-2 py-2 border-b hairline-2 last:border-0">
                  <div className="flex-1">
                    <div className="text-[12px] text-[var(--mute)]">{l}</div>
                    {hint && <div className="text-[10.5px] text-[var(--mute-2)]">{hint}</div>}
                  </div>
                  <div className="text-[12.5px] font-semibold font-mono">{v}</div>
                </div>
              ))}
            </div>

            {/* Budget increase request */}
            {canRecord && !pendingChg && (
              <div className="mt-3 pt-3 border-t hairline-2">
                {showChange ? (
                  <div className="space-y-2">
                    <div className="text-[11.5px] font-medium text-[var(--mute)] mb-1">Request budget increase</div>
                    <input type="number" value={chgAmount} onChange={e => setChgAmount(e.target.value)}
                      placeholder="New approved amount (AED)"
                      className="w-full h-8 px-3 rounded-[7px] border hairline text-[12px] font-mono focus:outline-none focus:border-[var(--accent)]"/>
                    <input value={chgReason} onChange={e => setChgReason(e.target.value)}
                      placeholder="Reason for increase"
                      className="w-full h-8 px-3 rounded-[7px] border hairline text-[12px] focus:outline-none focus:border-[var(--accent)]"/>
                    <div className="flex gap-1.5">
                      <Btn variant="outline" size="sm" className="flex-1" onClick={() => setShowChange(false)}>Cancel</Btn>
                      <Btn variant="default" size="sm" className="flex-1" onClick={submitChangeReq}>Submit</Btn>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowChange(true)}
                    className="text-[12px] text-[var(--accent)] hover:underline flex items-center gap-1">
                    <Icon.Plus width={13} height={13}/>Request budget increase
                  </button>
                )}
              </div>
            )}

            {pendingChg && !isManager && (
              <div className="mt-3 pt-3 border-t hairline-2 text-[11.5px] text-[var(--mute)]">
                Increase request pending · {fmtAed(pendingChg.requestedAmount)}
              </div>
            )}
          </Card>

          {/* Category spend breakdown */}
          {expTxns.length > 0 && (
            <Card className="p-4">
              <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--mute)] mb-3">Spend by category</div>
              {Object.entries(
                expTxns.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {})
              ).sort(([,a],[,b]) => b - a).map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-2 py-1.5">
                  <div className="w-[72px] shrink-0"><Chip tone={CATEGORY_TONE[cat] || "slate"}>{cat}</Chip></div>
                  <div className="flex-1 h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{width:`${pctOf(amt, actualSpent)}%`}}/>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--mute)] shrink-0 w-[68px] text-right">{fmtAed(amt)}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onAdd={addTxn}/>}
    </div>
  );
};
