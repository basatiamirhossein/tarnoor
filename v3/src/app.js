/* ================= Tarnoor v3 app ================= */
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem("tn3_"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("tn3_"+k,JSON.stringify(v))}catch(e){}}};
const LANGS={fa:{dir:"rtl",loc:"fa-IR",i:-1},en:{dir:"ltr",loc:"en-US",i:0},ar:{dir:"rtl",loc:"ar-u-nu-latn",i:1}};
let LANG=document.documentElement.lang in LANGS?document.documentElement.lang:"fa";
const MISS=new Set();
function T(s,v){let r=s;if(LANG!=="fa"){const e=I18N[s];if(e)r=e[LANGS[LANG].i];else MISS.add(s)}if(v)r=r.replace(/\{(\w+)\}/g,(_,k)=>v[k]!=null?v[k]:"");return r}
const L=(fa,en,ar)=>LANG==="en"?en:LANG==="ar"?ar:fa;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fa=n=>Number(n).toLocaleString(LANGS[LANG].loc);
const dg=s=>LANG==="fa"?String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]):String(s).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d));
const toEn=s=>String(s).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
const money=n=>fa(Math.round(n));
const pct=n=>fa(n)+(LANG==="en"?"%":"٪");
const cur=()=>T("تومان");
const priceTxt=n=>`${money(n)} ${cur()}`;
const dateTxt=(d,o={day:"numeric",month:"long",year:"numeric"})=>{try{return new Date(d).toLocaleDateString(LANGS[LANG].loc,o)}catch(e){return d}};
const PHONE="09127350415",PHONE_INT="989127350415";
const WA="https://wa.me/"+PHONE_INT,TG="https://t.me/+"+PHONE_INT;
const waText=t=>WA+"?text="+encodeURIComponent(t);
const FREE_SHIP=20000000;
const COUPONS={NET10:.10,TARNOOR5:.05};

/* ---------- catalog helpers ---------- */
const byId=id=>P.find(p=>p.id===+id);
const catOf=id=>CATS.find(c=>c.id===id);
const pname=p=>LANG==="fa"?p.n:PN[p.id][LANGS[LANG].i];
const cname=c=>LANG==="fa"?c.t:CN[c.id][LANGS[LANG].i][0];
const cdesc=c=>LANG==="fa"?c.d:CN[c.id][LANGS[LANG].i][1];
const sk=k=>LANG==="fa"?k:(SPEC_K[k]||[k,k])[LANGS[LANG].i];
const sv=v=>{if(LANG==="fa")return v;const e=SPEC_V[v];if(e)return e[LANGS[LANG].i];if(/[آ-ی]/.test(v))MISS.add("spec:"+v);return v};
const off=p=>p.old?Math.round((p.old-p.pr)/p.old*100):0;
const isStock=p=>p.cond==="stock";
const BRANDS=[...new Set(P.map(p=>p.b))];
const post=a=>LANG==="fa"?a:Object.assign({},a,BLOG_I[a.id][LANG]);
const BDATE={"mikrotik-cisco":"2026-10-04","managed-switch":"2026-09-19","powerline":"2026-09-10","voip-office":"2026-08-27","sfp-guide":"2026-08-13","wifi6-office":"2026-07-30"};

/* ---------- state ---------- */
const S={cart:store.get("cart",[]),wish:store.get("wish",[]),cmp:store.get("cmp",[]),user:store.get("user",null),orders:store.get("orders",[]),
 coupon:store.get("coupon",""),reviews:store.get("reviews",{}),view:store.get("view","grid"),addr:store.get("addr",null)};
const save=k=>store.set(k,S[k]);
S.cart=S.cart.filter(i=>byId(i.id));S.wish=S.wish.filter(byId);S.cmp=S.cmp.filter(byId);

/* warranties: included plan and an extended plan priced as a share of the item */
function plans(p){return isStock(p)
 ?[{k:"std",n:"۶ ماه گارانتی تارنور (استوک)",x:0},{k:"ext",n:"۱۲ ماه گارانتی تارنور (استوک)",x:.05}]
 :[{k:"std",n:"۱۸ ماه گارانتی اصالت و سلامت",x:0},{k:"ext",n:"۳۶ ماه گارانتی طلایی تارنور",x:.06}]}
const unit=(p,w)=>Math.round(p.pr*(1+((plans(p).find(x=>x.k===w)||{x:0}).x))/1000)*1000;
const planName=(p,w)=>T((plans(p).find(x=>x.k===w)||plans(p)[0]).n);

/* ---------- small UI helpers ---------- */
const toastEl=$("#toast");let tt;
function toast(msg,o={}){toastEl.querySelector("span").innerHTML=esc(msg)+(o.link?` <a href="${o.link[0]}">${esc(o.link[1])}</a>`:"");toastEl.classList.toggle("ok",!!o.ok);toastEl.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove("show"),o.ms||2600)}
function confirmBox(msg,yes){const m=$("#modal"),pn=m.querySelector(".panel");
 pn.innerHTML=`<span class="ci" style="border-radius:50%;color:var(--red)">${IC.trash}</span><h3 style="font-size:17px">${esc(msg)}</h3><div class="row"><button class="btn btn-red btn-sm" data-y>${T("بله، حذف شود")}</button><button class="btn btn-sm" data-n>${T("انصراف")}</button></div>`;
 m.classList.add("on");m.setAttribute("aria-hidden","false");pn.querySelector("[data-n]").focus();
 const close=()=>{m.classList.remove("on");m.setAttribute("aria-hidden","true")};
 pn.querySelector("[data-y]").onclick=()=>{close();yes()};pn.querySelector("[data-n]").onclick=close;m.onclick=e=>{if(e.target===m)close()}}
function stars(r,s=14){let h='<span class="stars" aria-hidden="true">';for(let i=1;i<=5;i++)h+=`<span class="${r>=i-.25?"":"e"}">${IC.star.replace(/14/g,s)}</span>`;return h+"</span>"}
const stockTxt=p=>p.st===0?`<div class="stock out"><i></i>${T("ناموجود؛ موجود شد خبرم کن")}</div>`:p.st<6?`<div class="stock low"><i></i>${T("فقط {n} عدد باقی مانده",{n:fa(p.st)})}</div>`:`<div class="stock"><i></i>${T("موجود در انبار")}</div>`;
function priceHtml(p){if(!p.pr)return`<div class="pr"><span class="na">${T("تماس بگیرید")}</span></div>`;
 return`<div class="pr">${p.old?`<s>${money(p.old)}</s>`:""}<b>${money(p.pr)}<small>${cur()}</small></b></div>`}
const crumb=items=>`<nav class="crumbs" aria-label="${T("مسیر صفحه")}"><a href="#/">${T("خانه")}</a>${items.map(([t,h])=>`<span class="sep">${IC.chev}</span>${h?`<a href="${h}">${esc(t)}</a>`:`<span aria-current="page">${esc(t)}</span>`}`).join("")}</nav>`;
const rating=p=>{const own=(S.reviews[p.id]||[]);const base=SEED_R(p);const all=base.concat(own);return{n:all.length,avg:all.reduce((a,r)=>a+r.r,0)/all.length,all}};

/* deterministic seed reviews (written in Persian, translated through I18N) */
const RV=[["خیلی سریع رسید و بسته‌بندی کاملاً سالم بود. کارشناس هم پیش از ارسال تماس گرفت و مدل را تأیید کرد.",5],["کیفیت ساخت عالی است و از روز اول بدون مشکل کار می‌کند. قیمت هم نسبت به بازار مناسب بود.",5],["برای دفتر خودمان گرفتیم؛ راه‌اندازی ساده بود و مستندات فارسی هم برایمان فرستادند.",4],["نسخه استوک خریدم و واقعاً مثل نو بود. تست‌شده و با برچسب گارانتی رسید.",4],["پیش‌فاکتور رسمی را همان لحظه گرفتم و واحد مالی بدون معطلی پرداخت کرد.",5],["ارسال یک روز دیرتر از زمان اعلام‌شده بود، ولی پشتیبانی پیگیری کرد و خبر داد.",4]];
const RN=["علی رضایی","مهندس کریمی","سارا محمدی","شرکت داده‌پرداز","حسین نوری","مریم احمدی"];
function SEED_R(p){const a=p.id%RV.length,b=(p.id*3+1)%RV.length,c=(p.id*5+2)%RV.length;return[...new Set([a,b,c])].slice(0,2+p.id%2).map((i,j)=>({t:RV[i][0],r:RV[i][1],n:RN[(i+j+p.id)%RN.length],d:new Date(Date.UTC(2026,8,30-((p.id*7+j*11)%60))).toISOString(),seed:1,buyer:1}))}

/* ---------- badges & actions ---------- */
function syncBadges(){const n={cart:S.cart.reduce((a,i)=>a+i.q,0),wish:S.wish.length,cmp:S.cmp.length};
 $$("[data-badge]").forEach(b=>{const v=n[b.dataset.badge];b.textContent=v?fa(v):"";b.dataset.n=v})}
function addToCart(id,q=1,w="std",quiet){const p=byId(id);if(!p)return;if(p.st===0){toast(T("این کالا فعلاً موجود نیست"));return}
 const it=S.cart.find(i=>i.id===p.id&&i.w===w);const have=it?it.q:0;const nq=Math.min(p.st,have+q);
 if(nq===have){toast(T("حداکثر موجودی این کالا در سبد شماست"));return}
 if(it)it.q=nq;else S.cart.push({id:p.id,q:nq,w});save("cart");syncBadges();
 if(!quiet)toast(T("به سبد خرید اضافه شد"),{ok:1,link:["#/cart",T("مشاهده سبد")]})}
function toggleWish(id){id=+id;const i=S.wish.indexOf(id);if(i>-1)S.wish.splice(i,1);else S.wish.push(id);save("wish");syncBadges();
 $$(`[data-act="wish"][data-id="${id}"]`).forEach(b=>{b.setAttribute("aria-pressed",S.wish.includes(id));b.setAttribute("aria-label",T(S.wish.includes(id)?"حذف از علاقه‌مندی‌ها":"افزودن به علاقه‌مندی‌ها"))});
 toast(T(i>-1?"از علاقه‌مندی‌ها حذف شد":"به علاقه‌مندی‌ها اضافه شد"),i>-1?{}:{ok:1,link:["#/wishlist",T("مشاهده")]})}
function toggleCmp(id){id=+id;const i=S.cmp.indexOf(id);
 if(i>-1)S.cmp.splice(i,1);else{if(S.cmp.length>=4){toast(T("حداکثر چهار کالا را می‌توانید مقایسه کنید"));return}S.cmp.push(id)}
 save("cmp");syncBadges();$$(`[data-act="cmp"][data-id="${id}"]`).forEach(b=>b.setAttribute("aria-pressed",S.cmp.includes(id)));
 toast(T(i>-1?"از فهرست مقایسه حذف شد":"به فهرست مقایسه اضافه شد"),i>-1?{}:{ok:1,link:["#/compare",T("مقایسه")]})}

/* ---------- product card ---------- */
function pcard(p){const o=off(p),w=S.wish.includes(p.id),c=S.cmp.includes(p.id);
 const keys=Object.entries(p.sp).filter(([k])=>k!=="گارانتی").slice(0,3);
 return`<article class="pc${p.st===0?" out":""}">
 <div class="th">${dev(p)}<div class="tags">${o?`<span class="off">${pct(o)}</span>`:""}${isStock(p)?`<span class="cond">${T("استوک")}</span>`:""}</div>
  <button class="knob wish" data-act="wish" data-id="${p.id}" aria-pressed="${w}" aria-label="${T(w?"حذف از علاقه‌مندی‌ها":"افزودن به علاقه‌مندی‌ها")}">${IC.heart}</button>
  <button class="knob cmpb" data-act="cmp" data-id="${p.id}" aria-pressed="${c}" aria-label="${T("افزودن به مقایسه")}">${IC.cmp}</button></div>
 <div class="pc-mid"><div class="br">${esc(p.b)}</div>
 <h3><a href="#/p/${p.id}">${esc(pname(p))}</a></h3>
 <div class="specs-mini">${keys.map(([k,v])=>`<span class="pill-tag">${esc(sv(v))}</span>`).join("")}</div>
 ${stockTxt(p)}</div>
 <div class="pc-ft">${priceHtml(p)}<div class="pc-act">
  <button class="knob add" data-act="add" data-id="${p.id}" aria-label="${T("افزودن به سبد خرید")}"${p.st===0?" disabled":""}>${IC.plus}</button></div></div>
</article>`}

/* ================= views ================= */
/* ---------- home ---------- */
const FIND={home:["برای خانه: <b>مودم</b>، <b>پاورلاین</b> و یک <b>روتر بی‌سیم</b> مثل hAP ax³ معمولاً کافی است.","#/shop?c=modem"],
 office:["برای دفتر: <b>روتر میکروتیک</b>، <b>سوییچ PoE</b> و <b>اکسس پوینت</b> سقفی؛ با تلفن VoIP اگر داخلی می‌خواهید.","#/shop?c=router"],
 ent:["برای سازمان: <b>فایروال</b>، <b>سوییچ مدیریتی</b> با SFP+ و ماژول فیبر؛ نسخه‌های استوک سیسکو هزینه را کم می‌کنند.","#/shop?c=active"]};
