const defaultMenu = [
    { id: 1, name: 'Monster Burger', description: 'Double flame-grilled patty, cheddar, and our secret beast sauce.', price: 250, category: 'Burger', img: 'img/f1.png' },
    { id: 2, name: 'Zesty Pizza', description: 'Spicy pepperoni, jalapeños, and premium mozzarella on a thin crust.', price: 350, category: 'Pizza', img: 'img/f2.png' },
    { id: 3, name: 'Mamma Mia Pizza', description: 'Traditional Italian pepperoni and a drizzle of spicy honey.', price: 450, category: 'Pizza', img: 'img/f3.png' },
    { id: 4, name: 'Creamy Pasta', description: 'Al dente fettuccine tossed in a rich parmesan cream sauce.', price: 150, category: 'Pasta', img: 'img/f4.png' },
    { id: 5, name: 'Golden Fries', description: 'House-cut potatoes triple-fried for maximum crunch.', price: 100, category: 'Fries', img: 'img/f5.png' },
    { id: 6, name: 'Classic Pizza', description: 'Our traditional recipe topped with premium ingredients.', price: 550, category: 'Pizza', img: 'img/f6.png' }
];

function initMenu() {
    if (!localStorage.getItem('feane_menu')) {
        localStorage.setItem('feane_menu', JSON.stringify(defaultMenu));
    }
}

function getMenu() {
    return JSON.parse(localStorage.getItem('feane_menu')) || [];
}

function saveMenu(menu) {
    localStorage.setItem('feane_menu', JSON.stringify(menu));
}

function addMenuItem(item) {
    const menu = getMenu();
    item.id = Date.now();
    menu.push(item);
    saveMenu(menu);
}

function updateMenuItem(id, updatedItem) {
    let menu = getMenu();
    const idx = menu.findIndex(i => i.id == id);
    if (idx !== -1) {
        menu[idx] = { ...menu[idx], ...updatedItem };
        saveMenu(menu);
    }
}

function deleteMenuItem(id) {
    const menu = getMenu().filter(i => i.id != id);
    saveMenu(menu);
}

window.menuManager = { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, initMenu };
initMenu();
