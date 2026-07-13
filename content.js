/* ============ S1L Info-Hub — R4-editierbare Kacheln (content.js) ============
   Macht Info-Kacheln (.card) für R4 editierbar: ✏️ ändern · ➕ neu · 🗑 entfernen.
   - Nur R4 (sessionStorage s1l_r4_ok) sieht die Knöpfe; Mitglieder sehen nur den Text.
   - R4 schreibt in EINER Sprache; der Cloudflare-Worker (Claude Haiku) übersetzt in DE/EN/TR/RU.
   - Gespeichert in Firestore-Sammlung 'content' (Doc-Id = cid = seite#index). Live über onSnapshot.
   - Versionierung: je Änderung Vorwert (prev_*) mitgesichert → „−"/Überschreiben rückholbar.
   - WICHTIG: Unbearbeitete Kacheln bleiben unangetastet (lang.js/DE-EN-TR-RU bleibt intakt);
     erst wenn R4 eine Kachel speichert, übernimmt content.js deren Text (einsprachig + Auto-Übersetzung).
   - Der HEUTE-Block (.today) ist bewusst AUSGENOMMEN (wird von engine.js gerollt; „Heute steht an" folgt separat).
   - Bild-Upload folgt, sobald der Storage-Bucket steht (STORAGE_READY).
   Einbinden NUR auf Mitglieder-Info-Seiten (NICHT Feedback/Mitmachen, NICHT Glossar), nach lang.js. */
