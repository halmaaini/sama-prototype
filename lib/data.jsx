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
  /* Students */
  { id:"p1",  name:"Ahmad Al-Marri",        ar:"أحمد المري",          role:"Student",     dept:"Engineering",       email:"ahmad.m@uni.ac.ae",      sid:"202401188", avatar:"AM", hours:48, activities:12, year:"Year 2" },
  { id:"p2",  name:"Layla Khan",            ar:"ليلى خان",             role:"Student",     dept:"Business",          email:"layla.k@uni.ac.ae",      sid:"202400431", avatar:"LK", hours:22, activities:7,  year:"Year 3" },
  { id:"p3",  name:"Mariam Al-Suwaidi",     ar:"مريم السويدي",         role:"Student",     dept:"Arts",              email:"mariam.s@uni.ac.ae",     sid:"202401002", avatar:"MS", hours:73, activities:18, year:"Year 4" },
  { id:"p4",  name:"Omar Saleh",            ar:"عمر صالح",             role:"Student",     dept:"Engineering",       email:"omar.s@uni.ac.ae",       sid:"202300997", avatar:"OS", hours:30, activities:9,  year:"Year 3" },
  { id:"p5",  name:"Fatima Al-Hosani",      ar:"فاطمة الحوسني",         role:"Student",     dept:"Science",           email:"fatima.h@uni.ac.ae",     sid:"202402210", avatar:"FH", hours:12, activities:4,  year:"Year 1" },
  { id:"p6",  name:"Yusuf Raza",            ar:"يوسف رضا",             role:"Student",     dept:"Business",          email:"yusuf.r@uni.ac.ae",      sid:"202401834", avatar:"YR", hours:6,  activities:3,  year:"Year 2" },
  { id:"p7",  name:"Noura Al-Zaabi",        ar:"نورة الزعابي",          role:"Student",     dept:"Arts",              email:"noura.z@uni.ac.ae",      sid:"202400112", avatar:"NZ", hours:60, activities:15, year:"Year 4" },
  { id:"p8",  name:"Sara Mansour",          ar:"سارة منصور",           role:"Student",     dept:"Law",               email:"sara.m@uni.ac.ae",       sid:"202401777", avatar:"SM", hours:40, activities:11, year:"Year 3" },
  { id:"p9",  name:"Khalid Al-Falasi",      ar:"خالد الفلاسي",          role:"Student",     dept:"Medicine",          email:"khalid.f@uni.ac.ae",     sid:"202402011", avatar:"KF", hours:18, activities:5,  year:"Year 2" },
  { id:"p10", name:"Nour Al-Rashidi",       ar:"نور الراشدي",           role:"Student",     dept:"Engineering",       email:"nour.r@uni.ac.ae",       sid:"202401654", avatar:"NR", hours:35, activities:10, year:"Year 2" },
  { id:"p11", name:"Hamdan Al-Mazrouei",    ar:"حمدان المزروعي",        role:"Student",     dept:"Business",          email:"hamdan.m@uni.ac.ae",     sid:"202300812", avatar:"HM", hours:55, activities:14, year:"Year 3" },
  { id:"p12", name:"Reem Khalifa",          ar:"ريم خليفة",             role:"Student",     dept:"Arts",              email:"reem.k@uni.ac.ae",       sid:"202401330", avatar:"RK", hours:27, activities:8,  year:"Year 2" },
  { id:"p13", name:"Tariq Bin Sultan",      ar:"طارق بن سلطان",         role:"Student",     dept:"Law",               email:"tariq.bs@uni.ac.ae",     sid:"202400788", avatar:"TS", hours:9,  activities:3,  year:"Year 4" },
  { id:"p14", name:"Hessa Al-Dhaheri",      ar:"حصة الظاهري",           role:"Student",     dept:"Science",           email:"hessa.d@uni.ac.ae",      sid:"202402198", avatar:"HD", hours:41, activities:11, year:"Year 1" },
  { id:"p15", name:"Saeed Al-Nuaimi",       ar:"سعيد النعيمي",          role:"Student",     dept:"Engineering",       email:"saeed.n@uni.ac.ae",      sid:"202401555", avatar:"SN", hours:20, activities:6,  year:"Year 2" },
  { id:"p16", name:"Amira Belhoul",         ar:"أميرة بلهول",           role:"Student",     dept:"Medicine",          email:"amira.b@uni.ac.ae",      sid:"202300441", avatar:"AB", hours:62, activities:16, year:"Year 3" },
  { id:"p17", name:"Faisal Al-Mansoori",    ar:"فيصل المنصوري",         role:"Student",     dept:"Business",          email:"faisal.m@uni.ac.ae",     sid:"202401900", avatar:"FM", hours:15, activities:5,  year:"Year 1" },
  { id:"p18", name:"Shaikha Al-Mazrouei",   ar:"شيخة المزروعي",         role:"Student",     dept:"Arts",              email:"shaikha.m@uni.ac.ae",    sid:"202402060", avatar:"SM", hours:44, activities:12, year:"Year 2" },
  { id:"p19", name:"Mohammed Al-Kaabi",     ar:"محمد الكعبي",           role:"Student",     dept:"Science",           email:"mohammed.k@uni.ac.ae",   sid:"202401223", avatar:"MK", hours:8,  activities:3,  year:"Year 2" },
  { id:"p20", name:"Latifa Al-Shamsi",      ar:"لطيفة الشامسي",         role:"Student",     dept:"Law",               email:"latifa.s@uni.ac.ae",     sid:"202400999", avatar:"LS", hours:33, activities:9,  year:"Year 4" },
  { id:"p21", name:"Obaid Al-Ketbi",        ar:"عبيد الكتبي",           role:"Student",     dept:"Engineering",       email:"obaid.k@uni.ac.ae",      sid:"202402301", avatar:"OK", hours:5,  activities:2,  year:"Year 1" },
  { id:"p22", name:"Maitha Al-Shamsi",      ar:"ميثاء الشامسي",         role:"Student",     dept:"Business",          email:"maitha.s@uni.ac.ae",     sid:"202401478", avatar:"MS", hours:50, activities:13, year:"Year 3" },
  { id:"p23", name:"Rashid Al-Blooshi",     ar:"راشد البلوشي",           role:"Student",     dept:"Arts",              email:"rashid.b@uni.ac.ae",     sid:"202300674", avatar:"RB", hours:29, activities:8,  year:"Year 4" },
  { id:"p24", name:"Dana Al-Hashimi",       ar:"دانا الهاشمي",           role:"Student",     dept:"Medicine",          email:"dana.h@uni.ac.ae",       sid:"202402144", avatar:"DH", hours:17, activities:5,  year:"Year 1" },
  { id:"p25", name:"Waleed Al-Shamlan",     ar:"وليد الشملان",           role:"Student",     dept:"Engineering",       email:"waleed.s@uni.ac.ae",     sid:"202401066", avatar:"WS", hours:38, activities:10, year:"Year 3" },
  { id:"p26", name:"Hind Al-Qassimi",       ar:"هند القاسمي",            role:"Student",     dept:"Science",           email:"hind.q@uni.ac.ae",       sid:"202400355", avatar:"HQ", hours:24, activities:7,  year:"Year 4" },
  { id:"p27", name:"Mansoor Al-Muhairi",    ar:"منصور المهيري",          role:"Student",     dept:"Law",               email:"mansoor.m@uni.ac.ae",    sid:"202401789", avatar:"MM", hours:11, activities:4,  year:"Year 2" },
  { id:"p28", name:"Rawdha Al-Ameri",       ar:"روضة العامري",           role:"Student",     dept:"Arts",              email:"rawdha.a@uni.ac.ae",     sid:"202402088", avatar:"RA", hours:46, activities:12, year:"Year 1" },
  { id:"p29", name:"Sultan Al-Rashidi",     ar:"سلطان الراشدي",          role:"Student",     dept:"Business",          email:"sultan.r@uni.ac.ae",     sid:"202301122", avatar:"SR", hours:58, activities:15, year:"Year 4" },
  { id:"p30", name:"Aisha Al-Marzooqi",     ar:"عائشة المرزوقي",         role:"Student",     dept:"Medicine",          email:"aisha.m@uni.ac.ae",      sid:"202402230", avatar:"AM", hours:14, activities:4,  year:"Year 1" },
  /* Staff */
  { id:"s1",  name:"Jane Doe",              ar:"",                       role:"Coordinator", dept:"Student Services",  email:"j.doe@uni.ac.ae",        avatar:"JD" },
  { id:"s2",  name:"Hassan Qureshi",        ar:"",                       role:"Coordinator", dept:"Athletics",         email:"h.qureshi@uni.ac.ae",    avatar:"HQ" },
  { id:"s3",  name:"Reem Abdulla",          ar:"",                       role:"Ops Manager", dept:"Student Services",  email:"r.abdulla@uni.ac.ae",    avatar:"RA" },
  { id:"s4",  name:"John Smith",            ar:"",                       role:"Coordinator", dept:"Cultural",          email:"j.smith@uni.ac.ae",      avatar:"JS" },
  { id:"s5",  name:"Mona Al-Rashidi",       ar:"",                       role:"Coordinator", dept:"Community",         email:"m.rashidi@uni.ac.ae",    avatar:"MR" },
  /* Club leaders */
  { id:"c1",  name:"Aisha Farhat",          ar:"عائشة فرحات",             role:"Club Leader", dept:"CS Club",           email:"a.farhat@uni.ac.ae",     avatar:"AF" },
];

