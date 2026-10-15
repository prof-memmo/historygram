/**
 * ===================================================================
 * RULES-SERVICE.JS - Modulo Centralizzato e Dinamico del Regolamento
 * Progetto: HistoryGram (Ecosistema Prof. Memmo)
 * ===================================================================
 * 
 * - Preserva fedelmente lo stile grafico nativo di HistoryGram
 * - Sincronizzazione Realtime Firestore su collezione "historygram_settings" / doc "official_rules"
 * - Fallback istantaneo offline con zero-flicker (localStorage + default)
 * - Live Editor per Super-Admin (prof.memmo@gmail.com) in view-admin
 */

(function(window) {
    'use strict';

    const SUPER_ADMIN_EMAIL = 'prof.memmo@gmail.com';

    const DEFAULT_HISTORYGRAM_RULES_TEXT = `1. Scopo del Gioco e Accesso Centralizzato
HistoryGram è il social network didattico della storia progettato per sviluppare il pensiero critico, la comprensione delle fonti e la capacità di sintesi persuasiva nella scuola secondaria di primo grado. L'accesso, la gestione del proprio account, dei piani e delle classi avvengono esclusivamente tramite il Profilo del docente sul portale principale https://prof-memmo.github.io/games/ che genera un codice univoco da condividere con gli studenti. Gli studenti calano le grandi questioni del passato nei linguaggi della comunicazione contemporanea, distinguendo tra fatti storici e propaganda.

2. Meccaniche di Voto e Follower
• 1 Like = 1 Follower: Ogni studente può votare i post avversari per premiare le tesi più convincenti e accurate.
• Imprimatur del Docente: Nessun post appare sulla LIM prima della convalida del docente, garantendo zero contenuti inappropriati.
• Bonus Cattedra (+10 Follower): Il docente può premiare la citazione corretta di date, fonti o l'eccellenza dello slogan storico.
• Flame Dottrinali e Duelli: Nelle sfide a fazioni (es. Riforma vs Controriforma), ogni replica riceve una valutazione a 3 stelle: Accuratezza ⭐, Creatività 💡, Chiarezza 🗣️.

3. Divieto di Anacronismi
I post devono rispettare la cultura materiale e gli orizzonti dell'epoca rappresentata. È severamente vietato citare tecnologie, eventi o concetti posteriori alla data storica di ambientazione.

4. Formati di Pubblicazione e Moderazione
Gli studenti pubblicano proclami, dispacci e post social storici impersonando personaggi autentici o fazioni dell'epoca. Il docente mantiene il pieno controllo della moderazione dalla Cattedra Digitale, approvando o richiedendo modifiche prima della proiezione collettiva.

5. Classifica e Influenza Storica
La popolarità e l'influenza storica delle squadre o dei singoli personaggi avanzano in base al conteggio dei Follower e ai Like ottenuti dai compagni e assegnati dalla Cattedra.

6. Benessere Digitale e Gestione delle Pause
In linea con le linee guida pedagogiche di Prof. Memmo, l'attività didattica prevede sessioni attive di massimo 45 minuti, seguite obbligatoriamente da almeno 15 minuti di pausa o debriefing non mediato da schermi, garantendo un equilibrio sostenibile tra gioco digitale e confronto in presenza.

7. Codice Deontologico e Fair Play
I partecipanti si impegnano al rispetto reciproco, al contrasto di linguaggi d'odio o denigratori e alla valorizzazione dell'accuratezza storiografica. Gli studenti identificati tramite il codice classe operano nel pieno rispetto della privacy scolastica e delle regole della comunità educativa.`;

    const RulesService = {
        _gameKey: 'historygram',
        _collectionName: 'historygram_settings',
        _docId: 'official_rules',
        _storageKey: 'historygram_rules_official_text',
        _rawText: '',
        _lastUpdated: null,
        _updatedBy: '',
        _isInitialized: false,
        _listeners: [],
        _unsubscribeFirestore: null,

        getDefaultText() {
            return DEFAULT_HISTORYGRAM_RULES_TEXT.trim();
        },

        _resolveUserEmail(explicitEmail) {
            if (explicitEmail && explicitEmail.trim().length > 0) return explicitEmail.trim();
            const fbUser = (window.fbAuth && window.fbAuth.currentUser) ||
                           (window.firebase && window.firebase.auth && window.firebase.auth().currentUser);
            if (fbUser && fbUser.email && fbUser.email.trim().length > 0) return fbUser.email.trim();
            if (window.currentUser && window.currentUser.email) return window.currentUser.email.trim();
            if (window.currentUserEmail) return window.currentUserEmail.trim();

            const candidates = ['currentUser', 'user', 'eroi_user_profile', 'userProfile'];
            for (const k of candidates) {
                try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed.email === 'string' && parsed.email.trim().length > 0) {
                            return parsed.email.trim();
                        }
                    }
                } catch (e) {}
            }
            return '';
        },

        _getFirestoreDb() {
            if (window.fbDb) return window.fbDb;
            if (window.firebase && window.firebase.firestore) return window.firebase.firestore();
            if (window.db) return window.db;
            return null;
        },

        isSuperAdmin(email) {
            const userEmail = this._resolveUserEmail(email).toLowerCase();
            return userEmail === SUPER_ADMIN_EMAIL.toLowerCase();
        },

        getRawText() {
            return (this._rawText && this._rawText.trim().length > 0) ? this._rawText : this.getDefaultText();
        },

        subscribe(callback) {
            if (typeof callback === 'function' && !this._listeners.includes(callback)) {
                this._listeners.push(callback);
            }
            return () => {
                this._listeners = this._listeners.filter(cb => cb !== callback);
            };
        },

        _notify() {
            const text = this.getRawText();
            this._listeners.forEach(cb => {
                try {
                    cb(text);
                } catch (e) {
                    console.error("Errore listener RulesService (HistoryGram):", e);
                }
            });
        },

        async init() {
            // 1. Caricamento istantaneo da cache locale o default (Zero-flicker)
            try {
                const cached = localStorage.getItem(this._storageKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.text) {
                        this._rawText = parsed.text;
                        this._lastUpdated = parsed.lastUpdated || null;
                        this._updatedBy = parsed.updatedBy || '';
                    }
                }
            } catch (e) {
                console.warn("Errore lettura cache regolamento HistoryGram:", e);
            }

            if (!this._rawText) {
                this._rawText = this.getDefaultText();
            }

            this._notify();

            // 2. Setup listener Firestore Realtime
            if (this._isInitialized) return;
            this._isInitialized = true;

            const db = this._getFirestoreDb();
            if (!db) {
                console.info("Firestore non ancora pronto per HistoryGram. Attendo o uso cache locale.");
                setTimeout(() => {
                    const retryDb = this._getFirestoreDb();
                    if (retryDb && !this._unsubscribeFirestore) {
                        this._setupFirestoreListener(retryDb);
                    }
                }, 1000);
                return;
            }

            this._setupFirestoreListener(db);
        },

        _setupFirestoreListener(db) {
            try {
                this._unsubscribeFirestore = db.collection(this._collectionName).doc(this._docId)
                    .onSnapshot(docSnap => {
                        if (docSnap.exists) {
                            const data = docSnap.data();
                            if (data && data.text) {
                                this._rawText = data.text;
                                this._lastUpdated = data.lastUpdated || null;
                                this._updatedBy = data.updatedBy || '';

                                try {
                                    localStorage.setItem(this._storageKey, JSON.stringify({
                                        text: this._rawText,
                                        lastUpdated: this._lastUpdated,
                                        updatedBy: this._updatedBy
                                    }));
                                } catch (e) {}

                                this._notify();
                            }
                        }
                    }, err => {
                        console.warn("Firestore snapshot regolamento HistoryGram (normale se offline):", err.message);
                    });
            } catch (err) {
                console.warn("Inizializzazione Firestore listener regolamento HistoryGram fallita:", err);
            }
        },

        async saveToCloud(newText) {
            const db = this._getFirestoreDb();
            if (!db) {
                throw new Error("Firestore non disponibile. Verifica la connessione a Internet.");
            }

            const userEmail = this._resolveUserEmail();
            if (!this.isSuperAdmin(userEmail)) {
                throw new Error("Accesso negato: solo il Super-Admin (" + SUPER_ADMIN_EMAIL + ") può salvare il regolamento. Rilevato: " + (userEmail || 'nessuno'));
            }

            const cleanText = (newText || '').trim();
            if (!cleanText) {
                throw new Error("Il testo del regolamento non può essere vuoto.");
            }

            const nowIso = new Date().toISOString();
            const payload = {
                text: cleanText,
                lastUpdated: nowIso,
                updatedBy: userEmail,
                gameKey: this._gameKey
            };

            await db.collection(this._collectionName).doc(this._docId).set(payload, { merge: true });

            this._rawText = cleanText;
            this._lastUpdated = nowIso;
            this._updatedBy = userEmail;

            try {
                localStorage.setItem(this._storageKey, JSON.stringify({
                    text: this._rawText,
                    lastUpdated: this._lastUpdated,
                    updatedBy: this._updatedBy
                }));
            } catch (e) {}

            this._notify();
            return { success: true, lastUpdated: nowIso };
        },

        // Parsing automatico in sezioni numerate
        parseTextToItems(text) {
            const src = (text || this.getRawText()).trim();
            if (!src) return [];

            const blocks = src.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
            const items = [];

            blocks.forEach((block, index) => {
                const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length === 0) return;

                let firstLine = lines[0].replace(/^[\u2022\*\-]\s*/, '').trim();
                let title = '';
                let content = '';

                const matchNumbered = firstLine.match(/^(\d+[\.\)]\s*)(.*)$/);
                if (matchNumbered) {
                    firstLine = matchNumbered[2].trim();
                }

                if (lines.length > 1) {
                    title = firstLine;
                    content = lines.slice(1).join('\n').trim();
                } else {
                    const colonMatch = firstLine.match(/^([^:]{3,60}):\s*(.+)$/);
                    if (colonMatch) {
                        title = colonMatch[1].trim();
                        content = colonMatch[2].trim();
                    } else {
                        content = firstLine;
                    }
                }

                if (title) {
                    title = title.replace(/:\s*$/, '').trim();
                }

                items.push({
                    index: index + 1,
                    title: title,
                    text: content || title,
                    fullText: block
                });
            });

            return items;
        },

        // ===================================================================
        // VISTA PUBBLICA / GIOCO (#view-regolamento-container in index.html)
        // Stile nativo di HistoryGram: card bianca, accenti verde smeraldo/oro
        // ===================================================================
        renderPublicView(containerId = 'view-regolamento-container') {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return;

            const items = this.parseTextToItems();
            const badgeColors = [
                { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
                { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
                { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
                { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
                { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' },
                { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' }
            ];

            container.innerHTML = `
                <div class="glass-card" style="max-width: 900px; margin: 0 auto; padding: 32px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); line-height: 1.7; box-shadow: var(--shadow-md);">
                    <div style="border-bottom: 2px solid var(--border-subtle); padding-bottom: 16px; margin-bottom: 24px;">
                        <h2 style="font-size: 1.6rem; color: var(--accent-green); margin: 0; display: flex; align-items: center; gap: 10px;">
                            <i class="fa-solid fa-scroll"></i> Regolamento
                        </h2>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        ${items.map(item => {
                            const color = badgeColors[(item.index - 1) % badgeColors.length];
                            return `
                                <div style="display: flex; gap: 16px; align-items: flex-start; background: #fafafa; border: 1px solid var(--border-color); border-radius: 16px; padding: 20px;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: ${color.bg}; color: ${color.text}; border: 1.5px solid ${color.border}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; shrink: 0; margin-top: 2px;">
                                        ${item.index}
                                    </div>
                                    <div style="flex: 1;">
                                        <h3 style="margin: 0 0 8px 0; font-size: 1.15rem; color: var(--text-main); font-weight: 700;">
                                            ${item.title || `Regola ${item.index}`}
                                        </h3>
                                        <div style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7;">
                                            ${item.text.split('\n').map(l => {
                                                const trimmed = l.trim();
                                                if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                                    const clean = trimmed.replace(/^[•\-]\s*/, '');
                                                    const colonIdx = clean.indexOf(':');
                                                    if (colonIdx !== -1) {
                                                        const label = clean.substring(0, colonIdx).trim();
                                                        const val = clean.substring(colonIdx + 1).trim();
                                                        return `<div style="padding-left: 12px; margin-bottom: 6px;"><strong style="color: var(--text-main);">${label}:</strong> ${val}</div>`;
                                                    }
                                                    return `<div style="padding-left: 12px; margin-bottom: 6px;">• ${clean}</div>`;
                                                }
                                                return `<p style="margin: 0 0 10px 0;">${trimmed}</p>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        },

        // ===================================================================
        // VISTA SUPER-ADMIN LIVE EDITOR (view-admin in index.html)
        // ===================================================================
        renderAdminEditor(containerId = 'historygram-rules-editor-container') {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return;

            const text = this.getRawText();
            const userEmail = this._resolveUserEmail();
            const isAuthAdmin = this.isSuperAdmin(userEmail);

            container.innerHTML = `
                <div class="glass-card" style="border: 2px solid var(--accent-gold); border-radius: 20px; padding: 28px; background: var(--bg-card); box-shadow: var(--shadow-lg);">
                    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0 0 6px 0; font-size: 1.3rem; color: var(--accent-gold); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-crown"></i> Regolamento Ufficiale • Live Editor Cloud
                            </h3>
                            <p style="margin: 0; font-size: 0.88rem; color: var(--text-muted); line-height: 1.4;">
                                Modifica il testo del Regolamento in tempo reale. I cambiamenti verranno sincronizzati istantaneamente sul gioco per tutti i docenti e studenti.
                            </p>
                        </div>
                        <div>
                            ${isAuthAdmin ? `
                                <span style="font-size: 0.78rem; font-weight: 700; background: rgba(34, 197, 94, 0.15); color: #15803d; border: 1px solid rgba(34, 197, 94, 0.3); padding: 5px 12px; border-radius: 50px; display: inline-flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-circle-check"></i> Super-Admin Autenticato (${userEmail})
                                </span>
                            ` : `
                                <span style="font-size: 0.78rem; font-weight: 700; background: rgba(217, 119, 6, 0.15); color: #b45309; border: 1px solid rgba(217, 119, 6, 0.3); padding: 5px 12px; border-radius: 50px; display: inline-flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Cloud Sync (${SUPER_ADMIN_EMAIL})
                                </span>
                            `}
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <textarea id="historygram-rules-textarea" rows="18" style="width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #f8fafc; padding: 16px; font-size: 0.92rem; line-height: 1.6; font-family: monospace; resize: vertical; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);" placeholder="Inserisci i punti del regolamento numerati...">${text}</textarea>
                    </div>

                    <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
                        <button type="button" id="btn-save-historygram-rules" onclick="window.HistoryGramRulesService.handleSaveButton()" style="background: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-dark) 100%); color: #ffffff; border: none; padding: 12px 26px; border-radius: 50px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                            <i class="fa-solid fa-floppy-disk"></i> SALVA REGOLAMENTO
                        </button>
                        
                        <button type="button" onclick="window.HistoryGramRulesService.handleResetButton()" style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 50px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-rotate-left"></i> Ripristina Predefinito
                        </button>
                    </div>
                </div>
            `;
        },

        async handleSaveButton() {
            const textarea = document.getElementById('historygram-rules-textarea');
            if (!textarea) return;

            const btn = document.getElementById('btn-save-historygram-rules');
            const originalHtml = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> SALVATAGGIO...`;
            }

            try {
                await this.saveToCloud(textarea.value);
                if (btn) {
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> SALVATO CON SUCCESSO!`;
                    btn.style.background = '#15803d';
                    btn.style.color = '#fff';
                }
                setTimeout(() => {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = originalHtml;
                        btn.style.background = 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-dark) 100%)';
                        btn.style.color = '#ffffff';
                    }
                }, 2000);
            } catch (err) {
                alert("Errore salvataggio: " + (err.message || err));
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            }
        },

        handleResetButton() {
            if (!confirm("Vuoi ripristinare il testo del regolamento a quello predefinito ufficiale di HistoryGram?")) return;
            const textarea = document.getElementById('historygram-rules-textarea');
            if (textarea) {
                textarea.value = this.getDefaultText();
            }
        }
    };

    window.HistoryGramRulesService = RulesService;
    window.RulesService = RulesService;

    // Auto-inizializzazione al caricamento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RulesService.init());
    } else {
        RulesService.init();
    }

})(window);
