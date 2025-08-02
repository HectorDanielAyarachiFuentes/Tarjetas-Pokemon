// js/script-detalle-pokemon.js

document.addEventListener("DOMContentLoaded", function () {
    // --- 1. REFERENCIAS Y ESTADO GLOBAL ---
    const detailsContainer = document.getElementById("pokemon-details-container");
    let currentPokemon = null; // Variable para guardar los datos del Pokémon que se está mostrando

    // --- 2. FUNCIONES ---

    function renderEnergyCosts(costs = []) {
        if (!costs || costs.length === 0) return '<span>Sin coste</span>';
        return costs.map(cost => `<span class="energy-cost-icon energy-${cost.toLowerCase()}" title="${cost}"></span>`).join('');
    }

    function renderCollectorCard(pokemon) {
        // Guardamos los datos del pokémon actual para usarlos en otras funciones
        currentPokemon = pokemon;

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
        const description = pokemon.flavorText ?? 'Esta carta rara no tiene descripción...';
        const price = pokemon.cardmarket?.prices?.averageSellPrice ?? 5.00;

        detailsContainer.innerHTML = '';
        
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'pokemon-card-detail';
        
        cardWrapper.innerHTML = `
            <div class="detail-image-wrapper">
                <img src="${image}" alt="Carta de ${name}" class="detail-image">
            </div>
            <div class="detail-info-wrapper">
                <div class="card-header">
                    <h2>${name}</h2>
                    <div class="card-subheader">
                        <span>${subtype} Pokémon</span>
                        <span><strong>HP</strong> ${hp}</span>
                    </div>
                    <div class="card-id-rarity">
                        <span class="tag tag-id">ID: ${cardId}</span>
                        <span class="tag tag-rarity">${rarity}</span>
                    </div>
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
                    <div class="meta-item">
                        <strong>Debilidad</strong>
                        <span>${weakness ? `${weakness.type} ${weakness.value}` : 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Coste de Retirada</strong>
                        <div class="retreat-cost">${renderEnergyCosts(retreatCost)}</div>
                    </div>
                    <div class="meta-item">
                        <strong>Artista</strong>
                        <span>${artist}</span>
                    </div>
                    <div class="meta-item set-info">
                        <strong>Expansión</strong>
                        <div>
                            <span>${setName}</span>
                            ${setLogo ? `<img src="${setLogo}" alt="Logo de ${setName}" class="set-logo">` : ''}
                        </div>
                        <span>#${setNumber}</span>
                    </div>
                </div>
                <p class="description"><em>${description}</em></p>
                <div class="purchase-section">
                    <div class="price-display">
                        <strong>Precio:</strong>
                        <span id="card-price" data-base-price="${price}">${price.toFixed(2)} €</span>
                    </div>
                    <div class="quantity-control">
                        <label for="quantity">Cantidad:</label>
                        <input type="number" id="quantity" value="1" min="1" max="10" aria-label="Cantidad">
                    </div>
                    <button class="buy-button" type="button">Añadir al Carrito</button>
                </div>
            </div>`;

        detailsContainer.appendChild(cardWrapper);
    }
    
    function updateTotalPrice() {
        const priceElement = document.getElementById('card-price');
        const quantityInput = document.getElementById('quantity');
        if (!priceElement || !quantityInput) return;
        const basePrice = parseFloat(priceElement.dataset.basePrice);
        const quantity = parseInt(quantityInput.value, 10);
        if (isNaN(basePrice) || isNaN(quantity)) return;
        const totalPrice = (basePrice * quantity).toFixed(2);
        priceElement.textContent = `${totalPrice} €`;
    }

    // ================== FUNCIÓN MODIFICADA ==================
    /**
     * Maneja la lógica de "compra" usando el módulo Cart.
     */
    function handlePurchase(event) {
        // Solo actuar si se hizo clic en el botón de compra
        if (!event.target.classList.contains('buy-button')) return;

        // Prevenir que se pueda hacer clic varias veces
        const button = event.target;
        if (button.disabled) return;

        // Verificar que tenemos los datos del Pokémon actual
        if (!currentPokemon) {
            alert('Error: No se pueden añadir los datos de la carta al carrito.');
            return;
        }

        // 1. Recoger datos del producto
        const quantityInput = document.getElementById('quantity');
        const priceElement = document.getElementById('card-price');

        const itemData = {
            id: currentPokemon.id,
            name: currentPokemon.name,
            image: currentPokemon.images.small, // Usamos la imagen pequeña para la vista del carrito
            price: parseFloat(priceElement.dataset.basePrice),
            quantity: parseInt(quantityInput.value, 10)
        };

        // 2. Usar el módulo Cart para añadir el item
        // (Esto asume que `cart.js` está incluido y el objeto `Cart` está disponible globalmente)
        Cart.add(itemData);

        // 3. Feedback visual al usuario
        button.textContent = '¡Añadido!';
        button.disabled = true;

        // Animar el ícono del carrito para llamar la atención del usuario
        const cartIcon = document.getElementById('cart-icon-container');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2) rotate(-10deg)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }
    }
    // =========================================================

    function handleQuantityChange(event) {
        if (event.target.id === 'quantity') {
            updateTotalPrice();
        }
    }

    function displayErrorMessage(message) {
        detailsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    function init() {
        try {
            // Tu lógica de inicialización para obtener el Pokémon no cambia
            const urlParams = new URLSearchParams(window.location.search);
            // IMPORTANTE: Cambiaremos a usar el ID real de la carta en lugar del índice
            const pokemonId = urlParams.get("id"); 
            if (pokemonId === null) {
                throw new Error("ID de Pokémon no proporcionado en la URL.");
            }
            
            const allPokemonData = JSON.parse(localStorage.getItem("pokemonData"));
            if (!allPokemonData?.data) {
                throw new Error("No se encontraron datos de Pokémon. Por favor, vuelve al catálogo principal.");
            }

            // Buscamos el pokemon por su ID, no por su índice
            const selectedPokemon = allPokemonData.data.find(p => p.id === pokemonId);
            
            if (!selectedPokemon) {
                // Si no se encuentra, puede que el enlace siga usando el índice. Intentamos el método antiguo como fallback.
                const pokemonIndex = parseInt(pokemonId, 10);
                const fallbackPokemon = allPokemonData.data[pokemonIndex];
                if(fallbackPokemon) {
                    renderCollectorCard(fallbackPokemon);
                } else {
                    throw new Error(`El Pokémon con ID "${pokemonId}" no fue encontrado.`);
                }
            } else {
                renderCollectorCard(selectedPokemon);
            }
            
            // Los listeners se mantienen igual
            detailsContainer.addEventListener('click', handlePurchase);
            detailsContainer.addEventListener('input', handleQuantityChange);
        } catch (error) {
            console.error(error);
            displayErrorMessage(error.message);
        }
    }

    // --- 3. INICIALIZACIÓN ---
    init();
});