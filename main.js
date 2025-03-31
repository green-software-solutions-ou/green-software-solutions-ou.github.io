import { MenuController } from './components/MenuController.js'
import { PageLoader } from './components/PageLoader.js'

// Global variables
let pageLoader
let initialContent = ''
let isPageLoading = false
let firstLoadComplete = false

// Menu data structure
const menuItems = [
    {
		id: 'free-software',
		text: 'Free Software',
		href: 'pages/free-software.html',
		isActive: false
	},
    {
		id: 'inquiries',
		text: 'Inquiries',
		href: 'pages/inquiries.html',
		isActive: true
	},
	{
		id: 'about',
		text: 'About',
		href: 'pages/about.html',
		isActive: false
	}
]

// Make isPageLoading accessible globally
window.isPageLoading = isPageLoading

document.addEventListener("DOMContentLoaded", function() {
	try {
		// Hide the UI until first load (only on initial page load)
		hideUI()
		
		// Update copyright year
		const yearEl = document.getElementById('year')
		const year = new Date().getFullYear()
		yearEl.textContent = year
		
		// Initialize page loader
		const pageContent = document.getElementById('page-content')
		pageLoader = new PageLoader(pageContent, function() {
			// Callback for when loading completes
			isPageLoading = false
			window.isPageLoading = false
			
			// Show UI after first load
			if (!firstLoadComplete) {
				showUI()
				firstLoadComplete = true
			}
		})
		
		// Store initial content
		initialContent = pageContent.innerHTML
		
		// Initialize menu
		initMenu()
		
		// Check for hash navigation
		handleHashNavigation()
		
		// Listen for hash changes
		window.addEventListener('hashchange', handleHashNavigation)
	} catch (error) {
		console.error('Error in DOM loaded handler:', error)
	}
})

// Hide the UI elements
function hideUI() {
	// Remove loaded class from body to hide UI elements
	document.body.classList.remove('loaded')
}

// Show the UI elements
function showUI() {
	// Add loaded class to body to trigger CSS transitions
	document.body.classList.add('loaded')
	
	// Mark first load as complete
	firstLoadComplete = true
}

// Handle hash-based navigation (#page)
function handleHashNavigation() {
	const hash = window.location.hash
	if (hash && hash.length > 1) {
		const pageName = hash.substring(1) // Remove the # symbol
		
		// Find the menu item
		const menuItem = menuItems.find(item => item.id === pageName)
		if (menuItem) {
			loadPage(pageName)
		}
	} else {
		// No hash in URL, load the default "Inquiries" page
		loadPage('inquiries')
		// Update URL to reflect the page
		window.history.pushState({ page: 'pages/inquiries.html', id: 'inquiries' }, '', '#inquiries')
	}
}

function initMenu() {
	try {
		// Get the menu container
		const menuContainer = document.getElementById('main-menu')
		
		// Hide the menu for now
		const menuContainerParent = document.getElementById('menu-container')
		if (menuContainerParent) {
			menuContainerParent.style.display = 'none'
		}
		
		// Clear existing items
		menuContainer.innerHTML = ''
		
		// Create menu items
		menuItems.forEach((item, index) => {
			const li = document.createElement('li')
			if (item.isActive) {
				li.classList.add('active')
			}
			
			const button = document.createElement('button')
			button.className = 'menu-button'
			button.textContent = item.text
			button.setAttribute('data-page', item.id)
			button.style.cursor = 'pointer'
			button.style.position = 'relative'
			button.style.zIndex = '3000'
			
			// Add click handler
			button.addEventListener('click', function(e) {
				e.preventDefault()
				loadPage(item.id)
				return false
			})
			
			li.appendChild(button)
			menuContainer.appendChild(li)
		})
	} catch (error) {
		console.error('Error initializing menu:', error)
	}
}

function setActiveMenuItem(itemId) {
	// Update data structure
	menuItems.forEach(item => {
		item.isActive = (item.id === itemId)
	})
	
	// Update DOM
	document.querySelectorAll('#main-menu li').forEach((li, index) => {
		if (index < menuItems.length && menuItems[index].isActive) {
			li.classList.add('active')
		} else {
			li.classList.remove('active')
		}
	})
}

function loadPage(pageName) {
	// Prevent concurrent loads
	if (isPageLoading) {
		return
	}
	
	isPageLoading = true
	window.isPageLoading = true
	
	try {
		// Set active menu item
		setActiveMenuItem(pageName)
		
		// Load the page
		const url = 'pages/' + pageName + '.html'
		
		// Use the returned promise
		pageLoader.loadPage(url)
			.then(success => {
				if (!success) {
					console.error(`Failed to load page: ${pageName}`)
					showError(`Failed to load: ${pageName}`)
					// Reset loading state in case of error
					isPageLoading = false
					window.isPageLoading = false
					
					// Ensure UI is shown even on error
					if (!firstLoadComplete) {
						showUI()
						firstLoadComplete = true
					}
				}
			})
			.catch(error => {
				console.error(`Error loading page ${pageName}:`, error)
				showError(`Error loading page: ${pageName} - ${error.message}`)
				// Reset loading state in case of error
				isPageLoading = false
				window.isPageLoading = false
				
				// Ensure UI is shown even on error
				if (!firstLoadComplete) {
					showUI()
					firstLoadComplete = true
				}
			})
		
		return false
	} catch (error) {
		console.error(`Error in loadPage for ${pageName}:`, error)
		showError(`Error: ${error.message}`)
		isPageLoading = false
		window.isPageLoading = false
		
		// Ensure UI is shown even on fatal errors
		if (!firstLoadComplete) {
			showUI()
			firstLoadComplete = true
		}
	}
}

// Display error message in the page content area
function showError(message) {
	if (!pageLoader || !pageLoader.contentContainer) return
	
	const contentContainer = pageLoader.contentContainer
	contentContainer.innerHTML = `
		<div class="error-message">
			<h2>Error</h2>
			<p>${message}</p>
		</div>
	`
	contentContainer.style.opacity = '1'
}