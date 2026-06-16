/**
 * PokeQuest - Main Application Logic
 * No external data.js required. Generates full 1025 Dex automatically.
 */

const STORAGE_KEY = 'poke_quest_data_v2';
const ITEMS_PER_PAGE = 48;
const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon';

const GENERATION_RANGES = [
    { gen: 1, min: 1, max: 151 }, { gen: 2, min: 152, max: 251 },
    { gen: 3, min: 252, max: 386 }, { gen: 4, min: 387, max: 493 },
    { gen: 5, min: 494, max: 649 }, { gen: 6, min: 650, max: 721 },
    { gen: 7, min: 722, max: 809 }, { gen: 8, min: 810, max: 905 },
    { gen: 9, min: 906, max: 1025 }
];

const DEFAULT_GAME_ORDER = ["Emerald", "Crystal", "Yellow", "Platinum", "HeartGold", "Black 2", "Ultra Moon", "Legends: Z-A", "Other"];

// Seed Missions
const DEFAULT_MISSIONS = [
    {
        id: "m_emerald_cloning", title: "Battle Frontier Cloning Lab", tag: "Emerald (GBA)", color: "emerald", platform: "GBA", game: "Emerald", emoji: "🧪",
        desc: "Exploit Emerald's famous Battle Tower PC glitch to clone your rarest catches.",
        tasks: [{ id: "e1", text: "Reach Hoenn Battle Frontier", checked: false }, { id: "e2", text: "Store target clones inside PC Box 1 & 2", checked: false }, { id: "e3", text: "Save link connection to tower network registry", checked: false }]
    },
    {
        id: "m_crystal_celebi", title: "GS Ball Ilex Forest Event", tag: "Crystal (VC)", color: "purple", platform: "3DS VC", game: "Crystal", emoji: "🧅",
        desc: "Trigger the native Virtual Console Ilex forest shrine event for Shiny Celebi.",
        tasks: [{ id: "c1", text: "Defeat Elite Four", checked: false }, { id: "c2", text: "Obtain GS Ball from Goldenrod", checked: false }, { id: "c3", text: "Soft reset shrine encounter", checked: false }]
    },
    {
        id: "m_platinum_dns", title: "Sinnoh Event DNS Restore", tag: "Platinum", color: "cyan", platform: "DS Lite", game: "Platinum", emoji: "📡",
        desc: "Route DS WiFi through 178.62.43.212 to download Member Card & Oak's Letter.",
        tasks: [{ id: "p1", text: "Change DNS settings", checked: false }, { id: "p2", text: "Download Mystery Gifts", checked: false }, { id: "p3", text: "Catch Shiny Darkrai/Shaymin", checked: false }]
    },
    {
        id: "m_hg_apriballs", title: "Daily Apriball Factory", tag: "HeartGold", color: "amber", platform: "DS Lite", game: "HeartGold", emoji: "🥎",
        desc: "Harvest Apricorns daily to craft custom Kurt balls for Legendary aesthetics.",
        tasks: [{ id: "h1", text: "Harvest Apricorn paths daily", checked: false }, { id: "h2", text: "Deliver batches to Kurt", checked: false }]
    },
    {
        id: "m_b2_permit", title: "Nature Preserve Permit", tag: "Black 2", color: "rose", platform: "DS", game: "Black 2", emoji: "🐉",
        desc: "See all 297 Unova Pokemon to get the Permit for guaranteed Shiny Haxorus.",
        tasks: [{ id: "b1", text: "Register all Unova Dex 'Seen' entries", checked: false }, { id: "b2", text: "Obtain Permit from Juniper", checked: false }, { id: "b3", text: "Catch Shiny Haxorus", checked: false }]
    },
    {
        id: "m_um_wormhole", title: "Ultra Warp Ride Jackpot", tag: "Ultra Moon", color: "indigo", platform: "3DS", game: "Ultra Moon", emoji: "🌀",
        desc: "Fly 4000+ LY to double-ring wormholes for 36% Shiny odds.",
        tasks: [{ id: "u1", text: "Pass 4,000 LY mark", checked: false }, { id: "u2", text: "Enter Tier 4 double-ring portal", checked: false }]
    }
];

let state = {
    pokemon: [],
    missions: [],
    currentTab: 'missions',
    missionFilter: 'all',
    dexSearch: '',
    dexGen: 'all',
    dexState: 'all',
    currentPage: 1
};

