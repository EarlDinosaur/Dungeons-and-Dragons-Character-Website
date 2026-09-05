import type { Metadata } from "next";
import { Cinzel, Crimson_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CharacterProvider } from "./providers";

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const crimsonText = Crimson_Text({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Earl — Vesper Ashwood | D&D 5e Character Sheet",
  description:
    "Interactive character sheet for Earl (Vesper Ashwood), a Human Rogue Assassin wielding The Orphan's Tithe. Features full level 1-20 progression, soul harvesting mechanics, inventory management, and campaign journal.",
  keywords: [
    "D&D",
    "5e",
    "character sheet",
    "rogue",
    "assassin",
    "interactive",
    "dark fantasy",
  ],
  authors: [{ name: "Vesper Ashwood" }],
  openGraph: {
    title: "Earl — Vesper Ashwood | D&D 5e Character Sheet",
    description:
      "A dark-fantasy interactive character sheet for a Human Rogue Assassin.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${crimsonText.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <CharacterProvider>{children}</CharacterProvider>
      </body>
    </html>
  );
}
