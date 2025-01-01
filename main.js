document.addEventListener("DOMContentLoaded", function () {
    const yearEl = document.getElementById('year')
    const year = new Date().getFullYear()
    yearEl.textContent = year
})