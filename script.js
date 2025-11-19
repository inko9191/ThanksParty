// GSAP Plugins Registration
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

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
    setInterval(() => {
      confetti({
        particleCount: 2,
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
    }, 200);
  }

  // ==============================================
  //  2. Vanilla Tilt Initialization
  // ==============================================
  if (typeof VanillaTilt !== "undefined") {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1.05
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
        document.querySelector(".loading-screen").style.display = "none";
        startHeroAnimations();
        // Ensure videos play
        document.querySelectorAll(".bg-video").forEach(v => v.play().catch(() => { }));
      },
    });

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
      xPercent: -50,
      ease: "none",
      duration: 40, // Slightly faster for better flow
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
});
