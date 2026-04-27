$(document).ready(function () {
    $.ajaxSetup({ contentType: "application/json; charset=utf-8" });

    $("#topbar").load("topbar.html");
    $("#navbar").load("navbar.html");
    $("#footer").load("footer.html");

    var CURRENCY_SYMBOLS = { USD: '$', KES: 'KSh ', EUR: '€' };
    var currency = localStorage.getItem('soqoniCurrency') || 'USD';
    var symbol   = CURRENCY_SYMBOLS[currency] || '$';

    // Main banner slider
    $('#main-slider').owlCarousel({
        navigation: false,
        slideSpeed: 400,
        paginationSpeed: 400,
        autoPlay: 4000,
        stopOnHover: true,
        singleItem: true,
        pagination: true
    });

    var _wl = JSON.parse(localStorage.getItem('soqoniWishlist') || '[]');

    // Build product card HTML (no badge variant)
    function cardHtml(el, sym) {
        var inWish = _wl.indexOf(el.id) > -1;
        return '<div class="item">' +
            '<div class="product">' +
            '<div class="product-img-wrap">' +
            '<a href="detail.html?id=' + el.id + '">' +
            '<img src="' + el.imageUrl[0] + '" alt="' + el.name + '">' +
            '</a>' +
            '<div class="hover-cart">' +
            '<a href="#" onclick="addToCart(\'' + el.id + '\');return false;" class="cart-link">' +
            '<i class="fa fa-shopping-cart"></i> Add to cart</a>' +
            '<a href="#" class="wish-btn' + (inWish ? ' wishlisted' : '') + '" data-id="' + el.id + '"><i class="fa ' + (inWish ? 'fa-heart' : 'fa-heart-o') + '"></i></a>' +
            '</div>' +
            '</div>' +
            '<div class="text">' +
            '<div class="product-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
            '<h3><a href="detail.html?id=' + el.id + '">' + el.name + '</a></h3>' +
            '<p class="price">' + sym + el.price.toFixed(2) + '</p>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    // Init an owl carousel on a given #id string
    function initCarousel(id) {
        $(id).owlCarousel({
            navigation: true,
            slideSpeed: 300,
            paginationSpeed: 400,
            items: 5,
            itemsDesktop: [1199, 5],
            itemsDesktopSmall: [979, 5],
            itemsTablet: [768, 5],
            itemsMobile: [479, 5],
            pagination: false,
            afterInit: function () {
                $(id + ' .item').css('visibility', 'visible');
            }
        });
    }

    // Hot this week (with Best Seller badge)
    $.getJSON('/catalogue', {size: 12, currency: currency}, function (data) {
        if (data != null) {
            $.each(data, function (index, element) {
                var inWish = _wl.indexOf(element.id) > -1;
                $('#hot-slider').append(
                    '<div class="item">' +
                    '<div class="product">' +
                    '<div class="product-badge">Best Seller</div>' +
                    '<div class="product-img-wrap">' +
                    '<a href="detail.html?id=' + element.id + '">' +
                    '<img src="' + element.imageUrl[0] + '" alt="' + element.name + '">' +
                    '</a>' +
                    '<div class="hover-cart">' +
                    '<a href="#" onclick="addToCart(\'' + element.id + '\');return false;" class="cart-link">' +
                    '<i class="fa fa-shopping-cart"></i> Add to cart</a>' +
                    '<a href="#" class="wish-btn' + (inWish ? ' wishlisted' : '') + '" data-id="' + element.id + '"><i class="fa ' + (inWish ? 'fa-heart' : 'fa-heart-o') + '"></i></a>' +
                    '</div>' +
                    '</div>' +
                    '<div class="text">' +
                    '<div class="product-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
                    '<h3><a href="detail.html?id=' + element.id + '">' + element.name + '</a></h3>' +
                    '<p class="price">' + symbol + element.price.toFixed(2) + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                );
            });
            initCarousel('#hot-slider');
        }
    });

    // Microcontrollers section
    $.getJSON('/catalogue', {size: 12, tags: 'Microcontroller', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#mcu-slider').append(cardHtml(el, symbol)); });
            initCarousel('#mcu-slider');
        } else {
            $('#section-mcu').hide();
        }
    });

    // Single Board Computers section
    $.getJSON('/catalogue', {size: 12, tags: 'SBC', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#sbc-slider').append(cardHtml(el, symbol)); });
            initCarousel('#sbc-slider');
        } else {
            $('#section-sbc').hide();
        }
    });

    // Sensors & Modules section
    $.getJSON('/catalogue', {size: 12, tags: 'Sensor', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#sensor-slider').append(cardHtml(el, symbol)); });
            initCarousel('#sensor-slider');
        } else {
            $('#section-sensors').hide();
        }
    });

    // Wireless & Connectivity section
    $.getJSON('/catalogue', {size: 12, tags: 'Wireless', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#wireless-slider').append(cardHtml(el, symbol)); });
            initCarousel('#wireless-slider');
        } else {
            $('#section-wireless').hide();
        }
    });

    // Displays & Outputs section
    $.getJSON('/catalogue', {size: 12, tags: 'Display', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#display-slider').append(cardHtml(el, symbol)); });
            initCarousel('#display-slider');
        } else {
            $('#section-display').hide();
        }
    });

    // Motors & Actuators section
    $.getJSON('/catalogue', {size: 12, tags: 'Motor', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#motors-slider').append(cardHtml(el, symbol)); });
            initCarousel('#motors-slider');
        } else {
            $('#section-motors').hide();
        }
    });

    // Power Management section
    $.getJSON('/catalogue', {size: 12, tags: 'Power', currency: currency}, function (data) {
        if (data && data.length) {
            $.each(data, function (i, el) { $('#power-slider').append(cardHtml(el, symbol)); });
            initCarousel('#power-slider');
        } else {
            $('#section-power').hide();
        }
    });

    // Wishlist toggle for all cards on this page
    $(document).on('click', '.wish-btn', function(e) {
        e.preventDefault();
        var id   = $(this).data('id');
        var list = JSON.parse(localStorage.getItem('soqoniWishlist') || '[]');
        var idx  = list.indexOf(id);
        if (idx > -1) {
            list.splice(idx, 1);
            $(this).removeClass('wishlisted').find('i').removeClass('fa-heart').addClass('fa-heart-o');
        } else {
            list.push(id);
            $(this).addClass('wishlisted').find('i').removeClass('fa-heart-o').addClass('fa-heart');
        }
        localStorage.setItem('soqoniWishlist', JSON.stringify(list));
    });
});
