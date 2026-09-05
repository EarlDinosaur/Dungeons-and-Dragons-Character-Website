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
  title: "D&D 5e Campaign Companion — Hero Vault",
  description:
    "Interactive D&D 5e campaign companion and hero vault for Vesper Ashwood, Aria Sil'aveth, and Cyrus Hyacinthus. Features interactive d20 dice rollers, spellbook engines, inventory tracking, and campaign quest log.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  keywords: [
    "D&D",
    "5e",
    "character sheet",
    "campaign companion",
    "party manager",
    "interactive",
    "dark fantasy",
  ],
  authors: [{ name: "EarlDinosaur" }],
  openGraph: {
    title: "D&D 5e Campaign Companion — Hero Vault",
    description:
      "Interactive D&D 5e campaign companion and hero vault for Vesper Ashwood, Aria Sil'aveth, and Cyrus Hyacinthus.",
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
