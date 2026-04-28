$(document).ready(function () {
	$.ajaxSetup({ contentType: "application/json; charset=utf-8" });
	$("#topbar").load("topbar.html");
	$("#navbar").load("navbar.html");
	$("#footer").load("footer.html");

	var CURRENCY_SYMBOLS = { USD: '$', KES: 'KSh ', EUR: '€' };
	var currency = localStorage.getItem('soqoniCurrency') || 'USD';
	var symbol = CURRENCY_SYMBOLS[currency] || '$';

	var ids = JSON.parse(localStorage.getItem('soqoniWishlist') || '[]');

	if (ids.length === 0) {
		$('#wishlist-lead').text('Your wishlist is empty. Browse products and click "Add to wishlist" to save items here.');
		return;
	}

	$('#wishlist-lead').text(ids.length + ' saved item' + (ids.length === 1 ? '' : 's') + '.');

	ids.forEach(function (id) {
		$.getJSON('/catalogue/' + id, { currency: currency }, function (p) {
			var card =
				'<div class="col-product">' +
				'<div class="product">' +
				'<div class="product-img-wrap">' +
				'<a href="detail.html?id=' + p.id + '">' +
				'<img src="' + p.imageUrl[0] + '" alt="' + p.name + '">' +
				'</a>' +
				'<div class="hover-cart">' +
				'<a href="#" onclick="addToCart(\'' + p.id + '\');return false;" class="btn"><i class="fa fa-shopping-cart"></i> Add to cart</a>' +
				'</div>' +
				'</div>' +
				'<div class="text">' +
				'<div class="product-stars">★★★★★</div>' +
				'<h3><a href="detail.html?id=' + p.id + '">' + p.name + '</a></h3>' +
				'<p class="price">' + symbol + p.price.toFixed(2) + '</p>' +
				'<p><a href="#" class="btn btn-xs btn-default remove-wish" data-id="' + p.id + '"><i class="fa fa-trash"></i> Remove</a></p>' +
				'</div>' +
				'</div>' +
				'</div>';
			$('#wishlist-products').append(card);
		});
	});

	$(document).on('click', '.remove-wish', function (e) {
		e.preventDefault();
		var rid = $(this).data('id');
		var list = JSON.parse(localStorage.getItem('soqoniWishlist') || '[]');
		list = list.filter(function (x) { return x !== rid; });
		localStorage.setItem('soqoniWishlist', JSON.stringify(list));
		$(this).closest('.col-product').remove();
		var remaining = JSON.parse(localStorage.getItem('soqoniWishlist') || '[]').length;
		if (remaining === 0) {
			$('#wishlist-lead').text('Your wishlist is empty. Browse products and click "Add to wishlist" to save items here.');
		} else {
			$('#wishlist-lead').text(remaining + ' saved item' + (remaining === 1 ? '' : 's') + '.');
		}
	});
});