// ==================== UTILS ====================
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}
function debounce(func, delay) {
    let timer;
    return function(...args) { clearTimeout(timer); timer = setTimeout(() => func.apply(this, args), delay); };
}
function triggerToast(message, type = 'indigo') {
    const wrapper = document.getElementById('toast-wrapper');
    if (!wrapper) return;
    const t = document.createElement('div');
    t.className = `p-4 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur transition-all duration-300 translate-y-2 opacity-0 bg-slate-900 border-${type}-500/30 text-${type}-400 flex items-center gap-2`;
    t.innerHTML = `<span>✨</span> <span>${escapeHTML(message)}</span>`;
    wrapper.appendChild(t);
    setTimeout(() => t.classList.remove('translate-y-2', 'opacity-0'), 50);
    setTimeout(() => { t.classList.add('translate-y-2', 'opacity-0'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ==================== DATA GENERATOR ====================
function generateNationalDex() {
    const fullDex = [];
    for (let i = 1; i <= 1025; i++) {
        let gen = 1;
        for (const r of GENERATION_RANGES) {
            if (i >= r.min && i <= r.max) { gen = r.gen; break; }
        }
        fullDex.push({
            num: i, name: `Species #${i}`, gen: gen, caughtNormal: false, caughtShiny: false,
            hasRegional: false, regionalName: "", caughtRegionalNormal: false, caughtRegionalShiny: false,
            formsList: [], caughtForms: []
        });
    }
    
    // Inject Custom Forms to standard skeleton
    const templates = {
        1: { name: "Bulbasaur" }, 4: { name: "Charmander" }, 7: { name: "Squirtle" }, 25: { name: "Pikachu" },
        19: { name: "Rattata", hasRegional: true, regionalName: "Alolan" },
        37: { name: "Vulpix", hasRegional: true, regionalName: "Alolan" },
        201: { name: "Unown", formsList: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","?","!"] },
        869: { name: "Alcremie", formsList: ["Vanilla", "Ruby", "Matcha", "Mint", "Lemon", "Salted"] }
    };
    
    fullDex.forEach(p => { if (templates[p.num]) Object.assign(p, templates[p.num]); });
    return fullDex;
}

// ==================== STORAGE ====================
const Storage = {
    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                state.pokemon = parsed.pokemon || generateNationalDex();
                state.missions = parsed.missions || DEFAULT_MISSIONS;
            } catch(e) {
                state.pokemon = generateNationalDex();
                state.missions = DEFAULT_MISSIONS;
            }
        } else {
            state.pokemon = generateNationalDex();
            state.missions = DEFAULT_MISSIONS;
            this.save();
        }
        this.updateSize();
    },
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ pokemon: state.pokemon, missions: state.missions }));
        this.updateSize();
    },
    updateSize() {
        let total = 0;
        for (let key in localStorage) if (localStorage.hasOwnProperty(key)) total += localStorage[key].length + key.length;
        const el = document.getElementById('storage-used');
        if (el) el.textContent = `${(total / 1024).toFixed(1)} KB`;
        
        const exportArea = document.getElementById('sync-export-area');
        if (exportArea) exportArea.value = btoa(unescape(encodeURIComponent(JSON.stringify({ v: "2.0", pokemon: state.pokemon, missions: state.missions }))));
    }
};

