/**
 * HistoryGram - Application Core Logic
 * Ecosistema Prof. Memmo - Conforme Regole Operative v2.1
 * Architettura Multi-View (Stile L'Oratore) & Gestione Classi/Squadre (Stile Fantaletteratura)
 */

(function () {
  'use strict';

  const AppState = {
    currentView: 'view-welcome',
    currentMode: 'revolution_1800',
    currentClassId: 'classe_3b',
    currentClassCode: '3B',
    isTeacherUnlocked: false,
    teacherUser: null,
    unsubscribeSession: null,
    currentClassStudents: [
      "Sara", "Marco", "Luca", "Giulia", "Matteo", "Chiara",
      "Andrea", "Francesca", "Davide", "Elena", "Federico", "Sofia",
      "Simone", "Martina", "Lorenzo", "Alessia", "Gabriele", "Valentina"
    ],
    selectedSetupFactionId: null,
    sessionData: {
      teamAssignments: {},
      pendingPosts: [],
      approvedPosts: [],
      scores: {}
    },
    localVoterId: 'voter_' + Math.random().toString(36).substring(2, 9),
    activeFlameTargetPostId: null,
    selectedCharModalId: null
  };

  const DOM = {
    // Header & User Dropdown
    btnLogoHome: document.getElementById('btnLogoHome'),
    headerUserTrigger: document.getElementById('user-menu-trigger'),
    userDropdown: document.getElementById('user-dropdown'),
    headerUserName: document.getElementById('header-user-name'),
    headerUserRole: document.getElementById('header-user-role'),
    headerUserAvatar: document.getElementById('header-user-avatar'),
    dropdownUserName: document.getElementById('dropdown-user-name'),
    dropdownUserRoleSub: document.getElementById('dropdown-user-role-sub'),
    btnLoginHubDropdown: document.getElementById('btn-login-hub-dropdown'),

    // Views
    views: document.querySelectorAll('.view'),
    bottomNav: document.querySelector('.bottom-bar'),
    tabItems: document.querySelectorAll('.bottom-bar .tab-item'),
    navItemApprovazione: document.getElementById('nav-item-approvazione'),
    navItemAdmin: document.getElementById('nav-item-admin'),

    // Setup Flow
    setupSelectClass: document.getElementById('setupSelectClass'),
    setupSelectedModeLabel: document.getElementById('setupSelectedModeLabel'),
    pawnsGridContainer: document.getElementById('pawnsGridContainer'),
    setupActiveFactionWorkbench: document.getElementById('setupActiveFactionWorkbench'),
    setupRosterSummaryStatus: document.getElementById('setupRosterSummaryStatus'),
    btnLaunchGame: document.getElementById('btnLaunchGame'),

    // Game View - Banner & Stats
    bannerSubtag: document.getElementById('bannerSubtag'),
    bannerHeading: document.getElementById('bannerHeading'),
    bannerDescription: document.getElementById('bannerDescription'),
    statFollowersTotal: document.getElementById('statFollowersTotal'),
    statApprovedPostsTotal: document.getElementById('statApprovedPostsTotal'),

    // Stories & Feed
    storiesList: document.getElementById('storiesList'),
    feedStream: document.getElementById('feedStream'),
    emptyFeedState: document.getElementById('emptyFeedState'),
    feedPostsCount: document.getElementById('feedPostsCount'),
    btnRefreshFeed: document.getElementById('btnRefreshFeed'),
    btnOpenCreatePost: document.getElementById('btnOpenCreatePost'),

    // Sidebar Leaderboard
    podiumWrap: document.getElementById('podiumWrap'),
    leaderboardTableBody: document.getElementById('leaderboardTableBody'),
    leaderboardMetricInfo: document.getElementById('leaderboardMetricInfo'),
    lbMetricColumnTitle: document.getElementById('lbMetricColumnTitle'),
    evaluationRulesList: document.getElementById('evaluationRulesList'),

    // Teacher View Dedicated
    viewTeacherPinAuth: document.getElementById('viewTeacherPinAuth'),
    viewTeacherWorkArea: document.getElementById('viewTeacherWorkArea'),
    inputViewTeacherPin: document.getElementById('inputViewTeacherPin'),
    viewTQueueCount: document.getElementById('viewTQueueCount'),
    viewTeacherQueueList: document.getElementById('viewTeacherQueueList'),
    viewTeacherTeamsGrid: document.getElementById('viewTeacherTeamsGrid'),
    viewSettingClassCode: document.getElementById('viewSettingClassCode'),
    tabDocenteQueue: document.getElementById('tabDocenteQueue'),
    tabDocenteTeams: document.getElementById('tabDocenteTeams'),
    tabDocenteSettings: document.getElementById('tabDocenteSettings'),
    btnTabQueue: document.getElementById('btnTabQueue'),
    btnTabTeams: document.getElementById('btnTabTeams'),
    btnTabSettings: document.getElementById('btnTabSettings'),

    // Modal Crea Post
    modalCreatePost: document.getElementById('modalCreatePost'),
    btnCloseCreateModal: document.getElementById('btnCloseCreateModal'),
    formCreatePost: document.getElementById('formCreatePost'),
    selectCharacter: document.getElementById('selectCharacter'),
    inputGroupName: document.getElementById('inputGroupName'),
    inputSlogan: document.getElementById('inputSlogan'),
    inputText: document.getElementById('inputText'),
    inputHashtags: document.getElementById('inputHashtags'),
    charCounter: document.getElementById('charCounter'),
    slogansChips: document.getElementById('slogansChips'),
    hashtagsChips: document.getElementById('hashtagsChips'),
    prevAvatar: document.getElementById('prevAvatar'),
    prevCharName: document.getElementById('prevCharName'),
    prevGroupName: document.getElementById('prevGroupName'),
    prevBanner: document.getElementById('prevBanner'),
    prevSlogan: document.getElementById('prevSlogan'),
    prevText: document.getElementById('prevText'),
    prevTags: document.getElementById('prevTags'),

    // Modal Scheda Personaggio
    modalCharDetail: document.getElementById('modalCharDetail'),
    btnCloseCharModal: document.getElementById('btnCloseCharModal'),
    mCharAvatar: document.getElementById('mCharAvatar'),
    mCharName: document.getElementById('mCharName'),
    mCharFaction: document.getElementById('mCharFaction'),
    mCharBody: document.getElementById('mCharBody'),
    btnSelectCharFromModal: document.getElementById('btnSelectCharFromModal'),

    // Modal Flame
    modalFlameComment: document.getElementById('modalFlameComment'),
    btnCloseCommentModal: document.getElementById('btnCloseCommentModal'),
    commentTargetQuote: document.getElementById('commentTargetQuote'),
    formAddComment: document.getElementById('formAddComment'),
    selectCommentChar: document.getElementById('selectCommentChar'),
    inputCommentAuthor: document.getElementById('inputCommentAuthor'),
    inputCommentText: document.getElementById('inputCommentText'),

    // Modal Miniguida
    modalMiniguida: document.getElementById('modalMiniguida'),

    toastContainer: document.getElementById('toastContainer')
  };

  /* ================= INIZIALIZZAZIONE ================= */
  function init() {
    // 1. Parametri URL (es. ?class=3B&mode=revolution_1800&view=game)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('class')) {
      AppState.currentClassCode = urlParams.get('class').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      AppState.currentClassId = 'classe_' + AppState.currentClassCode.toLowerCase();
    }
    if (urlParams.get('mode') && HISTORY_MODES[urlParams.get('mode')]) {
      AppState.currentMode = urlParams.get('mode');
    }
    if (urlParams.get('view')) {
      const v = 'view-' + urlParams.get('view');
      if (document.getElementById(v)) AppState.currentView = v;
    }

    if (DOM.viewSettingClassCode) DOM.viewSettingClassCode.value = AppState.currentClassCode;

    // 2. Controllo SSO Profilo Utente
    checkSSOUser();

    // 3. Audio Engine Init
    if (window.AudioEngine) {
      window.AudioEngine.init();
    }

    // 4. Setup Eventi & Interfaccia
    bindEvents();
    renderModeUI();
    connectSession();

    // 5. Imposta Vista Iniziale
    const initHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
    if (initHash && document.getElementById('view-' + initHash)) {
      AppState.currentView = 'view-' + initHash;
    }
    showView(AppState.currentView, false);

    // Gestione popstate (tasto indietro/avanti)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        showView(e.state.view, false);
      } else {
        const hash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
        if (hash && document.getElementById('view-' + hash)) {
          showView('view-' + hash, false);
        } else {
          showView('view-welcome', false);
        }
      }
    });

    console.log("HistoryGram v2.0 inizializzato con successo: Multi-View SPA & Flusso Fantaletteratura.");
  }

  /* ================= RUOLO DOCENTE & VISIBILITA APPROVAZIONE ================= */
  function isTeacherUser() {
    if (AppState.isTeacherUnlocked) return true;
    const ssoRole = (localStorage.getItem('hub_user_role') || '').toLowerCase();
    if (ssoRole === 'docente' || ssoRole === 'admin') return true;
    if (ssoRole === 'studente') return false;
    if (AppState.teacherUser) return true;
    const headerRole = (DOM.headerUserRole ? DOM.headerUserRole.textContent : '').toUpperCase();
    if (headerRole.includes('AMMINISTRATORE') || headerRole.includes('DOCENTE')) return true;
    return false;
  }

  function isSuperAdminUser() {
    if (window.HistoryGramRulesService && typeof window.HistoryGramRulesService.isSuperAdmin === 'function') {
      if (window.HistoryGramRulesService.isSuperAdmin()) return true;
    }
    if (AppState.teacherUser && AppState.teacherUser.email && AppState.teacherUser.email.toLowerCase() === 'prof.memmo@gmail.com') {
      return true;
    }
    try {
      const candidates = ['currentUser', 'user', 'teacherUser', 'hub_user', 'eroi_user_profile', 'userProfile'];
      for (const k of candidates) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed) {
            if (typeof parsed.email === 'string' && parsed.email.toLowerCase() === 'prof.memmo@gmail.com') {
              return true;
            }
            if (parsed.role === 'admin' || parsed.name === 'Prof. Memmo') {
              return true;
            }
          }
        }
      }
    } catch(e) {}
    if (localStorage.getItem('adminLoggedIn') === 'true') return true;
    return false;
  }

  function updateTeacherNavVisibility() {
    const navItem = DOM.navItemApprovazione || document.getElementById('nav-item-approvazione');
    if (navItem) {
      if (isTeacherUser()) {
        navItem.classList.remove('hidden');
      } else {
        navItem.classList.add('hidden');
      }
    }

    const adminNav = (DOM && DOM.navItemAdmin) || document.getElementById('nav-item-admin');
    if (adminNav) {
      if (isSuperAdminUser()) {
        adminNav.classList.remove('hidden');
      } else {
        adminNav.classList.add('hidden');
      }
    }
  }

  /* ================= GESTIONE VISTE (MULTI-VIEW SPA) ================= */
  function showView(viewId, pushHistory = true) {
    if (!document.getElementById(viewId)) return;

    // Guardia di accesso: Pannello Super-Admin riservato esclusivamente a prof.memmo@gmail.com
    if (viewId === 'view-admin' && !isSuperAdminUser()) {
      showToast("⛔ Accesso riservato esclusivamente al Super-Admin (prof.memmo@gmail.com).", "toast-danger");
      return;
    }

    // Guardia di accesso: il pannello Approvazione/Docente è riservato esclusivamente al docente
    if (viewId === 'view-docente' && !isTeacherUser()) {
      showToast("⛔ Accesso riservato esclusivamente al docente.", "toast-danger");
      return;
    }

    // Nascondi tutte le viste
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Attiva la vista target
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      AppState.currentView = viewId;
    }

    // Aggiorna la tab attiva nella bottom bar
    document.querySelectorAll('.bottom-bar .tab-item').forEach(tab => {
      if (tab.getAttribute('data-view') === viewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Se entriamo nella Cattedra Docente / Approvazione, aggiorna i dati
    if (viewId === 'view-docente') {
      renderTeacherView();
    }
    if (viewId === 'view-setup-class') {
      document.body.classList.add('view-no-scroll');
      renderSetupClassView();
    } else {
      document.body.classList.remove('view-no-scroll');
    }

    // Rendering dinamico per Regolamento e Super-Admin
    if (viewId === 'view-regolamento') {
      if (window.HistoryGramRulesService) {
        window.HistoryGramRulesService.renderPublicView('view-regolamento-container');
      }
    }
    if (viewId === 'view-admin') {
      if (window.HistoryGramRulesService) {
        window.HistoryGramRulesService.renderAdminEditor('historygram-rules-editor-container');
      }
    }

    // Scroll verso l'alto
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Aggiorna la history del browser
    if (pushHistory) {
      const hash = viewId.replace('view-', '');
      window.history.pushState({ view: viewId }, '', '#' + hash);
    }
  }

  /* ================= FLUSSO DI SETUP (STILE L'ORATORE & OPS! STORIA) ================= */
  function startSetupFlow() {
    showView('view-setup-mode');
  }

  async function persistSessionAsync() {
    if (!AppState.sessionData) {
      AppState.sessionData = {};
    }
    AppState.sessionData.classId = AppState.currentClassId;
    AppState.sessionData.modeId = AppState.currentMode;
    AppState.sessionData.updatedAt = new Date().toISOString();

    if (window.HistoryGramService) {
      try {
        await window.HistoryGramService.saveSession(
          AppState.currentClassId,
          AppState.currentMode,
          AppState.sessionData
        );
      } catch (err) {
        console.warn("⚠️ Salvataggio persistente non riuscito:", err);
      }
    }
  }

  async function selectSetupMode(modeId) {
    if (!HISTORY_MODES[modeId]) return;
    AppState.currentMode = modeId;
    renderModeUI();

    // Aggiorna etichetta modalità nel passo 2
    if (DOM.setupSelectedModeLabel) {
      DOM.setupSelectedModeLabel.textContent = HISTORY_MODES[modeId].title;
    }

    const characters = HISTORY_MODES[modeId].characters;
    AppState.selectedSetupFactionId = characters[0] ? characters[0].id : null;

    // Disconnette eventuali listener attivi durante il setup: il docente ha controllo esclusivo e reattivo
    if (AppState.unsubscribeSession) {
      AppState.unsubscribeSession();
      AppState.unsubscribeSession = null;
    }

    await renderSetupClassView();
    showView('view-setup-class');
  }

  async function renderSetupClassView() {
    if (!DOM.setupSelectClass || !DOM.pawnsGridContainer) return;

    // Assicura subito la selezione fazione e renderizza immediatamente le card per zero latenza
    const charsInit = HISTORY_MODES[AppState.currentMode].characters;
    if (!AppState.selectedSetupFactionId || !charsInit.some(c => c.id === AppState.selectedSetupFactionId)) {
      AppState.selectedSetupFactionId = charsInit[0] ? charsInit[0].id : null;
    }
    renderPawnsGrid();
    renderFactionWorkbench(AppState.selectedSetupFactionId);

    // Carica classi del docente
    DOM.setupSelectClass.innerHTML = '<option value="">Caricamento classi...</option>';
    let classes = [];
    if (window.HistoryGramService) {
      classes = await window.HistoryGramService.getTeacherClasses(AppState.teacherUser || (window.fbAuth && window.fbAuth.currentUser));
    }

    if (classes && classes.length > 0) {
      const hasCurrent = classes.some(c => c.id === AppState.currentClassId || (c.code && c.code === AppState.currentClassCode));
      if (!hasCurrent && classes[0]) {
        AppState.currentClassId = classes[0].id;
        AppState.currentClassCode = (classes[0].code || classes[0].classCode || classes[0].id).toUpperCase();
      }
    }

    DOM.setupSelectClass.innerHTML = '';
    classes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name || c.id} (Codice: ${c.code || c.id})`;
      if (c.code === AppState.currentClassCode || c.id === AppState.currentClassId) {
        opt.selected = true;
      }
      DOM.setupSelectClass.appendChild(opt);
    });

    // Aggiungi opzione per nuova classe libera rapida
    const optCustom = document.createElement('option');
    optCustom.value = 'custom';
    optCustom.textContent = '➕ Inserisci un nuovo codice classe...';
    DOM.setupSelectClass.appendChild(optCustom);

    // Carica eventuale sessione esistente da Firestore o LocalStorage
    if (window.HistoryGramService) {
      try {
        const existingSession = await window.HistoryGramService.getSession(AppState.currentClassId, AppState.currentMode);
        if (existingSession && existingSession.teamAssignments && Object.keys(existingSession.teamAssignments).length > 0) {
          AppState.sessionData = existingSession;
        }
      } catch (e) {}
    }

    // Carica studenti della classe selezionata
    loadStudentsForCurrentClass(classes);

    // Assicura che una fazione sia attiva
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    if (!AppState.selectedSetupFactionId || !chars.some(c => c.id === AppState.selectedSetupFactionId)) {
      AppState.selectedSetupFactionId = chars[0] ? chars[0].id : null;
    }

    renderPawnsGrid();
    renderFactionWorkbench(AppState.selectedSetupFactionId);
    updateSetupSummary();
  }

  function loadStudentsForCurrentClass(classes) {
    if (!Array.isArray(classes)) return;
    const currentCls = classes.find(c => c.id === AppState.currentClassId || c.code === AppState.currentClassCode);
    if (currentCls) {
      const extractName = s => {
        if (typeof s === 'string') return s;
        if (!s) return 'Studente';
        if (s.anagrafica) {
          const n = s.anagrafica.nome || '';
          const c = s.anagrafica.cognome || '';
          const full = `${n} ${c}`.trim();
          if (full) return full;
        }
        if (s.nome || s.cognome) {
          const full = `${s.nome || ''} ${s.cognome || ''}`.trim();
          if (full) return full;
        }
        return s.displayName || s.name || s.nickname || (s.email ? s.email.split('@')[0] : '') || s.id || 'Studente';
      };

      if (Array.isArray(currentCls.students) && currentCls.students.length > 0) {
        AppState.currentClassStudents = currentCls.students.map(extractName);
        return;
      }
      if (Array.isArray(currentCls.studenti) && currentCls.studenti.length > 0) {
        AppState.currentClassStudents = currentCls.studenti.map(extractName);
        return;
      }
      if (Array.isArray(currentCls.studentNames) && currentCls.studentNames.length > 0) {
        AppState.currentClassStudents = currentCls.studentNames.map(extractName);
        return;
      }
      if (Array.isArray(currentCls.members) && currentCls.members.length > 0) {
        AppState.currentClassStudents = currentCls.members.map(extractName);
        return;
      }
    }

    // Se la classe non ha un elenco salvato, mantiene il roster predefinito ricco
    if (!AppState.currentClassStudents || AppState.currentClassStudents.length === 0) {
      AppState.currentClassStudents = [
        "Sara", "Marco", "Luca", "Giulia", "Matteo", "Chiara",
        "Andrea", "Francesca", "Davide", "Elena", "Federico", "Sofia",
        "Simone", "Martina", "Lorenzo", "Alessia", "Gabriele", "Valentina"
      ];
    }
  }

  function renderPawnsGrid() {
    if (!DOM.pawnsGridContainer) return;
    const chars = HISTORY_MODES[AppState.currentMode].characters;

    DOM.pawnsGridContainer.innerHTML = chars.map(c => {
      const isSelected = (c.id === AppState.selectedSetupFactionId);

      return `
        <div class="pawn-card ${isSelected ? 'selected' : ''}" 
             data-char-id="${c.id}"
             onclick="HistoryGramApp.selectPawnFaction('${c.id}')"
             title="${escapeHtml(c.name)}">
          <span class="pawn-card-avatar">${c.avatar}</span>
          <span class="pawn-card-title">${escapeHtml(c.name)}</span>
        </div>
      `;
    }).join('');
  }

  function selectPawnFaction(charId) {
    AppState.selectedSetupFactionId = charId;
    renderPawnsGrid();
    renderFactionWorkbench(charId);
  }

  function renderFactionWorkbench(charId) {
    if (!DOM.setupActiveFactionWorkbench) return;
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    const c = chars.find(item => item.id === charId);
    if (!c) {
      DOM.setupActiveFactionWorkbench.innerHTML = '';
      return;
    }

    const assignments = (AppState.sessionData && AppState.sessionData.teamAssignments) || {};
    const currentAssigned = assignments[c.id] || [];
    const allStudents = AppState.currentClassStudents || [];

    // Mappa per sapere in quale squadra si trova ogni studente
    const studentTeamMap = {};
    chars.forEach(faction => {
      const roster = assignments[faction.id] || [];
      roster.forEach(stName => {
        studentTeamMap[stName] = faction;
      });
    });

    let chipsHtml = '';
    if (allStudents.length === 0) {
      chipsHtml = `<span style="font-size: 0.85rem; color: var(--text-muted);">Nessuno studente presente nel registro.</span>`;
    } else {
      chipsHtml = allStudents.map(stName => {
        const isHere = currentAssigned.includes(stName);
        const otherFaction = (!isHere && studentTeamMap[stName]) ? studentTeamMap[stName] : null;

        if (isHere) {
          return `
            <button type="button" class="student-chip in-this-team" data-student="${escapeHtml(stName)}" data-char-id="${c.id}" onclick="HistoryGramApp.handleStudentChipClick(this, event)" title="Clicca per rimuovere da ${escapeHtml(c.name)}">
              <i class="fa-solid fa-check"></i>
              <span>${escapeHtml(stName)}</span>
              <i class="fa-solid fa-xmark" style="font-size: 0.72rem; margin-left: 4px; opacity: 0.85;"></i>
            </button>
          `;
        } else if (otherFaction) {
          return `
            <button type="button" class="student-chip in-other-team" data-student="${escapeHtml(stName)}" data-char-id="${c.id}" onclick="HistoryGramApp.handleStudentChipClick(this, event)" title="Attualmente in ${escapeHtml(otherFaction.name)}. Clicca per spostare in ${escapeHtml(c.name)}.">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
              <span>${escapeHtml(stName)}</span>
              <span class="chip-team-tag">${escapeHtml(otherFaction.name)}</span>
            </button>
          `;
        } else {
          return `
            <button type="button" class="student-chip available" data-student="${escapeHtml(stName)}" data-char-id="${c.id}" onclick="HistoryGramApp.handleStudentChipClick(this, event)" title="Clicca per aggiungere a ${escapeHtml(c.name)}">
              <i class="fa-solid fa-plus"></i>
              <span>${escapeHtml(stName)}</span>
            </button>
          `;
        }
      }).join('');
    }

    DOM.setupActiveFactionWorkbench.innerHTML = `
      <div class="members-workbench-header">
        <div class="members-active-team-info">
          <div class="members-active-avatar">${c.avatar}</div>
          <div class="members-active-text-col">
            <div class="members-active-title-row">
              <h3 class="members-active-name">${escapeHtml(c.name)}</h3>
              <span class="members-active-tag">${escapeHtml(c.faction)}</span>
            </div>
            <div class="members-team-status-line">
              <span class="members-team-count-pill ${currentAssigned.length > 0 ? 'has-members' : ''}">
                <i class="fa-solid ${currentAssigned.length > 0 ? 'fa-user-check' : 'fa-users'}"></i>
                <strong>${currentAssigned.length}</strong> ${currentAssigned.length === 1 ? 'studente' : 'studenti'}
              </span>
              ${currentAssigned.length > 0 ? `
                <span class="members-team-list-preview" title="${escapeHtml(currentAssigned.join(', '))}">
                  : <strong>${escapeHtml(currentAssigned.join(', '))}</strong>
                </span>
              ` : `
                <span class="members-team-empty-hint">Nessun componente assegnato (clicca sui nomi sotto per aggiungerli)</span>
              `}
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary-action btn-sm" onclick="HistoryGramApp.openCharDetailModal('${c.id}')" title="Scopri la loro storia">
          <i class="fa-solid fa-book-open"></i> Scopri la loro storia
        </button>
      </div>

      <div class="members-chips-section">
        <div class="members-chips-grid">
          ${chipsHtml}
        </div>
      </div>
    `;
  }

  function handleStudentChipClick(buttonEl, event) {
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    if (!buttonEl) return;
    const student = buttonEl.getAttribute('data-student') || (buttonEl.dataset && buttonEl.dataset.student);
    const charId = buttonEl.getAttribute('data-char-id') || (buttonEl.dataset && buttonEl.dataset.charId) || AppState.selectedSetupFactionId;
    if (!student) {
      console.warn("⚠️ handleStudentChipClick: studente mancante", buttonEl);
      return;
    }
    toggleStudentAssignment(student.trim(), charId);
  }

  function toggleStudentAssignment(studentName, targetCharId) {
    if (!studentName) return;
    const charId = targetCharId || AppState.selectedSetupFactionId;
    if (!charId) return;

    if (!AppState.sessionData) {
      AppState.sessionData = {};
    }
    if (!AppState.sessionData.teamAssignments || typeof AppState.sessionData.teamAssignments !== 'object') {
      AppState.sessionData.teamAssignments = {};
    }

    const assignments = AppState.sessionData.teamAssignments;
    if (!Array.isArray(assignments[charId])) {
      assignments[charId] = [];
    }

    const isAlreadyInTarget = assignments[charId].includes(studentName);

    if (isAlreadyInTarget) {
      // Rimuove da questa squadra
      assignments[charId] = assignments[charId].filter(st => st !== studentName);
    } else {
      // Rimuove da tutte le squadre per evitare doppioni
      Object.keys(assignments).forEach(cid => {
        if (Array.isArray(assignments[cid])) {
          assignments[cid] = assignments[cid].filter(st => st !== studentName);
        }
      });
      // Aggiunge direttamente alla squadra target
      assignments[charId].push(studentName);
    }

    // Mantiene attiva la fazione selezionata
    AppState.selectedSetupFactionId = charId;
    AppState.sessionData.updatedAt = new Date().toISOString();

    // Suono click per feedback tattile se disponibile
    if (window.AudioEngine && typeof window.AudioEngine.play === 'function') {
      try { window.AudioEngine.play('click'); } catch(e) {}
    }

    // Persiste immediatamente nello storage locale
    try {
      const sessionId = `${AppState.currentClassId}_${AppState.currentMode}`;
      localStorage.setItem(`historygram_session_${sessionId}`, JSON.stringify(AppState.sessionData));
    } catch(e) {}

    renderPawnsGrid();
    renderFactionWorkbench(charId);
    updateSetupSummary();
    persistSessionAsync();
  }

  async function saveCurrentFactionTeam(charId) {
    const cid = charId || AppState.selectedSetupFactionId;
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    const c = chars.find(item => item.id === cid);
    const assignments = (AppState.sessionData && AppState.sessionData.teamAssignments) || {};
    const count = (assignments[cid] || []).length;
    
    await persistSessionAsync();
    renderPawnsGrid();
    renderFactionWorkbench(cid);
    updateSetupSummary();
    showToast(`✅ Squadra ${c ? c.name : ''} salvata (${count} studenti)!`, "toast-success");
  }

  function addCustomStudent() {
    const inp = document.getElementById('inputCustomStudentName');
    if (!inp) return;
    const val = inp.value.trim();
    if (!val) return;

    if (!AppState.currentClassStudents.includes(val)) {
      AppState.currentClassStudents.push(val);
    }

    if (AppState.selectedSetupFactionId) {
      toggleStudentAssignment(val, AppState.selectedSetupFactionId);
    }
    inp.value = '';
    showToast(`👤 Studente "${val}" aggiunto alla rosa!`, "toast-success");
  }

  async function autoDistributeTeams() {
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    const students = AppState.currentClassStudents || [];

    if (students.length === 0) {
      showToast("⚠️ Nessuno studente presente da distribuire.", "toast-warning");
      return;
    }

    const assignments = {};
    chars.forEach(c => {
      assignments[c.id] = [];
    });

    students.forEach((stud, idx) => {
      const charId = chars[idx % chars.length].id;
      assignments[charId].push(stud);
    });

    AppState.sessionData.teamAssignments = assignments;
    await persistSessionAsync();
    renderPawnsGrid();
    if (AppState.selectedSetupFactionId) {
      renderFactionWorkbench(AppState.selectedSetupFactionId);
    }
    updateSetupSummary();
    showToast("✨ Studenti distribuiti in modo equilibrato nelle fazioni!", "toast-success");
  }

  async function resetTeamAssignments() {
    AppState.sessionData.teamAssignments = {};
    await persistSessionAsync();
    renderPawnsGrid();
    if (AppState.selectedSetupFactionId) {
      renderFactionWorkbench(AppState.selectedSetupFactionId);
    }
    updateSetupSummary();
    showToast("🔄 Assegnazioni delle squadre azzerate.", "toast-info");
  }

  function updateSetupSummary() {
    if (!DOM.setupRosterSummaryStatus) return;
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    const assignments = AppState.sessionData.teamAssignments || {};
    const allStudents = AppState.currentClassStudents || [];

    let totalAssigned = 0;
    let activeTeams = 0;

    chars.forEach(c => {
      const count = (assignments[c.id] || []).length;
      if (count > 0) {
        totalAssigned += count;
        activeTeams++;
      }
    });

    DOM.setupRosterSummaryStatus.innerHTML = `
      <span><strong>${totalAssigned}</strong> su <strong>${allStudents.length}</strong> studenti smistati &bull; <strong>${activeTeams}</strong> squadre attive</span>
    `;

    if (DOM.btnLaunchGame) {
      if (totalAssigned > 0) {
        DOM.btnLaunchGame.removeAttribute('disabled');
        DOM.btnLaunchGame.style.opacity = '1';
        DOM.btnLaunchGame.style.cursor = 'pointer';
        DOM.btnLaunchGame.style.pointerEvents = 'auto';
      } else {
        DOM.btnLaunchGame.removeAttribute('disabled');
        DOM.btnLaunchGame.style.opacity = '0.7';
        DOM.btnLaunchGame.style.cursor = 'pointer';
        DOM.btnLaunchGame.style.pointerEvents = 'auto';
      }
    }
  }

  function onSetupClassChange(val) {
    if (val === 'custom') {
      const customCode = prompt("Inserisci il codice classe per questa sessione (es. 2C, 3A):", "3A");
      if (customCode) {
        AppState.currentClassCode = customCode.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        AppState.currentClassId = 'classe_' + AppState.currentClassCode.toLowerCase();
        renderSetupClassView();
      }
      return;
    }
    AppState.currentClassId = val;
    const parts = val.replace('classe_', '').toUpperCase();
    AppState.currentClassCode = parts || '3B';
    connectSession();
    renderSetupClassView();
  }

  async function launchGameFromSetup() {
    try {
      const assignments = AppState.sessionData.teamAssignments || {};
      const chars = HISTORY_MODES[AppState.currentMode].characters;
      const activeTeams = chars.filter(c => (assignments[c.id] || []).length > 0);

      if (activeTeams.length === 0) {
        showToast("⚠️ Assegna almeno uno studente prima di avviare la sfida sul Muro!", "toast-warning");
        return;
      }

      await persistSessionAsync();

      connectSession();
      renderAll();
      showToast("🚀 Partita avviata con successo! Benvenuti sul Muro.", "toast-success");
      showView('view-game');
    } catch (err) {
      console.error("Errore launchGameFromSetup:", err);
      connectSession();
      renderAll();
      showView('view-game');
    }
  }

  /* ================= CONTROLLO SSO UTENTE ================= */
  function checkSSOUser() {
    try {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryRole = urlParams.get('role');
        if (queryRole) {
          localStorage.setItem('hub_user_role', queryRole.toLowerCase());
        }
      } catch (e) {}

      const ssoName = localStorage.getItem('hub_user_name') || localStorage.getItem('fanta_user_name') || localStorage.getItem('loratore_user_name');
      let ssoAvatar = localStorage.getItem('hub_user_avatar') || localStorage.getItem('fanta_user_avatar') || localStorage.getItem('loratore_user_avatar');
      const ssoRole = localStorage.getItem('hub_user_role') || 'docente';

      try {
        const pmUser = JSON.parse(localStorage.getItem('pm_oratore_user') || '{}');
        if (pmUser.avatar && !ssoAvatar) ssoAvatar = pmUser.avatar;
        if (pmUser.name && !ssoName) {
          if (DOM.headerUserName) DOM.headerUserName.textContent = pmUser.name.toUpperCase();
          if (DOM.dropdownUserName) DOM.dropdownUserName.textContent = pmUser.name.toUpperCase();
        }
      } catch (e) {}

      if (ssoName) {
        if (DOM.headerUserName) DOM.headerUserName.textContent = ssoName.toUpperCase();
        if (DOM.dropdownUserName) DOM.dropdownUserName.textContent = ssoName.toUpperCase();
        const roleLabel = (ssoRole === 'docente' || ssoRole === 'admin') ? 'AMMINISTRATORE' : 'STUDENTE';
        if (DOM.headerUserRole) DOM.headerUserRole.textContent = roleLabel;
        if (DOM.dropdownUserRoleSub) DOM.dropdownUserRoleSub.textContent = roleLabel;
        if (ssoRole === 'docente' || ssoRole === 'admin') {
          AppState.isTeacherUnlocked = true;
        } else if (ssoRole === 'studente') {
          AppState.isTeacherUnlocked = false;
        }
      } else {
        const isStudent = (ssoRole === 'studente');
        if (DOM.headerUserRole) DOM.headerUserRole.textContent = isStudent ? 'STUDENTE' : 'AMMINISTRATORE';
        if (DOM.dropdownUserRoleSub) DOM.dropdownUserRoleSub.textContent = isStudent ? 'STUDENTE' : 'AMMINISTRATORE';
        if (isStudent) {
          AppState.isTeacherUnlocked = false;
        } else {
          AppState.isTeacherUnlocked = true;
        }
      }
      if (ssoAvatar && DOM.headerUserAvatar) {
        DOM.headerUserAvatar.src = ssoAvatar;
      }
    } catch (e) {}

    updateTeacherNavVisibility();

    if (window.fbAuth) {
      window.fbAuth.onAuthStateChanged(async user => {
        if (user) {
          AppState.teacherUser = user;
          const isSuperAdmin = (user.email && user.email.toLowerCase() === 'prof.memmo@gmail.com');
          let displayName = isSuperAdmin ? 'PROF. MEMMO' : (user.displayName || user.email.split('@')[0]).toUpperCase();
          let userAvatar = user.photoURL || '';
          let userRole = isSuperAdmin ? 'AMMINISTRATORE' : 'DOCENTE';

          if (window.fbDb) {
            try {
              const doc = await window.fbDb.collection('hub_users').doc(user.uid).get();
              if (doc.exists) {
                const data = doc.data() || {};
                if (data.anagrafica && data.anagrafica.nome) {
                  displayName = data.anagrafica.nome.toUpperCase();
                }
                const rawAvatar = data.avatar || (data.anagrafica && data.anagrafica.avatar) || '';
                if (rawAvatar) userAvatar = rawAvatar;
                if (data.role === 'admin' || isSuperAdmin) userRole = 'AMMINISTRATORE';
              }
            } catch (err) {
              console.warn("Lettura hub_users Firestore:", err);
            }
          }

          AppState.isTeacherUnlocked = true;
          updateTeacherNavVisibility();
          if (DOM.headerUserName) DOM.headerUserName.textContent = displayName;
          if (DOM.dropdownUserName) DOM.dropdownUserName.textContent = displayName;
          if (DOM.headerUserRole) DOM.headerUserRole.textContent = userRole;
          if (DOM.dropdownUserRoleSub) DOM.dropdownUserRoleSub.textContent = userRole;
          if (userAvatar && DOM.headerUserAvatar) {
            DOM.headerUserAvatar.src = userAvatar;
          }
          try {
            localStorage.setItem('hub_user_name', displayName);
            if (userAvatar) localStorage.setItem('hub_user_avatar', userAvatar);
          } catch(e) {}

          // Se ci troviamo nella vista di configurazione classe, ricarica subito le classi del docente autenticato
          if (AppState.currentView === 'view-setup-class') {
            await renderSetupClassView();
          }
        } else {
          updateTeacherNavVisibility();
        }
      });
    }
  }

  function toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    if (!DOM.userDropdown) return;
    DOM.userDropdown.classList.toggle('hidden');
  }

  /* ================= ASCOLTO SESSIONE FIRESTORE ================= */
  function connectSession() {
    if (AppState.unsubscribeSession) {
      AppState.unsubscribeSession();
      AppState.unsubscribeSession = null;
    }

    if (window.HistoryGramService) {
      AppState.unsubscribeSession = window.HistoryGramService.subscribeSession(
        AppState.currentClassId,
        AppState.currentMode,
        (data) => {
          if (data) {
            // Se abbiamo già assegnazioni attive in locale, non sovrascriverle con un payload vuoto
            const localHasAssignments = AppState.sessionData && 
              AppState.sessionData.teamAssignments && 
              Object.values(AppState.sessionData.teamAssignments).some(arr => Array.isArray(arr) && arr.length > 0);
            const incomingHasAssignments = data.teamAssignments && 
              Object.values(data.teamAssignments).some(arr => Array.isArray(arr) && arr.length > 0);

            if (localHasAssignments && !incomingHasAssignments) {
              return;
            }

            // Ignora snapshot obsoleti se lo stato locale è più recente (evita race conditions)
            if (AppState.sessionData && AppState.sessionData.updatedAt && data.updatedAt) {
              if (new Date(data.updatedAt).getTime() < new Date(AppState.sessionData.updatedAt).getTime()) {
                return;
              }
            }
            AppState.sessionData = data;
            renderAll();
            if (AppState.currentView === 'view-setup-class') {
              renderPawnsGrid();
              if (AppState.selectedSetupFactionId) {
                renderFactionWorkbench(AppState.selectedSetupFactionId);
              }
              updateSetupSummary();
            }
          }
        }
      );
    }
  }

  /* ================= RENDERING GENERALE ================= */
  function renderAll() {
    renderModeUI();
    renderStoriesBar();
    renderFeed();
    renderLeaderboard();
    if (AppState.currentView === 'view-docente') {
      renderTeacherView();
    }
  }

  function renderModeUI() {
    const mode = HISTORY_MODES[AppState.currentMode];
    if (!mode) return;

    if (DOM.bannerSubtag) DOM.bannerSubtag.textContent = `■ ${mode.targetClass} • ${mode.badge}`;
    if (DOM.bannerHeading) DOM.bannerHeading.textContent = `${mode.title} – ${mode.subtitle}`;
    if (DOM.bannerDescription) DOM.bannerDescription.textContent = mode.description;
    if (DOM.leaderboardMetricInfo) DOM.leaderboardMetricInfo.textContent = mode.scoringMetric;
    if (DOM.lbMetricColumnTitle) DOM.lbMetricColumnTitle.textContent = AppState.currentMode === 'revolution_1800' ? 'Follower' : 'Stelle/Follower';

    // Aggiorna tendina selezione personaggio nel form crea post
    if (DOM.selectCharacter) {
      DOM.selectCharacter.innerHTML = '';
      mode.characters.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.avatar} ${c.name} (${c.faction})`;
        DOM.selectCharacter.appendChild(opt);
      });
      updateCharacterPreview();
    }
  }

  function renderStoriesBar() {
    if (!DOM.storiesList) return;
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    DOM.storiesList.innerHTML = '';

    characters.forEach(c => {
      const story = document.createElement('div');
      story.className = 'story-item';
      story.onclick = () => openCharDetailModal(c.id);

      story.innerHTML = `
        <div class="story-avatar-ring">
          <span class="story-avatar-icon">${c.avatar}</span>
        </div>
        <span class="story-name">${escapeHtml(c.name)}</span>
      `;
      DOM.storiesList.appendChild(story);
    });
  }

  function renderFeed() {
    if (!DOM.feedStream) return;
    const posts = AppState.sessionData.approvedPosts || [];

    if (DOM.statApprovedPostsTotal) DOM.statApprovedPostsTotal.textContent = posts.length;
    if (DOM.feedPostsCount) DOM.feedPostsCount.textContent = `(${posts.length} post)`;

    if (posts.length === 0) {
      DOM.feedStream.innerHTML = '';
      if (DOM.emptyFeedState) {
        DOM.feedStream.appendChild(DOM.emptyFeedState);
        DOM.emptyFeedState.style.display = 'block';
      }
      return;
    }

    if (DOM.emptyFeedState) DOM.emptyFeedState.style.display = 'none';
    DOM.feedStream.innerHTML = '';

    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'post-card';
      card.id = `post-${post.id}`;

      const char = getCharacterById(post.characterId) || { name: 'Personaggio Storico', faction: 'Storia', avatar: '📜' };
      const likesCount = (post.likes || []).length;
      const isLiked = (post.likes || []).includes(AppState.localVoterId);
      const isFlameMode = AppState.currentMode === 'reformation_1500';
      const commentsCount = (post.comments || []).length;

      // Render Stelle / Voto
      let ratingsHtml = '';
      if (isFlameMode) {
        const avgAcc = post.ratingsAccuratezza ? (post.ratingsAccuratezza.reduce((a, b) => a + b, 0) / post.ratingsAccuratezza.length).toFixed(1) : '-';
        const avgCre = post.ratingsCreativita ? (post.ratingsCreativita.reduce((a, b) => a + b, 0) / post.ratingsCreativita.length).toFixed(1) : '-';
        const avgChi = post.ratingsChiarezza ? (post.ratingsChiarezza.reduce((a, b) => a + b, 0) / post.ratingsChiarezza.length).toFixed(1) : '-';

        ratingsHtml = `
          <div class="flame-rating-bar">
            <span>Accuratezza: ⭐ <strong>${avgAcc}</strong></span>
            <span>Creatività: 💡 <strong>${avgCre}</strong></span>
            <span>Chiarezza: 🗣️ <strong>${avgChi}</strong></span>
          </div>
        `;
      }

      // Render Commenti Flame
      let commentsHtml = '';
      if (post.comments && post.comments.length > 0) {
        commentsHtml = `
          <div class="comments-thread-box">
            <h5 style="margin: 0 0 8px 0; font-size: 0.8rem; color: #f97316;">🔥 Repliche &amp; Dibattiti (${commentsCount}):</h5>
            ${post.comments.map(c => `
              <div class="comment-bubble">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                  <strong>${c.charAvatar || '📜'} ${escapeHtml(c.authorName || 'Gruppo')}</strong>
                  <small style="color:var(--text-muted);">${formatTime(c.createdAt)}</small>
                </div>
                <p style="margin: 3px 0 0 0; font-size: 0.82rem;">${escapeHtml(c.text)}</p>
              </div>
            `).join('')}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="post-header">
          <div class="post-author-box">
            <span class="post-author-avatar">${char.avatar}</span>
            <div class="post-author-meta">
              <h4>${escapeHtml(char.name)}</h4>
              <small>${escapeHtml(post.groupName || 'Squadra')} &bull; ${escapeHtml(char.faction)}</small>
            </div>
          </div>
          <span class="post-timestamp">${formatTime(post.createdAt)}</span>
        </div>

        <div class="post-visual-banner style-${post.style || 'parchment'}">
          <div class="post-slogan-styled">"${escapeHtml(post.slogan || '')}"</div>
        </div>

        <div class="post-body">
          <p class="post-text">${escapeHtml(post.text || '')}</p>
          <div class="post-hashtags-row">
            ${(post.hashtags || []).map(t => `<span class="hashtag-pill">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>

        ${ratingsHtml}

        <div class="post-actions-bar">
          <div class="post-action-btn ${isLiked ? 'active' : ''}" onclick="HistoryGramApp.toggleLike('${post.id}')">
            <i class="fa-solid fa-heart"></i>
            <span>${likesCount} Like</span>
          </div>

          ${isFlameMode ? `
            <div class="post-action-btn" onclick="HistoryGramApp.openFlameModal('${post.id}')">
              <i class="fa-solid fa-fire"></i>
              <span>Replica Flame (${commentsCount})</span>
            </div>
          ` : ''}

          <div class="post-action-btn" onclick="HistoryGramApp.openCharDetailModal('${char.id}')">
            <i class="fa-solid fa-book-open"></i>
            <span>Fonti Storiche</span>
          </div>
        </div>

        ${commentsHtml}
      `;

      DOM.feedStream.appendChild(card);
    });
  }

  function renderLeaderboard() {
    if (!DOM.leaderboardTableBody) return;
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    const scores = AppState.sessionData.scores || {};
    const posts = AppState.sessionData.approvedPosts || [];

    let totalFollowers = 0;
    const ranking = characters.map(c => {
      const scoreObj = scores[c.id] || { likes: 0, teacherBonus: 0, postsCount: 0 };
      const teamPosts = posts.filter(p => p.characterId === c.id);
      let calculatedLikes = 0;
      teamPosts.forEach(p => { calculatedLikes += (p.likes || []).length; });

      const finalFollowers = calculatedLikes + (scoreObj.teacherBonus || 0);
      totalFollowers += finalFollowers;

      return {
        id: c.id,
        name: c.name,
        faction: c.faction,
        avatar: c.avatar,
        postsCount: teamPosts.length,
        followers: finalFollowers
      };
    });

    ranking.sort((a, b) => b.followers - a.followers);
    if (DOM.statFollowersTotal) DOM.statFollowersTotal.textContent = totalFollowers;

    // Render Podio
    if (DOM.podiumWrap) {
      DOM.podiumWrap.innerHTML = '';
      const top3 = ranking.slice(0, 3);
      top3.forEach((team, idx) => {
        const place = idx + 1;
        const col = document.createElement('div');
        col.className = `podium-col place-${place}`;
        col.innerHTML = `
          <div class="podium-avatar-ring">${team.avatar}</div>
          <span class="podium-name">${escapeHtml(team.name)}</span>
          <div class="podium-pillar">
            <span class="podium-rank-badge">#${place}</span>
            <span class="podium-score">${team.followers}</span>
          </div>
        `;
        DOM.podiumWrap.appendChild(col);
      });
    }

    // Render Tabella
    if (DOM.leaderboardTableBody) {
      DOM.leaderboardTableBody.innerHTML = '';
      ranking.forEach((team, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 800; color: ${idx === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'};">#${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${team.avatar}</span>
              <div>
                <strong>${escapeHtml(team.name)}</strong>
                <small style="display: block; color: var(--text-muted); font-size: 0.72rem;">${escapeHtml(team.faction)}</small>
              </div>
            </div>
          </td>
          <td>${team.postsCount}</td>
          <td class="text-right font-bold" style="color: var(--accent-gold); font-size: 1.05rem;">${team.followers}</td>
        `;
        DOM.leaderboardTableBody.appendChild(tr);
      });
    }

    // Render Tabella Vista Dedicata "Classifica"
    const fullTableBody = document.getElementById('leaderboardFullTableBody');
    if (fullTableBody) {
      fullTableBody.innerHTML = '';
      ranking.forEach((team, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 800; text-align: center; color: ${idx === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-size: 1.1rem;">#${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.3rem;">${team.avatar}</span>
              <div>
                <strong style="font-size: 1rem; color: var(--text-main);">${escapeHtml(team.name)}</strong>
                <small style="display: block; color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(team.faction)}</small>
              </div>
            </div>
          </td>
          <td style="text-align: center; font-weight: 600;">${team.postsCount}</td>
          <td style="text-align: center; color: var(--accent-red); font-weight: 700;">${team.likes || 0}</td>
          <td style="text-align: center; color: var(--accent-blue); font-weight: 700;">${team.commentsCount || 0}</td>
          <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 1.15rem;">${team.followers}</td>
        `;
        fullTableBody.appendChild(tr);
      });
    }

    // Render Podio Vista Dedicata
    const fullPodium = document.getElementById('leaderboardFullPodiumWrap');
    if (fullPodium) {
      fullPodium.innerHTML = '';
      const top3 = ranking.slice(0, 3);
      top3.forEach((team, idx) => {
        const place = idx + 1;
        const col = document.createElement('div');
        col.className = `podium-col place-${place}`;
        col.innerHTML = `
          <div class="podium-avatar-ring" style="font-size: 1.8rem;">${team.avatar}</div>
          <span class="podium-name">${escapeHtml(team.name)}</span>
          <div class="podium-pillar">
            <span class="podium-rank-badge">#${place}</span>
            <span class="podium-score">${team.followers} Follower</span>
          </div>
        `;
        fullPodium.appendChild(col);
      });
    }
  }

  /* ================= CATTEDRA DOCENTE DEDICATA ================= */
  function renderTeacherView() {
    if (!DOM.viewTeacherWorkArea || !DOM.viewTeacherPinAuth) return;

    if (AppState.isTeacherUnlocked) {
      DOM.viewTeacherPinAuth.classList.add('hidden');
      DOM.viewTeacherWorkArea.classList.remove('hidden');
    } else {
      DOM.viewTeacherPinAuth.classList.remove('hidden');
      DOM.viewTeacherWorkArea.classList.add('hidden');
      return;
    }

    const pending = AppState.sessionData.pendingPosts || [];
    if (DOM.viewTQueueCount) DOM.viewTQueueCount.textContent = pending.length;

    // Render Coda Imprimatur
    if (DOM.viewTeacherQueueList) {
      if (pending.length === 0) {
        DOM.viewTeacherQueueList.innerHTML = `
          <div style="text-align: center; padding: 30px; color: var(--text-muted); background: var(--bg-secondary); border-radius: 12px;">
            <i class="fa-solid fa-circle-check" style="font-size: 2.2rem; color: var(--accent-green); margin-bottom: 10px; display: block;"></i>
            Nessun post in attesa di approvazione al momento.
          </div>
        `;
      } else {
        DOM.viewTeacherQueueList.innerHTML = '';
        pending.forEach(post => {
          const char = getCharacterById(post.characterId) || { name: 'Personaggio', avatar: '📜' };
          const card = document.createElement('div');
          card.style.cssText = `background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px; margin-bottom: 14px;`;

          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.5rem;">${char.avatar}</span>
                <div>
                  <strong style="color: var(--text-main);">${escapeHtml(char.name)}</strong>
                  <small style="display: block; color: var(--text-muted);">${escapeHtml(post.groupName || 'Squadra')}</small>
                </div>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${formatTime(post.createdAt)}</span>
            </div>
            <p style="font-style: italic; color: var(--accent-gold); margin: 6px 0;">"${escapeHtml(post.slogan || '')}"</p>
            <p style="font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px;">${escapeHtml(post.text || '')}</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
              <button class="btn-danger-action" onclick="HistoryGramApp.rejectPost('${post.id}')" style="padding: 6px 14px; font-size: 0.82rem;">
                <i class="fa-solid fa-xmark"></i> Rifiuta
              </button>
              <button class="btn-primary-action" onclick="HistoryGramApp.approvePost('${post.id}', 10)" style="padding: 6px 14px; font-size: 0.82rem; background: #d97706;">
                <i class="fa-solid fa-star"></i> Approva + Bonus (+10)
              </button>
              <button class="btn-primary-action" onclick="HistoryGramApp.approvePost('${post.id}', 0)" style="padding: 6px 14px; font-size: 0.82rem; background: var(--accent-green);">
                <i class="fa-solid fa-check"></i> Concedi Imprimatur
              </button>
            </div>
          `;
          DOM.viewTeacherQueueList.appendChild(card);
        });
      }
    }

    // Render Squadre Fanta
    if (DOM.viewTeacherTeamsGrid) {
      const chars = HISTORY_MODES[AppState.currentMode].characters;
      const assignments = AppState.sessionData.teamAssignments || {};
      DOM.viewTeacherTeamsGrid.innerHTML = '';

      chars.forEach(c => {
        const currentStudents = assignments[c.id] || [];
        const card = document.createElement('div');
        card.style.cssText = `background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;`;
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 1.5rem;">${c.avatar}</span>
            <strong style="color: var(--text-main); font-size: 0.9rem;">${escapeHtml(c.name)}</strong>
          </div>
          <input type="text" class="form-input view-teacher-team-input" data-char-id="${c.id}" value="${escapeHtml(currentStudents.join(', '))}" style="font-size: 0.8rem; padding: 6px 10px;">
        `;
        DOM.viewTeacherTeamsGrid.appendChild(card);
      });
    }
  }

  function unlockTeacherFromView() {
    const pin = (DOM.inputViewTeacherPin ? DOM.inputViewTeacherPin.value : '').trim();
    if (pin === '1848' || pin === '1517' || pin === '1234' || pin === '0000') {
      AppState.isTeacherUnlocked = true;
      localStorage.setItem('hub_user_role', 'docente');
      updateTeacherNavVisibility();
      renderTeacherView();
      showToast("🔓 Cattedra sbloccata con successo!", "toast-success");
    } else {
      showToast("❌ PIN errato. Riprova con 1848 o 1517.", "toast-danger");
    }
  }

  function switchTeacherTab(tabName) {
    if (DOM.btnTabQueue) DOM.btnTabQueue.classList.toggle('active', tabName === 'queue');
    if (DOM.btnTabTeams) DOM.btnTabTeams.classList.toggle('active', tabName === 'teams');
    if (DOM.btnTabSettings) DOM.btnTabSettings.classList.toggle('active', tabName === 'settings');

    if (DOM.tabDocenteQueue) DOM.tabDocenteQueue.classList.toggle('hidden', tabName !== 'queue');
    if (DOM.tabDocenteTeams) DOM.tabDocenteTeams.classList.toggle('hidden', tabName !== 'teams');
    if (DOM.tabDocenteSettings) DOM.tabDocenteSettings.classList.toggle('hidden', tabName !== 'settings');
  }

  async function saveTeamsFromView() {
    const inputs = document.querySelectorAll('.view-teacher-team-input');
    const assignments = {};
    inputs.forEach(inp => {
      const cid = inp.getAttribute('data-char-id');
      const val = inp.value.trim();
      assignments[cid] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
    });

    AppState.sessionData.teamAssignments = assignments;

    if (window.HistoryGramService) {
      await window.HistoryGramService.bulkAssignTeams(AppState.currentClassId, AppState.currentMode, assignments);
    }

    showToast("💾 Squadre aggiornate e salvate!", "toast-success");
  }

  function saveClassCodeFromView() {
    const newCode = (DOM.viewSettingClassCode ? DOM.viewSettingClassCode.value : '').trim().toUpperCase();
    if (!newCode) return;
    AppState.currentClassCode = newCode;
    AppState.currentClassId = 'classe_' + newCode.toLowerCase();
    connectSession();
    renderAll();
    showToast(`🏫 Codice stanza aggiornato a ${newCode}`, "toast-info");
  }

  async function resetSession() {
    if (!confirm("⚠️ Sei sicuro di voler azzerare tutti i post e i voti di questa sessione?")) return;
    if (window.HistoryGramService) {
      await window.HistoryGramService.resetSession(AppState.currentClassId, AppState.currentMode);
    }
    showToast("🧹 Sessione azzerata con successo!", "toast-gold");
  }

  /* ================= AZIONI POST & SOCIAL ================= */
  async function approvePost(postId, bonus = 0) {
    if (window.HistoryGramService) {
      await window.HistoryGramService.approvePost(AppState.currentClassId, AppState.currentMode, postId, bonus);
      showToast(bonus > 0 ? `🛡️ Imprimatur concesso + ${bonus} Follower Bonus!` : "🛡️ Imprimatur concesso!", "toast-success");
    }
  }

  async function rejectPost(postId) {
    if (window.HistoryGramService) {
      await window.HistoryGramService.rejectPost(AppState.currentClassId, AppState.currentMode, postId);
      showToast("❌ Post respinto.", "toast-info");
    }
  }

  async function toggleLike(postId) {
    if (window.HistoryGramService) {
      await window.HistoryGramService.addLike(AppState.currentClassId, AppState.currentMode, postId, AppState.localVoterId);
    }
  }

  async function ratePost(postId, aspect, stars) {
    if (window.HistoryGramService) {
      await window.HistoryGramService.ratePost(AppState.currentClassId, AppState.currentMode, postId, aspect, stars);
      showToast(`⭐ Valutazione registrata (${aspect}: ${stars} stelle)`, "toast-success");
    }
  }

  /* ================= MODALI AZIONI ================= */
  function openFlameModal(postId) {
    AppState.activeFlameTargetPostId = postId;
    const posts = AppState.sessionData.approvedPosts || [];
    const target = posts.find(p => p.id === postId);
    if (!target || !DOM.modalFlameComment) return;

    const char = getCharacterById(target.characterId) || { name: 'Personaggio', avatar: '📜' };
    if (DOM.commentTargetQuote) {
      DOM.commentTargetQuote.innerHTML = `
        <span style="font-size:0.78rem; color:var(--text-muted);">${char.avatar} ${escapeHtml(char.name)}:</span>
        <p style="margin:4px 0 0 0; font-size:0.85rem; font-style:italic;">"${escapeHtml(target.slogan || target.text)}"</p>
      `;
    }

    // Popola tendina personaggi per la replica
    if (DOM.selectCommentChar) {
      DOM.selectCommentChar.innerHTML = '';
      HISTORY_MODES[AppState.currentMode].characters.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.avatar} ${c.name} (${c.faction})`;
        DOM.selectCommentChar.appendChild(opt);
      });
    }

    DOM.modalFlameComment.classList.remove('hidden');
  }

  function openCharDetailModal(charId) {
    const char = getCharacterById(charId);
    if (!char || !DOM.modalCharDetail) return;

    AppState.selectedCharModalId = charId;
    if (DOM.mCharAvatar) DOM.mCharAvatar.textContent = char.avatar;
    if (DOM.mCharName) DOM.mCharName.textContent = char.name;
    if (DOM.mCharFaction) DOM.mCharFaction.textContent = char.faction;

    let thesesHtml = '';
    const thesesList = char.theses || char.mainTheses;
    if (Array.isArray(thesesList) && thesesList.length > 0) {
      thesesHtml = `
        <h4 style="color:var(--accent-gold); margin-top:16px; font-family:var(--font-heading);">📜 Tesi Teologiche &amp; Dottrinali:</h4>
        <ul style="padding-left:20px; font-size:0.92rem; line-height: 1.6; color: var(--text-main);">
          ${thesesList.map(t => `<li style="margin-bottom: 6px;">${escapeHtml(t)}</li>`).join('')}
        </ul>
      `;
    }

    if (DOM.mCharBody) {
      DOM.mCharBody.innerHTML = `
        <p style="font-size:1.02rem; color:var(--text-main); line-height: 1.75; margin-bottom: 14px;">${escapeHtml(char.context || '')}</p>

        ${thesesHtml}
      `;
    }

    DOM.modalCharDetail.classList.remove('hidden');
  }

  function closeCharDetailModal() {
    if (DOM.modalCharDetail) {
      DOM.modalCharDetail.classList.add('hidden');
    }
    if (DOM.setupActiveFactionWorkbench) {
      DOM.setupActiveFactionWorkbench.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ================= MINIGUIDA MODAL LOGIC (Stile L'Oratore) ================= */
  const guideSteps = [
    {
      icon: "🎯",
      title: "",
      desc: "Lo scopo del gioco è calarsi nei panni di un protagonista del passato, raccontare i grandi eventi storici con i post e conquistare il consenso e i like della classe."
    },
    {
      icon: "📱",
      title: "",
      desc: "Si gioca pubblicando post storicamente coerenti con il proprio personaggio, aggiungendo immagini e riflessioni, e interagendo con commenti e like nel feed di classe."
    },
    {
      icon: "🏠",
      title: "",
      desc: "Nella <strong>Home</strong> scegli la tua epoca storica e il tuo personaggio per esplorare il feed e scoprire gli aggiornamenti del giorno."
    },
    {
      icon: "✍️",
      title: "",
      desc: "Clicca su <strong>Crea Post</strong> per pubblicare contenuti coerenti con il tuo personaggio e interagire con i like dei compagni."
    },
    {
      icon: "🏆",
      title: "",
      desc: "Vai su <strong>Classifica</strong> per scoprire i profili storici più seguiti e i post più popolari della classe.<br><br><em>Consulta il regolamento per saperne di più.</em>"
    }
  ];

  let currentGuideStepIndex = 0;

  function renderGuideStep() {
    const s = guideSteps[currentGuideStepIndex];
    const iconEl = document.getElementById('guide-step-icon');
    const titleEl = document.getElementById('guide-step-title');
    const descEl = document.getElementById('guide-step-desc');
    const numEl = document.getElementById('guide-step-num');
    const prevBtn = document.getElementById('guide-prev-btn');
    const nextBtn = document.getElementById('guide-next-btn');

    if (iconEl) iconEl.textContent = s.icon;
    if (titleEl) titleEl.style.display = 'none';
    if (descEl) descEl.innerHTML = s.desc;
    if (numEl) numEl.textContent = `Passo ${currentGuideStepIndex + 1} di ${guideSteps.length}`;
    if (prevBtn) prevBtn.style.visibility = currentGuideStepIndex === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = currentGuideStepIndex === guideSteps.length - 1 ? 'Chiudi ✓' : 'Avanti ➔';
  }

  function nextGuideStep() {
    if (currentGuideStepIndex < guideSteps.length - 1) {
      currentGuideStepIndex++;
      renderGuideStep();
    } else {
      closeMiniguidaModal();
    }
  }

  function prevGuideStep() {
    if (currentGuideStepIndex > 0) {
      currentGuideStepIndex--;
      renderGuideStep();
    }
  }

  function openMiniguidaModal() {
    currentGuideStepIndex = 0;
    renderGuideStep();
    const m = document.getElementById('modalMiniguida');
    if (m) m.classList.remove('hidden');
  }

  function closeMiniguidaModal() {
    const m = document.getElementById('modalMiniguida');
    if (m) m.classList.add('hidden');
  }

  /* ================= BIND EVENTI ================= */
  function bindEvents() {
    // Chiudi dropdown utente cliccando fuori
    document.addEventListener('click', (e) => {
      if (DOM.userDropdown && !DOM.userDropdown.classList.contains('hidden')) {
        const trigger = DOM.headerUserTrigger;
        if (trigger && !trigger.contains(e.target) && !DOM.userDropdown.contains(e.target)) {
          DOM.userDropdown.classList.add('hidden');
        }
      }
    });

    // Form Crea Post
    if (DOM.btnOpenCreatePost) {
      DOM.btnOpenCreatePost.onclick = () => {
        if (DOM.modalCreatePost) DOM.modalCreatePost.classList.remove('hidden');
      };
    }
    if (DOM.btnCloseCreateModal) {
      DOM.btnCloseCreateModal.onclick = () => {
        if (DOM.modalCreatePost) DOM.modalCreatePost.classList.add('hidden');
      };
    }

    // Modal Personaggio
    if (DOM.btnCloseCharModal) {
      DOM.btnCloseCharModal.onclick = () => {
        if (DOM.modalCharDetail) DOM.modalCharDetail.classList.add('hidden');
      };
    }
    if (DOM.btnSelectCharFromModal) {
      DOM.btnSelectCharFromModal.onclick = () => {
        if (DOM.modalCharDetail) DOM.modalCharDetail.classList.add('hidden');
        if (AppState.selectedCharModalId && DOM.selectCharacter) {
          DOM.selectCharacter.value = AppState.selectedCharModalId;
          updateCharacterPreview();
        }
        if (DOM.modalCreatePost) DOM.modalCreatePost.classList.remove('hidden');
      };
    }

    // Modal Flame
    if (DOM.btnCloseCommentModal) {
      DOM.btnCloseCommentModal.onclick = () => {
        if (DOM.modalFlameComment) DOM.modalFlameComment.classList.add('hidden');
      };
    }
    if (DOM.formAddComment) {
      DOM.formAddComment.onsubmit = async (e) => {
        e.preventDefault();
        const text = DOM.inputCommentText.value.trim();
        const author = DOM.inputCommentAuthor.value.trim();
        const charId = DOM.selectCommentChar.value;
        const char = getCharacterById(charId);

        if (!text || !author || !AppState.activeFlameTargetPostId) return;

        if (window.HistoryGramService) {
          await window.HistoryGramService.addFlameComment(
            AppState.currentClassId,
            AppState.currentMode,
            AppState.activeFlameTargetPostId,
            {
              authorName: author,
              charId: charId,
              charAvatar: char ? char.avatar : '📜',
              text: text
            }
          );
        }

        DOM.formAddComment.reset();
        if (DOM.modalFlameComment) DOM.modalFlameComment.classList.add('hidden');
        showToast("🔥 Replica pubblicata nel dibattito!", "toast-success");
      };
    }

    // Form Invia Post
    if (DOM.formCreatePost) {
      DOM.formCreatePost.onsubmit = async (e) => {
        e.preventDefault();
        const charId = DOM.selectCharacter.value;
        const groupName = DOM.inputGroupName.value.trim();
        const slogan = DOM.inputSlogan.value.trim();
        const text = DOM.inputText.value.trim();
        const tagsRaw = DOM.inputHashtags.value.trim();
        const style = document.querySelector('input[name="postStyle"]:checked')?.value || 'parchment';

        const hashtags = tagsRaw ? tagsRaw.split(/\s+/).filter(t => t.startsWith('#') || t.length > 0).map(t => t.startsWith('#') ? t : '#' + t) : [];

        const newPost = {
          characterId: charId,
          groupName: groupName,
          slogan: slogan,
          text: text,
          hashtags: hashtags,
          style: style
        };

        if (window.HistoryGramService) {
          await window.HistoryGramService.submitPostForApproval(
            AppState.currentClassId,
            AppState.currentMode,
            newPost
          );
        }

        DOM.formCreatePost.reset();
        if (DOM.modalCreatePost) DOM.modalCreatePost.classList.add('hidden');
        showToast("📨 Post inviato alla Cattedra per Imprimatur!", "toast-gold");
      };
    }

    // Live preview form crea post
    if (DOM.selectCharacter) DOM.selectCharacter.onchange = updateCharacterPreview;
    if (DOM.inputGroupName) DOM.inputGroupName.oninput = (e) => { if (DOM.prevGroupName) DOM.prevGroupName.textContent = e.target.value || 'Team Studenti'; };
    if (DOM.inputSlogan) DOM.inputSlogan.oninput = (e) => { if (DOM.prevSlogan) DOM.prevSlogan.textContent = e.target.value || 'Slogan virale...'; };
    if (DOM.inputText) DOM.inputText.oninput = (e) => {
      if (DOM.prevText) DOM.prevText.textContent = e.target.value || 'Testo del proclama...';
      if (DOM.charCounter) DOM.charCounter.textContent = e.target.value.length;
    };
    if (DOM.inputHashtags) DOM.inputHashtags.oninput = (e) => {
      if (DOM.prevTags) DOM.prevTags.textContent = e.target.value || '#Hashtag';
    };

    // Stili cornice
    document.querySelectorAll('.style-card input[type="radio"]').forEach(radio => {
      radio.onchange = () => {
        document.querySelectorAll('.style-card').forEach(sc => sc.classList.remove('active'));
        radio.closest('.style-card').classList.add('active');
        if (DOM.prevBanner) {
          DOM.prevBanner.className = `preview-banner-styled style-${radio.value}`;
        }
      };
    });

    // Refresh Feed
    if (DOM.btnRefreshFeed) {
      DOM.btnRefreshFeed.onclick = () => {
        connectSession();
        showToast("🔄 Feed sincronizzato!", "toast-info");
      };
    }
  }

  function updateCharacterPreview() {
    if (!DOM.selectCharacter) return;
    const cid = DOM.selectCharacter.value;
    const char = getCharacterById(cid);
    if (!char) return;

    if (DOM.prevAvatar) DOM.prevAvatar.textContent = char.avatar;
    if (DOM.prevCharName) DOM.prevCharName.textContent = char.name;

    // Gli slogan/motti vengono inventati liberamente dagli studenti
    if (DOM.slogansChips) {
      DOM.slogansChips.innerHTML = '';
    }

    if (DOM.hashtagsChips) {
      DOM.hashtagsChips.innerHTML = '';
      (char.hashtags || []).forEach(h => {
        const chip = document.createElement('span');
        chip.className = 'chip-hashtag';
        chip.textContent = h;
        chip.onclick = () => {
          if (DOM.inputHashtags) {
            const cur = DOM.inputHashtags.value.trim();
            if (!cur.includes(h)) {
              DOM.inputHashtags.value = cur ? `${cur} ${h}` : h;
              if (DOM.prevTags) DOM.prevTags.textContent = DOM.inputHashtags.value;
            }
          }
        };
        DOM.hashtagsChips.appendChild(chip);
      });
    }
  }

  function getCharacterById(id) {
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    return characters.find(c => c.id === id);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatTime(isoString) {
    if (!isoString) return 'Adesso';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Adesso';
    }
  }

  function showToast(msg, type = 'toast-info') {
    if (!DOM.toastContainer) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = msg;
    DOM.toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  }

  function goToUnifiedLogin() {
    window.location.href = 'https://prof-memmo.github.io/prof-memmo-gestione-siti/portal.html';
  }

  function confirmLogout() {
    if (confirm("Vuoi davvero uscire dall'Ecosistema?")) {
      try {
        localStorage.removeItem('hub_user_name');
        localStorage.removeItem('hub_user_role');
        localStorage.removeItem('hub_user_avatar');
      } catch (e) {}
      if (window.fbAuth) window.fbAuth.signOut();
      window.location.reload();
    }
  }

  /* ================= GESTIONE MODALE RIPRENDI PARTITA (Stile L'Oratore) ================= */
  function openSavedGamesModal() {
    renderSavedGamesList();
    const modal = document.getElementById('savedGamesModal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeSavedGamesModal() {
    const modal = document.getElementById('savedGamesModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderSavedGamesList() {
    const listEl = document.getElementById('savedGamesList');
    if (!listEl) return;

    const sessions = [];

    // Sessione corrente in memoria
    const currentModeName = AppState.currentMode === 'revolution_1800' ? "Ottocento: Revolution Influencer" : "Cinquecento: Riforma vs Controriforma";
    const currentPostCount = (AppState.sessionData.approvedPosts || []).length;
    sessions.push({
      id: `${AppState.currentClassId}_${AppState.currentMode}`,
      classId: AppState.currentClassId,
      mode: AppState.currentMode,
      title: `Sessione Attiva (${AppState.currentClassId})`,
      modeName: currentModeName,
      postsCount: currentPostCount,
      isCurrent: true,
      updatedAt: new Date().toLocaleDateString('it-IT')
    });

    // Cerca altre sessioni in LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('historygram_session_') && !key.endsWith(`${AppState.currentClassId}_${AppState.currentMode}`)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            const parts = key.replace('historygram_session_', '').split('_');
            const cId = parts[0] || 'Classe';
            const mId = parts.slice(1).join('_') || 'revolution_1800';
            const mName = mId === 'revolution_1800' ? "Ottocento: Revolution Influencer" : "Cinquecento: Riforma vs Controriforma";
            sessions.push({
              id: `${cId}_${mId}`,
              classId: cId,
              mode: mId,
              title: `Sessione (${cId})`,
              modeName: mName,
              postsCount: (data.approvedPosts || []).length,
              isCurrent: false,
              updatedAt: data.updatedAt || 'Precedente'
            });
          }
        }
      }
    } catch (e) {}

    let html = '';
    sessions.forEach(sess => {
      html += `
        <div class="saved-game-item" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 10px; gap: 12px;">
          <div style="flex: 1;">
            <div style="font-weight: 800; color: var(--text-main); font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-graduation-cap" style="color: var(--accent-green);"></i>
              ${sess.title}
              ${sess.isCurrent ? '<span style="font-size: 0.7rem; background: rgba(5,150,105,0.15); color: var(--accent-green); padding: 2px 8px; border-radius: 20px; font-weight: 700;">IN CORSO</span>' : ''}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
              ${sess.modeName} &bull; <strong>${sess.postsCount}</strong> post pubblicati
            </div>
          </div>
          <div>
            <button class="btn-primary-action" style="padding: 8px 16px; font-size: 0.85rem;" onclick="HistoryGramApp.resumeSavedSession('${sess.classId}', '${sess.mode}')">
              <i class="fa-solid fa-play"></i> Riprendi
            </button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  function resumeSavedSession(classId, mode) {
    AppState.currentClassId = classId;
    AppState.currentMode = mode;
    closeSavedGamesModal();
    connectSession();
    renderAll();
    showToast("📂 Sessione ripresa con successo! Feed aggiornato.", "toast-success");
    showView('view-game');
  }

  /* ================= EXPORT API GLOBALE ================= */
  window.HistoryGramApp = {
    showView,
    startSetupFlow,
    selectSetupMode,
    onSetupClassChange,
    selectPawnFaction,
    handleStudentChipClick,
    toggleStudentAssignment,
    saveCurrentFactionTeam,
    addCustomStudent,
    resetTeamAssignments,
    autoDistributeTeams,
    launchGameFromSetup,
    toggleUserDropdown,
    openMiniguidaModal,
    closeMiniguidaModal,
    nextGuideStep,
    prevGuideStep,
    openSavedGamesModal,
    closeSavedGamesModal,
    resumeSavedSession,
    unlockTeacherFromView,
    switchTeacherTab,
    saveTeamsFromView,
    saveClassCodeFromView,
    resetSession,
    goToUnifiedLogin,
    confirmLogout,
    approvePost,
    rejectPost,
    toggleLike,
    ratePost,
    openFlameModal,
    openCharDetailModal,
    closeCharDetailModal,
    isTeacherUser,
    isSuperAdminUser,
    updateTeacherNavVisibility
  };

  window.addEventListener('DOMContentLoaded', init);

})();
