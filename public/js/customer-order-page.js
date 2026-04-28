$(document).ready(function () {
	var orderUrl = $.query.get('order') ? $.query.get('order') : "#";
	console.log("getting " + orderUrl);
	$.getJSON(orderUrl, {}, function (data) {
		var selfRef = data._links.self.href;
		var split = selfRef.split("/");
		var id = split[split.length - 1];
		var cartTotal = 0;
		var numItemsInCart = 0;
		var shipping = 4.99;
		//$('#orderTotal').text('$' + data.total.toFixed(2));
		$('#orderNumber').text(id);
		$('#orderDate').text(data.date.split(".")[0].replace("T", " "));
		$('#orderStatus').text("shipped");
		$.each(data.items, function (index, item) {
			$.getJSON('/catalogue/' + item.itemId, function (data) {
				console.log(JSON.stringify(data));
				$('#tableOrder').append(' <tr>\
						<td>\
						    <a href="#">\
							<img src="' + data.imageUrl[0] + '" alt="' + data.namex + '">\
						    </a>\
						</td>\
						<td>\
						    <a href="#">' + data.name + '</a>\
						</td>\
						<td>' + item.quantity + '</td>\
						<td>$' + data.price.toFixed(2) + '</td>\
						<td>$0.00</td>\
						<td>$' + (item.quantity * data.price).toFixed(2) + '</td>\
					    </tr>');
				cartTotal = cartTotal + item.quantity * data.price;
				console.log("Cur total: " + cartTotal);
				numItemsInCart = numItemsInCart + item.quantity;
			}).always(function () {
				console.log("Final counts: $" + cartTotal + ", with " + numItemsInCart + " items.");
				$('#orderSubtotal').text('$' + cartTotal.toFixed(2));
				$('#orderShipping').text('$' + shipping.toFixed(2));
				$('#orderTotal').text('$' + (cartTotal + shipping).toFixed(2));
			});
		})
		$('#addressInvoice').replaceWith('\
		<p>' + data.customer.firstName + ' ' + data.customer.lastName + '\
		    <br>' + data.address.number + ' ' + data.address.street + '\
		    <br>' + data.address.city + '\
		    <br>' + data.address.country + '\
		    <br>' + data.address.postcode + '\
		</p>');
		$('#addressShipping').replaceWith('\
		<p>' + data.customer.firstName + ' ' + data.customer.lastName + '\
		    <br>' + data.address.number + ' ' + data.address.street + '\
		    <br>' + data.address.city + '\
		    <br>' + data.address.country + '\
		    <br>' + data.address.postcode + '\
		</p>');
	});
});
