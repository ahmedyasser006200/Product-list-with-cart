// DOM Elements
let productBox = document.querySelector(".products-box");
let emptyState = document.querySelector(".empty-state");
let activeState = document.querySelector(".active-state");
let quantity = document.querySelector(".quantity");
let cartContent = document.querySelector(".active-state .items");
let totalPrice = document.querySelector(".order-total .total-price");
let confirmation = document.querySelector(".confirmation-overlay");
let confirmationItems = document.querySelector(".confirmation-items");
let confirmBtn = document.querySelector(".confirm-button");
let resetBtn = document.querySelector(".start-order-btn");
// Load Cart From Local Storage
let cartItems = [];
if (localStorage.getItem("cart")) {
  cartItems = JSON.parse(localStorage.getItem("cart"));
}
// Chack State
function updateCartState() {
  if (cartItems.length === 0) {
    activeState.style.display = "none";
    emptyState.style.display = "block";
  } else {
    activeState.style.display = "block";
    emptyState.style.display = "none";
  }
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  quantity.textContent = totalQuantity;
}
updateCartState();
// Fetch Products From JSON File
fetch("data.json")
  .then((response) => response.json())
  .then((products) => {
    products.forEach((product) => {
      let productEle = document.createElement("div");
      productEle.className = "product";
      productEle.setAttribute("data-name", product.name);
      let imageBox = document.createElement("div");
      imageBox.className = "image-box";
      let image = document.createElement("img");
      image.className = "image";
      if (window.innerWidth <= 768) {
        image.src = product.image.mobile;
      } else if (window.innerWidth <= 1024) {
        image.src = product.image.tablet;
      } else {
        image.src = product.image.desktop;
      }
      image.alt = product.name;
      imageBox.appendChild(image);
      let addBtn = document.createElement("button");
      addBtn.className = "add-button";
      let btnImage = document.createElement("img");
      btnImage.src = "assets/images/icon-add-to-cart.svg";
      addBtn.textContent = "Add to Cart";
      addBtn.prepend(btnImage);
      imageBox.appendChild(addBtn);
      productEle.appendChild(imageBox);
      let productText = document.createElement("div");
      productText.className = "product-text";
      let category = document.createElement("p");
      category.className = "category";
      category.textContent = product.category;
      let name = document.createElement("p");
      name.className = "name";
      name.textContent = product.name;
      let price = document.createElement("p");
      price.className = "price";
      price.textContent = `$${product.price.toFixed(2)}`;
      productText.appendChild(category);
      productText.appendChild(name);
      productText.appendChild(price);
      productEle.appendChild(productText);
      productBox.appendChild(productEle);
      // Add to Cart Event
      let savedItem = cartItems.find((item) => item.name === product.name);
      if (savedItem) {
        createEditButton(imageBox, addBtn, savedItem);
      }
      addBtn.addEventListener("click", () => {
        let newProduct = {
          ...product,
          quantity: 1,
        };

        cartItems.push(newProduct);

        createEditButton(imageBox, addBtn, newProduct);

        updateUI();
      });
    });
    updateUI();
    // Confirmation Event
    confirmBtn.addEventListener("click", renderConfirmation);
    resetBtn.addEventListener("click", () => {
      document.querySelectorAll(".product").forEach((product) => {
        let editBtn = product.querySelector(".edit-btn");
        let addBtn = product.querySelector(".add-button");

        if (editBtn) {
          editBtn.remove();
        }

        addBtn.style.display = "flex";
      });
      cartItems = [];
      updateUI();
      confirmation.style.display = "none";
    });
  });

// Build render function
function renderCart() {
  cartContent.innerHTML = ``;
  let content = ``;
  cartItems.forEach((item) => {
    content += `<div class="item" data-name="${item.name}">
      <h4 class="product-name">${item.name}</h4>
      <div class="product-details">
        <p class="item-quantity">${item.quantity}x</p>
        <p class="price-per-one">@ $${item.price.toFixed(2)}</p>
        <p class="total-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <button class="remove-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          fill="none"
          viewBox="0 0 10 10"
        >
          <path
            fill="#CAAFA7"
            d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"
          />
        </svg>
      </button>
    </div>`;
  });
  cartContent.innerHTML = content;
  cartItems.forEach((item) => {
    let productElement = document.querySelector(
      `.product[data-name="${item.name}"]`,
    );
    let cartItem = document.querySelector(`.item[data-name="${item.name}"]`);
    let removeBtn = cartItem.querySelector(".remove-button");
    let addBtn = productElement.querySelector(".add-button");
    let editBtn = productElement.querySelector(".edit-btn");
    removeBtn.addEventListener("click", () => {
      cartItems = cartItems.filter((product) => product.name !== item.name);
      editBtn.remove();
      addBtn.style.display = "flex";
      updateUI();
    });
  });
  totalPrice.textContent = `$${calculateTotal().toFixed(2)}`;
}
// Update UI Function
function updateUI() {
  saveCart();
  renderCart();
  updateCartState();
}
// Build confirmation Function
function renderConfirmation() {
  confirmation.style.display = "flex";
  confirmationItems.innerHTML = ``;
  let content = ``;
  cartItems.forEach((item) => {
    content += `<div class="confirmation-item">
        <div class="item-info">
          <img
            class="item-image"
            src="${item.image.thumbnail}"
            alt="${item.name}"
          />

          <div class="item-text">
            <p class="item-name">${item.name}</p>

            <div class="item-meta">
              <span class="item-quantity">${item.quantity}x</span>
              <span class="item-price">@ $${item.price}</span>
            </div>
          </div>
        </div>

        <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>`;
  });
  confirmationItems.innerHTML = content;
  confirmationItems.innerHTML += `<div class="confirmation-total">
      <p class="total-label">Order Total</p>
      <p class="total-price">$${calculateTotal().toFixed(2)}</p>
    </div>`;
}
// Build calculate Total Function
function calculateTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
// Save Cart In Local Storage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}
// Build Edit Button Function
function createEditButton(imageBox, addBtn, newProduct) {
  addBtn.style.display = "none";
  let editBtn = document.createElement("div");
  editBtn.className = "edit-btn";
  editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2" class="decrement"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
            <span class="count">${newProduct.quantity}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10" class="increment"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>`;
  let decrementBtn = editBtn.querySelector(".decrement");
  let incrementBtn = editBtn.querySelector(".increment");
  let quantityText = editBtn.querySelector(".count");
  incrementBtn.addEventListener("click", () => {
    newProduct.quantity++;
    quantityText.textContent = newProduct.quantity;
    updateUI();
  });
  decrementBtn.addEventListener("click", () => {
    if (newProduct.quantity === 1) {
      editBtn.remove();
      addBtn.style.display = "flex";
      cartItems = cartItems.filter((item) => item.name !== newProduct.name);
      updateUI();
    } else {
      newProduct.quantity--;
      quantityText.textContent = newProduct.quantity;
      updateUI();
    }
  });
  imageBox.appendChild(editBtn);
}
