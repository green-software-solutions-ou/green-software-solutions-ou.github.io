export class MenuItem {
	constructor(id, text, href, isActive = false) {
		this.id = id
		this.text = text
		this.href = href
		this.isActive = isActive
		this.element = this.createElement()
	}

	createElement() {
		const li = document.createElement('li')
		const a = document.createElement('a')
		
		a.href = this.href
		a.textContent = this.text
		
		if (this.isActive) {
			li.classList.add('active')
		}
		
		li.appendChild(a)
		
		// Click handling is now managed in main.js
		// to better integrate with the PageLoader
		
		return li
	}

	setActive(isActive) {
		this.isActive = isActive
		if (isActive) {
			this.element.classList.add('active')
		} else {
			this.element.classList.remove('active')
		}
	}

	updateText(text) {
		this.text = text
		this.element.querySelector('a').textContent = text
	}
} 