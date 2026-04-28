/* Reports & Analytics */

const Reports = () => {
  const toast = useToast();
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b hairline bg-[var(--surface)] flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold tracking-tight">Reports</h1><div className="text-[12px] text-[var(--mute)]">Term-to-date insights on engagement, budget, impact and sentiment.</div></div>
        <div className="flex items-center gap-2">
          <Segmented size="sm" value="term" onChange={()=>{}} items={[{value:"month",label:"Month"},{value:"term",label:"Term"},{value:"year",label:"Year"}]}/>
          <Btn variant="outline" size="sm" icon={Icon.Download}>Export PDF</Btn>
          <Btn variant="default" size="sm" icon={Icon.Plus}>New report</Btn>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll p-6 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <StatBig label="Activities held" value="142" delta="+12%" deltaPositive/>
          <StatBig label="Unique attendees" value="2,318" delta="+18%" deltaPositive/>
          <StatBig label="Volunteer hours" value="1,864" delta="+22%" deltaPositive/>
          <StatBig label="Avg satisfaction" value="4.5 / 5" delta="+0.2" deltaPositive/>
        </div>

        <div className="grid grid-cols-[1.3fr,1fr] gap-5">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3"><div className="text-[13.5px] font-semibold">Engagement over term</div><Segmented size="sm" value="attend" onChange={()=>{}} items={[{value:"attend",label:"Attendance"},{value:"register",label:"Registrations"},{value:"hours",label:"Hours"}]}/></div>
            <TrendChart/>
          </Card>
          <Card className="p-4">
            <div className="text-[13.5px] font-semibold mb-3">Activity mix</div>
            <MixChart/>
            <div className="grid grid-cols-2 gap-1.5 mt-3 text-[11.5px]">{[["Event","var(--accent)","42%"],["Program","var(--teal)","28%"],["Volunteering","var(--rose)","18%"],["Task","var(--amber)","8%"],["External","var(--slate)","4%"]].map(([l,c,p],i)=>(<div key={i} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:c}}/><span className="flex-1">{l}</span><span className="font-mono text-[var(--mute)]">{p}</span></div>))}</div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <Card className="p-4"><div className="text-[13.5px] font-semibold mb-3">Top activities</div>{[["Freshman Carnival",480,4.8],["AI Ethics Workshop",142,4.6],["Beach Cleanup",68,4.5],["Men's Football",420,4.3]].map(([t,att,r],i)=>(<div key={i} className="py-2 border-b hairline-2 last:border-0"><div className="flex items-baseline justify-between"><div className="text-[12.5px] font-medium truncate">{t}</div><div className="text-[11px] font-mono text-[var(--mute)]">{att}</div></div><div className="text-[10.5px] text-[var(--mute)] flex items-center gap-1">★ {r} · <span className="text-[var(--ok)]">↑ vs avg</span></div></div>))}</Card>
          <Card className="p-4"><div className="text-[13.5px] font-semibold mb-3">Engagement by department</div>{[["Engineering",82],["Business",68],["Medicine",58],["Arts",72],["Law",48],["Sciences",64]].map(([d,v])=>(<div key={d} className="flex items-center gap-2 py-1.5"><div className="w-[96px] text-[12px]">{d}</div><div className="flex-1"><Progress value={v} color="var(--accent)"/></div><div className="w-[32px] text-right text-[11px] font-mono">{v}%</div></div>))}</Card>
          <Card className="p-4"><div className="text-[13.5px] font-semibold mb-3">Budget utilisation</div><div className="flex items-baseline gap-2 mb-2"><span className="text-[28px] font-semibold tracking-tight">AED 148k</span><span className="text-[12px] text-[var(--mute)]">of 220k</span></div><Progress value={67} color="var(--ok)"/><div className="grid grid-cols-2 gap-2 mt-4">{[["Events","AED 68k"],["Programs","AED 42k"],["Volunteering","AED 18k"],["Transport","AED 20k"]].map(([l,v])=>(<div key={l} className="p-2 rounded-[6px] bg-[#fafafa]"><div className="text-[10.5px] text-[var(--mute)]">{l}</div><div className="text-[13px] font-semibold">{v}</div></div>))}</div></Card>
        </div>
      </div>
    </div>
  );
};

const StatBig = ({ label, value, delta, deltaPositive }) => (
  <Card className="p-4"><div className="text-[11.5px] text-[var(--mute)]">{label}</div><div className="flex items-baseline justify-between mt-1"><div className="text-[28px] font-semibold tracking-tight">{value}</div><span className={cx("chip", deltaPositive?"bg-[var(--ok-wash)] text-[var(--ok)]":"bg-[var(--bad-wash)] text-[var(--bad)]")}>{delta}</span></div></Card>
);

const TrendChart = () => {
  const w=600, h=180, pts=[120,160,180,150,220,260,240,310,280,340,380,360];
  const max = Math.max(...pts); const dx = w/(pts.length-1);
  const line = pts.map((v,i)=>`${i===0?"M":"L"} ${i*dx} ${h-(v/max)*(h-16)-8}`).join(" ");
  const bars = pts.map((v,i)=>({x:i*dx-12, y:h-(v/max)*(h-16)-8, v}));
  return (
    <svg viewBox={`0 0 ${w} ${h+24}`} className="w-full">
      {[0,1,2,3].map(i => <line key={i} x1="0" x2={w} y1={(h/4)*i+8} y2={(h/4)*i+8} stroke="var(--line-2)"/>)}
      <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill="url(#grad)"/>
      <path d={line} stroke="var(--accent)" strokeWidth="2" fill="none"/>
      {bars.map((b,i)=><circle key={i} cx={b.x+12} cy={b.y} r="3" fill="white" stroke="var(--accent)" strokeWidth="2"/>)}
      {["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"].map((l,i)=><text key={i} x={i*dx} y={h+16} fontSize="9" fill="var(--mute)" textAnchor="middle">{l}</text>)}
      <defs><linearGradient id="grad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18"/><stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
    </svg>
  );
};

const MixChart = () => {
  const data=[["var(--accent)",42],["var(--teal)",28],["var(--rose)",18],["var(--amber)",8],["var(--slate)",4]];
  let acc=0; const R=58, C=70;
  return (
    <svg viewBox="0 0 140 140" className="w-full h-[160px]">
      {data.map(([c,v],i) => {
        const start=acc/100*Math.PI*2 - Math.PI/2; acc += v;
        const end=acc/100*Math.PI*2 - Math.PI/2;
        const large = v>50?1:0;
        const x1=C+R*Math.cos(start), y1=C+R*Math.sin(start);
        const x2=C+R*Math.cos(end),   y2=C+R*Math.sin(end);
        return <path key={i} d={`M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`} fill={c} stroke="white" strokeWidth="2"/>;
      })}
      <circle cx={C} cy={C} r="32" fill="white"/>
      <text x={C} y={C-3} fontSize="18" textAnchor="middle" fontWeight="600">142</text>
      <text x={C} y={C+10} fontSize="8" fill="var(--mute)" textAnchor="middle">activities</text>
    </svg>
  );
};

window.Reports = Reports;
