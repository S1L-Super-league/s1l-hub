/* ============ S1L Info-Hub — globaler Sprach-Umschalter (DE/EN) ============
   Zeigt oben rechts einen DE/EN-Schalter. Wahl bleibt gespeichert (localStorage).
   Übersetzt wird über Paare:  <span class="lng-de">..</span><span class="lng-en">..</span>
   (oder die Klassen lng-de / lng-en auf Block-Elementen). Nicht übersetzte Stellen
   bleiben sichtbar -> Standard ist Deutsch, EN-User sehen dort den DE-Text (Fallback). */
(function(){
  function apply(l){
    document.documentElement.setAttribute('data-lang', l);
    try{ localStorage.setItem('s1l_lang', l); }catch(e){}
    var bs=document.querySelectorAll('#langtoggle button');
    for(var i=0;i<bs.length;i++){ bs[i].classList.toggle('on', bs[i].getAttribute('data-l')===l); }
    document.documentElement.lang = l;
  }
  function init(){
    if(!document.getElementById('langtoggle')){
      var d=document.createElement('div');
      d.id='langtoggle'; d.setAttribute('role','group'); d.setAttribute('aria-label','Sprache / Language');
      d.innerHTML='<button type="button" data-l="de">DE</button><button type="button" data-l="en">EN</button>';
      document.body.appendChild(d);
      d.addEventListener('click', function(e){
        var b=e.target.closest ? e.target.closest('button') : (e.target.tagName==='BUTTON'?e.target:null);
        if(b) apply(b.getAttribute('data-l'));
      });
    }
    var saved='de'; try{ saved=localStorage.getItem('s1l_lang')||'de'; }catch(e){}
    apply(saved);
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
