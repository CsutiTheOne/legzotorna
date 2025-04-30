//Global vars
const   id = window.location.pathname.split('/')[3];
//class to describe message
class Message {
    constructor(data){
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    render(){
        Object.keys(this).forEach(key => {
            $(`#${key}`).text(this[key]);
        });
        if(this.answer.done){
            $('textarea').show().prop('readonly', true).val(this.answer.text);
        }
        return this;
    }
}

//Make a request to fill the pagewith data
$('document').ready(function(e) {
    //so, make initial request
    $.getJSON(`/api/messages/${id}`)
    .then(data =>{
        window.m = new Message(data);
        m.render();
    })
    .catch(err =>{
        console.error(err);
    });
});

//send out answer
//but first do some fancy shit with the send button
$('#send').click(function(e){
    if($(this).text() == "válasz"){
        $('#answerForm').slideDown(300);
        $(this).text('Küldés!');
        if(m.answer.done) $(this).remove();
    } else {
        m.answer = {done: true, text: $('textarea').val()};
        $.ajax({
            url: `/api/messages/${id}`,
            method: 'PUT',
            data: m
        })
        .then(data =>{
            //!NOTE:
            //This rerendering will work only in production
            m = new Message(data);
            m.render();
            $('#send').remove();
            message('success', 'Válasz sikeresen elküldve!')
        })
        .catch(err =>{
            console.error(err);
            message('error', 'Something went wrong :c');
        });
    }
});

//delete message
$('#delete').click(function(e){
    //ask if user is sure about it
    let sure = window.confirm('Biztosan törli ezt az üzenetet és a hozzá tartozó választ?');
    if(sure){
        //send delete request
        $.ajax({
            url: `/api/messages/${id}`,
            method: 'DELETE'
        })
        .then(data => console.log(data))
        .catch(err => {
            message('error', "Something went wrong :c");
            console.error(err);
        });
        //redirect user
        setTimeout(()=>window.location = '/admin/messages', 700);
    }
});
