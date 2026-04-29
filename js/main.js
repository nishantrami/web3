// Header Scroll Effect
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    const icon = menuToggle.querySelector('i');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');

        // Robust icon switching
        if (menuToggle.classList.contains('active')) {
            icon.className = 'fas fa-times'; // Force X icon
        } else {
            icon.className = 'fas fa-bars'; // Force Bars icon
        }
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            icon.className = 'fas fa-bars';
        });
    });
}

// Smooth Scroll for Nav Links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Back to Top Button
const backToTop = document.createElement('div');
backToTop.classList.add('back-to-top');
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// --- Proper Cart System Logic ---
function getCart() {
    return JSON.parse(localStorage.getItem('feane_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('feane_cart', JSON.stringify(cart));
    updateBadge();
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

const cartBadge = document.getElementById('cartBadge');
const cartToggle = document.getElementById('cartToggle');

if (cartToggle) {
    cartToggle.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
}

function updateBadge() {
    if (!cartBadge) return;
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;

    // Aesthetic shake animation
    cartBadge.classList.add('shake');
    setTimeout(() => cartBadge.classList.remove('shake'), 500);
}

// Initial update
updateBadge();
window.updateBadge = updateBadge;

// Auth Header Update
function updateHeaderAuth() {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;

    const user = JSON.parse(localStorage.getItem('feane_user'));
    if (user) {
        authLinks.innerHTML = `
            <div class="user-info-head">
                <i class="fas fa-user-circle"></i>
                <div class="user-dropdown">
                    <p>Hi, ${user.name.split(' ')[0]}</p>
                    ${user.role === 'admin' ? '<a href="dashboard.html"><i class="fas fa-cog"></i> Admin</a>' : ''}
                    <a href="javascript:void(0)" onclick="auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
    } else {
        authLinks.innerHTML = `<a href="login.html" class="login-btn-nav"><i class="fas fa-user-circle"></i> User Login</a>`;
    }
}

updateHeaderAuth();
window.updateHeaderAuth = updateHeaderAuth;

// Add to Cart
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-btn');
    if (btn) {
        const card = btn.closest('.menu-card');
        if (!card) return; // Prevent errors for other buttons

        const name = card.querySelector('h3').textContent;
        const price = parseInt(card.querySelector('.price').textContent.replace('₹', '').replace(',', ''));
        const img = card.querySelector('.menu-card-img img').src;

        addToCartFromData(name, price, img);

        // Visual Feedback
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = '<i class="fas fa-shopping-cart"></i>', 1000);
    }
});

// Proper Toast Notification System
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `
        <i class="fas fa-shopping-basket"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }, 100);
}

// --- Dynamic Menu Rendering ---
function renderMenuGrid(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const menu = menuManager.getMenu();
    let displayMenu = menu;

    if (filter !== 'all') {
        displayMenu = menu.filter(item => item.category.toLowerCase() === filter.toLowerCase());
    }

    container.innerHTML = displayMenu.map(item => `
        <div class="menu-card ${item.category ? item.category.toLowerCase() : ''}" 
             style="opacity:0; transform:translateY(30px);"
             onclick="window.location.href='product-details.html?id=${item.id}'">
          <div class="menu-card-img">
            <img src="${item.img}" alt="${item.name}">
          </div>
          <div class="menu-card-body">
            <h3>${item.name}</h3>
            ${item.description ? `<p>${item.description}</p>` : ''}
            <div class="menu-card-footer">
              <span class="price">₹${item.price}</span>
              <button class="cart-btn" onclick="event.stopPropagation(); addToCartFromData('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.img}')">
                <i class="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
    `).join('');

    // Trigger reveal animations
    setTimeout(() => {
        const cards = container.querySelectorAll('.menu-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('reveal');
            }, index * 100);
        });
    }, 50);
}

window.renderMenuGrid = renderMenuGrid;

// Bridge for cart logic
window.addToCartFromData = function (name, price, img) {
    const user = JSON.parse(localStorage.getItem('feane_user'));
    if (!user) {
        showToast("Please login to add items to cart!");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    let cart = getCart();
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }
    saveCart(cart);
    showToast(`Added ${name} to cart!`);
};

// Menu Filtering Logic
document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (filterBtn) {
        const section = filterBtn.closest('.menu-section');
        const grid = section.querySelector('.menu-grid');
        const filter = filterBtn.textContent.toLowerCase();

        // Update active button
        section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        filterBtn.classList.add('active');

        // Re-render grid with filter
        renderMenuGrid(grid.id, filter);
    }
});

// Update Reveal Observer for other elements
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function refreshObservers() {
    document.querySelectorAll('.offer-card, .about-img, .about-text, .value-card, .mission-box, .team-card').forEach(el => {
        if (!el.classList.contains('reveal')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        }
    });
}

const revealStyle = document.createElement('style');
revealStyle.innerHTML = `
    .reveal {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(revealStyle);

refreshObservers();

// --- Booking Form Logic ---
const bookingForm = document.querySelector('.booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = bookingForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;

        // Collect Form Data
        const formData = {
            id: `#RES-${Math.floor(1000 + Math.random() * 9000)}`,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            persons: document.getElementById('persons').value,
            date: document.getElementById('date').value,
            status: 'confirmed',
            submittedAt: new Date().toISOString()
        };

        // Save to LocalStorage for Admin Panel
        const bookings = JSON.parse(localStorage.getItem('feane_bookings')) || [];
        bookings.push(formData);
        localStorage.setItem('feane_bookings', JSON.stringify(bookings));

        // Visual "Processing" state
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Arranging...';
        submitBtn.style.opacity = '0.8';

        setTimeout(() => {
            // Success state
            submitBtn.innerHTML = 'Booking Confirmed!';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            submitBtn.style.color = '#fff';
            submitBtn.style.opacity = '1';

            showToast("Success! Your reservation has been confirmed.");

            // Reset form
            setTimeout(() => {
                bookingForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
            }, 3000);
        }, 1500);
    });
}
