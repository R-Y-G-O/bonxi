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
        'bikini': 44,
        'cencura': 118,
        'centauro': 10,
        'chibi': 15,
        'desgarada': 9,
        'furry': 7,
        'gotica': 50,
        'milf': 71,
        'morena': 7,
        'terror': 6,
        'trabajo': 72,
        'vampira': 50,
        'vanilla': 114,
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
        // Cargar primero las categorías más importantes
        const categoriasPrioritarias = ['destacadas', 'vanilla', 'cencura', 'vampira', 'milf'];
        
        // Cargar categorías prioritarias primero
        await Promise.all(categoriasPrioritarias.map(categoria => 
            crearArrayImagenes(categoria, CONFIG.categoryLimits[categoria]).then(imagenes => {
                imageConfig[categoria] = imagenes;
            })
        ));

        // Configurar videos
        Object.entries(CONFIG.videoCategories).forEach(([categoria, config]) => {
            imageConfig[categoria] = Array.from({length: config.count}, (_, i) => ({
                name: `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ${i + 1}`,
                url: `${CONFIG.basePaths.videos}${config.path} (${i + 1}).mp4`
            }));
        });

        // Cargar el resto de categorías en segundo plano
        const categoriasRestantes = CONFIG.categories.filter(cat => !categoriasPrioritarias.includes(cat));
        Promise.all(categoriasRestantes.map(categoria => 
            crearArrayImagenes(categoria, CONFIG.categoryLimits[categoria]).then(imagenes => {
                imageConfig[categoria] = imagenes;
            })
        )).then(() => {
            console.log('Todas las categorías han sido cargadas');
        });

        actualizarDestacadas();
        console.log('Configuración inicial cargada exitosamente');
    } catch (error) {
        console.error('Error al inicializar la configuración:', error);
    }
}

// Exportar la función para actualizar destacadas
window.actualizarDestacadas = actualizarDestacadas; 