/**
 * PokeQuest - Main Application Logic
 * Restored with full 1,025 Dex array, dynamic nested form accordions, and migration tools
 */

const APP_VERSION = '2.0.0';
const CURRENT_STORAGE_KEY = 'poke_quest_data_v2'; // The master unified key
const LEGACY_STORAGE_KEY = 'pokequest_data';      // Trapped Copilot key
const MISSIONS_KEY = 'pokequest_missions';        // Alternative key

// ============================================
// CONSTANTS & CONFIG
// ============================================
const GENERATION_RANGES = [
    { gen: 1, min: 1, max: 151 },
    { gen: 2, min: 152, max: 251 },
    { gen: 3, min: 252, max: 386 },
    { gen: 4, min: 387, max: 493 },
    { gen: 5, min: 494, max: 649 },
    { gen: 6, min: 650, max: 721 },
    { gen: 7, min: 722, max: 809 },
    { gen: 8, min: 810, max: 905 },
    { gen: 9, min: 906, max: 1025 }
];
const ITEMS_PER_PAGE = 48;
const DEFAULT_GAME_ORDER = ["Emerald", "Crystal", "Yellow", "Platinum", "HeartGold", "Black 2", "Ultra Moon", "Legends: Z-A", "Other"];

// ============================================
// SYSTEM DEFAULT CAMPAIGNS (ALL 10 CAMPAIGNS RESTORED)
// ============================================
const defaultMissions = [
    {
        id: "m_emerald_cloning",
        title: "Battle Frontier Cloning Lab",
        tag: "Emerald (GBA)",
        color: "emerald",
        platform: "GBA (on DS Lite)",
        game: "Emerald",
        emoji: "🧪",
        desc: "Exploit Emerald's famous Battle Tower PC glitch to clone your rarest catches, master balls, and shinies before transferring them up.",
        tasks: [
            { id: "e1", text: "Reach Hoenn Battle Frontier", checked: false },
            { id: "e2", text: "Store target clones inside PC Box 1 & 2", checked: false },
            { id: "e3", text: "Exit PC, save game, and move them to party", checked: false },
            { id: "e4", text: "Soft-Reset during Multi-Battle saving prompt", checked: false }
        ]
    },
    {
        id: "m_crystal_celebi",
        title: "GS Ball Ilex Forest Event",
        tag: "Crystal (VC)",
        color: "purple",
        platform: "3DS Virtual Console",
        game: "Crystal",
        emoji: "🧅",
        desc: "Trigger the native Virtual Console Ilex forest shrine event to encounter and catch a 100% legitimate Shiny Celebi.",
        tasks: [
            { id: "c1", text: "Defeat Elite Four & enter Hall of Fame", checked: false },
            { id: "c2", text: "Obtain the GS Ball from Goldenrod PokeCom Center", checked: false },
            { id: "c3", text: "Deliver GS Ball to Kurt in Azalea Town (wait 24 hours)", checked: false },
            { id: "c4", text: "Soft reset shrine encounter for Shiny variant (1/8192)", checked: false }
        ]
    },
    {
        id: "m_crystal_ditto",
        title: "1-in-64 Shiny breeding Loop",
        tag: "Crystal (VC)",
        color: "indigo",
        platform: "3DS Virtual Console",
        game: "Crystal",
        emoji: "🧬",
        desc: "Exploit Gen 2's stat-based breeding system. By performing the double-transform glitch on a wild Ditto with a Shiny baby, any egg the Ditto produces has a phenomenal 1-in-64 shiny hatch rate.",
        tasks: [
            { id: "cd1", text: "Hatch Shiny baby from Route 34 Odd Egg (14% chance)", checked: false },
            { id: "cd2", text: "Let wild Ditto transform into Shiny baby, then let it use Metronome -> Transform", checked: false },
            { id: "cd3", text: "Catch the double-transformed Ditto", checked: false },
            { id: "cd4", text: "Leave it in Daycare with targets for 1/64 shiny eggs", checked: false }
        ]
    },
    {
        id: "m_yellow_mew",
        title: "Bypassing Mew's Transporter Lock",
        tag: "Yellow (VC)",
        color: "rose",
        platform: "3DS Virtual Console",
        game: "Yellow",
        emoji: "🐱",
        desc: "Perform the legendary Trainer-Fly glitch to catch Mew. To pass Poke Transporter's security check, you must name yourself GF (ID: 22796) and match GF EXP exactly.",
        tasks: [
            { id: "y1", text: "Execute Trainer-Fly glitch on Route 24", checked: false },
            { id: "y2", text: "Capture level 7 wild Mew with Trainer Name 'GF' and ID 22796", checked: false },
            { id: "y3", text: "Grind Mew's experience level to exactly 1,059,860 EXP", checked: false },
            { id: "y4", text: "Safely transport through Poke Transporter to Bank", checked: false }
        ]
    },
    {
        id: "m_platinum_cutecharm",
        title: "The 21% Shiny Cute Charm Glitch",
        tag: "Platinum (DS)",
        color: "cyan",
        platform: "DS Lite (Physical Carts)",
        game: "Platinum",
        emoji: "💫",
        desc: "Exploit Gen 4's RNG engine. Matching your Trainer ID (TID) and Secret ID (SID) forces a 21.8% shiny rate whenever a Cute Charm Pokemon leads your team.",
        tasks: [
            { id: "p1", text: "Configure system clock to hit target TID/SID seed", checked: false },
            { id: "p2", text: "Catch male Lead Pokemon with Cute Charm", checked: false },
            { id: "p3", text: "Explore Sinnoh's wild grass for 21.8% shinies", checked: false }
        ]
    },
    {
        id: "m_platinum_dns",
        title: "Sinnoh Event DNS Restore",
        tag: "Platinum (DS)",
        color: "amber",
        platform: "3DS XL / DS Lite",
        game: "Platinum",
        emoji: "📡",
        desc: "Configure network settings to route through a custom DNS proxy. This tricks your cartridge into downloading physical retro events (Member Card, Oak's Letter).",
        tasks: [
            { id: "pd1", text: "Change system DNS settings to 178.62.43.212", checked: false },
            { id: "pd2", text: "Download Member Card and Oak's Letter events", checked: false },
            { id: "pd3", text: "Travel to Newmoon Island to hunt Shiny Darkrai", checked: false }
        ]
    },
    {
        id: "m_hg_apriballs",
        title: "The daily Apriball Factory",
        tag: "HeartGold (DS)",
        color: "amber",
        platform: "DS Lite / 3DS XL",
        game: "HeartGold",
        emoji: "🥎",
        desc: "HeartGold is the absolute best game for gathering rare Kurt Poke Balls. Mass-producing Heavy, Lure, and Moon balls allows you to catch matching-aesthetic legendaries.",
        tasks: [
            { id: "h1", text: "Harvest Apricorn paths daily", checked: false },
            { id: "h2", text: "Deliver batches to Kurt in Azalea Town", checked: false },
            { id: "h3", text: "Export caught legendaries in Apriballs to HOME", checked: false }
        ]
    },
    {
        id: "m_b2_shinies",
        title: "The Unova Shiny Permits",
        tag: "Black 2 (DS)",
        color: "rose",
        platform: "DS / 3DS XL",
        game: "Black 2",
        emoji: "🐉",
        desc: "Black 2 offers two highly coveted, completely guaranteed, static shiny encounters that are native to your cartridge.",
        tasks: [
            { id: "b1", text: "Beat Benga in Area 10 of Black Tower to receive Shiny Gible", checked: false },
            { id: "b2", text: "Register all Unova Dex entries", checked: false },
            { id: "b3", text: "Obtain Permit from Professor Juniper to catch Shiny Haxorus", checked: false }
        ]
    },
    {
        id: "m_um_wormholes",
        title: "Alolan Warp Ride Lottery",
        tag: "Ultra Moon (3DS)",
        color: "purple",
        platform: "3DS Digital",
        game: "Ultra Moon",
        emoji: "🌀",
        desc: "Using the Ultra Warp Ride, non-legendary targets sitting in Tier 4 double-ring wormholes have a massive 36% shiny encounter rate.",
        tasks: [
            { id: "u1", text: "Fly past 4,000 light-years in Warp Ride", checked: false },
            { id: "u2", text: "Enter Tier 4 double-ring portal", checked: false },
            { id: "u3", text: "Encounter non-legendary shinies with 36% odds", checked: false }
        ]
    },
    {
        id: "m_za_mega",
        title: "Lumiose Mega Evolution Prep",
        tag: "Legends: Z-A",
        color: "emerald",
        platform: "Switch / Switch 2",
        game: "Legends: Z-A",
        emoji: "🗼",
        desc: "Prepare for the absolute revival of Mega Evolution. Set up transfers for high-value Kalos native species so they are ready to evolve on day one.",
        tasks: [
            { id: "z1", text: "Secure base forms of Kalos Starters", checked: false },
            { id: "z2", text: "Box historical Mega Evolution species in HOME ready for transfer", checked: false }
        ]
    }
];

