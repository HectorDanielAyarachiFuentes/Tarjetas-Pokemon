document.addEventListener("DOMContentLoaded", function () {
    // === 1. REFERENCIAS AL DOM ===
    const body = document.body;
    const catalogView = document.getElementById('catalog-view');
    const detailView = document.getElementById('detail-view');
    const pokemonContainer = document.getElementById("pokemon-container");
    const searchInput = document.getElementById("searchbar");
    const audioButton = document.getElementById("ramoncito");
    const audioPlayer = document.getElementById("audio-player");

    // === 2. ESTADO DE LA APLICACIÓN ===
    const API_URL = "./json/cards-pokemon-1.json";
    let allPokemons = [];
    
    // --- NUEVO: ESTADO PARA SCROLL INFINITO ---
    const CARDS_PER_PAGE = 20; // Cuántas cartas cargar cada vez
    let currentIndex = 0;      // Índice de la última carta cargada
    let isLoading = false;     // Para evitar cargas múltiples si se scrollea muy rápido
    let infiniteScrollObserver; // El observador que detectará el final de la página

    // === 3. LÓGICA DE NAVEGACIÓN Y TEMAS ===

    function navigateTo(viewId) {
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));
        document.getElementById(viewId).classList.add('active-view');
        window.scrollTo(0, 0);

        if (viewId === 'detail-view') {
            body.classList.add('theme-detail');
        } else {
            body.classList.remove('theme-detail');
        }
    }

    // === 4. LÓGICA DE LA VISTA DE CATÁLOGO ===

    async function fetchPokemonData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error de red: ${response.status}`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            pokemonContainer.innerHTML = '<p class="error-message">No se pudieron cargar las cartas.</p>';
            return []; 
        }
    }
    
    // --- MODIFICADO: AHORA ACEPTA UN PARÁMETRO "APPEND" ---
    function renderPokemonCards(pokemons, append = false) {
        if (!append) {
            pokemonContainer.innerHTML = ''; // Limpia solo si no estamos añadiendo al final
        }

        const fragment = document.createDocumentFragment();
        pokemons.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.id = pokemon.id; 
            const pokemonType = pokemon.types?.[0]?.toLowerCase() || 'normal';
            card.dataset.type = pokemonType;

            card.innerHTML = `
                <div class="image-container">
                    <img src="${pokemon.images.large}" alt="${pokemon.name}" class="pokemon-image" loading="lazy">
                </div>
                <div class="card-info">
                    <h2>${pokemon.name}</h2>
                    <button type="button" class="ver-button">Ver Ficha</button>
                </div>
            `;
            const img = card.querySelector('.pokemon-image');
            img.onload = () => img.closest('.image-container').classList.add('loaded');
            fragment.appendChild(card);
        });
        pokemonContainer.appendChild(fragment);
    }
    
    // --- NUEVO: FUNCIÓN PARA CARGAR MÁS CARTAS ---
    function loadMorePokemons() {
        if (isLoading) return;
        isLoading = true;

        const nextBatch = allPokemons.slice(currentIndex, currentIndex + CARDS_PER_PAGE);
        if (nextBatch.length > 0) {
            renderPokemonCards(nextBatch, true); // Usamos append = true
            currentIndex += CARDS_PER_PAGE;
        }
        
        // Si ya no hay más cartas, detenemos el observador
        if (currentIndex >= allPokemons.length) {
            if (infiniteScrollObserver) {
                const trigger = document.getElementById('scroll-trigger');
                if(trigger) infiniteScrollObserver.unobserve(trigger);
            }
        }
        isLoading = false;
    }

    // --- NUEVO: FUNCIÓN PARA CONFIGURAR EL SCROLL INFINITO ---
    function setupInfiniteScroll() {
        // Si ya existe un trigger, lo removemos para empezar de cero
        let trigger = document.getElementById('scroll-trigger');
        if (trigger) trigger.remove();

        trigger = document.createElement('div');
        trigger.id = 'scroll-trigger';
        // Lo añadimos después del contenedor de pokemons
        pokemonContainer.insertAdjacentElement('afterend', trigger);
        
        const options = { rootMargin: '0px 0px 500px 0px' }; // Carga cuando falten 500px para llegar al final

        infiniteScrollObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMorePokemons();
            }
        }, options);

        infiniteScrollObserver.observe(trigger);
    }

    // --- MODIFICADO: PARA INTERACTUAR CON EL SCROLL INFINITO ---
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const trigger = document.getElementById('scroll-trigger');

        // Si el observador existe, lo detenemos mientras se busca
        if (infiniteScrollObserver) {
            infiniteScrollObserver.disconnect();
            if(trigger) trigger.style.display = 'none'; // Ocultar el trigger
        }

        if (!searchTerm) {
            // Si la búsqueda está vacía, reiniciamos la vista de catálogo
            currentIndex = 0;
            renderPokemonCards([]); // Limpiamos
            loadMorePokemons(); // Cargamos el primer lote
            if(trigger) trigger.style.display = 'block'; // Mostramos el trigger de nuevo
            setupInfiniteScroll(); // Reactivamos el scroll
            return;
        }

        const filteredPokemons = allPokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
        renderPokemonCards(filteredPokemons, false); // Mostramos los resultados sin añadir
    }
    
    // === 5. LÓGICA DE LA VISTA DE DETALLE (SIN CAMBIOS) ===
    function renderEnergyCosts(costs = []) { /* ... */ }
    function renderDetailView(pokemon) { /* ... */ }

    // === 6. EVENT LISTENERS Y INICIALIZACIÓN (MODIFICADO) ===
    document.addEventListener('click', function(event) { /* ... sin cambios ... */ });
    document.addEventListener('input', function(event) { /* ... sin cambios ... */ });

    async function init() {
        allPokemons = await fetchPokemonData();
        
        // La carga inicial ahora es controlada por loadMorePokemons
        loadMorePokemons();
        
        // Configuramos el scroll infinito
        setupInfiniteScroll();
        
        searchInput.addEventListener("input", handleSearch);
    }

    init();
});
