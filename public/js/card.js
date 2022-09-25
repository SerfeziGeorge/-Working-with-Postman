const elementCard = document.querySelectorAll('.card--flip');
//const elementCardProduct = document.querySelectorAll('.card__product');
const sizes = document.querySelectorAll('.size');
const accordions = document.querySelectorAll('.accordion');

//querySelectorAll returns a array
function changeSize() {
	//remove the hardcoded active class
	sizes.forEach((size) => size.classList.remove('active'));
	//add the active class on the selected element
	this.classList.add('active');
}

function flipCard() {
	//remove the hardcoded active class
	//elementCard.forEach((el) => el.classList.remove('flip'));
	//add the active class on the selected element
	// this.classList.add('flip');
	if (this.classList.contains('flip')) {
		this.classList.remove('flip');
	} else {
		this.classList.add('flip');
	}
}

function accordionCard() {
	let content = this.nextElementSibling;
	if (content.style.maxHeight) {
		//accordion is currently open, so close it
		content.style.maxHeight = null;
	} else {
		//accordion is currently closed, so open it
		content.style.maxHeight = content.scrollHeight + 'px';
	}
}

sizes.forEach((size) => size.addEventListener('click', changeSize));

elementCard.forEach((el) => el.addEventListener('click', flipCard));
accordions.forEach((accordion) =>
	accordion.addEventListener('click', accordionCard)
);
