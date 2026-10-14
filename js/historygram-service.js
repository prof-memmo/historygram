/**
 * HistoryGram - Servizio Dati & Gestione Classi/Squadre (Stile Fantaletteratura)
 * Connesso a Firestore `prof-memmo-hub` con Fallback LocalStorage
 */

class HistoryGramService {
  constructor() {
    this.collectionName = 'historygram_sessions';
    this.classesCollection = 'hub_classes';
    this.localKeyPrefix = 'historygram_session_';
  }

  // Recupera le classi create dal docente nell'Hub (multi-query robusta su hub_classes e classes)
  async getTeacherClasses(teacherUser) {
    let uid = null;
    let email = '';
    if (teacherUser) {
      uid = typeof teacherUser === 'string' ? teacherUser : (teacherUser.uid || null);
      email = (typeof teacherUser === 'object' && teacherUser.email) ? teacherUser.email.toLowerCase() : '';
    } else if (window.fbAuth && window.fbAuth.currentUser) {
      uid = window.fbAuth.currentUser.uid;
      email = (window.fbAuth.currentUser.email || '').toLowerCase();
    }

    if (window.fbDb && (uid || email)) {
      try {
        const queries = [];
        if (uid) {
          queries.push(window.fbDb.collection('hub_classes').where('teacherId', '==', uid).get().catch(() => ({ docs: [] })));
          queries.push(window.fbDb.collection('hub_classes').where('teacherIds', 'array-contains', uid).get().catch(() => ({ docs: [] })));
          queries.push(window.fbDb.collection('classes').where('teacherId', '==', uid).get().catch(() => ({ docs: [] })));
          queries.push(window.fbDb.collection('classes').where('teacherIds', 'array-contains', uid).get().catch(() => ({ docs: [] })));
        }
        if (email) {
          queries.push(window.fbDb.collection('hub_classes').where('teacherEmail', '==', email).get().catch(() => ({ docs: [] })));
          queries.push(window.fbDb.collection('hub_classes').where('collaboratori', 'array-contains', email).get().catch(() => ({ docs: [] })));
          queries.push(window.fbDb.collection('classes').where('teacherEmail', '==', email).get().catch(() => ({ docs: [] })));
          queries.push(window.fbDb.collection('classes').where('collaboratori', 'array-contains', email).get().catch(() => ({ docs: [] })));
        }

        const results = await Promise.all(queries);
        const classMap = new Map();
        results.forEach(snap => {
          if (snap && snap.docs) {
            snap.docs.forEach(doc => {
              classMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
          }
        });

        if (classMap.size > 0) {
          const classList = Array.from(classMap.values());
          // Per ciascuna classe, se gli studenti non sono salvati direttamente nell'oggetto, recuperali da hub_users per classCode
          for (let cls of classList) {
            const hasDirectStudents = (Array.isArray(cls.students) && cls.students.length > 0) ||
                                      (Array.isArray(cls.studenti) && cls.studenti.length > 0) ||
                                      (Array.isArray(cls.studentNames) && cls.studentNames.length > 0);
            if (!hasDirectStudents) {
              const code = (cls.code || cls.classCode || '').toUpperCase();
              if (code) {
                try {
                  const uSnap = await window.fbDb.collection('hub_users').where('classCode', '==', code).get();
                  if (!uSnap.empty) {
                    cls.students = uSnap.docs
                      .map(d => ({ uid: d.id, ...d.data() }))
                      .filter(u => {
                        const r = (u.role || '').toLowerCase();
                        return r !== 'docente' && r !== 'admin' && r !== 'insegnante';
                      })
                      .map(u => {
                        if (u.anagrafica) {
                          const full = `${u.anagrafica.nome || ''} ${u.anagrafica.cognome || ''}`.trim();
                          if (full) return full;
                        }
                        if (u.nome || u.cognome) {
                          const full = `${u.nome || ''} ${u.cognome || ''}`.trim();
                          if (full) return full;
                        }
                        return u.displayName || u.name || (u.email ? u.email.split('@')[0] : '') || u.nickname || 'Studente';
                      });
                  }
                } catch(e) {}
              }
            }
          }

          try {
            localStorage.setItem('hub_teacher_classes', JSON.stringify(classList));
          } catch (e) {}
          return classList;
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
        let snap = await window.fbDb.collection('hub_classes')
          .where('code', '==', code)
          .get();
        if (snap.empty) {
          snap = await window.fbDb.collection('classes')
            .where('code', '==', code)
            .get();
        }
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

  // Ascolta gli aggiornamenti in tempo reale della sessione (Firestore con fallback LocalStorage)
  subscribeSession(classId, modeId, callback) {
    const sessionId = `${classId}_${modeId}`;
    let activeCleanup = null;
    let isCleanedUp = false;
    
    if (window.fbDb) {
      try {
        const docRef = window.fbDb.collection(this.collectionName).doc(sessionId);
        const unsubscribeFirestore = docRef.onSnapshot(doc => {
          if (doc.exists) {
            callback(doc.data());
          } else {
            // Se non esiste ancora su Firestore, verifica se c'è un backup locale salvato
            const localRaw = localStorage.getItem(`${this.localKeyPrefix}${sessionId}`);
            if (localRaw) {
              try {
                const localData = JSON.parse(localRaw);
                callback(localData);
                // Prova a sincronizzare verso Firestore
                docRef.set(localData, { merge: true }).catch(() => {});
                return;
              } catch (e) {}
            }
            const initial = this.getDefaultSessionState(classId, modeId);
            callback(initial);
          }
        }, err => {
          console.warn("⚠️ Listener Firestore (passaggio a LocalStorage):", err && err.message);
          if (!isCleanedUp) {
            activeCleanup = this.listenLocalStorage(sessionId, callback);
          }
        });

        return () => {
          isCleanedUp = true;
          try { unsubscribeFirestore(); } catch(e) {}
          if (typeof activeCleanup === 'function') activeCleanup();
        };
      } catch (e) {
        console.warn("⚠️ Firestore onSnapshot non disponibile:", e);
      }
    }

    return this.listenLocalStorage(sessionId, callback);
  }

  listenLocalStorage(sessionId, callback) {
    const key = `${this.localKeyPrefix}${sessionId}`;
    let lastRaw = null;

    const checkUpdate = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw === lastRaw) return;
        lastRaw = raw;
        if (raw) {
          try {
            callback(JSON.parse(raw));
          } catch(e) {}
        }
      } catch (e) {
        console.warn("⚠️ Errore lettura sessione locale:", e);
      }
    };

    checkUpdate();
    const interval = setInterval(checkUpdate, 1500);
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

  // Gestione Squadre: assegna studenti ai personaggi storici
  async updateTeamAssignments(classId, modeId, teamAssignments) {
    const state = await this.getSession(classId, modeId);
    state.teamAssignments = teamAssignments; // { characterId: ["Marco", "Sara", "Luca"] }
    await this.saveSession(classId, modeId, state);
  }

  // Alias compatibile per assegnazione massiva squadre
  async bulkAssignTeams(classId, modeId, teamAssignments) {
    return this.updateTeamAssignments(classId, modeId, teamAssignments);
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
