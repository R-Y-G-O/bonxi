document.addEventListener('DOMContentLoaded', () => {
    // Variables para el manejo de términos y condiciones
    let hasAcceptedTerms = localStorage.getItem('hasAcceptedTerms') === 'true';
    let hasVerifiedAge = localStorage.getItem('hasVerifiedAge') === 'true';
    let pendingUnlockAction = null;

    // Función para mostrar el modal de términos y condiciones
    function showTermsModal() {
        const modal = document.getElementById('termsModal');
        const acceptCheckbox = document.getElementById('acceptTerms');
        const acceptBtn = document.getElementById('acceptTermsBtn');
        const declineBtn = document.getElementById('declineTerms');

        modal.classList.add('show');

        // Habilitar/deshabilitar botón de aceptar según el checkbox
        acceptCheckbox.addEventListener('change', () => {
            acceptBtn.disabled = !acceptCheckbox.checked;
        });

        // Manejar aceptación de términos
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('hasAcceptedTerms', 'true');
            hasAcceptedTerms = true;
            modal.classList.remove('show');
            
            // Si hay contenido adulto, mostrar advertencia
            if (!hasVerifiedAge) {
                showAdultWarningModal(() => {});
            }
        });

        // Manejar rechazo de términos
        declineBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
    }

    // Verificar si es la primera visita
    if (!hasAcceptedTerms) {
        showTermsModal();
    }

    // Función para mostrar el modal de advertencia
    function showAdultWarningModal(callback) {
        const modal = document.getElementById('adultWarningModal');
        const confirmBtn = document.getElementById('confirmUnlock');
        const cancelBtn = document.getElementById('cancelUnlock');
        const rememberCheckbox = document.getElementById('rememberChoice');

        modal.classList.add('show');

        const handleConfirm = () => {
            if (rememberCheckbox.checked) {
                localStorage.setItem('hasVerifiedAge', 'true');
                hasVerifiedAge = true;
            }
            modal.classList.remove('show');
            if (callback) callback(true);
        };

        const handleCancel = () => {
            modal.classList.remove('show');
            if (callback) callback(false);
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;
    }

    // Función para verificar edad antes de desbloquear
    function verifyAgeBeforeUnlock(action) {
        if (hasVerifiedAge) {
            action();
        } else {
            showAdultWarningModal((confirmed) => {
                if (confirmed) {
                    action();
                }
            });
        }
    }

    // Función para obtener imágenes destacadas (12 imágenes aleatorias de todas las categorías)
    function getFeaturedImages() {
        const allImages = [];
        Object.values(imageConfig).forEach(categoryImages => {
            allImages.push(...categoryImages);
        });
        
        // Mezclar el array y tomar 12 imágenes
        return allImages.sort(() => Math.random() - 0.5).slice(0, 24);
    }

    // Función para cargar el estado de desbloqueo desde localStorage
    function loadUnlockedState() {
        const savedState = localStorage.getItem('unlockedImages');
        return savedState ? new Set(JSON.parse(savedState)) : new Set();
    }

    // Función para guardar el estado de desbloqueo en localStorage
    function saveUnlockedState() {
        localStorage.setItem('unlockedImages', JSON.stringify([...unlockedImages]));
    }

    // Función para cargar el estado global de desbloqueo
    function loadGlobalUnlockState() {
        const savedState = localStorage.getItem('allImagesUnlocked');
        return savedState === 'true';
    }

    // Función para guardar el estado global de desbloqueo
    function saveGlobalUnlockState() {
        localStorage.setItem('allImagesUnlocked', allImagesUnlocked);
    }

    // Set para mantener un registro de las imágenes desbloqueadas
    const unlockedImages = loadUnlockedState();

    // Variable para controlar el estado global de desbloqueo
    let allImagesUnlocked = loadGlobalUnlockState();

    // Función para verificar si una imagen debe estar censurada
    function shouldBeCensored(imageUrl) {
        // Si la imagen no es de la categoría cencura o cliks_+18, no debe estar censurada
        if (!imageUrl.includes('/cencura/') && !imageUrl.includes('/cliks_+18/')) {
            return false;
        }
        // Si el estado global está desbloqueado, ninguna imagen debe estar censurada
        if (allImagesUnlocked) {
            return false;
        }
        // Si el estado global está bloqueado, todas las imágenes deben estar censuradas
        return true;
    }

    // Función para desbloquear/bloquear todas las imágenes
    function toggleAllImages() {
        verifyAgeBeforeUnlock(() => {
            allImagesUnlocked = !allImagesUnlocked;
            const images = document.querySelectorAll('.card img, .card video');
            const unlockButtons = document.querySelectorAll('.unlock-btn');
            const unlockAllBtn = document.getElementById('unlockAllBtn');
            
            images.forEach(img => {
                if (img.src.includes('/cencura/') || img.src.includes('/cliks_+18/')) {
                    if (allImagesUnlocked) {
                        img.classList.remove('censored');
                    } else {
                        img.classList.add('censored');
                        unlockedImages.delete(img.src);
                    }
                }
            });
            
            unlockButtons.forEach(btn => {
                const mediaElement = btn.closest('.card').querySelector('img, video');
                if (mediaElement.src.includes('/cencura/') || mediaElement.src.includes('/cliks_+18/')) {
                    btn.innerHTML = allImagesUnlocked ? 
                        '<i class="fas fa-unlock"></i>' : 
                        '<i class="fas fa-lock"></i>';
                }
            });

            unlockAllBtn.innerHTML = allImagesUnlocked ? 
                '<i class="fas fa-lock"></i> Bloquear' : 
                '<i class="fas fa-unlock-alt"></i> Desbloquear';

            saveUnlockedState();
            saveGlobalUnlockState();
        });
    }

    // Función para cargar imágenes según la categoría
    function loadImagesFromCategory(category) {
        const galleryGrid = document.querySelector('.gallery-grid');
        galleryGrid.innerHTML = '';

        let images;
        if (category === 'destacadas') {
            images = getFeaturedImages();
        } else {
            images = imageConfig[category] || [];
        }

        images.forEach(image => {
            const card = createImageCard(image);
            galleryGrid.appendChild(card);
        });

        // Actualizar el título y el icono
        updateTitleAndIcon(category);
    }

    // Función para crear elementos
    function createElement(tag, className, attributes = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    // Función para crear una tarjeta de imagen
    function createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const isVideo = image.url.endsWith('.mp4');
        const mediaElement = document.createElement(isVideo ? 'video' : 'img');
        mediaElement.src = image.url;
        mediaElement.alt = image.name;
        
        if (isVideo) {
            mediaElement.controls = true;
            mediaElement.className = 'video-player';
        }
        
        if (shouldBeCensored(image.url)) {
            mediaElement.classList.add('censored');
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadImage(image.url, image.name, downloadBtn);
        });
        
        if (image.url.includes('/cencura/') || image.url.includes('/cliks_+18/')) {
            const unlockBtn = document.createElement('button');
            unlockBtn.className = 'unlock-btn';
            unlockBtn.innerHTML = mediaElement.classList.contains('censored') ? 
                '<i class="fas fa-lock"></i>' : 
                '<i class="fas fa-unlock"></i>';
            unlockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                verifyAgeBeforeUnlock(() => {
                    if (mediaElement.classList.contains('censored')) {
                        mediaElement.classList.remove('censored');
                        unlockedImages.add(image.url);
                        unlockBtn.innerHTML = '<i class="fas fa-unlock"></i>';
                    } else {
                        mediaElement.classList.add('censored');
                        unlockedImages.delete(image.url);
                        unlockBtn.innerHTML = '<i class="fas fa-lock"></i>';
                    }
                    saveUnlockedState();
                });
            });
            overlay.appendChild(unlockBtn);
        }
        
        overlay.appendChild(downloadBtn);
        card.appendChild(mediaElement);
        card.appendChild(overlay);
        
        return card;
    }

    // Función para descargar una imagen
    function downloadImage(url, name, button) {
        // Agregar clase de descarga en progreso
        button.classList.add('downloading');
        
        // Obtener la extensión del archivo de la URL
        const extension = url.split('.').pop();
        const fileName = `${name}.${extension}`;

        try {
            // Crear un enlace temporal
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            
            // Simular clic en el enlace
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar la imagen:', error);
            alert('Error al descargar la imagen. Por favor, inténtalo de nuevo.');
        } finally {
            // Remover clase de descarga en progreso
            button.classList.remove('downloading');
        }
    }

    // Función para actualizar el título y el icono según la categoría
    function updateTitleAndIcon(category) {
        const titleElement = document.querySelector('.section-title');
        if (!titleElement) return;

        const categoryConfig = {
            'destacadas': {
                title: 'Imágenes Destacadas',
                icon: 'fa-star'
            },
            'vanilla': {
                title: 'Imágenes Vanilla',
                icon: 'fa-sun'
            },
            'cencura': {
                title: 'Imágenes Censuradas',
                icon: 'fa-lock'
            },
            'vampira': {
                title: 'Imágenes Vampira',
                icon: 'fa-moon'
            },
            'morena': {
                title: 'Imágenes Morena',
                icon: 'fa-user'
            },
            'bikini': {
                title: 'Imágenes Bikini',
                icon: 'fa-umbrella-beach'
            },
            'centauro': {
                title: 'Imágenes Centauro',
                icon: 'fa-horse'
            },
            'chibi': {
                title: 'Imágenes Chibi',
                icon: 'fa-child'
            },
            'milf': {
                title: 'Imágenes Milf',
                icon: 'fa-user-tie'
            },
            'gotica': {
                title: 'Imágenes Gótica',
                icon: 'fa-skull'
            },
            'trabajo': {
                title: 'Imágenes Trabajo',
                icon: 'fa-briefcase'
            },
            'vestido': {
                title: 'Imágenes Vestido',
                icon: 'fa-tshirt'
            },
            'furry': {
                title: 'Imágenes Furry',
                icon: 'fa-paw'
            },
            'desgarada': {
                title: 'Imágenes Desgarada',
                icon: 'fa-cut'
            },
            'terror': {
                title: 'Imágenes Terror',
                icon: 'fa-ghost'
            },
            'cliks': {
                title: 'Videos Cliks',
                icon: 'fa-video'
            },
            'cliks18': {
                title: 'Videos Cliks +18',
                icon: 'fa-video'
            }
        };

        const config = categoryConfig[category] || categoryConfig['destacadas'];
        titleElement.innerHTML = `<i class="fas ${config.icon}"></i> ${config.title}`;
    }

    // Función para inicializar los filtros
    function initializeFilters() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remover clase active de todos los botones
                menuItems.forEach(btn => btn.classList.remove('active'));
                // Agregar clase active al botón clickeado
                item.classList.add('active');
                // Cargar imágenes de la categoría seleccionada
                const category = item.getAttribute('data-category');
                loadImagesFromCategory(category);
            });
        });
    }

    // Inicializar la galería
    initializeFilters();

    // Inicializar la vista de cuadrícula/lista
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const galleryGrid = document.querySelector('.gallery-grid');
            if (btn.querySelector('i').classList.contains('fa-th-list')) {
                galleryGrid.style.gridTemplateColumns = '1fr';
            } else {
                galleryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            }
        });
    });

    // Inicializar la búsqueda
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                const title = card.querySelector('img').alt.toLowerCase();
                card.style.display = title.includes(searchTerm) ? 'block' : 'none';
            });
        }
    });

    // Agregar evento para el botón de desbloqueo global
    const unlockAllBtn = document.getElementById('unlockAllBtn');
    if (unlockAllBtn) {
        unlockAllBtn.addEventListener('click', toggleAllImages);
    }

    // Inicializar el estado del botón al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        const unlockAllBtn = document.getElementById('unlockAllBtn');
        if (unlockAllBtn) {
            unlockAllBtn.innerHTML = allImagesUnlocked ? 
                '<i class="fas fa-lock"></i> Bloquear +18' : 
                '<i class="fas fa-unlock-alt"></i> Desbloquear +18';
        }
    });

    // Cargar imágenes destacadas por defecto
    loadImagesFromCategory('destacadas');
}); 