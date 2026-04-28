$(document).ready(function () {
  $.ajaxSetup({ contentType: "application/json; charset=utf-8" });

  $("#topbar").load("topbar.html");
  $("#navbar").load("navbar.html");
  $("#footer").load("footer.html");

  var size = parseInt($.query.get("size")) || 15;
  var page = parseInt($.query.get("page")) || 1;
  var tags = $.query.get("tags") || "";
  var sort = $.query.get("sort") || "price_asc";

  // Breadcrumb
  if (tags) {
    $("#cat-breadcrumb").append("<li>" + tags.split(",")[0] + "</li>");
  }

  // Sort select — set current value and wire onchange
  $("#sort-select")
    .val(sort)
    .on("change", function () {
      setNewSort($(this).val());
    });

  // Total count + pagination
  $.getJSON("/catalogue/size", { tags: tags }, function (data) {
    var total = data.size;
    var totalNumPages = Math.ceil(total / size);
    var from = (page - 1) * size + 1;
    var to = Math.min(page * size, total);
    $("#totalProducts").text(
      "Showing " +
        from +
        "–" +
        to +
        " of " +
        total +
        " (" +
        totalNumPages +
        " pages)",
    );

    var pagination = "";
    for (var i = 1; i <= totalNumPages; i++) {
      pagination +=
        page == i
          ? '<li class="active"><a href="#" onclick="setNewPage(' +
            i +
            ');return false;">' +
            i +
            "</a></li>"
          : '<li><a href="#" onclick="setNewPage(' +
            i +
            ');return false;">' +
            i +
            "</a></li>";
    }
    $("#pagination").append(pagination);
  });

  // Tag filters
  $.getJSON("/tags", function (data) {
    $.each(data.tags, function (i, el) {
      var checked = tags && tags.split(",").indexOf(el) > -1 ? " checked" : "";
      $("#filters").append(
        '<div class="checkbox"><label><input type="checkbox"' +
          checked +
          ' value="' +
          el +
          '">' +
          el +
          "</label></div>",
      );
    });
  });

  var CURRENCY_SYMBOLS = { USD: "$", KES: "KSh ", EUR: "€" };
  var currency = localStorage.getItem("soqoniCurrency") || "KES";
  var symbol = CURRENCY_SYMBOLS[currency] || "KSh ";
  var wishlist = JSON.parse(localStorage.getItem("soqoniWishlist") || "[]");

  $.getJSON(
    "/catalogue",
    { page: page, size: size, tags: tags, sort: sort, currency: currency },
    function (data) {
      if (!data) return;
      $.each(data, function (index, el) {
        var inWish = wishlist.indexOf(el.id) > -1;
        $("#products").append(
          '<div class="col-product">' +
            '<div class="product">' +
            '<div class="product-img-wrap">' +
            '<a href="detail.html?id=' +
            el.id +
            '">' +
            '<img src="' +
            el.imageUrl[0] +
            '" alt="' +
            el.name +
            '">' +
            "</a>" +
            '<div class="hover-cart">' +
            '<a href="#" onclick="addToCart(\'' +
            el.id +
            '\');return false;" class="cart-link"><i class="fa fa-shopping-cart"></i> Add to cart</a>' +
            '<a href="#" class="wish-btn' +
            (inWish ? " wishlisted" : "") +
            '" data-id="' +
            el.id +
            '"><i class="fa ' +
            (inWish ? "fa-heart" : "fa-heart-o") +
            '"></i></a>' +
            "</div>" +
            "</div>" +
            '<div class="text">' +
            '<div class="product-stars">★★★★★</div>' +
            '<h3><a href="detail.html?id=' +
            el.id +
            '">' +
            el.name +
            "</a></h3>" +
            '<p class="price">' +
            symbol +
            el.price.toFixed(2) +
            "</p>" +
            "</div>" +
            "</div>" +
            "</div>",
        );
      });
    },
  );

  // Wishlist toggle from category grid
  $(document).on("click", ".wish-btn", function (e) {
    e.preventDefault();
    var id = $(this).data("id");
    var list = JSON.parse(localStorage.getItem("soqoniWishlist") || "[]");
    var idx = list.indexOf(id);
    if (idx > -1) {
      list.splice(idx, 1);
      $(this).find("i").removeClass("fa-heart").addClass("fa-heart-o");
    } else {
      list.push(id);
      $(this).find("i").removeClass("fa-heart-o").addClass("fa-heart");
    }
    localStorage.setItem("soqoniWishlist", JSON.stringify(list));
  });
});
