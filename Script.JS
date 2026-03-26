// =============================================================
// CRAFTRIGHT — script.js
// =============================================================

const BIOMES = [
  { name:"Plains",          color:"#8BC34A", fx:"fx-clouds", emoji:"🌾", unlockLevel:0 },
  { name:"Forest",          color:"#2E7D32", fx:"fx-clouds", emoji:"🌲", unlockLevel:1 },
  { name:"Desert",          color:"#F4D03F", fx:"fx-ash",    emoji:"🏜️", unlockLevel:1 },
  { name:"Taiga",           color:"#4CAF50", fx:"fx-snow",   emoji:"❄️", unlockLevel:2 },
  { name:"Snowy Tundra",    color:"#B0D8E8", fx:"fx-snow",   emoji:"🌨️", unlockLevel:2 },
  { name:"Savanna",         color:"#D4AC0D", fx:"fx-clouds", emoji:"🦁", unlockLevel:3 },
  { name:"Jungle",          color:"#1B5E20", fx:"fx-clouds", emoji:"🌴", unlockLevel:3 },
  { name:"Swamp",           color:"#556B2F", fx:"fx-clouds", emoji:"🐸", unlockLevel:4 },
  { name:"Ocean",           color:"#0277BD", fx:"fx-waves",  emoji:"🌊", unlockLevel:4 },
  { name:"Nether",          color:"#B71C1C", fx:"fx-lava",   emoji:"🔥", unlockLevel:5 },
  { name:"The End",         color:"#512DA8", fx:"",          emoji:"🌌", unlockLevel:6 },
  { name:"Mushroom Fields", color:"#CE93D8", fx:"fx-clouds", emoji:"🍄", unlockLevel:6 }
];

const PETS = [
  { name:"Chicken",    src:"pets/chicken.png",   xpBonus:1.0,  bg:"#fce4b5", unlockLevel:0 },
  { name:"Wolf",       src:"pets/wolf.png",       xpBonus:1.1,  bg:"#d6e2ff", unlockLevel:1 },
  { name:"Rabbit",     src:"pets/rabbit.png",     xpBonus:1.0,  bg:"#ffe6e6", unlockLevel:1 },
  { name:"Fox",        src:"pets/fox.png",        xpBonus:1.15, bg:"#ffcc99", unlockLevel:2 },
  { name:"Horse",      src:"pets/horse.png",      xpBonus:1.1,  bg:"#d9b38c", unlockLevel:3 },
  { name:"Parrot",     src:"pets/parrot.png",     xpBonus:1.05, bg:"#a0e7a0", unlockLevel:4 },
  { name:"Slime",      src:"pets/slime.png",      xpBonus:1.0,  bg:"#a6ffb0", unlockLevel:5 },
  { name:"Polar Bear", src:"pets/polar_bear.png", xpBonus:1.2,  bg:"#e6f0ff", unlockLevel:6 }
];

const LEVELS = [
  { name:"Steve",    goal:100  },
  { name:"Alex",     goal:250  },
  { name:"Builder",  goal:500  },
  { name:"Warrior",  goal:800  },
  { name:"Explorer", goal:1200 },
  { name:"Champion", goal:1800 },
  { name:"Legend",   goal:2500 }
];

const ACHIEVEMENTS = [
  { id:"first_study", label:"📖 First Study Session!",  condition:s=>s.totalStudySessions>=1   },
  { id:"first_game",  label:"🎮 First Game Session!",   condition:s=>s.totalGameSessions>=1    },
  { id:"xp_100",      label:"⭐ Earned 100 XP!",         condition:s=>s.totalXpEarned>=100      },
  { id:"xp_500",      label:"🌟 Earned 500 XP!",         condition:s=>s.totalXpEarned>=500      },
  { id:"level_up",    label:"🔥 First Level Up!",        condition:s=>s.level>=1                },
  { id:"study_5",     label:"📚 5 Study Sessions!",      condition:s=>s.totalStudySessions>=5   },
  { id:"game_5",      label:"🕹️ 5 Game Sessions!",       condition:s=>s.totalGameSessions>=5    }
];

