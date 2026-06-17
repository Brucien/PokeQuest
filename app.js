/**
 * PokeQuest - Main Application Logic
 * Master Build: Mobile Nav Fixed, GraphQL Sync, Dynamic Math Pagination.
 */

const STORAGE_KEY = 'poke_quest_data_v2';
const APP_VERSION = '2.1.0';

const GENERATION_RANGES = [
    { gen: 1, min: 1, max: 151 }, { gen: 2, min: 152, max: 251 },
    { gen: 3, min: 252, max: 386 }, { gen: 4, min: 387, max: 493 },
    { gen: 5, min: 494, max: 649 }, { gen: 6, min: 650, max: 721 },
    { gen: 7, min: 722, max: 809 }, { gen: 8, min: 810, max: 905 },
    { gen: 9, min: 906, max: 1025 }
];

const DEFAULT_GAME_ORDER = ["Emerald", "Crystal", "Yellow", "Platinum", "HeartGold", "Black 2", "Ultra Moon", "Legends: Z-A", "Other"];

// Master Shiny Locks
const SHINY_LOCKED_IDS = [
    494, 647, 648, 720, 789, 790, 801, 802, 891, 892, 893, 
    896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1009, 
    1010, 1014, 1015, 1016, 1017, 1020, 1021, 1022, 1023, 1024, 1025
];

