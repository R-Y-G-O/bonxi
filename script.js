// Navegación suave y efectos de scroll
document.addEventListener('DOMContentLoaded', function() {
    // Navegación suave
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto de navbar al hacer scroll
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    // Animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animaciones
    const animatedElements = document.querySelectorAll('.about-card, .stat-item, .feature-item, .detail-card, .historia-main, .personal-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Menú hamburguesa para móviles
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Efectos de hover en las tarjetas
    const cards = document.querySelectorAll('.about-card, .detail-card, .feature-item, .historia-main, .personal-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Contador animado para las estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        }
        
        updateCounter();
    }

    // Observar estadísticas para animar contadores
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numberElement = entry.target;
                const targetNumber = parseInt(numberElement.textContent);
                animateCounter(numberElement, targetNumber);
                statsObserver.unobserve(numberElement);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Efectos de partículas flotantes (hojas cayendo o gotas de sangre)
    let leafInterval;
    let isLeafEffectActive = false;
    let vampireActive = false;
    const vampireToggle = document.getElementById('vampire-theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const navbarIcon = document.getElementById('navbar-icon');

    function createLeafOrDrop() {
        const el = document.createElement('div');
        if (vampireActive) {
            el.className = 'falling-drop';
            el.textContent = '🩸';
            el.style.cssText = `
                position: fixed;
                font-size: 2rem;
                pointer-events: none;
                z-index: 1;
                opacity: 0.8;
                animation: drop-slide 8s linear;
                left: ${Math.random() * window.innerWidth}px;
                top: -50px;
            `;
        } else {
            el.className = 'falling-leaf';
            el.innerHTML = '<i class="fas fa-leaf"></i>';
            el.style.cssText = `
                position: fixed;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 1;
                opacity: 0.7;
                animation: fall 8s linear infinite;
                color: var(--primary-green);
                left: ${Math.random() * window.innerWidth}px;
                top: -50px;
                animation-delay: ${Math.random() * 5}s;
                animation-duration: ${(Math.random() * 3 + 5)}s;
            `;
        }
        document.body.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) {
                el.remove();
            }
        }, 10000);
    }

    function startLeafEffect() {
        if (!isLeafEffectActive) {
            isLeafEffectActive = true;
            leafInterval = setInterval(createLeafOrDrop, 800);
        }
    }

    function stopLeafEffect() {
        if (isLeafEffectActive) {
            isLeafEffectActive = false;
            clearInterval(leafInterval);
        }
    }

    // Controlar el efecto de partículas basado en el scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 100) {
            startLeafEffect();
        } else {
            stopLeafEffect();
        }
    });

    function showBloodEffect() {
        let blood = document.createElement('div');
        blood.id = 'blood-effect';
        blood.style.position = 'fixed';
        blood.style.top = '70px';
        blood.style.left = '0';
        blood.style.width = '100vw';
        blood.style.height = '100vh';
        blood.style.pointerEvents = 'none';
        blood.style.zIndex = '1000';
        blood.style.background = 'url("imagenes/sangre.png") repeat-x top center';
        blood.style.backgroundSize = 'contain';
        blood.style.animation = 'blood-drip 1.2s ease';
        document.body.appendChild(blood);
        setTimeout(() => {
            if (blood) blood.style.opacity = '0';
        }, 1000);
        setTimeout(() => {
            if (blood && blood.parentNode) blood.parentNode.removeChild(blood);
        }, 1500);
    }

    function removeBloodEffect() {
        const blood = document.getElementById('blood-effect');
        if (blood) blood.parentNode.removeChild(blood);
    }

    function showLianasEffect() {
        // Eliminar cualquier lianas-effect existente
        const prevLianas = document.getElementById('lianas-effect');
        if (prevLianas && prevLianas.parentNode) prevLianas.parentNode.removeChild(prevLianas);
        let lianas = document.createElement('div');
        lianas.id = 'lianas-effect';
        lianas.style.position = 'fixed';
        lianas.style.bottom = '0';
        lianas.style.left = '0';
        lianas.style.width = '100vw';
        lianas.style.height = '100vh';
        lianas.style.pointerEvents = 'none';
        lianas.style.zIndex = '1000';
        lianas.style.background = 'url("imagenes/lianas.png") no-repeat bottom center';
        lianas.style.backgroundSize = 'contain';
        lianas.style.animation = 'lianas-grow 2.5s ease';
        document.body.appendChild(lianas);
        setTimeout(() => {
            if (lianas) lianas.style.opacity = '0';
        }, 1000);
        setTimeout(() => {
            if (lianas && lianas.parentNode) lianas.parentNode.removeChild(lianas);
        }, 1500);
    }

    if (vampireToggle && moonIcon) {
        vampireToggle.addEventListener('click', function() {
            vampireActive = !vampireActive;
            document.body.classList.toggle('vampire-theme', vampireActive);
            // Cambiar icono del botón de tema
            if (moonIcon) {
                if (vampireActive) {
                    moonIcon.classList.remove('fa-moon');
                    moonIcon.classList.add('fa-sun');
                    moonIcon.style.color = '#fff';
                } else {
                    moonIcon.classList.remove('fa-sun');
                    moonIcon.classList.add('fa-moon');
                    moonIcon.style.color = '#b3001b';
                }
            }
            // Cambiar icono del navbar
            if (navbarIcon) {
                if (vampireActive) {
                    navbarIcon.classList.remove('fa-leaf');
                    navbarIcon.classList.add('fa-moon');
                } else {
                    navbarIcon.classList.remove('fa-moon');
                    navbarIcon.classList.add('fa-leaf');
                }
            }
            // Reiniciar partículas
            stopLeafEffect();
            setTimeout(() => { if (window.pageYOffset > 100) startLeafEffect(); }, 100);
            // Cambiar iconos flotantes
            updateFloatingIcons();
            // Efecto sangre visual
            if (vampireActive) {
                showBloodEffect();
            } else {
                removeBloodEffect();
                showLianasEffect();
            }
        });
    }

    // Efectos de typing para el título
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 500);
    }

    // Formulario de contacto
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.textContent = '¡Mensaje Enviado!';
                submitBtn.style.background = '#22c55e';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }

    // Efectos de sonido (opcional)
    function playHoverSound() {
        // Crear un audio context para efectos de sonido
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Agregar efectos de sonido a botones (comentado por defecto)
    /*
    const buttons = document.querySelectorAll('.btn, .social-link');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', playHoverSound);
    });
    */

    // Efectos de parallax suave
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-elements');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Preloader (opcional)
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });

    // Efectos de vibración en dispositivos móviles
    function vibrateOnClick() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    const clickableElements = document.querySelectorAll('.btn, .social-link, .nav-menu a');
    clickableElements.forEach(element => {
        element.addEventListener('click', vibrateOnClick);
    });

    // Control del video del modelo
    function toggleVideo() {
        const video = document.querySelector('.model-video');
        const playButton = document.querySelector('.play-button');
        const overlay = document.querySelector('.model-overlay');
        
        if (video.paused) {
            video.play();
            video.classList.add('playing');
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            overlay.style.opacity = '0';
        } else {
            video.pause();
            video.classList.remove('playing');
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // Hacer la función global para que funcione el onclick
    window.toggleVideo = toggleVideo;

    // Control del video con clic en el contenedor
    const modelContainer = document.querySelector('.model-container');
    if (modelContainer) {
        modelContainer.addEventListener('click', function(e) {
            if (e.target !== this.querySelector('.play-button')) {
                toggleVideo();
            }
        });
    }

    // Cambiar floating-elements según la temática
    const floatingElements = document.querySelectorAll('.floating-element');
    const floatingIconsNormal = ['🌸', '🍃'];
    const floatingIconsVampire = ['🩸', '🩸'];

    function updateFloatingIcons() {
        if (floatingElements.length >= 2) {
            if (vampireActive) {
                floatingElements[0].textContent = floatingIconsVampire[0];
                floatingElements[1].textContent = floatingIconsVampire[1];
            } else {
                floatingElements[0].textContent = floatingIconsNormal[0];
                floatingElements[1].textContent = floatingIconsNormal[1];
            }
        }
    }

    // Inicializar al cargar
    updateFloatingIcons();

    console.log('🎮 Xiaruno VTuber Page - ¡Cargada con éxito! 🌱');
}); 