$(document).ready(function () {
  $.getJSON("/orders", {}, function (data) {
    $.each(data, function (index, element) {
      var selfRef = element._links.self.href;
      var split = selfRef.split("/");
      var id = split[split.length - 1];
      $("#tableOrders").append(
        "\
		    <tr>\
			<th># " +
          id +
          "</th>\
			<td>" +
          element.date.split(".")[0].replace("T", " ") +
          "</td>\
			<td>$ " +
          element.total.toFixed(2) +
          '</td>\
			<td>\
			    <span class="label label-success">Shipped</span>\
			</td>\
			<td>\
			    <a href="customer-order.html?order=' +
          selfRef.replace(/http:\/\/(.*)\/orders/, "/orders") +
          '" class="btn btn-primary btn-sm">View</a>\
			</td>\
		    </tr>',
      );
    });
  });
});
