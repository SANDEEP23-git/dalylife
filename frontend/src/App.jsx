import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Flame,
  HeartPulse,
  Lock,
  Mail,
  Menu,
  Moon,
  LogOut,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Target,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";

import "./App.css";
import SpecularButton from "./components/SpecularButton";
import Dock from "./components/Dock";
import OptionWheel from "./components/OptionWheel";

const API_URL = "/api";

/* =========================================================
   UI AUDIO & SOUND FEEDBACK SYSTEM
========================================================= */
let audioCtx = null;
export const initAudio = () => {
  try {
    if (typeof window === "undefined") return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
};

export const playAudio = (type = "click") => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "complete" || type === "quest" || type === "task") {
      // 🎶 Celebratory RPG Quest Victory Fanfare: C5 -> E5 -> G5 -> C6 with high bell shimmer
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.28, gain: 0.12 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.30, gain: 0.14 }, // E5
        { freq: 783.99, time: 0.16, dur: 0.34, gain: 0.16 }, // G5
        { freq: 1046.50, time: 0.24, dur: 0.55, gain: 0.20 }, // C6
        { freq: 2093.00, time: 0.24, dur: 0.38, gain: 0.06 }, // C7 Shimmer
      ];

      notes.forEach(({ freq, time, dur, gain: vol }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const start = now + time;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(vol, start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    } else if (type === "enter" || type === "warp") {
      // 🌌 Futuristic Cinematic Chord Sweep on Enter: D4 -> F#4 -> A4 -> D5 -> A5
      const notes = [
        { freq: 293.66, time: 0.00, dur: 0.38, gain: 0.11 }, // D4
        { freq: 369.99, time: 0.07, dur: 0.40, gain: 0.13 }, // F#4
        { freq: 440.00, time: 0.14, dur: 0.45, gain: 0.14 }, // A4
        { freq: 587.33, time: 0.21, dur: 0.55, gain: 0.18 }, // D5
        { freq: 880.00, time: 0.28, dur: 0.65, gain: 0.12 }, // A5
      ];

      notes.forEach(({ freq, time, dur, gain: vol }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const start = now + time;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(vol, start + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    } else if (type === "login" || type === "signup" || type === "auth") {
      // 🌟 Uplifting Triumphant Login/Signup Chime: E4 -> G#4 -> B4 -> E5 -> E6
      const notes = [
        { freq: 329.63, time: 0.00, dur: 0.25, gain: 0.11 }, // E4
        { freq: 415.30, time: 0.06, dur: 0.28, gain: 0.13 }, // G#4
        { freq: 493.88, time: 0.12, dur: 0.32, gain: 0.15 }, // B4
        { freq: 659.25, time: 0.18, dur: 0.50, gain: 0.19 }, // E5
        { freq: 1318.51, time: 0.18, dur: 0.35, gain: 0.07 }, // E6 Sparkle
      ];

      notes.forEach(({ freq, time, dur, gain: vol }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const start = now + time;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(vol, start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    } else if (type === "whoosh" || type === "switch") {
      // 💨 Smooth mode switch sound
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

      gainNode.gain.setValueAtTime(0.09, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === "pop" || type === "open") {
      // 🎈 Modal open / Goal add pop sound
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);

      gainNode.gain.setValueAtTime(0.10, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } else {
      // 🔘 Subtle crisp tactile click sound
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.038);

      gainNode.gain.setValueAtTime(0.085, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    }
  } catch (err) {
    // Graceful fallback
  }
};

/* =========================================================
   ANTIGRAVITY CURSOR SYSTEM
   Featuring Zero-G floating particles, dual-ring lerp
   tracking, gravitational shockwaves & magnetic element attraction
========================================================= */

function AntigravityCursor() {
  const canvasRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let isVisible = false;
    let isHovering = false;
    let isClicking = false;
    let activeMagnetic = null;

    const particles = [];
    const ripples = [];

    const getAccentColor = () => {
      const computed = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      return computed || "#4297ff";
    };

    // Spawn zero-gravity particles
    const spawnParticle = (x, y, count = 1, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        if (particles.length > 60) particles.shift();
        const angle = isBurst
          ? Math.random() * Math.PI * 2
          : (Math.random() - 0.5) * 1.6 - Math.PI / 2;
        const speed = isBurst ? Math.random() * 3.8 + 1.2 : Math.random() * 1.3 + 0.4;
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          // Negative vertical velocity creates zero-gravity upward drift (Antigravity effect)
          vy: isBurst ? Math.sin(angle) * speed - 0.6 : -(Math.random() * 1.3 + 0.7),
          size: Math.random() * 2.8 + 1.4,
          alpha: 0.85,
          decay: isBurst ? 0.024 : 0.016 + Math.random() * 0.012,
          isWhite: Math.random() > 0.45,
        });
      }
    };

    const spawnRipple = (x, y) => {
      ripples.push({
        x,
        y,
        radius: 6,
        maxRadius: 46,
        alpha: 0.8,
        speed: 2.4,
      });
    };

    const handlePointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isVisible = true;

      // Spawn smooth zero-g trailing stardust
      if (Math.random() > 0.35) {
        spawnParticle(mouseX, mouseY, 1, false);
      }

      // Magnetic hover target detection
      const target = e.target.closest?.(
        'button, a, input, textarea, [data-magnetic], [role="button"], .theme-toggle, .enter-button, .brand-symbol'
      );

      if (target && !target.disabled) {
        isHovering = true;
        activeMagnetic = target;
        const rect = target.getBoundingClientRect();
        const strength = target.matches("button, .enter-button") ? 0.16 : 0.1;
        const max = 7;
        const pullX = Math.max(-max, Math.min(max, (mouseX - (rect.left + rect.width / 2)) * strength));
        const pullY = Math.max(-max, Math.min(max, (mouseY - (rect.top + rect.height / 2)) * strength));
        target.style.translate = `${pullX}px ${pullY}px`;
      } else {
        isHovering = false;
        if (activeMagnetic) {
          activeMagnetic.style.translate = "";
          activeMagnetic = null;
        }
      }
    };

    const handleMouseDown = (e) => {
      isClicking = true;
      spawnRipple(e.clientX, e.clientY);
      spawnParticle(e.clientX, e.clientY, 15, true);
    };

    const handleMouseUp = () => {
      isClicking = false;
    };

    const handlePointerLeave = () => {
      isVisible = false;
      isHovering = false;
      if (activeMagnetic) {
        activeMagnetic.style.translate = "";
        activeMagnetic = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handlePointerLeave);

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const accentColor = getAccentColor();

      // Damped spring interpolation (lerp) for smooth trailing
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current && ringRef.current) {
        if (!isVisible) {
          dotRef.current.style.opacity = "0";
          ringRef.current.style.opacity = "0";
        } else {
          dotRef.current.style.opacity = "1";
          ringRef.current.style.opacity = "1";
          dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${
            isClicking ? 0.82 : isHovering ? 1.55 : 1
          })`;

          if (isHovering) {
            ringRef.current.classList.add("is-hovered");
            dotRef.current.classList.add("is-hovered");
          } else {
            ringRef.current.classList.remove("is-hovered");
            dotRef.current.classList.remove("is-hovered");
          }
        }
      }

      // Draw & update floating zero-gravity particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.025; // Continuous zero-gravity upward drift
        p.vx *= 0.985; // Subtle atmospheric drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.isWhite ? "#ffffff" : accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.2, p.size * (p.alpha / 0.85)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw gravitational shockwave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.032;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handlePointerLeave);
      if (activeMagnetic) {
        activeMagnetic.style.translate = "";
      }
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="antigravity-particles-canvas" aria-hidden="true" />
      <div ref={dotRef} className="antigravity-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="antigravity-cursor-ring" aria-hidden="true" />
    </>
  );
}


/* =========================================================
   THEME TOGGLE
========================================================= */

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <motion.button
      className="theme-toggle"
      onClick={() => {
        playAudio("pop");
        toggleTheme();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
      title={
        theme === "light"
          ? "Switch to dark theme"
          : "Switch to light theme"
      }
    >
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.span
            key="moon"
            initial={{
              opacity: 0,
              rotate: -45,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              rotate: 45,
              scale: 0.7,
            }}
          >
            <Moon size={17} strokeWidth={1.8} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{
              opacity: 0,
              rotate: 45,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              rotate: -45,
              scale: 0.7,
            }}
          >
            <Sun size={17} strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* =========================================================
   INDIAN TIME CLOCK (IST)
========================================================= */

function IndianTimeClock() {
  const [timeStr, setTimeStr] = useState(() => {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="indian-time-badge" title="Live Indian Standard Time (IST)">
      <Clock size={13} className="indian-clock-icon" />
      <span className="indian-time-text">{timeStr}</span>
      <span className="indian-time-pill">IST</span>
    </div>
  );
}

/* =========================================================
   GOAL COUNTDOWN TIMER & COMPLETION BADGE
========================================================= */

function GoalCountdown({ targetTime, createdAt, completed }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (completed) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [completed]);

  if (completed) {
    return (
      <span className="goal-time-badge completed">
        <Check size={11} strokeWidth={2.5} /> Completed
      </span>
    );
  }

  const effectiveTarget = targetTime ? Number(targetTime) : (createdAt ? Number(createdAt) + 3600 * 1000 : null);
  if (!effectiveTarget) return null;

  const diffMs = effectiveTarget - now;
  const isOverdue = diffMs <= 0;

  const targetDateStr = new Date(effectiveTarget).toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isOverdue) {
    const overdueSecs = Math.abs(Math.floor(diffMs / 1000));
    const overdueMins = Math.floor(overdueSecs / 60);
    const overdueHours = Math.floor(overdueMins / 60);
    const overdueDays = Math.floor(overdueHours / 24);

    const timeOverStr = overdueDays > 0
      ? `${overdueDays}d ago`
      : overdueHours > 0
      ? `${overdueHours}h ${overdueMins % 60}m ago`
      : `${Math.max(1, overdueMins)}m ago`;

    return (
      <span className="goal-time-badge overdue" title={`Target deadline was ${targetDateStr} IST`}>
        <Clock size={11} /> Overdue by {timeOverStr} (Target: {targetDateStr})
      </span>
    );
  }

  const remainingSecs = Math.floor(diffMs / 1000);
  const remainingMins = Math.floor(remainingSecs / 60);
  const remainingHours = Math.floor(remainingMins / 60);
  const remainingDays = Math.floor(remainingHours / 24);

  let formatted = "";
  if (remainingDays > 0) {
    formatted = `${remainingDays}d ${remainingHours % 24}h ${remainingMins % 60}m left`;
  } else if (remainingHours > 0) {
    formatted = `${remainingHours}h ${remainingMins % 60}m ${remainingSecs % 60}s left`;
  } else {
    formatted = `${Math.max(0, remainingMins)}m ${remainingSecs % 60}s left`;
  }

  return (
    <span className="goal-time-badge active" title={`Target deadline: ${targetDateStr} IST`}>
      <Clock size={11} /> {formatted} • Due {targetDateStr}
    </span>
  );
}

/* =========================================================
   BRAND
========================================================= */

function Brand() {
  return (
    <div className="landing-brand">
      <div className="brand-symbol">E</div>

      <div>
        <span>Evolve</span>
        <small>Personal Growth</small>
      </div>
    </div>
  );
}

/* =========================================================
   TYPING HERO
========================================================= */

function TypingHeroText() {
  const firstText = "Become better.";
  const secondText = "Every day.";

  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  useEffect(() => {
    let timer;

    if (first.length < firstText.length) {
      timer = setTimeout(() => {
        setFirst(
          firstText.slice(0, first.length + 1)
        );
      }, 85);
    } else if (second.length < secondText.length) {
      timer = setTimeout(() => {
        setSecond(
          secondText.slice(0, second.length + 1)
        );
      }, 85);
    }

    return () => clearTimeout(timer);
  }, [first, second]);

  return (
    <h1 className="hero-typing">
      <span className="hero-line-one">
        {first}
      </span>

      <span className="hero-line-two">
        {second}

        <motion.i
          className="typing-cursor"
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          
        </motion.i>
      </span>
    </h1>
  );
}

/* =========================================================
   LANDING PAGE
========================================================= */

/* =========================================================
   LANDING PAGE — TWO SCREEN SYSTEM (HERO & FOOTER)
========================================================= */

function LandingPage({
  theme,
  toggleTheme,
  onEnter,
}) {
  const containerRef = useRef(null);
  const footerScreenRef = useRef(null);

  const scrollToFooter = () => {
    footerScreenRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      ref={containerRef}
      className="landing-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
      }}
    >
      {/* SCREEN 1: FULL VIEWPORT HERO PAGE */}
      <section className="landing-screen landing-hero-screen" id="hero-screen">
        <div className="landing-gradient" />

        <header className="landing-top">
          <Brand />

          <div className="landing-top-actions">
            <IndianTimeClock />

            <SpecularButton
              size="sm"
              radius={18}
              type="button"
              className="landing-nav-link"
              onClick={scrollToFooter}
              data-magnetic
              autoAnimate={true}
              followMouse={true}
            >
              <span>Explore Evolve</span>
            </SpecularButton>

            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </header>

        <main className="landing-content">
          <motion.div
            className="landing-eyebrow"
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.5,
            }}
          >
            PERSONAL GROWTH SYSTEM
          </motion.div>

          {/* MAIN TYPING TEXT */}
          <TypingHeroText />

          <motion.p
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.8,
              duration: 0.6,
            }}
          >
            Improve your real life, measure your progress,
            <br />
            and turn personal growth into momentum.
          </motion.p>

          <SpecularButton
            size="lg"
            radius={20}
            className="enter-button primary"
            data-magnetic
            onClick={onEnter}
            autoAnimate={true}
            followMouse={true}
            speed={0.35}
            intensity={1.0}
            thickness={1}
            lineColor={theme === "dark" ? "#818cf8" : "#f97316"}
            baseColor={theme === "dark" ? "#312e81" : "#7c2d12"}
          >
            <span>Enter Evolve</span>
            <ArrowRight size={15} />
          </SpecularButton>
        </main>

        <div className="landing-bottom-bar">
          <SpecularButton
            size="sm"
            radius={20}
            type="button"
            className="landing-scroll-hint"
            onClick={scrollToFooter}
            aria-label="Scroll to footer section"
            data-magnetic
            autoAnimate={true}
            followMouse={true}
          >
            <span>Scroll for Overview & Ecosystem</span>
            <span className="scroll-icon-wrap">
              <ChevronDown size={15} />
            </span>
          </SpecularButton>
        </div>
      </section>

      {/* SCREEN 2: DEDICATED FULL VIEWPORT FOOTER PAGE */}
      <section
        ref={footerScreenRef}
        className="landing-screen landing-footer-screen"
        id="footer-screen"
      >
        <div className="landing-footer-container">
          <div className="footer-top-nav">
            <div className="footer-page-badge">
              <Sparkles size={14} />
              <span>Evolve Ecosystem & Architecture</span>
            </div>

            <SpecularButton
              size="sm"
              radius={18}
              type="button"
              className="back-to-top-btn"
              onClick={scrollToTop}
              data-magnetic
              autoAnimate={true}
              followMouse={true}
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </SpecularButton>
          </div>

          <div className="landing-footer-inner">
            <div className="footer-brand-column">
              <Brand />
              <p>
                A personal growth system built to help you
                track progress, build consistency, and keep
                evolving every day.
              </p>
            </div>

            <div className="footer-links-column">
              <span className="footer-heading">Product</span>
              <button type="button" onClick={onEnter}>Overview</button>
              <button type="button" onClick={onEnter}>Goals</button>
              <button type="button" onClick={onEnter}>Progress</button>
              <button type="button" onClick={onEnter}>Achievements</button>
            </div>

            <div className="footer-links-column">
              <span className="footer-heading">Growth</span>
              <button type="button" onClick={onEnter}>Health</button>
              <button type="button" onClick={onEnter}>Strength</button>
              <button type="button" onClick={onEnter}>Focus</button>
              <button type="button" onClick={onEnter}>Weekly Challenge</button>
            </div>

            <div className="footer-links-column">
              <span className="footer-heading">Company</span>
              <button type="button">About Evolve</button>
              <button type="button">Contact</button>
              <button type="button">Privacy</button>
              <button type="button">Terms</button>
            </div>

            <div className="footer-newsletter">
              <span className="footer-heading">Stay in the loop</span>
              <p>Get occasional updates on your growth journey.</p>

              <form
                className="footer-subscribe"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Your email address"
                />
                <SpecularButton
                  size="sm"
                  radius={12}
                  type="submit"
                  aria-label="Subscribe"
                  data-magnetic
                  autoAnimate={true}
                  followMouse={true}
                  style={{ minWidth: "44px", padding: "10px" }}
                >
                  <ArrowRight size={14} />
                </SpecularButton>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Evolve. All rights reserved.</span>

            <div className="footer-bottom-links">
              <span>Track</span>
              <span>Improve</span>
              <span>Progress</span>
              <span>Evolve</span>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* =========================================================
   AUTH PAGE
========================================================= */

function AuthPage({
  theme,
  toggleTheme,
  onLogin,
  onBack,
}) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState(() => ({
    name: "",
    email: localStorage.getItem("evolve-last-email") || "",
    password: "",
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    playAudio("whoosh");
    setShowPassword(false);
    setMode(nextMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    playAudio("click");
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
      const payload = mode === "login" ? { email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (!response.ok) throw new Error(data.detail || "Something went wrong. Please try again.");
      if (mode === "signup") {
        // Signup only creates the account. Do NOT auto-login.
        playAudio("signup");
        localStorage.setItem("evolve-last-email", form.email);
        setForm({ name: "", email: form.email, password: "" });
        setMode("login");
        setShowPassword(false);
        setError("Account created successfully. Please login to continue.");
        return;
      }
      playAudio("login");
      localStorage.setItem("evolve-last-email", form.email);
      localStorage.setItem("evolve-token", data.access_token);
      localStorage.setItem("evolve-user", JSON.stringify(data.user || {}));
      onLogin(data.user || {});
    } catch (err) {
      setError(err.message || "Unable to connect to Evolve.");
    } finally { setLoading(false); }
  };

  return (
    <motion.section
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.45,
      }}
    >
      <div className="auth-background">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </div>

      <header className="auth-top">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <motion.button
            type="button"
            onClick={onBack}
            aria-label="Back to landing page"
            title="Back to landing page"
            whileHover={{
              x: -2,
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.92,
            }}
            style={{
              width: "34px",
              height: "34px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              padding: 0,
              boxShadow: "var(--shadow)",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
          </motion.button>

          <Brand />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IndianTimeClock />
          <ThemeToggle
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </div>
      </header>

      <motion.div
        className="auth-dual-card-wrap"
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        <div className={`auth-dual-card ${mode === "signup" ? "signup-active" : "login-active"}`}>
          {/* Left Panel: Login Form */}
          <div className="auth-panel auth-panel-login">
            <div className="auth-panel-content">
              <h2 className="auth-form-title">Login</h2>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-input-line">
                  <input
                    type="email"
                    placeholder="Username / Email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    autoComplete="username email"
                  />
                  <User className="auth-icon" size={17} />
                </div>

                <div className="auth-input-line">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-icon-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Lock size={17} />}
                  </button>
                </div>

                {error && (
                  <p className="auth-error-msg" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-pill-btn"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="auth-switch-text">
                  <span>Don't have an account?</span>{" "}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => switchMode("signup")}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel: Register Form */}
          <div className="auth-panel auth-panel-register">
            <div className="auth-panel-content">
              <h2 className="auth-form-title">Register</h2>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-input-line">
                  <input
                    type="text"
                    placeholder="Username"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    autoComplete="name"
                  />
                  <User className="auth-icon" size={17} />
                </div>

                <div className="auth-input-line">
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <Mail className="auth-icon" size={17} />
                </div>

                <div className="auth-input-line">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-icon-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Lock size={17} />}
                  </button>
                </div>

                {error && (
                  <p className="auth-error-msg" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-pill-btn"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>

                <div className="auth-switch-text">
                  <span>Already have an account?</span>{" "}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => switchMode("login")}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Diagonal Sliding Radiant Overlay */}
          <div className="auth-sliding-overlay" aria-hidden="true">
            {/* Welcome Back: visible when in Login Mode (positioned on right side) */}
            <div className="overlay-banner overlay-welcome-back">
              <h3 className="overlay-heading">WELCOME BACK!</h3>
              <p className="overlay-subtext">
                We are happy to have you with us again! If you need anything we are here to help.
              </p>
            </div>

            {/* Welcome: visible when in Register Mode (positioned on left side) */}
            <div className="overlay-banner overlay-welcome-new">
              <h3 className="overlay-heading">WELCOME!</h3>
              <p className="overlay-subtext">
                We're delighted to have you here. If you need any assistance, feel free to reach out.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.section>
  );
}

/* =========================================================
   STATS
========================================================= */

const statDefinitions = [
  { name: "Health", key: "health", icon: HeartPulse },
  { name: "Strength", key: "strength", icon: Shield },
  { name: "Focus", key: "focus", icon: Brain },
  { name: "Discipline", key: "discipline", icon: Zap },
  { name: "Knowledge", key: "knowledge", icon: Brain },
];

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    name: "Overview",
    icon: BarChart3,
  },
  {
    name: "Goals",
    icon: Target,
  },
  {
    name: "Health",
    icon: HeartPulse,
  },
  {
    name: "Strength",
    icon: Shield,
  },
  {
    name: "Focus",
    icon: Brain,
  },
  {
    name: "Progress",
    icon: BarChart3,
  },
  {
    name: "Achievements",
    icon: Trophy,
  },
  {
    name: "Weekly Challenge",
    icon: Flame,
  },
];

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  theme,
  toggleTheme,
  profilePhoto,
  setProfilePhoto,
  user,
  onLogout,
}) {
  const [activePage, setActivePage] =
    useState("Overview");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [goals, setGoals] = useState([]);
  const [dashboardUser, setDashboardUser] = useState(user || {});
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [workspaceModal, setWorkspaceModal] = useState(null);
  const [goalForm, setGoalForm] = useState({ title: "", description: "", category: "discipline", xp_reward: "10", target_duration: "60", custom_duration: "" });
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    const loadTasksAndUser = async () => {
      const token = localStorage.getItem("evolve-token");
      if (!token) return;
      try {
        const [tasksRes, userRes] = await Promise.all([
          fetch(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          const list = Array.isArray(data) ? data : (data.tasks || []);
          setGoals(
            list.map((task) => ({
              id: task.id || task._id,
              title: task.title,
              category: task.category,
              xp: task.xp_reward,
              completed: task.completed,
              target_time: task.target_time,
              duration_mins: task.duration_mins,
              created_at: task.created_at,
            }))
          );
        }

        if (userRes && userRes.ok) {
          const userData = await userRes.json();
          if (userData.user) {
            setDashboardUser(userData.user);
            try {
              localStorage.setItem("evolve-user", JSON.stringify(userData.user));
            } catch (e) {
              console.warn("Could not save evolve-user to localStorage:", e);
            }
            if (userData.user.profile_photo) {
              setProfilePhoto(userData.user.profile_photo);
              try {
                localStorage.setItem("evolve-profile-photo", userData.user.profile_photo);
              } catch (e) {
                console.warn("Could not save profile-photo to localStorage:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Load tasks and user error:", error);
      }
    };
    loadTasksAndUser();
  }, [user, setProfilePhoto]);

  useEffect(() => {
    setDashboardUser(user || {});
    if (user?.profile_photo) {
      setProfilePhoto(user.profile_photo);
    }
  }, [user, setProfilePhoto]);

  const toggleGoal = async (id) => {
    const goal = goals.find((item) => item.id === id);
    if (!goal || goal.completed) return;
    playAudio("complete");
    const token = localStorage.getItem("evolve-token");

    if (token) {
      try {
        const response = await fetch(`${API_URL}/tasks/${id}/complete`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = {};
        try { data = await response.json(); } catch { data = {}; }
        if (!response.ok) throw new Error(data.detail || "Unable to complete task");
        setGoals((current) => current.map((item) => item.id === id ? { ...item, completed: true } : item));
        const updatedUser = {
          ...dashboardUser,
          xp: data.total_xp,
          level: data.level,
          coins: data.total_coins,
          streak: data.streak,
          attributes: { ...(dashboardUser.attributes || {}), [data.attribute]: data.attribute_value }
        };
        setDashboardUser(updatedUser);
        try {
          localStorage.setItem("evolve-user", JSON.stringify(updatedUser));
        } catch (e) {
          console.warn("Could not save evolve-user to localStorage:", e);
        }
      } catch (error) {
        console.error("Complete task error:", error);
      }
    } else {
      // Guest / Offline fallback
      const xpGained = Number(goal.xp) || 10;
      const newXp = (dashboardUser.xp || 0) + xpGained;
      let newLevel = 1;
      while (newXp >= 100 * (newLevel ** 2)) {
        newLevel += 1;
      }
      const attrKey = {
        health: "health",
        gym: "strength",
        fitness: "strength",
        coding: "knowledge",
        study: "knowledge",
        learning: "knowledge",
        focus: "focus",
        discipline: "discipline",
      }[goal.category?.toLowerCase()] || "discipline";

      const currentAttrs = dashboardUser.attributes || {
        health: 0,
        strength: 0,
        focus: 0,
        discipline: 0,
        knowledge: 0,
      };
      const updatedAttrs = {
        ...currentAttrs,
        [attrKey]: (currentAttrs[attrKey] || 0) + 1,
      };

      const updatedUser = {
        ...dashboardUser,
        xp: newXp,
        level: newLevel,
        coins: (dashboardUser.coins || 0) + 10,
        streak: Math.max(1, (dashboardUser.streak || 0) + 1),
        attributes: updatedAttrs,
      };

      setGoals((current) => current.map((item) => item.id === id ? { ...item, completed: true } : item));
      setDashboardUser(updatedUser);
      try {
        localStorage.setItem("evolve-user", JSON.stringify(updatedUser));
      } catch (e) {
        console.warn("Could not save evolve-user to localStorage:", e);
      }
    }
  };

  const deleteGoal = async (id) => {
    playAudio("click");
    setGoals((current) => current.filter((item) => item.id !== id));
    const token = localStorage.getItem("evolve-token");
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let data = {};
        try { data = await response.json(); } catch { data = {}; }
        throw new Error(data.detail || "Unable to delete task");
      }
    } catch (error) {
      console.error("Delete task error:", error);
    }
  };

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    playAudio("pop");

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedImageUrl = canvas.toDataURL("image/jpeg", 0.88);
        setProfilePhoto(optimizedImageUrl);

        try {
          localStorage.setItem("evolve-profile-photo", optimizedImageUrl);
        } catch (e) {
          console.warn("LocalStorage save error:", e);
        }

        const token = localStorage.getItem("evolve-token");
        if (token) {
          fetch(`${API_URL}/auth/profile-photo`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profile_photo: optimizedImageUrl }),
          }).catch((err) => console.warn("Backend photo sync failed:", err));
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const openAddGoal = () => {
    playAudio("pop");
    setGoalForm({ title: "", description: "", category: "discipline", xp_reward: "10", target_duration: "60", custom_duration: "" });
    setShowAddGoal(true);
  };

  const addGoal = async (event) => {
    event?.preventDefault();
    const title = goalForm.title.trim();
    if (!title) return;

    const token = localStorage.getItem("evolve-token");
    const targetMins = goalForm.target_duration === "custom"
      ? Math.max(1, Number(goalForm.custom_duration) || 30)
      : Math.max(1, Number(goalForm.target_duration) || 60);
    const nowTimestamp = Date.now();
    const targetTime = nowTimestamp + targetMins * 60 * 1000;

    setSavingGoal(true);

    try {
      if (token) {
        const response = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description: goalForm.description.trim(),
            category: goalForm.category,
            xp_reward: Number(goalForm.xp_reward) || 10,
            target_time: targetTime,
            duration_mins: targetMins,
            created_at: nowTimestamp,
          }),
        });
        let data = {};
        try { data = await response.json(); } catch { data = {}; }
        if (!response.ok) throw new Error(data.detail || "Unable to create goal");
        const createdId = data.task?.id || data.task_id || `task-${Date.now()}`;
        setGoals((current) => [
          ...current,
          {
            id: createdId,
            title,
            category: goalForm.category,
            xp: Number(goalForm.xp_reward) || 10,
            completed: false,
            target_time: targetTime,
            duration_mins: targetMins,
            created_at: nowTimestamp,
          },
        ]);
      } else {
        // Fallback for guest
        setGoals((current) => [
          ...current,
          {
            id: `task-${Date.now()}`,
            title,
            category: goalForm.category,
            xp: Number(goalForm.xp_reward) || 10,
            completed: false,
            target_time: targetTime,
            duration_mins: targetMins,
            created_at: nowTimestamp,
          },
        ]);
      }
      playAudio("pop");
      setGoalForm({ title: "", description: "", category: "discipline", xp_reward: "10", target_duration: "60", custom_duration: "" });
      setShowAddGoal(false);
    } catch (error) {
      console.error("Add goal error:", error);
      alert(error.message || "Failed to add goal");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleNavigation = (name) => {
    playAudio("click");
    const modalPages = new Set([
      "Health",
      "Strength",
      "Focus",
      "Weekly Challenge",
      "Settings",
    ]);

    setSidebarOpen(false);
    setProfileMenuOpen(false);

    if (modalPages.has(name)) {
      setActivePage(name);
      setWorkspaceModal(name);
      return;
    }

    setWorkspaceModal(null);
    setActivePage(name);
  };

  const closeWorkspaceModal = () => {
    playAudio("click");
    setWorkspaceModal(null);
    setActivePage("Overview");
  };

  return (
    <motion.div
      className="dashboard-shell"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.45,
      }}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >
        <div className="sidebar-header">
          <Brand />

          <button
            className="sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="sidebar-user"
            onClick={() => setProfileMenuOpen((current) => !current)}
            aria-expanded={profileMenuOpen}
            aria-label="Open user menu"
          >
            <div className="profile-photo">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                <User size={17} strokeWidth={1.8} />
              )}
            </div>

            <div>
              <strong>{dashboardUser.name || "Your Profile"}</strong>
              <span>
                Level {dashboardUser.level || 1} · {(dashboardUser.xp || 0).toLocaleString()} XP
              </span>
            </div>
            <ChevronRight size={14} style={{ marginLeft: "auto", transform: profileMenuOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
          </button>

          {profileMenuOpen && (
            <motion.div
              className="profile-menu"
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                zIndex: 30,
                padding: 8,
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "var(--surface)",
                boxShadow: "0 14px 35px rgba(0,0,0,.12)"
              }}
            >
              <button className="nav-item" onClick={() => { setShowProfileModal(true); setProfileMenuOpen(false); }}>
                <User size={15} />
                <span>Profile</span>
              </button>
              <button className="nav-item" onClick={() => { onLogout(); setProfileMenuOpen(false); }}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </div>

        <div className="nav-title">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleNavigation(
                    item.name
                  )
                }
              >
                <Icon
                  size={15}
                  strokeWidth={1.7}
                />

                <span>{item.name}</span>

                {activePage === item.name && (
                  <i />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => handleNavigation("Settings")}
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumb">
            <button
              className="mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={17} />
            </button>

            <span>Evolve</span>

            <ChevronRight size={12} />

            <strong>
              {activePage}
            </strong>
          </div>

          <div className="dashboard-actions">
            <IndianTimeClock />

            <div className="streak">
              <Flame size={13} />

              <span>
                {dashboardUser.streak || 0} day streak
              </span>
            </div>

            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activePage === "Overview" ? (
            <motion.div
              key="overview"
              className="dashboard-content"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              <section className="dashboard-hero">
                <div>
                  <div className="date-label">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
                  </div>

                  <h1>
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 5 && hour < 12) return "Good morning,";
                      if (hour >= 12 && hour < 17) return "Good afternoon,";
                      if (hour >= 17 && hour < 21) return "Good evening,";
                      return "Good night,";
                    })()}
                    <span>
                      {dashboardUser.name ? `${dashboardUser.name}.` : "let's keep evolving."}
                    </span>
                  </h1>

                  <p>
                    Improve your real life, measure
                    your progress, and turn personal
                    growth into momentum.
                  </p>
                </div>

                <LevelCard user={dashboardUser} />
              </section>

              <section className="stats-section">
                <div className="section-title">
                  <div>
                    <span>
                      YOUR FOUNDATION
                    </span>

                    <h2>
                      Core stats
                    </h2>
                  </div>

                  <button type="button" onClick={() => handleNavigation("Progress")}>
                    View progress
                    <ArrowUpRight size={11} />
                  </button>
                </div>

                <div className="stats-grid">
                  {statDefinitions.map((stat) => (
                    <StatCard
                      key={stat.name}
                      name={stat.name}
                      value={dashboardUser.attributes?.[stat.key] || 0}
                      change="+1"
                      icon={stat.icon}
                    />
                  ))}
                </div>
              </section>

              <section className="lower-grid">
                <div className="dashboard-panel">
                  <div className="panel-heading">
                    <div>
                      <span>
                        TODAY
                      </span>

                      <h2>
                        Today's goals
                      </h2>
                    </div>

                    <button className="small-icon" onClick={openAddGoal} aria-label="Add a new goal">
                      <Plus size={15} />
                    </button>
                  </div>

                  <div className="goal-summary">
                    <strong>
                      {completedGoals}/
                      {goals.length}
                    </strong>

                    <span>
                      completed
                    </span>

                    <div>
                      <i
                        style={{
                          width: `${
                            goals.length
                              ? (completedGoals /
                                  goals.length) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="goal-list">
                    {goals.map((goal) => (
                      <div key={goal.id} className="goal-item-row">
                        <button
                          key={goal.id}
                          className={`goal ${
                            goal.completed
                              ? "completed"
                              : ""
                          }`}
                          onClick={() =>
                            toggleGoal(
                              goal.id
                            )
                          }
                          data-magnetic
                        >
                          <span className="goal-check">
                            {goal.completed && (
                              <Check
                                size={11}
                              />
                            )}
                          </span>

                          <div className="goal-text">
                            <strong>
                              {goal.title}
                            </strong>

                            <div className="goal-meta-row">
                              <span className="goal-category-label">
                                {goal.category}
                              </span>
                              <GoalCountdown
                                targetTime={goal.target_time}
                                createdAt={goal.created_at}
                                completed={goal.completed}
                              />
                            </div>
                          </div>

                          <small>
                            +{goal.xp} XP
                          </small>
                        </button>

                        <button
                          type="button"
                          className="goal-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGoal(goal.id);
                          }}
                          aria-label={`Delete ${goal.title}`}
                          title="Delete goal"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <SpecularButton
                    size="sm"
                    radius={14}
                    className="add-goal"
                    onClick={openAddGoal}
                    autoAnimate={true}
                    followMouse={true}
                  >
                    <Plus size={12} />
                    <span>Add a new goal</span>
                  </SpecularButton>
                </div>

                <WeeklyChallenge goals={goals} onViewChallenge={() => handleNavigation("Weekly Challenge")} />
              </section>

              <div className="momentum-card">
                <div className="momentum-icon">
                  <Sparkles size={15} />
                </div>

                <div>
                  <span>
                    YOUR MOMENTUM
                  </span>

                  <strong>
                    {goals.length === 0
                      ? "Ready to build momentum?"
                      : Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) === 100
                      ? "Peak Momentum Reached! 🔥"
                      : Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) > 0
                      ? "You're building strong momentum."
                      : "Start your daily momentum."}
                  </strong>

                  <p>
                    {goals.length === 0
                      ? "Create your first goal and complete it to track your momentum progress."
                      : `${goals.filter((g) => g.completed).length} of ${goals.length} tasks completed today. Consistency compounds every day.`}
                  </p>
                </div>

                <strong className="momentum-number">
                  {goals.length > 0 && Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) > 0
                    ? `+${Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)}%`
                    : `${goals.length > 0 ? Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) : 0}%`}
                  <small>
                    {goals.filter((g) => g.completed).length}/{goals.length} tasks done
                  </small>
                </strong>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activePage}
              className="dashboard-content"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              <WorkspacePage
                title={activePage}
                goals={goals}
                dashboardUser={dashboardUser}
                onNavigate={handleNavigation}
                onAddGoal={openAddGoal}
                profilePhoto={profilePhoto}
                handlePhotoUpload={handlePhotoUpload}
                theme={theme}
                toggleTheme={toggleTheme}
                onLogout={onLogout}
                onUpdateUser={(updated) => {
                  setDashboardUser(updated);
                  try {
                    localStorage.setItem("evolve-user", JSON.stringify(updated));
                  } catch (e) {}
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            className="profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              className="profile-modal"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-modal-title"
            >
              <div className="profile-modal-head">
                <div>
                  <span>ACCOUNT</span>
                  <h2 id="profile-modal-title">Your profile</h2>
                </div>
                <button type="button" className="profile-modal-close" onClick={() => setShowProfileModal(false)} aria-label="Close profile">
                  <X size={19} />
                </button>
              </div>

              <label className="profile-modal-photo-wrap" title="Change profile photo">
                <div className="profile-modal-photo">
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" /> : <User size={34} strokeWidth={1.6} />}
                </div>
                <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                <span>Change photo</span>
              </label>

              <div className="profile-modal-info">
                <h3>{dashboardUser.name || "Your Profile"}</h3>
                <p>{dashboardUser.email || "No email available"}</p>
              </div>

              <div className="profile-modal-stats">
                <div><strong>{dashboardUser.level || 1}</strong><span>Level</span></div>
                <div><strong>{(dashboardUser.xp || 0).toLocaleString()}</strong><span>XP</span></div>
                <div><strong>{dashboardUser.coins || 0}</strong><span>Coins</span></div>
                <div><strong>{dashboardUser.streak || 0}</strong><span>Streak</span></div>
              </div>

              <button type="button" className="profile-modal-logout" onClick={onLogout}>
                <LogOut size={15} />
                Logout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {workspaceModal && (
          <WorkspaceModal
            title={workspaceModal}
            goals={goals}
            dashboardUser={dashboardUser}
            profilePhoto={profilePhoto}
            handlePhotoUpload={handlePhotoUpload}
            theme={theme}
            toggleTheme={toggleTheme}
            onLogout={onLogout}
            onClose={closeWorkspaceModal}
            onAddGoal={openAddGoal}
            onNavigate={handleNavigation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddGoal(false)}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20 }}
          >
            <motion.form
              onSubmit={addGoal}
              initial={{ opacity: 0, y: 18, scale: .97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: .98 }}
              onClick={(e) => e.stopPropagation()}
              className="goal-modal"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 11, letterSpacing: ".12em", opacity: .6 }}>PERSONAL GROWTH</span>
                  <h2 style={{ margin: "6px 0 0" }}>Add a new goal</h2>
                </div>
                <button type="button" className="goal-modal-close" onClick={() => setShowAddGoal(false)} aria-label="Close add goal" title="Close">
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 12, marginBottom: 7 }}>Goal title</span>
                <input autoFocus required value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="e.g. Study React for 30 minutes" className="goal-modal-input" />
              </label>
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 12, marginBottom: 7 }}>Description</span>
                <textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="What will you accomplish?" rows="3" className="goal-modal-input goal-modal-textarea" />
              </label>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Category Wheel (Drag or Scroll)</span>
                  <span style={{ fontSize: 11, color: "var(--accent)", textTransform: "capitalize", fontWeight: 700 }}>{goalForm.category}</span>
                </div>
                <div className="option-wheel-card">
                  <OptionWheel
                    items={[
                      "Health & Vitality",
                      "Strength & Gym",
                      "Focus & Deep Work",
                      "Coding & Tech",
                      "Study & Knowledge",
                      "Discipline & Habits"
                    ]}
                    defaultSelected={
                      ["health", "gym", "focus", "coding", "study", "discipline"].indexOf(goalForm.category) !== -1
                        ? ["health", "gym", "focus", "coding", "study", "discipline"].indexOf(goalForm.category)
                        : 5
                    }
                    fontSize={1.15}
                    spacing={1.6}
                    inset={20}
                    onChange={(idx) => {
                      const cats = ["health", "gym", "focus", "coding", "study", "discipline"];
                      setGoalForm(prev => ({ ...prev, category: cats[idx] || "discipline" }));
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: goalForm.target_duration === "custom" ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
                <label>
                  <span style={{ display: "block", fontSize: 12, marginBottom: 7 }}>Quick Category</span>
                  <select value={goalForm.category} onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })} className="goal-modal-input goal-modal-select">
                    <option value="health">Health</option><option value="gym">Strength</option><option value="focus">Focus</option><option value="coding">Coding</option><option value="study">Study</option><option value="discipline">Discipline</option>
                  </select>
                </label>
                <label>
                  <span style={{ display: "block", fontSize: 12, marginBottom: 7 }}>XP reward</span>
                  <select value={goalForm.xp_reward} onChange={(e) => setGoalForm({ ...goalForm, xp_reward: e.target.value })} className="goal-modal-input goal-modal-select">
                    <option value="10">10 XP</option><option value="25">25 XP</option><option value="50">50 XP</option><option value="100">100 XP</option>
                  </select>
                </label>
                <label>
                  <span style={{ display: "block", fontSize: 12, marginBottom: 7 }}>Time Limit</span>
                  <select value={goalForm.target_duration || "60"} onChange={(e) => setGoalForm({ ...goalForm, target_duration: e.target.value })} className="goal-modal-input goal-modal-select">
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="90">1.5 Hours</option>
                    <option value="120">2 Hours</option>
                    <option value="180">3 Hours</option>
                    <option value="240">4 Hours</option>
                    <option value="480">8 Hours</option>
                    <option value="1440">24 Hours (1 Day)</option>
                    <option value="custom">Custom Minutes</option>
                  </select>
                </label>
                {goalForm.target_duration === "custom" && (
                  <label>
                    <span style={{ display: "block", fontSize: 12, marginBottom: 7 }}>Custom Mins</span>
                    <input
                      type="number"
                      min="1"
                      max="10080"
                      placeholder="e.g. 25"
                      value={goalForm.custom_duration || ""}
                      onChange={(e) => setGoalForm({ ...goalForm, custom_duration: e.target.value })}
                      className="goal-modal-input"
                      required
                    />
                  </label>
                )}
              </div>

              {/* Live Target Completion Time Preview */}
              {(() => {
                const previewMins = goalForm.target_duration === "custom"
                  ? Math.max(1, Number(goalForm.custom_duration) || 30)
                  : Math.max(1, Number(goalForm.target_duration) || 60);
                const previewTargetDate = new Date(Date.now() + previewMins * 60 * 1000);
                const previewTimeStr = previewTargetDate.toLocaleTimeString("en-US", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.22)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent)" }}>
                      <Clock size={14} />
                      <strong>Estimated Completion:</strong>
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>
                      {previewTimeStr} IST ({previewMins >= 60 ? `${(previewMins / 60).toFixed(previewMins % 60 === 0 ? 0 : 1)}h` : `${previewMins}m`})
                    </span>
                  </div>
                );
              })()}
              <SpecularButton
                size="md"
                radius={16}
                type="submit"
                disabled={savingGoal}
                className="goal-modal-submit"
                autoAnimate={true}
                followMouse={true}
                style={{ width: "100%", marginTop: "10px" }}
              >
                <span>{savingGoal ? "Adding goal…" : "Add Goal"}</span>
              </SpecularButton>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive macOS-Style Spring Dock */}
      <Dock
        items={[
          {
            icon: <Target size={20} />,
            label: "Overview",
            onClick: () => handleNavigation("Overview"),
            className: activePage === "Overview" ? "active" : ""
          },
          {
            icon: <Check size={20} />,
            label: "Goals",
            onClick: () => handleNavigation("Goals"),
            className: activePage === "Goals" ? "active" : ""
          },
          {
            icon: <BarChart3 size={20} />,
            label: "Progress",
            onClick: () => handleNavigation("Progress"),
            className: activePage === "Progress" ? "active" : ""
          },
          {
            icon: <Trophy size={20} />,
            label: "Achievements",
            onClick: () => handleNavigation("Achievements"),
            className: activePage === "Achievements" ? "active" : ""
          },
          {
            icon: <Plus size={20} />,
            label: "New Goal",
            onClick: openAddGoal,
            className: "dock-add-btn"
          },
          {
            icon: theme === "dark" ? <Sun size={20} /> : <Moon size={20} />,
            label: theme === "dark" ? "Light Mode" : "Dark Mode",
            onClick: toggleTheme
          },
          {
            icon: <LogOut size={19} />,
            label: "Logout",
            onClick: onLogout
          }
        ]}
      />
    </motion.div>
  );
}

