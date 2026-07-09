/* ============ S1L Strategien je Event — GEMEINSAME QUELLE ============
   Einmal HIER pflegen -> Baukasten (S1L-R4-Raid.html) UND Timeline (S1L-R4-Templates.html)
   nutzen exakt dieselben Strategien. Auswahl-Labels (tags) je Sprache als {de,en,tr,ru}.
   Die GEWAEHLTE Strategie je Event wird live ueber Firebase-Collection 'stratchoice' geteilt.
   Format: warmer Einzeiler -> #080-Bullets -> optionale Stern-Bloecke (#<code> ***** TITEL ***** #<code>).
   Pflege: Alex. Einbinden: <script src="strat.js"></script> VOR dem Seiten-Skript. */
var STRAT={
  duell:[ { id:"duell-tag1", prio:false, tags:{de:["Tag 1 - Radar","Fetzen","Spionage"],en:["Day 1 - Radar","Scraps","Spy"],tr:["1. Gün - Radar","Scraps","Casus"],ru:["День 1 - Radar","Scraps","Шпион"]},
    de:"Lasst uns stark in die Woche starten!\n#080 AUSRUESTUNGSFETZEN verwenden\n#080 SPIONAGEMISSIONEN machen\n#080 Nahrung, Holz, Metall, Benzin sammeln\n———\n#189 ***** AUFHEBEN ***** #189\n#080 Fuer TAG 2: Bau-Speedups\n#080 Fuer TAG 3: Forschungs-Speedups + Ungeheuer-Zellen + Ungeheuer-Serum",
    en:"Let us start the week strong!\n#080 USE GEAR SCRAPS\n#080 RUN SPY MISSIONS\n#080 Gather food, wood, metal, fuel\n———\n#189 ***** SAVE ***** #189\n#080 For DAY 2: build speedups\n#080 For DAY 3: research speedups + Behemoth Cells + Behemoth Serum",
    tr:"Haftaya guclu baslayalim!\n#080 GEAR SCRAPS KULLAN\n#080 CASUS GOREVLERI yap\n#080 Yiyecek, odun, metal, yakit topla\n———\n#189 ***** SAKLA ***** #189\n#080 2. GUN icin: build speedups\n#080 3. GUN icin: research speedups + Behemoth Cells + Behemoth Serum",
    ru:"Начнём неделю сильно!\n#080 ИСПОЛЬЗУЙ GEAR SCRAPS\n#080 ДЕЛАЙ SPY-МИССИИ\n#080 Собирай еду, дерево, металл, топливо\n———\n#189 ***** КОПИ ***** #189\n#080 На ДЕНЬ 2: build speedups\n#080 На ДЕНЬ 3: research speedups + Behemoth Cells + Behemoth Serum" },
  { id:"duell-tag2", prio:false, tags:{de:["Tag 2 - Basisbau","Bau-Speedups","Golden Window"],en:["Day 2 - Base Building","Build speedups","Golden Window"],tr:["2. Gün - Base Building","Build speedups","Golden Window"],ru:["День 2 - Base Building","Build speedups","Golden Window"]},
    de:"Heute zaehlt BAUEN - lasst uns gemeinsam stark bauen!\n#080 BAU-SPEEDUPS im Golden Window dumpen - zaehlt dreifach\n#080 S-Entsendung (+75.000) und A-Lieferung (+50.000) als Extra mitnehmen\n#080 Bau-Speedups vorher NICHT einzeln verbrauchen\n———\n#189 ***** AUFHEBEN ***** #189\n#080 Fuer TAG 3: Forschungs-Speedups + Ungeheuer-Zellen + Ungeheuer-Serum + Kampfmedaillen\n#080 Fuer TAG 4: Heldenfragmente + Rekrutierungsmarken",
    en:"Today it is all about BUILDING - let us build strong together!\n#080 Dump BUILD SPEEDUPS in the Golden Window - counts triple\n#080 S-dispatch (+75,000) and A-delivery (+50,000) as extras\n#080 Do NOT spend build speedups one by one before\n———\n#189 ***** SAVE ***** #189\n#080 For DAY 3: research speedups + Behemoth Cells + Behemoth Serum + Battle Medals\n#080 For DAY 4: hero fragments + recruit tokens",
    tr:"Bugun is INSAAT - birlikte guclu insa edelim!\n#080 BUILD SPEEDUPS'i Golden Window'da harca - uc kat sayilir\n#080 S-sevkiyat (+75.000) ve A-teslimat (+50.000) ekstra\n#080 Build speedups'i oncesinde tek tek HARCAMA\n———\n#189 ***** SAKLA ***** #189\n#080 3. GUN icin: research speedups + Behemoth Cells + Behemoth Serum + Battle Medal\n#080 4. GUN icin: hero parcalari + rekrutasyon marka",
    ru:"Сегодня главное - СТРОЙКА - построим сильно вместе!\n#080 Слей BUILD SPEEDUPS в Golden Window - втрое\n#080 S-отправка (+75.000) и A-доставка (+50.000) как бонус\n#080 НЕ трать build speedups по одному заранее\n———\n#189 ***** КОПИ ***** #189\n#080 На ДЕНЬ 3: research speedups + Behemoth Cells + Behemoth Serum + Battle Medals\n#080 На ДЕНЬ 4: фрагменты героев + жетоны вербовки" },
  { id:"duell-tag3", prio:false, tags:{de:["Tag 3 - Technologie","Forschungs-Speedups","Ungeheuer"],en:["Day 3 - Technology","Research speedups","Behemoth"],tr:["3. Gün - Technology","Research speedups","Behemoth"],ru:["День 3 - Technology","Research speedups","Behemoth"]},
    de:"Heute Forschung - jeder Beitrag zaehlt!\n#080 FORSCHUNGS-SPEEDUPS im Golden Window dumpen - zaehlt dreifach\n#080 Ungeheuer-Zellen (+12.000), Spionagemission (+30.000), Kampfmedaille ausgeben (+2.500)\n———\n#189 ***** AUFHEBEN ***** #189\n#080 Fuer TAG 4: Heldenfragmente + Rekrutierungsmarken\n#080 Fuer TAG 5: Spionage + Ressourcen fuers Truppen-Training",
    en:"Today is research - every bit counts!\n#080 Dump RESEARCH SPEEDUPS in the Golden Window - counts triple\n#080 Behemoth Cells (+12,000), spy mission (+30,000), spend Battle Medal (+2,500)\n———\n#189 ***** SAVE ***** #189\n#080 For DAY 4: hero fragments + recruit tokens\n#080 For DAY 5: spy + resources for troop training",
    tr:"Bugun arastirma - her katki onemli!\n#080 RESEARCH SPEEDUPS'i Golden Window'da harca - uc kat sayilir\n#080 Behemoth Cells (+12.000), casus gorevi (+30.000), Battle Medal harca (+2.500)\n———\n#189 ***** SAKLA ***** #189\n#080 4. GUN icin: hero parcalari + rekrutasyon marka\n#080 5. GUN icin: casus + birlik egitimi icin kaynaklar",
    ru:"Сегодня исследования - важен каждый вклад!\n#080 Слей RESEARCH SPEEDUPS в Golden Window - втрое\n#080 Behemoth Cells (+12.000), spy-миссия (+30.000), потратить Battle Medal (+2.500)\n———\n#189 ***** КОПИ ***** #189\n#080 На ДЕНЬ 4: фрагменты героев + жетоны вербовки\n#080 На ДЕНЬ 5: spy + ресурсы для тренировки войск" },
  { id:"duell-tag4", prio:true, tags:{de:["Tag 4 - Helden","Fragmente","Alpha-Bestie"],en:["Day 4 - Heroes","Fragments","Alpha Beast"],tr:["4. Gün - Heroes","Parçalar","Alpha Beast"],ru:["День 4 - Heroes","Фрагменты","Alpha Beast"]},
    de:"Heute Helden - lasst uns gemeinsam stark werden!\n#080 HELDENFRAGMENTE einsetzen - legendaere + Wunsch-Rekrutierung am staerksten (im Golden Window dreifach)\n#080 Fragmente farmen: Rallys auf die MITTLEREN Monster (Alpha-Bestie) - normale/fette Infizierte geben keine\n———\n#189 ***** AUFHEBEN ***** #189\n#080 Fuer TAG 5: Spionage + Trainings-Speedups + Ressourcen fuers Training\n#080 Fuer TAG 6: Friedenskuppeln + alle Beschleuniger",
    en:"Today heroes - let us grow strong together!\n#080 USE HERO FRAGMENTS - legendary + wish recruitment strongest (triple in the Golden Window)\n#080 Farm fragments: rallies on the MEDIUM monsters (Alpha Beast) - normal/fat infected give none\n———\n#189 ***** SAVE ***** #189\n#080 For DAY 5: spy + training speedups + resources for training\n#080 For DAY 6: Peace Shields + all speedups",
    tr:"Bugun kahramanlar - birlikte guclenelim!\n#080 HERO FRAGMENTS kullan - efsanevi + istek rekrutasyonu en guclu (Golden Window'da uc kat)\n#080 Parca farmla: ORTA canavarlara (Alpha Beast) rally - normal/sisman enfekteler vermez\n———\n#189 ***** SAKLA ***** #189\n#080 5. GUN icin: casus + training speedups + egitim icin kaynaklar\n#080 6. GUN icin: Peace Shields + tum speedups",
    ru:"Сегодня герои - станем сильнее вместе!\n#080 ИСПОЛЬЗУЙ HERO FRAGMENTS - легендарные + желаемая вербовка сильнее всего (в Golden Window втрое)\n#080 Фарм фрагментов: rally на СРЕДНИХ монстров (Alpha Beast) - обычные/толстые заражённые не дают\n———\n#189 ***** КОПИ ***** #189\n#080 На ДЕНЬ 5: spy + training speedups + ресурсы для тренировки\n#080 На ДЕНЬ 6: Peace Shields + все speedups" },
  { id:"duell-tag5", prio:false, tags:{de:["Tag 5 - Schlachtvorbereitung","Spionage","Training"],en:["Day 5 - Battle Prep","Spy","Training"],tr:["5. Gün - Battle Prep","Casus","Eğitim"],ru:["День 5 - Battle Prep","Шпион","Тренировка"]},
    de:"Heute Schlachtvorbereitung - ihr macht das super!\n#080 SPIONAGEMISSION (+37.500) + Truppen trainieren\n#080 Training braucht Ressourcen - genug bereithalten (Truppen hat man genug)\n#080 Heute KEIN Golden Window (keine Power-Play-Truppen-Runde)\n———\n#189 ***** AUFHEBEN ***** #189\n#080 Fuer TAG 6: Friedenskuppeln + alle Beschleuniger\n#080 Fuer MONTAG (Tag 1): Ausruestungsfetzen + Spionage + Kommandantenausdauer (Sonntag ist duellfrei)",
    en:"Today battle prep - you are doing great!\n#080 SPY MISSION (+37,500) + train troops\n#080 Training needs resources - keep enough ready (you have enough troops)\n#080 NO Golden Window today (no Power Play troop round)\n———\n#189 ***** SAVE ***** #189\n#080 For DAY 6: Peace Shields + all speedups\n#080 For MONDAY (Day 1): gear scraps + spy + commander stamina (Sunday has no duel)",
    tr:"Bugun savas hazirligi - harika gidiyorsunuz!\n#080 CASUS GOREVI (+37.500) + birlik egit\n#080 Egitim kaynak ister - yeterince hazir tut (birlik yeterli)\n#080 Bugun Golden Window YOK (Power Play birlik turu yok)\n———\n#189 ***** SAKLA ***** #189\n#080 6. GUN icin: Peace Shields + tum speedups\n#080 PAZARTESI icin (1. Gun): gear scraps + casus + komutan dayanikligi (Pazar duel yok)",
    ru:"Сегодня подготовка к бою - вы молодцы!\n#080 SPY-МИССИЯ (+37.500) + тренировать войска\n#080 Тренировка требует ресурсов - держи запас (войск хватает)\n#080 Сегодня НЕТ Golden Window (нет раунда войск в Power Play)\n———\n#189 ***** КОПИ ***** #189\n#080 На ДЕНЬ 6: Peace Shields + все speedups\n#080 На ПОНЕДЕЛЬНИК (День 1): gear scraps + spy + выносливость командира (в воскресенье дуэли нет)" },
  { id:"duell-tag6-kuppel", prio:true, tags:{de:["Tag 6 - Alle unter die Kuppel","Verteidigen","Verstaerken"],en:["Day 6 - Everyone under the dome","Defend","Reinforce"],tr:["6. Gun - Herkes dome altina","Savun","Takviye"],ru:["День 6 - Все под купол","Защита","Усиление"]},
    de:"TAG 6 - bitte alle UNTER DIE KUPPEL, gemeinsam halten wir stand!\n#080 Unter der Kuppel seid ihr unangreifbar\n#080 Wer angreift, verliert die Kuppel (30 Min Abklingzeit)\n#080 Trupps DRAUSSEN sind angreifbar - bei Angriffen zurueckrufen\n———\n#078 ***** VERSTAERKEN ***** #078\n#080 Siedlungen OHNE Kuppel mit der STAERKSTEN Truppe verstaerken (bis 5 Plaetze)\n#080 Gewinnt der Verteidiger, zaehlt der Kill fuer UNS\n———\n#080 Hebel: Sandwurm-Eier (perfekt +500.000), S-Entsendung, A-Lieferung, Beschleuniger\n#080 VOR jedem Angriff im Chat fragen - wir stimmen uns ab",
    en:"DAY 6 - everyone UNDER THE DOME please, together we hold!\n#080 Under the dome you cannot be attacked\n#080 Whoever attacks loses the dome (30 min cooldown)\n#080 Troops OUTSIDE can be attacked - recall them when attacks come\n———\n#078 ***** REINFORCE ***** #078\n#080 Reinforce settlements WITHOUT a dome with your STRONGEST troops (up to 5)\n#080 If the defender wins, the kill counts for US\n———\n#080 Levers: sandworm eggs (perfect +500,000), S-dispatch, A-delivery, speedups\n#080 ASK in chat before every attack - we coordinate",
    tr:"6. GUN - lutfen herkes DOME ALTINA, birlikte dayaniriz!\n#080 Dome altinda saldirilmaz olursunuz\n#080 Saldiran dome'u kaybeder (30 dk bekleme)\n#080 DISARIDAKI birlikler saldirilabilir - saldirilarda geri cagir\n———\n#078 ***** TAKVIYE ***** #078\n#080 Dome'suz yerlesimleri EN GUCLU birlikle takviye et (5'e kadar)\n#080 Savunan kazanirsa kill BIZE sayilir\n———\n#080 Kaldiraclar: kum solucani yumurtalari (mukemmel +500.000), S-sevkiyat, A-teslimat, speedups\n#080 Her saldiridan ONCE chat'te sor - uyum saglayalim",
    ru:"ДЕНЬ 6 - все ПОД КУПОЛ, пожалуйста, вместе выстоим!\n#080 Под куполом вас нельзя атаковать\n#080 Кто атакует, теряет купол (30 мин перезарядка)\n#080 Войска СНАРУЖИ можно атаковать - отзывайте при атаках\n———\n#078 ***** УСИЛЕНИЕ ***** #078\n#080 Усиливайте поселения БЕЗ купола САМЫМИ сильными войсками (до 5)\n#080 Если защитник побеждает, килл засчитывается НАМ\n———\n#080 Рычаги: яйца песчаного червя (идеальное +500.000), S-отправка, A-доставка, speedups\n#080 СПРАШИВАЙТЕ в чате перед каждой атакой - согласуем" },
  { id:"duell-tag6-v1", prio:false, tags:{de:["Tag 6 V1 (?)","Rotation","Kuppel"],en:["Day 6 V1 (?)","Rotation","Dome"],tr:["6. Gün V1 (?)","Rotasyon","Dome"],ru:["День 6 V1 (?)","Ротация","Купол"]},
    de:"TAG 6 V1 (in Abstimmung) - feste 6er-Teams mit Rotation:\n#080 Vorm Schlafen Kuppel AN\n#080 Immer 1 greift OHNE Kuppel an, die anderen 5 verstaerken/verteidigen\n#080 Bei Gegenschaden zurueck, dann rotieren (Naechster ohne Kuppel, Voriger Kuppel wieder hoch)\n#080 Gegner ueber 3 Stufen unter dir = KEINE Punkte - nicht angreifen",
    en:"DAY 6 V1 (under discussion) - fixed teams of 6 with rotation:\n#080 Dome ON before sleeping\n#080 Always 1 attacks WITHOUT a dome, the other 5 reinforce/defend\n#080 On counter-damage retreat, then rotate (next without dome, previous raises dome again)\n#080 Enemies more than 3 levels below you = NO points - do not attack",
    tr:"6. GUN V1 (gorusuluyor) - rotasyonlu sabit 6'li takimlar:\n#080 Yatmadan once dome ACIK\n#080 Her zaman 1 dome OLMADAN saldirir, diger 5 takviye/savunma\n#080 Karsi hasarda geri, sonra rotasyon (siradaki dome'suz, onceki dome'u tekrar acar)\n#080 Senden 3 seviyeden fazla dusuk dusman = PUAN YOK - saldirma",
    ru:"ДЕНЬ 6 V1 (обсуждается) - фиксированные группы по 6 с ротацией:\n#080 Купол ВКЛ перед сном\n#080 Всегда 1 атакует БЕЗ купола, остальные 5 усиливают/защищают\n#080 При ответном уроне назад, затем ротация (следующий без купола, предыдущий снова поднимает купол)\n#080 Враги более чем на 3 уровня ниже = НЕТ очков - не атаковать" },
  { id:"duell-tag6-v2", prio:false, tags:{de:["Tag 6 V2 (?)","Dauerverteidiger","Kuppel"],en:["Day 6 V2 (?)","Permanent defender","Dome"],tr:["6. Gün V2 (?)","Kalıcı savunucu","Dome"],ru:["День 6 V2 (?)","Защитник","Купол"]},
    de:"TAG 6 V2 (in Abstimmung) - Dauerverteidiger ohne Kuppel:\n#080 Ein eh-online Spieler bleibt GANZ OHNE Kuppel, voll verstaerkt\n#080 Verteidigt am Stuetzpunkt jeden ankommenden Fremden\n#080 Bei Gefahr sofort Kuppel an (Abklingzeit laengst vorbei)\n#080 Starke schicken ihm Truppen + beobachten die Statistik (rechtzeitig fliehen, verstecken)",
    en:"DAY 6 V2 (under discussion) - permanent defender without a dome:\n#080 A player who is online anyway stays WITHOUT a dome, fully reinforced\n#080 Defends every incoming enemy at the base\n#080 On danger turn the dome on instantly (cooldown long over)\n#080 The strong send him troops + watch the stats (flee in time, hide)",
    tr:"6. GUN V2 (gorusuluyor) - dome'suz kalici savunucu:\n#080 Zaten online olan bir oyuncu DOME'SUZ kalir, tam takviyeli\n#080 Uste gelen her dusmani savunur\n#080 Tehlikede dome'u aninda acar (bekleme coktan bitti)\n#080 Gucluler ona birlik gonderir + istatistigi izler (zamaninda kac, saklan)",
    ru:"ДЕНЬ 6 V2 (обсуждается) - постоянный защитник без купола:\n#080 Игрок, который и так онлайн, остаётся БЕЗ купола, полностью усилен\n#080 Защищает на базе каждого входящего врага\n#080 При опасности сразу включает купол (перезарядка давно прошла)\n#080 Сильные шлют ему войска + следят за статистикой (вовремя бежать, прятаться)" } ],
  loewe:[ { id:"loewe-selbst", prio:true, tags:{de:["Boss","Schaden"],en:["Boss","Damage"],tr:["Boss","Hasar"],ru:["Босс","Урон"]},
    de:"Ghuloewe - jeder Schlag zaehlt, danke fuers Mitmachen!\n#080 Wer rally-faehig ist, startet am besten eine EIGENE Rally (kein Limit)\n#080 Kuerzeste Vorlaufzeit = mehr Schlaege pro Minute\n#080 Auf Boss-Schaden-Helden + Signature Weapons umruesten\n#080 Buffs in diesen 30 Min einsetzen",
    en:"Ghoulion - every hit counts, thanks for joining!\n#080 If you can rally, best start your OWN rally (no limit)\n#080 Shortest lead time = more hits per minute\n#080 Switch to single-target heroes + signature weapons\n#080 Use buffs in these 30 min",
    tr:"Ghoulion - her vurus onemli, katildiginiz icin tesekkurler!\n#080 Rally baslatabilen en iyisi KENDI rally'sini baslatsin (limit yok)\n#080 En kisa hazirlik suresi = dakikada daha cok vurus\n#080 Tek hedef hasari kahramanlari + Signature Weapons'a gec\n#080 Bu 30 dk icinde buff'lari kullan",
    ru:"Ghoulion - важен каждый удар, спасибо за участие!\n#080 Кто может rally, лучше запусти СВОЮ rally (без лимита)\n#080 Кратчайшее время подготовки = больше ударов в минуту\n#080 Перейди на героев одиночного урона + Signature Weapons\n#080 Используй баффы в эти 30 мин" },
  { id:"loewe-umzug", prio:true, tags:{de:["Umzug","Nicht mehr spenden"],en:["Relocation","Stop donating"],tr:["Tasinma","Bagis yok"],ru:["Переезд","Не жертвовать"]},
    de:"Wichtig zum Ghuloewe - das ist das LETZTE Mal bei diesem Loewen!\n#080 Wir verlegen unser Allianzzentrum - danach ist dieser Loewe fuer uns weg\n#080 Darum bitte NICHT mehr fuer diesen Loewen spenden (der Belohnungs-Bonus geht mit dem Umzug verloren)\n———\n#189 ***** FALLEN AUFHEBEN ***** #189\n#080 Behaltet eure Fallen - die heben wir uns fuer den Loewen am neuen Standort auf",
    en:"Important on the Ghoulion - this is the LAST time at this lion!\n#080 We are relocating our Alliance Center - after that this lion is gone for us\n#080 So please do NOT donate for this lion anymore (the reward bonus is lost with the move)\n———\n#189 ***** SAVE YOUR TRAPS ***** #189\n#080 Keep your traps - we save them for the lion at the new location",
    tr:"Ghoulion hakkinda onemli - bu lionda SON kez!\n#080 Ittifak Merkezimizi tasiyoruz - sonra bu lion bizim icin gider\n#080 Bu yuzden lutfen bu lion icin ARTIK bagis yapmayin (odul bonusu tasinmayla kaybolur)\n———\n#189 ***** TUZAKLARI SAKLA ***** #189\n#080 Tuzaklarinizi saklayin - onlari yeni konumundaki lion icin tutariz",
    ru:"Важно про Ghoulion - это ПОСЛЕДНИЙ раз у этого льва!\n#080 Мы переносим наш Центр альянса - после этого этот лев для нас исчезнет\n#080 Поэтому, пожалуйста, БОЛЬШЕ не жертвуйте для этого льва (бонус к наградам теряется при переезде)\n———\n#189 ***** СОХРАНИТЕ ЛОВУШКИ ***** #189\n#080 Оставьте свои ловушки - сохраним их для льва на новом месте" } ],
  reservoir:[ { id:"res-anmelden", prio:true, tags:{de:["Anmelden","Wer ist dabei"],en:["Sign up","Who joins"],tr:["Kayıt","Kim katılıyor"],ru:["Запись","Кто участвует"]},
    de:"Reservoir Raid - jeder Platz zaehlt, kommt zahlreich!\n#080 30 gegen 30 - letztes Mal nur 17 von 30\n#080 Event oeffnen, Zeile unter deinem Namen, dann ANMELDEN oder ABMELDEN\n#080 Nur ANMELDEN, wenn du zu 100% dabei sein kannst\n#080 Sonst bitte ABMELDEN, dann rueckt eine Reserve nach\n#080 Anmeldung schliesst rund 2 Tage vor Start",
    en:"Reservoir Raid - every spot counts, come in numbers!\n#080 30 vs 30 - last time only 17 of 30\n#080 Open the event, line under your name, then SIGN UP or LEAVE\n#080 Only SIGN UP if you can be there 100%\n#080 Otherwise please LEAVE, so a reserve can take the spot\n#080 Registration closes about 2 days before start",
    tr:"Reservoir Raid - her yer onemli, cok sayida gelin!\n#080 30'a 30 - gecen sefer sadece 17 / 30\n#080 Etkinligi ac, adinin altindaki satir, sonra SIGN UP veya LEAVE\n#080 Sadece %100 katilabileceksen SIGN UP\n#080 Aksi halde lutfen LEAVE, yedek yerini alir\n#080 Kayit baslamadan ~2 gun once kapanir",
    ru:"Reservoir Raid - важно каждое место, приходите все!\n#080 30 на 30 - в прошлый раз только 17 из 30\n#080 Открой событие, строка под именем, затем SIGN UP или LEAVE\n#080 SIGN UP только если можешь на 100%\n#080 Иначе, пожалуйста, LEAVE, резерв займёт место\n#080 Регистрация закрывается ~2 дня до старта" },
  { id:"res-halten", prio:true, tags:{de:["Halten","Lineup"],en:["Hold","Lineup"],tr:["Tut","Dizilim"],ru:["Удержание","Расстановка"]},
    de:"Reservoir - Halten gewinnt, nicht Toeten!\n#080 Wir spielen nach TEAM-FARBE = Zone, nicht je Gebaeude\n#080 In deiner Farbe zu 2-3 ein Gebaeude EURER Zone besetzen/halten\n#080 Wasserpfuetzen sofort sammeln + im Reservoir-Chat kommunizieren\n#080 Ersatz erst +15 Min nach Start beitreten",
    en:"Reservoir - holding wins, not killing!\n#080 We play by TEAM COLOR = zone, not per building\n#080 In your color, in 2-3s take/hold a building in YOUR zone\n#080 Collect water puddles at once + communicate in the reservoir chat\n#080 Substitutes join only +15 min after start",
    tr:"Reservoir - tutmak kazandirir, oldurmek degil!\n#080 TAKIM RENGI = bolge oynuyoruz, bina bazli degil\n#080 Renginde 2-3 kisiyle BOLGENIZDEKI bir binayi al/tut\n#080 Su birikintilerini hemen topla + reservoir sohbetinde iletisim kur\n#080 Yedekler ancak +15 dk sonra katilir",
    ru:"Reservoir - удержание побеждает, а не убийство!\n#080 Играем по ЦВЕТУ КОМАНДЫ = зоне, не по зданию\n#080 В своём цвете по 2-3 занимайте/удерживайте здание СВОЕЙ зоны\n#080 Сразу собирайте лужи воды + общайтесь в reservoir-чате\n#080 Резерв заходит только через +15 мин после старта" },
  { id:"res-aufstellung", prio:false, tags:{de:["Aufstellung"],en:["Line-up"],tr:["Dizilim"],ru:["Расстановка"]},
    de:"Reservoir - Einteilung nach Team-Farbe/Zone:\n#080 4 Teams (Gelb/Orange/Rot/Blau) = 4 Kartenzonen\n#080 Phase 1: in deiner Farbe zu 2-3 Gebaeude deiner Zone nehmen\n#080 Phase 2: Zone verteidigen; Sonderrollen Central Reservoir + Wassertanks\n#080 Teams + Karte stehen auf der Reservoir-Raid-Eventseite",
    en:"Reservoir - line-up by team color/zone:\n#080 4 teams (Yellow/Orange/Red/Blue) = 4 map zones\n#080 Phase 1: in your color, in 2-3s take buildings in your zone\n#080 Phase 2: defend your zone; special roles Central Reservoir + water tanks\n#080 Teams + map are on the Reservoir Raid event page",
    tr:"Reservoir - takim rengi/bolgeye gore dizilim:\n#080 4 takim (Sari/Turuncu/Kirmizi/Mavi) = 4 harita bolgesi\n#080 Faz 1: renginde 2-3 kisiyle bolgendeki binalari al\n#080 Faz 2: bolgeni savun; ozel roller Central Reservoir + su tanklari\n#080 Takimlar + harita Reservoir Raid etkinlik sayfasinda",
    ru:"Reservoir - расстановка по цвету команды/зоне:\n#080 4 команды (Жёлтая/Оранжевая/Красная/Синяя) = 4 зоны карты\n#080 Фаза 1: в своём цвете по 2-3 занимайте здания своей зоны\n#080 Фаза 2: защищайте зону; особые роли Central Reservoir + водяные танки\n#080 Команды + карта на странице события Reservoir Raid" } ],
  stadt:[
    { id:"stadt-monster", prio:false, tags:{de:["Stadt + Monster (V1)","Kleine zuerst","Gross auf Ansage"],en:["City + monster (V1)","Small first","Big on call"],tr:["Şehir + canavar (V1)","Önce küçük","Büyük çağrıyla"],ru:["Город + монстр (V1)","Сначала малые","Большой по команде"]},
    de:"Stadtduell mit Monster - lasst uns alle auf die KLEINEN!\n#080 Jeder schickt 1 Trupp auf einen FREIEN kleinen - so bekommt jeder Punkte\n#080 Das GROSSE (Zentrum) und die mittleren erst auf Ansage vom Commander\n#080 Ist das GROSSE nur noch bei 25%, gehen wir alle gemeinsam drauf\n#080 Wenn R4 ruft, kommt bitte zum Sammelpunkt",
    en:"City duel with monster - let us all go for the SMALL ones!\n#080 Each sends 1 troop to a FREE small one - so everyone gets points\n#080 The BIG one (center) and the medium ones only on the commander's call\n#080 When the BIG one is at 25%, we all go for it together\n#080 When R4 calls, please come to the rally point",
    tr:"Canavarli sehir duellosu - hepimiz KUCUK olanlara!\n#080 Herkes BOS bir kucuge 1 birlik gonderir - boylece herkes puan alir\n#080 BUYUK olan (merkez) ve ortalar yalnizca Commander cagrisiyla\n#080 BUYUK olan %25'e dusunce hepimiz birlikte gideriz\n#080 R4 cagirinca lutfen rally noktasina gelin",
    ru:"Городской дуэль с монстром - все идём на МАЛЕНЬКИХ!\n#080 Каждый шлёт 1 отряд на СВОБОДНОГО маленького - тогда все получают очки\n#080 БОЛЬШОЙ (центр) и средних только по команде Commander\n#080 Когда у БОЛЬШОГО 25%, идём на него все вместе\n#080 Когда зовёт R4, приходите на точку сбора" },
    { id:"stadt-monster-v2", prio:true, tags:{de:["Stadt + Monster (V2)","1 Trupp · <10 Mio","fair"],en:["City + monster (V2)","1 troop · <10M","fair"],tr:["Şehir + canavar (V2)","1 birlik · <10M","adil"],ru:["Город + монстр (V2)","1 отряд · <10М","честно"]},
    de:"Stadtduell mit Monster - fair fuer alle, have fun!\n#080 1 TRUPP - UNTER 10 MIO\n#080 Jeder schickt nur 1 TRUPP - und nur mit UNTER 10 MIO Kampfkraft\n#080 So ist der Grosse nicht in 30 Sek weg und JEDER macht Punkte\n#080 Wenn R4 ruft, kommt bitte zum Sammelpunkt",
    en:"City duel with monster - fair for all, have fun!\n#080 1 TROOP - UNDER 10M\n#080 Everyone sends only 1 TROOP - and only with UNDER 10M combat power\n#080 So the big one is not gone in 30 sec and EVERYONE scores\n#080 When R4 calls, please come to the rally point",
    tr:"Canavarli sehir duellosu - herkese adil, have fun!\n#080 1 BIRLIK - 10M ALTI\n#080 Herkes sadece 1 BIRLIK gonderir - ve sadece 10 MILYONDAN AZ savas gucuyle\n#080 Boylece BUYUK 30 saniyede bitmez ve HERKES puan alir\n#080 R4 cagirinca lutfen rally noktasina gelin",
    ru:"Городской дуэль с монстром - честно для всех, have fun!\n#080 1 ОТРЯД - МЕНЬШЕ 10 МЛН\n#080 Каждый шлёт только 1 ОТРЯД - и только с силой МЕНЬШЕ 10 МЛН\n#080 Так БОЛЬШОЙ не умрёт за 30 сек и очки получат ВСЕ\n#080 Когда зовёт R4, приходите на точку сбора" },
    { id:"stadt-allianz", prio:true, tags:{de:["Stadt + feindl. Allianz","Erobern + 30 Min halten"],en:["City + enemy alliance","Capture + hold 30 min"],tr:["Şehir + düşman ittifak","Ele geçir + 30 dk tut"],ru:["Город + вражеский альянс","Захват + удержать 30 мин"]},
    de:"Stadtduell mit feindlicher Allianz - gemeinsam drauf!\n#080 Wir hauen zusammen drauf, bis die Stadt UNS gehoert\n#080 Dann alle Truppen 30 Min zur Verteidigung reinschicken - so bleibt sie unsere\n#080 Nur Ersteroberung gibt Sofortpunkte, Rueckeroberung nicht - kein Gem dafuer\n#080 Wenn R4 ruft, kommt bitte zum Sammelpunkt",
    en:"City duel vs enemy alliance - hit it together!\n#080 We hit together until the city is OURS\n#080 Then everyone sends troops in for 30 min to defend - that keeps it ours\n#080 Only first capture gives instant points, recapture does not - no gems for it\n#080 When R4 calls, please come to the rally point",
    tr:"Dusman ittifakli sehir duellosu - birlikte vuralim!\n#080 Sehir BIZIM olana kadar birlikte vururuz\n#080 Sonra herkes 30 dk savunma icin birlik gonderir - boylece bizim kalir\n#080 Yalnizca ilk ele gecirme aninda puan verir, geri alma vermez - Gem harcamayin\n#080 R4 cagirinca lutfen rally noktasina gelin",
    ru:"Городской дуэль против вражеского альянса - бьём вместе!\n#080 Бьём вместе, пока город не станет НАШИМ\n#080 Потом все шлют войска на 30 мин в оборону - так останется нашим\n#080 Только первый захват даёт мгновенные очки, повторный - нет, не тратьте Gem\n#080 Когда зовёт R4, приходите на точку сбора" }
  ],
  belagerung:[ { id:"bela-halten", prio:true, tags:{de:["Halten","Schild","Rollen"],en:["Hold","Shield","Roles"],tr:["Tut","Shield","Roller"],ru:["Удержание","Shield","Роли"]},
    de:"Allianzbelagerung - Arcadia + 4 Tuerme halten, gemeinsam stark!\n#080 T-50 gemeinsam versetzen, Rollen verteilen (Arcadia-Halter, Turm-Teams, Reaktion)\n#080 60 Sek Halten = 10.000 Punkte - Dauerbesetzung schlaegt Kills\n#080 Schild-Disziplin; Hospital/Enlistment vorher leeren",
    en:"Arcadian Conquest - hold Arcadia + 4 towers, strong together!\n#080 Relocate together at T-50, assign roles (Arcadia holders, tower teams, reaction)\n#080 60 sec held = 10,000 points - continuous occupation beats kills\n#080 Shield discipline; empty hospital/enlistment beforehand",
    tr:"Arcadian Conquest - Arcadia + 4 kuleyi tut, birlikte gucluyuz!\n#080 T-50'de birlikte isinlan, rolleri dagit (Arcadia tutucular, kule ekipleri, reaksiyon)\n#080 60 sn tutmak = 10.000 puan - surekli isgal kill'leri yener\n#080 Shield disiplini; Hospital/Enlistment'i onceden bosalt",
    ru:"Arcadian Conquest - удерживай Arcadia + 4 башни, вместе сильны!\n#080 Телепорт вместе на T-50, распределите роли (держатели Arcadia, команды башен, реакция)\n#080 60 сек удержания = 10.000 очков - постоянное удержание сильнее киллов\n#080 Дисциплина Shield; заранее очистить Hospital/Enlistment" } ]
};

