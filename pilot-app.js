(() => {
  const E = window.FormationEngine,
    Q = window.FormationQuestions,
    R = window.FormationResources,
    RE = window.FormationResourceEngine;
  const $ = (id) => document.getElementById(id);
  if (!E || !Q) throw new Error("Formation assessment data failed to load.");

  const G = {
    Prayer: "Life with God", Scripture: "Life with God", Solitude: "Life with God", Fasting: "Life with God", Sabbath: "Life with God",
    Community: "Life with Others", Generosity: "Life with Others", Witness: "Life with Others", Service: "Life with Others",
    Environment: "Life with Self", "Use of Time": "Life with Self", Sleep: "Life with Self", "Physical Health": "Life with Self", "Inner Life": "Life with Self",
  };
  const deep = new URLSearchParams(location.search).get("mode") === "deep";
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const avg = (v) => { const x = v.filter((n) => typeof n === "number" && !Number.isNaN(n)); return x.length ? x.reduce((a,b)=>a+b,0)/x.length : null; };
  const stage = (v) => v < 2 ? "Emerging" : v < 3 ? "Establishing" : v < 4 ? "Deepening" : "Sustaining";
  const words = { Emerging:"This is beginning to take shape in my life.", Establishing:"This is beginning to grow in my life.", Deepening:"This is increasingly shaping my life.", Sustaining:"It is woven throughout my life." };

  const defs = {
    Prayer:"honest relationship, listening and dependence on God", Scripture:"receiving God’s word and allowing it to shape ordinary life", Solitude:"being alone, unhurried and attentive to God", Fasting:"attentiveness to desire, dependence and freedom through abstinence", Sabbath:"stopping, receiving rest and trusting God beyond productivity", Community:"belonging, vulnerability and shared Christian life", Generosity:"freedom, trust and open-handed participation in God’s generosity", Witness:"relational openness about Jesus and dependence on God", Service:"humble attentiveness to others and the servant way of Jesus", Environment:"how physical and digital surroundings support or disrupt presence", "Use of Time":"whether priorities, margin and pace create room for God and what matters most", Sleep:"receiving bodily limits and protecting rest", "Physical Health":"grateful care for the body as a means of availability", "Inner Life":"emotional awareness, honesty and allowing God beneath the surface",
  };

  const AD = {
    core:[0,1,2,3], mandatory:[4,7], optional:[5,6], thresholds:[2.7,2.9,3.25,3.65], near:.12, veryNear:.10,
    topAttention:3, topResolution:5, anchorCore:3.5, anchorImpact:3.5, anchorRelative:.25, contrast:.45, unstable:.80,
  };

  let items = [], idx = 0, adaptivePhase = 0, A = {}, S = {}, IR, resourceRows = [];
  const qItem = (d,i,reason="") => ({ d, i, q:Q[d][i], k:`${d}|${i}`, reason });

  E.D.forEach((d) => { if (!Array.isArray(Q[d]) || Q[d].length < 8) throw new Error(`Question data missing for ${d}`); });
  if (deep) {
    E.D.forEach((d) => { [...AD.core,...AD.mandatory].forEach((i) => items.push(qItem(d,i))); });
    if (items.length !== 84) throw new Error(`Expected 84 adaptive foundation questions; found ${items.length}`);
  } else {
    E.D.forEach((d) => Q[d].slice(0,4).forEach((q,i) => items.push(qItem(d,i))));
    if (items.length !== 56) throw new Error(`Expected 56 questions; found ${items.length}`);
  }

  $("mode").textContent = deep ? "Formation Discernment · adaptive long form · usually 96–108 questions" : "Formation Assessment · 56 questions";

  function answeredCount(){ return Object.values(A).filter((v)=>v !== undefined).length; }
  function render(){
    const x = items[idx], n = idx + 1;
    $("count").textContent = deep ? `Question ${n} · adaptive · 84 minimum / 112 maximum` : `Question ${n} of 56`;
    $("dn").textContent = x.d;
    const max = deep ? 112 : 56;
    $("prog").style.width = `${Math.min(100,(n/max)*100)}%`;
    $("progress").setAttribute("aria-valuenow", String(n));
    $("progress").setAttribute("aria-valuemax", String(max));
    $("backButton").textContent = idx === 0 ? "Back to scale" : "Back";
    $("nextButton").textContent = idx === items.length - 1 && (!deep || adaptivePhase >= 2) ? "Continue" : "Next";
    $("qt").textContent = x.q;
    $("ans").innerHTML = ["Not true","Slightly true","Somewhat true","Mostly true","Very true"].map((l,j)=>`<label><input type="radio" name="a" value="${j+1}"> <b>${l}</b></label>`).join("");
    document.querySelectorAll("[name=a]").forEach((r)=>{ r.checked = A[x.k] === +r.value; r.onchange = ()=>A[x.k]=+r.value; });
  }
  function centre(){ requestAnimationFrame(()=>document.querySelector("#assess .card")?.scrollIntoView({block:"center",behavior:"auto"})); }

  function domainAdaptiveStats(d){
    const core = AD.core.map(i=>A[`${d}|${i}`]).filter(Number.isFinite), impact = [4,5,6,7].map(i=>A[`${d}|${i}`]).filter(Number.isFinite);
    const c = avg(core), im = avg(impact);
    const spread = impact.length ? Math.max(...impact)-Math.min(...impact) : 0;
    const sd = impact.length > 1 ? Math.sqrt(impact.reduce((s,v)=>s+(v-im)**2,0)/impact.length) : 0;
    return {core:c, impact:im, coreCount:core.length, impactCount:impact.length, mean:c!=null&&im!=null?(c+im)/2:null, spread, sd};
  }
  function adaptiveInterpret(){
    const data={}; E.D.forEach((d)=>{ const s=domainAdaptiveStats(d); data[d]={core:s.core,impact:s.impact,nCore:s.coreCount,nImpact:s.impactCount>=2?4:s.impactCount}; });
    return E.interpret({mode:"deep",data,barriers:[],connections:[],constraints:[]});
  }
  function distance(v){ return v==null?99:Math.min(...AD.thresholds.map(t=>Math.abs(v-t))); }
  function addFirstExtension(){
    const ir=adaptiveInterpret(), stats=Object.fromEntries(E.D.map(d=>[d,domainAdaptiveStats(d)]));
    const ranked=[...E.D].sort((a,b)=>(ir.rows[b]?.opportunity||0)-(ir.rows[a]?.opportunity||0));
    const top3=new Set(ranked.slice(0,AD.topAttention)), top5=new Set(ranked.slice(0,AD.topResolution)), baseline=ir.diagnostic?.baseline;
    const add=[];
    E.D.forEach((d)=>{
      const s=stats[d], reasons=[];
      const near=distance(s.core)<AD.near||distance(s.impact)<AD.near;
      const contrast=s.core!=null&&s.impact!=null&&Math.abs(s.core-s.impact)>=AD.contrast&&((s.core<3.05&&s.impact>3.05)||(s.impact<3.05&&s.core>3.05));
      const anchor=s.core>=AD.anchorCore&&s.impact>=AD.anchorImpact&&((s.mean??0)>=(baseline??0)+AD.anchorRelative||(s.mean??0)>=4.3);
      if(top3.has(d)) reasons.push("top Attention candidate");
      if(contrast) reasons.push("Presence × Impact contrast");
      if(anchor) reasons.push("possible Anchor");
      if(near&&top5.has(d)) reasons.push("near an interpretation threshold");
      if(reasons.length&&!Number.isFinite(A[`${d}|5`])) add.push(qItem(d,5,reasons.join("; ")));
    });
    items.push(...add); adaptivePhase=1; return add.length;
  }
  function addSecondExtension(){
    const ir=adaptiveInterpret(), stats=Object.fromEntries(E.D.map(d=>[d,domainAdaptiveStats(d)]));
    const ranked=[...E.D].sort((a,b)=>(ir.rows[b]?.opportunity||0)-(ir.rows[a]?.opportunity||0));
    const top5=new Set(ranked.slice(0,AD.topResolution)), baseline=ir.diagnostic?.baseline, add=[];
    E.D.forEach((d)=>{
      const s=stats[d]; if(s.impactCount!==3||Number.isFinite(A[`${d}|6`])) return;
      const reasons=[];
      const veryNear=distance(s.core)<AD.veryNear||distance(s.impact)<AD.veryNear;
      const contrast=s.core!=null&&s.impact!=null&&Math.abs(s.core-s.impact)>=.38&&((s.core<3.05&&s.impact>3.05)||(s.impact<3.05&&s.core>3.05));
      const anchor=s.core>=3.55&&s.impact>=3.55&&((s.mean??0)>=(baseline??0)+.27||(s.mean??0)>=4.35);
      if(top5.has(d)) reasons.push("still interpretation-relevant");
      if(contrast) reasons.push("Presence × Impact contrast remains");
      if(anchor) reasons.push("Anchor status remains plausible");
      if(s.sd>=AD.unstable) reasons.push("impact evidence remains varied");
      if(veryNear) reasons.push("still very close to a threshold");
      if(reasons.length) add.push(qItem(d,6,reasons.join("; ")));
    });
    items.push(...add); adaptivePhase=2; return add.length;
  }
  function extendOrFinish(){
    if(!deep) return finishQuestions();
    if(adaptivePhase===0){ const n=addFirstExtension(); if(n) return render(); }
    if(adaptivePhase<=1){ const n=addSecondExtension(); if(n) return render(); }
    finishQuestions();
  }
  function finishQuestions(){ buildPre(); $("assess").classList.add("hide"); $("pre").classList.remove("hide"); scrollTo(0,0); }

  window.next=function(){
    const r=document.querySelector("[name=a]:checked"); if(!r) return alert("Choose a response, or select Not applicable.");
    A[items[idx].k]=r.value==="NA"?"NA":+r.value;
    idx++;
    if(idx<items.length){ render(); centre(); }
    else extendOrFinish();
  };
  window.back=function(){
    if(idx===0){ location.assign(`./scale.html?mode=${deep?"deep":"quick"}`); return; }
    idx--; render(); centre();
  };

  const C=["In personal prayer or quiet time with God","Through Scripture, study or reflection","In gathered worship or church","Through relationships and Christian community","While serving or caring for other people","In nature, creation or being outdoors","Through music, worship or creativity","In silence, solitude or stillness","In everyday life, work or family","I am finding it difficult to experience connection with God right now"];
  const B=[["Busyness, hurry or an overloaded schedule","busyness"],["My phone, social media or digital distraction","digital"],["Tiredness, poor sleep or lack of energy","tiredness"],["Work, study or other responsibilities","work"],["Family demands or caring responsibilities","work"],["Lack of consistent rhythms or habits","uncertain"],["Stress, anxiety or emotional load","stress"],["Disappointment, doubt or spiritual dryness","dryness"],["Feeling unsure where or how to begin","uncertain"],["Trying to do too much rather than focusing on what matters","overdoing"]];
  function block(t,a,obj){ return `<h2>${t}</h2><p class="note">Choose up to three.</p><div class="opts">${a.map((x,i)=>`<label class="opt"><input type="checkbox" data-i="${i}"> ${obj?x[0]:x}</label>`).join("")}</div><label><span class="sr-only">Other response</span><input class="other" placeholder="Other…" aria-label="Other response"></label><p class="selection-status note" role="status" aria-live="polite">0 of 3 selected.</p>`; }
  function buildPre(){
    $("r1").innerHTML=block("Where do you currently experience the greatest sense of connection with God?",C,false);
    $("r2").innerHTML=block("What most often gets in the way of the life with God that you desire?",B,true);
    ["r1","r2"].forEach((id)=>{ const e=$(id),cs=[...e.querySelectorAll("[type=checkbox]")],o=e.querySelector(".other"),status=e.querySelector(".selection-status"); const u=()=>{const n=cs.filter(x=>x.checked).length+(o.value.trim()?1:0);cs.forEach(x=>x.disabled=n>=3&&!x.checked);o.disabled=n>=3&&!o.value.trim();status.textContent=`${n} of 3 selected${n>=3?"; maximum reached":""}.`;};cs.forEach(x=>x.onchange=u);o.oninput=u; });
  }

  function scores(){
    const data={},s={};
    E.D.forEach((d)=>{
      const c=[],i=[]; for(let j=0;j<4;j++) if(typeof A[`${d}|${j}`]==="number") c.push(A[`${d}|${j}`]);
      if(deep) for(let j=4;j<8;j++) if(typeof A[`${d}|${j}`]==="number") i.push(A[`${d}|${j}`]);
      const cv=c.length>=2?avg(c):null, iv=deep?(i.length>=2?avg(i):null):cv;
      data[d]={core:cv,impact:iv,nCore:c.length,nImpact:deep?(i.length>=2?4:i.length):c.length,adaptiveImpactCount:deep?i.length:c.length};
      s[d]=deep?avg([cv,iv].filter(v=>v!=null)):cv;
    }); return [data,s];
  }

  const areaText={
    Emerging:["This dimension is currently more invitation than established rhythm. Formation here often begins with curiosity, permission and one small opening for grace.","There are early signs of movement here, though this part of formation may still feel unfamiliar or intermittent. The invitation is to explore rather than perfect.","This area is beginning to appear, but does not yet seem to have a dependable place in ordinary life. Small, repeatable experiences can help it take root."],
    Establishing:["This dimension has begun to take a recognisable place in your life, though it may still require conscious intention to sustain. The task is to protect what has begun without turning it into performance.","A genuine pattern is being established here. The next movement is toward integration — allowing this dimension to shape ordinary choices and reactions, not only designated moments.","This part of formation now has enough continuity to support growth. The invitation is to let consistency deepen into receptivity, freedom and relationship."],
    Deepening:["This dimension is becoming integrated into ordinary life rather than remaining a separate spiritual activity. The opportunity now is to attend to what kind of person it is helping you become.","There is depth and continuity here. The invitation is less about doing more and more about allowing established rhythms to keep opening you to grace, surrender and transformation.","This area is becoming part of the architecture of ordinary life. Deepening now means greater honesty, freedom and attentiveness to the fruit being formed in you."],
    Sustaining:["This dimension appears well established and is likely functioning as a stable support for your formation. The invitation is not necessarily to increase it, but to receive it gratefully and let it strengthen growth elsewhere.","This part of formation seems deeply woven into ordinary life and may provide a dependable place of return in seasons of pressure, change or disruption.","This dimension appears deeply sustaining. Its next movement may be generative — allowing what is rooted here to overflow in ways that nourish others and support less-established areas."],
  };
  function areaDescription(a,ds){ const vals=ds.map(d=>S[d]).filter(v=>v!=null),m=avg(vals),st=stage(m),spread=Math.max(...vals)-Math.min(...vals),salt=a==="Life with God"?1:a==="Life with Others"?2:3,ix=Math.abs(Math.round(m*100)+Math.round(spread*31)+salt)%3; return `<strong>${areaText[st][ix]}</strong>`; }

  window.profile=function(){
    const z=scores(); S=z[1];
    const bars=[...$("r2").querySelectorAll("[type=checkbox]:checked")].map(x=>B[+x.dataset.i][1]);
    IR=E.interpret({data:z[0],barriers:bars,connections:[],constraints:[],mode:deep?"deep":"quick"});
    if(deep) IR.diagnostic={...IR.diagnostic,adaptive:true,actualQuestions:answeredCount(),adaptiveVersion:"embedded-v1.1"};
    $("domains").innerHTML=E.D.map((d)=>S[d]==null?`<div class="domain"><b>${d}</b> · Insufficient response</div>`:`<div class="domain"><div class="top"><b>${d}</b><span class="pill">${stage(S[d])}</span></div><div class="bar"><div style="width:${Math.max(7,((S[d]-1)/4)*100)}%"></div></div><div class="desc"><strong>${words[stage(S[d])]}</strong> ${d} reflects ${defs[d]}.</div></div>`).join("")+`<p class="note"><em>The bars locate each domain within a broad developmental landscape; they are not precise or definitive measurements.</em></p>`;
    $("areas").innerHTML=["Life with God","Life with Others","Life with Self"].map((a)=>{const ds=E.D.filter(d=>G[d]===a&&S[d]!=null),v=avg(ds.map(d=>S[d]));return `<div class="area"><div class="ey">${a}</div><div class="status">${stage(v)}</div><p>${areaDescription(a,ds)}</p></div>`;}).join("");
    $("anchor").innerHTML=`<div class="ey">Your Anchor</div><h2>${IR.anchors.join(" + ")||"No clearly differentiated Anchor"}</h2><p>${IR.anchors.length?"This appears to be an established grace you may be able to draw from as you grow elsewhere.":"Several rhythms may be supporting you, but none stands apart strongly enough to name confidently."}</p>`;
    const d=IR.attention,title=d?d:IR.broad?"Broad Invitation":"Open Invitation";
    $("attention").innerHTML=`<div class="ey">Your Attention</div><span class="confidence">${IR.confidence}</span><h2>${title}</h2><div class="why">${explain(d)}</div>${IR.alternates?.length?`<p><strong>Also worth holding in discernment:</strong> ${IR.alternates.join(" + ")}</p>`:""}`;
    $("inv").textContent=$("invite").value.trim()?`“${$("invite").value.trim()}”`:"“No invitation entered.”";
    makePlan(d); makeResources(d||IR.alternates?.[0]||IR.anchors?.[0]||"Prayer",bars); buildPrintSummary(d);
    $("pre").classList.add("hide"); $("prof").classList.remove("hide"); scrollTo(0,0);
  };

  function explain(d){ if(IR.broad)return"Formation opportunity appears broadly distributed rather than concentrated in one domain. Begin gently with what most resonates with your own sense of God’s invitation.";if(!d)return"No single area is sufficiently differentiated to justify naming it as your primary Attention. Formation leaves room for prayerful discernment rather than manufacturing certainty.";const p=IR.rows[d].pattern;if(!deep)return`${d} stands out as a relative area of opportunity. The shorter assessment intentionally makes a modest claim rather than diagnosing why.`;if(p==="Begin")return`${d} currently appears to have less room. A small, accessible practice may be fruitful.`;if(p==="Make Room")return`${d} appears meaningful when present; the invitation may be to make more consistent room for it.`;if(p==="Deepen")return`${d} appears present but may benefit from greater depth, honesty, receptivity and integration rather than simply doing more.`;return"This area may be worth holding gently in prayer and reflection."; }

  const practices={Prayer:"Spend five unhurried minutes on three days each week in gratitude, honesty and listening.",Scripture:"Read one short Gospel passage three times each week.",Solitude:"Put your phone somewhere else and spend ten unhurried minutes alone with God three times each week.",Fasting:"Choose one safe, simple form of abstinence for a defined period each week.",Sabbath:"Protect one extended block each week to stop ordinary productivity and make room for rest, worship and delight.",Community:"Have one honest conversation each week with a trusted Christian.",Generosity:"Choose one deliberate act of generosity each week.",Witness:"Pray for one person and stay attentive to one natural opportunity for an honest spiritual conversation.",Service:"Notice one concrete need each week and respond without needing recognition.",Environment:"Create one phone-free, low-distraction place or period each day.","Use of Time":"Create one recurring block of margin each week.",Sleep:"As circumstances allow, protect a consistent 30-minute wind-down before sleep.","Physical Health":"Choose one sustainable practice of movement, nourishment or recovery and repeat it three times each week.","Inner Life":"Once each day, pause to name one emotion, one desire and one concern honestly before God."};
  function makePlan(d){ if(!d){$("plan").innerHTML="<h2>Let your own Invitation lead.</h2><p>Choose one small four-week experiment that resonates with what you sense God may be inviting you into.</p>";return;}$("plan").innerHTML=`<div class="ey">${d} · ${stage(S[d])}</div><h2>${practices[d]}</h2><div class="week"><b>Week 1 — Make space.</b> Establish the rhythm without trying to perfect it.</div><div class="week"><b>Week 2 — Notice.</b> What happens within you and before God?</div><div class="week"><b>Week 3 — Draw from your Anchor.</b> Let an established grace support this experiment.</div><div class="week"><b>Week 4 — Discern.</b> What was life-giving, difficult or revealing?</div>`; }
  function makeResources(d,bars){ $("restitle").textContent=`Resources for ${d}`;resourceRows=RE?.recommend?RE.recommend({attention:d,pattern:IR.rows[d]?.pattern,anchor:IR.anchors?.[0],barriers:bars,invitation:$("invite").value,baseline:IR.diagnostic?.baseline}):R[d]||[];$("res").innerHTML=resourceRows.map(r=>typeof r==="string"?`<div class="resource"><h3>${r}</h3></div>`:`<div class="resource"><div class="ey">${r.type||"Resource"}</div><h3>${r.title}</h3><p>${r.author||""}</p><p>${r.why||""}</p>${r.url?`<a href="${r.url}" target="_blank" rel="noopener">Open resource ↗</a>`:""}</div>`).join(""); }
  function buildPrintSummary(attention){ const name=attention?attention:IR.broad?"Broad Invitation":"Open Invitation",inv=$("invite").value.trim()||"No invitation entered.",areaRows=["Life with God","Life with Others","Life with Self"].map(a=>{const vals=E.D.filter(d=>G[d]===a).map(d=>S[d]).filter(v=>v!=null);return`<div class="print-row"><strong>${a}</strong><span>${vals.length?stage(avg(vals)):"Insufficient response"}</span></div>`;}).join(""),resources=resourceRows.slice(0,5).map(r=>typeof r==="string"?`<li>${esc(r)}</li>`:`<li><strong>${esc(r.title)}</strong>${r.author?` — ${esc(r.author)}`:""}</li>`).join("");$("printSummary").innerHTML=`<div class="ey">Your Formation Profile</div><h1>A picture of this season.</h1><p class="print-meta">${deep?`Formation Discernment · adaptive · ${answeredCount()} questions`:"Formation Assessment · 56 questions"}</p><h2>Fourteen domains</h2><div class="print-grid">${E.D.map(d=>`<div class="print-row"><strong>${d}</strong><span>${S[d]==null?"Insufficient response":stage(S[d])}</span></div>`).join("")}</div><h2>Three areas</h2><div class="print-grid">${areaRows}</div><div class="print-grid"><div class="print-callout"><strong>Anchor</strong><br>${esc(IR.anchors.join(" + ")||"No clearly differentiated Anchor")}</div><div class="print-callout"><strong>Attention</strong><br>${esc(name)} · ${esc(IR.confidence)}</div></div><div class="print-callout"><strong>Invitation · In your own words</strong><br>“${esc(inv)}”</div><h2>Four-week experiment</h2><p>${attention?esc(practices[attention]):"Choose one small four-week experiment that resonates with what you sense God may be inviting you into."}</p><h2>Selected resources</h2><ul class="print-resources">${resources}</ul><footer class="print-note">Formation stages are reflective language, not grades or definitive measurements. Raw question responses are not included.</footer>`; }
  window.copySummary=async function(){const t=`FORMATION PROFILE\nAnchor: ${IR.anchors.join(" + ")||"—"}\nAttention: ${IR.attention||(IR.broad?"Broad Invitation":"Open Invitation")}\nInvitation: ${$("invite").value||"—"}`;try{await navigator.clipboard.writeText(t);$("shareStatus").textContent="Profile summary copied.";}catch{$("shareStatus").textContent="Copy was unavailable in this browser. You can still print or save the one-page profile.";}};
  window.printProfile=function(){$("shareStatus").textContent="Opening the printable one-page profile.";window.print();};

  render(); centre();
})();