/* ============ S1L Info-Hub — R4-Bereich Login (zweites Passwort) ============
   EIGENES Tor für den R4-/Offiziers-Bereich — getrennt vom Mitglieder-Login (auth.js)
   UND vom Verwaltungs-Login. EINZIGE Stelle zum Passwort-Wechsel: die Liste R4_ALLOWED unten
   + das R4-Passwort, das du SEPARAT mitteilst — NIE hier im Klartext (Quelltext ist öffentlich!).
   Jeder Eintrag = SHA-256 von "spielername:passwort" — Name UND Passwort klein geschrieben
   (Login ist groß-/kleinschreibungs-unabhängig: Eingabe wird vor dem Hashen kleingeschrieben).
   Stand 08.07.2026: R4-Kern (9) — Roster nach In-Game-Screenshot (Jac 08.07.):
   +Froschi, +Elsa; −Lady M, −Војвода, −bismillah (stehen nicht mehr im R4-Bereich). Gab3ssss-Schreibweise bestätigt (4x s).
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var R4_ALLOWED = [
  "e994c837e798ff6f6e58d9579733759171f9e20a7f791d1d16e8170087e65838", // kingeder
  "ddd54b31ccd8112bd940fc46fc4d426958fc1b4f4c10bc85907d8a12bd74729b", // crexoog
  "fc6c219e256c806898fe96d3d7c6b150d05172934d99408e0bf71a571e768376", // hmx
  "7601160efad98f702c48be3b356648870a2298bb823b611cc5c5216d1868ae75", // jac
  "f9999752e7b6ff3603379461b162281e9ccdfa95cfe81288f9e91063ca2f65a3", // ghob
  "a2f3fd238287dfcd5c1057beefcc7c94647d097b6b5757778245e9acbb7c68a4", // frenchy78
  "a5053b1976bf77ccf7444d82fc1e2a5a9d69b0b26bf7d2f70e2eb3ae2683bffa", // gab3ssss
  "c49d46a7451e3aec6028310aec1c6fa35e36685f2294ab7cdb0a3da2d68b6c40", // froschi
  "d3af7e7134536bd27a5b43810eb347537f6c9adb1e03d757e68d20f4ec2bd717", // elsa
  "9ac557b2b69c718c3a8e761eaf0768b3561ef65f78d6932ebbda53703748ee76"  // bendix_pl
];

function sha256js(ascii){
  function rr(v,a){ return (v>>>a)|(v<<(32-a)); }
  var mp=Math.pow, mw=mp(2,32), result='', words=[], bl=ascii.length*8;
  var h=sha256js.h=sha256js.h||[], k=sha256js.k=sha256js.k||[], pc=k.length, comp={};
  for(var c=2; pc<64; c++){ if(!comp[c]){ for(var i=0;i<313;i+=c){comp[i]=c;} h[pc]=(mp(c,.5)*mw)|0; k[pc++]=(mp(c,1/3)*mw)|0; } }
  ascii+='\x80'; while(ascii.length%64-56) ascii+='\x00';
  for(i=0;i<ascii.length;i++){ var j=ascii.charCodeAt(i); if(j>>8) return; words[i>>2]|=j<<((3-i)%4)*8; }
  words[words.length]=((bl/mw)|0); words[words.length]=(bl);
  for(j=0;j<words.length;){
    var w=words.slice(j,j+=16), oh=h; h=h.slice(0,8);
    for(i=0;i<64;i++){
      var w15=w[i-15], w2=w[i-2], a=h[0], e=h[4];
      var t1=h[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&h[5])^((~e)&h[6]))+k[i]
        +(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
      var t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&h[1])^(a&h[2])^(h[1]&h[2]));
      h=[(t1+t2)|0].concat(h); h[4]=(h[4]+t1)|0;
    }
    for(i=0;i<8;i++){ h[i]=(h[i]+oh[i])|0; }
  }
  for(i=0;i<8;i++){ for(j=3;j+1;j--){ var b=(h[i]>>(j*8))&255; result+=((b<16)?0:'')+b.toString(16); } }
  return result;
}
async function hashInput(s){
  try{ if(window.crypto && crypto.subtle){
    var buf=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  }}catch(e){}
  return sha256js(unescape(encodeURIComponent(s)));
}
function reveal(){ var g=document.getElementById('gate'), c=document.getElementById('content'); if(g) g.style.display='none'; if(c) c.hidden=false; }
function r4Init(){
  if(sessionStorage.getItem('s1l_r4_ok')==='1'){ reveal(); return; }
  var go=document.getElementById('go'); if(!go) return;
  var nm=document.getElementById('nm'), pw=document.getElementById('pw'), err=document.getElementById('err');
  async function tryOpen(){
    var n=nm.value.trim().toLowerCase(), p=pw.value.trim().toLowerCase();
    if(!n||!p){ err.textContent='Bitte Name und R4-Passwort eingeben.'; return; }
    var hsh=await hashInput(n+':'+p);
    if(R4_ALLOWED.indexOf(hsh)>-1){ sessionStorage.setItem('s1l_r4_ok','1'); sessionStorage.setItem('s1l_r4_name', nm.value.trim());
      /* R4-Login schaltet zugleich den Mitglieder-Bereich frei (Jac 09.07.2026): ein Login für alles. */
      sessionStorage.setItem('s1l_ok','1'); sessionStorage.setItem('s1l_name', nm.value.trim()); reveal(); }
    else { err.textContent='Kein R4-Zugriff (Name oder Passwort stimmt nicht).'; pw.value=''; pw.focus(); }
  }
  go.addEventListener('click', tryOpen);
  pw.addEventListener('keydown', function(e){ if(e.key==='Enter') tryOpen(); });
  nm.addEventListener('keydown', function(e){ if(e.key==='Enter') pw.focus(); });
  nm.focus();
}
if(document.readyState!=='loading') r4Init(); else document.addEventListener('DOMContentLoaded', r4Init);
