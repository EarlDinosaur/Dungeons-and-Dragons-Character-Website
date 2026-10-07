# ⚔️ D&D Campaign Companion & Character Website — Knowledge Base

This document serves as the persistent project map and architectural memory. Refer to this to understand how the application is designed, how state flows, and where all systems reside.

---

## 🏛️ Project Overview & Architecture

A modern, high-aesthetic web application for Dungeons & Dragons 5e campaigns (**The Ashen Pact**).
Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, featuring custom fantasy styling, particle animations, and audio-visual dice rollers.

### Core Architecture Pillars:
1. **Central Guildhall & Character Sheets (`/`)**:
   - Displays all party members with signature mechanics, interactive d20 dice rollers, inventory, spells, multiclass progression, and narrative dossiers.
2. **Dungeon Master Command Sanctum (`/dm`)**:
   - Secure tactical console gated with DM clearance (`nat20` / `ashenpact` or custom passcode).
   - Manages party HP, conditions, combat initiative, NPCs, shops, campaign dispatches, and **Character Lore**.
3. **Resilient Offline-First Synchronization**:
   - Client states persist to browser `localStorage` and automatically push differential sync updates to a local SQLite (`dnd.db`) or Turso/libSQL backend via `/api/sync`.

---

## 👥 The Party Roster & Character Engines

| Character | Class / Subclass | Signature Mechanic & Component |
| :--- | :--- | :--- |
| **Earl / Vesper Ashwood** | Human Rogue (Assassin) | `SoulHarvester.tsx` — Dagger of Soul Harvesting vestige charges & phantom whispers |
| **Aria Sil'aveth** | Half-Elf Sorcerer (Lunar) | `LunarPhaseEngine.tsx` — Dynamic Moon Phase Shift (Full, New, Crescent) & spell discounts |
| **Cyrus Hyacinthus** | Aasimar Oracle (Solar) | `CyrusOracleEngine.tsx` — Radiant Soul wings, Healing Hands pool, Epiphany augury |
| **Wyn'el** | High Elf Warlock (Archfey) | `CrimsonTattooEngine.tsx` — Mother's Crimson Heart-Tattoo living grimoire & pact slots |
| **Kastoriel** | Half-Elf Druid (Stars) | `StarryFormEngine.tsx` — Starry Constellations (Archer, Chalice, Dragon) & Cosmic Omens |
| **Custom Heroes** | Any (Created via Builder) | Standard 5e progression, multiclassing, and custom themes |

---

## 📜 Dungeon Master Character Lore & Dossier System

The character lore and backstory system is fully editable by the Dungeon Master in real-time.

### Data Model:
- **`CharacterStoryData`** (`src/lib/character-stories.ts`):
  - `title`: Epic chronicle title (e.g., *"The Story of Vesper Ashwood"*).
  - `subtitle`: Heroic epigraph/identity tagline.
  - `chapters`: Array of `BackstoryChapter` (`id`, `title`, `subtitle`, `icon`, `content`).
  - `npcs`: Array of `CharacterNPC` (`name`, `role`, `relationship`, `status`, `icon`, `description`).
  - `dmSecretLore`: Confidential DM notes, hidden lineages, or plot revelations.
  - `dmSecretRevealed`: Boolean toggle controlling whether the revelation is visible on the player's dossier or DM eyes only.
  - `lastEditedAt` & `lastEditedBy`: Metadata tracking DM modifications.

### State Flow & Persistence:
1. **Context (`src/app/providers.tsx`)**:
   - Holds `characterLore: Record<string, CharacterStoryData>`.
   - Persists to `localStorage` (`dnd_ashen_pact_character_lore`).
   - Syncs to SQLite campaign table via `pushCampaignSync('character_lore', ...)`.
   - Distributes updates directly into character state dossiers for instant UI reactivity.
2. **Access Points for the Dungeon Master**:
   - **DM Command Sanctum (`/dm`)** $\rightarrow$ **Character Lore Tab**: Opens the full `<DMLoreManager />` codex.
   - **Party Roster View (`DMPartyRosterView.tsx`)**: Click the **`Lore`** button on any hero in Matrix or Card view to open `<DMLoreEditorModal />`.
   - **Player Lore Tab (`Dossier.tsx`)**: Click **`DM Edit Lore`** / **`Edit Lore (DM)`** at the top of the backstory tab (passcode prompted if unauthenticated).
3. **Player Experience**:
   - When players navigate to the **"Lore"** (Dossier) tab in `UnifiedCharacterSheet.tsx`, it dynamically displays the DM's updated chapters and NPC bonds.
   - If the DM has set `dmSecretRevealed: true`, an illuminated **"Dungeon Master Revelation • Arcane Chronicle"** parchment card appears above the chapters.

---

## 🗂️ Key Files Reference

```
src/
├── app/
│   ├── page.tsx                     # Guildhall main menu, character switching, mobile docks
│   ├── providers.tsx                # Central CharacterProvider (state, sync, lore, media)
│   ├── dm/page.tsx                  # DM Sanctum authentication gate & layout
│   └── api/
│       ├── sync/route.ts            # Differential SQLite / Turso synchronization endpoint
│       └── db-status/route.ts       # Database connectivity health check
├── components/
│   ├── dm/
│   │   ├── DMDashboardGrid.tsx      # Main DM console tabs (Roster, Combat, NPCs, Shops, Chronicle, Lore, Rules)
│   │   ├── DMLoreManager.tsx        # Interactive DM character lore editor & previewer
│   │   ├── DMLoreEditorModal.tsx    # Modal wrapper for editing lore from any screen
│   │   ├── DMPartyRosterView.tsx    # Matrix & card party roster with HP, rest, inventory, and lore buttons
│   │   ├── DMCombatEngine.tsx       # Initiative, turn order, combatant manager
│   │   ├── DMNPCCodex.tsx           # Custom NPC and monster database
│   │   ├── DMShopManager.tsx        # Campaign merchant shop builder
│   │   └── DMCampaignChronicle.tsx  # Campaign notes and dispatches
│   └── characters/
│       ├── shared/
│       │   ├── UnifiedCharacterSheet.tsx  # Universal sheet used by all characters
│       │   ├── BG3EquipmentPaperdoll.tsx  # Baldur's Gate 3 paperdoll equipment slots
│       │   └── PlayerChronicleView.tsx    # Player view of DM dispatches
│       └── vesper/
│           ├── Dossier.tsx          # Narrative tab: Lore, Allies, Mysteries, Journal + DM Edit button
│           └── SoulHarvester.tsx    # Vesper's artifact engine
└── lib/
    ├── types.ts                     # Core D&D 5e type definitions (CharacterState, DossierData, etc.)
    ├── character-stories.ts         # Canonical lore presets & getCharacterStory resolution
    ├── persistence.ts               # Recalculate level stats, default Vesper state, localStorage
    ├── sync-engine.ts               # Client-side SQLite synchronization engine
    └── db.ts                        # Server-side libSQL / SQLite database queries
```

---

## 🔑 DM Clearances & Quick Commands

- **Default DM Master Keys**: `nat20` or `ashenpact` (configurable via DM Sanctum header).
- **TypeScript Check**: `npx tsc --noEmit`
- **Development Server**: `npm run dev` (runs at `http://localhost:3000`)
