"use client";

import React, { useState, useEffect } from 'react';
import { SPEAKER_PAGES, SpeakerPageData } from '../../../data/page';
import { Bebas_Neue, Space_Grotesk } from "next/font/google";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export default function SpeakerHome() {
  const currentPage: SpeakerPageData = SPEAKER_PAGES[0];
  const currentSidebarList = currentPage?.sidebarSpeakers || [];

  const allSpeakers = [
    {
      id: "main",
      image: currentPage?.mainSpeaker?.image,
      name: currentPage?.mainSpeaker?.name,
      displayName: currentPage?.mainSpeaker?.displayName,
      description: currentPage?.mainSpeaker?.description,
      isMain: true
    },
    ...currentSidebarList.map(s => ({
      id: s.id.toString(),
      image: s.image,
      name: "SPEAKER",
      displayName: s.displayName,
      description: s.description,
      isMain: false
    }))
  ];

  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeakerIndex((prevIndex) => (prevIndex + 1) % allSpeakers.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [allSpeakers.length]);

  if (!currentPage || allSpeakers.length === 0) {
    return (
      <div style={{ minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ letterSpacing: '2px' }}>LOADING SPEAKER CONFIGURATION...</p>
      </div>
    );
  }

  const currentActiveSpeaker = allSpeakers[activeSpeakerIndex];

  const handlePrev = () => {
    setActiveSpeakerIndex((prevIndex) => 
      prevIndex === 0 ? allSpeakers.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveSpeakerIndex((prevIndex) => (prevIndex + 1) % allSpeakers.length);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0a0505',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px 16px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      
      {/* INJECTED RESPONSIVE LAYOUT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scale-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transform: scale(1);
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
          outline: none;
        }
        @media (min-width: 768px) {
          .scale-btn {
            width: 150px;
            height: 150px;
          }
        }
        .scale-btn:hover {
          opacity: 1;
         }
        .scale-btn:active {
          transform: scale(0.94);
        }

        .speaker-grid {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 20px;
        }
        
        .thumb-column {
          display: flex;
          flex-direction: row;
          order: 2;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 0;
          justify-content: flex-start;
          width: 100%;
        }

        /* FIXED MOBILE PORTRAIT CONTAINER */
        .portrait-column {
          width: 100%;
          max-width: 280px;
          height: 360px;
          margin: 0 auto;
          order: 1;
          flex-shrink: 0;
        }

        .details-column {
          width: 100%;
          order: 3;
          display: flex;
          flex-direction: column;
          padding-left: 0;
          height: auto;
        }

        .title-underline-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: fit-content;
          margin-bottom: 16px;
        }
        .heading-title {
          font-size: clamp(36px, 7vw, 64px);
          text-transform: uppercase;
          letter-spacing: 2px;
          transform: scaleY(1.25);
          margin: 0;
          display: inline-block;
        }
        .red-line {
          width: 100%;
          height: 5px;
          background-color: #b30000;
          margin-top: 8px;
        }

        .content-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          margin-top: 10px;
        }

        @media (min-width: 1024px) {
          .speaker-grid {
            display: grid;
            grid-template-columns: 100px 400px 1fr;
            gap: 40px;
            align-items: start;
          }
          .thumb-column {
            flex-direction: column;
            order: unset;
            max-height: 480px;
            overflow-y: auto;
            overflow-x: hidden;
            justify-content: flex-start;
            padding: 0;
          }
          .portrait-column {
            max-width: none;
            height: 480px;
            margin: 0;
            order: unset;
          }
          .details-column {
            height: 480px;
            order: unset;
            padding-left: 20px;
            justify-content: space-between;
          }
          .content-block {
            align-items: flex-start;
            text-align: left;
          }
          .title-underline-container {
            align-items: flex-start;
            margin-left: 0px;
          }
        }
      `}} />

      <div className="speaker-grid" style={{ maxWidth: '1200px', position: 'relative' }}>
        
        {/* THUMBNAILS PANEL */}
        <div className="thumb-column no-scrollbar">
          {allSpeakers.map((speaker, index) => {
            const isSelected = index === activeSpeakerIndex;
            return (
              <div
                key={speaker.id}
                onClick={() => setActiveSpeakerIndex(index)}
                style={{
                  width: '75px',
                  height: '75px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  border: isSelected ? '3px solid #e61c1c' : '2px solid rgba(255,255,255,0.15)',
                  opacity: isSelected ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                <img
                  src={speaker.image}
                  alt={speaker.displayName || "Speaker"}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            );
          })}
        </div>

        {/* FEATURED MAIN PHOTO PORTRAIT BOX */}
        <div className="portrait-column" style={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '2px solid rgba(230, 28, 28, 0.6)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <img
            src={currentActiveSpeaker.image}
            alt={currentActiveSpeaker.displayName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.4s ease-in-out'
            }}
          />
        </div>

        {/* DETAILS PANEL & ACTION CONTROLS */}
        <div className="details-column">
          <div className="content-block">
         
            <div className="title-underline-container">
              <h3 className={`${bebasNeue.className} heading-title`}>
                {currentActiveSpeaker.name}
              </h3>
              <div className="red-line" />
            </div>

            <h4 
              className={bebasNeue.className}
              style={{
                fontSize: 'clamp(26px, 5vw, 35px)',
                margin: '0 0 15px 0',
                color: '#ffffff',
                textTransform: 'capitalize',
                letterSpacing: '1px'
              }}
            >
              {currentActiveSpeaker.displayName}
            </h4>

            <p 
              className={`${spaceGrotesk.className} text-sm md:text-base lg:text-lg leading-relaxed text-gray-300 text-center lg:text-left w-full mb-6 font-normal`}
            >
              {currentActiveSpeaker.description}
            </p>
          </div>

          {/* NEXT / PREV CAROUSEL CONTROLS */}
          
          {/* <div style={{
            display: 'flex',
            gap: '12px',
            alignSelf: 'center',
            marginTop: '10px',
            marginBottom: '10px'
          }}>
            <button onClick={handlePrev} className="scale-btn">
              <img 
                src="/image 13.svg" 
                alt="Previous Speaker" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </button>

            <button onClick={handleNext} className="scale-btn">
              <img 
                src="/image 14.svg" 
                alt="Next Speaker" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </button>
          </div> */}
        </div>

      </div>
    </div>
  );
}