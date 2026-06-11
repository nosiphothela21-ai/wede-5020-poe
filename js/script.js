// BestiesBakes Interactive Features with Shopping Cart & Integrated Payment Form
// Handles cart management, multiple items, real-time calculations, and built-in payment

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== SHOPPING CART SYSTEM ====================
    
    // Cart array to store items
    let cart = [];
    
    // Load cart from localStorage if exists
    function loadCart() {
        const savedCart = localStorage.getItem('bestiesbakes_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
            updateCartDisplay();
        }
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('bestiesbakes_cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
    
    // Add item to cart
    function addToCart(productName, price, quantity = 1) {
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: Date.now(),
                name: productName,
                price: price,
                quantity: quantity
            });
        }
        
        saveCart();
        showNotification(`✨ Added ${quantity}x ${productName} to cart!`, 'success');
    }
    
    // Remove item from cart
    function removeFromCart(itemId) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
            showNotification(`🗑️ Removed ${item.name} from cart`, 'info');
        }
    }
    
    // Update quantity of an item
    function updateQuantity(itemId, newQuantity) {
        const item = cart.find(i => i.id === itemId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            saveCart();
        } else if (newQuantity <= 0) {
            removeFromCart(itemId);
        }
    }
    
    // Calculate cart total with delivery
    function calculateTotal(deliveryFee = 0) {
        let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        return { subtotal, total: subtotal + deliveryFee };
    }
    
    // Update cart count badge
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(el => {
            if (totalItems > 0) {
                el.textContent = totalItems;
                el.style.display = 'inline-block';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    // Create cart sidebar with integrated payment form
    function createCartSidebar() {
        if (document.querySelector('.cart-sidebar')) return;
        
        const cartSidebar = document.createElement('div');
        cartSidebar.className = 'cart-sidebar';
        cartSidebar.innerHTML = `
            <div class="cart-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Cart <span class="cart-count">0</span></h3>
                <button class="close-cart"><i class="fas fa-times"></i></button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span class="subtotal-amount">R0.00</span>
                    </div>
                    <div class="summary-row delivery-row" style="display: none;">
                        <span>Delivery Fee:</span>
                        <span class="delivery-fee-amount">R40.00</span>
                    </div>
                    <div class="summary-row total-row">
                        <span><strong>Total:</strong></span>
                        <span class="total-amount"><strong>R0.00</strong></span>
                    </div>
                </div>
                
                <!-- Delivery Option -->
                <div class="delivery-option">
                    <label class="delivery-label">
                        <input type="radio" name="deliveryOption" value="pickup" checked>
                        <i class="fas fa-store"></i> Pickup (Free)
                    </label>
                    <label class="delivery-label">
                        <input type="radio" name="deliveryOption" value="delivery">
                        <i class="fas fa-truck"></i> Delivery (+R40)
                    </label>
                </div>
                
                <!-- Integrated Payment Form -->
                <div class="payment-form-section">
                    <h4><i class="fas fa-credit-card"></i> Payment Details</h4>
                    
                    <div class="payment-methods">
                        <label class="payment-method-label">
                            <input type="radio" name="paymentMethod" value="card" checked>
                            <i class="fas fa-credit-card"></i> Credit/Debit Card
                        </label>
                        <label class="payment-method-label">
                            <input type="radio" name="paymentMethod" value="eft">
                            <i class="fas fa-university"></i> EFT
                        </label>
                        <label class="payment-method-label">
                            <input type="radio" name="paymentMethod" value="cash">
                            <i class="fas fa-money-bill-wave"></i> Cash on Delivery
                        </label>
                    </div>
                    
                    <!-- Card Payment Fields -->
                    <div id="cardPaymentFields" class="payment-fields">
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Cardholder Name</label>
                            <input type="text" id="cardName" placeholder="Nosipho" class="payment-input">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-credit-card"></i> Card Number</label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" class="payment-input">
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>Expiry (MM/YY)</label>
                                <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5" class="payment-input">
                            </div>
                            <div class="form-group half">
                                <label>CVV</label>
                                <input type="text" id="cardCvv" placeholder="123" maxlength="4" class="payment-input">
                            </div>
                        </div>
                    </div>
                    
                    <!-- EFT Payment Fields -->
                    <div id="eftPaymentFields" class="payment-fields" style="display: none;">
                        <div class="bank-info">
                            <p><i class="fas fa-building"></i> <strong>BestiesBakes Business Account</strong></p>
                            <p>Bank: FNB</p>
                            <p>Account Name: BestiesBakes Bakery</p>
                            <p>Account Number: 628 345 67890</p>
                            <p>Branch Code: 250655</p>
                            <p>Reference: BB-<span id="eftRef">xxxx</span></p>
                        </div>
                        <div class="form-group">
                            <label>Your Name (for reference)</label>
                            <input type="text" id="eftName" placeholder="Full name" class="payment-input">
                        </div>
                    </div>
                    
                    <!-- Cash Payment Fields -->
                    <div id="cashPaymentFields" class="payment-fields" style="display: none;">
                        <div class="cash-info">
                            <i class="fas fa-check-circle" style="color: #27ae60;"></i>
                            <p>Pay with cash when your order arrives.<br>Please have exact change ready.</p>
                        </div>
                    </div>
                    
                    <!-- Customer Details -->
                    <div class="customer-details">
                        <h4><i class="fas fa-user-circle"></i> Contact Info</h4>
                        <div class="form-group">
                            <input type="text" id="customerName" placeholder="Full Name *" class="payment-input">
                        </div>
                        <div class="form-group">
                            <input type="tel" id="customerPhone" placeholder="Phone Number *" class="payment-input">
                        </div>
                        <div class="form-group">
                            <input type="email" id="customerEmail" placeholder="Email Address" class="payment-input">
                        </div>
                        <div class="form-group" id="addressGroup" style="display: none;">
                            <textarea id="deliveryAddress" placeholder="Delivery Address *" rows="2" class="payment-input"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="cart-actions">
                    <button class="checkout-pay-btn"><i class="fas fa-lock"></i> Pay & Confirm Order</button>
                    <button class="clear-cart-btn"><i class="fas fa-trash"></i> Clear Cart</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(cartSidebar);
        
        // Add styles for cart sidebar and payment form
        const cartStyles = document.createElement('style');
        cartStyles.textContent = `
            .cart-sidebar {
                position: fixed;
                top: 0;
                right: -450px;
                width: 450px;
                height: 100vh;
                background: white;
                box-shadow: -5px 0 30px rgba(0,0,0,0.2);
                z-index: 10000;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .cart-sidebar.open {
                right: 0;
            }
            
            .cart-header {
                padding: 20px;
                background: linear-gradient(135deg, #d48f3b, #b45f2b);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .cart-header h3 {
                margin: 0;
                font-size: 1.3rem;
            }
            
            .close-cart {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .close-cart:hover {
                transform: scale(1.1);
            }
            
            .cart-items {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                max-height: 35vh;
            }
            
            .cart-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                margin-bottom: 10px;
                background: #fff8f0;
                border-radius: 10px;
                border-left: 4px solid #d48f3b;
            }
            
            .cart-item-info {
                flex: 1;
            }
            
            .cart-item-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .cart-item-price {
                color: #d48f3b;
                font-size: 0.85rem;
            }
            
            .cart-item-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quantity-btn {
                background: #d48f3b;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-weight: bold;
            }
            
            .quantity-btn:hover {
                background: #b45f2b;
            }
            
            .quantity-num {
                min-width: 30px;
                text-align: center;
                font-weight: bold;
            }
            
            .remove-item {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.75rem;
            }
            
            .cart-footer {
                padding: 20px;
                border-top: 2px solid #eee;
                background: #f9f9f9;
                overflow-y: auto;
                max-height: 65vh;
            }
            
            .cart-summary {
                background: white;
                padding: 12px;
                border-radius: 12px;
                margin-bottom: 15px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
            }
            
            .total-row {
                border-top: 2px solid #eee;
                margin-top: 5px;
                padding-top: 10px;
                font-size: 1.2rem;
                color: #d48f3b;
            }
            
            .delivery-option {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                background: white;
                padding: 12px;
                border-radius: 12px;
            }
            
            .delivery-label {
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 20px;
                background: #f0f0f0;
                transition: all 0.2s;
            }
            
            .delivery-label:has(input:checked) {
                background: #ffe6cc;
            }
            
            .payment-form-section {
                background: white;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .payment-form-section h4 {
                margin-bottom: 12px;
                color: #5e2e1c;
                font-size: 1rem;
            }
            
            .payment-methods {
                display: flex;
                gap: 12px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }
            
            .payment-method-label {
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: #f5f5f5;
                border-radius: 25px;
                font-size: 0.85rem;
                transition: all 0.2s;
            }
            
            .payment-method-label:has(input:checked) {
                background: #d48f3b;
                color: white;
            }
            
            .payment-fields {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #eee;
            }
            
            .form-group {
                margin-bottom: 12px;
            }
            
            .form-group label {
                display: block;
                font-size: 0.8rem;
                margin-bottom: 4px;
                color: #666;
            }
            
            .payment-input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 0.9rem;
                transition: border 0.2s;
            }
            
            .payment-input:focus {
                outline: none;
                border-color: #d48f3b;
            }
            
            .form-row {
                display: flex;
                gap: 12px;
            }
            
            .half {
                flex: 1;
            }
            
            .bank-info {
                background: #f0f8ff;
                padding: 12px;
                border-radius: 10px;
                font-size: 0.8rem;
                margin-bottom: 12px;
            }
            
            .bank-info p {
                margin: 4px 0;
            }
            
            .cash-info {
                text-align: center;
                padding: 15px;
                background: #e8f5e9;
                border-radius: 10px;
                color: #2e7d32;
            }
            
            .customer-details {
                margin-top: 15px;
            }
            
            .cart-actions {
                display: flex;
                gap: 10px;
                margin-top: 10px;
            }
            
            .checkout-pay-btn {
                flex: 2;
                padding: 12px;
                background: linear-gradient(135deg, #27ae60, #219a52);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .checkout-pay-btn:hover {
                transform: translateY(-2px);
            }
            
            .clear-cart-btn {
                flex: 1;
                padding: 12px;
                background: #95a5a6;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
            }
            
            .clear-cart-btn:hover {
                background: #7f8c8d;
            }
            
            .cart-toggle {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #d48f3b;
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                font-size: 24px;
                transition: all 0.3s ease;
            }
            
            .cart-toggle:hover {
                background: #b45f2b;
                transform: scale(1.05);
            }
            
            .cart-toggle .cart-count {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                padding: 4px 8px;
                font-size: 12px;
                min-width: 20px;
            }
            
            @media (max-width: 600px) {
                .cart-sidebar {
                    width: 100%;
                    right: -100%;
                }
            }
        `;
        document.head.appendChild(cartStyles);
        
        // Cart toggle button
        const cartToggle = document.createElement('button');
        cartToggle.className = 'cart-toggle';
        cartToggle.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-count">0</span>';
        document.body.appendChild(cartToggle);
        
        // Event listeners
        cartToggle.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            updateCartDisplay();
        });
        
        document.querySelector('.close-cart').addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });
        
        // Delivery option change
        const deliveryRadios = document.querySelectorAll('input[name="deliveryOption"]');
        const addressGroup = document.getElementById('addressGroup');
        
        deliveryRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateCartDisplay();
                if (this.value === 'delivery') {
                    addressGroup.style.display = 'block';
                } else {
                    addressGroup.style.display = 'none';
                }
            });
        });
        
        // Payment method switching
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        const cardFields = document.getElementById('cardPaymentFields');
        const eftFields = document.getElementById('eftPaymentFields');
        const cashFields = document.getElementById('cashPaymentFields');
        
        // Generate EFT reference
        document.getElementById('eftRef').textContent = Math.floor(Date.now() % 1000000);
        
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                cardFields.style.display = 'none';
                eftFields.style.display = 'none';
                cashFields.style.display = 'none';
                
                if (this.value === 'card') cardFields.style.display = 'block';
                else if (this.value === 'eft') eftFields.style.display = 'block';
                else if (this.value === 'cash') cashFields.style.display = 'block';
            });
        });
        
        // Format card number
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value.substring(0, 19);
            });
        }
        
        // Format expiry
        const expiryInput = document.getElementById('cardExpiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value.substring(0, 5);
            });
        }
        
        // Clear cart button
        document.querySelector('.clear-cart-btn').addEventListener('click', () => {
            if (confirm('Clear all items from cart?')) {
                cart = [];
                saveCart();
                updateCartDisplay();
                showNotification('Cart cleared!', 'info');
            }
        });
        
        // Pay button
        document.querySelector('.checkout-pay-btn').addEventListener('click', () => {
            processPayment();
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (cartSidebar.classList.contains('open') && 
                !cartSidebar.contains(e.target) && 
                !cartToggle.contains(e.target)) {
                cartSidebar.classList.remove('open');
            }
        });
    }
    
    // Process payment and create order
    function processPayment() {
        if (cart.length === 0) {
            showNotification('Your cart is empty! Add some items first.', 'error');
            return;
        }
        
        // Get customer details
        const customerName = document.getElementById('customerName')?.value.trim();
        const customerPhone = document.getElementById('customerPhone')?.value.trim();
        const customerEmail = document.getElementById('customerEmail')?.value.trim();
        
        if (!customerName || !customerPhone) {
            showNotification('Please enter your name and phone number', 'error');
            return;
        }
        
        // Get delivery option
        const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked')?.value;
        const deliveryFee = deliveryOption === 'delivery' ? 40 : 0;
        
        if (deliveryOption === 'delivery') {
            const address = document.getElementById('deliveryAddress')?.value.trim();
            if (!address) {
                showNotification('Please enter delivery address', 'error');
                return;
            }
        }
        
        // Get payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        // Validate card details if card payment
        if (paymentMethod === 'card') {
            const cardName = document.getElementById('cardName')?.value.trim();
            const cardNumber = document.getElementById('cardNumber')?.value.trim();
            const cardExpiry = document.getElementById('cardExpiry')?.value.trim();
            const cardCvv = document.getElementById('cardCvv')?.value.trim();
            
            if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
                showNotification('Please fill all card details', 'error');
                return;
            }
            
            if (cardNumber.replace(/\s/g, '').length < 15) {
                showNotification('Please enter valid card number', 'error');
                return;
            }
        }
        
        // Calculate totals
        const { subtotal, total } = calculateTotal(deliveryFee);
        
        // Build order summary
        let orderDetails = `🍰 BESTIESBAKES ORDER CONFIRMATION 🍰\n\n`;
        orderDetails += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        orderDetails += `CUSTOMER: ${customerName}\n`;
        orderDetails += `PHONE: ${customerPhone}\n`;
        orderDetails += `EMAIL: ${customerEmail || 'N/A'}\n`;
        orderDetails += `DELIVERY: ${deliveryOption === 'delivery' ? 'Delivery (+R40)' : 'Pickup (Free)'}\n`;
        if (deliveryOption === 'delivery') {
            orderDetails += `ADDRESS: ${document.getElementById('deliveryAddress')?.value}\n`;
        }
        orderDetails += `PAYMENT: ${paymentMethod === 'card' ? '💳 Credit Card' : paymentMethod === 'eft' ? '🏦 EFT' : '💰 Cash on Delivery'}\n\n`;
        
        orderDetails += `ITEMS:\n`;
        cart.forEach(item => {
            orderDetails += `  • ${item.name} x${item.quantity} = R${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        orderDetails += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        orderDetails += `Subtotal: R${subtotal.toFixed(2)}\n`;
        if (deliveryFee > 0) orderDetails += `Delivery: R${deliveryFee.toFixed(2)}\n`;
        orderDetails += `TOTAL: R${total.toFixed(2)}\n`;
        orderDetails += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        orderDetails += `Thank you for ordering from BestiesBakes! 🎂\n`;
        
        // Show success modal
        showOrderModal(orderDetails, paymentMethod);
        
        // Clear cart after successful order
        cart = [];
        saveCart();
        updateCartDisplay();
        
        // Close sidebar
        const sidebar = document.querySelector('.cart-sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
    
    // Show order confirmation modal
    function showOrderModal(orderDetails, paymentMethod) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 20000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            border-radius: 20px;
            padding: 25px;
            overflow-y: auto;
            text-align: center;
        `;
        
        const paymentIcon = paymentMethod === 'card' ? 'fa-credit-card' : (paymentMethod === 'eft' ? 'fa-university' : 'fa-money-bill-wave');
        const paymentColor = '#27ae60';
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <i class="fas ${paymentIcon}" style="font-size: 4rem; color: ${paymentColor};"></i>
                <h2 style="color: #d48f3b; margin-top: 10px;">Order Confirmed! 🎉</h2>
                <p>Your order has been received successfully.</p>
            </div>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 12px; overflow-x: auto; font-size: 12px; text-align: left; white-space: pre-wrap;">${orderDetails}</pre>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="closeOrderModal" style="flex: 1; padding: 12px; background: #d48f3b; color: white; border: none; border-radius: 10px; cursor: pointer;">Close</button>
                <button id="printOrder" style="flex: 1; padding: 12px; background: #3498db; color: white; border: none; border-radius: 10px; cursor: pointer;"><i class="fas fa-print"></i> Print</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        document.getElementById('closeOrderModal').addEventListener('click', () => modal.remove());
        document.getElementById('printOrder').addEventListener('click', () => {
            const printWin = window.open('', '_blank');
            printWin.document.write(`<html><head><title>BestiesBakes Order</title></head><body><pre>${orderDetails}</pre></body></html>`);
            printWin.print();
        });
    }
    
    // Update cart display in sidebar
    function updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const subtotalAmountSpan = document.querySelector('.subtotal-amount');
        const totalAmountSpan = document.querySelector('.total-amount');
        const deliveryRow = document.querySelector('.delivery-row');
        
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-shopping-cart" style="font-size: 3rem;"></i><p>Your cart is empty</p></div>';
            if (subtotalAmountSpan) subtotalAmountSpan.textContent = 'R0.00';
            if (totalAmountSpan) totalAmountSpan.textContent = 'R0.00';
            if (deliveryRow) deliveryRow.style.display = 'none';
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">R${item.price} each</div>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                        <span class="quantity-num">${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Get delivery fee
        const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked')?.value;
        const deliveryFee = deliveryOption === 'delivery' ? 40 : 0;
        const total = subtotal + deliveryFee;
        
        if (subtotalAmountSpan) subtotalAmountSpan.textContent = `R${subtotal.toFixed(2)}`;
        if (totalAmountSpan) totalAmountSpan.innerHTML = `<strong>R${total.toFixed(2)}</strong>`;
        
        if (deliveryRow) {
            if (deliveryFee > 0) {
                deliveryRow.style.display = 'flex';
                const deliveryFeeSpan = document.querySelector('.delivery-fee-amount');
                if (deliveryFeeSpan) deliveryFeeSpan.textContent = `R${deliveryFee.toFixed(2)}`;
            } else {
                deliveryRow.style.display = 'none';
            }
        }
        
        // Add event listeners
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(btn.dataset.id);
                const change = parseInt(btn.dataset.change);
                const item = cart.find(i => i.id === itemId);
                if (item) {
                    const newQuantity = item.quantity + change;
                    if (newQuantity > 0) {
                        updateQuantity(itemId, newQuantity);
                    } else {
                        removeFromCart(itemId);
                    }
                }
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(btn.dataset.id);
                removeFromCart(itemId);
            });
        });
    }
    
    // Helper function to escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // Add to cart buttons to products
    function addAddToCartButtons() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            if (card.querySelector('.add-to-cart-btn')) return;
            
            const productName = card.querySelector('h3')?.innerText;
            const priceElement = card.querySelector('.price');
            
            if (productName && priceElement) {
                let price = parseFloat(priceElement.innerText.replace('R', ''));
                
                const btnContainer = card.querySelector('.product-card-content');
                if (btnContainer && !card.querySelector('.add-to-cart-btn')) {
                    const addToCartBtn = document.createElement('button');
                    addToCartBtn.className = 'add-to-cart-btn';
                    addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                    addToCartBtn.style.cssText = `
                        background: #27ae60;
                        color: white;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 25px;
                        cursor: pointer;
                        margin-top: 10px;
                        width: 100%;
                        font-weight: bold;
                        transition: background 0.2s;
                    `;
                    
                    addToCartBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        addToCart(productName, price, 1);
                    });
                    
                    btnContainer.appendChild(addToCartBtn);
                }
            }
        });
    }
    
    // Notification function
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        const bgColor = type === 'success' ? 'linear-gradient(135deg, #27ae60, #219a52)' : 
                       type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                       'linear-gradient(135deg, #3498db, #2980b9)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            z-index: 10001;
            font-weight: bold;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        `;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Add animation styles
    if (!document.querySelector('#cart-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-animation-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ==================== INITIALIZE ====================
    loadCart();
    createCartSidebar();
    
    // Add add to cart buttons on product pages
    if (window.location.pathname.includes('products.html') || 
        window.location.pathname.includes('index.html') ||
        window.location.pathname === '/' || 
        window.location.pathname === '') {
        addAddToCartButtons();
        
        const observer = new MutationObserver(() => {
            addAddToCartButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Navigation highlight
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.style.backgroundColor = '#d48f3b';
            link.style.color = 'white';
            link.style.padding = '8px 15px';
            link.style.borderRadius = '25px';
        }
    });
    
    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 110px;
        right: 30px;
        background: #d48f3b;
        color: white;
        border: none;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        cursor: pointer;
        display: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9998;
    `;
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Welcome message
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname === '') {
        if (!sessionStorage.getItem('welcomeShown')) {
            setTimeout(() => {
                showNotification('🎉 Welcome to BestiesBakes! 🍰 Click the cart to order with integrated payment!', 'success');
                sessionStorage.setItem('welcomeShown', 'true');
            }, 1000);
        }
    }
    
    console.log('✅ BestiesBakes with integrated payment form loaded successfully!');
});