/* ===== Saubere Web-Fassung der HEUTE-Hub-Karte (Tag 1–6) =====
   Block-Struktur wie die Tages-Aussendung, aber sauber fuers Web (echte Umlaute,
   normale Schreibung, kein Paste-Limit). Eine Aussage pro Listenpunkt.
   key -> Label (fokus/aufheben/verstaerken) kommt aus dem Seiten-Skript (T[l][key]).
   PFLEGE: Wenn sich die Chat-Bullets oben (STRAT.duell) aendern, hier mitziehen. */
STRAT.duellWeb={
  1:[
    {ic:"🎯",key:"fokus",
      de:["Ausrüstungsfetzen verwenden — meiste Punkte (im Golden Window für 3 Events gleichzeitig)","Spionagemissionen machen — viele Punkte (kosten Ausdauer)","Nahrung, Holz, Metall, Benzin sammeln"],
      en:["Use gear scraps — most points (for 3 events at once in the Golden Window)","Run spy missions — high points (cost stamina)","Gather food, wood, metal, fuel"],
      tr:["Gear scraps kullan — en çok puan (Golden Window'da aynı anda 3 etkinlik için)","Casus görevleri yap — çok puan (dayanıklılık harcar)","Yiyecek, odun, metal, yakıt topla"],
      ru:["Используй gear scraps — больше всего очков (в Golden Window сразу для 3 событий)","Делай spy-миссии — много очков (тратят выносливость)","Собирай еду, дерево, металл, топливо"]},
    {ic:"📦",key:"aufheben",
      de:["Für Tag 2: Bau-Speedups","Für Tag 3: Forschungs-Speedups + Ungeheuer-Zellen + Ungeheuer-Serum"],
      en:["For Day 2: build speedups","For Day 3: research speedups + Behemoth Cells + Behemoth Serum"],
      tr:["2. Gün için: build speedups","3. Gün için: research speedups + Behemoth Cells + Behemoth Serum"],
      ru:["На День 2: build speedups","На День 3: research speedups + Behemoth Cells + Behemoth Serum"]}
  ],
  2:[
    {ic:"🎯",key:"fokus",
      de:["Bau-Speedups im Golden Window einsetzen — zählt dreifach","S-Entsendung (+75.000) und A-Lieferung (+50.000) als Extra mitnehmen","Bau-Speedups vorher nicht einzeln verbrauchen"],
      en:["Use build speedups in the Golden Window — counts triple","S-dispatch (+75,000) and A-delivery (+50,000) as extras","Do not spend build speedups one by one before"],
      tr:["Build speedups'i Golden Window'da kullan — üç kat sayılır","S-sevkiyat (+75.000) ve A-teslimat (+50.000) ekstra","Build speedups'i öncesinde tek tek harcama"],
      ru:["Используй build speedups в Golden Window — втрое","S-отправка (+75.000) и A-доставка (+50.000) как бонус","Не трать build speedups по одному заранее"]},
    {ic:"📦",key:"aufheben",
      de:["Für Tag 3: Forschungs-Speedups + Ungeheuer-Zellen + Ungeheuer-Serum + Kampfmedaillen","Für Tag 4: Heldenfragmente + Rekrutierungsmarken"],
      en:["For Day 3: research speedups + Behemoth Cells + Behemoth Serum + Battle Medals","For Day 4: hero fragments + recruit tokens"],
      tr:["3. Gün için: research speedups + Behemoth Cells + Behemoth Serum + Battle Medal","4. Gün için: hero parçaları + rekrutasyon markaları"],
      ru:["На День 3: research speedups + Behemoth Cells + Behemoth Serum + Battle Medals","На День 4: фрагменты героев + жетоны вербовки"]}
  ],
  3:[
    {ic:"🎯",key:"fokus",
      de:["Forschungs-Speedups im Golden Window einsetzen — zählt dreifach","Ungeheuer-Zellen (+12.000), Spionagemission (+30.000), Kampfmedaille ausgeben (+2.500)"],
      en:["Use research speedups in the Golden Window — counts triple","Behemoth Cells (+12,000), spy mission (+30,000), spend Battle Medal (+2,500)"],
      tr:["Research speedups'i Golden Window'da kullan — üç kat sayılır","Behemoth Cells (+12.000), casus görevi (+30.000), Battle Medal harca (+2.500)"],
      ru:["Используй research speedups в Golden Window — втрое","Behemoth Cells (+12.000), spy-миссия (+30.000), потратить Battle Medal (+2.500)"]},
    {ic:"📦",key:"aufheben",
      de:["Für Tag 4: Heldenfragmente + Rekrutierungsmarken","Für Tag 5: Spionage + Ressourcen fürs Truppen-Training"],
      en:["For Day 4: hero fragments + recruit tokens","For Day 5: spy + resources for troop training"],
      tr:["4. Gün için: hero parçaları + rekrutasyon markaları","5. Gün için: casus + birlik eğitimi için kaynaklar"],
      ru:["На День 4: фрагменты героев + жетоны вербовки","На День 5: spy + ресурсы для тренировки войск"]}
  ],
  4:[
    {ic:"🎯",key:"fokus",
      de:["Heldenfragmente einsetzen — legendäre + Wunsch-Rekrutierung am stärksten (im Golden Window dreifach)","Fragmente farmen: Rallys auf die mittleren Monster (Alpha-Bestie) — normale/fette Infizierte geben keine"],
      en:["Use hero fragments — legendary + wish recruitment strongest (triple in the Golden Window)","Farm fragments: rallies on the medium monsters (Alpha Beast) — normal/fat infected give none"],
      tr:["Hero fragments kullan — efsanevi + istek rekrutasyonu en güçlü (Golden Window'da üç kat)","Parça farmla: orta canavarlara (Alpha Beast) rally — normal/şişman enfekteler vermez"],
      ru:["Используй hero fragments — легендарные + желаемая вербовка сильнее всего (в Golden Window втрое)","Фарм фрагментов: rally на средних монстров (Alpha Beast) — обычные/толстые заражённые не дают"]},
    {ic:"📦",key:"aufheben",
      de:["Für Tag 5: Spionage + Trainings-Speedups + Ressourcen fürs Training","Für Tag 6: Friedenskuppeln + alle Beschleuniger"],
      en:["For Day 5: spy + training speedups + resources for training","For Day 6: Peace Shields + all speedups"],
      tr:["5. Gün için: casus + training speedups + eğitim için kaynaklar","6. Gün için: Peace Shields + tüm speedups"],
      ru:["На День 5: spy + training speedups + ресурсы для тренировки","На День 6: Peace Shields + все speedups"]}
  ],
  5:[
    {ic:"🎯",key:"fokus",
      de:["Spionagemission (+37.500) + Truppen trainieren (höhere Stufen mehr Punkte)","Training braucht Ressourcen — genug bereithalten (Truppen hat man genug)","Heute kein Golden Window (keine Power-Play-Truppen-Runde)"],
      en:["Spy mission (+37,500) + train troops (higher tiers more points)","Training needs resources — keep enough ready (you have enough troops)","No Golden Window today (no Power Play troop round)"],
      tr:["Casus görevi (+37.500) + birlik eğit (üst seviyeler daha çok puan)","Eğitim kaynak ister — yeterince hazır tut (birlik yeterli)","Bugün Golden Window yok (Power Play birlik turu yok)"],
      ru:["Spy-миссия (+37.500) + тренировать войска (выше уровень — больше очков)","Тренировка требует ресурсов — держи запас (войск хватает)","Сегодня нет Golden Window (нет раунда войск в Power Play)"]},
    {ic:"📦",key:"aufheben",
      de:["Für Tag 6: Friedenskuppeln + alle Beschleuniger","Für Montag (Tag 1): Ausrüstungsfetzen + Spionage + Kommandantenausdauer (Sonntag ist duellfrei)"],
      en:["For Day 6: Peace Shields + all speedups","For Monday (Day 1): gear scraps + spy + commander stamina (Sunday has no duel)"],
      tr:["6. Gün için: Peace Shields + tüm speedups","Pazartesi için (1. Gün): gear scraps + casus + komutan dayanıklılığı (Pazar duel yok)"],
      ru:["На День 6: Peace Shields + все speedups","На понедельник (День 1): gear scraps + spy + выносливость командира (в воскресенье дуэли нет)"]}
  ],
  6:[
    {ic:"🛡️",key:"fokus",
      de:["Unter der Kuppel seid ihr unangreifbar","Wer angreift, verliert die Kuppel (30 Min Abklingzeit)","Trupps draußen sind angreifbar — bei Angriffen zurückrufen"],
      en:["Under the dome you cannot be attacked","Whoever attacks loses the dome (30 min cooldown)","Troops outside can be attacked — recall them when attacks come"],
      tr:["Dome altında saldırılmaz olursunuz","Saldıran dome'u kaybeder (30 dk bekleme)","Dışarıdaki birlikler saldırılabilir — saldırılarda geri çağır"],
      ru:["Под куполом вас нельзя атаковать","Кто атакует, теряет купол (30 мин перезарядка)","Войска снаружи можно атаковать — отзывай при атаках"]},
    {ic:"💪",key:"verstaerken",
      de:["Siedlungen ohne Kuppel mit der stärksten Truppe verstärken (bis 5 Plätze)","Gewinnt der Verteidiger, zählt der Kill für uns","Hebel: Sandwurm-Eier (perfekt +500.000), S-Entsendung, A-Lieferung, Beschleuniger","Vor jedem Angriff im Chat fragen — wir stimmen uns ab"],
      en:["Reinforce settlements without a dome with your strongest troops (up to 5)","If the defender wins, the kill counts for us","Levers: sandworm eggs (perfect +500,000), S-dispatch, A-delivery, speedups","Ask in chat before every attack — we coordinate"],
      tr:["Dome'suz yerleşimleri en güçlü birlikle takviye et (5'e kadar)","Savunan kazanırsa kill bize sayılır","Kaldıraçlar: kum solucanı yumurtaları (mükemmel +500.000), S-sevkiyat, A-teslimat, speedups","Her saldırıdan önce chat'te sor — uyum sağlayalım"],
      ru:["Усиливай поселения без купола самыми сильными войсками (до 5)","Если защитник побеждает, килл засчитывается нам","Рычаги: яйца песчаного червя (идеальное +500.000), S-отправка, A-доставка, speedups","Спрашивай в чате перед каждой атакой — согласуем"]}
  ]
};

