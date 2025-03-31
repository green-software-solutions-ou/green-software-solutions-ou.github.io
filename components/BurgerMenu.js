import { Menu } from './Menu.js'

export class BurgerMenu extends Menu {
	constructor(container, items = []) {
		super(container, items)
		this.isOpen = false
		this.burgerButton = null
		this.mobileInit()
	}

	mobileInit() {
		// Override the className from parent
		this.element.className = 'burger-menu'
		
		// Create and append the burger button
		this.burgerButton = document.createElement('button')
		this.burgerButton.className = 'burger-button'
		this.burgerButton.innerHTML = `
			<span class="burger-line"></span>
			<span class="burger-line"></span>
			<span class="burger-line"></span>
		`
		this.burgerButton.addEventListener('click', () => this.toggleMenu())
		this.container.appendChild(this.burgerButton)
		
		// Initially hide the menu
		this.element.classList.add('closed')
		
		// Add event listener for window resize to handle responsive behavior
		window.addEventListener('resize', () => this.handleResize())
		
		// Close menu when clicking outside or on menu items
		document.addEventListener('click', (e) => {
			// If menu is open and click is outside the menu and not on the burger button
			if (this.isOpen && 
				!this.element.contains(e.target) && 
				!this.burgerButton.contains(e.target)) {
				this.toggleMenu()
			}
		})
	}

	render() {
		// First call the parent's render method
		super.render()
		
		// Add mobile-specific styles or elements
		this.element.classList.add('mobile-menu')
		
		// Add a logo to the mobile menu
		const logoContainer = document.createElement('div')
		logoContainer.className = 'mobile-menu-logo'
		
		// Add title to mobile menu
		const menuTitle = document.createElement('h2')
		menuTitle.textContent = 'Green Software Solutions'
		menuTitle.className = 'mobile-menu-title'
		
		// Insert logo at the top of the menu
		this.element.insertBefore(menuTitle, this.element.firstChild)
	}

	toggleMenu() {
		this.isOpen = !this.isOpen
		
		if (this.isOpen) {
			this.element.classList.remove('closed')
			this.element.classList.add('open')
			this.burgerButton.classList.add('active')
			
			// Prevent scrolling when menu is open
			document.body.style.overflow = 'hidden'
		} else {
			this.element.classList.remove('open')
			this.element.classList.add('closed')
			this.burgerButton.classList.remove('active')
			
			// Restore scrolling when menu is closed
			document.body.style.overflow = ''
		}
	}

	handleResize() {
		// If window width becomes larger than mobile breakpoint,
		// close the mobile menu if it's open
		const mobileBreakpoint = 768
		
		if (window.innerWidth > mobileBreakpoint && this.isOpen) {
			this.toggleMenu()
		}
	}

	// Override parent method to add mobile-specific behavior
	addItem(item) {
		super.addItem(item)
		
		// Add click handler to close menu when item is clicked
		item.element.addEventListener('click', () => {
			if (this.isOpen) {
				this.toggleMenu()
			}
		})
	}
} 