/* Mock data for SAMA prototype. Generous enough to feel real, small enough to stay navigable. */

const TYPE_META = {
  Event:         { ink: "#1f209a", wash: "#ecedff", dot: "#3a3dd9", label: "Event",         icon: "Cal" },
  Program:       { ink: "#0a5f5d", wash: "#dbefee", dot: "#0a7a78", label: "Program",       icon: "Activity" },
  Volunteering:  { ink: "#b43664", wash: "#fde4ee", dot: "#cf4a7a", label: "Volunteering",  icon: "Hands" },
  Task:          { ink: "#495266", wash: "#e8eaef", dot: "#6a7486", label: "Task",          icon: "Tasks" },
  External:      { ink: "#b9812d", wash: "#fcefd6", dot: "#c28a33", label: "External",      icon: "Globe" },
};

const STATUS_META = {
  Draft:              { tone: "slate", label: "Draft"       },
  "Pending Approval": { tone: "amber", label: "Pending"     },
  Active:             { tone: "green", label: "Active"      },
  Rejected:           { tone: "red",   label: "Rejected"    },
  Completed:          { tone: "slate", label: "Completed"   },
  Cancelled:          { tone: "red",   label: "Cancelled"   },
  Confirmed:          { tone: "green", label: "Confirmed"   },
  Planned:            { tone: "slate", label: "Planned"     },
  Pending:            { tone: "amber", label: "Pending"     },
  Open:               { tone: "green", label: "Open"        },
  Closed:             { tone: "slate", label: "Closed"      },
};

const CATEGORIES = ["Academic","Cultural","Sports & Wellness","Career","Community","Leadership","Arts"];

const VENUES = [
  { id:"v1", name:"Main Auditorium",  kind:"Indoor · Theater",   capacity:500,  building:"Admin Bldg",   available:true,  features:["Stage","AV","Live stream","Tiered seating"] },
  { id:"v2", name:"Sports Complex",   kind:"Indoor · Arena",     capacity:1200, building:"North Campus", available:false, features:["Court","Bleachers","Locker rooms","Scoreboard"] },
  { id:"v3", name:"Student Lounge",   kind:"Indoor · Flex",      capacity:120,  building:"Bldg B, L2",   available:true,  features:["Cafe","Power","Casual seating"] },
  { id:"v4", name:"Outdoor Plaza",    kind:"Outdoor · Open",     capacity:2000, building:"South Quad",   available:true,  features:["Tents","Power drops","Food trucks"] },
  { id:"v5", name:"Lab A-214",        kind:"Indoor · Workshop",  capacity:40,   building:"Sciences",     available:false, features:["Benches","Safety gear","Smartboard"] },
  { id:"v6", name:"Conference Hall",  kind:"Indoor · Hall",      capacity:260,  building:"Admin Bldg",   available:true,  features:["AV","Catering","Breakout rooms"] },
];

