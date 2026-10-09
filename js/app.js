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

    // Setup Flow
    setupSelectClass: document.getElementById('setupSelectClass'),
    setupTeamsRosterGrid: document.getElementById('setupTeamsRosterGrid'),
    setupSelectedModeLabel: document.getElementById('setupSelectedModeLabel'),

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
    showView(AppState.currentView, false);

    // Gestione popstate (tasto indietro/avanti)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        showView(e.state.view, false);
      } else {
        showView('view-welcome', false);
      }
    });

    console.log("HistoryGram v2.0 inizializzato con successo: Multi-View SPA & Flusso Fantaletteratura.");
  }

  /* ================= GESTIONE VISTE (MULTI-VIEW SPA) ================= */
  function showView(viewId, pushHistory = true) {
    if (!document.getElementById(viewId)) return;

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

    // Se entriamo nella Cattedra Docente, aggiorna i dati
    if (viewId === 'view-docente') {
      renderTeacherView();
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

  function selectSetupMode(modeId) {
    if (!HISTORY_MODES[modeId]) return;
    AppState.currentMode = modeId;
    renderModeUI();

    // Aggiorna etichetta modalità nel passo 2
    if (DOM.setupSelectedModeLabel) {
      DOM.setupSelectedModeLabel.textContent = HISTORY_MODES[modeId].title + " (" + HISTORY_MODES[modeId].targetClass + ")";
    }

    renderSetupClassView();
    showView('view-setup-class');
  }

  async function renderSetupClassView() {
    if (!DOM.setupSelectClass || !DOM.setupTeamsRosterGrid) return;

    // Carica classi del docente
    DOM.setupSelectClass.innerHTML = '<option value="">Caricamento classi...</option>';
    let classes = [];
    if (window.HistoryGramService) {
      classes = await window.HistoryGramService.getTeacherClasses(AppState.teacherUser ? AppState.teacherUser.uid : null);
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

    renderSetupTeamsRoster();
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
    renderSetupTeamsRoster();
  }

  function renderSetupTeamsRoster() {
    if (!DOM.setupTeamsRosterGrid) return;
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    const assignments = AppState.sessionData.teamAssignments || {};

    DOM.setupTeamsRosterGrid.innerHTML = '';
    chars.forEach(c => {
      const card = document.createElement('div');
      card.style.cssText = `background: var(--bg-secondary); border: 1.5px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px;`;

      const currentStudents = assignments[c.id] || [];

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.8rem;">${c.avatar}</span>
          <div style="flex: 1;">
            <strong style="color: var(--text-main); font-size: 0.95rem;">${escapeHtml(c.name)}</strong>
            <small style="display: block; color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(c.faction)}</small>
          </div>
        </div>
        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Studenti assegnati (separati da virgola):</label>
          <input type="text" class="form-input setup-team-input" data-char-id="${c.id}" value="${escapeHtml(currentStudents.join(', '))}" placeholder="Es. Marco, Elena, Davide" style="font-size: 0.82rem; padding: 6px 10px;">
        </div>
      `;
      DOM.setupTeamsRosterGrid.appendChild(card);
    });
  }

  function autoDistributeTeams() {
    const chars = HISTORY_MODES[AppState.currentMode].characters;
    const defaultRoster = [
      "Sara", "Marco", "Luca", "Giulia", "Matteo", "Chiara",
      "Andrea", "Francesca", "Davide", "Elena", "Federico", "Sofia",
      "Simone", "Martina", "Lorenzo", "Alessia", "Gabriele", "Valentina"
    ];

    const assignments = {};
    chars.forEach((c, idx) => {
      assignments[c.id] = [];
    });

    defaultRoster.forEach((stud, idx) => {
      const charId = chars[idx % chars.length].id;
      assignments[charId].push(stud);
    });

    AppState.sessionData.teamAssignments = assignments;
    renderSetupTeamsRoster();
    showToast("✨ Studenti distribuiti in modo equilibrato nelle squadre!", "toast-success");
  }

  async function launchGameFromSetup() {
    // Raccoglie gli input delle squadre
    const inputs = document.querySelectorAll('.setup-team-input');
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

    connectSession();
    renderAll();
    showToast("🚀 Partita avviata con successo! Benvenuti sulla LIM.", "toast-success");
    showView('view-game');
  }

  /* ================= CONTROLLO SSO UTENTE ================= */
  function checkSSOUser() {
    try {
      const ssoName = localStorage.getItem('hub_user_name') || localStorage.getItem('fanta_user_name');
      const ssoAvatar = localStorage.getItem('hub_user_avatar') || localStorage.getItem('fanta_user_avatar');
      const ssoRole = localStorage.getItem('hub_user_role') || 'docente';

      if (ssoName) {
        if (DOM.headerUserName) DOM.headerUserName.textContent = ssoName;
        if (DOM.dropdownUserName) DOM.dropdownUserName.textContent = ssoName;
        if (DOM.dropdownUserRoleSub) DOM.dropdownUserRoleSub.textContent = ssoRole === 'docente' ? 'DOCENTE ECOSISTEMA' : 'STUDENTE';
        if (ssoRole === 'docente') AppState.isTeacherUnlocked = true;
      }
      if (ssoAvatar && DOM.headerUserAvatar) {
        DOM.headerUserAvatar.src = ssoAvatar;
      }
    } catch (e) {}

    if (window.fbAuth) {
      window.fbAuth.onAuthStateChanged(user => {
        if (user) {
          AppState.teacherUser = user;
          AppState.isTeacherUnlocked = true;
          if (DOM.headerUserName) DOM.headerUserName.textContent = user.displayName || user.email.split('@')[0];
          if (DOM.dropdownUserName) DOM.dropdownUserName.textContent = user.displayName || user.email.split('@')[0];
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
            AppState.sessionData = data;
            renderAll();
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
    if (char.mainTheses) {
      thesesHtml = `
        <h4 style="color:var(--accent-gold); margin-top:14px;">📜 Tesi Teologiche &amp; Dottrinali:</h4>
        <ul style="padding-left:18px; font-size:0.9rem;">
          ${char.mainTheses.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      `;
    }

    if (DOM.mCharBody) {
      DOM.mCharBody.innerHTML = `
        <h4 style="color:var(--accent-gold); margin-top:0;">🎯 Obiettivo Storico:</h4>
        <p style="font-size:0.9rem;">${escapeHtml(char.objective)}</p>

        <h4 style="color:var(--accent-gold); margin-top:14px;">🛠️ Strumenti di Diffusione:</h4>
        <p style="font-size:0.9rem;">${escapeHtml(char.tools)}</p>

        ${thesesHtml}

        <h4 style="color:var(--accent-gold); margin-top:14px;">📢 Slogan Consigliati:</h4>
        <ul style="padding-left:18px; font-size:0.9rem;">
          ${(char.slogans || []).map(s => `<li><em>"${escapeHtml(s)}"</em></li>`).join('')}
        </ul>

        <h4 style="color:var(--accent-gold); margin-top:14px;">📖 Contesto Storico:</h4>
        <p style="font-size:0.9rem; color:var(--text-muted);">${escapeHtml(char.context || '')}</p>
      `;
    }

    DOM.modalCharDetail.classList.remove('hidden');
  }

  function openMiniguidaModal() {
    if (DOM.modalMiniguida) DOM.modalMiniguida.classList.remove('hidden');
  }

  function closeMiniguidaModal() {
    if (DOM.modalMiniguida) DOM.modalMiniguida.classList.add('hidden');
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

    // Genera chips per slogan e hashtag
    if (DOM.slogansChips) {
      DOM.slogansChips.innerHTML = '';
      (char.slogans || []).forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'chip-slogan';
        chip.textContent = `"${s}"`;
        chip.onclick = () => {
          if (DOM.inputSlogan) {
            DOM.inputSlogan.value = s;
            if (DOM.prevSlogan) DOM.prevSlogan.textContent = s;
          }
        };
        DOM.slogansChips.appendChild(chip);
      });
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
    window.location.href = 'https://profmemmo.it/portal.html';
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

  /* ================= EXPORT API GLOBALE ================= */
  window.HistoryGramApp = {
    showView,
    startSetupFlow,
    selectSetupMode,
    onSetupClassChange,
    autoDistributeTeams,
    launchGameFromSetup,
    toggleUserDropdown,
    openMiniguidaModal,
    closeMiniguidaModal,
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
    openCharDetailModal
  };

  window.addEventListener('DOMContentLoaded', init);

})();
