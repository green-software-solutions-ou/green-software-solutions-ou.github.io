// Debug script to test menu creation
import { Menu } from './components/Menu.js';
import { MenuItem } from './components/MenuItem.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get menu container
    const menuContainer = document.getElementById('menu-container');
    
    // Create some test menu items
    const items = [
        new MenuItem('home', 'Home', '#', true),
        new MenuItem('about', 'About', '#', false),
        new MenuItem('contact', 'Contact', '#', false)
    ];
    
    // Create menu
    const menu = new Menu(menuContainer, items);
}); 