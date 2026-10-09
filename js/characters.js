/**
 * HistoryGram - Database Storico Didattico Ufficiale
 * Modalità 1: Revolution Influencer (Moti '800 - Terza Media)
 * Modalità 2: Riforma vs Controriforma (XVI Secolo - Seconda Media)
 */

const HISTORY_MODES = {
  revolution_1800: {
    id: "revolution_1800",
    title: "Revolution Influencer",
    subtitle: "Like alla Libertà!",
    targetClass: "Terza Media",
    badge: "🇮🇹 Moti 1820 - 1848 🇫🇷",
    description: "I gruppi rappresentano un team influencer dell'Ottocento: trasformano proclami e idee storiche in slogan virali e hashtag. Ogni like vale 1 follower. Vince chi guida l'opinione pubblica!",
    scoringMetric: "Follower (1 Like = 1 Follower + Bonus Merito Docente)",
    characters: [
      {
        id: "carbonaro",
        name: "Il Carbonaro",
        faction: "Italia (1820-21)",
        avatar: "🕯️",
        accentColor: "#2b2d42",
        objective: "Libertà politica, concessione della Costituzione e indipendenza dall'Austria.",
        tools: "Società segrete, rituali simbolici, propaganda clandestina, lettere cifrate.",
        slogans: [
          "La libertà si accende nell'ombra.",
          "Niente catene per i popoli liberi!",
          "Dalla vendita del carbone al riscatto della Patria."
        ],
        hashtags: ["#CostituzioneOra", "#UnitiperlaPatria", "#Moti1821", "#SocietàSegreta", "#FuoriLoStraniero"],
        context: "Nel 1820-21 a Napoli e in Piemonte scoppiano le prime insurrezioni per ottenere la Costituzione di Spagna. I carbonari operano in segreto con formule simboliche."
      },
      {
        id: "patriota_greco",
        name: "Il Patriota Greco",
        faction: "Grecia (1821-29)",
        avatar: "🏛️",
        accentColor: "#0077b6",
        objective: "Indipendenza nazionale dall'Impero Ottomano, rinascita dell'antica civiltà greca, difesa della fede.",
        tools: "Epopee eroiche, canti popolari, appelli e sostegno degli intellettuali europei (Filellenismo).",
        slogans: [
          "Meglio morire da liberi che vivere da schiavi.",
          "L'antica Grecia risorge dal sangue dei suoi martiri!",
          "Europa, ascolta il grido della culla della libertà!"
        ],
        hashtags: ["#VivaLaGrecia", "#LibertàOltremare", "#EroiDellaPatria", "#Filellenismo", "#LibertàOMorte"],
        context: "L'insurrezione contro l'Impero Ottomano mobilitò volontari e poeti da tutta Europa (incluso Lord Byron). Nel 1829 la Grecia conquistò la piena indipendenza."
      },
      {
        id: "liberale_spagnolo",
        name: "Il Liberale Spagnolo",
        faction: "Spagna (1820)",
        avatar: "📜",
        accentColor: "#d90429",
        objective: "Monarchia costituzionale, diritti dei cittadini, ripristino della Costituzione di Cadice del 1812.",
        tools: "Insurrezioni militari (pronunciamiento di Rafael del Riego), circoli patriottici.",
        slogans: [
          "Nessun re senza Costituzione.",
          "La sovranità risiede nella Nazione, non nel despota!",
          "Cadice è viva: la legge appartiene al popolo."
        ],
        hashtags: ["#VivaLaConstitucion", "#LibertadYPatria", "#NoAssolutismo", "#Cadice1812", "#Pronunciamiento"],
        context: "Nel porto di Cadice, le truppe pronte a partire per le Americhe si ribellano guidate da Del Riego. Il re Ferdinando VII è costretto a ripristinare la Costituzione."
      },
      {
        id: "mazziniano",
        name: "Il Mazziniano",
        faction: "Italia (anni '30-'40)",
        avatar: "🔥",
        accentColor: "#2d6a4f",
        objective: "Un'Italia Una, Indipendente, Libera e Repubblicana.",
        tools: "La 'Giovine Italia', manifesti pubblici, educazione popolare, insurrezioni popolari coordinate.",
        slogans: [
          "Dio e Popolo: l'Italia nascerà libera!",
          "Pensiero e Azione: non basta sognare, bisogna insorgere!",
          "Né re né principi: la sovranità appartiene a tutto il popolo."
        ],
        hashtags: ["#GiovineItalia", "#UnitiSiVince", "#FuturoRepubblicano", "#PensieroEAzione", "#ItaliaLibera"],
        context: "Giuseppe Mazzini supera i limiti del segreto della Carboneria: il programma politico deve essere pubblico, condiviso ed educare le masse alla Repubblica."
      },
      {
        id: "socialista_utopista",
        name: "Il Socialista Utopista",
        faction: "Europa (1830-40)",
        avatar: "⚙️",
        accentColor: "#e76f51",
        objective: "Uguaglianza, diritti dei lavoratori, solidarietà sociale e cooperazione tra produttori.",
        tools: "Pamphlet, comunità modello (Fourier, Owen), giornali operai, diffusione tra i lavoratori.",
        slogans: [
          "Un mondo nuovo è possibile.",
          "Il lavoro deve arricchire l'uomo, non schiavizzarlo!",
          "Solidarietà e giustizia per chi produce la ricchezza del mondo."
        ],
        hashtags: ["#Uguaglianza", "#NientePoveri", "#FuturoSolidale", "#DignitàAiLavoratori", "#ComunitàEque"],
        context: "Con la Rivoluzione Industriale e la nascita della classe operaia, i primi socialisti teorizzano una società senza sfruttamento basata su cooperative e armonia."
      },
      {
        id: "patriota_francese",
        name: "Il Patriota Francese",
        faction: "Francia (1830)",
        avatar: "🗼",
        accentColor: "#1d3557",
        objective: "Difendere le libertà conquistate contro l'assolutismo reazionario di re Carlo X.",
        tools: "Barricate a Parigi, giornali rivoluzionari, alleanza tra borghesi, studenti e operai (Tre Gloriose).",
        slogans: [
          "Alle barricate per la libertà!",
          "Parigi non si piega a nessun sovrano despota!",
          "Il tricolore torna a sventolare sulle torri di Parigi!"
        ],
        hashtags: ["#ParigiSiRibella", "#TreGloriose", "#Liberté", "#AlleBarricate", "#Luglio1830"],
        context: "Nelle Tre Giornate Gloriose (27-29 luglio 1830) il popolo parigino erige barricate contro i decreti liberticidi del re. Carlo X abdica e nasce la monarchia borghese."
      },
      {
        id: "polacco",
        name: "Il Polacco",
        faction: "Polonia (1830-31)",
        avatar: "🦅",
        accentColor: "#9d0208",
        objective: "Indipendenza nazionale dalla Russia zarista e libertà per la nazione polacca.",
        tools: "Insurrezioni militari, comizi patriottici, appelli disperati agli intellettuali e governi d'Europa.",
        slogans: [
          "Un popolo senza libertà è un popolo senza vita.",
          "Per la nostra e la vostra libertà!",
          "Varsavia combatte per la dignità di tutti i popoli oppressi."
        ],
        hashtags: ["#VivaLaPolonia", "#NoAlzarismo", "#Indipendenza", "#PerLaNostraELaVostraLibertà", "#VarsaviaResiste"],
        context: "Nel novembre 1830 i cadetti di Varsavia insorgono contro lo zar. La Polonia resiste per mesi confidando nell'aiuto europeo, prima della dura repressione russa."
      }
    ]
  },

  reformation_1500: {
    id: "reformation_1500",
    title: "Influencer del XVI Secolo",
    subtitle: "Riforma vs Controriforma (Flame del '500)",
    targetClass: "Seconda Media",
    badge: "✝️ Dispute 1517 - 1563 🏛️",
    description: "Scegli un protagonista del Cinquecento: pubblica post tesi con le idee dottrinali chiave e commenta/sfida i post degli avversari con argomentazioni storiche corrette. Votazione finale su Accuratezza, Creatività e Chiarezza!",
    scoringMetric: "Valutazione Tripla (Accuratezza Storica ⭐, Creatività 💡, Chiarezza 🗣️)",
    characters: [
      {
        id: "lutero",
        name: "Martin Lutero",
        faction: "Riforma Protestante (Germania)",
        factionType: "reforma",
        avatar: "📜",
        accentColor: "#8b5a2b",
        objective: "Riformare la Chiesa: condanna della vendita delle indulgenze, ritorno alla Bibbia, salvezza per sola fede.",
        tools: "Le 95 Tesi, traduzione della Bibbia in volgare tedesco, torchio da stampa, inni sacri popolari.",
        theses: [
          "Sola Fide: La salvezza dell'anima è un dono gratuito della grazia di Dio, non si compra a Roma con l'oro.",
          "Sola Scriptura: La Bibbia è l'unica autorità per il cristiano; ogni credente è sacerdote (sacerdozio universale).",
          "Solo 2 Sacramenti: Validi solo Battesimo ed Eucarestia, gli unici istituiti direttamente nel Vangelo."
        ],
        slogans: [
          "La grazia di Dio non si vende al mercato di San Pietro!",
          "La Parola di Dio deve parlare la lingua del popolo, non solo il latino dei prelati.",
          "La mia coscienza è prigioniera della Parola di Dio: qui sto, non posso fare altrimenti."
        ],
        hashtags: ["#95Tesi", "#SolaFide", "#NoIndulgenze", "#BibbiaInTedesco", "#Wittenberg1517"],
        rivals: ["Papa Leone X", "Carlo V", "Ignazio di Loyola", "Paolo III"],
        context: "Monaco agostiniano tedesco, nel 1517 affigge le 95 Tesi alla porta della cattedrale di Wittenberg, innescando la frattura religiosa della cristianità europea."
      },
      {
        id: "calvino",
        name: "Giovanni Calvino",
        faction: "Riforma Riformata (Ginevra)",
        factionType: "reforma",
        avatar: "📖",
        accentColor: "#1d3557",
        objective: "Costruire a Ginevra la città di Dio: rigorosa moralità, sovranità assoluta di Dio, dovere del lavoro quotidiano.",
        tools: "Istituzione della religione cristiana (trattato), governo concistoriale a Ginevra, accademia di predicatori (Ugonotti).",
        theses: [
          "Doppia Predestinazione: Solo Dio ha già deciso chi è eletto alla salvezza eterna.",
          "Etica del Lavoro: Il successo professionale e l'impegno costante sono il segno visibile della benedizione divina.",
          "Sobrietà e Disciplina: Rifiuto assoluto di ogni lusso, gioco d'azzardo e vanità mondana."
        ],
        slogans: [
          "Il lavoro instancabile è la lode più gradita a Dio.",
          "Ginevra santa: disciplina nei fatti, non chiacchiere ipocrite.",
          "Sia fatta la sovrana volontà di Dio in ogni istante della nostra vita."
        ],
        hashtags: ["#Predestinazione", "#GinevraSanta", "#EticaDelLavoro", "#Ugonotti", "#GloriaADioSolo"],
        rivals: ["Ignazio di Loyola", "Carlo Borromeo", "Papa Paolo III", "Lutero (sulla cena eucaristica)"],
        context: "Teologo francese attivo a Ginevra, organizza una comunità religiosa rigorosa. La sua dottrina valorizza la vocazione nel lavoro e si diffonde in Francia, Scozia e Paesi Bassi."
      },
      {
        id: "zwingli",
        name: "Huldrych Zwingli",
        faction: "Riforma Svizzera (Zurigo)",
        factionType: "reforma",
        avatar: "⚔️",
        accentColor: "#2a9d8f",
        objective: "Riforma radicale a Zurigo: rimozione di statue, reliquie e dipinti; eucarestia solo come rito simbolico commemorativo.",
        tools: "Dispute pubbliche cittadine davanti ai magistrati di Zurigo, predicazione dal pulpito, opuscoli popolari.",
        theses: [
          "Basta Idolatria: Nessun culto dei santi, nessuna statua o quadro nelle chiese: solo la pura predicazione.",
          "Cena Simbolica: Il pane e il vino sono solo un 'memoriale' spirituale, Cristo non è presente fisicamente nella materia.",
          "Comunità Evangelica: Collaborazione stretta tra fede e magistratura civica per una città pura."
        ],
        slogans: [
          "Basta idoli dorati: solo Cristo deve regnare nel tempio!",
          "Non adorare la materia terrena: adora il Cristo nei cieli!",
          "Fede trasparente, nessun patto con la corruzione di Roma."
        ],
        hashtags: ["#ZurigoRiformata", "#NoAiSanti", "#EucarestiaSimbolo", "#ChiesaSemplice", "#SoloVangelo"],
        rivals: ["Papa Paolo III", "Martin Lutero (Colloqui di Marburgo)", "Cantoni cattolici svizzeri"],
        context: "Sacerdote e umanista svizzero a Zurigo, applica una riforma radicale priva di immagini sacre. Morì sul campo di battaglia a Kappel (1531) difendendo la sua fede."
      },
      {
        id: "loyola",
        name: "Ignazio di Loyola",
        faction: "Controriforma Cattolica (Gesuiti)",
        factionType: "controriforma",
        avatar: "🛡️",
        accentColor: "#780000",
        objective: "Difendere la Chiesa e il Vicario di Cristo con disciplina militare, formare le nuove generazioni ed evangelizzare il mondo.",
        tools: "Compagnia di Gesù (Gesuiti), Esercizi Spirituali, quarto voto di obbedienza cieca al Papa, collegi d'eccellenza, missioni in Asia e America.",
        theses: [
          "Ad Maiorem Dei Gloriam: Tutto ciò che facciamo deve glorificare la Chiesa e difendere la vera fede cattolica.",
          "Obbedienza Cieca (Perinde ac cadaver): Disciplina e lealtà assoluta al Sommo Pontefice per sconfiggere l'anarchia eretica.",
          "Educazione e Missione: Collegi rigorosi per formare le menti e viaggi fino ai confini della terra per salvare le anime."
        ],
        slogans: [
          "Soldati di Cristo per la difesa della fede cattolica!",
          "Se la Chiesa dice che il bianco è nero, io crederò che è nero.",
          "Ad Maiorem Dei Gloriam: nessuna frontiera fermerà i soldati del Vangelo."
        ],
        hashtags: ["#AdMaioremDeiGloriam", "#Gesuiti", "#DifesaDellaFede", "#EserciziSpirituali", "#MissionariNelMondo"],
        rivals: ["Martin Lutero", "Giovanni Calvino", "Enrico VIII d'Inghilterra"],
        context: "Nobile cavaliere basco convertitosi dopo una grave ferita in battaglia, fonda nel 1540 la Compagnia di Gesù, ordine colto e disciplinato che divenne il baluardo della Controriforma."
      },
      {
        id: "borromeo",
        name: "Carlo Borromeo",
        faction: "Riforma Cattolica / Concilio di Trento",
        factionType: "controriforma",
        avatar: "⛪",
        accentColor: "#582f0e",
        objective: "Applicare i decreti di Trento: moralizzare il clero, aprire seminari per sacerdoti colti e pii, servire i poveri e gli appestati.",
        tools: "Visite pastorali capillari in ogni parrocchia, fondazione di seminari diocesani, carità instancabile durante le epidemie, sinodi.",
        theses: [
          "I Vescovi devono risiedere nella diocesi: stop ai prelati assenteisti, ai lussi di corte e al nepotismo.",
          "Seminari obbligatori: i sacerdoti devono studiare, conoscere le Scritture e vivere in castità e santità.",
          "Carità operosa: Il pastore dona la vita per il suo popolo anche durante la peste più atroce."
        ],
        slogans: [
          "Il buon pastore non abbandona mai il suo gregge nella tempesta.",
          "Studio, rigore e pietà: la Chiesa rinasce dalla santità dei suoi sacerdoti.",
          "Il Concilio di Trento non è una pergamena: è la vita rinnovata della Chiesa!"
        ],
        hashtags: ["#ConcilioDiTrento", "#RiformaDelClero", "#MilanoSanta", "#Seminari", "#CaritàCristiana"],
        rivals: ["Giovanni Calvino", "Corruzione curiale", "Clero lassista"],
        context: "Arcivescovo di Milano e nipote del Papa, incarna il vescovo modello post-tridentino: instancabile pastore, organizzatore di seminari e celebre per aver assistito gli appestati nel 1576."
      },
      {
        id: "paolo_terzo",
        name: "Papa Paolo III",
        faction: "Papato / Controriforma",
        factionType: "controriforma",
        avatar: "👑",
        accentColor: "#a4161a",
        objective: "Convocare il Concilio di Trento per chiarire i dogmi cattolici, approvare i Gesuiti e difendere l'unità della fede cristiana.",
        tools: "Bolla di apertura del Concilio di Trento (1545), approvazione della Compagnia di Gesù (1540), Santo Uffizio dell'Inquisizione, mecenatismo.",
        theses: [
          "Dottrina Immutabile: Riconfermati tutti i 7 Sacramenti, il primato papale e il valore meritorio delle buone opere.",
          "Trento come Ponte: Una città imperiale tra Roma e il mondo germanico per rispondere agli errori dei novatori.",
          "Unità nella Verità: Nessun compromesso sulla dottrina tramandata dagli Apostoli."
        ],
        slogans: [
          "Trento risponderà con la verità millenaria della Chiesa.",
          "Un solo gregge, un solo pastore: Roma non baratta la Verità.",
          "Rinnovamento morale e fedeltà eterna ai dogmi apostolici."
        ],
        hashtags: ["#ConcilioDiTrento1545", "#PrimatoPapale", "#SetteSacramenti", "#RomaCattolica", "#FedeETradizione"],
        rivals: ["Martin Lutero", "Giovanni Calvino", "Enrico VIII", "Principi protestanti tedeschi"],
        context: "Alessandro Farnese, pontefice colto e grande diplomatico, aprì nel 1545 il Concilio di Trento, avviando la grande risposta dottrinale e disciplinare della Chiesa alla Riforma."
      }
    ]
  }
};

if (typeof module !== 'undefined') {
  module.exports = { HISTORY_MODES };
}
