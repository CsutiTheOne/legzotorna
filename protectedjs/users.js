const page = window.location.pathname.split('/');
if(page[0] == "") page.splice(0,1);

$(document).ready(() => {
    init(page[1]);
});

function init(page){
    console.log('Init has been called');
    $.getJSON(`/api/${page}`)
    .then(data => {
        //nah we have all users
        data.forEach(user => {
            let add = $(`<li class="list-group-item d-flex flex-row justify-content-between"><a href="/admin/${user._id}">${user.email}</a><button class="btn btn-sm btn-info editUser" data-toggle="modal" data-target="#modal">Edit</button></li>`);
            add.data('user', user);
            $('#list').append(add);
        });
        $('button').click(editUser);
    })
    .catch(err => {
        console.error(err);
    });
}

function editUser(e){
    var userData = ($(e.target).data('user'));
}

$('#modal').on('show.bs.modal', function (e) {
    //user data releated to clicked button
    var element = $(e.relatedTarget.parentElement),
        user = element.data('user');
    
    var modal = $(this);
    modal.find('.modal-title').text('Edit: ' + user.username);
    
    //fill up the modal body
    modal.find('.modal-body row').text('')
    .append($('<ul class="list-group col-12"></ul>'));
    modal.find('ul').text('');
    //filling the rightlist
    Object.keys(user.rights).forEach(right => {
        let checkbox = $('<input name="'+ right + '" type="checkbox" data-toggle="toggle">');
        if(user.rights[right]) checkbox.prop('checked', true);
        
        modal.find('ul')
        .append($('<li class="list-group-item d-flex justify-content-between"></li>')
        .text(right)
        .append(checkbox));
    });
    //remove button at the end
    modal.find('.modal-body').append($(`<form action="/api/users/${user._id}?_method=DELETE" method="post" class="text-right"><button type="submit" class="btn btn-md btn-danger">Törlés</button></form>`));
    
    //listen for clicks on save button
    modal.find('#saveUser').click(function(e){
        let rights = {};
        //check on every checkbox
        Array.from($('input')).forEach(item => {
            let right, checked;
            right = $(item).prop('name');
            checked = $(item).prop('checked');
            //if checkbox's value differs from original, store it
            rights[right] = checked;
        });
        //this way we only send the changed rigths
        $.ajax({
            url: `/api/users/${user._id}`,
            method: 'PUT',
            data: {rights: rights}
        })
        .then(data => {
            //update local data
            element.data('user', data);
        })
        .catch(err => {
            console.log(err);
        })
    });
});

$('#invModal').on('show.bs.modal', function (e) {
    var modal, mail
    modal= $(this);
    modal.find('#sendInvite').click(e => {
        mail = modal.find('input').val();
        
        console.log("NA MAJD KÜLDÖK MEGHÍVÓT IDE:");
        console.log(mail);
    });
});