// Seeded Pokédex mapping templates (for regionals and multi-forms)
const rawBaseDex = [
    { num: 1, name: "Bulbasaur", gen: 1 },
    { num: 19, name: "Rattata", gen: 1, hasRegional: true, regionalName: "Alolan" },
    { num: 25, name: "Pikachu", gen: 1 },
    { num: 37, name: "Vulpix", gen: 1, hasRegional: true, regionalName: "Alolan" },
    { num: 133, name: "Eevee", gen: 1 },
    { num: 152, name: "Chikorita", gen: 2 },
    { num: 201, name: "Unown", gen: 2, formsList: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","?","!"] },
    { num: 249, name: "Lugia", gen: 2 },
    { num: 251, name: "Celebi", gen: 2 },
    { num: 869, name: "Alcremie", gen: 8, formsList: ["Vanilla Cream", "Ruby Cream", "Matcha Cream", "Mint Cream", "Lemon Cream", "Salted Cream"] }
];

// ============================================
// SYSTEM TOASTS
// ============================================
function triggerToast(message, type = 'indigo') {
    const wrapper = document.getElementById('toast-wrapper');
    if (!wrapper) return;
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto bg-slate-900 flex items-center gap-2.5`;
    
    if (type === 'error') toast.classList.add('border-rose-500/30', 'text-rose-400');
    else if (type === 'success') toast.classList.add('border-emerald-500/30', 'text-emerald-400');
    else toast.classList.add('border-indigo-500/30', 'text-indigo-400');
    
    toast.innerHTML = `<span>✨</span> <span>${escapeHTML(message)}</span>`;
    wrapper.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 50);
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================
// STATE CONTROLLER & FAILSAFE RESCUE SYSTEM
// ============================================
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

const Storage = {
    // Rescue any lost records from legacy storage keys Copilot ignored
    rescueLegacyAchievements() {
        console.log("🛠️ App: Checking for legacy Achievements to rescue...");
        
        const keyOptions = [CURRENT_STORAGE_KEY, LEGACY_STORAGE_KEY, MISSIONS_KEY];
        let rescuedMissions = null;
        let rescuedPokemon = null;

        // Try parsing keys from highest priority to lowest
        for (const key of keyOptions) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        // Check if it's the unified v2 object
                        if (parsed.pokemon && Array.isArray(parsed.pokemon) && parsed.pokemon.length > 0) {
                            rescuedPokemon = parsed.pokemon;
                        }
                        if (parsed.missions && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
                            rescuedMissions = parsed.missions;
                        }
                        // Check if the parsed object was a direct array (old format)
                        if (Array.isArray(parsed)) {
                            if (parsed[0] && parsed[0].tasks) {
                                rescuedMissions = parsed;
                            } else if (parsed[0] && (parsed[0].num || parsed[0].dexNo)) {
                                rescuedPokemon = parsed;
                            }
                        }
                    }
                } catch(e) {}
            }
        }

        // Apply rescued arrays or fallback to preloaded defaults
        state.missions = rescuedMissions ? this.mergeMissions(defaultMissions, rescuedMissions) : defaultMissions;
        
        // Build national dex list and overlay achievements
        this.rebuildPokeboxMatrix(rescuedPokemon);
        this.save();
        
        if (rescuedPokemon || rescuedMissions) {
            setTimeout(() => triggerToast("Failsafe rescued your previous progress successfully!", "success"), 800);
        }
    },

    mergeMissions(defaults, rescued) {
        const rescuedMap = new Map(rescued.map(m => [m.id, m]));
        return defaults.map(m => {
            if (rescuedMap.has(m.id)) {
                const rMission = rescuedMap.get(m.id);
                // Preserve checked fields in tasks
                const taskMap = new Map(rMission.tasks.map(t => [t.id || t.text, t]));
                m.tasks.forEach(t => {
                    const rTask = taskMap.get(t.id) || taskMap.get(t.text);
                    if (rTask) t.checked = !!rTask.checked;
                });
            }
            return m;
        });
    },

    rebuildPokeboxMatrix(rescuedList) {
        const fullDex = [];
        const existingData = new Map(rescuedList ? rescuedList.map(p => [p.num || p.dexNo, p]) : []);
        const templateData = new Map(rawBaseDex.map(p => [p.num, p]));

        for (let i = 1; i <= 1025; i++) {
            let record = {
                num: i,
                name: `Species #${i}`,
                gen: 1,
                caughtNormal: false,
                caughtShiny: false,
                hasRegional: false,
                regionalName: "",
                caughtRegionalNormal: false,
                caughtRegionalShiny: false,
                formsList: [],
                caughtForms: []
            };

            // Calculate correct Generation Range
            for (const r of GENERATION_RANGES) {
                if (i >= r.min && i <= r.max) {
                    record.gen = r.gen;
                    break;
                }
            }

            // Overlay custom template (Unown alphabet, Regionals etc.)
            if (templateData.has(i)) {
                const temp = templateData.get(i);
                record.name = temp.name;
                record.hasRegional = !!temp.hasRegional;
                record.regionalName = temp.regionalName || "";
                record.formsList = temp.formsList || [];
            }

            // Overlay caught history
            if (existingData.has(i)) {
                const hist = existingData.get(i);
                record.caughtNormal = !!(hist.caughtNormal || hist.caught || hist.base);
                record.caughtShiny = !!(hist.caughtShiny || hist.shiny);
                record.caughtRegionalNormal = !!hist.caughtRegionalNormal;
                record.caughtRegionalShiny = !!hist.caughtRegionalShiny;
                record.caughtForms = hist.caughtForms || [];
                // preserve names from PokeAPI
                if (hist.name && !hist.name.startsWith("Species #")) {
                    record.name = hist.name;
                }
            }

            fullDex.push(record);
        }

        state.pokemon = fullDex;
    },

    save() {
        try {
            const output = { pokemon: state.pokemon, missions: state.missions };
            localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(output));
            this.updateStorageStats();
        } catch(e) {
            triggerToast("Cache quota exceeded!", "error");
        }
    },

    updateStorageStats() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        const used = (total / 1024).toFixed(1);
        const el = document.getElementById('storage-used');
        if (el) el.textContent = `${used} KB`;

        const syncArea = document.getElementById('sync-export-area');
        if (syncArea) {
            const baseStr = btoa(unescape(encodeURIComponent(JSON.stringify({ pokemon: state.pokemon, missions: state.missions }))));
            syncArea.value = baseStr;
        }
    }
};

