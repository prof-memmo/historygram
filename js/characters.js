/**
 * HistoryGram - Database Storico Didattico Ufficiale
 * Livello Didattico: Scuola Secondaria di 2° Grado (Licei e Istituti Tecnici)
 * Modalità 1: I Moti Rivoluzionari dell'Ottocento (1820-1848)
 * Modalità 2: Riforma Protestante e Rinnovamento Cattolico (XVI Secolo)
 */

const HISTORY_MODES = {
  revolution_1800: {
    id: "revolution_1800",
    title: "I moti rivoluzionari",
    subtitle: "Le Rivoluzioni dell'Ottocento (1820-1848)",
    targetClass: "Scuola Secondaria di 2° Grado",
    badge: "🇮🇹 Moti 1820 - 1848 🇫🇷",
    description: "Le fazioni incarnano le correnti politiche e ideologiche dell'Ottocento europeo (liberali, democratici, patrioti, primi socialisti). Ciascun gruppo analizza il contesto storico, formula tesi e proclami originali, e si confronta nel dibattito pubblico dell'epoca.",
    scoringMetric: "Follower (1 Like = 1 Follower + Bonus Merito Docente)",
    characters: [
      {
        id: "carbonaro",
        name: "I Carbonari",
        faction: "Italia (1820-21)",
        avatar: "🕯️",
        accentColor: "#2b2d42",
        hashtags: ["#CostituzioneOra", "#UnitiperlaPatria", "#Moti1821", "#SocietàSegreta", "#FuoriLoStraniero"],
        context: "Nata nel Mezzogiorno in funzione antinapoleonica e sviluppatasi in chiave antiborbonica e antiaustriaca, la Carboneria adotta la struttura a logge chiuse ('vendite') con gradi esoterici e simboli allegorici. Il limite storiografico cardine risiede nella rigida compartimentazione del programma e nella mancata osmosi con le masse popolari, palesata dai fallimenti delle insurrezioni costituzionali a Napoli (1820) e nel Regno di Sardegna (1821)."
      },
      {
        id: "patriota_greco",
        name: "I Patrioti Greci",
        faction: "Grecia (1821-29)",
        avatar: "🏛️",
        accentColor: "#0077b6",
        hashtags: ["#VivaLaGrecia", "#LibertàOltremare", "#EroiDellaPatria", "#Filellenismo", "#LibertàOMorte"],
        context: "Coordinata dalla società patriottica Filikí Etería e sostenuta dall'opinione pubblica colta europea (il Filellenismo romantico, che vide la partecipazione di intellettuali come Lord Byron e Santorre di Santa Rosa), la rivoluzione greca contro la Sublime Porta ottomana rappresenta l'unico moto degli anni Venti a conseguire la vittoria, sancita dalla pace di Adrianopoli (1829) e dal protocollo di Londra (1830)."
      },
      {
        id: "liberale_spagnolo",
        name: "I Liberali Spagnoli",
        faction: "Spagna (1820)",
        avatar: "📜",
        accentColor: "#d90429",
        hashtags: ["#VivaLaConstitucion", "#LibertadYPatria", "#NoAssolutismo", "#Cadice1812", "#Pronunciamiento"],
        context: "Nel gennaio 1820, il pronunciamiento militare guidato dal colonnello Rafael del Riego tra le truppe stanziate a Cadice costringe Ferdinando VII a ripristinare la Costituzione monocamerale del 1812. L'esperienza del Triennio Liberale (1820-1823) apre la prima crisi dell'ordine geopolitico della Restaurazione, prima dell'intervento repressivo armato della Santa Alleanza (spedizione francese del Duca d'Angoulême, 1823)."
      },
      {
        id: "mazziniano",
        name: "I Mazziniani",
        faction: "Italia (1831-48)",
        avatar: "🔥",
        accentColor: "#2d6a4f",
        hashtags: ["#GiovineItalia", "#UnitiSiVince", "#FuturoRepubblicano", "#PensieroEAzione", "#ItaliaLibera"],
        context: "Giuseppe Mazzini supera dialetticamente il modello cospirativo carbonaro formulando una dottrina organica: programma pubblico e trasparente, educazione popolare e rigore etico riassunti nel binomio 'Pensiero e Azione'. L'obiettivo politico è categorico: un'Italia Una, Indipendente, Libera e Repubblicana, da edificare tramite l'insurrezione di popolo senza delegare la sovranità a monarchie dinastiche."
      },
      {
        id: "socialista_utopista",
        name: "I Socialisti Utopisti",
        faction: "Europa (1830-48)",
        avatar: "⚙️",
        accentColor: "#e76f51",
        hashtags: ["#Uguaglianza", "#NientePoveri", "#FuturoSolidale", "#DignitàAiLavoratori", "#ComunitàEque"],
        context: "Di fronte alle lacerazioni sociali e all'alienazione prodotte dalla prima Rivoluzione Industriale, teorici come Claude-Henri de Saint-Simon, Charles Fourier e Robert Owen prefigurano la riorganizzazione razionale ed etica dei rapporti di produzione. Rifiutando lo scontro violento di classe, elaborano modelli cooperativi, falansteri e villaggi solidali per armonizzare lavoro, capitale e dignità umana prima della teorizzazione marxiana."
      },
      {
        id: "patriota_francese",
        name: "I Liberali Francesi",
        faction: "Francia (1830)",
        avatar: "🗼",
        accentColor: "#1d3557",
        hashtags: ["#ParigiSiRibella", "#TreGloriose", "#Liberté", "#AlleBarricate", "#Luglio1830"],
        context: "In reazione alle quattro ordinanze liberticide emanate dal governo reazionario del principe di Polignac sotto Carlo X (scioglimento della Camera, soppressione della libertà di stampa, restrizione del censo elettorale), la borghesia liberale e il proletariato parigino insorgono nelle Tre Giornate Gloriose (27-29 luglio 1830). La caduta dei Borboni apre la Monarchia di Luglio di Luigi Filippo d'Orléans, incoronato 're dei francesi per volontà della Nazione'."
      },
      {
        id: "polacco",
        name: "I Patrioti Polacchi",
        faction: "Polonia (1830-31)",
        avatar: "🦅",
        accentColor: "#9d0208",
        hashtags: ["#VivaLaPolonia", "#NoAlzarismo", "#Indipendenza", "#PerLaNostraELaVostraLibertà", "#VarsaviaResiste"],
        context: "Nel novembre 1830 i cadetti dell'esercito polacco e l'intellettualità patriottica di Varsavia insorgono contro il dominio autocratico dello zar Nicola I di Russia, proclamando decaduta la dinastia dei Romanov. Priva del promesso soccorso militare delle potenze liberali occidentali (Francia e Inghilterra), la resistenza polacca viene repressa dall'esercito zarista nel settembre 1831, innescando la celebre 'Grande Emigrazione' culturale verso l'Europa occidentale."
      }
    ]
  },

  reformation_1500: {
    id: "reformation_1500",
    title: "Riforma e Controriforma",
    subtitle: "Fratture Religiose e Riorganizzazione Dottrinale (XVI Secolo)",
    targetClass: "Scuola Secondaria di 2° Grado",
    badge: "✝️ Dispute 1517 - 1563 🏛️",
    description: "I grandi protagonisti della frattura confessionale europea del XVI Secolo: teologi riformatori e padri conciliari della Controriforma a confronto su dogmi, ecclesiologia, grazia divina e rinnovamento disciplinare.",
    scoringMetric: "Valutazione Tripla (Accuratezza Storica ⭐, Creatività 💡, Chiarezza 🗣️)",
    characters: [
      {
        id: "lutero",
        name: "Martin Lutero",
        faction: "Riforma Protestante (Wittenberg)",
        factionType: "reforma",
        avatar: "📜",
        accentColor: "#8b5a2b",
        theses: [
          "Sola Fide & Sola Gratia: La giustificazione dell'uomo scaturisce unicamente dalla grazia divina mediante la fede, rendendo privo di valore il commercio delle indulgenze romane.",
          "Sola Scriptura: L'unica autorità vincolante per la coscienza del credente è la Sacra Scrittura; affermazione del sacerdozio universale di tutti i battezzati contro la mediazione gerarchica ecclesiastica.",
          "Riduzione sacramentale: Validità dottrinale riconosciuta ai soli due sacramenti istituiti direttamente da Cristo nei Vangeli: Battesimo ed Eucarestia (consustanziazione)."
        ],
        hashtags: ["#95Tesi", "#SolaFide", "#NoIndulgenze", "#BibbiaInTedesco", "#Wittenberg1517"],
        rivals: ["Papa Leone X", "Carlo V d'Asburgo", "Papa Paolo III", "Ignazio di Loyola"],
        context: "Monaco agostiniano e professore di teologia all'Università di Wittenberg, nel 1517 affigge le 95 tesi scagliandosi contro la teologia delle indulgenze promossa da Alberto di Hohenzollern. Condannato con la bolla 'Exsurge Domine' (1520) e convocato alla Dieta di Worms (1521), rifiuta di ritrattare ponendo la propria coscienza sotto l'esclusiva autorità delle Scritture e trovando la protezione politica dell'elettore Federico il Saggio di Sassonia."
      },
      {
        id: "calvino",
        name: "Giovanni Calvino",
        faction: "Riforma Riformata (Ginevra)",
        factionType: "reforma",
        avatar: "📖",
        accentColor: "#1d3557",
        theses: [
          "Doppia Predestinazione: Sovranità assoluta ed imperscrutabile di Dio, che ha decretato dall'eternità chi è destinato alla salvezza e chi alla dannazione.",
          "Etica della Vocazione (Beruf): L'attività professionale, l'onestà e il successo mondano non comprano la grazia, ma sono segni visibili e testimonianza della benedizione divina dell'eletto.",
          "Comunità Teocratica: Rigorosa disciplina morale collettiva, subordinazione dell'ordinamento civile ai principi evangelici e rifiuto di ogni mondanità e superstizione liturgica."
        ],
        hashtags: ["#Predestinazione", "#GinevraSanta", "#EticaDelLavoro", "#Ugonotti", "#GloriaADioSolo"],
        rivals: ["Ignazio di Loyola", "Carlo Borromeo", "Papa Paolo III", "Martin Lutero (sulla cena eucaristica)"],
        context: "Umanista e teologo francese fuggito dalla persecuzione cattolica, si stabilisce a Ginevra dove plasma una teocrazia repubblicana fondata sulle Ordinanze Ecclesiastiche (1541) e sul Concistoro. La sua teologia, centrata sulla predestinazione e sulla santificazione del dovere quotidiano, alimenta il dinamismo borghese ed economico in Europa occidentale (Ugonotti in Francia, Puritani in Inghilterra, riformati nei Paesi Bassi)."
      },
      {
        id: "zwingli",
        name: "Huldrych Zwingli",
        faction: "Riforma Elvetica (Zurigo)",
        factionType: "reforma",
        avatar: "⚔️",
        accentColor: "#2a9d8f",
        theses: [
          "Rifiuto radicale dell'iconolatria: Distruzione ed eliminazione totale di immagini sacre, reliquie, organi e altari d'oro per ricondurre il culto all'austera proclamazione della Parola.",
          "Eucarestia come puro Memoriale (Signum): Negazione tanto della transustanziazione cattolica quanto della consustanziazione luterana: il pane e il vino sono meri simboli commemorativi del sacrificio della Croce.",
          "Fusione tra comunità ecclesiale e magistratura civica: La riforma evangelica si attua in simbiosi con l'autogoverno repubblicano dei cantoni svizzeri."
        ],
        hashtags: ["#ZurigoRiformata", "#NoAiSanti", "#EucarestiaSimbolo", "#ChiesaSemplice", "#SoloVangelo"],
        rivals: ["Papa Paolo III", "Martin Lutero (Colloqui di Marburgo 1529)", "Cantoni cattolici della Svizzera centrale"],
        context: "Sacerdote umanista di formazione erasmiana, avvia a Zurigo una riforma ancor più radicale di quella luterana, promuovendo una radicale iconoclastia e rifiutando la presenza reale di Cristo nell'eucarestia. Lo scontro dottrinale con Lutero ai Colloqui di Marburgo (1529) impedisce il fronte unico protestante; Zwingli cadrà in battaglia a Kappel (1531) difendendo la causa riformata contro i cantoni elvetici cattolici."
      },
      {
        id: "loyola",
        name: "Ignazio di Loyola",
        faction: "Controriforma Cattolica (Compagnia di Gesù)",
        factionType: "controriforma",
        avatar: "🛡️",
        accentColor: "#780000",
        theses: [
          "Ad Maiorem Dei Gloriam: Subordinazione di ogni facoltà intellettuale, opera educativa e slancio missionario alla gloria di Dio e alla restaurazione della Chiesa cattolica.",
          "Obbedienza Cieca (Perinde ac cadaver): Disciplina monastico-militare e lealtà assoluta al Sommo Pontefice attraverso il celebre quarto voto di obbedienza al Papa.",
          "Egemonia educativa e pastorale: Creazione di collegi d'eccellenza per la formazione etico-intellettuale delle classi dirigenti europee e riconquista delle terre cadute nell'eresia."
        ],
        hashtags: ["#AdMaioremDeiGloriam", "#Gesuiti", "#DifesaDellaFede", "#EserciziSpirituali", "#MissionariNelMondo"],
        rivals: ["Martin Lutero", "Giovanni Calvino", "Enrico VIII Tudor"],
        context: "Nobile hidalgo basco convertitosi dopo una grave ferita nell'assedio di Pamplona (1521), fonda nel 1534 la Compagnia di Gesù, canonicamente approvata da papa Paolo III nel 1540 con la bolla 'Regimini militantis Ecclesiae'. Caratterizzati da un severo percorso formativo (la Ratio Studiorum), dal quarto voto di obbedienza al pontefice e da uno straordinario fervore missionario (da Francesco Saverio a Matteo Ricci), i Gesuiti divengono l'arma intellettuale e geopolitica primaria della Controriforma."
      },
      {
        id: "borromeo",
        name: "Carlo Borromeo",
        faction: "Riforma Pastorale Cattolica (Milano Tridentina)",
        factionType: "controriforma",
        avatar: "⛪",
        accentColor: "#582f0e",
        theses: [
          "Obbligo di Residenza dei Vescovi: Superamento categorico del beneficiarismo curiale e dell'assenteismo feudale; il vescovo deve risiedere e guidare direttamente la propria diocesi.",
          "Istituzione dei Seminari diocesani: Riforma morale e intellettuale del clero attraverso collegi dedicati alla formazione dottrinale, biblica e liturgica dei sacerdoti.",
          "Carità episcopale e cura animarum: Il pastore deve vigilare sull'ortodossia dei fedeli e immolarsi per il popolo, prestando soccorso materiale e spirituale anche nelle calamità più drammatiche."
        ],
        hashtags: ["#ConcilioDiTrento", "#RiformaDelClero", "#MilanoSanta", "#Seminari", "#CaritàCristiana"],
        rivals: ["Giovanni Calvino", "Clero lassista e corrotto", "Assenteismo curiale"],
        context: "Nipote di papa Pio IV e protagonista della fase conclusiva del Concilio di Trento (1562-1563), diviene arcivescovo di Milano incarnando il modello ideale del vescovo tridentino. Applicando i decreti conciliari con rigore inflessibile, istituisce i primi seminari per il clero, effettua minuziose visite pastorali nelle parrocchie più sperdute ed acquisisce fama imperitura per l'eroica assistenza prestata alla popolazione durante la peste di Milano del 1576-77."
      },
      {
        id: "paolo_terzo",
        name: "Papa Paolo III",
        faction: "Papato Rinascimentale & Concilio di Trento",
        factionType: "controriforma",
        avatar: "👑",
        accentColor: "#a4161a",
        theses: [
          "Dogma cattolico immutabile: Ribaditi irrevocabilmente tutti i 7 Sacramenti istituiti da Cristo, il valore delle buone opere accanto alla grazia divina, e il primato petrino del Vescovo di Roma.",
          "Convocazione a Trento: Scelta geopolitica di una città imperiale e bilingue tra mondo germanico e Roma, concepita per ricucire la frattura senza cedere sui fondamenti teologici della Tradizione apostolica.",
          "Rinnovamento disciplinare verticistico: Repressione dell'eresia tramite l'Inquisizione romana unita alla restaurazione della dignità e del rigore della Curia papale."
        ],
        hashtags: ["#ConcilioDiTrento1545", "#PrimatoPapale", "#SetteSacramenti", "#RomaCattolica", "#FedeETradizione"],
        rivals: ["Martin Lutero", "Giovanni Calvino", "Principi protestanti della Lega di Smalcalda", "Enrico VIII d'Inghilterra"],
        context: "Alessandro Farnese, pontefice di grande raffinatezza umanistica e consumata abilità diplomatica, seppe superare le esitazioni curiali aprendo nel dicembre 1545 il Concilio di Trento. Durante il suo pontificato promosse l'approvazione della Compagnia di Gesù (1540), riorganizzò l'Inquisizione romana affidandola al cardinal Carafa (1542) e incaricò Michelangelo di affrescare il Giudizio Universale nella Cappella Sistina, delineando il profilo della Chiesa moderna tra maestà monumentale e rigore dottrinale."
      }
    ]
  }
};

if (typeof module !== 'undefined') {
  module.exports = { HISTORY_MODES };
}