const PEOPLE = [
  { id:"p1",  name:"Ahmad Al-Marri",     ar:"أحمد المري",         role:"Student",     dept:"Eng",     email:"ahmad.m@uni.ac.ae",    sid:"202401188", avatar:"AM", hours:48, activities:12 },
  { id:"p2",  name:"Layla Khan",         ar:"ليلى خان",            role:"Student",     dept:"Business",email:"layla.k@uni.ac.ae",    sid:"202400431", avatar:"LK", hours:22, activities:7 },
  { id:"p3",  name:"Mariam Al-Suwaidi",  ar:"مريم السويدي",        role:"Student",     dept:"Arts",    email:"mariam.s@uni.ac.ae",   sid:"202401002", avatar:"MS", hours:73, activities:18 },
  { id:"p4",  name:"Omar Saleh",         ar:"عمر صالح",            role:"Student",     dept:"Eng",     email:"omar.s@uni.ac.ae",     sid:"202300997", avatar:"OS", hours:30, activities:9 },
  { id:"p5",  name:"Fatima Al-Hosani",   ar:"فاطمة الحوسني",        role:"Student",     dept:"Science", email:"fatima.h@uni.ac.ae",   sid:"202402210", avatar:"FH", hours:12, activities:4 },
  { id:"p6",  name:"Yusuf Raza",         ar:"يوسف رضا",            role:"Student",     dept:"Business",email:"yusuf.r@uni.ac.ae",    sid:"202401834", avatar:"YR", hours:6,  activities:3 },
  { id:"p7",  name:"Noura Al-Zaabi",     ar:"نورة الزعابي",         role:"Student",     dept:"Arts",    email:"noura.z@uni.ac.ae",    sid:"202400112", avatar:"NZ", hours:60, activities:15 },
  { id:"p8",  name:"Sara Mansour",       ar:"سارة منصور",          role:"Student",     dept:"Law",     email:"sara.m@uni.ac.ae",     sid:"202401777", avatar:"SM", hours:40, activities:11 },
  { id:"s1",  name:"Jane Doe",           ar:"",                   role:"Coordinator", dept:"Student Services", email:"j.doe@uni.ac.ae", avatar:"JD" },
  { id:"s2",  name:"Hassan Qureshi",     ar:"",                   role:"Coordinator", dept:"Athletics",         email:"h.qureshi@uni.ac.ae", avatar:"HQ" },
  { id:"s3",  name:"Reem Abdulla",       ar:"",                   role:"Ops Manager", dept:"Student Services", email:"r.abdulla@uni.ac.ae", avatar:"RA" },
  { id:"s4",  name:"John Smith",         ar:"",                   role:"Coordinator", dept:"Cultural",          email:"j.smith@uni.ac.ae", avatar:"JS" },
  { id:"c1",  name:"Aisha Farhat",       ar:"عائشة فرحات",          role:"Club Leader", dept:"CS Club",           email:"a.farhat@uni.ac.ae", avatar:"AF" },
];