// ==================== UI RENDERING ====================
const UI = {
    renderMissions() {
        const grid = document.getElementById('missions-grid');
        if (!grid) return;
        const filtered = state.missions.filter(m => state.missionFilter === 'all' || m.game === state.missionFilter);
        
        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full border border-dashed border-slate-800 p-12 text-center rounded-2xl text-xs text-slate-500">No active campaigns.</div>`;
            return;
        }

        grid.innerHTML = filtered.map(m => {
            const total = m.tasks.length;
            const completed = m.tasks.filter(t => t.checked).length;
            const pct = total > 0 ? Math.round((completed/total)*100) : 0;
            return `
                <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative">
                    <button data-delete-mission="${m.id}" class="absolute top-4 right-4 text-slate-500 hover:text-rose-400">🗑️</button>
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">${m.emoji}</span>
                        <div>
                            <h4 class="text-sm font-bold text-white">${escapeHTML(m.title)}</h4>
                            <p class="text-[10px] text-slate-400">${escapeHTML(m.tag)}</p>
                        </div>
                    </div>
                    <p class="text-xs text-slate-400 mt-3">${escapeHTML(m.desc)}</p>
                    <div class="mt-4 space-y-2 border-t border-slate-800 pt-4">
                        ${m.tasks.map(t => `
                            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                <input type="checkbox" data-mission="${m.id}" data-task="${t.id}" ${t.checked ? 'checked' : ''} class="mission-checkbox w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-500 cursor-pointer">
                                <span class="${t.checked ? 'line-through text-slate-500' : ''}">${escapeHTML(t.text)}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                        <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mr-3">
                            <div class="bg-indigo-500 h-full" style="width: ${pct}%"></div>
                        </div>
                        <span>${pct}%</span>
                    </div>
                </div>
            `;
        }).join('');
        this.updateProgress();
    },

    updateProgress() {
        let total = 0, checked = 0;
        const gStats = {};
        DEFAULT_GAME_ORDER.forEach(g => gStats[g] = { t:0, c:0 });

        state.missions.forEach(m => {
            m.tasks.forEach(t => {
                total++; if(t.checked) checked++;
                const k = gStats[m.game] ? m.game : 'Other';
                gStats[k].t++; if(t.checked) gStats[k].c++;
            });
        });

        const pct = total > 0 ? Math.round((checked/total)*100) : 0;
        document.getElementById('overall-progress-text').innerText = `${pct}%`;
        document.getElementById('overall-progress-bar').style.width = `${pct}%`;

        const grid = document.getElementById('game-progress-grid');
        if (grid) grid.innerHTML = DEFAULT_GAME_ORDER.map(g => {
            const s = gStats[g];
            const p = s.t > 0 ? Math.round((s.c/s.t)*100) : 0;
            return `
                <div class="bg-slate-950 border border-slate-900 rounded-xl p-2.5">
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>${g}</span><span class="text-white">${p}%</span>
                    </div>
                    <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-indigo-500 h-full" style="width: ${p}%"></div>
                    </div>
                </div>`;
        }).join('');
    },

    renderDex() {
        const grid = document.getElementById('dex-grid');
        if (!grid) return;

        const filtered = state.pokemon.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(state.dexSearch.toLowerCase()) || p.num.toString() === state.dexSearch;
            const matchesGen = state.dexGen === 'all' || p.gen.toString() === state.dexGen;
            let matchesState = true;
            const isCaught = p.caughtNormal || p.caughtShiny || p.caughtRegionalNormal || p.caughtRegionalShiny || (p.caughtForms && p.caughtForms.length > 0);
            if (state.dexState === 'missing') matchesState = !isCaught;
            if (state.dexState === 'caught') matchesState = isCaught;
            if (state.dexState === 'shiny') matchesState = p.caughtShiny || p.caughtRegionalShiny;
            return matchesSearch && matchesGen && matchesState;
        });

        const totalItems = filtered.length;
        const maxPage = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
        if (state.currentPage > maxPage) state.currentPage = maxPage;

        const slice = filtered.slice((state.currentPage - 1) * ITEMS_PER_PAGE, state.currentPage * ITEMS_PER_PAGE);

        document.getElementById('pagination-info').innerText = `Showing ${slice.length} of ${totalItems}`;
        document.getElementById('btn-prev-page').disabled = state.currentPage === 1;
        document.getElementById('btn-next-page').disabled = state.currentPage === maxPage;

        document.getElementById('stat-total-pokemon').innerText = state.pokemon.length;
        document.getElementById('stat-base-caught').innerText = state.pokemon.filter(p => p.caughtNormal || p.caughtShiny).length;
        document.getElementById('stat-total-forms').innerText = state.pokemon.reduce((acc, curr) => acc + (curr.caughtForms?.length || 0), 0);

        grid.innerHTML = slice.map(p => {
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png`;
            return `
                <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <img src="${spriteUrl}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'" class="w-10 h-10 object-contain drop-shadow-md">
                            <div>
                                <span class="font-mono text-[10px] font-bold text-indigo-400">#${String(p.num).padStart(3, '0')}</span>
                                <h4 class="text-sm font-bold text-white capitalize">${escapeHTML(p.name)}</h4>
                            </div>
                        </div>
                        <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500">GEN ${p.gen}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                        <label class="flex items-center text-[11px] font-medium text-slate-300 cursor-pointer">
                            <input type="checkbox" data-dex="${p.num}" data-field="caughtNormal" ${p.caughtNormal ? 'checked' : ''} class="dex-cb w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-500 cursor-pointer">
                            <span class="ml-2">Normal</span>
                        </label>
                        <label class="flex items-center text-[11px] font-medium text-amber-400 cursor-pointer">
                            <input type="checkbox" data-dex="${p.num}" data-field="caughtShiny" ${p.caughtShiny ? 'checked' : ''} class="dex-cb w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-500 cursor-pointer">
                            <span class="ml-2">✨ Shiny</span>
                        </label>
                    </div>

                    ${p.hasRegional ? `
                    <div class="grid grid-cols-2 gap-2 bg-indigo-950/10 p-2 rounded-xl border border-indigo-500/10 mt-2">
                        <label class="flex items-center text-[11px] font-medium text-slate-300 cursor-pointer">
                            <input type="checkbox" data-dex="${p.num}" data-field="caughtRegionalNormal" ${p.caughtRegionalNormal ? 'checked' : ''} class="dex-cb w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-500 cursor-pointer">
                            <span class="ml-2">Reg Normal</span>
                        </label>
                        <label class="flex items-center text-[11px] font-medium text-amber-400 cursor-pointer">
                            <input type="checkbox" data-dex="${p.num}" data-field="caughtRegionalShiny" ${p.caughtRegionalShiny ? 'checked' : ''} class="dex-cb w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-500 cursor-pointer">
                            <span class="ml-2">✨ Reg Shiny</span>
                        </label>
                    </div>
                    ` : ''}

                    ${(p.formsList && p.formsList.length > 0) ? `
                    <div class="pt-2 border-t border-slate-800">
                        <button onclick="document.getElementById('form-${p.num}').classList.toggle('hidden')" class="w-full text-left text-[10px] font-bold uppercase text-purple-400">
                            🧬 Forms (${(p.caughtForms || []).length}/${p.formsList.length}) 🔽
                        </button>
                        <div id="form-${p.num}" class="hidden mt-2 grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                            ${p.formsList.map(f => `
                                <label class="flex items-center text-[10px] text-slate-300 cursor-pointer truncate">
                                    <input type="checkbox" data-dex="${p.num}" data-form="${escapeHTML(f)}" ${p.caughtForms?.includes(f) ? 'checked' : ''} class="form-cb w-3 h-3 mr-1 bg-slate-900 border-slate-700 rounded text-purple-500">
                                    ${escapeHTML(f)}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
};

// ==================== EVENTS & INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    UI.renderMissions();
    UI.renderDex();

    // TABS
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentTab = btn.dataset.tab;
            document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
            document.getElementById(`tab-content-${state.currentTab}`).classList.remove('hidden');
            
            document.querySelectorAll('nav button').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white');
                b.classList.add('text-slate-400');
            });
            btn.classList.add('bg-indigo-600', 'text-white');
            btn.classList.remove('text-slate-400');
            
            if (state.currentTab === 'missions') UI.renderMissions();
            if (state.currentTab === 'dex') UI.renderDex();
            document.getElementById('mobile-nav').classList.add('hidden');
        });
    });

    // MISSIONS
    document.getElementById('btn-create-mission').addEventListener('click', () => document.getElementById('create-mission-panel').classList.toggle('hidden'));
    document.getElementById('btn-cancel-mission').addEventListener('click', () => document.getElementById('create-mission-panel').classList.add('hidden'));
    
    document.getElementById('new-mission-form').addEventListener('submit', (e) => {
        e.preventDefault();
        state.missions.unshift({
            id: `m_${Date.now()}`,
            title: document.getElementById('new-m-title').value,
            game: document.getElementById('new-m-game').value,
            platform: document.getElementById('new-m-platform').value,
            tag: document.getElementById('new-m-tag').value,
            emoji: document.getElementById('new-m-emoji').value,
            desc: document.getElementById('new-m-desc').value,
            color: document.getElementById('new-m-color').value,
            tasks: document.getElementById('new-m-tasks').value.split('\n').filter(t=>t.trim()).map((t, i) => ({ id: `t_${i}`, text: t, checked: false }))
        });
        Storage.save();
        UI.renderMissions();
        document.getElementById('create-mission-panel').classList.add('hidden');
        e.target.reset();
        triggerToast('Mission created!');
    });

    document.querySelectorAll('.mission-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mission-filter-btn').forEach(b => b.classList.replace('bg-indigo-600', 'bg-slate-950'));
            btn.classList.replace('bg-slate-950', 'bg-indigo-600');
            state.missionFilter = btn.dataset.filter;
            UI.renderMissions();
        });
    });

    document.getElementById('missions-grid').addEventListener('change', (e) => {
        if (e.target.classList.contains('mission-checkbox')) {
            const m = state.missions.find(ms => ms.id === e.target.dataset.mission);
            const t = m.tasks.find(ts => ts.id === e.target.dataset.task);
            t.checked = e.target.checked;
            Storage.save();
            UI.renderMissions();
        }
    });

    document.getElementById('missions-grid').addEventListener('click', (e) => {
        if (e.target.dataset.deleteMission) {
            state.missions = state.missions.filter(m => m.id !== e.target.dataset.deleteMission);
            Storage.save();
            UI.renderMissions();
            triggerToast('Mission deleted.', 'rose');
        }
    });

    // DEX
    document.getElementById('dex-search').addEventListener('input', debounce(e => { state.dexSearch = e.target.value; state.currentPage = 1; UI.renderDex(); }, 250));
    document.getElementById('dex-gen-filter').addEventListener('change', e => { state.dexGen = e.target.value; state.currentPage = 1; UI.renderDex(); });
    document.getElementById('dex-state-filter').addEventListener('change', e => { state.dexState = e.target.value; state.currentPage = 1; UI.renderDex(); });
    document.getElementById('btn-prev-page').addEventListener('click', () => { state.currentPage--; UI.renderDex(); });
    document.getElementById('btn-next-page').addEventListener('click', () => { state.currentPage++; UI.renderDex(); });

    document.getElementById('dex-grid').addEventListener('change', (e) => {
        if (e.target.classList.contains('dex-cb')) {
            const p = state.pokemon.find(x => x.num === parseInt(e.target.dataset.dex));
            p[e.target.dataset.field] = e.target.checked;
            Storage.save();
            UI.renderDex(); // Update stats
        }
        if (e.target.classList.contains('form-cb')) {
            const p = state.pokemon.find(x => x.num === parseInt(e.target.dataset.dex));
            if (!p.caughtForms) p.caughtForms = [];
            if (e.target.checked) p.caughtForms.push(e.target.dataset.form);
            else p.caughtForms = p.caughtForms.filter(f => f !== e.target.dataset.form);
            Storage.save();
            UI.renderDex();
        }
    });

    // POKEAPI SYNC
    document.getElementById('api-sync-btn').addEventListener('click', async () => {
        const wrap = document.getElementById('api-progress-wrapper');
        const bar = document.getElementById('api-progress-bar');
        wrap.classList.remove('hidden');
        bar.style.width = '30%';
        try {
            const res = await fetch(`${POKEAPI_BASE}?limit=1025`);
            const data = await res.json();
            bar.style.width = '70%';
            data.results.forEach((item, idx) => {
                const p = state.pokemon.find(x => x.num === idx + 1);
                if (p && p.name.startsWith("Species #")) p.name = item.name.replace(/-/g, ' ');
            });
            bar.style.width = '100%';
            Storage.save();
            UI.renderDex();
            triggerToast('Pokédex data synced!');
            setTimeout(() => wrap.classList.add('hidden'), 1000);
        } catch(err) {
            triggerToast('API connection failed.', 'rose');
            wrap.classList.add('hidden');
        }
    });

    // DATA MANAGMENT
    document.getElementById('btn-copy-export').addEventListener('click', () => {
        document.getElementById('sync-export-area').select();
        document.execCommand('copy');
        triggerToast('Copied to clipboard!');
    });
    
    document.getElementById('btn-import-sync').addEventListener('click', () => {
        try {
            const json = JSON.parse(decodeURIComponent(escape(atob(document.getElementById('sync-import-area').value))));
            if (json.pokemon) state.pokemon = json.pokemon;
            if (json.missions) state.missions = json.missions;
            Storage.save();
            UI.renderMissions();
            UI.renderDex();
            triggerToast('Data imported successfully!', 'emerald');
            document.getElementById('sync-import-area').value = '';
        } catch(e) {
            triggerToast('Invalid import string.', 'rose');
        }
    });

    document.getElementById('btn-clear-data').addEventListener('click', () => {
        if(confirm("Wipe all tracking data? This cannot be undone.")) {
            localStorage.removeItem(STORAGE_KEY);
            Storage.load();
            UI.renderMissions();
            UI.renderDex();
            triggerToast("Factory reset complete.", "rose");
        }
    });
});
