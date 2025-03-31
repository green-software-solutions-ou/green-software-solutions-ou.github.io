// Debug script to test menu creation
import { Menu } from './components/Menu.js';
import { MenuItem } from './components/MenuItem.js';

console.log('Debug script running...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in debug script');
    
    // Get menu container
    const menuContainer = document.getElementById('menu-container');
    console.log('Menu container:', menuContainer);
    
    // Create some test menu items
    const items = [
        new MenuItem('home', 'Home', '#', true),
        new MenuItem('about', 'About', '#', false),
        new MenuItem('contact', 'Contact', '#', false)
    ];
    
    console.log('Menu items created:', items);
    
    // Create menu
    const menu = new Menu(menuContainer, items);
    console.log('Menu created:', menu);
    
    console.log('Debug script complete');
}); 