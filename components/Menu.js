export class Menu {
	constructor(container, items = []) {
		this.container = container
		this.items = items
		this.element = null
		this.init()
	}

	init() {
		this.element = document.createElement('nav')
		this.element.className = 'side-menu'
		this.render()
		
		if (this.container) {
			this.container.appendChild(this.element)
		} else {
			console.error('Menu container is null or undefined')
		}
	}

	render() {
		this.element.innerHTML = ''
		const menuList = document.createElement('ul')
		
		this.items.forEach((item, index) => {
			if (item.element) {
				menuList.appendChild(item.element)
			} else {
				console.error(`Item element is undefined for item ${index}:`, item)
			}
		})
		
		this.element.appendChild(menuList)
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