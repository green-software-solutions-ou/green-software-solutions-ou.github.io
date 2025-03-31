export class Menu {
	constructor(container, items = []) {
		this.container = container
		this.items = items
		this.element = null
		this.init()
	}

	init() {
		console.log('Menu init - Creating element')
		this.element = document.createElement('nav')
		this.element.className = 'side-menu'
		this.render()
		
		console.log('Menu init - Appending to container', this.container)
		console.log('Menu items:', this.items)
		if (this.container) {
			this.container.appendChild(this.element)
		} else {
			console.error('Menu container is null or undefined')
		}
	}

	render() {
		console.log('Menu render - Creating menu list')
		this.element.innerHTML = ''
		const menuList = document.createElement('ul')
		
		this.items.forEach((item, index) => {
			console.log(`Rendering menu item ${index}:`, item.id)
			if (item.element) {
				menuList.appendChild(item.element)
			} else {
				console.error(`Item element is undefined for item ${index}:`, item)
			}
		})
		
		this.element.appendChild(menuList)
		console.log('Menu rendered', this.element)
	}

	addItem(item) {
		this.items.push(item)
		this.render()
	}

	removeItem(itemId) {
		this.items = this.items.filter(item => item.id !== itemId)
		this.render()
	}
} 