const ACTIVITIES = [
  /* ── Core activities (unchanged IDs for existing navigation) ── */
  { id:"a1",  title:"Freshman Orientation 2025",      type:"Event",        status:"Active",            date:"Sep 10, 2025",   dateIso:"2025-09-10", time:"9:00 AM – 4:00 PM",  venue:"Main Auditorium",      capacity:500,  registered:482, attended:null, waitlist:12, owner:"s1", category:"Academic",          tags:["freshman","mandatory","orientation"],      qr:true,  public:true,  banner:"academic",  fee:null },
  { id:"a2",  title:"Men's Football — 25/26 Season",  type:"Program",      status:"Active",            date:"Sep – May",      dateIso:"2025-09-01", time:"Tue/Thu 6:00 PM",    venue:"Sports Complex",       capacity:28,   registered:26,  waitlist:0,  owner:"s2", category:"Sports & Wellness",  tags:["team","season","football"],               qr:true,  public:true,  banner:"sports",    fee:null,       sessions:{ total:62, done:14, upcoming:48 } },
  { id:"a3",  title:"Beach Cleanup Drive",             type:"Volunteering", status:"Pending Approval",  date:"Nov 2, 2025",    dateIso:"2025-11-02", time:"7:00 AM – 11:00 AM", venue:"Corniche Beach",       capacity:80,   registered:0,   owner:"s1", category:"Community",          tags:["community","sustainability"],             hoursTarget:4, public:true,  banner:"community", fee:null,       requiresApproval:true },
  { id:"a4",  title:"Submit Q1 Budget Report",         type:"Task",         status:"Draft",             date:"Sep 30, 2025",   dateIso:"2025-09-30", owner:"s3", category:"", tags:["finance","internal"], priority:"High",   subtasks:4, subtasksDone:1 },
  { id:"a5",  title:"Global Tech Conference 2025",     type:"External",     status:"Active",            date:"Nov 12–14",      dateIso:"2025-11-12", time:"All day",            venue:"Dubai World Trade Centre", owner:"s4", category:"Career",          tags:["conference","external"],                  externalUrl:"https://gtc.ae", public:true, fee:null },
  { id:"a6",  title:"Spring Career Fair",              type:"Event",        status:"Draft",             date:"Feb 20, 2026",   dateIso:"2026-02-20", time:"10:00 AM – 4:00 PM", venue:"Outdoor Plaza",        capacity:2000, registered:0,   owner:"s1", category:"Career",            tags:["career","fair"],                          public:true,  banner:"career",    fee:null },
  { id:"a7",  title:"Coding Bootcamp — Python",        type:"Program",      status:"Active",            date:"Oct 1 – Nov 15", dateIso:"2025-10-01", time:"Mon/Wed 5:00 PM",    venue:"Lab A-214",            capacity:40,   registered:38,  waitlist:5,  owner:"c1", category:"Academic",          tags:["bootcamp","coding"],                      qr:true,  public:true,  banner:"academic",  fee:null,       sessions:{ total:12, done:4, upcoming:8 } },
  { id:"a8",  title:"Blood Donation Camp",             type:"Volunteering", status:"Pending Approval",  date:"Nov 5, 2025",    dateIso:"2025-11-05", time:"9:00 AM – 3:00 PM",  venue:"Student Lounge",       capacity:200,  registered:0,   owner:"s1", category:"Community",          tags:["health","community"],                     hoursTarget:3, public:true,  fee:null },
  { id:"a9",  title:"Annual Club Renewals",            type:"Task",         status:"Active",            date:"Oct 31, 2025",   dateIso:"2025-10-31", owner:"s3", category:"", tags:["internal","renewals"],  priority:"Medium", subtasks:6, subtasksDone:3 },
  { id:"a10", title:"Inter-University Hackathon",      type:"External",     status:"Completed",         date:"Aug 20–22",      dateIso:"2025-08-20", venue:"KU Campus",            owner:"s4", category:"Academic",          tags:["hackathon"],                              externalUrl:"https://iuh.ae", public:true, fee:null },
  { id:"a11", title:"Guest Lecture: AI Ethics",        type:"Event",        status:"Active",            date:"Oct 15, 2025",   dateIso:"2025-10-15", time:"5:00 PM – 6:30 PM",  venue:"Conference Hall",      capacity:260,  registered:189, waitlist:0,  owner:"s4", category:"Academic",          tags:["lecture","ai"],                           qr:false, public:true,  banner:"academic",  fee:null },
  { id:"a12", title:"Peer Tutoring Fall '25",          type:"Program",      status:"Active",            date:"Sep – Dec",      dateIso:"2025-09-15", time:"Ongoing",            venue:"Student Lounge",       capacity:60,   registered:42,  waitlist:0,  owner:"s1", category:"Academic",          tags:["tutoring"],                               qr:false, public:true,  banner:"academic",  fee:null,       sessions:{ total:36, done:10, upcoming:26 } },
  { id:"a13", title:"Winter Coat Drive",               type:"Volunteering", status:"Draft",             date:"Dec 1–15",       dateIso:"2025-12-01", venue:"Various",              owner:"s1", category:"Community",          tags:["drive","winter"],                         hoursTarget:8, public:true,  fee:null },
  { id:"a14", title:"Update Student Handbook",         type:"Task",         status:"Completed",         date:"Aug 1, 2025",    dateIso:"2025-08-01", owner:"s3", category:"", tags:["internal","docs"],      priority:"Low",    subtasks:3, subtasksDone:3 },
  { id:"a15", title:"Startup Pitch Night",             type:"Event",        status:"Pending Approval",  date:"Nov 20, 2025",   dateIso:"2025-11-20", time:"6:00 PM – 9:00 PM",  venue:"Conference Hall",      capacity:260,  registered:0,   waitlist:0,  owner:"c1", category:"Career",            tags:["startup","pitch"],                        qr:true,  public:true,  banner:"career",    fee:null,       requiresApproval:true },
  { id:"a16", title:"Wellness Week",                   type:"Event",        status:"Active",            date:"Oct 20–24",      dateIso:"2025-10-20", time:"All week",            venue:"Campus wide",          capacity:null, registered:null, owner:"s1", category:"Sports & Wellness", tags:["wellness","week"],                        qr:false, public:true,  banner:"sports",    fee:null },
  { id:"a17", title:"Ramadan Iftar Drive",             type:"Volunteering", status:"Active",            date:"Mar 2026",       dateIso:"2026-03-15", venue:"Community Kitchen",   owner:"s1", category:"Community",          tags:["ramadan","community"],                    hoursTarget:6, public:true,  fee:null },

  /* ── Additional activities — more variety ── */
  { id:"a18", title:"Photography Workshop",            type:"Event",        status:"Completed",         date:"Sep 22, 2025",   dateIso:"2025-09-22", time:"3:00 PM – 6:00 PM",  venue:"Student Lounge",       capacity:40,   registered:38,  attended:35, waitlist:0, owner:"s4", category:"Arts",              tags:["photography","workshop"],                 qr:true,  public:true,  banner:"academic",  fee:null },
  { id:"a19", title:"Leadership Bootcamp",             type:"Program",      status:"Completed",         date:"Sep 5–19",       dateIso:"2025-09-05", time:"Sat 10:00 AM",       venue:"Conference Hall",      capacity:50,   registered:48,  attended:44, waitlist:0, owner:"s1", category:"Leadership",        tags:["leadership","bootcamp"],                  qr:true,  public:true,  banner:"academic",  fee:null,       sessions:{ total:3, done:3, upcoming:0 } },
  { id:"a20", title:"Women in Tech Panel",             type:"Event",        status:"Active",            date:"Oct 28, 2025",   dateIso:"2025-10-28", time:"4:00 PM – 6:00 PM",  venue:"Conference Hall",      capacity:200,  registered:142, waitlist:8,  owner:"s4", category:"Career",            tags:["women","tech","panel"],                   qr:true,  public:true,  banner:"career",    fee:null },
  { id:"a21", title:"Campus Clean-Up Day",             type:"Volunteering", status:"Active",            date:"Nov 8, 2025",    dateIso:"2025-11-08", time:"8:00 AM – 12:00 PM", venue:"Outdoor Plaza",        capacity:100,  registered:62,  waitlist:0,  owner:"s5", category:"Community",          tags:["environment","community"],                hoursTarget:4, public:true,  fee:null },
  { id:"a22", title:"Arabic Calligraphy Workshop",     type:"Event",        status:"Active",            date:"Oct 18, 2025",   dateIso:"2025-10-18", time:"2:00 PM – 5:00 PM",  venue:"Student Lounge",       capacity:30,   registered:30,  waitlist:6,  owner:"s4", category:"Cultural",          tags:["arabic","art","calligraphy"],             qr:true,  public:true,  banner:"academic",  fee:null },
  { id:"a23", title:"Medical Ethics Symposium",        type:"Event",        status:"Draft",             date:"Dec 3, 2025",    dateIso:"2025-12-03", time:"9:00 AM – 1:00 PM",  venue:"Main Auditorium",      capacity:300,  registered:0,   owner:"s1", category:"Academic",          tags:["medicine","ethics"],                      qr:true,  public:true,  banner:"academic",  fee:null,       requiresApproval:true },
  { id:"a24", title:"Alumni Networking Night",         type:"Event",        status:"Active",            date:"Nov 13, 2025",   dateIso:"2025-11-13", time:"7:00 PM – 10:00 PM", venue:"Outdoor Plaza",        capacity:400,  registered:287, waitlist:0,  owner:"s3", category:"Career",            tags:["alumni","networking"],                    qr:true,  public:true,  banner:"career",    fee:50,         requiresApproval:false },
  { id:"a25", title:"Debate Society — Fall Season",    type:"Program",      status:"Active",            date:"Oct – Dec",      dateIso:"2025-10-01", time:"Thu 6:00 PM",        venue:"Conference Hall",      capacity:35,   registered:32,  waitlist:0,  owner:"s4", category:"Academic",          tags:["debate","public-speaking"],               qr:false, public:true,  banner:"academic",  fee:null,       sessions:{ total:10, done:3, upcoming:7 } },
  { id:"a26", title:"First Aid Certification",         type:"Program",      status:"Active",            date:"Nov 1–15",       dateIso:"2025-11-01", time:"Sat 9:00 AM",        venue:"Conference Hall",      capacity:25,   registered:22,  waitlist:3,  owner:"s5", category:"Sports & Wellness", tags:["first-aid","health"],                     qr:true,  public:true,  banner:"sports",    fee:null,       requiresApproval:true, sessions:{ total:3, done:0, upcoming:3 } },
  { id:"a27", title:"Film Screening: Al Hayba",        type:"Event",        status:"Completed",         date:"Oct 3, 2025",    dateIso:"2025-10-03", time:"7:30 PM – 10:00 PM", venue:"Main Auditorium",      capacity:400,  registered:312, attended:298, waitlist:0, owner:"s4", category:"Arts",              tags:["film","arabic","cultural"],               qr:false, public:true,  banner:"academic",  fee:null },
  { id:"a28", title:"Entrepreneurship Masterclass",    type:"Event",        status:"Pending Approval",  date:"Nov 25, 2025",   dateIso:"2025-11-25", time:"10:00 AM – 1:00 PM", venue:"Conference Hall",      capacity:120,  registered:0,   owner:"c1", category:"Career",            tags:["entrepreneurship","startup"],             qr:true,  public:true,  banner:"career",    fee:25 },
  { id:"a29", title:"Hospital Volunteer Programme",    type:"Volunteering", status:"Active",            date:"Oct – Dec",      dateIso:"2025-10-15", time:"Wed 10:00 AM",       venue:"University Hospital",  capacity:20,   registered:18,  waitlist:2,  owner:"s5", category:"Community",          tags:["healthcare","volunteering"],              hoursTarget:8, public:true,  fee:null,           requiresApproval:true },
  { id:"a30", title:"Mock UN Conference",              type:"Event",        status:"Active",            date:"Nov 6–7",        dateIso:"2025-11-06", time:"8:00 AM – 5:00 PM",  venue:"Main Auditorium",      capacity:180,  registered:165, waitlist:12, owner:"s4", category:"Leadership",        tags:["MUN","debate","global"],                  qr:true,  public:true,  banner:"career",    fee:30,         requiresApproval:true },
  { id:"a31", title:"Year 1 Induction Day",            type:"Event",        status:"Completed",         date:"Sep 1, 2025",    dateIso:"2025-09-01", time:"8:30 AM – 3:00 PM",  venue:"Main Auditorium",      capacity:500,  registered:498, attended:490, waitlist:0, owner:"s1", category:"Academic",          tags:["induction","year1","mandatory"],          qr:true,  public:false, banner:"academic",  fee:null },
  { id:"a32", title:"Ramadan Night Market",            type:"Event",        status:"Draft",             date:"Mar 10, 2026",   dateIso:"2026-03-10", time:"7:00 PM – 11:00 PM", venue:"Outdoor Plaza",        capacity:1500, registered:0,   owner:"s4", category:"Cultural",          tags:["ramadan","cultural","market"],            qr:false, public:true,  banner:"academic",  fee:null },
  { id:"a33", title:"Swimming Championship",           type:"Event",        status:"Active",            date:"Nov 22, 2025",   dateIso:"2025-11-22", time:"9:00 AM – 4:00 PM",  venue:"Sports Complex",       capacity:200,  registered:88,  waitlist:0,  owner:"s2", category:"Sports & Wellness", tags:["swimming","sports","championship"],        qr:true,  public:true,  banner:"sports",    fee:null },
  { id:"a34", title:"Community Kitchen · Eid",         type:"Volunteering", status:"Draft",             date:"Jun 2026",       dateIso:"2026-06-01", venue:"Community Kitchen",   owner:"s5", category:"Community",          tags:["eid","community"],                        hoursTarget:6, public:true,  fee:null },
  { id:"a35", title:"CV & Interview Workshop",         type:"Event",        status:"Completed",         date:"Sep 28, 2025",   dateIso:"2025-09-28", time:"2:00 PM – 5:00 PM",  venue:"Conference Hall",      capacity:100,  registered:94,  attended:88, waitlist:0, owner:"s1", category:"Career",            tags:["cv","career","workshop"],                 qr:true,  public:true,  banner:"career",    fee:null },
  { id:"a36", title:"Badminton Tournament",            type:"Event",        status:"Active",            date:"Nov 29, 2025",   dateIso:"2025-11-29", time:"3:00 PM – 8:00 PM",  venue:"Sports Complex",       capacity:64,   registered:48,  waitlist:0,  owner:"s2", category:"Sports & Wellness", tags:["badminton","sports","tournament"],         qr:true,  public:true,  banner:"sports",    fee:10 },
  { id:"a37", title:"Art Exhibition — Student Showcase",type:"Event",       status:"Active",            date:"Nov 10–14",      dateIso:"2025-11-10", time:"10:00 AM – 6:00 PM", venue:"Student Lounge",       capacity:null, registered:null, owner:"s4", category:"Arts",              tags:["art","exhibition","showcase"],            qr:false, public:true,  banner:"academic",  fee:null },
  { id:"a38", title:"Red Crescent Field Day",          type:"Volunteering", status:"Completed",         date:"Oct 5, 2025",    dateIso:"2025-10-05", time:"7:00 AM – 2:00 PM",  venue:"Various",              capacity:60,   registered:57,  attended:55, waitlist:0, owner:"s5", category:"Community",          tags:["red-crescent","first-aid"],               hoursTarget:7, public:true,  fee:null },
  { id:"a39", title:"Design Thinking Sprint",          type:"Program",      status:"Active",            date:"Oct 14–Nov 11",  dateIso:"2025-10-14", time:"Tue 4:00 PM",        venue:"Student Lounge",       capacity:20,   registered:19,  waitlist:1,  owner:"c1", category:"Academic",          tags:["design","innovation"],                    qr:true,  public:true,  banner:"academic",  fee:null,       sessions:{ total:5, done:2, upcoming:3 } },
  { id:"a40", title:"Campus Security Awareness",       type:"Event",        status:"Cancelled",         date:"Sep 18, 2025",   dateIso:"2025-09-18", time:"12:00 PM – 1:00 PM", venue:"Conference Hall",      capacity:200,  registered:67,  owner:"s3", category:"Academic",          tags:["security","awareness"],                   qr:false, public:false, banner:"academic",  fee:null },
  { id:"a41", title:"Graduate School Info Session",    type:"Event",        status:"Active",            date:"Nov 17, 2025",   dateIso:"2025-11-17", time:"4:00 PM – 6:00 PM",  venue:"Conference Hall",      capacity:150,  registered:83,  waitlist:0,  owner:"s1", category:"Academic",          tags:["graduate","masters","PHD"],               qr:false, public:true,  banner:"academic",  fee:null },
  { id:"a42", title:"Food Bank Drive",                 type:"Volunteering", status:"Active",            date:"Nov 1–15",       dateIso:"2025-11-01", venue:"Community Hall",       owner:"s5", category:"Community",          tags:["food","drive","community"],               hoursTarget:3, public:true,  fee:null },
  { id:"a43", title:"Mental Health Awareness Week",    type:"Event",        status:"Active",            date:"Oct 27–31",      dateIso:"2025-10-27", time:"All week",            venue:"Campus wide",          capacity:null, registered:null, owner:"s1", category:"Sports & Wellness", tags:["mental-health","wellness","awareness"],   qr:false, public:true,  banner:"sports",    fee:null },
  { id:"a44", title:"Robotics Club — Fall Term",       type:"Program",      status:"Active",            date:"Sep – Dec",      dateIso:"2025-09-10", time:"Mon 6:00 PM",        venue:"Lab A-214",            capacity:25,   registered:23,  waitlist:0,  owner:"c1", category:"Academic",          tags:["robotics","engineering"],                 qr:true,  public:true,  banner:"academic",  fee:null,       sessions:{ total:14, done:6, upcoming:8 } },
  { id:"a45", title:"Internship Fair — Spring 2026",   type:"Event",        status:"Draft",             date:"Jan 15, 2026",   dateIso:"2026-01-15", time:"10:00 AM – 4:00 PM", venue:"Outdoor Plaza",        capacity:1200, registered:0,   owner:"s1", category:"Career",            tags:["internship","career","fair"],             qr:true,  public:true,  banner:"career",    fee:null },
];

