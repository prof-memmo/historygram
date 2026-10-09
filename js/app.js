/**
 * HistoryGram - Application Core Logic
 * Ecosistema Prof. Memmo - Conforme Regole Operative v2.1
 */

(function () {
  'use strict';

  const AppState = {
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
    // Header & SSO
    btnLogoHome: document.getElementById('btnLogoHome'),
    displayClassCode: document.getElementById('displayClassCode'),
    btnSelectClass: document.getElementById('btnSelectClass'),
    headerUserTrigger: document.getElementById('header-user-menu-trigger'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    headerUserName: document.getElementById('header-user-name'),
    headerUserAvatarImg: document.getElementById('header-user-avatar-img'),
    dropdownUserTitle: document.getElementById('dropdownUserTitle'),
    dropdownUserRole: document.getElementById('dropdownUserRole'),
    btnOpenTeacherDashboard: document.getElementById('btnOpenTeacherDashboard'),
    btnOpenTeamsManager: document.getElementById('btnOpenTeamsManager'),
    btnUserLogout: document.getElementById('btnUserLogout'),

    // Nav & Mode
    tabRevolution: document.getElementById('tabRevolution'),
    tabReformation: document.getElementById('tabReformation'),
    btnOpenCreatePost: document.getElementById('btnOpenCreatePost'),
    btnOpenTeacherModalTop: document.getElementById('btnOpenTeacherModalTop'),
    badgePendingCount: document.getElementById('badgePendingCount'),

    // Banner
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

    // Sidebar Leaderboard
    podiumWrap: document.getElementById('podiumWrap'),
    leaderboardTableBody: document.getElementById('leaderboardTableBody'),
    leaderboardMetricInfo: document.getElementById('leaderboardMetricInfo'),
    lbMetricColumnTitle: document.getElementById('lbMetricColumnTitle'),
    evaluationRulesList: document.getElementById('evaluationRulesList'),

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

    // Modal Cattedra
    modalTeacher: document.getElementById('modalTeacher'),
    btnCloseTeacherModal: document.getElementById('btnCloseTeacherModal'),
    teacherPinAuth: document.getElementById('teacherPinAuth'),
    inputTeacherPin: document.getElementById('inputTeacherPin'),
    btnUnlockTeacher: document.getElementById('btnUnlockTeacher'),
    teacherWorkArea: document.getElementById('teacherWorkArea'),
    tQueueCount: document.getElementById('tQueueCount'),
    teacherQueueList: document.getElementById('teacherQueueList'),
    settingClassCode: document.getElementById('settingClassCode'),
    btnSaveClassCode: document.getElementById('btnSaveClassCode'),
    btnResetSession: document.getElementById('btnResetSession'),

    // Modal Gestione Squadre (Fanta style)
    modalTeamsManager: document.getElementById('modalTeamsManager'),
    btnCloseTeamsModal: document.getElementById('btnCloseTeamsModal'),
    teamsGridDistribution: document.getElementById('teamsGridDistribution'),
    btnSaveTeamsDistribution: document.getElementById('btnSaveTeamsDistribution'),

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

    toastContainer: document.getElementById('toastContainer')
  };

  /* ================= INIZIALIZZAZIONE ================= */
  function init() {
    // 1. Parametri URL (es. ?class=3B&mode=revolution_1800)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('class')) {
      AppState.currentClassCode = urlParams.get('class').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      AppState.currentClassId = 'classe_' + AppState.currentClassCode.toLowerCase();
    }
    if (urlParams.get('mode') && HISTORY_MODES[urlParams.get('mode')]) {
      AppState.currentMode = urlParams.get('mode');
    }

    DOM.displayClassCode.textContent = AppState.currentClassCode;
    DOM.settingClassCode.value = AppState.currentClassCode;

    // 2. Controllo SSO Profilo Utente
    checkSSOUser();

    // 3. Setup Eventi & Interfaccia
    bindEvents();
    renderModeUI();
    connectSession();
  }

  function checkSSOUser() {
    try {
      const ssoName = localStorage.getItem('hub_user_name') || localStorage.getItem('fanta_user_name');
      const ssoAvatar = localStorage.getItem('hub_user_avatar') || localStorage.getItem('fanta_user_avatar');
      const ssoRole = localStorage.getItem('hub_user_role') || 'docente';

      if (ssoName) {
        DOM.headerUserName.textContent = ssoName;
        DOM.dropdownUserTitle.textContent = ssoName;
        DOM.dropdownUserRole.textContent = ssoRole === 'docente' ? 'Docente Ecosistema' : 'Studente';
        if (ssoRole === 'docente') AppState.isTeacherUnlocked = true;
      }
      if (ssoAvatar && DOM.headerUserAvatarImg) {
        DOM.headerUserAvatarImg.src = ssoAvatar;
      }
    } catch (e) {}

    // Ascolto Firebase Auth se inizializzato
    if (window.fbAuth) {
      window.fbAuth.onAuthStateChanged(user => {
        if (user) {
          AppState.teacherUser = user;
          AppState.isTeacherUnlocked = true;
          DOM.headerUserName.textContent = user.displayName || user.email.split('@')[0];
          DOM.dropdownUserTitle.textContent = user.displayName || user.email.split('@')[0];
        }
      });
    }
  }

  /* ================= CAMBIO MODALITÀ ================= */
  function setMode(modeId) {
    if (!HISTORY_MODES[modeId] || AppState.currentMode === modeId) return;
    AppState.currentMode = modeId;
    renderModeUI();
    connectSession();
  }

  function renderModeUI() {
    const config = HISTORY_MODES[AppState.currentMode];

    if (AppState.currentMode === 'revolution_1800') {
      DOM.tabRevolution.classList.add('active');
      DOM.tabReformation.classList.remove('active');
      DOM.bannerSubtag.textContent = '■ Terza Media • Moti Rivoluzionari dell\'Ottocento';
      DOM.lbMetricColumnTitle.textContent = 'Follower';
      DOM.leaderboardMetricInfo.textContent = 'Ogni like ❤️ vale 1 follower. Il docente può assegnare follower bonus per accuratezza storica!';
      DOM.evaluationRulesList.innerHTML = `
        <li><strong>Accuratezza Storica:</strong> Cita ideali, date e parole chiave coerenti con i moti.</li>
        <li><strong>Efficacia Social:</strong> Slogan e hashtag che accendano la passione civile.</li>
        <li><strong>Zero Anacronismi:</strong> Rispetta la tecnologia e i costumi del 1820-1848!</li>
      `;
    } else {
      DOM.tabRevolution.classList.remove('active');
      DOM.tabReformation.classList.add('active');
      DOM.bannerSubtag.textContent = '■ Seconda Media • XVI Secolo: Riforma vs Controriforma';
      DOM.lbMetricColumnTitle.textContent = 'Valutazione';
      DOM.leaderboardMetricInfo.textContent = 'Post e dissing dottrinali valutati su: Accuratezza Storica ⭐, Creatività 💡 e Chiarezza 🗣️!';
      DOM.evaluationRulesList.innerHTML = `
        <li><strong>Rigore Dottrinale:</strong> Fai emergere le tesi chiave del tuo personaggio (Sola Fide, Concilio).</li>
        <li><strong>Flame Storico:</strong> Sfida gli avversari con argomenti teologici precisi.</li>
        <li><strong>Rispetto & Regole:</strong> Battaglie di idee e concetti, mai offese personali!</li>
      `;
    }

    DOM.bannerHeading.textContent = config.title + ' – ' + config.subtitle;
    DOM.bannerDescription.textContent = config.description;

    renderStoriesBar();
    populateSelectCharacters();
  }

  /* ================= STORIES D'EPOCA ================= */
  function renderStoriesBar() {
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    DOM.storiesList.innerHTML = '';

    characters.forEach(char => {
      const charScore = (AppState.sessionData.scores && AppState.sessionData.scores[char.id]) || { followers: 0 };
      const metricLabel = charScore.followers + ' follower';

      const card = document.createElement('div');
      card.className = 'story-item-card';
      card.onclick = () => openCharDetailModal(char.id);

      card.innerHTML = `
        <div class="story-ring-border" style="background: linear-gradient(45deg, ${char.accentColor}, #ffd700)">
          <div class="story-avatar-box">${char.avatar}</div>
        </div>
        <span class="story-title-name" title="${char.name}">${char.name}</span>
        <span class="story-score-badge">${metricLabel}</span>
      `;
      DOM.storiesList.appendChild(card);
    });
  }

  /* ================= CONNESSIONE FIRESTORE / SESSIONE ================= */
  function connectSession() {
    if (AppState.unsubscribeSession) {
      AppState.unsubscribeSession();
    }

    AppState.unsubscribeSession = window.HistoryGramService.subscribeSession(
      AppState.currentClassId,
      AppState.currentMode,
      (data) => {
        AppState.sessionData = data || { pendingPosts: [], approvedPosts: [], scores: {}, teamAssignments: {} };
        renderFeed();
        renderLeaderboard();
        renderTeacherQueue();
        renderStoriesBar();
        updateBannerStats();
      }
    );
  }

  function updateBannerStats() {
    const posts = AppState.sessionData.approvedPosts || [];
    DOM.statApprovedPostsTotal.textContent = posts.length;

    let totFollowers = 0;
    if (AppState.sessionData.scores) {
      Object.values(AppState.sessionData.scores).forEach(s => totFollowers += (s.followers || 0));
    }
    DOM.statFollowersTotal.textContent = totFollowers;
  }

  /* ================= FEED LIVE LIM ================= */
  function renderFeed() {
    const posts = AppState.sessionData.approvedPosts || [];
    DOM.feedStream.innerHTML = '';
    DOM.feedPostsCount.textContent = `(${posts.length} post)`;

    if (posts.length === 0) {
      DOM.feedStream.appendChild(DOM.emptyFeedState);
      DOM.emptyFeedState.style.display = 'block';
      return;
    }

    DOM.emptyFeedState.style.display = 'none';

    posts.forEach(post => {
      const card = createPostCard(post);
      DOM.feedStream.appendChild(card);
    });
  }

  function createPostCard(post) {
    const char = getCharacterById(post.characterId);
    const card = document.createElement('article');
    card.className = 'post-card';

    const isLiked = (post.likedBy || []).includes(AppState.localVoterId);
    const likesCount = post.likes || 0;
    const commentsCount = (post.comments || []).length;
    const styleClass = 'style-' + (post.style || 'parchment');

    let bonusBadge = post.bonusFollowers > 0 
      ? `<span class="bonus-pill">+${post.bonusFollowers} Bonus Merito ⭐</span>` 
      : '';

    let teacherNoteHtml = post.teacherNote 
      ? `<div class="post-teacher-feedback"><strong>Nota Cattedra:</strong> ${escapeHtml(post.teacherNote)}</div>` 
      : '';

    let tagsHtml = '';
    if (post.hashtags) {
      const arr = Array.isArray(post.hashtags) ? post.hashtags : post.hashtags.split(' ');
      tagsHtml = arr.filter(t => t.startsWith('#')).map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join(' ');
    }

    // Rating Widget per XVI Secolo
    let ratingsHtml = '';
    if (AppState.currentMode === 'reformation_1500') {
      const r = post.ratings || { accuracy: 0, creativity: 0, clarity: 0, totalVotes: 0 };
      ratingsHtml = `
        <div class="ratings-bar-box">
          <div class="ratings-numbers">
            <span>Accuratezza: <strong>${r.accuracy}⭐</strong></span>
            <span>Creatività: <strong>${r.creativity}💡</strong></span>
            <span>Chiarezza: <strong>${r.clarity}🗣️</strong></span>
            <small>(${r.totalVotes} voti)</small>
          </div>
          <button class="btn-vote-stars" onclick="window.HistoryGramApp.ratePost('${post.id}')">
            ⭐ Vota Post
          </button>
        </div>
      `;
    }

    // Thread commenti di dissing
    let threadHtml = '';
    if (post.comments && post.comments.length > 0) {
      const items = post.comments.map(c => {
        const cChar = getCharacterById(c.characterId);
        return `
          <div class="thread-item">
            <span style="font-size:1.2rem;">${cChar ? cChar.avatar : '📜'}</span>
            <div class="thread-bubble">
              <strong>${escapeHtml(c.authorName)} (${cChar ? cChar.name : ''})</strong>
              <div>${escapeHtml(c.text)}</div>
            </div>
          </div>
        `;
      }).join('');
      threadHtml = `<div class="post-thread-comments">${items}</div>`;
    }

    card.innerHTML = `
      <div class="post-top-header">
        <div class="post-author-info">
          <div class="post-avatar-frame">${char ? char.avatar : '📜'}</div>
          <div class="post-name-text">
            <strong>${char ? char.name : post.characterName} <i class="fa-solid fa-circle-check" style="color:#38bdf8; font-size:0.8rem;"></i></strong>
            <small>${escapeHtml(post.authorGroupName)} • ${char ? char.faction : ''}</small>
          </div>
        </div>
        <div>
          ${bonusBadge}
          <span class="imprimatur-stamp">✓ Imprimatur</span>
        </div>
      </div>

      <div class="post-banner-headline ${styleClass}">
        "${escapeHtml(post.slogan)}"
      </div>

      <div class="post-inner-body">
        <div class="post-body-text">${escapeHtml(post.text)}</div>
        <div class="post-tags-row">${tagsHtml}</div>
        ${teacherNoteHtml}
      </div>

      ${ratingsHtml}

      <div class="post-bottom-actions">
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn-like ${isLiked ? 'liked' : ''}" onclick="window.HistoryGramApp.toggleLike('${post.id}')">
            <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
            <span>${likesCount} Follower</span>
          </button>
          
          <button class="btn-flame" onclick="window.HistoryGramApp.openFlameModal('${post.id}')">
            <i class="fa-regular fa-comment-dots"></i>
            <span>Replica / Flame (${commentsCount})</span>
          </button>
        </div>

        <button class="btn-icon-subtle" onclick="window.HistoryGramApp.openCharDetailModal('${post.characterId}')" style="color:var(--accent-gold); font-size:0.82rem; text-decoration:underline;">
          Fonti & Scheda
        </button>
      </div>

      ${threadHtml}
    `;

    return card;
  }

  /* ================= LEADERBOARD & PODIO ================= */
  function renderLeaderboard() {
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    const scores = AppState.sessionData.scores || {};

    const sorted = [...characters].map(char => {
      const s = scores[char.id] || { followers: 0, likes: 0, postsCount: 0, stars: 0 };
      return {
        char,
        followers: s.followers || 0,
        likes: s.likes || 0,
        postsCount: s.postsCount || 0,
        stars: s.stars || 0
      };
    }).sort((a, b) => {
      if (AppState.currentMode === 'reformation_1500') {
        return (b.followers + b.stars * 10) - (a.followers + a.stars * 10);
      }
      return b.followers - a.followers;
    });

    // Podio
    DOM.podiumWrap.innerHTML = '';
    const top3 = [sorted[1], sorted[0], sorted[2]];
    const classes = ['pillar-second', 'pillar-first', 'pillar-third'];
    const ranks = ['2°', '1°', '3°'];

    top3.forEach((item, i) => {
      if (!item) return;
      const col = document.createElement('div');
      col.className = 'podium-column';
      const val = AppState.currentMode === 'reformation_1500' && item.stars > 0
        ? `${item.followers} 👤 (${item.stars}⭐)`
        : `${item.followers} Follower`;

      col.innerHTML = `
        <div class="podium-char-avatar">${item.char.avatar}</div>
        <span class="podium-char-name">${item.char.name}</span>
        <div class="podium-block-pillar ${classes[i]}">${ranks[i]}</div>
        <span class="podium-stat-val">${val}</span>
      `;
      DOM.podiumWrap.appendChild(col);
    });

    // Tabella
    DOM.leaderboardTableBody.innerHTML = '';
    sorted.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const metric = AppState.currentMode === 'reformation_1500' && item.stars > 0
        ? `<strong>${item.followers}</strong> <small>(${item.stars}⭐)</small>`
        : `<strong>${item.followers}</strong>`;

      tr.innerHTML = `
        <td style="color:var(--text-muted); font-weight:800;">#${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span>${item.char.avatar}</span>
            <span style="font-weight:600;">${item.char.name}</span>
          </div>
        </td>
        <td>${item.postsCount}</td>
        <td class="text-right" style="color:var(--accent-gold); font-weight:800;">${metric}</td>
      `;
      DOM.leaderboardTableBody.appendChild(tr);
    });
  }

  /* ================= CODA CATTEDRA DOCENTE ================= */
  function renderTeacherQueue() {
    const pending = AppState.sessionData.pendingPosts || [];
    DOM.tQueueCount.textContent = pending.length;
    DOM.badgePendingCount.textContent = pending.length;

    if (pending.length > 0) {
      DOM.badgePendingCount.classList.remove('hidden');
    } else {
      DOM.badgePendingCount.classList.add('hidden');
    }

    DOM.teacherQueueList.innerHTML = '';

    if (pending.length === 0) {
      DOM.teacherQueueList.innerHTML = `
        <div style="text-align:center; padding:35px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-mug-hot" style="font-size:2.5rem; margin-bottom:12px; color:var(--accent-gold);"></i>
          <h4>Nessun post in attesa di imprimatur!</h4>
          <p>Tutti i proclami dei gruppi sono stati esaminati.</p>
        </div>
      `;
      return;
    }

    pending.forEach(post => {
      const char = getCharacterById(post.characterId);
      const card = document.createElement('div');
      card.className = 'queue-card-styled';

      card.innerHTML = `
        <div class="queue-card-meta">
          <strong>${char ? char.avatar : '📜'} ${char ? char.name : post.characterName} — <span style="font-weight:normal; color:var(--text-muted);">${escapeHtml(post.authorGroupName)}</span></strong>
          <small style="color:var(--text-dim);">${new Date(post.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
        </div>
        <div class="queue-headline">"${escapeHtml(post.slogan)}"</div>
        <div class="queue-text-body">${escapeHtml(post.text)}</div>
        <div style="color:#38bdf8; font-size:0.85rem; margin-bottom:12px;">${escapeHtml(post.hashtags || '')}</div>

        <div class="queue-bottom-row">
          <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
            <label for="bonus_${post.id}">Bonus Merito:</label>
            <select id="bonus_${post.id}" class="form-input" style="width:auto; padding:4px 8px; font-size:0.85rem;">
              <option value="0">+0 (Standard)</option>
              <option value="1">+1 Follower (Buona argomentazione)</option>
              <option value="2">+2 Follower (Fonti storiche corrette)</option>
              <option value="5">+5 Follower (Eccezionale rigore!)</option>
            </select>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn-reject" onclick="window.HistoryGramApp.rejectPost('${post.id}')">
              ✕ Rimanda
            </button>
            <button class="btn-approve" onclick="window.HistoryGramApp.approvePost('${post.id}')">
              ✓ Concedi Imprimatur
            </button>
          </div>
        </div>
      `;
      DOM.teacherQueueList.appendChild(card);
    });
  }

  /* ================= GESTIONE SQUADRE (MODELLO FANTALETTERATURA) ================= */
  function openTeamsManagerModal() {
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    const assignments = AppState.sessionData.teamAssignments || {};

    DOM.teamsGridDistribution.innerHTML = '';

    characters.forEach(char => {
      const box = document.createElement('div');
      box.className = 'team-box-card';
      const studentsList = (assignments[char.id] || []).join(', ');

      box.innerHTML = `
        <div class="team-box-header">
          <span class="team-box-avatar">${char.avatar}</span>
          <div>
            <div class="team-box-title">${char.name}</div>
            <small style="color:var(--text-muted); font-size:0.75rem;">${char.faction}</small>
          </div>
        </div>
        <label style="font-size:0.78rem; font-weight:600; display:block; margin-bottom:4px;">
          Studenti assegnati (separati da virgola):
        </label>
        <textarea class="team-students-textarea" id="team_assign_${char.id}" rows="2" placeholder="Es. Sara B., Luca M., Marco T.">${escapeHtml(studentsList)}</textarea>
      `;
      DOM.teamsGridDistribution.appendChild(box);
    });

    DOM.modalTeamsManager.classList.remove('hidden');
  }

  function saveTeamsDistribution() {
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    const newAssignments = {};

    characters.forEach(char => {
      const textarea = document.getElementById(`team_assign_${char.id}`);
      if (textarea) {
        const val = textarea.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        newAssignments[char.id] = val;
      }
    });

    window.HistoryGramService.updateTeamAssignments(AppState.currentClassId, AppState.currentMode, newAssignments).then(() => {
      DOM.modalTeamsManager.classList.add('hidden');
      showToast('✓ Distribuzione squadre salvata con successo!', 'toast-success');
    });
  }

  /* ================= CREAZIONE POST & ANTEPRIMA LIVE ================= */
  function populateSelectCharacters() {
    const characters = HISTORY_MODES[AppState.currentMode].characters;
    DOM.selectCharacter.innerHTML = '';
    DOM.selectCommentChar.innerHTML = '';

    characters.forEach(char => {
      const opt = document.createElement('option');
      opt.value = char.id;
      opt.textContent = `${char.avatar} ${char.name} (${char.faction})`;
      DOM.selectCharacter.appendChild(opt);

      const optC = document.createElement('option');
      optC.value = char.id;
      optC.textContent = `${char.avatar} ${char.name}`;
      DOM.selectCommentChar.appendChild(optC);
    });

    updateSuggestions();
    updatePreview();
  }

  function updateSuggestions() {
    const char = getCharacterById(DOM.selectCharacter.value);
    if (!char) return;

    DOM.slogansChips.innerHTML = '';
    (char.slogans || []).forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'chip-tag';
      chip.textContent = s;
      chip.onclick = () => { DOM.inputSlogan.value = s; updatePreview(); };
      DOM.slogansChips.appendChild(chip);
    });

    DOM.hashtagsChips.innerHTML = '';
    (char.hashtags || []).forEach(h => {
      const chip = document.createElement('span');
      chip.className = 'chip-tag';
      chip.textContent = h;
      chip.onclick = () => {
        const cur = DOM.inputHashtags.value.trim();
        if (!cur.includes(h)) {
          DOM.inputHashtags.value = cur ? `${cur} ${h}` : h;
          updatePreview();
        }
      };
      DOM.hashtagsChips.appendChild(chip);
    });

    updatePreview();
  }

  function updatePreview() {
    const char = getCharacterById(DOM.selectCharacter.value);
    if (!char) return;

    DOM.prevAvatar.textContent = char.avatar;
    DOM.prevCharName.textContent = char.name;
    DOM.prevGroupName.textContent = DOM.inputGroupName.value.trim() || 'Team Studenti';
    DOM.prevSlogan.textContent = DOM.inputSlogan.value.trim() || 'Slogan virale del post...';
    DOM.prevText.textContent = DOM.inputText.value.trim() || 'Scrivi il messaggio storico...';
    DOM.prevTags.textContent = DOM.inputHashtags.value.trim() || '#Storia #ProfMemmo';
    DOM.charCounter.textContent = DOM.inputText.value.length;

    const style = document.querySelector('input[name="postStyle"]:checked')?.value || 'parchment';
    DOM.prevBanner.className = `preview-banner-styled style-${style}`;
  }

  /* ================= EVENTI DOM ================= */
  function bindEvents() {
    // Nav Tabs Modalità
    DOM.tabRevolution.onclick = () => setMode('revolution_1800');
    DOM.tabReformation.onclick = () => setMode('reformation_1500');

    // Logo Home & Refresh
    DOM.btnLogoHome.onclick = () => {
      renderFeed();
      renderLeaderboard();
      showToast('Feed sincronizzato!', 'toast-info');
    };
    DOM.btnRefreshFeed.onclick = () => {
      connectSession();
      showToast('Dati aggiornati!', 'toast-info');
    };

    // Toggle Dropdown SSO
    window.addEventListener('click', () => {
      DOM.userDropdownMenu.classList.add('hidden');
    });

    // Modale Crea Post
    DOM.btnOpenCreatePost.onclick = () => {
      DOM.modalCreatePost.classList.remove('hidden');
      updatePreview();
    };
    DOM.btnCloseCreateModal.onclick = () => DOM.modalCreatePost.classList.add('hidden');

    DOM.selectCharacter.onchange = updateSuggestions;
    DOM.inputGroupName.oninput = updatePreview;
    DOM.inputSlogan.oninput = updatePreview;
    DOM.inputText.oninput = updatePreview;
    DOM.inputHashtags.oninput = updatePreview;

    const styleCards = document.querySelectorAll('.style-card');
    styleCards.forEach(c => {
      c.onclick = () => {
        styleCards.forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        c.querySelector('input').checked = true;
        updatePreview();
      };
    });

    DOM.formCreatePost.onsubmit = (e) => {
      e.preventDefault();
      const charId = DOM.selectCharacter.value;
      const char = getCharacterById(charId);

      const post = {
        id: 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        characterId: charId,
        characterName: char ? char.name : 'Influencer',
        authorGroupName: DOM.inputGroupName.value.trim(),
        slogan: DOM.inputSlogan.value.trim(),
        text: DOM.inputText.value.trim(),
        hashtags: DOM.inputHashtags.value.trim(),
        style: document.querySelector('input[name="postStyle"]:checked')?.value || 'parchment',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      window.HistoryGramService.submitPost(AppState.currentClassId, AppState.currentMode, post).then(() => {
        DOM.modalCreatePost.classList.add('hidden');
        DOM.formCreatePost.reset();
        updateSuggestions();
        showToast('🚀 Post inviato alla Cattedra per approvazione!', 'toast-success');
      });
    };

    // Modale Cattedra Docente
    const openTeacher = () => {
      DOM.modalTeacher.classList.remove('hidden');
      if (AppState.isTeacherUnlocked) {
        DOM.teacherPinAuth.classList.add('hidden');
        DOM.teacherWorkArea.classList.remove('hidden');
      } else {
        DOM.teacherPinAuth.classList.remove('hidden');
        DOM.teacherWorkArea.classList.add('hidden');
        DOM.inputTeacherPin.value = '';
        DOM.inputTeacherPin.focus();
      }
    };
    DOM.btnOpenTeacherModalTop.onclick = openTeacher;
    DOM.btnOpenTeacherDashboard.onclick = openTeacher;
    DOM.btnCloseTeacherModal.onclick = () => DOM.modalTeacher.classList.add('hidden');

    DOM.btnUnlockTeacher.onclick = unlockTeacher;
    DOM.inputTeacherPin.onkeypress = (e) => { if (e.key === 'Enter') unlockTeacher(); };

    // Tabs Cattedra
    const tNavBtns = document.querySelectorAll('.t-nav-btn');
    tNavBtns.forEach(btn => {
      btn.onclick = () => {
        tNavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('paneQueue').classList.toggle('hidden', tab !== 'queue');
        document.getElementById('paneSettings').classList.toggle('hidden', tab !== 'settings');
      };
    });

    // Gestione Squadre Modello Fanta
    DOM.btnOpenTeamsManager.onclick = openTeamsManagerModal;
    DOM.btnCloseTeamsModal.onclick = () => DOM.modalTeamsManager.classList.add('hidden');
    DOM.btnSaveTeamsDistribution.onclick = saveTeamsDistribution;

    // Modale Scheda Personaggio
    DOM.btnCloseCharModal.onclick = () => DOM.modalCharDetail.classList.add('hidden');
    DOM.btnSelectCharFromModal.onclick = () => {
      DOM.modalCharDetail.classList.add('hidden');
      DOM.selectCharacter.value = AppState.selectedCharModalId;
      updateSuggestions();
      DOM.modalCreatePost.classList.remove('hidden');
    };

    // Modale Flame
    DOM.btnCloseCommentModal.onclick = () => DOM.modalFlameComment.classList.add('hidden');
    DOM.formAddComment.onsubmit = (e) => {
      e.preventDefault();
      if (!AppState.activeFlameTargetPostId) return;

      const comment = {
        id: 'c_' + Date.now(),
        characterId: DOM.selectCommentChar.value,
        authorName: DOM.inputCommentAuthor.value.trim(),
        text: DOM.inputCommentText.value.trim(),
        createdAt: new Date().toISOString()
      };

      window.HistoryGramService.addComment(AppState.currentClassId, AppState.currentMode, AppState.activeFlameTargetPostId, comment).then(() => {
        DOM.modalFlameComment.classList.add('hidden');
        DOM.formAddComment.reset();
        showToast('💬 Replica pubblicata nel dibattito storico!', 'toast-success');
      });
    };

    // Cambio / Salvataggio Classe
    DOM.btnSaveClassCode.onclick = () => {
      const code = DOM.settingClassCode.value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (code) {
        AppState.currentClassCode = code;
        AppState.currentClassId = 'classe_' + code.toLowerCase();
        DOM.displayClassCode.textContent = code;
        connectSession();
        showToast(`Classe impostata su: ${code}`, 'toast-success');
      }
    };

    DOM.btnSelectClass.onclick = () => {
      const p = prompt("Inserisci il Codice Classe (es. 3B, 2A):", AppState.currentClassCode);
      if (p) {
        const code = p.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        AppState.currentClassCode = code;
        AppState.currentClassId = 'classe_' + code.toLowerCase();
        DOM.displayClassCode.textContent = code;
        DOM.settingClassCode.value = code;
        connectSession();
        showToast(`Classe impostata su: ${code}`, 'toast-success');
      }
    };

    // Reset Sessione
    DOM.btnResetSession.onclick = () => {
      if (confirm(`Confermi di voler AZZERARE tutti i post e follower per la classe ${AppState.currentClassCode}?`)) {
        window.HistoryGramService.resetSession(AppState.currentClassId, AppState.currentMode).then(() => {
          showToast('Sessione azzerata!', 'toast-gold');
        });
      }
    };

    // Logout SSO
    DOM.btnUserLogout.onclick = () => {
      if (window.fbAuth) window.fbAuth.signOut();
      localStorage.removeItem('hub_user_name');
      localStorage.removeItem('hub_user_avatar');
      showToast('Disconnesso.', 'toast-info');
      setTimeout(() => window.location.href = 'https://profmemmo.it/portal.html', 500);
    };
  }

  function unlockTeacher() {
    const pin = DOM.inputTeacherPin.value.trim();
    if (pin === '1848' || pin === '1517' || pin === 'admin') {
      AppState.isTeacherUnlocked = true;
      DOM.teacherPinAuth.classList.add('hidden');
      DOM.teacherWorkArea.classList.remove('hidden');
      showToast('Cattedra Sbloccata!', 'toast-success');
    } else {
      showToast('PIN errato! Riprova con 1848 o 1517', 'toast-danger');
    }
  }

  function toggleUserDropdown() {
    DOM.userDropdownMenu.classList.toggle('hidden');
  }

  /* ================= AZIONI PUBBLICHE (window.HistoryGramApp) ================= */
  function approvePost(postId) {
    const bonusSelect = document.getElementById(`bonus_${postId}`);
    const bonus = bonusSelect ? parseInt(bonusSelect.value) || 0 : 0;
    const note = bonus > 0 ? `+${bonus} follower bonus assegnati per ottimo rigore storico!` : '';

    window.HistoryGramService.approvePost(AppState.currentClassId, AppState.currentMode, postId, bonus, note).then(() => {
      showToast('✓ Imprimatur concesso: post proiettato sulla LIM!', 'toast-success');
    });
  }

  function rejectPost(postId) {
    const reason = prompt("Inserisci una breve nota per il gruppo:", "Attenzione: anacronismo storico o argomentazione incompleta.");
    if (reason !== null) {
      window.HistoryGramService.rejectPost(AppState.currentClassId, AppState.currentMode, postId, reason).then(() => {
        showToast('Post rimandato al gruppo.', 'toast-info');
      });
    }
  }

  function toggleLike(postId) {
    window.HistoryGramService.toggleLike(AppState.currentClassId, AppState.currentMode, postId, AppState.localVoterId);
  }

  function ratePost(postId) {
    const acc = prompt("Vota Accuratezza Storica (1 - 5 stelle):", "5");
    if (!acc) return;
    const cre = prompt("Vota Creatività (1 - 5 stelle):", "4");
    if (!cre) return;
    const cla = prompt("Vota Chiarezza (1 - 5 stelle):", "5");
    if (!cla) return;

    const ratingObj = {
      accuracy: Math.min(5, Math.max(1, parseInt(acc) || 5)),
      creativity: Math.min(5, Math.max(1, parseInt(cre) || 5)),
      clarity: Math.min(5, Math.max(1, parseInt(cla) || 5))
    };

    window.HistoryGramService.addRating(AppState.currentClassId, AppState.currentMode, postId, AppState.localVoterId, ratingObj).then(() => {
      showToast('⭐ Valutazione registrata!', 'toast-gold');
    });
  }

  function openFlameModal(postId) {
    AppState.activeFlameTargetPostId = postId;
    const post = (AppState.sessionData.approvedPosts || []).find(p => p.id === postId);
    if (!post) return;

    const char = getCharacterById(post.characterId);
    DOM.commentTargetQuote.innerHTML = `
      <div style="color:var(--accent-gold); font-size:0.85rem; font-weight:700;">
        Rispondi a: ${char ? char.avatar : '📜'} ${char ? char.name : post.characterName} (${escapeHtml(post.authorGroupName)})
      </div>
      <div style="font-style:italic; font-size:0.95rem; margin-top:4px;">
        "${escapeHtml(post.slogan)}"
      </div>
    `;

    DOM.modalFlameComment.classList.remove('hidden');
  }

  function openCharDetailModal(charId) {
    const char = getCharacterById(charId);
    if (!char) return;

    AppState.selectedCharModalId = charId;
    DOM.mCharAvatar.textContent = char.avatar;
    DOM.mCharName.textContent = char.name;
    DOM.mCharFaction.textContent = char.faction;

    let thesesHtml = '';
    if (char.theses && char.theses.length > 0) {
      thesesHtml = `
        <h4 style="color:var(--accent-gold); margin-top:14px;">📜 Tesi & Dottrine Chiave:</h4>
        <ul style="padding-left:18px; font-size:0.9rem;">
          ${char.theses.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      `;
    }

    let rivalsHtml = '';
    if (char.rivals && char.rivals.length > 0) {
      rivalsHtml = `
        <h4 style="color:var(--accent-gold); margin-top:14px;">⚔️ Avversari & Rivali Storici:</h4>
        <p style="font-size:0.9rem;">${char.rivals.join(', ')}</p>
      `;
    }

    DOM.mCharBody.innerHTML = `
      <h4 style="color:var(--accent-gold);">🎯 Obiettivo Storico:</h4>
      <p style="font-size:0.9rem;">${escapeHtml(char.objective)}</p>

      <h4 style="color:var(--accent-gold); margin-top:14px;">🛠️ Strumenti di Diffusione:</h4>
      <p style="font-size:0.9rem;">${escapeHtml(char.tools)}</p>

      ${thesesHtml}
      ${rivalsHtml}

      <h4 style="color:var(--accent-gold); margin-top:14px;">📢 Slogan Consigliati:</h4>
      <ul style="padding-left:18px; font-size:0.9rem;">
        ${(char.slogans || []).map(s => `<li><em>"${escapeHtml(s)}"</em></li>`).join('')}
      </ul>

      <h4 style="color:var(--accent-gold); margin-top:14px;">📖 Contesto Storico:</h4>
      <p style="font-size:0.9rem; color:var(--text-muted);">${escapeHtml(char.context || '')}</p>
    `;

    DOM.modalCharDetail.classList.remove('hidden');
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

  function showToast(msg, type = 'toast-info') {
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

  window.HistoryGramApp = {
    toggleUserDropdown,
    approvePost,
    rejectPost,
    toggleLike,
    ratePost,
    openFlameModal,
    openCharDetailModal
  };

  window.addEventListener('DOMContentLoaded', init);

})();
