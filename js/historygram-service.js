/**
 * HistoryGram - Servizio Dati & Gestione Classi/Squadre (Stile Fantaletteratura)
 * Connesso a Firestore `prof-memmo-hub` con Fallback LocalStorage
 */

class HistoryGramService {
  constructor() {
    this.collectionName = 'historygram_sessions';
    this.classesCollection = 'classes';
    this.localKeyPrefix = 'historygram_session_';
  }

  // Recupera le classi create dal docente nell'Hub
  async getTeacherClasses(teacherId) {
    if (window.fbDb && teacherId) {
      try {
        const snap = await window.fbDb.collection(this.classesCollection)
          .where('teacherId', '==', teacherId)
          .get();
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn("⚠️ Recupero classi docente da Firestore fallito, uso classi locali:", e);
      }
    }
    // Fallback: recupera classi salvate localmente o mock
    try {
      const raw = localStorage.getItem('hub_teacher_classes');
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return [
      { id: 'classe_3b', code: '3B', name: 'Classe 3ª B', school: 'Scuola Secondaria' },
      { id: 'classe_2a', code: '2A', name: 'Classe 2ª A', school: 'Scuola Secondaria' },
      { id: 'classe_libera', code: 'DEMO', name: 'Sessione Demo / Banco', school: 'Laboratorio' }
    ];
  }

  // Verifica codice classe e login studente (stile loginWithClassCode di Fantaletteratura)
  async verifyClassCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (window.fbDb) {
      try {
        const snap = await window.fbDb.collection(this.classesCollection)
          .where('code', '==', code)
          .get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (e) {
        console.warn("⚠️ Verifica codice classe online non riuscita, controllo locale:", e);
      }
    }
    // Fallback locale
    return { id: 'classe_' + code.toLowerCase(), code: code, name: 'Classe ' + code, school: 'Scuola Secondaria' };
  }

  // Ascolta gli aggiornamenti in tempo reale della sessione
  subscribeSession(classId, modeId, callback) {
    const sessionId = `${classId}_${modeId}`;
    
    if (window.fbDb) {
      try {
        const docRef = window.fbDb.collection(this.collectionName).doc(sessionId);
        const unsubscribe = docRef.onSnapshot(doc => {
          if (doc.exists) {
            callback(doc.data());
          } else {
            const initial = this.getDefaultSessionState(classId, modeId);
            callback(initial);
          }
        }, err => {
          console.warn("⚠️ Errore listener Firestore, passaggio a LocalStorage:", err);
          this.listenLocalStorage(sessionId, callback);
        });
        return unsubscribe;
      } catch (e) {
        console.warn("⚠️ Firestore onSnapshot non disponibile:", e);
      }
    }

    return this.listenLocalStorage(sessionId, callback);
  }

  listenLocalStorage(sessionId, callback) {
    const key = `${this.localKeyPrefix}${sessionId}`;
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : this.getDefaultSessionState();
      } catch (e) {
        return this.getDefaultSessionState();
      }
    };

