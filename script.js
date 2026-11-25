document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Branded intro curtain + same-site transition curtain.
  document.body.classList.add("js-motion", "is-loading");
  const curtain = document.createElement("div");
  curtain.className = "motion-curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = '<div class="motion-curtain__word"><span>SOFSURE.</span></div>';
  document.body.prepend(curtain);
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  const finishIntro = () => {
    document.body.classList.add("is-ready");
    document.body.classList.remove("is-loading");
    if (!reduceMotion) {
      requestAnimationFrame(() => curtain.classList.add("is-opening"));
      window.setTimeout(() => curtain.remove(), 1150);
    } else curtain.remove();
  };
  if (reduceMotion) finishIntro();
  else window.setTimeout(finishIntro, 180);

  // Scroll progress and footer entrance.
  let scrollQueued = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    document.querySelector(".site-footer")?.classList.toggle("footer-in", window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 120);
    scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollQueued) { window.requestAnimationFrame(updateScroll); scrollQueued = true; }
  }, { passive: true });
  updateScroll();

  // Mobile navigation.
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Reveal cards, sections and headings with staggered motion.
  const motionTargets = [
    ...document.querySelectorAll(".hero-copy,.hero-art,.intro-content,.section-label,.service-tile,.career-band>div,.careers-title,.careers-side,.careers-graphic,.values-strip>div,.roles-heading,.role-controls,.role-row,.open-application>div,.inner-hero>.kicker,.inner-hero>h1,.inner-hero-aside,.industry-item,.about-statement>div,.principles article,.contact-hero>div,.contact-card,.contact-note,.contact-end>div,.cta-panel>*")
  ];
  motionTargets.forEach((el, i) => {
    if (el.closest(".motion-curtain")) return;
    el.classList.add("motion-reveal");
    if (i % 6 !== 0) el.dataset.delay = String((i % 5) + 1);
    if (el.matches(".hero-art,.careers-graphic,.statement-symbol,.contact-end-symbol")) el.dataset.motion = "scale";
    else if (el.matches(".section-label,.roles-heading,.contact-note")) el.dataset.motion = "left";
  });
  const headings = document.querySelectorAll(".hero h1,.careers-title h1,.inner-hero h1,.contact-hero h1,.intro-content h2,.roles-heading h2,.open-application h2,.cta-panel h2,.about-statement h2,.contact-end h2");
  headings.forEach(h => {
    const raw = h.innerHTML;
    // Keep inline emphasis by wrapping the existing heading in a single animated line.
    h.classList.add("motion-heading");
    h.innerHTML = `<span class="heading-line"><span>${raw}</span></span>`;
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -35px 0px" });
    motionTargets.forEach(el => observer.observe(el));
    headings.forEach(el => observer.observe(el));
  } else {
    motionTargets.forEach(el => el.classList.add("is-in"));
    headings.forEach(el => el.classList.add("is-in"));
  }

  // Marquee adds editorial movement between the page content and footer.
  const footer = document.querySelector(".site-footer");
  if (footer && !document.querySelector(".motion-marquee")) {
    const marquee = document.createElement("div");
    marquee.className = "motion-marquee";
    marquee.setAttribute("aria-label", "Sofsure: thoughtful technology, useful outcomes");
    const group = '<div class="motion-marquee__group">THOUGHTFUL BY DESIGN <b>✳</b> BUILT WITH INTENT <b>✳</b> PEOPLE MAKE THE DIFFERENCE <b>✳</b> CLEAR THINKING, USEFUL OUTCOMES <b>✳</b></div>';
    marquee.innerHTML = `<div class="motion-marquee__track">${group}${group}</div>`;
    footer.parentNode.insertBefore(marquee, footer);
  }

  // Custom cursor and gentle magnetic response for primary buttons on desktop.
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reduceMotion) {
    document.body.classList.add("has-custom-cursor");
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.append(cursor);
    let mouseX = -20, mouseY = -20, cursorX = -20, cursorY = -20;
    window.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    const followCursor = () => {
      cursorX += (mouseX - cursorX) * .28;
      cursorY += (mouseY - cursorY) * .28;
      cursor.style.left = `${cursorX}px`; cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(followCursor);
    };
    requestAnimationFrame(followCursor);
    document.querySelectorAll("a,button,.service-tile,.contact-card").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
    document.querySelectorAll(".button").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * .08;
        const dy = (e.clientY - (r.top + r.height / 2)) * .08;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
        
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
        // Cursor-reactive 3D movement for homepage process cards.
    document.querySelectorAll(".service-tile").forEach(card => {
      const heading = card.querySelector("h3");

      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 8;

        card.style.setProperty("--spot-x", `${x * 100}%`);
        card.style.setProperty("--spot-y", `${y * 100}%`);

        card.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

        card.classList.add("is-pointer-active");

        if (heading) {
          heading.style.transform =
            `translate3d(${(x - 0.5) * 8}px, ${(y - 0.5) * 8}px, 12px)`;
        }
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.classList.remove("is-pointer-active");

        if (heading) heading.style.transform = "";
      });
    });
  }

  // Same-site page transitions: cover screen before following local HTML links.
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        href.startsWith("javascript:") || link.target === "_blank" || link.hasAttribute("download")) return;
    let target;
    try { target = new URL(href, window.location.href); } catch { return; }
    if (target.origin !== window.location.origin || target.pathname === window.location.pathname && target.search === window.location.search) return;
    link.addEventListener("click", e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || reduceMotion) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      curtain.classList.remove("is-opening");
      curtain.style.visibility = "visible";
      curtain.style.transform = "translateY(102%)";
      curtain.style.animation = "none";
      curtain.offsetHeight; // restart the cover animation
      curtain.style.animation = "pageCover .48s cubic-bezier(.76,0,.24,1) forwards";
      window.setTimeout(() => { window.location.href = target.href; }, 430);
    });
  });

  // Search and filter open roles.
  const search = document.querySelector("#role-search");
  const team = document.querySelector("#team-filter");
  const mode = document.querySelector("#mode-filter");
  const rows = [...document.querySelectorAll(".role-row")];
  const noResults = document.querySelector("#no-results");
  function filterRoles() {
    if (!rows.length) return;
    const q = (search?.value || "").trim().toLowerCase();
    let count = 0;
    rows.forEach(row => {
      const matches = (!q || (row.dataset.search + " " + row.innerText).toLowerCase().includes(q))
        && (!team || team.value === "all" || row.dataset.team === team.value)
        && (!mode || mode.value === "all" || row.dataset.mode === mode.value);
      row.hidden = !matches;
      if (matches) count++;
    });
    if (noResults) noResults.hidden = count > 0;
  }
  [search, team, mode].filter(Boolean).forEach(el => el.addEventListener("input", filterRoles));

  const roleData = {
    political: {
      number:"01 / 05", team:"RESEARCH / INTERNSHIP", title:"Political Research Intern",
      intro:"Support research and analysis on political developments, constituencies and public information. Help turn raw information into structured, reliable insights.",
      facts:[["LOCATION","Panchkula"],["WORK MODE","On-site"],["DURATION","3 months"],["STIPEND","₹10,000 / month"],["TEAM","Research"]],
      responsibilities:["Track political developments and gather information from credible public sources.","Collect, clean, structure and verify constituency-level information.","Support candidate research, fact-checking and concise research summaries.","Maintain organised datasets and collaborate with the wider team."],
      requirements:["Strong research, reading and written communication skills.","Comfort working with spreadsheets and structured data.","Attention to detail and willingness to verify sources.","Interest in public affairs, political research or policy is useful."]
    },
    uiux: {
      number:"02 / 05", team:"DESIGN / INTERNSHIP", title:"UI/UX Design Intern",
      intro:"Help shape digital products that feel clear, accessible and intuitive, from early ideas through wireframes and prototypes.",
      facts:[["LOCATION","Chandigarh"],["WORK MODE","Hybrid"],["DURATION","6 months"],["STIPEND","To be confirmed"],["TEAM","Design"]],
      responsibilities:["Create user flows, wireframes and interactive prototypes.","Contribute to interface design and reusable design patterns.","Gather feedback and iterate on design decisions.","Work with product and engineering teammates to refine experiences."],
      requirements:["A portfolio or examples of design work are helpful.","Familiarity with a design tool such as Figma is useful.","Interest in usability, visual hierarchy and accessible design.","Clear communication and openness to feedback."]
    },
    ai: {
      number:"03 / 05", team:"ENGINEERING / INTERNSHIP", title:"AI Engineering Intern",
      intro:"Explore practical AI and machine-learning workflows and help turn promising ideas into useful product capabilities.",
      facts:[["LOCATION","Chandigarh"],["WORK MODE","Hybrid"],["DURATION","6 months"],["STIPEND","To be confirmed"],["TEAM","Engineering"]],
      responsibilities:["Assist with prototyping and evaluating AI/ML features.","Prepare and inspect data for experiments and model workflows.","Integrate model or API capabilities into application prototypes.","Document findings, limitations and performance observations."],
      requirements:["Python fundamentals and basic programming confidence.","Interest in machine learning, LLMs or applied AI.","Comfort learning APIs, data formats and debugging workflows.","Projects or coursework demonstrating curiosity are welcome."]
    },
    fullstack: {
      number:"04 / 05", team:"ENGINEERING / INTERNSHIP", title:"Full Stack Engineering Intern",
      intro:"Help build and improve digital products across the application stack, working with interfaces, APIs and data.",
      facts:[["LOCATION","Chandigarh"],["WORK MODE","Hybrid"],["DURATION","6 months"],["STIPEND","To be confirmed"],["TEAM","Engineering"]],
      responsibilities:["Implement and refine application features with guidance from the team.","Work with APIs, databases and frontend components.","Help test, debug and document application behaviour.","Collaborate through version control and code review."],
      requirements:["Fundamentals in JavaScript or another programming language.","Basic understanding of HTTP, APIs and data structures.","Interest in backend, frontend or full-stack product development.","Git and personal projects are useful but not mandatory."]
    },
    datascience: {
      number:"05 / 05", team:"DATA / INTERNSHIP", title:"Data Science Intern",
      intro:"Help transform raw data into clear findings through analysis, visualisation and careful interpretation.",
      facts:[["LOCATION","Chandigarh"],["WORK MODE","Hybrid"],["DURATION","6 months"],["STIPEND","To be confirmed"],["TEAM","Data"],["DATE SHOWN IN SOURCE","30 October 2026 — meaning to confirm"]],
      responsibilities:["Clean, validate and organise datasets for analysis.","Explore trends, patterns and outliers using suitable methods.","Build charts, summaries or dashboards to communicate findings.","Document assumptions and present results clearly."],
      requirements:["Python or spreadsheet skills and an analytical mindset.","Basic statistics and data-cleaning knowledge.","Familiarity with SQL or visualisation tools is helpful.","Careful reasoning and clear communication."]
    }
  };
  const modal = document.querySelector("#role-modal");
  function setList(id, values) {
    const el = document.querySelector(id);
    if (el) { el.innerHTML = ""; values.forEach(value => { const li = document.createElement("li"); li.textContent = value; el.appendChild(li); }); }
  }
  function openRole(key) {
    const data = roleData[key];
    if (!data || !modal) return;
    document.querySelector("#modal-team").textContent = data.team;
    document.querySelector("#modal-number").textContent = data.number;
    document.querySelector("#modal-title").textContent = data.title;
    document.querySelector("#modal-intro").textContent = data.intro;
    const facts = document.querySelector("#modal-facts");
    facts.innerHTML = "";
    data.facts.forEach(([label, value]) => {
      const item = document.createElement("div"); item.className = "fact-item";
      const small = document.createElement("span"); small.textContent = label;
      const strong = document.createElement("strong"); strong.textContent = value;
      item.append(small, strong); facts.appendChild(item);
    });
    setList("#modal-responsibilities", data.responsibilities);
    setList("#modal-requirements", data.requirements);
    document.querySelector("#application-form").hidden = true;
    document.querySelector("#open-apply").hidden = false;
    document.querySelector("#apply-role-name").textContent = data.title;
    document.querySelector("#application-role").value = data.title;
    document.querySelector("#form-status").textContent = "";
    modal.hidden = false;
    document.body.classList.add("modal-open");
    document.querySelector(".modal-close").focus();
  }
  document.querySelectorAll("[data-role]").forEach(button => button.addEventListener("click", () => openRole(button.dataset.role)));
  const closeModal = () => { if (modal) { modal.hidden = true; document.body.classList.remove("modal-open"); } };
  document.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal && !modal.hidden) closeModal(); });
  document.querySelector("#open-apply")?.addEventListener("click", () => {
    document.querySelector("#application-form").hidden = false;
    document.querySelector("#open-apply").hidden = true;
    document.querySelector("#application-form input")?.focus();
  });
  document.querySelector("#application-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const status = document.querySelector("#form-status");
    const submit = form.querySelector('button[type="submit"]');
    const file = form.elements.resume.files[0];
    status.className = "form-status";
    if (!file || file.size > 5 * 1024 * 1024 || file.type !== "application/pdf") {
      status.textContent = "Please attach a PDF resume smaller than 5 MB.";
      status.classList.add("is-warning"); return;
    }
    submit.disabled = true; submit.textContent = "Submitting…";
    try {
      const response = await fetch("/api/applications", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Unable to submit your application.");
      status.textContent = `Thank you! Your application has been received. Reference: ${result.application_id}`;
      status.classList.add("is-success"); form.reset();
    } catch (error) {
      status.textContent = error.message.includes("Failed to fetch")
        ? "Could not reach the application server. Please try again later."
        : error.message;
      status.classList.add("is-warning");
    } finally { submit.disabled = false; submit.innerHTML = 'Submit application <span>↗</span>'; }
  });
});
