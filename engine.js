/* ============ S1L Tages-Engine — GEMEINSAME WAHRHEIT (Hub + Eventcenter) ============
   Berechnet Duell-Tag, Power-Play-Rotation und Golden Window aus Ankern.
   Keine Abhängigkeiten. Einbinden VOR strat.js und dem Seiten-Skript: <script src="engine.js"></script>

   Anker (KALENDER-Screenshot Jac 22.06.2026, In-Game = DE-Ortszeit):
   - Power Play: Tag 1 = MONTAG. Tag-1-Slots DE 02/06/10/14/18/22 = UTC 00/04/08/12/16/20.
     Reihenfolge: Helden · Siedlung · Kommandant · Tech · Ausrüstung · Ungeheuer. Täglich +1 verschoben.
   - Duell: 6 Tage Mo–Sa (So Ruhetag), Tag 1 = Montag.
   - PP/Duell/Turbo gekoppelt -> Golden Windows wöchentlich KONSTANT (montags prüfen).
   Pflege: Alex. */
var ENGINE = (function(){
  var PP_THEMES = ["helden","siedlung","kommandant","tech","ausruest","ungeheuer"];
  var PP_THEMES_DE = { helden:"Heldenverbesserung", siedlung:"Siedlungsbau", kommandant:"Kommandant Sammlung", tech:"Technologieforschung", ausruest:"Ausrüstungsaufwertung", ungeheuer:"Ungeheuer-Wachstum" };
  var SLOTS_UTC = [0,4,8,12,16,20];
  var PP_REF = Date.UTC(2026,5,22), PP_REF_O = 0;   /* Mo 22.06. = PP-Tag 1 */
  var DUEL_REF = Date.UTC(2026,5,15);               /* Mo 15.06. = Duell-Tag 1 */
  var DUEL_THEMES = ["radar","basis","tech","helden","truppen","gegner"];
  var DUEL_THEMES_DE = { radar:"Radar-Training", basis:"Basisbau", tech:"Technologieforschung", helden:"Helden-Entwicklung", truppen:"Schlachtvorbereitung", gegner:"Gegner besiegen" };
  var DUEL_WEIGHT = { radar:1, basis:2, tech:2, helden:2, truppen:2, gegner:4 };
  var DUEL_TO_PP = { radar:"ausruest", basis:"siedlung", tech:"tech", helden:"helden", truppen:null, gegner:null };

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
  /* Power-Play-Offset 0..5 (welches Thema im 00-UTC-Slot steht) */
  function ppOffset(x){ var m=toMid(x); return (((dDays(PP_REF,m)+PP_REF_O)%6)+6)%6; }

  /* Duell-Thema-Schlüssel/-Name/-Gewicht für ein Datum */
  function duelTheme(x){ var dd=duelDay(x); return dd ? DUEL_THEMES[dd-1] : null; }
  function duelInfo(x){ var dd=duelDay(x); if(!dd) return { day:0, key:null }; var k=DUEL_THEMES[dd-1]; return { day:dd, key:k, de:DUEL_THEMES_DE[k], weight:DUEL_WEIGHT[k] }; }

  /* PP-Rotation eines Tages: [{slotUtc, theme, themeDe}] */
  function ppScheduleForDay(x){ var o=ppOffset(x), out=[]; for(var s=0;s<6;s++){ var t=PP_THEMES[(o+s)%6]; out.push({ slotUtc:SLOTS_UTC[s], theme:t, themeDe:PP_THEMES_DE[t] }); } return out; }

  /* Power Play + Turbo-Schildkröte laufen Mo–Fr, Sa+So Pause (Jac 22.06.2026) -> am Wochenende kein GW. */
  function ppRuns(x){ var wd=new Date(toMid(x)).getUTCDay(); return wd>=1 && wd<=5; }

  /* Golden Window für ein Datum: {sUtc,eUtc,round,roundDe} oder null
     (Tag 5 Truppen = kein PP-Partner; Sa/So = Power-Play-Pause -> kein Fenster) */
  function gwWindow(x){
    var dd=duelDay(x); if(!dd) return null;
    if(!ppRuns(x)) return null;
    var ppt=DUEL_TO_PP[DUEL_THEMES[dd-1]]; if(!ppt) return null;
    var o=ppOffset(x);
    for(var s=0;s<6;s++){ if(PP_THEMES[(o+s)%6]===ppt){ var h=SLOTS_UTC[s]; return { sUtc:pad(h)+":00", eUtc:pad((h+4)%24)+":00", round:ppt, roundDe:PP_THEMES_DE[ppt] }; } }
    return null;
  }

  /* +N Stunden auf "HH:00" (UTC), für DE-Umrechnung (Sommer = +2) */
  function shiftHHMM(hhmm, plus){ var h=parseInt(hhmm.split(":")[0],10); return pad(((h+plus)%24+24)%24)+":00"; }

  return {
    PP_THEMES:PP_THEMES, PP_THEMES_DE:PP_THEMES_DE, SLOTS_UTC:SLOTS_UTC,
    DUEL_THEMES:DUEL_THEMES, DUEL_THEMES_DE:DUEL_THEMES_DE, DUEL_WEIGHT:DUEL_WEIGHT, DUEL_TO_PP:DUEL_TO_PP,
    PP_REF:PP_REF, PP_REF_O:PP_REF_O, DUEL_REF:DUEL_REF,
    duelDay:duelDay, ppOffset:ppOffset, ppRuns:ppRuns, duelTheme:duelTheme, duelInfo:duelInfo,
    ppScheduleForDay:ppScheduleForDay, gwWindow:gwWindow, shiftHHMM:shiftHHMM
  };
})();
if(typeof module!=='undefined' && module.exports) module.exports = ENGINE;
