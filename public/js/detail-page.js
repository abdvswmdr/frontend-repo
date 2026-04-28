$(document).ready(function () {
  $.ajaxSetup({
    contentType: "application/json; charset=utf-8",
  });

  console.log("Loading components for category.html");
  $("#topbar").load("topbar.html");
  $("#navbar").load("navbar.html");
  $("#footer").load("footer.html");

  var id = $.query.get("id") ? $.query.get("id") : "";
  if (id == null || id == "") {
    document.location.href = "/";
  }
  var CURRENCY_SYMBOLS = { USD: "$", KES: "KSh ", EUR: "€" };
  var currency = localStorage.getItem("soqoniCurrency") || "USD";
  var symbol = CURRENCY_SYMBOLS[currency] || "$";

  var productCount = 1;
  window.changeQty = function (delta) {
    var max = window._stockCount || 99;
    productCount = Math.max(1, Math.min(max, productCount + delta));
    $("#qty-input").val(productCount);
  };
  $("#qty-input").on("change", function () {
    var max = window._stockCount || 99;
    productCount = Math.max(1, Math.min(max, parseInt($(this).val()) || 1));
    $(this).val(productCount);
  });

  $.getJSON("/catalogue/" + id, { currency: currency }, function (data) {
    $("#title").text(data.name);
    $("#price").text(symbol + data.price.toFixed(2));
    $("#imageMain").attr("src", data.imageUrl[0]);

    // Breadcrumb: Home > Catalogue > [tag] > Product name
    var tag = data.tag && data.tag[0] ? data.tag[0] : null;
    if (tag) {
      $("#detail-breadcrumb").append(
        '<li><a href="category.html?tags=' +
          encodeURIComponent(tag) +
          '">' +
          tag +
          "</a></li>",
      );
    }
    $("#detail-breadcrumb").append("<li>" + data.name + "</li>");

    // Rating count proxy (use count as a stand-in)
    var reviews = data.count ? Math.min(data.count * 3, 999) : 0;
    if (reviews > 0) $("#rating-count").text(reviews + " ratings");

    // Availability
    window._stockCount = data.count;
    if (data.count > 0) {
      $("#availability").html(
        '<span style="color:#27ae60;"><i class="fa fa-check-circle"></i> In Stock</span> <span class="text-muted">(' +
          data.count +
          " units)</span>",
      );
      $("#qty-plus").prop("disabled", false);
    } else {
      $("#availability").html(
        '<span style="color:#c0392b;"><i class="fa fa-times-circle"></i> Out of Stock</span>',
      );
      $("#buttonCart").addClass("disabled").attr("onclick", null);
      $("#qty-minus, #qty-plus, #qty-input").prop("disabled", true);
    }

    $("#buttonCart").attr(
      "onClick",
      "addToCart(\'" + data.id + "\', parseInt($('#qty-input').val()))",
    );
    var wl = JSON.parse(localStorage.getItem("soqoniWishlist") || "[]");
    if (wl.indexOf(data.id) > -1) {
      $("#buttonWishlist")
        .html('<i class="fa fa-heart"></i> In wishlist')
        .addClass("active");
    }
    $("#buttonWishlist").on("click", function (e) {
      e.preventDefault();
      var list = JSON.parse(localStorage.getItem("soqoniWishlist") || "[]");
      var idx = list.indexOf(data.id);
      if (idx > -1) {
        list.splice(idx, 1);
        $(this)
          .html('<i class="fa fa-heart"></i> Add to wishlist')
          .removeClass("active");
      } else {
        list.push(data.id);
        $(this)
          .html('<i class="fa fa-heart"></i> In wishlist')
          .addClass("active");
      }
      localStorage.setItem("soqoniWishlist", JSON.stringify(list));
    });
    var thumbHtml = "";
    for (var i = 0; i < data.imageUrl.length; i++) {
      thumbHtml =
        thumbHtml +
        '<div class="col-xs-4">\
                            <a href="' +
        data.imageUrl[i] +
        '" class="thumb">\
                    <img src="' +
        data.imageUrl[i] +
        '" alt="" class="img-responsive">\
                    </a>\
                </div>';
    }
    $("#thumbs").append(thumbHtml);
    // Format description as bullet list (sentences split on ". ")
    var parts = (data.description || "").split(/\.\s+/).filter(function (s) {
      return s.trim();
    });
    if (parts.length > 1) {
      var items = parts
        .map(function (s) {
          return "<li>" + s.trim().replace(/\.$/, "") + "</li>";
        })
        .join("");
      $("#description").html(
        '<ul class="product-spec-list">' + items + "</ul>",
      );
    } else {
      $("#description").text(data.description);
    }

    // Related products — same card style as homepage, 5-column grid
    $.getJSON(
      "/catalogue",
      { sort: "id", size: 6, tags: data.tag[0], currency: currency },
      function (relData) {
        if (relData != null) {
          $.each(relData, function (index, element) {
            if (element.id === id) return; // skip current product
            $("#related-products").append(
              '<div class="col-product">' +
                '<div class="product">' +
                '<div class="product-img-wrap">' +
                '<a href="detail.html?id=' +
                element.id +
                '">' +
                '<img src="' +
                element.imageUrl[0] +
                '" alt="' +
                element.name +
                '">' +
                "</a>" +
                '<div class="hover-cart">' +
                '<a href="#" onclick="addToCart(\'' +
                element.id +
                '\');return false;" class="btn">' +
                '<i class="fa fa-shopping-cart"></i> Add to cart</a>' +
                "</div>" +
                "</div>" +
                '<div class="text">' +
                '<div class="product-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
                '<h3><a href="detail.html?id=' +
                element.id +
                '">' +
                element.name +
                "</a></h3>" +
                '<p class="price">' +
                symbol +
                element.price.toFixed(2) +
                "</p>" +
                "</div>" +
                "</div>" +
                "</div>",
            );
          });
        }
      },
    );
  });
});
