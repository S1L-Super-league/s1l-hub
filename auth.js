/* ============ S1L Info-Hub — Login (Name + Passwort) ============
   EINZIGE Stelle zum Passwort-Wechsel: die Liste ALLOWED unten + das Passwort,
   das du den Mitgliedern SEPARAT mitteilst — NIE hier im Klartext (Quelltext ist öffentlich!).
   Jeder Eintrag = SHA-256 von "spielername:passwort" — Name UND Passwort klein geschrieben
   (Login ist groß-/kleinschreibungs-unabhängig: Eingabe wird vor dem Hashen kleingeschrieben).
   Stand 16.06.2026: nur Trusted-/R4-Kern (8). Reguläre Mitglieder folgen später.
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var ALLOWED = [
  "d2898ff9e1442e79e6376b96891e3e209074a49b9353b67b2488464ba01504b8", // kingeder
  "49d1801482e6e333a91c4e82ec3d297bfd40ff019c28ddaf6d3117d26638c497", // crexoog
  "45d0321d8dff232f48f10211fd1fd8e34e1e74d9b05270c3029ca8256263d46f", // hmx
  "ef5d38f4658e1fc15ce7c69ec76641d128ceddb38f9f96c1661d9c9a6540200a", // lady m
  "15eac333bfd3d9f85b0b921f163d23595746db8ec1b2d95404d09814aeb5de5c", // jac
  "5a77c09e14ebe859238b18b8e545fe417742fb07df269dd9080ed7e152d36af0", // ghob
  "b2962df639ce6a2c8b5a7bf0d1c48911e6b12fade87a43d490b7ad6943275904", // војвода
  "52c2b66e319c7e64ac77bcb9e935999b4e44df10b15cd4525378901ee084beb9", // bismillah
  "8ddfe0d79f4fae0500570111d9c724975c4785625310e9bb907bf5842e6a199d"  // drdr387 (R3 — nur S1L, kein R4)
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
function s1lInit(){
  if(sessionStorage.getItem('s1l_ok')==='1'){ reveal(); return; }
  var go=document.getElementById('go'); if(!go) return;
  var nm=document.getElementById('nm'), pw=document.getElementById('pw'), err=document.getElementById('err');
  async function tryOpen(){
    var n=nm.value.trim().toLowerCase(), p=pw.value.trim().toLowerCase();
    if(!n||!p){ err.textContent='Bitte Name und Passwort eingeben.'; return; }
    var hsh=await hashInput(n+':'+p);
    if(ALLOWED.indexOf(hsh)>-1){ sessionStorage.setItem('s1l_ok','1'); reveal(); }
    else { err.textContent='Name oder Passwort stimmt nicht.'; pw.value=''; pw.focus(); }
  }
  go.addEventListener('click', tryOpen);
  pw.addEventListener('keydown', function(e){ if(e.key==='Enter') tryOpen(); });
  nm.addEventListener('keydown', function(e){ if(e.key==='Enter') pw.focus(); });
  nm.focus();
}
if(document.readyState!=='loading') s1lInit(); else document.addEventListener('DOMContentLoaded', s1lInit);
