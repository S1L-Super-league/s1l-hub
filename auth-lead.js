/* ============ S1L Info-Hub — Leitungs-Tor (drittes Passwort) ============
   ZUSÄTZLICHES Tor über dem R4-Login. Gilt nur für die Seiten, die es einbinden
   (Mitglieder-Register, Ist-Stand-Analyse). Zugelassen sind ausschließlich Jac und Kingeder.

   Jeder Eintrag = SHA-256 von "spielername:passwort", beides kleingeschrieben.
   Das Passwort steht NIE im Klartext hier — Quelltext ist öffentlich.
   Passwort-Wechsel: neuen Hash erzeugen und unten eintragen.

   ⚠️ SICHERHEIT BEWUSST LEICHT: Der Check läuft im Browser. Wer den Quelltext liest,
   kommt an die Daten. Das Tor hält Neugierige ab, keinen Entschlossenen.
   Stand 31.08.2026 (Jac). */
var LEAD_ALLOWED = [
  "dbfe9ccf19c32cb7a190c5e74776cb58414343269008f1e1560b125dea8378da", // jac
  "a2f75539367dde0b1daebec266fc15df6023df848a430d8421066cf067eb45ea"  // kingeder
];

(function(){
  function sha256(str){
    var K=[],H=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],p=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311];
    for(var i=0;i<64;i++){ K[i]=(Math.pow(p[i],1/3)%1*4294967296)|0; }
    var msg=[],bin=unescape(encodeURIComponent(str));
    for(i=0;i<bin.length;i++) msg.push(bin.charCodeAt(i));
    var l=msg.length*8; msg.push(0x80);
    while(msg.length%64!==56) msg.push(0);
    for(i=0;i<4;i++) msg.push(0);
    msg.push((l>>>24)&255,(l>>>16)&255,(l>>>8)&255,l&255);
    function rr(v,n){ return (v>>>n)|(v<<(32-n)); }
    for(i=0;i<msg.length;i+=64){
      var w=[],a,b,c,d,e,f,g,h,t1,t2,j;
      for(j=0;j<16;j++) w[j]=(msg[i+j*4]<<24)|(msg[i+j*4+1]<<16)|(msg[i+j*4+2]<<8)|msg[i+j*4+3];
      for(j=16;j<64;j++){
        var s0=rr(w[j-15],7)^rr(w[j-15],18)^(w[j-15]>>>3);
        var s1=rr(w[j-2],17)^rr(w[j-2],19)^(w[j-2]>>>10);
        w[j]=(w[j-16]+s0+w[j-7]+s1)|0;
      }
      a=H[0];b=H[1];c=H[2];d=H[3];e=H[4];f=H[5];g=H[6];h=H[7];
      for(j=0;j<64;j++){
        var S1=rr(e,6)^rr(e,11)^rr(e,25), ch=(e&f)^(~e&g);
        t1=(h+S1+ch+K[j]+w[j])|0;
        var S0=rr(a,2)^rr(a,13)^rr(a,22), mj=(a&b)^(a&c)^(b&c);
        t2=(S0+mj)|0;
        h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
      }
      H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;
      H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;
    }
    return H.map(function(x){ return ("00000000"+(x>>>0).toString(16)).slice(-8); }).join("");
  }
  function ok(){ try{ return sessionStorage.getItem("s1l_lead_ok")==="1"; }catch(e){ return false; } }
  function unlock(name){
    try{ sessionStorage.setItem("s1l_lead_ok","1"); sessionStorage.setItem("s1l_lead_name",name); }catch(e){}
    var g=document.getElementById("leadgate"); if(g) g.remove();
    var c=document.getElementById("content")||document.querySelector(".rw");
    if(c) c.removeAttribute("hidden");
    document.dispatchEvent(new Event("s1l:lead"));
  }
  function gate(){
    var box=document.createElement("div");
    box.id="leadgate";
    box.setAttribute("style","position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px;"+
      "background:linear-gradient(160deg,#152238,#0b1a2e);font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif");
    box.innerHTML=
      '<div style="background:#fff;border-radius:16px;max-width:400px;width:100%;padding:26px 24px;text-align:center">'+
      '<div style="font-size:2rem;line-height:1">🔐</div>'+
      '<h1 style="font-size:1.15rem;margin:8px 0 4px;color:#152238">Leitung</h1>'+
      '<p style="color:#66788f;font-size:.87rem;margin:0 0 18px">Diese Seite enthält Einschätzungen zu einzelnen Mitgliedern.<br>Zugang nur für <b>Jac</b> und <b>Kingeder</b>.</p>'+
      '<input id="lgN" placeholder="Spielername" autocomplete="off" style="width:100%;font:inherit;padding:9px 11px;border:1px solid #dde4ef;border-radius:9px;margin-bottom:9px">'+
      '<input id="lgP" type="password" placeholder="Passwort" autocomplete="off" style="width:100%;font:inherit;padding:9px 11px;border:1px solid #dde4ef;border-radius:9px">'+
      '<button id="lgB" type="button" style="width:100%;margin-top:13px;font:inherit;font-weight:700;padding:10px;border:0;border-radius:999px;background:#2563eb;color:#fff;cursor:pointer">Öffnen</button>'+
      '<div id="lgE" style="color:#dc2626;font-size:.85rem;min-height:20px;margin-top:9px"></div>'+
      '<p style="color:#94a3b8;font-size:.75rem;margin:6px 0 0">Der Schutz läuft im Browser — er hält Neugierige ab, keinen Entschlossenen.</p>'+
      '</div>';
    document.body.appendChild(box);
    function go(){
      var n=(document.getElementById("lgN").value||"").trim().toLowerCase();
      var p=(document.getElementById("lgP").value||"").trim().toLowerCase();
      if(!n||!p){ document.getElementById("lgE").textContent="Bitte Name und Passwort eingeben."; return; }
      if(LEAD_ALLOWED.indexOf(sha256(n+":"+p))>=0) unlock(n);
      else document.getElementById("lgE").textContent="Kein Zugang für diesen Namen.";
    }
    document.getElementById("lgB").addEventListener("click",go);
    box.addEventListener("keydown",function(e){ if(e.key==="Enter") go(); });
    setTimeout(function(){ var f=document.getElementById("lgN"); if(f) f.focus(); },60);
  }
  function boot(){
    var c=document.getElementById("content")||document.querySelector(".rw");
    if(ok()){ if(c) c.removeAttribute("hidden"); document.dispatchEvent(new Event("s1l:lead")); return; }
    if(c) c.setAttribute("hidden","");
    gate();
  }
  if(document.readyState!=="loading") boot(); else document.addEventListener("DOMContentLoaded",boot);
})();