    callback(read());
    const interval = setInterval(() => callback(read()), 1200);
    return () => clearInterval(interval);
  }

  // Salva lo stato della sessione (Firestore + LocalStorage backup)
  async saveSession(classId, modeId, state) {
    const sessionId = `${classId}_${modeId}`;
    state.updatedAt = new Date().toISOString();

    // Backup locale sempre garantito
    try {
      localStorage.setItem(`${this.localKeyPrefix}${sessionId}`, JSON.stringify(state));
    } catch (e) {}

    if (window.fbDb) {
      try {
        await window.fbDb.collection(this.collectionName).doc(sessionId).set(state, { merge: true });
        return;
      } catch (e) {
        console.warn("⚠️ Salvataggio Firestore non riuscito, preservato in locale:", e);
      }
    }
  }

  // Recupera lo stato attuale
  async getSession(classId, modeId) {
    const sessionId = `${classId}_${modeId}`;
    if (window.fbDb) {
      try {
        const doc = await window.fbDb.collection(this.collectionName).doc(sessionId).get();
        if (doc.exists) return doc.data();
      } catch (e) {}
    }

    try {
      const raw = localStorage.getItem(`${this.localKeyPrefix}${sessionId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return this.getDefaultSessionState(classId, modeId);
  }

  // Gestione Squadre (Fantaletteratura style): assegna studenti ai personaggi
  async updateTeamAssignments(classId, modeId, teamAssignments) {
    const state = await this.getSession(classId, modeId);
    state.teamAssignments = teamAssignments; // { characterId: ["Marco", "Sara", "Luca"] }
    await this.saveSession(classId, modeId, state);
  }

  // Invia post alla coda di approvazione
  async submitPost(classId, modeId, post) {
    const state = await this.getSession(classId, modeId);
    state.pendingPosts = state.pendingPosts || [];
    state.pendingPosts.push(post);
    await this.saveSession(classId, modeId, state);
  }

  // Approvazione Docente (Imprimatur sulla LIM + Bonus)
  async approvePost(classId, modeId, postId, bonusFollowers = 0, teacherNote = "") {
    const state = await this.getSession(classId, modeId);
    state.pendingPosts = state.pendingPosts || [];
    state.approvedPosts = state.approvedPosts || [];
    state.scores = state.scores || {};

    const idx = state.pendingPosts.findIndex(p => p.id === postId);
    if (idx === -1) return;

    const post = state.pendingPosts.splice(idx, 1)[0];
    post.status = 'approved';
    post.approvedAt = new Date().toISOString();
    post.teacherNote = teacherNote;
    post.bonusFollowers = bonusFollowers;
    post.likes = post.likes || 0;
    post.ratings = post.ratings || { accuracy: 0, creativity: 0, clarity: 0, totalVotes: 0 };

    state.approvedPosts.unshift(post);

    const cId = post.characterId;
    if (!state.scores[cId]) {
      state.scores[cId] = { followers: 0, likes: 0, postsCount: 0, stars: 0 };
    }
    state.scores[cId].postsCount = (state.scores[cId].postsCount || 0) + 1;
    state.scores[cId].followers = (state.scores[cId].followers || 0) + bonusFollowers;

    await this.saveSession(classId, modeId, state);
  }

  // Rifiuta o rimanda con nota
  async rejectPost(classId, modeId, postId, reason = "") {
    const state = await this.getSession(classId, modeId);
    state.pendingPosts = state.pendingPosts || [];
    const post = state.pendingPosts.find(p => p.id === postId);
    if (post) {
      post.status = 'rejected';
      post.rejectReason = reason;
      await this.saveSession(classId, modeId, state);
    }
  }

  // Like & Follower
  async toggleLike(classId, modeId, postId, voterId) {
    const state = await this.getSession(classId, modeId);
    state.approvedPosts = state.approvedPosts || [];
    state.scores = state.scores || {};

    const post = state.approvedPosts.find(p => p.id === postId);
    if (!post) return;

    post.likedBy = post.likedBy || [];
    const vIdx = post.likedBy.indexOf(voterId);
    const cId = post.characterId;
    if (!state.scores[cId]) {
      state.scores[cId] = { followers: 0, likes: 0, postsCount: 0, stars: 0 };
    }

    if (vIdx === -1) {
      post.likedBy.push(voterId);
      post.likes = (post.likes || 0) + 1;
      state.scores[cId].likes = (state.scores[cId].likes || 0) + 1;
      state.scores[cId].followers = (state.scores[cId].followers || 0) + 1;
    } else {
      post.likedBy.splice(vIdx, 1);
      post.likes = Math.max(0, (post.likes || 1) - 1);
      state.scores[cId].likes = Math.max(0, (state.scores[cId].likes || 1) - 1);
      state.scores[cId].followers = Math.max(0, (state.scores[cId].followers || 1) - 1);
    }

    await this.saveSession(classId, modeId, state);
  }

  // Valutazione Tripla (XVI Secolo: Accuratezza, Creatività, Chiarezza)
  async addRating(classId, modeId, postId, voterId, ratingObj) {
    const state = await this.getSession(classId, modeId);
    state.approvedPosts = state.approvedPosts || [];
    state.scores = state.scores || {};

    const post = state.approvedPosts.find(p => p.id === postId);
    if (!post) return;

    post.ratingsVotes = post.ratingsVotes || {};
    post.ratingsVotes[voterId] = ratingObj;

    const votes = Object.values(post.ratingsVotes);
    const total = votes.length;
    const sumAcc = votes.reduce((s, v) => s + (v.accuracy || 0), 0);
    const sumCrea = votes.reduce((s, v) => s + (v.creativity || 0), 0);
    const sumClar = votes.reduce((s, v) => s + (v.clarity || 0), 0);

    post.ratings = {
      accuracy: +(sumAcc / total).toFixed(1),
      creativity: +(sumCrea / total).toFixed(1),
      clarity: +(sumClar / total).toFixed(1),
      totalVotes: total
    };

    const cId = post.characterId;
    if (!state.scores[cId]) {
      state.scores[cId] = { followers: 0, likes: 0, postsCount: 0, stars: 0 };
    }
    state.scores[cId].stars = +( (sumAcc + sumCrea + sumClar) / (total * 3) ).toFixed(2);

    await this.saveSession(classId, modeId, state);
  }

  // Flame / Commento di replica storica
  async addComment(classId, modeId, postId, comment) {
    const state = await this.getSession(classId, modeId);
    state.approvedPosts = state.approvedPosts || [];
    const post = state.approvedPosts.find(p => p.id === postId);
    if (!post) return;

    post.comments = post.comments || [];
    post.comments.push(comment);
    await this.saveSession(classId, modeId, state);
  }

  // Reset Sessione
  async resetSession(classId, modeId) {
    const empty = this.getDefaultSessionState(classId, modeId);
    await this.saveSession(classId, modeId, empty);
  }

  getDefaultSessionState(classId, modeId) {
    return {
      classId: classId || 'classe_3b',
      modeId: modeId || 'revolution_1800',
      teamAssignments: {}, // characterId -> [studenti]
      pendingPosts: [],
      approvedPosts: [],
      scores: {},
      createdAt: new Date().toISOString()
    };
  }
}

window.HistoryGramService = new HistoryGramService();
