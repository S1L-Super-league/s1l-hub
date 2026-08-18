/* ============ S1L Info-Hub — R4-Bereich Login (zweites Passwort) ============
   EIGENES Tor für den R4-/Offiziers-Bereich — getrennt vom Mitglieder-Login (auth.js)
   UND vom Verwaltungs-Login. EINZIGE Stelle zum Passwort-Wechsel: die Liste R4_ALLOWED unten
   + das R4-Passwort, das du SEPARAT mitteilst — NIE hier im Klartext (Quelltext ist öffentlich!).
   Jeder Eintrag = SHA-256 von "spielername:passwort" — Name UND Passwort klein geschrieben
   (Login ist groß-/kleinschreibungs-unabhängig: Eingabe wird vor dem Hashen kleingeschrieben).
   Stand 17.08.2026 (2. Update): R4-Liste neu nach Jacs Ansage — 15 Logins:
   kingeder, crexoog, jac, ghob, gab3ssss, froschi, Shadow, Yagyu, Anonymous, Alo, Lignum, EmoMuc, Neumi, Kleene, White Horse.
   Entfernt: hmx, frenchy78, elsa, bendix_pl. Passwort unverändert (heute gesetzt).
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var R4_ALLOWED = [
  "09790daf442e97e08a6853771a0b57148885059819b9cb57cd42bf9cba49a018", // kingeder
  "4ba775b4f76b6e30ef80ef37dcaf1c2294eacd68515ba31a31aa3e1de4cb6716", // crexoog
  "4c9410a117e0fd7e9b17f970251c9176f21115f38c8a461b3dfa8f47e47b9347", // jac
  "e6a4b5bf320361717dea5dc2f91c676681d2a2a263d08c54147f16aff68a7dcc", // ghob
  "7a9ebf9b1b5ca8d73d09174f3fe055228ce41eb41afae7aa4c6c245099f2b80f", // gab3ssss
  "efde889777a55cd3a28ff3268ccc959d526d8e16e6073a48efca32409adfae98", // froschi
  "9ac2ee70db3f0cca0c5f2e28d8a09c4977cd0286e7077aa6751480af183fb4c2", // shadow
  "b0ed736151bafcf2d9b4e0dad268f5a2e198a5d7cc4a4226602d3ecc34dc43e9", // yagyu
  "def3379c3c829f6bcc2a8959829271db5beebb4430fa753ff1837f76ae9a6539", // anonymous
  "e617cdf3e703dcd7834484cc41eef7b6c84eb63dcb012f5f04e4bb6d772b0ba5", // alo
  "48133f877ce96c7eb694b126589b4493a164970e73c3897c3705f305d2f28bbc", // lignum
  "49959517d362799777bb80dc4ce0f19e9c666c240a85fa6320699fd36320ae35", // emomuc
  "ca3664f89430fb540835180f90c5b4ad90209a0d6881e6aff1379296e8e94265", // neumi
  "854772b98bdc7603e8740e4bf8ab4fb3c3b52fbad1f34f4a5388955ccc81e26a", // kleene
  "9efcad1c5e1b44f5fdd287f664ca185517fb73561dafad69fd592685551bee50"  // white horse
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
