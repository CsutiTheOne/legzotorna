//This method sends a
async function deleteContent(id){
    //console.log('kliked')
    return $.ajax({
        url: `/api/contents/${id}`,
        method: 'DELETE'
    });
}

//COOKIE METHODS

function bake_cookie(cname, cvalue, exdays=3) {
 var d = new Date();
 d.setTime(d.getTime() + (exdays*24*60*60*1000));
 var expires = "expires="+ d.toUTCString();
 document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function eat_cookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function delete_cookie(cname){
    document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


//function returning locale Date
function displayDate(dString){
    let d = new Date(dString);
    return d.toLocaleDateString('hu');
}

//method for UI messegebar
function message(type = "info", msg, time = 5000, cb){
    if(typeof time === 'function') {
        cb = time;
        time = 5000;
    }
    type == 'error' ? type = 'danger' : type = type;
    let msgEl = $(`<div class="alert alert-${type}" style="display:none;"><p>${msg}</p></div>`);
    $('#messagebar').html(msgEl);
    msgEl.fadeIn(100);
    if(time>0){
        window.setTimeout(()=>msgEl.fadeOut(500, function(){
            $(this).css({'visibility':'hidden', 'display':'block'});
        }), time);
    }
    if(cb) return cb(msgEl);
    return msgEl;
}

//I don't remember what this lady does -\_(˘.˘)_/-
$('.contentDeleter').click(function(e){
    let id = $(e.target).attr('data-id');
    deleteContent(id)
    .then(data => {
        console.log(data);
        $(e.target.parentElement.parentElement).remove();
    })
    .catch(err => {
        console.log("SOMETHING WENT WRONG!");
        console.log(err);
    });
});
//This function here sends the contact message from client side
$('#contactForm').on('submit', function(e){
    e.preventDefault();
    var fd = new FormData(this), data = {};
    fd.forEach((val, key) => data[key] = val);
    $.ajax({
        url: '/api/messages',
        method: 'POST',
        data: data
    })
    .then(data => {
        window.setTimeout(function(){
            $('#contactForm').fadeOut(500, function(){
                $(this).html('<h4 class="text-success">Köszönjük, hogy kapcsolatba lépett velünk!</h4>');
                $(this).fadeIn(300);
            });
        }, 400);
    })
    .catch(err => {
        console.error(err);
    })
});

//Show and hide animations
$('.showAndHide').click(function(e){
    e.stopEventPropagation;
    let target = $($(this).attr('data-target'));
    target.slideToggle(500, ()=>{
        let rot = $(this).attr('style') == 'transform:rotate(180deg);' ? 'transform:rotate(360deg);' : 'transform:rotate(180deg);';
        $(this).attr('style', rot);
    });
});

//general date Displayer (or date translator)
$('document').ready(function(e){
    $('.dateDisplay').text(function(){
        return displayDate($(this).text());
    });
})
