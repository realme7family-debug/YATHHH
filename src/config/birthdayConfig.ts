export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  location?: string;
  memoryTitle?: string;
  secretNote?: string;
}

export interface StatItem {
  number: string;
  label: string;
}

export const birthdayConfig = {
  // ─── Cover Slide 1 ───
  name: "Bestie",
  subtitle: "Aesthetic Birthday Deck",
  coverGreeting: "Happy Birthday",
  openingLine: "To the one who makes every moment unforgettable,",
  page1Tag: "/01",
  slide1BtnText: "Begin Her Story 🎀",

  // ─── About Her Slide 2 ───
  aboutTag: "Hi there",
  page2Tag: "/02",
  aboutTitle: "About You ✨",
  aboutQuote: "You carry a kind of grace that doesn't try to impress anyone, yet impresses everyone effortlessly.",
  vibeLabel: "Vibe",
  vibe: "Pure Sunshine & Aesthetic Grace",
  superpowerLabel: "Superpower",
  superpower: "Making everyone feel special",
  statusLabel: "Status",
  status: "The undisputed queen of our hearts",
  heartTagQuote: "Your task is to stay happy: ours is to love you forever.",
  slide2BtnText: "View Friendship Stats ✨",

  // ─── Friendship Stats Slide 3 ───
  statsTag: "Friendship stats",
  page3Tag: "/03",
  statsTitle: "Friendship stats",
  statsSubtitle: "Some friendships are measured in days — ours is measured in unforgettable memories.",
  stats: [
    { number: "365+", label: "Days of sunshine & smiles" },
    { number: "1000+", label: "Inside jokes & laughs" },
    { number: "01", label: "Best friend in the world" },
    { number: "100%", label: "Pure heart of absolute gold" },
  ] as StatItem[],
  slide3BtnText: "View Instagram Collage 📸",

  // ─── Insta Scrapbook Slide 4 ───
  instaTag: "Insta collage",
  page4Tag: "/04",
  instaTitle: "Happy Bestie Day!",
  instaNote: "Another year of chaos, another year of unshakeable friendship! Thanks for every single laugh, late-night chat, and memories we share.",
  instaSignoff: "Forever BFF!",
  badge1: "Nikhil ONLINE 24/7 • Bestie Core",
  badge2: "1000+ Followers of Your Smiles ✨",
  igHandle1: "bestie.birthday",
  igHandle2: "birthday.queen",
  slide4BtnText: "Make A Birthday Wish 🎂",

  // ─── Birthday Cake Slide 5 ───
  cakeTag: "Make a wish",
  page5Tag: "/05",
  cakeTitle: "Birthday Cake 🎂",
  cakeWishPrompt: "Make a wish in your heart, then blow out the candles 🕯️",
  cakeBlowBtnText: "Blow Out Candles 🕯️",
  cakeBlowingBtnText: "Blowing Candles...",
  wishesUnlockedMessage: "✨ Wish Unlocked ✨ Your wish has been sent to the universe!",
  slide5BtnText: "Explore Photo Memories 🖼️",

  // ─── Photos & Suspense Memories Slide 6 ───
  photosTag: "Favorite moments",
  page6Tag: "/06",
  slide6BtnText: "Read Heartfelt Postcard 💌",
  photos: [
    {
      id: "1",
      url: "/photos/photo1.png",
      caption: "Some moments stay etched in the heart forever.",
      location: "Traditional Elegance",
      memoryTitle: "The Grace & Elegance ✨",
      secretNote: "That traditional saree look took everyone's breath away. Pure perfection in every single detail."
    },
    {
      id: "2",
      url: "/photos/photo2.png",
      caption: "You carry a kind of quiet beauty that never fades.",
      location: "Late Night Conversations",
      memoryTitle: "Late Night Vibe 🌙",
      secretNote: "Those random late-night chats with your classic frames... where time just stopped existing."
    },
    {
      id: "3",
      url: "/photos/photo3.png",
      caption: "That smile has the power to light up any dark room.",
      location: "Golden Hour",
      memoryTitle: "The Million Dollar Smile 😊",
      secretNote: "Whenever you smile like this, the whole room brightens up instantly. Keep shining always."
    },
    {
      id: "4",
      url: "/photos/photo4.png",
      caption: "Effortlessly stylish, unapologetically you.",
      location: "City Outing",
      memoryTitle: "Effortless Charm 🩵",
      secretNote: "Casual blue top, perfect earrings, and that confident vibe. You make simplicity look so chic."
    },
    {
      id: "5",
      url: "/photos/photo5.png",
      caption: "Little stolen candid moments, big lifelong memories.",
      location: "Boulevard Walk",
      memoryTitle: "Candid Movie Scene 🎬",
      secretNote: "Fixing your earring like a character straight out of a classic aesthetic film. Unfiltered magic."
    },
    {
      id: "6",
      url: "/photos/photo6.png",
      caption: "Some people just bring sunshine wherever they go.",
      location: "Campus Green",
      memoryTitle: "Pure Warmth & Energy ☀️",
      secretNote: "Striped tee and that contagious happy walk. You make even an ordinary stroll feel special."
    },
  ] as PhotoItem[],

  // ─── Postcard Letter Slide 7 ───
  letterTag: "Postcard letter",
  page7Tag: "/07",
  letterBadge: "A Letter For Bestie 💌",
  letterOpenBtnText: "Open Postcard Letter 💌",
  slide7BtnText: "Final Celebration 🎉",
  letter: {
    salutation: "TO. BESTIE",
    paragraphs: [
      "Happy Birthday. And I mean that — not just as words you hear a hundred times today, but as something deep and real, from someone who genuinely sees how incredible you are.",
      "I don't say this enough, but knowing you has changed me in ways I can't fully explain. Your laugh, your honesty, the way you show up for people without expecting anything back — that's rare. That's you.",
      "In a world that moves so fast and forgets so easily, you are someone worth remembering. Worth celebrating. Worth every good thing that comes your way.",
      "I wanted to build something that says more than a simple text message ever could. Something created with thought and feeling, because you deserve to know — not just today, but always — how deeply valued you are.",
      "May this coming year bring you the peace you deserve, the big wins you've been working so hard for, and moments so beautiful they take your breath away.",
    ],
    closing: "Always yours,",
    sender: "Nikhil",
  },

  // ─── Thank You & Celebration Slide 8 ───
  thankYouTag: "Thank you",
  page8Tag: "/08",
  thankYouTitle: "Happy Birthday!",
  thankYouMessage: "Thank you for being the most genuine, beautiful, and awesome best friend. Here's to a lifetime of happiness!",
  songSubtext: "Cinematic Birthday Vibe",
  customTrackName: "Majboor — Cinematic Autotune Version",
  customAudioUrl: "",
  slide8BtnText: "Back to Start 🌸",

  // ─── Short emotional quotes ───
  quotes: [
    "You don't just exist in people's lives — you make them infinitely warmer.",
    "Some souls carry a light that no darkness can touch.",
    "The world is a much better place because you are in it.",
  ],
};

export type BirthdayConfigType = typeof birthdayConfig;

