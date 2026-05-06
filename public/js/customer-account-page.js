var KENYA_TOWNS = {
  "Mombasa":        ["Mombasa City","Kisauni","Likoni","Nyali","Bamburi","Changamwe","Jomvu"],
  "Kwale":          ["Kwale","Ukunda","Diani Beach","Msambweni","Shimba Hills","Lunga Lunga"],
  "Kilifi":         ["Kilifi","Malindi","Mtwapa","Watamu","Kaloleni","Mariakani","Ganze"],
  "Tana River":     ["Hola","Garsen","Bura","Wenje","Madogo"],
  "Lamu":           ["Lamu","Mpeketoni","Witu","Faza","Mokowe"],
  "Taita/Taveta":   ["Voi","Wundanyi","Taveta","Mwatate"],
  "Garissa":        ["Garissa","Dadaab","Modogashe","Bura East"],
  "Wajir":          ["Wajir","Habaswein","El Wak","Bute"],
  "Mandera":        ["Mandera","El Wak","Takaba","Banissa"],
  "Marsabit":       ["Marsabit","Moyale","Sololo","Laisamis","Loiyangalani"],
  "Isiolo":         ["Isiolo","Merti","Garbatulla"],
  "Meru":           ["Meru","Nkubu","Timau","Makutano","Maua","Igembe"],
  "Tharaka-Nithi":  ["Chuka","Kathwana","Chogoria","Marimanti"],
  "Embu":           ["Embu","Runyenjes","Siakago","Kiritiri"],
  "Kitui":          ["Kitui","Mutomo","Mwingi","Kabati","Migwani"],
  "Machakos":       ["Machakos","Athi River","Kangundo","Matuu","Mavoko","Tala"],
  "Makueni":        ["Wote","Kibwezi","Sultan Hamud","Emali","Makindu"],
  "Nyandarua":      ["Ol Kalou","Engineer","Nyahururu","Kinangop","Kipipiri"],
  "Nyeri":          ["Nyeri","Karatina","Othaya","Naro Moru","Mweiga","Mukurweini"],
  "Kirinyaga":      ["Kerugoya","Kutus","Sagana","Kagio","Wanguru"],
  "Murang'a":       ["Murang'a","Kangema","Maragua","Kigumo","Kenol"],
  "Kiambu":         ["Kiambu","Thika","Ruiru","Limuru","Kikuyu","Githunguri","Karuri","Gatundu"],
  "Turkana":        ["Lodwar","Kakuma","Lokichogio","Kalokol","Lokichar"],
  "West Pokot":     ["Kapenguria","Sigor","Alale","Chepareria"],
  "Samburu":        ["Maralal","Baragoi","Wamba","Archer's Post"],
  "Trans Nzoia":    ["Kitale","Endebess","Kiminini","Saboti"],
  "Uasin Gishu":    ["Eldoret","Burnt Forest","Turbo","Ziwa"],
  "Elgeyo/Marakwet":["Iten","Eldama Ravine","Cherangany","Kamariny"],
  "Nandi":          ["Kapsabet","Nandi Hills","Mosoriot","Kobujoi"],
  "Baringo":        ["Kabarnet","Marigat","Eldama Ravine","Mogotio","Kabartonjo"],
  "Laikipia":       ["Nanyuki","Nyahururu","Rumuruti","Doldol"],
  "Nakuru":         ["Nakuru","Naivasha","Gilgil","Molo","Njoro","Subukia","Rongai"],
  "Narok":          ["Narok","Kilgoris","Ololulunga","Suswa"],
  "Kajiado":        ["Kajiado","Ongata Rongai","Kitengela","Ngong","Loitokitok","Namanga"],
  "Kericho":        ["Kericho","Litein","Londiani","Brooke"],
  "Bomet":          ["Bomet","Sotik","Mulot","Longisa","Chepalungu"],
  "Kakamega":       ["Kakamega","Mumias","Malava","Butere","Lurambi","Navakholo"],
  "Vihiga":         ["Vihiga","Mbale","Luanda","Hamisi"],
  "Bungoma":        ["Bungoma","Webuye","Kimilili","Malakisi","Chwele"],
  "Busia":          ["Busia","Malaba","Funyula","Nambale","Port Victoria"],
  "Siaya":          ["Siaya","Bondo","Ugunja","Yala","Lwak"],
  "Kisumu":         ["Kisumu","Ahero","Muhoroni","Maseno","Winam"],
  "Homa Bay":       ["Homa Bay","Kendu Bay","Oyugis","Mbita","Ndhiwa"],
  "Migori":         ["Migori","Awendo","Isebania","Rongo","Uriri","Suna"],
  "Kisii":          ["Kisii","Ogembo","Suneka","Keroka","Manga"],
  "Nyamira":        ["Nyamira","Nyansiongo","Keroka","Magombo","Ekerenyo"],
  "Nairobi City":   ["Nairobi CBD","Westlands","Eastleigh","Karen","Langata","Embakasi",
                     "Kasarani","Dagoretti","Kibera","Huruma","Gikomba","South B","South C",
                     "Kilimani","Lavington","Parklands","Buruburu","Donholm","Pipeline","Roysambu"]
};

