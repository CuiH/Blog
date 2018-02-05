const mySwiper = new Swiper('.swiper-container', {
	loop: true,
	autoplay: {
		delay: 2500,
		stopOnLastSlide: false,
		disableOnInteraction: false
	},
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	pagination: {
		el: '.swiper-pagination',
		clickable :true
	}
});
