console.log("Termékek oldal");

function logError(err){
    console.log('SOMETHING WENT WRONG');
    console.error(err);
}
function renderAllProducts(products){
    console.log('RENDERING PRODUCTS')
    //appending the main body with every poroduct
    products.forEach(product => {
        renderProduct(product);
    });

}
function renderProduct(product){
    $('.products').append(
        $(`<div class="card" data-id="${product._id}">
            ${(product.images && product.images.length > 0) ? '<img class="card-img-top" src="' + product.images[0] + '" alt="Card image cap">' : ''}
            <div class="card-body">
                <h3 class="card-title">${product.title}</h3>
                <h5>${product.price}</h5>
                <p class="card-text">${product.description ? product.description : ""}</p>
                <button type="button" class="btn btn-warning editProduct" data-toggle="modal" data-target="#modal">
                    Szerkesztés
                </button>
            </div>
        </div>`)
    );
    $('.editProduct').last().data('product', product);
}
function updateProduct(product){
    var card = $(`div[data-id=${product._id}]`);
    // console.log(product);
    // console.log(card);
    card.find($('.card-title')).text(product.title);
    card.find($('h5')).text(product.price);
    card.find($('.card-text')).text(product.description ? product.description : "");
    card.find($('button')).data('product', product);
}
function removeProduct(productId){
    //console.log("Theoretically removed!");
    $(`div[data-id=${productId}]`).remove();
}



//when document loads
$(document).ready(function(){
    //request for products
    $.ajax({
        method: 'GET',
        url: '/api/products'
    })
    .then(renderAllProducts)
    .catch(logError);
    //request files for file choosing
    $.ajax({
        method: 'GET',
        url: '/api/files'
    })
    .then(files => {
        files.forEach((filename, i) => {
            let item = $(`<option value="/api/files/${filename}">${filename}</option>`)
            $('select[name="url"]').append(item);
        });
    })
    .catch(logError);

    //show url input when product type changes
    $('select[name="type"]').on('change', function(e){
        let type = $(e.target).val();
        if(type === 'digital-file'){
            $('.productFile').removeClass('d-none');
            $('.productUrl').addClass('d-none');
        } else if (type === 'digital-url') {
            $('.productUrl').removeClass('d-none');
            $('.productFile').addClass('d-none');
        } else {
            $('.productFile').addClass('d-none');
            $('.productUrl').addClass('d-none');
        }
    });
    //append images (later)



    $('#modal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget),
            modal = $(this);
        let create = button.data('product') == undefined;
        let data;
        $('#saveProduct').data('send', {
            method: 'POST',
            url: "/api/products"
        });
        modal.find($('input')).val('');
        //when modal loads we need to load in data
        //but only if it is not a new product's form
        $('#deleteProduct').hide();
        if(!create){
            $('#deleteProduct').show();
            data = button.data('product');
            modal.find('.modal-title').text(create ? "Új termék!" : data.title);
            $('#saveProduct').data('send', {
                method: 'PUT',
                url: `/api/products/${data._id}`,
                id: data._id
            });
            Object.keys(data).forEach(key => {
                if(key == 'type'){
                    data[key] = (data['url'].indexOf('/api') == 0) ? 'digital-file' : 'digital-url';
                    if(data[key] == 'digital-file'){
                        $('select[name="url"]').val(data['url']);
                        $('.productFile').removeClass('d-none');
                    } else {
                        $('input[name="url"]').val(data['url']);
                        $('.productUrl').removeClass('d-none');
                    }
                }
                $(`[name="${key}"]`).val(data[key] || "");
                if(key == "ships") {
                    $(`[name="${key}"]`).val((data[key]) ? "true" : "false");
                    $(".form-check-input").prop("checked", data[key]);
                }

            });
            modal.find($('select')).val(data.type);
        }
        modal.find('.modal-title').text(create ? "Új termék!" : data.title);
    });
    //save button click
    $('#saveProduct').on('click', function (e) {
        let modal = $('#modal');
        modal.modal('hide');

        //gather data here
        let fd = new FormData(document.getElementById('productForm')), data = {};
        var keys = ['title', 'price', 'description', 'type', 'image', 'ships'];
        keys.forEach(key => {
            data[key] = fd.get(`${key}`);
        });
        if(fd.get('type') == 'digital-file' || fd.get('type') == 'digital-url'){
            data.type = 'digital';
            data.url = (fd.get('type') == 'digital-file') ? $('select[name="url"]').val() : $('input[name="url"]').val()
        } else {
            data.url = "";
        }
        data.ships = $(".form-check-input").prop("checked");
        var send = $('#saveProduct').data('send');
        saveProduct(send, data);
    });
    //delete button click
    $('#deleteProduct').on('click', function (e) {
        let modal = $('#modal');
        modal.modal('hide');

        var send = $('#saveProduct').data('send');
        deleteProduct(send);
    });
    //sending data
    function saveProduct(send, product){
        $.ajax({
            method: send.method,
            url: send.url,
            data: product
        })
        .then(data => {
            //console.log("SAVED SUCCESFULLY!");
            if(send.method === 'POST') renderProduct(data);
            else updateProduct(data);
        })
        .catch(logError);
    }
    //deleting product
    function deleteProduct(send){
        let modal = $('#modal');
        modal.modal('hide');
        $.ajax({
            method: 'DELETE',
            url: send.url
        })
        .then(data => {
            //console.log("DELETED SUCCESFULLY!");
            removeProduct(send.id);
        })
        .catch(logError);
    }
});


$('#productForm').on('submit', e => {
    e.preventDefault();
});
