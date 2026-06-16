/**
 * PokeQuest - Main Application Logic
 * Handles offline-first data management with LocalStorage/IndexedDB
 */

const APP_VERSION = '1.0.0';
const LEGACY_STORAGE_KEY = 'pokequest_data'; // The old key where your lost data is trapped
const MISSIONS_KEY = 'pokequest_missions';
const POKEMON_KEY = 'pokequest_pokemon';     // Restoring the missing tracking key

// ============================================
// STORAGE LAYER - LocalStorage wrapper & Migration
// ============================================

const Storage = {
  // Run this immediately on startup to rescue old data
  migrateLegacyData() {
    try {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacyData = JSON.parse(legacyRaw);
        
        // If old data was a unified object holding both lists
        if (legacyData && typeof legacyData === 'object' && !Array.isArray(legacyData)) {
          if (legacyData.missions && Array.isArray(legacyData.missions) && !localStorage.getItem(MISSIONS_KEY)) {
            this.setMissions(legacyData.missions);
            console.log('✅ Successfully migrated legacy missions.');
          }
          if (legacyData.pokemon && Array.isArray(legacyData.pokemon) && !localStorage.getItem(POKEMON_KEY)) {
            this.setPokemon(legacyData.pokemon);
            console.log('✅ Successfully migrated legacy Pokémon list.');
          }
        } 
        // If the old data was just a direct array of missions
        else if (Array.isArray(legacyData) && !localStorage.getItem(MISSIONS_KEY)) {
          this.setMissions(legacyData);
          console.log('✅ Successfully migrated legacy missions array.');
        }
        // Note: We leave LEGACY_STORAGE_KEY intact as a safety backup for now.
      }
    } catch (e) {
      console.error('❌ Migration routine encountered an error:', e);
    }
  },

  setMissions(missions) {
    try {
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
      this.updateStorageIndicator();
      return true;
    } catch (e) {
      console.error('❌ Failed to save missions:', e);
      return false;
    }
  },

  getMissions() {
    try {
      const data = localStorage.getItem(MISSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('❌ Failed to load missions:', e);
      return [];
    }
  },

  setPokemon(pokemon) {
    try {
      localStorage.setItem(POKEMON_KEY, JSON.stringify(pokemon));
      this.updateStorageIndicator();
      return true;
    } catch (e) {
      console.error('❌ Failed to save Pokémon:', e);
      return false;
    }
  },

  getPokemon() {
    try {
      const data = localStorage.getItem(POKEMON_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('❌ Failed to load Pokémon:', e);
      return [];
    }
  },

  clearAllData() {
    try {
      localStorage.clear();
      this.updateStorageIndicator();
      return true;
    } catch (e) {
      console.error('❌ Failed to clear data:', e);
      return false;
    }
  },

  exportData() {
    const missions = this.getMissions();
    const pokemon = this.getPokemon();
    const exportObj = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      missions,
      pokemon
    };
    return JSON.stringify(exportObj, null, 2);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.missions && Array.isArray(data.missions)) {
        this.setMissions(data.missions);
      }
      if (data.pokemon && Array.isArray(data.pokemon)) {
        this.setPokemon(data.pokemon);
      }
      return true;
    } catch (e) {
      console.error('❌ Import failed:', e);
      return false;
    }
  },

  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  },

  updateStorageIndicator() {
    const used = this.getStorageSize();
    const el = document.getElementById('storage-used');
    if (el) el.textContent = `${used} KB`;
  }
};

// ============================================
// MISSION MANAGEMENT
// ============================================

