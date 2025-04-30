//console.log("BÓTBA VAGY FIAM!");
var cart;

//old cart be like: object, {id: quantity}
//but, it should be like: {}

//===CART METHODS===
//BADGE
function displayCartLength(){
    //just displaying a small number nexto the cart icon
    $('#cart span.badge').text(cart.length);
}
//ADD
function addToCart(product){
    // if(cart[product]) cart[product]++;
    // else cart[product] = 1;

    //we need to know if we have it in cart at all
    let i = 0;
    while(i < cart.length && cart[i].product != product) i++;
    //if in cart increment quantity
    if(i < cart.length) {
        message('info', "Termék mennyisége megnövelve!", 700)
        cart[i].quantity++;
    }
    //othervise add
    else {
        cart.push({product: product, quantity: 1});
        message('success', "Termék hozzáadva a kosárhoz!", 1500)
    }

    displayCartLength();
}

//DATA
async function requestProducts(){
    //making a request for cart data
    //get products data from cart obj
    let promises = cart.map(item => $.getJSON(`/api/products/${item.product}`));
    return Promise.all(promises);
}
//LIST
function cartIsEmpty(){
    //displaying a "cart is empty" text when the cart is empty
    $('ul.cart').append($('<li class="list-group-item">A kosár üres!</li>'));
}
function renderCart(list){
    //requesting data then rendering the list
    requestProducts().then(values => {
        //and calling the appender function with received data
        appendCart(list, values);
    })
    .catch(err => {
        console.log("NOTGOOD");
        list.append($('<li></li>')).text('Something went wrong :\'c');
        console.error(err);
    });
}
function appendCart(list, values){
    //appending the received data to cart list
    let sum = 0;
    values.forEach((item, i) => {
        sum += cart[i].quantity * item.price;
        appendCartItem(list, item, i)
    });
    renderPrice();
}
function appendCartItem(list, item, i){
    //this method just add one listitem to the cart
    let listItem = $(`<li class="list-group-item d-flex justify-content-between"></li>`);
    listItem
    .append($(`<span>${item.title}</span>`))
    .append(`<span><input type="number" class="item-qnt" value="${cart[i].quantity}" data-ships="${item.ships}" data-price="${item.price}" size="2">*${item.price}Ft</span>`)
    .append($('<span><img class="remove-cross remove-item" src="/img/icons/025-add.svg" width="auto" height="16px" alt="X "></span>'))
    .data('id', item._id);
    list.append(listItem);
}
function countPrice(){
    //this method counts the price the entire order's cost
    let sum = 0;
    Array.from($('.cart input[type="number"]')).forEach(item => {
        sum += parseInt($(item).attr('data-price')) * parseInt($(item).val());
    });
    return sum;
}
function shouldShip(){
    let ships = false;
    Array.from($('.cart input[type="number"]')).forEach(item => {
        console.log($(item).attr('data-ships'));
        if($(item).attr('data-ships').toLowerCase() == 'true') {
            ships = true;
        }
    });
    return ships;
}
function renderPrice(){
    //this methods displayses the sum price of entire order
    $('.cart #price').text(countPrice());
}
//kosár módosítása
$(document).on('change', 'input.item-qnt',(e) => {
    //changing the quantity of a cart item
    let target = $(e.target);
    let li = $(target.parent().parent());
    let id = li.data('id'), qnt = parseInt(target.val());

    let i = 0;
    while(cart[i].product != id) i++;

    if(qnt > 0) cart[i].quantity = qnt;
    else {
        cart.splice(i, 1);
        displayCartLength();
        li.remove();
    }
    renderPrice();
    if(cart.length == 0) cartIsEmpty();
});
//elem törlése a kosárból
$(document).on('click', 'img.remove-item',(e) => {
    //removing specific item from cart
    let li = $(e.target).parent().parent();
    //delete cart[li.data('id')];
    let i = 0;
    while(cart[i].product != $(li).data('id')) i++;
    cart.splice(i, 1);
    li.addClass('disappear')
    setTimeout(()=> {
        li.remove();
        displayCartLength();
        renderPrice();
        if(cart.length == 0) cartIsEmpty();
    }, 400);
});


//WINDOW
//oldalbetöltéskor
$(document).ready(e => {
    //olvassuk be a kosár sütit
    cart = eat_cookie('cart');
    try {
        cart = JSON.parse(cart);
    } catch {
        cart = [];
        console.warn('Cart is now an empty array');
    }
    if(typeof cart !== "object" && !cart.length) cart = [];


    displayCartLength();
    //console.log(basket);
    renderCart($('.cart ul'));

    $('.addToCart').click(e => {
        addToCart($(e.target).attr('data-id'));
    });
});

//amikor a kosár tartalmát lecsekkoljuk MODAL ablakban
$('#cartModal').on('show.bs.modal', function(e) {
    var modal = $(this);
    //modal should be clean first
    var list = modal.find('.cart ul');
    list.html('');
    if(cart.length == 0) cartIsEmpty();
    //fill modal
    requestProducts().then(values => {
        //and calling the appender function with received data
        appendCart(list, values);
    })
    .catch(err => {
        console.log("NOTGOOD");
        list.append($('<li></li>')).text('Something went wrong :\'c');
        console.error(err);
    });
});

//amikor megrendeljük a cuccot
$('.checkoutForm form').on('submit', function(e){
    e.preventDefault();

    //do anything only if cart is not empty
    if(cart.length > 0){
        //and now store the form data
        let fd = new FormData(this),
            order = {products: [], details: {}, payment: {}},
            keys = ["name", "email", "phone", "zipcode", "city", "address", "etc"];

        keys.forEach(key => order.details[key] = fd.get(`details[${key}]`));
        order.payment.method = fd.get('payment[method]');
        order.products = cart;
        order.price = countPrice();
        order.ships = shouldShip();

        console.log(order);

        //and finally
        //sendingt the order to api
        $.ajax({
            url: '/api/orders',
            method: 'POST',
            data: order
        })
        .then(data => {
            $('.checkoutForm').fadeOut(500, function(){
                $(this).html(`<h1 class='text-success'>Sikeres renderlés!</h1><p>A rendelés adatai megtekinthetőek <a href="/order/${data._id}">ide</a> kattintva</p>`);
                $(this).fadeIn(100);
                $("#checkoutCart").fadeOut(700);
                cart = [];
                bake_cookie('cart', JSON.stringify(cart));
            });
        })
        .catch(err => {
            alert('Something went wrong! :c');
            console.error(err);
        });
    } else {
        message('error', "Nincs megrendelni való termék");
    }
});

//oldal bezárásakor
$(window).on('beforeunload', function(){
    //storing the cart cookie
    //bake_cookie('cart', cart);
    bake_cookie('cart', JSON.stringify(cart));

});
