// --- Auth System Logic ---
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('feane_user'));
    if (!user && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
        // Redirection logic if needed
    }
    return user;
}

function login(email, password) {
    // Static Admin Check
    if (email === 'admin@feane.com' && password === 'admin123') {
        const adminUser = { email, role: 'admin', name: 'Administrator' };
        localStorage.setItem('feane_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
    }

    // Generic User Check
    const users = JSON.parse(localStorage.getItem('feane_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('feane_user', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
}

function register(name, email, password) {
    const users = JSON.parse(localStorage.getItem('feane_users')) || [];
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already exists' };
    }
    
    const newUser = { name, email, password, role: 'user' };
    users.push(newUser);
    localStorage.setItem('feane_users', JSON.stringify(users));
    return { success: true };
}

function logout() {
    localStorage.removeItem('feane_user');
    window.location.href = 'login.html';
}

// Global Exports
window.auth = { checkAuth, login, register, logout };
