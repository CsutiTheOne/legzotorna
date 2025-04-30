//handle errors
function handleError(err){
    console.error(err);
    message('error', "Something went wrong :c");
}
//render files list
function render(data){
    data.forEach((file, i, arr) => {
        renderItem(file);
    });
}
//render just one list item
function renderItem(file){
    //in every list item shoul have
    //filename, download, delete
    let listItem = $(
        `<li class="list-group-item d-flex justify-content-between">
            <div>${file}</div>
            <div>
                <a href="#" class="download"><img src="/img/icons/031-download.svg" width="32px" height="auto"></a>
                <a href="#" class="delete"><img src="/img/icons/024-trash.svg" width="32px" height="auto"></a>
            </div>
        </li>`
    );
    listItem.data('file', file);
    listItem.find('.delete').click(deleteItem);
    listItem.find('.download').click(downloadItem);
    $('ul').append(listItem);
}

//initial request to fill list of files
$('document').ready(function(){
    $.ajax({
        method: 'GET',
        url: '/api/files'
    })
    .then(render)
    .catch(handleError);
});

//handle delete
function deleteItem(e){
    let li = $(this).parent().parent();
    let filename = li.data('file');
    if(window.confirm(`Biztosan törli ${filename} fájlt?`)){
        //delete requst
        $.ajax({
            method: "DELETE",
            url: `/api/files/${filename}`
        })
        .then(data => {
            message('success', `${filename} sikeresen törölve`);
            li.remove();
        })
        .catch(handleError);
    }
}

//download request
function downloadItem(e){
    let filename = $(this).parent().parent().data('file');
    $('#downloadFrame').attr('src', `/api/files/${filename}`);
}

//upload files
$('form').on('submit', function(e){
    e.preventDefault()
});
$('#upload').click(function(e){
    //let fd = new FormData(document.getElementsByTagName('form')[0]);

    var formData = new FormData();
    formData.append('filename', $('input[name="filename"]').val());
    formData.append('file', $('input[name="file"]')[0].files[0]);

    $.ajax({
           url : '/api/files',
           type : 'POST',
           data : formData,
           processData: false,  // tell jQuery not to process the data
           contentType: false,  // tell jQuery not to set contentType
    })
    .then(data => {
        message('success', `Upload of ${data} was successful`);
        renderItem(data);
    })
    .catch(handleError);


    //send a request to right url
    // $.ajax({
    //     url: '/api/files',
    //     method: 'POST',
    //     data: fd
    // })
    // .then(data => {
    //     console.log("MINDEN FASZA!");
    // })
    // .catch(handleError);
});