function populateTowns(selectedTown) {
    var county = document.getElementById('county').value;
    var townSel = document.getElementById('city-select');
    townSel.innerHTML = '<option value="">— Select town —</option>';
    if (!county || !KENYA_TOWNS[county]) return;
    KENYA_TOWNS[county].forEach(function(town) {
        var opt = new Option(town, town);
        if (town === selectedTown) opt.selected = true;
        townSel.appendChild(opt);
    });
}

function getCity() {
    var txt = document.getElementById('city-text').value.trim();
    if (txt) return txt;
    return document.getElementById('city-select').value;
}

function showMessage(msg, type) {
    var cls = type === 'error' ? 'danger' : 'success';
    document.getElementById('account-message').innerHTML =
        '<div class="alert alert-' + cls + ' alert-dismissible" role="alert">' +
        '<button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>' +
        msg + '</div>';
    window.scrollTo(0, 0);
}

function loadProfile() {
    $.getJSON('/me', function(data) {
        if (!data.loggedIn) {
            window.location.href = 'index.html';
            return;
        }
        var u = data.user;
        document.getElementById('username').value    = u.username   || '';
        document.getElementById('email').value       = u.email      || '';
        document.getElementById('firstname').value   = u.firstName  || '';
        document.getElementById('lastname').value    = u.lastName   || '';
        document.getElementById('gender').value      = u.gender     || '';
        document.getElementById('phone').value       = u.phone      || '';
        document.getElementById('street').value      = u.street     || '';
        document.getElementById('postal_code').value = u.postalCode || '';

        if (u.county) {
            document.getElementById('county').value = u.county;
            populateTowns(u.city);
            if (!document.getElementById('city-select').value) {
                document.getElementById('city-text').value = u.city || '';
            }
        }
    }).fail(function() {
        window.location.href = 'index.html';
    });
}

function saveProfile() {
    var payload = {
        firstName:  document.getElementById('firstname').value,
        lastName:   document.getElementById('lastname').value,
        email:      document.getElementById('email').value,
        phone:      document.getElementById('phone').value,
        gender:     document.getElementById('gender').value,
        street:     document.getElementById('street').value,
        city:       getCity(),
        county:     document.getElementById('county').value,
        postalCode: document.getElementById('postal_code').value
    };
    $.ajax({
        url: '/me',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function() { showMessage('Profile updated successfully.', 'success'); },
        error: function(xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to save profile.';
            showMessage(msg, 'error');
        }
    });
    return false;
}

function savePassword() {
    var oldPw  = document.getElementById('password_old').value;
    var newPw  = document.getElementById('password_new').value;
    var confPw = document.getElementById('password_confirm').value;
    if (!oldPw || !newPw) { showMessage('Please fill in all password fields.', 'error'); return false; }
    if (newPw !== confPw) { showMessage('New passwords do not match.', 'error'); return false; }
    $.ajax({
        url: '/me/password',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
        success: function() {
            showMessage('Password changed successfully.', 'success');
            document.getElementById('form-password').reset();
        },
        error: function(xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to change password.';
            showMessage(msg, 'error');
        }
    });
    return false;
}

$.ajaxSetup({ contentType: 'application/json; charset=utf-8' });
$('#topbar').load('topbar.html');
$('#navbar').load('navbar.html');
$('#footer').load('footer.html');
loadProfile();
