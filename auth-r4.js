/* ============ S1L Info-Hub — R4-Bereich Login (zweites Passwort) ============
   EIGENES Tor für den R4-/Offiziers-Bereich — getrennt vom Mitglieder-Login (auth.js)
   UND vom Verwaltungs-Login. EINZIGE Stelle zum Passwort-Wechsel: die Liste R4_ALLOWED unten
   + das R4-Passwort, das du SEPARAT mitteilst — NIE hier im Klartext (Quelltext ist öffentlich!).
   Jeder Eintrag = SHA-256 von "spielername:passwort" — Name UND Passwort klein geschrieben
   (Login ist groß-/kleinschreibungs-unabhängig: Eingabe wird vor dem Hashen kleingeschrieben).
   Stand 17.08.2026: R4-Kern (10), NEUES R4-Passwort gesetzt (Jac 17.08.2026) — alte Hashes ersetzt.
   Roster unverändert wie 08.07. (+Froschi, +Elsa; −Lady M, −Војвода, −bismillah). Gab3ssss: 4x s.
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var R4_ALLOWED = [
  "09790daf442e97e08a6853771a0b57148885059819b9cb57cd42bf9cba49a018", // kingeder
  "4ba775b4f76b6e30ef80ef37dcaf1c2294eacd68515ba31a31aa3e1de4cb6716", // crexoog
  "42c9668c10c7f1367798e7c8906bc2ec1c5fa6d5971e9e84da2f4c801ddad8b2", // hmx
  "4c9410a117e0fd7e9b17f970251c9176f21115f38c8a461b3dfa8f47e47b9347", // jac
  "e6a4b5bf320361717dea5dc2f91c676681d2a2a263d08c54147f16aff68a7dcc", // ghob
  "e6e154d1321e6906622216531a8a38a4c2d8a5aca78bcfc7fec253121b3e24f4", // frenchy78
  "7a9ebf9b1b5ca8d73d09174f3fe055228ce41eb41afae7aa4c6c245099f2b80f", // gab3ssss
  "efde889777a55cd3a28ff3268ccc959d526d8e16e6073a48efca32409adfae98", // froschi
  "ddacfafb3cf4d5eb456d10558ac0350dc4fcac7c7b6e1e6953c3eb9ce5662201", // elsa
  "12d3b11168e8b213b8575b7ab566fb3e0ecf9930dfd5ff5b1c1d496b2104b1fe"  // bendix_pl
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
