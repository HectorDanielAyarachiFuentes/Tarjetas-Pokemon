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

    function renderPokemonCards(pokemons) {
        pokemonContainer.innerHTML = '';
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

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filteredPokemons = allPokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
        renderPokemonCards(filteredPokemons);
    }
    
    // === 5. LÓGICA DE LA VISTA DE DETALLE ===

    function renderEnergyCosts(costs = []) {
        if (!costs || costs.length === 0) return '<span>Sin coste</span>';
        return costs.map(cost => `<span class="energy-cost-icon energy-${cost.toLowerCase()}" title="${cost}"></span>`).join('');
    }
    
    function renderDetailView(pokemon) {
        const name = pokemon.name || 'Desconocido';
        const image = pokemon.images?.large || 'path/to/default-image.png';
        const hp = pokemon.hp ?? 'N/A';
        const cardId = pokemon.id || 'N/A';
        const rarity = pokemon.rarity || 'Común';
        const subtype = pokemon.subtypes?.[0] || 'Pokémon';
        const evolvesFrom = pokemon.evolvesFrom ? `<span class="evolves-from">Evoluciona de ${pokemon.evolvesFrom}</span>` : '';
        const attacks = pokemon.attacks || [];
        const weakness = pokemon.weaknesses?.[0] ?? null;
        const retreatCost = pokemon.retreatCost ?? [];
        const artist = pokemon.artist || 'Desconocido';
        const setName = pokemon.set?.name || 'N/A';
        const setLogo = pokemon.set?.images?.logo || '';
        const setNumber = `${pokemon.number}/${pokemon.set?.printedTotal}`;
        const description = pokemon.flavorText ?? 'Esta carta rara no tiene descripción.';
        const price = pokemon.cardmarket?.prices?.averageSellPrice ?? 5.00;

        detailView.innerHTML = `
            <div class="pokemon-card-detail">
                <button class="header-back-link" id="back-to-catalog" type="button">‹ Volver al Catálogo</button>
                
                <div class="detail-image-wrapper">
                    <img src="${image}" alt="Carta de ${name}" class="detail-image">
                </div>
                <div class="detail-info-wrapper">
                    <h2>${name}</h2>
                    <div class="card-subheader">
                        <span>${subtype} Pokémon</span>
                        <span><strong>HP</strong> ${hp}</span>
                    </div>
                    <div class="card-id-rarity">
                        <span class="tag tag-id">ID: ${cardId}</span>
                        <span class="tag tag-rarity">${rarity}</span>
                    </div>
                    ${evolvesFrom}
                    <div class="attacks-section">
                        <h3>Ataques</h3>
                        ${attacks.map(attack => `
                            <div class="attack-item">
                                <div class="attack-header">
                                    <div class="attack-cost">${renderEnergyCosts(attack.cost)}</div>
                                    <strong class="attack-name">${attack.name}</strong>
                                    <span class="attack-damage">${attack.damage || ''}</span>
                                </div>
                                <p class="attack-text">${attack.text}</p>
                            </div>
                        `).join('') || '<p>Esta carta no tiene ataques especiales.</p>'}
                    </div>
                    <div class="card-meta-grid">
                        <div class="meta-item"><strong>Debilidad</strong><span>${weakness ? `${weakness.type} ${weakness.value}` : 'N/A'}</span></div>
                        <div class="meta-item"><strong>Coste de Retirada</strong><div class="retreat-cost">${renderEnergyCosts(retreatCost)}</div></div>
                        <div class="meta-item"><strong>Artista</strong><span>${artist}</span></div>
                        <div class="meta-item set-info"><strong>Expansión</strong><div><span>${setName}</span>${setLogo ? `<img src="${setLogo}" alt="Logo de ${setName}" class="set-logo">` : ''}</div><span>#${setNumber}</span></div>
                    </div>
                    <p class="description"><em>${description}</em></p>
                    <div class="purchase-section">
                        <div class="price-display"><strong>Precio:</strong> <span id="card-price" data-base-price="${price}">${price.toFixed(2)} €</span></div>
                        <div class="quantity-control"><label for="quantity">Cantidad:</label> <input type="number" id="quantity" value="1" min="1" max="10"></div>
                        <button class="buy-button" data-pokemon-id="${pokemon.id}" type="button">Añadir al Carrito</button>
                    </div>
                </div>
            </div>
        `;

        navigateTo('detail-view');
    }

    // === 6. EVENT LISTENERS Y INICIALIZACIÓN ===

    document.addEventListener('click', function(event) {
        const cardButton = event.target.closest('.ver-button');
        if (cardButton) {
            const cardId = cardButton.closest('.pokemon-card').dataset.id;
            const pokemon = allPokemons.find(p => p.id === cardId);
            if (pokemon) renderDetailView(pokemon);
        }

        if (event.target.id === 'back-to-catalog') {
            navigateTo('catalog-view');
        }

        if (event.target.classList.contains('buy-button')) {
            const button = event.target;
            if(button.disabled) return;

            const pokemonId = button.dataset.pokemonId;
            const pokemon = allPokemons.find(p => p.id === pokemonId);
            const quantity = parseInt(document.getElementById('quantity').value, 10);
            const price = parseFloat(document.getElementById('card-price').dataset.basePrice);

            if (pokemon && quantity > 0) {
                Cart.add({ id: pokemon.id, name: pokemon.name, image: pokemon.images.small, price: price, quantity: quantity });
                button.textContent = '¡Añadido!';
                button.disabled = true;
            }
        }
        
        if (event.target.closest('#ramoncito')) {
             audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
        }
    });

    document.addEventListener('input', function(event) {
        if (event.target.id === 'quantity') {
            const priceElement = document.getElementById('card-price');
            const basePrice = parseFloat(priceElement.dataset.basePrice);
            const quantity = parseInt(event.target.value, 10);
            if (!isNaN(basePrice) && !isNaN(quantity)) {
                priceElement.textContent = `${(basePrice * quantity).toFixed(2)} €`;
            }
        }
    });

    async function init() {
        allPokemons = await fetchPokemonData();
        renderPokemonCards(allPokemons.slice(0, 40)); // Carga inicial de más cartas
        searchInput.addEventListener("input", handleSearch);
    }

    init();
});