function vHome(){
 const deals=P.filter(p=>p.old&&p.st>0),feat=[1,29,11,6,22,36,16,27].map(byId);
 return`<section class="tablet" aria-label="${T("تارنور")}"><div class="screen">
  <div class="hero-tx">
   <span class="chip"><i></i>${T("بیش از ده سال سابقه در تجهیزات و زیرساخت شبکه")}</span>
   <h1>${T("شبکه، فقط مجموعه‌ای از تجهیزات نیست؛ <span class=\"r\">زیرساختی برای ارتباط</span>، امنیت و رشد است.")}<em>${T("تجهیزات درست، برای نیاز درست.")}</em></h1>
   <p class="lead">${T("روتر، سوییچ، تجهیزات وایرلس و VoIP، مودم، کارت شبکه و هر آنچه یک زیرساخت پایدار لازم دارد؛ انتخاب‌شده با نگاه مهندسی و تست‌شده پیش از ارسال.")}</p>
   <div class="cta"><a class="btn btn-red" href="#/shop">${T("مشاهده محصولات")}<span class="flip">${IC.arrow}</span></a><a class="btn" href="#/contact">${IC.phone}${T("مشاوره خرید")}</a></div>
  </div>
  <div class="inst">
   <div class="dial-row">
    <div class="dial" role="img" aria-label="${T("بیش از ده سال سابقه")}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(150,152,170,.35)" stroke-width="2" stroke-dasharray="1 4.6"/><circle cx="50" cy="50" r="46" fill="none" stroke="#E01E2D" stroke-width="3" stroke-linecap="round" stroke-dasharray="217 289" transform="rotate(-90 50 50)" style="filter:drop-shadow(0 0 3px rgba(224,30,45,.3))"/></svg>
     <div class="dial-core"><b>${dg("+10")}</b><span>${T("سال سابقه")}</span></div></div>
    <div class="finder"><h3>${T("شبکه شما چه اندازه‌ای است؟")}</h3>
     <div class="seg" role="group" aria-label="${T("اندازه شبکه")}"><button data-k="home" aria-pressed="false">${T("خانگی")}</button><button data-k="office" aria-pressed="true">${T("دفتر")}</button><button data-k="ent" aria-pressed="false">${T("سازمانی")}</button></div>
     <p id="finderOut"></p></div>
   </div>
   <div class="rack" aria-hidden="true"><div class="rack-top"><span class="mono">SW-CORE · 24×1G PoE+</span><span>${T("وضعیت پورت‌ها")}</span></div>
    <div class="rack-face">${Array.from({length:24},(_,i)=>`<span class="port ${[2,5,7,11,12,15,18,21,22].includes(i)?"":"live"}" style="--d:${(0.9+((i*37)%11)/10).toFixed(1)}s"></span>`).join("")}</div>
    <div class="toggles"><label class="sw"><input type="checkbox" checked tabindex="-1"><span class="tr"></span>PoE+</label><label class="sw"><input type="checkbox" checked tabindex="-1"><span class="tr"></span>SFP+</label><label class="sw"><input type="checkbox" tabindex="-1"><span class="tr"></span>VLAN</label></div></div>
  </div></div></section>
 <div class="readouts">${[[dg("+10"),"سال سابقه در تجهیزات شبکه",1],[fa(CATS.length),"دسته، از روتر تا پرینت سرور"],[fa(P.length),"مدل از برندهای معتبر"],[fa(18),"ماه گارانتی کالای نو"]].map(([b,s,r])=>`<div class="ro"><b class="${r?"r":""}">${b}</b><span>${T(s)}</span></div>`).join("")}</div>

 <section class="sec" id="cats"><div class="sh"><div><span class="eyb">CATEGORIES</span><h2>${T("دسته‌بندی محصولات")}</h2></div><a class="more" href="#/shop">${T("همه محصولات")}<span class="flip">${IC.arrow}</span></a></div>
  <div class="cats">${CATS.map(c=>`<a class="cat" href="#/shop?c=${c.id}"><span class="ci">${icon(c.id)}</span><div><h3>${esc(cname(c))}</h3><small>${c.en}</small></div><span class="n">${T("{n} کالا",{n:fa(P.filter(p=>p.c===c.id).length)})}</span></a>`).join("")}</div></section>

 <section class="sec" id="deals"><div class="notebook"><div class="rings" aria-hidden="true">${"<i></i>".repeat(6)}</div>
  <div class="npage"><div class="deal-side"><span class="eyb red">LIMITED OFFER</span><h2>${T("پیشنهاد شگفت‌انگیز")}</h2><p>${T("تخفیف‌های امروز تا پایان شب معتبر است. موجودی هر کالا محدود است.")}</p>
   <div class="timer" role="timer" aria-label="${T("زمان باقی‌مانده تا پایان پیشنهاد")}" id="timer"><span>00</span><i>:</i><span>00</span><i>:</i><span>00</span></div>
   <div class="timer-l" aria-hidden="true"><b>${T("ساعت")}</b><b>${T("دقیقه")}</b><b>${T("ثانیه")}</b></div>
   <a class="btn btn-sm" href="#/deals" style="align-self:flex-start">${T("همه پیشنهادها")}</a></div>
   <div class="rail" tabindex="0" aria-label="${T("کالاهای تخفیف‌دار")}">${deals.map(pcard).join("")}</div></div></div></section>

 <section class="sec"><div class="sh"><div><span class="eyb">WHY TARNOOR</span><h2>${T("تجهیزات درست، برای نیاز درست")}</h2></div></div>
  <div class="pillars">${[["box","تخصص برای انتخاب","انتخاب تجهیزات شبکه نباید فقط بر اساس برند، قیمت یا مشخصات روی کاغذ باشد؛ هر شبکه راهکار متناسب با کاربری، مقیاس و بودجه خودش را می‌خواهد."],["clock","تجربه برای اعتماد","بیش از ده سال فعالیت به ما یاد داده که در شبکه، جزئیات اهمیت دارند و یک انتخاب اشتباه می‌تواند گران‌تر از قیمت خود تجهیز تمام شود."],["shield","تجهیزات برای زیرساخت پایدار","تمرکز ما بر محصولاتی است که در یک زیرساخت واقعی عملکردی قابل اتکا داشته باشند؛ از اکتیو و پسیو تا تجهیزات ارتباطی."]].map(([i,h,p])=>`<article class="pill"><span class="ci">${IC[i]}</span><h3>${T(h)}</h3><p>${T(p)}</p></article>`).join("")}</div></section>

 <section class="sec"><div class="sh"><div><span class="eyb">FEATURED</span><h2>${T("منتخب تارنور")}</h2></div><a class="more" href="#/shop">${T("مشاهده همه")}<span class="flip">${IC.arrow}</span></a></div>
  <div class="grid">${feat.map(pcard).join("")}</div></section>

 <section class="sec" aria-label="${T("برندها")}"><div class="brands">${BRANDS.map(b=>`<a href="#/shop?b=${encodeURIComponent(b)}">${esc(b)}</a>`).join("")}</div></section>

 <section class="sec"><div class="strip"><div class="strip-in"><div><span class="eyb">REFURBISHED</span><h2>${T("کالای استوک؛ تجهیزات سازمانی با هزینه کمتر")}</h2><p>${T("سوییچ، روتر و ماژول‌های سیسکو و اینتل، تست‌شده پیش از ارسال و با ۶ ماه گارانتی.")}</p></div><a class="btn" href="#/stock">${T("مشاهده کالاهای استوک")}</a></div></div></section>

 <section class="sec"><div class="sh"><div><span class="eyb">JOURNAL</span><h2>${T("مقالات و راهنمای خرید")}</h2></div><a class="more" href="#/blog">${T("همه مقالات")}<span class="flip">${IC.arrow}</span></a></div>
  <div class="bgrid">${BLOG.slice(0,3).map(bcard).join("")}</div></section>

 ${contactBand()}`}
const contactBand=()=>`<section class="sec"><div class="contact-band"><div><span class="eyb red">TALK TO AN ENGINEER</span><h2>${T("پیش از خرید، با کارشناس تارنور مشورت کنید")}</h2><p>${T("مشاوره رایگان برای انتخاب تجهیزات متناسب با نوع کاربری، مقیاس و بودجه شبکه شما.")}</p></div>
 <div class="phone"><a class="num mono" href="tel:+${PHONE_INT}">0912 735 0415</a><div class="row"><button class="btn btn-red btn-sm" data-act="copyPhone">${IC.copy}${T("کپی شماره")}</button><a class="btn btn-sm" href="${WA}" target="_blank" rel="noopener">${IC.wa}${T("واتساپ")}</a><a class="btn btn-sm" href="${TG}" target="_blank" rel="noopener">${IC.tg}${T("تلگرام")}</a></div></div></div></section>`;
