/* ============ S1L Info-Hub — R4-Bereich Login (zweites Passwort) ============
   EIGENES Tor für den R4-/Offiziers-Bereich — getrennt vom Mitglieder-Login (auth.js)
   UND vom Verwaltungs-Login. EINZIGE Stelle zum Passwort-Wechsel: die Liste R4_ALLOWED unten
   + das R4-Passwort, das du SEPARAT mitteilst — NIE hier im Klartext (Quelltext ist öffentlich!).
   Jeder Eintrag = SHA-256 von "spielername:passwort" — Name UND Passwort klein geschrieben
   (Login ist groß-/kleinschreibungs-unabhängig: Eingabe wird vor dem Hashen kleingeschrieben).
   Stand 22.06.2026: Trusted-/R4-Kern (10) — +Frenchy78, +Gab3ssss (Jac 22.06.). Löst die alte Verwaltungsseite ab.
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var R4_ALLOWED = [
  "5cb12da49b65a3e3dc8a1e8c56492d7fe55a8a6d14281f85dbbe00e1feb9bf07", // kingeder
  "9aea7ebeba24779dc7db134bb428dc552b58898bdff23f435758f5a61cab2594", // crexoog
  "2fd6719e67998b69432938a72e0006c08b78522f04bb5f5defe66307b0a3652d", // hmx
  "43f8e523744923e6a842473538fba2974dde6d587e8a46c7a30e8ad139a22ed4", // lady m
  "7e837083c68e26df18d872c16f18f09e28db7c2ca444f87d0a629ba5ecf7e081", // jac
  "3ef5a8efcea34b84ab13d2e1b5c80415b5333b90a8b6e87a3b7fc79c1c9dea42", // ghob
  "10755cff90e80c8eed248a5a4ed50c62133f4a8794f36368456b0dcd48fa82c2", // војвода
  "92b0c80b4999ac172afbd1bf1c1b8f255b2599907931cb2ea830652c871bac93", // bismillah
  "012479e27d0878955456a7c19c22bb686c6112e4edea558124c30e4ea4c64e86", // frenchy78
  "714e26f9c145514c1791f34da513bc7ba7af3461ffb1681f79eb1662f60040af"  // gab3ssss  (Schreibweise prüfen: 4x s)
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
    if(R4_ALLOWED.indexOf(hsh)>-1){ sessionStorage.setItem('s1l_r4_ok','1'); sessionStorage.setItem('s1l_r4_name', nm.value.trim()); reveal(); }
    else { err.textContent='Kein R4-Zugriff (Name oder Passwort stimmt nicht).'; pw.value=''; pw.focus(); }
  }
  go.addEventListener('click', tryOpen);
  pw.addEventListener('keydown', function(e){ if(e.key==='Enter') tryOpen(); });
  nm.addEventListener('keydown', function(e){ if(e.key==='Enter') pw.focus(); });
  nm.focus();
}
if(document.readyState!=='loading') r4Init(); else document.addEventListener('DOMContentLoaded', r4Init);
