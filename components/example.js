import { MenuController } from './MenuController.js'

// Example menu items
const menuItems = [
	{
		id: 'home',
		text: 'Home',
		href: 'index.html',
		isActive: true
	},
	{
		id: 'about',
		text: 'About',
		href: 'about.html',
		isActive: false
	},
	{
		id: 'free-software',
		text: 'Free Software',
		href: 'free-software.html',
		isActive: false
	},
	{
		id: 'contact',
		text: 'Contact',
		href: 'contact.html',
		isActive: false
	}
]

// Initialize the menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	// Create a container for the menu
	const menuContainer = document.createElement('div')
	menuContainer.className = 'menu-container'
	
	// Find where to insert the menu in the page
	const contentElement = document.getElementById('content')
	
	// Insert the menu container before the content
	document.body.insertBefore(menuContainer, contentElement)
	
	// Initialize the menu controller with the container and menu items
	const menuController = new MenuController(menuContainer, menuItems)
	
	// Example of how to add a new menu item programmatically
	// menuController.addMenuItem({
	//     id: 'services',
	//     text: 'Services',
	//     href: 'services.html',
	//     isActive: false
	// })
	
	// Example of how to set an active menu item programmatically
	// This could be used when navigating between pages
	// menuController.setActiveMenuItem('about')
})

// Example to update active menu item based on current URL path
function updateActiveMenuItem() {
	const currentPath = window.location.pathname
	let activeId = 'home' // Default
	
	if (currentPath.includes('about')) {
		activeId = 'about'
	} else if (currentPath.includes('free-software')) {
		activeId = 'free-software'
	} else if (currentPath.includes('contact')) {
		activeId = 'contact'
	}
	
	// Assuming menuController is accessible here
	// In a real application, you might need to use a module pattern or
	// store the controller in a global variable
	menuController.setActiveMenuItem(activeId)
} 