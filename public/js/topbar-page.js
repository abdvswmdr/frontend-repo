// --- Currency helpers (global, used by index/category/detail) ---
var CURRENCY_SYMBOLS = { USD: "$", KES: "KSh ", EUR: "€" };

function soqoniGetCurrency() {
  return localStorage.getItem("soqoniCurrency") || "KES";
}

function soqoniSetCurrency(val) {
  localStorage.setItem("soqoniCurrency", val);
  location.reload();
}

function soqoniSymbol() {
  return CURRENCY_SYMBOLS[soqoniGetCurrency()] || "$";
}

// Expose globally so other page scripts can call them
window.soqoniGetCurrency = soqoniGetCurrency;
window.soqoniSetCurrency = soqoniSetCurrency;
window.soqoniSymbol = soqoniSymbol;

$(document).ready(function () {
  $.ajaxSetup({
    contentType: "application/json; charset=utf-8",
  });

  // Set dropdown to stored value immediately on topbar load
  var stored = localStorage.getItem("soqoniCurrency") || "KES";
  $("#currency-select").val(stored);

  if ($.cookie("logged_in") != null && $.cookie("logged_in") != "") {
    $.getJSON("/me", function(data) {
      if (data && data.loggedIn && data.user) {
        var displayName = data.user.firstName || data.user.username;
        window.soqoniRole = data.user.role || 'user';
        $("#login").remove();
        $("#register").remove();
        $("#howdy")
          .append('<a href="customer-account.html">Hi, ' + displayName + '<\/a>')
          .hide()
          .fadeIn(200);
        $("#logout").hide().fadeIn(200);
        if (data.user.role === 'admin') {
          setTimeout(function() { $("#tabAdmin").show(); }, 200);
        }
      } else {
        $("#howdy").remove();
        $("#logout").remove();
      }
    }).fail(function() {
      $("#howdy").remove();
      $("#logout").remove();
    });
  } else {
    window.soqoniRole = 'guest';
    $("#howdy").remove();
    $("#logout").remove();
  }
});

// Announcement bar — show unless user dismissed
function dismissAnnouncement() {
  localStorage.setItem("announcementDismissed", "1");
  document.getElementById("announcement-bar").style.display = "none";
}

if (localStorage.getItem("announcementDismissed") !== "1") {
  document.getElementById("announcement-bar").style.display = "block";
}