/* Registrants on a1 (Freshman Orientation) */
const REGS_A1 = [
  { pid:"p1",  status:"Confirmed",  checkedIn:true,  at:"9:04 AM" },
  { pid:"p2",  status:"Confirmed",  checkedIn:true,  at:"9:11 AM" },
  { pid:"p3",  status:"Confirmed",  checkedIn:false, at:null },
  { pid:"p4",  status:"Confirmed",  checkedIn:true,  at:"9:02 AM" },
  { pid:"p5",  status:"Confirmed",  checkedIn:false, at:null },
  { pid:"p6",  status:"Waitlist",   pos:1 },
  { pid:"p7",  status:"Confirmed",  checkedIn:true,  at:"9:17 AM" },
  { pid:"p8",  status:"Confirmed",  checkedIn:false, at:null },
  { pid:"p9",  status:"Confirmed",  checkedIn:true,  at:"9:22 AM" },
  { pid:"p10", status:"Confirmed",  checkedIn:true,  at:"9:08 AM" },
  { pid:"p11", status:"Confirmed",  checkedIn:false, at:null },
  { pid:"p12", status:"Waitlist",   pos:2 },
];

/* Pending applicants on a3 (Beach Cleanup — requiresApproval:true) */
const PENDING_A3 = [
  { pid:"p5",  applied:"Oct 18, 2025", reason:"I love environmental causes and want to give back to the community." },
  { pid:"p13", applied:"Oct 19, 2025", reason:"Volunteering helps me develop as a person. Keen to join any outdoor activity." },
  { pid:"p17", applied:"Oct 20, 2025", reason:"First-year student looking for volunteering opportunities to build my CV." },
  { pid:"p21", applied:"Oct 20, 2025", reason:"Want to meet new people and contribute to sustainability on campus." },
  { pid:"p24", applied:"Oct 21, 2025", reason:"Passionate about the environment — would love to help organise future drives too." },
];