// Preset avatar options (emoji rendered on canvas as data URLs)
const PRESET_AVATARS = [
  { id:"steve",   emoji:"🧑", label:"Steve"   },
  { id:"alex",    emoji:"👩", label:"Alex"    },
  { id:"zombie",  emoji:"🧟", label:"Zombie"  },
  { id:"creeper", emoji:"👾", label:"Creeper" },
  { id:"enderman",emoji:"🖤", label:"Enderman"},
  { id:"pig",     emoji:"🐷", label:"Pig"     },
  { id:"sheep",   emoji:"🐑", label:"Sheep"   },
  { id:"sword",   emoji:"⚔️", label:"Fighter" }
];

const IDLE_DURATION = 10 * 60;

// =============================================================
window.addEventListener("DOMContentLoaded", () => {

  // =============================================================
  // MINECRAFT XP SOUNDS (Web Audio API)
  // =============================================================
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new AudioCtx();
    return audioCtx;
  }

  function playXpSound() {
    try {
      const ctx = getAudioCtx();
      // Minecraft XP orb sound: two quick rising tones
      const notes = [
        { freq: 660,  start: 0,    dur: 0.06 },
        { freq: 880,  start: 0.07, dur: 0.08 },
        { freq: 1100, start: 0.16, dur: 0.07 },
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        osc.frequency.linearRampToValueAtTime(freq * 1.1, ctx.currentTime + start + dur);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.01);
      });
    } catch(e) {}
  }

  function playLevelUpSound() {
    try {
      const ctx = getAudioCtx();
      // Minecraft level up: ascending fanfare
      const notes = [
        { freq: 523,  start: 0,    dur: 0.1  },
        { freq: 659,  start: 0.1,  dur: 0.1  },
        { freq: 784,  start: 0.2,  dur: 0.1  },
        { freq: 1047, start: 0.3,  dur: 0.25 },
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.01);
      });
    } catch(e) {}
  }


  // ── DOM refs ─────────────────────────────────────────────────
  const xpFill         = document.getElementById("xp-fill");
  const xpText         = document.getElementById("xp-text");
  const levelNameEl    = document.getElementById("level-name");
  const xpGoalEl       = document.getElementById("xp-goal");
  const petDisplay     = document.getElementById("pet-display");
  const avatarImg      = document.getElementById("avatar-img");
  const avatarWrap     = document.getElementById("avatar-wrap");
  const biomeContainer = document.getElementById("biomes");
  const petsContainer  = document.getElementById("pets");
  const biomesHeading  = document.getElementById("biomes-heading");
  const petsHeading    = document.getElementById("pets-heading");
  const clockLabel     = document.getElementById("clock-label");
  const clockTime      = document.getElementById("clock-time");
  const upcomingEl     = document.getElementById("upcoming-container");
  const achBanner      = document.getElementById("achievement");
  const achText        = document.getElementById("achievement-text");
  const biomeFx        = document.getElementById("biome-fx");
  const mapToggle      = document.getElementById("map-toggle");
  const studyBtn       = document.getElementById("add-study");
  const gameBtn        = document.getElementById("add-game");
  const startBtn       = document.getElementById("start");
  const completeBtn    = document.getElementById("complete");
  const resetBtn       = document.getElementById("reset");
  const simBtn         = document.getElementById("sim");
  const musicBtn       = document.getElementById("music-toggle");
  const logoutBtn      = document.getElementById("logout");
  // Modal
  const avatarModal    = document.getElementById("avatar-modal");
  const presetGrid     = document.getElementById("preset-grid");
  const uploadFile     = document.getElementById("upload-file");
  const modalCloseBtn  = document.getElementById("modal-close-btn");

  // ── Runtime ───────────────────────────────────────────────────
  let state         = loadState();
  let timerInterval = null;
  let idleInterval  = null;
  let timeLeft      = 0;
  let idleSeconds   = 0;
  let activeSession = null;
  let sessionQueue  = [];
  let musicOn       = true;
  let showingBiomes = true;

  // =============================================================
  // STATE helpers
  // =============================================================
  function loadState() {
    try{ return JSON.parse(localStorage.getItem("craftright_state")) || defaultState(); }
    catch{ return defaultState(); }
  }
  function defaultState(){
    return {
      xp:0, level:0, activePet:"Chicken",
      unlockedAchievements:[],
      totalStudySessions:0, totalGameSessions:0, totalXpEarned:0,
      avatarDataUrl: "",     // base64 or empty
      avatarPreset:  "steve" // preset id
    };
  }
  function saveState(){ localStorage.setItem("craftright_state", JSON.stringify(state)); }

  // =============================================================
  // AVATAR helpers
  // =============================================================

  // Make a small canvas image from an emoji
  function emojiToDataUrl(emoji) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const cx = c.getContext("2d");
    cx.fillStyle = "#c8e6c9";
    cx.fillRect(0, 0, 64, 64);
    cx.font = "40px serif";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(emoji, 32, 34);
    return c.toDataURL();
  }

  function applyAvatar() {
    if (state.avatarDataUrl) {
      avatarImg.src = state.avatarDataUrl;
    } else {
      const preset = PRESET_AVATARS.find(p => p.id === state.avatarPreset) || PRESET_AVATARS[0];
      avatarImg.src = emojiToDataUrl(preset.emoji);
    }
  }

  // Build preset grid inside modal
  function buildPresetGrid() {
    presetGrid.innerHTML = "";
    PRESET_AVATARS.forEach(p => {
      const img = document.createElement("img");
      img.src = emojiToDataUrl(p.emoji);
      img.className = "avatar-opt" + (state.avatarPreset === p.id && !state.avatarDataUrl ? " selected" : "");
      img.title = p.label;
      img.addEventListener("click", () => {
        state.avatarPreset = p.id;
        state.avatarDataUrl = "";
        saveState();
        applyAvatar();
        // Update selection UI
        presetGrid.querySelectorAll(".avatar-opt").forEach(el => el.classList.remove("selected"));
        img.classList.add("selected");
      });
      presetGrid.appendChild(img);
    });
  }

  // Open / close modal
  function openAvatarModal() {
    buildPresetGrid();
    avatarModal.classList.add("open");
  }
  function closeAvatarModal() {
    avatarModal.classList.remove("open");
  }

  // Click avatar to open modal
  avatarWrap.addEventListener("click", openAvatarModal);
  modalCloseBtn.addEventListener("click", closeAvatarModal);
  // Close on backdrop click
  avatarModal.addEventListener("click", e => { if (e.target === avatarModal) closeAvatarModal(); });

  // Upload custom photo
  uploadFile.addEventListener("change", () => {
    const file = uploadFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      state.avatarDataUrl = e.target.result;
      saveState();
      applyAvatar();
      // Deselect all presets
      presetGrid.querySelectorAll(".avatar-opt").forEach(el => el.classList.remove("selected"));
    };
    reader.readAsDataURL(file);
  });
  // Wire the upload label inside modal
  document.getElementById("upload-label").addEventListener("click", () => uploadFile.click());

  // =============================================================
  // UI UPDATE
  // =============================================================
  function updateUI() {
    const cur  = LEVELS[state.level];
    const next = LEVELS[state.level + 1];
    const pct  = Math.min((state.xp / cur.goal) * 100, 100);
    xpFill.style.width   = pct + "%";
    xpText.textContent   = state.xp + "/" + cur.goal + " XP";
    levelNameEl.textContent = cur.name;
    xpGoalEl.textContent = next ? "Next: " + next.name : "MAX LEVEL";
    const pet = PETS.find(p => p.name === state.activePet) || PETS[0];
    if (petDisplay){ petDisplay.src = pet.src; petDisplay.alt = pet.name; }
    applyAvatar();
  }

  // =============================================================
  // XP
  // =============================================================
  function addXP(amount) {
    const pet   = PETS.find(p => p.name === state.activePet) || PETS[0];
    const total = Math.round(amount * (pet.xpBonus || 1));
    state.xp            += total;
    state.totalXpEarned += total;
    while (state.level < LEVELS.length - 1 && state.xp >= LEVELS[state.level].goal) {
      state.xp -= LEVELS[state.level].goal;
      state.level++;
      playLevelUpSound();
      showAchievement("LEVEL UP! Now: " + LEVELS[state.level].name);
      renderBiomes(); // unlock newly available biomes immediately
      renderPets();   // unlock newly available pets immediately
    }
    checkAchievements();
    saveState();
    updateUI();
    const prev = clockLabel.textContent;
    playXpSound();
    clockLabel.textContent = "+" + total + " XP!";
    setTimeout(() => { clockLabel.textContent = prev; }, 1500);
  }

  // =============================================================
  // ACHIEVEMENTS
  // =============================================================
  function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
      if (!state.unlockedAchievements.includes(a.id) && a.condition(state)) {
        state.unlockedAchievements.push(a.id);
        showAchievement(a.label);
      }
    });
  }
  function showAchievement(text) {
    achText.textContent = text;
    achBanner.classList.add("show");
    setTimeout(() => achBanner.classList.remove("show"), 3500);
  }

  // =============================================================
  // CLOCK
  // =============================================================
  function fmt(sec) {
    return String(Math.floor(sec/60)).padStart(2,"0") + ":" + String(sec%60).padStart(2,"0");
  }
  function updateClock(){ clockTime.textContent = fmt(timeLeft); }

  function startIdleClock() {
    stopIdleClock();
    idleSeconds = 0;
    clockLabel.textContent = "IDLE";
    clockTime.textContent  = fmt(0);
    idleInterval = setInterval(() => {
      idleSeconds = (idleSeconds + 1) % (IDLE_DURATION + 1);
      clockTime.textContent = fmt(idleSeconds);
    }, 1000);
  }
  function stopIdleClock() {
    clearInterval(idleInterval);
    idleInterval = null;
  }

  // =============================================================
  // SESSION QUEUE
  // =============================================================
  function enqueueSession(type, mins, xpReward) {
    const el      = document.createElement("div");
    const timerEl = document.createElement("span");
    const labelEl = document.createElement("span");

    el.style.cssText =
      "display:flex;justify-content:space-between;align-items:center;" +
      "background:#e7dfc6;padding:5px 8px;border:2px solid #3b3a36;" +
      "border-radius:4px;font-size:8px;margin-top:4px;";

    labelEl.textContent = (type === "Study" ? "📖 " : "🎮 ") + type + " (" + mins + "m)";
    timerEl.textContent = fmt(mins * 60);
    timerEl.style.fontWeight = "bold";
    el.appendChild(labelEl);
    el.appendChild(timerEl);
    upcomingEl.appendChild(el);

    sessionQueue.push({ type, duration: mins * 60, xpReward, el, timerEl });
    if (!activeSession) { stopIdleClock(); beginNextSession(); }
  }

  function beginNextSession() {
    if (sessionQueue.length === 0) { activeSession = null; startIdleClock(); return; }
    activeSession = sessionQueue[0];
    timeLeft = activeSession.duration;
    clockLabel.textContent = (activeSession.type==="Study" ? "📖 " : "🎮 ") +
                              activeSession.type.toUpperCase();
    updateClock();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateClock();
        activeSession.timerEl.textContent = fmt(timeLeft);
      } else { finishSession(); }
    }, 1000);
  }

  function finishSession() {
    clearInterval(timerInterval);
    const done = sessionQueue.shift();
    if (done.type === "Study") state.totalStudySessions++;
    else                       state.totalGameSessions++;
    addXP(done.xpReward);
    done.el.remove();
    activeSession = null;
    beginNextSession();
  }

  // =============================================================
  // BUTTON LISTENERS
  // =============================================================
  if (studyBtn)   studyBtn.addEventListener("click",  () => enqueueSession("Study",  30, 40));
  if (gameBtn)    gameBtn.addEventListener("click",   () => enqueueSession("Gaming", 30, 15));

  if (startBtn) startBtn.addEventListener("click", () => {
    if (!activeSession && sessionQueue.length > 0) { stopIdleClock(); beginNextSession(); }
  });

  if (completeBtn) completeBtn.addEventListener("click", () => {
    if (activeSession) finishSession();
    else showAchievement("No active session!");
  });

  if (resetBtn) resetBtn.addEventListener("click", () => {
    if (!confirm("Reset ALL progress?")) return;
    clearInterval(timerInterval);
    stopIdleClock();
    sessionQueue = []; activeSession = null;
    upcomingEl.innerHTML = '<div class="up-header">📋 Upcoming Sessions</div>';
    state    = defaultState();
    timeLeft = 0;
    saveState(); updateUI(); startIdleClock();
  });

  if (simBtn)  simBtn.addEventListener("click",  () => addXP(50));

  if (musicBtn) musicBtn.addEventListener("click", () => {
    musicOn = !musicOn;
    musicBtn.textContent = "🎵 Music: " + (musicOn ? "ON" : "OFF");
  });

  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    if (confirm("Logout?")) window.location.href = "Login.html";
  });

  if (mapToggle) mapToggle.addEventListener("click", () => {
    showingBiomes = !showingBiomes;
    biomeContainer.style.display = showingBiomes ? "grid" : "none";
    petsContainer.style.display  = showingBiomes ? "none" : "grid";
    if (biomesHeading) biomesHeading.style.display = showingBiomes ? "" : "none";
    if (petsHeading)   petsHeading.style.display   = showingBiomes ? "none" : "";
    mapToggle.textContent = showingBiomes ? "🐾 Show Pets" : "🗺 Show Biomes";
  });


  // =============================================================
  // PET SOUNDS (Web Audio API — Minecraft accurate)
  // =============================================================
  function playPetSound(petName) {
    try {
      const ctx = getAudioCtx();
      const t = ctx.currentTime;

      const sounds = {

        "Chicken": () => {
          // buk buk buk — short clucks
          [0, 0.18, 0.36].forEach((delay, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = "square";
            osc.frequency.setValueAtTime(800 - i*60, t+delay);
            osc.frequency.exponentialRampToValueAtTime(400, t+delay+0.1);
            gain.gain.setValueAtTime(0.15, t+delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t+delay+0.12);
            osc.start(t+delay); osc.stop(t+delay+0.13);
          });
        },

        "Wolf": () => {
          // howl — rising then falling
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.linearRampToValueAtTime(700, t+0.3);
          osc.frequency.linearRampToValueAtTime(500, t+0.7);
          gain.gain.setValueAtTime(0.0, t);
          gain.gain.linearRampToValueAtTime(0.18, t+0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t+0.75);
          osc.start(t); osc.stop(t+0.8);
        },

        "Rabbit": () => {
          // soft squeaky nose sniff — two tiny high chirps
          [0, 0.15].forEach(delay => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(1400, t+delay);
            osc.frequency.exponentialRampToValueAtTime(900, t+delay+0.08);
            gain.gain.setValueAtTime(0.1, t+delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t+delay+0.1);
            osc.start(t+delay); osc.stop(t+delay+0.11);
          });
        },

        "Fox": () => {
          // yip — sharp bark
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc2.connect(gain2); gain2.connect(ctx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(900, t);
          osc.frequency.exponentialRampToValueAtTime(400, t+0.15);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t+0.18);
          osc.start(t); osc.stop(t+0.2);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(600, t+0.2);
          osc2.frequency.exponentialRampToValueAtTime(300, t+0.35);
          gain2.gain.setValueAtTime(0.12, t+0.2);
          gain2.gain.exponentialRampToValueAtTime(0.001, t+0.38);
          osc2.start(t+0.2); osc2.stop(t+0.4);
        },

        "Horse": () => {
          // neigh — vibrato whinny
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sawtooth";
          // vibrato via rapid freq oscillation
          for (let i = 0; i < 10; i++) {
            const ft = t + i * 0.05;
            osc.frequency.setValueAtTime(600 + (i%2===0 ? 40 : -40), ft);
          }
          osc.frequency.exponentialRampToValueAtTime(300, t+0.6);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.setValueAtTime(0.15, t+0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, t+0.65);
          osc.start(t); osc.stop(t+0.7);
        },

        "Parrot": () => {
          // squawk — three sharp rising tones
          [[0, 900],[0.12, 1100],[0.24, 1300]].forEach(([delay, freq]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, t+delay);
            osc.frequency.exponentialRampToValueAtTime(freq*0.7, t+delay+0.1);
            gain.gain.setValueAtTime(0.14, t+delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t+delay+0.12);
            osc.start(t+delay); osc.stop(t+delay+0.13);
          });
        },

        "Slime": () => {
          // boing — low thud + high squeak
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.connect(gain1); gain1.connect(ctx.destination);
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(180, t);
          osc1.frequency.exponentialRampToValueAtTime(60, t+0.2);
          gain1.gain.setValueAtTime(0.25, t);
          gain1.gain.exponentialRampToValueAtTime(0.001, t+0.22);
          osc1.start(t); osc1.stop(t+0.23);
          // squeak on top
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2); gain2.connect(ctx.destination);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(1200, t+0.05);
          osc2.frequency.exponentialRampToValueAtTime(600, t+0.18);
          gain2.gain.setValueAtTime(0.1, t+0.05);
          gain2.gain.exponentialRampToValueAtTime(0.001, t+0.2);
          osc2.start(t+0.05); osc2.stop(t+0.21);
        },

        "Polar Bear": () => {
          // deep growl — low rumbling roar
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.setValueAtTime(180, t+0.15);
          osc.frequency.setValueAtTime(100, t+0.35);
          osc.frequency.exponentialRampToValueAtTime(80, t+0.6);
          gain.gain.setValueAtTime(0.0, t);
          gain.gain.linearRampToValueAtTime(0.22, t+0.1);
          gain.gain.setValueAtTime(0.2, t+0.35);
          gain.gain.exponentialRampToValueAtTime(0.001, t+0.65);
          osc.start(t); osc.stop(t+0.7);
        },

      };

      const fn = sounds[petName];
      if (fn) fn();
    } catch(e) {}
  }

  // =============================================================
  // RENDER BIOMES
  // =============================================================
  function renderBiomes() {
    if (!biomeContainer) return;
    biomeContainer.innerHTML = "";
    BIOMES.forEach(b => {
      const playerLevel = state.level; // current level index (0-based)
      const locked      = playerLevel < b.unlockLevel;
      const levelNames  = LEVELS.map(l => l.name);
      const reqName     = LEVELS[b.unlockLevel] ? LEVELS[b.unlockLevel].name : "";

      const tile = document.createElement("div");
      tile.className = "tile";
      tile.style.position   = "relative";
      tile.style.color      = "#fff";
      tile.style.textShadow = "1px 1px 0 rgba(0,0,0,.6)";

      if (locked) {
        // Darken the colour heavily to show it's locked
        tile.style.background = b.color;
        tile.style.filter     = "brightness(0.35) saturate(0.4)";
        tile.style.cursor     = "not-allowed";
        tile.innerHTML =
          '<span style="font-size:22px;line-height:1">' + b.emoji + '</span>' +
          '<div class="name">' + b.name + '</div>' +
          '<small>🔒 Reach ' + reqName + '</small>';

        // Tooltip on hover
        const tooltip = document.createElement("div");
        tooltip.style.cssText = [
          "position:absolute","bottom:calc(100% + 6px)","left:50%",
          "transform:translateX(-50%)",
          "background:#1a1a1a","color:#fff",
          "font-size:8px","padding:5px 8px",
          "border:2px solid #555","border-radius:4px",
          "white-space:nowrap","pointer-events:none",
          "opacity:0","transition:opacity 0.15s","z-index:99"
        ].join(";");
        tooltip.textContent = "🔒 Unlocks at " + reqName + " (Level " + b.unlockLevel + ")";
        tile.appendChild(tooltip);

        tile.addEventListener("mouseenter", () => { tooltip.style.opacity = "1"; });
        tile.addEventListener("mouseleave", () => { tooltip.style.opacity = "0"; });

      } else {
        tile.style.background = b.color;
        tile.innerHTML =
          '<span style="font-size:22px;line-height:1">' + b.emoji + '</span>' +
          '<div class="name">' + b.name + '</div>' +
          '<small>Tap to explore</small>';

        tile.addEventListener("click", () => {
          if (window.setBiome) window.setBiome(b.name);
          biomeFx.className = "";
          if (b.fx) biomeFx.classList.add(b.fx);
          biomeContainer.querySelectorAll(".tile").forEach(t => {
            t.style.outline = ""; t.style.outlineOffset = "";
          });
          tile.style.outline       = "4px solid #fff";
          tile.style.outlineOffset = "-4px";
        });
      }

      biomeContainer.appendChild(tile);
    });
  }

  // =============================================================
  // RENDER PETS
  // =============================================================
  function renderPets() {
    if (!petsContainer) return;
    petsContainer.innerHTML = "";
    PETS.forEach(p => {
      const playerLevel = state.level;
      const locked      = playerLevel < p.unlockLevel;
      const reqName     = LEVELS[p.unlockLevel] ? LEVELS[p.unlockLevel].name : "";
      const isActive    = (state.activePet === p.name);

      const tile = document.createElement("div");
      tile.className = "tile pet";
      tile.style.position   = "relative";
      tile.style.background = p.bg;

      if (locked) {
        tile.style.filter      = "brightness(0.35) saturate(0.4)";
        tile.style.cursor      = "not-allowed";
        tile.style.borderColor = "#3b3a36";
        tile.style.borderWidth = "4px";
        tile.innerHTML =
          '<img src="' + p.src + '" alt="' + p.name + '" ' +
          'style="width:44px;height:44px;image-rendering:pixelated" ' +
          'onerror="this.style.display=\'none\'">' +
          '<div class="pname">' + p.name + '</div>' +
          '<small>🔒 Reach ' + reqName + '</small>';

        // Tooltip
        const tooltip = document.createElement("div");
        tooltip.style.cssText = [
          "position:absolute","bottom:calc(100% + 6px)","left:50%",
          "transform:translateX(-50%)",
          "background:#1a1a1a","color:#fff",
          "font-size:8px","padding:5px 8px",
          "border:2px solid #555","border-radius:4px",
          "white-space:nowrap","pointer-events:none",
          "opacity:0","transition:opacity 0.15s","z-index:99"
        ].join(";");
        tooltip.textContent = "🔒 Unlocks at " + reqName + " (Level " + p.unlockLevel + ")";
        tile.appendChild(tooltip);

        tile.addEventListener("mouseenter", () => { tooltip.style.opacity = "1"; });
        tile.addEventListener("mouseleave", () => { tooltip.style.opacity = "0"; });

      } else {
        tile.style.borderColor = isActive ? "#4caf50" : "#3b3a36";
        tile.style.borderWidth = isActive ? "5px" : "4px";
        tile.innerHTML =
          '<img src="' + p.src + '" alt="' + p.name + '" ' +
          'style="width:44px;height:44px;image-rendering:pixelated" ' +
          'onerror="this.style.display=\'none\'">' +
          '<div class="pname">' + p.name + '</div>' +
          '<small>' + (isActive ? "✔ Active" : "x" + p.xpBonus + " XP") + '</small>';

        tile.addEventListener("click", () => {
          state.activePet = p.name;
          playPetSound(p.name);
          saveState();
          if (petDisplay){ petDisplay.src = p.src; petDisplay.alt = p.name; }
          renderPets();
          updateUI();
        });
      }

      petsContainer.appendChild(tile);
    });
  }

  // =============================================================
  // INIT
  // =============================================================
  renderBiomes();
  renderPets();
  updateUI();
  startIdleClock();

}); // end DOMContentLoaded