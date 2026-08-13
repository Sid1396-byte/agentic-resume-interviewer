document.addEventListener('DOMContentLoaded', () => {
    /* 1. Mouse Tracking Orb - Performance Optimized */
    const orb = document.getElementById('mouse-orb');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    if (orb) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true }); // passive listener for better scroll performance

        // Smoothly follow the mouse using requestAnimationFrame
        let orbX = mouseX;
        let orbY = mouseY;
        
        function animateOrb() {
            // Lerp (linear interpolation) for smooth, cheap following
            orbX += (mouseX - orbX) * 0.05;
            orbY += (mouseY - orbY) * 0.05;
            orb.style.transform = `translate(calc(-50% + ${orbX}px), calc(-50% + ${orbY}px))`;
            requestAnimationFrame(animateOrb);
        }
        animateOrb();
    }

    /* 2. Scroll Reveal Animations */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Fix for the flickering bug:
                // Only remove the 'active' class if the element is leaving via the BOTTOM of the viewport.
                // If it leaves via the top, removing the class makes it translate down, 
                // which puts it back in the viewport, causing an infinite flicker loop!
                if (entry.boundingClientRect.top > 0) {
                    entry.target.classList.remove('active');
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* 2.5 ATS Score Ticker */
    const scoreElement = document.getElementById('ats-score-value');
    if (scoreElement) {
        let currentScore = 0;
        const targetScore = 73;
        setInterval(() => {
            if (currentScore < targetScore) {
                currentScore += 1;
            } else {
                // Randomly fluctuate slightly or stay at 73, then loop back
                if (Math.random() > 0.95) currentScore = 0;
            }
            scoreElement.innerText = currentScore;
        }, 100); // Ticks up relatively fast
    }

    /* 3. 3D Tilt Effect */
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        // Create glare element dynamically
        const glareWrapper = document.createElement('div');
        glareWrapper.classList.add('glare-wrapper');
        const glare = document.createElement('div');
        glare.classList.add('glare');
        glareWrapper.appendChild(glare);
        card.appendChild(glareWrapper);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            // Calculate rotation (max 15 degrees)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            // Apply 3D transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Apply Glare position
            const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI - 90;
            glare.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            glare.style.opacity = 0.5;
        });

        card.addEventListener('mouseleave', () => {
            // Reset transform smoothly
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            glare.style.opacity = 0;
        });
    });
});