(function(){
  var FB={ apiKey:"AIzaSyCeKoPKOVYKbN0OHkr3_T_nQwDtCALZD18", authDomain:"s1l-hub.firebaseapp.com", projectId:"s1l-hub", storageBucket:"s1l-hub.firebasestorage.app", messagingSenderId:"761448020039", appId:"1:761448020039:web:b65a7e1c1bac2f31831962" };
  var TRANSLATE_URL="https://s1l-translate.jacqueline-lex.workers.dev";
  var STORAGE_READY=false;  // true, sobald Storage-Bucket + Regeln stehen (Bild-Upload)
  var PRIO={de:['de','en','fr','it','es','tr','ru'],en:['en','de','fr','it','es','tr','ru'],fr:['fr','en','de','it','es','tr','ru'],it:['it','en','de','fr','es','tr','ru'],es:['es','en','de','fr','it','tr','ru'],tr:['tr','en','de','fr','it','es','ru'],ru:['ru','en','de','fr','it','es','tr']};
  function qp(k){ try{ return new URLSearchParams(location.search).get(k); }catch(e){ return null; } }
  var rawPage=(location.pathname.split('/').pop()||'index').replace(/\.html?$/,'');
  var isDynPage=(rawPage==='seite');
  var pageKey=isDynPage ? (qp('p')||'seite') : rawPage;   // generische Seite: Namensraum aus ?p=
  var DATA={}, col=null, wrapEl=null, TILES=[];

  function isR4(){ try{ return sessionStorage.getItem('s1l_r4_ok')==='1'; }catch(e){ return false; } }
  function editorName(){ try{ return sessionStorage.getItem('s1l_r4_name')||'R4'; }catch(e){ return 'R4'; } }
  function curLang(){ try{ var l=localStorage.getItem('s1l_lang'); if(l) return l; }catch(e){} return document.documentElement.getAttribute('data-lang')||'de'; }
  /* R3-Vorschau: R4 sieht den Hub wie ein Mitglied (keine Bedien-Knöpfe, ausgeblendete Kacheln weg). Zustand nur für diese Sitzung. */
  function previewOn(){ try{ return sessionStorage.getItem('s1l_preview')==='1'; }catch(e){ return false; } }
  function r4Active(){ return isR4() && !previewOn(); }   // „darf editieren + sieht Ausgeblendetes" — überall statt isR4() fürs Anzeigen der R4-Sachen
  function hasContent(doc){ return !!(doc && (doc.t_orig||doc.t_de||doc.t_en||doc.t_fr||doc.t_it||doc.t_es||doc.t_tr||doc.t_ru||doc.img||doc.type)); }
  /* Übersetzungen der R4-Bedien-Elemente (Buttons, Editor, Tooltips) */
  var UI={
    add:{de:'➕ Info-Kachel (immer offen)',en:'➕ Info tile (always open)',fr:"➕ Tuile d'info (toujours ouverte)",it:'➕ Riquadro info (sempre aperto)',es:'➕ Tarjeta de info (siempre abierta)',tr:'➕ Bilgi kartı (her zaman açık)',ru:'➕ Инфо-плитка (всегда открыта)'},
    addcollap:{de:'➕ aufklappbare Kachel (mit Überschrift)',en:'➕ Collapsible tile (with heading)',fr:'➕ Tuile déroulante (avec titre)',it:'➕ Riquadro espandibile (con titolo)',es:'➕ Tarjeta desplegable (con título)',tr:'➕ Açılır kart (başlıklı)',ru:'➕ Раскрывающаяся плитка (с заголовком)'},
    addpage:{de:'➕ Seite (Kachel → Seite)',en:'➕ Page (tile → page)',fr:'➕ Page (tuile → page)',it:'➕ Pagina (riquadro → pagina)',es:'➕ Página (tarjeta → página)',tr:'➕ Sayfa (kart → sayfa)',ru:'➕ Страница (плитка → страница)'},
    up:{de:'hoch schieben',en:'move up',fr:'monter',it:'sposta su',es:'subir',tr:'yukarı taşı',ru:'вверх'},
    down:{de:'runter schieben',en:'move down',fr:'descendre',it:'sposta giù',es:'bajar',tr:'aşağı taşı',ru:'вниз'},
    edit:{de:'ändern',en:'edit',fr:'modifier',it:'modifica',es:'editar',tr:'düzenle',ru:'изменить'},
    del:{de:'entfernen',en:'remove',fr:'supprimer',it:'rimuovi',es:'eliminar',tr:'kaldır',ru:'удалить'},
    save:{de:'Speichern',en:'Save',fr:'Enregistrer',it:'Salva',es:'Guardar',tr:'Kaydet',ru:'Сохранить'},
    cancel:{de:'Abbrechen',en:'Cancel',fr:'Annuler',it:'Annulla',es:'Cancelar',tr:'İptal',ru:'Отмена'},
    translating:{de:'übersetze…',en:'translating…',fr:'traduction…',it:'traduzione…',es:'traduciendo…',tr:'çevriliyor…',ru:'перевод…'},
    shrinking:{de:'Bild wird verkleinert…',en:'shrinking image…',fr:"réduction de l'image…",it:'riduzione immagine…',es:'reduciendo imagen…',tr:'görsel küçültülüyor…',ru:'сжатие изображения…'},
    needtext:{de:'Bitte Text eingeben.',en:'Please enter text.',fr:'Veuillez saisir un texte.',it:'Inserisci un testo.',es:'Introduce un texto.',tr:'Lütfen metin girin.',ru:'Введите текст.'},
    toobig:{de:'Bild zu groß — bitte kleineres wählen.',en:'Image too large — pick a smaller one.',fr:'Image trop grande — choisissez-en une plus petite.',it:'Immagine troppo grande — scegline una più piccola.',es:'Imagen demasiado grande — elige una más pequeña.',tr:'Görsel çok büyük — daha küçük seç.',ru:'Изображение слишком большое — выберите меньше.'},
    saveerr:{de:'Fehler beim Speichern.',en:'Error while saving.',fr:"Erreur lors de l'enregistrement.",it:'Errore durante il salvataggio.',es:'Error al guardar.',tr:'Kaydederken hata.',ru:'Ошибка при сохранении.'},
    warn:{de:'⚠️ Achtung: ändert auch die Strategie.',en:'⚠️ Note: this also changes the strategy.',fr:'⚠️ Attention : modifie aussi la stratégie.',it:'⚠️ Attenzione: modifica anche la strategia.',es:'⚠️ Atención: también cambia la estrategia.',tr:'⚠️ Dikkat: stratejiyi de değiştirir.',ru:'⚠️ Внимание: меняет и стратегию.'},
    notePage:{de:'Name der neuen Seite — wird in alle Sprachen übersetzt. Die Kachel wird anklickbar und führt auf die neue Seite.',en:'Name of the new page — translated into all languages. The tile becomes clickable and opens the page.',fr:'Nom de la nouvelle page — traduit dans toutes les langues. La tuile devient cliquable et ouvre la page.',it:'Nome della nuova pagina — tradotto in tutte le lingue. Il riquadro diventa cliccabile e apre la pagina.',es:'Nombre de la nueva página — se traduce a todos los idiomas. La tarjeta se vuelve clicable y abre la página.',tr:'Yeni sayfanın adı — tüm dillere çevrilir. Kart tıklanabilir olur ve sayfayı açar.',ru:'Название новой страницы — переводится на все языки. Плитка станет кликабельной и откроет страницу.'},
    noteCollap:{de:'Erste Zeile = Überschrift (zum Aufklappen), danach der Text. Wird in alle Sprachen übersetzt.',en:'First line = heading (to expand), then the text. Translated into all languages.',fr:'Première ligne = titre (pour déplier), puis le texte. Traduit dans toutes les langues.',it:'Prima riga = titolo (per espandere), poi il testo. Tradotto in tutte le lingue.',es:'Primera línea = título (para desplegar), luego el texto. Se traduce a todos los idiomas.',tr:'İlk satır = başlık (açmak için), sonra metin. Tüm dillere çevrilir.',ru:'Первая строка = заголовок (для раскрытия), затем текст. Переводится на все языки.'},
    noteText:{de:'Schreib in deiner Sprache — wird automatisch in DE/EN/TR/RU übersetzt.',en:'Write in your language — auto-translated into DE/EN/TR/RU.',fr:'Écris dans ta langue — traduit automatiquement en DE/EN/TR/RU.',it:'Scrivi nella tua lingua — tradotto automaticamente in DE/EN/TR/RU.',es:'Escribe en tu idioma — se traduce automáticamente a DE/EN/TR/RU.',tr:'Kendi dilinde yaz — otomatik DE/EN/TR/RU çevrilir.',ru:'Пиши на своём языке — авто-перевод на DE/EN/TR/RU.'},
    img:{de:'📎 Bild:',en:'📎 Image:',fr:'📎 Image :',it:'📎 Immagine:',es:'📎 Imagen:',tr:'📎 Görsel:',ru:'📎 Изображение:'},
    imgnote:{de:'Nur Spiel-Bezug (Screenshots/Grafiken) — keine privaten Fotos.',en:'Game-related only (screenshots/graphics) — no private photos.',fr:'En rapport avec le jeu uniquement (captures/graphismes) — pas de photos privées.',it:'Solo attinente al gioco (screenshot/grafica) — niente foto private.',es:'Solo relacionado con el juego (capturas/gráficos) — sin fotos privadas.',tr:'Sadece oyunla ilgili (ekran/grafik) — özel fotoğraf yok.',ru:'Только по игре (скриншоты/графика) — без личных фото.'},
    imgdel:{de:'Bild entfernen',en:'Remove image',fr:"Supprimer l'image",it:'Rimuovi immagine',es:'Eliminar imagen',tr:'Görseli kaldır',ru:'Убрать изображение'},
    phPage:{de:'Name der Seite, z. B. Turbo-Guide',en:'Page name, e.g. Turbo guide',fr:'Nom de la page, p. ex. Turbo guide',it:'Nome della pagina, es. Turbo guida',es:'Nombre de la página, p. ej. Turbo guía',tr:'Sayfa adı, örn. Turbo rehberi',ru:'Название страницы, напр. Turbo-гайд'},
    phCollap:{de:'Überschrift (1. Zeile), danach der Text',en:'Heading (line 1), then the text',fr:'Titre (ligne 1), puis le texte',it:'Titolo (riga 1), poi il testo',es:'Título (línea 1), luego el texto',tr:'Başlık (1. satır), sonra metin',ru:'Заголовок (1-я строка), затем текст'},
    fH1:{de:'Überschrift 1',en:'Heading 1',fr:'Titre 1',it:'Titolo 1',es:'Título 1',tr:'Başlık 1',ru:'Заголовок 1'},
    fH2:{de:'Überschrift 2',en:'Heading 2',fr:'Titre 2',it:'Titolo 2',es:'Título 2',tr:'Başlık 2',ru:'Заголовок 2'},
    fBold:{de:'Fett',en:'Bold',fr:'Gras',it:'Grassetto',es:'Negrita',tr:'Kalın',ru:'Жирный'},
    fList:{de:'Aufzählung',en:'List',fr:'Liste',it:'Elenco',es:'Lista',tr:'List',ru:'Список'},
    confirmDel:{de:'Diese Kachel entfernen? (rückholbar über die Versionierung)',en:'Remove this tile? (recoverable via versioning)',fr:'Supprimer cette tuile ? (récupérable via le versionnage)',it:'Rimuovere questo riquadro? (recuperabile tramite il versionamento)',es:'¿Eliminar esta tarjeta? (recuperable mediante el versionado)',tr:'Bu kart kaldırılsın mı? (sürümleme ile geri alınabilir)',ru:'Убрать плитку? (можно вернуть через версии)'},
    newpage:{de:'(neue Seite)',en:'(new page)',fr:'(nouvelle page)',it:'(nuova pagina)',es:'(nueva página)',tr:'(yeni sayfa)',ru:'(новая страница)'},
    heading:{de:'(Überschrift)',en:'(heading)',fr:'(titre)',it:'(titolo)',es:'(título)',tr:'(başlık)',ru:'(заголовок)'},
    hide:{de:'ausblenden (R3 sieht es nicht)',en:'hide (members don\'t see it)',fr:'masquer (les membres ne le voient pas)',it:'nascondi (i membri non lo vedono)',es:'ocultar (los miembros no lo ven)',tr:'gizle (üyeler görmez)',ru:'скрыть (участники не видят)'},
    show:{de:'wieder einblenden',en:'show again',fr:'réafficher',it:'mostra di nuovo',es:'mostrar de nuevo',tr:'tekrar göster',ru:'показать снова'},
    hiddenTag:{de:'ausgeblendet',en:'hidden',fr:'masqué',it:'nascosto',es:'oculto',tr:'gizli',ru:'скрыто'},
    previewOn:{de:'R3-Vorschau',en:'R3 preview',fr:'Aperçu R3',it:'Anteprima R3',es:'Vista R3',tr:'R3 önizleme',ru:'Просмотр R3'},
    previewOff:{de:'Vorschau beenden',en:'exit preview',fr:'Quitter l\'aperçu',it:'Esci anteprima',es:'Salir de la vista',tr:'Önizlemeyi kapat',ru:'Выйти из просмотра'},
    addsection:{de:'➕ Sektionsüberschrift',en:'➕ Section heading',fr:'➕ Titre de section',it:'➕ Titolo di sezione',es:'➕ Título de sección',tr:'➕ Bölüm başlığı',ru:'➕ Заголовок раздела'},
    phSection:{de:'Überschrift des Abschnitts, z. B. 📌 Das Wichtigste',en:'Section heading, e.g. 📌 The Essentials',fr:'Titre de section, p. ex. 📌 L\'essentiel',it:'Titolo di sezione, es. 📌 L\'essenziale',es:'Título de sección, p. ej. 📌 Lo esencial',tr:'Bölüm başlığı, örn. 📌 En önemlisi',ru:'Заголовок раздела, напр. 📌 Самое важное'},
    noteSection:{de:'Kurze Abschnitts-Überschrift (eine Zeile, Emoji erlaubt) — wird in alle Sprachen übersetzt.',en:'Short section heading (one line, emoji ok) — translated into all languages.',fr:'Titre de section court (une ligne, emoji ok) — traduit dans toutes les langues.',it:'Titolo di sezione breve (una riga, emoji ok) — tradotto in tutte le lingue.',es:'Título de sección corto (una línea, emoji ok) — se traduce a todos los idiomas.',tr:'Kısa bölüm başlığı (tek satır, emoji olur) — tüm dillere çevrilir.',ru:'Короткий заголовок раздела (одна строка, эмодзи можно) — переводится на все языки.'},
    secHeading:{de:'(Abschnitt)',en:'(section)',fr:'(section)',it:'(sezione)',es:'(sección)',tr:'(bölüm)',ru:'(раздел)'},
    color:{de:'🎨 Farbe:',en:'🎨 Color:',fr:'🎨 Couleur :',it:'🎨 Colore:',es:'🎨 Color:',tr:'🎨 Renk:',ru:'🎨 Цвет:'},
    colDefault:{de:'Standard',en:'Default',fr:'Standard',it:'Predefinito',es:'Predeterminado',tr:'Varsayılan',ru:'По умолчанию'},
    publicTag:{de:'🌐 Neu hier?',en:'🌐 New here?',fr:'🌐 Nouveau ?',it:'🌐 Nuovo?',es:'🌐 ¿Nuevo?',tr:'🌐 Yeni?',ru:'🌐 Впервые?'},
    publicTagTip:{de:'Dieser Inhalt erscheint auch auf der öffentlichen Seite „Neu hier?".',en:'This content also appears on the public "New here?" page.',fr:'Ce contenu apparaît aussi sur la page publique « Nouveau ? ».',it:'Questo contenuto appare anche sulla pagina pubblica «Nuovo?».',es:'Este contenido también aparece en la página pública «¿Nuevo?».',tr:'Bu içerik herkese açık "Yeni?" sayfasında da görünür.',ru:'Этот контент также показывается на публичной странице «Впервые?».'}
  };
  function L(k){ var o=UI[k]||{}; return o[curLang()]||o.en||o.de||''; }
  function esc(t){ var d=document.createElement('div'); d.textContent=(t==null?'':t); return d.innerHTML; }
  function txt2html(t){ return esc(t).replace(/\n/g,'<br>'); }
  /* Mini-Formatierung: # H1 · ## H2 · - Liste · **fett**. Übersteht die Auto-Übersetzung (Marker bleiben). */
  function mdInline(s){ return esc(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>'); }
  function mdToHtml(t){
    var lines=(t||'').split('\n'), out=[], inUl=false;
    function closeUl(){ if(inUl){ out.push('</ul>'); inUl=false; } }
    for(var i=0;i<lines.length;i++){ var ln=lines[i];
      if(/^\s*[-*]\s+/.test(ln)){ if(!inUl){ out.push('<ul>'); inUl=true; } out.push('<li>'+mdInline(ln.replace(/^\s*[-*]\s+/,''))+'</li>'); continue; }
      closeUl();
      if(/^##\s+/.test(ln)){ out.push('<h3 class="c-mh2">'+mdInline(ln.replace(/^##\s+/,''))+'</h3>'); continue; }
      if(/^#\s+/.test(ln)){ out.push('<h2 class="c-mh1">'+mdInline(ln.replace(/^#\s+/,''))+'</h2>'); continue; }
      if(ln.trim()===''){ out.push('<br>'); continue; }
      out.push('<p>'+mdInline(ln)+'</p>');
    }
    closeUl(); return out.join('');
  }
  function taWrap(ta,b,a){ var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value; ta.value=v.slice(0,s)+b+v.slice(s,e)+(a||'')+v.slice(e); ta.focus(); ta.selectionStart=s+b.length; ta.selectionEnd=e+b.length; }
  function taPrefix(ta,p){ var s=ta.selectionStart,v=ta.value,ls=v.lastIndexOf('\n',s-1)+1; ta.value=v.slice(0,ls)+p+v.slice(ls); ta.focus(); ta.selectionStart=ta.selectionEnd=s+p.length; }
  function taInsert(ta,t){ var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value; ta.value=v.slice(0,s)+t+v.slice(e); ta.focus(); ta.selectionStart=ta.selectionEnd=s+t.length; }
  /* Präfix (z. B. „- ", „# ") auf ALLE markierten Zeilen setzen (nicht nur die erste). */
  function taLinePrefix(ta,p){
    var v=ta.value, s=ta.selectionStart, e=ta.selectionEnd;
    var ls=v.lastIndexOf('\n',s-1)+1, le=v.indexOf('\n',e); if(le<0) le=v.length;
    var seg=v.slice(ls,le).split('\n').map(function(l){ return l.indexOf(p)===0 ? l : p+l; }).join('\n');
    ta.value=v.slice(0,ls)+seg+v.slice(le); ta.focus(); ta.selectionStart=ls; ta.selectionEnd=ls+seg.length;
  }
  function pick(doc){ if(doc.orig_lang && doc.orig_lang===curLang() && doc.t_orig) return doc.t_orig; /* Original-Sprache: exakt so wie eingegeben (Formatierung bleibt) */
    var o=PRIO[curLang()]||PRIO.de; for(var i=0;i<o.length;i++){ var v=doc['t_'+o[i]]; if(v) return v; } return doc.t_orig||''; }
  function imgHtml(doc){ return doc.img?'<p><img src="'+doc.img+'" alt="Bild" style="max-width:100%;border-radius:10px"></p>':''; }
  /* Kachel-Farbpalette (passend zur Hub-Palette). Leerer Wert = Standard (CSS-Klasse entscheidet). */
  var COLORS=['#2563eb','#dc2626','#b45309','#ca8a04','#0f9d58','#0891b2','#7c3aed','#9333ea','#0e7490','#475569'];
  /* Kacheln, deren Inhalt auch auf der öffentlichen Seite „Neu hier?" (willkommen.html) gespiegelt wird → R4-Markierung. */
  var PUBLIC_CIDS={ 'gw-info':1, 'loewe-info':1 };
  function applyColor(el, doc){
    if(!el || isHeading(el)) return;
    var c=doc&&doc.color;
    if(c){ el.style.borderLeftColor=c; el.style.borderLeftWidth='7px'; el.style.borderLeftStyle='solid'; }
    else { el.style.borderLeftColor=''; el.style.borderLeftWidth=''; el.style.borderLeftStyle=''; }
  }

  /* Bild klein rechnen (wie der Blog): max ~1000px, JPEG ~0.7 -> als Daten-URL direkt in die DB.
     Kein Firebase Storage/Blaze nötig — bleibt gratis (Firestore-Limit 1 MB/Doc; verkleinert weit darunter). */
  function shrinkImage(file, cb){
    var fr=new FileReader();
    fr.onload=function(){ var img=new Image();
      img.onload=function(){ var max=1000, w=img.width, h=img.height;
        if(w>max||h>max){ if(w>h){ h=Math.round(h*max/w); w=max; } else { w=Math.round(w*max/h); h=max; } }
        var c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
        try{ cb(c.toDataURL('image/jpeg',0.7)); }catch(e){ cb(''); } };
      img.onerror=function(){ cb(''); }; img.src=fr.result; };
    fr.onerror=function(){ cb(''); }; fr.readAsDataURL(file);
  }

  /* Nur den Text der AKTUELLEN Sprache aus der Original-Kachel holen (für Editor-Vorbelegung). */
  function extractCurrentText(el){
    var cur=curLang(), clone=el.cloneNode(true);
    clone.querySelectorAll('.c-bar,.c-editor,.go,.badge,.rev').forEach(function(n){ n.remove(); });
    // Fremdsprachen-Spans entfernen (robust, auch falls lang.js sie nicht per .lng-off versteckt hat)
    clone.querySelectorAll('[class*="lng-"]').forEach(function(n){ var m=n.className.match(/lng-(de|en|fr|it|es|tr|ru)/); if(m && m[1]!==cur) n.remove(); });
    clone.querySelectorAll('p,div,li,h1,h2,h3,br,summary').forEach(function(n){ n.appendChild(document.createTextNode('\n')); });
    return (clone.textContent||'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  /* Editierbare Kacheln: Inhalts-Karten + Navigations-Karten (Link bleibt, nur ändern).
     Ausgenommen: Legende, HEUTE-Block, sowie Nav-Karten zu Mitmachen/Glossar. */
  function isNav(el){ return !!el.closest('a.cardlink'); }
  function isDetails(el){ return el.tagName==='DETAILS'; }
  function isHeading(el){ return el.tagName==='H2' && el.classList && el.classList.contains('section'); }  // Abschnitts-Überschrift
  function headingTiles(){ return Array.prototype.slice.call(document.querySelectorAll('h2.section')); }
  function tiles(){
    var out=[];
    document.querySelectorAll('.card, details').forEach(function(el){
      if(el.closest('.legend')) return;
      var a=el.closest('a.cardlink');
      if(a && /S1L-Mitmachen|howto/i.test(a.getAttribute('href')||'')) return;  // Feedback/Glossar ausgenommen
      var dp=el.closest('details'); if(dp && dp!==el) return;  // keine Kachel innerhalb eines aufklappbaren Blocks doppelt zählen
      out.push(el);
    });
    return out;
  }
  function cssq(s){ return s.replace(/(["\\#\.\/])/g,'\\$1'); }

  function prepare(){
    wrapEl=document.querySelector('.wrap')||document.body;
    var cards=tiles();
    cards.forEach(function(el,i){ if(!el.getAttribute('data-cid')) el.setAttribute('data-cid', pageKey+'#'+i); });   // Kachel-IDs wie bisher (#0,#1,…)
    var heads=headingTiles();
    heads.forEach(function(el,i){ if(!el.getAttribute('data-cid')) el.setAttribute('data-cid', pageKey+'#h'+i); });  // Überschriften eigenes Schema (#h0,…) → verschiebt keine Kachel-IDs
    TILES=cards.concat(heads);
  }

  function controls(el){
    if(!r4Active()){ var b0=el.querySelector('.c-bar'); if(b0) b0.remove(); var pr0=el.querySelector('.c-pubribbon'); if(pr0) pr0.remove(); el.classList.remove('c-hidden'); return; }
    var cid=el.getAttribute('data-cid'), isHid=!!(DATA[cid]&&DATA[cid].hidden);
    el.classList.toggle('c-hidden', isHid);   // grau, wenn ausgeblendet (nur R4 sieht das überhaupt)
    var bar=el.querySelector('.c-bar');
    if(!bar){
      if(getComputedStyle(el).position==='static') el.style.position='relative';
      var nav=isNav(el);  // Navigations-Kacheln: nur ändern, kein Entfernen (Link bleibt)
      bar=document.createElement('div'); bar.className='c-bar';
      bar.innerHTML='<button type="button" class="c-btn c-up" title="'+L('up')+'">▲</button>'+
                    '<button type="button" class="c-btn c-down" title="'+L('down')+'">▼</button>'+
                    '<button type="button" class="c-btn c-edit" title="'+L('edit')+'">✏️</button>'+
                    '<button type="button" class="c-btn c-hide" title="'+L('hide')+'">🙈</button>'+
                    (nav?'':'<button type="button" class="c-btn c-del" title="'+L('del')+'">🗑</button>');
      var host=(isDetails(el) && el.querySelector('summary')) ? el.querySelector('summary') : el;  // bei aufklappbaren: Leiste in die Überschrift, damit sie auch zugeklappt sichtbar ist
      host.insertBefore(bar, host.firstChild);
      bar.querySelector('.c-up').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); move(el,-1); });
      bar.querySelector('.c-down').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); move(el,1); });
      bar.querySelector('.c-edit').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); openEditor(el); });
      bar.querySelector('.c-hide').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); toggleHide(el); });
      var d=bar.querySelector('.c-del'); if(d) d.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); removeTile(el); });
    }
    var hb=bar.querySelector('.c-hide'); if(hb){ hb.textContent=isHid?'👁':'🙈'; hb.title=isHid?L('show'):L('hide'); }
    var badge=bar.querySelector('.c-hidtag');
    if(isHid && !badge){ badge=document.createElement('span'); badge.className='c-hidtag'; bar.insertBefore(badge, bar.firstChild); }
    if(badge){ badge.textContent=L('hiddenTag'); badge.style.display=isHid?'':'none'; }
    // Markierung: Kachel wird auch auf der öffentlichen Seite „Neu hier?" gespiegelt
    var pr=el.querySelector('.c-pubribbon');
    if(PUBLIC_CIDS[cid]){ if(!pr){ pr=document.createElement('div'); pr.className='c-pubribbon'; el.appendChild(pr); } pr.textContent=L('publicTag'); pr.title=L('publicTagTip'); }
    else if(pr){ pr.remove(); }
  }

  /* ==== Reihenfolge: Kacheln hoch/runter schieben (R4), in Firestore-Doc <seite>#__order gemerkt ==== */
  function currentSeq(){
    var seq=[]; document.querySelectorAll('[data-cid]').forEach(function(t){ var c=t.getAttribute('data-cid'); if(c && c.indexOf('#__order')<0) seq.push(c); }); return seq;
  }
  function move(el, dir){
    var cid=el.getAttribute('data-cid'), seq=currentSeq(), i=seq.indexOf(cid), j=i+dir;
    if(i<0 || j<0 || j>=seq.length) return;
    var t=seq[i]; seq[i]=seq[j]; seq[j]=t;
    var od={ cid:pageKey+'#__order', ord:seq, editor:editorName(), tms:Date.now() };
    DATA[pageKey+'#__order']=od; render();
    if(col) col.doc(pageKey+'#__order').set(od).catch(function(){});
  }
  function applyOrder(){
    var od=DATA[pageKey+'#__order']; if(!od || !od.ord || !od.ord.length) return;
    var ord=od.ord, groups=[];
    document.querySelectorAll('[data-cid]').forEach(function(t){ var c=t.getAttribute('data-cid'); if(c.indexOf('#__order')>=0) return;
      var b=t.closest('a.cardlink')||t, g=null;
      for(var i=0;i<groups.length;i++){ if(groups[i].p===b.parentNode){ g=groups[i]; break; } }
      if(!g){ g={p:b.parentNode, items:[]}; groups.push(g); } g.items.push({b:b,c:c});
    });
    groups.forEach(function(g){
      if(g.items.length<2) return;
      var nodes=g.items.map(function(x){return x.b;});
      var sorted=g.items.slice().sort(function(a,b){ var ia=ord.indexOf(a.c), ib=ord.indexOf(b.c); if(ia<0)ia=1e6; if(ib<0)ib=1e6; return ia-ib; }).map(function(x){return x.b;});
      var same=true; for(var i=0;i<nodes.length;i++){ if(nodes[i]!==sorted[i]){ same=false; break; } }
      if(same) return;
      var phs=nodes.map(function(n){ var ph=document.createComment('o'); g.p.replaceChild(ph,n); return ph; });
      for(var j=0;j<phs.length;j++){ g.p.replaceChild(sorted[j], phs[j]); }
    });
  }

  function renderTile(el){
    var cid=el.getAttribute('data-cid'), doc=DATA[cid]||{};
    if(doc.deleted){ el.style.display='none'; return; }
    if(doc.hidden && !r4Active()){ el.style.display='none'; return; }   // ausgeblendet: R3/Vorschau sehen es nicht
    el.style.display='';
    if(hasContent(doc)){
      if(isHeading(el)){
        el.innerHTML=esc(pick(doc));   // Abschnitts-Überschrift: nur der (einzeilige) Text, h2 bleibt h2
      } else if(isNav(el)){
        // Navigations-Kachel: Link + „Öffnen →" behalten, nur Titel/Text ersetzen (1. Zeile = Titel)
        var go=el.querySelector('.go'), goHTML=go?go.outerHTML:'';
        var parts=pick(doc).split('\n').filter(function(s){return s.trim();});
        var title=parts.shift()||''; var rest=parts.join('<br>');
        el.innerHTML='<h3>'+esc(title)+'</h3>'+(rest?'<p>'+esc(rest)+'</p>':'')+imgHtml(doc)+goHTML;
      } else if(isDetails(el)){
        var dp=pick(doc).split('\n'), dh=(dp.shift()||L('heading')), db=dp.join('\n');  // aufklappbar: 1. Zeile = Überschrift
        el.innerHTML='<summary>'+esc(dh)+'</summary><div class="c-body">'+mdToHtml(db)+imgHtml(doc)+'</div>';
      } else {
        el.innerHTML='<div class="c-body">'+mdToHtml(pick(doc))+imgHtml(doc)+'</div>';  // editiert -> Text (+Bild)
      }
    }
    // ohne doc: Original-DOM unangetastet lassen (lang.js bleibt zuständig)
    applyColor(el, doc);
    controls(el);
  }

  function render(){
    TILES.forEach(renderTile);
    // DB-only „hinzugefügte" Kacheln unten im Wrap
    Object.keys(DATA).forEach(function(cid){
      var doc=DATA[cid]; if(!doc.added || doc.deleted) return;
      if(cid.indexOf(pageKey+'#')!==0) return;   // NUR Kacheln DIESER Seite anzeigen (Fix: Kachel blieb sonst auf allen Seiten)
      if(doc.hidden && !r4Active()){ var exH=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(exH) exH.style.display='none'; return; }
      var isCollap=(doc.type==='collapsible'), isSection=(doc.type==='section');
      var el=document.querySelector('[data-cid="'+cssq(cid)+'"]');
      if(!el){ el=document.createElement(isSection?'h2':'div'); el.className=isSection?'section':'card'; el.setAttribute('data-cid',cid);
        if(wrapEl){ var ft=wrapEl.querySelector('footer'); wrapEl.insertBefore(el, ft||null); } }
      el.style.display='';
      if(isSection){ el.innerHTML=esc(pick(doc)||L('secHeading')); }
      else if(isCollap){ var parts=pick(doc).split('\n'), head=(parts.shift()||L('heading')), body=parts.join('\n');
        el.innerHTML='<div class="c-collhead">▸ '+esc(head)+'</div><div class="c-collbody" hidden>'+mdToHtml(body)+imgHtml(doc)+'</div>';
        (function(e2,h){ var hd=e2.querySelector('.c-collhead'); hd.addEventListener('click', function(){ var b=e2.querySelector('.c-collbody'); if(b.hasAttribute('hidden')){ b.removeAttribute('hidden'); hd.textContent='▾ '+h; } else { b.setAttribute('hidden',''); hd.textContent='▸ '+h; } }); })(el, head);
      }
      else { el.innerHTML='<div class="c-body">'+mdToHtml(pick(doc))+imgHtml(doc)+'</div>'; }
      applyColor(el, doc);
      controls(el);
    });
    // Seiten-Kacheln (type=pagelink) auf der Elternseite als klickbare Navigation
    Object.keys(DATA).forEach(function(cid){
      var doc=DATA[cid]; if(doc.type!=='pagelink' || doc.deleted) return;
      if(cid.indexOf(pageKey+'#')!==0) return;
      if(doc.hidden && !r4Active()){ var exP=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(exP) exP.style.display='none'; return; }
      var el=document.querySelector('[data-cid="'+cssq(cid)+'"]');
      if(!el){ el=document.createElement('div'); el.setAttribute('data-cid',cid);
        if(wrapEl){ var ft=wrapEl.querySelector('footer'); wrapEl.insertBefore(el, ft||null); } }
      el.style.display=''; if(getComputedStyle(el).position==='static') el.style.position='relative';
      var title=pick(doc)||doc.t_orig||L('newpage');
      el.innerHTML='<a class="cardlink" href="seite.html?p='+encodeURIComponent(doc.target||'')+'"><div class="card" style="border-left:7px solid #7c3aed"><h3>📄 '+esc(title)+'</h3><p class="go">Öffnen →</p></div></a>';
      controls(el);
    });
    if(isDynPage) dynHeader();
    applyOrder();
  }

  /* Titel + Zurück-Link auf der generischen Seite (seite.html) aus der zugehörigen Seiten-Kachel. */
  function dynHeader(){
    var t=null; Object.keys(DATA).forEach(function(cid){ var d=DATA[cid]; if(d.type==='pagelink' && d.target===pageKey && !d.deleted) t=d; });
    var h=document.getElementById('p-title'); if(h) h.textContent='📄 '+(t?(pick(t)||t.t_orig||pageKey):pageKey);
    try{ document.title=(t?(t.t_orig||pick(t)):pageKey)+' — S1L Info-Hub'; }catch(e){}
  }

  function relabelBtns(){ var a=document.getElementById('c-add'); if(a)a.textContent=L('add'); var c=document.getElementById('c-addcollap'); if(c)c.textContent=L('addcollap'); var s=document.getElementById('c-addsection'); if(s)s.textContent=L('addsection'); var p=document.getElementById('c-addpage'); if(p)p.textContent=L('addpage'); }
  function addButton(){
    if(!wrapEl) return;
    if(!r4Active()){ ['c-add','c-addcollap','c-addsection','c-addpage'].forEach(function(id){ var b=document.getElementById(id); if(b) b.remove(); }); return; }
    var anchor=wrapEl.querySelector('header');
    function place(btn, afterEl){ if(afterEl && afterEl.insertAdjacentElement) afterEl.insertAdjacentElement('afterend', btn); else if(anchor && anchor.insertAdjacentElement) anchor.insertAdjacentElement('afterend', btn); else wrapEl.insertBefore(btn, wrapEl.firstChild); }
    if(!document.getElementById('c-add')){
      var b1=document.createElement('button'); b1.id='c-add'; b1.type='button'; b1.className='c-addbtn'; b1.textContent=L('add');
      place(b1, null);
      b1.addEventListener('click', function(){ var cid=pageKey+'#add-'+Date.now(); DATA[cid]={cid:cid,added:true,t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
    if(!document.getElementById('c-addcollap')){
      var b3=document.createElement('button'); b3.id='c-addcollap'; b3.type='button'; b3.className='c-addbtn'; b3.textContent=L('addcollap');
      place(b3, document.getElementById('c-add'));
      b3.addEventListener('click', function(){ var cid=pageKey+'#add-'+Date.now(); DATA[cid]={cid:cid,added:true,type:'collapsible',t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
    if(!document.getElementById('c-addsection')){
      var b4=document.createElement('button'); b4.id='c-addsection'; b4.type='button'; b4.className='c-addbtn'; b4.textContent=L('addsection');
      place(b4, document.getElementById('c-addcollap')||document.getElementById('c-add'));
      b4.addEventListener('click', function(){ var cid=pageKey+'#add-'+Date.now(); DATA[cid]={cid:cid,added:true,type:'section',t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
    // „Kachel → Seite" nur auf der Entry-Seite (index), nicht in der 2. Ebene
    if(pageKey==='index' && !document.getElementById('c-addpage')){
      var b2=document.createElement('button'); b2.id='c-addpage'; b2.type='button'; b2.className='c-addbtn'; b2.textContent=L('addpage');
      place(b2, document.getElementById('c-addcollap')||document.getElementById('c-add'));
      b2.addEventListener('click', function(){ var tgt='page-'+Date.now(), cid=pageKey+'#'+tgt;
        DATA[cid]={cid:cid,type:'pagelink',target:tgt,t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
  }

  function openEditor(el){
    if(el.querySelector('.c-editor')) return;
    var cid=el.getAttribute('data-cid'), doc=DATA[cid];
    var start = doc ? (doc.t_orig||pick(doc)) : extractCurrentText(el);
    // Original-Inhalt verstecken (außer Werkzeugleiste)
    var hidden=[];
    Array.prototype.forEach.call(el.children, function(c){ if(!c.classList.contains('c-bar')){ hidden.push(c); c.style.display='none'; } });
    // Navigations-Kachel: Link-Klick während des Editierens unterbinden
    var aNav=el.closest('a.cardlink'), navBlock=function(e){ e.preventDefault(); };
    if(aNav) aNav.addEventListener('click', navBlock, true);
    function unblock(){ if(aNav) aNav.removeEventListener('click', navBlock, true); }
    var isLink = !!(doc && doc.type==='pagelink');
    var isCollap = !!(doc && doc.type==='collapsible');
    var isHeadingEl = isHeading(el);
    var simple = isLink || isHeadingEl;   // einzeilig, ohne Formatierleiste + ohne Bild
    var isStrat = !simple && !isCollap && /allianzduell|powerplay|stadtduell|reservoir|ghuloewe|ehren|event|strat/i.test(pageKey);
    var box=document.createElement('div'); box.className='c-editor';
    box.innerHTML=(isStrat?'<p class="c-warn">'+L('warn')+'</p>':'')+
      (simple?'':'<div class="c-fmt"><button type="button" data-md="h1" title="'+L('fH1')+'">H1</button><button type="button" data-md="h2" title="'+L('fH2')+'">H2</button><button type="button" data-md="bold" title="'+L('fBold')+'"><b>B</b></button><button type="button" data-md="ul" title="'+L('fList')+'">• '+L('fList')+'</button><button type="button" data-emo="⚔️">⚔️</button><button type="button" data-emo="💧">💧</button><button type="button" data-emo="✅">✅</button><button type="button" data-emo="⛔">⛔</button><button type="button" data-emo="📍">📍</button><button type="button" data-emo="💡">💡</button><button type="button" data-emo="🟡">🟡</button><button type="button" data-emo="🟠">🟠</button><button type="button" data-emo="🔴">🔴</button><button type="button" data-emo="🔵">🔵</button></div>')+
      '<textarea class="c-ta" rows="'+(simple?2:6)+'" placeholder="'+(isLink?L('phPage'):(isHeadingEl?L('phSection'):(isCollap?L('phCollap'):'')))+'">'+esc(start)+'</textarea>'+
      '<div class="c-note">'+(isLink?L('notePage'):(isHeadingEl?L('noteSection'):(isCollap?L('noteCollap'):L('noteText'))))+'</div>'+
      (simple?'':'<div class="c-imgrow"><label>'+L('img')+' <input type="file" class="c-img" accept="image/*"></label> <span class="c-imgcur"></span><div class="c-note">'+L('imgnote')+'</div></div>')+
      (simple?'':'<div class="c-colorrow"><span class="c-note">'+L('color')+'</span> <span class="c-swatches"><button type="button" class="c-swatch def" data-color="" title="'+L('colDefault')+'"></button>'+COLORS.map(function(c){ return '<button type="button" class="c-swatch" data-color="'+c+'" style="background:'+c+'"></button>'; }).join('')+'</span></div>')+
      '<div class="c-row"><button type="button" class="c-save">'+L('save')+'</button><button type="button" class="c-cancel">'+L('cancel')+'</button><span class="c-msg"></span></div>';
    el.appendChild(box);
    var selColor=(doc && doc.color)||'';
    var sw=box.querySelector('.c-swatches');
    if(sw){
      function markSel(){ Array.prototype.forEach.call(sw.querySelectorAll('.c-swatch'), function(b){ b.classList.toggle('sel', (b.getAttribute('data-color')||'')===selColor); }); }
      markSel();
      sw.addEventListener('click', function(e){ var b=e.target.closest?e.target.closest('.c-swatch'):null; if(!b) return; e.preventDefault();
        selColor=b.getAttribute('data-color')||''; markSel();
        if(selColor){ el.style.borderLeftColor=selColor; el.style.borderLeftWidth='7px'; el.style.borderLeftStyle='solid'; }  // Live-Vorschau
        else { el.style.borderLeftColor=''; el.style.borderLeftWidth=''; el.style.borderLeftStyle=''; }
      });
    }
    if(!simple && doc && doc.img){ var cur=box.querySelector('.c-imgcur'); if(cur) cur.innerHTML='<img src="'+doc.img+'" style="max-height:60px;border-radius:6px;vertical-align:middle"> <label style="font-size:.85rem"><input type="checkbox" class="c-imgdel"> '+L('imgdel')+'</label>'; }
    if(isDetails(el)) el.open=true;   // aufklappen, damit der Editor sichtbar ist
    var ta=box.querySelector('.c-ta'); ta.focus();
    var fmt=box.querySelector('.c-fmt');
    if(fmt) fmt.addEventListener('click', function(e){ var b=e.target.closest('button'); if(!b) return; e.preventDefault();
      var k=b.getAttribute('data-md'), em=b.getAttribute('data-emo');
      if(em) taInsert(ta,em);
      else if(k==='bold') taWrap(ta,'**','**');
      else if(k==='h1') taLinePrefix(ta,'# ');
      else if(k==='h2') taLinePrefix(ta,'## ');
      else if(k==='ul') taLinePrefix(ta,'- ');
    });
    /* Enter in einer Aufzählung -> nächste Zeile automatisch mit „- "; leerer Punkt beendet die Liste. */
    ta.addEventListener('keydown', function(ev){
      if(ev.key!=='Enter') return;
      var v=ta.value, s=ta.selectionStart, ls=v.lastIndexOf('\n',s-1)+1, line=v.slice(ls,s), m=line.match(/^(\s*[-*]\s+)/);
      if(!m) return; ev.preventDefault();
      if(line.trim()===m[1].trim()){ ta.value=v.slice(0,ls)+v.slice(s); ta.selectionStart=ta.selectionEnd=ls; }
      else { var ins='\n'+m[1]; ta.value=v.slice(0,s)+ins+v.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+ins.length; }
    });
    function restore(){ unblock(); box.remove(); hidden.forEach(function(c){ c.style.display=''; }); }
    box.querySelector('.c-cancel').addEventListener('click', function(){ restore();
      if(doc && doc.added && !doc.t_orig){ delete DATA[cid]; if(!el.getAttribute('data-cid').match(/#\d+$/)) el.remove(); } });
    box.querySelector('.c-save').addEventListener('click', function(){
      var text=ta.value.trim(), msg=box.querySelector('.c-msg'), btn=box.querySelector('.c-save');
      if(!text){ msg.textContent=L('needtext'); return; }
      btn.disabled=true; msg.textContent=L('translating');
      translate(text, function(tr){
        var prev=DATA[cid]||{};
        var nd={ cid:cid, t_orig:text, orig_lang:curLang(), editor:editorName(), tms:Date.now(),
                 t_de:(tr&&tr.de)||'', t_en:(tr&&tr.en)||'', t_fr:(tr&&tr.fr)||'', t_it:(tr&&tr.it)||'', t_es:(tr&&tr.es)||'', t_tr:(tr&&tr.tr)||'', t_ru:(tr&&tr.ru)||'',
                 prev_orig:prev.t_orig||'', prev_lang:prev.orig_lang||'', prev_editor:prev.editor||'', prev_tms:prev.tms||0 };
        if(prev.added) nd.added=true;
        if(prev.type){ nd.type=prev.type; if(prev.target!=null) nd.target=prev.target; }   // type erhalten (Seiten-Kachel: auch target)
        if(selColor) nd.color=selColor; else if(prev.color) nd.color='';   // Kachel-Farbe setzen / auf Standard zurück
        if(!(tr&&(tr.de||tr.en||tr.fr||tr.it||tr.es||tr.tr||tr.ru))) nd['t_'+curLang()]=text;  // Worker aus -> Original übernehmen
        function finalize(imgVal){
          if(imgVal){ nd.img=imgVal; } else if(prev.img){ nd.img=''; }   // Bild setzen / entfernen / weglassen
          save(cid, nd, function(ok){ if(ok){ unblock(); } else { btn.disabled=false; msg.textContent=L('saveerr'); } });
        }
        var fi=box.querySelector('.c-img'), file=fi?fi.files[0]:null, del=box.querySelector('.c-imgdel');
        if(file){ msg.textContent=L('shrinking'); shrinkImage(file, function(d){ if(d && d.length>900000){ btn.disabled=false; msg.textContent=L('toobig'); return; } finalize(d||''); }); }
        else { finalize((del&&del.checked)?'':(prev.img||'')); }
      });
    });
  }

  /* Ausblenden/Einblenden: setzt nur das Feld hidden (Inhalt bleibt, rein umschaltbar). */
  function toggleHide(el){
    var cid=el.getAttribute('data-cid'), prev=DATA[cid]||{}, nd={};
    Object.keys(prev).forEach(function(k){ nd[k]=prev[k]; });
    nd.cid=cid; nd.hidden=!prev.hidden; nd.editor=editorName(); nd.tms=Date.now();
    save(cid, nd, function(){});
  }

  function removeTile(el){
    var cid=el.getAttribute('data-cid'), prev=DATA[cid]||{};
    if(!confirm(L('confirmDel'))) return;
    var nd={ cid:cid, deleted:true, editor:editorName(), tms:Date.now(),
             t_orig:prev.t_orig||'', orig_lang:prev.orig_lang||'', t_de:prev.t_de||'', t_en:prev.t_en||'', t_tr:prev.t_tr||'', t_ru:prev.t_ru||'',
             prev_orig:prev.t_orig||'', prev_lang:prev.orig_lang||'', prev_editor:prev.editor||'', prev_tms:prev.tms||0 };
    if(prev.added) nd.added=true;
    save(cid, nd, function(){});
  }

  function translate(text, cb){
    try{ fetch(TRANSLATE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text})})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ cb(j&&(j.de||j.en||j.tr||j.ru)?j:null); })
      .catch(function(){ cb(null); }); }catch(e){ cb(null); }
  }
  function save(cid, doc, cb){
    DATA[cid]=doc; render();
    if(col){ col.doc(cid).set(doc).then(function(){ cb(true); }).catch(function(){ cb(false); }); }
    else { cb(true); }
  }

  /* ==== R3-Vorschau-Taste — sitzt beim Sprachschalter (#langtoggle), nur echtes R4 sieht sie ==== */
  function syncPreviewBtn(b){ b=b||document.getElementById('c-preview'); if(!b) return; var on=previewOn();
    b.textContent=on?('● '+L('previewOff')):('👁 '+L('previewOn')); b.title=on?L('previewOff'):L('previewOn'); b.classList.toggle('on',on); }
  function mountPreview(){
    if(!isR4()){ var ex=document.getElementById('c-preview'); if(ex) ex.remove(); return; }
    var host=document.getElementById('langtoggle'); if(!host){ setTimeout(mountPreview,150); return; }   // wartet auf lang.js
    var b=document.getElementById('c-preview');
    if(!b){ b=document.createElement('button'); b.id='c-preview'; b.type='button'; b.className='c-preview';
      host.insertBefore(b, host.firstChild);
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); setPreview(!previewOn()); }); }
    syncPreviewBtn(b);
  }
  function setPreview(on){ try{ if(on) sessionStorage.setItem('s1l_preview','1'); else sessionStorage.removeItem('s1l_preview'); }catch(e){} render(); addButton(); mountPreview(); }

  function loadScript(src,cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }
  function initFb(done){
    if(typeof firebase!=='undefined') return done();
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",function(){
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",done); });
  }
  function boot(){
    prepare(); render(); addButton(); mountPreview();
    document.addEventListener('s1l:lang', function(){ render(); relabelBtns(); mountPreview(); });   // doc-Kacheln + R4-Buttons in neuer Sprache; Rest macht lang.js
    initFb(function(){ try{ if(typeof firebase!=='undefined'){ if(!firebase.apps.length) firebase.initializeApp(FB);
      col=firebase.firestore().collection('content');
      col.onSnapshot(function(s){ DATA={}; s.forEach(function(d){ DATA[d.id]=d.data()||{}; }); render(); addButton(); mountPreview(); },
        function(){ col=null; }); } }catch(e){ col=null; } });
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