const ACTIVITIES = [
  { id:"a1",  title:"Freshman Orientation 2025",     type:"Event",        status:"Active",            date:"Sep 10, 2025", dateIso:"2025-09-10", time:"9:00 AM – 4:00 PM", venue:"Main Auditorium", capacity:500, registered:482, attended:null, waitlist:12, owner:"s1", category:"Academic", tags:["freshman","mandatory","orientation"], qr:true, public:true, banner:"academic" },
  { id:"a2",  title:"Men's Football — 25/26 Season", type:"Program",      status:"Active",            date:"Sep – May",   dateIso:"2025-09-01", time:"Tue/Thu 6:00 PM", venue:"Sports Complex", capacity:28, registered:26, waitlist:0, owner:"s2", category:"Sports & Wellness", tags:["team","season","football"], qr:true, public:true, banner:"sports", sessions:{ total:62, done:14, upcoming:48 } },
  { id:"a3",  title:"Beach Cleanup Drive",            type:"Volunteering", status:"Pending Approval",  date:"Oct 5, 2025", dateIso:"2025-10-05", time:"7:00 AM – 11:00 AM", venue:"Corniche Beach", capacity:80, registered:0, owner:"s1", category:"Community", tags:["community","sustainability"], hoursTarget:4, public:true, banner:"community" },
  { id:"a4",  title:"Submit Q1 Budget Report",        type:"Task",         status:"Draft",             date:"Sep 30, 2025", dateIso:"2025-09-30", owner:"s3", category:"", tags:["finance","internal"], priority:"High", subtasks:4, subtasksDone:1 },
  { id:"a5",  title:"Global Tech Conference 2025",    type:"External",     status:"Active",            date:"Nov 12–14",   dateIso:"2025-11-12", time:"All day", venue:"Dubai World Trade Centre", owner:"s4", category:"Career", tags:["conference","external"], externalUrl:"https://gtc.ae", public:true },
  { id:"a6",  title:"Spring Career Fair",             type:"Event",        status:"Draft",             date:"Feb 20, 2026", dateIso:"2026-02-20", time:"10:00 AM – 4:00 PM", venue:"Outdoor Plaza", capacity:2000, registered:0, owner:"s1", category:"Career", tags:["career","fair"], public:true, banner:"career" },
  { id:"a7",  title:"Coding Bootcamp — Python",       type:"Program",      status:"Active",            date:"Oct 1 – Nov 15", dateIso:"2025-10-01", time:"Mon/Wed 5:00 PM", venue:"Lab A-214", capacity:40, registered:38, waitlist:5, owner:"c1", category:"Academic", tags:["bootcamp","coding"], qr:true, public:true, banner:"academic", sessions:{ total:12, done:4, upcoming:8 } },
  { id:"a8",  title:"Blood Donation Camp",            type:"Volunteering", status:"Pending Approval",  date:"Nov 5, 2025", dateIso:"2025-11-05", time:"9:00 AM – 3:00 PM", venue:"Student Lounge", capacity:200, registered:0, owner:"s1", category:"Community", tags:["health","community"], hoursTarget:3, public:true },
  { id:"a9",  title:"Annual Club Renewals",           type:"Task",         status:"Active",            date:"Oct 31, 2025", dateIso:"2025-10-31", owner:"s3", category:"", tags:["internal","renewals"], priority:"Medium", subtasks:6, subtasksDone:3 },
  { id:"a10", title:"Inter-University Hackathon",     type:"External",     status:"Completed",         date:"Aug 20–22",   dateIso:"2025-08-20", venue:"KU Campus", owner:"s4", category:"Academic", tags:["hackathon"], externalUrl:"https://iuh.ae", public:true },
  { id:"a11", title:"Guest Lecture: AI Ethics",       type:"Event",        status:"Active",            date:"Oct 15, 2025", dateIso:"2025-10-15", time:"5:00 PM – 6:30 PM", venue:"Conference Hall", capacity:260, registered:189, waitlist:0, owner:"s4", category:"Academic", tags:["lecture","ai"], qr:false, public:true, banner:"academic" },
  { id:"a12", title:"Peer Tutoring Fall '25",         type:"Program",      status:"Active",            date:"Sep – Dec",   dateIso:"2025-09-15", time:"Ongoing", venue:"Student Lounge", capacity:60, registered:42, waitlist:0, owner:"s1", category:"Academic", tags:["tutoring"], qr:false, public:true, banner:"academic", sessions:{ total:36, done:10, upcoming:26 } },
  { id:"a13", title:"Winter Coat Drive",              type:"Volunteering", status:"Draft",             date:"Dec 1–15",    dateIso:"2025-12-01", venue:"Various", owner:"s1", category:"Community", tags:["drive","winter"], hoursTarget:8, public:true },
  { id:"a14", title:"Update Student Handbook",        type:"Task",         status:"Completed",         date:"Aug 1, 2025", dateIso:"2025-08-01", owner:"s3", category:"", tags:["internal","docs"], priority:"Low", subtasks:3, subtasksDone:3 },
  { id:"a15", title:"Startup Pitch Night",            type:"Event",        status:"Pending Approval",  date:"Nov 20, 2025", dateIso:"2025-11-20", time:"6:00 PM – 9:00 PM", venue:"Conference Hall", capacity:260, registered:0, waitlist:0, owner:"c1", category:"Career", tags:["startup","pitch"], qr:true, public:true, banner:"career" },
  { id:"a16", title:"Wellness Week",                  type:"Event",        status:"Active",            date:"Oct 20–24",   dateIso:"2025-10-20", time:"All week", venue:"Campus wide", capacity:null, registered:null, owner:"s1", category:"Sports & Wellness", tags:["wellness","week"], qr:false, public:true, banner:"sports" },
  { id:"a17", title:"Ramadan Iftar Drive",            type:"Volunteering", status:"Active",            date:"Mar 2026",    dateIso:"2026-03-15", venue:"Community Kitchen", owner:"s1", category:"Community", tags:["ramadan","community"], hoursTarget:6, public:true },
];