const Missions = {
  create(formData) {
    const mission = {
      id: Date.now().toString(),
      title: formData.title,
      game: formData.game,
      platform: formData.platform,
      tag: formData.tag,
      emoji: formData.emoji,
      color: formData.color,
      description: formData.description,
      tasks: formData.tasks.split('\n').filter(t => t.trim()),
      createdAt: new Date().toISOString(),
      completedTasks: [],
      progress: 0
    };

    const missions = Storage.getMissions();
    missions.push(mission);
    Storage.setMissions(missions);
    return mission;
  },

  getAll() {
    return Storage.getMissions();
  },

  update(id, updates) {
    let missions = Storage.getMissions();
    missions = missions.map(m => m.id === id ? { ...m, ...updates } : m);
    Storage.setMissions(missions);
  },

  delete(id) {
    let missions = Storage.getMissions();
    missions = missions.filter(m => m.id !== id);
    Storage.setMissions(missions);
  },

  toggleTask(missionId, taskIndex) {
    let missions = Storage.getMissions();
    const mission = missions.find(m => m.id === missionId);
    
    if (mission) {
      if (!mission.completedTasks) mission.completedTasks = [];
      
      const idx = mission.completedTasks.indexOf(taskIndex);
      if (idx > -1) {
        mission.completedTasks.splice(idx, 1);
      } else {
        mission.completedTasks.push(taskIndex);
      }
      
      mission.progress = Math.round((mission.completedTasks.length / mission.tasks.length) * 100);
      Storage.setMissions(missions);
    }
  },

  getByGame(game) {
    const missions = Storage.getMissions();
    return game === 'all' ? missions : missions.filter(m => m.game === game);
  },

  getGamesProgress() {
    const missions = Storage.getMissions();
    const games = {};

    missions.forEach(m => {
      if (!games[m.game]) {
        games[m.game] = { total: 0, completed: 0 };
      }
      games[m.game].total++;
      if (m.progress === 100) games[m.game].completed++;
    });

    return games;
  },

  getOverallProgress() {
    const missions = Storage.getMissions();
    if (missions.length === 0) return 0;
    const avgProgress = missions.reduce((sum, m) => sum + (m.progress || 0), 0) / missions.length;
    return Math.round(avgProgress);
  }
};

// ============================================
// POKÉMON MANAGEMENT (Restored Framework)
// ============================================

const PokemonTracking = {
  getAll() {
    return Storage.getPokemon();
  },

  add(pokemonData) {
    const list = Storage.getPokemon();
    const p = {
      id: Date.now().toString(),
      name: pokemonData.name,
      dexNo: pokemonData.dexNo,
      form: pokemonData.form || 'Normal',
      isShiny: !!pokemonData.isShiny,
      caught: false,
      game: pokemonData.game,
      createdAt: new Date().toISOString()
    };
    list.push(p);
    Storage.setPokemon(list);
    return p;
  },

  toggleCaught(id) {
    let list = Storage.getPokemon();
    list = list.map(p => p.id === id ? { ...p, caught: !p.caught } : p);
    Storage.setPokemon(list);
  },

  delete(id) {
    let list = Storage.getPokemon();
    list = list.filter(p => p.id !== id);
    Storage.setPokemon(list);
  }
};

// ============================================
// UI RENDERING
// ============================================

