const { chromium, devices } = require("playwright");
const PAGES=(process.env.PAGES||"verbos,,hoy,progreso,ajustes,curso,practicar,biblioteca,a1,a1-u1,repaso,repaso-a1,errores,nivel,escuchar,leer,reading-b1-01,escritura,escritura-a1-1,gramatica,guias,guia-ser-estar,palabras,palabra-casa,examenes,a1-examenes,a1-examen-1,recursos,drill,verbo-1,g-presente,a1-cards,a1-vocab").split(",");
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({...devices["Pixel 7"],serviceWorkers:"block"})).newPage();
const tot={touch:0,wrap:0,overlap:0,overflow:0};
for(const h of PAGES){await p.goto("http://localhost:8766/#"+h);await p.waitForTimeout(1100);
 const r=await p.evaluate(()=>{
  const vis=(e)=>{const s=getComputedStyle(e);if(s.display==="none"||s.visibility==="hidden"||+s.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
  const fixed=(e)=>{for(let x=e;x&&x!==document.body;x=x.parentElement){const p=getComputedStyle(x).position;if(p==="fixed"||p==="sticky")return true;}return false;};
  const name=(e)=>e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+(typeof e.className==="string"&&e.className?"."+e.className.trim().split(/\s+/).slice(0,2).join("."):"")+" «"+(e.innerText||"").trim().slice(0,22).replace(/\n/g," ")+"»";
  const out={touch:[],wrap:[],overlap:[],overflow:[]};
  const app=document.getElementById("app");
  // UI blocks: controls and boxed things (cards, callouts, inputs, buttons)
  const boxed=(e)=>{const s=getComputedStyle(e);return e.matches("input,button,select,textarea,.btn,a.btn")||((s.borderTopStyle!=="none"&&s.borderTopWidth!=="0px")||(s.backgroundColor!=="rgba(0, 0, 0, 0)"&&s.backgroundColor!=="transparent"))&&(s.borderRadius!=="0px");};
  const blocks=[...app.querySelectorAll("*")].filter((e)=>!e.closest("svg")&&!e.closest("details:not([open]) > :not(summary)")&&!e.closest(".pcal")&&vis(e)&&!fixed(e)&&boxed(e)&&!e.matches("td,th,tr,tbody,table,span.w,i,b,strong,em,ins,del,mark,.sent")).map((e)=>({e,r:e.getBoundingClientRect()})).filter((x)=>x.r.height<600);
  for(const A of blocks)for(const C of blocks){if(A===C||A.e.contains(C.e)||C.e.contains(A.e))continue;const oh=Math.min(A.r.right,C.r.right)-Math.max(A.r.left,C.r.left);if(oh<20)continue;const g=C.r.top-A.r.bottom;
    if(g>=-1&&g<6){ // nothing else in between
      out.touch.push(name(A.e)+" ⟂ "+name(C.e)+" gap "+Math.round(g)); }
    else if(g<-1&&C.r.top>A.r.top+2&&C.r.top<A.r.bottom-2&&oh>8&&Math.min(A.r.right,C.r.right)-Math.max(A.r.left,C.r.left)>8){ out.overlap.push(name(A.e)+" ∩ "+name(C.e)); } }
  // wrapped rows of controls touching vertically
  app.querySelectorAll("*").forEach((el)=>{const s=getComputedStyle(el);if(!(s.display.includes("flex")&&s.flexWrap==="wrap"))return;const k=[...el.children].filter((x)=>vis(x)&&boxed(x));if(k.length<2)return;
   const R=k.map(x=>x.getBoundingClientRect()).sort((a,b)=>a.top-b.top);const lines=[];R.forEach(r=>{const L=lines.find(l=>r.top<l.bottom-4&&r.bottom>l.top+4);if(L){L.top=Math.min(L.top,r.top);L.bottom=Math.max(L.bottom,r.bottom);}else lines.push({top:r.top,bottom:r.bottom});});
   lines.sort((a,b)=>a.top-b.top);for(let i=1;i<lines.length;i++){const g=lines[i].top-lines[i-1].bottom;if(g<6){out.wrap.push(name(el)+" row gap "+Math.round(g));break;}} });
  // 3) horizontal overflow
  if(document.documentElement.scrollWidth>innerWidth+1) out.overflow.push("page "+document.documentElement.scrollWidth);
  return out;});
 const n=r.touch.length+r.wrap.length+r.overlap.length+r.overflow.length; Object.keys(tot).forEach(k=>tot[k]+=r[k].length);
 if(n) console.log("## "+(h||"home")+"\n"+[...r.touch.slice(0,6).map(x=>"  touch: "+x),...r.wrap.slice(0,6).map(x=>"  wrap: "+x),...r.overlap.slice(0,6).map(x=>"  overlap: "+x),...r.overflow.map(x=>"  overflow: "+x)].join("\n"));
}
console.log("TOTAL",JSON.stringify(tot));await b.close();})();
