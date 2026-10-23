export const wedding = {
  couple: {
    groom: "Kenneth Medez",
    bride: "Danielle Kayle Antonio",
    initials: "K & D",
  },
  demoGuestName: "Family and Friends",
  dateTime: "2027-05-22T16:00:00+08:00",
  dateLabel: "Saturday, the twenty-second of May",
  dateShort: "22 May 2027",
  saveDate: "22 · 05 · 27",
  rsvpDeadline: "22 April 2027",
  year: "two thousand and twenty-seven",
  timezone: "Asia/Manila",
  location: "The Glasshouse · Tagaytay, Philippines",
  heroImage: "/Photos/Atekai1.jpg",
  storyImage:
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1100&q=85",
  themeImage:
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85",
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1400&q=85",
      alt: "A couple sharing a quiet moment in the garden",
      caption: "A quiet afternoon together",
    },
    {
      src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=900&q=85",
      alt: "Soft evening light at an outdoor celebration",
      caption: "Golden hour",
    },
    {
      src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
      alt: "An intimate celebration surrounded by flowers",
      caption: "The little things",
    },
    {
      src: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=85",
      alt: "A romantic wedding day detail",
      caption: "A day to remember",
    },
    {
      src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
      alt: "A floral arrangement in warm, natural light",
      caption: "With love, always",
    },
  ],
  story: [
    {
      date: "2019",
      title: "A chance introduction",
      description:
        "One shared table, a long conversation, and a feeling that the evening ended too soon.",
    },
    {
      date: "2021",
      title: "Our favorite adventures",
      description:
        "From weekend drives to finding our little rituals, every ordinary day became ours.",
    },
    {
      date: "2025",
      title: "The easiest yes",
      description:
        "A quiet question, a happy answer, and a promise to keep choosing each other.",
    },
  ],
  schedule: [
    { time: "3:30 PM", event: "Guest arrival" },
    { time: "4:00 PM", event: "Ceremony" },
    { time: "5:00 PM", event: "Cocktails & photographs" },
    { time: "6:30 PM", event: "Dinner & celebration" },
  ],
  weddingParty: {
    principalSponsors: [
      { ninong: "Ramon Villanueva", ninang: "Teresa Villanueva" },
      { ninong: "Antonio Santos", ninang: "Marissa Santos" },
      { ninong: "Gabriel Mendoza", ninang: "Lourdes Mendoza" },
      { ninong: "Enrique Castillo", ninang: "Sofia Castillo" },
    ],
    bestMan: "Adrian Cruz",
    groomsmen: ["Marco Reyes", "Paolo Garcia", "Luis Navarro", "Nathan Flores"],
    maidOfHonor: "Isabella Ramos",
    bridesmaids: ["Camille Santos", "Bianca Torres", "Sofia Dela Cruz", "Elena Bautista"],
  },
  palette: [
    { name: "Sage", color: "#9EAA91" },
    { name: "Olive", color: "#6C765E" },
    { name: "Champagne", color: "#D6C29A" },
    { name: "Warm ivory", color: "#F2EEE3" },
  ],
  attireExamples: [
    {
      label: "For men",
      title: "A relaxed formal look",
      description:
        "A tailored suit in olive, sage, or warm beige, paired with a crisp shirt and understated accessories.",
      image:
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=85",
      alt: "Example of a tailored formal suit for a garden wedding",
      imagePosition: "center 35%",
    },
    {
      label: "For women",
      title: "An airy garden silhouette",
      description:
        "A flowing midi or floor-length dress in a soft botanical or champagne tone, with comfortable shoes for the garden.",
      image:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",
      alt: "Example of an elegant flowing dress in a warm neutral tone",
      imagePosition: "center 30%",
    },
  ],
  faqs: [
    {
      question: "What should I wear?",
      answer:
        "Our dress code is garden formal. We would love to see soft, natural colors; please leave white and ivory for the couple.",
    },
    {
      question: "May I bring a plus-one?",
      answer:
        "Please contact us before bringing an additional guest so we can confirm availability.",
    },
    {
      question: "Is there parking at the venue?",
      answer:
        "Complimentary parking is available at The Glasshouse. Please allow a little extra travel time for Tagaytay traffic.",
    },
  ],
} as const;
