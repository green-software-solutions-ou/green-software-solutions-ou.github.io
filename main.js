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
		isActive: true
	},
    {
		id: 'inquiries',
		text: 'Inquiries',
		href: 'pages/inquiries.html',
		isActive: false
	},
	{
		id: 'about',
		text: 'About',
		href: 'pages/about.html',
		isActive: false
	}
]

// Add debug logging
console.log('Main.js executing...')

// Make isPageLoading accessible globally
window.isPageLoading = isPageLoading

document.addEventListener("DOMContentLoaded", function() {
	console.log('DOM loaded, setting up page functionality')
	
	try {
		// Hide the UI until first load (only on initial page load)
		hideUI()
		
		// Update copyright year
		const yearEl = document.getElementById('year')
		const year = new Date().getFullYear()
		yearEl.textContent = year
		
		// Initialize page loader
		const pageContent = document.getElementById('page-content')
		console.log('Page content element:', pageContent)
		pageLoader = new PageLoader(pageContent, function() {
			// Callback for when loading completes
			isPageLoading = false
			window.isPageLoading = false
			console.log('Page loading complete, isPageLoading reset to false')
			
			// Show UI after first load
			if (!firstLoadComplete) {
				showUI()
				firstLoadComplete = true
			}
		})
		
		// Store initial content
		initialContent = pageContent.innerHTML
		console.log('Initial content stored, length:', initialContent.length)
		
		// Initialize menu
		initMenu()
		
		// Check for hash navigation
		handleHashNavigation()
		
		// Listen for hash changes
		window.addEventListener('hashchange', handleHashNavigation)
		
		console.log('Setup complete, ready for navigation')
	} catch (error) {
		console.error('Error in DOM loaded handler:', error)
	}
})

// Hide the UI elements
function hideUI() {
	console.log('Hiding UI until first load')
	
	// Remove loaded class from body to hide UI elements
	document.body.classList.remove('loaded')
}

// Show the UI elements
function showUI() {
	console.log('First load complete, showing UI')
	
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
		console.log('Hash navigation detected:', pageName)
		
		// Find the menu item
		const menuItem = menuItems.find(item => item.id === pageName)
		if (menuItem) {
			loadPage(pageName)
		}
	} else {
		// No hash in URL, load the default "Free Software" page
		console.log('No hash navigation, loading default Free Software page')
		loadPage('free-software')
		// Update URL to reflect the page
		window.history.pushState({ page: 'pages/free-software.html', id: 'free-software' }, '', '#free-software')
	}
}

function initMenu() {
	console.log('Initializing menu from data structure')
	try {
		// Get the menu container
		const menuContainer = document.getElementById('main-menu')
		console.log('Menu container:', menuContainer)
		
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
				console.log(`${item.text} clicked`)
				loadPage(item.id)
				return false
			})
			
			li.appendChild(button)
			menuContainer.appendChild(li)
		})
		
		console.log('Menu initialized successfully')
	} catch (error) {
		console.error('Error initializing menu:', error)
	}
}

function setActiveMenuItem(itemId) {
	console.log(`Setting active menu item: ${itemId}`)
	
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
		console.log('Page is already loading, ignoring request')
		return
	}
	
	isPageLoading = true
	window.isPageLoading = true
	console.log('Loading page:', pageName, 'isPageLoading set to true')
	
	try {
		// Set active menu item
		setActiveMenuItem(pageName)
		
		// Load the page
		const url = 'pages/' + pageName + '.html'
		
		// Use the returned promise
		pageLoader.loadPage(url)
			.then(success => {
				if (success) {
					console.log(`Successfully loaded page: ${pageName}`)
				} else {
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
		
		// Ensure UI is shown even on error
		if (!firstLoadComplete) {
			showUI()
			firstLoadComplete = true
		}
		
		return false
	}
}

// Show error message
function showError(message) {
	console.error(message)
	document.getElementById('page-content').innerHTML = `
		<div style="padding: 2rem; background: white; border-radius: 8px; text-align: center; margin-top: 2rem;">
			<h2 style="color: #e74c3c; margin-bottom: 1rem;">Error</h2>
			<p>${message}</p>
		</div>
	`
}