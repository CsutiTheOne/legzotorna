const id = window.location.pathname.split('/')[2];

class User {
    constructor(user){
        this.load(user);
    }
    load(user){
        Object.keys(user).forEach(key => this[key] = user[key]);
        return this;
    }
    render(){
        Object.keys(this).forEach(key => $(`#${key}`).text(this[key]));
        return this;
    }
    update(){
        $.ajax({
            url: `/api/users/${id}`,
            method: 'PUT',
            data: this
        })
        .then(data => {
            this.load(data);
        })
        .catch(err => {
            console.error(err);
        });

        return this;
    }
}

//fill in data
$('document').ready(function(e){
    //initial request
    $.getJSON(`/api/users/${id}`)
    .then(data => {
        window.u = new User(data);
        u.render();
    })
    .catch(err => {
        console.error(err);
    });
});

//send update

$('.editable').on('input', function(e){
    let el = $(this);
    if(!el.hasClass('saveable')) {
        let saver = $(`<div class="container bg-dark text-center p-3" style="display:none;">
            <button class="btn btn-md btn-danger" id="cancelBtn">Mégse</button>
            <button class="btn btn-md btn-success" id="saveBtn">Mentés</button>
        </div>`);
        saver.data('target', el.prop('id'));
        saver.find('#cancelBtn').click(cancel);
        saver.find('#saveBtn').click(save);
        el.parent().append(saver);
        saver.fadeIn(500);
        el.addClass('saveable');
    }
});
function save(e){
    el = $(this);
    let target = (el.parent().data('target'));

    u[target] = $(`#${target}`).text();
    u.update().render();

    $(`#${target}`).removeClass('saveable');
    el.parent().fadeOut(300);
    el.remove();
}
function cancel(e){
    u.render();
    el = $(this);
    let target = (el.parent().data('target'));
    $(`#${target}`).removeClass('saveable');
    el.parent().fadeOut(300);
    el.remove();

}

//password change
$('#passwordForm').on('submit', function(e) {
    e.preventDefault();
    let fd = new FormData(document.getElementById('passwordForm')), data = {};
    fd.forEach((val, key) => {data[key] = val});
    if(data.new === data.again && data.old !== data.new){
        $.ajax({
            url: `/api/users/${u._id}/change`,
            method: 'PUT',
            data: data
        })
        .then(data => {
            //console.log('MINDEN FASZA!');
            message('success', "Jelszó sikeresen megváltoztatva");
        })
        .catch(err => {
            console.error(err);
            message('error', 'Something went wrong :c');
        });
    } else {
        message('error', (data.old != data.new) ? 'A jelszavak nem egyeznek' : 'Az új jelszó nem lehet a régi!', 0);
    }
});
