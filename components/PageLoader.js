export class PageLoader {
	constructor(contentContainer, completionCallback = null) {
		this.contentContainer = contentContainer
		this.currentPage = null
		this.isLoading = false
		this.cache = {}
		this.loadedStyles = new Map()
		this.completionCallback = completionCallback
		this.pageStylesheets = new Map()
		
		// Get loader from content cell
		this.loader = document.getElementById('page-loader')
		
		// If for some reason it doesn't exist, create it inside the content cell
		if (!this.loader) {
			this.loader = document.createElement('div')
			this.loader.id = 'page-loader'
			this.loader.className = 'page-loader'
			this.loader.innerHTML = `
				<div class="loader-spinner">
					<div class="spinner-circle"></div>
				</div>
			`
			
			// Find content cell to append the loader to
			const contentCell = document.getElementById('content-cell')
			if (contentCell) {
				contentCell.appendChild(this.loader)
			} else {
				// Fallback to body if content cell not found
				document.body.appendChild(this.loader)
			}
		}
		
		// Show loader immediately on initialization
		this.showLoader()
		
		console.log('PageLoader initialized with completion callback:', !!this.completionCallback)
	}
	
	loadPage(pagePath) {
		console.log('PageLoader.loadPage called with path:', pagePath)
		
		if (this.isLoading) {
			console.log('PageLoader is already loading, ignoring request')
			return Promise.resolve(false)
		}
		
		// Don't reload the same page
		if (this.currentPage === pagePath) {
			console.log('Already on page:', pagePath, 'ignoring request')
			// Still need to reset loading state in main.js
			this.completeLoading()
			return Promise.resolve(true)
		}
		
		// Set loading state
		this.showLoader()
		this.isLoading = true
		
		// Hide content immediately to prevent flash
		if (this.contentContainer) {
			this.contentContainer.style.opacity = '0'
		}
		
		// Get page stubs for class manipulation
		const newPageStub = this.getPageStub(pagePath)
		const currentPageStub = this.currentPage ? this.getPageStub(this.currentPage) : null
		
		// Load content first before removing class
		return new Promise(resolve => {
			// First load the content
			this._loadPageContent(pagePath)
				.then(success => {
					// After content is loaded, handle page class transitions
					
					// 1. Now remove the current page class
					if (currentPageStub) {
						console.log(`Removing current page class: page-${currentPageStub}`)
						document.documentElement.classList.remove(`page-${currentPageStub}`)
					} else {
						// Remove all possible page classes if we don't know the current one
						document.documentElement.classList.remove('page-about', 'page-free-software', 'page-inquiries')
					}
					
					// Unload stylesheets from previous page if any
					if (this.currentPage && this.currentPage !== pagePath) {
						this.unloadPageStylesheets(this.currentPage)
					}
					
					// 2. Add the new page class
					if (newPageStub) {
						console.log(`Adding new page class: page-${newPageStub}`)
						document.documentElement.classList.add(`page-${newPageStub}`)
					}
					
					// Allow time for transitions to complete
					setTimeout(() => {
						// Completed loading (success or failure)
						this.hideLoader()
						this.isLoading = false
						this.completeLoading()
						resolve(success)
					}, 400) // Match transition duration from CSS for smooth effect
				})
				.catch(error => {
					// Error in loading
					console.error('Unhandled error in page loading:', error)
					this.hideLoader()
					this.isLoading = false
					this.completeLoading()
					resolve(false)
				})
		})
	}
	
	// Get the page stub (name without extension) from a path
	getPageStub(pagePath) {
		if (!pagePath) return null
		
		const lastSlash = pagePath.lastIndexOf('/')
		const lastDot = pagePath.lastIndexOf('.')
		
		if (lastSlash >= 0 && lastDot >= 0) {
			return pagePath.substring(lastSlash + 1, lastDot)
		}
		
		return null
	}
	
	async _loadPageContent(pagePath) {
		try {
			// Set opacity to 0 immediately on start to prevent flash
			if (this.contentContainer && this.contentContainer.style.opacity !== '0') {
				this.contentContainer.style.opacity = '0'
			}
			
			// Use a minimum wait time before content load to prevent flash
			await new Promise(resolve => setTimeout(resolve, 200))
			
			let pageContent
			
			// Check if page is cached
			if (this.cache[pagePath]) {
				console.log('Loading page from cache:', pagePath)
				pageContent = this.cache[pagePath]
			} else {
				// Fetch the page content
				console.log('Fetching page content:', pagePath)
				const response = await fetch(pagePath)
				
				if (!response.ok) {
					throw new Error(`Failed to load page: ${response.status} ${response.statusText}`)
				}
				
				pageContent = await response.text()
				
				// Cache the result
				this.cache[pagePath] = pageContent
				console.log('Page content cached:', pagePath)
			}
			
			// Create a temporary element to parse the HTML
			const tempElement = document.createElement('div')
			tempElement.innerHTML = pageContent
			
			// Process and load CSS links
			this.processStyles(tempElement, pagePath)
			
			// Extract all scripts before setting content
			const allScripts = Array.from(tempElement.querySelectorAll('script'))
			const externalScripts = allScripts.filter(script => script.hasAttribute('src'))
			const inlineScripts = allScripts.filter(script => !script.hasAttribute('src'))
			
			console.log(`Found ${externalScripts.length} external scripts and ${inlineScripts.length} inline scripts`)
			
			// Now set the content
			const content = tempElement.querySelector('.page-content')
			if (content) {
				// Ensure opacity is still 0 before content swap
				this.contentContainer.style.opacity = '0'
				
				// Set the content
				this.contentContainer.innerHTML = content.innerHTML
				console.log('Content updated from:', pagePath)
				
				// Process external scripts first (with src attribute)
				if (externalScripts.length > 0) {
					console.log(`Loading ${externalScripts.length} external scripts`)
					await this.loadExternalScripts(externalScripts)
				}
				
				// Then process inline scripts
				if (inlineScripts.length > 0) {
					console.log(`Executing ${inlineScripts.length} inline scripts`)
					this.executeInlineScripts(inlineScripts)
				}
				
				// Make sure the loaded class is maintained during navigation
				if (this.currentPage) {
					document.body.classList.add('loaded')
				}
				
				// Wait for a frame to ensure content is ready before starting fade-in
				requestAnimationFrame(() => {
					// Allow a bit more time for layout/paint to complete
					setTimeout(() => {
						this.contentContainer.style.opacity = '1'
					}, 150)
				})
			} else {
				throw new Error(`No content found in ${pagePath}`)
			}
			
			// Update current page
			this.currentPage = pagePath
			
			// Update URL without reloading the page
			const pageName = pagePath.substring(pagePath.lastIndexOf('/') + 1, pagePath.lastIndexOf('.'))
			window.history.pushState({ page: pagePath, id: pageName }, '', `#${pageName}`)
			console.log('URL updated to:', window.location.href)
			
			return true
		} catch (error) {
			console.error('Error loading page:', error)
			this.contentContainer.innerHTML = `
				<div class="error-message">
					<h2>Error Loading Page</h2>
					<p>${error.message}</p>
				</div>
			`
			// Make sure error message is visible
			this.contentContainer.style.opacity = '1'
			return false
		}
	}
	
	// Load external scripts in sequence, waiting for each to load
	async loadExternalScripts(scripts) {
		for (let i = 0; i < scripts.length; i++) {
			const oldScript = scripts[i]
			const src = oldScript.getAttribute('src')
			
			// Skip if already loaded
			if (document.querySelector(`script[src="${src}"]`)) {
				console.log(`Script already loaded: ${src}`)
				continue
			}
			
			console.log(`Loading external script (${i+1}/${scripts.length}): ${src}`)
			
			// Create a promise to track when script loads
			await new Promise((resolve, reject) => {
				const newScript = document.createElement('script')
				
				// Copy all attributes
				Array.from(oldScript.attributes).forEach(attr => {
					if (attr.name !== 'src') { // We'll set src last
						newScript.setAttribute(attr.name, attr.value)
					}
				})
				
				// Set up event handlers
				newScript.onload = () => {
					console.log(`Script loaded successfully: ${src}`)
					resolve()
				}
				
				newScript.onerror = (error) => {
					console.error(`Error loading script ${src}:`, error)
					// Resolve anyway to continue with other scripts
					resolve()
				}
				
				// Set src last to start loading
				newScript.src = src
				
				// Add to document
				document.head.appendChild(newScript)
			})
			
			// Extra debugging - check if global functions are available after script load
			if (window.initContactForm) {
				console.log('initContactForm is now available in global scope')
			} else {
				console.log('initContactForm is NOT available in global scope')
			}
		}
	}
	
	// Execute inline scripts in sequence
	executeInlineScripts(scripts) {
		scripts.forEach((oldScript, index) => {
			try {
				console.log(`Executing inline script ${index + 1}/${scripts.length}`)
				
				// Create new script element
				const newScript = document.createElement('script')
				
				// Copy attributes
				Array.from(oldScript.attributes).forEach(attr => {
					newScript.setAttribute(attr.name, attr.value)
				})
				
				// Set content 
				newScript.textContent = oldScript.textContent
				
				// Execute by appending to head
				document.head.appendChild(newScript)
				
				console.log(`Inline script ${index + 1} executed successfully`)
			} catch (error) {
				console.error(`Error executing inline script ${index + 1}:`, error)
			}
		})
		
		// Extra debugging - check DOM and form after scripts execution
		setTimeout(() => {
			const form = document.getElementById('contact-form')
			const submitBtn = document.getElementById('form-submit')
			console.log('After script execution - Form exists:', !!form, 'Submit button exists:', !!submitBtn)
			
			if (form && submitBtn) {
				console.log('Form found after script execution, initializing manually')
				if (window.initContactForm) {
					console.log('Calling initContactForm manually after delay')
					window.initContactForm()
				}
			}
		}, 500)
	}
	
	unloadPageStylesheets(pagePath) {
		// Get the stylesheets for this page
		const pageStyles = this.pageStylesheets.get(pagePath) || []
		
		if (pageStyles.length > 0) {
			console.log(`Unloading ${pageStyles.length} stylesheets for page:`, pagePath)
			
			pageStyles.forEach(stylesheet => {
				// We no longer remove page CSS files since they define CSS variables
				// that we want to apply with transitions
				const href = stylesheet.getAttribute('href')
				const isPageCssFile = href && href.startsWith('pages/') && href.endsWith('.css')
				
				// Only remove non-page CSS files
				if (!isPageCssFile) {
					if (stylesheet.parentNode) {
						stylesheet.parentNode.removeChild(stylesheet)
						console.log('Removed stylesheet:', href)
					}
					
					// Remove from loadedStyles tracking
					if (href) {
						this.loadedStyles.delete(href)
					}
				} else {
					console.log('Keeping page CSS file for transition:', href)
				}
			})
			
			// Clear the list for this page
			this.pageStylesheets.set(pagePath, [])
		}
	}
	
	completeLoading() {
		// Call completion callback if it exists
		if (this.completionCallback && typeof this.completionCallback === 'function') {
			console.log('Calling completion callback')
			this.completionCallback()
		} else {
			console.log('No completion callback to call')
			// Fallback to global state reset
			if (window.isPageLoading !== undefined) {
				window.isPageLoading = false
				console.log('Reset global isPageLoading state')
			}
		}
	}
	
	processStyles(tempElement, pagePath) {
		// Get the base path
		const basePath = pagePath.substring(0, pagePath.lastIndexOf('/') + 1)
		
		// Initialize tracking array for this page if not exists
		if (!this.pageStylesheets.has(pagePath)) {
			this.pageStylesheets.set(pagePath, [])
		}
		
		// Get the stylesheet tracking array for this page
		const pageStyles = this.pageStylesheets.get(pagePath)
		
		// Find any stylesheet that might contain CSS variables for backgrounds
		let pageCssFile = null
		const links = tempElement.querySelectorAll('link[rel="stylesheet"]')
		
		// First, look for page-specific CSS file
		for (const link of links) {
			const href = link.getAttribute('href')
			if (href && href.startsWith('pages/') && href.endsWith('.css')) {
				pageCssFile = href
				break
			}
		}
		
		// If we found a page CSS file, load it to apply variables
		if (pageCssFile) {
			// This loads the CSS file which will apply the CSS variables
			this.loadPageCssFile(pageCssFile, pageStyles)
		}
		
		// Process other link tags as before
		links.forEach(link => {
			const href = link.getAttribute('href')
			
			// Skip if it's the page CSS file we're handling separately
			if (href === pageCssFile) {
				return
			}
			
			// Skip if already loaded
			if (this.loadedStyles.has(href)) {
				console.log(`Stylesheet already loaded: ${href}`)
				
				// If already loaded, check if it belongs to the current page
				const existingStylesheet = this.loadedStyles.get(href)
				if (existingStylesheet && !pageStyles.includes(existingStylesheet)) {
					// Add to this page's tracking
					pageStyles.push(existingStylesheet)
				}
				return
			}
			
			// Create and add the style to the head
			const styleLink = document.createElement('link')
			styleLink.rel = 'stylesheet'
			
			// Resolve the path (handling both absolute and relative paths)
			if (href.startsWith('/') || href.startsWith('http')) {
				styleLink.href = href
			} else {
				styleLink.href = href
			}
			
			// Add data attribute to identify page-specific stylesheets
			styleLink.setAttribute('data-page', pagePath)
			
			// Add to document head
			document.head.appendChild(styleLink)
			
			// Track the stylesheet element for this page
			pageStyles.push(styleLink)
			
			// Mark as loaded
			this.loadedStyles.set(href, styleLink)
			
			console.log(`Added stylesheet for page ${pagePath}:`, href)
		})
	}
	
	loadPageCssFile(cssFilePath, pageStyles) {
		// Check if we already have this CSS file loaded
		const existingStyle = document.querySelector(`link[href="${cssFilePath}"]`)
		if (existingStyle) {
			console.log(`CSS file ${cssFilePath} already loaded, reusing`)
			if (!pageStyles.includes(existingStyle)) {
				pageStyles.push(existingStyle)
			}
			return
		}
		
		console.log(`Loading page CSS file: ${cssFilePath}`)
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.href = cssFilePath
		
		// Add to head
		document.head.appendChild(link)
		
		// Track it
		pageStyles.push(link)
		this.loadedStyles.set(cssFilePath, link)
	}
	
	showLoader() {
		this.loader.classList.add('active')
		
		// Only remove the loaded class if this is the initial load (before first content is loaded)
		if (!this.currentPage) {
			document.body.classList.remove('loaded')
		}
	}
	
	hideLoader() {
		this.loader.classList.remove('active')
	}
} 