function bcard(a){const x=post(a);return`<a class="bc" href="#/blog/${a.id}"><div class="cov">${icon(a.c,44)}</div><div class="meta"><span>${dateTxt(BDATE[a.id])}</span><span>·</span><span>${T("{n} دقیقه مطالعه",{n:fa(a.rt)})}</span></div><h3>${esc(x.t)}</h3><p>${esc(x.ex)}</p></a>`}
let timerI;
function initHome(){
 const out=$("#finderOut");const setF=k=>{$$(".finder .seg button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===k));out.innerHTML=`${T(FIND[k][0])} <a href="${FIND[k][1]}">${T("مشاهده")}</a>`};
 $$(".finder .seg button").forEach(b=>b.onclick=()=>setF(b.dataset.k));setF("office");
 const tick=()=>{const t=$("#timer");if(!t){clearInterval(timerI);return}const n=new Date(),e=new Date(n);e.setHours(24,0,0,0);const s=Math.max(0,Math.floor((e-n)/1000));
  [Math.floor(s/3600),Math.floor(s/60)%60,s%60].forEach((x,i)=>t.querySelectorAll("span")[i].textContent=dg(String(x).padStart(2,"0")))};
 clearInterval(timerI);tick();timerI=setInterval(tick,1000)}

/* ---------- shop ---------- */
const SORTS=[["pop","پرفروش‌ترین"],["new","جدیدترین"],["cheap","ارزان‌ترین"],["exp","گران‌ترین"],["off","بیشترین تخفیف"]];
const PER=12;
function scopeOf(mode){return mode==="deals"?P.filter(p=>p.old):mode==="stock"?P.filter(isStock):P}
function readF(q){return{c:q.c||"",b:q.b?q.b.split(","):[],cond:q.cond||"",min:+q.min||0,max:+q.max||0,av:q.av==="1",poe:q.poe==="1",s:q.s||"pop",q:q.q||"",pg:+q.pg||1}}
function writeF(mode,f){const o={};if(f.c)o.c=f.c;if(f.b.length)o.b=f.b.join(",");if(f.cond)o.cond=f.cond;if(f.min)o.min=f.min;if(f.max)o.max=f.max;if(f.av)o.av=1;if(f.poe)o.poe=1;if(f.s!=="pop")o.s=f.s;if(f.q)o.q=f.q;if(f.pg>1)o.pg=f.pg;
 const qs=new URLSearchParams(o).toString();return"#/"+mode+(qs?"?"+qs:"")}
const hay=p=>(p.n+" "+PN[p.id].join(" ")+" "+p.b+" "+p.m+" "+toEn(Object.values(p.sp).join(" "))).toLowerCase().replace(/[\s\-‌]/g,"");
const norm=s=>toEn(s).toLowerCase().replace(/[\s\-‌]/g,"").replace(/ي/g,"ی").replace(/ك/g,"ک");
function results(mode,f,ignore){let r=scopeOf(mode);
 if(f.c&&ignore!=="c")r=r.filter(p=>p.c===f.c);
 if(f.q){const n=norm(f.q);r=r.filter(p=>norm(hay(p)).includes(n))}
 if(f.b.length&&ignore!=="b")r=r.filter(p=>f.b.includes(p.b));
 if(f.cond&&ignore!=="cond")r=r.filter(p=>f.cond==="stock"?isStock(p):!isStock(p));
 if(f.min)r=r.filter(p=>p.pr>=f.min);if(f.max)r=r.filter(p=>p.pr<=f.max);
 if(f.av)r=r.filter(p=>p.st>0);
 if(f.poe)r=r.filter(p=>/PoE/i.test(JSON.stringify(p.sp))&&!/"PoE":"ندارد"/.test(JSON.stringify(p.sp)));
 const s={pop:(a,b)=>(b.st>0)-(a.st>0)||a.id%7-b.id%7,new:(a,b)=>b.id-a.id,cheap:(a,b)=>a.pr-b.pr,exp:(a,b)=>b.pr-a.pr,off:(a,b)=>off(b)-off(a)}[f.s]||(()=>0);
 return r.slice().sort(s)}
function filtersHtml(mode,f){const base=scopeOf(mode);const mx=Math.max(...base.map(p=>p.pr));
 const cnt=(arr,fn)=>arr.filter(fn).length;
 return`<div class="fbox"><h4>${T("دسته‌بندی")}${f.c?`<button class="cl" data-clear="c">${T("حذف")}</button>`:""}</h4><div class="opts">
  ${CATS.map(c=>{const n=cnt(results(mode,f,"c"),p=>p.c===c.id);return`<label class="ck"><input type="radio" name="fc" value="${c.id}"${f.c===c.id?" checked":""}><span class="bx">${IC.check}</span><span>${esc(cname(c))}</span><span class="n">${fa(n)}</span></label>`}).join("")}</div></div>
 <div class="fbox"><h4>${T("برند")}${f.b.length?`<button class="cl" data-clear="b">${T("حذف")}</button>`:""}</h4><div class="opts">
  ${BRANDS.map(b=>{const n=cnt(results(mode,f,"b"),p=>p.b===b);return n||f.b.includes(b)?`<label class="ck"><input type="checkbox" name="fb" value="${esc(b)}"${f.b.includes(b)?" checked":""}><span class="bx">${IC.check}</span><span class="ltr">${esc(b)}</span><span class="n">${fa(n)}</span></label>`:""}).join("")}</div></div>
 ${mode==="stock"?"":`<div class="fbox"><h4>${T("وضعیت کالا")}</h4><div class="seg" role="group" style="display:grid;grid-template-columns:repeat(3,1fr)">${[["","همه"],["new","نو"],["stock","استوک"]].map(([k,t])=>`<button data-cond="${k}" aria-pressed="${f.cond===k}">${T(t)}</button>`).join("")}</div></div>`}
 <div class="fbox"><h4>${T("حداکثر قیمت")}</h4><div class="range"><input type="range" min="0" max="${mx}" step="100000" value="${f.max||mx}" id="fmax" aria-label="${T("حداکثر قیمت")}"><div class="rv"><span>${T("تا")}</span><b id="fmaxV">${priceTxt(f.max||mx)}</b></div></div></div>
 <div class="fbox" style="display:flex;flex-direction:column;gap:10px"><label class="sw"><input type="checkbox" id="fav"${f.av?" checked":""}><span class="tr"></span>${T("فقط کالاهای موجود")}</label><label class="sw"><input type="checkbox" id="fpoe"${f.poe?" checked":""}><span class="tr"></span>${T("دارای PoE")}</label></div>`}
function chipsHtml(f){const c=[];if(f.q)c.push(["q",T("«{q}»",{q:esc(f.q)})]);if(f.c)c.push(["c",esc(cname(catOf(f.c)))]);f.b.forEach(b=>c.push(["b:"+b,esc(b)]));
 if(f.cond)c.push(["cond",T(f.cond==="stock"?"استوک":"نو")]);if(f.max)c.push(["max",T("تا {p}",{p:priceTxt(f.max)})]);if(f.av)c.push(["av",T("فقط موجود")]);if(f.poe)c.push(["poe","PoE"]);
 return c.length?`<div class="chips">${c.map(([k,t])=>`<button data-chip="${esc(k)}">${t}${IC.x}</button>`).join("")}${c.length>1?`<button data-chip="all" style="color:var(--red)">${T("حذف همه")}</button>`:""}</div>`:""}
function vShop(mode,q){const f=readF(q);const r=results(mode,f);const pages=Math.max(1,Math.ceil(r.length/PER));f.pg=Math.min(f.pg,pages);const slice=r.slice((f.pg-1)*PER,f.pg*PER);
 const c=f.c&&catOf(f.c);
 const title=mode==="deals"?T("پیشنهاد شگفت‌انگیز"):mode==="stock"?T("کالای استوک"):f.q?T("نتایج جستجو برای «{q}»",{q:esc(f.q)}):c?esc(cname(c)):T("همه محصولات");
 const desc=mode==="deals"?T("تخفیف‌های امروز تا پایان شب معتبر است. موجودی هر کالا محدود است."):mode==="stock"?T("تجهیزات سازمانی دست‌دوم، تست‌شده پیش از ارسال و با ۶ ماه گارانتی تارنور."):c?esc(cdesc(c)):T("{n} مدل از برندهای معتبر، با قیمت روز و ارسال به سراسر کشور.",{n:fa(P.length)});
 return`${crumb(mode==="shop"&&c?[[T("محصولات"),"#/shop"],[cname(c)]]:[[title.replace(/<[^>]+>/g,"")]])}
 <div class="ph"><span class="eyb">${mode==="deals"?"LIMITED OFFER":mode==="stock"?"REFURBISHED":c?c.en:"SHOP"}</span><h1>${title}</h1><p>${desc}</p></div>
 ${mode==="shop"?`<div class="cat-tabs"><a href="${writeF("shop",{...f,c:"",pg:1})}" class="${f.c?"":"on"}">${T("همه")}</a>${CATS.map(x=>`<a href="${writeF("shop",{...f,c:x.id,pg:1})}" class="${f.c===x.id?"on":""}">${icon(x.id,18)}${esc(cname(x))}</a>`).join("")}</div>`:""}
 <div class="shop"><aside class="filters" id="filters" aria-label="${T("فیلترها")}">${filtersHtml(mode,f)}</aside>
 <div><div class="toolbar"><span class="cnt">${T("{n} کالا",{n:fa(r.length)})}</span><div class="tb-r">
  <button class="btn btn-xs f-open" id="fOpen">${IC.filter}${T("فیلترها")}</button>
  <label class="sr" for="sort">${T("مرتب‌سازی")}</label><select class="inp" id="sort">${SORTS.map(([k,t])=>`<option value="${k}"${f.s===k?" selected":""}>${T(t)}</option>`).join("")}</select>
  <div class="seg" role="group" aria-label="${T("نوع نمایش")}"><button data-view="grid" aria-pressed="${S.view==="grid"}" aria-label="${T("نمایش شبکه‌ای")}">${IC.grid}</button><button data-view="list" aria-pressed="${S.view==="list"}" aria-label="${T("نمایش فهرستی")}">${IC.list}</button></div></div></div>
  ${chipsHtml(f)}
  ${slice.length?`<div class="grid g3 ${S.view==="list"?"list":""}" id="pgrid">${slice.map(pcard).join("")}</div>`:`<div class="empty"><span class="ci">${IC.search}</span><h3>${T("کالایی با این مشخصات پیدا نشد")}</h3><p>${T("فیلترها را کمتر کنید یا با کد مدل جستجو کنید. اگر مدل مورد نظرتان را پیدا نکردید، کارشناسان ما آن را برایتان تأمین می‌کنند.")}</p><div class="cta"><button class="btn btn-sm" data-chip="all">${T("حذف همه فیلترها")}</button><a class="btn btn-red btn-sm" href="${waText(T("سلام، دنبال این کالا هستم: ")+(f.q||""))}" target="_blank" rel="noopener">${IC.wa}${T("استعلام از کارشناس")}</a></div></div>`}
  ${pages>1?`<nav class="pager" aria-label="${T("صفحه‌بندی")}"><button data-pg="${f.pg-1}"${f.pg===1?" disabled":""} aria-label="${T("صفحه قبل")}"><span class="flip" style="display:inline-flex;transform:scaleX(-1)">${IC.arrow}</span></button>${Array.from({length:pages},(_,i)=>`<button data-pg="${i+1}"${i+1===f.pg?' aria-current="page"':""}>${fa(i+1)}</button>`).join("")}<button data-pg="${f.pg+1}"${f.pg===pages?" disabled":""} aria-label="${T("صفحه بعد")}"><span class="flip">${IC.arrow}</span></button></nav>`:""}
 </div></div>`}
function initShop(mode,q){const f=readF(q);const go=nf=>{location.hash=writeF(mode,{...f,...nf,pg:nf.pg||1})};
 const bind=root=>{
  $$("input[name=fc]",root).forEach(i=>i.onchange=()=>go({c:i.value}));
  $$("input[name=fb]",root).forEach(i=>i.onchange=()=>go({b:$$("input[name=fb]:checked",root).map(x=>x.value)}));
  $$("[data-cond]",root).forEach(b=>b.onclick=()=>go({cond:b.dataset.cond}));
  $$("[data-clear]",root).forEach(b=>b.onclick=()=>go({[b.dataset.clear]:b.dataset.clear==="b"?[]:""}));
  const fm=$("#fmax",root);if(fm){const v=$("#fmaxV",root);fm.oninput=()=>v.textContent=priceTxt(+fm.value);fm.onchange=()=>go({max:+fm.value>=+fm.max?0:+fm.value})}
  const av=$("#fav",root);if(av)av.onchange=()=>go({av:av.checked});
  const poe=$("#fpoe",root);if(poe)poe.onchange=()=>go({poe:poe.checked});};
 bind($("#filters"));
 $("#sort").onchange=e=>go({s:e.target.value});
 $$("[data-view]").forEach(b=>b.onclick=()=>{S.view=b.dataset.view;save("view");$$("[data-view]").forEach(x=>x.setAttribute("aria-pressed",x===b));const g=$("#pgrid");if(g)g.classList.toggle("list",S.view==="list")});
 $$("[data-chip]").forEach(b=>b.onclick=()=>{const k=b.dataset.chip;if(k==="all")return go({c:"",b:[],cond:"",min:0,max:0,av:false,poe:false,q:""});
  if(k.startsWith("b:"))return go({b:f.b.filter(x=>x!==k.slice(2))});go({[k]:k==="max"?0:k==="av"||k==="poe"?false:""})});
 $$("[data-pg]").forEach(b=>b.onclick=()=>{go({pg:+b.dataset.pg});});
 const fo=$("#fOpen");if(fo)fo.onclick=()=>{const sh=$("#fsheet");sh.innerHTML=`<div class="grip"></div><div class="sheet-h"><h3>${T("فیلترها")}</h3><button class="knob knob-sm" data-close aria-label="${T("بستن")}">${IC.x}</button></div><div class="filters" style="display:flex;position:static;max-height:none;overflow:visible;margin:0;padding:6px 4px">${filtersHtml(mode,f)}</div><button class="btn btn-red btn-block" data-close style="margin-top:16px">${T("نمایش {n} کالا",{n:fa(results(mode,f).length)})}</button>`;bind(sh);openSheet(sh)}}

/* ---------- product ---------- */
let pstate={};
function vProduct(id){const p=byId(id);if(!p)return vNotFound();const c=catOf(p.c),o=off(p),R=rating(p);pstate={id:p.id,w:"std",q:1};
 const sim=P.filter(x=>x.c===p.c&&x.id!==p.id).slice(0,4);const keys=Object.entries(p.sp).filter(([k])=>k!=="گارانتی").slice(0,4);
 return`${crumb([[T("محصولات"),"#/shop"],[cname(c),"#/shop?c="+c.id],[pname(p)]])}
 <div class="pdp sec-sm" style="margin-top:20px">
  <div class="gal"><div class="gal-main" id="galMain" role="button" tabindex="0" aria-label="${T("بزرگ‌نمایی تصویر")}">${dev(p)}<div class="tags">${o?`<span class="off">${pct(o)}</span>`:""}${isStock(p)?`<span class="cond">${T("استوک")}</span>`:""}</div></div>
   <div class="gal-thumbs">${["v0","v1","v2"].map((v,i)=>`<button data-v="${v}" aria-pressed="${!i}" aria-label="${T("نمای {n}",{n:fa(i+1)})}">${dev(p)}</button>`).join("")}</div></div>
  <div class="pinfo">
   <div class="br-row"><a class="pill-tag" href="#/shop?b=${encodeURIComponent(p.b)}"><span class="ltr">${esc(p.b)}</span></a><a class="pill-tag" href="#/shop?c=${c.id}">${esc(cname(c))}</a>${isStock(p)?`<span class="pill-tag warn">${T("استوک تست‌شده")}</span>`:`<span class="pill-tag ok">${T("نو و آکبند")}</span>`}</div>
   <h1>${esc(pname(p))}</h1>
   <div class="br-row"><span class="model">${T("کد مدل")}: <b class="mono">${esc(p.m)}</b><button data-act="copyModel" data-m="${esc(p.m)}" aria-label="${T("کپی کد مدل")}">${IC.copy}</button></span>
    <a class="rate" href="#rv" data-tab-go="rv">${stars(R.avg)} <span>${fa(R.avg.toFixed(1))}</span><span class="faint">(${T("{n} دیدگاه",{n:fa(R.n)})})</span></a></div>
   <div class="keys">${keys.map(([k,v])=>`<div><span>${esc(sk(k))}</span><b>${esc(sv(v))}</b></div>`).join("")}</div>
   <div class="buybox">
    <h4>${T("انتخاب گارانتی")}</h4>
    <div class="rcards" id="plans">${plans(p).map((w,i)=>`<label class="rcard"><input type="radio" name="w" value="${w.k}"${!i?" checked":""}><span class="dot"></span><span class="rc-b"><b>${T(w.n)}</b><small>${T(w.x?"تعویض و تعمیر رایگان، پشتیبانی اختصاصی":"شامل قیمت کالا")}</small></span><span class="rc-p">${w.x?"+"+priceTxt(unit(p,w.k)-p.pr):T("رایگان")}</span></label>`).join("")}</div>
    <div class="price-big">${p.old?`<s>${money(p.old)}</s>`:""}<b id="pPrice">${money(p.pr)}</b><small>${cur()}</small></div>
    ${stockTxt(p)}
    <div class="buy-row"><div class="qty" role="group" aria-label="${T("تعداد")}"><button data-q="1" aria-label="${T("افزایش")}"${p.st<=1?" disabled":""}>${IC.plus}</button><output id="pQty">${fa(1)}</output><button data-q="-1" aria-label="${T("کاهش")}" disabled>${IC.minus}</button></div>
     <button class="btn btn-red" id="pAdd"${p.st===0?" disabled":""}>${IC.cart}${T(p.st===0?"ناموجود":"افزودن به سبد خرید")}</button>
     <button class="knob" data-act="wish" data-id="${p.id}" aria-pressed="${S.wish.includes(p.id)}" aria-label="${T("افزودن به علاقه‌مندی‌ها")}">${IC.heart}</button>
     <button class="knob" data-act="cmp" data-id="${p.id}" aria-pressed="${S.cmp.includes(p.id)}" aria-label="${T("افزودن به مقایسه")}">${IC.cmp}</button></div>
    <a class="btn btn-sm" href="${waText(T("سلام، درباره این کالا سؤال دارم: ")+pname(p)+" ("+p.m+")")}" target="_blank" rel="noopener">${IC.wa}${T(p.st===0?"موجود شد خبرم کنید":"سؤال از کارشناس در واتساپ")}</a>
   </div>
   <div class="assure"><div>${IC.shield}${T("ضمانت اصالت کالا")}</div><div>${IC.truck}${T("ارسال به سراسر کشور")}</div><div>${IC.doc}${T("پیش‌فاکتور رسمی")}</div></div>
  </div></div>
 <section class="sec" id="rv"><div class="tabs" role="tablist">${[["sp","مشخصات فنی"],["rv","دیدگاه کاربران"],["qa","پرسش و پاسخ"]].map(([k,t],i)=>`<button role="tab" data-tab="${k}" aria-selected="${!i}" aria-controls="tp-${k}">${T(t)}</button>`).join("")}</div>
  <div id="tp-sp" role="tabpanel"><table class="spec"><tbody>${Object.entries(p.sp).map(([k,v])=>`<tr><th scope="row">${esc(sk(k))}</th><td>${esc(sv(v))}</td></tr>`).join("")}<tr><th scope="row">${T("برند")}</th><td class="ltr">${esc(p.b)}</td></tr><tr><th scope="row">${T("کد مدل")}</th><td class="mono">${esc(p.m)}</td></tr></tbody></table></div>
  <div id="tp-rv" role="tabpanel" hidden>${reviewsHtml(p)}</div>
  <div id="tp-qa" role="tabpanel" hidden><div class="faq" style="gap:14px">${QA.map(x=>`<div class="qa-item"><div class="q">${T(x.q)}</div><div class="a">${T(x.a)}</div></div>`).join("")}
   <a class="btn btn-sm" style="align-self:flex-start" href="${waText(T("سلام، درباره این کالا سؤال دارم: ")+pname(p)+" ("+p.m+")")}" target="_blank" rel="noopener">${IC.wa}${T("پرسش جدید از کارشناس")}</a></div></div>
 </section>
 ${sim.length?`<section class="sec"><div class="sh"><div><span class="eyb">SIMILAR</span><h2>${T("کالاهای مشابه")}</h2></div><a class="more" href="#/shop?c=${c.id}">${T("مشاهده همه")}<span class="flip">${IC.arrow}</span></a></div><div class="grid">${sim.map(pcard).join("")}</div></section>`:""}`}
const QA=[{q:"آیا این کالا گارانتی دارد؟",a:"بله. نوع و مدت گارانتی در بخش انتخاب گارانتی مشخص است و با شماره سریال قابل استعلام است."},{q:"امکان خرید اعتباری برای سازمان‌ها وجود دارد؟",a:"برای سازمان‌ها و شرکت‌های دارای قرارداد، پرداخت پس از تحویل با پیش‌فاکتور رسمی امکان‌پذیر است."},{q:"پیش از خرید می‌توانم مدل مناسب را با کارشناس بررسی کنم؟",a:"بله. مشاوره رایگان است؛ از طریق تلفن، واتساپ یا تلگرام نیازتان را بگویید تا مدل مناسب پیشنهاد شود."}];
function reviewsHtml(p){const R=rating(p);const dist=[5,4,3,2,1].map(s=>R.all.filter(r=>Math.round(r.r)===s).length);
 return`<div class="rev"><div class="rev-sum"><div class="big">${fa(R.avg.toFixed(1))}</div><div>${stars(R.avg,18)}<div class="faint" style="font-size:13px">${T("از {n} دیدگاه",{n:fa(R.n)})}</div></div>
  <div style="flex:1;min-width:180px;display:grid;gap:4px">${dist.map((n,i)=>`<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="width:14px">${fa(5-i)}</span><div class="meter" style="flex:1;height:8px"><i style="width:${R.n?n/R.n*100:0}%"></i></div><span style="width:18px" class="faint">${fa(n)}</span></div>`).join("")}</div></div>
 ${R.all.slice().reverse().map(r=>`<div class="rev-item"><header><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>${esc(r.seed?T(r.n):r.n)}</b>${r.buyer?`<span class="buyer">${T("خریدار تأییدشده")}</span>`:""}${stars(r.r)}</div><small>${dateTxt(r.d)}</small></header><p>${esc(r.seed?T(r.t):r.t)}</p></div>`).join("")}
 <form class="panel" id="revForm" novalidate style="display:flex;flex-direction:column;gap:14px;box-shadow:var(--raise-sm)"><h3 style="font-size:16px">${T("دیدگاه خود را بنویسید")}</h3>
  <div class="field"><span class="lb">${T("امتیاز شما")}</span><div class="star-in" role="radiogroup" aria-label="${T("امتیاز شما")}">${[1,2,3,4,5].map(i=>`<button type="button" data-s="${i}" role="radio" aria-checked="false" aria-label="${fa(i)}">${IC.star}</button>`).join("")}</div><span class="msg" id="rvSm"></span></div>
  <div class="fgrid"><div class="field"><label for="rvN">${T("نام")}</label><input class="inp" id="rvN" value="${esc(S.user?S.user.name||"":"")}" autocomplete="name"><span class="msg"></span></div></div>
  <div class="field"><label for="rvT">${T("متن دیدگاه")}</label><textarea class="inp" id="rvT" data-tp="تجربه خود از این کالا را بنویسید" placeholder="${T("تجربه خود از این کالا را بنویسید")}"></textarea><span class="msg"></span></div>
  <button class="btn btn-red btn-sm" style="align-self:flex-start">${T("ثبت دیدگاه")}</button></form></div>`}
function initProduct(id){const p=byId(id);if(!p)return;
 const upd=()=>{$("#pPrice").textContent=money(unit(p,pstate.w)*pstate.q);$("#pQty").textContent=fa(pstate.q);
  $('[data-q="-1"]').disabled=pstate.q<=1;$('[data-q="1"]').disabled=pstate.q>=p.st};
 $$("#plans input").forEach(i=>i.onchange=()=>{pstate.w=i.value;upd()});
 $$("[data-q]").forEach(b=>b.onclick=()=>{pstate.q=Math.max(1,Math.min(p.st,pstate.q+ +b.dataset.q));upd()});
 $("#pAdd").onclick=()=>addToCart(p.id,pstate.q,pstate.w);
 const gm=$("#galMain");const zoom=()=>gm.classList.toggle("zoom");gm.onclick=zoom;gm.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();zoom()}};
 $$(".gal-thumbs button").forEach(b=>b.onclick=()=>{$$(".gal-thumbs button").forEach(x=>x.setAttribute("aria-pressed",x===b));const s=gm.querySelector("svg");s.classList.remove("v1","v2");if(b.dataset.v!=="v0")s.classList.add(b.dataset.v);gm.classList.remove("zoom")});
 const tabTo=k=>{$$("[data-tab]").forEach(x=>x.setAttribute("aria-selected",x.dataset.tab===k));["sp","rv","qa"].forEach(x=>$("#tp-"+x).hidden=x!==k)};
 $$("[data-tab]").forEach(b=>b.onclick=()=>tabTo(b.dataset.tab));
 $$("[data-tab-go]").forEach(a=>a.onclick=e=>{e.preventDefault();tabTo("rv");$("#rv").scrollIntoView({behavior:"smooth"})});
 bindReview(p)}