// ============================================
// UI RENDERERS
// ============================================
const UI = {
    renderMissions() {
        const grid = document.getElementById('missions-list');
        if (!grid) return;

        const activeMissions = state.missions.filter(m => state.missionFilter === 'all' || m.game === state.missionFilter);
        
        if (activeMissions.length === 0) {
            grid.innerHTML = `<div class="col-span-full border border-dashed border-slate-800 p-12 text-center rounded-2xl text-xs text-slate-500">No active operational channels matched filter.</div>`;
            return;
        }

        grid.innerHTML = activeMissions.map(m => {
            const total = m.tasks.length;
            const completed = m.tasks.filter(t => t.checked).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            let accentBorder = 'border-indigo-500/10 focus-within:border-indigo-500/30';
            let fillBar = 'bg-indigo-500';
            if (m.color === 'emerald') { accentBorder = 'border-emerald-500/10 focus-within:border-emerald-500/30'; fillBar = 'bg-emerald-500'; }
            if (m.color === 'purple') { accentBorder = 'border-purple-500/10 focus-within:border-purple-500/30'; fillBar = 'bg-purple-500'; }
            if (m.color === 'cyan') { accentBorder = 'border-cyan-500/10 focus-within:border-cyan-500/30'; fillBar = 'bg-cyan-500'; }
            if (m.color === 'amber') { accentBorder = 'border-amber-500/10 focus-within:border-amber-500/30'; fillBar = 'bg-amber-500'; }
            if (m.color === 'rose') { accentBorder = 'border-rose-500/10 focus-within:border-rose-500/30'; fillBar = 'bg-rose-500'; }

            return `
                <div class="bg-slate-900/60 border ${accentBorder} rounded-2xl p-4 sm:p-6 flex flex-col justify-between space-y-4 transition">
                    <div class="space-y-2">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center space-x-2.5">
                                <div class="text-xl">${escapeHTML(m.emoji)}</div>
                                <div>
                                    <h4 class="text-xs sm:text-sm font-bold text-white">${escapeHTML(m.title)}</h4>
                                    <p class="text-[10px] font-medium text-slate-400">${escapeHTML(m.platform)}</p>
                                </div>
                            </div>
                            <span class="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase tracking-wider">${escapeHTML(m.tag)}</span>
                        </div>
                        <p class="text-xs text-slate-400 leading-relaxed">${escapeHTML(m.desc)}</p>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-slate-800/60">
                        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            ${m.tasks.map((t, idx) => `
                                <label class="flex items-start text-[11px] bg-slate-950/40 hover:bg-slate-950 p-2 border border-slate-800/40 rounded-xl cursor-pointer transition select-none">
                                    <input type="checkbox" data-mission-id="${m.id}" data-task-idx="${idx}" ${t.checked ? 'checked' : ''} class="mission-task-checkbox mt-0.5 h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 transition cursor-pointer shrink-0">
                                    <span class="ml-2 text-slate-300 leading-tight ${t.checked ? 'line-through text-slate-500' : ''}">${escapeHTML(t.text)}</span>
                                </label>
                            `).join('')}
                        </div>

                        <div class="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <div class="w-2/3 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                                <div class="h-full ${fillBar} transition-all duration-300" style="width: ${pct}%"></div>
                            </div>
                            <span>${completed}/${total} (${pct}%)</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.calculateGlobalMetrics();
    },

    calculateGlobalMetrics() {
        const progressGrid = document.getElementById('game-progress-grid');
        if (!progressGrid) return;

        let totalTasks = 0;
        let checkedTasks = 0;
        const gameMetrics = {};

        DEFAULT_GAME_ORDER.forEach(g => { gameMetrics[g] = { total: 0, checked: 0 }; });

        state.missions.forEach(m => {
            m.tasks.forEach(t => {
                totalTasks++;
                if (t.checked) checkedTasks++;
                
                const group = gameMetrics[m.game] ? m.game : 'Other';
                gameMetrics[group].total++;
                if (t.checked) gameMetrics[group].checked++;
            });
        });

        const globalPct = totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0;
        document.getElementById('overall-progress-text').innerText = `${globalPct}%`;
        document.getElementById('overall-progress-bar').style.width = `${globalPct}%`;

        progressGrid.innerHTML = DEFAULT_GAME_ORDER.map(g => {
            const item = gameMetrics[g];
            const pct = item.total > 0 ? Math.round((item.checked / item.total) * 100) : 0;
            return `
                <div class="bg-slate-950 border border-slate-900 rounded-xl p-2.5 flex flex-col justify-between">
                    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span class="truncate pr-1">${g}</span>
                        <span class="font-mono text-white shrink-0">${pct}%</span>
                    </div>
                    <div class="w-full bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div class="bg-indigo-500 h-full transition-all duration-300" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderDex() {
        const grid = document.getElementById('dex-grid');
        if (!grid) return;

        const filtered = state.pokemon.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(state.dexSearch.toLowerCase()) || p.num.toString() === state.dexSearch.trim();
            const matchesGen = state.dexGen === 'all' || p.gen.toString() === state.dexGen;
            
            let matchesState = true;
            const isCaughtBase = p.caughtNormal || p.caughtShiny;
            if (state.dexState === 'missing') matchesState = !isCaughtBase;
            if (state.dexState === 'caught') matchesState = isCaughtBase;
            if (state.dexState === 'shiny') matchesState = p.caughtShiny || p.caughtRegionalShiny;

            return matchesSearch && matchesGen && matchesState;
        });

        const totalItems = filtered.length;
        const maxPage = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
        if (state.currentPage > maxPage) state.currentPage = maxPage;

        const startIdx = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const slice = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

        document.getElementById('pagination-info').innerText = `Showing ${slice.length} of ${totalItems} entries`;
        document.getElementById('btn-prev-page').disabled = state.currentPage === 1;
        document.getElementById('btn-next-page').disabled = state.currentPage === maxPage;

        document.getElementById('stat-total-pokemon').innerText = state.pokemon.length;
        document.getElementById('stat-base-caught').innerText = state.pokemon.filter(p => p.caughtNormal || p.caughtShiny).length;
        document.getElementById('stat-total-forms').innerText = state.pokemon.reduce((acc, curr) => acc + (curr.caughtForms?.length || 0), 0);

        if (slice.length === 0) {
            grid.innerHTML = `<div class="col-span-full border border-dashed border-slate-800 p-16 text-center rounded-2xl text-xs text-slate-500">No synchronized species match parameters.</div>`;
            return;
        }

        grid.innerHTML = slice.map(p => {
            const formsCount = p.formsList ? p.formsList.length : 0;
            const caughtFormsCount = p.caughtForms ? p.caughtForms.length : 0;

            return `
                <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition focus-within:border-indigo-500/20">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="font-mono text-[10px] font-bold text-indigo-400">#${String(p.num).padStart(3, '0')}</span>
                            <h4 class="text-sm font-bold text-white capitalize">${escapeHTML(p.name)}</h4>
                        </div>
                        <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800/60 text-slate-500">GEN ${p.gen}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                        <label class="flex items-center text-[11px] font-medium text-slate-300 cursor-pointer select-none">
                            <input type="checkbox" data-dex-num="${p.num}" data-field="caughtNormal" ${p.caughtNormal ? 'checked' : ''} class="dex-node-checkbox h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 transition cursor-pointer">
                            <span class="ml-2">Normal</span>
                        </label>
                        <label class="flex items-center text-[11px] font-medium text-amber-400 cursor-pointer select-none">
                            <input type="checkbox" data-dex-num="${p.num}" data-field="caughtShiny" ${p.caughtShiny ? 'checked' : ''} class="dex-node-checkbox h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 transition cursor-pointer">
                            <span class="ml-2 flex items-center gap-0.5">✨ Shiny</span>
                        </label>
                    </div>

                    ${p.hasRegional ? `
                    <div class="space-y-1.5 pt-1 border-t border-slate-800/40">
                        <p class="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">${escapeHTML(p.regionalName)} Variant</p>
                        <div class="grid grid-cols-2 gap-2 bg-indigo-950/10 p-2 rounded-xl border border-indigo-500/10">
                            <label class="flex items-center text-[11px] font-medium text-slate-300 cursor-pointer select-none">
                                <input type="checkbox" data-dex-num="${p.num}" data-field="caughtRegionalNormal" ${p.caughtRegionalNormal ? 'checked' : ''} class="dex-node-checkbox h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 transition cursor-pointer">
                                <span class="ml-2">Reg Normal</span>
                            </label>
                            <label class="flex items-center text-[11px] font-medium text-amber-400 cursor-pointer select-none">
                                <input type="checkbox" data-dex-num="${p.num}" data-field="caughtRegionalShiny" ${p.caughtRegionalShiny ? 'checked' : ''} class="dex-node-checkbox h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 transition cursor-pointer">
                                <span class="ml-2 flex items-center gap-0.5">✨ Reg Shiny</span>
                            </label>
                        </div>
                    </div>
                    ` : ''}

                    ${formsCount > 0 ? `
                    <div class="pt-1">
                        <button onclick="toggleFormDrawer(${p.num})" class="w-full flex items-center justify-between text-left text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-purple-400 hover:text-purple-300 transition">
                            <span>🧬 Forms (${caughtFormsCount}/${formsCount})</span>
                            <span id="drawer-arrow-${p.num}">🔽</span>
                        </button>
                        
                        <div id="drawer-panel-${p.num}" class="hidden mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto space-y-1.5">
                            <div class="grid grid-cols-2 gap-1">
                                ${p.formsList.map(formName => {
                                    const isChecked = p.caughtForms && p.caughtForms.includes(formName);
                                    return `
                                        <label class="flex items-center text-[10px] bg-slate-900/40 hover:bg-slate-900 p-1.5 border border-slate-800/60 rounded-lg cursor-pointer transition select-none truncate">
                                            <input type="checkbox" data-dex-num="${p.num}" data-form-name="${escapeHTML(formName)}" ${isChecked ? 'checked' : ''} class="dex-form-checkbox h-3 w-3 rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0 transition cursor-pointer shrink-0">
                                            <span class="ml-1.5 text-slate-300 truncate ${isChecked ? 'text-purple-400 font-semibold' : ''}">${escapeHTML(formName)}</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
};

// Toggle accordion drawer for multi-form cards
function toggleFormDrawer(pokemonNum) {
    const panel = document.getElementById(`drawer-panel-${pokemonNum}`);
    const arrow = document.getElementById(`drawer-arrow-${pokemonNum}`);
    if (!panel || !arrow) return;
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        arrow.innerText = '🔼';
    } else {
        panel.classList.add('hidden');
        arrow.innerText = '🔽';
    }
}

// ============================================
// EXTERNAL POKEAPI INTEGRATION MODULE
// ============================================
async function runPokeApiSyncEngine() {
    const wrapper = document.getElementById('api-progress-wrapper');
    const label = document.getElementById('api-progress-label');
    const bar = document.getElementById('api-progress-bar');
    const percent = document.getElementById('api-progress-percent');
    
    wrapper.classList.remove('hidden');
    document.getElementById('api-sync-btn').disabled = true;

    try {
        const batchSize = 1025;
        label.innerText = `Establishing connection to PokéAPI...`;
        bar.style.width = `15%`;
        percent.innerText = `15%`;

        const res = await fetch(`${POKEAPI_BASE}?limit=${batchSize}`);
        if (!res.ok) throw new Error("Connection failed");
        const data = await res.json();
        
        bar.style.width = `50%`;
        percent.innerText = `50%`;
        label.innerText = `Merging local achievements with nomenclature maps...`;

        const apiResults = data.results;
        state.pokemon.forEach((p, idx) => {
            if (apiResults[idx]) {
                const apiName = apiResults[idx].name;
                // Clean styling
                p.name = apiName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
        });

        bar.style.width = `100%`;
        percent.innerText = `100%`;
        label.innerText = `Synchronization database locked!`;
        
        Storage.save();
        triggerToast("Nomenclature database synced from PokeAPI!", "success");
        setTimeout(() => {
            wrapper.classList.add('hidden');
            document.getElementById('sync-banner').classList.add('hidden');
        }, 2000);
    } catch (err) {
        triggerToast("Interface connection timed out.", "error");
        wrapper.classList.add('hidden');
    } finally {
        document.getElementById('api-sync-btn').disabled = false;
        UI.renderDex();
    }
}

// ============================================
// SYSTEM EVENT ROUTERS
// ============================================
const Events = {
    init() {
        this.initNavigation();
        this.initMissionCreator();
        this.initInteractiveFilters();
        this.initDexEventDelegation();
        this.initSyncControls();
    },

    initNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const mobileNav = document.getElementById('mobile-nav');

        if (navToggle) {
            navToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('hidden');
                navToggle.setAttribute('aria-expanded', 
                    navToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
            });
        }

        // Connect data tabs
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                state.currentTab = target;
                
                // Toggle tab display configs
                ['missions', 'dex', 'settings'].forEach(id => {
                    const content = document.getElementById(`tab-content-${id}`);
                    const tabBtn = document.getElementById(`tab-btn-${id}`);
                    const mobileBtn = document.getElementById(`tab-btn-${id}-mobile`);
                    
                    if (id === target) {
                        if (content) content.classList.remove('hidden');
                        if (tabBtn) tabBtn.className = "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-indigo-600 text-white shadow-md shadow-indigo-600/20";
                        if (mobileBtn) mobileBtn.className = "w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white transition-all";
                    } else {
                        if (content) content.classList.add('hidden');
                        if (tabBtn) tabBtn.className = "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-slate-400 hover:text-white";
                        if (mobileBtn) mobileBtn.className = "w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg text-slate-400 hover:text-white bg-slate-950 transition-all";
                    }
                });

                if (mobileNav) mobileNav.classList.add('hidden');

                if (target === 'missions') UI.renderMissions();
                if (target === 'dex') UI.renderDex();
            });
        });

        // Initialize App shell network configurations
        const statusEl = document.getElementById('offline-status');
        const banner = document.getElementById('offline-banner');
        const updateStatus = () => {
            if (navigator.onLine) {
                if (banner) banner.classList.add('hidden');
                if (statusEl) { statusEl.textContent = '🟢 Online'; statusEl.className = 'text-emerald-400'; }
            } else {
                if (banner) banner.classList.remove('hidden');
                if (statusEl) { statusEl.textContent = '🔴 Offline'; statusEl.className = 'text-rose-400'; }
            }
        };
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    },

    initMissionCreator() {
        const createBtn = document.getElementById('btn-create-mission');
        const cancelBtn = document.getElementById('btn-cancel-mission');
        const panel = document.getElementById('create-mission-panel');
        const form = document.getElementById('new-mission-form');

        if (createBtn) createBtn.addEventListener('click', () => panel.classList.toggle('hidden'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => { panel.classList.add('hidden'); form.reset(); });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('new-m-title').value.trim();
                const game = document.getElementById('new-m-game').value;
                const platform = document.getElementById('new-m-platform').value.trim();
                const tag = document.getElementById('new-m-tag').value.trim();
                const emoji = document.getElementById('new-m-emoji').value.trim();
                const color = document.getElementById('new-m-color').value;
                const desc = document.getElementById('new-m-desc').value.trim();
                const tasksRaw = document.getElementById('new-m-tasks').value.split('\n').filter(t => t.trim());

                const newMission = {
                    id: `m_${Date.now()}`,
                    title, game, platform, tag, emoji, color, desc,
                    tasks: tasksRaw.map((text, idx) => ({ id: `t_${idx}_${Date.now()}`, text, checked: false }))
                };

                state.missions.push(newMission);
                Storage.save();
                UI.renderMissions();
                form.reset();
                panel.classList.add('hidden');
                triggerToast("Custom campaign quest published safely.", "success");
            });
        }
    },

    initInteractiveFilters() {
        // Mission Game Filtration Buttons
        document.querySelectorAll('.mission-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mission-filter-btn').forEach(b => {
                    b.className = "mission-filter-btn px-3 py-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg text-xs font-bold whitespace-nowrap transition-all";
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.className = "mission-filter-btn px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-all";
                btn.setAttribute('aria-pressed', 'true');
                state.missionFilter = btn.dataset.filter;
                UI.renderMissions();
            });
        });

        // Dex search debouncing (Point 6 optimization)
        const debouncedSearch = debounce((query) => {
            state.dexSearch = query;
            state.currentPage = 1;
            UI.renderDex();
        }, 250);

        const searchBox = document.getElementById('dex-search');
        if (searchBox) searchBox.addEventListener('input', (e) => debouncedSearch(e.target.value));

        // Dex drop-downs
        const genFilter = document.getElementById('dex-gen-filter');
        if (genFilter) {
            genFilter.addEventListener('change', (e) => {
                state.dexGen = e.target.value;
                state.currentPage = 1;
                UI.renderDex();
            });
        }

        const stateFilter = document.getElementById('dex-state-filter');
        if (stateFilter) {
            stateFilter.addEventListener('change', (e) => {
                state.dexState = e.target.value;
                state.currentPage = 1;
                UI.renderDex();
            });
        }

        // Pagination buttons
        document.getElementById('btn-prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                UI.renderDex();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        document.getElementById('btn-next-page').addEventListener('click', () => {
            state.currentPage++;
            UI.renderDex();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    initDexEventDelegation() {
        // Memory-safe click bubbling listener (Point 5 optimization)
        const grid = document.getElementById('dex-grid');
        if (!grid) return;

        grid.addEventListener('change', (e) => {
            if (e.target.classList.contains('dex-node-checkbox')) {
                const num = parseInt(e.target.dataset.dexNum);
                const field = e.target.dataset.field;
                const p = state.pokemon.find(poke => poke.num === num);
                if (p) {
                    p[field] = e.target.checked;
                    Storage.save();
                }
            }

            if (e.target.classList.contains('dex-form-checkbox')) {
                const num = parseInt(e.target.dataset.dexNum);
                const formName = e.target.dataset.formName;
                const p = state.pokemon.find(poke => poke.num === num);
                if (p) {
                    if (!p.caughtForms) p.caughtForms = [];
                    if (e.target.checked) {
                        if (!p.caughtForms.includes(formName)) p.caughtForms.push(formName);
                    } else {
                        p.caughtForms = p.caughtForms.filter(f => f !== formName);
                    }
                    Storage.save();
                    // Live counter refresh
                    document.getElementById('stat-total-forms').innerText = state.pokemon.reduce((acc, curr) => acc + (curr.caughtForms?.length || 0), 0);
                }
            }
        });

        // Event listener for task checks in Missions
        const mGrid = document.getElementById('missions-list');
        if (mGrid) {
            mGrid.addEventListener('change', (e) => {
                if (e.target.classList.contains('mission-task-checkbox')) {
                    const mId = e.target.dataset.missionId;
                    const taskIdx = parseInt(e.target.dataset.taskIdx);
                    const m = state.missions.find(mission => mission.id === mId);
                    if (m && m.tasks[taskIdx]) {
                        m.tasks[taskIdx].checked = e.target.checked;
                        Storage.save();
                        UI.renderMissions();
                    }
                }
            });
        }
    },

    initSyncControls() {
        document.getElementById('api-sync-btn').addEventListener('click', runPokeApiSyncEngine);

        document.getElementById('btn-copy-export').addEventListener('click', () => {
            const copyArea = document.getElementById('sync-export-area');
            copyArea.select();
            navigator.clipboard.writeText(copyArea.value);
            triggerToast("Sync string cached on system clipboard.", "success");
        });

        document.getElementById('btn-import-sync').addEventListener('click', () => {
            const input = document.getElementById('sync-import-area').value.trim();
            if (!input) { triggerToast("Paste package code before loading data.", "error"); return; }
            
            try {
                const parsedString = decodeURIComponent(escape(atob(input)));
                const packet = JSON.parse(parsedString);
                
                if (packet.pokemon) {
                    const lookup = new Map(packet.pokemon.map(p => [p.num, p]));
                    state.pokemon.forEach(p => {
                        if (lookup.has(p.num)) {
                            const match = lookup.get(p.num);
                            p.caughtNormal = !!match.caughtNormal;
                            p.caughtShiny = !!match.caughtShiny;
                            p.caughtRegionalNormal = !!match.caughtRegionalNormal;
                            p.caughtRegionalShiny = !!match.caughtRegionalShiny;
                            p.caughtForms = match.caughtForms || [];
                            if (match.name) p.name = match.name;
                        }
                    });
                }
                if (packet.missions) {
                    state.missions = packet.missions;
                }
                
                Storage.save();
                triggerToast("Gemini synchronization matrix pipeline merged successfully!", "success");
                document.getElementById('sync-import-area').value = "";
                UI.renderMissions();
            } catch(e) {
                triggerToast("Invalid packet block format string.", "error");
            }
        });

        // App destruction safety gate
        document.getElementById('btn-clear-data').addEventListener('click', () => {
            if (confirm('⚠️ This will permanently erase ALL tracking data. Are you sure?')) {
                localStorage.clear();
                Storage.rebuildPokeboxMatrix(null);
                state.missions = defaultMissions;
                Storage.save();
                UI.renderMissions();
                triggerToast("Storage cache cleared to zero state.", "indigo");
            }
        });
    }
};

// ============================================
// SYSTEM ENTRY INITIALIZER
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PokeQuest app.js loading...');
    
    // Set system versions
    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.textContent = APP_VERSION;

    // Rescue achievements and build tables
    Storage.rescueLegacyAchievements();

    // Bind event controllers
    Events.init();

    // Start initial paint loop
    UI.renderMissions();
});

// ============================================
// AUXILIARY ENCODERS
// ============================================
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
