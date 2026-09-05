'use client';

import { useState } from 'react';
import { Scroll, Moon, Sparkles, BookOpen, Users, ChevronDown, ChevronRight, ShieldAlert, Heart, Eye } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { AriaState } from '@/lib/aria-engine';

interface AriaGrimoireProps {
  aria: AriaState;
  onNotesChange: (notes: string) => void;
}

export default function AriaGrimoire({ aria, onNotesChange }: AriaGrimoireProps) {
  const [activeSubTab, setActiveSubTab] = useState<'backstory' | 'npcs' | 'mysteries' | 'journal'>('backstory');
  const [expandedChapter, setExpandedChapter] = useState<string | null>('ch1');
  const [notesText, setNotesText] = useState(aria.notes);

  const handleNotesSave = (val: string) => {
    setNotesText(val);
    onNotesChange(val);
  };

  const backstoryChapters = [
    {
      id: 'ch1',
      title: 'Chapter I: The Night of Two Moons & The Silver Defiance',
      subtitle: 'The birth that defied a dark prophecy',
      content: `Aria was born beneath a sky that was never meant to have a moon.

For generations, a prophecy had foretold the night of his birth: "When the child draws his first breath beneath the moonless sky, the heavens shall fall silent, and darkness shall claim what the light cannot save." Astronomers had confirmed that the night would be moonless, and priests prepared themselves for whatever omen they believed would follow.

When the night finally came, there was no moon. No silver light touched the towers of Silverymoon.

The instant Aria drew his first breath, the heavens changed. Selûne's Tear appeared where no moon should have been, followed by Sehanine's Moonbow. Two moons rose together over Silverymoon, burning with such brilliant silver light that the city was bathed in a radiance brighter than day.

Far beyond mortal sight, Shar had come for the newborn child. The moonless night had been chosen deliberately—with no moon above Faerûn, darkness would have belonged entirely to her, and Aria's soul could be claimed under the ancient Umbral Clause.

But Selûne and Sehanine refused to surrender him. For a single night, the two goddesses turned their power against Shar, transforming the heavens into a battlefield. Mortals called it The Night of Two Moons. To the faithful, it became known as The Silver Defiance—the night two goddesses stood together and defied the Goddess of Darkness.

To Shar, it was something far more personal. It was a theft. A humiliation. A debt. She believed Aria belonged to her, and she never forgot that he had been taken from her grasp.`,
    },
    {
      id: 'ch2',
      title: 'Chapter II: The Child of the Silver Night & Shar\'s Hunt',
      subtitle: 'Thirty years of shadows across the Astral Plane',
      content: `Aria grew up knowing nothing of the battle fought above his cradle. The truth was buried beneath conflicting accounts and religious interpretations. Some called the two moons a miracle; others quietly feared he was cursed.

As he grew older, strange manifestations of lunar magic began to follow him. Moonlight seemed to linger around him, and his dreams carried him beneath unfamiliar stars. Eventually, the call of the Astral Plane became impossible to ignore, and Aria returned to the realm from which his people had once come. There, mortal time lost much of its meaning—years could pass in Faerûn while only moments seemed to pass for him.

But Shar did not need time. She only needed patience.

Among her followers, Aria became known as the stolen soul. The hunt began quietly: a nightmare that felt too real, a shadow that moved when nothing else did. Then came the hunters—a night hag who offered surrender, a Shadovar envoy who revealed the symbol of Shar, and a Sharran zealot who walked openly into a temple claiming that no holy ground could protect a soul already claimed.

They call what is coming the Second Night of Two Moons. They intend to bring Aria back to Silverymoon and force him beneath the same sky where Shar was once denied.

But Aria is no longer a helpless infant. He has crossed the Astral Plane, mastered lunar sorcery, and intends to decide who gets to collect the debt.`,
    },
    {
      id: 'ch3',
      title: 'Chapter III: The Return to Faerûn & The Search for Truth',
      subtitle: 'Searching for Elyndra, Caelan, and Matriarch Ilvaeress',
      content: `Aria did not return to Faerûn because he was afraid of Shar. He returned because he was tired of being kept in the dark.

His grandmother, Matriarch Ilvaeress Sil'aveth, still resides within the Astral Plane. Their letters have continued over the years, though Ilvaeress has always been careful with her words. Whenever Aria asks about his parents, her answers become even shorter.

His mother, Elyndra, disappeared while searching for a way to free him from Shar's claim. His father, Caelan, vanished while investigating the same mystery. Both were declared lost, yet neither body was ever found. Aria suspects that Ilvaeress knows more than she has told him.

Recently, Ilvaeress's letters carried a strange urgency—warning him not to return to Silverymoon. That was when Aria realized something that frightened him: his grandmother was not trying to keep him from discovering the truth; she was afraid of what would discover him.

Now Aria is in Faerûn searching for answers. His goal is simple: find his parents and uncover what was sacrificed on the night of two moons.`,
    },
  ];

  const npcs = [
    {
      name: "Matriarch Ilvaeress Sil'aveth",
      role: "Grandmother | Priestess of Sehanine",
      description: "Devout priestess who buried the truth of Aria's birth. She alone remembers the exact wording of the Umbral Clause. For thirty years, she believed silence was the only thing protecting Aria from Shar.",
      status: "Alive in the Astral Plane (Strained Letters)",
      icon: Moon,
    },
    {
      name: "Elyndra Sil'aveth",
      role: "Mother | Devotee of Sehanine",
      description: "Gentle and affectionate mother who witnessed the Night of Two Moons. She refused to accept Shar's claim over Aria and secretly searched forbidden texts for a way to break the bargain before vanishing mysteriously.",
      status: "Disappeared (Presumed Lost or Taken)",
      icon: Heart,
    },
    {
      name: "Caelan Sil'aveth",
      role: "Father | Astral Elf Noble & Warrior",
      description: "Astral elf warrior who investigated House Sil'aveth's ancient bargain after witnessing the dark sky during Aria's birth. He clashed with Shar's agents before vanishing without a trace.",
      status: "Disappeared (Possibility of Capture)",
      icon: Sparkles,
    },
    {
      name: "Thaeryn Sil'aveth",
      role: "Older Sister | Astral Elf",
      description: "Aria's closest sibling who remembers their childhood nights watching the stars. She never believed the official story of his birth and is furious he returned to Faerûn without her.",
      status: "In the Astral Plane",
      icon: Users,
    },
    {
      name: "Faelar Duskwhisper",
      role: "Childhood Steward | Witness to the Two Moons",
      description: "Former house servant who saw the moons appear and witnessed something unrecorded. Ordered to remain silent for thirty years, he now lives retired in Silverymoon carrying the weight of his secret.",
      status: "Retired in Silverymoon",
      icon: Eye,
    },
    {
      name: "Sister Yllara Moonwhisper",
      role: "Selûnite Priestess",
      description: "Priestess of Selûne who spent her life studying The Night of Two Moons. When she encounters Aria, she senses Selûne's protective starlight within his magic.",
      status: "Ally in Silverymoon",
      icon: Sparkles,
    },
    {
      name: "Master Ivo Elandor",
      role: "Arcane Mentor | Astral Elf Sorcerer-Scholar",
      description: "Aria's secret mentor who first recognized that Aria's lunar magic was fundamentally tied to the night of his birth. Warned Aria that Shar's darkness would feel his presence upon returning.",
      status: "Mentor in Astral Plane",
      icon: Scroll,
    },
    {
      name: "The Voice-of-Umbral",
      role: "Shar's Collector | Enforcer of the Umbral Clause",
      description: "Title passed between Shar's chosen servants tasked with enforcing the Umbral Clause. Views Aria not as a person, but as stolen property that must be returned to the Lady of Loss.",
      status: "Active Threat & Hunter",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#262b57] pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab('backstory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'backstory'
              ? 'bg-[#a992e8] text-black shadow-[0_0_15px_rgba(169,146,232,0.4)]'
              : 'bg-[#14183a] text-[#cfd4ee] border border-[#262b57] hover:border-[#a992e8]'
          }`}
        >
          <Scroll size={14} /> Backstory &amp; Legend
        </button>

        <button
          onClick={() => setActiveSubTab('npcs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'npcs'
              ? 'bg-[#a992e8] text-black shadow-[0_0_15px_rgba(169,146,232,0.4)]'
              : 'bg-[#14183a] text-[#cfd4ee] border border-[#262b57] hover:border-[#a992e8]'
          }`}
        >
          <Users size={14} /> Connected NPCs ({npcs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('mysteries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'mysteries'
              ? 'bg-[#a992e8] text-black shadow-[0_0_15px_rgba(169,146,232,0.4)]'
              : 'bg-[#14183a] text-[#cfd4ee] border border-[#262b57] hover:border-[#a992e8]'
          }`}
        >
          <Moon size={14} /> Mysteries &amp; Prophecies
        </button>

        <button
          onClick={() => setActiveSubTab('journal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'journal'
              ? 'bg-[#a992e8] text-black shadow-[0_0_15px_rgba(169,146,232,0.4)]'
              : 'bg-[#14183a] text-[#cfd4ee] border border-[#262b57] hover:border-[#a992e8]'
          }`}
        >
          <BookOpen size={14} /> Sorcerer Journal
        </button>
      </div>

      {/* SUB-TAB 1: CELESTIAL BACKSTORY CHAPTERS */}
      {activeSubTab === 'backstory' && (
        <div className="space-y-4">
          {backstoryChapters.map((ch) => {
            const isExpanded = expandedChapter === ch.id;
            return (
              <SpotlightCard key={ch.id} className="p-6 border-[#343a72] bg-gradient-to-b from-[#171b3f] to-[#0d1026]">
                <button
                  onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={18} className="text-[#a992e8]" /> : <ChevronRight size={18} className="text-[#9aa1cc]" />}
                    <div>
                      <h3 className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff]">
                        {ch.title}
                      </h3>
                      <p className="text-xs text-[#d9b872] italic">
                        {ch.subtitle}
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#262b57] space-y-3 text-sm text-[#cfd4ee] leading-relaxed font-['Spectral',serif] whitespace-pre-line">
                    {ch.content}
                  </div>
                )}
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: CONNECTED NPCS ROSTER */}
      {activeSubTab === 'npcs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {npcs.map((npc, idx) => {
            const Icon = npc.icon;
            return (
              <SpotlightCard key={idx} className="p-5 border-[#262b57] bg-[#14183a]">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#0d1026] border border-[#a992e8]/30 flex items-center justify-center text-[#a992e8] shrink-0">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff]">
                      {npc.name}
                    </h3>
                    <span className="text-[11px] text-[#d9b872] font-mono block">
                      {npc.role}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#cfd4ee] leading-relaxed mb-3">
                  {npc.description}
                </p>

                <div className="text-[10px] text-[#9aa1cc] font-mono pt-2 border-t border-[#262b57] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a992e8]" />
                  Status: <strong className="text-[#e8e6ff]">{npc.status}</strong>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: CAMPAIGN MYSTERIES */}
      {activeSubTab === 'mysteries' && (
        <div className="space-y-4">
          <SpotlightCard className="p-6 border-[#343a72] bg-[#14183a]">
            <h3 className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#d9b872] mb-1">
              The Umbral Clause &amp; The Second Night
            </h3>
            <p className="text-xs text-[#cfd4ee] mb-4">
              Shar&apos;s enforcers believe the first Night of Two Moons was only the beginning of the debt.
            </p>

            <div className="space-y-2 pt-3 border-t border-[#262b57]">
              <span className="text-[10px] uppercase tracking-wider text-[#9aa1cc] font-mono">Known Clues &amp; Omens:</span>
              <ul className="list-disc list-inside text-xs text-[#a992e8] space-y-1">
                <li>&ldquo;The debt remembers what the house forgot.&rdquo;</li>
                <li>Shadovar envoys tracking Aria across Faerûn and the Astral Plane.</li>
                <li>Fragments describing Selûne and Sehanine combining light to hide a soul.</li>
                <li>The missing bodies of Elyndra and Caelan.</li>
              </ul>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* SUB-TAB 4: SORCEROUS JOURNAL NOTES */}
      {activeSubTab === 'journal' && (
        <SpotlightCard className="p-6 border-[#343a72] bg-[#14183a]">
          <h3 className="text-lg font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff] mb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-[#a992e8]" /> Sorcerer Journal &amp; Notes
          </h3>
          <p className="text-xs text-[#9aa1cc] mb-4">
            Auto-saves to local storage as you type.
          </p>

          <textarea
            value={notesText}
            onChange={(e) => handleNotesSave(e.target.value)}
            rows={10}
            className="w-full bg-[#0d1026] border border-[#262b57] rounded-xl p-4 text-xs text-[#cfd4ee] font-['Spectral',serif] leading-relaxed focus:border-[#a992e8] focus:outline-none"
            placeholder="Record your spell observations, campaign clues, and astral notes..."
          />
        </SpotlightCard>
      )}
    </div>
  );
}
