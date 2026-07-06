/* ============ S1L Tages-Engine — GEMEINSAME WAHRHEIT (Hub + Eventcenter) ============
   Berechnet Duell-Tag, Power-Play-Rotation und Golden Window aus Ankern.
   Keine Abhängigkeiten. Einbinden VOR strat.js und dem Seiten-Skript: <script src="engine.js"></script>

   Anker (In-Game = DE-Ortszeit; korrigiert Jac 06.07.2026):
   - Power Play: aktiv 7 Tage/Woche, aber NICHT fortlaufend. Wöchentlicher RESET Sonntag->Montag:
     jeden Montag startet die Rotation neu bei Tag 1. Slots DE 02/06/10/14/18/22 = UTC 00/04/08/12/16/20.
     Reihenfolge Tag 1: Helden · Siedlung · Kommandant · Tech · Ausrüstung · Ungeheuer (Offset 0).
     Ab Tag 2 täglich +1 innerhalb der Woche (Mo=Tag1..Sa=Tag6, So=Tag7 -> Offset 0 wie Tag1).
   - Duell: 6 Tage Mo–Sa (So Ruhetag), Tag 1 = Montag.
   - PP-Reset und Duell sind an denselben Montag gekoppelt -> an Duell-Tagen gilt Offset = Duell-Tag - 1.
     Golden Windows sind damit wochenkonstant (kein Wochendrift).
   Frueheres Modell "durchlaufend +1 ohne Reset" (29.06.2026) war falsch: es driftete jede Woche +1 Slot.
   Pflege: Alex. */
var ENGINE = (function(){
  var PP_THEMES = ["helden","siedlung","kommandant","tech","ausruest","ungeheuer"];
  var PP_THEMES_DE = { helden:"Heldenverbesserung", siedlung:"Siedlungsbau", kommandant:"Kommandant Sammlung", tech:"Technologieforschung", ausruest:"Ausrüstungsaufwertung", ungeheuer:"Ungeheuer-Wachstum" };
  var SLOTS_UTC = [0,4,8,12,16,20];
  var MON_REF = Date.UTC(2026,5,15);                /* Mo 15.06. = Wochen-Anker (Montag); PP-Reset + Duell-Tag 1 hier verankert */
  var DUEL_REF = MON_REF;                            /* Mo 15.06. = Duell-Tag 1 (gleicher Montag) */
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
     WÖCHENTLICHER RESET Sonntag->Montag: jeden Montag zurück auf Tag 1 (Offset 0).
     Wochentag ab Montag (0=Mo..6=So); Offset = Wochentag mod 6 (So = Tag 7 -> 0 wie Tag 1).
     KEIN Durchlauf über die Woche hinaus. Verifiziert: Jac 06.07.2026 (Mo -> Offset 0, Ausrüstung 18:00 DE). */
  function ppOffset(x){ var m=toMid(x); var wd=(((dDays(MON_REF,m))%7)+7)%7; return wd%6; }

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
    MON_REF:MON_REF, DUEL_REF:DUEL_REF,
    duelDay:duelDay, ppOffset:ppOffset, ppRuns:ppRuns, duelTheme:duelTheme, duelInfo:duelInfo,
    ppScheduleForDay:ppScheduleForDay, ppSlotFor:ppSlotFor, gwWindow:gwWindow, gw2Window:gw2Window, shiftHHMM:shiftHHMM
  };
})();
if(typeof module!=='undefined' && module.exports) module.exports = ENGINE;
