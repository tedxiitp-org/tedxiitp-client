// src/data/page.tsx

export interface Speaker {
  id: number;
  displayName: string;
  image: string;
  description: string;
}

export interface SpeakerPageData {
  pageId: number;

  mainSpeaker: {
    name: string;
    displayName: string;
    image: string;
    description: string;
  };
  sidebarSpeakers: Speaker[];
}

export const SPEAKER_PAGES: SpeakerPageData[] = [
  {
    pageId: 1,
   
    mainSpeaker: {
      name: "SPEAKER",
      displayName: "Karishma Sharma",
      image: "/speakerImages/karishma.png",
      description: "Karishma Sharma, a familiar face across Indian entertainment, began her journey with television before making her Bollywood debut with Pyaar Ka Punchnama 2. Since then, she has worked across films, television, and music videos, building a distinctive presence through her versatility and screen appeal. From Pyaar Ka Punchnama 2 to the widely loved Tera Ghata, her journey reflects an evolving career across different forms of storytelling.With every new role and opportunity, Karishma brings her own energy and perspective to the screen, continuing to explore new dimensions of performance and entertainment.",
    },
    sidebarSpeakers: [
      { id: 101, displayName: "Kishan Panpalia", image: "/speakerImages/kishan.png", description: "Kishan Panpalia is a Forbes 30 Under 30 honouree and a founding team member of Pepper Content, a multi-million-dollar content technology company. Beyond entrepreneurship, he has contributed to transformative initiatives including Project Raksha and Trinetra, leveraging technology and data-driven solutions to help drastically reduce crime across multiple cities. His journey reflects a rare blend of innovation, entrepreneurship, and social impact, demonstrating how technology can move beyond businesses to create meaningful change in society." },
      // { id: 102, displayName: "Mark Zuckerberg", image: "https://i.pinimg.com/736x/7e/7d/bb/7e7dbb12b2ddffb2f46a2867537db6db.jpg", description: "Often discusses social technology, AI, and virtual reality." },
      // { id: 103, displayName: "Jeff bezos", image: "https://i.pinimg.com/webp/736x/61/ac/54/61ac540d84604d0486669f358bc858aa.webp", description: "Speaks about entrepreneurship, customer focus, and long-term thinking." },
      //  { id: 201, displayName: "Amitabh bachchan", image: "https://i.pinimg.com/736x/0b/47/89/0b4789216b0681982b090037fc7b7837.jpg", description: "A legendary Indian actor celebrated for his powerful screen presence, distinctive voice, and decades-long contribution to the film industry." },
      // { id: 202, displayName: "priyanka chopra", image: "https://i.pinimg.com/736x/60/f9/cb/60f9cbf04723cc8b3c7cd1b372ea72f1.jpg", description: "An Indian actor recognized for his versatility, exceptional dancing skills, and performances in action and drama films." },
      //   { id: 203, displayName: "deepika padukone", image: "https://i.pinimg.com/webp/736x/7b/6d/09/7b6d0987bc5830b76f5b92f4fc95167e.webp", description: "An Indian actor recognized for his versatility, exceptional dancing skills, and performances in action and drama films." },


    ]
  },
 

];