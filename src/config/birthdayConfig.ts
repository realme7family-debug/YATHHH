export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  location?: string;
  memoryTitle?: string;
  secretNote?: string;
}

export const birthdayConfig = {
  // ─── Her name ───
  name: "Bestie",

  // ─── The opening line that appears dramatically ───
  openingLine: "To the one who makes every moment unforgettable,",

  // ─── Photos & Suspense Memories ───
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

  // ─── Interactive Cake Candle Wish ───
  cakeWishPrompt: "Make a wish in your heart, then blow out the candles 🕯️",
  wishesUnlockedMessage: "Your wish has been sent to the universe ✨",

  // ─── The heartfelt letter — the soul of this page ───
  letter: {
    salutation: "Dear Bestie,",
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

  // ─── Short emotional quotes ───
  quotes: [
    "You don't just exist in people's lives — you make them infinitely warmer.",
    "Some souls carry a light that no darkness can touch.",
    "The world is a much better place because you are in it.",
  ],
};