/* Pending applicants on a26 (First Aid Certification — requiresApproval:true) */
const PENDING_A26 = [
  { pid:"p14", applied:"Oct 22, 2025", reason:"Pre-med student — first aid skills are essential for my career path." },
  { pid:"p19", applied:"Oct 22, 2025", reason:"Want to be prepared for emergencies on campus." },
  { pid:"p27", applied:"Oct 23, 2025", reason:"Previously attended a basic course — want to get properly certified." },
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
  { id:"t1", vehicle:"Bus", plate:"AD-91443", driver:"Khalid A.", phone:"+971 50 441 2233", depart:"Nov 2, 6:30 AM", back:"12:00 PM", from:"Main Gate, Bldg A", to:"Corniche Beach", capacity:40, assigned:38, status:"Planned" },
  { id:"t2", vehicle:"Bus", plate:"AD-77821", driver:"Mahmoud S.", phone:"+971 55 300 1120", depart:"Nov 2, 6:30 AM", back:"12:00 PM", from:"Main Gate, Bldg A", to:"Corniche Beach", capacity:40, assigned:40, status:"Planned" },
];

/* Notifications */
const NOTIFS = [
  { id:"n1", when:"2m",  type:"waitlist",   text:"Spot offered to Mariam Al-Suwaidi on Freshman Orientation",         act:"a1",  read:false },
  { id:"n2", when:"1h",  type:"approval",   text:"Blood Donation Camp awaiting your approval",                        act:"a8",  read:false },
  { id:"n3", when:"3h",  type:"attendance", text:"Yusuf Raza dropped to 62% attendance on Python Bootcamp",           act:"a7",  read:false },
  { id:"n4", when:"5h",  type:"task",       text:"Submit Q1 Budget Report is due in 2 days",                          act:"a4",  read:true  },
  { id:"n5", when:"1d",  type:"cert",       text:"24 certificates generated for Red Crescent Field Day",              act:"a38", read:true  },
  { id:"n6", when:"2d",  type:"doc",        text:"Risk Assessment uploaded on Freshman Orientation",                  act:"a1",  read:true  },
  { id:"n7", when:"3d",  type:"approval",   text:"5 new registration requests on Beach Cleanup Drive",                act:"a3",  read:true  },
  { id:"n8", when:"4d",  type:"cert",       text:"Photography Workshop — 35 certificates ready to issue",             act:"a18", read:true  },
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
  { id:"cl1", name:"Computer Science Club",  members:124, leader:"Aisha Farhat",       leaderId:"c1", color:"#3a3dd9", joined:true,  category:"Academic", status:"Active",  founded:"2014", advisor:"Dr. Salim Hasan",    meeting:"Tuesdays 5:00 PM",   room:"Lab 3, Eng Bldg",    email:"cs.club@sama.ae",     description:"Building, hacking, and learning together. CS Club organises bootcamps, hackathons, and tech talks throughout the year.", pendingRequests:3 },
  { id:"cl2", name:"Debate Society",          members:68,  leader:"Omar Saleh",         leaderId:"c2", color:"#0a7a78", joined:false, category:"Academic", status:"Active",  founded:"2010", advisor:"Prof. Abeer Ahmed",  meeting:"Thursdays 6:00 PM",  room:"Auditorium B",       email:"debate@sama.ae",      description:"Sharpening minds through structured argument. Debate Society competes nationally and hosts public debates on campus.", pendingRequests:2 },
  { id:"cl3", name:"Photography Collective",  members:42,  leader:"Noura Al-Zaabi",     leaderId:"c3", color:"#b43664", joined:false, category:"Cultural", status:"Active",  founded:"2018", advisor:"Ms. Hala Al-Maktoum",meeting:"Saturdays 10:00 AM", room:"Studio · Arts Bldg", email:"photo@sama.ae",       description:"Storytelling through the lens. Workshops, photo walks, exhibitions, and gear sharing.", pendingRequests:1 },
  { id:"cl4", name:"Football — Men's Team",   members:28,  leader:"Hassan Qureshi",     leaderId:"c4", color:"#b9812d", joined:true,  category:"Sports",   status:"Active",  founded:"2008", advisor:"Coach Martinez",     meeting:"Tue & Thu 5:30 PM",  room:"Sports Field A",     email:"football@sama.ae",    description:"University football team — competing in the Inter-Universities League and friendly tournaments.", pendingRequests:4 },
  { id:"cl5", name:"Entrepreneurship Hub",    members:56,  leader:"Layla Khan",         leaderId:"c5", color:"#7b5dea", joined:false, category:"Career",   status:"Pending", founded:"2025", advisor:"Dr. Yusuf Karim",    meeting:"Mondays 7:00 PM",    room:"Innovation Lab",     email:"ehub@sama.ae",        description:"From idea to pitch. Founder talks, mentor matching, startup competitions, and weekly co-working sessions.", pendingRequests:0 },
  { id:"cl6", name:"Volunteer Circle",        members:210, leader:"Mariam Al-Suwaidi",  leaderId:"c6", color:"#495266", joined:true,  category:"Service",  status:"Active",  founded:"2012", advisor:"Ms. Reem Abdulla",   meeting:"Sundays 4:00 PM",    room:"Community Hall",     email:"volunteer@sama.ae",   description:"Community service and outreach — beach cleanups, school tutoring, hospital visits, Red Crescent partnerships.", pendingRequests:2 },
];

window.SAMA = { TYPE_META, STATUS_META, CATEGORIES, VENUES, PEOPLE, ACTIVITIES, REGS_A1, PENDING_A3, PENDING_A26, SESSIONS_A7, DOCS_A1, TRANSPORT_A3, NOTIFS, CMD_ITEMS, SEMESTERS, CLUBS };
