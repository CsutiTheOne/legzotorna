async function getShippingPrice(){
    //additional request for shipping price
    var values;
    await $.getJSON('/api/config')
    .then(data => {
        values = {eloreu: data.eloreu_shipping, utanv: data.utanv_shipping};
    })
    .catch(console.error);
    return values;
}

class Order {
    constructor(data){
        this.load.call(this, data);
    }
    load(data){
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    render(order = this){
        Object.keys(order).forEach(key => {
            if(typeof order[key] === "object") {
                if(Array.isArray(order[key])) return; //order[key].forEach(val => this.renderItem(key, val));
                else this.render(order[key]);
            } else {
                this.renderField(key, order[key]);
            }
        });
        //let shipping = await getShippingPrice();
        //
        getShippingPrice()
        .then(data => {
            let shipping = data[(this.payment.method == "Előre_utalás") ? 'eloreu' : 'utanv' ];
            $('#shipping').text(`(Szállítás: ${shipping}Ft)`);
        })
    }
    renderField(key, val){
        if(key == "date") {
            val = displayDate(val);
        }
        if(["_id", "date", "name", "method"].includes(key)) $(`#${key}`).text(val);
        else if(key == "done" && val) $(`input[name="payment.done"]`).prop('checked', true);
        else $(`#${key}`).val(val);
    }
    renderProducts(productList, priceElement){
        let sum = 0;
        this.products.forEach((product, i) =>{
            let li = $(`<li class="list-group-item">${product.quantity}db ${product.product.title} </li>`)
            productList.append(li);
            sum += product.product.price;
        });
        priceElement.text(sum);
    }
}

const id = window.location.pathname.split('/')[3];
var o;

//make an initial request
$('document').ready(function(e){
    $.getJSON(`/api/orders/${id}`)
    .then(data => {
        //do my thing
        o = new Order(data);
        o.render();
        o.renderProducts($('#products'), $('#price'));
    })
    .catch(err => {
        console.error(err);
    });
    //and also add event listener to all input fields
    $('input, select, textarea').on('change', function(e) {
        $('#saver').slideDown(300);
    });
});


//save
$('#save').click(function(e) {
    $('#saver').slideUp(200);
    //this is the data rewritten in the form
    let fd = new FormData(document.getElementsByTagName('form')[0]);
    //we assign every modified data from the form to the actual object of order
    fd.forEach((val, name) => {
        //but in order to do that, we must dive into subObjects
        if(name.includes('.')){
            //by name of subobjects
            name = name.split('.');
            let itsIn = o; //this variable references the subobject
            name.forEach((key, i, arr) => {
                if(i < name.length-1) itsIn = o[key];  //and if there is further to go
                else itsIn[key] = val; //so we are at the endpoint of subobject
            });
        } else o[name] = val; //also, if no subobjs, just assign that shit
    });
    //checkbox is individual
    o.payment.done = $('input[type="checkbox"]').is(':checked');

    //and then make an api call to save
    $.ajax({
        url: `/api/orders/${id}`,
        method: "PUT",
        data: o
    })
    .then(data =>{
        console.log(data);
    })
    .catch(err =>{
        alert('Something went wrong... :v');
        console.error(err);
    });
});
//cancel modifications
$('#cancel').click(function(e) {
    o.render(o);
    $('#saver').slideUp(200);
})

//delete order
$('#delete').click(function(e) {
    let sure = window.confirm('Biztosan törli ezt a rendelést?');
    if(sure) {
        $.ajax({
            url: `/api/orders/${id}`,
            method: 'DELETE'
        })
        .then(res =>{
            window.location = window.location.pathname.split('/').splice(0,3).join('/');
        })
        .catch(err => {
            console.error(err);
        });
    }
});
