$(document).ready(function () {
  $.ajaxSetup({
    contentType: "application/json; charset=utf-8",
  });

  if ($.cookie("logged_in") == null || $.cookie("logged_in") == "") {
    $("#tabAccount").remove();
  }

  $.getJSON("/cart", {}, function (data) {
    if (data != null) {
      var numItemsInCart = 0;
      $.each(data, function (index, element) {
        if (
          element != null &&
          element.itemId != null &&
          element.itemId != "null"
        ) {
          $.getJSON("/catalogue/" + element.itemId, function (data) {
            numItemsInCart = numItemsInCart + element.quantity;
          }).always(function () {
            $("#numItemsInCart").text(numItemsInCart);
          });
        }
      });
    }
  }).error(function () {
    $("#basket-overview").remove();
  });

  //Add Hover effect to menus
  jQuery("ul.nav li.dropdown").hover(
    function () {
      jQuery(this).find(".dropdown-menu").stop(true, true).delay(100).fadeIn();
    },
    function () {
      jQuery(this).find(".dropdown-menu").stop(true, true).delay(200).fadeOut();
    },
  );

  // Set active tabs
  if (window.location.toString().indexOf("category.html") > -1) {
    $("#tabCatalogue").addClass("active");
  } else if (window.location.toString().indexOf("customer-") > -1) {
    $("#tabAccount").addClass("active");
  } else {
    $("#tabIndex").addClass("active");
  }
});