function bindReview(p){let sc=0;const f=$("#revForm");if(!f)return;
 $$(".star-in button",f).forEach(b=>b.onclick=()=>{sc=+b.dataset.s;$$(".star-in button",f).forEach(x=>{x.classList.toggle("on",+x.dataset.s<=sc);x.setAttribute("aria-checked",+x.dataset.s===sc)});$("#rvSm").textContent=""});
 f.onsubmit=e=>{e.preventDefault();let ok=true;const n=$("#rvN"),t=$("#rvT");
  [[n,n.value.trim().length>=2,"نام را وارد کنید"],[t,t.value.trim().length>=10,"دیدگاه باید دست‌کم ۱۰ حرف باشد"]].forEach(([el,v,m])=>{const fd=el.closest(".field");fd.classList.toggle("err",!v);fd.querySelector(".msg").textContent=v?"":T(m);if(!v)ok=false});
  if(!sc){$("#rvSm").textContent=T("امتیاز را انتخاب کنید");ok=false}
  if(!ok)return;(S.reviews[p.id]=S.reviews[p.id]||[]).push({n:n.value.trim(),t:t.value.trim(),r:sc,d:new Date().toISOString()});save("reviews");
  $("#tp-rv").innerHTML=reviewsHtml(p);bindReview(p);toast(T("دیدگاه شما ثبت شد. سپاس!"),{ok:1})}}

/* ---------- cart ---------- */
function totals(){const sub=S.cart.reduce((a,i)=>a+unit(byId(i.id),i.w)*i.q,0);const list=S.cart.reduce((a,i)=>{const p=byId(i.id);return a+(p.old||p.pr)*i.q+(unit(p,i.w)-p.pr)*i.q},0);
 const cp=COUPONS[S.coupon]||0;const disc=Math.round(sub*cp/1000)*1000;return{sub,list,save:list-sub,disc,after:sub-disc,cnt:S.cart.reduce((a,i)=>a+i.q,0)}}
function sumBox(extra=""){const t=totals();const left=Math.max(0,FREE_SHIP-t.after);
 return`<div class="sum-box"><h3>${T("خلاصه سفارش")}</h3>
 <div class="sum-row"><span>${T("قیمت کالاها ({n})",{n:fa(t.cnt)})}</span><b>${priceTxt(t.list)}</b></div>
 ${t.save?`<div class="sum-row disc"><span>${T("سود شما از خرید")}</span><b>${priceTxt(t.save)}</b></div>`:""}
 ${t.disc?`<div class="sum-row disc"><span>${T("کد تخفیف {c}",{c:esc(S.coupon)})}</span><b>−${priceTxt(t.disc)}</b></div>`:""}
 ${extra}
 <div class="free-bar">${left?T("{p} تا ارسال رایگان باقی مانده",{p:priceTxt(left)}):T("ارسال این سفارش رایگان است")}<div class="meter"><i style="width:${Math.min(100,t.after/FREE_SHIP*100)}%"></i></div></div></div>`}
function vCart(){if(!S.cart.length)return`${crumb([[T("سبد خرید")]])}<div class="ph"><h1>${T("سبد خرید")}</h1></div><div class="empty"><span class="ci">${IC.cart}</span><h3>${T("سبد خرید شما خالی است")}</h3><p>${T("کالاهای مورد نیازتان را از فروشگاه انتخاب کنید یا پیشنهادهای امروز را ببینید.")}</p><div class="cta"><a class="btn btn-red btn-sm" href="#/shop">${T("رفتن به فروشگاه")}</a><a class="btn btn-sm" href="#/deals">${T("پیشنهاد شگفت‌انگیز")}</a></div></div>`;
 const t=totals();
 return`${crumb([[T("سبد خرید")]])}<div class="ph"><h1>${T("سبد خرید")}</h1><p>${T("{n} کالا در سبد شماست.",{n:fa(t.cnt)})}</p></div>
 <div class="cart"><div class="citems">${S.cart.map((i,ix)=>{const p=byId(i.id);return`<div class="citem"><a class="th" href="#/p/${p.id}" aria-label="${esc(pname(p))}">${dev(p)}</a>
  <div class="ci-b"><h3><a href="#/p/${p.id}">${esc(pname(p))}</a></h3><div class="meta"><span>${esc(planName(p,i.w))}</span><span class="mono">${esc(p.m)}</span></div>${p.st<6?`<div class="stock low"><i></i>${T("فقط {n} عدد باقی مانده",{n:fa(p.st)})}</div>`:""}</div>
  <div class="ci-e"><div class="qty" role="group" aria-label="${T("تعداد")}"><button data-cq="1" data-ix="${ix}" aria-label="${T("افزایش")}"${i.q>=p.st?" disabled":""}>${IC.plus}</button><span>${fa(i.q)}</span><button data-cq="-1" data-ix="${ix}" aria-label="${T("کاهش")}">${i.q>1?IC.minus:IC.trash}</button></div>
   <div class="pr" style="align-items:flex-end">${p.old?`<s>${money((p.old+unit(p,i.w)-p.pr)*i.q)}</s>`:""}<b>${money(unit(p,i.w)*i.q)}<small>${cur()}</small></b></div>
   <button class="rm" data-rm="${ix}">${IC.trash}${T("حذف")}</button></div></div>`}).join("")}
  <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><a class="btn btn-sm" href="#/shop"><span style="display:inline-flex;transform:scaleX(-1)" class="flip">${IC.arrow}</span>${T("ادامه خرید")}</a><button class="btn btn-sm" id="clearCart">${IC.trash}${T("خالی کردن سبد")}</button></div></div>
 <aside class="sum">${sumBox(`<div class="sum-row tot"><span>${T("مبلغ قابل پرداخت")}</span><b>${priceTxt(t.after)}</b></div>`)}
  <div class="sum-box"><h3 style="font-size:14px">${T("کد تخفیف")}</h3><form class="coupon" id="cpForm"><input class="inp ltr" id="cpIn" value="${esc(S.coupon)}" data-tp="مثلاً NET10" placeholder="${T("مثلاً NET10")}" aria-label="${T("کد تخفیف")}" autocapitalize="characters"><button class="btn btn-sm">${T(S.coupon?"حذف":"اعمال")}</button></form><small class="faint">${T("برای آزمایش: NET10")}</small></div>
  <a class="btn btn-red btn-block" href="#/checkout">${T("ادامه و ثبت سفارش")}</a><a class="btn btn-block btn-sm" href="#/invoice">${IC.doc}${T("دریافت پیش‌فاکتور رسمی")}</a></aside></div>`}
function initCart(){
 $$("[data-cq]").forEach(b=>b.onclick=()=>{const i=S.cart[+b.dataset.ix],p=byId(i.id);const d=+b.dataset.cq;
  if(d<0&&i.q===1){S.cart.splice(+b.dataset.ix,1);toast(T("کالا از سبد حذف شد"))}else i.q=Math.max(1,Math.min(p.st,i.q+d));save("cart");syncBadges();render()});
 $$("[data-rm]").forEach(b=>b.onclick=()=>{S.cart.splice(+b.dataset.rm,1);save("cart");syncBadges();render();toast(T("کالا از سبد حذف شد"))});
 const cc=$("#clearCart");if(cc)cc.onclick=()=>confirmBox(T("همه کالاهای سبد حذف شوند؟"),()=>{S.cart=[];save("cart");syncBadges();render()});
 const f=$("#cpForm");if(f)f.onsubmit=e=>{e.preventDefault();if(S.coupon){S.coupon="";save("coupon");render();return}
  const c=toEn($("#cpIn").value).trim().toUpperCase();if(COUPONS[c]){S.coupon=c;save("coupon");render();toast(T("کد تخفیف اعمال شد"),{ok:1})}else toast(T("کد تخفیف معتبر نیست"))}}

/* ---------- checkout ---------- */
const SHIP=[{k:"courier",n:"پیک تارنور (تهران)",d:"تحویل همان روز برای سفارش‌های پیش از ساعت ۱۴",p:150000},{k:"tipax",n:"تیپاکس",d:"۱ تا ۳ روز کاری به سراسر کشور",p:220000},{k:"post",n:"پست پیشتاز",d:"۲ تا ۵ روز کاری",p:120000},{k:"pickup",n:"تحویل حضوری از دفتر",d:"پس از تماس کارشناس و آماده‌سازی سفارش",p:0}];
const PAY=[{k:"online",n:"پرداخت اینترنتی",d:"با همه کارت‌های عضو شتاب"},{k:"card",n:"کارت‌به‌کارت یا واریز",d:"شماره حساب پس از ثبت سفارش در واتساپ ارسال می‌شود"},{k:"cod",n:"پرداخت در محل",d:"فقط برای تهران و ارسال با پیک"},{k:"credit",n:"اعتباری سازمانی",d:"پرداخت پس از تحویل با پیش‌فاکتور رسمی"}];
const PROV=["تهران","البرز","اصفهان","خراسان رضوی","فارس","آذربایجان شرقی","خوزستان","مازندران","گیلان","قم","کرمان","یزد","همدان","کرمانشاه","سایر استان‌ها"];
let co={step:1};
const shipCost=t=>{const s=SHIP.find(x=>x.k===co.ship)||SHIP[0];return s.k==="pickup"||t.after>=FREE_SHIP?0:s.p};
function stepsHtml(n){return`<ol class="steps">${["نشانی و مشخصات","ارسال و پرداخت","بازبینی و ثبت"].map((t,i)=>`<li class="${i+1===n?"on":i+1<n?"done":""}"><i>${i+1<n?IC.check:fa(i+1)}</i>${T(t)}</li>`).join("")}</ol>`}
function vCheckout(){if(!S.cart.length)return vCart();
 co=Object.assign({step:1,ship:"courier",pay:"online",inv:"p",name:S.user&&S.user.name||"",mobile:S.user&&S.user.mobile||"",prov:"تهران",city:"",addr:"",zip:"",co:"",nid:"",eco:"",note:""},S.addr||{},{step:co.step||1});
 return`${crumb([[T("سبد خرید"),"#/cart"],[T("ثبت سفارش")]])}<div class="ph"><h1>${T("ثبت سفارش")}</h1></div><div id="coBody"></div>`}
