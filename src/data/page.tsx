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

       { id: 201, displayName: "Maheep Singh", image: "/speakerImages/maheep.png", description: "Maheep Singh is a celebrated Indian stand-up comedian, humorist, writer, playwright, actor, and lyricist, known for his distinctive deadpan delivery and sharp observational humour. Often recognised as “The Gujarati Sardar,” Maheep has carved a unique space in Indian comedy through his understated storytelling, relatable anecdotes, and thoughtful takes on everyday life and society. He is also the founder of the New Delhi Comedy Club and has performed across India and internationally. A winner of Comedy Central’s India’s Best Comic Hunt, Maheep brings together humour, storytelling, and social commentary in a style that is both effortless and deeply engaging." },

      { id: 202, displayName: "Samir Kumar", image: "/speakerImages/samir.png", description: `Samir is the Country Manager for Amazon's Consumer Business in India. He took on this role in 2024, marking his second stint with Amazon India. Samir was an integral part of the leadership team that launched Amazon.in in 2013. Beyond India, he leads Amazon's Stores Business in Australia, drives Rest of World stores expansion, and oversees Prime, Delivery Experience, and Marketing functions across Emerging Markets.
      A 27-year Amazonian, Samir originally joined Amazon.com in 1999 as a Systems Engineer, where he led the first wave of fulfillment center expansion for Amazon in the US.
      Over the years, he has played a key role in expanding Amazon’s Stores business into new markets, including doubling the number of countries with Amazon Stores. He has also served as Technical Advisor to the Senior Vice President of International Stores.
      Samir holds a Master's in Electrical Engineering from Utah State University and a Bachelor's degree in Electronics Engineering from the National Institute of Technology, Rourkela in India.` },

        { id: 203, displayName: "Dr. Anup Kumar Keshri", image: "/speakerImages/anup.png", description: `Dr. Anup Kumar Keshri’s academic journey began with engineering studies at BIT Sindri and IIT Madras, culminating in a Ph.D. from Florida International University. Driven by a profound curiosity for structural innovation, he has dedicated his career to advancing materials science. Today, he serves as an Associate Professor of Metallurgical and Materials Engineering and the Associate Dean of Research and Development at IIT Patna & Project Director of TIH, where he actively shapes the next generation of engineers and scientific researchers.
        As the Principle Investigator of the Plasma Spray Coating Laboratory, Dr. Keshri’s expertise lies in surface engineering, thermal spraying, 2D Materials, and developing graphene-reinforced nanocomposites. His pioneering research focuses on exfoliation of bulk to 2D materials by age old plasma spray technique which has been highlighted globally by C&EN, Harvard University, The Graphene council and many more . Which can revolutionize the semiconductor industries, energy conversion and storage industries, aerospace, automobiles, healthcares etc.` },
    ]
  },
 

];