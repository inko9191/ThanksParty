// GSAP Plugins Registration
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // ==============================================
  //  0. Fireworks Animation for Loading Screen
  // ==============================================
  const fireworksCanvas = document.getElementById("fireworks-canvas");
  if (fireworksCanvas) {
    const ctx = fireworksCanvas.getContext("2d");
    let fireworks = [];
    let particles = [];
    let animationId;
    let isRunning = true;

    function resizeCanvas() {
      fireworksCanvas.width = window.innerWidth;
      fireworksCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Motif shape coordinate data (normalized -1 to 1)
    const motifShapes = {
      rabbit: {
        points: [
          // Left ear
          [-0.15, -1], [-0.2, -0.85], [-0.22, -0.7], [-0.2, -0.55], [-0.15, -0.45],
          // Right ear
          [0.15, -1], [0.2, -0.85], [0.22, -0.7], [0.2, -0.55], [0.15, -0.45],
          // Head
          [-0.25, -0.35], [-0.3, -0.2], [-0.28, -0.05], [-0.2, 0.05],
          [0.25, -0.35], [0.3, -0.2], [0.28, -0.05], [0.2, 0.05],
          [0, -0.4], [-0.1, -0.3], [0.1, -0.3],
          // Eyes
          [-0.1, -0.2], [0.1, -0.2],
          // Body
          [-0.2, 0.15], [-0.25, 0.3], [-0.22, 0.5], [-0.15, 0.65], [-0.05, 0.7],
          [0.2, 0.15], [0.25, 0.3], [0.22, 0.5], [0.15, 0.65], [0.05, 0.7],
          [0, 0.75],
          // Tail
          [0.2, 0.55], [0.28, 0.5], [0.25, 0.6],
          // Feet
          [-0.18, 0.75], [-0.1, 0.8], [0.1, 0.8], [0.18, 0.75]
        ],
        hueBase: 195, hueRange: 30, saturation: 70, lightness: 75
      },
      heart: {
        points: (function () {
          const pts = [];
          for (let t = 0; t < Math.PI * 2; t += 0.15) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            pts.push([x / 17, y / 17]);
          }
          return pts;
        })(),
        hueBase: 345, hueRange: 25, saturation: 85, lightness: 60
      },
      star: {
        points: (function () {
          const pts = [];
          for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i - Math.PI / 2;
            const r = i % 2 === 0 ? 1 : 0.4;
            pts.push([Math.cos(angle) * r, Math.sin(angle) * r]);
          }
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            pts.push([Math.cos(angle) * 0.65, Math.sin(angle) * 0.65]);
          }
          return pts;
        })(),
        hueBase: 45, hueRange: 20, saturation: 90, lightness: 65
      },
      diamond: {
        points: (function () {
          const pts = [];
          const corners = [[0, -1], [0.6, 0], [0, 1], [-0.6, 0]];
          for (let i = 0; i < corners.length; i++) {
            const [x1, y1] = corners[i];
            const [x2, y2] = corners[(i + 1) % corners.length];
            for (let t = 0; t <= 1; t += 0.12) {
              pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
            }
          }
          for (let t = 0.2; t <= 0.8; t += 0.2) {
            pts.push([0, -1 + 2 * t]);
          }
          return pts;
        })(),
        hueBase: 260, hueRange: 30, saturation: 80, lightness: 65
      },
      teacup: {
        points: [
          // Rim
          [-0.5, -0.4], [-0.35, -0.45], [-0.2, -0.47], [0, -0.48],
          [0.2, -0.47], [0.35, -0.45], [0.5, -0.4],
          // Left side
          [-0.5, -0.3], [-0.52, -0.15], [-0.5, 0], [-0.45, 0.15], [-0.35, 0.3],
          // Bottom
          [-0.25, 0.38], [-0.1, 0.42], [0, 0.43], [0.1, 0.42], [0.25, 0.38],
          // Right side
          [0.35, 0.3], [0.45, 0.15], [0.5, 0], [0.52, -0.15], [0.5, -0.3],
          // Handle
          [0.52, -0.25], [0.62, -0.2], [0.68, -0.1], [0.7, 0.0],
          [0.68, 0.1], [0.62, 0.18], [0.52, 0.2], [0.48, 0.15],
          // Saucer
          [-0.6, 0.5], [-0.4, 0.55], [-0.2, 0.57], [0, 0.58],
          [0.2, 0.57], [0.4, 0.55], [0.6, 0.5],
          // Steam
          [-0.15, -0.55], [-0.1, -0.7], [-0.15, -0.85],
          [0, -0.55], [0.05, -0.7], [0, -0.85],
          [0.15, -0.55], [0.1, -0.7], [0.15, -0.85]
        ],
        hueBase: 160, hueRange: 30, saturation: 75, lightness: 65
      }
    };

    const motifKeys = Object.keys(motifShapes);

    class Firework {
      constructor() {
        this.x = Math.random() * fireworksCanvas.width;
        this.y = fireworksCanvas.height;
        this.targetY = Math.random() * (fireworksCanvas.height * 0.4) + fireworksCanvas.height * 0.1;
        this.speed = 6 + Math.random() * 4;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
        this.exploded = false;

        // 70% motif, 30% normal circle
        this.isMotif = Math.random() < 0.7;
        if (this.isMotif) {
          this.motifKey = motifKeys[Math.floor(Math.random() * motifKeys.length)];
          const shape = motifShapes[this.motifKey];
          this.hue = shape.hueBase + (Math.random() - 0.5) * shape.hueRange;
          this.saturation = shape.saturation;
          this.lightness = shape.lightness;
        } else {
          this.hue = Math.random() * 60 + 280;
          this.saturation = 80;
          this.lightness = 70;
        }
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;

        if (this.vy >= 0 || this.y <= this.targetY) {
          this.explode();
          this.exploded = true;
        }
      }

      explode() {
        if (this.isMotif) {
          const shape = motifShapes[this.motifKey];
          const scale = isMobile ? 50 : 80;
          const extraPerPoint = isMobile ? 1 : 2;

          shape.points.forEach(([px, py]) => {
            for (let j = 0; j < extraPerPoint; j++) {
              const tx = px * scale + (Math.random() - 0.5) * 6;
              const ty = py * scale + (Math.random() - 0.5) * 6;
              const dist = Math.sqrt(tx * tx + ty * ty);
              const speed = dist / 15 + Math.random() * 0.5;
              const angle = Math.atan2(ty, tx);
              particles.push(new Particle(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.hue, this.saturation, this.lightness,
                tx, ty, true
              ));
            }
          });
        } else {
          const particleCount = isMobile ? 60 : 100;
          for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 2 + Math.random() * 4;
            particles.push(new Particle(
              this.x, this.y,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              this.hue, this.saturation, this.lightness,
              0, 0, false
            ));
          }
        }
      }

      draw() {
        for (let i = 0; i < this.trail.length; i++) {
          const point = this.trail[i];
          const alpha = (i / this.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${alpha})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness + 10}%)`;
        ctx.fill();
      }
    }

    class Particle {
      constructor(x, y, vx, vy, hue, sat, light, targetOffX, targetOffY, isShape) {
        this.originX = x;
        this.originY = y;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hue = hue + (Math.random() - 0.5) * 20;
        this.sat = sat;
        this.light = light;
        this.alpha = 1;
        this.isShape = isShape;
        this.targetOffX = targetOffX;
        this.targetOffY = targetOffY;
        this.life = 0;

        if (isShape) {
          this.decay = 0.008 + Math.random() * 0.005;
          this.gravity = 0.02;
        } else {
          this.decay = 0.015 + Math.random() * 0.01;
          this.gravity = 0.08;
        }
      }

      update() {
        this.life++;
        if (this.isShape && this.life < 25) {
          const progress = Math.min(this.life / 20, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          this.x = this.originX + this.targetOffX * ease;
          this.y = this.originY + this.targetOffY * ease;
        } else {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += this.gravity;
          this.vx *= 0.98;
          this.vy *= 0.98;
        }
        this.alpha -= this.decay;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.alpha})`;
        ctx.fill();
        if (this.alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light + 20}%, ${this.alpha * 0.3})`;
          ctx.fill();
        }
      }
    }

    function animate() {
      if (!isRunning) return;

      ctx.fillStyle = "rgba(5, 4, 32, 0.2)";
      ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

      if (Math.random() < (isMobile ? 0.04 : 0.08)) {
        fireworks.push(new Firework());
      }

      fireworks = fireworks.filter(fw => {
        if (!fw.exploded) {
          fw.update();
          fw.draw();
          return !fw.exploded;
        }
        return false;
      });

      particles = particles.filter(p => {
        p.update();
        p.draw();
        return p.alpha > 0;
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    window.stopFireworks = function () {
      isRunning = false;
      cancelAnimationFrame(animationId);
    };
  }

  // ==============================================
  //  0.5. Countdown Timer
  // ==============================================
  function initCountdown() {
    const targetDate = new Date("2026-03-01T14:00:00+09:00").getTime();
    const countdownContainer = document.querySelector(".countdown-container");

    if (!countdownContainer) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        // Event has started
        countdownContainer.innerHTML = '<p class="countdown-label" style="font-size: 1.5rem; color: #ff7bb9;">🎉 謝恩会開催中！ 🎉</p>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      updateDigit("countdown-days", days.toString().padStart(2, '0'));
      updateDigit("countdown-hours", hours.toString().padStart(2, '0'));
      updateDigit("countdown-minutes", minutes.toString().padStart(2, '0'));
      updateDigit("countdown-seconds", seconds.toString().padStart(2, '0'));
    }

    function updateDigit(id, value) {
      const el = document.getElementById(id);
      if (el && el.textContent !== value) {
        el.classList.add("flip");
        setTimeout(() => {
          el.textContent = value;
          el.classList.remove("flip");
        }, 150);
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Initialize countdown immediately
  initCountdown();

  // ==============================================
  //  1. Magical Particles (tsparticles)
  // ==============================================
  const particlesContainer = document.getElementById("particles-container");
  if (particlesContainer && window.confetti) {
    // Using confetti as a base for "magical dust"
    // We will create a continuous stream of small particles

    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    let skew = 1;

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Continuous magical dust
    // Reduce frequency on mobile for performance
    const particleInterval = isMobile ? 500 : 200;

    setInterval(() => {
      confetti({
        particleCount: isMobile ? 1 : 2, // Fewer particles on mobile
        startVelocity: 0,
        ticks: 200, // Stay longer
        origin: {
          x: Math.random(),
          // since particles fall down, start a bit higher than random
          y: Math.random() * 0.9 - 0.2
        },
        colors: ['#ffffff', '#c4b5fd', '#ff7bb9'],
        shapes: ['circle', 'star'],
        gravity: randomInRange(0.4, 0.8),
        scalar: randomInRange(0.4, 0.8),
        drift: randomInRange(-0.4, 0.4),
        disableForReducedMotion: true
      });
    }, particleInterval);
  }

  // ==============================================
  //  2. Vanilla Tilt Initialization (Desktop Only)
  // ==============================================

  if (typeof VanillaTilt !== "undefined" && !isMobile) {
    VanillaTilt.init(document.querySelectorAll(".js-tilt"), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1.05
    });
  }

  // ==============================================
  //  2.5. Mobile Navigation
  // ==============================================
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  if (mobileMenuBtn && mobileNavOverlay) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuBtn.classList.toggle("active");
      mobileNavOverlay.classList.toggle("active");
      document.body.style.overflow = mobileNavOverlay.classList.contains("active") ? "hidden" : "";
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuBtn.classList.remove("active");
        mobileNavOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  // ==============================================
  //  3. Advanced GSAP Animations
  // ==============================================

  // --- Opening Loading Animation ---
  const loadingTl = gsap.timeline();

  loadingTl
    .to(".loading-logo", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
    })
    .to(".loading-bar-progress", {
      width: "100%",
      duration: 1.5,
      ease: "power2.inOut",
    })
    .to(".loading-screen", {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      delay: 0.2,
      onComplete: () => {
        // Stop fireworks animation
        if (window.stopFireworks) {
          window.stopFireworks();
        }
        document.querySelector(".loading-screen").style.display = "none";
        startHeroAnimations();
        // Ensure videos play
        document.querySelectorAll(".bg-video").forEach(v => {
          v.muted = true; // Force mute for autoplay policy
          const playPromise = v.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Video play failed:", error);
            });
          }
        });
      },
    });

  // Safety timeout: Hide loading screen after 4 seconds if it hasn't disappeared
  setTimeout(() => {
    const loadingScreen = document.querySelector(".loading-screen");
    if (loadingScreen && loadingScreen.style.display !== "none") {
      loadingScreen.style.display = "none";
      startHeroAnimations();
    }
  }, 4000);

  // --- Hero Section Animations ---
  function startHeroAnimations() {
    const heroTl = gsap.timeline();

    heroTl
      .to(".hero-eyebrow", {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      })
      .to(".hero-title", {
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        scale: 1, // Slight scale up effect handled by CSS transform usually, but here just opacity
      }, "-=0.5")
      .to(".hero-subtitle", {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, "-=1")
      .to(".hero-meta", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "back.out(1.7)",
      }, "-=0.8")
      .to(".countdown-container", {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, "-=0.5")
      .to(".scroll-indicator", {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, "-=0.5");

    // Hero Decor Floating Animation
    gsap.to(".hero-decor-clock", {
      y: 30,
      rotation: 10,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".hero-decor-cards", {
      y: -40,
      rotation: -10,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1,
    });
  }

  // --- Mouse Stalker ---
  const stalker = document.querySelector(".mouse-stalker");
  const stalkerDot = document.querySelector(".mouse-stalker-dot");

  if (window.matchMedia("(min-width: 1024px)").matches) {
    document.addEventListener("mousemove", (e) => {
      // Stalker follows with delay
      gsap.to(stalker, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out",
      });
      // Dot follows instantly
      gsap.to(stalkerDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
    });

    const hoverTargets = document.querySelectorAll("a, button, .meal-item, .about-card, .program-card, .access-info");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("is-hovering");
        gsap.to(stalker, { scale: 1.5, duration: 0.3 });
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("is-hovering");
        gsap.to(stalker, { scale: 1, duration: 0.3 });
      });
    });
  }

  // --- Scroll Animations (ScrollTrigger) ---

  // Header Background
  ScrollTrigger.create({
    start: "top -100",
    end: 99999,
    toggleClass: { className: "is-scrolled", targets: ".site-header" }
  });

  // Background Video Transitions
  ScrollTrigger.create({
    trigger: ".section-welcome",
    start: "top 85%", // Trigger earlier (when top hits 85% of viewport)
    end: "bottom center",
    onEnter: () => {
      gsap.to("#bg-video-hero", { opacity: 0, duration: 0.3 });
      gsap.to("#bg-video-welcome", { opacity: 1, duration: 0.3 });
    },
    onLeaveBack: () => {
      gsap.to("#bg-video-hero", { opacity: 1, duration: 0.3 });
      gsap.to("#bg-video-welcome", { opacity: 0, duration: 0.3 });
    }
  });

  ScrollTrigger.create({
    trigger: ".section-about",
    start: "top 85%", // Trigger earlier
    end: "bottom center",
    onEnter: () => {
      gsap.to("#bg-video-welcome", { opacity: 0, duration: 0.3 });
      gsap.to("#bg-video-about", { opacity: 1, duration: 0.3 });
    },
    onLeaveBack: () => {
      gsap.to("#bg-video-welcome", { opacity: 1, duration: 0.3 });
      gsap.to("#bg-video-about", { opacity: 0, duration: 0.3 });
    }
  });

  ScrollTrigger.create({
    trigger: ".section-events", // Changed from .section-program to .section-events
    start: "top 85%", // Trigger early
    onEnter: () => {
      gsap.to("#bg-video-about", { opacity: 0, duration: 0.3 }); // Fast fade out
    },
    onLeaveBack: () => {
      gsap.to("#bg-video-about", { opacity: 1, duration: 0.3 });
    }
  });

  // Welcome Content Animation
  const welcomeTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".welcome-content",
      start: "top 75%",
    },
  });

  welcomeTl
    .to(".welcome-eyebrow", { opacity: 1, z: 0, duration: 1, ease: "power3.out" })
    .to(".welcome-title", { opacity: 1, z: 0, duration: 1, ease: "power3.out" }, "-=0.8")
    .to(".welcome-text", { opacity: 1, z: 0, duration: 1, ease: "power3.out" }, "-=0.8");

  // About Section Cards
  const aboutCards = document.querySelectorAll(".about-card");
  if (aboutCards.length > 0) {
    gsap.from(aboutCards, {
      scrollTrigger: {
        trigger: ".about-grid",
        start: "top 85%",
      },
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power4.out",
    });
  }

  // Program Timeline
  const programItems = document.querySelectorAll(".program-timeline li");
  if (programItems.length > 0) {
    programItems.forEach((item, i) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: i * 0.1,
      });
    });
  }

  // Meal Section Reveal
  gsap.from(".meal-carousel", {
    scrollTrigger: {
      trigger: ".section-meal",
      start: "top 80%",
    },
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out",
  });

  // Meal Section Infinite Scroll (Marquee) with Caterpillar Effect
  const mealTrack = document.querySelector(".meal-track");
  if (mealTrack) {
    // 1. Horizontal Scroll (Marquee)
    const marqueeTween = gsap.to(".meal-track", {
      xPercent: -25, // Move 1/4 of the track (1 set out of 4)
      ease: "none",
      duration: 20, // Adjusted duration for shorter distance (was 40 for 50%)
      repeat: -1,
    });

    const mealCarousel = document.querySelector(".meal-carousel");
    mealCarousel.addEventListener("mouseenter", () => marqueeTween.timeScale(0.2));
    mealCarousel.addEventListener("mouseleave", () => marqueeTween.timeScale(1));

    // 2. Vertical Wave (Caterpillar Motion)
    const mealItems = document.querySelectorAll(".meal-item");
    mealItems.forEach((item, i) => {
      // Create a sine wave motion
      gsap.to(item, {
        y: 30, // Amplitude of the wave
        duration: 2, // Speed of the wave cycle
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.25, // Stagger creates the "caterpillar" wave shape
      });
    });
  }

  // Access Map Parallax
  gsap.from(".access-map-placeholder", {
    scrollTrigger: {
      trigger: ".section-access",
      start: "top 80%",
    },
    rotation: -5,
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    ease: "back.out(1.2)",
  });

  // Video Loop Control (Cheshire Cat)
  const aboutVideo = document.getElementById("bg-video-about");
  if (aboutVideo) {
    aboutVideo.addEventListener("timeupdate", () => {
      if (aboutVideo.currentTime >= 6.5) {
        aboutVideo.currentTime = 0;
        aboutVideo.play();
      }
    });
  }

  // ==============================================
  //  4. 3D Model Viewer (Three.js)
  // ==============================================
  function init3DModelViewer() {
    const container = document.getElementById("model-viewer");
    const loadingEl = document.getElementById("model-loading");
    const resetBtn = document.getElementById("model-reset");
    const autoRotateBtn = document.getElementById("model-autorotate");

    if (!container || typeof THREE === "undefined") return;

    // Scene setup - Starry night sky
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a); // Dark night sky

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
      starPositions[i + 1] = Math.random() * 1000;
      starPositions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(150, 100, 150);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: false,  // Disable for performance
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;  // Disable shadows for performance
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;

    // Lighting - Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Lighting - Directional (Sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 150, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Hemisphere light for natural outdoor look
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.4);
    scene.add(hemiLight);

    // Add subtle purple/pink accent lights for Wonderland theme
    const accentLight1 = new THREE.PointLight(0x9f7bff, 0.3, 300);
    accentLight1.position.set(-100, 50, -100);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff7bb9, 0.2, 300);
    accentLight2.position.set(100, 50, 100);
    scene.add(accentLight2);

    // Load GLB Model
    const loader = new THREE.GLTFLoader();

    // Setup DRACOLoader for compressed GLB files
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    let model = null;
    let initialCameraPosition = camera.position.clone();
    let initialControlsTarget = controls.target.clone();

    loader.load(
      "model-final.glb",
      function (gltf) {
        console.log("Model loaded successfully!", gltf);
        model = gltf.scene;
        console.log("Model scene:", model);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("Model original size:", size);
        console.log("Model center:", center);

        model.position.sub(center);

        // Fix orientation - rotate 180 degrees on X axis (Blender to Three.js coordinate system)
        model.rotation.x = Math.PI;

        // Scale if needed
        const maxDim = Math.max(size.x, size.y, size.z);
        console.log("Max dimension:", maxDim);

        if (maxDim > 200) {
          const scale = 200 / maxDim;
          model.scale.setScalar(scale);
          console.log("Scaled to:", scale);
        }

        // Enable shadows for all meshes and fix material rendering
        let meshCount = 0;

        model.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Enable double-sided rendering to fix dark faces
            if (node.material) {
              if (Array.isArray(node.material)) {
                node.material.forEach(mat => {
                  mat.side = THREE.DoubleSide;
                });
              } else {
                node.material.side = THREE.DoubleSide;
              }
            }
            meshCount++;
          }
        });
        console.log("Total meshes:", meshCount);

        scene.add(model);

        // Recalculate bounding box after adding to scene
        const finalBox = new THREE.Box3().setFromObject(model);
        const finalCenter = finalBox.getCenter(new THREE.Vector3());
        const finalSize = finalBox.getSize(new THREE.Vector3());

        // Adjust camera to view from above at an angle
        const maxSize = Math.max(finalSize.x, finalSize.y, finalSize.z);

        // Position camera: diagonal top-down view
        camera.position.set(
          finalCenter.x + maxSize * 1.2,  // Offset X
          finalCenter.y + maxSize * 1.8,  // Higher Y for looking down
          finalCenter.z + maxSize * 1.2   // Offset Z
        );
        controls.target.copy(finalCenter);
        camera.lookAt(finalCenter);
        controls.update();

        console.log("Camera positioned at:", camera.position);

        // Store initial positions for reset
        initialCameraPosition = camera.position.clone();
        initialControlsTarget = controls.target.clone();

        // Hide loading
        if (loadingEl) {
          loadingEl.classList.add("hidden");
        }

        // Render once (static image mode)
        controls.update();
        renderer.render(scene, camera);
        console.log("Static render complete");
      },
      function (xhr) {
        // Progress
        const progress = (xhr.loaded / xhr.total) * 100;
        console.log("Model loading: " + Math.round(progress) + "%");
      },
      function (error) {
        console.error("Error loading model:", error);
        if (loadingEl) {
          loadingEl.innerHTML = '<p style="color: #ff6b6b;">モデルの読み込みに失敗しました</p>';
        }
      }
    );

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        gsap.to(camera.position, {
          x: initialCameraPosition.x,
          y: initialCameraPosition.y,
          z: initialCameraPosition.z,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () => {
            controls.update();
            renderer.render(scene, camera);
          }
        });
        gsap.to(controls.target, {
          x: initialControlsTarget.x,
          y: initialControlsTarget.y,
          z: initialControlsTarget.z,
          duration: 1,
          ease: "power2.inOut"
        });
      });
    }

    // Auto-rotate button - disabled in static mode
    if (autoRotateBtn) {
      autoRotateBtn.style.display = 'none';
    }

    // Render on demand - only when user interacts (drag/zoom)
    controls.addEventListener('change', () => {
      renderer.render(scene, camera);
    });

    // Handle resize
    function onWindowResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onWindowResize);

    // ScrollTrigger animation for section entrance
    gsap.from(".section-3d-map .section-title", {
      scrollTrigger: {
        trigger: ".section-3d-map",
        start: "top 80%"
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    gsap.from(".section-3d-map .section-lead", {
      scrollTrigger: {
        trigger: ".section-3d-map",
        start: "top 75%"
      },
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out"
    });

    gsap.from(".model-viewer-container", {
      scrollTrigger: {
        trigger: ".section-3d-map",
        start: "top 70%"
      },
      y: 50,
      opacity: 0,
      scale: 0.95,
      duration: 1.2,
      delay: 0.3,
      ease: "power3.out"
    });
  }

  // Initialize 3D viewer
  init3DModelViewer();
});