function coSide(){const t=totals(),sc=shipCost(t);
 return`<aside class="sum"><div class="sum-box"><h3>${T("کالاهای سفارش")}</h3><div class="mini-items">${S.cart.map(i=>{const p=byId(i.id);return`<div><span class="th">${dev(p)}</span><span>${esc(pname(p))} <small class="faint">× ${fa(i.q)}</small></span><b>${money(unit(p,i.w)*i.q)}</b></div>`}).join("")}</div></div>
 ${sumBox(`<div class="sum-row"><span>${T("هزینه ارسال")}</span><b>${sc?priceTxt(sc):T("رایگان")}</b></div><div class="sum-row tot"><span>${T("مبلغ قابل پرداخت")}</span><b>${priceTxt(t.after+sc)}</b></div>`)}</aside>`}
function fld(id,label,o={}){const v=co[id]||"";const req=o.req!==false;
 return`<div class="field${o.full?" full":""}"><label for="f_${id}">${T(label)}${req?' <span class="req">*</span>':""}</label>${o.sel?`<select class="inp" id="f_${id}">${o.sel.map(x=>`<option value="${esc(x)}"${x===v?" selected":""}>${T(x)}</option>`).join("")}</select>`:o.ta?`<textarea class="inp" id="f_${id}" rows="3">${esc(v)}</textarea>`:`<input class="inp${o.ltr?" ltr":""}" id="f_${id}" value="${esc(v)}"${o.type?` type="${o.type}"`:""}${o.ac?` autocomplete="${o.ac}"`:""}${o.im?` inputmode="${o.im}"`:""}${o.ph?` placeholder="${esc(T(o.ph))}"`:""}>`}${o.hint?`<span class="hint">${T(o.hint)}</span>`:""}<span class="msg"></span></div>`}
const MOB=/^(\+?98|0)?9\d{9}$|^\+?(?!98)\d{8,15}$/;
function coRender(){const b=$("#coBody");if(!b)return;const n=co.step;let main="";
 if(n===1)main=`<div class="panel co-sec"><h3 style="font-size:17px">${T("مشخصات گیرنده")}</h3><div class="fgrid">
   ${fld("name","نام و نام خانوادگی",{ac:"name"})}${fld("mobile","شماره موبایل",{type:"tel",ac:"tel",im:"tel",ph:"مثلاً ۰۹۱۲۳۴۵۶۷۸۹",hint:"شماره بین‌المللی هم پذیرفته می‌شود"})}
   ${fld("prov","استان",{sel:PROV})}${fld("city","شهر",{ac:"address-level2"})}
   ${fld("addr","نشانی کامل",{full:1,ta:1,ac:"street-address"})}${fld("zip","کد پستی",{req:false,ltr:1,im:"numeric",ph:"۱۰ رقم",ac:"postal-code"})}</div>
  <h3 style="font-size:17px;margin-top:6px">${T("نوع فاکتور")}</h3>
  <div class="seg" role="group" style="align-self:flex-start"><button data-inv="p" aria-pressed="${co.inv==="p"}">${T("شخصی")}</button><button data-inv="c" aria-pressed="${co.inv==="c"}">${T("شرکتی (رسمی)")}</button></div>
  ${co.inv==="c"?`<div class="fgrid">${fld("co","نام شرکت یا سازمان",{full:1})}${fld("nid","شناسه ملی",{ltr:1,im:"numeric",ph:"۱۱ رقم"})}${fld("eco","کد اقتصادی",{req:false,ltr:1,im:"numeric"})}</div>`:""}
  <div class="co-nav"><a class="btn btn-sm" href="#/cart">${T("بازگشت به سبد")}</a><button class="btn btn-red" data-next>${T("ادامه")}<span class="flip">${IC.arrow}</span></button></div></div>`;
 if(n===2){const t=totals();main=`<div class="panel co-sec"><h3 style="font-size:17px">${T("روش ارسال")}</h3><div class="rcards">${SHIP.map(s=>`<label class="rcard"><input type="radio" name="ship" value="${s.k}"${co.ship===s.k?" checked":""}><span class="dot"></span><span class="rc-b"><b>${T(s.n)}</b><small>${T(s.d)}</small></span><span class="rc-p">${s.p&&t.after<FREE_SHIP?priceTxt(s.p):T("رایگان")}</span></label>`).join("")}</div>
  <h3 style="font-size:17px;margin-top:6px">${T("روش پرداخت")}</h3><div class="rcards">${PAY.map(s=>`<label class="rcard"><input type="radio" name="pay" value="${s.k}"${co.pay===s.k?" checked":""}><span class="dot"></span><span class="rc-b"><b>${T(s.n)}</b><small>${T(s.d)}</small></span></label>`).join("")}</div><span class="msg" id="payMsg" style="color:var(--red-ink);font-size:13px"></span>
  ${fld("note","توضیحات سفارش",{req:false,ta:1,full:1})}
  <div class="co-nav"><button class="btn btn-sm" data-prev>${T("مرحله قبل")}</button><button class="btn btn-red" data-next>${T("ادامه")}<span class="flip">${IC.arrow}</span></button></div></div>`}
 if(n===3){const s=SHIP.find(x=>x.k===co.ship),pa=PAY.find(x=>x.k===co.pay);main=`<div class="panel co-sec"><h3 style="font-size:17px">${T("بازبینی سفارش")}</h3>
  <table class="spec"><tbody><tr><th>${T("گیرنده")}</th><td>${esc(co.name)} · <span class="ltr">${esc(dg(co.mobile))}</span></td></tr><tr><th>${T("نشانی")}</th><td>${esc(T(co.prov))}${T("، ")}${esc(co.city)}${T("، ")}${esc(co.addr)}${co.zip?` · ${T("کد پستی")} <span class="ltr">${esc(dg(co.zip))}</span>`:""}</td></tr>
  ${co.inv==="c"?`<tr><th>${T("فاکتور رسمی")}</th><td>${esc(co.co)} · ${T("شناسه ملی")} <span class="ltr">${esc(dg(co.nid))}</span></td></tr>`:""}<tr><th>${T("روش ارسال")}</th><td>${T(s.n)}</td></tr><tr><th>${T("روش پرداخت")}</th><td>${T(pa.n)}</td></tr>${co.note?`<tr><th>${T("توضیحات")}</th><td>${esc(co.note)}</td></tr>`:""}</tbody></table>
  <label class="ck"><input type="checkbox" id="agree"><span class="bx">${IC.check}</span><span>${T("شرایط فروش و بازگشت کالا را خوانده‌ام و می‌پذیرم.")}</span></label><span class="msg" id="agMsg" style="color:var(--red-ink);font-size:13px"></span>
  <div class="co-nav"><button class="btn btn-sm" data-prev>${T("مرحله قبل")}</button><button class="btn btn-red" id="placeBtn">${IC.check}${T(co.pay==="online"?"پرداخت و ثبت نهایی":"ثبت نهایی سفارش")}</button></div></div>`}
 b.innerHTML=`${stepsHtml(n)}<div class="cart"><div>${main}</div>${coSide()}</div>`;
 coBind()}
function coRead(){$$("#coBody [id^=f_]").forEach(el=>co[el.id.slice(2)]=el.value.trim())}
function coValidate(){coRead();const rules=[["name",v=>v.length>=3,"نام و نام خانوادگی را کامل وارد کنید"],["mobile",v=>MOB.test(toEn(v).replace(/[\s-]/g,"")),"شماره موبایل معتبر نیست"],["city",v=>v.length>=2,"شهر را وارد کنید"],["addr",v=>v.length>=10,"نشانی را کامل‌تر بنویسید"],["zip",v=>!v||/^\d{10}$/.test(toEn(v)),"کد پستی باید ۱۰ رقم باشد"]];
 if(co.inv==="c")rules.push(["co",v=>v.length>=2,"نام شرکت را وارد کنید"],["nid",v=>/^\d{11}$/.test(toEn(v)),"شناسه ملی باید ۱۱ رقم باشد"]);
 let first=null;rules.forEach(([k,fn,m])=>{const el=$("#f_"+k);if(!el)return;const ok=fn(co[k]||"");const fd=el.closest(".field");fd.classList.toggle("err",!ok);fd.querySelector(".msg").textContent=ok?"":T(m);if(!ok&&!first)first=el});
 if(first){first.focus();first.scrollIntoView({block:"center",behavior:"smooth"});return false}return true}
function coBind(){
 $$("[data-inv]").forEach(b=>b.onclick=()=>{coRead();co.inv=b.dataset.inv;coRender()});
 $$("input[name=ship]").forEach(i=>i.onchange=()=>{co.ship=i.value;coRead();coRender()});
 $$("input[name=pay]").forEach(i=>i.onchange=()=>{co.pay=i.value;$("#payMsg").textContent=""});
 $$("[data-prev]").forEach(b=>b.onclick=()=>{coRead();co.step--;coRender();window.scrollTo({top:0,behavior:"smooth"})});
 $$("[data-next]").forEach(b=>b.onclick=()=>{
  if(co.step===1){if(!coValidate())return;S.addr={name:co.name,mobile:co.mobile,prov:co.prov,city:co.city,addr:co.addr,zip:co.zip,inv:co.inv,co:co.co,nid:co.nid,eco:co.eco};save("addr")}
  if(co.step===2){coRead();if(co.pay==="cod"&&!(co.ship==="courier"&&co.prov==="تهران")){$("#payMsg").textContent=T("پرداخت در محل فقط برای تهران و ارسال با پیک فعال است.");return}}
  co.step++;coRender();window.scrollTo({top:0,behavior:"smooth"})});
 const pb=$("#placeBtn");if(pb)pb.onclick=()=>{if(!$("#agree").checked){$("#agMsg").textContent=T("برای ثبت سفارش، شرایط را بپذیرید.");return}
  pb.classList.add("is-busy");setTimeout(placeOrder,co.pay==="online"?900:400)}}
function placeOrder(){const t=totals(),sc=shipCost(t);const code="TN-"+String(Date.now()).slice(-6)+String(Math.floor(Math.random()*90+10));
 const o={code,date:new Date().toISOString(),items:S.cart.map(i=>({...i,u:unit(byId(i.id),i.w)})),sub:t.sub,disc:t.disc,ship:sc,total:t.after+sc,shipK:co.ship,payK:co.pay,
  to:{name:co.name,mobile:co.mobile,prov:co.prov,city:co.city,addr:co.addr,zip:co.zip},inv:co.inv==="c"?{co:co.co,nid:co.nid,eco:co.eco}:null,note:co.note,status:co.pay==="online"?"paid":"pending"};
 S.orders.unshift(o);save("orders");S.cart=[];save("cart");S.coupon="";save("coupon");syncBadges();co={step:1};
 if(!S.user){S.user={name:o.to.name,mobile:o.to.mobile,guest:1};save("user")}
 location.hash="#/order/"+code}
function orderMsg(o){return[T("سلام، سفارش من در سایت تارنور:"),T("کد پیگیری: {c}",{c:o.code}),...o.items.map(i=>"• "+pname(byId(i.id))+" × "+i.q),T("مبلغ کل: {p}",{p:priceTxt(o.total)}),T("گیرنده: {n}، {m}",{n:o.to.name,m:o.to.mobile})].join("\n")}
const STAT={paid:["پرداخت‌شده؛ در حال آماده‌سازی","ok"],pending:["در انتظار تأیید پرداخت","warn"]};
function vOrder(code){const o=S.orders.find(x=>x.code===code);if(!o)return vNotFound();
 return`<div class="done-card"><div class="ok"><i>${IC.check}</i></div><h1 style="font-size:clamp(22px,3vw,30px)">${T("سفارش شما ثبت شد")}</h1>
 <p class="muted">${T(o.status==="paid"?"پرداخت با موفقیت انجام شد. کارشناس ما برای هماهنگی ارسال با شما تماس می‌گیرد.":"سفارش ثبت شد. برای نهایی شدن، کارشناس ما برای هماهنگی پرداخت با شما تماس می‌گیرد.")}</p>
 <span class="faint" style="font-size:13px">${T("کد پیگیری")}</span><span class="code mono">${esc(o.code)}</span>
 <span class="pill-tag ${STAT[o.status][1]}">${T(STAT[o.status][0])}</span>
 <div class="row"><a class="btn btn-red btn-sm" href="${waText(orderMsg(o))}" target="_blank" rel="noopener">${IC.wa}${T("ارسال سفارش در واتساپ")}</a><a class="btn btn-sm" href="#/invoice/${o.code}">${IC.doc}${T("مشاهده فاکتور")}</a><a class="btn btn-sm" href="#/account">${T("سفارش‌های من")}</a></div>
 <p class="demo-note">${T("این نسخه نمایشی است و پرداخت واقعی انجام نمی‌شود. با دکمه واتساپ، سفارش مستقیم برای فروشنده ارسال می‌شود.")}</p></div>`}

