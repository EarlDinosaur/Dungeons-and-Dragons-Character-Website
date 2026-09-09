import type { BackstoryChapter, CharacterNPC, DossierData, CharacterState } from './types';

export interface CharacterStoryData {
  title: string;
  subtitle: string;
  chapters: BackstoryChapter[];
  npcs: CharacterNPC[];
}

export const CHARACTER_STORIES: Record<string, CharacterStoryData> = {
  vesper: {
    title: 'The Story of Vesper Ashwood',
    subtitle: "Assassin of the Shadow Guild & Bearer of The Orphan's Tithe",
    chapters: [
      {
        id: 'orphanageMassacre',
        title: 'The Orphanage Massacre',
        subtitle: 'The night everything burned',
        icon: 'Flame',
        content: `The night the orphanage burned is the only memory that comes unbidden. Earl — then just another nameless child — watched from beneath a collapsed beam as Father Malachi's congregation performed their ritual. The iron manacles. The altar stone slick with something darker than wine. The screams that became whispers, then silence. He was seven years old. He was the only survivor, though "survivor" felt generous for what crawled out of the ashes.`,
      },
      {
        id: 'fatherMalachi',
        title: 'Father Malachi',
        subtitle: 'The mentor with poisoned hands',
        icon: 'Eye',
        content: `Father Malachi found him three days later, wandering the roads with burnt hands and empty eyes. The priest claimed divine providence. Earl learned to call it something else entirely. Malachi ran a parish that served as cover — a way station for information, contraband, and occasionally, people who needed to disappear. The old man taught Earl letters, numbers, and the catechism. He also taught him which herbs could put a man to sleep, which could stop a heart, and which could make the difference look natural.`,
      },
      {
        id: 'apprenticeApothecary',
        title: 'The Apothecary Cover',
        subtitle: 'Vesper Ashwood, humble shopkeeper',
        icon: 'Target',
        content: `By fifteen, Earl had constructed his cover identity with meticulous care. Vesper Ashwood — apprentice apothecary, quiet but reliable, known for his steady hands and knowledge of medicines. The shop in the merchant quarter was real. The tinctures he sold were genuine. The identity was flawless because it was built on truth: he did know medicines, he was a skilled herbalist, and Vesper Ashwood was, in every practical sense, a real person. The assassin underneath was simply the part that paid better.`,
      },
      {
        id: 'guildScoutVincent',
        title: 'Guild Scout Vincent',
        subtitle: 'The serpent coin on a rainy Tuesday',
        icon: 'Search',
        content: `Vincent appeared on a rain-soaked Tuesday, ordering a headache powder and leaving behind a coin with a serpent stamped on its face. The Guild's calling card. Vincent was a scout — the kind of person who found talent before it found trouble. He'd watched Earl for six months before making contact. "You have a gift," Vincent told him over cheap wine in a back room. "The Guild can sharpen it." What Vincent didn't say was that gifts, once given to the Guild, were never returned.`,
      },
      {
        id: 'bossDexter',
        title: 'Boss Dexter',
        subtitle: 'Handling assets with watchmaker precision',
        icon: 'Scroll',
        content: `Dexter runs the local Guild cell with the precision of a watchmaker and the morality of a plague rat. He is Earl's handler, his employer, and the closest thing to a patron he has in this city. Dexter doesn't ask questions about methods — only results. He pays well, protects his assets, and has exactly zero tolerance for loose ends. Earl respects him the way one respects a loaded crossbow: carefully, and always from the right end.`,
      },
    ],
    npcs: [
      {
        name: 'Father Malachi',
        role: 'Former Mentor & Parish Priest',
        relationship: 'Complicated past, dark secrets',
        description: 'Ran the parish that took Earl in after the massacre. Taught him herbs, poisons, and the cold calculations of survival.',
        status: 'Alive (Parish of St. Jude)',
        icon: 'Eye',
      },
      {
        name: 'Boss Dexter',
        role: 'Guild Cell Handler',
        relationship: 'Current Employer',
        description: 'Runs the local underworld syndicate with brutal efficiency. Demands results and never tolerates loose ends.',
        status: 'Active in the Undercity',
        icon: 'Scroll',
      },
      {
        name: 'Vincent',
        role: 'Late Guild Scout',
        relationship: 'Former Recruiter',
        description: 'The scout who delivered the serpent coin that inducted Earl into the Guild. Recently found dead under mysterious circumstances.',
        status: 'Deceased',
        icon: 'Search',
      },
    ],
  },

  aria: {
    title: "The Story of Aria Sil'aveth",
    subtitle: 'Child of the Silver Night, Lunar Weaver & Defier of Shar',
    chapters: [
      {
        id: 'ch-night-two-moons',
        title: 'Chapter I: The Night of Two Moons & The Silver Defiance',
        subtitle: 'The birth that defied an ancient dark prophecy',
        icon: 'Moon',
        content: `Aria was born beneath a sky that was never meant to have a moon.

For generations, a prophecy had foretold the night of his birth: "When the child draws his first breath beneath the moonless sky, the heavens shall fall silent, and darkness shall claim what the light cannot save." Astronomers had confirmed that the night would be moonless, and priests prepared themselves for whatever omen they believed would follow.

When the night finally came, there was no moon. No silver light touched the towers of Silverymoon.

The instant Aria drew his first breath, the heavens changed. Selûne's Tear appeared where no moon should have been, followed by Sehanine's Moonbow. Two moons rose together over Silverymoon, burning with such brilliant silver light that the city was bathed in a radiance brighter than day.

Far beyond mortal sight, Shar had come for the newborn child. The moonless night had been chosen deliberately — with no moon above Faerûn, darkness would have belonged entirely to her, and Aria's soul could be claimed under the ancient Umbral Clause.

But Selûne and Sehanine refused to surrender him. For a single night, the two goddesses turned their power against Shar, transforming the heavens into a battlefield. Mortals called it The Night of Two Moons. To the faithful, it became known as The Silver Defiance — the night two goddesses stood together and defied the Goddess of Darkness.

To Shar, it was something far more personal. It was a theft. A humiliation. A debt. She believed Aria belonged to her, and she never forgot that he had been taken from her grasp.`,
      },
      {
        id: 'ch-child-silver-night',
        title: "Chapter II: The Child of the Silver Night & Shar's Hunt",
        subtitle: 'Thirty years of shadows across the Astral Plane',
        icon: 'Sparkles',
        content: `Aria grew up knowing nothing of the battle fought above his cradle. The truth was buried beneath conflicting accounts and religious interpretations. Some called the two moons a miracle; others quietly feared he was cursed.

As he grew older, strange manifestations of lunar magic began to follow him. Moonlight seemed to linger around him, and his dreams carried him beneath unfamiliar stars. Eventually, the call of the Astral Plane became impossible to ignore, and Aria returned to the realm from which his people had once come. There, mortal time lost much of its meaning — years could pass in Faerûn while only moments seemed to pass for him.

But Shar did not need time. She only needed patience.

Among her followers, Aria became known as the stolen soul. The hunt began quietly: a nightmare that felt too real, a shadow that moved when nothing else did. Then came the hunters — a night hag who offered surrender, a Shadovar envoy who revealed the symbol of Shar, and a Sharran zealot who walked openly into a temple claiming that no holy ground could protect a soul already claimed.

They call what is coming the Second Night of Two Moons. They intend to bring Aria back to Silverymoon and force him beneath the same sky where Shar was once denied.

But Aria is no longer a helpless infant. He has crossed the Astral Plane, mastered lunar sorcery, and intends to decide who gets to collect the debt.`,
      },
      {
        id: 'ch-return-faerun',
        title: 'Chapter III: The Return to Faerûn & The Search for Truth',
        subtitle: 'Searching for Elyndra, Caelan, and Matriarch Ilvaeress',
        icon: 'Eye',
        content: `Aria did not return to Faerûn because he was afraid of Shar. He returned because he was tired of being kept in the dark.

His grandmother, Matriarch Ilvaeress Sil'aveth, still resides within the Astral Plane. Their letters have continued over the years, though Ilvaeress has always been careful with her words. Whenever Aria asks about his parents, her answers become even shorter.

His mother, Elyndra, disappeared while searching for a way to free him from Shar's claim. His father, Caelan, vanished while investigating the same mystery. Both were declared lost, yet neither body was ever found. Aria suspects that Ilvaeress knows more than she has told him.

Recently, Ilvaeress's letters carried a strange urgency — warning him not to return to Silverymoon. That was when Aria realized something that frightened him: his grandmother was not trying to keep him from discovering the truth; she was afraid of what would discover him.

Now Aria is in Faerûn searching for answers. His goal is simple: find his parents and uncover what was sacrificed on the night of two moons.`,
      },
      {
        id: 'ch-lunar-phases',
        title: 'Chapter IV: Celestial Lineage & The Three Lunar Phases',
        subtitle: 'Harmonizing Full Moon radiance with New Moon shadow',
        icon: 'Moon',
        content: `Aria's spellcraft is tethered to the eternal rhythm of lunar metamorphosis. Unlike conventional arcanists who memorize rigid formulas, Aria bends starlight according to three distinct cosmic tides:

• Full Moon: A blinding, unbroken beam of pure celestial radiance. In this state, Aria's defensive wards and abjurations shine with the protective fury of Selûne, repelling dark intruders.
• Crescent Moon: Silvery twilight and shifting mists. Deceptive, ethereal illusions and swift evasive steps make him nearly impossible to pin down in battle.
• New Moon: A chilled, shadowy umbra inherited from the lingering tendrils of Shar's touch. Here, cold darkness and necrotic siphon spells punish those who attempt to extinguish his light.

By balancing these celestial currents, Aria walks between radiant miracles and umbral defiance.`,
      },
    ],
    npcs: [
      {
        name: "Matriarch Ilvaeress Sil'aveth",
        role: 'Grandmother | Priestess of Sehanine',
        relationship: 'Family Elder & Guardian',
        description: "Devout priestess who buried the truth of Aria's birth. She alone remembers the exact wording of the Umbral Clause. For thirty years, she believed silence was the only thing protecting Aria from Shar.",
        status: 'Alive in the Astral Plane (Strained Letters)',
        icon: 'Moon',
      },
      {
        name: "Elyndra Sil'aveth",
        role: 'Mother | Devotee of Sehanine',
        relationship: 'Mother (Missing)',
        description: "Gentle and affectionate mother who witnessed the Night of Two Moons. She refused to accept Shar's claim over Aria and secretly searched forbidden texts for a way to break the bargain before vanishing mysteriously.",
        status: 'Disappeared (Presumed Lost or Taken)',
        icon: 'Heart',
      },
      {
        name: "Caelan Sil'aveth",
        role: 'Father | Astral Elf Noble & Warrior',
        relationship: 'Father (Missing)',
        description: "Astral elf warrior who investigated House Sil'aveth's ancient bargain after witnessing the dark sky during Aria's birth. He clashed with Shar's agents before vanishing without a trace.",
        status: 'Disappeared (Possibility of Capture)',
        icon: 'Sparkles',
      },
      {
        name: "Thaeryn Sil'aveth",
        role: 'Older Sister | Astral Elf',
        relationship: 'Sister & Confidant',
        description: "Aria's closest sibling who remembers their childhood nights watching the stars. She never believed the official story of his birth and is furious he returned to Faerûn without her.",
        status: 'In the Astral Plane',
        icon: 'Users',
      },
    ],
  },

  cyrus: {
    title: 'The Story of Cyrus Hyacinthus',
    subtitle: 'Solar Oracle of the Kingdom of Helios & Sworn Healer of Apollo',
    chapters: [
      {
        id: 'ch-kingdom-helios',
        title: 'The Kingdom of Helios',
        subtitle: 'The sun-drenched realm of marble and golden domes',
        icon: 'Sun',
        content: `Cyrus hails from Helios, a sun-drenched kingdom inspired by the grandeur of ancient Greece and Rome. Marble temples, stately colonnades, and golden-domed palaces rise beneath an ever-glowing sun. The kingdom values honor, sacred family oaths, and divine service to Apollo and the solar pantheon.

From his earliest years at court, Cyrus was immersed in philosophy, sacred herbcraft, and the diplomatic nuances required to maintain harmony across the realm's proud dynasties.`,
      },
      {
        id: 'ch-golden-veins',
        title: 'The Golden Veins',
        subtitle: 'The mysterious ichor beneath the skin',
        icon: 'Sparkles',
        content: `During his youth, while exploring the forgotten catacombs beneath an abandoned temple ruin, Cyrus stumbled upon a cracked alabaster font containing a glowing golden liquid. When he reached out, the fluid flared into luminous embers and was absorbed directly through his hands.

Ever since that day, intricate golden veins run visibly beneath Cyrus's skin. Whenever he channels divine magic or experiences overwhelming emotion, these veins glow with fierce solar fire, marking him as one touched by an ancient celestial power.`,
      },
      {
        id: 'ch-kings-illness',
        title: "King Zephyr's Illness & The Solar Vision",
        subtitle: 'A race against time to save a beloved king',
        icon: 'Heart',
        content: `King Zephyr Apollos, Cyrus's childhood companion, ruler of Helios, and unspoken love, has fallen victim to a mysterious, relentless illness that baffles the realm's finest physicians. His strength wanes with each passing moon, his skin growing pale and fevered.

Desperate for answers, Cyrus offered a blood-prayer before Apollo's altar. The god answered with a blinding epiphany: a vision of a radiant golden artifact hidden far beyond the borders of Helios, pulsing like a second heartbeat in unknown lands. Swearing an oath to Zephyr at the palace gates, Cyrus set out into the world to claim this cure or die trying.`,
      },
      {
        id: 'ch-oracle-curse',
        title: 'The Oracle Curse: Lame',
        subtitle: 'The physical price of divine sight',
        icon: 'Scroll',
        content: `Divine foresight is never granted without cost. Alongside his prophetic gifts, Cyrus was afflicted with the Oracle's Curse: Lame. One of his legs is permanently weakened and deformed, giving him an altered gait and reducing his overland movement.

He leans upon a polished walking cane carved from temple ironwood. Yet this physical burden has only deepened his spiritual endurance. His eyesight pierces magical shrouds, and his spirit refuses to falter under exhaustion.`,
      },
      {
        id: 'ch-familial-oaths',
        title: 'The Court of Apollo & Familial Oaths',
        subtitle: 'A lineage of medicine and diplomacy',
        icon: 'Users',
        content: `Born to court herbalist Rhea and royal diplomat Marcellus, alongside his elder siblings Octavia and Cassius, Cyrus carries the weight of a distinguished lineage. Furthermore, he is bound by a sacred chivalric oath to protect Queen Raedra, ensuring the royal court stands strong while the king battles his affliction.

Finding common cause with The Ashen Pact, Cyrus offers his radiant solar magic and healing touch to comrades who walk the dangerous edges of the world.`,
      },
    ],
    npcs: [
      {
        name: 'King Zephyr Apollos',
        role: 'King of Helios',
        relationship: 'Closest friend, confidant, and unspoken love',
        description: 'Childhood friend turned ruler. Suffers from a mysterious declining illness with no known cure. Cyrus was dispatched on a sacred pilgrimage to find the artifact capable of saving him.',
        status: 'Gravely Ill in Helios Palace',
        icon: 'Crown',
      },
      {
        name: 'Rhea Hyacinthus',
        role: 'Mother — Court Herbalist',
        relationship: 'Family (Mother)',
        description: 'Court herbalist and master apothecary of Helios. Taught Cyrus botany, medicinal tinctures, and gentle bedside care.',
        status: 'Active in Helios Court',
        icon: 'Leaf',
      },
      {
        name: 'Marcellus Hyacinthus',
        role: 'Father — Diplomat',
        relationship: 'Family (Father)',
        description: 'Distinguished statesman and diplomat who has mediated peace between neighboring provinces for decades.',
        status: 'Active in Helios Court',
        icon: 'Scroll',
      },
      {
        name: 'Octavia Hyacinthus',
        role: 'Elder Sister — Diplomat',
        relationship: 'Family (Sister)',
        description: "Followed in their father's footsteps as an emissary for the kingdom, fiercely protective of Cyrus.",
        status: 'On diplomatic mission',
        icon: 'Users',
      },
      {
        name: 'Cassius Hyacinthus',
        role: 'Older Brother — Herbalist & Physician',
        relationship: 'Family (Brother)',
        description: "Practices surgery and medicine alongside their mother, working around the clock to sustain King Zephyr's life.",
        status: 'Attending the King in Helios',
        icon: 'Heart',
      },
      {
        name: 'Queen Raedra',
        role: 'Queen — Determined Protector',
        relationship: 'Bond: Sworn to protect her',
        description: "Regent and protector of Helios during Zephyr's illness. Cyrus holds a solemn oath to defend her life against court conspirators.",
        status: 'Ruling in Helios',
        icon: 'Shield',
      },
    ],
  },

  wynel: {
    title: "The Story of Prince Wyn'el Aeluin",
    subtitle: 'Prince of House Aeluin (Exiled Heir) & Bearer of the Crimson Heart-Tattoo',
    chapters: [
      {
        id: 'ch-fall-house-aeluin',
        title: 'The Fall of House Aeluin',
        subtitle: 'Six hundred years dismantled in six hours',
        icon: 'Crown',
        content: `House Aeluin once governed the magnificent Silver Canopy of the Elven Borderlands. Renowned for centuries of high diplomacy, refined art, and celestial-fey alliances, the house fell in a single bloody twilight.

The royal seneschal, corrupted by foreign promises, orchestrated a poisoned banquet. Wyn'el, then second in line to the throne, watched his elder kin perish before his eyes. As traitor guards stormed the banquet hall, the peaceful realm was shattered into smoke and ash.`,
      },
      {
        id: 'ch-crimson-tattoo',
        title: "The Mother’s Final Gift: The Crimson Heart-Tattoo",
        subtitle: 'The living tome burned into soul and skin',
        icon: 'Flame',
        content: `Rather than letting the ancestral magical grimoire fall into the hands of the coup conspirators, Wyn'el's sorceress mother enacted a forbidden sealing rite.

Setting the grand tome ablaze with scarlet fire, she channeled the book's astral essence directly into Wyn'el's chest. "Let them take the marble, Wyn'el," she whispered as she shoved him through an escape rift. "The magic remains with you."

The grimoire burned permanently into his chest as The Crimson Heart-Tattoo — a living relic that beats with Scarlet Witch inspired chaos magic whenever danger threatens.`,
      },
      {
        id: 'ch-archfey-patron',
        title: 'The Archfey Patron & The Gloaming Court',
        subtitle: 'A pact sealed in blood and autumn mist',
        icon: 'Sparkles',
        content: `To stabilize the burning grimoire within his mortal body, Wyn'el was forced to forge a pact with a mercurial Archfey entity hailing from the Gloaming Court.

This otherworldly patron amplifies the chaos magic pulsing from his tattoo, granting him access to reality-bending scarlet pulses, charming presence, and unearthly wards. In exchange, the court demands favors that constantly test Wyn'el's noble conscience.`,
      },
      {
        id: 'ch-exile-pact',
        title: 'Exile and the Ashen Pact',
        subtitle: 'Traveling incognito under an alias',
        icon: 'Scroll',
        content: `Now wandering through unfamiliar provinces, Wyn'el conceals his Royal Signet Ring on a thin chain beneath his tailored obsidian velvet coat. He travels under a modest alias, ever mindful of the shadow-glass daggers carried by the seneschal's assassins.

He aligned himself with The Ashen Pact after recognizing fellow souls burdened by dangerous secrets. Together, they form a fellowship strong enough to one day storm the Silver Canopy and reclaim his stolen throne.`,
      },
    ],
    npcs: [
      {
        name: 'The Dowager Princess',
        role: "Mother | Master Sorceress",
        relationship: 'Mother (Deceased)',
        description: "Sacrificed her life during the coup banquet to seal the ancestral grimoire into Wyn'el's chest, ensuring House Aeluin's legacy survived.",
        status: 'Fallen in the Coup',
        icon: 'Heart',
      },
      {
        name: 'The Royal Seneschal',
        role: 'Traitor & Usurper',
        relationship: 'Sworn Nemesis',
        description: 'The trusted court advisor who poisoned the banquet and betrayed House Aeluin. Now rules the Silver Canopy as an iron tyrant.',
        status: 'Ruling the Elven Borderlands',
        icon: 'Crown',
      },
      {
        name: 'Archfey of the Gloaming Court',
        role: 'Otherworldly Patron',
        relationship: 'Pact Benefactor',
        description: 'An ancient fey sovereign of twilight and autumn leaves who channels chaos magic through the Crimson Heart-Tattoo.',
        status: 'Active in the Feywild',
        icon: 'Sparkles',
      },
      {
        name: 'Vesper Ashwood',
        role: 'Ashen Pact Ally',
        relationship: 'Comrade in Secrets',
        description: 'Observed the scarlet runes flaring during combat; shares an unspoken understanding of surviving on the run.',
        status: 'Active Party Member',
        icon: 'Eye',
      },
    ],
  },

  kastoriel: {
    title: 'The Story of Kastoriel',
    subtitle: 'The Grounded Star & Circle of the Stars Druid',
    chapters: [
      {
        id: 'ch-starlight-coven',
        title: 'The Starlight Coven & Foundling Rites',
        subtitle: 'Raised beneath the silent rotation of ancient constellations',
        icon: 'Sparkles',
        content: `Raised from infancy alongside his twin brother Poluxien by the secretive, reclusive Starlight Coven, Kastoriel was trained in astral divination and cosmic druidry.

With pale skin, sharp half-elven features, and thick, wavy white hair cascading like lunar mist around his shoulders, Kastoriel was the favored child of the celestial rites. He wore dramatic high-coven black druidic robes adorned with gold and orange embroidery depicting fallen star charts.`,
      },
      {
        id: 'ch-ritual-nelestel',
        title: 'The Dark Truth of Ritual N’elestel',
        subtitle: 'The horrific realization on their twentieth nameday',
        icon: 'Eye',
        content: `On the eve of their twentieth nameday, Kastoriel decoded an encrypted passage in the coven's sacred grimoire and discovered the terrible truth behind the grand ceremony planned for them.

The ancient ritual *N’elestel* ("The Final Star") was not a divine ascension. It was a blood sacrifice designed to slaughter his twin brother Poluxien, devouring his life essence to ground an alien cosmic horror directly into Kastoriel's flesh. The elders had bred the twins specifically to serve as anchor and fuel for this void entity.`,
      },
      {
        id: 'ch-theft-pendulum',
        title: 'The Escape & The Theft of Pendulum',
        subtitle: 'Stealing the tether blade under an eclipse',
        icon: 'Target',
        content: `Horrified and unwilling to allow his brother to be butchered, Kastoriel acted under the cover of a lunar eclipse.

He broke into the high sanctuary and stole the ritual's indispensable catalyst: Poluxien's soul-bound curved starblade, *Pendulum*. Forged from star-tempered quicksilver steel, the weapon was inextricably tied to Poluxien's soul. Without the blade, the coven could never complete the sacrifice. Clutching the weapon and his obsidian star map cylinder, Kastoriel fled into the wilderness.`,
      },
      {
        id: 'ch-brother-vengeance',
        title: "The Brother's Vengeance & The Psychic Tether",
        subtitle: 'Hunted by the very sibling he sacrificed everything to save',
        icon: 'Users',
        content: `Poluxien awoke to find his twin brother vanished and his sacred ancestral weapon gone. The coven elders seized the opportunity, poisoning Poluxien's mind with lies: they claimed Kastoriel had stolen his weapon out of jealousy and abandoned him to die.

Consumed by betrayal and rage, Poluxien became the coven's chief huntsman, tracking Kastoriel across mountain peaks with hunting hounds. Yet *Pendulum* continues to hum and vibrate whenever Poluxien draws near. Kastoriel keeps vigil through this psychic tether, determined to stay ahead of the hunters until he can find a way to sever the coven's lies and save his brother without shedding his blood.`,
      },
    ],
    npcs: [
      {
        name: 'Poluxien',
        role: 'Twin Brother & Chief Huntsman',
        relationship: 'Sibling turned Relentless Hunter',
        description: "Kastoriel's twin brother. Bound to the starblade Pendulum. Deceived by coven elders into believing Kastoriel betrayed him, he relentlessly tracks his twin across the realm.",
        status: 'Hunting Kastoriel in the Peaks',
        icon: 'Users',
      },
      {
        name: 'High Matron Naevys',
        role: 'Elder of the Starlight Coven',
        relationship: 'Former Guardian & Architect of the Sacrifice',
        description: "The ruthless elder who orchestrated the Ritual N'elestel. Dispatched inquisitors and trackers to capture Kastoriel alive and reclaim Pendulum.",
        status: 'Active in the High Coven Sanctuary',
        icon: 'Eye',
      },
      {
        name: 'The Void Entity of N’elestel',
        role: 'Fallen Cosmic Presence',
        relationship: 'Cosmic Threat',
        description: "An ancient cosmic entity that fell before the First Sundering. The coven seeks to tether it to Kastoriel's soul through Poluxien's blood.",
        status: 'Slumbering in the Void Gap',
        icon: 'Sparkles',
      },
    ],
  },
};

