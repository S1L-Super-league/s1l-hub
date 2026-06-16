/* ============ S1L Info-Hub — Login (Name + Passwort) ============
   EINZIGE Stelle zum wöchentlichen Passwort-Wechsel: die Liste ALLOWED unten.
   Jeder Eintrag = SHA-256 von "spielername:passwort" (Name klein geschrieben).
   Neue Liste erzeugt Alex aus dem aktuellen Roster (nur Hashes, keine Klarnamen).
   Demo-Passwort: S1L-loewen  ·  Demo-Namen: jac, kingeder, crexo, morrigan.
   Sicherheit bewusst leicht (clientseitig); keine sensiblen Daten ablegen. */
var ALLOWED = [
  "edd96893aa4414c421116d8a7bd795af1492a5c090a8fa664d0596af069646b8", // jac
  "4137edbc0ebffdabe31ab415115b8ff6d97b0fb24cf56b37e57f842097489386", // kingeder
  "2d469217a6902abc3965077a9e8f4972467272d33b0354f1e55412d4832af979", // crexo
  "e0d5a76f1003572af9426c6b83ea7da8cb14c665dc7fbad5c50ad09e4f4bab32"  // morrigan
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
    var n=nm.value.trim().toLowerCase(), p=pw.value;
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