/* ---------- invoice ---------- */
function vInvoice(code){const o=code?S.orders.find(x=>x.code===code):null;if(code&&!o)return vNotFound();
 const items=o?o.items:S.cart.map(i=>({...i,u:unit(byId(i.id),i.w)}));const t=o?{sub:o.sub,disc:o.disc,ship:o.ship,total:o.total}:(()=>{const x=totals();return{sub:x.sub,disc:x.disc,ship:0,total:x.after}})();
 const tax=Math.round(t.total*.10);const no=o?o.code:"PF-"+dg(new Date().toISOString().slice(2,10).replace(/-/g,""));
 if(!items.length)return`${crumb([[T("پیش‌فاکتور رسمی")]])}<div class="ph"><h1>${T("پیش‌فاکتور رسمی")}</h1></div><div class="empty"><span class="ci">${IC.doc}</span><h3>${T("برای صدور پیش‌فاکتور، کالا به سبد اضافه کنید")}</h3><p>${T("پیش‌فاکتور از روی کالاهای سبد خرید ساخته می‌شود و برای واحد مالی سازمان قابل چاپ است.")}</p><a class="btn btn-red btn-sm" href="#/shop">${T("رفتن به فروشگاه")}</a></div>`;
 const inv=o&&o.inv||S.addr&&S.addr.inv==="c"&&S.addr||null;
 return`${crumb([[T(o?"فاکتور سفارش":"پیش‌فاکتور رسمی")]])}<div class="ph no-print"><h1>${T(o?"فاکتور سفارش":"پیش‌فاکتور رسمی")}</h1><p>${T("قابل چاپ یا ذخیره به‌صورت PDF برای واحد مالی.")}</p></div>
 <div class="inv-wrap"><article class="paper" id="paper"><div class="inv-h"><div><a class="logo"><span class="logo-mark"><i></i></span><span><b>${T("تارنور")}</b><small>TARNOOR</small></span></a><p class="faint" style="font-size:12.5px;margin-top:10px">${T("فروشگاه تخصصی تجهیزات شبکه")} · <span class="ltr">0912 735 0415</span></p></div>
  <div><h2>${T(o?"فاکتور فروش":"پیش‌فاکتور")}</h2><div class="meta" style="margin-top:8px"><span>${T("شماره")}</span><b class="mono">${esc(no)}</b><span>${T("تاریخ")}</span><b>${dateTxt(o?o.date:new Date())}</b><span>${T("اعتبار")}</span><b>${T(o?"—":"۳ روز کاری")}</b></div></div></div>
  <div class="meta" style="margin-bottom:16px"><span>${T("خریدار")}</span><b>${esc(inv&&inv.co||o&&o.to.name||S.user&&S.user.name||T("—"))}</b>${inv&&inv.nid?`<span>${T("شناسه ملی")}</span><b class="ltr">${esc(dg(inv.nid))}</b>`:""}${o?`<span>${T("تلفن")}</span><b class="ltr">${esc(dg(o.to.mobile))}</b>`:""}</div>
  <div class="tbl-x"><table class="inv-t"><thead><tr><th>#</th><th>${T("شرح کالا")}</th><th>${T("گارانتی")}</th><th class="n">${T("تعداد")}</th><th class="n">${T("فی ({c})",{c:cur()})}</th><th class="n">${T("مبلغ ({c})",{c:cur()})}</th></tr></thead>
  <tbody>${items.map((i,ix)=>{const p=byId(i.id);return`<tr><td>${fa(ix+1)}</td><td>${esc(pname(p))}<br><small class="mono faint">${esc(p.m)}</small></td><td>${esc(planName(p,i.w))}</td><td class="n">${fa(i.q)}</td><td class="n">${money(i.u)}</td><td class="n">${money(i.u*i.q)}</td></tr>`}).join("")}</tbody></table></div>
  <div class="inv-tot"><div class="sum-row"><span>${T("جمع کالاها")}</span><b>${priceTxt(t.sub)}</b></div>${t.disc?`<div class="sum-row disc"><span>${T("تخفیف")}</span><b>−${priceTxt(t.disc)}</b></div>`:""}${t.ship?`<div class="sum-row"><span>${T("هزینه ارسال")}</span><b>${priceTxt(t.ship)}</b></div>`:""}<div class="sum-row"><span>${T("مالیات بر ارزش افزوده (۱۰٪، تخمینی)")}</span><b>${priceTxt(tax)}</b></div><div class="sum-row tot"><span>${T("جمع کل")}</span><b>${priceTxt(t.total+tax)}</b></div></div>
  <p class="inv-note">${T("قیمت‌ها بر اساس نرخ روز است و این سند پس از تأیید کارشناس فروش معتبر می‌شود.")}</p></article>
 <aside class="sum inv-side no-print"><div class="sum-box"><h3>${T("دریافت سند")}</h3><button class="btn btn-red btn-block" data-act="print">${IC.print}${T("چاپ یا ذخیره PDF")}</button><button class="btn btn-block btn-sm" data-act="copyInv">${IC.copy}${T("کپی متن پیش‌فاکتور")}</button><a class="btn btn-block btn-sm" href="${waText(invText(items,t,tax,no))}" target="_blank" rel="noopener">${IC.wa}${T("ارسال در واتساپ")}</a></div>
 ${o?"":`<div class="sum-box"><h3 style="font-size:14px">${T("اطلاعات شرکت در پیش‌فاکتور")}</h3><p class="faint" style="font-size:13px">${T("نام شرکت و شناسه ملی را در مرحله اول ثبت سفارش وارد کنید تا اینجا هم نمایش داده شود.")}</p><a class="btn btn-sm" href="#/checkout">${T("ثبت سفارش")}</a></div>`}</aside></div>`}
function invText(items,t,tax,no){return[T("پیش‌فاکتور تارنور")+" "+no,...items.map(i=>"• "+pname(byId(i.id))+" × "+i.q+" = "+priceTxt(i.u*i.q)),T("جمع کل")+": "+priceTxt(t.total+tax)].join("\n")}

/* ---------- compare / wishlist ---------- */
function vCompare(){const ps=S.cmp.map(byId).filter(Boolean);
 if(!ps.length)return`${crumb([[T("مقایسه کالا")]])}<div class="ph"><h1>${T("مقایسه کالا")}</h1></div><div class="empty"><span class="ci">${IC.cmp}</span><h3>${T("هنوز کالایی برای مقایسه انتخاب نکرده‌اید")}</h3><p>${T("روی دکمه مقایسه در کارت هر کالا بزنید؛ تا چهار کالا را می‌توانید کنار هم ببینید.")}</p><a class="btn btn-red btn-sm" href="#/shop">${T("رفتن به فروشگاه")}</a></div>`;
 const keys=[...new Set(ps.flatMap(p=>Object.keys(p.sp)))];
 const row=(label,vals,mono)=>{const diff=new Set(vals).size>1&&ps.length>1;return`<tr class="${diff?"diff-r":""}"><th scope="row">${label}</th>${vals.map(v=>`<td${mono?' class="mono"':""}>${v}</td>`).join("")}</tr>`};
 return`${crumb([[T("مقایسه کالا")]])}<div class="ph"><h1>${T("مقایسه کالا")}</h1><p>${T("{n} کالا در فهرست مقایسه.",{n:fa(ps.length)})}</p></div>
 <div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap"><label class="sw"><input type="checkbox" id="onlyDiff"><span class="tr"></span>${T("فقط تفاوت‌ها")}</label><button class="btn btn-xs" id="cmpClear">${IC.trash}${T("پاک کردن فهرست")}</button></div>
 <div class="cmp-x"><table class="cmp"><thead><tr><td></td>${ps.map(p=>`<td><div class="cmp-card"><button class="knob knob-sm rm" data-act="cmp" data-id="${p.id}" aria-label="${T("حذف از مقایسه")}">${IC.x}</button><a class="th" href="#/p/${p.id}">${dev(p)}</a><h3><a href="#/p/${p.id}">${esc(pname(p))}</a></h3>${priceHtml(p)}<button class="btn btn-red btn-xs" data-act="add" data-id="${p.id}"${p.st===0?" disabled":""}>${IC.cart}${T("افزودن به سبد")}</button></div></td>`).join("")}</tr></thead>
 <tbody>${row(T("برند"),ps.map(p=>esc(p.b)))}${row(T("کد مدل"),ps.map(p=>esc(p.m)),1)}${row(T("وضعیت"),ps.map(p=>T(isStock(p)?"استوک":"نو")))}${keys.map(k=>row(esc(sk(k)),ps.map(p=>p.sp[k]?esc(sv(p.sp[k])):"—"))).join("")}</tbody></table></div>`}
function initCompare(){const od=$("#onlyDiff");if(od)od.onchange=()=>$$(".cmp tbody tr").forEach(r=>r.hidden=od.checked&&!r.classList.contains("diff-r"));
 const cc=$("#cmpClear");if(cc)cc.onclick=()=>{S.cmp=[];save("cmp");syncBadges();render()}}
function vWish(){const ps=S.wish.map(byId).filter(Boolean);
 return`${crumb([[T("علاقه‌مندی‌ها")]])}<div class="ph"><h1>${T("علاقه‌مندی‌ها")}</h1>${ps.length?`<p>${T("{n} کالا ذخیره کرده‌اید.",{n:fa(ps.length)})}</p>`:""}</div>
 ${ps.length?`<div class="grid">${ps.map(pcard).join("")}</div><div style="margin-top:22px;display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-red btn-sm" id="wishAll">${IC.cart}${T("افزودن همه به سبد")}</button></div>`:`<div class="empty"><span class="ci">${IC.heart}</span><h3>${T("فهرست علاقه‌مندی‌ها خالی است")}</h3><p>${T("با زدن دکمه قلب روی هر کالا، آن را اینجا نگه دارید تا بعداً راحت پیدایش کنید.")}</p><a class="btn btn-red btn-sm" href="#/shop">${T("رفتن به فروشگاه")}</a></div>`}`}
function initWish(){const b=$("#wishAll");if(b)b.onclick=()=>{let n=0;S.wish.forEach(id=>{const p=byId(id);if(p&&p.st>0){addToCart(id,1,"std",1);n++}});toast(T("{n} کالا به سبد اضافه شد",{n:fa(n)}),{ok:1,link:["#/cart",T("مشاهده سبد")]})}}

/* ---------- account ---------- */
let acTab="dash",otpFor="";
function vAccount(){const u=S.user;
 if(!u||u.guest&&!u.verified)return`${crumb([[T("حساب کاربری")]])}<div class="login"><div class="ph" style="text-align:center;align-items:center"><span class="eyb">ACCOUNT</span><h1>${T("ورود یا ثبت‌نام")}</h1><p>${T("با شماره موبایل وارد شوید؛ اگر حساب نداشته باشید، خودکار ساخته می‌شود.")}</p></div><div class="panel" id="loginBox"></div></div>`;
 const tabs=[["dash","پیشخوان",IC.home],["orders","سفارش‌های من",IC.box],["profile","اطلاعات حساب",IC.user],["track","پیگیری سفارش",IC.search]];
 return`${crumb([[T("حساب کاربری")]])}<div class="ph"><h1>${T("حساب کاربری")}</h1></div><div class="acct"><nav class="acct-nav"><div class="who"><span class="av">${esc((u.name||"؟").trim().charAt(0))}</span><div><b>${esc(u.name||T("کاربر تارنور"))}</b><small class="ltr">${esc(dg(u.mobile||""))}</small></div></div>
 ${tabs.map(([k,t,i])=>`<button data-ac="${k}" aria-current="${acTab===k}">${i}${T(t)}</button>`).join("")}<a href="#/wishlist">${IC.heart}${T("علاقه‌مندی‌ها")}</a><button data-act="logout">${IC.logout}${T("خروج")}</button></nav><div id="acBody"></div></div>`}
function ordersHtml(list){return list.length?`<div style="display:flex;flex-direction:column;gap:16px">${list.map(o=>`<div class="order"><header><div><b class="mono">${esc(o.code)}</b> <span class="faint" style="font-size:12.5px">· ${dateTxt(o.date)}</span></div><span class="pill-tag ${STAT[o.status][1]}">${T(STAT[o.status][0])}</span></header><div class="ths">${o.items.map(i=>`<span title="${esc(pname(byId(i.id)))}">${dev(byId(i.id))}</span>`).join("")}</div><footer><span>${T("{n} کالا",{n:fa(o.items.reduce((a,i)=>a+i.q,0))})} · <b>${priceTxt(o.total)}</b></span><span style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-xs" href="#/invoice/${o.code}">${IC.doc}${T("فاکتور")}</a><a class="btn btn-xs" href="${waText(orderMsg(o))}" target="_blank" rel="noopener">${IC.wa}${T("پیگیری در واتساپ")}</a><button class="btn btn-xs" data-reorder="${o.code}">${IC.cart}${T("خرید دوباره")}</button></span></footer></div>`).join("")}</div>`
 :`<div class="empty"><span class="ci">${IC.box}</span><h3>${T("هنوز سفارشی ثبت نکرده‌اید")}</h3><a class="btn btn-red btn-sm" href="#/shop">${T("رفتن به فروشگاه")}</a></div>`}
function acRender(){const b=$("#acBody");if(!b)return;const u=S.user;
 if(acTab==="dash"){const spent=S.orders.reduce((a,o)=>a+o.total,0);b.innerHTML=`<div class="stats">${[[fa(S.orders.length),"سفارش"],[fa(S.wish.length),"علاقه‌مندی"],[priceTxt(spent),"مجموع خرید"]].map(([v,t])=>`<div class="ro"><b style="font-size:21px">${v}</b><span>${T(t)}</span></div>`).join("")}</div><div class="sh"><h2 style="font-size:19px">${T("آخرین سفارش‌ها")}</h2></div>${ordersHtml(S.orders.slice(0,2))}`}
 if(acTab==="orders")b.innerHTML=ordersHtml(S.orders);
 if(acTab==="profile"){b.innerHTML=`<form class="panel" id="profF" novalidate style="display:flex;flex-direction:column;gap:18px"><div class="fgrid">
  <div class="field"><label for="pf_name">${T("نام و نام خانوادگی")}</label><input class="inp" id="pf_name" value="${esc(u.name||"")}" autocomplete="name"><span class="msg"></span></div>
  <div class="field"><label for="pf_mob">${T("شماره موبایل")}</label><input class="inp ltr" id="pf_mob" value="${esc(u.mobile||"")}" disabled></div>
  <div class="field"><label for="pf_mail">${T("ایمیل")}</label><input class="inp" type="email" id="pf_mail" value="${esc(u.email||"")}" autocomplete="email"><span class="msg"></span></div>
  <div class="field"><label for="pf_co">${T("نام شرکت (اختیاری)")}</label><input class="inp" id="pf_co" value="${esc(u.co||"")}"></div></div>
  <label class="sw"><input type="checkbox" id="pf_news"${u.news?" checked":""}><span class="tr"></span>${T("دریافت پیشنهادها و خبرنامه")}</label>
  <button class="btn btn-red btn-sm" style="align-self:flex-start">${T("ذخیره تغییرات")}</button></form>`;
  $("#profF").onsubmit=e=>{e.preventDefault();const n=$("#pf_name"),m=$("#pf_mail");let ok=true;
   [[n,n.value.trim().length>=3,"نام و نام خانوادگی را کامل وارد کنید"],[m,!m.value||/^\S+@\S+\.\S+$/.test(m.value),"ایمیل معتبر نیست"]].forEach(([el,v,msg])=>{const fd=el.closest(".field");fd.classList.toggle("err",!v);fd.querySelector(".msg").textContent=v?"":T(msg);if(!v)ok=false});
   if(!ok)return;Object.assign(S.user,{name:n.value.trim(),email:m.value.trim(),co:$("#pf_co").value.trim(),news:$("#pf_news").checked});save("user");toast(T("اطلاعات حساب ذخیره شد"),{ok:1});render()}}
 if(acTab==="track"){b.innerHTML=trackHtml();bindTrack()}
 $$("[data-reorder]",b).forEach(x=>x.onclick=()=>{const o=S.orders.find(y=>y.code===x.dataset.reorder);o.items.forEach(i=>{const p=byId(i.id);if(p&&p.st>0)addToCart(i.id,i.q,i.w,1)});toast(T("کالاهای سفارش به سبد اضافه شد"),{ok:1,link:["#/cart",T("مشاهده سبد")]})})}
