// Ensure the cart is initialized in localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to add item to cart
function addToCart(productId) {
    const productElement = document.getElementById(productId);
    const productName = productElement.querySelector("h3").innerText;
    const productPrice = parseFloat(productElement.querySelector(".price").innerText.replace("R", ""));
    const selectedSize = productElement.querySelector("select[id^='shirt-size']").value;
    const selectedColor = productElement.querySelector("select[id^='color']").value;
    const personalization = productElement.querySelector("input[id^='name']").value;

    // Create product object
    let product = {
        id: productId,
        name: productName,
        price: productPrice,
        size: selectedSize,
        color: selectedColor,
        personalization: personalization || "None",
        quantity: 1
    };

    // Check if item already exists in cart
    let existingItem = cart.find(item => item.id === productId && item.size === selectedSize && item.color === selectedColor);
    if (existingItem) {
        existingItem.quantity += 1;  // Increment quantity if it already exists
    } else {
        cart.push(product);
    }

    // Save cart data
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
    alert(`${productName} added to cart!`);
}

// Function to display cart items on cart page
function displayCartItems() {
    let cartItemsContainer = document.getElementById("cart-items");
    let cartTotalElement = document.getElementById("cart-total");

    if (!cartItemsContainer || !cartTotalElement) return; // Stop if elements not found

    cartItemsContainer.innerHTML = ""; // Clear previous items
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach((item, index) => {
            let itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <p><strong>${item.name}</strong></p>
                <p>Size: ${item.size}, Color: ${item.color}</p>
                <p>Personalization: ${item.personalization}</p>
                <p>Quantity: <button onclick="updateQuantity(${index}, -1)">-</button> ${item.quantity} <button onclick="updateQuantity(${index}, 1)">+</button></p>
                <p>Price: R${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });
    }

    cartTotalElement.innerText = total.toFixed(2);
}

// Function to update item quantity
function updateQuantity(index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        cart.splice(index, 1); // Remove item if quantity is zero
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems();
}

// Function to remove an item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems();
}

// Function to update cart icon count
function updateCartDisplay() {
    let cartCountElement = document.getElementById("cart-count");
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.innerText = totalItems;
    }
}

// Function to send order details to WhatsApp
function sendOrderToWhatsApp(event) {
    event.preventDefault(); // Prevent default form submission

    let phoneNumber = "27676162809"; // Your actual WhatsApp phone number with country code (without "+")
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Collect customer details from the form
    let customerName = document.getElementById("customer-name").value || "No Name Provided";
    let customerPhone = document.getElementById("customer-phone").value || "No Phone Provided";
    let customerAddress = document.getElementById("customer-address").value || "No Address Provided";

    // Build WhatsApp message
    let message = `*New Order from ML Collective!*\n\n`;
    message += `👤 *Customer:* ${customerName}\n`;
    message += `📞 *Phone:* ${customerPhone}\n`;
    message += `📍 *Address:* ${customerAddress}\n\n`;
    message += `🛒 *Order Details:*\n`;

    let totalPrice = 0;
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   - Size: ${item.size}\n`;
        message += `   - Color: ${item.color}\n`;
        message += `   - Personalization: ${item.personalization}\n`;
        message += `   - Quantity: ${item.quantity}\n`;
        message += `   - Price: R${(item.price * item.quantity).toFixed(2)}\n\n`;
        totalPrice += item.price * item.quantity;
    });

    message += `*Total Price:* R${totalPrice.toFixed(2)}\n\n`;
    message += `📦 Please confirm my order. Thank you!`;

    let encodedMessage = encodeURIComponent(message);
    let whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Open WhatsApp with pre-filled message
    window.open(whatsappURL, "_blank");

    // Clear cart after sending order
    localStorage.removeItem("cart");
    cart = [];
    updateCartDisplay();
    displayCartItems();
}

// Clear cart on order submit
document.addEventListener("DOMContentLoaded", function () {
    displayCartItems();
    updateCartDisplay();

    let orderForm = document.getElementById("customer-form");
    if (orderForm) {
        orderForm.addEventListener("submit", sendOrderToWhatsApp);
    }
});
