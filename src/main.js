
import './robot.js';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';
import { sounds } from './audio.js';

// ==========================================================================
// 1. Lenis Smooth Scroll Initialization
// ==========================================================================
let lenis;
try {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
} catch (e) {
  console.warn('Lenis smooth scroll fallback to standard scroll:', e);
}

// ==========================================================================
// 2. Scroll Progress Bar & Header State
// ==========================================================================
const scrollProgressBar = document.getElementById('scrollProgressBar');
const siteHeader = document.getElementById('siteHeader');
const heroPortrait = document.getElementById('heroPortrait');
const timelineTrackFill = document.getElementById('timelineTrackFill');
const timelineContainer = document.getElementById('timelineContainer');

function handleScroll() {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

  // Update progress bar
  if (scrollProgressBar) {
    scrollProgressBar.style.width = `${scrollPercent}%`;
  }

  // Header blur background
  if (siteHeader) {
    if (scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  // Hero developer portrait parallax
  if (heroPortrait && scrollY < window.innerHeight) {
    const parallaxY = scrollY * 0.14;
    heroPortrait.style.transform = `translateY(${parallaxY}px)`;
  }

  // Career timeline line fill
  if (timelineContainer && timelineTrackFill) {
    const rect = timelineContainer.getBoundingClientRect();
    const windowH = window.innerHeight;
    if (rect.top < windowH && rect.bottom > 0) {
      const totalH = rect.height;
      const visibleScrolled = Math.max(0, windowH * 0.6 - rect.top);
      const fillPercent = Math.min(100, (visibleScrolled / totalH) * 100);
      timelineTrackFill.style.height = `${fillPercent}%`;
    }
  }

  // Active navigation highlight
  updateActiveNavLink();
}

window.addEventListener('scroll', handleScroll, { passive: true });

// ==========================================================================
// 3. Hero 3D Tilt on Mouse Move
// ==========================================================================
const developerFrame = document.getElementById('developerFrame');
if (developerFrame) {
  developerFrame.addEventListener('mousemove', (e) => {
    const rect = developerFrame.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / rect.height) * 12;
    const rotY = (x / rect.width) * 12;

    if (heroPortrait) {
      heroPortrait.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    }
  });

  developerFrame.addEventListener('mouseleave', () => {
    if (heroPortrait) {
      heroPortrait.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
  });
}

// ==========================================================================
// 4. Scroll-Triggered Reveal Animations (IntersectionObserver)
// ==========================================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  }
);

document.querySelectorAll('.reveal-fade').forEach((el) => {
  revealObserver.observe(el);
});

// ==========================================================================
// 5. Stat Counter Animation
// ==========================================================================
let statsCounted = false;
const statsSection = document.getElementById('aboutStatsContainer');

function animateCounters() {
  if (statsCounted) return;
  statsCounted = true;

  const counters = document.querySelectorAll('.stat-number');
  counters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute('data-target') || '0');
    const suffix = counter.getAttribute('data-suffix') || '';
    const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
    const duration = 2000;
    const startTime = performance.now();

    function updateNumber(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * ease;

      counter.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        counter.textContent = target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(updateNumber);
  });
}

if (statsSection) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
      }
    },
    { threshold: 0.25 }
  );
  statsObserver.observe(statsSection);
}

// ==========================================================================
// 6. Skill Proficiency Fill Bars on View
// ==========================================================================
const skillsSection = document.getElementById('skills');
let skillsAnimated = false;

function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.skill-bar-fill').forEach((bar) => {
    const targetWidth = bar.getAttribute('data-level') || '85';
    bar.style.width = `${targetWidth}%`;
  });
}

if (skillsSection) {
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateSkillBars();
      }
    },
    { threshold: 0.15 }
  );
  skillsObserver.observe(skillsSection);
}

// ==========================================================================
// 7. Skills Carousel & Category Filtering
// ==========================================================================
const skillsTrack = document.getElementById('skillsTrack');
const arrowPrev = document.getElementById('skillArrowPrev');
const arrowNext = document.getElementById('skillArrowNext');

if (arrowNext && skillsTrack) {
  arrowNext.addEventListener('click', () => {
    sounds.playClick();
    skillsTrack.scrollBy({ left: 320, behavior: 'smooth' });
  });
}

if (arrowPrev && skillsTrack) {
  arrowPrev.addEventListener('click', () => {
    sounds.playClick();
    skillsTrack.scrollBy({ left: -320, behavior: 'smooth' });
  });
}