const trackHtml=()=>`<form class="panel" id="trackF" novalidate style="display:flex;flex-direction:column;gap:14px"><h3 style="font-size:16px">${T("پیگیری سفارش")}</h3><p class="faint" style="font-size:13.5px">${T("کد پیگیری را که پس از ثبت سفارش دریافت کرده‌اید وارد کنید.")}</p><div class="coupon"><input class="inp ltr" id="trIn" placeholder="TN-123456" aria-label="${T("کد پیگیری")}"><button class="btn btn-sm">${T("پیگیری")}</button></div><div id="trOut"></div></form>`;
function bindTrack(){const f=$("#trackF");if(!f)return;f.onsubmit=e=>{e.preventDefault();const c=toEn($("#trIn").value).trim().toUpperCase();const o=S.orders.find(x=>x.code===c);
 $("#trOut").innerHTML=o?ordersHtml([o]):c?`<p class="demo-note">${T("سفارشی با این کد در این دستگاه پیدا نشد. برای پیگیری با کارشناس تماس بگیرید.")}</p>`:""}}
function loginRender(){const b=$("#loginBox");if(!b)return;
 if(!otpFor){b.innerHTML=`<form id="lgF" novalidate style="display:flex;flex-direction:column;gap:16px"><div class="field"><label for="lgM">${T("شماره موبایل")}</label><input class="inp ltr" id="lgM" type="tel" inputmode="tel" autocomplete="tel" placeholder="09xx xxx xxxx" value="${esc(S.user&&S.user.mobile||"")}"><span class="msg"></span></div><button class="btn btn-red btn-block">${T("دریافت کد تأیید")}</button><p class="faint" style="font-size:12.5px;text-align:center">${T("ورود شما به معنای پذیرش قوانین تارنور است.")}</p></form>`;
  $("#lgF").onsubmit=e=>{e.preventDefault();const m=$("#lgM"),v=toEn(m.value).replace(/[\s-]/g,"");const ok=MOB.test(v);const fd=m.closest(".field");fd.classList.toggle("err",!ok);fd.querySelector(".msg").textContent=ok?"":T("شماره موبایل معتبر نیست");if(!ok)return;otpFor=v;loginRender()};return}
 b.innerHTML=`<form id="otpF" novalidate style="display:flex;flex-direction:column;gap:16px;align-items:stretch"><p style="text-align:center">${T("کد ۴ رقمی به {m} پیامک شد.",{m:`<b class="ltr">${esc(dg(otpFor))}</b>`})}</p><div class="otp">${[0,1,2,3].map(i=>`<input inputmode="numeric" maxlength="1" aria-label="${T("رقم {n}",{n:fa(i+1)})}" autocomplete="${i?"off":"one-time-code"}">`).join("")}</div><span class="msg" id="otpMsg" style="text-align:center;color:var(--red-ink);font-size:13px"></span>
  <p class="demo-note">${T("نسخه نمایشی: کد تأیید 1234 است.")}</p><button class="btn btn-red btn-block">${T("ورود")}</button><button type="button" class="btn btn-sm" id="otpBack">${T("ویرایش شماره")}</button></form>`;
 const ins=$$(".otp input");ins[0].focus();
 ins.forEach((x,i)=>{x.oninput=()=>{x.value=toEn(x.value).replace(/\D/g,"").slice(-1);if(x.value&&ins[i+1])ins[i+1].focus();if(ins.every(y=>y.value))$("#otpF").requestSubmit()};
  x.onkeydown=e=>{if(e.key==="Backspace"&&!x.value&&ins[i-1])ins[i-1].focus()};
  x.onpaste=e=>{const t=toEn((e.clipboardData||window.clipboardData).getData("text")).replace(/\D/g,"").slice(0,4);if(t.length===4){e.preventDefault();ins.forEach((y,j)=>y.value=t[j]);$("#otpF").requestSubmit()}}});
 $("#otpBack").onclick=()=>{otpFor="";loginRender()};
 $("#otpF").onsubmit=e=>{e.preventDefault();const c=ins.map(x=>x.value).join("");if(c!=="1234"){$("#otpMsg").textContent=T("کد واردشده درست نیست. دوباره امتحان کنید.");ins.forEach(x=>x.value="");ins[0].focus();return}
  const prev=S.user&&S.user.mobile===otpFor?S.user:{};S.user=Object.assign({},prev,{mobile:otpFor,verified:1,guest:0});save("user");otpFor="";acTab="dash";toast(T("خوش آمدید!"),{ok:1});render()}}
function initAccount(){if($("#loginBox"))return loginRender();$$("[data-ac]").forEach(b=>b.onclick=()=>{acTab=b.dataset.ac;$$("[data-ac]").forEach(x=>x.setAttribute("aria-current",x===b));acRender()});acRender()}

/* ---------- blog ---------- */
function vBlog(){return`${crumb([[T("مقالات")]])}<div class="ph"><span class="eyb">JOURNAL</span><h1>${T("مقالات و راهنمای خرید")}</h1><p>${T("راهنمای انتخاب تجهیزات شبکه، نوشته کارشناسان تارنور.")}</p></div><div class="bgrid">${BLOG.map(bcard).join("")}</div>${contactBand()}`}
function vArticle(id){const a0=BLOG.find(x=>x.id===id);if(!a0)return vNotFound();const a=post(a0);const rel=BLOG.filter(x=>x.id!==id).slice(0,3);const ps=P.filter(p=>p.c===a0.c).slice(0,4);
 return`${crumb([[T("مقالات"),"#/blog"],[a.t]])}<div class="article sec-sm" style="margin-top:20px"><article class="art"><div class="cov">${icon(a0.c,64)}</div><h1>${esc(a.t)}</h1><div class="meta"><span>${dateTxt(BDATE[a0.id])}</span><span>·</span><span>${T("{n} دقیقه مطالعه",{n:fa(a0.rt)})}</span><span>·</span><a class="red" href="#/shop?c=${a0.c}">${esc(cname(catOf(a0.c)))}</a></div>
 ${a.body.map(([h,p],i)=>`${h?`<h2 id="s${i}">${esc(h)}</h2>`:""}<p class="${i?"":"lede"}">${esc(p)}</p>`).join("")}
 <div class="share" style="margin-top:28px"><button class="btn btn-sm" data-act="copyLink">${IC.copy}${T("کپی لینک")}</button><a class="btn btn-sm" href="${waText(a.t+" "+location.href)}" target="_blank" rel="noopener">${IC.wa}${T("اشتراک در واتساپ")}</a></div></article>
 <aside class="toc"><h4>${T("در این مقاله")}</h4>${a.body.map(([h],i)=>h?`<a href="#/blog/${a0.id}" data-sec="s${i}">${esc(h)}</a>`:"").join("")}<a class="btn btn-red btn-sm" href="#/contact" style="margin-top:6px">${T("مشاوره رایگان")}</a></aside></div>
 ${ps.length?`<section class="sec"><div class="sh"><div><span class="eyb">PRODUCTS</span><h2>${T("کالاهای مرتبط")}</h2></div></div><div class="grid">${ps.map(pcard).join("")}</div></section>`:""}
 <section class="sec"><div class="sh"><div><span class="eyb">MORE</span><h2>${T("مقالات دیگر")}</h2></div></div><div class="bgrid">${rel.map(bcard).join("")}</div></section>`}
function initArticle(){$$("[data-sec]").forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.dataset.sec);if(t)t.scrollIntoView({behavior:"smooth"})})}

/* ---------- about / contact / 404 ---------- */
function vAbout(){return`${crumb([[T("درباره ما")]])}
 <section class="tablet"><div class="screen about-hero"><div class="hero-tx"><span class="eyb red">ABOUT TARNOOR</span><h1 style="font-size:clamp(25px,3.2vw,40px)">${T("شبکه، فقط مجموعه‌ای از تجهیزات نیست؛ <span class=\"r\">زیرساختی برای ارتباط</span>، امنیت و رشد است.")}</h1>
  <p class="lead">${T("تارنور مجموعه‌ای تخصصی در حوزه تجهیزات و زیرساخت شبکه است. بیش از ده سال است که به کسب‌وکارها، سازمان‌ها و کاربران خانگی کمک می‌کنیم تجهیزات درست را برای نیاز درست انتخاب کنند؛ از روتر و سوییچ تا وایرلس، VoIP و پاورلاین.")}</p></div>
  <div class="readouts" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:0">${[[dg("+10"),"سال تجربه",1],[fa(P.length),"مدل در فروشگاه"],[fa(BRANDS.length),"برند معتبر"],[fa(18),"ماه گارانتی"]].map(([b,s,r])=>`<div class="ro"><b class="${r?"r":""}">${b}</b><span>${T(s)}</span></div>`).join("")}</div></div></section>
 <section class="sec"><div class="sh"><div><span class="eyb">VALUES</span><h2>${T("آنچه به آن پایبندیم")}</h2></div></div><div class="vals">${[["shield","اصالت کالا","همه کالاها اصل‌اند و پیش از ارسال بررسی می‌شوند."],["cpu","انتخاب مهندسی","پیشنهادها بر اساس نیاز واقعی شبکه شماست، نه گران‌ترین مدل."],["truck","ارسال سریع","ارسال همان روز در تهران و ۱ تا ۳ روز به سراسر کشور."],["doc","شفافیت","قیمت روز، پیش‌فاکتور رسمی و گارانتی مکتوب."]].map(([i,h,p])=>`<div class="pill"><span class="ci">${IC[i]}</span><h3>${T(h)}</h3><p>${T(p)}</p></div>`).join("")}</div></section>
 <section class="sec"><div class="contact-grid"><div><div class="sh"><div><span class="eyb">TIMELINE</span><h2>${T("مسیر ما")}</h2></div></div><div class="tl">${[["1394","شروع با تأمین تجهیزات شبکه برای دفاتر کوچک"],["1398","همکاری با شرکت‌ها و سازمان‌ها در پروژه‌های زیرساخت"],["1402","راه‌اندازی بخش کالای استوک تست‌شده"],["1405","فروشگاه آنلاین تارنور با مشاوره و پیش‌فاکتور آنی"]].map(([y,t])=>`<div><b>${LANG==="fa"?dg(y):{"1394":"2015","1398":"2019","1402":"2023","1405":"2026"}[y]}</b><p>${T(t)}</p></div>`).join("")}</div></div>
  <div class="panel" style="display:flex;flex-direction:column;gap:14px"><span class="eyb red">TALK TO AN ENGINEER</span><h3 style="font-size:20px">${T("پیش از خرید، با کارشناس تارنور مشورت کنید")}</h3><p class="muted">${T("مشاوره رایگان برای انتخاب تجهیزات متناسب با نوع کاربری، مقیاس و بودجه شبکه شما.")}</p><a class="btn btn-red" href="#/contact">${T("تماس با ما")}</a></div></div></section>`}
