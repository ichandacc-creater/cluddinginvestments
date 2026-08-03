// Safe DOM queries and small UI helpers
document.addEventListener('DOMContentLoaded', () => {
  // Hero slider (presentation-style with controls)
  const hero = document.querySelector('.hero');
  const slides = document.querySelectorAll('.hero .slides img, .hero .slides video');
  const prevBtn = document.querySelector('.hero .hero-arrow.prev');
  const nextBtn = document.querySelector('.hero .hero-arrow.next');
  const dotsContainer = document.querySelector('.hero .dots');

  if (hero && slides && slides.length) {
    let current = 0;
    const len = slides.length;
    let autoplayId = null;

    // build dots
    for (let i = 0; i < len; i++) {
      const btn = document.createElement('button');
      if (i === 0) btn.classList.add('active');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.dataset.index = i;
      dotsContainer.appendChild(btn);
    }
    const dots = dotsContainer.querySelectorAll('button');
    const heroControls = document.querySelector('.hero-controls');
    if (len <= 1) {
      if (heroControls) heroControls.style.display = 'none';
      hero.classList.add('single');
    } else {
      hero.classList.remove('single');
    }

    function deactivateSlide(idx) {
      const s = slides[idx];
      s.classList.remove('active');
      if (s.tagName === 'VIDEO') {
        try { s.pause(); s.currentTime = 0; } catch (e) {}
      }
    }
    function activateSlide(idx) {
      const s = slides[idx];
      s.classList.add('active');
      if (s.tagName === 'VIDEO') {
        s.muted = true;
        s.playsInline = true;
        s.loop = true;
        s.play().catch(() => {});
      }
    }

    function goTo(index) {
      if (index === current) return;
      deactivateSlide(current);
      dots[current].classList.remove('active');
      current = (index + len) % len;
      activateSlide(current);
      dots[current].classList.add('active');
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // autoplay
    function startAutoplay(){
      if (len <= 1) return; // no autoplay for single slide
      stopAutoplay();
      autoplayId = setInterval(next, 6000);
    }
    function stopAutoplay(){ if (autoplayId) { clearInterval(autoplayId); autoplayId = null; } }

    // attach events
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
    dots.forEach(d => d.addEventListener('click', (e) => { const idx = Number(e.currentTarget.dataset.index); goTo(idx); startAutoplay(); }));

    // pause on hover / resume on leave
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);

    // keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
      if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });

    // initialize: ensure first slide active and play if it's a video
    slides.forEach((s, i) => {
      if (i !== 0) s.classList.remove('active');
      else { s.classList.add('active'); if (s.tagName === 'VIDEO') { s.muted = true; s.playsInline = true; s.loop = true; s.play().catch(()=>{}); } }
    });

    // start
    startAutoplay();

    // Quick hero popup: ensure the hero-card doesn't stay visible longer than 1.5s
    (function(){
      const heroCard = document.querySelector('.hero .hero-card');
      if (!heroCard) return;
      // hide after 1500ms (1.5 seconds)
      setTimeout(() => heroCard.classList.add('hidden-short'), 1500);
    })();
  }

  // Thumbnail gallery interactions (project pages) - now opens lightbox instead of just changing main image
  document.querySelectorAll('.project-card .thumbs a:not(.video-thumb)').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent navigation to nsobe.html
      const img = link.querySelector('img');
      if (img) {
        const projectCard = link.closest('.project-card');
        const fullSrc = img.getAttribute('data-full') || img.src;
        // Trigger the lightbox opening logic
        const event = new CustomEvent('thumbnailClick', { detail: { projectCard, src: fullSrc } });
        document.dispatchEvent(event);
      }
    });
  });

  // NSOBE project page: initial image and lightbox
  (function(){
    const nsobeMain = document.getElementById('nsobe-main');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (nsobeMain) {
      const params = new URLSearchParams(window.location.search);
      const img = params.get('img');
      if (img) nsobeMain.src = decodeURIComponent(img);

      // clicking main image opens lightbox
      nsobeMain.addEventListener('click', () => {
        if (lightbox && lightboxImg) { lightboxImg.src = nsobeMain.src; lightbox.classList.remove('hidden'); }
      });

      // wire thumbnails on nsobe page (if present) to change main image without navigating
      const nsobeThumbs = document.querySelectorAll('#nsobe-page .thumbs img');
      nsobeThumbs.forEach(t => t.addEventListener('click', (e)=>{
        const src = e.currentTarget.dataset.full || e.currentTarget.src;
        nsobeMain.src = src;
        nsobeThumbs.forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
      }));
    }

    // Global lightbox handlers (for decorative images and general use)
    if (lightbox && lightboxImg) {
      // close with ESC
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.add('hidden'); });
      // click outside the image closes
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.add('hidden'); });
      // close button
      const closeBtn = document.querySelector('.lightbox .close');
      if (closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.add('hidden'));

      // open lightbox for decorative images on index
      document.querySelectorAll('.decor-img').forEach(img => {
        img.addEventListener('click', () => {
          lightboxImg.src = img.src;
          lightbox.classList.remove('hidden');
        });
      });

      // open lightbox for main project images on projects page
      document.querySelectorAll('.project-card > img').forEach(img => {
        img.addEventListener('click', () => {
          lightboxImg.src = img.src;
          lightbox.classList.remove('hidden');
        });
      });
    }
  })();

  // Mobile navigation toggle with improved reliability
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  const mobileOverlay = document.createElement('div');
  mobileOverlay.className = 'mobile-overlay';
  document.body.appendChild(mobileOverlay);

  // Show/hide nav toggle based on screen size
  function updateNavToggleVisibility() {
    if (navToggle) {
      if (window.innerWidth < 1025) {
        navToggle.style.display = 'flex';
      } else {
        navToggle.style.display = 'none';
      }
    }
  }

  // Initial check
  updateNavToggleVisibility();

  // Update on resize
  window.addEventListener('resize', updateNavToggleVisibility);

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.contains('mobile-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when a nav link is clicked (mobile)
    siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth < 1025) {
        closeMobileMenu();
      }
    }));

    // Close menu when clicking overlay
    mobileOverlay.addEventListener('click', closeMobileMenu);

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    siteNav.classList.add('mobile-open');
    navToggle.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeMobileMenu() {
    siteNav.classList.remove('mobile-open');
    navToggle.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Smooth scroll for internal anchors
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Gallery functionality for nsobe.html
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryLightbox = document.getElementById('gallery-lightbox');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCaption = document.querySelector('.lightbox-caption');

  if (galleryGrid) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentLightboxIndex = 0;

    // Gallery filtering
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterValue = btn.dataset.filter;
        
        // Update active button
        galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter gallery items
        galleryItems.forEach(item => {
          if (filterValue === 'all' || item.dataset.filter === filterValue) {
            item.classList.add('visible');
            setTimeout(() => item.style.display = 'block', 10);
          } else {
            item.classList.remove('visible');
            item.style.display = 'none';
          }
        });
      });
    });

    // Show all items on load
    galleryItems.forEach(item => item.classList.add('visible'));

    // Gallery lightbox functionality
    function openLightbox(index) {
      const visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
      if (visibleItems.length === 0) return;
      
      currentLightboxIndex = index;
      const item = visibleItems[index];
      const isVideo = item.dataset.filter === 'video';
      const caption = item.querySelector('.gallery-caption').textContent;
      
      if (isVideo) {
        const videoSrc = item.querySelector('video source').src;
        lightboxImg.classList.add('hidden');
        lightboxVideo.classList.remove('hidden');
        lightboxVideo.src = videoSrc;
      } else {
        const imgSrc = item.querySelector('.gallery-img').src;
        lightboxVideo.classList.add('hidden');
        lightboxImg.classList.remove('hidden');
        lightboxImg.src = imgSrc;
      }
      
      lightboxCaption.textContent = caption;
      galleryLightbox.classList.remove('hidden');
    }

    function closeLightbox() {
      galleryLightbox.classList.add('hidden');
      lightboxVideo.pause();
    }

    function nextSlide() {
      const visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
      currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
      openLightbox(currentLightboxIndex);
    }

    function prevSlide() {
      const visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
      currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
      openLightbox(currentLightboxIndex);
    }

    // Add click handlers to all gallery items
    galleryItems.forEach((item, index) => {
      item.querySelector('.gallery-btn').addEventListener('click', () => {
        const visibleItems = Array.from(galleryItems).filter(i => i.style.display !== 'none');
        const visibleIndex = visibleItems.indexOf(item);
        openLightbox(visibleIndex);
      });
    });

    // Lightbox controls
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevSlide);
    if (lightboxNext) lightboxNext.addEventListener('click', nextSlide);
    
    // Close lightbox on background click
    galleryLightbox.addEventListener('click', (e) => {
      if (e.target === galleryLightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (galleryLightbox.classList.contains('hidden')) return;
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // Projects lightbox with navigation (click image to view full, use arrows to navigate)
  (function() {
    const projectsLightbox = document.getElementById('projects-lightbox');
    const lightboxImg = document.getElementById('projects-lightbox-img');
    const lightboxClose = document.querySelector('#projects-lightbox .lightbox-close');
    const lightboxPrev = document.querySelector('#projects-lightbox .lightbox-prev');
    const lightboxNext = document.querySelector('#projects-lightbox .lightbox-next');
    const lightboxCaption = document.querySelector('#projects-lightbox .lightbox-caption');
    
    if (!projectsLightbox) return;
    
    let currentProjectCard = null;
    let currentImageIndex = 0;
    let currentImages = [];
    
    // Make project main images clickable
    document.querySelectorAll('.project-main').forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        e.preventDefault();
        openProjectLightbox(img.closest('.project-card'), img.src);
      });
    });

    // Listen for thumbnail clicks
    document.addEventListener('thumbnailClick', (e) => {
      const { projectCard, src } = e.detail;
      openProjectLightbox(projectCard, src);
    });

    function openProjectLightbox(projectCard, clickedSrc) {
      currentProjectCard = projectCard;
      if (!currentProjectCard) return;
      
      // Get all thumbnails from this project card
      const thumbnails = currentProjectCard.querySelectorAll('.thumbs a:not(.video-thumb) img');
      currentImages = Array.from(thumbnails).map(thumb => ({
        src: thumb.getAttribute('data-full') || thumb.src,
        alt: thumb.alt
      }));
      
      if (currentImages.length === 0) return;
      
      // Find current image index
      currentImageIndex = currentImages.findIndex(item => 
        item.src === clickedSrc || item.src.endsWith(clickedSrc.split('/').pop())
      );
      if (currentImageIndex === -1) currentImageIndex = 0;
      
      // Show lightbox with current image
      showLightboxImage(currentImageIndex);
      projectsLightbox.classList.remove('hidden');
      projectsLightbox.setAttribute('aria-hidden', 'false');
    }
    
    function showLightboxImage(index) {
      if (currentImages.length === 0) return;
      
      // Wrap around
      index = (index % currentImages.length + currentImages.length) % currentImages.length;
      currentImageIndex = index;
      
      const image = currentImages[index];
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
      
      // Update caption with image number
      if (lightboxCaption) {
        lightboxCaption.textContent = `Image ${index + 1} of ${currentImages.length}`;
      }
    }
    
    // Close lightbox
    function closeLightbox() {
      projectsLightbox.classList.add('hidden');
      projectsLightbox.setAttribute('aria-hidden', 'true');
    }
    
    // Navigation buttons
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showLightboxImage(currentImageIndex - 1);
      });
    }
    
    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showLightboxImage(currentImageIndex + 1);
      });
    }
    
    // Close button
    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Keyboard navigation (arrow keys and escape)
    document.addEventListener('keydown', (e) => {
      if (projectsLightbox.classList.contains('hidden')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightboxImage(currentImageIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentImageIndex + 1);
    });
    
    // Click outside to close
    projectsLightbox.addEventListener('click', (e) => {
      if (e.target === projectsLightbox) closeLightbox();
    });
    
    // Swipe support
    let touchStartX = 0;
    projectsLightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    projectsLightbox.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const swipeThreshold = 50;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swiped left - next image
          showLightboxImage(currentImageIndex + 1);
        } else {
          // Swiped right - previous image
          showLightboxImage(currentImageIndex - 1);
        }
      }
    }, false);
  })();
  const revealElements = document.querySelectorAll('.project-card, .about-preview, .contact-preview, .decor-img, .feature, .preview-grid .project-card, .gallery-item');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  revealElements.forEach(el => revealObserver.observe(el));

  // Project filter functionality
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterValue = btn.dataset.filter;
        
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter projects
        projectCards.forEach(card => {
          if (filterValue === 'all' || card.dataset.category.includes(filterValue)) {
            card.style.display = 'inline-block';
            card.style.animation = 'fadeIn 0.4s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
  revealElements.forEach(el => revealObserver.observe(el));

  // WhatsApp pulse (if present)
  const whatsappBtn = document.querySelector('.whatsapp-btn');
  if (whatsappBtn) {
    setInterval(() => whatsappBtn.classList.toggle('pulse'), 1500);
  }

  // Contact form handling (client-side only)
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // basic validation using classes
      const fields = [contactForm.name, contactForm.email, contactForm.message];
      let hasError = false;
      fields.forEach(f => {
        if (!f.value.trim()) { f.classList.add('input-error'); hasError = true; }
        else { f.classList.remove('input-error'); }
      });
      // simple email check
      const email = contactForm.email.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        contactForm.email.classList.add('input-error'); hasError = true;
      }
      if (hasError) return;

      // simulate successful submission
      contactForm.reset();
      fields.forEach(f => f.classList.remove('input-error'));
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        setTimeout(() => formSuccess.classList.add('hidden'), 6000);
      }
    });
  }

  // 3D Mouse Tracking Effects
  const cards = document.querySelectorAll('.feature, .project-card, .section-card');
  const hero = document.querySelector('.hero');

  function handleMouseMove(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 12;
    const rotateY = (centerX - x) / 12;
    const scale = 1.05;

    this.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    this.style.boxShadow = `0 25px 60px rgba(0, 212, 255, 0.25)`;
  }

  function handleMouseLeave() {
    this.style.transform = '';
    this.style.boxShadow = '';
  }

  cards.forEach(card => {
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
  });

  // Hero 3D parallax effect with enhanced particles
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const moveX = (x - centerX) / 60;
      const moveY = (y - centerY) / 60;

      const cubes = hero.querySelectorAll('.floating-cube');
      const particles = hero.querySelectorAll('.particle');

      cubes.forEach((cube, index) => {
        const speed = (index + 1) * 0.8;
        cube.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px) rotateY(${moveX * 0.5}deg)`;
      });

      particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.3;
        particle.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px) scale(${1 + Math.abs(moveX) * 0.01})`;
        particle.style.opacity = 0.5 + Math.abs(moveX) * 0.01;
      });
    });

    hero.addEventListener('mouseleave', () => {
      const cubes = hero.querySelectorAll('.floating-cube');
      const particles = hero.querySelectorAll('.particle');

      cubes.forEach(cube => {
        cube.style.transform = '';
      });

      particles.forEach(particle => {
        particle.style.transform = '';
        particle.style.opacity = '';
      });
    });
  }

  // FAQ Accordion functionality
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    if (!header || !content) return;
    header.setAttribute('type', 'button');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      accordionItems.forEach(other => {
        const otherContent = other.querySelector('.accordion-content');
        other.classList.remove('active');
        if (otherContent) {
          otherContent.style.maxHeight = null;
        }
      });
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
});
