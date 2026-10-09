import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu");
  const navlinks = document.querySelector(".navlinks");
  const progress = document.querySelector(".progress");
  const cursorGlow = document.querySelector(".cursor-glow");

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
    const max = document.documentElement.scrollHeight - window.innerHeight;

    const progressValue = max > 0 ? window.scrollY / max : 0;

    if (progress) {
      progress.style.width = `${progressValue * 100}%`;
    }

    nav?.classList.toggle("scrolled", window.scrollY > 30);
  };

  window.addEventListener("scroll", updateScrollUI, {
    passive: true,
  });

  updateScrollUI();

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

      const y = target.getBoundingClientRect().top + window.scrollY - 90;

      window.scrollTo({
        top: y,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
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

    // Hero content
    if (document.querySelector(".hero-copy")) {
      gsap.fromTo(
        ".hero-copy > *",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.09,
          ease: "power3.out",
          delay: 0.15,
        },
      );
    }

    if (document.querySelector(".hero-card")) {
      gsap.fromTo(
        ".hero-card",
        { opacity: 0, y: 35, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.15,
          ease: "power3.out",
          delay: 0.35,
        },
      );
    }

    // Reveal elements on scroll
    gsap.utils.toArray(".reveal").forEach((element) => {
      if (element.closest(".hero")) return;

      gsap.fromTo(
        element,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
            once: true,
          },
        },
      );
    });

    // Staggered groups
    gsap.utils.toArray(".stagger").forEach((group) => {
      if (!group.children.length) return;

      gsap.fromTo(
        group.children,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: group,
            start: "top 82%",
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
        button.addEventListener("pointermove", (event) => {
          const rect = button.getBoundingClientRect();

          gsap.to(button, {
            x: (event.clientX - rect.left - rect.width / 2) * 0.12,
            y: (event.clientY - rect.top - rect.height / 2) * 0.12,
            duration: 0.25,
            overwrite: true,
          });
        });

        button.addEventListener("pointerleave", () => {
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
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();

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
    gsap.utils.toArray(".scale-stagger > *").forEach((element, index) => {
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

    // Scroll progress animation
    if (progress) {
      gsap.to(progress, {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.25,
        },
      });
    }

    // Gallery tiles
    gsap.utils.toArray(".gallery-tile").forEach((element, index) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: (index % 3) * 0.08,
          clearProps: "opacity,transform,visibility",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
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

      const visible = index >= first && index < first + pageSize;

      project.classList.toggle("is-hidden", !visible);
      project.setAttribute("aria-hidden", String(!visible));
    });

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

    document.querySelector("#projects .section-head")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
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
