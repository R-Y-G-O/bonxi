// Definición de rutas base y configuración
const CONFIG = {
    basePaths: {
        images: 'images/',
        videos: 'videos/'
    },
    maxImagesPerCategory: 150,
    maxFeaturedImages: 12,
    categories: [
        'bikini', 'cencura', 'centauro', 'chibi', 'desgarada',
        'furry', 'gotica', 'milf', 'morena', 'terror',
        'trabajo', 'vampira', 'vanilla', 'vestido'
    ],
    videoCategories: {
        cliks: { count: 5, path: 'cliks/clik' },
        cliks18: { count: 6, path: 'cliks_+18/clik_+18' }
    }
};

// Cache para almacenar imágenes verificadas
const imageCache = new Map();

// Función para verificar si una imagen existe (con caché)
async function verificarImagen(url) {
    if (imageCache.has(url)) {
        return imageCache.get(url);
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            imageCache.set(url, true);
            resolve(true);
        };
        img.onerror = () => {
            imageCache.set(url, false);
            resolve(false);
        };
        img.src = url;
    });
}

// Función para crear array de imágenes verificadas (optimizada)
async function crearArrayImagenes(categoria, maxNumero) {
    const imagenes = [];
    const promesas = [];

    for (let i = 1; i <= maxNumero; i++) {
        const url = `${CONFIG.basePaths.images}${categoria}/${categoria} (${i}).webp`;
        promesas.push(
            verificarImagen(url).then(existe => {
                if (existe) {
                    imagenes.push({
                        name: `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ${i}`,
                        url: url
                    });
                }
            })
        );
    }

    await Promise.all(promesas);
    return imagenes;
}

// Función para actualizar destacadas
function actualizarDestacadas() {
    const todasLasImagenes = [];
    CONFIG.categories.forEach(categoria => {
        if (imageConfig[categoria]) {
            todasLasImagenes.push(...imageConfig[categoria]);
        }
    });

    // Seleccionar imágenes aleatorias para destacadas
    const destacadas = [];
    const totalImagenes = todasLasImagenes.length;
    const indicesUsados = new Set();

    while (destacadas.length < CONFIG.maxFeaturedImages && indicesUsados.size < totalImagenes) {
        const indiceAleatorio = Math.floor(Math.random() * totalImagenes);
        if (!indicesUsados.has(indiceAleatorio)) {
            indicesUsados.add(indiceAleatorio);
            destacadas.push(todasLasImagenes[indiceAleatorio]);
        }
    }

    imageConfig.destacadas = destacadas;
}

// Configuración inicial
const imageConfig = {
    'destacadas': [] // Se llenará dinámicamente
};

// Función para inicializar la configuración
async function inicializarConfiguracion() {
    try {
        // Configurar imágenes en paralelo
        const promesasCategorias = CONFIG.categories.map(categoria => 
            crearArrayImagenes(categoria, CONFIG.maxImagesPerCategory).then(imagenes => {
                imageConfig[categoria] = imagenes;
            })
        );

        // Configurar videos
        Object.entries(CONFIG.videoCategories).forEach(([categoria, config]) => {
            imageConfig[categoria] = Array.from({length: config.count}, (_, i) => ({
                name: `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ${i + 1}`,
                url: `${CONFIG.basePaths.videos}${config.path} (${i + 1}).mp4`
            }));
        });

        await Promise.all(promesasCategorias);
        actualizarDestacadas();

        console.log('Configuración cargada exitosamente');
    } catch (error) {
        console.error('Error al inicializar la configuración:', error);
    }
}

// Inicializar la configuración
inicializarConfiguracion();

// Exportar la función para actualizar destacadas
window.actualizarDestacadas = actualizarDestacadas; 