const UI = {
  renderMissions(filter = 'all') {
    const container = document.getElementById('missions-list');
    if (!container) return;
    const missions = Missions.getByGame(filter);

    if (missions.length === 0) {
      container.innerHTML = '<div class="text-center p-6 text-slate-400"><p>No missions yet. Create one to get started!</p></div>';
      return;
    }

    container.innerHTML = missions.map(mission => `
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>${mission.emoji}</span> ${mission.title}
            </h3>
            <p class="text-[10px] sm:text-xs text-indigo-400 font-semibold mt-1">${mission.game} • ${mission.platform}</p>
            <p class="text-xs text-slate-400 mt-2">${mission.description}</p>
          </div>
          <button data-mission-delete="${mission.id}" class="flex-shrink-0 text-slate-400 hover:text-rose-400 transition text-lg">🗑️</button>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-semibold text-slate-300">${mission.completedTasks?.length || 0}/${mission.tasks.length} Complete</span>
            <span class="text-xs font-bold text-${mission.color}-400">${mission.progress}%</span>
          </div>
          <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style="width: ${mission.progress}%"></div>
          </div>
        </div>

        <div class="space-y-1.5 max-h-40 overflow-y-auto">
          ${mission.tasks.map((task, idx) => `
            <label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 transition">
              <input type="checkbox" ${mission.completedTasks?.includes(idx) ? 'checked' : ''} 
                data-mission-task="${mission.id}" data-task-index="${idx}" 
                class="w-4 h-4 rounded cursor-pointer">
              <span class="text-xs ${mission.completedTasks?.includes(idx) ? 'line-through text-slate-500' : 'text-slate-300'}">${task}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  // Added dynamic rendering hook for the Pokemon list view
  renderPokemonList() {
    const container = document.getElementById('pokemon-list');
    if (!container) return; // Safely bypass if tab isn't built yet

    const pokemon = PokemonTracking.getAll();
    if (pokemon.length === 0) {
      container.innerHTML = '<div class="text-center p-6 text-slate-400"><p>No Pokémon tracked yet.</p></div>';
      return;
    }

    container.innerHTML = pokemon.map(p => `
      <div class="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <input type="checkbox" ${p.caught ? 'checked' : ''} data-poke-toggle="${p.id}" class="w-4 h-4 rounded cursor-pointer">
          <div>
            <div class="text-xs font-bold ${p.caught ? 'line-through text-slate-500' : 'text-white'}">
              #${p.dexNo} ${p.name} ${p.isShiny ? '✨' : ''}
            </div>
            <div class="text-[10px] text-slate-400">${p.game} (${p.form})</div>
          </div>
        </div>
        <button data-poke-delete="${p.id}" class="text-slate-400 hover:text-rose-400 text-xs">🗑️</button>
      </div>
    `).join('');
  },

  updateProgress() {
    const overall = Missions.getOverallProgress();
    const overallText = document.getElementById('overall-progress-text');
    const overallBar = document.getElementById('overall-progress-bar');

    if (overallText) overallText.textContent = `${overall}%`;
    if (overallBar) overallBar.style.width = `${overall}%`;

    this.renderGameProgress();
  },

  renderGameProgress() {
    const grid = document.getElementById('game-progress-grid');
    if (!grid) return;
    const games = Missions.getGamesProgress();
    const allMissions = Missions.getAll();

    if (Object.keys(games).length === 0) {
      grid.innerHTML = '<p class="text-xs text-slate-400 col-span-2">Create a mission to see progress</p>';
      return;
    }

    grid.innerHTML = Object.entries(games).map(([game, data]) => {
      const missions = allMissions.filter(m => m.game === game);
      const avgProgress = missions.length > 0 
        ? Math.round(missions.reduce((sum, m) => sum + (m.progress || 0), 0) / missions.length)
        : 0;

      return `
        <div class="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <div class="text-xs font-bold text-white mb-1">${game}</div>
          <div class="text-[10px] text-slate-400 mb-2">${data.completed}/${data.total} complete</div>
          <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-500 transition-all" style="width: ${avgProgress}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
};

// ============================================
// TAB SWITCHING
// ============================================

const Tabs = {
  init() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(btn.dataset.tab);
      });
    });
  },

  switchTab(tabName) {
    document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
      panel.classList.add('hidden');
    });

    const tabContent = document.getElementById(`tab-content-${tabName}`);
    if (tabContent) tabContent.classList.remove('hidden');

    document.querySelectorAll('[data-tab]').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
        btn.classList.remove('text-slate-400', 'hover:text-white', 'bg-slate-950');
      } else {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
        btn.classList.add('text-slate-400', 'hover:text-white', 'bg-slate-950');
      }
    });

    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.classList.add('hidden');
  }
};

// ============================================
// EVENT LISTENERS
// ============================================

const Events = {
  init() {
    this.initNavigation();
    this.initMissionForm();
    this.initMissionActions();
    this.initPokemonActions(); // Added event interceptor for Pokémon list
    this.initSettings();
    this.initOfflineIndicator();
  },

  initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
        navToggle.setAttribute('aria-expanded', 
          navToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
    }

    Tabs.init();
  },

  initMissionForm() {
    const createBtn = document.getElementById('btn-create-mission');
    const cancelBtn = document.getElementById('btn-cancel-mission');
    const panel = document.getElementById('create-mission-panel');
    const form = document.getElementById('new-mission-form');

    if (createBtn && panel) {
      createBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
      });
    }

    if (cancelBtn && panel && form) {
      cancelBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        form.reset();
      });
    }

    if (form && panel) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        Missions.create({
          title: document.getElementById('new-m-title').value,
          game: document.getElementById('new-m-game').value,
          platform: document.getElementById('new-m-platform').value,
          tag: document.getElementById('new-m-tag').value,
          emoji: document.getElementById('new-m-emoji').value,
          color: document.getElementById('new-m-color').value,
          description: document.getElementById('new-m-desc').value,
          tasks: document.getElementById('new-m-tasks').value
        });

        panel.classList.add('hidden');
        form.reset();
        UI.renderMissions('all');
        UI.updateProgress();
      });
    }
  },

  initMissionActions() {
    document.addEventListener('click', (e) => {
      if (e.target.dataset.missionDelete) {
        if (confirm('Delete this mission?')) {
          Missions.delete(e.target.dataset.missionDelete);
          UI.renderMissions('all');
          UI.updateProgress();
        }
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.dataset.missionTask) {
        const missionId = e.target.dataset.missionTask;
        const taskIndex = parseInt(e.target.dataset.taskIndex);
        Missions.toggleTask(missionId, taskIndex);
        UI.renderMissions('all');
        UI.updateProgress();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('mission-filter-btn')) {
        document.querySelectorAll('.mission-filter-btn').forEach(btn => {
          btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
          btn.classList.add('bg-slate-950', 'text-slate-400');
        });
        e.target.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
        e.target.classList.remove('bg-slate-950', 'text-slate-400');

        UI.renderMissions(e.target.dataset.filter);
      }
    });
  },

  initPokemonActions() {
    document.addEventListener('change', (e) => {
      if (e.target.dataset.pokeToggle) {
        PokemonTracking.toggleCaught(e.target.dataset.pokeToggle);
        UI.renderPokemonList();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.dataset.pokeDelete) {
        if (confirm('Remove this Pokémon from tracking?')) {
          PokemonTracking.delete(e.target.dataset.pokeDelete);
          UI.renderPokemonList();
        }
      }
    });
  },

  initSettings() {
    const exportBtn = document.getElementById('btn-export-data');
    const importBtn = document.getElementById('btn-import-data');
    const clearBtn = document.getElementById('btn-clear-data');
    const versionEl = document.getElementById('app-version');

    if (versionEl) versionEl.textContent = APP_VERSION;

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pokequest-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      });
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (Storage.importData(ev.target.result)) {
                alert('✅ Data imported successfully!');
                UI.renderMissions('all');
                UI.renderPokemonList();
                UI.updateProgress();
              } else {
                alert('❌ Import failed. Invalid file format.');
              }
            };
            reader.readAsText(file);
          }
        });
        input.click();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('⚠️ This will delete ALL your data. Are you sure?')) {
          Storage.clearAllData();
          UI.renderMissions('all');
          UI.renderPokemonList();
          UI.updateProgress();
          alert('✅ All data cleared.');
        }
      });
    }
  },

  initOfflineIndicator() {
    const banner = document.getElementById('offline-banner');
    const statusEl = document.getElementById('offline-status');

    const updateStatus = () => {
      if (navigator.onLine) {
        if (banner) banner.classList.add('hidden');
        if (statusEl) statusEl.textContent = '🟢 Online';
        if (statusEl) statusEl.className = 'text-emerald-400';
      } else {
        if (banner) banner.classList.remove('hidden');
        if (statusEl) statusEl.textContent = '🔴 Offline';
        if (statusEl) statusEl.className = 'text-rose-400';
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PokeQuest initialized');

  // 1. Run data migration rescue script before rendering
  Storage.migrateLegacyData();

  // 2. Set up initial UI states
  Storage.updateStorageIndicator();
  UI.renderMissions('all');
  UI.renderPokemonList();
  UI.updateProgress();
  
  // 3. Bind event hooks
  Events.init();
});