/* Registrants on a1 (Freshman Orientation) */
const REGS_A1 = [
  { pid:"p1", status:"Confirmed", checkedIn:true,  at:"9:04 AM" },
  { pid:"p2", status:"Confirmed", checkedIn:true,  at:"9:11 AM" },
  { pid:"p3", status:"Confirmed", checkedIn:false, at:null },
  { pid:"p4", status:"Confirmed", checkedIn:true,  at:"9:02 AM" },
  { pid:"p5", status:"Confirmed", checkedIn:false, at:null },
  { pid:"p6", status:"Waitlist", pos:1 },
  { pid:"p7", status:"Confirmed", checkedIn:true,  at:"9:17 AM" },
  { pid:"p8", status:"Confirmed", checkedIn:false, at:null },
];

/* Program sessions for a7 (Python bootcamp) */
const SESSIONS_A7 = [
  { id:"ss1", date:"Oct 1",  day:"Wed", status:"Done",     att:36, total:38, venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss2", date:"Oct 6",  day:"Mon", status:"Done",     att:35, total:38, venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss3", date:"Oct 8",  day:"Wed", status:"Done",     att:34, total:38, venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss4", date:"Oct 13", day:"Mon", status:"Done",     att:33, total:38, venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss5", date:"Oct 15", day:"Wed", status:"Upcoming", venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss6", date:"Oct 20", day:"Mon", status:"Upcoming", venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss7", date:"Oct 22", day:"Wed", status:"Upcoming", venue:"Lab A-214", lead:"Aisha Farhat" },
  { id:"ss8", date:"Oct 27", day:"Mon", status:"Cancelled", reason:"Public holiday", venue:"Lab A-214" },
  { id:"ss9", date:"Oct 29", day:"Wed", status:"Upcoming", venue:"Lab A-214", lead:"Aisha Farhat" },
];

/* Documents for a1 */
const DOCS_A1 = [
  { id:"d1", title:"Event_Proposal_v2.pdf",     type:"Proposal",        uploader:"s1", at:"2 days ago",  size:"1.2 MB", status:"Approved", version:2, visibility:"internal_only" },
  { id:"d2", title:"Risk_Assessment.pdf",        type:"Risk Assessment", uploader:"s1", at:"3 days ago",  size:"640 KB", status:"Pending Review", version:1, visibility:"internal_only" },
  { id:"d3", title:"Venue_Approval.pdf",         type:"Approval Letter", uploader:"s3", at:"1 week ago",  size:"210 KB", status:"",  version:1, visibility:"internal_only" },
  { id:"d4", title:"Event_Agenda.pdf",           type:"Other",           uploader:"s1", at:"4 days ago",  size:"98 KB",  status:"",  version:1, visibility:"public" },
  { id:"d5", title:"Catering_Invoice_05.pdf",    type:"Receipt",         uploader:"s3", at:"Today",       size:"340 KB", status:"",  version:1, visibility:"finance_only" },
];

/* Transportation for a3 */
const TRANSPORT_A3 = [
  { id:"t1", vehicle:"Bus", plate:"AD-91443", driver:"Khalid A.", phone:"+971 50 441 2233", depart:"Oct 5, 6:30 AM", back:"12:00 PM", from:"Main Gate, Bldg A", to:"Corniche Beach", capacity:40, assigned:38, status:"Planned" },
  { id:"t2", vehicle:"Bus", plate:"AD-77821", driver:"Mahmoud S.", phone:"+971 55 300 1120", depart:"Oct 5, 6:30 AM", back:"12:00 PM", from:"Main Gate, Bldg A", to:"Corniche Beach", capacity:40, assigned:40, status:"Planned" },
];

/* Notifications */
const NOTIFS = [
  { id:"n1", when:"2m", type:"waitlist",  text:"Spot offered to Mariam Al-Suwaidi", act:"a1",  read:false },
  { id:"n2", when:"1h", type:"approval",  text:"Blood Donation Camp awaiting your approval", act:"a8", read:false },
  { id:"n3", when:"3h", type:"attendance",text:"Yusuf Raza dropped to 62% attendance", act:"a7", read:false },
  { id:"n4", when:"5h", type:"task",      text:"Submit Q1 Budget Report is due in 2 days", act:"a4", read:true },
  { id:"n5", when:"1d", type:"cert",      text:"24 certificates generated for Ramadan Iftar Drive", act:"a17", read:true },
  { id:"n6", when:"2d", type:"doc",       text:"Risk Assessment uploaded on Freshman Orientation", act:"a1", read:true },
];

