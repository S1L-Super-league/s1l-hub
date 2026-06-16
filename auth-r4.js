/* ============ S1L Info-Hub — R4-Bereich Login (zweites Passwort) ============
   EIGENES Tor für den R4-/Offiziers-Bereich — getrennt vom Mitglieder-Login (auth.js)
   UND vom Verwaltungs-Login. EINZIGE Stelle zum Passwort-Wechsel: die Liste R4_ALLOWED unten
   + das R4-Passwort, das du SEPARAT mitteilst — NIE hier im Klartext (Quelltext ist öffentlich!).
   Jeder Eintrag = SHA-256 von "spielername:passwort" (Name klein geschrieben).
   Stand 16.06.2026: Trusted-/R4-Kern (8). Löst die alte Verwaltungsseite ab.
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var R4_ALLOWED = [
  "75ed960ca7e896a38a50d2891bac3459549dd6eaf293515a2d30d78f28c89050", // kingeder
  "1d0699ca996b6f9adca85a0f56e3e6253cdbb3233826be2c9b97673c51cb8c8c", // crexoog
  "8457c1ae37818feea5e95c93189caedaf303f8d8ed593c36959d14a1ad9a31c1", // hmx
  "cf49f54e52510e0ab21747c81d1d743f450f80ac5392421e3f242cec7f8e2031", // lady m
  "922b0b521d77f22836dfe466705119ed26b2342115887ec0c1a32ba86c03dfa3", // jac
  "4fe571b256cf12da1da3932f914271e400b9cd3aee7593cefd0714c03381ac4c", // ghob
  "17f474f68eeed2734ac8a5dd6519d65c54f01093cfc748cc5dbc169245bb082f", // војвода
  "de750a08180c542b94f846dbb42e214770caa0329b42c82ef08f79dd0896fd77"  // bismillah
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
    var n=nm.value.trim().toLowerCase(), p=pw.value;
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
