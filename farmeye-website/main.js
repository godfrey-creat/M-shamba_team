(function () {
    // Navigation controls
    [...document.querySelectorAll(".nav-link")].forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            // Remove active class from current active link
            const currentActive = document.querySelector(".nav-link.active");
            if (currentActive) currentActive.classList.remove("active");
            
            // Add active class to clicked link
            this.classList.add("active");
            
            // Get the target section ID
            const targetId = this.getAttribute("href").substring(1);
            
            // Hide current active section
            const currentActiveSection = document.querySelector("section.active");
            if (currentActiveSection) currentActiveSection.classList.remove("active");
            
            // Show target section
            document.getElementById(targetId).classList.add("active");
            
            // Scroll to the section
            window.scrollTo({
                top: document.getElementById(targetId).offsetTop - 80,
                behavior: "smooth"
            });
        });
    });

    // Mobile menu toggle
    document.getElementById("mobile-menu-button").addEventListener("click", function() {
        document.getElementById("mobile-menu").classList.toggle("hidden");
    });

    // Hero background slideshow
    const heroSlides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;
    
    function showSlide(n) {
        heroSlides.forEach(slide => slide.classList.remove("active"));
        currentSlide = (n + heroSlides.length) % heroSlides.length;
        heroSlides[currentSlide].classList.add("active");
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Start slideshow
    showSlide(0);
    setInterval(nextSlide, 5000);
    
    // Carousel functionality
    function setupCarousel(carousel) {
        const inner = carousel.querySelector(".carousel-inner");
        const items = carousel.querySelectorAll(".carousel-item");
        const prevBtn = carousel.querySelector(".carousel-prev");
        const nextBtn = carousel.querySelector(".carousel-next");
        const indicators = carousel.querySelectorAll(".carousel-indicator");
        
        let currentIndex = 0;
        const itemCount = items.length;
        
        function updateCarousel() {
            inner.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update indicators
            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add("active");
                } else {
                    indicator.classList.remove("active");
                }
            });
        }
        
        function goToIndex(index) {
            currentIndex = index;
            updateCarousel();
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % itemCount;
            updateCarousel();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + itemCount) % itemCount;
            updateCarousel();
        }
        
        // Event listeners
        nextBtn.addEventListener("click", nextSlide);
        prevBtn.addEventListener("click", prevSlide);
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => goToIndex(index));
        });
        
        // Auto-advance for some carousels (optional)
        if (carousel.classList.contains("auto-advance")) {
            setInterval(nextSlide, 5000);
        }
        
        // Initialize
        updateCarousel();
    }
    
    // Initialize all carousels
    document.querySelectorAll(".carousel").forEach(setupCarousel);
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationClass = entry.target.classList.contains("animate-slide-up") ? "animate-slide-up" :
                                      entry.target.classList.contains("animate-slide-right") ? "animate-slide-right" : 
                                      "animate-fade-in";
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll(".animate-fade-in, .animate-slide-up, .animate-slide-right").forEach(el => {
        observer.observe(el);
    });

    // Back to Top Button
    const backToTopButton = document.getElementById("back-to-top");
    
    window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove("hidden");
        } else {
            backToTopButton.classList.add("hidden");
        }
    });
    
    backToTopButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Form submission handling (placeholder)
    const contactForm = document.querySelector("#contact form");
    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();
            alert("Thank you for your message! We will get back to you soon.");
            this.reset();
        });
    }

    // Newsletter subscription (placeholder)
    const newsletterForm = document.querySelector("footer form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", function(e) {
            e.preventDefault();
            alert("Thank you for subscribing to our newsletter!");
            this.reset();
        });
    }
})();