/* Command palette catalog */
const CMD_ITEMS = [
  { id:"go-hub",       kind:"Go",   label:"Activity Hub",         hint:"Home",       icon:"Home",    path:"hub" },
  { id:"go-approvals", kind:"Go",   label:"Approvals",             hint:"3 pending",  icon:"ClipboardCheck", path:"approvals" },
  { id:"go-calendar",  kind:"Go",   label:"Calendar",              hint:"Month view", icon:"Cal",     path:"calendar" },
  { id:"go-people",    kind:"Go",   label:"People Registry",       hint:"",           icon:"Users",   path:"people" },
  { id:"go-reports",   kind:"Go",   label:"Reports & Analytics",   hint:"",           icon:"Chart",   path:"reports" },
  { id:"go-docs",      kind:"Go",   label:"Documents",             hint:"",           icon:"Doc",     path:"documents" },
  { id:"go-transport", kind:"Go",   label:"Transportation",        hint:"",           icon:"Bus",     path:"transport" },
  { id:"go-certs",     kind:"Go",   label:"Certificates",          hint:"",           icon:"Medal",   path:"certs" },
  { id:"go-surveys",   kind:"Go",   label:"Feedback Surveys",      hint:"",           icon:"Flask",   path:"surveys" },
  { id:"go-notif",     kind:"Go",   label:"Notifications",         hint:"",           icon:"Bell",    path:"notifications" },
  { id:"go-settings",  kind:"Go",   label:"Settings",              hint:"",           icon:"Settings",path:"settings" },
  { id:"new-event",    kind:"New",  label:"New Event",             hint:"⇧ N  E",     icon:"Cal",     path:"create", params:{ type:"Event" } },
  { id:"new-program",  kind:"New",  label:"New Program",           hint:"⇧ N  P",     icon:"Activity",path:"create", params:{ type:"Program" } },
  { id:"new-vol",      kind:"New",  label:"New Volunteering",      hint:"⇧ N  V",     icon:"Hands",   path:"create", params:{ type:"Volunteering" } },
  { id:"new-task",     kind:"New",  label:"New Task",              hint:"⇧ N  T",     icon:"Tasks",   path:"create", params:{ type:"Task" } },
  { id:"new-external", kind:"New",  label:"New External",          hint:"⇧ N  X",     icon:"Globe",   path:"create", params:{ type:"External" } },
  { id:"act-switch",   kind:"View", label:"Switch role → Student", hint:"",           icon:"User",    path:"student" },
  { id:"act-hub-v2",   kind:"View", label:"Switch hub layout",     hint:"Board ⇌ List", icon:"Board", action:"toggle-hub" },
];

/* Semesters */
const SEMESTERS = ["Fall 2025-26", "Spring 2025-26", "Summer 2025", "Fall 2024-25"];

/* Clubs */
const CLUBS = [
  { id:"cl1", name:"Computer Science Club",  members:124, leader:"Aisha Farhat", color:"#3a3dd9", joined:true },
  { id:"cl2", name:"Debate Society",          members:68,  leader:"Omar Saleh",   color:"#0a7a78", joined:false },
  { id:"cl3", name:"Photography Collective",  members:42,  leader:"Noura Al-Zaabi", color:"#b43664", joined:false },
  { id:"cl4", name:"Football — Men's Team",   members:28,  leader:"Hassan Qureshi", color:"#b9812d", joined:true },
  { id:"cl5", name:"Entrepreneurship Hub",    members:56,  leader:"Layla Khan",    color:"#7b5dea", joined:false },
  { id:"cl6", name:"Volunteer Circle",        members:210, leader:"Mariam Al-Suwaidi", color:"#495266", joined:true },
];

window.SAMA = { TYPE_META, STATUS_META, CATEGORIES, VENUES, PEOPLE, ACTIVITIES, REGS_A1, SESSIONS_A7, DOCS_A1, TRANSPORT_A3, NOTIFS, CMD_ITEMS, SEMESTERS, CLUBS };
