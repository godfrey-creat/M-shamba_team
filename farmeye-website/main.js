// Wait for the DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
  // --- Navigation Menu Functionality ---
  initMobileNavigation();
  
  // --- Smooth Scrolling for Navigation Links ---
  initSmoothScrolling();
  
  // --- Form Validation ---
  initFormValidation();
  
  // --- Animate elements when they come into view ---
  initScrollAnimations();
  
  // --- Initialize any sliders or carousels ---
  initSliders();
  
  // --- Initialize Hero Image Carousel ---
  initHeroCarousel();
  
  // --- Handle modal popups if any ---
  initModalPopups();
});

/**
* Mobile Navigation Functionality
* Toggles mobile menu and handles responsive behavior
*/
function initMobileNavigation() {
  const nav = document.querySelector('nav');
  const navMenu = document.querySelector('.nav-menu');
  
  // Create hamburger menu button for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(hamburger);
  
  // Toggle menu when hamburger is clicked
  hamburger.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
  });
  
  // Close menu when clicking on a link
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
      link.addEventListener('click', function() {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
      });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
      if (!nav.contains(event.target)) {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
      }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
      }
  });
}

/**
* Smooth Scrolling Functionality
* Makes navigation links scroll smoothly to their sections
*/
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
              // Calculate header height for offset
              const headerHeight = document.querySelector('header').offsetHeight;
              const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              
              window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
              });
          }
      });
  });
}

/**
* Form Validation
* Validates the contact form before submission
*/
function initFormValidation() {
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Get form inputs
          const name = document.getElementById('name');
          const email = document.getElementById('email');
          const subject = document.getElementById('subject');
          const message = document.getElementById('message');
          
          // Validate inputs
          let isValid = true;
          
          if (name.value.trim() === '') {
              showError(name, 'Name is required');
              isValid = false;
          } else {
              removeError(name);
          }
          
          if (email.value.trim() === '') {
              showError(email, 'Email is required');
              isValid = false;
          } else if (!isValidEmail(email.value)) {
              showError(email, 'Please enter a valid email');
              isValid = false;
          } else {
              removeError(email);
          }
          
          if (subject.value.trim() === '') {
              showError(subject, 'Subject is required');
              isValid = false;
          } else {
              removeError(subject);
          }
          
          if (message.value.trim() === '') {
              showError(message, 'Message is required');
              isValid = false;
          } else {
              removeError(message);
          }
          
          // If form is valid, submit or show success message
          if (isValid) {
              // In a real implementation, you would send the form data to a server
              // For now, we'll just show a success message
              showFormSuccess(contactForm);
          }
      });
  }
}

/**
* Shows an error message for a form input
*/
function showError(input, message) {
  const formGroup = input.parentElement;
  let errorElement = formGroup.querySelector('.error-message');
  
  if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      formGroup.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  formGroup.classList.add('error');
}

/**
* Removes error message from a form input
*/
function removeError(input) {
  const formGroup = input.parentElement;
  const errorElement = formGroup.querySelector('.error-message');
  
  if (errorElement) {
      formGroup.removeChild(errorElement);
  }
  
  formGroup.classList.remove('error');
}

/**
* Validates email format
*/
function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
* Shows success message after form submission
*/
function showFormSuccess(form) {
  // Create success message
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
  
  // Hide form
  form.style.display = 'none';
  
  // Add success message after form
  form.parentNode.insertBefore(successMessage, form.nextSibling);
  
  // Reset form
  form.reset();
  
  // Restore form after 5 seconds
  setTimeout(() => {
      form.style.display = 'block';
      successMessage.remove();
  }, 5000);
}

/**
* Scroll Animations
* Animates elements when they come into view
*/
function initScrollAnimations() {
  const elements = document.querySelectorAll('.solution-card, .feature, .user-card, .team-member, .sdg-item');
  
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('animate');
                  observer.unobserve(entry.target);
              }
          });
      }, {
          threshold: 0.2
      });
      
      elements.forEach(element => {
          element.classList.add('fade-in');
          observer.observe(element);
      });
  } else {
      // Fallback for browsers that don't support IntersectionObserver
      elements.forEach(element => {
          element.classList.add('animate');
      });
  }
}

