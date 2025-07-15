document.addEventListener("DOMContentLoaded", () => {
  // Load cart from localStorage or initialize empty cart
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Update cart display (count and price)
  function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);

    // Update cart count and total on the page
    const headerCount = document.getElementById("cart-count");
    const menuCount = document.getElementById("cart-count-display");
    const menuTotal = document.getElementById("cart-total-display");

    if (headerCount) headerCount.textContent = `(${totalItems})`;
    if (menuCount) menuCount.textContent = totalItems;
    if (menuTotal) menuTotal.textContent = totalPrice.toFixed(2);
    renderCartPreview();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
  }

  function renderCartPreview() {
    const list = document.getElementById("cart-preview");
    const hiddenInput = document.getElementById("cart-data");
    const totalEl = document.getElementById("cart-form-total");

    if (!list || !hiddenInput || !totalEl) return;

    list.innerHTML = "";

    if (cart.length === 0) {
      list.innerHTML = "<li>Your cart is empty.</li>";
      totalEl.textContent = "0";
      hiddenInput.value = "";
      return;
    }

    let total = 0;

    cart.forEach((item, i) => {
      total += item.total;
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} x${item.quantity} – ${item.total.toFixed(2)} Birr
        <button type="button" data-index="${i}" class="remove-btn">❌</button>
      `;
      list.appendChild(li);
    });

    totalEl.textContent = total.toFixed(2);
    hiddenInput.value = JSON.stringify(cart, null, 2);

    const removeBtns = document.querySelectorAll(".remove-btn");
    removeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        removeFromCart(index);
      });
    });
  }


  // Add item to cart logic
  function addToCart(name, price) {
    price = parseFloat(price);
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
      existing.total += price;
    } else {
      cart.push({ name, price, quantity: 1, total: price });
    }
    saveCart();
    updateCartDisplay();
    alert(`${name} added to cart ✅`);
  }

  // Handle “Add to Cart” buttons
  const buttons = document.querySelectorAll(".add-to-cart");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });

  // Inject cart data into hidden input before form submit (for Formspree)
  const form = document.querySelector("form");
  if (form) {

    let cartInput = document.getElementById("cart-data");
    if (!cartInput) {
    cartInput = document.createElement("input");
    cartInput.type = "hidden";
    cartInput.name = "cart";
    cartInput.id = "cart-data";
    form.appendChild(cartInput);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default form reload

      // Inject cart into form data
      cartInput.value = JSON.stringify(cart, null, 2); // pretty JSON

      // Create form data object
      const formData = new FormData(form);

      // Submit form via fetch
      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      })
      .then(response => {
        if (response.ok) {
          showSuccessMessage();
          form.reset();
          cart.length = 0; 
          saveCart();
          updateCartDisplay() // Clear form after success
        } else {
          alert("Something went wrong. Please try again.");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Network error. Please try again later.");
      });
    });
  }

  // Success message popup with animation
  function showSuccessMessage() {
    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.innerText = "✅ Order received! We're on it.";

    document.body.appendChild(popup);

    // Trigger animation
    setTimeout(() => {
      popup.classList.add("show");
    }, 100);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 500);
    }, 3500);
  }

  // Initial cart display update
  updateCartDisplay();
});
