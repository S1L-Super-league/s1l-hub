/* ============ S1L Tages-Engine — GEMEINSAME WAHRHEIT (Hub + Eventcenter) ============
   Berechnet Duell-Tag, Power-Play-Rotation und Golden Window aus Ankern.
   Keine Abhängigkeiten. Einbinden VOR strat.js und dem Seiten-Skript: <script src="engine.js"></script>

   Anker (7-Tage-Verlauf-Screenshots Jac 29.06.2026, In-Game = DE-Ortszeit):
   - Power Play: läuft DURCHGEHEND 7 Tage/Woche. Slots DE 02/06/10/14/18/22 = UTC 00/04/08/12/16/20.
     Reihenfolge: Helden · Siedlung · Kommandant · Tech · Ausrüstung · Ungeheuer. Täglich +1 verschoben (6-Themen-Zyklus, Tag 7 = Tag 1). Anker: Mo 29.06. = Offset 0.
   - Duell: 6 Tage Mo–Sa (So Ruhetag), Tag 1 = Montag.
   - ACHTUNG: PP-Zyklus = 6 Tage, Duell-Woche = 7 Tage -> Golden Windows verschieben sich WÖCHENTLICH (NICHT konstant). Jede Woche neu rechnen.
   Pflege: Alex. */
var ENGINE = (function(){
  var PP_THEMES = ["helden","siedlung","kommandant","tech","ausruest","ungeheuer"];
  var PP_THEMES_DE = { helden:"Heldenverbesserung", siedlung:"Siedlungsbau", kommandant:"Kommandant Sammlung", tech:"Technologieforschung", ausruest:"Ausrüstungsaufwertung", ungeheuer:"Ungeheuer-Wachstum" };
  var SLOTS_UTC = [0,4,8,12,16,20];
  var PP_REF = Date.UTC(2026,5,29), PP_REF_O = 0;   /* Mo 29.06. = Zyklus-Offset 0 (DE 02:00 Helden); voller 7-Tage-Verlauf per Jac-Screenshots verifiziert */
  var DUEL_REF = Date.UTC(2026,5,15);               /* Mo 15.06. = Duell-Tag 1 */
  var DUEL_THEMES = ["radar","basis","tech","helden","truppen","gegner"];
  var DUEL_THEMES_DE = { radar:"Radar-Training", basis:"Basisbau", tech:"Technologieforschung", helden:"Helden-Entwicklung", truppen:"Schlachtvorbereitung", gegner:"Gegner besiegen" };
  var DUEL_WEIGHT = { radar:1, basis:2, tech:2, helden:2, truppen:2, gegner:4 };
  var DUEL_TO_PP = { radar:"ausruest", basis:"siedlung", tech:"tech", helden:"helden", truppen:null, gegner:null };
  /* Zweites Golden Window (Ungeheuer / Behemoth) — Jac 24.06.2026:
     An Duell-Tagen, an denen Ungeheuer-Leveln/Ungeheuer-Zellen Duell-Punkte geben
     (Tag 3 "tech" = Technologieforschung: 1 Ungeheuer-Zelle +12.000, je 100 Ungeheuer-EP +1.000),
     ueberschneidet sich das zusaetzlich mit der Power-Play-Runde "Ungeheuer-Wachstum".
     In diesem Slot zaehlt Ungeheuer-Leveln/Zellen doppelt (Duell + Power Play). */
  var GW2_DUEL_KEYS = ["tech"];   /* Duell-Themen mit Ungeheuer-Wertung */
  var GW2_PP = "ungeheuer";        /* zugehoerige Power-Play-Runde */

  function dDays(a,b){ return Math.round((b-a)/86400000); }
  function pad(n){ return (n<10?"0":"")+n; }
  /* akzeptiert Date ODER UTC-Millisekunden; gibt UTC-Mitternacht des Kalendertags zurück */
  function toMid(x){
    if(typeof x==='number') return x;
    var d = (x instanceof Date) ? x : new Date();
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /* Duell-Tag 1..6, 0 = Sonntag/Ruhetag */
  function duelDay(x){ var m=toMid(x); var n=((dDays(DUEL_REF,m)%7)+7)%7; return n<6 ? n+1 : 0; }
  /* Power-Play-Offset 0..5 (welches Thema im DE-02:00 / UTC-00:00-Slot steht).
     Rotation läuft DURCHGEHEND 7 Tage/Woche, täglich +1 Schritt (6-Themen-Zyklus -> Tag 7 = Tag 1).
     KEIN Wochenend-Stopp, KEIN Montags-Reset.
     Verifiziert: voller 7-Tage-Verlauf per Jac-Screenshots 29.06.2026 (Mo 29.06. = Offset 0). */
  function ppOffset(x){ var m=toMid(x); return (((dDays(PP_REF,m)+PP_REF_O)%6)+6)%6; }

  /* Duell-Thema-Schlüssel/-Name/-Gewicht für ein Datum */
  function duelTheme(x){ var dd=duelDay(x); return dd ? DUEL_THEMES[dd-1] : null; }
  function duelInfo(x){ var dd=duelDay(x); if(!dd) return { day:0, key:null }; var k=DUEL_THEMES[dd-1]; return { day:dd, key:k, de:DUEL_THEMES_DE[k], weight:DUEL_WEIGHT[k] }; }

  /* PP-Rotation eines Tages: [{slotUtc, theme, themeDe}] */
  function ppScheduleForDay(x){ var o=ppOffset(x), out=[]; for(var s=0;s<6;s++){ var t=PP_THEMES[(o+s)%6]; out.push({ slotUtc:SLOTS_UTC[s], theme:t, themeDe:PP_THEMES_DE[t] }); } return out; }

  /* Power Play läuft DURCHGEHEND 7 Tage/Woche (Jac 29.06.2026: „läuft tatsächlich 7 Tage durch").
     Früher fälschlich Mo–Fr angenommen. GW am Wochenende hängt jetzt nur noch am Duell (So Ruhetag -> kein GW). */
  function ppRuns(x){ return true; }

  /* Golden Window für ein Datum: {sUtc,eUtc,round,roundDe} oder null
     (Tag 5 Truppen = kein PP-Partner; Sa/So = Power-Play-Pause -> kein Fenster) */
  /* Slot (4h-Fenster) einer Power-Play-Runde an Tag x, oder null */
  function ppSlotFor(x, ppt){
    if(!ppt) return null;
    var o=ppOffset(x);
    for(var s=0;s<6;s++){ if(PP_THEMES[(o+s)%6]===ppt){ var h=SLOTS_UTC[s]; return { sUtc:pad(h)+":00", eUtc:pad((h+4)%24)+":00", round:ppt, roundDe:PP_THEMES_DE[ppt] }; } }
    return null;
  }
  function gwWindow(x){
    var dd=duelDay(x); if(!dd) return null;
    if(!ppRuns(x)) return null;
    return ppSlotFor(x, DUEL_TO_PP[DUEL_THEMES[dd-1]]);
  }
  /* Zweites GW (Ungeheuer) — nur an Duell-Tagen mit Ungeheuer-Wertung + wenn Power Play laeuft */
  function gw2Window(x){
    var dd=duelDay(x); if(!dd) return null;
    if(!ppRuns(x)) return null;
    if(GW2_DUEL_KEYS.indexOf(DUEL_THEMES[dd-1])<0) return null;
    return ppSlotFor(x, GW2_PP);
  }

  /* +N Stunden auf "HH:00" (UTC), für DE-Umrechnung (Sommer = +2) */
  function shiftHHMM(hhmm, plus){ var h=parseInt(hhmm.split(":")[0],10); return pad(((h+plus)%24+24)%24)+":00"; }

  return {
    PP_THEMES:PP_THEMES, PP_THEMES_DE:PP_THEMES_DE, SLOTS_UTC:SLOTS_UTC,
    DUEL_THEMES:DUEL_THEMES, DUEL_THEMES_DE:DUEL_THEMES_DE, DUEL_WEIGHT:DUEL_WEIGHT, DUEL_TO_PP:DUEL_TO_PP,
    PP_REF:PP_REF, PP_REF_O:PP_REF_O, DUEL_REF:DUEL_REF,
    duelDay:duelDay, ppOffset:ppOffset, ppRuns:ppRuns, duelTheme:duelTheme, duelInfo:duelInfo,
    ppScheduleForDay:ppScheduleForDay, ppSlotFor:ppSlotFor, gwWindow:gwWindow, gw2Window:gw2Window, shiftHHMM:shiftHHMM
  };
})();
if(typeof module!=='undefined' && module.exports) module.exports = ENGINE;
