document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard
    const user = auth.checkAuth();
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // 2. Navigation Logic
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('sectionTitle');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.section;
            switchSection(target);
        });
    });

    window.switchSection = function(target) {
        // Toggle Sidebar Active Class
        navItems.forEach(i => i.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-section="${target}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Toggle Section Visibility
        sections.forEach(s => s.classList.remove('active'));
        const targetSec = document.getElementById(`${target}Section`);
        if (targetSec) {
            targetSec.classList.add('active');
            // Update Header Title
            sectionTitle.textContent = target.charAt(0).toUpperCase() + target.slice(1) + (target === 'overview' ? ' Overview' : '');
            
            // Close mobile sidebar if open
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        } else {
            console.error(`Section #${target}Section not found in DOM!`);
        }

        // Refresh Data for specific sections
        if (target === 'overview') updateDashboardStats();
        if (target === 'orders') renderOrdersTable();
        if (target === 'menu') renderMenuTable();
        if (target === 'users') renderUsersTable();
        if (target === 'bookings') renderBookingsTable();
    };

    // Shared utility for dashboard if main.js is missing
    window.showToast = window.showToast || function(message) {
        console.log("Dashboard Alert:", message);
        alert(message); // Fallback until main.js is integrated or shared
    };

    // 3. Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('adminSidebarToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar on section switch (for mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active') && !sidebar.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // 4. Initial Load
    updateDashboardStats();
    renderRecentOrders();
});

// --- Dashboard Stats Logic ---
function updateDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('feane_orders')) || [];
    const menu = menuManager.getMenu();
    const users = JSON.parse(localStorage.getItem('feane_users')) || [];
    const bookings = JSON.parse(localStorage.getItem('feane_bookings')) || [];

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    document.getElementById('statTotalOrders').textContent = orders.length;
    document.getElementById('statTotalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
    document.getElementById('statPendingOrders').textContent = pendingOrders;
    document.getElementById('statTotalUsers').textContent = users.length + 1; // +1 for admin
    document.getElementById('statTotalMenu').textContent = menu.length;
    
    const resStat = document.getElementById('statTotalBookings');
    if (resStat) resStat.textContent = bookings.length;
}

function renderRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('feane_orders')) || [];
    const tbody = document.querySelector('#recentOrdersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const recent = [...orders].reverse().slice(0, 5); // Latest 5

    recent.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${order.id}</strong></td>
            <td>${order.customer ? order.customer.name : 'Guest'}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>₹${order.total}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Orders Management ---
window.renderOrdersTable = function(filter = 'all') {
    let orders = JSON.parse(localStorage.getItem('feane_orders')) || [];
    const tbody = document.querySelector('#allOrdersTable tbody');
    if (!tbody) return;

    if (filter !== 'all') {
        orders = orders.filter(o => o.status === filter);
    }

    tbody.innerHTML = '';
    orders.reverse().forEach(order => {
        const isDelivered = order.status === 'delivered';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${order.id}</strong></td>
            <td>
                <div style="font-weight:600">${order.customer?.name}</div>
                <div style="font-size:0.8rem; color: #64748b">${order.customer?.phone}</div>
            </td>
            <td>${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
            <td>₹${order.total}</td>
            <td>
                ${isDelivered ? 
                    `<span class="status-badge status-delivered locked"><i class="fas fa-lock"></i> Delivered</span>` :
                    `<select class="form-control" onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px 10px; font-size: 0.8rem; width: 120px;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>`
                }
            </td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteOrder('${order.id}')" ${isDelivered ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.updateOrderStatus = function(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('feane_orders')) || [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = newStatus;
        localStorage.setItem('feane_orders', JSON.stringify(orders));
        updateDashboardStats(); // Refresh stats in background
    }
};

window.deleteOrder = function(orderId) {
    if (confirm('Are you sure you want to delete this order record?')) {
        let orders = JSON.parse(localStorage.getItem('feane_orders')) || [];
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('feane_orders', JSON.stringify(orders));
        renderOrdersTable();
        updateDashboardStats();
    }
};

window.filterOrders = function(status) {
    // Update Filter UI
    const btns = document.querySelectorAll('#ordersSection .filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    renderOrdersTable(status);
};

// --- Menu Management ---
window.renderMenuTable = function() {
    const menu = menuManager.getMenu();
    const tbody = document.querySelector('#menuTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    menu.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="menu-item-card">
                    <img src="${item.img}" class="menu-item-img">
                    <div>
                        <div style="font-weight:600">${item.name}</div>
                        <div style="font-size:0.8rem; color: #64748b">ID: ${item.id}</div>
                    </div>
                </div>
            </td>
            <td><span class="status-badge" style="background:#f1f5f9; color:#475569">${item.category}</span></td>
            <td><strong>₹${item.price}</strong></td>
            <td style="max-width: 250px; font-size: 0.85rem;">${item.description}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn btn-edit" onclick="openMenuModal(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteMenuItem(${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.openMenuModal = function(id = null) {
    const modal = document.getElementById('menuModal');
    const form = document.getElementById('menuForm');
    const title = document.getElementById('modalTitle');
    
    modal.classList.add('active');

    if (id) {
        title.textContent = 'Edit Menu Item';
        const item = menuManager.getMenu().find(i => i.id == id);
        if (item) {
            document.getElementById('menuId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemDesc').value = item.description;
            document.getElementById('itemImg').value = item.img;
        }
    } else {
        title.textContent = 'Add New Item';
        form.reset();
        document.getElementById('menuId').value = '';
    }
};

window.closeMenuModal = function() {
    document.getElementById('menuModal').classList.remove('active');
};

document.getElementById('menuForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('menuId').value;
    const itemData = {
        name: document.getElementById('itemName').value,
        price: parseInt(document.getElementById('itemPrice').value),
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDesc').value,
        img: document.getElementById('itemImg').value
    };

    if (id) {
        menuManager.updateMenuItem(id, itemData);
    } else {
        menuManager.addMenuItem(itemData);
    }

    closeMenuModal();
    renderMenuTable();
    updateDashboardStats();
});

window.deleteMenuItem = function(id) {
    if (confirm('Remove this item from the menu?')) {
        menuManager.deleteMenuItem(id);
        renderMenuTable();
        updateDashboardStats();
    }
};

// --- User Management ---
window.renderUsersTable = function() {
    const users = JSON.parse(localStorage.getItem('feane_users')) || [];
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Add Admin manually since they might not be in the users list
    const allDisplayUsers = [
        { name: 'Admin Official', email: 'admin@feane.com', role: 'admin' },
        ...users
    ];

    allDisplayUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight:600">${user.name}</div>
            </td>
            <td>${user.email}</td>
            <td><span class="status-badge" style="background:#f1f5f9; color:#475569">${user.role}</span></td>
            <td><span class="status-badge status-delivered">Active</span></td>
            <td>
                ${user.role !== 'admin' ? `
                <button class="action-btn btn-delete" onclick="deleteUser('${user.email}')"><i class="fas fa-user-minus"></i></button>
                ` : '<small>Locked</small>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.deleteUser = function(email) {
    if (confirm(`Remove access for ${email}?`)) {
        let users = JSON.parse(localStorage.getItem('feane_users')) || [];
        users = users.filter(u => u.email !== email);
        localStorage.setItem('feane_users', JSON.stringify(users));
        renderUsersTable();
    }
};

// --- Booking Management ---
window.renderBookingsTable = function() {
    const bookings = JSON.parse(localStorage.getItem('feane_bookings')) || [];
    const tbody = document.querySelector('#bookingsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    bookings.reverse().forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${res.id}</strong></td>
            <td>
                <div style="font-weight:600">${res.name}</div>
                <div style="font-size:0.8rem; color: #64748b">${res.phone}</div>
            </td>
            <td><i class="fas fa-users"></i> ${res.persons}</td>
            <td>${res.date}</td>
            <td><span class="status-badge status-delivered">Confirmed</span></td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteBooking('${res.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.deleteBooking = function(id) {
    if (confirm('Cancel and delete this reservation?')) {
        let bookings = JSON.parse(localStorage.getItem('feane_bookings')) || [];
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem('feane_bookings', JSON.stringify(bookings));
        renderBookingsTable();
    }
};
