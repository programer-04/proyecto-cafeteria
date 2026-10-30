/* ==========================================
1. ESTADO GLOBAL DEL CARRITO
   ================================---------- */
let cart = [];


/* ==========================================
   2. CONTROL DE NAVEGACIÓN ENTRE PANTALLAS
   ================================---------- */
function goToStep(stepNumber) {
  const pages = document.querySelectorAll('.step-page');
  pages.forEach(page => page.classList.add('hidden'));

  const targetPage = document.getElementById(`step-${stepNumber}`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


/* ==========================================
   3. ABRIR DETALLE DINÁMICO DEL PRODUCTO
   ================================---------- */
// Carga la información específica del producto seleccionado y salta al paso 3
function openProductDetail(name, price, image, description) {
  document.getElementById('detail-title').textContent = name;
  document.getElementById('detail-price').textContent = `S/ ${price.toFixed(2)}`;
  document.getElementById('detail-img').src = image;
  document.getElementById('detail-desc').textContent = description;

  // Configurar el botón de agregar en la vista de detalle
  const addBtn = document.getElementById('detail-add-btn');
  addBtn.onclick = function(event) {
    addToCart(event, name, price, image);
    goToStep(4); // Salta directamente al carrito tras agregar
  };

  goToStep(3);
}


/* ==========================================
   4. GESTIÓN DEL CARRITO (AGREGAR Y ELIMINAR)
   ================================---------- */
function addToCart(event, name, price, image) {
  if (event) event.stopPropagation();

  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: Date.now(),
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }

  updateCartUI();
  
  if (event && event.currentTarget && event.currentTarget.tagName === 'BUTTON') {
    const btn = event.currentTarget;
    btn.classList.add('scale-125', 'bg-green-600');
    setTimeout(() => {
      btn.classList.remove('scale-125', 'bg-green-600');
    }, 200);
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

// Función para aumentar o disminuir cantidades directamente desde las tarjetas
function changeQuantity(event, name, price, image, delta) {
  if (event) event.stopPropagation();

  let item = cart.find(i => i.name === name);

  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
  } else if (delta > 0) {
    cart.push({
      id: Date.now(),
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }

  updateCartUI();
}


/* ==========================================
   5. RENDERIZADO Y CÁLCULOS FINANCIEROS
   ================================---------- */
function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items-list');
  const cartBadge = document.getElementById('cart-badge');
  const subtotalEl = document.getElementById('cart-subtotal');
  const igvEl = document.getElementById('cart-igv');
  const totalEl = document.getElementById('cart-total');
  const checkoutTotalEl = document.getElementById('cart-checkout-total');

  // Actualizar contadores individuales en cada tarjeta del menú
  document.querySelectorAll('.product-card').forEach(card => {
    const productName = card.getAttribute('data-name');
    const qtySpan = document.getElementById(`qty-${productName}`);
    if (qtySpan) {
      const cartItem = cart.find(i => i.name === productName);
      qtySpan.textContent = cartItem ? cartItem.quantity : '0';
    }
  });

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItemsCount;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  // Botón flotante inferior de "Ir al carrito"
  const floatingBtn = document.getElementById('floating-cart-btn');
  const floatingCount = document.getElementById('floating-cart-count');
  const floatingTotal = document.getElementById('floating-cart-total');

  if (floatingBtn) {
    if (totalItemsCount > 0) {
      floatingBtn.classList.remove('hidden');
      if (floatingCount) floatingCount.textContent = totalItemsCount;
      if (floatingTotal) floatingTotal.textContent = `S/ ${total.toFixed(2)}`;
    } else {
      floatingBtn.classList.add('hidden');
    }
  }

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i class="fa-solid fa-cart-flatbed text-4xl mb-3"></i>
        <p class="text-xs font-semibold">Tu carrito está vacío</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = 'S/ 0.00';
    if (igvEl) igvEl.textContent = 'S/ 0.00';
    if (totalEl) totalEl.textContent = 'S/ 0.00';
    if (checkoutTotalEl) checkoutTotalEl.textContent = 'S/ 0.00';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
      <div class="flex items-center space-x-3">
        <img src="${item.image}" class="w-12 h-12 rounded-xl object-cover" />
        <div>
          <h5 class="text-xs font-bold text-gray-800">${item.name}</h5>
          <p class="text-xs font-bold text-gray-900 mt-0.5">S/ ${item.price.toFixed(2)} ${item.quantity > 1 ? `<span class="text-gray-400 font-normal">x${item.quantity}</span>` : ''}</p>
        </div>
      </div>
      <button onclick="removeFromCart(${item.id})" class="text-utp-red hover:text-red-700 p-2 transition">
        <i class="fa-solid fa-trash text-xs"></i>
      </button>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
  if (igvEl) igvEl.textContent = `S/ ${igv.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
  if (checkoutTotalEl) checkoutTotalEl.textContent = `S/ ${total.toFixed(2)}`;
}


/* ==========================================
   6. FILTRADO Y BÚSQUEDA
   ================================---------- */
function filterCategory(categoryName) {
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-utp-red', 'text-white', 'shadow-sm');
    btn.classList.add('bg-gray-100', 'text-gray-600');
  });

  const activeBtn = document.getElementById(`btn-cat-${categoryName}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-gray-100', 'text-gray-600');
    activeBtn.classList.add('bg-utp-red', 'text-white', 'shadow-sm');
  }

  const products = document.querySelectorAll('.product-card');
  products.forEach(product => {
    const productCategory = product.getAttribute('data-category');
    if (categoryName === 'todos' || productCategory === categoryName) {
      product.classList.remove('hidden');
    } else {
      product.classList.add('hidden');
    }
  });
}

function searchProducts() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const products = document.querySelectorAll('.product-card');

  products.forEach(product => {
    const title = product.querySelector('.product-title').textContent.toLowerCase();
    if (title.includes(query)) {
      product.classList.remove('hidden');
    } else {
      product.classList.add('hidden');
    }
  });
}


/* ==========================================
   7. INICIALIZACIÓN
   ================================---------- */
document.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
  updateCartUI();
});

// Seleccionar método de pago de forma interactiva
function selectPayment(selectedCard) {
  const options = document.querySelectorAll('.payment-option');
  options.forEach(card => {
    card.classList.remove('bg-red-50/60', 'border-2', 'border-utp-red');
    card.classList.add('bg-white', 'border', 'border-gray-200');
    
    const icon = card.querySelector('.radio-icon');
    icon.className = 'fa-regular fa-circle text-gray-300 text-sm radio-icon';
  });

  selectedCard.classList.remove('bg-white', 'border', 'border-gray-200');
  selectedCard.classList.add('bg-red-50/60', 'border-2', 'border-utp-red');
  
  const selectedIcon = selectedCard.querySelector('.radio-icon');
  selectedIcon.className = 'fa-solid fa-circle-dot text-utp-red text-sm radio-icon';
}