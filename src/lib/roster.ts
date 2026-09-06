export interface CharacterRosterItem {
  id: string;
  name: string;
  title: string;
  race: string;
  characterClass: string;
  subclass: string;
  level: number;
  player: string;
  isUser: boolean;
  portraitUrl: string;
  primaryColor: string;
  accentColor: string;
}

export const PARTY_ROSTER: CharacterRosterItem[] = [
  {
    id: 'vesper',
    name: 'Earl',
    title: 'Vesper Ashwood',
    race: 'Human',
    characterClass: 'Rogue',
    subclass: 'Assassin',
    level: 10,
    player: 'You',
    isUser: true,
    portraitUrl: '/vesper-portrait.png',
    primaryColor: '#dc2626', // Crimson
    accentColor: '#ffd700',  // Gold
  },
  {
    id: 'aria',
    name: "Aria Sil'aveth",
    title: 'of The World',
    race: 'High Elf',
    characterClass: 'Sorcerer',
    subclass: 'Lunar Sorcery',
    level: 10,
    player: 'Friend',
    isUser: false,
    portraitUrl: '/aria-portrait.png',
    primaryColor: '#a992e8', // Lavender
    accentColor: '#d9b872',  // Gold
  },
  {
    id: 'cyrus',
    name: 'Cyrus Hyacinthus',
    title: 'Temple of Apollo',
    race: 'Aasimar',
    characterClass: 'Cleric',
    subclass: 'Light Domain',
    level: 10,
    player: 'Friend',
    isUser: false,
    portraitUrl: '/cyrus-portrait.png',
    primaryColor: '#eab308', // Gold
    accentColor: '#fbbf24',
  },
  {
    id: 'wynel',
    name: "Wyn'el Aeluin",
    title: 'Prince of House Aeluin',
    race: 'Half-Elf',
    characterClass: 'Warlock',
    subclass: 'Archfey Patron',
    level: 3,
    player: 'Friend',
    isUser: false,
    portraitUrl: '/wynel-portrait.png',
    primaryColor: '#ef4444', // Scarlet
    accentColor: '#f43f5e',
  },
];
