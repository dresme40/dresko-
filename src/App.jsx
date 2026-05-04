import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN SYSTEM — BLANC ÉDITORIAL PREMIUM ─────────────────────────────────
const T = {
  white:  "#FFFFFF",
  paper:  "#FAFAFA",
  ghost:  "#F5F5F5",
  light:  "#EEEEEE",
  line:   "#E8E8E8",
  black:  "#0A0A0A",
  ink:    "#1A1A1A",
  dark:   "#2A2A2A",
  mid:    "#666666",
  soft:   "#999999",
  pale:   "#BBBBBB",
  ultra:  "#DDDDDD",
  sage:   "#2D7A4F",
  red:    "#C03030",
};

const CATS = [
  { id:"hauts",       label:"Hauts",      short:"H", emoji:"👕" },
  { id:"bas",         label:"Bas",         short:"B", emoji:"👖" },
  { id:"chaussures",  label:"Chaussures",  short:"C", emoji:"👟" },
  { id:"vestes",      label:"Vestes",      short:"V", emoji:"🧥" },
  { id:"accessoires", label:"Accessoires", short:"A", emoji:"⌚" },
];

const USER_STYLES = [
  { id:"casual-chic",  label:"Casual Chic",   desc:"Élégant au quotidien",      icon:"✦", color:"#1A1A1A",
    rules:"1 pièce habillée minimum, max 3 couleurs, tons neutres",
    tendances:"Blazer lin, chino, chemise oxford, mocassins, caramel/navy" },
  { id:"streetwear",   label:"Streetwear",     desc:"Urban et moderne",           icon:"◈", color:"#1A1A1A",
    rules:"Superpositions, sneakers comme pièce star, logos discrets",
    tendances:"Cargo, hoodie premium, sneakers tech, colorblocking neutre" },
  { id:"minimaliste",  label:"Minimaliste",    desc:"Épuré et intemporel",        icon:"○", color:"#1A1A1A",
    rules:"2 couleurs max, zéro logo, coupes parfaites",
    tendances:"Total look, matières naturelles, blanc/beige/noir" },
  { id:"business",     label:"Business",       desc:"Professionnel et raffiné",   icon:"◆", color:"#1A1A1A",
    rules:"Blazer ou costume obligatoire, chaussures de ville",
    tendances:"Costume déstructuré, chemise premium, derbies, montre" },
  { id:"smart-casual", label:"Smart Casual",   desc:"Entre élégance et décontraction", icon:"◐", color:"#1A1A1A",
    rules:"1 pièce habillée + 1 décontractée, équilibre toujours",
    tendances:"Jean + blazer, polo maille, chino + sneakers propres" },
  { id:"outdoor",      label:"Outdoor",        desc:"Actif et fonctionnel",       icon:"●", color:"#1A1A1A",
    rules:"Matières techniques, fonctionnalité prioritaire",
    tendances:"Gorpcore, vestes techniques, trail sneakers, fleece" },
];

const BRANDS_LIST = [
  { id:"zara",     label:"Zara",      cat:"mid"     },
  { id:"uniqlo",   label:"Uniqlo",    cat:"mid"     },
  { id:"hm",       label:"H&M",       cat:"mid"     },
  { id:"cos",      label:"COS",       cat:"mid"     },
  { id:"sandro",   label:"Sandro",    cat:"premium" },
  { id:"ami",      label:"Ami Paris", cat:"premium" },
  { id:"apc",      label:"A.P.C.",    cat:"premium" },
  { id:"arket",    label:"Arket",     cat:"mid"     },
  { id:"nike",     label:"Nike",      cat:"sport"   },
  { id:"adidas",   label:"Adidas",    cat:"sport"   },
  { id:"nb",       label:"New Balance",cat:"sport"  },
  { id:"mango",    label:"Mango",     cat:"mid"     },
  { id:"asos",     label:"ASOS",      cat:"mid"     },
  { id:"jacquemus",label:"Jacquemus", cat:"premium" },
];

const OCCASIONS   = ["Quotidien","Travail","Casual chic","Soirée","Weekend","Sport","Voyage"];
const DAY_OCC     = {1:"Travail",2:"Travail",3:"Travail",4:"Travail",5:"Casual chic",6:"Weekend",0:"Quotidien"};
const BUDGET_OPTS = ["Moins de 100€","100€ — 200€","200€ — 400€","400€ et plus"];
const METEOS_LIST = [
  {id:"hot",  label:"Chaud",  icon:"☀️",  temp:"25°+"},
  {id:"mild", label:"Doux",   icon:"🌤️", temp:"18–24°"},
  {id:"cool", label:"Frais",  icon:"🌥️", temp:"10–17°"},
  {id:"cold", label:"Froid",  icon:"❄️",  temp:"0–9°"},
  {id:"rain", label:"Pluie",  icon:"🌧️", temp:"—"},
];

const LEVELS = [
  {min:0,   label:"Novice",   mark:"○"},
  {min:50,  label:"Casual",   mark:"◐"},
  {min:150, label:"Stylé",    mark:"●"},
  {min:300, label:"Trendy",   mark:"◈"},
  {min:500, label:"Iconique", mark:"◆"},
  {min:800, label:"Légende",  mark:"★"},
];

const ACTIONS = {
  scan:{pts:15,msg:"+15"}, generate:{pts:5,msg:"+5"},
  like:{pts:8,msg:"+8"},   worn:{pts:10,msg:"+10"},
  analyse:{pts:20,msg:"+20"}, share:{pts:12,msg:"+12"},
};

const getLevel = s => [...LEVELS].reverse().find(l=>s>=l.min)||LEVELS[0];
const getNext  = s => LEVELS.find(l=>l.min>s)||null;

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},
};

const toB64 = f => new Promise((res,rej)=>{
  const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);
});

async function compressImage(file,maxPx=1200,quality=0.82){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,maxPx/Math.max(img.width,img.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.round(img.width*scale);
      canvas.height=Math.round(img.height*scale);
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>{
        const reader=new FileReader();
        reader.onload=()=>res(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
      },"image/jpeg",quality);
    };
    img.src=URL.createObjectURL(file);
  });
}

// ─── INDEXEDDB ────────────────────────────────────────────────────────────────
const IDB={
  db:null,
  open(){
    return new Promise((res,rej)=>{
      if(this.db) return res(this.db);
      const req=indexedDB.open("dresko_db",1);
      req.onupgradeneeded=e=>e.target.result.createObjectStore("imgs",{keyPath:"id"});
      req.onsuccess=e=>{this.db=e.target.result;res(this.db);};
      req.onerror=()=>rej(req.error);
    });
  },
  async save(id,b64,mime="image/jpeg"){const db=await this.open();return new Promise((res,rej)=>{const req=db.transaction("imgs","readwrite").objectStore("imgs").put({id,b64,mime});req.onsuccess=()=>res();req.onerror=()=>rej(req.error);});},
  async get(id){const db=await this.open();return new Promise(res=>{const req=db.transaction("imgs","readonly").objectStore("imgs").get(id);req.onsuccess=()=>res(req.result||null);req.onerror=()=>res(null);});},
  async del(id){const db=await this.open();return new Promise(res=>{const req=db.transaction("imgs","readwrite").objectStore("imgs").delete(id);req.onsuccess=()=>res();req.onerror=()=>res();});},
  async all(){const db=await this.open();return new Promise(res=>{const req=db.transaction("imgs","readonly").objectStore("imgs").getAll();req.onsuccess=()=>res(req.result||[]);req.onerror=()=>res([]);});},
  async isAvailable(){try{await this.open();return true;}catch(e){return false;}},
};

