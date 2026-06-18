/* ============ S1L Info-Hub — Banner oben auf jeder Seite ============
   Fügt ganz oben das Hub-Banner ein (img/banner-hub.jpg). Auf R4-Seiten
   (Dateiname beginnt mit "S1L-R4") zusätzlich das Gold-Krone-Emblem.
   Einbinden via: <script src="banner.js"></script>
   Bilder liegen in web/img/. Größe/Zuschnitt steuert style.css (.hub-banner). */
(function(){
  function init(){
    if(document.getElementById('hubBanner')) return;
    var page=(location.pathname.split('/').pop()||'').toLowerCase();
    var isR4=page.indexOf('s1l-r4')===0;
    var wrap=document.createElement('div');
    wrap.id='hubBanner'; wrap.className='hub-banner'+(isR4?' is-r4':'');
    var img=document.createElement('img');
    img.className='hub-banner-img';
    img.src='img/banner-hub.jpg';
    img.alt='[S1L] Super League — Tiles Survive Alliance';
    wrap.appendChild(img);
    if(isR4){
      var em=document.createElement('img');
      em.className='hub-r4-emblem';
      em.src='img/emblem-r4.png'; em.alt='R4';
      wrap.appendChild(em);
    }
    document.body.insertBefore(wrap, document.body.firstChild);
    /* Auch auf dem Login-/Eintritts-Screen: Banner oben in die Login-Karte. */
    var gbox=document.querySelector('#gate .box');
    if(gbox && !gbox.querySelector('.gate-banner')){
      var gb=document.createElement('div'); gb.className='hub-banner gate-banner';
      var gi=document.createElement('img'); gi.className='hub-banner-img';
      gi.src='img/banner-hub.jpg'; gi.alt='[S1L] Super League — Tiles Survive Alliance';
      gb.appendChild(gi); gbox.insertBefore(gb, gbox.firstChild);
    }
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
