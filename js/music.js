/**
 * L'ORATORE - Audio & Music Player System
 * WebAudio synthesizer for low-latency SFX + 15 Tracks Background Music Player
 */

const AudioEngine = {
  ctx: null,
  isMuted: false,
  isPlayingMusic: false,
  currentTrackIndex: 0,
  audioEl: null,

  tracks: [
    { title: "Aventure - Close Friends", src: "https://loratore.profmemmo.it/assets/audio/Aventure%20-%20Close%20Friends%20(freetouse.com).mp3" },
    { title: "Burgundy - Chances", src: "https://loratore.profmemmo.it/assets/audio/Burgundy%20-%20Chances%20(freetouse.com).mp3" },
    { title: "Epic Spectrum - Forgiveness", src: "https://loratore.profmemmo.it/assets/audio/Epic%20Spectrum%20-%20Forgiveness%20(freetouse.com).mp3" },
    { title: "Hazelwood - At Ease", src: "https://loratore.profmemmo.it/assets/audio/Hazelwood%20-%20At%20Ease%20(freetouse.com).mp3" },
    { title: "Hazelwood - Coming Of Age", src: "https://loratore.profmemmo.it/assets/audio/Hazelwood%20-%20Coming%20Of%20Age%20(freetouse.com).mp3" },
    { title: "Johny Grimes - Senseless", src: "https://loratore.profmemmo.it/assets/audio/Johny%20Grimes%20-%20Senseless%20(freetouse.com).mp3" },
    { title: "Nebulite - A New Day", src: "https://loratore.profmemmo.it/assets/audio/Nebulite%20-%20A%20New%20Day%20(freetouse.com).mp3" },
    { title: "Nebulite - Kyoto", src: "https://loratore.profmemmo.it/assets/audio/Nebulite%20-%20Kyoto%20(freetouse.com).mp3" },
    { title: "Nebulite - Mountain", src: "https://loratore.profmemmo.it/assets/audio/Nebulite%20-%20Mountain%20(freetouse.com).mp3" },
    { title: "Piki - 9am, meeeh", src: "https://loratore.profmemmo.it/assets/audio/Piki%20-%209am,%20meeeh%20(freetouse.com).mp3" },
    { title: "Pufino - Soaked", src: "https://loratore.profmemmo.it/assets/audio/Pufino%20-%20Soaked%20(freetouse.com).mp3" },
    { title: "Waesto - Morning", src: "https://loratore.profmemmo.it/assets/audio/Waesto%20-%20Morning%20(freetouse.com).mp3" },
    { title: "Zambolino - Smooth Place", src: "https://loratore.profmemmo.it/assets/audio/Zambolino%20-%20Smooth%20Place%20(freetouse.com).mp3" },
    { title: "massobeats - peach prosecco", src: "https://loratore.profmemmo.it/assets/audio/massobeats%20-%20peach%20prosecco%20(freetouse.com).mp3" },
    { title: "tubebackr & Filo - Morning Sun", src: "https://loratore.profmemmo.it/assets/audio/tubebackr%20&%20Filo%20Starquez%20-%20Morning%20Sun%20(freetouse.com).mp3" }
  ],

  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext not supported");
    }

    this.audioEl = new Audio();
    this.audioEl.loop = false;
    this.audioEl.addEventListener('ended', () => this.nextTrack());
    this.updateUI();
  },

  resumeCtx() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playBuzzer() {
    if (this.isMuted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    // Dual harsh sawtooth buzzer
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(148, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.35);
    osc2.stop(this.ctx.currentTime + 0.35);
  },

  playChime() {
    if (this.isMuted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  },

  playTick() {
    if (this.isMuted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },

  playFanfare() {
    if (this.isMuted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.35);
    });
  },

  togglePlay() {
    this.resumeCtx();
    this.isPlayingMusic = !this.isPlayingMusic;
    if (this.isPlayingMusic) {
      this.playCurrentTrack();
    } else {
      if (this.audioEl) this.audioEl.pause();
    }
    this.updateUI();
  },

  playCurrentTrack() {
    const track = this.tracks[this.currentTrackIndex];
    if (this.audioEl && track) {
      this.audioEl.src = track.src;
      this.audioEl.play().catch(() => {
        console.log("Audio autoplay prevented by browser policy");
      });
    }
    this.updateUI();
  },

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isPlayingMusic) {
      this.playCurrentTrack();
    } else {
      this.updateUI();
    }
  },

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    if (this.isPlayingMusic) {
      this.playCurrentTrack();
    } else {
      this.updateUI();
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioEl) {
      this.audioEl.muted = this.isMuted;
    }
    this.updateUI();
  },

  updateUI() {
    const titleEl = document.getElementById('music-track-title');
    const playBtn = document.getElementById('music-play-btn');
    const muteToggleBtn = document.getElementById('music-mute-toggle-btn');

    if (titleEl && this.tracks[this.currentTrackIndex]) {
      titleEl.textContent = this.tracks[this.currentTrackIndex].title;
    }
    if (playBtn) {
      playBtn.innerHTML = this.isPlayingMusic 
        ? '<i class="fa-solid fa-pause"></i>' 
        : '<i class="fa-solid fa-play"></i>';
    }
    if (muteToggleBtn) {
      muteToggleBtn.innerHTML = this.isMuted
        ? '<i class="fa-solid fa-volume-xmark"></i> Attiva Musica'
        : '<i class="fa-solid fa-volume-high"></i> Disattiva Musica';
    }
  }
};

window.AudioEngine = AudioEngine;
