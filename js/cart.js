// js/cart.js

const CART_STORAGE_KEY = 'pokemon-tcg-cart';

const Cart = {
    // === MÉTODOS DE DATOS ===

    /**
     * Obtiene el carrito desde localStorage.
     */
    get: function() {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    /**
     * Guarda el carrito en localStorage.
     */
    save: function(cartData) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    },

    /**
     * Añade un item al carrito o actualiza su cantidad si ya existe.
     */
    add: function(itemToAdd) {
        const cart = this.get();
        const existingItem = cart.find(item => item.id === itemToAdd.id);
        if (existingItem) {
            existingItem.quantity += itemToAdd.quantity;
        } else {
            cart.push(itemToAdd);
        }
        this.save(cart);
        this.updateIcon();
        if (document.body.contains(document.getElementById('cart-modal'))) {
            this.renderModalContent();
        }
    },

    /**
     * Actualiza la cantidad de un item. Si la cantidad llega a 0, se elimina.
     */
    updateQuantity: function(itemId, newQuantity) {
        let cart = this.get();
        const itemToUpdate = cart.find(item => item.id === itemId);
        if (itemToUpdate) {
            itemToUpdate.quantity = newQuantity;
            if (itemToUpdate.quantity <= 0) {
                cart = cart.filter(item => item.id !== itemId);
            }
        }
        this.save(cart);
        this.updateIcon();
        this.renderModalContent();
    },

    /**
     * Elimina un item del carrito por su ID.
     */
    remove: function(itemId) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== itemId);
        this.save(cart);
        this.updateIcon();
        this.renderModalContent();
    },
    
    /**
     * Vacía completamente el carrito.
     */
    clear: function() {
        this.save([]);
        this.updateIcon();
    },

    /**
     * Calcula el número total de items en el carrito.
     */
    getTotalItemCount: function() {
        const cart = this.get();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    /**
     * Calcula el precio total de todos los items en el carrito.
     */
    getTotalPrice: function() {
        return this.get().reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // === MÉTODOS DE UI (INTERFAZ) ===

    /**
     * Actualiza el contador del ícono del carrito.
     */
    updateIcon: function() {
        const cartIcon = document.getElementById('cart-icon-container');
        if (!cartIcon) return;

        const countBadge = cartIcon.querySelector('.cart-badge');
        const totalItems = this.getTotalItemCount();

        if (totalItems > 0) {
            countBadge.textContent = totalItems > 99 ? '99+' : totalItems;
            countBadge.classList.remove('hidden');
        } else {
            countBadge.classList.add('hidden');
        }
    },

    /**
     * Crea y muestra el modal del carrito.
     */
    showModal: function() {
        if (document.getElementById('cart-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'cart-modal';
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-modal-overlay"></div>
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2>Tu Carrito</h2>
                    <button class="cart-modal-close-btn">×</button>
                </div>
                <div class="cart-modal-body">
                    <!-- Contenido renderizado por renderModalContent -->
                </div>
                <div class="cart-modal-footer">
                    <div class="cart-total">
                        <strong>Total:</strong>
                        <span id="cart-total-price">0.00 €</span>
                    </div>
                    <button class="checkout-button">Proceder al Pago</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        this.renderModalContent();

        // Asignar listeners a los elementos del modal
        modal.querySelector('.cart-modal-overlay').addEventListener('click', () => this.hideModal());
        modal.querySelector('.cart-modal-close-btn').addEventListener('click', () => this.hideModal());
        
        modal.querySelector('.checkout-button').addEventListener('click', () => {
            if (this.get().length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
            this.handleCheckout(modal);
        });
        
        modal.querySelector('.cart-modal-body').addEventListener('click', (event) => {
            const target = event.target;
            const itemId = target.closest('.cart-item')?.dataset.itemId;
            if (itemId && target.classList.contains('cart-item-remove')) {
                this.remove(itemId);
            }
        });

        modal.querySelector('.cart-modal-body').addEventListener('change', (event) => {
             const target = event.target;
             if (target.classList.contains('cart-item-quantity-input')) {
                const itemId = target.closest('.cart-item')?.dataset.itemId;
                const newQuantity = parseInt(target.value, 10);
                if (itemId) this.updateQuantity(itemId, newQuantity);
             }
        });
    },
    
    /**
     * Maneja el proceso de "pago".
     */
    handleCheckout: function(modal) {
        this.clear();
        
        const modalContent = modal.querySelector('.cart-modal-content');
        modalContent.innerHTML = `
            <div class="cart-modal-header">
                <h2>¡Compra Realizada!</h2>
                <button class="cart-modal-close-btn">×</button>
            </div>
            <div class="cart-modal-body">
                <div class="purchase-success-message">
                    <p>🎉</p>
                    <h3>¡Gracias por tu compra!</h3>
                    <p>Pronto te enviaremos tus cartas Pokémon a tu domicilio.</p>
                </div>
            </div>
        `;
        modalContent.querySelector('.cart-modal-close-btn').addEventListener('click', () => this.hideModal());
    },

    /**
     * Oculta y elimina el modal del DOM con una animación.
     */
    hideModal: function() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    },

    /**
     * Renderiza la lista de items dentro del modal.
     */
    renderModalContent: function() {
        const modalBody = document.querySelector('.cart-modal-body');
        const totalPriceEl = document.getElementById('cart-total-price');
        const checkoutButton = document.querySelector('.checkout-button');
        if (!modalBody) return;

        const cart = this.get();

        if (cart.length === 0) {
            modalBody.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
            if(checkoutButton) checkoutButton.style.display = 'none'; // Ocultar botón si no hay items
            if(totalPriceEl) totalPriceEl.parentElement.style.display = 'none';
        } else {
            modalBody.innerHTML = cart.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${item.price.toFixed(2)} €</span>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" class="cart-item-quantity-input" value="${item.quantity}" min="1" max="10">
                        <button class="cart-item-remove" title="Eliminar item">×</button>
                    </div>
                </div>
            `).join('');
            if(checkoutButton) checkoutButton.style.display = 'block';
            if(totalPriceEl) totalPriceEl.parentElement.style.display = 'block';
        }
        
        if (totalPriceEl) {
            totalPriceEl.textContent = `${this.getTotalPrice().toFixed(2)} €`;
        }
    }
};

// Listener principal que se ejecuta cuando el DOM está listo.
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateIcon();
    const cartIcon = document.getElementById('cart-icon-container');
    if(cartIcon) {
        cartIcon.addEventListener('click', () => {
            Cart.showModal();
        });
    }
});