/**
* Hero Image Carousel Functionality
* Manages automatic and manual sliding of hero images
*/
function initHeroCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  
  if (carousel) {
      const slides = carousel.querySelectorAll('.carousel-slide');
      const indicators = carousel.querySelectorAll('.indicator');
      const prevBtn = carousel.querySelector('.carousel-control.prev');
      const nextBtn = carousel.querySelector('.carousel-control.next');
      
      let currentSlide = 0;
      let interval;
      const autoSlideDelay = 5000; // Change slide every 5 seconds
      
      // Function to update active slide
      function updateSlide(index) {
          // Remove active class from all slides and indicators
          slides.forEach(slide => slide.classList.remove('active'));
          indicators.forEach(dot => dot.classList.remove('active'));
          
          // Add active class to current slide and indicator
          slides[index].classList.add('active');
          indicators[index].classList.add('active');
          
          // Update current slide index
          currentSlide = index;
      }
      
      // Function to go to next slide
      function nextSlide() {
          const newIndex = (currentSlide + 1) % slides.length;
          updateSlide(newIndex);
      }
      
      // Function to go to previous slide
      function prevSlide() {
          const newIndex = (currentSlide - 1 + slides.length) % slides.length;
          updateSlide(newIndex);
      }
      
      // Start automatic slideshow
      function startAutoSlide() {
          interval = setInterval(nextSlide, autoSlideDelay);
      }
      
      // Stop automatic slideshow
      function stopAutoSlide() {
          clearInterval(interval);
      }
      
      // Event listeners for manual controls
      if (nextBtn) {
          nextBtn.addEventListener('click', () => {
              stopAutoSlide();
              nextSlide();
              startAutoSlide();
          });
      }
      
      if (prevBtn) {
          prevBtn.addEventListener('click', () => {
              stopAutoSlide();
              prevSlide();
              startAutoSlide();
          });
      }
      
      // Add click events to indicators
      indicators.forEach((dot, index) => {
          dot.addEventListener('click', () => {
              stopAutoSlide();
              updateSlide(index);
              startAutoSlide();
          });
      });
      
      // Pause slideshow when hovering over carousel
      carousel.addEventListener('mouseenter', stopAutoSlide);
      carousel.addEventListener('mouseleave', startAutoSlide);
      
      // Touch events for mobile swipe
      let touchStartX = 0;
      let touchEndX = 0;
      
      carousel.addEventListener('touchstart', e => {
          touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      carousel.addEventListener('touchend', e => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
      }, { passive: true });
      
      function handleSwipe() {
          const swipeThreshold = 50; // Minimum distance to register a swipe
          
          if (touchEndX < touchStartX - swipeThreshold) {
              // Swiped left (next)
              stopAutoSlide();
              nextSlide();
              startAutoSlide();
          } else if (touchEndX > touchStartX + swipeThreshold) {
              // Swiped right (previous)
              stopAutoSlide();
              prevSlide();
              startAutoSlide();
          }
      }
      
      // Start the slideshow
      startAutoSlide();
  }
}

/**
* Initialize sliders or carousels if needed
*/
function initSliders() {
  // Could initialize testimonial sliders, etc.
  // Example implementation for a simple slider
  const sliders = document.querySelectorAll('.slider');
  
  sliders.forEach(slider => {
      if (slider) {
          const slides = slider.querySelectorAll('.slide');
          const btnNext = slider.querySelector('.next');
          const btnPrev = slider.querySelector('.prev');
          let currentSlide = 0;
          
          // Function to update slider position
          function updateSlider() {
              slides.forEach((slide, index) => {
                  slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
              });
          }
          
          // Initialize slider position
          updateSlider();
          
          // Event listeners for navigation buttons
          if (btnNext) {
              btnNext.addEventListener('click', () => {
                  currentSlide = (currentSlide + 1) % slides.length;
                  updateSlider();
              });
          }
          
          if (btnPrev) {
              btnPrev.addEventListener('click', () => {
                  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                  updateSlider();
              });
          }
      }
  });
}

/**
* Initialize modal popups
*/
function initModalPopups() {
  const modalTriggers = document.querySelectorAll('[data-modal]');
  
  modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', function(e) {
          e.preventDefault();
          
          const modalId = this.getAttribute('data-modal');
          const modal = document.getElementById(modalId);
          
          if (modal) {
              modal.classList.add('active');
              document.body.classList.add('modal-open');
              
              // Close modal when clicking on close button
              const closeButton = modal.querySelector('.close-modal');
              if (closeButton) {
                  closeButton.addEventListener('click', function() {
                      modal.classList.remove('active');
                      document.body.classList.remove('modal-open');
                  });
              }
              
              // Close modal when clicking outside the modal content
              modal.addEventListener('click', function(e) {
                  if (e.target === modal) {
                      modal.classList.remove('active');
                      document.body.classList.remove('modal-open');
                  }
              });
          }
      });
  });
}

/**
* Sticky header functionality
* Makes header stick to top when scrolling down
*/
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  
  if (window.scrollY > 100) {
      header.classList.add('sticky');
  } else {
      header.classList.remove('sticky');
  }
});

/**
* Back to top button functionality
*/
(function() {
  // Create back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.className = 'back-to-top';
  backToTopButton.innerHTML = '↑';
  document.body.appendChild(backToTopButton);
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
      } else {
          backToTopButton.classList.remove('visible');
      }
  });
  
  // Scroll to top when button is clicked
  backToTopButton.addEventListener('click', function() {
      window.scrollTo({
          top: 0,
          behavior: 'smooth'
      });
  });
})();

/**
* Counter animation for statistics
* Animates number counting up
*/
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  if (counters.length > 0) {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const counter = entry.target;
                  const target = parseInt(counter.getAttribute('data-target'));
                  const duration = 2000; // 2 seconds
                  const increment = target / (duration / 16); // Update every 16ms
                  
                  let current = 0;
                  const updateCounter = () => {
                      current += increment;
                      counter.textContent = Math.floor(current);
                      
                      if (current < target) {
                          requestAnimationFrame(updateCounter);
                      } else {
                          counter.textContent = target;
                      }
                  };
                  
                  updateCounter();
                  observer.unobserve(counter);
              }
          });
      });
      
      counters.forEach(counter => {
          observer.observe(counter);
      });
  }
}

// Initialize any additional functionality here
initCounters();