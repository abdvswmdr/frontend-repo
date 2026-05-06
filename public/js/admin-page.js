$.ajaxSetup({ contentType: 'application/json; charset=utf-8' });
$('#topbar').load('topbar.html');
$('#navbar').load('navbar.html');
$('#footer').load('footer.html');

// Redirect non-admins immediately — /me check is the authoritative gate
$.getJSON('/me', function (data) {
    if (!data.loggedIn) {
        window.location.href = 'index.html';
        return;
    }
    if (data.user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    loadUsers();
}).fail(function () {
    window.location.href = 'index.html';
});

$('#user-search').on('input', function () {
    var q = $(this).val().toLowerCase();
    $('#users-tbody tr').each(function () {
        var text = $(this).text().toLowerCase();
        $(this).toggle(text.indexOf(q) > -1);
    });
});

var allUsers = [];

function showMsg(msg, type) {
    var cls = type === 'error' ? 'danger' : 'success';
    $('#admin-message').html(
        '<div class="alert alert-' + cls + ' alert-dismissible" role="alert">' +
        '<button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>' +
        msg + '</div>'
    );
}

function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

function loadUsers() {
    $('#loading-status').text('/admin/users AJAX sent...');
    $.ajax({
        url: '/admin/users',
        type: 'GET',
        success: function (data) {
            if (!Array.isArray(data)) {
                console.error('Expected array of users, got:', data);
                var msg = (data && data.error) || 'Invalid response from server';
                $('#users-tbody').html('<tr><td colspan="5" class="text-center text-danger">' + esc(msg) + '</td></tr>');
                return;
            }
            allUsers = data || [];
            renderTable(allUsers);
            updateStats(allUsers);
        },
        error: function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to load users';
            $('#users-tbody').html('<tr><td colspan="5" class="text-center text-danger">' + esc(msg) + '</td></tr>');
        }
    });
}

function updateStats(users) {
    var admins = users.filter(function (u) { return u.role === 'admin'; }).length;
    var regular = users.length - admins;
    var newest = users.length ? users[0].username : '—';
    $('#stat-total').text(users.length);
    $('#stat-admins').text(admins);
    $('#stat-users').text(regular);
    // Use textContent to avoid XSS from usernames
    document.getElementById('stat-newest').textContent = newest;
}

function renderTable(users) {
    var tbody = document.getElementById('users-tbody');
    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No users found.</td></tr>';
        return;
    }

    // Build rows using DOM API to prevent XSS from user-controlled fields
    var fragment = document.createDocumentFragment();
    users.forEach(function (u) {
        var tr = document.createElement('tr');

        var tdUser = document.createElement('td');
        tdUser.textContent = u.username;
        tr.appendChild(tdUser);

        var tdEmail = document.createElement('td');
        tdEmail.textContent = u.email;
        tr.appendChild(tdEmail);

        var tdRole = document.createElement('td');
        var roleBadge = document.createElement('span');
        roleBadge.className = 'label label-' + (u.role === 'admin' ? 'danger' : 'default');
        roleBadge.textContent = u.role;
        tdRole.appendChild(roleBadge);
        tr.appendChild(tdRole);

        var tdDate = document.createElement('td');
        tdDate.textContent = u.createdAt;
        tr.appendChild(tdDate);

        var tdActions = document.createElement('td');

        // Role toggle button
        var roleBtn = document.createElement('button');
        roleBtn.className = 'btn btn-xs btn-' + (u.role === 'admin' ? 'warning' : 'primary');
        roleBtn.style.marginRight = '4px';
        roleBtn.textContent = u.role === 'admin' ? 'Demote' : 'Promote';
        roleBtn.setAttribute('data-id', u.id);
        roleBtn.setAttribute('data-role', u.role === 'admin' ? 'user' : 'admin');
        roleBtn.addEventListener('click', function () {
            handleRoleChange(this.getAttribute('data-id'), this.getAttribute('data-role'));
        });
        tdActions.appendChild(roleBtn);

        // Delete button
        var delBtn = document.createElement('button');
        delBtn.className = 'btn btn-xs btn-danger';
        delBtn.textContent = 'Delete';
        delBtn.setAttribute('data-id', u.id);
        delBtn.setAttribute('data-username', u.username);
        delBtn.addEventListener('click', function () {
            handleDelete(this.getAttribute('data-id'), this.getAttribute('data-username'));
        });
        tdActions.appendChild(delBtn);

        tr.appendChild(tdActions);
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

function handleRoleChange(id, newRole) {
    if (!confirm('Change this user\'s role to "' + newRole + '"?')) return;
    $.ajax({
        url:  '/admin/users/' + id + '/role',
        type: 'PUT',
        data: JSON.stringify({ role: newRole }),
        success: function () {
            showMsg('Role updated.', 'success');
            loadUsers();
        },
        error: function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to update role';
            showMsg(msg, 'error');
        }
    });
}

function handleDelete(id, username) {
    if (!confirm('Permanently delete user "' + username + '"? This cannot be undone.')) return;
    $.ajax({
        url:  '/admin/users/' + id,
        type: 'DELETE',
        success: function () {
            showMsg('User deleted.', 'success');
            loadUsers();
        },
        error: function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to delete user';
            showMsg(msg, 'error');
        }
    });
}
