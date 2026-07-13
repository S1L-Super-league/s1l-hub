/* ============ S1L Info-Hub — Reservoir-Raid-Aufstellung ============
   GETEILT über Firebase-Collection 'rrlineup' (Doc 'current'). R4 bearbeitet,
   alle Mitglieder sehen den Stand (View). Fällt auf den eingebauten Plan zurück,
   solange in der Cloud nichts liegt. Nur Stufe-1-Gamertags.
   API:  window.S1LRR.mountView(el)   window.S1LRR.mountEditor(el)
   Quelle der Wahrheit (Archiv): planung/s1l-gaming-data.json → reservoir_raid. */
(function(){
  var FB={ apiKey:"AIzaSyCeKoPKOVYKbN0OHkr3_T_nQwDtCALZD18", authDomain:"s1l-hub.firebaseapp.com", projectId:"s1l-hub", storageBucket:"s1l-hub.firebasestorage.app", messagingSenderId:"761448020039", appId:"1:761448020039:web:b65a7e1c1bac2f31831962" };
  var COL='rrlineup', DOCID='current';

  /* Dropdown-Vorschläge — GENERISCHE Platzhalter zum Anlegen/Beurteilen des Features.
     Echte Roster-Namen kommen später; hier nur „Anführer N" / „Mitglied N". */
  var ROSTER=["Anführer 1","Anführer 2","Anführer 3","Anführer 4","Anführer 5","Mitglied 1","Mitglied 2","Mitglied 3","Mitglied 4","Mitglied 5","Mitglied 6","Mitglied 7","Mitglied 8","Mitglied 9","Mitglied 10","Mitglied 11","Mitglied 12","Mitglied 13","Mitglied 14","Mitglied 15"];

  /* In-Game-Namensübersetzungen — im generischen Modus leer. */
  var NAMEMAP={};

  /* Gebäude-Katalog — Reservoir-Raid-Gebäude. DE bestätigt (Jac-Screenshots), EN recherchiert (Guides).
     TR/RU maschinell (keine offizielle Quelle gefunden) — bei Bedarf später ersetzen. */
  var BUILDINGS=[
    {id:"wpz1", de:"Wasseraufbereitungszentrum 1", en:"Water Treatment Center 1", tr:"Su Arıtma Merkezi 1", ru:"Центр водоподготовки 1"},
    {id:"wpz2", de:"Wasseraufbereitungszentrum 2", en:"Water Treatment Center 2", tr:"Su Arıtma Merkezi 2", ru:"Центр водоподготовки 2"},
    {id:"wpa",  de:"Wasseraufbereitungsanlage",    en:"Water Treatment Plant",    tr:"Su Arıtma Tesisi",         ru:"Водоочистная станция"},
    {id:"ww",   de:"Wasserwerk",                   en:"Waterworks",               tr:"Su İşletmesi",             ru:"Водопроводная станция"},
    {id:"sps",  de:"Solarstromstation",            en:"Solar Power Station",      tr:"Güneş Enerjisi İstasyonu", ru:"Солнечная электростанция"},
    {id:"cr",   de:"Zentralreservoir",             en:"Central Reservoir",        tr:"Merkezi Rezervuar",        ru:"Центральный резервуар"},
    {id:"mf",   de:"Munitionsfabrik",              en:"Munitions Factory",        tr:"Mühimmat Fabrikası",       ru:"Завод боеприпасов"},
    {id:"wt",   de:"Wassertanks",                  en:"Water Tanks",              tr:"Su Tankları",              ru:"Водяные баки"}
  ];
  function bById(id){ for(var i=0;i<BUILDINGS.length;i++){ if(BUILDINGS[i].id===id) return BUILDINGS[i]; } return null; }
  function BC(id){ var o=bById(id); return o?{id:o.id,de:o.de,en:o.en,tr:o.tr,ru:o.ru}:id; }

  /* Eingebauter Default = Beispiel-Aufstellung: echte Gebäude (mehrsprachig), Mitglieder generisch. */
  var DEFAULT={
    edition:"Beispiel",
    phases:[
      { phase:1, note:{de:"Erstaufstellung — jeder auf sein zugewiesenes Gebäude.",en:"Initial line-up — everyone on their assigned building.",tr:"İlk dizilim — herkes kendi binasında.",ru:"Начальная расстановка — каждый на своём здании."},
        buildings:[
          { building:BC("wpz1"), leader:"Anführer 1", members:["Mitglied 1","Mitglied 2","Mitglied 3"], gn:"Mitglied 3" },
          { building:BC("wpz2"), leader:"Anführer 2", members:["Mitglied 4","Mitglied 5","Mitglied 6"], gn:"" },
          { building:BC("wpa"),  leader:"Anführer 3", members:["Mitglied 7","Mitglied 8","Mitglied 9"], gn:"" },
          { building:BC("ww"),   leader:"Anführer 4", members:["Mitglied 10","Mitglied 11","Mitglied 12"], gn:"Mitglied 12" },
          { building:BC("sps"),  leader:"Anführer 5", members:["Mitglied 13","Mitglied 14","Mitglied 15"], gn:"" }
        ] },
      { phase:2, note:{de:"Wer hier NICHT genannt ist, bleibt im zugewiesenen Gebäude.",en:"Anyone NOT listed here stays on their assigned building.",tr:"Burada YAZMAYAN herkes kendi binasında kalır.",ru:"Кто здесь НЕ указан, остаётся на своём здании."},
        buildings:[
          { building:BC("cr"), leader:"", members:["Mitglied 1","Mitglied 4","Mitglied 7"], gn:"" },
          { building:BC("mf"), leader:"", members:["Mitglied 2","Mitglied 5","Mitglied 13"], gn:"" },
          { building:BC("wt"), leader:"", members:["Mitglied 3","Mitglied 6","Mitglied 14"], gn:"Mitglied 14" }
        ] },
      { phase:3, note:{de:"Zugewiesene Gebäude halten. Bei Bedarf abstimmen.",en:"Hold assigned buildings. Coordinate if needed.",tr:"Atanan binaları tut. Gerekirse koordine ol.",ru:"Удерживай назначенные здания. При необходимости согласуй."},
        buildings:[] }
    ],
    important:{
      de:["Aufgabe 1.","Aufgabe 2.","Aufgabe 3."],
      en:["Task 1.","Task 2.","Task 3."],
      tr:["Görev 1.","Görev 2.","Görev 3."],
      ru:["Задача 1.","Задача 2.","Задача 3."]
    }
  };

  var T={
    de:{title:"Reservoir Raid — Aufstellung",mine:"⭐ Dein Einsatz",phase:"Phase",leader:"Anführer",members:"Mitglieder",gn:"Gruppennachricht",none:"Keine feste Liste — siehe Hinweis.",hold:"Gebäude halten.",edit:"Bearbeiten (R4)",save:"Aufstellung speichern",saved:"✓ gespeichert & für alle sichtbar",savefail:"Konnte nicht speichern (offline oder keine R4-Rechte).",reset:"Beispiel laden",addb:"+ Gebäude",addm:"+ Mitglied",free:"— Freitext —",bname:"Gebäude",copy:"📋 Aufstellung kopieren",copied:"✓ kopiert",onlyr4:"Nur R4 kann bearbeiten.",notyou:"Du bist in keiner Phase fest eingeteilt — bleib auf deinem zugewiesenen Gebäude.",ingame:"Im Spiel siehst du teils übersetzte Namen:",src:"Stand",cloud:"live (für alle)",local:"nur lokal (nicht gespeichert)",core:"Beispiel-Strategietext (Platzhalter)."},
    en:{title:"Reservoir Raid — Line-up",mine:"⭐ Your assignment",phase:"Phase",leader:"Leader",members:"Members",gn:"Group message",none:"No fixed list — see note.",hold:"Hold buildings.",edit:"Edit (R4)",save:"Save line-up",saved:"✓ saved & visible to all",savefail:"Could not save (offline or no R4 rights).",reset:"Load example",addb:"+ Building",addm:"+ Member",free:"— Free text —",bname:"Building",copy:"📋 Copy line-up",copied:"✓ copied",onlyr4:"Only R4 can edit.",notyou:"You have no fixed phase slot — stay on your assigned building.",ingame:"In-game some names appear translated:",src:"Status",cloud:"live (for all)",local:"local only (not saved)",core:"Example strategy text (placeholder)."},
    fr:{title:"Reservoir Raid — Formation",mine:"⭐ Ton affectation",phase:"Phase",leader:"Chef",members:"Membres",gn:"Message de groupe",none:"Pas de liste fixe — voir la note.",hold:"Tenir les bâtiments.",edit:"Modifier (R4)",save:"Enregistrer la formation",saved:"✓ enregistré et visible par tous",savefail:"Impossible d'enregistrer (hors ligne ou pas de droits R4).",reset:"Charger l'exemple",addb:"+ Bâtiment",addm:"+ Membre",free:"— Texte libre —",bname:"Bâtiment",copy:"📋 Copier la formation",copied:"✓ copié",onlyr4:"Seul R4 peut modifier.",notyou:"Tu n'as aucun poste fixe — reste sur ton bâtiment assigné.",ingame:"Dans le jeu, certains noms apparaissent traduits :",src:"État",cloud:"en direct (pour tous)",local:"local uniquement (non enregistré)",core:"Texte de stratégie d'exemple (espace réservé)."},
    it:{title:"Reservoir Raid — Formazione",mine:"⭐ Il tuo incarico",phase:"Fase",leader:"Capo",members:"Membri",gn:"Messaggio di gruppo",none:"Nessuna lista fissa — vedi nota.",hold:"Tieni gli edifici.",edit:"Modifica (R4)",save:"Salva formazione",saved:"✓ salvato e visibile a tutti",savefail:"Impossibile salvare (offline o senza diritti R4).",reset:"Carica esempio",addb:"+ Edificio",addm:"+ Membro",free:"— Testo libero —",bname:"Edificio",copy:"📋 Copia formazione",copied:"✓ copiato",onlyr4:"Solo R4 può modificare.",notyou:"Non hai un posto fisso in nessuna fase — resta sul tuo edificio assegnato.",ingame:"Nel gioco alcuni nomi appaiono tradotti:",src:"Stato",cloud:"live (per tutti)",local:"solo locale (non salvato)",core:"Testo di strategia d'esempio (segnaposto)."},
    es:{title:"Reservoir Raid — Formación",mine:"⭐ Tu asignación",phase:"Fase",leader:"Líder",members:"Miembros",gn:"Mensaje de grupo",none:"Sin lista fija — mira la nota.",hold:"Mantén los edificios.",edit:"Editar (R4)",save:"Guardar formación",saved:"✓ guardado y visible para todos",savefail:"No se pudo guardar (sin conexión o sin permisos R4).",reset:"Cargar ejemplo",addb:"+ Edificio",addm:"+ Miembro",free:"— Texto libre —",bname:"Edificio",copy:"📋 Copiar formación",copied:"✓ copiado",onlyr4:"Solo R4 puede editar.",notyou:"No tienes un puesto fijo en ninguna fase — quédate en tu edificio asignado.",ingame:"En el juego algunos nombres aparecen traducidos:",src:"Estado",cloud:"en vivo (para todos)",local:"solo local (no guardado)",core:"Texto de estrategia de ejemplo (marcador de posición)."},
    tr:{title:"Reservoir Raid — Dizilim",mine:"⭐ Senin görevin",phase:"Faz",leader:"Lider",members:"Üyeler",gn:"Grup mesajı",none:"Sabit liste yok — nota bak.",hold:"Binaları tut.",edit:"Düzenle (R4)",save:"Dizilimi kaydet",saved:"✓ kaydedildi & herkese görünür",savefail:"Kaydedilemedi (çevrimdışı veya R4 yetkisi yok).",reset:"Örnek yükle",addb:"+ Bina",addm:"+ Üye",free:"— Serbest metin —",bname:"Bina",copy:"📋 Dizilimi kopyala",copied:"✓ kopyalandı",onlyr4:"Sadece R4 düzenleyebilir.",notyou:"Sabit bir fazın yok — kendi binanda kal.",ingame:"Oyunda bazı isimler çevrilmiş görünür:",src:"Durum",cloud:"canlı (herkese)",local:"sadece yerel (kaydedilmedi)",core:"Örnek strateji metni (yer tutucu)."},
    ru:{title:"Reservoir Raid — Расстановка",mine:"⭐ Твоя задача",phase:"Фаза",leader:"Лидер",members:"Участники",gn:"Сообщение группе",none:"Нет фикс. списка — см. примечание.",hold:"Удерживать здания.",edit:"Редактировать (R4)",save:"Сохранить расстановку",saved:"✓ сохранено и видно всем",savefail:"Не удалось сохранить (офлайн или нет прав R4).",reset:"Загрузить пример",addb:"+ Здание",addm:"+ Участник",free:"— Свой текст —",bname:"Здание",copy:"📋 Копировать расстановку",copied:"✓ скопировано",onlyr4:"Редактировать может только R4.",notyou:"У тебя нет фикс. слота — оставайся на своём здании.",ingame:"В игре часть имён показывается переведённой:",src:"Статус",cloud:"live (для всех)",local:"только локально (не сохранено)",core:"Пример текста стратегии (заглушка)."}
  };
  function lang(){ try{ return localStorage.getItem('s1l_lang')||'de'; }catch(e){ return 'de'; } }
  function t(k){ var l=lang(); return (T[l]&&T[l][k])||(T.en&&T.en[k])||T.de[k]||k; }
  function loc(o){ if(o==null) return ''; if(typeof o==='string') return o; var l=lang(); return o[l]||o.en||o.de||''; }

  function isR4(){ try{ return sessionStorage.getItem('s1l_r4_ok')==='1'; }catch(e){ return false; } }
  function myName(){ try{ return (sessionStorage.getItem('s1l_name')||'').trim(); }catch(e){ return ''; } }
  function eq(a,b){ return (a||'').trim().toLowerCase()===(b||'').trim().toLowerCase(); }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ---------- Firebase ---------- */
  var col=null, state=clone(DEFAULT), source='local';
  function loadScript(src,cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }
  function initFb(done){ if(typeof firebase!=='undefined') return done();
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",function(){
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",done); }); }
  function connect(onUpdate){
    initFb(function(){ try{
      if(typeof firebase!=='undefined'){
        if(!firebase.apps.length) firebase.initializeApp(FB);
        col=firebase.firestore().collection(COL);
        col.doc(DOCID).onSnapshot(function(d){
          if(d&&d.exists){ var data=d.data()||{}; if(data.lineup&&data.lineup.phases){ state=data.lineup; source='cloud'; onUpdate(); return; } }
          source='local'; onUpdate();
        }, function(){ col=null; source='local'; onUpdate(); });
      } else { col=null; source='local'; onUpdate(); }
    }catch(e){ col=null; source='local'; onUpdate(); } });
  }
  function save(cb){
    if(!isR4()){ cb&&cb(false); return; }
    if(col){ col.doc(DOCID).set({lineup:state,t:Date.now(),by:myName()}).then(function(){cb&&cb(true);}).catch(function(){cb&&cb(false);}); }
    else { cb&&cb(false); }
  }
  function options(){ var set={}, out=[]; ROSTER.forEach(function(n){ if(!set[n.toLowerCase()]){set[n.toLowerCase()]=1;out.push(n);} });
    DEFAULT.phases.forEach(function(p){ p.buildings.forEach(function(b){ (b.leader?[b.leader]:[]).concat(b.members).forEach(function(n){ if(n&&!set[n.toLowerCase()]){set[n.toLowerCase()]=1;out.push(n);} }); }); });
    out.sort(function(a,b){return a.toLowerCase()<b.toLowerCase()?-1:1;}); return out; }

  /* ---------- View (read-only, eigene Rolle zuerst) ---------- */
  function nameChip(n,opts){ opts=opts||{}; var cls='rrchip'; if(opts.leader)cls+=' lead'; if(eq(n,myName()))cls+=' me';
    var tl=NAMEMAP[n]?' <span class="rrtl">('+esc(NAMEMAP[n])+')</span>':'';
    var lead=opts.leader?'👑 ':''; var gn=opts.gn?' 📣':'';
    return '<span class="'+cls+'">'+lead+esc(n)+gn+tl+'</span>'; }

  function buildingsHtml(ph){
    if(!ph.buildings||!ph.buildings.length) return '<div class="rrbld"><div class="rrchips rrmut">'+ (ph.phase===3? esc(t('hold')) : esc(t('none')))+'</div></div>';
    return ph.buildings.map(function(b){
      var roster=(b.leader?[b.leader]:[]).concat(b.members);
      var mine=roster.some(function(n){return eq(n,myName());});
      var chips=(b.leader?nameChip(b.leader,{leader:true}):'')+b.members.map(function(m){return nameChip(m,{gn:eq(m,b.gn)});}).join('');
      return '<div class="rrbld'+(mine?' minebld':'')+'"><div class="rrbname">🏭 '+esc(loc(b.building))+'</div><div class="rrchips">'+chips+'</div></div>';
    }).join('');
  }
  function myAssignment(){
    var me=myName(); if(!me) return '';
    var rows=''; var any=false;
    state.phases.forEach(function(ph){
      var hit=null;
      (ph.buildings||[]).forEach(function(b){ var r=(b.leader?[b.leader]:[]).concat(b.members); r.forEach(function(n){ if(eq(n,me)) hit=b; }); });
      var txt;
      if(hit){ any=true; txt='<b>'+esc(loc(hit.building))+'</b>'+(hit.leader&&!eq(hit.leader,me)?' · '+esc(t('leader'))+': '+esc(hit.leader):''); }
      else if(ph.phase===3){ txt='<span class="rrmut">'+esc(t('hold'))+'</span>'; }
      else { txt='<span class="rrmut">—</span>'; }
      rows+='<div class="rrrow"><span class="rrph">'+esc(t('phase'))+' '+ph.phase+'</span>'+txt+'</div>';
    });
    if(!any) return '<div class="rrmine"><div class="rrmut" style="padding:4px 0">'+esc(t('notyou'))+'</div></div>';
    return '<div class="rrmine"><h3>'+esc(t('mine'))+' ('+esc(me)+')</h3>'+rows+'</div>';
  }
  function phasesHtml(){
    return state.phases.map(function(ph){
      return '<section class="rrphase"><h3>'+esc(t('phase'))+' '+ph.phase+'</h3><p class="rrnote">'+esc(loc(ph.note))+'</p>'+buildingsHtml(ph)+'</section>';
    }).join('');
  }
  function nameMapHtml(){ var s=''; for(var k in NAMEMAP) s+='<span class="rrchip">'+esc(k)+' → '+esc(NAMEMAP[k])+'</span>'; return s; }
  function importantHtml(){ var arr=loc(state.important)||DEFAULT.important.de; return arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join(''); }
  function srcBadge(){ return '<span class="rrsrc '+(source==='cloud'?'on':'off')+'">'+esc(t('src'))+': '+esc(source==='cloud'?t('cloud'):t('local'))+'</span>'; }

  function renderView(el){
    el.innerHTML=
      '<div class="rrtop"><h2>🐟 '+esc(t('title'))+'</h2>'+srcBadge()+'</div>'+
      myAssignment()+
      phasesHtml()+
      '<div class="rrbox"><h3>🧠 Strategie</h3><p class="rrmut">'+esc(t('core'))+'</p><ul>'+importantHtml()+'</ul></div>'+
      (Object.keys(NAMEMAP).length? '<div class="rrbox"><h3>👁️ '+esc(t('ingame'))+'</h3><div class="rrchips">'+nameMapHtml()+'</div></div>' : '')+
      '<div class="rrlegend"><button type="button" class="rrcopy">'+esc(t('copy'))+'</button> <span>👑 '+esc(t('leader'))+'</span><span>📣 '+esc(t('gn'))+'</span><span class="me-leg">⭐ '+esc(myName()||'?')+'</span></div>';
    var cb=el.querySelector('.rrcopy'); if(cb) cb.addEventListener('click',function(){ copyText(cb); });
  }

  /* ---------- Copy ---------- */
  function plainText(){
    var L=['S1L — Reservoir Raid'];
    state.phases.forEach(function(ph){ L.push(''); L.push(t('phase')+' '+ph.phase); L.push(loc(ph.note));
      (ph.buildings||[]).forEach(function(b){ L.push(''); L.push('🏭 '+loc(b.building)+(b.leader?'  ('+t('leader')+': '+b.leader+')':''));
        b.members.forEach(function(m){ L.push(' • '+m+(eq(m,b.gn)?' 📣':'')); }); }); });
    L.push(''); (loc(state.important)||[]).forEach(function(x){ L.push('— '+x); });
    return L.join('\n');
  }
  /* Phasenweise Kopier-Nachrichten: Phase 1 ggf. gesplittet, Phase 2 eine, Phase 3 + Hinweise eine. */
  function buildingBlock(b){
    var lines=['🏭 '+loc(b.building)+(b.leader?'  ('+t('leader')+': '+b.leader+')':'')];
    (b.members||[]).forEach(function(m){ lines.push('• '+m+(eq(m,b.gn)?' 📣':'')); });
    return lines.join('\n');
  }
  function messages(){
    var LIM=900, msgs=[];
    state.phases.forEach(function(ph){
      var header='🐟 S1L — Reservoir Raid · '+t('phase')+' '+ph.phase;
      if(ph.phase===3 || !(ph.buildings&&ph.buildings.length)){
        var lines=[header, loc(ph.note)];
        if(ph.phase===3){ (loc(state.important)||[]).forEach(function(x){ lines.push('• '+x); }); }
        msgs.push({title:t('phase')+' '+ph.phase, text:lines.join('\n')}); return;
      }
      // Gebäude greedy in Teile packen, damit jede Nachricht < LIM bleibt
      var chunks=[], chunk=[header, loc(ph.note)];
      ph.buildings.forEach(function(b){
        var blk=buildingBlock(b);
        var tentative=chunk.concat(['',blk]).join('\n');
        if(tentative.length>LIM && chunk.length>2){ chunks.push(chunk); chunk=[header, loc(ph.note)]; }
        chunk.push(''); chunk.push(blk);
      });
      chunks.push(chunk);
      chunks.forEach(function(c,i){
        var part=chunks.length>1?(' ('+(i+1)+'/'+chunks.length+')'):'';
        var txt=c.join('\n'); if(part) txt=txt.replace(header, header+part);
        msgs.push({title:t('phase')+' '+ph.phase+part, text:txt});
      });
    });
    return msgs;
  }
  function copyText(btn){ var txt=plainText();
    function ok(){ var o=btn.textContent; btn.textContent=t('copied'); setTimeout(function(){btn.textContent=t('copy');},1500); }
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok,function(){fallback();}); } else fallback(); }catch(e){ fallback(); }
    function fallback(){ var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');ok();}catch(e){} document.body.removeChild(ta); }
  }

  /* ---------- Editor (R4) ---------- */
  function personRow(value){
    var opts=options(); var isFree = value && opts.indexOf(value)<0;
    var sel='<select class="rrsel">'; sel+='<option value="">—</option>';
    opts.forEach(function(o){ sel+='<option value="'+esc(o)+'"'+(!isFree&&value===o?' selected':'')+'>'+esc(o)+'</option>'; });
    sel+='<option value="__free"'+(isFree?' selected':'')+'>'+esc(t('free'))+'</option></select>';
    var free='<input class="rrfree" type="text" placeholder="'+esc(t('free'))+'" value="'+(isFree?esc(value):'')+'" style="'+(isFree?'':'display:none')+'">';
    return '<div class="rrmrow">'+sel+free+'<button type="button" class="rrx" title="–">×</button></div>';
  }
  function buildingField(b){
    var cur=b.building, curId=(cur&&typeof cur==='object')?cur.id:'', curFree=(cur&&typeof cur!=='object')?cur:'';
    var isFree=!curId&&!!curFree;
    var sel='<select class="rrbnsel"><option value="">—</option>';
    BUILDINGS.forEach(function(o){ sel+='<option value="'+o.id+'"'+(curId===o.id?' selected':'')+'>'+esc(loc(o))+'</option>'; });
    sel+='<option value="__free"'+(isFree?' selected':'')+'>'+esc(t('free'))+'</option></select>';
    var free='<input class="rrbnfree" type="text" value="'+esc(isFree?curFree:'')+'" placeholder="'+esc(t('bname'))+'" style="'+(isFree?'':'display:none')+'">';
    return sel+free;
  }
  function buildingCard(b){
    var gnOpts='<option value="">—</option>'+ (b.members||[]).map(function(m){return '<option'+(eq(m,b.gn)?' selected':'')+'>'+esc(m)+'</option>';}).join('');
    return '<div class="rredit-bld">'+
      '<div class="rredit-line"><label>'+esc(t('bname'))+'</label>'+buildingField(b)+'<button type="button" class="rrxb" title="–">🗑</button></div>'+
      '<div class="rredit-line"><label>'+esc(t('leader'))+'</label>'+personRow(b.leader).replace('rrmrow','rrmrow rrlead')+'</div>'+
      '<div class="rredit-line"><label>'+esc(t('members'))+'</label><div class="rrmembers">'+(b.members||[]).map(personRow).join('')+'</div></div>'+
      '<div class="rredit-line"><button type="button" class="rraddm">'+esc(t('addm'))+'</button> <label style="margin-left:8px">📣 '+esc(t('gn'))+'</label><select class="rrgn">'+gnOpts+'</select></div>'+
    '</div>';
  }
  function phaseBlock(ph){
    return '<section class="rredit-phase" data-phase="'+ph.phase+'"><h3>'+esc(t('phase'))+' '+ph.phase+'</h3><p class="rrnote">'+esc(loc(ph.note))+'</p>'+
      '<div class="rrblds">'+(ph.buildings||[]).map(buildingCard).join('')+'</div>'+
      '<button type="button" class="rraddb">'+esc(t('addb'))+'</button></section>';
  }
  function readPerson(row){ var sel=row.querySelector('.rrsel'), free=row.querySelector('.rrfree');
    if(sel&&sel.value==='__free') return (free&&free.value.trim())||''; return sel?sel.value:''; }
  function serialize(el){
    var phases=[];
    el.querySelectorAll('.rredit-phase').forEach(function(pEl,i){
      var src=state.phases[i]||{phase:i+1,note:{de:''}};
      var blds=[];
      pEl.querySelectorAll('.rredit-bld').forEach(function(bEl){
        var bsel=bEl.querySelector('.rrbnsel'), bfree=bEl.querySelector('.rrbnfree');
        var building='';
        if(bsel){ if(bsel.value==='__free'){ building=(bfree&&bfree.value.trim())||''; }
          else if(bsel.value){ building=BC(bsel.value); } }
        var leadRow=bEl.querySelector('.rrlead'); var leader=leadRow?readPerson(leadRow):'';
        var members=[]; bEl.querySelectorAll('.rrmembers .rrmrow').forEach(function(r){ var v=readPerson(r); if(v) members.push(v); });
        var gn=(bEl.querySelector('.rrgn')||{}).value||'';
        if(building||leader||members.length) blds.push({building:building,leader:leader,members:members,gn:gn});
      });
      phases.push({phase:src.phase,note:src.note,buildings:blds});
    });
    state.phases=phases;
  }
  function renderEditor(el){
    if(!isR4()){ el.innerHTML='<div class="rrbox rrmut">'+esc(t('onlyr4'))+'</div>'; return; }
    el.innerHTML=
      '<div class="rrtop"><h2>✏️ '+esc(t('title'))+'</h2>'+srcBadge()+'</div>'+
      '<div class="rredit-bar"><button type="button" class="rrsave">'+esc(t('save'))+'</button> <button type="button" class="rrreset">'+esc(t('reset'))+'</button> <button type="button" class="rrcopy">'+esc(t('copy'))+'</button> <span class="rrmsg"></span></div>'+
      '<div class="rrphases">'+state.phases.map(phaseBlock).join('')+'</div>';
    if(!el._rrwired){ wireEditor(el); el._rrwired=1; }
  }
  function wireEditor(el){
    var msg=el.querySelector('.rrmsg');
    el.addEventListener('change',function(e){ var s=e.target.closest('.rrsel'); if(s){ var f=s.parentNode.querySelector('.rrfree'); if(f) f.style.display=(s.value==='__free')?'':'none'; }
      var bs=e.target.closest('.rrbnsel'); if(bs){ var bf=bs.parentNode.querySelector('.rrbnfree'); if(bf) bf.style.display=(bs.value==='__free')?'':'none'; }
      // refresh gn options live
      var bld=e.target.closest('.rredit-bld'); if(bld && (e.target.classList.contains('rrsel')||e.target.classList.contains('rrfree'))){ refreshGn(bld); } });
    el.addEventListener('click',function(e){
      var x=e.target.closest('.rrx'); if(x){ var row=x.closest('.rrmrow'); if(row&&!row.classList.contains('rrlead')){ var bld=row.closest('.rredit-bld'); row.remove(); refreshGn(bld);} return; }
      var addm=e.target.closest('.rraddm'); if(addm){ var box=addm.closest('.rredit-bld').querySelector('.rrmembers'); var d=document.createElement('div'); d.innerHTML=personRow(''); box.appendChild(d.firstChild); return; }
      var xb=e.target.closest('.rrxb'); if(xb){ serialize(el); xb.closest('.rredit-bld').remove(); return; }
      var addb=e.target.closest('.rraddb'); if(addb){ var sec=addb.closest('.rredit-phase'); var d2=document.createElement('div'); d2.innerHTML=buildingCard({building:'',leader:'',members:[''],gn:''}); sec.querySelector('.rrblds').appendChild(d2.firstChild); return; }
      var sv=e.target.closest('.rrsave'); if(sv){ serialize(el); save(function(ok){ msg.textContent= ok? t('saved') : t('savefail'); msg.className='rrmsg '+(ok?'ok':'bad'); }); return; }
      var rs=e.target.closest('.rrreset'); if(rs){ state=clone(DEFAULT); renderEditor(el); return; }
      var cp=e.target.closest('.rrcopy'); if(cp){ serialize(el); copyText(cp); return; }
    });
  }
  function refreshGn(bld){ var gn=bld.querySelector('.rrgn'); if(!gn) return; var cur=gn.value; var names=[]; bld.querySelectorAll('.rrmembers .rrmrow').forEach(function(r){ var v=readPerson(r); if(v) names.push(v); });
    gn.innerHTML='<option value="">—</option>'+names.map(function(n){return '<option'+(n===cur?' selected':'')+'>'+esc(n)+'</option>';}).join(''); }

  /* ---------- Mount ---------- */
  function mountView(el){ connect(function(){ renderView(el); }); renderView(el);
    document.addEventListener('s1l:lang',function(){ renderView(el); }); }
  function mountEditor(el){ connect(function(){ if(!el.querySelector('.rredit-phase')) renderEditor(el); }); renderEditor(el);
    document.addEventListener('s1l:lang',function(){ serialize(el); renderEditor(el); }); }

  window.S1LRR={ mountView:mountView, mountEditor:mountEditor, messages:messages, _plain:plainText, _default:DEFAULT };
})();
