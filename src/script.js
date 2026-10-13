import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
// first line of your main entry
document.documentElement.classList.remove("no-css");

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = prefersReducedMotion ? null : new Lenis();

  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollToTarget = (target, offset = -90) => {
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY + offset,
      behavior: "auto",
    });
  };

  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu");
  const navlinks = document.querySelector(".navlinks");
  const progress = document.querySelector(".progress");
  const cursorGlow = document.querySelector(".cursor-glow");
  const backToTop = document.querySelector(".back-to-top");
  const backToTopProgress = backToTop?.querySelector(".back-to-top-progress");
  const hero = document.querySelector(".hero");
  let maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  let heroScrollThreshold = hero ? hero.offsetTop + hero.offsetHeight : 0;

  // ==========================================
  // MOBILE NAVIGATION
  // ==========================================

  const closeMobileMenu = () => {
    navlinks?.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Ouvrir le menu");
  };

  menu?.addEventListener("click", () => {
    const isOpen = navlinks?.classList.toggle("open") ?? false;

    menu.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  navlinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("click", (event) => {
    if (navlinks?.classList.contains("open") && !event.target.closest(".nav")) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) closeMobileMenu();
  });

  // ==========================================
  // SCROLL PROGRESS + HEADER
  // ==========================================

  const updateScrollUI = () => {
    const scrollY = window.scrollY;
    const progressValue = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;

    if (progress) {
      progress.style.transform = `scaleX(${progressValue})`;
    }

    if (backToTopProgress) {
      const circumference = 2 * Math.PI * 21;
      backToTopProgress.style.strokeDashoffset = `${circumference * (1 - progressValue)}`;
    }

    nav?.classList.toggle("scrolled", scrollY > 30);

    const pastHero = hero ? scrollY >= heroScrollThreshold : scrollY > 0;
    backToTop?.classList.toggle("is-visible", pastHero);
    backToTop?.setAttribute("aria-hidden", String(!pastHero));
  };

  const updateScrollMetrics = () => {
    maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    heroScrollThreshold = hero ? hero.offsetTop + hero.offsetHeight : 0;
    updateScrollUI();
  };

  const scrollMetricsObserver =
    "ResizeObserver" in window ? new ResizeObserver(updateScrollMetrics) : null;

  window.addEventListener("scroll", updateScrollUI, {
    passive: true,
  });
  window.addEventListener("resize", updateScrollMetrics, { passive: true });
  scrollMetricsObserver?.observe(document.body);

  updateScrollUI();

  backToTop?.addEventListener("click", () => {
    const top = document.querySelector("#top");
    if (top) scrollToTarget(top, 0);
  });

  // ==========================================
  // SMOOTH ANCHOR NAVIGATION
  // ==========================================

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      scrollToTarget(target);
    });
  });

  // ==========================================
  // CURSOR GLOW
  // ==========================================

  if (cursorGlow && !prefersReducedMotion && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      },
      { passive: true },
    );
  }

  // ==========================================
  // GSAP ANIMATIONS
  // ==========================================

  const revealFallback = () => {
    document.querySelectorAll(".reveal, .stagger > *").forEach((element) => {
      element.style.opacity = "1";
      element.style.visibility = "visible";
      element.style.transform = "none";
    });
  };

  const initGSAP = () => {
    if (prefersReducedMotion) {
      revealFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Start the header and hero entrance only after the loader has cleared.
    const playLandingIntro = () => {
      const nav = document.querySelector(".nav");
      const navItems = gsap
        .utils
        .toArray(".nav > .brand, .nav > .menu, .navlinks > a")
        .filter((element) => element.getClientRects().length);
      const heroCopy = gsap.utils.toArray(".hero-copy > *:not(h1)");
      const heroCard = document.querySelector(".hero-card");
      const portraitDetails = gsap.utils.toArray(".portrait-monogram, .portrait-label");

      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      if (nav) {
        timeline.fromTo(
          nav,
          { autoAlpha: 0, y: -18, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            clearProps: "opacity,transform,visibility,filter",
          },
          0,
        );
      }

      if (navItems.length) {
        timeline.fromTo(
          navItems,
          { autoAlpha: 0, y: -9 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.04,
            clearProps: "opacity,transform,visibility",
          },
          0.08,
        );
      }

      if (heroCopy.length) {
        timeline.fromTo(
          heroCopy,
          { autoAlpha: 0, y: 24, filter: "blur(7px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.11,
            clearProps: "opacity,transform,visibility,filter",
          },
          0.08,
        );
      }

      if (heroCard) {
        timeline.fromTo(
          heroCard,
          { autoAlpha: 0, x: 34, y: 14, scale: 0.96, filter: "blur(8px)" },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            clearProps: "opacity,transform,visibility,filter",
          },
          0.2,
        );
      }

      if (portraitDetails.length) {
        timeline.fromTo(
          portraitDetails,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            clearProps: "opacity,transform,visibility",
          },
          0.65,
        );
      }
    };

    if (document.querySelector("#preloader")) {
      window.addEventListener("portfolio:loader-finished", playLandingIntro, { once: true });
    } else {
      playLandingIntro();
    }

    // Reveal supporting content without competing with section-specific timelines.
    gsap.utils
      .toArray(".reveal:not(.section-head):not(.lab-demo):not(.lab-code):not(.contact-box)")
      .forEach((element) => {
        if (element.closest(".hero")) return;

        const from = { autoAlpha: 0, y: 28, filter: "blur(8px)" };

        if (element.classList.contains("reveal-left")) {
          from.x = -32;
          from.y = 12;
        } else if (element.classList.contains("reveal-right")) {
          from.x = 32;
          from.y = 12;
        } else if (element.classList.contains("reveal-scale")) {
          from.y = 20;
          from.scale = 0.96;
        }

        gsap.fromTo(
          element,
          from,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power4.out",
            clearProps: "opacity,transform,visibility,filter",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          },
        );
      });

    // Section parallax
    gsap.utils.toArray("[data-parallax]").forEach((element) => {
      const speed = Number(element.dataset.parallax) || 0.12;

      gsap.to(element, {
        y: () => -window.innerHeight * speed,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    });

    // Magnetic buttons
    if (window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".btn").forEach((button) => {
        let rect;

        button.addEventListener("pointerenter", () => {
          rect = button.getBoundingClientRect();
        });

        button.addEventListener("pointermove", (event) => {
          if (!rect) return;

          gsap.to(button, {
            x: (event.clientX - rect.left - rect.width / 2) * 0.12,
            y: (event.clientY - rect.top - rect.height / 2) * 0.12,
            duration: 0.25,
            overwrite: true,
          });
        });

        button.addEventListener("pointerleave", () => {
          rect = null;
          gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1,.5)",
          });
        });
      });

      // Project card tilt
      document.querySelectorAll(".project").forEach((card) => {
        let rect;

        card.addEventListener("pointerenter", () => {
          rect = card.getBoundingClientRect();
        });

        card.addEventListener("pointermove", (event) => {
          if (!rect) return;

          const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -3;

          const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 3;

          gsap.to(card, {
            rotateX: rx,
            rotateY: ry,
            duration: 0.35,
            overwrite: true,
          });
        });

        card.addEventListener("pointerleave", () => {
          rect = null;
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: "power3.out",
          });
        });
      });
    }

    // Active navigation section
    document.querySelectorAll("main section[id]").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (!self.isActive) return;

          document.querySelectorAll(".navlinks a").forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`);
          });
        },
      });
    });

    // Cinematic hero depth
    if (document.querySelector(".hero")) {
      gsap.to(".hero-orb-one", {
        yPercent: 28,
        xPercent: -8,
        rotate: 10,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.8,
        },
      });

      gsap.to(".hero-orb-two", {
        yPercent: -34,
        xPercent: 10,
        rotate: -8,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 2.2,
        },
      });
    }

    // Section heading animation
    gsap.utils.toArray(".section-head").forEach((head) => {
      const eyebrow = head.querySelector(".eyebrow");
      const title = head.querySelector("h2");
      const text = head.querySelector(":scope > p");

      const timeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          gsap.set([eyebrow, title, text].filter(Boolean), {
            clearProps: "all",
          });
        },
      });

      if (eyebrow) {
        timeline.fromTo(
          eyebrow,
          { opacity: 0, x: -18 },
          {
            opacity: 1,
            x: 0,
            duration: 0.45,
            ease: "power2.out",
          },
        );
      }

      if (title) {
        timeline.fromTo(
          title,
          {
            opacity: 0,
            y: 34,
            clipPath: "inset(0 0 100% 0)",
          },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 0.75,
            ease: "power4.out",
          },
          "-=0.22",
        );
      }

      if (text) {
        timeline.fromTo(
          text,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
          },
          "-=0.42",
        );
      }

      ScrollTrigger.create({
        trigger: head,
        start: "top 82%",
        once: true,
        onEnter: () => timeline.play(),
      });
    });

    // Stats and about cards
    gsap.utils.toArray(".scale-stagger:not(.skill-grid) > *").forEach((element, index) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 42,
          scale: 0.88,
          rotateX: 7,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.72,
          delay: index * 0.08,
          ease: "back.out(1.35)",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: element.parentElement,
            start: "top 84%",
            once: true,
          },
        },
      );
    });

    // Skill cards
    if (document.querySelector(".skill-grid")) {
      gsap.fromTo(
        ".skill-card",
        {
          opacity: 0,
          y: 60,
          scale: 0.94,
          rotateY: -5,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: ".skill-grid",
            start: "top 80%",
            once: true,
          },
        },
      );
    }

    // Skill tags
    gsap.utils.toArray(".skill-card").forEach((card) => {
      const tags = card.querySelectorAll(".tag");
      if (!tags.length) return;

      gsap.fromTo(
        tags,
        { opacity: 0, y: 10, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.34,
          stagger: 0.035,
          ease: "power2.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: card,
            start: "top 72%",
            once: true,
          },
        },
      );
    });

    // Interaction lab
    if (document.querySelector(".lab-grid")) {
      gsap.fromTo(
        ".lab-demo",
        { opacity: 0, x: -70, rotateY: 5 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: ".lab-grid",
            start: "top 78%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        ".lab-code",
        { opacity: 0, x: 70, rotateY: -5 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: ".lab-grid",
            start: "top 78%",
            once: true,
          },
        },
      );
    }

    // Project reveal
    gsap.utils.toArray(".project").forEach((card, index) => {
      const visual = card.querySelector(".project-visual");
      const body = card.querySelector(".project-body");

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
        },
      });

      timeline.fromTo(
        card,
        { opacity: 0, y: 70, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
        },
        (index % 2) * 0.08,
      );

      if (visual) {
        timeline.fromTo(
          visual,
          {
            clipPath: "inset(0 0 100% 0)",
            scale: 1.08,
          },
          {
            clipPath: "inset(0 0 0% 0)",
            scale: 1,
            duration: 0.85,
            ease: "power4.out",
          },
          "-=0.45",
        );
      }

      if (body) {
        timeline.fromTo(
          body,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            clearProps: "opacity,transform,visibility",
          },
          "-=0.48",
        );
      }
    });

    // Project mockup drift
    gsap.utils.toArray(".project-visual").forEach((visual, index) => {
      const windowElement = visual.querySelector(".project-window");

      if (!windowElement) return;

      gsap.to(windowElement, {
        x: index % 2 === 0 ? 10 : -10,
        ease: "none",
        scrollTrigger: {
          trigger: visual,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    // Experience timeline
    gsap.utils.toArray(".timeline .job").forEach((job, index) => {
      gsap.fromTo(
        job,
        {
          opacity: 0,
          x: index % 2 === 0 ? -55 : 55,
          y: 20,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: job,
            start: "top 86%",
            once: true,
          },
        },
      );

      ScrollTrigger.create({
        trigger: job,
        start: "top 68%",
        once: true,
        onEnter: () => {
          job.classList.add("is-shining");

          gsap.delayedCall(0.9, () => {
            job.classList.remove("is-shining");
          });
        },
      });
    });

    // Contact CTA
    if (document.querySelector(".contact-box")) {
      gsap.fromTo(
        ".contact-box",
        { opacity: 0, y: 70, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: ".contact-box",
            start: "top 82%",
            once: true,
          },
        },
      );
    }

    // Contact input focus animation
    document.querySelectorAll("#contactForm .field").forEach((field) => {
      const input = field.querySelector("input, textarea");

      input?.addEventListener("focus", () => {
        gsap.to(field, {
          y: -2,
          duration: 0.2,
          ease: "power2.out",
        });
      });

      input?.addEventListener("blur", () => {
        gsap.to(field, {
          y: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      });
    });

    // Gallery tiles
    gsap.utils.toArray(".gallery-tile").forEach((element) => {
      const artwork = element.querySelector(".gallery-art");
      const labels = [
        element.querySelector(".gallery-kicker"),
        element.querySelector(".gallery-caption"),
      ].filter(Boolean);
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      });

      timeline.fromTo(
        element,
        {
          autoAlpha: 0,
          y: 44,
          scale: 0.96,
          filter: "blur(8px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.95,
          ease: "power4.out",
          clearProps: "opacity,transform,visibility,filter",
        },
        0,
      );

      if (artwork) {
        timeline.fromTo(
          artwork,
          { scale: 1.12 },
          { scale: 1, duration: 1.2, ease: "power3.out", clearProps: "transform" },
          "-=0.75",
        );
      }

      if (labels.length) {
        timeline.fromTo(
          labels,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "opacity,transform,visibility",
          },
          "-=0.65",
        );
      }
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  // ==========================================
  // INTERACTIVE JAVASCRIPT DEMO
  // ==========================================

  const demo = document.querySelector(".demo-buttons");
  const output = document.querySelector(".demo-output");

  demo?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-demo]");

    if (!button || !demo.contains(button)) return;

    demo.querySelectorAll("button").forEach((item) => {
      item.classList.remove("is-selected");
    });

    button.classList.add("is-selected");

    const action = button.dataset.demo;

    const messages = {
      hover: "Micro-interaction détectée : feedback visuel immédiat.",
      filter: "Filtre appliqué : une seule logique peut gérer plusieurs catégories.",
      scroll: "Scroll interaction : l’interface réagit au contexte utilisateur.",
      menu: "Navigation : un composant peut déléguer ses actions proprement.",
    };

    if (output) {
      const strong = document.createElement("strong");
      strong.textContent = "event.target";

      const pill = document.createElement("span");
      pill.className = "event-pill";
      pill.textContent = messages[action] || "Interaction détectée.";

      output.replaceChildren(
        strong,
        document.createTextNode(` → ${button.textContent.trim()}`),
        document.createElement("br"),
        pill,
      );
    }
  });

  // ==========================================
  // PROJECT FILTERS + PAGINATION
  // ==========================================

  const filters = document.querySelector(".filters");
  const projects = [...document.querySelectorAll(".project")];
  const pagination = document.querySelector(".projects-pagination");
  const pageNumbers = pagination?.querySelector(".page-numbers");

  const pageSize = 6;

  let activeFilter = "all";
  let currentPage = 1;

  const getFilteredProjects = () =>
    projects.filter((project) => {
      const categories = project.dataset.category || "";

      return activeFilter === "all" || categories.includes(activeFilter);
    });

  const renderProjects = () => {
    const filtered = getFilteredProjects();

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

    currentPage = Math.min(currentPage, pageCount);

    const first = (currentPage - 1) * pageSize;

    projects.forEach((project) => {
      const index = filtered.indexOf(project);
      const projectName = project.querySelector("h3")?.textContent.trim();
      const projectLink = project.querySelector(".project-link");

      const visible = index >= first && index < first + pageSize;

      project.classList.toggle("is-hidden", !visible);
      project.setAttribute("aria-hidden", String(!visible));
      if (projectName && projectLink) {
        projectLink.setAttribute("aria-label", `Visiter le projet ${projectName}`);
      }
    });

    if (!scrollMetricsObserver) requestAnimationFrame(updateScrollMetrics);

    const counter = document.querySelector(".filter-count");

    if (counter) {
      counter.textContent = `${filtered.length} projet${filtered.length > 1 ? "s" : ""}`;
    }

    if (pageNumbers) {
      pageNumbers.innerHTML = "";

      for (let page = 1; page <= pageCount; page++) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "page-number" + (page === currentPage ? " is-current" : "");

        button.textContent = String(page);
        button.setAttribute("aria-label", `Page ${page}`);

        if (page === currentPage) {
          button.setAttribute("aria-current", "page");
        }

        button.addEventListener("click", () => {
          currentPage = page;
          renderProjects();
        });

        pageNumbers.append(button);
      }
    }

    pagination
      ?.querySelector('[data-page-action="prev"]')
      ?.toggleAttribute("disabled", currentPage === 1);

    pagination
      ?.querySelector('[data-page-action="next"]')
      ?.toggleAttribute("disabled", currentPage === pageCount);

    if (pagination) {
      pagination.hidden = filtered.length <= pageSize;
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  };

  filters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");

    if (!button || !filters.contains(button)) return;

    filters.querySelectorAll("[data-filter]").forEach((item) => {
      item.classList.remove("is-active");
    });

    button.classList.add("is-active");

    activeFilter = button.dataset.filter;
    currentPage = 1;

    renderProjects();
  });

  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page-action]");

    if (!button || button.disabled) return;

    currentPage += button.dataset.pageAction === "next" ? 1 : -1;

    renderProjects();

    const sectionHead = document.querySelector("#projects .section-head");
    if (sectionHead) scrollToTarget(sectionHead, 0);
  });

  renderProjects();

  // ==========================================
  // CONTACT FORM
  // ==========================================

  const form = document.querySelector("#contactForm");
  const status = document.querySelector("#formStatus");
  const submitButton = form?.querySelector('button[type="submit"]');

  const originalButtonText = submitButton?.innerHTML || "Envoyer le message <span>↗</span>";

  let statusTimeout;

  // Show success/error message for 5 seconds.
  const showStatus = (message, type) => {
    if (!status) return;

    clearTimeout(statusTimeout);

    status.textContent = message;
    status.classList.remove("is-success", "is-error");
    status.classList.add(type);

    statusTimeout = setTimeout(() => {
      status.textContent = "";
      status.classList.remove("is-success", "is-error");
    }, 5000);
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    // Validate required fields
    if (!name || !email || !message) {
      showStatus("Veuillez compléter tous les champs.", "is-error");

      return;
    }

    // Prevent multiple submissions
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours…";
    }

    clearTimeout(statusTimeout);

    if (status) {
      status.textContent = "";
      status.classList.remove("is-success", "is-error");
    }

    try {
      const response = await fetch("https://formsubmit.co/ajax/hammami.asma@outlook.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Nouveau message portfolio — ${name}`,
          _template: "table",
          _captcha: "true",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "L’envoi a échoué.");
      }

      // Success message + reset
      showStatus(
        "Merci ! Votre message a bien été envoyé. Je vous répondrai bientôt.",
        "is-success",
      );

      form.reset();
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error);

      // Error message + reset
      showStatus(
        "Impossible d’envoyer le message pour le moment. Réessayez dans quelques instants.",
        "is-error",
      );

      form.reset();
    } finally {
      // Restore button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    }
  });

  // ==========================================
  // INITIALIZE ANIMATIONS SAFELY
  // ==========================================

  if (prefersReducedMotion) {
    revealFallback();
  } else if (window.gsap && window.ScrollTrigger) {
    initGSAP();
  } else {
    window.addEventListener("load", revealFallback, {
      once: true,
    });
  }
})();

