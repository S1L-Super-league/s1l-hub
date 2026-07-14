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
  "8ddfe0d79f4fae0500570111d9c724975c4785625310e9bb907bf5842e6a199d", // drdr387 (R3 — nur S1L, kein R4)
  "6946908a32e018b9f21b25a42d8de1dbcc34713c196fdd7ea7bf969d822c939b", // shadow (R3 — nur S1L, kein R4)
  "24f9bbecbf1ca2c56bdd692373c19b779643a99ae917cf6f9178374d277efe45", // blümchen (reguläres Mitglied — nur S1L, kein R4; hinzugefügt 22.06.2026)
  "f46f09ca848b5bd2d17520ebca8ba30418695ccddb0a9664f4b308a2eb3493a6", // lili (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "3290b4ad79f601ef6de3bdae0cb81be958ab8b08b43e94bfb6a99551cfe3fb2c", // jcarvalho (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "807864f181369f09ba5f3c412bc0e562a9aca3b8b68369b897150a78dc5d7fab", // Lignum (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "57412b16eb5dc03d95f899a94f55e6461fc645407072b5ab7e3552524fda7b10", // Waldorf (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "e1efd7279bb392c0ed0eb3c46bf576c48944cb4a239d21959e86e7ad9599152e", // Burzowy (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "5b355e7dffe187614b1dca30da28622a8f4144646e1788d9e5150d4ddeb02835", // Hysté (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "faf598027619e02f7688d13c8d195db524cda9fe66edba20509b6d25ad05ec7d", // Uur67 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "faf91945cdf68b5c432a7626b340dcfedfb217a9e79cf60aca2b0e1a034e7183", // КАВКАЗ (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "e7117b958f2882a65c448aa5cd1da0a184d3f0dbbd01e1962f03c7bb2fda92c2", // Бес 01 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "4b0f0fe71854e74e473bda6bcd6f81899b01ff408f76281ca548195a84fd9dab", // Лисса (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "c8183a603d3a9cd43b3a88725312eef582f84f8b1d17eda864e911e3f9a61885", // русич (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "88740e96c22e2f306885827b0e021a14ba99b8ec2896bfea51abd2769c699fb9", // Мохентохен (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "f4cb9a7112a11562f3a416f8701f91e2460678a5ae67a95e4656a31c9a130fd7", // Stels (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "69d10e1808d8ca85a20ee635e8068fe801d93d3088cf11843c667cfbbf00c68e", // Перчик (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "b4fe9861aab950244bb9d04177c0e8ec7f8af5134d84847f0873f30c8d106432", // Johnny88 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "beb04317289fc0a874eb1eb6d874f3dc7746f1d5b6d460e4830c52ce4d7f3a13", // Алёна93 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "d21e1b133537eebadadf5a8665112dc067aeea55155d250996bc1a5ddd98a8c6", // BEOWULF (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "ba178be821e0e667c4345e7531f3e13e18b88fcc3e172f317374a5307758ae07", // TilouTW (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "bb8955197c04e83eedfade520e5a3a450e5e2788ff728f8894d2804cb8423f14", // White Horse (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "9b777db26a1c39c91a59dac188a3d470e4e6d3ff3e4a648338f436d8ec6db6e0", // Trinket Lipslums (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "b2448c6522dfd9a111fe3d260f20f42cb41de21f3e36f3461d95cfe58c861cfc", // CleoGreen (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "06418d9f2023dfc976e74afd34b4381f63947a794a11ad8e890cbf4549ca0c64", // Just Jack (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "fee0dd59731b099893ed327f039ba50a6eb9b24229a6e4f8d9a7e9e02b13e085", // BAD BUDDHA (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "84df49e2449eaa503ed5dab9c40bba018efeed0ddc4e8b08ebd1ae47e39254e8", // Колбаса (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "6f36aba665c636ab663262278643c6d7781e1ef31b8c27a5f6c1e375666b68f2", // Desol1te (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "60adbe7f0f9866e2b2bec153e661c69e339b7d413c98f37ef676f9a2add3d876", // tourist (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "a567b7e13522c267826965f07e2397d1e4b199059fe0d32491c8054cb47443d2", // FeNoMeN (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "08e7c2797bc27d33d09cc55d3e7ee3adf8cc3307c1473db469c9163e3071c536", // Lameruka (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "41728c6324aa4ac2a37c49814399e70dbf848d5f9ce187429a7c0c5f2a610b5e", // 3 кило (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "52078c9372efada495ff73f67e369897c2399d58b178f51b5e09768af49c05a9", // Malina (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "c9a4378e949973aa5fbacc89eb9369d2c42711cea1f7b38142cacc430f25c02e", // DivineSpectre326 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "91aea847ef64284bee741e349ed449a441205e4b39982ca1f7a124b4bef236f5", // Sirdeath89 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "5b9a42ffabe0cff79646e63b1e18974e3777acf00e92a98a4642acabfa46d291", // Pedro (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "36a8f9701fc06940b7eb733938c5ab8c2c43f2e8b326e437f7df91e9c7ca4836", // St Valentine (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "df8cf7a89c10b54955170b4f12e3d8362e2c9a054f811f33f3515445faa7eb76", // SirCoconut (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "05176e30b14bdfcff8a881ae7c7242cea86c3ff9b6525a3490ef391d8d69902b", // Nelson Mandela (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "2e00e37a4daa78f8dedf9a723a1a09750617aa7606ebf873d077907fa4ba6f84", // Lilija (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "a3d1bc60da560c51c135c107313c4594584613e855dc878d180201232e490749", // Chris1909 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "e750ebc8ca65db7161df6ba6c9e131b224be9c0ab8d75040ebc9fd6baabe9f6d", // OppaiDragon (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "43ed97e34e4a173845069031950311d50a0e6940fad4919c3c752d679aa4abeb", // Аида29 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "2ac304f6f08a27680823694b47721b1353db32ae1a7cbe801d556fe72dac5cba", // Carletto (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "e54c063738a499eb5f15006d64f76adee6b3d1ec93cbc95aca6b4bcc7b53bc91", // IBMVI (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "2e5282f7e98182a3065d0bc8a4dc74de40e9d27592dd59ab4051034e8a602ca7", // Yagyu (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "dc74ecaa1cf4924c77f8f7aff6bce3be3cbb4a8e997cfa10956f395ed8bb0f0d", // a_maevskaya (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "64f5166cc0da7775d4ca9e7a5023e206290f954a1f8491acb88d7d7e3dcf2f73", // DavidCH (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "d36a809890071d2ab2446c9145c1bea90649550ba6d4f040263ca37f9568ef8d", // ScytheMare.exe (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "288eb3cba397b5e3a5e30ebff724473d08103bea44e71cfcd090477d1cfe88b1", // Golbeus (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "e52b8fada6b48c3bc4ba156aae3334840b02551e446b9517c72992b3b75a787e", // John Doe (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "7667658c9138d9e95914c5fffe2ebd14a5570522165ae90dc13a1198d92bd34e", // Schotti (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "e9c8052d509b04245923a6f9762afdd9396a60f802bed5940519bf95c0594b52", // NeuroSpicey (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "db52364fe73266cc6efb9bd085d3fd91f489d95716297982a70f2d6b32342578", // Morrígan (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "c3369896542a3b47cd3ea23b9e7426659b90fa82ba21189f913d2000714a72ce", // Ёжик ВД (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "734e8683a9e3c2bb48799298a7d388e01082845eba3cc0c76881116fd812656f", // LAL (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "0d9ab50dfb2965279b77d94156308805a02e93fcb7b8ee5d247048d2976a9041", // NorthernIEL (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "186c02a5951f76263137ee366a8fdbd82bfc820415a00d89b2f420bbbf28fb05", // Mèo (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "248fb24969005a3c4cee92062e4c8082f74690e91b95b90aa9f086736fcee36c", // HALIF (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "62f4db913c16d376c8ed7fa36ff481f560621799635a7cc63ce67756a7fc3832", // Mad0404 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "93a83919d569f48b89054560adbb145bfcba1a0ca071f573fe3ef41cced06430", // DigeDag (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "8ef2ed9bf44eb90bbbe824eb03ae7418eb73a236e8e1fef31d81b9d7c93b5236", // AffenJunge (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "d16f1c82f371a528ce03137c52e2d20d56b8fb131473de31ef90ba1016d9210b", // Qwe (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "cb4b84aec85f6e6e82f393fe8159e309989fc16ea38b266326b4895548699b68", // Cypher (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "385a9215fa80c872fd1a054732b1aa78693e19b96341816a0c274e58c3109473", // Kingventu (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "074c2942165c18334d21e1548f02d0b17464575be24230bc1f88f44986bc1c00", // Kringle (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "88c9ef27fe176e91624ee909da771be2f8b1d536fef172fc6c763b2bca7275ff", // Stefan Silni (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "278b36843cdfb8498fe2a7640502376b91fea483a6f508b7cc6522072329c467", // MaxPayne (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "082a7ab15c7640fac8c7e13207e00e2e2e3b3202a1d024f8a32021e466fe5a10", // Merowinger (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "8d6b513545cb81f245428b1976b4444122e54933598c200b6d5d9b7e9b751616", // B2B (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "febc7eced584fc473cfe2584ef204dc889b7481ed693adfd93bb687b9f2704c3", // GeoSwaer (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "1b773d0d8b6c15833a99246c15ab1c1dc5b4177f07b2acc0116becd6f61db125", // Don Ponteleimon (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "c87639d5fdc782469c8e720a82da00a5757c149aecf7a332b20148351b912cf9", // HateCore (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "a785055538949ac1c04d47e3adad21e7aafd7b0e3f095c3259cde22c9ba20846", // ROYAL MOOD (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "629e92dd256b4f34cab0a956c5b94782815b27fea8effa7aefeeb0c223fb6340", // KAIJAX (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
  "1d25276f043d76fd486862d69ed0591873ef9d3d44cca80326972e4ff8c31fe6", // Bodzio 73 (R3 — nur S1L, kein R4; hinzugefügt 14.07.2026)
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
  /* Wer als R4 angemeldet ist, ist automatisch auch fürs Mitglieder-Tor freigeschaltet (ein Login für alles). */
  if(sessionStorage.getItem('s1l_ok')==='1' || sessionStorage.getItem('s1l_r4_ok')==='1'){ sessionStorage.setItem('s1l_ok','1'); reveal(); return; }
  var go=document.getElementById('go'); if(!go) return;
  var nm=document.getElementById('nm'), pw=document.getElementById('pw'), err=document.getElementById('err');
  async function tryOpen(){
    var n=nm.value.trim().toLowerCase(), p=pw.value.trim().toLowerCase();
    if(!n||!p){ err.textContent='Bitte Name und Passwort eingeben.'; return; }
    var hsh=await hashInput(n+':'+p);
    if(ALLOWED.indexOf(hsh)>-1){ sessionStorage.setItem('s1l_ok','1'); sessionStorage.setItem('s1l_name', nm.value.trim()); reveal(); }
    else { err.textContent='Name oder Passwort stimmt nicht.'; pw.value=''; pw.focus(); }
  }
  go.addEventListener('click', tryOpen);
  pw.addEventListener('keydown', function(e){ if(e.key==='Enter') tryOpen(); });
  nm.addEventListener('keydown', function(e){ if(e.key==='Enter') pw.focus(); });
  nm.focus();
}
if(document.readyState!=='loading') s1lInit(); else document.addEventListener('DOMContentLoaded', s1lInit);
