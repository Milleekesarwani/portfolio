document.addEventListener('DOMContentLoaded', () => {
  // --- Constants & State ---
  const state = {
    liked: localStorage.getItem('project_liked') === 'true',
    likeCount: 2654,
    currentLightboxIndex: 0,
    imageUrls: []
  };

  // --- DOM Elements ---
  const headerAppreciateBtn = document.getElementById('btn-header-appreciate');
  const bodyAppreciateBtn = document.getElementById('btn-body-appreciate');
  const likesCountSpan = document.getElementById('project-likes-count');
  
  const modules = document.querySelectorAll('.module');
  const images = document.querySelectorAll('.module-img');
  
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  // Gather all high-res image sources for lightbox navigation
  images.forEach((img, idx) => {
    state.imageUrls.push({
      src: img.getAttribute('data-src'),
      alt: img.getAttribute('alt') || `Portfolio page ${idx + 1}`
    });
  });

  // --- Initial Render ---
  updateAppreciationUI();

  // --- Lazy Loading (IntersectionObserver) ---
  const lazyLoadOptions = {
    root: null,
    rootMargin: '200px 0px', // start loading slightly before they enter the screen
    threshold: 0.01
  };

  const lazyLoader = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const module = entry.target;
        const img = module.querySelector('.module-img');
        
        if (img && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          
          img.addEventListener('load', () => {
            module.classList.add('loaded');
          });
          
          img.addEventListener('error', () => {
            console.error('Failed to load image:', img.src);
            module.classList.add('loaded'); // remove shimmer on error
          });
        }
        observer.unobserve(module);
      }
    });
  }, lazyLoadOptions);

  modules.forEach(module => {
    lazyLoader.observe(module);
  });

  // --- Scroll Reveal Animations ---
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    revealObserver.observe(el);
  });

  // --- Lightbox Functions ---
  function openLightbox(index) {
    state.currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNextImage() {
    state.currentLightboxIndex = (state.currentLightboxIndex + 1) % state.imageUrls.length;
    updateLightboxContent();
  }

  function showPrevImage() {
    state.currentLightboxIndex = (state.currentLightboxIndex - 1 + state.imageUrls.length) % state.imageUrls.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const item = state.imageUrls[state.currentLightboxIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
  }

  // --- Event Listeners: Lightbox ---
  images.forEach((img, index) => {
    img.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNextImage);
  lightboxPrev.addEventListener('click', showPrevImage);

  // Close lightbox on clicking background
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation for lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  // --- Appreciation (Like) Functions ---
  function toggleAppreciation() {
    state.liked = !state.liked;
    localStorage.setItem('project_liked', state.liked);
    
    updateAppreciationUI();
    
    // Add micro-animation triggering
    const activeBtn = state.liked ? 'liked' : 'unliked';
    console.log(`Project was ${activeBtn}`);
  }

  function updateAppreciationUI() {
    const currentLikes = state.liked ? state.likeCount + 1 : state.likeCount;
    
    // Update count display (format as e.g., 2.6K or exact)
    if (state.liked) {
      likesCountSpan.innerText = '2.7K';
      
      headerAppreciateBtn.classList.add('appreciated');
      headerAppreciateBtn.querySelector('span').innerText = 'Appreciated';
      
      bodyAppreciateBtn.classList.add('appreciated');
      bodyAppreciateBtn.querySelector('span').innerText = 'Appreciated';
    } else {
      likesCountSpan.innerText = '2.6K';
      
      headerAppreciateBtn.classList.remove('appreciated');
      headerAppreciateBtn.querySelector('span').innerText = 'Appreciate';
      
      bodyAppreciateBtn.classList.remove('appreciated');
      bodyAppreciateBtn.querySelector('span').innerText = 'Appreciate Project';
    }
  }

  // --- Event Listeners: Appreciation ---
  headerAppreciateBtn.addEventListener('click', toggleAppreciation);
  bodyAppreciateBtn.addEventListener('click', toggleAppreciation);
});