// ==========================================
// CURRENT YEAR IN FOOTER
// ==========================================

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

(() => {
  const loader = document.querySelector("#preloader");
  if (!loader || !window.gsap) return;

  const $ = (selector) => loader.querySelector(selector);

  const percent = $(".loader-percent");
  const progress = $(".loader-progress");
  const status = $(".loader-status");
  const content = document.querySelector("#site-content");

  document.body.classList.remove("is-loaded");

  const counter = { value: 0 };
  let pageReady = document.readyState !== "loading";
  let finished = false;

  const intro = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  intro
    .from(".preloader-top > span", {
      y: 12,
      opacity: 0,
      stagger: 0.04,
      duration: 0.3,
    })
    .from(
      ".loader-label",
      {
        y: 10,
        opacity: 0,
        duration: 0.25,
      },
      "-=0.15",
    )
    .from(
      ".loader-name > span",
      {
        yPercent: 110,
        rotate: 3,
        stagger: 0.05,
        duration: 0.45,
        ease: "power4.out",
      },
      "-=0.05",
    )
    .from(
      ".preloader-bottom > span",
      {
        y: 8,
        opacity: 0,
        stagger: 0.04,
        duration: 0.22,
      },
      "-=0.15",
    )
    .to(
      progress,
      {
        scaleX: 0.25,
        duration: 0.45,
        ease: "power2.inOut",
      },
      0.1,
    );

  function updateCounter(value) {
    counter.value = value;
    percent.textContent = `${Math.round(value).toString().padStart(2, "0")}%`;
  }

  // Progression indicative, plafonnée avant la fin réelle.
  const progressTween = gsap.to(counter, {
    value: 90,
    duration: 1,
    ease: "power1.inOut",
    onUpdate() {
      updateCounter(counter.value);
      gsap.set(progress, {
        scaleX: counter.value / 100,
      });
    },
  });

  function finishLoader() {
    if (finished) return;
    finished = true;

    progressTween.kill();

    const exit = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete() {
        loader.remove();
        if (content) {
          content.style.visibility = "visible";
        }
        document.body.classList.add("is-loaded");
      },
    });

    status.textContent = "WELCOME";

    exit
      .to(counter, {
        value: 100,
        duration: 0.18,
        ease: "power2.out",
        onUpdate() {
          updateCounter(counter.value);
          gsap.set(progress, {
            scaleX: counter.value / 100,
          });
        },
      })
      .to(
        ".loader-name > span",
        {
          yPercent: -115,
          stagger: 0.04,
          duration: 0.32,
        },
        "-=0.05",
      )
      .to(
        ".loader-label, .preloader-bottom",
        {
          opacity: 0,
          y: -12,
          duration: 0.2,
        },
        "<",
      )
      .call(() => window.dispatchEvent(new Event("portfolio:loader-finished")), null, "-=0.05")
      .to(
        loader,
        {
          yPercent: -100,
          duration: 0.5,
        },
        "<",
      );
  }

  function onReady() {
    pageReady = true;
    if (intro.progress() === 1) finishLoader();
  }

  if (pageReady) {
    intro.eventCallback("onComplete", () => {
      finishLoader();
    });
  } else {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
    intro.eventCallback("onComplete", () => {
      if (pageReady) finishLoader();
    });
  }
})();
