function deleteFromCart(id) {
  console.log("Sending request to delete: " + id);
  $.ajax({
    url: "cart/" + id,
    type: "DELETE",
    success: function (data, textStatus, jqXHR) {
      console.log("Item deleted: " + id + ", " + textStatus);
      location.reload();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(
        "Could not delete item: " +
          id +
          ", due to: " +
          textStatus +
          " | " +
          errorThrown,
      );
    },
  });
}

// function updateCart()
// for each item row in cart table call updateToCart (client.js - updateToCart(itemId, quantity, callback))
function updateCart() {
  console.log("Updating Cart");
  var cartsize = document.getElementById("cart-list").rows.length;
  console.log("cart-list size: " + cartsize);

  var idx = 0;
  next = function () {
    if (idx < cartsize) {
      var id = document.getElementById("cart-list").rows[idx].cells[2].id;
      var quantity = document
        .getElementById("cart-list")
        .rows[idx].cells[2].getElementsByTagName("input")[0].value;
      idx++;
      updateToCart(id, quantity, next);
    } else {
      location.reload();
    }
  };
  next();
}

var _BASKET_RATES = { USD: 1.0, KES: 130.0, EUR: 0.92 };
var _BASKET_SYMBOLS = { USD: "$", KES: "KSh ", EUR: "€" };
var _bCur = localStorage.getItem("soqoniCurrency") || "KES";
var _bRate = _BASKET_RATES[_bCur] || 130.0;
var _bSym = _BASKET_SYMBOLS[_bCur] || "KSh ";
function _bFmt(usdPrice) {
  return _bSym + (usdPrice * _bRate).toFixed(2);
}

$(document).ready(function () {
  $.ajaxSetup({
    contentType: "application/json; charset=utf-8",
  });

  $.getJSON("/cart", {}, function (data) {
    if (data != null) {
      var cartTotal = 0;
      var numItemsInCart = 0;
      var shipping = 4.99;
      var orderPlaced = false;
      $.each(data, function (index, element) {
        if (
          element != null &&
          element.itemId != null &&
          element.itemId != "null"
        ) {
          $.getJSON("/catalogue/" + element.itemId, function (data) {
            console.log(JSON.stringify(data));
            $("#cart-list").append(
              ' <tr class="item">\
                                                <input class="id" type="hidden" value="' +
                data.id +
                '">\
                                                <td>\
                                                    <a href="#">\
                                                        <img src="' +
                data.imageUrl[0] +
                '" alt="' +
                data.namex +
                '">\
                                                    </a>\
                                                </td>\
                                                <td>\
                                                    <a href="#">' +
                data.name +
                '</a>\
                                                </td>\
                                                <td id="' +
                element.itemId +
                '">\
                                                    <input type="number" min="1" value="' +
                element.quantity +
                '" class="form-control">\
                                                </td>\
                                                <td>' +
                _bFmt(data.price) +
                "</td>\
                                                <td>" +
                _bSym +
                "0.00</td>\
                                                <td>" +
                _bFmt(element.quantity * data.price) +
                '</td>\
                                                <td>\
                                                    <a href="#" onclick="deleteFromCart(\'' +
                data.id +
                '\')"><i class="fa fa-trash-o"></i></a>\
                                                </td>\
                                            </tr>',
            );
            cartTotal = cartTotal + element.quantity * data.price;
            console.log("Cur total: " + cartTotal);
            numItemsInCart = numItemsInCart + element.quantity;
          }).always(function () {
            console.log(
              "Final counts: $" +
                cartTotal +
                ", with " +
                numItemsInCart +
                " items.",
            );
            $("#orderButton").prop("disabled", false);
            if (
              $("p#address").text() === "No address saved for user." ||
              $("p#number").text() === "No credit card saved for user."
            ) {
              $("#orderButton").click(function (event) {
                event.stopPropagation();
                event.preventDefault();
                $("#user-message").html(
                  '<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> Could not place order. Missing shipping or payment information.</div>',
                );
                return false;
              });
            } else {
              $("#orderButton").click(function (event) {
                if (orderPlaced == false) {
                  orderPlaced = true;
                  return order();
                }
              });
            }
            $("#numItemsInCart").text(
              "You currently have " + numItemsInCart + " item(s) in your cart.",
            );
            $("#cartTotal").text(_bFmt(cartTotal));
            $("#orderSubtotal").text(_bFmt(cartTotal));
            $("#orderShipping").text(_bFmt(shipping / _bRate));
            $("#orderGrandTotal").text(_bFmt(cartTotal + shipping / _bRate));
          });
        }
      });
    }
  });

  $.getJSON("/card", function (data) {
    if (data.status_code !== 500) {
      $("p#number")
        .text("Card ending in " + data.number)
        .css("color", "black");
      $("#add_payment").hide();
    } else {
      $("p#number").text("No credit card saved for user.").css("color", "red");
      $("#add_payment").show();
    }
  });

  $.getJSON("/address", function (data) {
    if (data.status_code !== 500) {
      var text = data.number + " ";
      text += data.street;
      text += "</br>";
      text += data.city;
      text += "</br>";
      text += data.postcode;
      text += "</br>";
      text += data.country;
      $("p#address").html(text).css("color", "black");
      $("#add_shipping").hide();
    } else {
      $("p#address").text("No address saved for user.").css("color", "red");
      $("#add_shipping").show();
    }
  });

  $.getJSON("/catalogue", { size: 3 }, function (data) {
    if (data != null) {
      $.each(data, function (index, element) {
        $("#youMayAlsoLike").append(
          '<div class="col-md-3 col-sm-6">\
                                <div class="product same-height">\
                                    <div class="flip-container">\
                                        <div class="flipper">\
                                            <div class="front">\
                                                <a href="detail.html?id=' +
            element.id +
            '">\
                                                    <img src="' +
            element.imageUrl[0] +
            '" alt="" class="img-responsive">\
                                                </a>\
                                            </div>\
                                            <div class="back">\
                                                <a href="detail.html?id=' +
            element.id +
            '">\
                                                    <img src="' +
            element.imageUrl[1] +
            '" alt="" class="img-responsive">\
                                                </a>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <a href="detail.html" class="invisible">\
                                        <img src="' +
            element.imageUrl[0] +
            '" alt="" class="img-responsive">\
                                    </a>\
                                    <div class="text">\
                                        <h3><a href="detail.html?id=' +
            element.id +
            '">' +
            element.name +
            '</a></h3>\
                                        <p class="price">' +
            _bFmt(element.price) +
            "</p>\
                                    </div>\
                                </div>\
                            </div>",
        );
      });
    }
  }).always($(window).trigger("resize"));
});