/**
 * Resolve canonical story data for any character ID or custom character state.
 */
export function getCharacterStory(
  characterIdOrName: string,
  character?: CharacterState
): CharacterStoryData {
  const normalized = (characterIdOrName || '').toLowerCase().trim();

  if (normalized === 'vesper' || normalized === 'earl') {
    return CHARACTER_STORIES.vesper;
  }
  if (normalized === 'aria' || normalized.includes('aria')) {
    return CHARACTER_STORIES.aria;
  }
  if (normalized === 'cyrus' || normalized.includes('cyrus')) {
    return CHARACTER_STORIES.cyrus;
  }
  if (normalized === 'wynel' || normalized.includes('wyn')) {
    return CHARACTER_STORIES.wynel;
  }
  if (normalized === 'kastoriel' || normalized.includes('kastoriel')) {
    return CHARACTER_STORIES.kastoriel;
  }

  // If character object has explicit chapters defined, return them!
  if (character?.dossier?.chapters && character.dossier.chapters.length > 0) {
    return {
      title: character.dossier.title || `The Story of ${character.name}`,
      subtitle: character.dossier.subtitle || `${character.race} ${character.class} • Level ${character.level}`,
      chapters: character.dossier.chapters,
      npcs: character.dossier.npcs || [],
    };
  }

  // Fallback for custom characters
  const charName = character?.name || characterIdOrName || 'Hero';
  const charClass = character?.class || 'Adventurer';
  const charRace = character?.race || 'Mortal';
  const charBg = character?.background || 'Wanderer';

  return {
    title: `The Story of ${charName}`,
    subtitle: `${charRace} ${charClass} • ${charBg}`,
    chapters: [
      {
        id: 'ch-origin',
        title: 'Origins & Heritage',
        subtitle: `Early years and foundational upbringing`,
        icon: 'Scroll',
        content: character?.dossier?.backstory?.orphanageMassacre
          ? character.dossier.backstory.orphanageMassacre
          : `${charName} began their journey across the realm driven by purpose and destiny. Raised in the traditions of their people, early experiences forged their character and resolve.`,
      },
      {
        id: 'ch-mentors',
        title: 'Mentors & Formative Bonds',
        subtitle: 'Those who guided the path',
        icon: 'Users',
        content: character?.dossier?.backstory?.fatherMalachi
          ? character.dossier.backstory.fatherMalachi
          : `Along the road, ${charName} encountered mentors, teachers, and companions who honed their talents as a ${charClass}, preparing them for dangerous trials ahead.`,
      },
      {
        id: 'ch-training',
        title: 'Discipline & Trade',
        subtitle: `Mastery over martial and esoteric skills`,
        icon: 'Target',
        content: character?.dossier?.backstory?.apprenticeApothecary
          ? character.dossier.backstory.apprenticeApothecary
          : `Years of discipline, rigorous combat drills, and study gave ${charName} the skills needed to survive hostile encounters and navigate treacherous territories.`,
      },
      {
        id: 'ch-alliances',
        title: 'Alliances & The Ashen Pact',
        subtitle: 'Companions bound by common peril',
        icon: 'Shield',
        content: character?.dossier?.backstory?.guildScoutVincent
          ? character.dossier.backstory.guildScoutVincent
          : `Drawn together with the heroes of The Ashen Pact, ${charName} recognized kindred spirits who face supernatural perils and ancient threats across the realm.`,
      },
      {
        id: 'ch-calling',
        title: 'Current Ambition & Quest',
        subtitle: 'The quest that drives the journey forward',
        icon: 'Eye',
        content: character?.dossier?.backstory?.bossDexter
          ? character.dossier.backstory.bossDexter
          : `Now venturing into dangerous territory, ${charName} seeks glory, redemption, and answers to the mysteries that haunt their past.`,
      },
    ],
    npcs: character?.dossier?.npcs || [],
  };
}