// Master Hardware Missions
const DEFAULT_MISSIONS = [
    { id: "m_emerald_cloning", title: "Battle Frontier Cloning Lab", tag: "Emerald (GBA)", color: "emerald", platform: "GBA", game: "Emerald", emoji: "🧪", desc: "Exploit Emerald's famous Battle Tower PC glitch to clone your rarest catches.", tasks: [{ id: "e1", text: "Reach Hoenn Battle Frontier", checked: false }, { id: "e2", text: "Store target clones inside PC Box 1 & 2", checked: false }, { id: "e3", text: "Save link connection to tower network registry", checked: false }] },
    { id: "m_crystal_celebi", title: "GS Ball Ilex Forest Event", tag: "Crystal (VC)", color: "purple", platform: "3DS VC", game: "Crystal", emoji: "🧅", desc: "Trigger the native Virtual Console Ilex forest shrine event for Shiny Celebi.", tasks: [{ id: "c1", text: "Defeat Elite Four", checked: false }, { id: "c2", text: "Obtain GS Ball from Goldenrod", checked: false }, { id: "c3", text: "Soft reset shrine encounter", checked: false }] },
    { id: "m_crystal_ditto", title: "1-in-64 Shiny breeding Loop", tag: "Crystal (VC)", color: "purple", platform: "3DS VC", game: "Crystal", emoji: "🧬", desc: "Exploit Gen 2's stat-based breeding system. Double-transform a wild Ditto with a Shiny baby to get 1-in-64 shiny eggs.", tasks: [{ id: "d1", text: "Hatch Shiny baby from Odd Egg", checked: false }, { id: "d2", text: "Double-transform wild Ditto", checked: false }, { id: "d3", text: "Breed for 1/64 shinies", checked: false }] },
    { id: "m_yellow_mew", title: "Bypassing Mew's Transporter Lock", tag: "Yellow (VC)", color: "rose", platform: "3DS VC", game: "Yellow", emoji: "🐱", desc: "Perform Trainer-Fly glitch and train EXP exactly to bypass Bank security.", tasks: [{ id: "y1", text: "Trainer-Fly glitch", checked: false }, { id: "y2", text: "Name GF / Grind EXP to 1,059,860", checked: false }, { id: "y3", text: "Transfer to Bank", checked: false }] },
    { id: "m_platinum_cutecharm", title: "The 21% Shiny Cute Charm Glitch", tag: "Platinum", color: "indigo", platform: "DS Lite", game: "Platinum", emoji: "💫", desc: "RNG manipulate your TID/SID to force a 21.3% shiny rate with a Cute Charm lead.", tasks: [{ id: "cc1", text: "Hit target TID/SID seed", checked: false }, { id: "cc2", text: "Catch male Cute Charm lead", checked: false }, { id: "cc3", text: "Hunt wild shinies", checked: false }] },
    { id: "m_platinum_dns", title: "Sinnoh Event DNS Restore", tag: "Platinum", color: "cyan", platform: "DS Lite", game: "Platinum", emoji: "📡", desc: "Route DS WiFi through 178.62.43.212 to download Member Card & Oak's Letter.", tasks: [{ id: "p1", text: "Change DNS settings", checked: false }, { id: "p2", text: "Download Mystery Gifts", checked: false }, { id: "p3", text: "Catch Shiny Darkrai/Shaymin", checked: false }] },
    { id: "m_hg_apriballs", title: "Daily Apriball Factory", tag: "HeartGold", color: "amber", platform: "DS Lite", game: "HeartGold", emoji: "🥎", desc: "Harvest Apricorns daily to craft custom Kurt balls for Legendary aesthetics.", tasks: [{ id: "h1", text: "Harvest Apricorn paths daily", checked: false }, { id: "h2", text: "Deliver batches to Kurt", checked: false }] },
    { id: "m_b2_permit", title: "Nature Preserve Permit", tag: "Black 2", color: "rose", platform: "DS", game: "Black 2", emoji: "🐉", desc: "See all 297 Unova Pokemon to get the Permit for guaranteed Shiny Haxorus.", tasks: [{ id: "b1", text: "Register all Unova Dex 'Seen' entries", checked: false }, { id: "b2", text: "Obtain Permit from Juniper", checked: false }, { id: "b3", text: "Catch Shiny Haxorus", checked: false }] },
    { id: "m_um_wormhole", title: "Ultra Warp Ride Jackpot", tag: "Ultra Moon", color: "indigo", platform: "3DS", game: "Ultra Moon", emoji: "🌀", desc: "Fly 4000+ LY to double-ring wormholes for 36% Shiny odds.", tasks: [{ id: "u1", text: "Pass 4,000 LY mark", checked: false }, { id: "u2", text: "Enter Tier 4 double-ring portal", checked: false }] },
    { id: "m_za_mega", title: "Lumiose Mega Evolution Prep", tag: "Legends: Z-A", color: "emerald", platform: "Switch", game: "Legends: Z-A", emoji: "🗼", desc: "Secure Kalos native species so they are ready to Mega Evolve on day one.", tasks: [{ id: "z1", text: "Secure Gen 6 starters", checked: false }, { id: "z2", text: "Gather Mega-capable species", checked: false }] }
];