// Skill Tab Filters
const skillTabs = document.querySelectorAll('.skill-tab-btn');
skillTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    sounds.playClick();
    skillTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    const category = tab.getAttribute('data-category');
    document.querySelectorAll('.skill-card').forEach((card) => {
      if (category === 'all' || card.getAttribute('data-cat') === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ==========================================================================
// 8. Portfolio Projects Filtering
// ==========================================================================
const projectFilterBtns = document.querySelectorAll('.filter-btn');
projectFilterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    sounds.playClick();
    projectFilterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach((card) => {
      const cardCat = card.getAttribute('data-category');
      if (cat === 'all' || cardCat.includes(cat)) {
        card.style.display = 'flex';
        card.classList.add('is-revealed');
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ==========================================================================
// 9. Interactive Modals (Real Project Case Studies)
// ==========================================================================
const projectModal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');

const projectData = {
  gym: {
    title: 'Gym Management Platform',
    role: 'Freelance Software Developer',
    stack: 'React, Java, PHP, ASP.NET, MySQL',
    summary: 'Full-stack gym platform built with React, Java, PHP, ASP.NET and MySQL, centralizing the core daily operations of a gym.',
    challenges: ['Built with React, Java, PHP, ASP.NET and MySQL.', 'Centralizes the core daily operations of a gym in a single platform.', 'Delivered as part of 6 freelance applications supporting web and desktop business workflows.'],
    metrics: ['Full-Stack', 'Daily Operations'],
  },
  restaurant: {
    title: 'Restaurant CMS Dashboard',
    role: 'Freelance Software Developer',
    stack: 'Web CMS',
    summary: 'Restaurant content-management dashboard for menus, orders and customers, unifying all key management functions in one place.',
    challenges: ['Created a dashboard for managing menus, orders and customers.', 'Unified all key restaurant management functions in one interface.', 'Role-based permissions restrict accounts to authorized features.'],
    metrics: ['CMS', 'Menus • Orders • Customers'],
  },
  hospital: {
    title: 'Hospital Management App',
    role: 'Freelance Software Developer',
    stack: 'Java, Java Swing',
    summary: 'Java Swing desktop application managing appointments, billing, inventory and patient records for multiple users.',
    challenges: ['Built with Java Swing as a desktop application.', 'Manages appointments, billing, inventory and patient records.', 'Supports multiple users working at the same time.'],
    metrics: ['Desktop App', 'Multi-User'],
  },
  repository: {
    title: 'Academic Project Repository',
    role: 'Freelance Software Developer',
    stack: 'ASP.NET MVC, C#, SQL Server',
    summary: 'ASP.NET MVC repository where students upload, search and download academic projects.',
    challenges: ['Engineered with ASP.NET MVC.', 'Students can upload, search and download academic projects.', 'Uses SQL Server for reliable data storage and efficient queries.'],
    metrics: ['ASP.NET MVC', 'Upload • Search • Download'],
  },
  movies: {
    title: 'Movie Library',
    role: 'Freelance Software Developer',
    stack: 'React, REST API',
    summary: 'Responsive React movie library where users search, browse titles and view movie details.',
    challenges: ['Built with React as a responsive interface.', 'Users can search, browse titles and view movie details.'],
    metrics: ['Responsive UI', 'Search & Browse'],
  },
  books: {
    title: 'Book Search App',
    role: 'Freelance Software Developer',
    stack: 'React, Book API, Memoization',
    summary: 'React book search that uses memoization to cut redundant book API calls, improving search speed and responsiveness.',
    challenges: ['Built in React on top of a book API.', 'Applied memoization to reduce redundant API calls.', 'Improved search speed and responsiveness.'],
    metrics: ['Memoization', 'Fewer API Calls'],
  },
};

document.querySelectorAll('.open-case-study').forEach((btn) => {
  btn.addEventListener('click', () => {
    sounds.playClick();
    const pid = btn.getAttribute('data-project');
    const p = projectData[pid];
    if (!p) return;

    modalTitle.textContent = p.title;
    modalBody.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="tech-tag" style="font-size: 0.82rem;">${p.role}</span>
        <p style="font-size: 0.88rem; color: #94a3b8; margin-top: 0.5rem;"><strong>Tech Stack:</strong> ${p.stack}</p>
      </div>
      <p style="font-size: 0.98rem; line-height: 1.7; color: #e2e8f0; margin-bottom: 1.5rem;">${p.summary}</p>
      <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.85rem;">Key Highlights:</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
        ${p.challenges.map((c) => `<li style="position: relative; padding-left: 1.4rem; color: #94a3b8; font-size: 0.92rem;"><span style="position: absolute; left: 0; color: #38bdf8;">✔</span> ${c}</li>`).join('')}
      </ul>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem;">
        ${p.metrics.map((m) => `<div style="background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.3); border-radius: 8px; padding: 0.5rem 1rem; color: #60a5fa; font-size: 0.88rem; font-weight: 700;">${m}</div>`).join('')}
      </div>
    `;

    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

// "More About Me" Modal
const aboutModalBtn = document.getElementById('moreAboutBtn');
const aboutManifestoModal = document.getElementById('aboutManifestoModal');
const aboutModalCloseBtn = document.getElementById('aboutModalCloseBtn');

if (aboutModalBtn && aboutManifestoModal) {
  aboutModalBtn.addEventListener('click', () => {
    sounds.playClick();
    aboutManifestoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

function closeModal(modal) {
  sounds.playClick();
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalCloseBtn && projectModal) {
  modalCloseBtn.addEventListener('click', () => closeModal(projectModal));
}
if (aboutModalCloseBtn && aboutManifestoModal) {
  aboutModalCloseBtn.addEventListener('click', () => closeModal(aboutManifestoModal));
}

// Close modal on backdrop click
[projectModal, aboutManifestoModal].forEach((modal) => {
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  }
});

// Close modal on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (projectModal && projectModal.classList.contains('open')) closeModal(projectModal);
    if (aboutManifestoModal && aboutManifestoModal.classList.contains('open')) closeModal(aboutManifestoModal);
  }
});

// ==========================================================================
// 10. Sound Toggle Button
// ==========================================================================
const soundToggleBtn = document.getElementById('soundToggleBtn');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    const isNowOn = sounds.toggle();
    if (isNowOn) {
      soundToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      soundToggleBtn.title = 'Sound On';
      sounds.playSuccess();
      showToast('Sound effects enabled 🔊');
    } else {
      soundToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      soundToggleBtn.title = 'Sound Muted';
      showToast('Sound effects muted 🔇');
    }
  });
}

// ==========================================================================
// 11. Toast Notifications
// ==========================================================================
const toastContainer = document.getElementById('toastContainer');
function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Copy Email Button
const copyEmailBtn = document.getElementById('copyEmailBtn');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', () => {
    sounds.playClick();
    const email = 'jawad.haidar.2019@hotmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Copied: jawad.haidar.2019@hotmail.com');
    });
  });
}

// Copy Phone Button
const copyPhoneBtn = document.getElementById('copyPhoneBtn');
if (copyPhoneBtn) {
  copyPhoneBtn.addEventListener('click', () => {
    sounds.playClick();
    const phone = '+961 81 030 749';
    navigator.clipboard.writeText(phone).then(() => {
      showToast('Copied: +961 81 030 749');
    });
  });
}

// ==========================================================================
// 12. Contact Form Submission & Confetti Celebration
// ==========================================================================
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('contactSubmitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    sounds.playClick();

    const name = document.getElementById('contactName')?.value || '';
    const email = document.getElementById('contactEmail')?.value || '';
    const subject = document.getElementById('contactSubject')?.value || 'General Inquiry';
    const budget = document.getElementById('contactBudget')?.value || 'Remote';
    const message = document.getElementById('contactMessage')?.value || '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Sending your message...</span>
      `;
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/jawad.haidar.2019@hotmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          opportunity_type: subject,
          work_arrangement: budget,
          message: message,
          _subject: `New Portfolio Message from ${name} (${subject})`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        sounds.playSuccess();
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ffffff'],
        });

        showToast('Message sent directly to jawad.haidar.2019@hotmail.com! ✉️');
        contactForm.reset();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback to mailto:', err);
      // Fallback: trigger mailto with details prefilled
      const mailtoUrl = `mailto:jawad.haidar.2019@hotmail.com?subject=${encodeURIComponent(
        'Portfolio Inquiry: ' + subject + ' from ' + name
      )}&body=${encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nOpportunity: ' + subject + '\nWork Arrangement: ' + budget + '\n\nMessage:\n' + message
      )}`;
      window.open(mailtoUrl, '_blank');
      showToast('Opening email app to send to jawad.haidar.2019@hotmail.com! ✉️');
      contactForm.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Send Message</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        `;
      }
    }
  });
}

// Add CSS keyframe for spinner
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ==========================================================================
// 13. Custom Interactive Cursor Follower
// ==========================================================================
const cursor = document.getElementById('customCursor');
const cursorFollower = document.getElementById('customCursorFollower');

if (cursor && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .project-card, .skill-card, .brand-badge');
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('custom-cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('custom-cursor-hover'));
  });
}

// ==========================================================================
// 14. Smooth Scroll Anchor Navigation
// ==========================================================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || !targetId) return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      sounds.playClick();
      if (lenis) {
        lenis.scrollTo(targetEl, { offset: -60 });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }

      const mobileNav = document.getElementById('mobileNavDrawer');
      if (mobileNav && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
      }
    }
  });
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTopBtn');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    sounds.playClick();
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Active Nav Link Observer
function updateActiveNavLink() {
  const sections = ['home', 'about', 'skills', 'portfolio', 'timeline', 'architecture', 'contact'];
  const scrollPosition = window.scrollY + 150;

  for (const id of sections) {
    const el = document.getElementById(id);
    if (el) {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        break;
      }
    }
  }
}

// Mobile Menu Drawer Toggle
const mobileToggle = document.getElementById('mobileToggle');
const mobileNavDrawer = document.getElementById('mobileNavDrawer');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');

if (mobileToggle && mobileNavDrawer) {
  mobileToggle.addEventListener('click', () => {
    sounds.playClick();
    mobileNavDrawer.classList.toggle('open');
  });
}
if (mobileCloseBtn && mobileNavDrawer) {
  mobileCloseBtn.addEventListener('click', () => {
    sounds.playClick();
    mobileNavDrawer.classList.remove('open');
  });
}

console.log('✨ Full-Stack Portfolio initialized with scroll-based animations!');
