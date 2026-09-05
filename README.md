# ⚔️ D&D Centralized Campaign Companion & Hero Manager

A web-based **Dungeons & Dragons 5e Campaign Companion** built for our party. Features interactive d20 dice rollers, character-specific mechanic engines, inventory and encumbrance tracking, custom media uploaders, and a central campaign Guildhall.

---

## 🌟 The Heroes of the Realm

### 🗡️ Vesper Ashwood — *Level 3 Rogue (Soul Harvester)*
* **Signature Mechanics**: Soul Harvester Ring (`Dagger of Soul Harvesting`), Sneak Attack dice math, Cunning Action dashboard.
* **Aesthetic**: Shadow Realm purple & crimson gloom.
* **Interactive Rollers**: Clickable d20 stat blocks with Critical Hit (`💀 Natural 20`) and Critical Fail callouts.

### 🌙 Aria Sil’aveth — *Level 3 Sorcerer (Lunar Weaver)*
* **Signature Mechanics**: Dynamic **Lunar Phase Shift Engine** (*Full Moon*, *New Moon*, *Crescent Moon*) with automated spell slot discounts and Innate Sorcery starlight focus.
* **Aesthetic**: Celestial night sky with animated lunar orbits.
* **Interactive Rollers**: Clickable d20 stat blocks with Lunar Critical (`🌕 Natural 20`) callouts.

### ☀️ Cyrus Hyacinthus — *Level 3 Oracle Cleric (Solar Oracle)*
* **Signature Mechanics**: **Radiant Soul Transformation** (golden wings & radiant damage), **Healing Hands** pool, **Epiphany Augury Omen Generator** (*Weal*, *Woe*, *Weal & Woe*, *Nothing*), and Oracle Curse (*Lame*).
* **Aesthetic**: Golden Solar Sanctuary with sunbeams and temple artwork.
* **Interactive Rollers**: Clickable d20 stat blocks and weapon attack cards with Apollo divine roll feeds.

---

## 🎮 How to Play & Test (Player Guide)

### 1. ⚔️ Main Menu & Guildhall
* **Character Roster**: Select any character from the centralized main menu to view their backstory, combat statistics, and signature powers.
* **Quest Board**: View active campaign quests, post new objectives, and claim completed rewards.

### 2. 🎲 Interactive d20 Dice Roller
* **Ability Checks, Saves & Skills**: Click on any Ability Score card (e.g. `DEX +3`), Saving Throw row, or Skill row to roll a live d20 check.
* **Critical Alerts**: Automatically detects and highlights Natural 20s and Natural 1s with custom audio-visual feedback.

### 3. 📱 Mobile & Camera Customizer
* **Upload Custom Art**: Tap any character portrait avatar or the **Media Picker** icon in the navbar.
* **Phone Gallery & Camera**: Pick photos directly from your phone's camera roll or select from curated fantasy wallpapers.

### 4. 🎒 Inventory & Currency
* **Encumbrance Bar**: Automatically calculates carrying capacity (`STR × 15 lbs`) and flags encumbrance penalties.
* **Currency Grid**: Touch-friendly input fields for `CP`, `SP`, `EP`, `GP`, and `PP`.
* **Equip & Manage**: Toggle equipped gear, adjust quantities, and edit item descriptions on phone or desktop.

### 5. 💤 Rest & Recovery
* **Long Rest Button**: Click **"Rest at Temple"** or **"Long Rest"** to restore full HP, recover spell slots, and recharge daily features (Healing Hands, Radiant Soul, Epiphany, Innate Sorcery).

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Language**: TypeScript
* **Styling**: Custom HSL Color Tokens, Tailwind CSS, Glassmorphism, CSS Micro-animations
* **Icons**: [Lucide React](https://lucide.dev/)
* **Animations**: GSAP & CSS Keyframes

---

## 🚀 Local Development Setup

To run this app locally on your machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EarlDinosaur/Dungeons-and-Dragons-Character-Website.git
   cd Dungeons-and-Dragons-Character-Website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploying to Vercel

To host this website online so your party members can access it anytime on their phones:

1. Sign up / Log in to [Vercel](https://vercel.com) using your **GitHub account**.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Import **`Dungeons-and-Dragons-Character-Website`**.
4. Click **"Deploy"**.

Vercel will generate a live public URL (e.g., `https://dungeons-and-dragons-character-website.vercel.app`) that auto-updates whenever new changes are pushed to GitHub!
