// js/script.js

document.addEventListener("DOMContentLoaded", function () {
    // --- 1. REFERENCIAS AL DOM ---
    const pokemonContainer = document.getElementById("pokemon-container");
    const searchInput = document.getElementById("searchbar");
    const audioButton = document.getElementById("ramoncito");
    const audioPlayer = document.getElementById("audio-player");

    // --- 2. ESTADO DE LA APLICACIÓN ---
    const API_URL = "./json/cards-pokemon-1.json";
    const CARDS_PER_PAGE = 20;
    let allPokemons = [];
    let currentIndex = 0;
    let infiniteScrollObserver;

    // --- 3. FUNCIONES ---

    async function fetchPokemonData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("Error al obtener los datos de Pokémon:", error);
            return []; 
        }
    }

    function loadMorePokemons() {
        const nextBatch = allPokemons.slice(currentIndex, currentIndex + CARDS_PER_PAGE);
        if (nextBatch.length > 0) {
            renderPokemonCards(nextBatch, true);
            currentIndex += CARDS_PER_PAGE;
        }
        
        if (currentIndex >= allPokemons.length && infiniteScrollObserver) {
            const trigger = document.getElementById('scroll-trigger');
            if (trigger) {
                infiniteScrollObserver.unobserve(trigger);
                trigger.remove();
            }
        }
    }

    /**
     * Crea y muestra las tarjetas de Pokémon en el DOM.
     * @param {Array<Object>} pokemons - El array de Pokémon a renderizar.
     * @param {boolean} append - Si es true, añade las cartas al final.
     */
    function renderPokemonCards(pokemons, append = false) {
        if (!append) {
            pokemonContainer.innerHTML = '';
        }

        const fragment = document.createDocumentFragment();

        pokemons.forEach(pokemon => {
            const globalIndex = allPokemons.findIndex(p => p.id === pokemon.id);

            // === CAMBIO CLAVE #1: OBTENER EL TIPO DEL POKÉMON ===
            // Obtenemos el tipo de forma segura. Si no existe, usamos 'normal' como defecto.
            const pokemonType = (pokemon.types && pokemon.types[0]) ? pokemon.types[0].toLowerCase() : 'normal';

            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.name = pokemon.name.toLowerCase();
            
            // === CAMBIO CLAVE #2: AÑADIR EL TIPO AL ELEMENTO HTML ===
            // Esto permite que el CSS aplique estilos basados en el tipo.
            card.dataset.type = pokemonType;

            card.innerHTML = `
                <div class="image-container">
                    <div class="loader"></div>
                    <img src="${pokemon.images.large}" alt="Carta de ${pokemon.name}" class="pokemon-image" loading="lazy">
                </div>
                <div class="card-info">
                    <h2>${pokemon.name}</h2>
                    <a href="detalle-pokemon.html?id=${globalIndex}" class="ver-button">Ver Ficha</a>
                </div>
            `;
            
            const img = card.querySelector('.pokemon-image');
            img.onload = () => img.closest('.image-container').classList.add('loaded');
            
            fragment.appendChild(card);
        });

        pokemonContainer.appendChild(fragment);
    }
    
    function setupInfiniteScroll() {
        const trigger = document.createElement('div');
        trigger.id = 'scroll-trigger';
        document.body.appendChild(trigger);

        const options = { rootMargin: '0px 0px 400px 0px' };

        infiniteScrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadMorePokemons();
                }
            });
        }, options);

        infiniteScrollObserver.observe(trigger);
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            renderPokemonCards(allPokemons.slice(0, CARDS_PER_PAGE));
            return;
        }

        const filteredPokemons = allPokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
        
        renderPokemonCards(filteredPokemons);
    }

    function toggleAudio() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            audioButton.setAttribute('aria-label', 'Pausar música');
        } else {
            audioPlayer.pause();
            audioButton.setAttribute('aria-label', 'Reproducir música');
        }
    }

    async function init() {
        allPokemons = await fetchPokemonData(API_URL);

        if (allPokemons.length === 0) {
            pokemonContainer.innerHTML = '<p class="error-message">No se pudieron cargar las cartas. Inténtalo de nuevo más tarde.</p>';
            return;
        }
        
        localStorage.setItem("pokemonData", JSON.stringify({ data: allPokemons }));

        loadMorePokemons();
        setupInfiniteScroll();

        searchInput.addEventListener("input", handleSearch);
        audioButton.addEventListener("click", toggleAudio);
    }

    // --- 4. INICIALIZACIÓN ---
    init();
});