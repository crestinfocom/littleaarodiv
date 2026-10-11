/* Safe storage: works even when the browser/preview blocks localStorage (e.g. SharePoint/Teams preview, file sandbox) */
(function(){function mem(){var d={};return{getItem:function(k){return k in d?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}}}}
function ok(n){try{var s=window[n];s.setItem('__t','1');s.removeItem('__t');return s}catch(e){return null}}
window.LS=ok('localStorage')||mem();window.SS=ok('sessionStorage')||window.LS;
window.addEventListener('error',function(e){var a=document.getElementById('app');if(a&&!a.innerHTML.trim())a.innerHTML='<div style="padding:40px;font-family:sans-serif"><h2>Little Aarodiv could not start</h2><p>'+(e.message||'Script error')+'</p><p>Please download the file and open it directly in Chrome or Edge.</p></div>'});})();



/* ============ HELPERS ============ */
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9);
const todayStr=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const monthStr=()=>todayStr().slice(0,7);
const fmt=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const fdate=d=>d?new Date(d+(d.length===10?'T00:00':'')).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmon=m=>m?new Date(m+'-01T00:00').toLocaleDateString('en-IN',{month:'short',year:'numeric'}):'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IMG=id=>!id?LOCAL.room:(id.startsWith('http')||id.startsWith('data:')||id.startsWith('/'))?id:`/assets/photos/${id}.jpg`;
const ph=(src,cls='',style='')=>`<div class="ph ${cls}" style="${style}"><img src="${IMG(src)}" alt="" loading="lazy" onerror="imgFail(this)"></div>`;
const COLS=['#EE7B6A','#7FAE8E','#8EC3E0','#E9B04A','#AE9BD8','#E58FB0','#6FA8B8'];
const col=n=>{let h=0;for(const c of String(n))h=(h*31+c.charCodeAt(0))%997;return COLS[h%COLS.length]};
const ini=n=>String(n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const avatar=(n,cls='')=>`<span class="av ${cls}" style="background:${col(n)}">${esc(ini(n))}</span>`;
const BADGE={Active:'green',Paid:'green',Enrolled:'green',Present:'green',Published:'green',New:'blue',Contacted:'lav','Tour Scheduled':'amber',Pending:'amber','On Leave':'amber',Overdue:'red',Closed:'grey',Alumni:'grey',Inactive:'grey',All:'lav',Parents:'blue',Staff:'amber'};
const badge=s=>`<span class="badge b-${BADGE[s]||'grey'}">${esc(s)}</span>`;
const toast=(m,t='')=>{const d=document.createElement('div');d.className='tst '+t;d.textContent=m;$('#toast').appendChild(d);setTimeout(()=>d.remove(),2800)};
const LOGO=(s=46)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F29A86"/><stop offset="1" stop-color="#E9B04A"/></linearGradient></defs><rect width="64" height="64" rx="20" fill="url(#lg${s})"/><path d="M22 44c-4-6-4-14 1-18 2-1.6 4 .4 3.4 2.6L25 34l3-14c.6-2.6 4-2.2 4 .4V32l1.4-14c.3-2.6 3.8-2.4 3.8.2V32l1.6-11c.4-2.4 3.7-2 3.6.4L41 36l3-5c1.4-2 4.4-.6 3.4 1.8L42 46c-2 4-6 6-10 6s-7.4-2.6-10-8z" fill="#fff"/><path d="M46 12l1.6 3.4 3.4 1.6-3.4 1.6L46 22l-1.6-3.4L41 17l3.4-1.6z" fill="#fff" opacity=".95"/></svg>`;
const LOADER_SRC='/assets/loader.jpg';
const LOGO_SRC='/assets/logo.png';
const MARK_SRC='/assets/mark.png';
const brand=(light,cls='')=>`<a class="brand ${light?'dark':''} ${cls}" href="#/home" aria-label="Little Aarodiv – Tiny Hands, Endless Possibilities"><img class="logo-img" src="${LOGO_SRC}" alt="Little Aarodiv – Tiny Hands, Endless Possibilities"></a>`;

/* ============ IMAGES ============ */
const LOCAL={_a:'/assets/room.jpg',_r:'/assets/artwork.jpg'};
LOCAL.art=LOCAL._r;LOCAL.room=LOCAL._a;const FB=[LOCAL.art,LOCAL.room];
let IMGK=0;const POS=['center','left center','right center','30% 40%','70% 60%','center 30%'];
function imgFail(el){if(el.dataset.done)return;el.dataset.done=1;const k=+(el.dataset.k||0);el.src=FB[k%FB.length];el.style.objectPosition=POS[k%POS.length];el.style.transform='scale('+(1+(k%3)*0.12)+')'}
function watchImgs(){document.querySelectorAll('img').forEach(im=>{if(!im.dataset.k)im.dataset.k=IMGK++;if(im.src.startsWith('data:'))return;setTimeout(()=>{if(!im.complete||!im.naturalWidth)imgFail(im)},3500)})}
const P={hero:LOCAL.art,room:LOCAL.room,hero2:'photo-1503454537195-1dcabb73ffb9',blocks:'photo-1587654780291-39c9404d746b',paint:'photo-1596464716127-f2a82984de30',klass:'photo-1588072432836-e10032774350',read:'photo-1503919545889-aef636e10ad4',play:'photo-1516627145497-ae6968895b74',art:'photo-1560785496-3c9d27877182',crayon:'photo-1551966775-a4ddc8df052b',outdoor:'photo-1472162072942-cd5147eb3902',baby:'photo-1519689680058-324335c77eba',paint2:'photo-1576495199011-eb94736d05d6',teach:'photo-1509062522246-3755977927d7',kid:'photo-1544776193-352d25ca82cd',toys:'photo-1566140967404-b8b3932483f5'};

/* ============ DATA ============ */
const DB_KEY='little_aarodiv_db_v2';
function seed(){
 const programs=[
  {id:'p1',name:'Infant Care',age:'6 mo – 2 yrs',timing:'8:00 AM – 6:00 PM',fee:14000,capacity:12,img:P.baby,status:'Active',desc:'A gentle, nurturing nest focused on sensory play, secure attachment and early milestones.'},
  {id:'p2',name:'Toddlers',age:'2 – 3 yrs',timing:'9:00 AM – 1:00 PM',fee:9500,capacity:18,img:P.play,status:'Active',desc:'Joyful exploration that builds independence, language and fine-motor confidence.'},
  {id:'p3',name:'Preschool',age:'3 – 4 yrs',timing:'9:00 AM – 1:00 PM',fee:9500,capacity:24,img:P.paint,status:'Active',desc:'Play-based foundations in phonics, numbers, creativity and social-emotional skills.'},
  {id:'p4',name:'Pre-K & Kindergarten',age:'4 – 6 yrs',timing:'9:00 AM – 2:00 PM',fee:11000,capacity:24,img:P.klass,status:'Active',desc:'School-readiness with reading, early math, STEM projects and confident communication.'},
  {id:'p5',name:'Full-Day Daycare',age:'1.5 – 8 yrs',timing:'8:00 AM – 7:00 PM',fee:16000,capacity:30,img:P.blocks,status:'Active',desc:'Flexible, home-like care with fresh meals, nap time and enriching afternoon activities.'},
  {id:'p6',name:'After-School Club',age:'5 – 10 yrs',timing:'2:00 PM – 7:00 PM',fee:7000,capacity:20,img:P.art,status:'Active',desc:'Homework help, art, music, coding play and outdoor games in a caring space.'}];
 const names=[['Aarav Sharma','Boy','Preschool','Priya Sharma'],['Anaya Reddy','Girl','Toddlers','Kavya Reddy'],['Vihaan Rao','Boy','Pre-K & Kindergarten','Srinivas Rao'],['Myra Iyer','Girl','Preschool','Lakshmi Iyer'],['Reyansh Gupta','Boy','Full-Day Daycare','Rahul Gupta'],['Kiara Nair','Girl','Infant Care','Divya Nair'],['Ishaan Verma','Boy','Preschool','Neha Verma'],['Saanvi Kulkarni','Girl','Pre-K & Kindergarten','Amit Kulkarni'],['Advik Menon','Boy','Toddlers','Arjun Menon'],['Diya Patel','Girl','Preschool','Hetal Patel'],['Kabir Joshi','Boy','After-School Club','Vikram Joshi'],['Aadhya Kumar','Girl','Full-Day Daycare','Sneha Kumar']];
 const students=names.map((n,i)=>({id:'s'+(i+1),name:n[0],gender:n[1],program:n[2],parent:n[3],dob:`20${n[2]==='Infant Care'?'25':n[2]==='Toddlers'?'23':n[2]==='After-School Club'?'18':'22'}-0${(i%9)+1}-1${i%9}`,phone:'+91 98'+(48000000+i*13579).toString().slice(0,8),email:n[3].split(' ')[0].toLowerCase()+'@example.com',joined:'2026-0'+((i%6)+1)+'-0'+((i%8)+1),allergies:i%4===0?'Peanut allergy':i%5===0?'Lactose intolerant':'None',status:i===11?'On Leave':'Active'}));
 const staff=[
  {id:'t1',name:'Meera Krishnan',role:'Center Director',program:'All',phone:'+91 98490 11223',email:'meera@littleaarodiv.com',joined:'2021-06-01',status:'Active'},
  {id:'t2',name:'Ananya Bose',role:'Lead Teacher',program:'Preschool',phone:'+91 98490 22334',email:'ananya@littleaarodiv.com',joined:'2022-04-11',status:'Active'},
  {id:'t3',name:'Lakshmi Prasad',role:'Infant Care Specialist',program:'Infant Care',phone:'+91 98490 33445',email:'lakshmi@littleaarodiv.com',joined:'2022-08-01',status:'Active'},
  {id:'t4',name:'Fatima Shaikh',role:'Teacher',program:'Toddlers',phone:'+91 98490 44556',email:'fatima@littleaarodiv.com',joined:'2023-01-09',status:'Active'},
  {id:'t5',name:'Rohit Das',role:'Music & Movement Coach',program:'All',phone:'+91 98490 55667',email:'rohit@littleaarodiv.com',joined:'2023-07-17',status:'Active'},
  {id:'t6',name:'Sangeetha Pillai',role:'Teacher',program:'Pre-K & Kindergarten',phone:'+91 98490 66778',email:'sangeetha@littleaarodiv.com',joined:'2024-02-05',status:'On Leave'},
  {id:'t7',name:'Suresh Babu',role:'Security & Transport',program:'All',phone:'+91 98490 77889',email:'suresh@littleaarodiv.com',joined:'2021-06-01',status:'Active'}];
 const inquiries=[
  {id:'i1',child:'Navya Chowdary',age:'3 yrs',parent:'Harsha Chowdary',phone:'+91 99887 12345',email:'harsha@example.com',program:'Preschool',date:'2026-09-29',status:'New',notes:'Interested in morning batch'},
  {id:'i2',child:'Arjun Mehta',age:'2 yrs',parent:'Pooja Mehta',phone:'+91 99887 23456',email:'pooja@example.com',program:'Toddlers',date:'2026-09-26',status:'Tour Scheduled',notes:'Tour on Saturday 11 AM'},
  {id:'i3',child:'Zara Khan',age:'10 months',parent:'Ayesha Khan',phone:'+91 99887 34567',email:'ayesha@example.com',program:'Infant Care',date:'2026-09-22',status:'Contacted',notes:'Needs full-day option'},
  {id:'i4',child:'Rudra Singh',age:'5 yrs',parent:'Manish Singh',phone:'+91 99887 45678',email:'manish@example.com',program:'Pre-K & Kindergarten',date:'2026-09-18',status:'Enrolled',notes:''},
  {id:'i5',child:'Tara Joseph',age:'4 yrs',parent:'Anil Joseph',phone:'+91 99887 56789',email:'anil@example.com',program:'Full-Day Daycare',date:'2026-10-01',status:'New',notes:'Both parents working'}];
 const attendance={};const d=new Date();let c=0;
 for(let k=0;c<14&&k<30;k++){const x=new Date(d);x.setDate(d.getDate()-k);if(x.getDay()===0)continue;const ds=new Date(x.getTime()-x.getTimezoneOffset()*60000).toISOString().slice(0,10);attendance[ds]={};students.forEach(s=>{if(s.status==='Active')attendance[ds][s.id]=Math.random()<.88?'P':'A'});c++}
 const fees=[];['2026-08','2026-09','2026-10'].forEach((m,mi)=>students.forEach((s,si)=>{const p=programs.find(p=>p.name===s.program);fees.push({id:uid(),studentId:s.id,month:m,amount:p.fee,due:m+'-10',status:mi<2||si%2===0?'Paid':'Pending',paidOn:mi<2||si%2===0?m+'-0'+((si%8)+1):'',mode:mi<2||si%2===0?['UPI','Card','Net Banking'][si%3]:''})}));
 const events=[
  {id:'e1',title:'Parent–Teacher Meet',date:'2026-10-17',time:'10:00 AM',audience:'Parents',desc:'One-on-one progress conversations with class teachers.'},
  {id:'e2',title:'Field Trip: Nehru Zoological Park',date:'2026-10-24',time:'9:00 AM',audience:'All',desc:'A guided nature walk for Preschool & Pre-K explorers.'},
  {id:'e3',title:'Diwali Diya Painting',date:'2026-11-06',time:'11:00 AM',audience:'All',desc:'Little artists paint diyas and celebrate the festival of lights.'},
  {id:'e4',title:"Children's Day Carnival",date:'2026-11-14',time:'10:00 AM',audience:'All',desc:'Games, puppet show, face painting and treats for every child.'},
  {id:'e5',title:'Annual Day – Little Stars 2026',date:'2026-12-12',time:'5:00 PM',audience:'All',desc:'Our grand celebration of music, dance and drama.'}];
 const gallery=[
  {id:'g0',title:'Little Creators',category:'Art & Craft',url:LOCAL.art},{id:'g00',title:'Our Montessori Room',category:'Classrooms',url:LOCAL.room},
  {id:'g1',title:'Colour Splash Morning',category:'Art & Craft',url:P.paint},{id:'g2',title:'Building Big Ideas',category:'Learning',url:P.blocks},
  {id:'g3',title:'Our Bright Classroom',category:'Classrooms',url:P.klass},{id:'g4',title:'Story Corner',category:'Learning',url:P.read},
  {id:'g5',title:'Little Picasso',category:'Art & Craft',url:P.art},{id:'g6',title:'Happy Together',category:'Celebrations',url:P.hero},
  {id:'g7',title:'Outdoor Adventures',category:'Outdoor',url:P.outdoor},{id:'g8',title:'Crayon Stories',category:'Art & Craft',url:P.crayon},
  {id:'g9',title:'Play & Discover',category:'Outdoor',url:P.play},{id:'g10',title:'Learning Pods',category:'Classrooms',url:P.teach},
  {id:'g11',title:'Painted Palms',category:'Celebrations',url:P.paint2},{id:'g12',title:'Tiny Explorers',category:'Learning',url:P.kid}];
 const notices=[
  {id:'n1',title:'Navratri dress-up day on 16 Oct',body:'Children may come dressed in festive traditional wear. Please avoid heavy accessories.',date:'2026-10-01',audience:'Parents'},
  {id:'n2',title:'October fee reminder',body:'Monthly fees are due by 10 October. Pay securely through the Parent Portal.',date:'2026-10-01',audience:'Parents'},
  {id:'n3',title:'Staff first-aid refresher',body:'Mandatory paediatric first-aid refresher on Saturday 10 Oct, 3 PM in the activity hall.',date:'2026-09-28',audience:'Staff'},
  {id:'n4',title:'Healthy snack week',body:'We are celebrating Healthy Snack Week. Please pack fruit or millet-based snacks.',date:'2026-09-25',audience:'All'}];
 const messages=[
  {id:'m1',name:'Ritika Agarwal',email:'ritika@example.com',phone:'+91 90000 11111',subject:'Transport availability',message:'Do you provide pick-up from Jubilee Hills Road No. 36? My son is 3 years old.',date:'2026-10-02',read:false},
  {id:'m2',name:'Sandeep Varma',email:'sandeep@example.com',phone:'+91 90000 22222',subject:'Weekend activities',message:'Do you run any weekend art or music workshops for 5–6 year olds?',date:'2026-09-30',read:true}];
 const reports=[
  {id:'r1',studentId:'s1',date:todayStr(),meals:'Ate all',nap:'1 hr 10 min',mood:'😊 Happy',activities:'Leaf printing, rhyme time, building blocks tower',note:'Aarav proudly counted to 20 today and helped a friend tidy up!',teacher:'Ananya Bose'},
  {id:'r2',studentId:'s1',date:'2026-10-01',meals:'Ate most',nap:'55 min',mood:'🤩 Excited',activities:'Sand play, phonics "B", music & movement',note:'Loved the drum circle session.',teacher:'Ananya Bose'},
  {id:'r3',studentId:'s4',date:'2026-10-01',meals:'Ate all',nap:'1 hr',mood:'😌 Calm',activities:'Clay modelling, story time',note:'Made a lovely clay butterfly.',teacher:'Ananya Bose'}];
 const users=[
  {id:'u1',email:'admin@littleaarodiv.com',pass:'admin123',role:'admin',name:'Meera Krishnan'},
  {id:'u2',email:'teacher@littleaarodiv.com',pass:'teacher123',role:'teacher',name:'Ananya Bose',program:'Preschool'},
  {id:'u3',email:'parent@littleaarodiv.com',pass:'parent123',role:'parent',name:'Priya Sharma',studentId:'s1'}];
 const settings={name:'Little Aarodiv',tagline:'Tiny Hands, Endless Possibilities',phone:'+91 98765 43210',email:'hello@littleaarodiv.com',address:'Plot 24, Road No. 12, Banjara Hills, Hyderabad 500034',hours:'Mon – Sat · 8:00 AM – 7:00 PM',ratio:'1 : 6',session:'2026 – 27'};
 return {programs,students,staff,inquiries,attendance,fees,events,gallery,notices,messages,reports,users,settings};
}
let db;try{db=JSON.parse(LS.getItem(DB_KEY))}catch(e){}
if(!db||!db.programs){db=seed();save()}
function save(){try{LS.setItem(DB_KEY,JSON.stringify(db))}catch(e){console.warn(e)}}
const UI={q:{},gcat:'All',iq:'All',prog:'',attDate:'',attProg:'All'};
const session=()=>{try{const u=JSON.parse(SS.getItem('la_user'));return u?db.users.find(x=>x.id===u.id)||null:null}catch(e){return null}};
const stu=id=>db.students.find(s=>s.id===id)||{name:'—',program:'—'};
const progOf=n=>db.programs.find(p=>p.name===n)||{};
function attPct(sid){let p=0,t=0;Object.values(db.attendance).forEach(r=>{if(r[sid]){t++;if(r[sid]==='P')p++}});return t?Math.round(p/t*100):0}
function feeStatus(f){if(f.status==='Paid')return 'Paid';return f.due<todayStr()?'Overdue':'Pending'}


function showLoader(t){const p=document.getElementById('pageLoader');if(!p)return;document.getElementById('pl-txt').textContent=t||'Loading…';p.classList.add('on')}
function hideLoader(){const p=document.getElementById('pageLoader');if(p)p.classList.remove('on')}
function withLoader(t,fn,ms=650){showLoader(t);setTimeout(()=>{try{fn()}finally{hideLoader()}},ms)}
const inlineLoader=t=>`<div class="inl-loader"><span class="ldw"><img src="${LOADER_SRC}" alt=""></span><span>${t||'Loading…'}</span></div>`;
/* ============ ROUTER ============ */
function go(h){location.hash=h}
let _lastArea='';window.addEventListener('hashchange',()=>{const a=(location.hash.replace(/^#\/?/,'')||'home').split('/')[0];const portal=['admin','teacher','parent'].includes(a);if(a!==_lastArea&&(portal||_lastArea==='login'||['admin','teacher','parent'].includes(_lastArea))){_lastArea=a;withLoader(portal?'Opening your portal…':'Loading…',()=>render(true),550)}else{_lastArea=a;render(true)}});
function render(scroll){
 const h=location.hash.replace(/^#\/?/,'')||'home';const [area,sub]=h.split('/');
 closeModal();
 if(['admin','teacher','parent'].includes(area)){
  const u=session();if(!u||u.role!==area){go('/login');return}
  $('#app').innerHTML=shell(area,sub||'dashboard');
 }else if(area==='login'){$('#app').innerHTML=loginPage()}
 else{const pages={home,about,programs:programsPage,gallery:galleryPage,admissions,contact};
  $('#app').innerHTML=nav(area)+(pages[area]||home)()+footer()}
 if(scroll)window.scrollTo(0,0);watchImgs();
}

/* ============ PUBLIC SITE ============ */
function nav(a){const L=[['home','Home'],['about','About'],['programs','Programs'],['gallery','Gallery'],['admissions','Admissions'],['contact','Contact']];
 return `<header class="nav"><div class="container">${brand()}
 <nav class="links" id="links">${L.map(l=>`<a href="#/${l[0]}" class="${a===l[0]||(!a&&l[0]==='home')?'on':''}">${l[1]}</a>`).join('')}<a href="#/login" class="mob-only">Portal Login</a></nav>
 <div class="nav-cta"><a class="btn btn-o btn-s" href="#/login">Portal Login</a><a class="btn btn-p btn-s" href="#/admissions">Enroll Now</a></div>
 <button class="burger" onclick="$('#links').classList.toggle('open')" aria-label="Menu">☰</button></div></header>`}

function footer(){const s=db.settings;return `<footer><div class="container"><div class="fg">
 <div>${brand(true)}<p style="margin-top:18px;max-width:320px;font-size:14px">A premium daycare & preschool where curious little minds explore, create and grow — every single day.</p></div>
 <div><h4>Explore</h4><a href="#/about">About Us</a><a href="#/programs">Programs</a><a href="#/gallery">Gallery</a><a href="#/admissions">Admissions</a></div>
 <div><h4>Portals</h4><a href="#/login">Parent Portal</a><a href="#/login">Teacher Portal</a><a href="#/login">Admin Console</a></div>
 <div><h4>Visit Us</h4><p style="font-size:14px">📍 ${esc(s.address)}<br>📞 ${esc(s.phone)}<br>✉️ ${esc(s.email)}<br>🕗 ${esc(s.hours)}</p></div></div>
 <div class="copy"><span>© 2026 ${esc(s.name)}. All rights reserved.</span><span style="font-family:Fraunces;font-style:italic">${esc(s.tagline)}</span></div></div></footer>`}

function home(){const s=db.settings;const ev=db.events.filter(e=>e.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
 return `<section class="hero"><div class="container hero-grid"><div>
  <span class="eyebrow hero-mark"><img src="${MARK_SRC}" alt="">Admissions open · Session ${esc(s.session)}</span>
  <h1>Tiny hands,<br><em>endless</em> possibilities.</h1>
  <p class="lead">At ${esc(s.name)}, every child is cherished, every question welcomed and every day filled with wonder — in a safe, warm and inspiring space designed just for little ones.</p>
  <div class="hero-btns"><a class="btn btn-p" href="#/admissions">Book a Campus Tour →</a><a class="btn btn-o" href="#/programs">Explore Programs</a></div>
  <div class="trust"><div class="faces">${['PS','KR','AM','DN'].map((x,i)=>`<span style="background:${COLS[i]}">${x}</span>`).join('')}</div><div><b class="stars">★★★★★</b><br><small class="muted"><b style="color:var(--ink)">4.9/5</b> loved by 200+ Hyderabad families</small></div></div>
 </div>
 <div class="collage">${ph(LOCAL.art,'c1')}${ph(LOCAL.room,'c2')}${ph(P.blocks,'c3')}
  <div class="float" style="left:-14px;bottom:22%"><i class="t-sage">🛡️</i><div>Live CCTV access<small>for every parent</small></div></div>
  <div class="float" style="right:46%;top:-10px;animation-delay:1.5s"><i class="t-gold">👩‍🏫</i><div>${esc(s.ratio)} ratio<small>teacher to child</small></div></div>
 </div></div></section>

 <section class="alt"><div class="container"><div class="sec-h"><span class="eyebrow">Why parents choose us</span><h2>A second home, <em>thoughtfully</em> designed</h2><p>Everything we do is built around your child's safety, happiness and natural curiosity.</p></div>
 <div class="grid g3">${[['🛡️','t-coral','Safe & Secure','CCTV monitoring, biometric pick-up, trained security and child-safe interiors.'],['👩‍🏫','t-sage','Caring Educators','Certified early-years teachers with a low teacher-to-child ratio.'],['🎨','t-sky','Play-Based Learning','A blended Montessori & Reggio-inspired curriculum that sparks curiosity.'],['🥗','t-gold','Fresh Nutrition','Freshly cooked, balanced meals and snacks prepared in our hygienic kitchen.'],['📱','t-lav','Parent App','Daily reports, photos, attendance, fees and notices — all in one place.'],['🌿','t-pink','Green Spaces','Sunlit classrooms, a sensory garden and a soft-floor outdoor play zone.']].map(f=>`<div class="card hov"><div class="ic ${f[1]}">${f[0]}</div><h3>${f[2]}</h3><p>${f[3]}</p></div>`).join('')}</div></div></section>

 <section><div class="container"><div class="sec-h"><span class="eyebrow">Our programs</span><h2>Learning for every <em>little</em> stage</h2><p>Age-appropriate programs that grow with your child — from first steps to first day of school.</p></div>
 <div class="grid g3">${db.programs.filter(p=>p.status!=='Inactive').slice(0,3).map(progCard).join('')}</div>
 <div style="text-align:center;margin-top:40px"><a class="btn btn-o" href="#/programs">View all programs</a></div></div></section>

 <section class="alt"><div class="container"><div class="sec-h"><span class="eyebrow">A day at Little Aarodiv</span><h2>Rhythm, routine & <em>a lot</em> of joy</h2></div>
 <div class="day">${[['8:00 AM','Warm Welcome','Health check, hugs and free play to ease into the day.'],['9:30 AM','Circle Time','Songs, stories, calendar talk and sharing moments.'],['10:30 AM','Healthy Snack','Seasonal fruits and wholesome bites.'],['11:00 AM','Learning Pods','Literacy, numeracy and hands-on STEM discovery.'],['12:30 PM','Lunch & Rest','Fresh home-style lunch followed by a cosy nap.'],['3:00 PM','Art & Music','Painting, clay, rhythm, dance and drama.'],['4:30 PM','Outdoor Play','Garden time, sand pit and gross-motor games.'],['6:00 PM','Home Time','Pick-up with a detailed daily report in the app.']].map(d=>`<div class="card hov"><span class="time">${d[0]}</span><h4>${d[1]}</h4><p>${d[2]}</p></div>`).join('')}</div></div></section>

 <section><div class="container"><div class="band"><div><b>200+</b><span>Happy Families</span></div><div><b>${db.staff.length*3}+</b><span>Caring Educators & Staff</span></div><div><b>${db.programs.length}</b><span>Thoughtful Programs</span></div><div><b>100%</b><span>Secure Campus</span></div></div></div></section>

 <section style="padding-top:0"><div class="container split"><div>${ph(P.room,'','height:460px;border-radius:30px')}</div>
 <div><span class="eyebrow">Upcoming at school</span><h2 style="font-size:clamp(30px,3.4vw,42px);margin:14px 0 24px">Celebrations, field trips & <em style="color:var(--coral)">memories</em></h2>
 <div class="grid" style="gap:14px">${ev.map(evCard).join('')||'<p class="muted">New events coming soon.</p>'}</div></div></div></section>

 <section class="alt"><div class="container"><div class="sec-h"><span class="eyebrow">Parent stories</span><h2>Words from our <em>families</em></h2></div>
 <div class="grid g3">${[['The teachers genuinely care. Our daughter runs in every morning and comes home singing new rhymes.','Priya R.','Mother of Myra, Preschool'],['The daily updates and photos give us complete peace of mind while we are at work.','Rahul K.','Father of Reyansh, Daycare'],['Beautiful campus, thoughtful curriculum and a team that treats every child like their own.','Kavya S.','Mother of Anaya, Toddlers']].map(t=>`<div class="quote"><span class="stars">★★★★★</span><p>“${t[0]}”</p><div class="who">${avatar(t[1])}<div><b>${t[1]}</b><small>${t[2]}</small></div></div></div>`).join('')}</div></div></section>

 <section><div class="container"><div class="cta"><div><img src="${LOGO_SRC}" alt="Little Aarodiv" style="height:54px;margin-bottom:14px;background:#1B1928;padding:8px 14px;border-radius:14px"><span class="eyebrow" style="display:flex;width:max-content">Limited seats for ${esc(s.session)}</span><h2 style="margin-top:14px">Come see where little wonders happen.</h2></div><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-p" href="#/admissions">Book a Visit</a><a class="btn btn-o" href="#/contact">Talk to Us</a></div></div></div></section>`}

const progCard=p=>`<div class="prog"><div class="ph">${`<img src="${IMG(p.img)}" alt="" loading="lazy" onerror="imgFail(this)">`}<span class="age">${esc(p.age)}</span></div><div class="bd"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="meta"><span class="muted">🕘 ${esc(p.timing)}</span><span><b>${fmt(p.fee)}</b><small class="muted">/mo</small></span></div><a class="btn btn-g btn-s" style="margin-top:16px" onclick="UI.prog='${esc(p.name)}';go('/admissions')">Enquire for ${esc(p.name)} →</a></div></div>`;
const evCard=e=>{const d=new Date(e.date+'T00:00');return `<div class="ev"><div class="dt"><div><b>${d.getDate()}</b><small>${d.toLocaleString('en',{month:'short'})}</small></div></div><div><h4>${esc(e.title)}</h4><p>${esc(e.time)} · ${esc(e.desc)}</p></div></div>`};

function about(){return `<div class="page-hero container"><span class="eyebrow">Our story</span><h1>Where childhood is <em>celebrated</em></h1><p>Little Aarodiv was born from a simple belief — that the early years are magical, and every child deserves a beautiful place to discover who they are.</p></div>
 <section style="padding-top:40px"><div class="container split">${ph(P.room)}<div><h2 style="font-size:clamp(30px,3.4vw,42px)">Our philosophy</h2><p class="muted" style="margin:16px 0">We blend the independence of Montessori, the creativity of Reggio Emilia and the warmth of Indian family values. Children learn through play, wonder and real-world experiences — guided by educators who listen as much as they teach.</p>
 <ul class="checks"><li>Child-led, play-based learning environments</li><li>Focus on social-emotional growth & kindness</li><li>Bilingual exposure with English & Telugu/Hindi rhymes</li><li>Transparent, daily communication with parents</li></ul></div></div></section>
 <section class="alt"><div class="container"><div class="sec-h"><span class="eyebrow">What we value</span><h2>Our <em>promise</em> to you</h2></div><div class="grid g4">${[['💛','t-gold','Love','Every child is known, valued and cared for.'],['🔍','t-sky','Curiosity','We nurture questions more than answers.'],['🤝','t-sage','Respect','For each child’s pace, culture and voice.'],['🌱','t-coral','Growth','Small steps today, big confidence tomorrow.']].map(v=>`<div class="card hov"><div class="ic ${v[1]}">${v[0]}</div><h3>${v[2]}</h3><p>${v[3]}</p></div>`).join('')}</div></div></section>
 <section><div class="container"><div class="sec-h"><span class="eyebrow">Meet the team</span><h2>The hearts behind <em>Little Aarodiv</em></h2></div>
 <div class="grid g4">${db.staff.filter(s=>s.status==='Active').slice(0,4).map(s=>`<div class="card hov" style="text-align:center">${avatar(s.name,'lg')}<h3 style="margin-top:14px;font-size:19px">${esc(s.name)}</h3><p>${esc(s.role)}</p></div>`).join('')}</div></div></section>
 <section style="padding-top:0"><div class="container"><div class="cta"><h2>Safety is not a feature. It’s our foundation.</h2><ul class="checks" style="margin:0"><li>Police-verified staff</li><li>Biometric & OTP-based pick-up</li><li>Paediatric first-aid certified team</li></ul></div></div></section>`}

function programsPage(){return `<div class="page-hero container"><span class="eyebrow">Programs & fees</span><h1>Thoughtful programs for <em>every age</em></h1><p>Small groups, caring educators and a curriculum that adapts to each child’s pace.</p></div>
 <section style="padding-top:40px"><div class="container"><div class="grid g3">${db.programs.filter(p=>p.status!=='Inactive').map(progCard).join('')}</div></div></section>
 <section class="alt"><div class="container split"><div><span class="eyebrow">Curriculum</span><h2 style="font-size:clamp(30px,3.4vw,42px);margin:14px 0">Seven areas of early development</h2><ul class="checks"><li>Language & early literacy</li><li>Numeracy & logical thinking</li><li>STEM & discovery play</li><li>Art, music & movement</li><li>Physical & motor development</li><li>Social-emotional learning</li><li>Life skills & independence</li></ul></div>${ph(P.blocks)}</div></section>`}

function galleryPage(){const cats=['All',...new Set(db.gallery.map(g=>g.category))];const list=db.gallery.filter(g=>UI.gcat==='All'||g.category===UI.gcat);
 return `<div class="page-hero container"><span class="eyebrow">Gallery</span><h1>Moments of <em>pure joy</em></h1><p>A peek into the everyday magic at Little Aarodiv.</p></div>
 <section style="padding-top:30px"><div class="container"><div class="chips">${cats.map(c=>`<span class="chip ${UI.gcat===c?'on':''}" onclick="UI.gcat='${esc(c)}';render()">${esc(c)}</span>`).join('')}</div>
 <div class="masonry">${list.map((g,i)=>`<div class="gi" onclick="lightbox('${esc(IMG(g.url))}')">${ph(g.url,'',`height:${[260,340,230,300][i%4]}px`)}<div class="cap">${esc(g.title)}<small>${esc(g.category)}</small></div></div>`).join('')}</div></div></section>`}
function lightbox(u){$('#modal').innerHTML=`<div class="mback" onclick="closeModal()"><div class="mbox img"><img src="${u.replace('w=1200','w=1800')}" alt=""></div></div>`}

function admissions(){return `<div class="page-hero container"><span class="eyebrow">Admissions ${esc(db.settings.session)}</span><h1>Begin your child’s <em>journey</em></h1><p>A simple, personal admission process — we’d love to meet you and your little one.</p></div>
 <section style="padding-top:40px"><div class="container"><div class="steps">${[['Enquire','Share a few details online'],['Visit','Tour our campus with your child'],['Meet','Interact with our educators'],['Register','Submit forms & documents'],['Welcome!','Settle-in week begins']].map(s=>`<div class="card"><h4>${s[0]}</h4><p class="muted" style="font-size:14px">${s[1]}</p></div>`).join('')}</div></div></section>
 <section class="alt"><div class="container split" style="align-items:start"><div><span class="eyebrow">Enquiry form</span><h2 style="font-size:clamp(30px,3.4vw,40px);margin:14px 0 24px">Book a campus tour</h2>
 <form class="f" onsubmit="return submitInquiry(event)"><div class="f2"><div><label>Child’s name *</label><input name="child" required></div><div><label>Child’s age *</label><input name="age" placeholder="e.g. 3 yrs" required></div></div>
 <div class="f2"><div><label>Parent’s name *</label><input name="parent" required></div><div><label>Phone *</label><input name="phone" type="tel" required></div></div>
 <div class="f2"><div><label>Email</label><input name="email" type="email"></div><div><label>Program</label><select name="program">${db.programs.map(p=>`<option ${UI.prog===p.name?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div></div>
 <div><label>Anything we should know?</label><textarea name="notes" placeholder="Preferred tour date, allergies, questions…"></textarea></div>
 <button class="btn btn-p" style="justify-self:start">Submit Enquiry →</button></form></div>
 <div><h3 style="font-size:26px;margin-bottom:18px">Frequently asked</h3>
 ${[['What is the admission age?','We welcome children from 6 months (Infant Care) up to 10 years (After-School Club).'],['What documents are needed?','Birth certificate, immunisation record, 2 passport photos and parent ID proof.'],['Do you provide meals?','Yes — freshly cooked, nutritionist-approved meals and snacks are included for daycare programs.'],['Is transport available?','Yes, GPS-tracked vans with a lady attendant cover major areas within 6 km.'],['How do I stay updated?','Our Parent Portal shares attendance, daily reports, photos, fees and notices in real time.']].map(q=>`<details><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('')}</div></div></section>`}
function submitInquiry(e){e.preventDefault();const _t=e.target;showLoader('Sending your enquiry…');setTimeout(()=>{hideLoader();_submitInquiry(_t)},800);return false}
function _submitInquiry(target){const e={target,preventDefault(){}};const f=Object.fromEntries(new FormData(e.target));db.inquiries.unshift({id:uid(),...f,date:todayStr(),status:'New'});save();e.target.reset();UI.prog='';
 $('#modal').innerHTML=`<div class="mback"><div class="mbox" style="text-align:center;max-width:460px"><div style="font-size:56px">🎉</div><h3 style="font-size:28px;margin:10px 0">Thank you!</h3><p class="muted">Our admissions team will call you within 24 hours to schedule your campus tour.</p><button class="btn btn-p" style="margin-top:22px" onclick="closeModal()">Wonderful</button></div></div>`;return false}

function contact(){const s=db.settings;return `<div class="page-hero container"><span class="eyebrow">Contact</span><h1>We’d love to <em>hear</em> from you</h1><p>Questions, visits or just a hello — our team is here for you.</p></div>
 <section style="padding-top:40px"><div class="container"><div class="grid g3" style="margin-bottom:40px">${[['📍','t-coral','Visit',s.address],['📞','t-sage','Call',s.phone+' · '+s.hours],['✉️','t-sky','Email',s.email]].map(c=>`<div class="card"><div class="ic ${c[1]}">${c[0]}</div><h3>${c[2]}</h3><p>${esc(c[3])}</p></div>`).join('')}</div>
 <div class="split" style="align-items:stretch"><div class="card"><h3 style="font-size:26px;margin-bottom:20px">Send us a message</h3><form class="f" onsubmit="return submitMsg(event)"><div class="f2"><div><label>Your name *</label><input name="name" required></div><div><label>Phone</label><input name="phone"></div></div><div><label>Email *</label><input name="email" type="email" required></div><div><label>Subject</label><input name="subject"></div><div><label>Message *</label><textarea name="message" required></textarea></div><button class="btn btn-p" style="justify-self:start">Send Message</button></form></div>
 <div class="map"><iframe loading="lazy" src="https://maps.google.com/maps?q=Banjara%20Hills%20Hyderabad&z=14&output=embed"></iframe></div></div></div></section>`}
function submitMsg(e){e.preventDefault();const _t=e.target;showLoader('Sending message…');setTimeout(()=>{hideLoader();_submitMsg(_t)},700);return false}
function _submitMsg(target){const e={target,preventDefault(){}};db.messages.unshift({id:uid(),...Object.fromEntries(new FormData(e.target)),date:todayStr(),read:false});save();e.target.reset();toast('Message sent — we’ll get back to you soon 💛');return false}

/* ============ LOGIN ============ */
const DEMO={admin:['admin@littleaarodiv.com','admin123'],teacher:['teacher@littleaarodiv.com','teacher123'],parent:['parent@littleaarodiv.com','parent123']};
function loginPage(){const r=UI.role||'parent';return `<div class="auth"><div class="ph">${`<img src="${IMG(P.hero)}" alt="">`}<div class="ov"><div class="ov-logo"><img src="${MARK_SRC}" alt=""></div><h2>Every day, a little <em>wonder</em>.</h2><p>Stay connected to your child’s world — attendance, daily moments, fees and more.</p></div></div>
 <div class="auth-f"><div class="auth-box">${brand()}<h1 style="font-size:36px;margin-top:34px">Welcome back</h1><p class="muted">Sign in to your Little Aarodiv portal.</p>
 <div class="tabs">${['parent','teacher','admin'].map(x=>`<button class="${r===x?'on':''}" onclick="UI.role='${x}';render()">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div>
 <form class="f" onsubmit="return doLogin(event)"><div><label>Email</label><input id="lem" type="email" value="${DEMO[r][0]}" required></div><div><label>Password</label><input id="lpw" type="password" value="${DEMO[r][1]}" required></div><button class="btn btn-p">Sign in as ${r[0].toUpperCase()+r.slice(1)} →</button></form>
 <div class="demo">🔑 <b>Demo access</b> — credentials are pre-filled for the selected role.<br>Admin: admin@littleaarodiv.com / admin123<br>Teacher: teacher@littleaarodiv.com / teacher123<br>Parent: parent@littleaarodiv.com / parent123</div>
 <p style="margin-top:20px;font-size:14px"><a href="#/home" class="muted">← Back to website</a></p></div></div></div>`}
function doLogin(e){e.preventDefault();const em=$('#lem').value.trim().toLowerCase(),pw=$('#lpw').value;const u=db.users.find(x=>x.email.toLowerCase()===em&&x.pass===pw);
 if(!u){toast('Invalid email or password','err');return false}showLoader('Signing you in…');SS.setItem('la_user',JSON.stringify({id:u.id}));toast('Welcome, '+u.name.split(' ')[0]+' 👋');go('/'+u.role+'/dashboard');return false}
function logout(){withLoader('Signing out…',()=>{SS.removeItem('la_user');go('/login')})}

/* ============ APP SHELL ============ */
const MENUS={
 admin:[['dashboard','📊','Dashboard'],['admissions','📝','Admissions'],['students','🧒','Students'],['staff','👩‍🏫','Staff'],['programs','📚','Programs'],['attendance','✅','Attendance'],['daily','🌈','Daily Reports'],['fees','💳','Fees & Billing'],['events','📅','Events'],['gallery','🖼️','Gallery'],['notices','📢','Notices'],['messages','✉️','Messages'],['reports','📈','Reports'],['settings','⚙️','Settings'],['sync','🔄','Neon Sync']],
 teacher:[['dashboard','📊','Dashboard'],['class','🧒','My Class'],['attendance','✅','Attendance'],['daily','🌈','Daily Reports'],['notices','📢','Notices'],['events','📅','Events']],
 parent:[['dashboard','🏠','Overview'],['attendance','✅','Attendance'],['daily','🌈','Daily Reports'],['fees','💳','Fees'],['gallery','🖼️','Gallery'],['events','📅','Events'],['notices','📢','Notices']]};
function shell(role,sub){const u=session();const m=MENUS[role];const it=m.find(x=>x[0]===sub)||m[0];
 const cnt={admissions:db.inquiries.filter(i=>i.status==='New').length,messages:db.messages.filter(x=>!x.read).length};
 const hr=new Date().getHours();const greet=(hr<12?'Good morning':hr<17?'Good afternoon':'Good evening')+', '+u.name.split(' ')[0];
 const roleLbl={admin:'Administrator',teacher:'Teacher · '+(u.program||''),parent:'Parent of '+stu(u.studentId).name};
 return `<div class="shell"><div class="overlay" id="ovl" onclick="toggleSide()"></div><aside class="side" id="side">${brand(true)}<div class="lbl">${role==='admin'?'Admin Console':role==='teacher'?'Teacher Portal':'Parent Portal'}</div>
 <nav>${m.map(x=>`<a href="#/${role}/${x[0]}" class="${x[0]===it[0]?'on':''}"><i>${x[1]}</i>${x[2]}${role==='admin'&&cnt[x[0]]?`<span class="cnt">${cnt[x[0]]}</span>`:''}</a>`).join('')}</nav>
 <div class="side-foot"><a href="#/home">🌐 View website</a><a onclick="logout()">⎋ Sign out</a></div></aside>
 <div class="main"><div class="top"><div class="tl"><button class="menu-t" onclick="toggleSide()">☰</button><div><h2>${it[2]}</h2><small>${greet}</small></div></div><div class="me">${avatar(u.name)}<div><b>${esc(u.name)}</b><small class="muted">${esc(roleLbl[role])}</small></div></div></div>
 <div class="content">${VIEWS[role][it[0]]()}</div></div></div>`}
function toggleSide(){$('#side').classList.toggle('open');$('#ovl').classList.toggle('open')}

/* ============ MODAL ============ */
function modal(title,body,foot=''){$('#modal').innerHTML=`<div class="mback" onclick="if(event.target===this)closeModal()"><div class="mbox"><div class="mh"><h3>${title}</h3><button class="x" onclick="closeModal()">✕</button></div>${body}${foot?`<div class="mf">${foot}</div>`:''}</div></div>`}
function closeModal(){const m=$('#modal');if(m)m.innerHTML=''}

/* ============ GENERIC CRUD ============ */
const opts=o=>(typeof o==='function'?o():o).map(x=>typeof x==='object'?x:{v:x,l:x});
const statusCell=k=>r=>badge(r[k]);
const CRUD={
 students:{title:'Students',sing:'Student',fields:[{k:'name',l:'Child name',req:1},{k:'dob',l:'Date of birth',t:'date'},{k:'gender',l:'Gender',t:'select',o:['Girl','Boy']},{k:'program',l:'Program',t:'select',o:()=>db.programs.map(p=>p.name)},{k:'parent',l:'Parent / Guardian',req:1},{k:'phone',l:'Phone'},{k:'email',l:'Email',t:'email'},{k:'joined',l:'Joined on',t:'date'},{k:'allergies',l:'Allergies / medical notes'},{k:'status',l:'Status',t:'select',o:['Active','On Leave','Alumni']}],
  cols:[['Child',r=>`<div class="nm">${avatar(r.name)}<div><b>${esc(r.name)}</b><small>${esc(r.gender||'')} · DOB ${fdate(r.dob)}</small></div></div>`],['Program',r=>esc(r.program)],['Parent',r=>`<div class="nm"><div><b>${esc(r.parent)}</b><small>${esc(r.phone)}</small></div></div>`],['Attendance',r=>`<b>${attPct(r.id)}%</b>`],['Joined',r=>fdate(r.joined)],['Status',statusCell('status')]]},
 staff:{title:'Staff',sing:'Staff Member',fields:[{k:'name',l:'Full name',req:1},{k:'role',l:'Role / designation',req:1},{k:'program',l:'Assigned program',t:'select',o:()=>['All',...db.programs.map(p=>p.name)]},{k:'phone',l:'Phone'},{k:'email',l:'Email',t:'email'},{k:'joined',l:'Joined on',t:'date'},{k:'status',l:'Status',t:'select',o:['Active','On Leave','Inactive']}],
  cols:[['Name',r=>`<div class="nm">${avatar(r.name)}<div><b>${esc(r.name)}</b><small>${esc(r.email)}</small></div></div>`],['Role',r=>esc(r.role)],['Program',r=>esc(r.program)],['Phone',r=>esc(r.phone)],['Joined',r=>fdate(r.joined)],['Status',statusCell('status')]]},
 programs:{title:'Programs',sing:'Program',fields:[{k:'name',l:'Program name',req:1},{k:'age',l:'Age group',req:1},{k:'timing',l:'Timing'},{k:'fee',l:'Monthly fee (₹)',t:'number'},{k:'capacity',l:'Capacity',t:'number'},{k:'img',l:'Image URL / Unsplash ID'},{k:'status',l:'Status',t:'select',o:['Active','Inactive']},{k:'desc',l:'Description',t:'textarea'}],
  cols:[['Program',r=>`<div class="nm"><div class="ph" style="width:46px;height:46px;border-radius:12px;flex:none"><img src="${IMG(r.img||'')}" onerror="imgFail(this)"></div><div><b>${esc(r.name)}</b><small>${esc(r.age)}</small></div></div>`],['Timing',r=>esc(r.timing)],['Fee',r=>`<b>${fmt(r.fee)}</b>`],['Enrolled',r=>{const n=db.students.filter(s=>s.program===r.name&&s.status==='Active').length;return `${n} / ${r.capacity}<div class="prog-bar" style="width:110px"><i style="width:${Math.min(100,n/(r.capacity||1)*100)}%"></i></div>`}],['Status',statusCell('status')]]},
 events:{title:'Events',sing:'Event',fields:[{k:'title',l:'Event title',req:1},{k:'date',l:'Date',t:'date',req:1},{k:'time',l:'Time'},{k:'audience',l:'Audience',t:'select',o:['All','Parents','Staff']},{k:'desc',l:'Description',t:'textarea'}],
  cols:[['Event',r=>`<b>${esc(r.title)}</b>`],['Date',r=>fdate(r.date)],['Time',r=>esc(r.time)],['Audience',statusCell('audience')],['Status',r=>badge(r.date>=todayStr()?'Upcoming':'Completed')]]},
 notices:{title:'Notices',sing:'Notice',fields:[{k:'title',l:'Title',req:1},{k:'audience',l:'Audience',t:'select',o:['All','Parents','Staff']},{k:'date',l:'Date',t:'date'},{k:'body',l:'Message',t:'textarea',req:1}],
  cols:[['Notice',r=>`<b>${esc(r.title)}</b><br><small class="muted">${esc((r.body||'').slice(0,70))}${(r.body||'').length>70?'…':''}</small>`],['Audience',statusCell('audience')],['Date',r=>fdate(r.date)]]},
 inquiries:{title:'Enquiries',sing:'Enquiry',fields:[{k:'child',l:'Child name',req:1},{k:'age',l:'Age'},{k:'parent',l:'Parent name',req:1},{k:'phone',l:'Phone'},{k:'email',l:'Email',t:'email'},{k:'program',l:'Program',t:'select',o:()=>db.programs.map(p=>p.name)},{k:'date',l:'Enquiry date',t:'date'},{k:'status',l:'Status',t:'select',o:['New','Contacted','Tour Scheduled','Enrolled','Closed']},{k:'notes',l:'Notes',t:'textarea'}],
  filter:r=>UI.iq==='All'||r.status===UI.iq,
  cols:[['Child',r=>`<div class="nm">${avatar(r.child)}<div><b>${esc(r.child)}</b><small>${esc(r.age)}</small></div></div>`],['Parent',r=>`<b>${esc(r.parent)}</b><br><small class="muted">${esc(r.phone)}</small>`],['Program',r=>esc(r.program)],['Date',r=>fdate(r.date)],['Status',statusCell('status')]],
  extra:r=>r.status!=='Enrolled'?`<button class="btn btn-p btn-xs" onclick="enrollInquiry('${r.id}')">Enroll</button>`:''},
 fees:{title:'Invoices',sing:'Invoice',fields:[{k:'studentId',l:'Student',t:'select',o:()=>db.students.map(s=>({v:s.id,l:s.name})),req:1},{k:'month',l:'Billing month',t:'month',req:1},{k:'amount',l:'Amount (₹)',t:'number',req:1},{k:'due',l:'Due date',t:'date'},{k:'status',l:'Status',t:'select',o:['Pending','Paid']},{k:'mode',l:'Payment mode',t:'select',o:['','UPI','Card','Net Banking','Cash','Cheque']},{k:'paidOn',l:'Paid on',t:'date'}],
  filter:r=>!UI.fm||r.month===UI.fm,
  cols:[['Student',r=>{const s=stu(r.studentId);return `<div class="nm">${avatar(s.name)}<div><b>${esc(s.name)}</b><small>${esc(s.program)}</small></div></div>`}],['Month',r=>fmon(r.month)],['Amount',r=>`<b>${fmt(r.amount)}</b>`],['Due',r=>fdate(r.due)],['Paid on',r=>r.paidOn?fdate(r.paidOn)+' · '+esc(r.mode||''):'—'],['Status',r=>badge(feeStatus(r))]],
  extra:r=>r.status!=='Paid'?`<button class="btn btn-p btn-xs" onclick="markPaid('${r.id}')">Mark paid</button><button class="btn btn-g btn-xs" onclick="toast('Reminder sent to '+'${esc(stu(r.studentId).parent||'')}'.trim())">Remind</button>`:`<button class="btn btn-g btn-xs" onclick="receipt('${r.id}')">Receipt</button>`}
};
Object.assign(BADGE,{Upcoming:'blue',Completed:'grey'});
function crudView(key,top=''){const c=CRUD[key];return `${top}<div class="toolbar"><div class="row"><input placeholder="🔍  Search ${c.title.toLowerCase()}…" value="${esc(UI.q[key]||'')}" oninput="UI.q['${key}']=this.value;refreshTable('${key}')">${c.tools?c.tools():''}</div>
 <div class="tb-r"><button class="btn btn-g btn-s" onclick="exportCSV('${key}')">⤓ Export CSV</button><button class="btn btn-p btn-s" onclick="openForm('${key}')">+ Add ${c.sing}</button></div></div><div id="tbl-${key}">${tableHTML(key)}</div>`}
function tableHTML(key){const c=CRUD[key];const q=(UI.q[key]||'').toLowerCase();
 let rows=db[key].filter(r=>(!c.filter||c.filter(r))&&(!q||JSON.stringify(r).toLowerCase().includes(q)||(r.studentId&&stu(r.studentId).name.toLowerCase().includes(q))));
 if(!rows.length)return `<div class="empty"><div>🌼</div>No ${c.title.toLowerCase()} found.</div>`;
 return `<div class="tbl-wrap"><table><thead><tr>${c.cols.map(x=>`<th>${x[0]}</th>`).join('')}<th style="text-align:right">Actions</th></tr></thead><tbody>${rows.map(r=>`<tr>${c.cols.map(x=>`<td>${x[1](r)}</td>`).join('')}<td><div class="acts">${c.extra?c.extra(r):''}<button class="btn btn-g btn-xs" onclick="openForm('${key}','${r.id}')">Edit</button><button class="btn btn-d btn-xs" onclick="delRow('${key}','${r.id}')">Delete</button></div></td></tr>`).join('')}</tbody></table></div>
 <p class="muted" style="font-size:13px;margin-top:10px">Showing ${rows.length} of ${db[key].length} records</p>`}
function refreshTable(k){$('#tbl-'+k).innerHTML=tableHTML(k)}
function field(f,v){v=v??'';const n=`name="${f.k}" ${f.req?'required':''}`;
 if(f.t==='select')return `<select ${n}>${opts(f.o).map(o=>`<option value="${esc(o.v)}" ${String(o.v)===String(v)?'selected':''}>${esc(o.l||'—')}</option>`).join('')}</select>`;
 if(f.t==='textarea')return `<textarea ${n}>${esc(v)}</textarea>`;
 return `<input type="${f.t||'text'}" ${n} value="${esc(v)}">`}
function openForm(key,id,preset){const c=CRUD[key];const r=id?db[key].find(x=>x.id===id):(preset||{});
 modal((id?'Edit ':'Add ')+c.sing,`<form id="cf" class="f" onsubmit="return saveForm(event,'${key}','${id||''}')"><div class="f2">${c.fields.map(f=>`<div style="${f.t==='textarea'?'grid-column:1/-1':''}"><label>${f.l}${f.req?' *':''}</label>${field(f,r[f.k])}</div>`).join('')}</div></form>`,
 `<button class="btn btn-g" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="$('#cf').requestSubmit()">${id?'Save changes':'Create '+c.sing}</button>`)}
function saveForm(e,key,id){e.preventDefault();const c=CRUD[key];const d=Object.fromEntries(new FormData(e.target));c.fields.forEach(f=>{if(f.t==='number')d[f.k]=Number(d[f.k]||0)});
 if(id){const r=db[key].find(x=>x.id===id);const old=r.name;Object.assign(r,d);if(key==='programs'&&old!==d.name)db.students.forEach(s=>{if(s.program===old)s.program=d.name})}
 else{if(key==='fees'&&!d.status)d.status='Pending';db[key].unshift({id:uid(),...d})}
 save();closeModal();render();toast(c.sing+(id?' updated':' added')+' ✓');return false}
function delRow(key,id){if(!confirm('Delete this '+CRUD[key].sing.toLowerCase()+'? This cannot be undone.'))return;db[key]=db[key].filter(x=>x.id!==id);save();render();toast('Deleted')}
function exportCSV(key){withLoader('Preparing export…',()=>_exportCSV(key),500)}
function _exportCSV(key){const rows=db[key];if(!rows.length)return toast('Nothing to export','err');const ks=[...new Set(rows.flatMap(Object.keys))];
 const csv=[ks.join(','),...rows.map(r=>ks.map(k=>`"${String(k==='studentId'?stu(r[k]).name:r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`little-aarodiv-${key}-${todayStr()}.csv`;a.click();toast('CSV downloaded')}

/* ============ ACTIONS ============ */
function enrollInquiry(id){const i=db.inquiries.find(x=>x.id===id);closeModal();
 openForm('students',null,{name:i.child,program:i.program,parent:i.parent,phone:i.phone,email:i.email,joined:todayStr(),status:'Active',allergies:'None'});
 const f=$('#cf');f.onsubmit=e=>{saveForm(e,'students','');i.status='Enrolled';save();render();return false}}
function markPaid(id){const f=db.fees.find(x=>x.id===id);modal('Record payment',`<p class="muted" style="margin-bottom:16px">${esc(stu(f.studentId).name)} · ${fmon(f.month)} · <b style="color:var(--ink)">${fmt(f.amount)}</b></p><div class="f2"><div><label>Payment mode</label><select id="pm"><option>UPI</option><option>Card</option><option>Net Banking</option><option>Cash</option><option>Cheque</option></select></div><div><label>Paid on</label><input id="pd" type="date" value="${todayStr()}"></div></div>`,
 `<button class="btn btn-g" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="confirmPaid('${id}',$('#pm').value,$('#pd').value)">Confirm payment</button>`)}
function confirmPaid(id,mode,on){closeModal();showLoader('Processing payment…');setTimeout(()=>{hideLoader();_confirmPaid(id,mode,on)},1000)}
function _confirmPaid(id,mode,on){const f=db.fees.find(x=>x.id===id);Object.assign(f,{status:'Paid',mode,paidOn:on||todayStr()});save();closeModal();render();toast('Payment recorded ✓')}
function receipt(id){const f=db.fees.find(x=>x.id===id),s=stu(f.studentId),st=db.settings;
 modal('Fee Receipt',`<div style="border:1px dashed var(--line);border-radius:18px;padding:24px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="rcpt-logo">${brand()}</span><span class="badge b-green">PAID</span></div><hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
 <table><tbody>${[['Receipt No.','LA-'+f.id.toUpperCase()],['Student',s.name],['Program',s.program],['Parent',s.parent],['Billing month',fmon(f.month)],['Paid on',fdate(f.paidOn)],['Mode',f.mode||'—']].map(r=>`<tr><td class="muted">${r[0]}</td><td style="text-align:right"><b>${esc(r[1])}</b></td></tr>`).join('')}<tr><td><b>Total</b></td><td style="text-align:right;font-family:Fraunces;font-size:24px"><b>${fmt(f.amount)}</b></td></tr></tbody></table>
 <p class="muted" style="font-size:12px;margin-top:14px">${esc(st.address)} · ${esc(st.phone)}</p></div>`,`<button class="btn btn-g" onclick="window.print()">🖨 Print</button><button class="btn btn-p" onclick="closeModal()">Done</button>`)}
function genInvoices(){const m=prompt('Generate invoices for month (YYYY-MM):',monthStr());if(!m||!/^\d{4}-\d{2}$/.test(m))return;withLoader('Generating invoices…',()=>_gen(m))}
function _gen(m){let n=0;
 db.students.filter(s=>s.status==='Active').forEach(s=>{if(!db.fees.some(f=>f.studentId===s.id&&f.month===m)){db.fees.unshift({id:uid(),studentId:s.id,month:m,amount:progOf(s.program).fee||0,due:m+'-10',status:'Pending',paidOn:'',mode:''});n++}});
 save();render();toast(n?`${n} invoices generated for ${fmon(m)}`:'All invoices already exist for this month')}
function setAtt(d,sid,v){db.attendance[d]=db.attendance[d]||{};db.attendance[d][sid]=v;save();render()}
function markAll(d){db.attendance[d]=db.attendance[d]||{};(UI.attIds||[]).forEach(id=>db.attendance[d][id]='P');save();render();toast('All marked present ✓')}

/* ============ CHART HELPERS ============ */
const bars=(data,cls='')=>{const mx=Math.max(...data.map(d=>d[1]),1);return `<div class="bars">${data.map(d=>`<div class="bar" title="${esc(d[0])}"><div class="bv ${cls}" style="height:${d[1]/mx*85}%"><span>${d[2]??d[1]}</span></div><small>${esc(d[0])}</small></div>`).join('')}</div>`};
function todayAtt(ids){const r=db.attendance[todayStr()]||{};const p=ids.filter(i=>r[i]==='P').length,a=ids.filter(i=>r[i]==='A').length;return {p,a,u:ids.length-p-a,pct:ids.length?Math.round(p/ids.length*100):0}}
const kpi=(ic,t,v,l)=>`<div class="card"><div class="ic ${t}">${ic}</div><div><b>${v}</b><small>${l}</small></div></div>`;
const empty=(t,i='🌼')=>`<div class="empty"><div>${i}</div>${t}</div>`;
const noticeList=aud=>{const l=db.notices.filter(n=>aud.includes(n.audience)).sort((a,b)=>b.date.localeCompare(a.date));return l.length?l.map(n=>`<div class="rep" style="margin-bottom:12px"><div class="rh"><h3 style="font-size:18px">📢 ${esc(n.title)}</h3>${badge(n.audience)}</div><p class="muted">${esc(n.body)}</p><small class="muted" style="display:block;margin-top:10px">${fdate(n.date)}</small></div>`).join(''):empty('No notices yet.')};
const eventGrid=aud=>{const l=db.events.filter(e=>aud.includes(e.audience)&&e.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date));return l.length?`<div class="grid g2" style="gap:14px">${l.map(evCard).join('')}</div>`:empty('No upcoming events.')};
function repCard(r,showName){const s=stu(r.studentId);return `<div class="rep"><div class="rh"><div class="nm">${showName?avatar(s.name):''}<div><b>${showName?esc(s.name):fdate(r.date)}</b><small class="muted">${showName?fdate(r.date)+' · ':''}by ${esc(r.teacher)}</small></div></div><span style="font-size:22px">${esc((r.mood||'').split(' ')[0])}</span></div>
 <div class="rg"><div><small>Meals</small>${esc(r.meals)}</div><div><small>Nap</small>${esc(r.nap)}</div><div><small>Mood</small>${esc(r.mood)}</div></div><p style="font-size:14px"><b>Activities:</b> ${esc(r.activities)}</p>${r.note?`<p class="muted" style="font-size:14px;margin-top:6px;font-style:italic">“${esc(r.note)}”</p>`:''}</div>`}

/* ============ SHARED VIEWS ============ */
function attendanceView(role){const u=session();const date=UI.attDate||todayStr();const prog=role==='teacher'?u.program:UI.attProg;
 const list=db.students.filter(s=>s.status==='Active'&&(prog==='All'||s.program===prog));UI.attIds=list.map(s=>s.id);const rec=db.attendance[date]||{};const t=(()=>{const p=list.filter(s=>rec[s.id]==='P').length,a=list.filter(s=>rec[s.id]==='A').length;return{p,a,u:list.length-p-a}})();
 return `<div class="toolbar"><div class="row"><input type="date" value="${date}" max="${todayStr()}" onchange="UI.attDate=this.value;render()">${role==='admin'?`<select onchange="UI.attProg=this.value;render()"><option>All</option>${db.programs.map(p=>`<option ${p.name===prog?'selected':''}>${esc(p.name)}</option>`).join('')}</select>`:`<span class="badge b-lav">${esc(prog)}</span>`}</div><div class="tb-r"><button class="btn btn-p btn-s" onclick="markAll('${date}')">✓ Mark all present</button></div></div>
 <div class="kpi">${kpi('🧒','t-sky',list.length,'Students')}${kpi('✅','t-sage',t.p,'Present')}${kpi('🚫','t-coral',t.a,'Absent')}${kpi('⏳','t-gold',t.u,'Not marked')}</div>
 <div class="att-list">${list.map(s=>`<div class="att-item">${avatar(s.name)}<div><b>${esc(s.name)}</b><small>${esc(s.program)}${s.allergies&&s.allergies!=='None'?' · ⚠️ '+esc(s.allergies):''}</small></div><div class="seg"><button class="${rec[s.id]==='P'?'p':''}" onclick="setAtt('${date}','${s.id}','P')">Present</button><button class="${rec[s.id]==='A'?'a':''}" onclick="setAtt('${date}','${s.id}','A')">Absent</button></div></div>`).join('')||empty('No active students.')}</div>`}

function dailyView(role){const u=session();const kids=db.students.filter(s=>s.status==='Active'&&(role!=='teacher'||s.program===u.program));const ids=kids.map(k=>k.id);
 const list=db.reports.filter(r=>ids.includes(r.studentId)).sort((a,b)=>b.date.localeCompare(a.date));
 return `<div class="dg dg2" style="align-items:start"><div class="panel"><div class="ph-h"><h3>Recent reports</h3><span class="muted" style="font-size:13px">${list.length} posted</span></div><div class="grid" style="gap:14px">${list.slice(0,20).map(r=>repCard(r,true)).join('')||empty('No reports yet.')}</div></div>
 <div class="panel"><h3 style="margin-bottom:16px">Post a daily report</h3><form class="f" onsubmit="return postReport(event)"><div><label>Child *</label><select name="studentId" required>${kids.map(k=>`<option value="${k.id}">${esc(k.name)} · ${esc(k.program)}</option>`).join('')}</select></div>
 <div class="f2"><div><label>Meals</label><select name="meals"><option>Ate all</option><option>Ate most</option><option>Ate a little</option><option>Did not eat</option></select></div><div><label>Nap</label><input name="nap" placeholder="e.g. 1 hr 10 min"></div></div>
 <div><label>Mood</label><select name="mood"><option>😊 Happy</option><option>🤩 Excited</option><option>😌 Calm</option><option>😴 Tired</option><option>😢 Fussy</option></select></div>
 <div><label>Activities *</label><input name="activities" required placeholder="Art, story time, outdoor play…"></div><div><label>Note for parents</label><textarea name="note" placeholder="A special moment from today…"></textarea></div>
 <button class="btn btn-p">Post report</button></form></div></div>`}
function postReport(e){e.preventDefault();const _t=e.target;showLoader('Sharing with parents…');setTimeout(()=>{hideLoader();_postReport(_t)},700);return false}
function _postReport(target){const e={target,preventDefault(){}};db.reports.unshift({id:uid(),...Object.fromEntries(new FormData(e.target)),date:todayStr(),teacher:session().name});save();render();toast('Daily report shared with parents 🌈');return false}

/* ============ ADMIN VIEWS ============ */
const A={
 dashboard(){const act=db.students.filter(s=>s.status==='Active');const t=todayAtt(act.map(s=>s.id));const m=monthStr();const mf=db.fees.filter(f=>f.month===m);
  const coll=mf.filter(f=>f.status==='Paid').reduce((a,f)=>a+f.amount,0),pend=mf.filter(f=>f.status!=='Paid').reduce((a,f)=>a+f.amount,0);
  const months=[...new Set(db.fees.map(f=>f.month))].sort().slice(-6);
  return `<div class="kpi">${kpi('🧒','t-coral',act.length,'Active students')}${kpi('👩‍🏫','t-sage',db.staff.filter(s=>s.status==='Active').length,'Active staff')}${kpi('📝','t-sky',db.inquiries.filter(i=>i.status==='New').length,'New enquiries')}${kpi('💳','t-gold',fmt(coll),'Collected · '+fmon(m))}</div>
  <div class="dg dg2"><div class="panel"><div class="ph-h"><div><h3>Enrollment by program</h3><small class="muted">Active students vs capacity</small></div></div>${bars(db.programs.map(p=>[p.name.split(' ')[0],db.students.filter(s=>s.program===p.name&&s.status==='Active').length]))}</div>
  <div class="panel" style="text-align:center"><h3>Today’s attendance</h3><small class="muted">${fdate(todayStr())}</small><div class="donut" style="--p:${t.pct}"><b>${t.pct}%<small>present</small></b></div><div class="legend"><span><i style="background:var(--sage)"></i>Present ${t.p}</span><span><i style="background:#F6CFC8"></i>Absent/Unmarked ${t.a+t.u}</span></div><a class="btn btn-g btn-s" style="margin-top:16px" href="#/admin/attendance">Take attendance</a></div></div>
  <div class="dg dg2"><div class="panel"><div class="ph-h"><div><h3>Fee collection</h3><small class="muted">Last ${months.length} months</small></div><span class="badge b-amber">Pending ${fmt(pend)}</span></div>${bars(months.map(x=>{const v=db.fees.filter(f=>f.month===x&&f.status==='Paid').reduce((a,f)=>a+f.amount,0);return[fmon(x),v,'₹'+Math.round(v/1000)+'k']}),'s')}</div>
  <div class="panel"><div class="ph-h"><h3>Upcoming events</h3><a class="btn btn-g btn-xs" href="#/admin/events">Manage</a></div>${db.events.filter(e=>e.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4).map(e=>`<div class="list-i"><span class="av" style="background:var(--cream2);color:var(--ink);border-radius:12px">📅</span><div><b>${esc(e.title)}</b><small>${fdate(e.date)} · ${esc(e.time)}</small></div></div>`).join('')||'<p class="muted">None</p>'}</div></div>
  <div class="panel"><div class="ph-h"><h3>Latest enquiries</h3><a class="btn btn-g btn-xs" href="#/admin/admissions">View all</a></div><div class="tbl-wrap" style="border:0"><table><thead><tr><th>Child</th><th>Parent</th><th>Program</th><th>Date</th><th>Status</th></tr></thead><tbody>${db.inquiries.slice(0,5).map(i=>`<tr><td><div class="nm">${avatar(i.child)}<b>${esc(i.child)}</b></div></td><td>${esc(i.parent)}</td><td>${esc(i.program)}</td><td>${fdate(i.date)}</td><td>${badge(i.status)}</td></tr>`).join('')}</tbody></table></div></div>`},
 admissions(){const st=['All','New','Contacted','Tour Scheduled','Enrolled','Closed'];
  return crudView('inquiries',`<div class="pipe">${st.slice(1).map(s=>`<div class="card ${UI.iq===s?'on':''}" onclick="UI.iq=UI.iq==='${s}'?'All':'${s}';render()"><b>${db.inquiries.filter(i=>i.status===s).length}</b><small>${s}</small></div>`).join('')}</div>`)},
 students:()=>crudView('students'),staff:()=>crudView('staff'),programs:()=>crudView('programs'),events:()=>crudView('events'),notices:()=>crudView('notices'),
 attendance:()=>attendanceView('admin'),daily:()=>dailyView('admin'),
 fees(){const all=db.fees;const sum=f=>all.filter(f).reduce((a,x)=>a+Number(x.amount),0);const months=[...new Set(all.map(f=>f.month))].sort().reverse();
  CRUD.fees.tools=()=>`<select onchange="UI.fm=this.value;refreshTable('fees')"><option value="">All months</option>${months.map(m=>`<option value="${m}" ${UI.fm===m?'selected':''}>${fmon(m)}</option>`).join('')}</select><button class="btn btn-g btn-s" onclick="genInvoices()">⚡ Generate monthly invoices</button>`;
  return crudView('fees',`<div class="kpi">${kpi('💰','t-sage',fmt(sum(f=>f.status==='Paid')),'Total collected')}${kpi('⏳','t-gold',fmt(sum(f=>feeStatus(f)==='Pending')),'Pending')}${kpi('⚠️','t-coral',fmt(sum(f=>feeStatus(f)==='Overdue')),'Overdue')}${kpi('🧾','t-sky',all.length,'Invoices')}</div>`)},
 gallery(){return `<div class="toolbar"><p class="muted">${db.gallery.length} photos · visible on the public website & parent portal</p><button class="btn btn-p btn-s" onclick="openGal()">+ Add Photo</button></div>
  <div class="gadm">${db.gallery.map(g=>`<div class="gc">${ph(g.url)}<div class="gb"><div><b>${esc(g.title)}</b><small>${esc(g.category)}</small></div><div class="acts"><button class="btn btn-g btn-xs" onclick="openGal('${g.id}')">Edit</button><button class="btn btn-d btn-xs" onclick="delRow('gallery','${g.id}')">✕</button></div></div></div>`).join('')}</div>`},
 messages(){return `<div class="toolbar"><p class="muted">${db.messages.filter(m=>!m.read).length} unread of ${db.messages.length} messages from the website contact form</p><button class="btn btn-g btn-s" onclick="exportCSV('messages')">⤓ Export CSV</button></div>
  ${db.messages.map(m=>`<div class="msg ${m.read?'':'unread'}" onclick="openMsg('${m.id}')">${avatar(m.name)}<div><b>${esc(m.name)} ${m.read?'':'<span class="badge b-red" style="margin-left:6px">New</span>'}</b><p><b style="color:var(--ink)">${esc(m.subject||'(no subject)')}</b> — ${esc(m.message)}</p></div><small class="muted">${fdate(m.date)}</small></div>`).join('')||empty('Inbox is empty.','📭')}`},
 reports(){const act=db.students.filter(s=>s.status==='Active');const dues=db.fees.filter(f=>f.status!=='Paid');
  return `<div class="dg dg11"><div class="panel"><h3>Program utilisation</h3><small class="muted">Enrolled vs capacity</small><div style="margin-top:16px">${db.programs.map(p=>{const n=db.students.filter(s=>s.program===p.name&&s.status==='Active').length,pc=Math.round(n/(p.capacity||1)*100);return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:14px"><b>${esc(p.name)}</b><span class="muted">${n}/${p.capacity} · ${pc}%</span></div><div class="prog-bar"><i style="width:${Math.min(pc,100)}%"></i></div></div>`}).join('')}</div></div>
  <div class="panel"><h3>Enquiry funnel</h3><small class="muted">Conversion pipeline</small>${bars(['New','Contacted','Tour Scheduled','Enrolled','Closed'].map(s=>[s,db.inquiries.filter(i=>i.status===s).length]))}<p class="muted" style="font-size:13px;margin-top:10px">Conversion rate: <b style="color:var(--ink)">${db.inquiries.length?Math.round(db.inquiries.filter(i=>i.status==='Enrolled').length/db.inquiries.length*100):0}%</b></p></div></div>
  <div class="dg dg11"><div class="panel"><div class="ph-h"><h3>Attendance by student</h3><button class="btn btn-g btn-xs" onclick="exportCSV('students')">Export</button></div><div class="tbl-wrap" style="border:0"><table><thead><tr><th>Student</th><th>Program</th><th>Attendance</th></tr></thead><tbody>${act.map(s=>({s,p:attPct(s.id)})).sort((a,b)=>a.p-b.p).map(x=>`<tr><td><div class="nm">${avatar(x.s.name)}<b>${esc(x.s.name)}</b></div></td><td>${esc(x.s.program)}</td><td><b style="color:${x.p<80?'#B33A2B':'#2F7A4B'}">${x.p}%</b></td></tr>`).join('')}</tbody></table></div></div>
  <div class="panel"><div class="ph-h"><h3>Outstanding fees</h3><button class="btn btn-g btn-xs" onclick="exportCSV('fees')">Export</button></div>${dues.length?`<div class="tbl-wrap" style="border:0"><table><thead><tr><th>Student</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead><tbody>${dues.map(f=>`<tr><td>${esc(stu(f.studentId).name)}</td><td>${fmon(f.month)}</td><td><b>${fmt(f.amount)}</b></td><td>${badge(feeStatus(f))}</td></tr>`).join('')}</tbody></table></div>`:empty('All fees are cleared! 🎉')}</div></div>`},
 settings(){const s=db.settings;return `<div class="dg dg2" style="align-items:start"><div class="panel"><h3 style="margin-bottom:18px">Center profile</h3><form class="f" onsubmit="return saveSettings(event)"><div class="f2">${[['name','Center name'],['tagline','Tagline'],['phone','Phone'],['email','Email'],['hours','Working hours'],['session','Academic session'],['ratio','Teacher : child ratio']].map(f=>`<div><label>${f[1]}</label><input name="${f[0]}" value="${esc(s[f[0]])}"></div>`).join('')}<div style="grid-column:1/-1"><label>Address</label><textarea name="address">${esc(s.address)}</textarea></div></div><button class="btn btn-p" style="justify-self:start">Save settings</button></form></div>
  <div><div class="panel" style="margin-bottom:22px"><div class="ph-h"><h3>Portal users</h3><button class="btn btn-p btn-xs" onclick="openUser()">+ Add user</button></div>${db.users.map(u=>`<div class="list-i">${avatar(u.name)}<div><b>${esc(u.name)}</b><small>${esc(u.email)} · ${u.role}${u.studentId?' · '+esc(stu(u.studentId).name):''}${u.program?' · '+esc(u.program):''}</small></div>${u.id!=='u1'?`<button class="btn btn-d btn-xs" onclick="delUser('${u.id}')">✕</button>`:''}</div>`).join('')}</div>
  <div class="panel"><h3>Data</h3><p class="muted" style="font-size:14px;margin:6px 0 16px">All data is stored securely in this browser. Reset to restore demo content.</p><button class="btn btn-d btn-s" onclick="if(confirm('Reset all data to demo defaults?')){LS.removeItem(DB_KEY);db=seed();save();render();toast('Demo data restored')}">↺ Reset demo data</button></div></div></div>`}
};
function openGal(id){const g=id?db.gallery.find(x=>x.id===id):{};modal(id?'Edit photo':'Add photo',`<form id="gf" class="f" onsubmit="return saveGal(event,'${id||''}')"><div><label>Title *</label><input name="title" required value="${esc(g.title)}"></div><div><label>Category</label><select name="category">${['Classrooms','Art & Craft','Learning','Outdoor','Celebrations'].map(c=>`<option ${g.category===c?'selected':''}>${c}</option>`).join('')}</select></div><div><label>Image URL or Unsplash photo ID *</label><input name="url" required value="${esc(g.url)}" placeholder="https://…"></div><div><label>…or upload from device</label><input type="file" accept="image/*" onchange="readImg(this)"></div></form>`,`<button class="btn btn-g" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="$('#gf').requestSubmit()">Save photo</button>`)}
function readImg(inp){const f=inp.files[0];if(!f)return;if(f.size>1.5e6)return toast('Please choose an image under 1.5 MB','err');const r=new FileReader();showLoader('Uploading photo…');r.onload=()=>{hideLoader();$('#gf [name=url]').value=r.result};r.readAsDataURL(f)}
function saveGal(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(id)Object.assign(db.gallery.find(x=>x.id===id),d);else db.gallery.unshift({id:uid(),...d});try{save()}catch(x){return toast('Storage full — use an image URL instead','err'),false}closeModal();render();toast('Gallery updated ✓');return false}
function openMsg(id){const m=db.messages.find(x=>x.id===id);m.read=true;save();render();modal(esc(m.subject||'Message'),`<div class="nm" style="margin-bottom:16px">${avatar(m.name)}<div><b>${esc(m.name)}</b><small>${esc(m.email)} · ${esc(m.phone||'')} · ${fdate(m.date)}</small></div></div><p style="background:var(--cream);padding:18px;border-radius:14px">${esc(m.message)}</p>`,
 `<button class="btn btn-d" onclick="delRow('messages','${id}')">Delete</button><a class="btn btn-p" href="mailto:${esc(m.email)}?subject=Re: ${encodeURIComponent(m.subject||'')}">Reply by email</a>`)}
CRUD.messages={sing:'Message',title:'Messages'};CRUD.gallery={sing:'Photo',title:'Gallery'};
function saveSettings(e){e.preventDefault();Object.assign(db.settings,Object.fromEntries(new FormData(e.target)));save();render();toast('Settings saved ✓');return false}
function openUser(){modal('Add portal user',`<form id="uf" class="f" onsubmit="return saveUser(event)"><div class="f2"><div><label>Name *</label><input name="name" required></div><div><label>Email *</label><input name="email" type="email" required></div><div><label>Password *</label><input name="pass" required></div><div><label>Role</label><select name="role" onchange="$('#ux').innerHTML=userExtra(this.value)"><option value="parent">Parent</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></div><div id="ux" style="grid-column:1/-1">${userExtra('parent')}</div></div></form>`,`<button class="btn btn-g" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="$('#uf').requestSubmit()">Create user</button>`)}
const userExtra=r=>r==='parent'?`<label>Linked child</label><select name="studentId">${db.students.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>`:r==='teacher'?`<label>Class / program</label><select name="program">${db.programs.map(p=>`<option>${esc(p.name)}</option>`).join('')}</select>`:'';
function saveUser(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(db.users.some(u=>u.email.toLowerCase()===d.email.toLowerCase()))return toast('Email already exists','err'),false;db.users.push({id:uid(),...d});save();closeModal();render();toast('User created ✓');return false}
function delUser(id){if(confirm('Remove this user?')){db.users=db.users.filter(u=>u.id!==id);save();render()}}

/* ============ TEACHER VIEWS ============ */
const T={
 dashboard(){const u=session();const kids=db.students.filter(s=>s.program===u.program&&s.status==='Active');const t=todayAtt(kids.map(k=>k.id));const rp=db.reports.filter(r=>r.date===todayStr()&&kids.some(k=>k.id===r.studentId)).length;
  return `<div class="child"><span style="font-size:52px">🍎</span><div><h2>${esc(u.program)} class</h2><p class="muted">${kids.length} little learners · ${esc(progOf(u.program).timing||'')}</p></div></div>
  <div class="kpi">${kpi('🧒','t-sky',kids.length,'Students')}${kpi('✅','t-sage',t.p,'Present today')}${kpi('⏳','t-gold',t.u,'Attendance pending')}${kpi('🌈','t-coral',`${rp}/${kids.length}`,'Reports posted today')}</div>
  <div class="dg dg11"><div class="panel"><div class="ph-h"><h3>Quick actions</h3></div><div class="grid g2" style="gap:12px"><a class="btn btn-p" href="#/teacher/attendance">✅ Take attendance</a><a class="btn btn-g" href="#/teacher/daily">🌈 Post daily report</a><a class="btn btn-g" href="#/teacher/class">🧒 View class</a><a class="btn btn-g" href="#/teacher/notices">📢 Notices</a></div>
  <h3 style="margin:24px 0 8px">Health alerts</h3>${kids.filter(k=>k.allergies&&k.allergies!=='None').map(k=>`<div class="list-i">${avatar(k.name)}<div><b>${esc(k.name)}</b><small>⚠️ ${esc(k.allergies)}</small></div></div>`).join('')||'<p class="muted">No alerts.</p>'}</div>
  <div class="panel"><h3 style="margin-bottom:12px">Upcoming events</h3>${eventGrid(['All','Staff']).replace('g2','')}</div></div>`},
 class(){const u=session();const kids=db.students.filter(s=>s.program===u.program&&s.status==='Active');
  return `<div class="grid g3">${kids.map(k=>`<div class="card"><div class="nm">${avatar(k.name,'lg')}<div><h3 style="font-size:20px">${esc(k.name)}</h3><small>${esc(k.gender)} · ${fdate(k.dob)}</small></div></div><div style="margin-top:16px;font-size:14px;display:grid;gap:6px"><span>👪 ${esc(k.parent)}</span><span>📞 ${esc(k.phone)}</span><span>${k.allergies&&k.allergies!=='None'?'⚠️ '+esc(k.allergies):'✅ No known allergies'}</span><span>📊 Attendance <b>${attPct(k.id)}%</b></span></div></div>`).join('')||empty('No students assigned.')}</div>`},
 attendance:()=>attendanceView('teacher'),daily:()=>dailyView('teacher'),notices:()=>noticeList(['All','Staff']),events:()=>eventGrid(['All','Staff'])
};

/* ============ PARENT VIEWS ============ */
const PV={
 dashboard(){const u=session();const k=stu(u.studentId);const p=progOf(k.program);const last=db.reports.filter(r=>r.studentId===k.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const due=db.fees.filter(f=>f.studentId===k.id&&f.status!=='Paid');const td=(db.attendance[todayStr()]||{})[k.id];
  return `<div class="child">${avatar(k.name,'lg')}<div style="flex:1"><h2>${esc(k.name)}</h2><div class="tags"><span class="badge b-lav">${esc(k.program)}</span><span class="badge b-blue">${esc(p.timing||'')}</span>${badge(k.status)}</div></div><div style="text-align:right"><small class="muted">Today</small><div style="font-family:Fraunces;font-size:22px">${td==='P'?'✅ At school':td==='A'?'🏠 Absent':'⏳ Not marked'}</div></div></div>
  <div class="kpi">${kpi('📊','t-sage',attPct(k.id)+'%','Attendance')}${kpi('💳','t-gold',due.length?fmt(due.reduce((a,f)=>a+f.amount,0)):'All clear','Fees due')}${kpi('🌈','t-coral',db.reports.filter(r=>r.studentId===k.id).length,'Daily reports')}${kpi('📅','t-sky',db.events.filter(e=>e.date>=todayStr()&&e.audience!=='Staff').length,'Upcoming events')}</div>
  <div class="dg dg11"><div class="panel"><div class="ph-h"><h3>Latest daily report</h3><a class="btn btn-g btn-xs" href="#/parent/daily">All reports</a></div>${last?repCard(last):empty('No report yet today.')}</div>
  <div class="panel"><div class="ph-h"><h3>Notices</h3><a class="btn btn-g btn-xs" href="#/parent/notices">View all</a></div>${db.notices.filter(n=>n.audience!=='Staff').slice(0,3).map(n=>`<div class="list-i"><span class="av" style="background:var(--cream2);color:var(--ink)">📢</span><div><b>${esc(n.title)}</b><small>${fdate(n.date)}</small></div></div>`).join('')}
  ${due.length?`<div class="cta" style="padding:20px;border-radius:18px;margin-top:16px"><div><b>${fmt(due[0].amount)}</b> due for ${fmon(due[0].month)}</div><a class="btn btn-p btn-s" href="#/parent/fees">Pay now</a></div>`:''}</div></div>`},
 attendance(){const k=stu(session().studentId);const now=new Date();const y=UI.py??now.getFullYear(),m=UI.pm??now.getMonth();const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  let p=0,a=0;const cells=[];for(let i=0;i<first;i++)cells.push('<div class="x"></div>');for(let d=1;d<=days;d++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const v=(db.attendance[ds]||{})[k.id]||'';if(v==='P')p++;if(v==='A')a++;cells.push(`<div class="${v}" title="${ds}">${d}</div>`)}
  return `<div class="kpi">${kpi('📊','t-sage',attPct(k.id)+'%','Overall attendance')}${kpi('✅','t-sky',p,'Present this month')}${kpi('🚫','t-coral',a,'Absent this month')}${kpi('🧒','t-gold',esc(k.name.split(' ')[0]),k.program)}</div>
  <div class="panel" style="max-width:640px"><div class="ph-h"><button class="btn btn-g btn-xs" onclick="shiftM(-1)">← Prev</button><h3>${new Date(y,m).toLocaleString('en-IN',{month:'long',year:'numeric'})}</h3><button class="btn btn-g btn-xs" onclick="shiftM(1)">Next →</button></div>
  <div class="cal">${['S','M','T','W','T','F','S'].map(d=>`<div class="h">${d}</div>`).join('')}${cells.join('')}</div><div class="legend" style="margin-top:16px"><span><i style="background:#D9EDDF"></i>Present</span><span><i style="background:#FBD9D3"></i>Absent</span></div></div>`},
 daily(){const k=stu(session().studentId);const l=db.reports.filter(r=>r.studentId===k.id).sort((a,b)=>b.date.localeCompare(a.date));return l.length?`<div class="grid g2">${l.map(r=>repCard(r)).join('')}</div>`:empty('No daily reports yet.')},
 fees(){const k=stu(session().studentId);const l=db.fees.filter(f=>f.studentId===k.id).sort((a,b)=>b.month.localeCompare(a.month));const due=l.filter(f=>f.status!=='Paid');
  return `<div class="kpi">${kpi('💳','t-gold',fmt(due.reduce((a,f)=>a+f.amount,0)),'Outstanding')}${kpi('✅','t-sage',fmt(l.filter(f=>f.status==='Paid').reduce((a,f)=>a+f.amount,0)),'Paid to date')}${kpi('📚','t-sky',fmt(progOf(k.program).fee),'Monthly fee')}${kpi('🧾','t-coral',l.length,'Invoices')}</div>
  <div class="tbl-wrap"><table><thead><tr><th>Month</th><th>Amount</th><th>Due date</th><th>Status</th><th style="text-align:right">Action</th></tr></thead><tbody>${l.map(f=>`<tr><td><b>${fmon(f.month)}</b></td><td>${fmt(f.amount)}</td><td>${fdate(f.due)}</td><td>${badge(feeStatus(f))}</td><td><div class="acts">${f.status==='Paid'?`<button class="btn btn-g btn-xs" onclick="receipt('${f.id}')">Receipt</button>`:`<button class="btn btn-p btn-xs" onclick="payNow('${f.id}')">Pay now</button>`}</div></td></tr>`).join('')}</tbody></table></div>`},
 gallery(){return `<div class="masonry">${db.gallery.map((g,i)=>`<div class="gi" onclick="lightbox('${esc(IMG(g.url))}')">${ph(g.url,'',`height:${[240,300,220,280][i%4]}px`)}<div class="cap">${esc(g.title)}<small>${esc(g.category)}</small></div></div>`).join('')}</div>`},
 events:()=>eventGrid(['All','Parents']),notices:()=>noticeList(['All','Parents'])
};
function shiftM(d){const n=new Date();let m=(UI.pm??n.getMonth())+d,y=UI.py??n.getFullYear();if(m<0){m=11;y--}if(m>11){m=0;y++}UI.pm=m;UI.py=y;render()}
function payNow(id){const f=db.fees.find(x=>x.id===id);modal('Secure payment',`<div style="text-align:center;margin-bottom:20px"><small class="muted">Amount payable</small><div style="font-family:Fraunces;font-size:44px">${fmt(f.amount)}</div><small class="muted">${esc(stu(f.studentId).name)} · ${fmon(f.month)}</small></div>
 <label>Choose payment method</label><div class="tabs" style="margin:6px 0 16px" id="pt">${['UPI','Card','Net Banking'].map((x,i)=>`<button type="button" class="${i?'':'on'}" onclick="document.querySelectorAll('#pt button').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${x}</button>`).join('')}</div>
 <p class="muted" style="font-size:13px">🔒 Payments are encrypted & processed securely. A receipt will be available instantly.</p>`,`<button class="btn btn-g" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="confirmPaid('${id}',$('#pt .on').textContent,todayStr());setTimeout(()=>receipt('${id}'),1200)">Pay ${fmt(f.amount)}</button>`)}

const VIEWS={admin:A,teacher:T,parent:PV};

/* ============ NEON SYNC (local dev) ============ */
const syncBadge=s=>{const off=s.neonEnabled===false;return `<span class="badge ${off?'b-grey':(s.neonConfigured?'b-green':'b-grey')}">${off?'Neon disabled':(s.neonConfigured?'Neon configured':'Neon not configured')}</span>`};
function syncStatusHTML(s){const last=s.lastSyncedAt?new Date(s.lastSyncedAt).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Never';
 let msg;if(s.neonEnabled===false)msg='Neon sync is disabled (<b>NEON_SYNC_ENABLED=false</b> in <b>.env.local</b>). This site runs entirely on the local Docker database and makes no Neon calls. Set it to <b>true</b> once the Neon quota resets.';else if(!s.neonConfigured)msg='Add <b>NEON_DATABASE_URL</b> to <b>.env.local</b> and restart the API to enable syncing from Neon.';else if(s.syncedWithinTtl)msg='The local mirror is fresh, so Neon was not called. Use “Sync now” only when you need the very latest data.';else msg='The local mirror has not been refreshed recently. Click “Sync from Neon now” to pull the latest changes.';
 return `<div class="rep" id="sync-status"><div class="rh"><h3 style="font-size:18px">Sync status</h3>${syncBadge(s)}</div><div class="rg"><div><small>Last sync</small>${last}</div><div><small>Traffic mode</small>${s.useLocalDb?'Local Docker · Neon only on sync':'Direct to Neon'}</div><div><small>Sync window</small>every ${Math.max(1,Math.round((s.ttlSeconds||0)/3600))}h</div></div><p style="font-size:14px;margin-top:12px">${msg}</p></div>`}
function neonSyncStatus(reRender){fetch('/api/admin/sync/status').then(r=>{if(!r.ok)throw new Error('api');return r.json()}).then(s=>{if(reRender){render();return}const el=document.getElementById('sync-status');if(el)el.outerHTML=syncStatusHTML(s);const b=document.querySelector('.tb-r .btn-p');if(b)b.disabled=s.neonEnabled===false}).catch(()=>{const el=document.getElementById('sync-status');if(el)el.outerHTML='<div class="rep" id="sync-status"><p>API server is not reachable. Start it with <b>npm start local</b> or <b>npm run server</b>.</p></div>'})}
function neonSync(){showLoader('Syncing from Neon…');fetch('/api/admin/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({force:true})}).then(async r=>{const d=await r.json().catch(()=>({}));hideLoader();if(!r.ok){toast(d.error||'Sync failed','err');neonSyncStatus();return}toast(d.skipped?'Local data is up to date (Neon was not called) ✓':`Synced ${d.totalRows||0} rows from Neon ✓`);neonSyncStatus(true)}).catch(()=>{hideLoader();toast('API server not reachable','err')})}
A.sync=function(){setTimeout(neonSyncStatus,60);return `<div class="dg"><div class="panel" style="max-width:880px"><div class="ph-h"><div><h3>Neon Database Sync</h3><small class="muted">While running locally, this site reads the local Docker database. Use the button below to pull the latest rows from Neon into it. Neon is only contacted when you explicitly sync.</small></div></div><div id="sync-status" style="margin-bottom:16px" class="muted">Loading…</div><div class="tb-r"><button class="btn btn-p" onclick="neonSync()">⇅ Sync from Neon now</button><button class="btn btn-g" onclick="neonSyncStatus(true)">↻ Refresh status</button></div></div></div>`};
(function(){document.getElementById('splash-ld').src=LOADER_SRC;document.getElementById('pl-img').src=LOADER_SRC;document.documentElement.style.setProperty('--ldr','url('+LOADER_SRC+')');setTimeout(()=>{const el=document.getElementById('splash');if(el){el.classList.add('hide');setTimeout(()=>el.remove(),700)}},1600)})();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(true));else render(true);
