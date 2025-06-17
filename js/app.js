document.addEventListener('DOMContentLoaded', () => {
    // Cache de elementos DOM frecuentemente usados
    const DOM = {
        galleryGrid: document.querySelector('.gallery-grid'),
        unlockAllBtn: document.getElementById('unlockAllBtn'),
        termsModal: document.getElementById('termsModal'),
        adultWarningModal: document.getElementById('adultWarningModal'),
        sectionTitle: document.querySelector('.section-title'),
        menuItems: document.querySelectorAll('.menu-item')
    };

    // Estado de la aplicación
    const state = {
        hasAcceptedTerms: localStorage.getItem('hasAcceptedTerms') === 'true',
        hasVerifiedAge: localStorage.getItem('hasVerifiedAge') === 'true',
        unlockedImages: new Set(JSON.parse(localStorage.getItem('unlockedImages') || '[]')),
        allImagesUnlocked: localStorage.getItem('allImagesUnlocked') === 'true',
        currentCategory: 'destacadas'
    };

    // Funciones de utilidad
    const utils = {
        saveToLocalStorage: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        },
        loadFromLocalStorage: (key, defaultValue) => {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        },
        createElement: (tag, className, attributes = {}) => {
            const element = document.createElement(tag);
            if (className) element.className = className;
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            return element;
        },
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Función para mostrar el modal de términos y condiciones
    function showTermsModal() {
        const acceptCheckbox = document.getElementById('acceptTerms');
        const acceptBtn = document.getElementById('acceptTermsBtn');
        const declineBtn = document.getElementById('declineTerms');

        DOM.termsModal.classList.add('show');

        acceptCheckbox.addEventListener('change', () => {
            acceptBtn.disabled = !acceptCheckbox.checked;
        });

        acceptBtn.addEventListener('click', () => {
            state.hasAcceptedTerms = true;
            utils.saveToLocalStorage('hasAcceptedTerms', true);
            DOM.termsModal.classList.remove('show');
            
            if (!state.hasVerifiedAge) {
                showAdultWarningModal(() => {});
            }
        });

        declineBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
    }

    // Función para mostrar el modal de advertencia
    function showAdultWarningModal(callback) {
        const confirmBtn = document.getElementById('confirmUnlock');
        const cancelBtn = document.getElementById('cancelUnlock');
        const rememberCheckbox = document.getElementById('rememberChoice');

        DOM.adultWarningModal.classList.add('show');

        const handleConfirm = () => {
            if (rememberCheckbox.checked) {
                state.hasVerifiedAge = true;
                utils.saveToLocalStorage('hasVerifiedAge', true);
            }
            DOM.adultWarningModal.classList.remove('show');
            if (callback) callback(true);
        };

        const handleCancel = () => {
            DOM.adultWarningModal.classList.remove('show');
            if (callback) callback(false);
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;
    }

    // Función para verificar edad antes de desbloquear
    function verifyAgeBeforeUnlock(action) {
        if (state.hasVerifiedAge) {
            action();
        } else {
            showAdultWarningModal((confirmed) => {
                if (confirmed) {
                    action();
                }
            });
        }
    }

    // Función para verificar si una imagen debe estar censurada
    function shouldBeCensored(imageUrl) {
        if (!imageUrl.includes('/cencura/') && !imageUrl.includes('/cliks_+18/')) {
            return false;
        }
        return !state.allImagesUnlocked;
    }

    // Función para desbloquear/bloquear todas las imágenes
    function toggleAllImages() {
        verifyAgeBeforeUnlock(() => {
            state.allImagesUnlocked = !state.allImagesUnlocked;
            const images = document.querySelectorAll('.card img, .card video');
            const unlockButtons = document.querySelectorAll('.unlock-btn');
            
            images.forEach(img => {
                if (img.src.includes('/cencura/') || img.src.includes('/cliks_+18/')) {
                    img.classList.toggle('censored', !state.allImagesUnlocked);
                    if (!state.allImagesUnlocked) {
                        state.unlockedImages.delete(img.src);
                    }
                }
            });
            
            unlockButtons.forEach(btn => {
                const mediaElement = btn.closest('.card').querySelector('img, video');
                if (mediaElement.src.includes('/cencura/') || mediaElement.src.includes('/cliks_+18/')) {
                    btn.innerHTML = state.allImagesUnlocked ? 
                        '<i class="fas fa-unlock"></i>' : 
                        '<i class="fas fa-lock"></i>';
                }
            });

            DOM.unlockAllBtn.innerHTML = state.allImagesUnlocked ? 
                '<i class="fas fa-lock"></i> Bloquear +18' : 
                '<i class="fas fa-unlock-alt"></i> Desbloquear +18';

            utils.saveToLocalStorage('unlockedImages', [...state.unlockedImages]);
            utils.saveToLocalStorage('allImagesUnlocked', state.allImagesUnlocked);
        });
    }

    // Función para cargar imágenes según la categoría
    function loadImagesFromCategory(category) {
        state.currentCategory = category;
        DOM.galleryGrid.innerHTML = '';

        const images = category === 'destacadas' ? 
            imageConfig.destacadas : 
            (imageConfig[category] || []);

        const fragment = document.createDocumentFragment();
        images.forEach(image => {
            fragment.appendChild(createImageCard(image));
        });
        DOM.galleryGrid.appendChild(fragment);

        updateTitleAndIcon(category);
    }

    // Función para crear una tarjeta de imagen
    function createImageCard(image) {
        const card = utils.createElement('div', 'card');
        const isVideo = image.url.endsWith('.mp4');
        const mediaElement = utils.createElement(isVideo ? 'video' : 'img', isVideo ? 'video-player' : '');
        
        mediaElement.src = image.url;
        mediaElement.alt = image.name;
        
        if (isVideo) {
            mediaElement.controls = true;
        }
        
        if (shouldBeCensored(image.url)) {
            mediaElement.classList.add('censored');
        }
        
        const overlay = utils.createElement('div', 'overlay');
        const downloadBtn = utils.createElement('button', 'download-btn');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadImage(image.url, image.name, downloadBtn);
        });
        
        if (image.url.includes('/cencura/') || image.url.includes('/cliks_+18/')) {
            const unlockBtn = utils.createElement('button', 'unlock-btn');
            unlockBtn.innerHTML = mediaElement.classList.contains('censored') ? 
                '<i class="fas fa-lock"></i>' : 
                '<i class="fas fa-unlock"></i>';
            unlockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                verifyAgeBeforeUnlock(() => {
                    mediaElement.classList.toggle('censored');
                    if (mediaElement.classList.contains('censored')) {
                        state.unlockedImages.delete(image.url);
                        unlockBtn.innerHTML = '<i class="fas fa-lock"></i>';
                    } else {
                        state.unlockedImages.add(image.url);
                        unlockBtn.innerHTML = '<i class="fas fa-unlock"></i>';
                    }
                    utils.saveToLocalStorage('unlockedImages', [...state.unlockedImages]);
                });
            });
            overlay.appendChild(unlockBtn);
        }
        
        overlay.appendChild(downloadBtn);
        card.appendChild(mediaElement);
        card.appendChild(overlay);
        
        return card;
    }

    // Función para descargar imagen
    async function downloadImage(url, name, button) {
        try {
            // Mostrar modal de confirmación
            const confirmModal = utils.createElement('div', 'modal');
            confirmModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <i class="fas fa-download"></i>
                        <h2>Confirmar Descarga</h2>
                    </div>
                    <div class="modal-body">
                        <p>¿Deseas descargar "${name}"?</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="cancelDownload">Cancelar</button>
                        <button class="btn-primary" id="confirmDownload">Descargar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(confirmModal);
            confirmModal.classList.add('show');

            // Esperar la respuesta del usuario
            const userConfirmed = await new Promise((resolve) => {
                document.getElementById('confirmDownload').onclick = () => {
                    confirmModal.classList.remove('show');
                    setTimeout(() => confirmModal.remove(), 300);
                    resolve(true);
                };

                document.getElementById('cancelDownload').onclick = () => {
                    confirmModal.classList.remove('show');
                    setTimeout(() => confirmModal.remove(), 300);
                    resolve(false);
                };
            });

            if (!userConfirmed) {
                return;
            }

            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            // Crear un enlace temporal para la descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // Simular clic en el enlace
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Mostrar mensaje de éxito
            const successToast = utils.createElement('div', 'toast success');
            successToast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Descarga iniciada</span>
            `;
            document.body.appendChild(successToast);
            setTimeout(() => {
                successToast.classList.add('show');
                setTimeout(() => {
                    successToast.classList.remove('show');
                    setTimeout(() => successToast.remove(), 300);
                }, 2000);
            }, 100);

        } catch (error) {
            console.error('Error al descargar:', error);
            
            // Mostrar mensaje de error
            const errorToast = utils.createElement('div', 'toast error');
            errorToast.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>Error al descargar el archivo</span>
            `;
            document.body.appendChild(errorToast);
            setTimeout(() => {
                errorToast.classList.add('show');
                setTimeout(() => {
                    errorToast.classList.remove('show');
                    setTimeout(() => errorToast.remove(), 300);
                }, 2000);
            }, 100);
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i>';
        }
    }

    // Función para actualizar título e icono
    function updateTitleAndIcon(category) {
        if (!DOM.sectionTitle) return;
        
        const categoryInfo = {
            'destacadas': { title: 'Imágenes Destacadas', icon: 'fa-star' },
            'bikini': { title: 'Bikini', icon: 'fa-umbrella-beach' },
            'cencura': { title: 'Censurada', icon: 'fa-eye-slash' },
            'centauro': { title: 'Centauro', icon: 'fa-horse' },
            'chibi': { title: 'Chibi', icon: 'fa-child' },
            'desgarada': { title: 'Desgarada', icon: 'fa-tshirt' },
            'furry': { title: 'Furry', icon: 'fa-paw' },
            'gotica': { title: 'Gótica', icon: 'fa-skull' },
            'milf': { title: 'Milf', icon: 'fa-heart' },
            'morena': { title: 'Morena', icon: 'fa-sun' },
            'terror': { title: 'Terror', icon: 'fa-ghost' },
            'trabajo': { title: 'Trabajo', icon: 'fa-briefcase' },
            'vampira': { title: 'Vampira', icon: 'fa-moon' },
            'vanilla': { title: 'Vanilla', icon: 'fa-ice-cream' },
            'vestido': { title: 'Vestido', icon: 'fa-tshirt' },
            'cliks': { title: 'Cliks', icon: 'fa-play' },
            'cliks18': { title: 'Cliks +18', icon: 'fa-lock' }
        };

        const info = categoryInfo[category] || { title: category, icon: 'fa-image' };
        DOM.sectionTitle.innerHTML = `<i class="fas ${info.icon}"></i> ${info.title}`;
    }

    // Inicialización
    if (!state.hasAcceptedTerms) {
        showTermsModal();
    }

    // Inicializar filtros
    function initializeFilters() {
        DOM.menuItems.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                loadImagesFromCategory(category);
                
                // Actualizar botones activos
                DOM.menuItems.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    // Inicializar botón de desbloqueo global
    DOM.unlockAllBtn.addEventListener('click', toggleAllImages);

    // Inicializar búsqueda
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
                const title = card.querySelector('img, video').alt.toLowerCase();
                card.style.display = title.includes(searchTerm) ? 'block' : 'none';
            });
        }, 300));
    }

    // Inicializar vista de cuadrícula/lista
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            DOM.galleryGrid.classList.toggle('list-view', 
                btn.querySelector('i').classList.contains('fa-th-list')
            );
        });
    });

    // Cargar imágenes destacadas por defecto
    loadImagesFromCategory('destacadas');
    initializeFilters();
}); 