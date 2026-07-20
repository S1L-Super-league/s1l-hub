/* ============ S1L Info-Hub — Aufstellungs-Vorlagen (modular) ============
   Eine Vorlage = eine Überschrift (z. B. "Reservoir Raid", "Arcadia").
   R4 baut sich die Felder selbst zusammen (Freitext / Personen / Häkchen / Auswahl),
   trägt den Stand ein und startet wöchentlich eine neue Runde — vorbefüllt mit dem
   letzten Stand, Geändertes wird markiert. Mitglieder sehen alles + "Dein Einsatz".

   GETEILT über Firestore-Collection 'lineups' (ein Doc je Vorlage,
   Sonder-Doc '__roster' = Mitgliederliste für die Dropdowns).
   Fällt auf einen eingebauten Beispiel-Stand zurück, solange nichts in der Cloud liegt.
   Nur Stufe-1-Gamertags. Senden in den Spiel-Chat macht immer R4/Jac von Hand.

   API:  window.S1LPLAN.mount(el)
   Quelle der Wahrheit (Archiv): planung/s1l-gaming-data.json
   Vorgänger: rr.js (Reservoir Raid, fest verdrahtet) — bleibt bis zur Umstellung liegen. */
(function(){
  var FB={ apiKey:"AIzaSyCeKoPKOVYKbN0OHkr3_T_nQwDtCALZD18", authDomain:"s1l-hub.firebaseapp.com", projectId:"s1l-hub", storageBucket:"s1l-hub.firebasestorage.app", messagingSenderId:"761448020039", appId:"1:761448020039:web:b65a7e1c1bac2f31831962" };
  var COL='lineups', ROSTER_ID='__roster', HIST_MAX=10;
  var TRANSLATE_URL="https://s1l-translate.jacqueline-lex.workers.dev";
  var LANGS=['de','en','fr','it','es','pt','tr','ru'];

  /* Spiel-Emoji-Codes (wie im Eventcenter). Der Spiel-Chat rendert diese Codes als Emojis.
     → Kopiert wird IMMER der Code; die Vorschau zeigt via toEmoji() das lesbare Emoji. */
  var EMO={ "#190":"📣","#189":"✅","#188":"❌","#176":"⚔️","#167":"🚨","#163":"🏆","#170":"📍","#093":"👑","#098":"🦁","#117":"🐟","#169":"🌃","#078":"💪","#079":"🤝","#080":"🤘","#074":"👍" };
  function toEmoji(s){ return String(s==null?'':s).replace(/#\d{3}/g,function(m){ return EMO[m]||m; }); }

  /* ---------- Wörterbuch (Oberfläche) ---------- */
  var T={
    de:{h:"Aufstellungen",tpl:"Vorlagen",newtpl:"Neue Vorlage",newtplq:"Wie soll die Vorlage heißen? (z. B. Arcadia)",empty:"Noch keine Vorlage. R4 kann oben eine anlegen.",noneSel:"Wähle links eine Vorlage.",stand:"Stand",never:"noch leer",runde:"Neue Runde",rundeq:"Neue Runde starten? Der jetzige Stand wird im Verlauf gesichert und als Startpunkt übernommen.",felder:"Felder",verlauf:"Verlauf",save:"Speichern",saved:"✓ gespeichert & für alle sichtbar",savefail:"Konnte nicht speichern (offline oder keine R4-Rechte).",saving:"speichere & übersetze …",addsec:"+ Abschnitt",addblk:"+ Block",addper:"+ Person",free:"— Freitext —",none:"— leer —",del:"löschen",delq:"Wirklich entfernen?",up:"nach oben",down:"nach unten",copy:"📋 Abschnitt kopieren",copydiff:"📋 Nur Änderungen",copied:"✓ kopiert",nodiff:"Seit der letzten Runde hat sich nichts geändert.",mine:"⭐ Dein Einsatz",notyou:"Du bist in dieser Vorlage nicht eingeteilt.",onlyr4:"Bearbeiten kann nur R4.",r4hint:"Du bist als R4 angemeldet — du kannst bearbeiten.",src:"Stand",cloud:"live (für alle)",local:"nur lokal (nicht gespeichert)",changed:"geändert",fieldname:"Feldname",fieldtype:"Typ",addfield:"+ Feld",opts:"Auswahl-Möglichkeiten (mit Komma trennen)",blkname:"Name des Blocks",secname:"Name des Abschnitts",roster:"Mitgliederliste",rosterhint:"Ein Gamertag pro Zeile. Füttert alle Vorlagen.",sendhint:"Senden in den Spiel-Chat machst du selbst.",histempty:"Noch kein Verlauf.",restore:"als Startpunkt laden",restoreq:"Diesen alten Stand als Startpunkt laden? Der jetzige Stand wird vorher gesichert.",
      ty_text:"Freitext kurz",ty_longtext:"Freitext lang",ty_person:"Eine Person",ty_people:"Personen-Liste",ty_check:"Häkchen",ty_select:"Auswahl",chat:"Chat-Text (nur R4)",chathint:"Fertige Nachricht je Abschnitt — nach dem Bearbeiten „aktualisieren“, dann kopieren und selbst in den Spiel-Chat einfügen.",chatupd:"🔄 aktualisieren",chars:"Zeichen",copy2:"Kopieren",codehint:"Emoji-Codes wie #117 werden im Spiel-Chat zu Emojis. Kopiert wird der Code, nicht das Bild.",strat:"Strategie / Ansage (oben)",strathint:"Kurze Strategie/Ansage für alle — steht oben und in der ersten Chat-Nachricht.",vison:"👁 für Mitglieder sichtbar",visoff:"🙈 für Mitglieder versteckt",memberempty:"Gerade ist keine Aufstellung aktiv. Sobald R4 eine freischaltet, steht sie hier."},
    en:{h:"Line-ups",tpl:"Templates",newtpl:"New template",newtplq:"What should the template be called? (e.g. Arcadia)",empty:"No template yet. R4 can create one above.",noneSel:"Pick a template on the left.",stand:"As of",never:"still empty",runde:"New round",rundeq:"Start a new round? The current state is saved to the history and carried over as the starting point.",felder:"Fields",verlauf:"History",save:"Save",saved:"✓ saved & visible to all",savefail:"Could not save (offline or no R4 rights).",saving:"saving & translating …",addsec:"+ Section",addblk:"+ Block",addper:"+ Person",free:"— Free text —",none:"— empty —",del:"delete",delq:"Really remove?",up:"move up",down:"move down",copy:"📋 Copy section",copydiff:"📋 Changes only",copied:"✓ copied",nodiff:"Nothing has changed since the last round.",mine:"⭐ Your assignment",notyou:"You are not assigned in this template.",onlyr4:"Only R4 can edit.",r4hint:"You are signed in as R4 — you can edit.",src:"Status",cloud:"live (for all)",local:"local only (not saved)",changed:"changed",fieldname:"Field name",fieldtype:"Type",addfield:"+ Field",opts:"Choices (separate with commas)",blkname:"Block name",secname:"Section name",roster:"Member list",rosterhint:"One gamertag per line. Feeds every template.",sendhint:"Sending to the game chat is up to you.",histempty:"No history yet.",restore:"load as starting point",restoreq:"Load this old state as the starting point? The current state is saved first.",
      ty_text:"Short free text",ty_longtext:"Long free text",ty_person:"One person",ty_people:"People list",ty_check:"Checkbox",ty_select:"Choice",chat:"Chat text (R4 only)",chathint:"Ready message per section — after editing hit “update”, then copy and paste it into the game chat yourself.",chatupd:"🔄 update",chars:"chars",copy2:"Copy",codehint:"Emoji codes like #117 turn into emojis in the game chat. The code is copied, not the picture.",strat:"Strategy / note (top)",strathint:"Short strategy/note for everyone — shown on top and in the first chat message.",vison:"👁 visible to members",visoff:"🙈 hidden from members",memberempty:"No line-up is active right now. Once R4 activates one, it appears here."},
    fr:{h:"Formations",tpl:"Modèles",newtpl:"Nouveau modèle",newtplq:"Comment nommer le modèle ? (p. ex. Arcadia)",empty:"Aucun modèle. R4 peut en créer un ci-dessus.",noneSel:"Choisis un modèle à gauche.",stand:"État",never:"encore vide",runde:"Nouveau tour",rundeq:"Démarrer un nouveau tour ? L'état actuel est archivé et repris comme point de départ.",felder:"Champs",verlauf:"Historique",save:"Enregistrer",saved:"✓ enregistré et visible par tous",savefail:"Impossible d'enregistrer (hors ligne ou pas de droits R4).",saving:"enregistrement et traduction …",addsec:"+ Section",addblk:"+ Bloc",addper:"+ Personne",free:"— Texte libre —",none:"— vide —",del:"supprimer",delq:"Vraiment supprimer ?",up:"monter",down:"descendre",copy:"📋 Copier la section",copydiff:"📋 Changements seulement",copied:"✓ copié",nodiff:"Rien n'a changé depuis le dernier tour.",mine:"⭐ Ton affectation",notyou:"Tu n'es pas affecté dans ce modèle.",onlyr4:"Seul R4 peut modifier.",r4hint:"Tu es connecté en R4 — tu peux modifier.",src:"État",cloud:"en direct (pour tous)",local:"local uniquement (non enregistré)",changed:"modifié",fieldname:"Nom du champ",fieldtype:"Type",addfield:"+ Champ",opts:"Choix (séparés par des virgules)",blkname:"Nom du bloc",secname:"Nom de la section",roster:"Liste des membres",rosterhint:"Un gamertag par ligne. Alimente tous les modèles.",sendhint:"L'envoi dans le chat du jeu, c'est toi qui le fais.",histempty:"Pas encore d'historique.",restore:"charger comme point de départ",restoreq:"Charger cet ancien état comme point de départ ? L'état actuel est archivé avant.",
      ty_text:"Texte libre court",ty_longtext:"Texte libre long",ty_person:"Une personne",ty_people:"Liste de personnes",ty_check:"Case à cocher",ty_select:"Choix",chat:"Texte de chat (R4 seulement)",chathint:"Message prêt par section — après édition, clique sur « actualiser », puis copie et colle-le toi-même dans le chat du jeu.",chatupd:"🔄 actualiser",chars:"caractères",copy2:"Copier",codehint:"Les codes emoji comme #117 deviennent des emojis dans le chat du jeu. C'est le code qui est copié, pas l'image.",strat:"Stratégie / note (en haut)",strathint:"Brève stratégie/note pour tous — affichée en haut et dans le premier message de chat.",vison:"👁 visible pour les membres",visoff:"🙈 caché aux membres",memberempty:"Aucune formation active pour l'instant. Dès que R4 en active une, elle apparaît ici."},
    it:{h:"Formazioni",tpl:"Modelli",newtpl:"Nuovo modello",newtplq:"Come si chiama il modello? (es. Arcadia)",empty:"Nessun modello. R4 può crearne uno qui sopra.",noneSel:"Scegli un modello a sinistra.",stand:"Stato",never:"ancora vuoto",runde:"Nuovo turno",rundeq:"Avviare un nuovo turno? Lo stato attuale viene archiviato e ripreso come punto di partenza.",felder:"Campi",verlauf:"Cronologia",save:"Salva",saved:"✓ salvato e visibile a tutti",savefail:"Impossibile salvare (offline o senza diritti R4).",saving:"salvataggio e traduzione …",addsec:"+ Sezione",addblk:"+ Blocco",addper:"+ Persona",free:"— Testo libero —",none:"— vuoto —",del:"elimina",delq:"Rimuovere davvero?",up:"su",down:"giù",copy:"📋 Copia sezione",copydiff:"📋 Solo modifiche",copied:"✓ copiato",nodiff:"Nulla è cambiato dall'ultimo turno.",mine:"⭐ Il tuo incarico",notyou:"Non sei assegnato in questo modello.",onlyr4:"Solo R4 può modificare.",r4hint:"Sei connesso come R4 — puoi modificare.",src:"Stato",cloud:"live (per tutti)",local:"solo locale (non salvato)",changed:"modificato",fieldname:"Nome del campo",fieldtype:"Tipo",addfield:"+ Campo",opts:"Opzioni (separate da virgole)",blkname:"Nome del blocco",secname:"Nome della sezione",roster:"Elenco membri",rosterhint:"Un gamertag per riga. Alimenta tutti i modelli.",sendhint:"L'invio nella chat di gioco lo fai tu.",histempty:"Ancora nessuna cronologia.",restore:"carica come punto di partenza",restoreq:"Caricare questo stato come punto di partenza? Lo stato attuale viene prima archiviato.",
      ty_text:"Testo libero breve",ty_longtext:"Testo libero lungo",ty_person:"Una persona",ty_people:"Elenco di persone",ty_check:"Casella",ty_select:"Scelta",chat:"Testo chat (solo R4)",chathint:"Messaggio pronto per sezione — dopo la modifica premi «aggiorna», poi copia e incollalo tu nella chat di gioco.",chatupd:"🔄 aggiorna",chars:"caratteri",copy2:"Copia",codehint:"I codici emoji come #117 diventano emoji nella chat di gioco. Viene copiato il codice, non l'immagine.",strat:"Strategia / nota (in alto)",strathint:"Breve strategia/nota per tutti — mostrata in alto e nel primo messaggio di chat.",vison:"👁 visibile ai membri",visoff:"🙈 nascosto ai membri",memberempty:"Nessuna formazione attiva al momento. Appena R4 ne attiva una, appare qui."},
    es:{h:"Formaciones",tpl:"Plantillas",newtpl:"Nueva plantilla",newtplq:"¿Cómo se llama la plantilla? (p. ej. Arcadia)",empty:"Aún no hay plantillas. R4 puede crear una arriba.",noneSel:"Elige una plantilla a la izquierda.",stand:"Estado",never:"aún vacío",runde:"Nueva ronda",rundeq:"¿Iniciar una nueva ronda? El estado actual se archiva y se toma como punto de partida.",felder:"Campos",verlauf:"Historial",save:"Guardar",saved:"✓ guardado y visible para todos",savefail:"No se pudo guardar (sin conexión o sin permisos R4).",saving:"guardando y traduciendo …",addsec:"+ Sección",addblk:"+ Bloque",addper:"+ Persona",free:"— Texto libre —",none:"— vacío —",del:"eliminar",delq:"¿Eliminar de verdad?",up:"subir",down:"bajar",copy:"📋 Copiar sección",copydiff:"📋 Solo cambios",copied:"✓ copiado",nodiff:"Nada ha cambiado desde la última ronda.",mine:"⭐ Tu asignación",notyou:"No estás asignado en esta plantilla.",onlyr4:"Solo R4 puede editar.",r4hint:"Estás conectado como R4 — puedes editar.",src:"Estado",cloud:"en vivo (para todos)",local:"solo local (no guardado)",changed:"cambiado",fieldname:"Nombre del campo",fieldtype:"Tipo",addfield:"+ Campo",opts:"Opciones (separadas por comas)",blkname:"Nombre del bloque",secname:"Nombre de la sección",roster:"Lista de miembros",rosterhint:"Un gamertag por línea. Alimenta todas las plantillas.",sendhint:"Enviar al chat del juego lo haces tú.",histempty:"Aún no hay historial.",restore:"cargar como punto de partida",restoreq:"¿Cargar este estado antiguo como punto de partida? El estado actual se archiva antes.",
      ty_text:"Texto libre corto",ty_longtext:"Texto libre largo",ty_person:"Una persona",ty_people:"Lista de personas",ty_check:"Casilla",ty_select:"Opción",chat:"Texto de chat (solo R4)",chathint:"Mensaje listo por sección — tras editar pulsa «actualizar», luego cópialo y pégalo tú en el chat del juego.",chatupd:"🔄 actualizar",chars:"caracteres",copy2:"Copiar",codehint:"Los códigos de emoji como #117 se convierten en emojis en el chat del juego. Se copia el código, no la imagen.",strat:"Estrategia / nota (arriba)",strathint:"Estrategia/nota breve para todos — se muestra arriba y en el primer mensaje de chat.",vison:"👁 visible para miembros",visoff:"🙈 oculto para miembros",memberempty:"Ninguna formación activa ahora mismo. En cuanto R4 active una, aparece aquí."},
    pt:{h:"Formações",tpl:"Modelos",newtpl:"Novo modelo",newtplq:"Como se chama o modelo? (p. ex. Arcadia)",empty:"Ainda não há modelos. R4 pode criar um acima.",noneSel:"Escolhe um modelo à esquerda.",stand:"Estado",never:"ainda vazio",runde:"Nova ronda",rundeq:"Iniciar uma nova ronda? O estado atual é arquivado e assumido como ponto de partida.",felder:"Campos",verlauf:"Histórico",save:"Guardar",saved:"✓ guardado e visível para todos",savefail:"Não foi possível guardar (offline ou sem permissões R4).",saving:"a guardar e traduzir …",addsec:"+ Secção",addblk:"+ Bloco",addper:"+ Pessoa",free:"— Texto livre —",none:"— vazio —",del:"eliminar",delq:"Remover mesmo?",up:"subir",down:"descer",copy:"📋 Copiar secção",copydiff:"📋 Só alterações",copied:"✓ copiado",nodiff:"Nada mudou desde a última ronda.",mine:"⭐ A tua atribuição",notyou:"Não estás atribuído neste modelo.",onlyr4:"Só o R4 pode editar.",r4hint:"Estás autenticado como R4 — podes editar.",src:"Estado",cloud:"ao vivo (para todos)",local:"apenas local (não guardado)",changed:"alterado",fieldname:"Nome do campo",fieldtype:"Tipo",addfield:"+ Campo",opts:"Opções (separadas por vírgulas)",blkname:"Nome do bloco",secname:"Nome da secção",roster:"Lista de membros",rosterhint:"Um gamertag por linha. Alimenta todos os modelos.",sendhint:"Enviar para o chat do jogo és tu que fazes.",histempty:"Ainda sem histórico.",restore:"carregar como ponto de partida",restoreq:"Carregar este estado antigo como ponto de partida? O estado atual é arquivado antes.",
      ty_text:"Texto livre curto",ty_longtext:"Texto livre longo",ty_person:"Uma pessoa",ty_people:"Lista de pessoas",ty_check:"Caixa",ty_select:"Escolha",chat:"Texto de chat (só R4)",chathint:"Mensagem pronta por secção — depois de editar clica em «atualizar», depois copia e cola tu no chat do jogo.",chatupd:"🔄 atualizar",chars:"caracteres",copy2:"Copiar",codehint:"Os códigos de emoji como #117 tornam-se emojis no chat do jogo. É copiado o código, não a imagem.",strat:"Estratégia / nota (topo)",strathint:"Breve estratégia/nota para todos — aparece no topo e na primeira mensagem de chat.",vison:"👁 visível para membros",visoff:"🙈 oculto dos membros",memberempty:"Nenhuma formação ativa de momento. Assim que o R4 ativar uma, aparece aqui."},
    tr:{h:"Dizilimler",tpl:"Şablonlar",newtpl:"Yeni şablon",newtplq:"Şablonun adı ne olsun? (örn. Arcadia)",empty:"Henüz şablon yok. R4 yukarıdan oluşturabilir.",noneSel:"Soldan bir şablon seç.",stand:"Durum",never:"hâlâ boş",runde:"Yeni tur",rundeq:"Yeni tur başlatılsın mı? Mevcut durum geçmişe kaydedilir ve başlangıç noktası olarak devralınır.",felder:"Alanlar",verlauf:"Geçmiş",save:"Kaydet",saved:"✓ kaydedildi & herkese görünür",savefail:"Kaydedilemedi (çevrimdışı veya R4 yetkisi yok).",saving:"kaydediliyor ve çevriliyor …",addsec:"+ Bölüm",addblk:"+ Blok",addper:"+ Kişi",free:"— Serbest metin —",none:"— boş —",del:"sil",delq:"Gerçekten kaldırılsın mı?",up:"yukarı",down:"aşağı",copy:"📋 Bölümü kopyala",copydiff:"📋 Sadece değişiklikler",copied:"✓ kopyalandı",nodiff:"Son turdan beri hiçbir şey değişmedi.",mine:"⭐ Senin görevin",notyou:"Bu şablonda görevlendirilmedin.",onlyr4:"Sadece R4 düzenleyebilir.",r4hint:"R4 olarak giriş yaptın — düzenleyebilirsin.",src:"Durum",cloud:"canlı (herkese)",local:"sadece yerel (kaydedilmedi)",changed:"değişti",fieldname:"Alan adı",fieldtype:"Tür",addfield:"+ Alan",opts:"Seçenekler (virgülle ayır)",blkname:"Blok adı",secname:"Bölüm adı",roster:"Üye listesi",rosterhint:"Satır başına bir gamertag. Tüm şablonları besler.",sendhint:"Oyun sohbetine göndermeyi sen yaparsın.",histempty:"Henüz geçmiş yok.",restore:"başlangıç noktası olarak yükle",restoreq:"Bu eski durum başlangıç noktası olarak yüklensin mi? Mevcut durum önce kaydedilir.",
      ty_text:"Kısa serbest metin",ty_longtext:"Uzun serbest metin",ty_person:"Bir kişi",ty_people:"Kişi listesi",ty_check:"Onay kutusu",ty_select:"Seçim",chat:"Sohbet metni (sadece R4)",chathint:"Bölüm başına hazır mesaj — düzenledikten sonra «güncelle»ye bas, sonra kopyalayıp oyun sohbetine kendin yapıştır.",chatupd:"🔄 güncelle",chars:"karakter",copy2:"Kopyala",codehint:"#117 gibi emoji kodları oyun sohbetinde emojiye dönüşür. Resim değil, kod kopyalanır.",strat:"Strateji / not (üstte)",strathint:"Herkes için kısa strateji/not — üstte ve ilk sohbet mesajında görünür.",vison:"👁 üyelere görünür",visoff:"🙈 üyelerden gizli",memberempty:"Şu anda aktif dizilim yok. R4 birini etkinleştirince burada görünür."},
    ru:{h:"Расстановки",tpl:"Шаблоны",newtpl:"Новый шаблон",newtplq:"Как назвать шаблон? (напр. Arcadia)",empty:"Шаблонов пока нет. R4 может создать выше.",noneSel:"Выбери шаблон слева.",stand:"Состояние",never:"пока пусто",runde:"Новый раунд",rundeq:"Начать новый раунд? Текущее состояние сохранится в истории и станет отправной точкой.",felder:"Поля",verlauf:"История",save:"Сохранить",saved:"✓ сохранено и видно всем",savefail:"Не удалось сохранить (офлайн или нет прав R4).",saving:"сохраняю и перевожу …",addsec:"+ Раздел",addblk:"+ Блок",addper:"+ Участник",free:"— Свой текст —",none:"— пусто —",del:"удалить",delq:"Точно удалить?",up:"вверх",down:"вниз",copy:"📋 Копировать раздел",copydiff:"📋 Только изменения",copied:"✓ скопировано",nodiff:"С прошлого раунда ничего не изменилось.",mine:"⭐ Твоя задача",notyou:"В этом шаблоне ты не назначен.",onlyr4:"Редактировать может только R4.",r4hint:"Ты вошёл как R4 — можешь редактировать.",src:"Статус",cloud:"live (для всех)",local:"только локально (не сохранено)",changed:"изменено",fieldname:"Название поля",fieldtype:"Тип",addfield:"+ Поле",opts:"Варианты (через запятую)",blkname:"Название блока",secname:"Название раздела",roster:"Список участников",rosterhint:"По одному гамертегу в строке. Питает все шаблоны.",sendhint:"Отправку в игровой чат делаешь ты сам.",histempty:"Истории пока нет.",restore:"загрузить как отправную точку",restoreq:"Загрузить это старое состояние как отправную точку? Текущее состояние сначала сохранится.",
      ty_text:"Короткий текст",ty_longtext:"Длинный текст",ty_person:"Один участник",ty_people:"Список участников",ty_check:"Галочка",ty_select:"Выбор",chat:"Текст для чата (только R4)",chathint:"Готовое сообщение по разделу — после правок нажми «обновить», затем скопируй и вставь в игровой чат сам.",chatupd:"🔄 обновить",chars:"симв.",copy2:"Копировать",codehint:"Коды эмодзи вроде #117 превращаются в эмодзи в игровом чате. Копируется код, а не картинка.",strat:"Стратегия / заметка (сверху)",strathint:"Краткая стратегия/заметка для всех — показывается сверху и в первом сообщении чата.",vison:"👁 видно участникам",visoff:"🙈 скрыто от участников",memberempty:"Сейчас нет активной расстановки. Как только R4 активирует, она появится здесь."}
  };
  var TYPES=['text','longtext','person','people','check','select'];

  /* Roster-Startwert = alle R3+R4 mit Hub-Zugang (Jac 20.07.2026, Basis RR-Teams 09.07.,
     Korrektur Gab3ssss). Nur Fallback: sobald das Firestore-Doc '__roster' existiert, gilt DAS.
     Quelle der Wahrheit/Archiv: planung/s1l-gaming-data.json → members. */
  var ROSTER_SEED=["Affenjunge","Bad buddha","Bendix","Beowulf","CleoGreen","CrexoOG","Desol1te","DivineSpectre","DrDr387","Elsa","Fenomen","Frenchy78","Froschi","Gab3ssss","GeoSwear","Ghob","Jac","JCarvalho","Just Jack","Kingeder","KingofSwat","Kringle","Lady M","Lameruka","Lili","Mèo","Meshman","Morrigan","Oppai Dragon","Pedro","Qwe","Schotti","Shadow","SirCoconut","Stefan Silni","Titan","Tourist","White Horse","Yagyu","TilouTW"];

  /* ---------- Kleinkram ---------- */
  function lang(){ try{ return localStorage.getItem('s1l_lang')||'de'; }catch(e){ return 'de'; } }
  function t(k){ var l=lang(); return (T[l]&&T[l][k])||T.en[k]||T.de[k]||k; }
  function L(o){ if(o==null) return ''; if(typeof o==='string') return o;
    var l=lang(); if(o[l]) return o[l];
    for(var i=0;i<LANGS.length;i++){ if(o[LANGS[i]]) return o[LANGS[i]]; }
    return o.orig||''; }
  function isR4(){ try{ return sessionStorage.getItem('s1l_r4_ok')==='1'; }catch(e){ return false; } }
  function preview(){ try{ return sessionStorage.getItem('s1l_preview')==='1'; }catch(e){ return false; } }
  function r4Active(){ return isR4() && !preview(); }
  function myName(){ try{ return (sessionStorage.getItem('s1l_name')||'').trim(); }catch(e){ return ''; } }
  function eq(a,b){ return String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase(); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function uid(p){ return p+Math.random().toString(36).slice(2,8); }
  function today(){ var d=new Date(); function p(n){return n<10?'0'+n:''+n;} return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
  function deDate(s){ if(!s||s.length<10) return s||''; return s.slice(8,10)+'.'+s.slice(5,7)+'.'; }

  /* ---------- Beispiel-Vorlage (Fallback, solange die Cloud leer ist) ---------- */
  function demo(){
    var fLead={id:'fl',typ:'person',label:{orig:'Anführer',lang:'de',de:'Anführer',en:'Leader',fr:'Chef',it:'Capo',es:'Líder',pt:'Líder',tr:'Lider',ru:'Лидер'}};
    var fTask={id:'ft',typ:'longtext',label:{orig:'Aufgabe',lang:'de',de:'Aufgabe',en:'Task',fr:'Tâche',it:'Compito',es:'Tarea',pt:'Tarefa',tr:'Görev',ru:'Задача'}};
    var fCrew={id:'fc',typ:'people',label:{orig:'Truppe',lang:'de',de:'Truppe',en:'Crew',fr:'Équipe',it:'Squadra',es:'Tropa',pt:'Tropa',tr:'Birlik',ru:'Отряд'}};
    function blk(name,lead,task,crew){ var w={}; w.fl=lead; w.ft={orig:task,lang:'de',de:task}; w.fc=crew;
      return {id:uid('b'),name:{orig:name,lang:'de',de:name},w:w}; }
    return { key:'rr', ord:0, mark:'#117',
      titel:{orig:'Reservoir Raid',lang:'de',de:'Reservoir Raid',en:'Reservoir Raid',fr:'Reservoir Raid',it:'Reservoir Raid',es:'Reservoir Raid',pt:'Reservoir Raid',tr:'Reservoir Raid',ru:'Reservoir Raid'},
      strat:{orig:'Halten gewinnt, nicht Töten. Jeder auf sein zugewiesenes Gebäude, Zone verteidigen.',lang:'de',de:'Halten gewinnt, nicht Töten. Jeder auf sein zugewiesenes Gebäude, Zone verteidigen.'},
      felder:[fLead,fTask,fCrew],
      abschnitte:[
        {id:uid('a'),name:{orig:'Phase 1',lang:'de',de:'Phase 1',en:'Phase 1',fr:'Phase 1',it:'Fase 1',es:'Fase 1',pt:'Fase 1',tr:'Faz 1',ru:'Фаза 1'},
         bloecke:[ blk('Wasserwerk','Anführer 1','Gebäude nehmen und halten.',['Mitglied 1','Mitglied 2']),
                   blk('Solarstromstation','Anführer 2','Zone verteidigen.',['Mitglied 3','Mitglied 4']) ]},
        {id:uid('a'),name:{orig:'Phase 2',lang:'de',de:'Phase 2',en:'Phase 2',fr:'Phase 2',it:'Fase 2',es:'Fase 2',pt:'Fase 2',tr:'Faz 2',ru:'Фаза 2'},
         bloecke:[ blk('Zentralreservoir','Anführer 1','Halten bis zum Ende.',['Mitglied 1','Mitglied 3']) ]}
      ],
      vor:null, ausgabe:today(), historie:[], sichtbar:true, tms:0, editor:'' };
  }

  /* ---------- Zustand ---------- */
  var DOCS={}, ROSTER=ROSTER_SEED.slice(), col=null, source='local', sel=null, root=null, dirty=false, msg='';

  function keys(){ var out=[]; for(var k in DOCS){
      if(k===ROSTER_ID) continue;
      if(DOCS[k].versteckt) continue;                 /* soft-gelöscht: für niemanden */
      if(!r4Active() && !DOCS[k].sichtbar) continue;   /* Mitglieder: nur freigeschaltete */
      out.push(k); }
    out.sort(function(a,b){ var x=DOCS[a].ord||0,y=DOCS[b].ord||0; if(x!==y) return x-y;
      return L(DOCS[a].titel).toLowerCase()<L(DOCS[b].titel).toLowerCase()?-1:1; }); return out; }
  function cur(){ return sel&&DOCS[sel]?DOCS[sel]:null; }
  function feld(doc,id){ for(var i=0;i<doc.felder.length;i++){ if(doc.felder[i].id===id) return doc.felder[i]; } return null; }

  /* ---------- Firebase ---------- */
  function loadScript(src,cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }
  function initFb(done){ if(typeof firebase!=='undefined') return done();
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",function(){
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",done); }); }
  function connect(onUpdate){
    initFb(function(){ try{
      if(typeof firebase==='undefined'){ onUpdate(); return; }
      if(!firebase.apps.length) firebase.initializeApp(FB);
      col=firebase.firestore().collection(COL);
      col.onSnapshot(function(snap){
        var seen=false;
        snap.forEach(function(d){
          var data=d.data()||{};
          if(d.id===ROSTER_ID){ ROSTER=data.namen||[]; return; }
          if(!data.felder) return;
          DOCS[d.id]=data; seen=true;
        });
        if(seen) source='cloud';
        if(sel&&!DOCS[sel]) sel=null;
        onUpdate();
      }, function(){ col=null; source='local'; onUpdate(); });
    }catch(e){ col=null; source='local'; onUpdate(); } });
  }
  function put(id,doc,cb){
    if(col){ col.doc(id).set(doc).then(function(){cb&&cb(true);}).catch(function(){cb&&cb(false);}); }
    else { cb&&cb(false); }
  }

  /* ---------- Übersetzen (gleicher Worker wie content.js) ---------- */
  function translate(text,cb){
    if(!text||!String(text).trim()){ cb(null); return; }
    try{ fetch(TRANSLATE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text})})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ cb(j||null); }).catch(function(){ cb(null); }); }
    catch(e){ cb(null); }
  }
  /* Baut ein Sprach-Objekt. Unverändert => alte Übersetzungen behalten. */
  function mk(text,old,cb){
    text=String(text==null?'':text);
    if(old&&old.orig===text){ cb(old); return; }
    var o={orig:text,lang:lang()}; o[lang()]=text;
    translate(text,function(j){ if(j){ for(var i=0;i<LANGS.length;i++){ var l=LANGS[i]; if(j[l]) o[l]=j[l]; } } cb(o); });
  }
  /* Mehrere mk() nacheinander — jobs = [{get,set,old}] */
  function mkAll(jobs,done){
    var i=0;
    (function next(){ if(i>=jobs.length){ done(); return; }
      var j=jobs[i++]; mk(j.text,j.old,function(o){ j.set(o); next(); }); })();
  }

  /* ---------- Kopiertext ---------- */
  function blockText(doc,b){
    var out=[L(b.name)];
    doc.felder.forEach(function(f){
      var v=b.w?b.w[f.id]:null;
      if(f.typ==='people'){ if(v&&v.length) out.push(L(f.label)+': '+v.join(', ')); }
      else if(f.typ==='check'){ if(v) out.push(L(f.label)); }
      else if(f.typ==='person'){ if(v) out.push(L(f.label)+': '+v); }
      else if(f.typ==='select'){ if(v) out.push(L(f.label)+': '+v); }
      else { var s=L(v); if(s) out.push(s); }
    });
    return out.join('\n');
  }
  function sectionText(doc,sec,onlyChanged){
    var parts=[L(sec.name)];
    sec.bloecke.forEach(function(b){ if(onlyChanged&&!blockChanged(doc,sec,b)) return; parts.push(blockText(doc,b)); });
    return parts.length>1?parts.join('\n\n'):'';
  }
  function oldBlock(doc,sec,b){
    if(!doc.vor) return null;
    for(var i=0;i<doc.vor.length;i++){ if(doc.vor[i].id!==sec.id) continue;
      var bl=doc.vor[i].bloecke||[];
      for(var j=0;j<bl.length;j++){ if(bl[j].id===b.id) return bl[j]; } }
    return null;
  }
  function blockChanged(doc,sec,b){
    if(!doc.vor) return false;
    var o=oldBlock(doc,sec,b);
    if(!o) return true;
    return JSON.stringify(b.w||{})!==JSON.stringify(o.w||{}) || L(b.name)!==L(o.name);
  }

  /* ---------- "Dein Einsatz" ---------- */
  function mineHtml(doc){
    var me=myName(); if(!me) return '';
    var hits=[];
    (doc.abschnitte||[]).forEach(function(sec){
      (sec.bloecke||[]).forEach(function(b){
        var mine=false, rolle=[];
        doc.felder.forEach(function(f){
          var v=b.w?b.w[f.id]:null;
          if(f.typ==='person'&&eq(v,me)){ mine=true; rolle.push(L(f.label)); }
          if(f.typ==='people'&&v&&v.length){ for(var i=0;i<v.length;i++){ if(eq(v[i],me)){ mine=true; rolle.push(L(f.label)); break; } } }
        });
        if(!mine) return;
        var task='';
        doc.felder.forEach(function(f){ if(f.typ==='longtext'&&!task) task=L(b.w?b.w[f.id]:null); });
        hits.push(esc(L(sec.name))+' · '+esc(L(b.name))+' · '+esc(rolle.join(', '))+(task?' — '+esc(task):''));
      });
    });
    if(!hits.length) return '<div class="plmine none">'+esc(t('notyou'))+'</div>';
    return '<div class="plmine"><b>'+esc(t('mine'))+'</b><ul><li>'+hits.join('</li><li>')+'</li></ul></div>';
  }

  /* ---------- Ansicht (lesen) ---------- */
  function viewBlock(doc,sec,b){
    var h='<div class="plblk'+(blockChanged(doc,sec,b)?' chg':'')+'"><div class="plblk-h">'+esc(L(b.name));
    if(blockChanged(doc,sec,b)) h+=' <span class="plchg">'+esc(t('changed'))+'</span>';
    h+='</div>';
    doc.felder.forEach(function(f){
      var v=b.w?b.w[f.id]:null;
      if(f.typ==='check'){ if(v) h+='<div class="plrow"><span class="pllbl">☑</span> '+esc(L(f.label))+'</div>'; return; }
      if(f.typ==='people'){ if(!v||!v.length) return;
        var chips=v.map(function(n){ return '<span class="rrchip'+(eq(n,myName())?' me':'')+'">'+esc(n)+'</span>'; }).join('');
        h+='<div class="plrow"><span class="pllbl">'+esc(L(f.label))+'</span><span class="rrchips">'+chips+'</span></div>'; return; }
      if(f.typ==='person'){ if(!v) return;
        h+='<div class="plrow"><span class="pllbl">'+esc(L(f.label))+'</span><span class="rrchip lead'+(eq(v,myName())?' me':'')+'">👑 '+esc(v)+'</span></div>'; return; }
      var s=(f.typ==='select')?String(v||''):L(v);
      if(s) h+='<div class="plrow"><span class="pllbl">'+esc(L(f.label))+'</span>'+esc(s)+'</div>';
    });
    return h+'</div>';
  }
  function viewSection(doc,sec,idx){
    /* Mitglieder-Ansicht = reine Info (kein Kopieren — das ist R4-Sache). */
    var h='<div class="plsec"><div class="plsec-h">'+esc(L(sec.name))+'</div>';
    (sec.bloecke||[]).forEach(function(b){ h+=viewBlock(doc,sec,b); });
    return h+'</div>';
  }

  /* ---------- Chat-Text (nur R4) — GLEICHE Bau-Logik wie Eventcenter/rr.js ----------
     Block:  🏭 <Name>  (<Anführer-Label>: X)  [ 📣 falls Häkchen an]
             • <Person aus Personen-Liste>
             <Freitext-Zeilen>
     Nachricht je Abschnitt, Header „<Emoji> S1L — <Titel> · <Abschnitt>",
     900-Zeichen-Limit mit (1/2)-Splitting (wie rr.js messages()). */
  var CHATLIM=900;
  function blockLines(doc,b){
    var head='#170 '+L(b.name), flag='', body=[];   /* #170 = 📍 im Spiel */
    doc.felder.forEach(function(f){
      var v=b.w?b.w[f.id]:null;
      if(f.typ==='person'){ if(v) head+='  ('+L(f.label)+': '+v+')'; }
      else if(f.typ==='select'){ if(v) head+='  ('+L(f.label)+': '+v+')'; }
      else if(f.typ==='check'){ if(v) flag+=' #190'; }   /* #190 = 📣 im Spiel */
      else if(f.typ==='people'){ (v||[]).forEach(function(n){ if(n) body.push('• '+n); }); }
      else { var s=L(v); if(s) body.push(s); }
    });
    return [head+flag].concat(body).join('\n');
  }
  function blockEmpty(doc,b){ return !L(b.name) && blockLines(doc,b).indexOf('\n')<0; }
  function messages(doc){
    var mark=doc.mark||'', out=[];
    var strat=L(doc.strat);
    if(strat&&strat.trim()){
      out.push({title:t('strat'),text:(mark?mark+' ':'')+'S1L — '+L(doc.titel)+' · '+t('strat')+'\n\n'+strat});
    }
    (doc.abschnitte||[]).forEach(function(sec){
      var header=(mark?mark+' ':'')+'S1L — '+L(doc.titel)+' · '+L(sec.name);
      var blocks=(sec.bloecke||[]).filter(function(b){ return !blockEmpty(doc,b); }).map(function(b){ return blockLines(doc,b); });
      if(!blocks.length){ out.push({title:L(sec.name),text:header}); return; }
      var chunks=[], chunk=[header];
      blocks.forEach(function(blk){
        var tentative=chunk.concat(['',blk]).join('\n');
        if(tentative.length>CHATLIM && chunk.length>1){ chunks.push(chunk); chunk=[header]; }
        chunk.push(''); chunk.push(blk);
      });
      chunks.push(chunk);
      chunks.forEach(function(c,i){
        var part=chunks.length>1?(' ('+(i+1)+'/'+chunks.length+')'):'';
        var txt=c.join('\n'); if(part) txt=txt.replace(header,header+part);
        out.push({title:L(sec.name)+part,text:txt});
      });
    });
    return out;
  }

  /* ---------- Bearbeiten ---------- */
  function optList(cur){
    var set={}, out=[];
    ROSTER.forEach(function(n){ if(n&&!set[n.toLowerCase()]){set[n.toLowerCase()]=1;out.push(n);} });
    if(cur&&!set[String(cur).toLowerCase()]) out.push(cur);
    out.sort(function(a,b){return a.toLowerCase()<b.toLowerCase()?-1:1;});
    return out;
  }
  function personSelect(val,cls){
    var known=false; optList().forEach(function(n){ if(eq(n,val)) known=true; });
    var free=val&&!known;
    var h='<select class="plsel '+cls+'"><option value="">'+esc(t('none'))+'</option>';
    optList(free?null:val).forEach(function(n){ h+='<option'+(eq(n,val)?' selected':'')+'>'+esc(n)+'</option>'; });
    h+='<option value="__free"'+(free?' selected':'')+'>'+esc(t('free'))+'</option></select>';
    h+='<input type="text" class="plfree '+cls+'" value="'+esc(free?val:'')+'"'+(free?'':' hidden')+'>';
    return h;
  }
  function editBlock(doc,b,si,bi){
    var h='<div class="plblk edit" data-si="'+si+'" data-bi="'+bi+'">'
      +'<div class="plblk-h"><input type="text" class="plbname" value="'+esc(L(b.name))+'" placeholder="'+esc(t('blkname'))+'">'
      +'<span class="pltools"><button type="button" class="plmini" data-act="bup" title="'+esc(t('up'))+'">▲</button>'
      +'<button type="button" class="plmini" data-act="bdown" title="'+esc(t('down'))+'">▼</button>'
      +'<button type="button" class="plmini" data-act="bdel" title="'+esc(t('del'))+'">🗑</button></span></div>';
    doc.felder.forEach(function(f){
      var v=b.w?b.w[f.id]:null;
      h+='<div class="plrow edit" data-fid="'+esc(f.id)+'" data-typ="'+esc(f.typ)+'"><span class="pllbl">'+esc(L(f.label))+'</span><span class="plval">';
      if(f.typ==='text') h+='<input type="text" class="plv" value="'+esc(L(v))+'">';
      else if(f.typ==='longtext') h+='<textarea class="plv" rows="2">'+esc(L(v))+'</textarea>';
      else if(f.typ==='check') h+='<input type="checkbox" class="plv"'+(v?' checked':'')+'>';
      else if(f.typ==='person') h+=personSelect(v,'plv');
      else if(f.typ==='select'){ h+='<select class="plv"><option value="">'+esc(t('none'))+'</option>';
        (f.opts||[]).forEach(function(o){ h+='<option'+(o===v?' selected':'')+'>'+esc(o)+'</option>'; }); h+='</select>'; }
      else if(f.typ==='people'){ h+='<span class="plpeople">';
        (v||[]).forEach(function(n){ h+='<span class="plprow">'+personSelect(n,'plv')+'<button type="button" class="plmini" data-act="pdel">✕</button></span>'; });
        h+='</span><button type="button" class="plmini add" data-act="padd">'+esc(t('addper'))+'</button>'; }
      h+='</span></div>';
    });
    return h+'</div>';
  }
  function editSection(doc,sec,si){
    var h='<div class="plsec edit" data-si="'+si+'">'
      +'<div class="plsec-h"><input type="text" class="plsname" value="'+esc(L(sec.name))+'" placeholder="'+esc(t('secname'))+'">'
      +'<span class="pltools"><button type="button" class="plmini" data-act="sup" title="'+esc(t('up'))+'">▲</button>'
      +'<button type="button" class="plmini" data-act="sdown" title="'+esc(t('down'))+'">▼</button>'
      +'<button type="button" class="plmini" data-act="sdel" title="'+esc(t('del'))+'">🗑</button></span></div>';
    (sec.bloecke||[]).forEach(function(b,bi){ h+=editBlock(doc,b,si,bi); });
    h+='<div class="plbar"><button type="button" class="plbtn" data-act="addblk" data-si="'+si+'">'+esc(t('addblk'))+'</button></div></div>';
    return h;
  }
  function fieldEditor(doc){
    var h='<details class="plfields"><summary>'+esc(t('felder'))+'</summary><div class="plfwrap">';
    doc.felder.forEach(function(f,fi){
      h+='<div class="plfrow" data-fi="'+fi+'">'
        +'<input type="text" class="plflbl" value="'+esc(L(f.label))+'" placeholder="'+esc(t('fieldname'))+'">'
        +'<select class="plftyp">';
      TYPES.forEach(function(ty){ h+='<option value="'+ty+'"'+(ty===f.typ?' selected':'')+'>'+esc(t('ty_'+ty))+'</option>'; });
      h+='</select>'
        +'<input type="text" class="plfopt" value="'+esc((f.opts||[]).join(', '))+'" placeholder="'+esc(t('opts'))+'"'+(f.typ==='select'?'':' hidden')+'>'
        +'<button type="button" class="plmini" data-act="fup">▲</button>'
        +'<button type="button" class="plmini" data-act="fdown">▼</button>'
        +'<button type="button" class="plmini" data-act="fdel">🗑</button></div>';
    });
    h+='<button type="button" class="plbtn" data-act="addfield">'+esc(t('addfield'))+'</button></div></details>';
    return h;
  }
  function rosterEditor(){
    return '<details class="plfields"><summary>'+esc(t('roster'))+'</summary><div class="plfwrap">'
      +'<p class="plhint">'+esc(t('rosterhint'))+'</p>'
      +'<textarea class="plroster" rows="6">'+esc(ROSTER.join('\n'))+'</textarea></div></details>';
  }
  function histHtml(doc){
    var h='<details class="plfields"><summary>'+esc(t('verlauf'))+'</summary><div class="plfwrap">';
    var hist=doc.historie||[];
    if(!hist.length) h+='<p class="plhint">'+esc(t('histempty'))+'</p>';
    for(var i=hist.length-1;i>=0;i--){
      h+='<div class="plfrow"><span>'+esc(deDate(hist[i].ausgabe))+' · '+esc(hist[i].editor||'')+'</span>'
        +(r4Active()?'<button type="button" class="plmini" data-act="hload" data-hi="'+i+'">'+esc(t('restore'))+'</button>':'')+'</div>';
    }
    return h+'</div></details>';
  }

  function stratEditor(doc){
    return '<div class="plstratbox"><label class="plstrat-l">'+esc(t('strat'))+'</label>'
      +'<textarea class="plstrat" rows="3" placeholder="'+esc(t('strathint'))+'">'+esc(L(doc.strat))+'</textarea></div>';
  }
  /* Mitglieder-Ansicht = die lesbare (Emoji-)Version der Nachrichten, die R4 in den Chat postet. */
  function memberView(doc){
    var h='';
    messages(doc).forEach(function(mm){
      h+='<div class="plread"><div class="plread-h">'+esc(mm.title)+'</div><pre class="block">'+esc(toEmoji(mm.text))+'</pre></div>';
    });
    return h;
  }

  var chatMsgs=[];   /* zuletzt erzeugte Nachrichten (roh, mit Spiel-Codes) — für exaktes Kopieren */
  function chatArea(doc){
    chatMsgs=messages(doc);
    var h='<div class="plchat"><h3 class="plchat-h">'+esc(t('chat'))+'</h3>'
      +'<p class="plhint">'+esc(t('chathint'))+'</p>'
      +'<p class="plhint">'+esc(t('codehint'))+'</p>'
      +'<div class="plbar"><button type="button" class="plbtn" data-act="chatrefresh">'+esc(t('chatupd'))+'</button></div>';
    chatMsgs.forEach(function(mm,i){
      var n=mm.text.length;   /* Zeichenzahl = roher Text (das, was ins Spiel geht) */
      h+='<div class="live-blk"><div class="hd">'+esc(mm.title)
        +' <span class="cnt'+(n>CHATLIM?' warn':'')+'">'+n+' '+esc(t('chars'))+(n>CHATLIM?' ⚠️':'')+'</span></div>'
        +'<pre class="block">'+esc(toEmoji(mm.text))+'</pre>'
        +'<button type="button" class="copybtn" data-act="chatcopy" data-mi="'+i+'">📋 '+esc(t('copy2'))+'</button></div>';
    });
    return h+'</div>';
  }

  /* ---------- Rendern ---------- */
  function render(){
    if(!root) return;
    var ks=keys(), doc=cur();
    var side='<div class="plside"><div class="plside-h">'+esc(t('tpl'))+'</div>';
    if(!ks.length) side+='<p class="plhint">'+esc(r4Active()?t('empty'):t('memberempty'))+'</p>';
    ks.forEach(function(k){
      var d=DOCS[k];
      var badge=(r4Active()&&!d.sichtbar)?' <span class="plhid">🙈</span>':'';
      side+='<button type="button" class="pltpl'+(k===sel?' on':'')+'" data-act="pick" data-key="'+esc(k)+'">'
        +'<span class="pltpl-n">'+esc(L(d.titel))+badge+'</span>'
        +'<span class="pltpl-s">'+esc(d.ausgabe?t('stand')+' '+deDate(d.ausgabe):t('never'))+'</span></button>';
    });
    if(r4Active()) side+='<button type="button" class="plbtn" data-act="newtpl">'+esc(t('newtpl'))+'</button>';
    side+='</div>';

    var main='<div class="plmain">';
    if(!doc){ main+='<p class="plhint">'+esc(t('noneSel'))+'</p>'; }
    else{
      main+='<div class="plhead"><div><div class="plttl">'+esc(L(doc.titel))+'</div>'
        +'<div class="plsub">'+esc(t('stand')+' '+deDate(doc.ausgabe))+(doc.editor?' · '+esc(doc.editor):'')
        +' <span class="rrsrc '+(source==='cloud'?'on':'off')+'">'+esc(t('src')+': '+(source==='cloud'?t('cloud'):t('local')))+'</span></div></div>';
      if(r4Active()) main+='<div class="plbar">'
        +'<button type="button" class="plbtn'+(doc.sichtbar?' save':'')+'" data-act="vis">'+esc(doc.sichtbar?t('vison'):t('visoff'))+'</button>'
        +'<button type="button" class="plbtn" data-act="runde">'+esc(t('runde'))+'</button>'
        +'<button type="button" class="plbtn" data-act="tpldel">🗑</button></div>';
      main+='</div>';
      main+=mineHtml(doc);
      if(r4Active()){
        main+=stratEditor(doc);
        main+=fieldEditor(doc)+rosterEditor();
        (doc.abschnitte||[]).forEach(function(sec,si){ main+=editSection(doc,sec,si); });
        main+='<div class="plbar"><button type="button" class="plbtn" data-act="addsec">'+esc(t('addsec'))+'</button>'
          +'<button type="button" class="plbtn save" data-act="save">'+esc(t('save'))+'</button></div>';
        main+=chatArea(doc);
        main+='<p class="plhint">'+esc(t('sendhint'))+'</p>';
      } else {
        main+=memberView(doc);
        if(isR4()) main+='<p class="plhint">'+esc(t('r4hint'))+'</p>';
      }
      main+=histHtml(doc);
      if(msg) main+='<p class="plmsg">'+esc(msg)+'</p>';
    }
    main+='</div>';
    root.innerHTML='<div class="plgrid">'+side+main+'</div>';
  }

  /* ---------- Auslesen der Eingaben ---------- */
  function readPerson(scope){
    var sel2=scope.querySelector('select.plsel'), free=scope.querySelector('input.plfree');
    if(!sel2) return '';
    if(sel2.value==='__free') return free?free.value.trim():'';
    return sel2.value;
  }
  /* Liest die Oberfläche in den Doc-Entwurf. Texte werden anschließend übersetzt. */
  function harvest(doc){
    var jobs=[];
    var fwrap=root.querySelector('.plfields .plfwrap');
    if(fwrap){
      var frows=fwrap.querySelectorAll('.plfrow');
      for(var i=0;i<frows.length&&i<doc.felder.length;i++){
        var f=doc.felder[i], r=frows[i];
        var lbl=r.querySelector('.plflbl'), ty=r.querySelector('.plftyp'), op=r.querySelector('.plfopt');
        if(ty) f.typ=ty.value;
        if(op) f.opts=f.typ==='select'?op.value.split(',').map(function(s){return s.trim();}).filter(Boolean):[];
        if(lbl) (function(f,txt){ jobs.push({text:txt,old:f.label,set:function(o){ f.label=o; }}); })(f,lbl.value);
      }
    }
    var rt=root.querySelector('.plroster');
    if(rt) ROSTER=rt.value.split('\n').map(function(s){return s.trim();}).filter(Boolean);

    var st=root.querySelector('.plstrat');
    if(st) jobs.push({text:st.value,old:doc.strat,set:function(o){ doc.strat=o; }});

    root.querySelectorAll('.plsec.edit').forEach(function(se){
      var si=+se.getAttribute('data-si'), sec=doc.abschnitte[si]; if(!sec) return;
      var sn=se.querySelector('.plsname');
      if(sn) jobs.push({text:sn.value,old:sec.name,set:function(o){ sec.name=o; }});
      se.querySelectorAll('.plblk.edit').forEach(function(be){
        var bi=+be.getAttribute('data-bi'), b=sec.bloecke[bi]; if(!b) return;
        var bn=be.querySelector('.plbname');
        if(bn) jobs.push({text:bn.value,old:b.name,set:function(o){ b.name=o; }});
        b.w=b.w||{};
        be.querySelectorAll('.plrow.edit').forEach(function(re){
          var fid=re.getAttribute('data-fid'), typ=re.getAttribute('data-typ');
          if(typ==='people'){
            var arr=[]; re.querySelectorAll('.plprow').forEach(function(pr){ var v=readPerson(pr); if(v) arr.push(v); });
            b.w[fid]=arr; return;
          }
          if(typ==='person'){ b.w[fid]=readPerson(re); return; }
          var el=re.querySelector('.plv'); if(!el) return;
          if(typ==='check'){ b.w[fid]=!!el.checked; return; }
          if(typ==='select'){ b.w[fid]=el.value; return; }
          (function(fid,txt){ jobs.push({text:txt,old:b.w[fid],set:function(o){ b.w[fid]=o; }}); })(fid,el.value);
        });
      });
    });
    return jobs;
  }

  function doSave(){
    var doc=cur(); if(!doc||!r4Active()) return;
    var draft=clone(doc);
    var jobs=harvest(draft);
    msg=t('saving'); render();
    mkAll(jobs,function(){
      draft.tms=Date.now(); draft.editor=myName();
      DOCS[sel]=draft;
      var pending=2, okAll=true;
      function done(ok){ okAll=okAll&&ok; if(--pending) return;
        msg=okAll?t('saved'):t('savefail'); dirty=false; render(); }
      put(sel,draft,done);
      put(ROSTER_ID,{namen:ROSTER,tms:Date.now(),editor:myName()},done);
    });
  }

  function neueRunde(){
    var doc=cur(); if(!doc||!r4Active()) return;
    if(!window.confirm(t('rundeq'))) return;
    var draft=clone(doc);
    var jobs=harvest(draft);
    msg=t('saving'); render();
    mkAll(jobs,function(){
      draft.historie=(draft.historie||[]).concat([{ausgabe:draft.ausgabe,tms:Date.now(),editor:myName(),abschnitte:clone(draft.abschnitte)}]);
      while(draft.historie.length>HIST_MAX) draft.historie.shift();
      draft.vor=clone(draft.abschnitte);
      draft.ausgabe=today(); draft.tms=Date.now(); draft.editor=myName();
      DOCS[sel]=draft; render();
      put(sel,draft,function(ok){ msg=ok?t('saved'):t('savefail'); render(); });
    });
  }

  /* ---------- Klicks & Eingaben ---------- */
  function onClick(e){
    var b=e.target.closest?e.target.closest('button'):null; if(!b) return;
    var act=b.getAttribute('data-act'); if(!act) return;
    var doc=cur();

    if(act==='pick'){ sel=b.getAttribute('data-key'); msg=''; render(); return; }

    if(act==='newtpl'){
      var name=window.prompt(t('newtplq'),''); if(!name||!name.trim()) return;
      var key=name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||uid('v');
      if(DOCS[key]){ sel=key; render(); return; }
      var d=demo(); d.key=key; d.abschnitte=[]; d.historie=[]; d.vor=null; d.ausgabe=today(); d.mark=''; d.strat=null; d.sichtbar=false;
      d.titel={orig:name.trim(),lang:lang()}; d.titel[lang()]=name.trim();
      d.ord=keys().length;
      DOCS[key]=d; sel=key; msg=t('saving'); render();
      mk(name.trim(),null,function(o){ d.titel=o; d.tms=Date.now(); d.editor=myName();
        put(key,d,function(ok){ msg=ok?t('saved'):t('savefail'); render(); }); });
      return;
    }
    if(!doc) return;

    if(act==='chatcopy'){
      /* kopiert den ROHEN Text MIT Spiel-Codes (#117 …), nicht die lesbare Emoji-Vorschau */
      var mi=+b.getAttribute('data-mi'); var mm=chatMsgs[mi];
      if(mm) copy(mm.text,b); return;
    }
    if(!r4Active()) return;

    if(act==='chatrefresh'){
      /* ungespeicherte Formular-Eingaben übernehmen (synchron), dann Chat-Text neu bauen */
      harvestInto(DOCS[sel]); render(); return;
    }

    if(act==='save'){ doSave(); return; }
    if(act==='vis'){
      /* Sofort umschalten: aktuelle Eingaben übernehmen, sichtbar kippen, speichern. */
      harvestInto(DOCS[sel]); DOCS[sel].sichtbar=!DOCS[sel].sichtbar;
      DOCS[sel].tms=Date.now(); DOCS[sel].editor=myName();
      put(sel,DOCS[sel],function(ok){ msg=ok?t('saved'):t('savefail'); render(); });
      render(); return;
    }
    if(act==='runde'){ neueRunde(); return; }
    if(act==='tpldel'){
      if(!window.confirm(t('delq'))) return;
      /* Nicht endgültig löschen: Doc bleibt, wird nur als versteckt markiert. */
      var d2=clone(doc); d2.ord=999; d2.versteckt=true; d2.tms=Date.now(); d2.editor=myName();
      DOCS[sel]=d2; put(sel,d2,function(){}); sel=null; render(); return;
    }
    if(act==='addsec'){ var dr=clone(doc); harvestInto(dr);
      dr.abschnitte.push({id:uid('a'),name:{orig:'',lang:lang()},bloecke:[]}); DOCS[sel]=dr; render(); return; }
    if(act==='addblk'){ var dr2=clone(doc); harvestInto(dr2);
      var s2=dr2.abschnitte[+b.getAttribute('data-si')]; if(s2) s2.bloecke.push({id:uid('b'),name:{orig:'',lang:lang()},w:{}});
      DOCS[sel]=dr2; render(); return; }
    if(act==='addfield'){ var dr3=clone(doc); harvestInto(dr3);
      dr3.felder.push({id:uid('f'),typ:'text',label:{orig:'',lang:lang()},opts:[]}); DOCS[sel]=dr3; render(); return; }

    var frow=b.closest('.plfrow'), blk=b.closest('.plblk.edit'), sec2=b.closest('.plsec.edit'), prow=b.closest('.plprow');

    if(act==='padd'||act==='pdel'){
      var dr4=clone(doc); harvestInto(dr4);
      var si4=+blk.getAttribute('data-si'), bi4=+blk.getAttribute('data-bi');
      var row=b.closest('.plrow.edit'), fid=row.getAttribute('data-fid');
      var arr=dr4.abschnitte[si4].bloecke[bi4].w[fid]||[];
      if(act==='padd') arr.push('');
      else { var idx=Array.prototype.indexOf.call(row.querySelectorAll('.plprow'),prow); if(idx>=0) arr.splice(idx,1); }
      dr4.abschnitte[si4].bloecke[bi4].w[fid]=arr; DOCS[sel]=dr4; render(); return;
    }
    if(act==='fup'||act==='fdown'||act==='fdel'){
      var dr5=clone(doc); harvestInto(dr5);
      var fi=+frow.getAttribute('data-fi');
      if(act==='fdel'){ if(!window.confirm(t('delq'))) return; dr5.felder.splice(fi,1); }
      else move(dr5.felder,fi,act==='fup'?-1:1);
      DOCS[sel]=dr5; render(); return;
    }
    if(act==='sup'||act==='sdown'||act==='sdel'){
      var dr6=clone(doc); harvestInto(dr6);
      var si6=+sec2.getAttribute('data-si');
      if(act==='sdel'){ if(!window.confirm(t('delq'))) return; dr6.abschnitte.splice(si6,1); }
      else move(dr6.abschnitte,si6,act==='sup'?-1:1);
      DOCS[sel]=dr6; render(); return;
    }
    if(act==='bup'||act==='bdown'||act==='bdel'){
      var dr7=clone(doc); harvestInto(dr7);
      var si7=+blk.getAttribute('data-si'), bi7=+blk.getAttribute('data-bi');
      var list=dr7.abschnitte[si7].bloecke;
      if(act==='bdel'){ if(!window.confirm(t('delq'))) return; list.splice(bi7,1); }
      else move(list,bi7,act==='bup'?-1:1);
      DOCS[sel]=dr7; render(); return;
    }
    if(act==='hload'){
      if(!window.confirm(t('restoreq'))) return;
      var dr8=clone(doc); harvestInto(dr8);
      var hi=+b.getAttribute('data-hi'), h=dr8.historie[hi]; if(!h) return;
      dr8.historie.push({ausgabe:dr8.ausgabe,tms:Date.now(),editor:myName(),abschnitte:clone(dr8.abschnitte)});
      while(dr8.historie.length>HIST_MAX) dr8.historie.shift();
      dr8.vor=clone(dr8.abschnitte); dr8.abschnitte=clone(h.abschnitte); dr8.ausgabe=today();
      DOCS[sel]=dr8; render(); return;
    }
  }
  /* Struktur-Änderung: Eingaben roh übernehmen (ohne Übersetzung — die kommt beim Speichern). */
  function harvestInto(draft){
    var jobs=harvest(draft);
    jobs.forEach(function(j){ var o=j.old&&j.old.orig===j.text?j.old:{orig:j.text,lang:lang()};
      if(!o[lang()]) o[lang()]=j.text; j.set(o); });
    dirty=true;
  }
  function move(arr,i,d){ var j=i+d; if(j<0||j>=arr.length) return; var x=arr[i]; arr[i]=arr[j]; arr[j]=x; }

  function onChange(e){
    var el=e.target;
    if(el.classList&&el.classList.contains('plsel')){
      var free=el.parentNode.querySelector('input.plfree');
      if(free){ if(el.value==='__free'){ free.hidden=false; free.focus(); } else free.hidden=true; }
      dirty=true; return;
    }
    if(el.classList&&el.classList.contains('plftyp')){
      var op=el.parentNode.querySelector('.plfopt'); if(op) op.hidden=(el.value!=='select');
      dirty=true; return;
    }
    dirty=true;
  }
  function copy(txt,btn){
    function ok(){ var o=btn.textContent; btn.textContent=t('copied'); setTimeout(function(){btn.textContent=o;},1500); }
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok,fb); return; } }catch(e){}
    fb();
    function fb(){ var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); ok(); }catch(e){} document.body.removeChild(ta); }
  }

  /* ---------- Start ---------- */
  function mount(el){
    root=el;
    root.addEventListener('click',onClick);
    root.addEventListener('change',onChange);
    if(!Object.keys(DOCS).length){ var d=demo(); DOCS[d.key]=d; sel=d.key; }
    render();
    connect(function(){
      var ks=keys();
      if(!sel||!DOCS[sel]) sel=ks.length?ks[0]:null;
      if(!dirty) render();
    });
    try{ window.addEventListener('storage',function(ev){ if(ev.key==='s1l_lang') render(); }); }catch(e){}
  }

  window.S1LPLAN={ mount:mount, _demo:demo, _messages:messages, _blockChanged:blockChanged, _docs:DOCS };
})();