/* =========================================================
   LEVEL CARD
========================================================= */

function LevelCard({ user }) {
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const currentLevelXp = level <= 1 ? 0 : 100 * ((level - 1) ** 2);
  const nextLevelXp = 100 * (level ** 2);
  const progress = Math.min(100, Math.max(0, ((xp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100));
  return (
    <div className="level-card">
      <span>CURRENT LEVEL</span>
      <strong>{level}</strong>
      <div className="xp-label">
        <span>{xp.toLocaleString()} XP</span>
        <span>{nextLevelXp.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar"><div style={{ width: `${progress}%` }} /></div>
      <small>{Math.max(0, nextLevelXp - xp)} XP until Level {level + 1}</small>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  name,
  value,
  change,
  icon: Icon,
}) {
  return (
    <motion.div
      className="stat-card"
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <div className="stat-top">
        <div className="stat-icon">
          <Icon
            size={15}
            strokeWidth={1.8}
          />
        </div>

        <small>{change}</small>
      </div>

      <strong>
        {value}
        <em>/100</em>
      </strong>

      <span>{name}</span>

      <div className="stat-bar">
        <div
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   WEEKLY CHALLENGE
========================================================= */

function WeeklyChallenge({ goals = [], onViewChallenge }) {
  const completed = goals.filter((goal) => goal.completed);
  const tasksCompleted = completed.length;
  const xpEarned = completed.reduce((sum, goal) => sum + Number(goal.xp || 0), 0);
  const targetTasks = 7;
  const progress = Math.min(100, Math.round((tasksCompleted / targetTasks) * 100));

  return (
    <div className="dashboard-panel challenge">
      <div className="panel-heading">
        <div>
          <span>THIS WEEK</span>
          <h2>Weekly Challenge</h2>
        </div>
        <div className="challenge-icon"><Flame size={15} /></div>
      </div>

      <span className="challenge-status">CHALLENGE IN PROGRESS</span>
      <h3>Build your momentum</h3>
      <p>Complete your goals throughout the week and keep your progress moving forward.</p>

      <div className="challenge-numbers">
        <div>
          <strong>{tasksCompleted}</strong>
          <span>Tasks completed</span>
        </div>
        <div>
          <strong>{xpEarned}</strong>
          <span>XP earned</span>
        </div>
      </div>

      <div className="weekly-progress">
        <div>
          <span>Weekly progress</span>
          <strong>{progress}%</strong>
        </div>
        <div className="weekly-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      <SpecularButton
        size="sm"
        radius={14}
        type="button"
        className="challenge-button"
        onClick={onViewChallenge}
        autoAnimate={true}
        followMouse={true}
      >
        <span>View challenge</span>
        <ArrowUpRight size={12} />
      </SpecularButton>
    </div>
  );
}

/* =========================================================
   PLACEHOLDER
========================================================= */

function WorkspacePage({ title, goals, dashboardUser, onNavigate, onAddGoal, onUpdateUser }) {
  const [buyingId, setBuyingId] = useState(null);

  const REWARDS_CATALOG = [
    {
      id: "focus_beast",
      title: "Focus Beast Badge",
      category: "Badge",
      cost: 50,
      desc: "Unlocks the Focus Beast badge on your profile with a +5% mental concentration mastery aura.",
      icon: Brain,
    },
    {
      id: "iron_will",
      title: "Iron Will Shield",
      category: "Shield",
      cost: 100,
      desc: "Proof of unshakeable discipline and consistency across difficult quests and challenges.",
      icon: Shield,
    },
    {
      id: "cyber_aura",
      title: "Cyberpunk Neon Aura",
      category: "Aura",
      cost: 250,
      desc: "Infuses your avatar and dashboard with a radiant electric cyberpunk neon glow effect.",
      icon: Zap,
    },
    {
      id: "quantum_momentum",
      title: "Quantum Momentum Title",
      category: "Title",
      cost: 500,
      desc: "Grants the prestigious 'Quantum Evolver' title next to your name across your account.",
      icon: Sparkles,
    },
    {
      id: "titan_crown",
      title: "Titan Crown of Mastery",
      category: "Crown",
      cost: 1000,
      desc: "Royal golden crown badge showcasing supreme mastery of long-term daily habits.",
      icon: Trophy,
    },
    {
      id: "zen_master",
      title: "Zen Transcendence Perk",
      category: "Perk",
      cost: 1500,
      desc: "Ultimate transcendence status, unlocking ambient zero-gravity cosmic particle effects.",
      icon: Flame,
    },
  ];

  const handleBuyReward = async (item) => {
    const currentXp = Number(dashboardUser.xp || 0);
    const unlocked = Array.isArray(dashboardUser.unlocked_rewards) ? dashboardUser.unlocked_rewards : [];

    if (unlocked.includes(item.id)) return;
    if (currentXp < item.cost) {
      alert(`You need ${item.cost - currentXp} more XP to unlock ${item.title}! Complete more goals to gain XP.`);
      return;
    }

    setBuyingId(item.id);
    const token = localStorage.getItem("evolve-token");
    let updatedUser = { ...dashboardUser };

    try {
      if (token) {
        const res = await fetch(`${API_URL}/auth/buy-reward`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reward_id: item.id, cost: item.cost }),
        });
        if (res.ok) {
          const data = await res.json();
          updatedUser = {
            ...dashboardUser,
            xp: data.xp,
            level: data.level,
            unlocked_rewards: data.unlocked_rewards,
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.detail || "Could not unlock reward.");
          setBuyingId(null);
          return;
        }
      } else {
        // Offline / Guest mode fallback
        const newXp = currentXp - item.cost;
        const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
        const newUnlocked = [...unlocked, item.id];
        updatedUser = {
          ...dashboardUser,
          xp: newXp,
          level: newLevel,
          unlocked_rewards: newUnlocked,
        };
      }

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      playAudio("complete");
    } catch (err) {
      console.error("Reward purchase failed:", err);
    } finally {
      setBuyingId(null);
    }
  };

  if (title === "Goals") {
    return (
      <div className="placeholder-page" style={{ textAlign: "left", alignItems: "stretch" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div><span>EVOLVE WORKSPACE</span><h1>Goals</h1><p>Manage your real-world actions and earn progress.</p></div>
          <SpecularButton
            size="sm"
            radius={14}
            className="add-goal"
            onClick={onAddGoal}
            autoAnimate={true}
            followMouse={true}
          >
            <Plus size={12}/>
            <span>Add goal</span>
          </SpecularButton>
        </div>
        <div className="goal-list" style={{ marginTop: 20 }}>
          {goals.length ? goals.map((goal) => (
            <button key={goal.id} className={`goal ${goal.completed ? "completed" : ""}`} onClick={() => onNavigate("Overview")}>
              <span className="goal-check">{goal.completed && <Check size={11}/>}</span>
              <div className="goal-text">
                <strong>{goal.title}</strong>
                <div className="goal-meta-row">
                  <span className="goal-category-label">{goal.category}</span>
                  <GoalCountdown targetTime={goal.target_time} createdAt={goal.created_at} completed={goal.completed} />
                </div>
              </div>
              <small>+{goal.xp} XP</small>
            </button>
          )) : <p>No goals yet. Create your first one.</p>}
        </div>
      </div>
    );
  }

  if (title === "Progress") {
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.completed).length;
    const momentumPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const xpEarned = goals.filter((g) => g.completed).reduce((sum, g) => sum + Number(g.xp || 0), 0);

    return (
      <div className="placeholder-page" style={{ textAlign: "left", alignItems: "stretch", maxWidth: 880 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--accent)", fontWeight: 750 }}>YOUR JOURNEY & MOMENTUM</span>
            <h1 style={{ margin: "4px 0 8px", fontSize: 28 }}>Progress & Momentum</h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
              Real-time daily momentum and quest completion metrics.
            </p>
          </div>
          <div className="streak" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 16px", borderRadius: 999 }}>
            <Sparkles size={14} />
            <strong>{momentumPercent}% Daily Momentum</strong>
          </div>
        </div>

        <div className="dashboard-panel" style={{ padding: "24px", marginBottom: 20, borderRadius: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".1em" }}>
              Task Completion Rate
            </span>
            <strong style={{ fontSize: 28, color: "var(--accent)" }}>{momentumPercent}%</strong>
          </div>
          <div className="weekly-bar" style={{ height: 10, borderRadius: 999, background: "var(--surface-soft)", overflow: "hidden" }}>
            <div style={{ width: `${momentumPercent}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), #60a5fa)", borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>
            {totalGoals === 0
              ? "No goals created yet. Add goals to track your momentum."
              : `${completedGoals} of ${totalGoals} daily goals completed (${xpEarned} XP earned today).`}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <div className="stat-card" style={{ padding: "18px" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total XP</span>
            <strong style={{ fontSize: 24, margin: "8px 0 2px" }}>{(dashboardUser.xp || 0).toLocaleString()}</strong>
            <small style={{ color: "var(--accent)" }}>Earned across all quests</small>
          </div>
          <div className="stat-card" style={{ padding: "18px" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Current Level</span>
            <strong style={{ fontSize: 24, margin: "8px 0 2px" }}>Level {dashboardUser.level || 1}</strong>
            <small style={{ color: "var(--text-secondary)" }}>{(dashboardUser.level || 1) ** 2 * 100} XP for next level</small>
          </div>
          <div className="stat-card" style={{ padding: "18px" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Active Streak</span>
            <strong style={{ fontSize: 24, margin: "8px 0 2px" }}>{dashboardUser.streak || 0} Days</strong>
            <small style={{ color: "#10b981" }}>Consistent evolver</small>
          </div>
          <div className="stat-card" style={{ padding: "18px" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Quests Done</span>
            <strong style={{ fontSize: 24, margin: "8px 0 2px" }}>{completedGoals}/{totalGoals}</strong>
            <small style={{ color: "var(--text-secondary)" }}>{totalGoals - completedGoals} remaining today</small>
          </div>
        </div>
      </div>
    );
  }

  if (title === "Achievements") {
    const userXp = Number(dashboardUser.xp || 0);
    const unlockedList = Array.isArray(dashboardUser.unlocked_rewards) ? dashboardUser.unlocked_rewards : [];

    return (
      <div className="placeholder-page" style={{ textAlign: "left", alignItems: "stretch", maxWidth: 960 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--accent)", fontWeight: 750 }}>GAMIFIED REWARDS & XP SHOP</span>
            <h1 style={{ margin: "4px 0 8px", fontSize: 28 }}>XP Rewards Store</h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
              Spend your earned XP to buy badges, titles, auras and perks. Everything starts <strong>Locked 🔒</strong> until unlocked!
            </p>
          </div>
          <div className="rewards-header-stats">
            <div className="streak" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 16px", borderRadius: 999 }}>
              <Sparkles size={14} />
              <strong>{userXp.toLocaleString()} Available XP</strong>
            </div>
            <div className="challenge-status" style={{ fontSize: 11 }}>
              {unlockedList.length} / {REWARDS_CATALOG.length} UNLOCKED
            </div>
          </div>
        </div>

        <div className="reward-shop-grid">
          {REWARDS_CATALOG.map((item) => {
            const ItemIcon = item.icon;
            const isUnlocked = unlockedList.includes(item.id);
            const canAfford = userXp >= item.cost;
            const isBuying = buyingId === item.id;

            return (
              <div key={item.id} className={`reward-card ${isUnlocked ? "unlocked" : "locked"}`}>
                <div className="reward-card-top">
                  <div className="reward-icon-wrap">
                    <ItemIcon size={20} />
                  </div>
                  <div className="reward-details">
                    <div className="reward-body-head">
                      <strong>{item.title}</strong>
                      <span className="reward-category-tag">{item.category}</span>
                    </div>
                    <p>{item.desc}</p>
                  </div>
                </div>

                <div className="reward-footer">
                  <div className="reward-cost-badge">
                    <Zap size={14} />
                    <span>{item.cost} XP</span>
                  </div>

                  {isUnlocked ? (
                    <div className="reward-unlocked-pill">
                      <Check size={13} strokeWidth={2.5} />
                      <span>UNLOCKED</span>
                    </div>
                  ) : canAfford ? (
                    <SpecularButton
                      size="sm"
                      radius={12}
                      type="button"
                      className="reward-buy-btn"
                      autoAnimate={true}
                      followMouse={true}
                      disabled={isBuying}
                      onClick={() => handleBuyReward(item)}
                    >
                      <Sparkles size={12} />
                      <span>{isBuying ? "Unlocking..." : `Unlock (${item.cost} XP)`}</span>
                    </SpecularButton>
                  ) : (
                    <button type="button" className="reward-locked-btn" disabled>
                      <Lock size={12} />
                      <span>Locked (Need {item.cost - userXp} XP)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h3 style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: .7, margin: "28px 0 12px" }}>
          Progression Milestones & Perks
        </h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="challenge-status">FIRST QUEST COMPLETE</span>
          <span className="challenge-status">{(dashboardUser.streak || 0) >= 3 ? "3-DAY STREAK (ACTIVE)" : "3-DAY STREAK (LOCKED)"}</span>
          <span className="challenge-status">LEVEL {dashboardUser.level || 1} EVOLVER</span>
          {unlockedList.map((id) => {
            const reward = REWARDS_CATALOG.find((r) => r.id === id);
            return reward ? (
              <span key={id} className="challenge-status" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                ✓ {reward.title.toUpperCase()}
              </span>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  return <div className="placeholder-page"><div className="placeholder-icon"><Sparkles size={26}/></div><span>EVOLVE WORKSPACE</span><h1>{title}</h1><p>Your {title.toLowerCase()} workspace is ready.</p></div>;
}

function WorkspaceModal({ title, goals, dashboardUser, profilePhoto, handlePhotoUpload, theme, toggleTheme, onLogout, onClose, onAddGoal, onNavigate }) {
  const attrs = dashboardUser.attributes || {};
  const configs = {
    Health: { key: "health", icon: HeartPulse, text: "Health improves when you complete health-related goals." },
    Strength: { key: "strength", icon: Shield, text: "Strength improves when you complete gym and fitness goals." },
    Focus: { key: "focus", icon: Brain, text: "Focus improves when you complete focused, distraction-free work." },
  };
  const config = configs[title];
  const completed = goals.filter((g) => g.completed);
  const weeklyXp = completed.reduce((sum, g) => sum + Number(g.xp || 0), 0);
  const weeklyProgress = Math.min(100, Math.round((completed.length / 7) * 100));

  const heading = title === "Weekly Challenge" ? "Build your momentum" : title;
  const AttrIcon = config?.icon;

  return (
    <motion.div
      className="workspace-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="workspace-modal"
        initial={{ opacity: 0, y: 18, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: .98 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="workspace-modal-title"
      >
        <div className="workspace-modal-head">
          <div><span>{title === "Settings" ? "ACCOUNT" : title === "Weekly Challenge" ? "THIS WEEK" : "YOUR ATTRIBUTE"}</span><h2 id="workspace-modal-title">{heading}</h2></div>
          <button type="button" className="workspace-modal-close" onClick={onClose} aria-label="Close"><X size={19}/></button>
        </div>

        {config && (
          <>
            <div className="workspace-modal-icon"><AttrIcon size={28}/></div>
            <strong className="workspace-modal-number">{Number(attrs[config.key] || 0)}<small>/100</small></strong>
            <p className="workspace-modal-copy">{config.text}</p>
            <div className="workspace-modal-bar"><div style={{ width: `${Math.min(100, Number(attrs[config.key] || 0))}%` }}/></div>
            <div className="workspace-modal-actions">
              <button type="button" className="add-goal" onClick={onAddGoal}><Plus size={12}/> Add related goal</button>
              <button type="button" className="workspace-secondary" onClick={() => { onClose(); onNavigate("Goals"); }}>View goals <ArrowUpRight size={12}/></button>
            </div>
          </>
        )}

        {title === "Weekly Challenge" && (
          <>
            <div className="workspace-modal-icon"><Flame size={28}/></div>
            <p className="workspace-modal-copy">Complete 7 goals this week to build your momentum.</p>
            <div className="workspace-challenge-grid">
              <div><strong>{completed.length}</strong><span>Tasks completed</span></div>
              <div><strong>{weeklyXp}</strong><span>XP earned</span></div>
              <div><strong>{weeklyProgress}%</strong><span>Weekly progress</span></div>
            </div>
            <div className="workspace-modal-bar"><div style={{ width: `${weeklyProgress}%` }}/></div>
            <button type="button" className="add-goal" onClick={() => { onClose(); onNavigate("Goals"); }}>Go to goals <ArrowUpRight size={12}/></button>
          </>
        )}

        {title === "Settings" && (
          <div className="workspace-settings">
            <div className="settings-row"><div><strong>Appearance</strong><span>Choose your preferred theme.</span></div><button type="button" className="workspace-secondary" onClick={toggleTheme}>{theme === "light" ? <Moon size={13}/> : <Sun size={13}/>} {theme === "light" ? "Dark mode" : "Light mode"}</button></div>
            <div className="settings-row"><div><strong>Profile</strong><span>Update your profile photo from the user menu.</span></div><label className="workspace-secondary" style={{ cursor: "pointer" }}>Change photo<input type="file" accept="image/*" hidden onChange={handlePhotoUpload}/></label></div>
            <button type="button" className="profile-modal-logout" onClick={onLogout}><LogOut size={15}/> Logout</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem(
        "evolve-theme"
      ) || "light"
    );
  });

  const [page, setPage] = useState(() => localStorage.getItem("evolve-token") ? "dashboard" : "landing");

  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("evolve-profile-photo") || null);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("evolve-user") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    document.documentElement.className =
      theme === "dark"
        ? "theme-dark"
        : "theme-light";

    localStorage.setItem(
      "evolve-theme",
      theme
    );
  }, [theme]);

  // Global tactile click audio feedback across all buttons, icons, and elements
  useEffect(() => {
    const handleGlobalPointerDown = (e) => {
      initAudio();
      const target = e.target;
      if (!target) return;
      const interactive = target.closest(
        "button, a, input, select, [role='button'], .theme-toggle, .nav-btn, .workspace-tile, .reward-card, .dock-icon, .option-wheel-item, .goal, .goal-check, .goal-delete-btn, .stat-card, .indian-time-badge, .add-goal"
      );
      if (interactive) {
        if (target.tagName === "INPUT" && target.type !== "submit" && target.type !== "checkbox" && target.type !== "radio" && target.type !== "button") {
          return;
        }
        if (target.tagName === "TEXTAREA") return;
        playAudio("click");
      }
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown, { capture: true, passive: true });
    return () => window.removeEventListener("pointerdown", handleGlobalPointerDown, { capture: true });
  }, []);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light"
        ? "dark"
        : "light"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("evolve-token");
    localStorage.removeItem("evolve-user");
    localStorage.removeItem("evolve-profile-photo");
    setProfilePhoto(null);
    setUser({});
    setPage("auth");
  };

  return (
    <div
      className={`app ${
        theme === "dark"
          ? "theme-dark"
          : "theme-light"
      }`}
    >
      <AntigravityCursor />
      <AnimatePresence mode="wait">
        {page === "landing" && (
          <LandingPage
            key="landing"
            theme={theme}
            toggleTheme={toggleTheme}
            onEnter={() => {
              playAudio("enter");
              setPage("auth");
            }}
          />
        )}

        {page === "auth" && (
          <AuthPage
            key="auth"
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() =>
              setPage("landing")
            }
            onLogin={(loggedInUser) => {
              setUser(loggedInUser || {});
              if (loggedInUser?.profile_photo) {
                setProfilePhoto(loggedInUser.profile_photo);
                try {
                  localStorage.setItem("evolve-profile-photo", loggedInUser.profile_photo);
                } catch (e) {
                  console.warn("Could not save profile-photo to localStorage:", e);
                }
              }
              setPage("dashboard");
            }}
          />
        )}

        {page === "dashboard" && (
          <Dashboard
            key="dashboard"
            theme={theme}
            toggleTheme={toggleTheme}
            profilePhoto={profilePhoto}
            setProfilePhoto={setProfilePhoto}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;