const navToggle = document.querySelector('.nav__toggle');
const mainNav = document.querySelector('.main__nav');
const hamburger = document.querySelector('.hamburger');


navToggle.addEventListener('click', () => {
	mainNav.classList.toggle("open");
	hamburger.classList.toggle("open");
	
});
