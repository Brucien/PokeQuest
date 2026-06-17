# 🌟 PokeQuest: Master Living Dex Companion

**PokeQuest** is the ultimate offline-first, tactical campaign tracker for Pokémon Living Dex hunters. Built specifically to organize progress across disparate legacy hardware, emulators, and modern Switch titles without requiring an active internet connection.

## ✨ Features

-   **🗺️ Hardware Campaign Dashboard:** Comes pre-loaded with 10 legendary physical game glitches and strategies (e.g., Emerald Battle Frontier Cloning, Gen 4 Cute Charm 21% Shiny Glitch, VC Crystal 1/64 Ditto Breeding).
    
-   **🗃️ Complete National Registry:** Generates all 1,025 species dynamically. Tracks normal catches, regional variants, alternate forms (Unown, Alcremie, etc.), and Shinies.
    
-   **🔒 Game Freak Shiny Locks:** Includes a hard-coded security registry of impossible shinies (preventing you from wasting time hunting mathematically impossible targets).
    
-   **⚡ PokeAPI Integration:** Instantly synchronizes live nomenclature and downloads high-res sprites that intelligently hide themselves if you drop offline.
    
-   **📱 True PWA Experience:** Uses a hardened Hybrid Service Worker to load instantly from your device cache. Add it to your iOS or Android home screen, and it functions exactly like a native app.
    
-   **💾 Gemini Sync Ready:** Generates portable Base64 encoded JSON strings of your progress, allowing you to back up your data or share your quest routes with AI assistants.
    

## 🚀 Quick Setup

This application is built entirely using vanilla JavaScript, HTML5, and Tailwind CSS. It requires zero build steps, bundlers, or servers.

1.  Clone or download the repository.
    
2.  Host it on **GitHub Pages**, Vercel, or simply open `index.html` in your browser.
    
3.  Tap **"Add to Home Screen"** on your mobile device for the full app experience.
    

## 🛠️ Tech Stack

-   **Frontend Engine:** Vanilla JavaScript (ES6+)
    
-   **Styling:** Tailwind CSS (via CDN) + Custom Local Fallback Matrix
    
-   **Storage:** LocalStorage API with Automated Failsafe Migration
    
-   **Network:** Service Workers (`sw.js`) with Cache-First asset routing
    
-   **External Data:** [PokéAPI](https://pokeapi.co/ "null")
    

## 📜 Version History

-   **v2.0.1** - Consolidated data engine, removed external JSON dependency, injected PokeAPI sprites, added Shiny Lock padlocks.
    
-   **v1.0.0** - Initial Copilot build (Deprecated).
    

## ⚠️ Notes for Developers

If you modify `app.js`, `index.html`, or `styles.css`, you **must** increment the `CACHE_VERSION` variable inside `sw.js` (e.g., from `v1.0.3` to `v1.0.4`). Failure to do so will result in mobile devices continuously loading the cached, older version of the app!