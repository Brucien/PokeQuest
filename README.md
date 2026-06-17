# 🌟 PokeQuest: Master Living Dex Companion

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-emerald.svg" alt="Status Active" />
  <img src="https://img.shields.io/badge/PWA-Supported-indigo.svg" alt="PWA Supported" />
  <img src="https://img.shields.io/badge/GraphQL-Enabled-purple.svg" alt="GraphQL Enabled" />
</div>

<br>

**PokeQuest** is the ultimate offline-first, tactical campaign tracker for Pokémon Living Dex hunters. Built specifically to organize progress across disparate legacy hardware, emulators, and modern Switch titles without requiring an active internet connection.

## ✨ Features

- **🗺️ Hardware Campaign Dashboard:** Comes pre-loaded with 10 legendary physical game glitches and strategies (e.g., Emerald Battle Frontier Cloning, Gen 4 Cute Charm 21% Shiny Glitch, VC Crystal 1/64 Ditto Breeding).
- **🗃️ Deep Dex Analytics:** Generates all 1,025 species dynamically. Visually tracks Base Catches, Genders, Regional variants, Forms, and Shinies for every single species.
- **🛡️ Game Freak Shiny Locks:** Includes a hard-coded security registry of impossible shinies (preventing you from wasting time hunting mathematically impossible targets).
- **🚀 GraphQL API Integration:** Fetches live nomenclature, Types, and Egg Groups for all 1,025 Pokemon in *one single high-speed payload* from the PokeAPI GraphQL server. High-res sprites intelligently hide themselves if you drop offline.
- **🔎 Master Grid Filtering:** Filter your entire 1,025 database by Generation, Collection Status, Pokémon Type, or Egg Group instantly. Includes dynamic pagination and page-jumping.
- **📱 True PWA Experience:** Uses a hardened Hybrid Service Worker to load instantly from your device cache. Add it to your iOS or Android home screen, and it functions exactly like a native app.
- **💾 Text-String Syncing:** Generates portable Base64 encoded JSON strings of your progress, allowing you to back up your data or share your quest routes with AI assistants.

## 🚀 Quick Setup

This application is built entirely using vanilla JavaScript, HTML5, and Tailwind CSS. It requires zero build steps, bundlers, or servers.

1. Clone or download the repository.
2. Host it on **GitHub Pages**, Vercel, or simply open `index.html` in your browser.
3. Tap **"Add to Home Screen"** on your mobile device for the full app experience.

## 🛠️ Tech Stack

- **Frontend Engine:** Vanilla JavaScript (ES6+)
- **Styling:** Tailwind CSS (via CDN) + Custom Local Fallback Matrix
- **Storage:** LocalStorage API with Automated Failsafe Migration
- **Network:** Service Workers (`sw.js`) with Cache-First asset routing
- **External Data:** [PokéAPI GraphQL](https://beta.pokeapi.co/graphql/console/)

## ⚠️ Notes for Developers

If you modify the source code, you **must** increment the `CACHE_VERSION` variable inside `sw.js`. Failure to do so will result in mobile devices continuously loading the cached, older version of the app!