// ─── WEATHER ──────────────────────────────────────────────────────────────────
async function fetchWeather(lat,lon){
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&timezone=auto`);
  const d=await r.json();
  const t=d.current?.temperature_2m??15,p=d.current?.precipitation??0;
  if(p>0.5) return {id:"rain",label:"Pluvieux",icon:"🌧️",temp:`${Math.round(t)}°`};
  if(t>=25)  return {id:"hot", label:"Chaud",   icon:"☀️", temp:`${Math.round(t)}°`};
  if(t>=18)  return {id:"mild",label:"Doux",    icon:"🌤️",temp:`${Math.round(t)}°`};
  if(t>=10)  return {id:"cool",label:"Frais",   icon:"🌥️",temp:`${Math.round(t)}°`};
  return           {id:"cold",label:"Froid",   icon:"❄️", temp:`${Math.round(t)}°`};
}

// ─── MATCHING ENGINE ──────────────────────────────────────────────────────────
function findPiece(wardrobe,pName,pId){
  if(pId){const byId=wardrobe.find(p=>p.id===pId);if(byId) return byId;}
  const n=pName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const exact=wardrobe.find(p=>p.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")===n);
  if(exact) return exact;
  const stop=new Set(["le","la","les","un","une","des","de","du","en","et","ou"]);
  const tokens=n.split(" ").filter(w=>w.length>2&&!stop.has(w));
  const scored=wardrobe.map(p=>{
    const pt=p.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(" ").filter(w=>w.length>2&&!stop.has(w));
    return{p,score:tokens.filter(t=>pt.includes(t)).length};
  }).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score);
  if(scored.length) return scored[0].p;
  const catMap={jean:"bas",chino:"bas",pantalon:"bas",short:"bas",chemise:"hauts",tshirt:"hauts",pull:"hauts",polo:"hauts",sweat:"hauts",blazer:"vestes",veste:"vestes",manteau:"vestes",sneaker:"chaussures",boot:"chaussures",mocassin:"chaussures",montre:"accessoires",ceinture:"accessoires"};
  const colMap={blanc:"blanc",blanche:"blanc",noir:"noir",gris:"gris",bleu:"bleu",navy:"bleu",beige:"beige",camel:"camel",kaki:"kaki",vert:"vert",marron:"marron"};
  let cat=null,col=null;
  for(const[kw,c] of Object.entries(catMap)) if(n.includes(kw)){cat=c;break;}
  for(const[kw,c] of Object.entries(colMap)) if(n.includes(kw)){col=c;break;}
  if(cat&&col){const r=wardrobe.find(p=>p.categorie===cat&&p.couleur?.toLowerCase().includes(col));if(r) return r;}
  if(cat) return wardrobe.find(p=>p.categorie===cat)||null;
  return wardrobe.find(p=>tokens.some(t=>p.nom.toLowerCase().includes(t)))||null;
}

const normTitle = s => s?s.charAt(0).toUpperCase()+s.slice(1).toLowerCase():s;
const cleanPiece = ({imageB64,imageMime,...rest})=>rest;

// ─── TENDANCES ────────────────────────────────────────────────────────────────
const TRENDS=`Tendances SS26: Preppy core, Quiet luxury, tons caramel/terracotta/taupe, lin essentiel, looks monochromes, pantalon ample, blazer lin, mocassins. Éviter slim excessif et couleurs saturées.`;

// ─── AI ───────────────────────────────────────────────────────────────────────
async function callAI(body,retries=3){
  for(let i=0;i<retries;i++){
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await r.json();
      const txt=d.content?.find(b=>b.type==="text")?.text||"{}";
      return JSON.parse(txt.replace(/```json|```/g,"").trim());
    }catch(e){
      if(i===retries-1) throw e;
      await new Promise(r=>setTimeout(r,800*(i+1)));
    }
  }
}

async function analyzePhoto(b64){
  return callAI({model:"claude-sonnet-4-20250514",max_tokens:1000,
    system:`Styliste expert mode MASCULINE 2026. Analyse UNIQUEMENT vêtements homme. Catégories: hauts, bas, chaussures, vestes, accessoires. ${TRENDS} Retourne JSON sans markdown: {"nom":"Chemise oxford blanche","categorie":"hauts","couleur":"blanc","couleurs":["blanc"],"style":"smart casual","saisons":["printemps","automne"],"occasions":["Travail","Casual chic"],"matiere":"coton","fit":"regular","description":"Chemise classique tendance 2026","tags":["essentiel"],"score_casual_chic":8,"tendance_2026":true,"prix_estime_min":30,"prix_estime_max":80}`,
    messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},{type:"text",text:"Analyse ce vêtement masculin."}]}]
  });
}

async function genOutfits(wardrobe,meteo,occ,prefs,wH,profile){
  const style=USER_STYLES.find(s=>s.id===profile.selectedStyle)||USER_STYLES[0];
  const liked=(prefs.liked||[]).slice(-10).join(", ")||"aucun";
  const disliked=(prefs.disliked||[]).slice(-10).join(", ")||"aucun";
  const unused=wardrobe.filter(p=>!wH[p.id]).map(p=>p.nom).join(", ")||"aucun";
  const items=wardrobe.map(p=>`- [${p.id}] ${p.nom} [${p.categorie}] couleur:${p.couleur} fit:${p.fit||"regular"}${p.tendance_2026?" ★":""}`).join("\n");
  const sysMsg=`Styliste homme expert ${style.label} 2026. Règles: ${style.rules}. ${TRENDS} Titres en minuscules élégantes. JSON uniquement.`;
  const userMsg=`Dressing:\n${items}\nMétéo: ${meteo.label} ${meteo.temp}\nOccasion: ${occ}\nStyle: ${style.label}\nMarques: ${(profile.brands||[]).join(", ")}\nBudget: ${profile.budget||"100€-200€"}\nAimées: ${liked}\nNon aimées: ${disliked}\nPeu portées: ${unused}\n\nGénère 3 tenues ${style.label} (casual→chic). JSON:\n{"tenues":[{"titre":"nom élégant","niveau":"casual","pieces":["nom exact p1","nom exact p2","nom exact p3"],"description":"2 phrases","conseil":"1 conseil actionnable","badge":"${style.label} SS26"}],"conseil_meteo":"conseil","piece_star":"pièce"}`;
  const result=await callAI({model:"claude-sonnet-4-20250514",max_tokens:1800,system:sysMsg,messages:[{role:"user",content:userMsg}]});
  if(result?.tenues) result.tenues=result.tenues.map(t=>({...t,titre:normTitle(t.titre)}));
  return result;
}

async function genInspiration(profile,meteo,occ){
  const style=USER_STYLES.find(s=>s.id===profile.selectedStyle)||USER_STYLES[0];
  const sysMsg=`Styliste mode masculine expert ${style.label} 2026. ${TRENDS} JSON uniquement.`;
  const userMsg=`Style: ${style.label}\nMarques: ${(profile.brands||[]).join(", ")}\nBudget: ${profile.budget||"100€-200€"}\nMétéo: ${meteo.label} ${meteo.temp}\nOccasion: ${occ}\n\nGénère 3 looks inspirationnels achetables dans ces marques. JSON:\n{"looks":[{"titre":"nom élégant","style":"${style.label}","pieces":[{"nom":"nom produit","marque":"marque","categorie":"hauts","couleur":"blanc","prix_estime":39}],"budget_total":165,"description":"description","conseil":"conseil"}]}`;
  return callAI({model:"claude-sonnet-4-20250514",max_tokens:1800,system:sysMsg,messages:[{role:"user",content:userMsg}]});
}

async function analyzeWardrobe(wardrobe,wH,profile){
  const style=USER_STYLES.find(s=>s.id===profile.selectedStyle)||USER_STYLES[0];
  const summary={total:wardrobe.length,parCat:CATS.map(c=>({cat:c.label,count:wardrobe.filter(p=>p.categorie===c.id).length})),items:wardrobe.map(p=>`${p.nom} (${p.categorie}, ${p.couleur}, ${wH[p.id]||0}x${p.tendance_2026?", ★":""})`),jamaisPortes:wardrobe.filter(p=>!wH[p.id]).map(p=>p.nom)};
  const sysMsg=`Styliste consultant homme expert ${style.label} 2026. ${TRENDS} JSON uniquement.`;
  const userMsg=`Style cible: ${style.label}\nMarques: ${(profile.brands||[]).join(", ")}\nBudget: ${profile.budget}\n\nDressing:\n${JSON.stringify(summary,null,2)}\n\nJSON:\n{"score_global":7,"score_tendance":6,"resume":"2 phrases","forces":["f1","f2"],"manques":["m1","m2"],"tendances_fortes":["p1"],"tendances_faibles":["p2"],"conseil_tendance":"conseil","pieces_sous_utilisees":[{"nom":"p","conseil":"c"}],"combos":[{"pieces":["p1","p2","p3"],"description":"d"}],"achats":[{"piece":"p","raison":"r","marque":"Zara","tenues":5,"budget":"50-100€","priorite":"essentiel","tendance_2026":true}],"conseil":"conseil global"}`;
  return callAI({model:"claude-sonnet-4-20250514",max_tokens:1800,system:sysMsg,messages:[{role:"user",content:userMsg}]});
}

// ─── FLAT LAY COMPONENT ───────────────────────────────────────────────────────
function FlatLayCard({pieces,wardrobe,style}){
  const [imgs,setImgs]=useState({});
  useEffect(()=>{
    pieces.forEach(async pName=>{
      const piece=findPiece(wardrobe,pName);
      if(!piece) return;
      const img=await IDB.get(piece.id);
      if(img) setImgs(prev=>({...prev,[piece.id]:`data:${img.mime};base64,${img.b64}`}));
    });
  },[pieces,wardrobe]);

  const resolved=pieces.map(pName=>({name:pName,piece:findPiece(wardrobe,pName)})).filter(x=>x.piece);
  const hasImages=resolved.some(x=>imgs[x.piece.id]);

  if(!hasImages){
    return(
      <div style={{width:"100%",height:280,background:T.ghost,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",gap:16}}>
          {resolved.map((_,i)=>(
            <div key={i} style={{width:70,height:90,background:T.light,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:24,opacity:0.3}}>👔</span>
            </div>
          ))}
        </div>
        <span style={{fontSize:10,color:T.pale,letterSpacing:"0.1em",fontFamily:"'Courier New',monospace"}}>COMPOSITION</span>
      </div>
    );
  }

  // Layout flat lay éditorial — disposition verticale centrée
  return(
    <div style={{width:"100%",background:T.ghost,padding:"20px 0 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,position:"relative",minHeight:280}}>
      {/* Ligne décorative style magazine */}
      <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:1,height:"100%",background:T.line,opacity:0.5,zIndex:0}}/>

      {resolved.slice(0,3).map((item,i)=>{
        const src=imgs[item.piece.id];
        const cat=CATS.find(c=>c.id===item.piece.categorie);
        // Tailles alternées pour l'effet éditorial
        const sizes=[{w:120,h:140},{w:100,h:80},{w:90,h:70}];
        const sz=sizes[i]||sizes[2];
        return(
          <div key={i} style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,marginBottom:i<resolved.length-1?4:0}}>
            {/* Pièce */}
            <div style={{width:sz.w,height:sz.h,background:T.white,border:`1px solid ${T.line}`,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {src?(
                <img src={src} alt={item.piece.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              ):(
                <span style={{fontSize:sz.h>100?28:20,opacity:0.2}}>{cat?.emoji||"👔"}</span>
              )}
              {/* Badge tendance */}
              {item.piece.tendance_2026&&(
                <div style={{position:"absolute",top:5,right:5,background:T.black,color:T.white,fontSize:7,fontFamily:"'Courier New',monospace",padding:"1px 5px",letterSpacing:"0.06em"}}>★</div>
              )}
            </div>
            {/* Nom de la pièce */}
            <span style={{fontSize:9,color:T.mid,fontFamily:"'Courier New',monospace",letterSpacing:"0.08em",textTransform:"uppercase",textAlign:"center",maxWidth:sz.w}}>{item.name.length>22?item.name.slice(0,22)+"…":item.name}</span>
            {/* Séparateur entre pièces */}
            {i<resolved.length-1&&(
              <div style={{width:1,height:12,background:T.pale}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Micro=({children,color=T.soft,size=9,upper=true,bold})=>(
  <span style={{fontFamily:"'Courier New',monospace",fontSize:size,color,letterSpacing:upper?"0.12em":"0.04em",textTransform:upper?"uppercase":"none",fontWeight:bold?700:400}}>{children}</span>
);

const Tag=({label,dark,small})=>(
  <span style={{fontFamily:"'Courier New',monospace",fontSize:small?8:9,letterSpacing:"0.06em",textTransform:"uppercase",color:dark?T.white:T.mid,background:dark?T.black:"transparent",border:`1px solid ${dark?T.black:T.line}`,padding:small?"2px 7px":"3px 10px",whiteSpace:"nowrap"}}>
    {label}
  </span>
);

const Spin=({size=16,dark})=>(
  <div style={{width:size,height:size,border:`1.5px solid ${dark?T.line:T.ultra}`,borderTopColor:dark?T.black:T.white,borderRadius:"50%",animation:"spin 0.85s linear infinite",flexShrink:0}}/>
);

const Bar=({value,max,h=1,color=T.black})=>(
  <div style={{background:T.light,height:h}}>
    <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,transition:"width 0.7s cubic-bezier(0.16,1,0.3,1)"}}/>
  </div>
);

const HR=({label,my=24})=>(
  <div style={{display:"flex",alignItems:"center",gap:16,margin:`${my}px 0`}}>
    <div style={{flex:1,height:1,background:T.line}}/>
    {label&&<Micro color={T.pale} size={8}>{label}</Micro>}
    <div style={{flex:1,height:1,background:T.line}}/>
  </div>
);

function PieceImg({id,style,placeholder}){
  const[src,setSrc]=useState(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{IDB.get(id).then(img=>{if(img)setSrc(`data:${img.mime};base64,${img.b64}`);setLoading(false);});},[id]);
  if(loading) return <div style={{...style,background:T.ghost,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:16,height:16,border:`1px solid ${T.line}`,borderTopColor:T.soft,borderRadius:"50%",animation:"spin 0.85s linear infinite"}}/></div>;
  if(!src) return <div style={{...style,background:T.ghost,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:typeof style?.height==="number"&&style.height>80?28:16,opacity:0.2}}>{placeholder||"👔"}</span></div>;
  return <img src={src} alt="" style={style}/>;
}

function Confetti({on}){
  if(!on) return null;
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"}}>
      {Array.from({length:18},(_,i)=>({x:Math.random()*100,d:Math.random()*0.5,s:2+Math.random()*4,c:i%4===0?T.black:i%4===1?T.soft:i%4===2?T.pale:T.light})).map((p,i)=>(
        <div key={i} style={{position:"absolute",left:`${p.x}%`,top:-6,width:p.s,height:p.s*1.8,background:p.c,animation:`fall 1.4s ${p.d}s linear forwards`}}/>
      ))}
    </div>
  );
}

function Toast({msg}){
  if(!msg) return null;
  return(
    <div style={{position:"fixed",top:64,left:"50%",transform:"translateX(-50%)",zIndex:500,background:T.black,color:T.white,padding:"7px 18px",animation:"toastSlide 2.5s ease forwards",whiteSpace:"nowrap"}}>
      <Micro color={T.white} size={9}>{msg}</Micro>
    </div>
  );
}

const BtnPrimary=({children,onClick,disabled,loading,sm})=>(
  <button onClick={onClick} disabled={disabled||loading} style={{width:"100%",background:disabled||loading?T.light:T.black,color:disabled||loading?T.soft:T.white,border:"none",padding:sm?"13px 20px":"17px 24px",fontSize:10,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",cursor:disabled||loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,transition:"opacity 0.2s",fontWeight:600,opacity:disabled?0.5:1}}
    onMouseEnter={e=>{if(!disabled&&!loading)e.currentTarget.style.opacity="0.85";}}
    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
    {children}
  </button>
);

const BtnGhost=({children,onClick,full,sm})=>(
  <button onClick={onClick} style={{width:full?"100%":"auto",background:"transparent",border:`1px solid ${T.line}`,color:T.mid,padding:sm?"10px 16px":"14px 20px",fontSize:9,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",cursor:"pointer",transition:"all 0.2s"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.dark;e.currentTarget.style.color=T.dark;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.color=T.mid;}}>
    {children}
  </button>
);

// ─── SWIPE CARD ───────────────────────────────────────────────────────────────
function SwipeCard({tenue,wardrobe,wH,onLike,onDislike,onWorn,isTop,wornDone}){
  const[drag,setDrag]=useState({x:0,dragging:false});
  const[gone,setGone]=useState(null);
  const ref=useRef(null);

  const start=cx=>{ref.current=cx;setDrag({x:0,dragging:true});};
  const move=cx=>{if(!drag.dragging||!ref.current) return;setDrag(d=>({...d,x:cx-ref.current}));};
  const end=()=>{
    if(!drag.dragging) return;
    if(drag.x>110){setGone("r");setTimeout(()=>onLike(tenue),360);}
    else if(drag.x<-110){setGone("l");setTimeout(()=>onDislike(tenue),360);}
    else setDrag({x:0,dragging:false});
    ref.current=null;
  };

  const tx=gone==="r"?600:gone==="l"?-600:drag.x;
  const rot=drag.x*0.04;
  const likeOp=Math.min(Math.max(drag.x/110,0),1);
  const passOp=Math.min(Math.max(-drag.x/110,0),1);

  return(
    <div
      onMouseDown={e=>start(e.clientX)} onMouseMove={e=>drag.dragging&&move(e.clientX)} onMouseUp={end} onMouseLeave={end}
      onTouchStart={e=>start(e.touches[0].clientX)} onTouchMove={e=>{e.preventDefault();move(e.touches[0].clientX);}} onTouchEnd={end}
      style={{position:"absolute",width:"100%",transform:`translateX(${tx}px) rotate(${rot}deg)`,opacity:gone?0:1,transition:drag.dragging?"none":"all 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",cursor:drag.dragging?"grabbing":"grab",userSelect:"none",zIndex:isTop?10:5}}
    >
      <div style={{background:T.white,border:`1px solid ${T.line}`,boxShadow:"0 8px 48px rgba(0,0,0,0.1)"}}>

        {/* LIKE / PASS */}
        <div style={{position:"absolute",top:18,left:16,zIndex:20,opacity:likeOp,border:`2px solid ${T.black}`,padding:"3px 10px",background:"rgba(255,255,255,0.9)",pointerEvents:"none"}}>
          <Micro color={T.black} size={10} bold>Like</Micro>
        </div>
        <div style={{position:"absolute",top:18,right:16,zIndex:20,opacity:passOp,border:`2px solid ${T.mid}`,padding:"3px 10px",background:"rgba(255,255,255,0.9)",pointerEvents:"none"}}>
          <Micro color={T.mid} size={10} bold>Pass</Micro>
        </div>

        {/* FLAT LAY ÉDITORIAL — Le cœur visuel */}
        <div style={{position:"relative",overflow:"hidden"}}>
          <FlatLayCard pieces={tenue.pieces||[]} wardrobe={wardrobe} style={tenue.niveau}/>
          {/* Overlay gradient bottom */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent, rgba(255,255,255,0.95))",pointerEvents:"none"}}/>
        </div>

        {/* Header info */}
        <div style={{padding:"10px 20px 8px",borderBottom:`1px solid ${T.line}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <Micro color={T.soft} size={8}>{tenue.niveau?.toUpperCase()}</Micro>
            {tenue.badge&&<Micro color={T.pale} size={7}>{tenue.badge}</Micro>}
          </div>
          <div style={{fontSize:20,fontWeight:800,color:T.black,letterSpacing:"-0.02em",lineHeight:1.1}}>{tenue.titre}</div>
        </div>

        {/* Description + conseil */}
        <div style={{padding:"12px 20px",background:T.paper,borderBottom:`1px solid ${T.line}`}}>
          <p style={{color:T.mid,fontSize:12,lineHeight:1.75,margin:"0 0 8px"}}>{tenue.description}</p>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <Micro color={T.pale} size={7}>Conseil</Micro>
            <span style={{color:T.soft,fontSize:11,lineHeight:1.6}}>{tenue.conseil}</span>
          </div>
        </div>

        {/* Bouton porté */}
        <div style={{padding:"14px 20px"}}>
          <button onClick={e=>{e.stopPropagation();onWorn(tenue);}}
            style={{width:"100%",background:wornDone?T.black:"transparent",border:`1px solid ${wornDone?T.black:T.line}`,color:wornDone?T.white:T.mid,padding:"12px",fontSize:9,fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",cursor:"pointer",transition:"all 0.3s"}}
            onMouseEnter={e=>{if(!wornDone){e.currentTarget.style.background=T.black;e.currentTarget.style.color=T.white;e.currentTarget.style.borderColor=T.black;}}}
            onMouseLeave={e=>{if(!wornDone){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.mid;e.currentTarget.style.borderColor=T.line;}}}>
            {wornDone?"✓ Enregistré":"✓ j'ai porté cette tenue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({tab,setTab}){
  const items=[
    {id:"today",    n:"01", label:"Aujourd'hui"},
    {id:"style",    n:"02", label:"Style"},
    {id:"shop",     n:"03", label:"Shop"},
    {id:"dressing", n:"04", label:"Dressing"},
    {id:"profil",   n:"05", label:"Profil"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.white,borderTop:`1px solid ${T.line}`,display:"flex",zIndex:200}}>
      {items.map(n=>{
        const a=tab===n.id;
        return(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,background:"none",border:"none",padding:"12px 0 20px",cursor:"pointer",borderTop:`2px solid ${a?T.black:"transparent"}`,transition:"border-color 0.2s"}}>
            <Micro color={a?T.black:T.soft} size={7} bold={a}>{n.n}</Micro>
            <div style={{fontSize:8,color:a?T.black:T.soft,letterSpacing:"0.02em",marginTop:3,fontWeight:a?600:400}}>{n.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({onDone}){
  const[step,setStep]=useState(0);
  const[vis,setVis]=useState(true);
  const[selectedStyles,setSelectedStyles]=useState([]);
  const[selectedBrands,setSelectedBrands]=useState([]);
  const[budget,setBudget]=useState("");
  const[err,setErr]=useState("");

  const go=n=>{setErr("");setVis(false);setTimeout(()=>{setStep(n);setVis(true);},220);};

  const toggleStyle=id=>setSelectedStyles(prev=>prev.includes(id)?prev.filter(s=>s!==id):[...prev,id]);
  const toggleBrand=id=>setSelectedBrands(prev=>prev.includes(id)?prev.filter(b=>b!==id):[...prev,id]);

  const next=()=>{
    if(step===1&&selectedStyles.length===0){setErr("Sélectionne au moins un style");return;}
    if(step===2&&selectedBrands.length<2){setErr("Sélectionne au moins 2 marques");return;}
    if(step===3&&!budget){setErr("Choisis ton budget");return;}
    if(step<4) go(step+1);
    else{
      LS.set("dresko_profile",{styles:selectedStyles,selectedStyle:selectedStyles[0],brands:selectedBrands,budget});
      onDone("scanner");
    }
  };

  const GLOBAL_CSS=`
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
    @keyframes toastSlide{0%{opacity:0;transform:translateX(-50%) translateY(-8px);}15%{opacity:1;transform:translateX(-50%) translateY(0);}82%{opacity:1;}100%{opacity:0;}}
    @keyframes fall{to{transform:translateY(110vh);opacity:0;}}
    @keyframes imgReveal{0%{opacity:0;transform:scale(1.04);}100%{opacity:1;transform:scale(1);}}
    @keyframes titleSlide{0%{opacity:0;transform:translateY(32px);}100%{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{0%{opacity:0;}100%{opacity:1;}}
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{display:none;}
    button{font-family:inherit;}
    body{background:#FFFFFF;}
  `;

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);
  // Tente Hero.jpg puis hero.jpg (sensibilité casse Vercel)
  const [heroSrc, setHeroSrc] = useState("/Hero.jpeg");

  return(
    <div style={{minHeight:"100vh",background:T.white,display:"flex",flexDirection:"column",fontFamily:"-apple-system,'Helvetica Neue',Arial,sans-serif"}}>
      <style>{GLOBAL_CSS}</style>

      {/* Écran 0 — Welcome style éditorial Zara */}
      {step===0&&(
        <div style={{minHeight:"100vh",background:T.white,display:"flex",flexDirection:"column",position:"relative"}}>

          {/* Header fixe */}
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"28px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10}}>
            <span style={{fontSize:12,fontWeight:900,color:heroLoaded&&!heroError?T.white:T.black,letterSpacing:"0.14em",transition:"color 0.5s"}}>DRESKO</span>
            <Micro color={heroLoaded&&!heroError?"rgba(255,255,255,0.5)":T.pale} size={8}>Style AI</Micro>
          </div>

          {/* Zone photo — pleine largeur, 65vh */}
          <div style={{width:"100%",height:"65vh",position:"relative",overflow:"hidden",background:T.ghost,flexShrink:0}}>

            {/* Image principale */}
            {!heroError&&(
              <img
                src={heroSrc}
                alt=""
                onLoad={()=>setHeroLoaded(true)}
                onError={()=>{
                  if(heroSrc==="/Hero.jpeg") setHeroSrc("/Hero.jpg");
                  else setHeroError(true);
                }}
                style={{
                  width:"100%",
                  height:"100%",
                  objectFit:"cover",
                  objectPosition:"center 20%",
                  display:"block",
                  opacity:heroLoaded?1:0,
                  transition:"opacity 0.8s ease",
                  animation:heroLoaded?"imgReveal 1.2s ease both":"none",
                }}
              />
            )}

            {/* Fallback élégant si photo absente */}
            {(heroError||!heroLoaded)&&(
              <div style={{
                position:"absolute",inset:0,
                background:"linear-gradient(160deg, #F8F8F8 0%, #EEEEEE 50%, #F5F5F5 100%)",
                display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:16,
              }}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,opacity:0.15}}>
                  {["👔","👖","🧥","👟"].map((e,i)=>(
                    <div key={i} style={{width:64,height:80,background:T.line,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{e}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Gradient bas — fondu vers blanc */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:120,background:"linear-gradient(transparent, #FFFFFF)",pointerEvents:"none"}}/>

            {/* Gradient haut — pour lisibilité du header */}
            {heroLoaded&&!heroError&&(
              <div style={{position:"absolute",top:0,left:0,right:0,height:100,background:"linear-gradient(rgba(0,0,0,0.3), transparent)",pointerEvents:"none"}}/>
            )}
          </div>

          {/* Contenu bas */}
          <div style={{flex:1,padding:"16px 32px 0",display:"flex",flexDirection:"column",justifyContent:"space-between",animation:"titleSlide 0.6s 0.3s both",opacity:0}}>

            <div>
              {/* Titre massif */}
              <h1 style={{
                fontSize:52,
                fontWeight:900,
                color:T.black,
                lineHeight:0.95,
                letterSpacing:"-0.04em",
                margin:"0 0 14px",
              }}>
                Ton<br/>styliste<br/>personnel.
              </h1>

              {/* Ligne + tagline */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:24,height:1.5,background:T.black,flexShrink:0}}/>
                <span style={{
                  fontSize:9,
                  color:T.mid,
                  letterSpacing:"0.14em",
                  fontFamily:"'Courier New',monospace",
                  textTransform:"uppercase",
                }}>Quel que soit ton style.</span>
              </div>
            </div>

            {/* CTA */}
            <div style={{paddingBottom:48}}>
              <button onClick={next} style={{
                width:"100%",
                background:T.black,
                color:T.white,
                border:"none",
                padding:"18px",
                fontSize:10,
                fontFamily:"'Courier New',monospace",
                letterSpacing:"0.2em",
                cursor:"pointer",
                fontWeight:700,
                marginBottom:20,
                transition:"opacity 0.2s",
              }}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                Commencer →
              </button>

              {/* Dots */}
              <div style={{display:"flex",justifyContent:"center",gap:6}}>
                {[0,1,2,3,4].map(i=>(
                  <div key={i} style={{width:i===0?22:5,height:2,background:i===0?T.black:T.line,borderRadius:1}}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu étapes 1-4 — fond blanc */}
      {step>0&&(
      <div style={{minHeight:"100vh",background:T.white,display:"flex",flexDirection:"column"}}>

        {/* Header étapes */}
        <div style={{padding:"20px 28px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:13,fontWeight:900,color:T.black,letterSpacing:"0.1em"}}>DRESKO</span>
          <Micro color={T.pale}>{step+1} / 5</Micro>
        </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",opacity:vis?1:0,transform:vis?"none":"translateY(16px)",transition:"all 0.22s ease",overflow:"hidden"}}>

        {/* Écran 1 — Styles */}
        {step===1&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"24px 32px 16px"}}>
              <Micro color={T.soft} size={9}>Étape 1</Micro>
              <h2 style={{fontSize:28,fontWeight:900,color:T.black,margin:"8px 0 4px",letterSpacing:"-0.02em"}}>Tes styles</h2>
              <p style={{color:T.mid,fontSize:12}}>Sélectionne tous ceux qui te correspondent</p>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0 32px 16px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {USER_STYLES.map(s=>{
                  const sel=selectedStyles.includes(s.id);
                  return(
                    <button key={s.id} onClick={()=>toggleStyle(s.id)} style={{background:sel?T.black:T.white,border:`1px solid ${sel?T.black:T.line}`,padding:"16px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontFamily:"inherit"}}>
                      <div style={{fontSize:18,marginBottom:8}}>{s.icon}</div>
                      <div style={{fontSize:12,fontWeight:700,color:sel?T.white:T.black,marginBottom:3}}>{s.label}</div>
                      <div style={{fontSize:10,color:sel?T.ultra:T.soft}}>{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Écran 2 — Marques */}
        {step===2&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"24px 32px 16px"}}>
              <Micro color={T.soft} size={9}>Étape 2</Micro>
              <h2 style={{fontSize:28,fontWeight:900,color:T.black,margin:"8px 0 4px",letterSpacing:"-0.02em"}}>Tes marques</h2>
              <p style={{color:T.mid,fontSize:12}}>Minimum 2 marques</p>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0 32px 16px"}}>
              {["mid","premium","sport"].map(cat=>{
                const catLabel={mid:"Mid-range",premium:"Premium",sport:"Sport"}[cat];
                const catBrands=BRANDS_LIST.filter(b=>b.cat===cat);
                return(
                  <div key={cat} style={{marginBottom:20}}>
                    <Micro color={T.pale} size={8}>{catLabel}</Micro>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
                      {catBrands.map(b=>{
                        const sel=selectedBrands.includes(b.label);
                        return(
                          <button key={b.id} onClick={()=>toggleBrand(b.label)} style={{background:sel?T.black:"transparent",border:`1px solid ${sel?T.black:T.line}`,padding:"8px 16px",fontSize:11,fontFamily:"inherit",color:sel?T.white:T.mid,cursor:"pointer",transition:"all 0.15s"}}>
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Écran 3 — Budget */}
        {step===3&&(
          <div style={{flex:1,padding:"0 32px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <Micro color={T.soft} size={9}>Étape 3</Micro>
            <h2 style={{fontSize:28,fontWeight:900,color:T.black,margin:"8px 0 4px",letterSpacing:"-0.02em"}}>Ton budget</h2>
            <p style={{color:T.mid,fontSize:12,marginBottom:24}}>Par look, pour les suggestions d'achat</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {BUDGET_OPTS.map(b=>{
                const sel=budget===b;
                return(
                  <button key={b} onClick={()=>setBudget(b)} style={{background:sel?T.black:"transparent",border:`1px solid ${sel?T.black:T.line}`,padding:"16px 20px",fontSize:13,fontFamily:"inherit",color:sel?T.white:T.mid,cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontWeight:sel?600:400}}>
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Écran 4 — Action */}
        {step===4&&(
          <div style={{flex:1,padding:"0 32px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <span style={{fontSize:52,marginBottom:28,display:"block"}}>✦</span>
            <Micro color={T.soft} size={9}>Prêt</Micro>
            <h2 style={{fontSize:36,fontWeight:900,color:T.black,margin:"8px 0 0",letterSpacing:"-0.03em",lineHeight:1.05}}>
              Ton styliste<br/>est prêt.
            </h2>
            <div style={{width:28,height:2,background:T.black,margin:"18px 0"}}/>
            <p style={{color:T.mid,fontSize:13,lineHeight:1.85,marginBottom:8}}>
              Commence par scanner <strong>5 à 10 pièces</strong> de ton dressing. Plus tu en ajoutes, plus les suggestions sont précises.
            </p>
            <div style={{marginTop:8,marginBottom:4}}>
              <Bar value={0} max={5}/>
            </div>
            <Micro color={T.pale} size={8}>0 / 5 pièces minimum recommandées</Micro>
          </div>
        )}
      </div>

      {/* Footer — fond blanc, visible étapes 1-4 */}
      <div style={{padding:"20px 28px 44px",borderTop:`1px solid ${T.line}`,background:T.white,flexShrink:0}}>
        {err&&<div style={{marginBottom:10,textAlign:"center"}}><Micro color={T.red} size={9}>{err}</Micro></div>}
        <div style={{display:"flex",gap:6,marginBottom:22}}>
          {[0,1,2,3,4].map(i=>(
            <div key={i} onClick={()=>i<step&&go(i)} style={{flex:i===step?3:1,height:2,background:i===step?T.black:i<step?T.dark:T.line,cursor:i<step?"pointer":"default",transition:"all 0.35s"}}/>
          ))}
        </div>
        <BtnPrimary onClick={next}>
          {step===4?"📸 Scanner mes premières pièces →":"Suivant →"}
        </BtnPrimary>
        <button onClick={()=>go(step-1)} style={{width:"100%",background:"none",border:"none",color:T.pale,padding:"12px",fontSize:9,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",cursor:"pointer",marginTop:6}}>← Retour</button>
      </div>
      </div>
      )}
    </div>
  );
}

// ─── TODAY ────────────────────────────────────────────────────────────────────
function TodayScreen({wardrobe,onScore,onNav,profile}){
  const now=new Date();
  const DAYS=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const style=USER_STYLES.find(s=>s.id===profile?.selectedStyle)||USER_STYLES[0];

  const[meteo,setMeteo]=useState({id:"mild",label:"Doux",icon:"🌤️",temp:"—"});
  const[meteoAuto,setMeteoAuto]=useState(false);
  const[meteoErr,setMeteoErr]=useState(false);
  const[occ,setOcc]=useState(DAY_OCC[now.getDay()]);
  const[tenues,setTenues]=useState([]);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[idx,setIdx]=useState(0);
  const[done,setDone]=useState(false);
  const[conseil,setConseil]=useState("");
  const[pieceStar,setPieceStar]=useState("");
  const[wornConfirm,setWornConfirm]=useState(false);
  const[prefs,setPrefs]=useState(()=>LS.get("dresko_prefs",{liked:[],disliked:[]}));
  const[wH,setWH]=useState(()=>LS.get("dresko_wearHistory",{}));
  const[history,setHistory]=useState(()=>LS.get("dresko_history",[]));
  const[challenge,setChallenge]=useState(null);
  const[confetti,setConfetti]=useState(false);

  useEffect(()=>{
    const c=LS.get("dresko_weather",null);
    if(c&&Date.now()-c.ts<900000){setMeteo(c.data);setMeteoAuto(true);return;}
    if(!navigator.geolocation){setMeteoErr(true);return;}
    navigator.geolocation.getCurrentPosition(
      async pos=>{try{const w=await fetchWeather(pos.coords.latitude,pos.coords.longitude);setMeteo(w);setMeteoAuto(true);LS.set("dresko_weather",{data:w,ts:Date.now()});}catch(e){setMeteoErr(true);}},
      ()=>setMeteoErr(true),{timeout:5000}
    );
  },[]);

  useEffect(()=>{
    if(!wardrobe.length) return;
    const u=wardrobe.filter(p=>{const l=LS.get(`dresko_lw_${p.id}`,null);return !l||Date.now()-l>14*24*3600*1000;});
    if(u.length) setChallenge(u[Math.floor(Math.random()*u.length)]);
  },[wardrobe]);

  // État vide — moins de 3 pièces
  if(wardrobe.length<3) return(
    <div style={{padding:"0 0 110px"}}>
      <div style={{padding:"28px 32px 24px",borderBottom:`1px solid ${T.line}`}}>
        <Micro color={T.soft} size={8}>{DAYS[now.getDay()]} · {now.getDate()} {MONTHS[now.getMonth()]}</Micro>
        <h1 style={{fontSize:40,fontWeight:900,color:T.black,lineHeight:1.05,marginTop:10,letterSpacing:"-0.03em"}}>Tenue<br/>du jour</h1>
      </div>
      <div style={{padding:"40px 32px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:24}}>👔</div>
        <h2 style={{fontSize:22,fontWeight:800,color:T.black,marginBottom:12,letterSpacing:"-0.02em",lineHeight:1.2}}>Commence par scanner<br/>ton dressing</h2>
        <p style={{color:T.mid,fontSize:13,lineHeight:1.85,marginBottom:32,maxWidth:280,margin:"0 auto 32px"}}>Ajoute au moins 5 pièces pour que ton styliste compose des tenues personnalisées.</p>
        <BtnPrimary onClick={()=>onNav("dressing")}>📸 Scanner mes vêtements</BtnPrimary>
        <div style={{marginTop:16}}><Micro color={T.pale} size={8}>{wardrobe.length} / 5 pièces minimum</Micro></div>
        <div style={{marginTop:8,padding:"0 40px"}}><Bar value={wardrobe.length} max={5}/></div>
      </div>
    </div>
  );

  const go=async()=>{
    setErr("");setLoading(true);setTenues([]);setIdx(0);setDone(false);setWornConfirm(false);
    try{
      const data=await genOutfits(wardrobe,meteo,occ,prefs,wH,profile||{});
      setTenues(data.tenues||[]);setConseil(data.conseil_meteo||"");setPieceStar(data.piece_star||"");
      onScore("generate");
      const h=[{date:`${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`,meteo:meteo.label,occ,titre:data.tenues?.[0]?.titre},...history].slice(0,30);
      setHistory(h);LS.set("dresko_history",h);
    }catch(e){setErr("Connexion interrompue. Réessaie dans un instant.");}
    setLoading(false);
  };

  const like=t=>{const u={...prefs,liked:[...(prefs.liked||[]),t.titre].slice(-20)};setPrefs(u);LS.set("dresko_prefs",u);onScore("like");next();};
  const pass=t=>{const u={...prefs,disliked:[...(prefs.disliked||[]),t.titre].slice(-20)};setPrefs(u);LS.set("dresko_prefs",u);next();};
  const worn=t=>{
    const h={...wH};
    (t.pieces||[]).forEach(n=>{const p=findPiece(wardrobe,n);if(p){h[p.id]=(h[p.id]||0)+1;LS.set(`dresko_lw_${p.id}`,Date.now());}});
    setWH(h);LS.set("dresko_wearHistory",h);onScore("worn");
    setConfetti(true);setTimeout(()=>setConfetti(false),1300);
    setWornConfirm(true);setTimeout(()=>{setWornConfirm(false);next();},1000);
  };
  const next=()=>{if(idx>=tenues.length-1) setDone(true);else setIdx(i=>i+1);};
  const rem=tenues.slice(idx);

  return(
    <div style={{padding:"0 0 110px"}}>
      <Confetti on={confetti}/>

      {/* Header */}
      <div style={{padding:"24px 32px 20px",borderBottom:`1px solid ${T.line}`}}>
        <Micro color={T.soft} size={8}>{DAYS[now.getDay()]} · {now.getDate()} {MONTHS[now.getMonth()]}</Micro>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:8}}>
          <div>
            <h1 style={{fontSize:40,fontWeight:900,color:T.black,lineHeight:1.05,margin:0,letterSpacing:"-0.03em"}}>
              Tenue<br/>du jour
            </h1>
            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:16,height:1,background:T.line}}/>
              <Micro color={T.pale} size={8}>{style.label}</Micro>
            </div>
          </div>
          <div style={{textAlign:"center",paddingTop:4}}>
            <div style={{fontSize:24}}>{meteo.icon}</div>
            <div style={{fontSize:13,fontWeight:700,color:T.black,marginTop:2}}>{meteo.temp}</div>
            {meteoAuto&&<Micro color={T.pale} size={7}>auto</Micro>}
          </div>
        </div>
      </div>

      <div style={{padding:"20px 32px"}}>
        {/* Météo manuelle */}
        {(!meteoAuto||meteoErr)&&(
          <div style={{marginBottom:18}}>
            {meteoErr&&<div style={{marginBottom:8}}><Micro color={T.pale} size={8}>Localisation indisponible</Micro></div>}
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              {METEOS_LIST.map(m=>(
                <button key={m.id} onClick={()=>{setMeteo(m);setMeteoErr(false);}} style={{background:meteo.id===m.id?T.black:"transparent",border:`1px solid ${meteo.id===m.id?T.black:T.line}`,padding:"8px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:56,fontFamily:"inherit",transition:"all 0.15s"}}>
                  <span style={{fontSize:16}}>{m.icon}</span>
                  <Micro color={meteo.id===m.id?T.white:T.soft} size={7}>{m.label}</Micro>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Occasions */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {OCCASIONS.map(o=>(
              <button key={o} onClick={()=>setOcc(o)} style={{background:occ===o?T.black:"transparent",border:`1px solid ${occ===o?T.black:T.line}`,padding:"6px 14px",fontSize:10,fontFamily:"inherit",color:occ===o?T.white:T.mid,cursor:"pointer",transition:"all 0.15s"}}>
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Pièce oubliée */}
        {challenge&&!tenues.length&&(
          <div style={{borderLeft:`2px solid ${T.line}`,paddingLeft:16,marginBottom:20}}>
            <Micro color={T.soft} size={8}>Pièce oubliée</Micro>
            <div style={{fontSize:13,fontWeight:600,color:T.ink,marginTop:5,marginBottom:2}}>{challenge.nom}</div>
            <Micro color={T.pale} size={8}>Non portée depuis 2+ semaines — intègre-la aujourd'hui</Micro>
          </div>
        )}

        {/* CTA */}
        {!tenues.length&&(
          <>
            <BtnPrimary onClick={go} loading={loading}>
              {loading?<><Spin size={13} dark/>Ton styliste compose…</>:"✦ Composer mes tenues"}
            </BtnPrimary>
            {err&&<div style={{textAlign:"center",marginTop:10}}><Micro color={T.red} size={9}>{err}</Micro></div>}
          </>
        )}

        {/* Conseil météo */}
        {conseil&&tenues.length>0&&!done&&(
          <div style={{borderLeft:`2px solid ${T.line}`,paddingLeft:14,marginBottom:16}}>
            <Micro color={T.soft} size={7}>Météo</Micro>
            <div style={{color:T.mid,fontSize:11,lineHeight:1.7,marginTop:4}}>{conseil}</div>
            {pieceStar&&<div style={{marginTop:5,display:"flex",gap:6,alignItems:"center"}}>
              <Micro color={T.pale} size={7}>Pièce star</Micro>
              <span style={{fontSize:11,color:T.soft,fontStyle:"italic"}}>{pieceStar}</span>
            </div>}
          </div>
        )}

        {/* Swipe */}
        {tenues.length>0&&!done&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <Micro color={T.pale} size={7}>← pass</Micro>
              <Micro color={T.soft} size={8}>{idx+1} / {tenues.length}</Micro>
              <Micro color={T.pale} size={7}>like →</Micro>
            </div>

            <div style={{position:"relative",height:580}}>
              {rem.slice(0,2).reverse().map((t,i)=>{
                const isTop=i===rem.slice(0,2).length-1;
                return(
                  <div key={t.titre+idx+i} style={{position:"absolute",width:"100%",transform:!isTop?"scale(0.975) translateY(12px)":"none",transition:"transform 0.3s ease",zIndex:isTop?10:5}}>
                    <SwipeCard tenue={t} wardrobe={wardrobe} wH={wH} onLike={like} onDislike={pass} onWorn={worn} isTop={isTop} wornDone={isTop&&wornConfirm}/>
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",gap:10,marginTop:16,alignItems:"center"}}>
              <button onClick={()=>pass(tenues[idx])} style={{width:50,height:50,background:T.white,border:`1px solid ${T.line}`,color:T.soft,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.red;e.currentTarget.style.color=T.red;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.color=T.soft;}}>✕</button>
              <button onClick={go} style={{flex:1,background:"transparent",border:`1px solid ${T.line}`,color:T.soft,fontSize:9,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",padding:"14px",cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.mid}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>↺ Régénérer</button>
              <button onClick={()=>like(tenues[idx])} style={{width:50,height:50,background:T.white,border:`1px solid ${T.line}`,color:T.soft,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.black;e.currentTarget.style.color=T.black;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.color=T.soft;}}>♥</button>
            </div>
          </div>
        )}

        {/* Done */}
        {done&&(
          <div style={{textAlign:"center",padding:"48px 0",animation:"fadeUp 0.4s ease"}}>
            <div style={{width:2,height:40,background:T.line,margin:"0 auto 24px"}}/>
            <h2 style={{fontSize:28,fontWeight:900,color:T.black,letterSpacing:"-0.02em",marginBottom:10}}>Tout vu</h2>
            <p style={{color:T.mid,fontSize:12,lineHeight:1.85,marginBottom:28}}>Tes préférences sont enregistrées.<br/>Ton styliste s'améliore à chaque swipe.</p>
            <BtnPrimary onClick={go}>✦ Nouvelles tenues</BtnPrimary>
          </div>
        )}

        {/* Historique */}
        {!tenues.length&&history.length>0&&!loading&&(
          <div style={{marginTop:32}}>
            <HR label="Historique récent"/>
            {history.slice(0,4).map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${T.ghost}`}}>
                <span style={{fontSize:16,width:22,textAlign:"center"}}>{METEOS_LIST.find(m=>m.label===h.meteo)?.icon||"🌤️"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500,color:T.ink,marginBottom:2,fontStyle:"italic"}}>{h.titre||"—"}</div>
                  <Micro color={T.pale} size={8}>{h.date} · {h.occ}</Micro>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STYLE SCREEN ─────────────────────────────────────────────────────────────
function StyleScreen({wardrobe,profile}){
  const wH=LS.get("dresko_wearHistory",{});
  const style=USER_STYLES.find(s=>s.id===profile?.selectedStyle)||USER_STYLES[0];
  const catCounts=CATS.map(c=>({...c,count:wardrobe.filter(p=>p.categorie===c.id).length}));

  // Score de complétude simple basé sur la couverture des catégories
  const coveredCats=catCounts.filter(c=>c.count>0).length;
  const score=Math.round((coveredCats/5)*100);

  const neverWorn=wardrobe.filter(p=>!wH[p.id]);

  return(
    <div style={{padding:"0 0 110px"}}>
      <div style={{padding:"28px 32px 22px",borderBottom:`1px solid ${T.line}`}}>
        <Micro color={T.soft} size={8}>Optimisation</Micro>
        <h1 style={{fontSize:40,fontWeight:900,color:T.black,lineHeight:1.05,marginTop:8,letterSpacing:"-0.03em"}}>
          Mon style
        </h1>
        <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:16,height:1,background:T.line}}/>
          <Micro color={T.pale} size={8}>{style.label}</Micro>
        </div>
      </div>

      <div style={{padding:"22px 32px"}}>
        {/* Score complétude */}
        <div style={{border:`1px solid ${T.line}`,padding:"20px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <Micro color={T.soft} size={8}>Complétude dressing</Micro>
              <div style={{fontSize:42,fontWeight:900,color:T.black,lineHeight:1,marginTop:4,letterSpacing:"-0.03em"}}>{score}<span style={{fontSize:18,color:T.pale}}>%</span></div>
            </div>
            <div style={{textAlign:"right"}}>
              <Micro color={T.pale} size={8}>Style cible</Micro>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginTop:3}}>{style.label}</div>
            </div>
          </div>
          <Bar value={score} max={100} h={3}/>
          <div style={{marginTop:10}}>
            <Micro color={T.pale} size={8}>{style.rules}</Micro>
          </div>
        </div>

        {/* Catégories manquantes */}
        <div style={{marginBottom:16}}>
          <Micro color={T.soft} size={8}>Couverture par catégorie</Micro>
          <div style={{display:"flex",gap:0,marginTop:10,border:`1px solid ${T.line}`}}>
            {catCounts.map((c,i)=>(
              <div key={c.id} style={{flex:1,padding:"10px 6px",textAlign:"center",borderRight:i<catCounts.length-1?`1px solid ${T.line}`:"none",background:c.count>0?T.paper:T.white}}>
                <div style={{fontSize:16,marginBottom:3}}>{c.emoji}</div>
                <div style={{fontSize:18,fontWeight:900,color:c.count>0?T.black:T.pale,lineHeight:1}}>{c.count}</div>
                <Micro color={T.soft} size={7}>{c.short}</Micro>
              </div>
            ))}
          </div>
        </div>

        {/* Pièces jamais portées */}
        {neverWorn.length>0&&(
          <div style={{border:`1px solid ${T.line}`,padding:"16px",marginBottom:16}}>
            <Micro color={T.soft} size={8}>Pièces jamais portées ({neverWorn.length})</Micro>
            <div style={{marginTop:10}}>
              {neverWorn.slice(0,4).map((p,i)=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<Math.min(neverWorn.length,4)-1?`1px solid ${T.ghost}`:"none"}}>
                  <div style={{width:36,height:42,overflow:"hidden",flexShrink:0}}>
                    <PieceImg id={p.id} style={{width:36,height:42,objectFit:"cover"}} placeholder="👔"/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:T.ink}}>{p.nom}</div>
                    <Micro color={T.pale} size={8}>jamais portée</Micro>
                  </div>
                  {p.tendance_2026&&<Tag label="★ 26" dark small/>}
                </div>
              ))}
              {neverWorn.length>4&&<div style={{marginTop:10}}><Micro color={T.pale} size={8}>+{neverWorn.length-4} autres pièces</Micro></div>}
            </div>
          </div>
        )}

        {/* Tendances */}
        <div style={{border:`1px solid ${T.line}`,padding:"16px",marginBottom:16}}>
          <Micro color={T.soft} size={8}>Tendances {style.label} SS26</Micro>
          <p style={{color:T.mid,fontSize:12,lineHeight:1.75,marginTop:8}}>{style.tendances}</p>
        </div>

        {/* Message si dressing vide */}
        {wardrobe.length<5&&(
          <div style={{background:T.paper,border:`1px solid ${T.line}`,padding:"16px",textAlign:"center"}}>
            <Micro color={T.pale} size={9}>Ajoute plus de pièces pour débloquer l'analyse complète</Micro>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHOP SCREEN ──────────────────────────────────────────────────────────────
function ShopScreen({profile}){
  const now=new Date();
  const[looks,setLooks]=useState([]);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[filter,setFilter]=useState({occ:"Quotidien"});
  const style=USER_STYLES.find(s=>s.id===profile?.selectedStyle)||USER_STYLES[0];
  const meteo=LS.get("dresko_weather",null)?.data||{id:"mild",label:"Doux",icon:"🌤️",temp:"18°"};

  const go=async()=>{
    setErr("");setLoading(true);setLooks([]);
    try{
      const data=await genInspiration({...profile,selectedStyle:profile?.selectedStyle||"casual-chic"},meteo,filter.occ);
      setLooks(data.looks||[]);
    }catch(e){setErr("Connexion interrompue. Réessaie.");}
    setLoading(false);
  };

  return(
    <div style={{padding:"0 0 110px"}}>
      <div style={{padding:"28px 32px 22px",borderBottom:`1px solid ${T.line}`}}>
        <Micro color={T.soft} size={8}>Inspiration</Micro>
        <h1 style={{fontSize:40,fontWeight:900,color:T.black,lineHeight:1.05,marginTop:8,letterSpacing:"-0.03em"}}>
          Shop
        </h1>
        <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:16,height:1,background:T.line}}/>
          <Micro color={T.pale} size={8}>Looks dans tes marques · {profile?.budget||"—"}</Micro>
        </div>
      </div>

      <div style={{padding:"20px 32px"}}>
        {/* Filtre occasion */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {OCCASIONS.map(o=>(
              <button key={o} onClick={()=>setFilter(f=>({...f,occ:o}))} style={{background:filter.occ===o?T.black:"transparent",border:`1px solid ${filter.occ===o?T.black:T.line}`,padding:"6px 12px",fontSize:9,fontFamily:"inherit",color:filter.occ===o?T.white:T.mid,cursor:"pointer",transition:"all 0.15s"}}>
                {o}
              </button>
            ))}
          </div>
        </div>

        <BtnPrimary onClick={go} loading={loading}>
          {loading?<><Spin size={13} dark/>Recherche en cours…</>:`✦ Générer des looks ${style.label}`}
        </BtnPrimary>

        {err&&<div style={{textAlign:"center",marginTop:10}}><Micro color={T.red} size={9}>{err}</Micro></div>}

        {looks.length>0&&(
          <div style={{marginTop:24,animation:"fadeUp 0.4s ease"}}>
            {looks.map((look,i)=>(
              <div key={i} style={{border:`1px solid ${T.line}`,marginBottom:14,overflow:"hidden"}}>
                {/* Header look */}
                <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${T.line}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <Micro color={T.soft} size={8}>{look.style||style.label}</Micro>
                      <div style={{fontSize:17,fontWeight:800,color:T.black,marginTop:4,letterSpacing:"-0.01em",lineHeight:1.2}}>{normTitle(look.titre)}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:800,color:T.black}}>{look.budget_total}€</div>
                      <Micro color={T.pale} size={7}>budget total</Micro>
                    </div>
                  </div>
                </div>

                {/* Pièces du look */}
                <div style={{padding:"10px 18px"}}>
                  {(look.pieces||[]).map((p,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:j<(look.pieces||[]).length-1?`1px solid ${T.ghost}`:"none"}}>
                      {/* Placeholder image produit */}
                      <div style={{width:40,height:48,background:T.ghost,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:16,opacity:0.3}}>🛍</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:500,color:T.ink,marginBottom:2}}>{p.nom}</div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <Micro color={T.soft} size={8}>{p.marque}</Micro>
                          <span style={{color:T.pale,fontSize:8}}>·</span>
                          <Micro color={T.pale} size={8}>{p.couleur}</Micro>
                        </div>
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:T.dark}}>{p.prix_estime}€</div>
                    </div>
                  ))}
                </div>

                {/* Description + CTA */}
                <div style={{padding:"12px 18px",background:T.paper,borderTop:`1px solid ${T.line}`}}>
                  <p style={{color:T.mid,fontSize:11,lineHeight:1.7,marginBottom:10}}>{look.description}</p>
                  <button style={{width:"100%",background:"transparent",border:`1px solid ${T.line}`,color:T.mid,padding:"10px",fontSize:9,fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",cursor:"pointer",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=T.black;e.currentTarget.style.color=T.white;e.currentTarget.style.borderColor=T.black;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.mid;e.currentTarget.style.borderColor=T.line;}}>
                    🔗 Voir les liens d'achat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!looks.length&&!loading&&(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:2,height:40,background:T.line,margin:"0 auto 20px"}}/>
            <Micro color={T.pale} size={9}>Génère des looks dans tes marques préférées</Micro>
            <div style={{marginTop:8}}>
              <Micro color={T.ultra} size={8}>{(profile?.brands||[]).slice(0,4).join(" · ")}</Micro>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DRESSING SCREEN ──────────────────────────────────────────────────────────
function DressingScreen({wardrobe,onDelete,onExport,onImport,onAdded,onScore}){
  const[filter,setFilter]=useState("all");
  const[confirm,setConfirm]=useState(null);
  const[phase,setPhase]=useState("list");
  const[preview,setPreview]=useState(null);
  const[analysis,setAnalysis]=useState(null);
  const[b64,setB64]=useState(null);
  const[scanning,setScanning]=useState(false);
  const[multiProgress,setMultiProgress]=useState(null);
  const[err,setErr]=useState("");
  const[confetti,setConfetti]=useState(false);
  const wH=LS.get("dresko_wearHistory",{});
  const filtered=filter==="all"?wardrobe:wardrobe.filter(p=>p.categorie===filter);
  const sRef=useRef();const mRef=useRef();const impRef=useRef();

  const handleDel=id=>{
    if(confirm===id){onDelete(id);setConfirm(null);}
    else{setConfirm(id);setTimeout(()=>setConfirm(null),3000);}
  };

  const scanSingle=async f=>{
    if(!f) return;
    const idbOk=await IDB.isAvailable();
    if(!idbOk){setErr("Stockage indisponible en navigation privée.");return;}
    setErr("");setPreview(URL.createObjectURL(f));setScanning(true);
    try{
      const compressed=await compressImage(f);
      const r=await analyzePhoto(compressed);
      setAnalysis({...r,id:Date.now().toString()});setB64(compressed);setPhase("review");
    }catch(e){setErr("Analyse échouée — réessaie avec une meilleure photo.");}
    setScanning(false);
  };

  const scanMulti=async files=>{
    const arr=Array.from(files);if(!arr.length) return;
    const idbOk=await IDB.isAvailable();
    if(!idbOk){setErr("Stockage indisponible en navigation privée.");return;}
    setMultiProgress({cur:0,total:arr.length,done:[]});
    for(let i=0;i<arr.length;i++){
      setMultiProgress(p=>({...p,cur:i}));
      try{
        const compressed=await compressImage(arr[i]);
        const r=await analyzePhoto(compressed);
        const item={...r,id:Date.now().toString()+i};
        await IDB.save(item.id,compressed);
        LS.set("dresko_wardrobe",[...LS.get("dresko_wardrobe",[]),cleanPiece(item)]);
        onAdded();onScore("scan");
        setMultiProgress(p=>({...p,cur:i+1,done:[...p.done,item]}));
        if(i<arr.length-1) await new Promise(r=>setTimeout(r,500));
      }catch(e){}
    }
    setMultiProgress(null);setConfetti(true);setTimeout(()=>setConfetti(false),1300);
  };

  const save=async()=>{
    const idbOk=await IDB.isAvailable();
    if(!idbOk){setErr("Stockage indisponible.");setPhase("list");return;}
    await IDB.save(analysis.id,b64);
    LS.set("dresko_wardrobe",[...LS.get("dresko_wardrobe",[]),cleanPiece(analysis)]);
    setPhase("list");setPreview(null);setAnalysis(null);setB64(null);
    onAdded();onScore("scan");
    setConfetti(true);setTimeout(()=>setConfetti(false),1300);
  };

  return(
    <div style={{padding:"0 0 110px"}}>
      <Confetti on={confetti}/>

      <div style={{padding:"28px 32px 22px",borderBottom:`1px solid ${T.line}`}}>
        <Micro color={T.soft} size={8}>Inventaire</Micro>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:8}}>
          <h1 style={{fontSize:40,fontWeight:900,color:T.black,lineHeight:1.05,margin:0,letterSpacing:"-0.03em"}}>
            Mon<br/>dressing
          </h1>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:32,fontWeight:900,color:T.light,lineHeight:1}}>{wardrobe.length}</div>
            <Micro color={T.pale} size={8}>pièces</Micro>
          </div>
        </div>
      </div>

      <div style={{padding:"20px 32px"}}>
        {/* Review après scan */}
        {phase==="review"&&analysis&&(
          <div style={{animation:"fadeUp 0.3s ease",marginBottom:20}}>
            <div style={{border:`1px solid ${T.line}`,overflow:"hidden",marginBottom:12}}>
              <div style={{display:"flex"}}>
                <img src={preview} alt="" style={{width:120,height:150,objectFit:"cover",flexShrink:0}}/>
                <div style={{padding:"16px",flex:1}}>
                  <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                    <Micro color={T.soft} size={8}>{analysis.categorie}</Micro>
                    {analysis.tendance_2026&&<Micro color={T.mid} size={8}>★ 2026</Micro>}
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:T.black,letterSpacing:"-0.01em",lineHeight:1.2,marginBottom:8}}>{analysis.nom}</div>
                  <p style={{color:T.mid,fontSize:11,lineHeight:1.6,marginBottom:8}}>{analysis.description}</p>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <Tag label={analysis.couleur} dark small/>
                    {analysis.fit&&<Tag label={analysis.fit} small/>}
                    {analysis.matiere&&<Tag label={analysis.matiere} small/>}
                  </div>
                </div>
              </div>
              {analysis.score_casual_chic&&(
                <div style={{padding:"10px 16px",borderTop:`1px solid ${T.line}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <Micro color={T.soft} size={8}>Score style</Micro>
                    <Micro color={T.mid} size={8}>{analysis.score_casual_chic} / 10</Micro>
                  </div>
                  <Bar value={analysis.score_casual_chic} max={10} h={2}/>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10}}>
              <BtnGhost onClick={()=>{setPhase("list");setPreview(null);setAnalysis(null);}} sm>↺ Réessayer</BtnGhost>
              <BtnPrimary onClick={save} sm>✓ Ajouter au dressing</BtnPrimary>
            </div>
            <HR my={16}/>
          </div>
        )}

        {/* Analyse en cours */}
        {scanning&&(
          <div style={{textAlign:"center",padding:"30px 0",marginBottom:16}}>
            {preview&&<div style={{position:"relative",display:"inline-block",marginBottom:20}}>
              <img src={preview} alt="" style={{width:130,height:160,objectFit:"cover",opacity:0.5,display:"block",border:`1px solid ${T.line}`}}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Spin size={24} dark/></div>
            </div>}
            <div style={{fontSize:14,fontWeight:600,color:T.black,marginBottom:4}}>Analyse en cours</div>
            <Micro color={T.soft} size={8}>Couleur · Matière · Style · Tendance</Micro>
            <HR my={16}/>
          </div>
        )}

        {/* Multi progress */}
        {multiProgress&&(
          <div style={{border:`1px solid ${T.line}`,padding:20,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:600,color:T.black}}>Catalogage en cours</div>
              <Micro color={T.mid}>{multiProgress.cur} / {multiProgress.total}</Micro>
            </div>
            <Bar value={multiProgress.cur} max={multiProgress.total} h={3}/>
            <div style={{display:"flex",justifyContent:"center",marginTop:20}}><Spin size={20} dark/></div>
            <div style={{textAlign:"center",marginTop:10}}><Micro color={T.pale} size={8}>Ne pas fermer l'application</Micro></div>
            {multiProgress.done.slice(-2).map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.ghost}`}}>
                <span style={{color:T.sage,fontSize:10}}>✓</span>
                <div style={{fontSize:11,color:T.ink,flex:1}}>{r.nom}</div>
                <Micro color={T.pale} size={7}>{r.categorie}</Micro>
              </div>
            ))}
          </div>
        )}

        {/* Boutons scanner */}
        {!scanning&&!multiProgress&&phase!=="review"&&(
          <div style={{display:"flex",gap:10,marginBottom:18}}>
            <button onClick={()=>sRef.current.click()} style={{flex:1,background:"transparent",border:`1px solid ${T.line}`,padding:"14px 12px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.dark}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>
              <div style={{fontSize:20,marginBottom:4}}>📸</div>
              <Micro color={T.mid} size={8}>Une pièce</Micro>
            </button>
            <input ref={sRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>scanSingle(e.target.files[0])}/>

            <button onClick={()=>mRef.current.click()} style={{flex:1,background:"transparent",border:`1px solid ${T.line}`,padding:"14px 12px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.dark}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>
              <div style={{fontSize:20,marginBottom:4}}>📂</div>
              <Micro color={T.mid} size={8}>Plusieurs</Micro>
            </button>
            <input ref={mRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>scanMulti(e.target.files)}/>
          </div>
        )}

        {err&&<div style={{textAlign:"center",marginBottom:12}}><Micro color={T.red} size={9}>{err}</Micro></div>}

        {/* Actions export/import */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <BtnGhost onClick={onExport} sm>↓ Export</BtnGhost>
          <BtnGhost onClick={()=>impRef.current.click()} sm>↑ Import</BtnGhost>
          <input ref={impRef} type="file" accept=".json" style={{display:"none"}} onChange={e=>onImport(e.target.files[0])}/>
        </div>

        {/* Filtres */}
        <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
          {[{id:"all",label:"Tout",emoji:"◻"},...CATS].map(c=>(
            <button key={c.id} onClick={()=>setFilter(c.id)} style={{background:filter===c.id?T.black:T.white,border:`1px solid ${filter===c.id?T.black:T.line}`,padding:"5px 12px",fontSize:9,fontFamily:"inherit",color:filter===c.id?T.white:T.mid,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Grille */}
        {wardrobe.length===0?(
          <div style={{textAlign:"center",padding:"50px 0"}}>
            <div style={{width:2,height:50,background:T.line,margin:"0 auto 20px"}}/>
            <h2 style={{fontSize:20,fontWeight:700,color:T.black,marginBottom:8}}>Dressing vide</h2>
            <Micro color={T.pale} size={9}>Scanne tes premières pièces ci-dessus</Micro>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"30px 0"}}><Micro color={T.pale} size={9}>Aucune pièce ici</Micro></div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {filtered.map(piece=>{
              const worn=wH[piece.id]||0;
              const isDel=confirm===piece.id;
              const cat=CATS.find(c=>c.id===piece.categorie);
              return(
                <div key={piece.id} style={{background:T.white,border:`1px solid ${isDel?T.red:T.line}`,position:"relative",transition:"border-color 0.2s"}}>
                  {worn===0&&!isDel&&<div style={{position:"absolute",top:8,left:8,zIndex:10,background:T.white,padding:"2px 7px",fontSize:7,fontFamily:"'Courier New',monospace",letterSpacing:"0.08em",color:T.mid,border:`1px solid ${T.line}`}}>Nouveau</div>}
                  {piece.tendance_2026&&<div style={{position:"absolute",top:8,right:isDel?46:8,zIndex:10,background:T.black,padding:"2px 7px",fontSize:7,fontFamily:"'Courier New',monospace",letterSpacing:"0.08em",color:T.white}}>★ 26</div>}
                  <button onClick={()=>handleDel(piece.id)} style={{position:"absolute",top:8,right:8,zIndex:10,background:isDel?T.red:T.white+"CC",border:`1px solid ${isDel?T.red:T.line}`,color:isDel?T.white:T.soft,width:isDel?38:22,height:22,cursor:"pointer",fontSize:isDel?7:11,fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {isDel?"DEL":"×"}
                  </button>
                  <PieceImg id={piece.id} style={{width:"100%",height:180,objectFit:"cover",display:"block"}} placeholder={cat?.emoji||"👔"}/>
                  <div style={{padding:"10px 12px 12px",borderTop:`1px solid ${T.line}`}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.ink,lineHeight:1.3,marginBottom:5,letterSpacing:"-0.005em"}}>{piece.nom}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>
                      <Tag label={piece.couleur} dark small/>
                      {piece.fit&&<Tag label={piece.fit} small/>}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                      <Micro color={T.pale} size={7}>{worn}× porté</Micro>
                      {piece.score_casual_chic&&<Micro color={T.soft} size={7}>{piece.score_casual_chic}/10</Micro>}
                    </div>
                    {piece.score_casual_chic&&<div style={{marginTop:5}}><Bar value={piece.score_casual_chic} max={10} h={1.5}/></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROFIL SCREEN ────────────────────────────────────────────────────────────
function ProfilScreen({wardrobe,score,profile,onUpdateProfile}){
  const level=getLevel(score);
  const next=getNext(score);
  const pct=next?((score-level.min)/(next.min-level.min))*100:100;
  const wH=LS.get("dresko_wearHistory",{});
  const totalWorn=Object.values(wH).reduce((a,b)=>a+b,0);
  const t2026=wardrobe.filter(p=>p.tendance_2026).length;
  const selectedStyle=USER_STYLES.find(s=>s.id===profile?.selectedStyle)||USER_STYLES[0];

  return(
    <div style={{padding:"0 0 110px"}}>
      <div style={{padding:"28px 32px 22px",borderBottom:`1px solid ${T.line}`}}>
        <Micro color={T.soft} size={8}>Compte</Micro>
        <h1 style={{fontSize:40,fontWeight:900,color:T.black,lineHeight:1.05,marginTop:8,letterSpacing:"-0.03em"}}>
          Mon profil
        </h1>
      </div>

      <div style={{padding:"22px 32px"}}>
        {/* Style Score */}
        <div style={{border:`1px solid ${T.line}`,padding:"20px",marginBottom:14}}>
          <Micro color={T.soft} size={8}>Style Score</Micro>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",margin:"10px 0 12px"}}>
            <div>
              <div style={{fontSize:52,fontWeight:900,color:T.black,lineHeight:1,letterSpacing:"-0.03em"}}>{score}</div>
              <Micro color={T.mid} size={9}>{level.label} {level.mark}</Micro>
            </div>
            <div style={{textAlign:"right"}}>
              {next&&<><div style={{fontSize:11,color:T.soft}}>{next.label} à {next.min} pts</div></>}
            </div>
          </div>
          <Bar value={pct} max={100} h={3}/>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {v:wardrobe.length,l:"Pièces"},
            {v:totalWorn,l:"Ports"},
            {v:t2026,l:"★ 2026"},
          ].map(s=>(
            <div key={s.l} style={{border:`1px solid ${T.line}`,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:T.black,lineHeight:1,marginBottom:4,letterSpacing:"-0.02em"}}>{s.v}</div>
              <Micro color={T.soft} size={7}>{s.l}</Micro>
            </div>
          ))}
        </div>

        {/* Style actif */}
        <div style={{border:`1px solid ${T.line}`,padding:"16px",marginBottom:14}}>
          <Micro color={T.soft} size={8}>Style principal</Micro>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:T.black,letterSpacing:"-0.01em"}}>{selectedStyle.icon} {selectedStyle.label}</div>
              <Micro color={T.pale} size={8}>{selectedStyle.desc}</Micro>
            </div>
          </div>
          {(profile?.styles||[]).length>1&&(
            <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
              {(profile.styles||[]).map(sid=>{
                const s=USER_STYLES.find(x=>x.id===sid);
                if(!s||s.id===profile.selectedStyle) return null;
                return <Tag key={sid} label={s.label} small/>;
              })}
            </div>
          )}
        </div>

        {/* Marques */}
        <div style={{border:`1px solid ${T.line}`,padding:"16px",marginBottom:14}}>
          <Micro color={T.soft} size={8}>Marques préférées</Micro>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
            {(profile?.brands||[]).map(b=><Tag key={b} label={b} dark small/>)}
          </div>
        </div>

        {/* Budget */}
        <div style={{border:`1px solid ${T.line}`,padding:"16px",marginBottom:14}}>
          <Micro color={T.soft} size={8}>Budget par look</Micro>
          <div style={{fontSize:14,fontWeight:700,color:T.black,marginTop:6}}>{profile?.budget||"—"}</div>
        </div>

        {/* Revenus affiliation (placeholder) */}
        <div style={{border:`1px solid ${T.line}`,padding:"16px",marginBottom:14,background:T.paper}}>
          <Micro color={T.soft} size={8}>Revenus affiliation</Micro>
          <div style={{fontSize:24,fontWeight:900,color:T.black,marginTop:6,letterSpacing:"-0.02em"}}>0€</div>
          <Micro color={T.pale} size={8}>Disponible après intégration Awin · Mois 2</Micro>
        </div>

        {/* Premium */}
        <div style={{border:`2px solid ${T.black}`,padding:"16px",marginBottom:14}}>
          <Micro color={T.mid} size={8}>Plan actuel</Micro>
          <div style={{fontSize:15,fontWeight:800,color:T.black,marginTop:4,marginBottom:8}}>Gratuit</div>
          <p style={{color:T.mid,fontSize:11,lineHeight:1.65,marginBottom:12}}>Passe en Premium pour débloquer le dressing illimité, l'analyse complète, les tendances hebdomadaires et bientôt le mannequin IA.</p>
          <BtnPrimary onClick={()=>{}} sm>✦ Passer en Premium · 4.99€/mois</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[onboarded,setOnboarded]=useState(()=>LS.get("dresko_ob_v1",false));
  const[tab,setTab]=useState("today");
  const[wardrobe,setWardrobe]=useState(()=>LS.get("dresko_wardrobe",[]));
  const[score,setScore]=useState(()=>LS.get("dresko_score",0));
  const[toast,setToast]=useState(null);
  const[profile,setProfile]=useState(()=>LS.get("dresko_profile",null));

  const refresh=useCallback(()=>setWardrobe(LS.get("dresko_wardrobe",[])),[]);

  const addScore=useCallback(action=>{
    const cfg=ACTIONS[action];if(!cfg) return;
    const prev=LS.get("dresko_score",0);const next=prev+cfg.pts;
    const pL=getLevel(prev);const nL=getLevel(next);
    LS.set("dresko_score",next);setScore(next);
    setToast(cfg.msg);setTimeout(()=>setToast(null),2500);
    if(nL.label!==pL.label) setTimeout(()=>{setToast(`${nL.mark} ${nL.label}`);setTimeout(()=>setToast(null),2800);},2600);
  },[]);

  const handleTabChange=useCallback(newTab=>{
    setTab(newTab);
    try{window.scrollTo(0,0);}catch(e){}
  },[]);

  const delItem=useCallback(async id=>{
    await IDB.del(id);
    const u=wardrobe.filter(p=>p.id!==id);LS.set("dresko_wardrobe",u);setWardrobe(u);
  },[wardrobe]);

  const doExport=useCallback(async()=>{
    const imgs=await IDB.all();
    const blob=new Blob([JSON.stringify({wardrobe,images:imgs,score,profile,v:1})],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`dresko-${Date.now()}.json`;a.click();
    URL.revokeObjectURL(url);
  },[wardrobe,score,profile]);

  const doImport=useCallback(async file=>{
    if(!file) return;
    try{
      const p=JSON.parse(await file.text());
      if(!p.wardrobe){alert("Fichier invalide");return;}
      for(const img of p.images||[]) await IDB.save(img.id,img.b64,img.mime||"image/jpeg");
      LS.set("dresko_wardrobe",p.wardrobe);setWardrobe(p.wardrobe);
      if(p.score){LS.set("dresko_score",p.score);setScore(p.score);}
      if(p.profile){LS.set("dresko_profile",p.profile);setProfile(p.profile);}
      alert(`✓ ${p.wardrobe.length} pièces importées`);
    }catch(e){alert("Erreur d'import");}
  },[]);

  const CSS=`
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{display:none;}
    button{font-family:inherit;}
    body{background:#FFFFFF;}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    @keyframes toastSlide{0%{opacity:0;transform:translateX(-50%) translateY(-8px);}15%{opacity:1;transform:translateX(-50%) translateY(0);}82%{opacity:1;}100%{opacity:0;}}
    @keyframes fall{to{transform:translateY(110vh);opacity:0;}}
  `;

  if(!onboarded) return(
    <><style>{CSS}</style>
    <Onboarding onDone={dest=>{
      LS.set("dresko_ob_v1",true);
      setOnboarded(true);
      setProfile(LS.get("dresko_profile",null));
      if(dest==="scanner") setTab("dressing");
    }}/></>
  );

  const level=getLevel(score);
  const nextL=getNext(score);
  const pct=nextL?((score-level.min)/(nextL.min-level.min))*100:100;
  const selectedStyle=USER_STYLES.find(s=>s.id===profile?.selectedStyle)||USER_STYLES[0];

  return(
    <div style={{background:T.white,minHeight:"100vh",color:T.black,fontFamily:"-apple-system,'Helvetica Neue',Arial,sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{CSS}</style>
      <Toast msg={toast}/>

      {/* Top bar */}
      <div style={{position:"sticky",top:0,zIndex:100,background:T.white+"F8",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.line}`,padding:"13px 32px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:14,fontWeight:900,color:T.black,letterSpacing:"0.08em"}}>DRESKO</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:"0.02em"}}>{selectedStyle.label}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:36}}><Bar value={pct} max={100} h={1}/></div>
              <Micro color={T.pale} size={7}>{score}</Micro>
            </div>
          </div>
        </div>
      </div>

      {/* Screens */}
      <div key={tab} style={{animation:"fadeUp 0.2s ease"}}>
        {tab==="today"    &&<TodayScreen    wardrobe={wardrobe} onScore={addScore} onNav={handleTabChange} profile={profile}/>}
        {tab==="style"    &&<StyleScreen    wardrobe={wardrobe} profile={profile}/>}
        {tab==="shop"     &&<ShopScreen     profile={profile}/>}
        {tab==="dressing" &&<DressingScreen wardrobe={wardrobe} onDelete={delItem} onExport={doExport} onImport={doImport} onAdded={refresh} onScore={addScore}/>}
        {tab==="profil"   &&<ProfilScreen   wardrobe={wardrobe} score={score} profile={profile} onUpdateProfile={p=>{setProfile(p);LS.set("dresko_profile",p);}}/>}
      </div>

      <Nav tab={tab} setTab={handleTabChange}/>
    </div>
  );
}
