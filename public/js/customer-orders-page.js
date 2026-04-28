$(document).ready(function () {
	$.ajaxSetup({
		contentType: "application/json; charset=utf-8"
	});

	console.log("Loading components for basket.html");
	$("#topbar").load("topbar.html");
	$("#navbar").load("navbar.html");
	$("#footer").load("footer.html");
})
