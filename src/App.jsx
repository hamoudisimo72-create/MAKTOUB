"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Music,
  Play,
  Pause,
  Heart, 
  MapPin, 
  Copy, 
  Wine, 
  Crown, 
  Utensils, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/* ============================================================
   VENUE CAROUSEL — Auto-sliding with fade, dots & arrows
   ============================================================ */
const VENUE_PHOTOS = [
  { src: '/assets/images/venue_hall_3.jpg', alt: 'Salle des Fêtes The Queen — Crystal Lights' },
  { src: '/assets/images/venue_hall_2.jpg', alt: 'Salle des Fêtes The Queen — Grand Décor' },
];

function VenueCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    setCurrent((idx + VENUE_PHOTOS.length) % VENUE_PHOTOS.length);
  };

  // Auto-advance every 20 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % VENUE_PHOTOS.length);
    }, 20000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Reset timer on manual navigation
  const navigate = (idx) => {
    clearInterval(timerRef.current);
    goTo(idx);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % VENUE_PHOTOS.length);
    }, 20000);
  };

  return (
    <div className="vc-wrap">
      <div className="vc-stage">
        {VENUE_PHOTOS.map((photo, i) => (
          <img
            key={i}
            src={photo.src}
            alt={photo.alt}
            className={`vc-img${i === current ? ' vc-img-active' : ''}`}
          />
        ))}

        {/* Badge */}
        <div className="vc-badge">ROYAL VENUE · FES</div>

        {/* Buttons centered over image */}
        <div className="vc-center-btns">
          <a
            href="https://maps.google.com/?q=Salle+des+Fetes+The+Queen+Fes"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-metallic-gold"
          >
            <MapPin size={16} />
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // App & Language State
  const [lang, setLang] = useState('ar'); // Default to Arabic
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // Real-time Dynamic Countdown State until August 17, 2026
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [copyToast, setCopyToast] = useState(false);

  // Scroll-driven rose: tracks which timeline item is active
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0);
  const itemRefs = useRef([]);
  const rafRef = useRef(null);

  // Audio Ref
  const audioRef = useRef(null);

  // Real-time Countdown calculation (dynamic countdown)
  useEffect(() => {
    const weddingDate = new Date('August 17, 2026 20:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days: days < 10 ? '0' + days : String(days),
        hours: hours < 10 ? '0' + hours : String(hours),
        minutes: minutes < 10 ? '0' + minutes : String(minutes),
        seconds: seconds < 10 ? '0' + seconds : String(seconds),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll-driven rose: instant rAF-based scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const center = window.innerHeight / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const dist = Math.abs(itemCenter - center);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        setActiveTimelineIndex(bestIdx);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Logo color adapts to browser/theme background
  useEffect(() => {
    const applyLogoColor = (event) => {
      document.body.classList.toggle('dark-logo', event.matches);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyLogoColor(mediaQuery);
    mediaQuery.addEventListener?.('change', applyLogoColor);

    return () => {
      mediaQuery.removeEventListener?.('change', applyLogoColor);
    };
  }, []);

  // Always English / LTR
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
  }, []);

  const handleOpenInvitation = () => {
    if (!showIntro || isOpening) return;

    setVideoStarted(true);
    setVideoPlaying(true);
    setIsOpening(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }

    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Copy Address
  const handleCopyAddress = () => {
    const address = "Salle des Fêtes The Queen, Route de Sefrou, Fes, Morocco";
    navigator.clipboard.writeText(address);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  return (
    <div className="app-shell">
      {/* Background Audio Soundtrack (Einaudi Divenire) */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        src="https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3"
      />

      {showIntro && (
        <div
          className={`intro-portal${isOpening ? ' intro-opening' : ''}`}
          role="button"
          onClick={handleOpenInvitation}
          style={{ cursor: videoPlaying ? 'default' : 'pointer' }}
        >
          <div className="intro-video-wrap">
            <video
              ref={videoRef}
              className="intro-video"
              src="/assets/images/Video.mp4"
              muted
              playsInline
              preload="auto"
              controls={false}
              loop={false}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onEnded={() => {
                setVideoPlaying(false);
                setShowIntro(false);
                setIsOpening(false);
              }}
              onError={() => {
                setVideoStarted(false);
                setVideoPlaying(false);
              }}
            />
          </div>
          {!videoPlaying && (
            <div className="intro-cta-copy">
              <span className="intro-cta-arrow" />
              <p>Tap to open</p>
            </div>
          )}
        </div>
      )}

      <button
        className="music-fab"
        type="button"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        onClick={toggleAudio}
      >
        {isPlaying ? <Pause size={26} /> : <Play size={26} />}
      </button>

      {/* MAIN WEDDING LANDING PAGE */}
      <div 
        className="main-website" 
        style={{ 
          opacity: showIntro ? 0 : 1,
          visibility: showIntro ? 'hidden' : 'visible',
          pointerEvents: showIntro ? 'none' : 'auto'
        }}
      >
        {/* 1. HERO CARD (GOLD MARBLE ALCOHOL INK FULL SCREEN) — full width, outside wrapper */}
        <header className="marble-hero-container">
          <div className="marble-card-frame">
            <div className="marble-content-box">
              <div className="marble-welcome-tag">
                TOGETHER WITH THEIR FAMILIES
              </div>

              <div className="marble-names-block">
                <div className="marble-name-groom">Ayoub</div>
                <div className="marble-name-amp">and</div>
                <div className="marble-name-bride">Aya</div>
              </div>

              <div className="marble-date-numbers">
                17.08.26
              </div>
            </div>

            <div className="marble-down-arrow-wrap" onClick={() => window.scrollTo({ top: 750, behavior: 'smooth' })}>
              <div className="marble-chevron-down"></div>
            </div>

          </div>
        </header>

        <div className="site-content-wrapper">
          {/* 2. QURANIC VERSE SECTION (PURE VECTOR DOUBLE LINE POINTED MOROCCAN ARCH) */}
          <section className="pure-arch-verse-container" id="verse">
            <div className="pure-arch-verse-card">
              
              {/* Pure SVG Vector Arch Frame (1 Outer Line + 1 Thin Inner Line) */}
              <svg className="arch-svg-frame" viewBox="0 0 400 620" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Gold Line */}
                <path 
                  d="M 12 608 V 160 Q 12 80, 200 10 Q 388 80, 388 160 V 608 Z" 
                  stroke="#9E7D3B" 
                  strokeWidth="1.8" 
                  fill="none" 
                />
                {/* Inner Thin Gold Line */}
                <path 
                  d="M 18 602 V 162 Q 18 86, 200 18 Q 382 86, 382 162 V 602 Z" 
                  stroke="rgba(158, 125, 59, 0.45)" 
                  strokeWidth="0.8" 
                  fill="none" 
                />
              </svg>

              <div className="arch-card-content">
                {/* Bismillah in Gold Calligraphy */}
                <h3 className="blossom-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h3>

                {/* Exact Gold 4-Petal Arabesque Motif */}
                <div className="exact-arabesque-motif">
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#9E7D3B" strokeWidth="2">
                    <circle cx="50" cy="50" r="8" fill="rgba(158,125,59,0.1)" />
                    <path d="M50 18 C42 32, 42 38, 50 50 C58 38, 58 32, 50 18 Z" fill="rgba(158,125,59,0.08)" />
                    <path d="M50 82 C42 68, 42 62, 50 50 C58 62, 58 68, 50 82 Z" fill="rgba(158,125,59,0.08)" />
                    <path d="M18 50 C32 42, 38 42, 50 50 C38 58, 32 58, 18 50 Z" fill="rgba(158,125,59,0.08)" />
                    <path d="M85 50 C68 42, 62 42, 50 50 C62 58, 68 58, 85 50 Z" fill="rgba(158,125,59,0.08)" />
                  </svg>
                </div>

                {/* Quranic Verse Ar & En */}
                <p className="blossom-verse-ar">
                  "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ"
                </p>

                <p className="blossom-verse-en">
                  “And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.”
                </p>

                {/* Verse Reference Always Written in Arabic */}
                <div className="blossom-verse-ref">
                  سورة الروم (الآية 21)
                </div>

                {/* Horizontal Gold Line Divider with Centered Arabesque Motif */}
                <div className="gold-arabesque-line-divider">
                  <div className="line-half"></div>
                  <svg width="34" height="34" viewBox="0 0 100 100" fill="none" stroke="#9E7D3B" strokeWidth="2">
                    <circle cx="50" cy="50" r="8" fill="rgba(158,125,59,0.1)" />
                    <path d="M50 20 C43 32, 43 38, 50 50 C57 38, 57 32, 50 20 Z" fill="rgba(158,125,59,0.08)" />
                    <path d="M50 80 C43 68, 43 62, 50 50 C57 62, 57 68, 50 80 Z" fill="rgba(158,125,59,0.08)" />
                    <path d="M20 50 C32 43, 38 43, 50 50 C38 57, 32 57, 20 50 Z" fill="rgba(158,125,59,0.08)" />
                    <path d="M80 50 C68 43, 62 43, 50 50 C62 57, 68 57, 80 50 Z" fill="rgba(158,125,59,0.08)" />
                  </svg>
                  <div className="line-half"></div>
                </div>
              </div>

            </div>
          </section>

          <div className="gold-ornament">
            <Heart size={20} />
          </div>

          {/* 3. SMOOTH LIVE DYNAMIC GOLD TIMER DISPLAY */}
          <section className="clean-inline-countdown" id="countdown">
            <h2 className="clean-countdown-title">The Celebration Begins In</h2>

            <div className="clean-countdown-digits-row">
              <div className="countdown-unit-col">
                <span className="digit-unit">{countdown.days}</span>
                <span className="label-unit">Days</span>
              </div>
              <span className="colon-sep">:</span>
              <div className="countdown-unit-col">
                <span className="digit-unit">{countdown.hours}</span>
                <span className="label-unit">Hours</span>
              </div>
              <span className="colon-sep">:</span>
              <div className="countdown-unit-col">
                <span className="digit-unit">{countdown.minutes}</span>
                <span className="label-unit">Minutes</span>
              </div>
              <span className="colon-sep">:</span>
              <div className="countdown-unit-col">
                <span className="digit-unit">{countdown.seconds}</span>
                <span className="label-unit">Seconds</span>
              </div>
            </div>
          </section>


          <div className="gold-ornament">
            <Sparkles size={20} />
          </div>

          {/* 4. SCHEDULE OF EVENTS — Deckle Parchment Vertical Timeline */}
          <section className="soe-section">
            <div className="soe-card-shadow">
              <div className="soe-card">
                {/* Title with Gold Scroll Ornaments */}
                <div className="soe-title-row">
                  <svg className="soe-ornament" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10 Q10 2, 20 10 Q30 18, 40 10 Q50 2, 58 10" stroke="#9E7D3B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <circle cx="2" cy="10" r="2" fill="#9E7D3B"/>
                    <circle cx="58" cy="10" r="2" fill="#9E7D3B"/>
                  </svg>
                  <h2 className="soe-title">
                    {''}
                  </h2>
                  <svg className="soe-ornament" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10 Q10 18, 20 10 Q30 2, 40 10 Q50 18, 58 10" stroke="#9E7D3B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <circle cx="2" cy="10" r="2" fill="#9E7D3B"/>
                    <circle cx="58" cy="10" r="2" fill="#9E7D3B"/>
                  </svg>
                </div>

                {/* Vertical Timeline */}
                {/* Vertical Timeline — rose follows scroll via activeTimelineIndex */}
                <div className="soe-timeline">

                  {[
                    { time: '8 PM',     ar: 'استقبال الضيوف', en: 'Guest Arrival' },
                    { time: '9 PM',     ar: 'عقد القران',      en: 'Nikkah Ceremony' },
                    { time: '9:30 PM',  ar: 'الدخلة الملكية',  en: 'Grand Entrance' },
                    { time: '10:30 PM', ar: 'مأدبة العشاء',   en: 'Dinner' },
                    { time: '12 AM',    ar: 'الاحتفال والرقص', en: 'Celebration' },
                  ].map((item, i, arr) => {
                    const isActive = activeTimelineIndex === i;
                    const isNext   = activeTimelineIndex + 1 === i;
                    return (
                      <div
                        key={i}
                        className={`soe-item${i === arr.length - 1 ? ' soe-item-last' : ''}`}
                        ref={el => itemRefs.current[i] = el}
                      >
                        <span className={`soe-time${isActive ? ' soe-time-active' : isNext ? ' soe-time-next' : ' soe-time-dim'}`}>
                          {item.time}
                        </span>
                        <div className="soe-mid">
                          {i > 0 && <div className="soe-line-top"></div>}
                          {i === 0 && <div className="soe-line-top soe-line-invisible"></div>}
                          {isActive
                            ? <span className="soe-rose soe-rose-active">🌸</span>
                            : <span className={`soe-diamond${isNext ? ' soe-diamond-next' : ''}`}>◆</span>
                          }
                          {i < arr.length - 1 && <div className="soe-line-bottom"></div>}
                        </div>
                        <span className={`soe-event${isActive ? ' soe-event-active' : isNext ? ' soe-event-next' : ' soe-event-dim'}`}>
                          {item.en}
                        </span>
                      </div>
                    );
                  })}


                </div>
              </div>
            </div>
          </section>



          <div className="gold-ornament">
            <MapPin size={20} />
          </div>

          {/* 5. VENUE PHOTO GALLERY — Full-Width Carousel */}
          <section className="venue-gallery-section" id="venue">

            {/* Header */}
            <div className="venue-gallery-header">
              <div className="hero-tag" style={{ color: '#9E7D3B', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                {''}
              </div>
              <h2 className="venue-gallery-title">
                {''}
              </h2>
            </div>

            {/* Photo Carousel */}
            <VenueCarousel lang={lang} />

          </section>


          {/* CLOSING SECTION — Au plaisir de vous accueillir */}
          <section className="closing-section">

            {/* Bokeh background particles */}
            <div className="closing-bokeh" aria-hidden="true">
              {[...Array(22)].map((_, i) => (
                <span key={i} className={`bokeh-dot bokeh-dot-${i % 6}`} style={{
                  left: `${(i * 37 + 11) % 100}%`,
                  top:  `${(i * 53 + 7)  % 100}%`,
                  animationDelay: `${(i * 0.4).toFixed(1)}s`
                }} />
              ))}
            </div>

            {/* Crystal Chandelier — real illustration */}
            <img
              src="/assets/images/chandelier.jpg"
              alt="Crystal Chandelier"
              className="closing-chandelier"
            />


            {/* Gold cursive closing text */}
            <h2 className="closing-text">
              {''}
            </h2>

            {/* Ornamental divider */}
            <svg className="closing-divider" viewBox="0 0 300 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="14" x2="100" y2="14" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6"/>
              <path d="M100 14 Q108 6, 116 14 Q124 22, 132 14 Q140 6, 148 14 Q156 22, 164 14 Q172 6, 180 14" stroke="#C8A96E" strokeWidth="1.2" fill="none" opacity="0.75"/>
              <circle cx="140" cy="14" r="3.5" fill="#C8A96E" opacity="0.6"/>
              <circle cx="140" cy="14" r="1.5" fill="#F7E7C4" opacity="0.8"/>
              <line x1="180" y1="14" x2="300" y2="14" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6"/>
            </svg>

            {/* Floral medallion */}
            <svg className="closing-medallion" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="4" fill="#C8A96E" opacity="0.65"/>
              {[0,45,90,135,180,225,270,315].map((deg, i) => (
                <ellipse key={i}
                  cx={25 + 10 * Math.cos(deg * Math.PI / 180)}
                  cy={25 + 10 * Math.sin(deg * Math.PI / 180)}
                  rx="4.5" ry="2.5"
                  transform={`rotate(${deg}, ${25 + 10 * Math.cos(deg * Math.PI / 180)}, ${25 + 10 * Math.sin(deg * Math.PI / 180)})`}
                  fill="#C8A96E" opacity="0.5"
                />
              ))}
              <circle cx="25" cy="25" r="15" stroke="#C8A96E" strokeWidth="0.6" fill="none" opacity="0.35"/>
            </svg>

          </section>

          {/* FOOTER */}
          <footer className="site-footer">
            <div className="footer-logo">A & A</div>

            <div className="footer-names">
              <span className="footer-name-left">Ayoub</span>
              <span className="footer-ampersand">&</span>
              <span className="footer-name-right">Aya</span>
            </div>

            <div className="footer-date-line">
              17 · VIII · 2026
            </div>

            <div className="footer-bottom-line" />
          </footer>

        </div>
      </div>

    </div>
  );
}
