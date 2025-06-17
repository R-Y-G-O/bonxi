// Definición de rutas base y configuración
const CONFIG = {
    basePaths: {
        images: 'images/',
        videos: 'videos/'
    },
    maxFeaturedImages: 12,
    categories: [
        'bikini', 'cencura', 'centauro', 'chibi', 'desgarada',
        'furry', 'gotica', 'milf', 'morena', 'terror',
        'trabajo', 'vampira', 'vanilla', 'vestido'
    ],
    categoryLimits: {
        'bikini': 20,
        'cencura': 15,
        'centauro': 10,
        'chibi': 15,
        'desgarada': 9,
        'furry': 8,
        'gotica': 20,
        'milf': 15,
        'morena': 7,
        'terror': 6,
        'trabajo': 12,
        'vampira': 15,
        'vanilla': 20,
        'vestido': 11
    },
    videoCategories: {
        cliks: { count: 5, path: 'cliks/clik' },
        cliks18: { count: 6, path: 'cliks_+18/clik_+18' }
    }
};

// Función para crear array de imágenes
async function crearArrayImagenes(categoria, maxNumero) {
    const imagenes = [];
    
    for (let i = 1; i <= maxNumero; i++) {
        const url = `${CONFIG.basePaths.images}${categoria}/${categoria} (${i}).webp`;
        imagenes.push({
            name: `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ${i}`,
            url: url
        });
    }

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
            crearArrayImagenes(categoria, CONFIG.categoryLimits[categoria]).then(imagenes => {
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

// Exportar la función para actualizar destacadas
window.actualizarDestacadas = actualizarDestacadas; 