const FAQ=[["سفارش‌ها چقدر طول می‌کشد تا برسد؟","در تهران سفارش‌های ثبت‌شده پیش از ساعت ۱۴ همان روز با پیک ارسال می‌شوند. برای شهرهای دیگر، ارسال با تیپاکس ۱ تا ۳ روز کاری طول می‌کشد."],["کالای استوک یعنی چه؟","کالای استوک تجهیزات سازمانی دست‌دوم است که پیش از فروش کامل تست شده و با ۶ ماه گارانتی تارنور عرضه می‌شود."],["برای خرید سازمانی پیش‌فاکتور رسمی می‌دهید؟","بله. از صفحه سبد خرید پیش‌فاکتور رسمی بگیرید یا اطلاعات شرکت را در ثبت سفارش وارد کنید تا فاکتور رسمی صادر شود."],["اگر کالا با نیازم سازگار نبود چه کنم؟","تا ۷ روز پس از تحویل، در صورت سالم بودن کالا و بسته‌بندی، امکان بازگشت یا تعویض وجود دارد."]];
function vContact(){const u=S.user||{};return`${crumb([[T("تماس با ما")]])}<div class="ph"><span class="eyb">CONTACT</span><h1>${T("تماس با ما")}</h1><p>${T("برای مشاوره خرید، استعلام قیمت یا پیگیری سفارش با ما در ارتباط باشید.")}</p></div>
 <div class="ccards">${[["phone","تلفن و مشاوره",`<a class="num" href="tel:+${PHONE_INT}">0912 735 0415</a>`],["wa","واتساپ و تلگرام",`<span style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-xs" href="${WA}" target="_blank" rel="noopener">${T("واتساپ")}</a><a class="btn btn-xs" href="${TG}" target="_blank" rel="noopener">${T("تلگرام")}</a></span>`],["clock","ساعات پاسخ‌گویی",T("شنبه تا چهارشنبه ۹ تا ۱۸، پنجشنبه ۹ تا ۱۴")]].map(([i,h,v])=>`<div class="cc"><span class="ci">${IC[i]}</span><b>${T(h)}</b><span>${v}</span></div>`).join("")}</div>
 <section class="sec-sm contact-grid"><form class="panel" id="ctF" novalidate style="display:flex;flex-direction:column;gap:18px"><h3 style="font-size:18px">${T("ارسال پیام")}</h3><div class="fgrid">
  <div class="field"><label for="ct_n">${T("نام")} <span class="req">*</span></label><input class="inp" id="ct_n" autocomplete="name" value="${esc(u.name||"")}"><span class="msg"></span></div>
  <div class="field"><label for="ct_m">${T("شماره موبایل")} <span class="req">*</span></label><input class="inp ltr" id="ct_m" type="tel" inputmode="tel" autocomplete="tel" value="${esc(u.mobile||"")}"><span class="msg"></span></div>
  <div class="field full"><label for="ct_s">${T("موضوع")}</label><select class="inp" id="ct_s">${["مشاوره خرید","استعلام قیمت","پیگیری سفارش","گارانتی و خدمات","سایر"].map(x=>`<option value="${x}">${T(x)}</option>`).join("")}</select></div>
  <div class="field full"><label for="ct_t">${T("متن پیام")} <span class="req">*</span></label><textarea class="inp" id="ct_t" rows="5"></textarea><span class="msg"></span></div></div>
  <button class="btn btn-red" style="align-self:flex-start">${IC.wa}${T("ارسال پیام در واتساپ")}</button><p class="faint" style="font-size:12.5px">${T("پیام شما با همه جزئیات در واتساپ برای کارشناس فروش آماده می‌شود.")}</p></form>
 <div style="display:flex;flex-direction:column;gap:22px"><div class="map" role="img" aria-label="${T("موقعیت دفتر تارنور")}"><svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><path d="M0 210C80 180 120 230 200 190S330 120 400 140" fill="none" stroke="rgba(150,152,170,.35)" stroke-width="14" stroke-linecap="round"/><path d="M150 0L190 300M0 90L400 70" fill="none" stroke="rgba(150,152,170,.28)" stroke-width="9"/></svg><span class="pinm"><i></i></span></div>
  <div class="faq">${FAQ.map(([q,a])=>`<details><summary>${T(q)}${IC.down}</summary><p>${T(a)}</p></details>`).join("")}</div></div></section>`}
function initContact(){$("#ctF").onsubmit=e=>{e.preventDefault();const n=$("#ct_n"),m=$("#ct_m"),t=$("#ct_t");let ok=true;
 [[n,n.value.trim().length>=2,"نام را وارد کنید"],[m,MOB.test(toEn(m.value).replace(/[\s-]/g,"")),"شماره موبایل معتبر نیست"],[t,t.value.trim().length>=10,"پیام باید دست‌کم ۱۰ حرف باشد"]].forEach(([el,v,msg])=>{const fd=el.closest(".field");fd.classList.toggle("err",!v);fd.querySelector(".msg").textContent=v?"":T(msg);if(!v)ok=false});
 if(!ok)return;const u=waText(`${T($("#ct_s").value)}\n${t.value.trim()}\n— ${n.value.trim()} (${m.value.trim()})`);try{window.open(u,"_blank","noopener")}catch(_){}
 let r=$("#ctReady");if(!r){r=document.createElement("div");r.id="ctReady";r.className="demo-note";e.target.appendChild(r)}
 r.innerHTML=`${T("پیام شما در واتساپ آماده ارسال شد")} <a class="btn btn-red btn-sm" style="margin-top:10px" href="${esc(u)}" target="_blank" rel="noopener">${IC.wa}${T("باز کردن واتساپ")}</a>`;toast(T("پیام شما در واتساپ آماده ارسال شد"),{ok:1})}}
function vNotFound(){return`<div class="nf"><div class="big">404</div><h1 style="font-size:24px">${T("صفحه‌ای که دنبالش بودید پیدا نشد")}</h1><p class="muted">${T("ممکن است نشانی اشتباه باشد یا این صفحه جابه‌جا شده باشد.")}</p><div class="cta" style="justify-content:center"><a class="btn btn-red" href="#/">${T("بازگشت به صفحه اصلی")}</a><a class="btn" href="#/shop">${T("رفتن به فروشگاه")}</a></div></div>`}

/* ================= router ================= */
function parse(){const h=location.hash.replace(/^#\/?/,"");const [path,qs]=h.split("?");const seg=path.split("/").filter(Boolean).map(decodeURIComponent);const q={};new URLSearchParams(qs||"").forEach((v,k)=>q[k]=v);return{seg,q}}
let lastPath="";
const TITLES={home:"فروشگاه تخصصی تجهیزات شبکه",shop:"محصولات",deals:"پیشنهاد شگفت‌انگیز",stock:"کالای استوک",cart:"سبد خرید",checkout:"ثبت سفارش",compare:"مقایسه کالا",wishlist:"علاقه‌مندی‌ها",account:"حساب کاربری",blog:"مقالات",about:"درباره ما",contact:"تماس با ما",invoice:"پیش‌فاکتور رسمی",order:"سفارش ثبت شد"};
function render(){const {seg,q}=parse();const r=seg[0]||"home";const main=$("#main");let html,init,title=TITLES[r];
 switch(r){
  case"home":html=vHome();init=initHome;break;
  case"shop":case"deals":case"stock":html=vShop(r,q);init=()=>initShop(r,q);break;
  case"p":{const p=byId(seg[1]);html=vProduct(seg[1]);init=()=>initProduct(seg[1]);title=p?pname(p):null;break}
  case"cart":html=vCart();init=initCart;break;
  case"checkout":html=vCheckout();init=()=>{if(S.cart.length)coRender();else initCart()};break;
  case"order":html=vOrder(seg[1]);break;
  case"invoice":html=vInvoice(seg[1]);break;
  case"compare":html=vCompare();init=initCompare;break;
  case"wishlist":html=vWish();init=initWish;break;
  case"account":html=vAccount();init=initAccount;break;
  case"blog":if(seg[1]){const a=BLOG.find(x=>x.id===seg[1]);html=vArticle(seg[1]);init=initArticle;title=a?post(a).t:null}else html=vBlog();break;
  case"about":html=vAbout();break;
  case"contact":html=vContact();init=initContact;break;
  default:html=vNotFound();title=null}
 if(!html)html=vNotFound();
 main.innerHTML=`<div class="page-in">${html}</div>`;if(init)init();
 document.title=(title?(TITLES[r]===title?T(title):title)+" · ":"")+T("تارنور");
 const navKey=r==="p"?"shop":r;
 $$("[data-r]").forEach(a=>{const on=a.dataset.r===navKey;a.classList.toggle("on",on);if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
 const path=location.hash.split("?")[0];if(path!==lastPath){window.scrollTo(0,0);if(lastPath)main.focus({preventScroll:true})}lastPath=path;
 document.body.classList.toggle("dock-hide",r==="checkout"||r==="p");
 closeAll()}

/* ================= shell ================= */
function applyStatic(){const R=document.documentElement;R.lang=LANG;R.dir=LANGS[LANG].dir;
 $$("[data-t]").forEach(el=>{const s=el.getAttribute("data-t");el.innerHTML=T(s)});
 $$("[data-tp]").forEach(el=>el.setAttribute("placeholder",T(el.getAttribute("data-tp"))));
 $$("[data-ta]").forEach(el=>el.setAttribute("aria-label",T(el.getAttribute("data-ta"))));
 $$("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===LANG));
 $("#ftCats").innerHTML=CATS.map(c=>`<li><a href="#/shop?c=${c.id}">${esc(cname(c))}</a></li>`).join("");
 $("#drNav").innerHTML=[["#/","خانه","home","home"],["#/shop","محصولات","grid","shop"],["#/deals","پیشنهاد شگفت‌انگیز","tag","deals"],["#/stock","کالای استوک","box","stock"],["#/compare","مقایسه کالا","cmp","compare"],["#/wishlist","علاقه‌مندی‌ها","heart","wishlist"],["#/account","حساب کاربری","user","account"],["#/blog","مقالات","doc","blog"],["#/about","درباره ما","shield","about"],["#/contact","تماس با ما","phone","contact"]].map(([h,t,i,r])=>`<a href="${h}" data-r="${r}"><span class="ci-s">${IC[i]}</span>${T(t)}</a>`).join("");
 $("#drCats").innerHTML=CATS.map(c=>`<a href="#/shop?c=${c.id}"><span class="ci-s">${icon(c.id,18)}</span>${esc(cname(c))}</a>`).join("");
 $("#copy").textContent=`© ${LANG==="fa"?dg(1405):2026} · ${T("تارنور")} · ${T("همه حقوق محفوظ است")}`;
 document.querySelector('meta[name=description]').setAttribute("content",T("تارنور؛ فروشگاه تخصصی روتر، سوییچ، تجهیزات وایرلس، VoIP، مودم، کارت شبکه، پاورلاین و پرینت سرور با مشاوره کارشناس و پیش‌فاکتور رسمی."))}
function setLang(l){if(!LANGS[l]||l===LANG)return;LANG=l;store.set("lang",l);applyStatic();syncBadges();render()}
$$("[data-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));

/* drawer, sheets */
function openDrawer(){$("#drawer").classList.add("on");$("#drawer").setAttribute("aria-hidden","false");$("#scrim").classList.add("on");$("#menuBtn").setAttribute("aria-expanded","true");document.body.style.overflow="hidden";setTimeout(()=>$("#drawer [data-close]").focus(),50)}
function openSheet(sh){sh.classList.add("on");sh.setAttribute("aria-hidden","false");$("#scrim").classList.add("on");document.body.style.overflow="hidden";$$("[data-close]",sh).forEach(b=>b.onclick=closeAll)}
function closeAll(){if(typeof closeSearch==="function")closeSearch();$("#drawer").classList.remove("on");$("#drawer").setAttribute("aria-hidden","true");$("#fsheet").classList.remove("on");$("#fsheet").setAttribute("aria-hidden","true");$("#scrim").classList.remove("on");$("#menuBtn").setAttribute("aria-expanded","false");document.body.style.overflow="";$("#sugg").classList.remove("on")}
$("#menuBtn").onclick=openDrawer;$("#scrim").onclick=closeAll;$("#drawer [data-close]").onclick=closeAll;
$("#drawer").addEventListener("click",e=>{if(e.target.closest("a"))closeAll()});
$("#searchBtn").onclick=e=>{e.stopPropagation();if(innerWidth<=900){openDrawer();setTimeout(()=>$("#qm").focus(),80);return}const t=$("#top"),on=!t.classList.contains("s-open");t.classList.toggle("s-open",on);$("#searchBtn").setAttribute("aria-expanded",on);if(on)setTimeout(()=>$("#q").focus(),30);else $("#sugg").classList.remove("on")};
document.addEventListener("click",e=>{const t=$("#top");if(t.classList.contains("s-open")&&!e.target.closest(".search"))closeSearch()});
function closeSearch(){$("#top").classList.remove("s-open");$("#searchBtn").setAttribute("aria-expanded","false");$("#sugg").classList.remove("on")}
$("#qm").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.value.trim()){location.hash="#/shop?q="+encodeURIComponent(e.target.value.trim());e.target.value="";closeAll()}});

/* search suggestions */
const qi=$("#q"),sg=$("#sugg");let sIdx=-1;
function sugg(){const v=qi.value.trim();sIdx=-1;if(!v){sg.classList.remove("on");return}const n=norm(v);
 const r=P.filter(p=>norm(hay(p)).includes(n)).slice(0,6);const cs=CATS.filter(c=>norm(cname(c)).includes(n)||c.en.toLowerCase().includes(v.toLowerCase())).slice(0,2);
 sg.innerHTML=(cs.map(c=>`<a href="#/shop?c=${c.id}" role="option"><span class="th-s">${icon(c.id,22)}</span><span class="s-t">${esc(cname(c))}<small>${T("دسته‌بندی")}</small></span></a>`).join("")+r.map(p=>`<a href="#/p/${p.id}" role="option"><span class="th-s">${dev(p)}</span><span class="s-t">${esc(pname(p))}<small class="mono">${esc(p.m)}</small></span><span class="s-p">${p.pr?money(p.pr):""}</span></a>`).join(""))
  ||`<div class="s-none">${T("نتیجه‌ای پیدا نشد")}</div>`;
 sg.innerHTML+=`<a class="s-all" href="#/shop?q=${encodeURIComponent(v)}">${T("نمایش همه نتایج «{q}»",{q:esc(v)})}</a>`;sg.classList.add("on")}
qi.addEventListener("input",sugg);qi.addEventListener("focus",()=>{if(qi.value.trim())sugg()});
qi.addEventListener("keydown",e=>{const items=$$("a",sg);
 if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();if(!items.length)return;sIdx=(sIdx+(e.key==="ArrowDown"?1:-1)+items.length)%items.length;items.forEach((a,i)=>a.classList.toggle("act",i===sIdx));items[sIdx].scrollIntoView({block:"nearest"})}
 if(e.key==="Enter"){e.preventDefault();if(sIdx>-1&&items[sIdx]){location.hash=items[sIdx].getAttribute("href")}else if(qi.value.trim())location.hash="#/shop?q="+encodeURIComponent(qi.value.trim());qi.blur();sg.classList.remove("on")}
 if(e.key==="Escape"){sg.classList.remove("on");qi.blur()}});
qi.addEventListener("blur",()=>setTimeout(()=>sg.classList.remove("on"),160));
sg.addEventListener("mousedown",e=>e.preventDefault());
sg.addEventListener("click",e=>{if(e.target.closest("a")){sg.classList.remove("on");qi.value="";qi.blur()}});
document.addEventListener("keydown",e=>{if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();if(getComputedStyle($(".search")).display!=="none")qi.focus();else $("#searchBtn").click()}if(e.key==="Escape"){closeAll();$("#modal").classList.remove("on")}});

/* global actions */
function copyText(t,okMsg,el){const done=()=>toast(okMsg,{ok:1});
 const fallback=()=>{const ta=document.createElement("textarea");ta.value=t;ta.setAttribute("readonly","");ta.style.cssText="position:fixed;opacity:0;top:0";document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand("copy")}catch(e){}ta.remove();ok?done():toast(T("کپی نشد؛ متن را دستی انتخاب کنید"))};
 if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(done,fallback);else fallback()}
document.addEventListener("click",e=>{const a=e.target.closest("[data-act]");if(!a)return;const k=a.dataset.act,id=a.dataset.id;
 if(k==="add"){e.preventDefault();addToCart(id);a.classList.add("done");setTimeout(()=>a.classList.remove("done"),900)}
 else if(k==="wish"){e.preventDefault();toggleWish(id);if(parse().seg[0]==="wishlist")render()}
 else if(k==="cmp"){e.preventDefault();toggleCmp(id);if(parse().seg[0]==="compare")render()}
 else if(k==="copyPhone")copyText(PHONE,T("شماره کپی شد"));
 else if(k==="copyModel")copyText(a.dataset.m,T("کد مدل کپی شد"));
 else if(k==="copyLink")copyText(location.href,T("لینک کپی شد"));
 else if(k==="copyInv")copyText($("#paper").innerText,T("متن پیش‌فاکتور کپی شد"));
 else if(k==="print"){try{window.print()}catch(err){toast(T("چاپ در این محیط در دسترس نیست؛ از کپی متن استفاده کنید"))}}
 else if(k==="logout"){S.user=null;save("user");acTab="dash";toast(T("از حساب خارج شدید"));render()}});
$("#newsForm").onsubmit=e=>{e.preventDefault();const i=e.target.querySelector("input");if(!/^\S+@\S+\.\S+$/.test(i.value)){toast(T("ایمیل معتبر نیست"));i.focus();return}e.target.reset();toast(T("عضویت شما در خبرنامه ثبت شد"),{ok:1})};
const tp=$("#totop");tp.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
let sT=0;window.addEventListener("scroll",()=>{if(sT)return;sT=requestAnimationFrame(()=>{tp.classList.toggle("on",scrollY>900);sT=0})},{passive:true});
window.addEventListener("storage",e=>{if(e.key&&e.key.startsWith("tn3_")){const k=e.key.slice(4);if(k in S){S[k]=store.get(k,S[k]);syncBadges()}}});
window.addEventListener("hashchange",render);

applyStatic();syncBadges();render();
