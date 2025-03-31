import { Menu } from './Menu.js'
import { BurgerMenu } from './BurgerMenu.js'
import { MenuItem } from './MenuItem.js'

export class MenuController {
	constructor(container, menuItems = []) {
		this.container = container
		this.menuItems = menuItems.map(item => 
			new MenuItem(item.id, item.text, item.href, item.isActive)
		)
		this.desktopMenu = null
		this.mobileMenu = null
		this.mobileBreakpoint = 768
		this.currentMenu = null
		this.init()
	}

	init() {
		// Create menu container if not provided
		if (!this.container) {
			this.container = document.createElement('div')
			this.container.className = 'menu-container'
			document.body.appendChild(this.container)
		}

		// Initialize both menu types
		this.desktopMenu = new Menu(this.container, this.menuItems)
		this.mobileMenu = new BurgerMenu(this.container, this.menuItems)
		
		// Initially hide the mobile menu
		this.mobileMenu.element.style.display = 'none'
		
		// Set the initial menu type based on screen size
		this.handleResize()
		
		// Add event listener for window resize
		window.addEventListener('resize', () => this.handleResize())
		
		// Set active menu item based on current URL path
		this.setActiveFromCurrentPath()
	}

	handleResize() {
		const isMobile = window.innerWidth <= this.mobileBreakpoint
		
		if (isMobile && this.currentMenu !== this.mobileMenu) {
			// Switch to mobile menu
			this.desktopMenu.element.style.display = 'none'
			this.mobileMenu.element.style.display = 'block'
			this.currentMenu = this.mobileMenu
		} else if (!isMobile && this.currentMenu !== this.desktopMenu) {
			// Switch to desktop menu
			this.mobileMenu.element.style.display = 'none'
			this.desktopMenu.element.style.display = 'block'
			this.currentMenu = this.desktopMenu
		}
	}

	addMenuItem(item) {
		const menuItem = new MenuItem(item.id, item.text, item.href, item.isActive)
		this.menuItems.push(menuItem)
		
		// Add to both menu types
		this.desktopMenu.addItem(menuItem)
		this.mobileMenu.addItem(menuItem)
	}

	removeMenuItem(itemId) {
		this.menuItems = this.menuItems.filter(item => item.id !== itemId)
		
		// Remove from both menu types
		this.desktopMenu.removeItem(itemId)
		this.mobileMenu.removeItem(itemId)
	}

	setActiveMenuItem(itemId) {
		this.menuItems.forEach(item => {
			item.setActive(item.id === itemId)
		})
	}
	
	setActiveFromCurrentPath() {
		const currentPath = window.location.pathname
		let activeId = 'home' // Default
		
		if (currentPath.includes('about')) {
			activeId = 'about'
		} else if (currentPath.includes('free-software')) {
			activeId = 'free-software'
		} else if (window.location.hash === '#form-wrap') {
			activeId = 'contact'
		}
		
		this.setActiveMenuItem(activeId)
	}
} 