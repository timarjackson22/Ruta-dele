  /* ==USAGE== v296: how Spanish words are really used — near-synonyms, what each one means, where it is said and how natural it
     sounds. Profe's practice checks a learner's answer here before calling it wrong: a synonym that fits is accepted (with a
     note when another word is more usual), one that fits only part of the meaning is accepted with what it doesn't cover, and
     one that doesn't fit is explained. Words not in these groups fall back to the app's dictionary (TG glosses).
     Group: { s: { sense: regex on the English prompt }, w: { word: [senses, where, note] } }
       where: "" everywhere · "es" Spain · "lat" Latin America · "mx" Mexico · "ar" Argentina/Uruguay · "car" Caribbean · "and" Andes
       register in the note: (informal) / (formal) / (slang). */
  const US_G = [
    { k: "sorry", s: { sorry: /\bsorry\b|apolog/, attn: /excuse me|pardon me|attention/, pass: /excuse me|get (past|by|through)|let me (pass|through)/, again: /^pardon\??$|repeat|what did you say/ },
      w: { "perdón": [["sorry", "attn", "again"], "", "«perdón» is a quick sorry (you bumped into someone), an excuse me to get attention, or «pardon?» when you didn't hear."],
        "perdona": [["sorry", "attn"], "", "«perdona» (tú) / «perdone» (usted): sorry, or excuse me to the person you are talking to."],
        "perdone": [["sorry", "attn"], "", "«perdone» is the usted form of «perdona»: sorry / excuse me, politely."],
        "disculpa": [["attn", "sorry"], "", "«disculpa» (tú) / «disculpe» (usted): excuse me to get someone's attention, or a polite apology."],
        "disculpe": [["attn", "sorry"], "", "«disculpe» is the polite (usted) excuse me / sorry."],
        "lo siento": [["sorry"], "", "«lo siento» is «I'm sorry» for real regret or sympathy (bad news, a proper apology); it is never used to get someone's attention."],
        "permiso": [["pass"], "lat", "«permiso» / «con permiso» is excuse me when you need to get past someone, come in or leave; it is not an apology."],
        "con permiso": [["pass"], "", "«con permiso» is excuse me when you need to get past someone, come in or leave; it is not an apology."],
        "cómo": [["again"], "", "«¿cómo?» is the natural way to say «pardon? / what did you say?»."] } },
    { k: "car", s: { car: /\bcar\b|automobile/ }, w: { "coche": [["car"], "es", "«coche» is the usual word in Spain."], "carro": [["car"], "lat", "«carro» is the usual word in most of Latin America (in Spain a «carro» is a cart)."], "auto": [["car"], "", "«auto» is understood everywhere and usual in Chile and Argentina."], "automóvil": [["car"], "", "«automóvil» is correct but formal; people say «coche» (Spain) or «carro»/«auto» (Latin America)."] } },
    { k: "computer", s: { pc: /computer/ }, w: { "ordenador": [["pc"], "es", "«ordenador» is said in Spain."], "computadora": [["pc"], "lat", "«computadora» is said in most of Latin America."], "computador": [["pc"], "lat", "«computador» is said in Colombia and Chile."] } },
    { k: "mobile", s: { ph: /mobile|cell ?phone|cellphone/ }, w: { "móvil": [["ph"], "es", "«móvil» is said in Spain."], "celular": [["ph"], "lat", "«celular» is said in Latin America."], "teléfono": [["ph"], "", "«teléfono» is any phone; for a mobile people say «móvil» (Spain) or «celular» (Latin America)."] } },
    { k: "juice", s: { j: /juice/ }, w: { "zumo": [["j"], "es", "«zumo» is said in Spain (for fruit juice)."], "jugo": [["j"], "lat", "«jugo» is said in Latin America (in Spain «jugo» is the juice of meat or a plant)."] } },
    { k: "potato", s: { p: /potato/ }, w: { "patata": [["p"], "es", "«patata» is said in Spain."], "papa": [["p"], "lat", "«papa» is said in Latin America and the Canary Islands."] } },
    { k: "drive", s: { d: /\bdrive\b|driving/ }, w: { "conducir": [["d"], "es", "«conducir» is the usual verb in Spain."], "manejar": [["d"], "lat", "«manejar» is the usual verb in Latin America."] } },
    { k: "bus", s: { b: /\bbus\b/ }, w: { "autobús": [["b"], "", "«autobús» is understood everywhere."], "bus": [["b"], "", "«bus» is common and informal everywhere."], "camión": [["b"], "mx", "«camión» means bus in Mexico (elsewhere it's a lorry/truck)."], "guagua": [["b"], "car", "«guagua» means bus in the Caribbean and the Canary Islands."], "colectivo": [["b"], "ar", "«colectivo» means bus in Argentina."] } },
    { k: "flat", s: { f: /apartment|\bflat\b/ }, w: { "piso": [["f"], "es", "«piso» is a flat in Spain (it also means floor everywhere)."], "apartamento": [["f"], "", "«apartamento» is understood everywhere; in Spain it suggests a small or holiday flat."], "departamento": [["f"], "mx", "«departamento» is said in Mexico, Argentina and Chile."] } },
    { k: "take", s: { tk: /take \(?(a |the )?(bus|train|taxi|plane|metro)|catch/ }, w: { "coger": [["tk"], "es", "«coger» (el autobús) is normal in Spain, but in much of Latin America it is vulgar: use «tomar»."], "tomar": [["tk"], "", "«tomar» (el autobús) works everywhere."], "agarrar": [["tk"], "ar", "«agarrar» is informal (Argentina, Mexico)."] } },
    { k: "beans", s: { b: /\bbeans?\b/ }, w: { "frijoles": [["b"], "lat", "«frijoles» is said in Mexico, Central America and the Caribbean."], "judías": [["b"], "es", "«judías» / «alubias» are said in Spain."], "alubias": [["b"], "es", "«alubias» is said in Spain."], "porotos": [["b"], "ar", "«porotos» is said in the Southern Cone."], "habichuelas": [["b"], "car", "«habichuelas» is said in Puerto Rico and the Dominican Republic."] } },
    { k: "peach", s: { p: /peach/ }, w: { "melocotón": [["p"], "es", "«melocotón» is said in Spain."], "durazno": [["p"], "lat", "«durazno» is said in Latin America."] } },
    { k: "glasses", s: { g: /glasses|spectacles/ }, w: { "gafas": [["g"], "es", "«gafas» is said in Spain."], "lentes": [["g"], "lat", "«lentes» is said in Latin America."], "anteojos": [["g"], "lat", "«anteojos» is said in Latin America."] } },
    { k: "jacket", s: { j: /jacket/ }, w: { "chaqueta": [["j"], "", "«chaqueta» is understood everywhere."], "chamarra": [["j"], "mx", "«chamarra» is said in Mexico."], "campera": [["j"], "ar", "«campera» is said in Argentina and Uruguay."] } },
    { k: "pool", s: { p: /swimming pool|\bpool\b/ }, w: { "piscina": [["p"], "", "«piscina» is understood everywhere."], "alberca": [["p"], "mx", "«alberca» is said in Mexico."], "pileta": [["p"], "ar", "«pileta» is said in Argentina."] } },
    { k: "fridge", s: { f: /fridge|refrigerator/ }, w: { "nevera": [["f"], "", "«nevera» is common in Spain, Colombia and Venezuela."], "frigorífico": [["f"], "es", "«frigorífico» is said in Spain."], "refrigerador": [["f"], "lat", "«refrigerador» is said in Mexico, Central America and Chile."], "refrigeradora": [["f"], "and", "«refrigeradora» is said in Peru and Central America."], "heladera": [["f"], "ar", "«heladera» is said in Argentina and Uruguay."] } },
    { k: "tap", s: { t: /\btap\b|faucet/ }, w: { "grifo": [["t"], "es", "«grifo» is said in Spain."], "llave": [["t"], "lat", "«llave» (del agua) is said in much of Latin America."], "canilla": [["t"], "ar", "«canilla» is said in Argentina and Uruguay."] } },
    { k: "rent", s: { r: /\brent\b/ }, w: { "alquilar": [["r"], "", "«alquilar» is understood everywhere."], "rentar": [["r"], "mx", "«rentar» is said in Mexico."], "arrendar": [["r"], "", "«arrendar» is formal or legal (Chile, Colombia)."] } },
    { k: "avocado", s: { a: /avocado/ }, w: { "aguacate": [["a"], "", "«aguacate» is said in Spain, Mexico and Central America."], "palta": [["a"], "ar", "«palta» is said in the Southern Cone and Peru."] } },
    { k: "strawberry", s: { s: /strawberr/ }, w: { "fresa": [["s"], "", "«fresa» is understood everywhere."], "frutilla": [["s"], "ar", "«frutilla» is said in Argentina, Uruguay and Chile."] } },
    { k: "corn", s: { c: /\bcorn\b|maize|corncob/ }, w: { "maíz": [["c"], "", "«maíz» is the grain, everywhere."], "elote": [["c"], "mx", "«elote» is a corncob in Mexico and Central America."], "choclo": [["c"], "ar", "«choclo» is a corncob in the Andes and the Southern Cone."], "mazorca": [["c"], "", "«mazorca» is the cob."] } },
    { k: "ticket", s: { tr: /ticket/ }, w: { "billete": [["tr"], "es", "«billete» is a travel ticket in Spain (in Latin America a «billete» is a banknote)."], "boleto": [["tr"], "lat", "«boleto» is a ticket in Latin America."], "entrada": [["tr"], "", "«entrada» is a ticket to a show, a match or a museum."], "pasaje": [["tr"], "lat", "«pasaje» is a plane or bus ticket in Latin America."] } },
    { k: "room", s: { r: /\broom\b|bedroom/ }, w: { "habitación": [["r"], "", "«habitación» is understood everywhere."], "cuarto": [["r"], "", "«cuarto» is common everywhere and a bit more informal."], "recámara": [["r"], "mx", "«recámara» is a bedroom in Mexico."], "dormitorio": [["r"], "", "«dormitorio» is a bedroom, a bit more formal."], "pieza": [["r"], "ar", "«pieza» is a bedroom in the Southern Cone."] } },
    { k: "work", s: { j: /\bjob\b|\bwork\b/ }, w: { "trabajo": [["j"], "", "«trabajo» works everywhere."], "empleo": [["j"], "", "«empleo» is a job/employment, a bit formal (job adverts, the news)."], "chamba": [["j"], "mx", "«chamba» is slang for work in Mexico and Peru."], "curro": [["j"], "es", "«curro» is slang for work in Spain."] } },
    { k: "cool", s: { c: /\bcool\b|great|awesome/ }, w: { "genial": [["c"], "", "«genial» works everywhere."], "guay": [["c"], "es", "«guay» is informal Spain."], "chévere": [["c"], "car", "«chévere» is informal in Venezuela, Colombia, Panama and the Caribbean."], "padre": [["c"], "mx", "«qué padre» is informal Mexico."], "bacán": [["c"], "and", "«bacán» is informal in Chile and Peru."], "copado": [["c"], "ar", "«copado» is informal Argentina."], "estupendo": [["c"], "", "«estupendo» is great, a bit old-fashioned."] } },
    { k: "okay", s: { o: /\bok(ay)?\b|all right|alright|fine\b/ }, w: { "vale": [["o"], "es", "«vale» is how Spain says OK; in Latin America it sounds Spanish."], "está bien": [["o"], "", "«está bien» works everywhere."], "de acuerdo": [["o"], "", "«de acuerdo» is OK / agreed, a bit more formal."], "dale": [["o"], "ar", "«dale» is informal OK in Argentina, Colombia and Panama."], "okey": [["o"], "lat", "«okey» is common and informal in Latin America."] } },
    { k: "start", s: { s: /\bstart\b|\bbegin\b/ }, w: { "empezar": [["s"], "", "«empezar» is the everyday verb."], "comenzar": [["s"], "", "«comenzar» means the same; it sounds a little more formal."], "iniciar": [["s"], "", "«iniciar» is formal (a meeting, a process, a computer)."] } },
    { k: "finish", s: { f: /\bfinish\b|\bend\b/ }, w: { "terminar": [["f"], "", "«terminar» is the everyday verb."], "acabar": [["f"], "", "«acabar» means the same (and «acabar de» + infinitive = to have just done)."], "finalizar": [["f"], "", "«finalizar» is formal."] } },
    { k: "return", s: { r: /\breturn\b|come back|go back/ }, w: { "volver": [["r"], "", "«volver» is the everyday verb everywhere."], "regresar": [["r"], "lat", "«regresar» means the same and is very common in Latin America."], "devolver": [[], "", "«devolver» is to give something back, not to come back."] } },
    { k: "pretty", s: { th: /pretty|nice|lovely|beautiful/, pp: /good-looking|handsome|attractive|beautiful/ }, w: { "bonito": [["th", "pp"], "", "«bonito» is pretty/nice, mostly for things and places."], "lindo": [["th", "pp"], "lat", "«lindo» is very common in Latin America for people and things."], "guapo": [["pp"], "", "«guapo» is good-looking — for people (in Spain also «great» for things, informally)."], "hermoso": [["th", "pp"], "", "«hermoso» is beautiful, stronger and more formal."], "bello": [["th", "pp"], "", "«bello» is beautiful, quite literary."] } },
    { k: "old", s: { th: /\bold\b(?!.*(person|people|man|woman|elderly))|ancient|antique|former/, pp: /person|people|\bman\b|woman|elderly|older/ }, w: { "viejo": [["th", "pp"], "", "«viejo» is old for things; for people it can sound rude — say «mayor»."], "antiguo": [["th"], "", "«antiguo» is old in the sense of ancient or former."], "mayor": [["pp"], "", "«mayor» is the polite word for an old or older person."] } },
    { k: "know", s: { f: /\bfacts?\b|how to|information|\bthat\b|where|when|why|answer/, p: /person|people|place|city|country|meet|familiar|acquaint/ }, w: { "saber": [["f"], "", "«saber» is to know a fact or how to do something."], "conocer": [["p"], "", "«conocer» is to know a person or a place (be familiar with it)."] } },
    { k: "ask", s: { q: /\bask\b(?! for)|question|inquire/, r: /\bask for\b|request|order/ }, w: { "preguntar": [["q"], "", "«preguntar» is to ask a question."], "pedir": [["r"], "", "«pedir» is to ask for something (a favour, food, help)."] } },
    { k: "look", s: { l: /look|watch|see/, s: /\bsee\b|watch/ }, w: { "mirar": [["l"], "", "«mirar» is to look at something on purpose."], "ver": [["s", "l"], "", "«ver» is to see, and also to watch (TV, a film)."] } },
    { k: "listen", s: { l: /listen/, h: /hear/ }, w: { "escuchar": [["l"], "", "«escuchar» is to listen (and in Latin America also to hear)."], "oír": [["h"], "", "«oír» is to hear."] } },
    { k: "play", s: { g: /\bplay\b(?!.*(instrument|guitar|piano|violin|drum|music|trumpet|flute))/, m: /instrument|guitar|piano|violin|drum|trumpet|flute|play music/ }, w: { "jugar": [["g"], "", "«jugar» is to play a game or sport."], "tocar": [["m"], "", "«tocar» is to play an instrument (or to touch)."] } },
    { k: "bring", s: { b: /bring/, t: /\btake\b|carry/ }, w: { "traer": [["b"], "", "«traer» is to bring (towards where you are)."], "llevar": [["t"], "", "«llevar» is to take or carry (away from here)."] } },
    { k: "drink", s: { d: /drink|have \(a drink\)/ }, w: { "beber": [["d"], "", "«beber» is to drink."], "tomar": [["d"], "", "«tomar» is the more natural verb for drinks in Latin America and for coffee everywhere."] } },
    { k: "say", s: { s: /\bsay\b|\btell\b/, t: /speak|talk/ }, w: { "decir": [["s"], "", "«decir» is to say or tell."], "hablar": [["t"], "", "«hablar» is to speak or talk."], "contar": [["s"], "", "«contar» is to tell (a story, what happened)."] } },
    { k: "leave", s: { o: /go out|leave|exit/, a: /leave|go away/, b: /leave (something|behind)|let/ }, w: { "salir": [["o"], "", "«salir» is to go out or leave a place."], "irse": [["a"], "", "«irse» is to leave, to go away."], "dejar": [["b"], "", "«dejar» is to leave something somewhere, or to let."] } },
    { k: "big", s: { b: /\bbig\b|large/, l: /\blong\b/ }, w: { "grande": [["b"], "", "«grande» is big."], "largo": [["l"], "", "«largo» means long, not large (a false friend)."] } },
    { k: "child", s: { c: /\bchild\b|\bkid\b|\bboy\b/ }, w: { "niño": [["c"], "", "«niño» works everywhere."], "chico": [["c"], "", "«chico» is a boy or young man, informal."], "chaval": [["c"], "es", "«chaval» is informal Spain."], "chamaco": [["c"], "mx", "«chamaco» is informal Mexico."], "pibe": [["c"], "ar", "«pibe» is informal Argentina."], "crío": [["c"], "es", "«crío» is informal Spain."] } },
    { k: "money", s: { m: /money/ }, w: { "dinero": [["m"], "", "«dinero» works everywhere."], "plata": [["m"], "lat", "«plata» is informal money in much of Latin America."], "pasta": [["m"], "es", "«pasta» is slang for money in Spain."], "lana": [["m"], "mx", "«lana» is slang for money in Mexico."] } },
    { k: "because", s: { b: /because|since|as\b/ }, w: { "porque": [["b"], "", "«porque» is because."], "ya que": [["b"], "", "«ya que» is since / because, a little more formal."], "como": [["b"], "", "«como» = since/as, only at the start of the sentence."], "pues": [["b"], "", "«pues» = because/well, informal."] } },
    { k: "but", s: { b: /\bbut\b/, s: /but rather|\binstead\b/ }, w: { "pero": [["b"], "", "«pero» is but."], "sino": [["s"], "", "«sino» is «but (rather)», only after a negative: no es rojo sino azul."] } },
  ];
  const usN = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:«»"()]/g, " ").replace(/\s+/g, " ").trim();
  const US_IX = new Map(); US_G.forEach((g) => Object.keys(g.w).forEach((w) => { const k = usN(w); if (k && !US_IX.has(k)) US_IX.set(k, []); if (k) US_IX.get(k).push([g, w.trim()]); }));
  const US_RG = { es: "Spain", lat: "Latin America", mx: "Mexico", ar: "Argentina", car: "the Caribbean", and: "the Andes" };
  const usLat = () => { if (window.__usLat != null) return !!window.__usLat; try { return S.region === "latam"; } catch (e) { return false; } }; // __usLat: tests
  // the word(s) of a group inside a short answer: «con permiso» before «permiso», articles and subject pronouns ignored
  function usFind(said) { const t = " " + usN(said).replace(/^(el|la|los|las|un|una|yo|tu|el|ella|usted) /, "") + " "; let best = null;
    US_IX.forEach((L, k) => { if (t.includes(" " + k + " ") && (!best || k.length > best[0].length)) best = [k, L]; }); return best ? best[1] : []; }
  function usActive(g, en) { const e = String(en || "").toLowerCase(); return Object.keys(g.s).filter((s) => g.s[s].test(e)); }
  const usLabel = (g, s) => ({ sorry: "sorry", attn: "excuse me (to get attention)", pass: "excuse me (to get past)", again: "pardon?", f: "to know (facts, how to)", p: "to know (people, places)", q: "to ask a question", r: "to ask for something", th: "for things", pp: "for people", b: "big", l: "long", o: "to go out", a: "to go away", s: "the right sense" }[s] || s);
  const usPlace = (where) => (where && US_RG[where] ? where : "");
  function usRegionNote(entry, w) { const wh = usPlace(entry[1]); if (!wh) return ""; const lat = usLat(); if ((wh === "es" && lat) || (wh !== "es" && !lat)) return " You chose " + (lat ? "Latin American" : "Spain") + " Spanish: «" + w + "» is mainly said in " + US_RG[wh] + "."; return ""; }
  // judge one word/short answer against the target(s) for an English prompt
  //  → { v: "ok" | "part" | "no", note, natural } or null when this knowledge has nothing to say
  function usJudge(said, targets, en, opt) { opt = opt || {};
    targets = [].concat(targets || []).map((x) => String(x || "").trim()).filter(Boolean); if (!targets.length || !String(said || "").trim()) return null;
    const S0 = usFind(said); if (!S0.length) return opt.nodict ? null : usDict(said, targets, en);
    for (const tg of targets) { const T0 = usFind(tg); for (const [g, ws] of S0) { const tw = T0.find((x) => x[0] === g); if (!tw) continue; const wt = tw[1], es = g.w[ws], et = g.w[wt];
      if (usN(ws) === usN(wt)) return { v: "ok", note: usRegionNote(es, ws).trim(), same: true };
      // the meaning asked for: senses the English names; with no qualifier, the card's word decides (in a sentence) or either
      // reading of a plain gloss counts (one word on a card: «to know» → saber or conocer, with what each one means)
      let act = usActive(g, en); const named = act.length; if (!named) act = opt.strict ? et[0].slice() : [...new Set(et[0].concat(es[0]))];
      const need = named ? act.filter((s) => et[0].includes(s)) : et[0], cov = act.filter((s) => es[0].includes(s)), miss = (need.length ? need : act).filter((s) => !es[0].includes(s));
      if (cov.length && !miss.length) return { v: "ok", note: "«" + ws + "» is right too. " + es[2] + (et[2] && et[2] !== es[2] ? " " + et[2] : "") + usRegionNote(es, ws), alt: wt };
      if (cov.length) return { v: "part", note: "«" + ws + "» works for «" + cov.map((s) => usLabel(g, s)).join(" / ") + "» but not for «" + miss.map((s) => usLabel(g, s)).join(" / ") + "». " + es[2] + " For the whole meaning say «" + wt + "».", alt: wt };
      return { v: "no", note: "«" + ws + "» doesn't fit here. " + es[2] + " Here you need «" + wt + "»: " + et[2], alt: wt }; } }
    // the learner's word belongs to a group the target doesn't: is it a real word for the prompt?
    const [g, ws] = S0[0], es = g.w[ws], act = usActive(g, en).filter((s) => es[0].includes(s));
    if (act.length && !opt.nodict) return { v: "ok", note: "«" + ws + "» is right too. " + es[2] + usRegionNote(es, ws), alt: targets[0] };
    return null;
  }
  // the app's dictionary: a word whose English gloss shares a meaning with the prompt is a synonym; one that doesn't is explained
  const US_STOP = /^(the|a|an|to|of|in|on|for|and|or|with|be|is|it|one|someone|something|sb|sth|me|my|your|very|get)$/;
  const usEnToks = (e) => String(e || "").toLowerCase().replace(/\([^)]*\)/g, " ").split(/[^a-z']+/).filter((x) => x.length > 2 && !US_STOP.test(x)).map((x) => x.replace(/(ing|ed|es|s)$/, ""));
  function usDict(said, targets, en) {
    let tg = null; try { const w = usN(said).replace(/^(el|la|los|las|un|una|unos|unas) /, ""), k = w.split(" ").length === 1 ? w : null; if (!k) return null;
      const raw = String(said).toLowerCase().trim().replace(/^(el|la|los|las|un|una|unos|unas)\s+/, ""); tg = (typeof TG !== "undefined" && (TG[raw] || TG[k])) || null; } catch (e) {}
    if (!tg || !tg[2]) return null; const want = usEnToks(en), have = usEnToks(tg[2]); if (!want.length || !have.length) return null;
    const hit = want.filter((x) => have.includes(x));
    if (hit.length) return { v: "ok", note: "«" + String(said).trim() + "» also means «" + String(tg[2]).split(/[;]/)[0].trim() + "», so it is right too. The card's word is «" + targets[0] + "».", alt: targets[0], dict: true };
    return { v: "no", note: "«" + String(said).trim() + "» means «" + String(tg[2]).split(/[;]/)[0].trim() + "», not «" + String(en).trim() + "».", alt: targets[0], dict: true };
  }
  // the same knowledge inside a sentence: one substituted word (translation practice)
  // irregular forms the conjugation tables can read as another verb («sé» is also the imperative of ser)
  const US_LEM = {}; [["saber", "sé sabes sabe sabemos sabéis saben supe supiste supo supimos supisteis supieron sepa sepas sepamos sepan"], ["conocer", "conozco conozca conozcas conozcamos conozcan"],
    ["oír", "oigo oyes oye oímos oyen oí oyó oyeron oiga"], ["ver", "veo ves ve vemos ven vi viste vio vimos vieron vea"], ["decir", "digo dices dice decimos dicen dije dijiste dijo dijimos dijeron diga"],
    ["traer", "traigo traje trajiste trajo trajimos trajeron traiga"], ["salir", "salgo salga"], ["irse", "me voy te vas se va nos vamos se van"], ["pedir", "pido pides pide piden pedí pidió pidieron pida"]].forEach(([v, f]) => f.split(" ").forEach((x) => (US_LEM[x] = (US_LEM[x] || []).concat(v))));
  function usWord(l, a, en, lemL, lemA) { // inside a sentence; lemmas from the caller (conozco → conocer, sé → saber or ser): only the
    // curated groups judge here (the dictionary check of the sentence itself is done by the caller)
    const lm = (w) => US_LEM[String(w || "").toLowerCase()] || [], Ls = [l].concat(lemL || [], lm(l)), As = [a].concat(lemA || [], lm(a));
    for (const x of Ls) for (const y of As) { if (!usFind(x).length || !usFind(y).length) continue; const r = usJudge(x, [y], en || "", { strict: true, nodict: true }); if (r && !r.same && r.alt) return r; }
    return null; }
  /* a second look from Profe's AI (when the learner has one): is an answer the checker rejected acceptable, and is an accepted
     one natural? One short JSON reply; only on misses and on alternatives, never on exact answers. */
  async function usAsk(o) { // o = { en, said, model, kind: "word" | "sentence", ok }
    let tb = null; try { tb = resolveTB(); } catch (e) {} if (!tb || typeof aiText !== "function") return null;
    const sys = "You are an expert teacher of Spanish (Spain and Latin America). Judge a learner's answer in a translation exercise. Reply with ONE line of JSON only: {\"ok\":true|false,\"natural\":true|false,\"better\":\"<the most natural Spanish, or empty>\",\"why\":\"<one short sentence in English>\"}. ok = the answer correctly expresses the English in some real context (accept synonyms and regional words). natural = a native speaker would say it this way. If not ok, say what the learner's words actually mean.";
    const user = "English: " + o.en + "\nThe lesson's answer: " + o.model + "\nThe learner wrote: " + o.said;
    try { usAsk.n = (usAsk.n || 0) + 1; aiText.cap = 160; const t = await Promise.race([aiText(sys, user), new Promise((r) => setTimeout(() => r(""), 25000))]); aiText.cap = 0;
      const m = /\{[\s\S]*\}/.exec(t || ""); if (!m) return null; const j = JSON.parse(m[0]); return { ok: !!j.ok, natural: j.natural !== false, better: String(j.better || "").trim(), why: String(j.why || "").trim() }; } catch (e) { aiText.cap = 0; return null; }
  }
  window.__us = { judge: usJudge, word: usWord, ask: usAsk, groups: US_G, find: usFind };
  /* ==/USAGE== */