let state = {
    pokemon: [],
    missions: [],
    currentTab: 'missions',
    missionFilter: 'all',
    dexSearch: '',
    dexGen: 'all',
    dexType: 'all',
    dexEgg: 'all',
    dexState: 'all',
    currentLimit: 48,
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
    t.className = `p-4 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto bg-slate-900 border-${type}-500/30 text-${type}-400 flex items-center gap-2 z-50`;
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
            types: [], eggGroups: [], formsList: [], caughtForms: []
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

// ==================== STORAGE & MIGRATION ====================
const Storage = {
    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                state.pokemon = parsed.pokemon || generateNationalDex();
                
                let rawMissions = parsed.missions || [];
                if (rawMissions.length === 0) rawMissions = [...DEFAULT_MISSIONS];
                
                state.missions = rawMissions.map(m => {
                    if (m.tasks && m.tasks.length > 0 && typeof m.tasks[0] === 'string') {
                        const completed = m.completedTasks || [];
                        m.tasks = m.tasks.map((taskStr, i) => ({
                            id: `t_${i}_${Date.now()}`,
                            text: taskStr,
                            checked: completed.includes(i)
                        }));
                    }
                    if (!m.color) m.color = "indigo";
                    return m;
                });
            } catch(e) {
                console.error("Failed to parse local storage", e);
                state.pokemon = generateNationalDex();
                state.missions = [...DEFAULT_MISSIONS];
            }
        } else {
            const legacyRaw = localStorage.getItem('pokequest_data');
            if(legacyRaw) {
               try {
                   const parsed = JSON.parse(legacyRaw);
                   state.pokemon = parsed.pokemon || generateNationalDex();
                   state.missions = parsed.missions || [...DEFAULT_MISSIONS];
               } catch(e) {
                   state.pokemon = generateNationalDex();
                   state.missions = [...DEFAULT_MISSIONS];
               }
            } else {
               state.pokemon = generateNationalDex();
               state.missions = [...DEFAULT_MISSIONS];
            }
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
        if (exportArea) exportArea.value = btoa(unescape(encodeURIComponent(JSON.stringify({ v: APP_VERSION, pokemon: state.pokemon, missions: state.missions }))));
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
            const total = m.tasks ? m.tasks.length : 0;
            const completed = m.tasks ? m.tasks.filter(t => t && t.checked).length : 0;
            const pct = total > 0 ? Math.round((completed/total)*100) : 0;
            return `
                <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative transition focus-within:border-indigo-500/20">
                    <button data-delete-mission="${escapeHTML(m.id)}" class="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-2">🗑️</button>
                    <div class="flex items-start gap-3 pr-8">
                        <span class="text-2xl">${escapeHTML(m.emoji)}</span>
                        <div>
                            <h4 class="text-sm font-bold text-white">${escapeHTML(m.title)}</h4>
                            <p class="text-[10px] text-slate-400">${escapeHTML(m.tag)}</p>
                        </div>
                    </div>
                    <p class="text-xs text-slate-400 mt-3">${escapeHTML(m.desc)}</p>
                    <div class="mt-4 space-y-2 border-t border-slate-800 pt-4 max-h-40 overflow-y-auto pr-2">
                        ${(m.tasks || []).map(t => `
                            <label class="flex items-start gap-2 cursor-pointer text-xs bg-slate-950/40 p-2 rounded-xl border border-slate-800/40 transition hover:bg-slate-950 select-none">
                                <input type="checkbox" data-mission="${escapeHTML(m.id)}" data-task="${escapeHTML(t.id)}" ${t.checked ? 'checked' : ''} class="mission-checkbox mt-0.5 w-3.5 h-3.5 bg-slate-900 border-slate-700 rounded text-indigo-500 cursor-pointer shrink-0">
                                <span class="${t.checked ? 'line-through text-slate-500' : 'text-slate-300'} leading-tight">${escapeHTML(t.text)}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <div class="w-2/3 bg-slate-950 h-2 rounded-full overflow-hidden mr-3 border border-slate-800/80">
                            <div class="bg-indigo-500 h-full transition-all duration-300" style="width: ${pct}%"></div>
                        </div>
                        <span>${completed}/${total} (${pct}%)</span>
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
            if(!m.tasks) return;
            m.tasks.forEach(t => {
                if(!t) return;
                total++; if(t.checked) checked++;
                const k = gStats[m.game] ? m.game : 'Other';
                gStats[k].t++; if(t.checked) gStats[k].c++;
            });
        });

        const pct = total > 0 ? Math.round((checked/total)*100) : 0;
        const overallText = document.getElementById('overall-progress-text');
        const overallBar = document.getElementById('overall-progress-bar');
        if(overallText) overallText.innerText = `${pct}%`;
        if(overallBar) overallBar.style.width = `${pct}%`;

        const grid = document.getElementById('game-progress-grid');
        if (grid) grid.innerHTML = DEFAULT_GAME_ORDER.map(g => {
            const s = gStats[g];
            const p = s.t > 0 ? Math.round((s.c/s.t)*100) : 0;
            return `
                <div class="bg-slate-950 border border-slate-900 rounded-xl p-2.5 flex flex-col justify-between">
                    <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
                        <span class="truncate pr-1">${g}</span>
                        <span class="text-white font-mono shrink-0">${p}%</span>
                    </div>
                    <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-indigo-500 h-full transition-all duration-300" style="width: ${p}%"></div>
                    </div>
                </div>`;
        }).join('');
    },

    renderDex() {
        const grid = document.getElementById('dex-grid');
        if (!grid) return;

        // Apply All Filters
        const filtered = state.pokemon.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(state.dexSearch.toLowerCase()) || p.num.toString() === state.dexSearch;
            const matchesGen = state.dexGen === 'all' || p.gen.toString() === state.dexGen;
            const matchesType = state.dexType === 'all' || (p.types && p.types.includes(state.dexType));
            const matchesEgg = state.dexEgg === 'all' || (p.eggGroups && p.eggGroups.includes(state.dexEgg));
            
            let matchesState = true;
            const isCaught = p.caughtNormal || p.caughtShiny || p.caughtRegionalNormal || p.caughtRegionalShiny || (p.caughtForms && p.caughtForms.length > 0);
            if (state.dexState === 'missing') matchesState = !isCaught;
            if (state.dexState === 'caught') matchesState = isCaught;
            if (state.dexState === 'shiny') matchesState = p.caughtShiny || p.caughtRegionalShiny;
            
            return matchesSearch && matchesGen && matchesType && matchesEgg && matchesState;
        });

        // Advanced Math Pagination
        const totalItems = filtered.length;
        const limit = state.currentLimit === 'all' ? totalItems : parseInt(state.currentLimit);
        const maxPage = limit > 0 ? Math.max(1, Math.ceil(totalItems / limit)) : 1;
        
        if (state.currentPage > maxPage) state.currentPage = maxPage;
        if (state.currentPage < 1) state.currentPage = 1;

        const startIdx = (state.currentPage - 1) * limit;
        const endIdx = limit === totalItems ? totalItems : Math.min(startIdx + limit, totalItems);
        const slice = filtered.slice(startIdx, endIdx);

        // Update Text Status
        const pageInfo = document.getElementById('pagination-info');
        if(pageInfo) pageInfo.innerText = `Showing ${totalItems > 0 ? startIdx + 1 : 0} - ${endIdx} of ${totalItems} entries`;
        
        // Update Buttons
        ['btn-prev-page', 'btn-prev-page-btm'].forEach(id => {
            const btn = document.getElementById(id);
            if(btn) btn.disabled = state.currentPage === 1;
        });
        ['btn-next-page', 'btn-next-page-btm'].forEach(id => {
            const btn = document.getElementById(id);
            if(btn) btn.disabled = state.currentPage === maxPage;
        });

        // Populate Jumper Dropdown
        const pageJump = document.getElementById('dex-page-jump');
        if (pageJump) {
            pageJump.innerHTML = "";
            for (let i = 1; i <= maxPage; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.text = `Page ${i} of ${maxPage}`;
                if (i === state.currentPage) opt.selected = true;
                pageJump.appendChild(opt);
            }
        }

        // Stats Render
        const statTotal = document.getElementById('stat-total-pokemon');
        const statBase = document.getElementById('stat-base-caught');
        const statForms = document.getElementById('stat-total-forms');
        if(statTotal) statTotal.innerText = filtered.length;
        if(statBase) statBase.innerText = state.pokemon.filter(p => p.caughtNormal || p.caughtShiny).length;
        if(statForms) statForms.innerText = state.pokemon.reduce((acc, curr) => acc + (curr.caughtForms?.length || 0), 0);

        if (slice.length === 0) {
            grid.innerHTML = `<div class="col-span-full border border-dashed border-slate-800 p-16 text-center rounded-2xl text-xs text-slate-500">No species found matching criteria.</div>`;
            return;
        }

        // Card Injection
        grid.innerHTML = slice.map(p => {
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png`;
            const isShinyLocked = SHINY_LOCKED_IDS.includes(p.num);

            const typesHtml = (p.types && p.types.length > 0) 
                ? p.types.map(t => `<span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-slate-700 bg-slate-800 text-slate-300 shadow-sm">${escapeHTML(t)}</span>`).join(' ')
                : `<span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-slate-700 bg-slate-800 text-slate-500">Unsynced</span>`;

            const eggsHtml = (p.eggGroups && p.eggGroups.length > 0) 
                ? p.eggGroups.map(e => escapeHTML(e)).join(', ')
                : 'Unknown (Sync Required)';

            return `
                <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition focus-within:border-indigo-500/20 shadow-md">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <img src="${spriteUrl}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'" class="w-12 h-12 object-contain drop-shadow-md bg-slate-800/50 rounded-full p-1 border border-slate-700/50">
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="font-mono text-[10px] font-bold text-indigo-400">#${String(p.num).padStart(3, '0')}</span>
                                    <h4 class="text-sm font-bold text-white capitalize tracking-wide">${escapeHTML(p.name)}</h4>
                                </div>
                                <div class="flex flex-wrap gap-1 mt-1">${typesHtml}</div>
                                <div class="text-[9px] text-slate-400 font-mono mt-1.5 uppercase tracking-wider">🥚 ${eggsHtml}</div>
                            </div>
                        </div>
                        <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800/60 text-slate-500 shrink-0 shadow-inner">GEN ${p.gen}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40 mt-2 shadow-inner">
                        <label class="flex items-center text-[11px] font-medium text-slate-300 cursor-pointer select-none">
                            <input type="checkbox" data-dex="${p.num}" data-field="caughtNormal" ${p.caughtNormal ? 'checked' : ''} class="dex-cb w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-500 cursor-pointer">
                            <span class="ml-2">Normal</span>
                        </label>
                        ${isShinyLocked ? `
                        <div class="flex items-center text-[11px] font-medium text-slate-500 cursor-not-allowed select-none" title="Shiny Locked by Game Freak">
                            <span class="w-4 h-4 flex items-center justify-center text-[10px]">🔒</span>
                            <span class="ml-2">Shiny Locked</span>
                        </div>
                        ` : `
                        <label class="flex items-center text-[11px] font-medium text-amber-400 cursor-pointer select-none">
                            <input type="checkbox" data-dex="${p.num}" data-field="caughtShiny" ${p.caughtShiny ? 'checked' : ''} class="dex-cb w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 cursor-pointer">
                            <span class="ml-2 flex items-center gap-0.5">✨ Shiny</span>
                        </label>
                        `}
                    </div>

                    ${p.hasRegional ? `
                    <div class="space-y-1.5 pt-1 border-t border-slate-800/40 mt-2">
                        <p class="text-[9px] uppercase tracking-wider text-indigo-400 font-bold ml-1">${escapeHTML(p.regionalName)} Variant</p>
                        <div class="grid grid-cols-2 gap-2 bg-indigo-950/10 p-2 rounded-xl border border-indigo-500/10 shadow-inner">
                            <label class="flex items-center text-[11px] font-medium text-slate-300 cursor-pointer select-none">
                                <input type="checkbox" data-dex="${p.num}" data-field="caughtRegionalNormal" ${p.caughtRegionalNormal ? 'checked' : ''} class="dex-cb w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-500 cursor-pointer">
                                <span class="ml-2">Reg Normal</span>
                            </label>
                            ${isShinyLocked ? `
                            <div class="flex items-center text-[11px] font-medium text-slate-500 cursor-not-allowed select-none" title="Shiny Locked by Game Freak">
                                <span class="w-4 h-4 flex items-center justify-center text-[10px]">🔒</span>
                                <span class="ml-2">Reg Locked</span>
                            </div>
                            ` : `
                            <label class="flex items-center text-[11px] font-medium text-amber-400 cursor-pointer select-none">
                                <input type="checkbox" data-dex="${p.num}" data-field="caughtRegionalShiny" ${p.caughtRegionalShiny ? 'checked' : ''} class="dex-cb w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 cursor-pointer">
                                <span class="ml-2 flex items-center gap-0.5">✨ Reg Shiny</span>
                            </label>
                            `}
                        </div>
                    </div>
                    ` : ''}

                    ${(p.formsList && p.formsList.length > 0) ? `
                    <div class="pt-2 border-t border-slate-800 mt-2">
                        <button onclick="document.getElementById('form-${p.num}').classList.toggle('hidden')" class="w-full text-left text-[10px] font-bold uppercase text-purple-400 hover:text-purple-300 transition">
                            🧬 Alt Forms (${(p.caughtForms || []).length}/${p.formsList.length}) 🔽
                        </button>
                        <div id="form-${p.num}" class="hidden mt-2 grid grid-cols-2 gap-1 p-2 rounded-xl bg-slate-950 border border-slate-800 max-h-32 overflow-y-auto shadow-inner">
                            ${p.formsList.map(f => `
                                <label class="flex items-center text-[10px] bg-slate-900/40 hover:bg-slate-900 p-1.5 border border-slate-800/60 rounded cursor-pointer truncate select-none transition">
                                    <input type="checkbox" data-dex="${p.num}" data-form="${escapeHTML(f)}" ${p.caughtForms?.includes(f) ? 'checked' : ''} class="form-cb w-3.5 h-3.5 mr-1.5 bg-slate-950 border-slate-700 rounded text-purple-500 shrink-0">
                                    <span class="${p.caughtForms?.includes(f) ? 'text-purple-400 font-semibold' : 'text-slate-300'} truncate">${escapeHTML(f)}</span>
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

// ==================== BINDINGS & INIT ====================
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CORE BINDINGS (Mobile Nav & Tabs bound BEFORE data load) ---
    
    // HAMBURGER MENU 
    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            mobileNav.classList.toggle('hidden');
        });
    }

    // TABS SWITCHING
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentTab = btn.dataset.tab;
            
            document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
            const targetContent = document.getElementById(`tab-content-${state.currentTab}`);
            if (targetContent) targetContent.classList.remove('hidden');
            
            // Desktop buttons
            document.querySelectorAll('#nav-menu button').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
                b.classList.add('text-slate-400', 'hover:text-white', 'bg-slate-950');
            });
            const desktopBtn = document.getElementById(`tab-btn-${state.currentTab}`);
            if (desktopBtn) {
                desktopBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/20');
                desktopBtn.classList.remove('text-slate-400', 'hover:text-white', 'bg-slate-950');
            }
            
            // Mobile buttons
            document.querySelectorAll('#mobile-nav button').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white');
                b.classList.add('text-slate-400', 'bg-slate-950');
            });
            const mobileBtn = document.getElementById(`tab-btn-${state.currentTab}-mobile`);
            if (mobileBtn) {
                mobileBtn.classList.add('bg-indigo-600', 'text-white');
                mobileBtn.classList.remove('text-slate-400', 'bg-slate-950');
            }
            
            if (state.currentTab === 'missions') UI.renderMissions();
            if (state.currentTab === 'dex') UI.renderDex();
            
            if (mobileNav) mobileNav.classList.add('hidden');
        });
    });

    // --- 2. DATA LOAD & RENDER ---
    try {
        Storage.load();
        UI.renderMissions();
        if (state.currentTab === 'dex') UI.renderDex(); 
    } catch (e) {
        console.error("Initialization Error:", e);
    }

    // --- 3. EVENT LISTENERS ---
    
    // Missions UI
    const createBtn = document.getElementById('btn-create-mission');
    const cancelBtn = document.getElementById('btn-cancel-mission');
    const missionForm = document.getElementById('new-mission-form');
    if (createBtn) createBtn.addEventListener('click', () => document.getElementById('create-mission-panel').classList.toggle('hidden'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => document.getElementById('create-mission-panel').classList.add('hidden'));
    
    if (missionForm) {
        missionForm.addEventListener('submit', (e) => {
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
                tasks: document.getElementById('new-m-tasks').value.split('\n').filter(t=>t.trim()).map((t, i) => ({ id: `t_${i}_${Date.now()}`, text: t, checked: false }))
            });
            Storage.save();
            UI.renderMissions();
            document.getElementById('create-mission-panel').classList.add('hidden');
            e.target.reset();
            triggerToast('Mission created!');
        });
    }

    document.querySelectorAll('.mission-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mission-filter-btn').forEach(b => b.classList.replace('bg-indigo-600', 'bg-slate-950'));
            btn.classList.replace('bg-slate-950', 'bg-indigo-600');
            state.missionFilter = btn.dataset.filter;
            UI.renderMissions();
        });
    });

    const missionsGrid = document.getElementById('missions-grid');
    if (missionsGrid) {
        missionsGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('mission-checkbox')) {
                const m = state.missions.find(ms => ms.id === e.target.dataset.mission);
                if (m && m.tasks) {
                    const t = m.tasks.find(ts => ts.id === e.target.dataset.task);
                    if (t) t.checked = e.target.checked;
                }
                Storage.save();
                UI.renderMissions();
            }
        });

        missionsGrid.addEventListener('click', (e) => {
            if (e.target.dataset.deleteMission) {
                if(confirm("Are you sure you want to delete this mission?")) {
                    state.missions = state.missions.filter(m => m.id !== e.target.dataset.deleteMission);
                    Storage.save();
                    UI.renderMissions();
                    triggerToast('Mission deleted.', 'rose');
                }
            }
        });
    }

    // Dex UI
    const dexSearch = document.getElementById('dex-search');
    const dexGenFilter = document.getElementById('dex-gen-filter');
    const dexTypeFilter = document.getElementById('dex-type-filter');
    const dexEggFilter = document.getElementById('dex-egg-filter');
    const dexStateFilter = document.getElementById('dex-state-filter');
    const dexLimit = document.getElementById('dex-limit');
    const dexPageJump = document.getElementById('dex-page-jump');
    
    if (dexSearch) dexSearch.addEventListener('input', debounce(e => { state.dexSearch = e.target.value; state.currentPage = 1; UI.renderDex(); }, 250));
    if (dexGenFilter) dexGenFilter.addEventListener('change', e => { state.dexGen = e.target.value; state.currentPage = 1; UI.renderDex(); });
    if (dexTypeFilter) dexTypeFilter.addEventListener('change', e => { state.dexType = e.target.value; state.currentPage = 1; UI.renderDex(); });
    if (dexEggFilter) dexEggFilter.addEventListener('change', e => { state.dexEgg = e.target.value; state.currentPage = 1; UI.renderDex(); });
    if (dexStateFilter) dexStateFilter.addEventListener('change', e => { state.dexState = e.target.value; state.currentPage = 1; UI.renderDex(); });
    if (dexLimit) dexLimit.addEventListener('change', e => { state.currentLimit = e.target.value; state.currentPage = 1; UI.renderDex(); });
    if (dexPageJump) dexPageJump.addEventListener('change', e => { state.currentPage = parseInt(e.target.value); UI.renderDex(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    const navToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    ['btn-prev-page', 'btn-prev-page-btm'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => { state.currentPage--; UI.renderDex(); navToTop(); });
    });
    ['btn-next-page', 'btn-next-page-btm'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => { state.currentPage++; UI.renderDex(); navToTop(); });
    });

    const dexGrid = document.getElementById('dex-grid');
    if (dexGrid) {
        dexGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('dex-cb')) {
                const p = state.pokemon.find(x => x.num === parseInt(e.target.dataset.dex));
                if (p) p[e.target.dataset.field] = e.target.checked;
                Storage.save();
                UI.renderDex(); 
            }
            if (e.target.classList.contains('form-cb')) {
                const p = state.pokemon.find(x => x.num === parseInt(e.target.dataset.dex));
                if (p) {
                    if (!p.caughtForms) p.caughtForms = [];
                    if (e.target.checked) p.caughtForms.push(e.target.dataset.form);
                    else p.caughtForms = p.caughtForms.filter(f => f !== e.target.dataset.form);
                }
                Storage.save();
                UI.renderDex();
            }
        });
    }

    // GRAPHQL API SYNC
    const apiBtn = document.getElementById('api-sync-btn');
    if (apiBtn) {
        apiBtn.addEventListener('click', async () => {
            const wrap = document.getElementById('api-progress-wrapper');
            const bar = document.getElementById('api-progress-bar');
            if (wrap) wrap.classList.remove('hidden');
            if (bar) bar.style.width = '10%';
            
            try {
                const query = `
                query {
                  pokemon_v2_pokemon(limit: 1025) {
                    id
                    name
                    pokemon_v2_pokemontypes {
                      pokemon_v2_type { name }
                    }
                    pokemon_v2_pokemonspecy {
                      pokemon_v2_pokemonegggroups {
                        pokemon_v2_egggroup { name }
                      }
                    }
                  }
                }`;

                const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) throw new Error("GraphQL fetch failed");
                const data = await response.json();
                
                if (bar) bar.style.width = '70%';
                
                data.data.pokemon_v2_pokemon.forEach((item) => {
                    const p = state.pokemon.find(x => x.num === item.id);
                    if (p) {
                        if (p.name.startsWith("Species #")) p.name = item.name.replace(/-/g, ' ');
                        p.types = item.pokemon_v2_pokemontypes.map(t => t.pokemon_v2_type.name);
                        if(item.pokemon_v2_pokemonspecy && item.pokemon_v2_pokemonspecy.pokemon_v2_pokemonegggroups) {
                             p.eggGroups = item.pokemon_v2_pokemonspecy.pokemon_v2_pokemonegggroups.map(e => e.pokemon_v2_egggroup.name);
                        } else {
                             p.eggGroups = [];
                        }
                    }
                });

                if (bar) bar.style.width = '100%';
                Storage.save();
                UI.renderDex();
                triggerToast('Pokédex data synced via GraphQL!', 'emerald');
                setTimeout(() => { if (wrap) wrap.classList.add('hidden'); }, 1000);
            } catch(err) {
                triggerToast('GraphQL API connection failed.', 'rose');
                if (wrap) wrap.classList.add('hidden');
            }
        });
    }

    // Data Management
    const btnCopy = document.getElementById('btn-copy-export');
    const btnImport = document.getElementById('btn-import-sync');
    const btnClear = document.getElementById('btn-clear-data');

    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const exportArea = document.getElementById('sync-export-area');
            if (exportArea) {
                exportArea.select();
                document.execCommand('copy');
                triggerToast('Copied to clipboard!');
            }
        });
    }
    
    if (btnImport) {
        btnImport.addEventListener('click', () => {
            try {
                const importArea = document.getElementById('sync-import-area');
                if (!importArea || !importArea.value) return;
                const json = JSON.parse(decodeURIComponent(escape(atob(importArea.value))));
                if (json.pokemon) state.pokemon = json.pokemon;
                if (json.missions) state.missions = json.missions;
                Storage.save();
                UI.renderMissions();
                UI.renderDex();
                triggerToast('Data imported successfully!', 'emerald');
                importArea.value = '';
            } catch(e) {
                triggerToast('Invalid import string.', 'rose');
            }
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if(confirm("Wipe all tracking data? This cannot be undone.")) {
                localStorage.removeItem(STORAGE_KEY);
                Storage.load();
                UI.renderMissions();
                UI.renderDex();
                triggerToast("Factory reset complete.", "rose");
            }
        });
    }
});
