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

      { id: 102, displayName: "Anil Chaudhary", image: "/speakerImages/anil.png", description: `Anil Chaudhary, hailing from a Muzaffarnagar farming family with roots in Delhi, unexpectedly began his journey by stepping in as a substitute umpire at St. Stephen's ground. Quickly catching the cricketing world’s attention with his exceptionally calm demeanor under pressure, he cemented his legacy by officiating highest-level Tests, ODIs, and T20 Internationals, while remaining a defining fixture across seventeen IPL seasons.
      Since stepping back from active umpiring, he has taken on diverse roles that showcase his dynamic understanding of the sport. His transition into sports broadcasting offers fans a rare and insightful perspective from behind the microphone, while his mentorship programs and showbiz ventures bring exciting new shades to his public persona. From humble local pitches to becoming a prominent global figure, his journey reflects absolute composure and relentless passion, qualities that continue to define his ever-growing legacy.` },

      { id: 103, displayName: "Air Marshal Anil Chopra", image: "/speakerImages/airMarshalAnil.png", description: `From flying fighter aircraft to commanding some of the Indian Air Force’s most prestigious formations, Air Marshal Anil Chopra, PVSM, AVSM, VM, VSM (Retd.) has had an extraordinary journey. A distinguished fighter and test pilot, he was among the pioneers of the Mirage-2000, and went on to command fighter squadrons, operational airbases and ASTE.
      He served as Air Officer Commanding in Jammu & Kashmir and Air Officer-in-Charge Personnel at Air Headquarters, earning all four Presidential awards for his distinguished service.
      Today, he continues to contribute to defence and aerospace as an author, strategic affairs commentator and former DG of the Centre for Air Power Studies, while supporting Atmanirbharta in Defence as Strategic Advisor to the Society of Indian Defence Manufacturers (SIDM).
      From conquering the skies to exploring the frontiers of strategic thought, his journey is truly one of courage, command and curiosity.`},

      //  { id: 201, displayName: "Amitabh bachchan", image: "https://i.pinimg.com/736x/0b/47/89/0b4789216b0681982b090037fc7b7837.jpg", description: "A legendary Indian actor celebrated for his powerful screen presence, distinctive voice, and decades-long contribution to the film industry." },
      // { id: 202, displayName: "priyanka chopra", image: "https://i.pinimg.com/736x/60/f9/cb/60f9cbf04723cc8b3c7cd1b372ea72f1.jpg", description: "An Indian actor recognized for his versatility, exceptional dancing skills, and performances in action and drama films." },
      //   { id: 203, displayName: "deepika padukone", image: "https://i.pinimg.com/webp/736x/7b/6d/09/7b6d0987bc5830b76f5b92f4fc95167e.webp", description: "An Indian actor recognized for his versatility, exceptional dancing skills, and performances in action and drama films." },


    ]
  },
 

];