/* Event-Label + Emoji (gemeinsame Quelle fuer beide Seiten) */
var STRAT_EV={
  duell:{emo:"⚔️",name:{de:"Allianzduell",en:"Alliance Duel",tr:"Alliance Duel",ru:"Alliance Duel"}},
  loewe:{emo:"🦁",name:{de:"Ghulöwe",en:"Ghoulion",tr:"Ghoulion",ru:"Ghoulion"}},
  reservoir:{emo:"🐟",name:{de:"Reservoir Raid",en:"Reservoir Raid",tr:"Reservoir Raid",ru:"Reservoir Raid"}},
  stadt:{emo:"🌃",name:{de:"Stadtduell",en:"City Duel",tr:"City Duel",ru:"City Duel"}},
  belagerung:{emo:"👑",name:{de:"Allianzbelagerung",en:"Arcadian Conquest",tr:"Arcadian Conquest",ru:"Arcadian Conquest"}}
};

/* Tag-Labels je Sprache: x.tags kann Array (alt) ODER {de,en,tr,ru} sein. */
function stratTagArr(x,lang){ var t=x&&x.tags; if(!t) return []; if(Array.isArray(t)) return t; return t[lang]||t.en||t.de||[]; }
/* Strategie-Text je Sprache mit Fallback gewaehlt -> EN -> DE. */
function stratLoc(x,lang){ if(!x) return ""; return x[lang]!=null?x[lang]:(x.en!=null?x.en:(x.de!=null?x.de:"")); }
