//Expanding the editor page with the ckeditor api
console.log("EDITOR JS IS HERE!");

//gloval vars
let editorElement, theForm, editor;
//var display = document.getElementById("preView"); //preview display

window.onload = function() {
    editorElement = document.getElementById("editor"); //the editor DOM element
    theForm = document.querySelector("#contentForm"); //form wich sends the content


    //User friendly editor    
    CKEDITOR.replace( 'editor1' );
    editor = CKEDITOR.instances.editor1;
    
    //modifying the outgoing data with the editor's content
    $('#send').click(sendData);
};


//sending editor data
function sendData() {
    //defining what page to send to
    let path = window.location.pathname.split('/');
    if(path[0] === "") path.splice(0,1);
    
    //the data to send
    let toSend = {
        page: path[0],
        content: editor.getData()
    };
    
    //now, find out where and how to send
    let create = (path[1] === 'new') ? true : false;
    let method = create ? 'POST' : 'PUT',
        url = create ? '/api/contents' : '/api/contents/' + path.slice(path.lastIndexOf('/'));
    
    // console.log(path);
    // console.log(`I'd send to: ${url} 
    // with method: ${method}`);
    
    //AAAND ACTUALLY SEND
    $.ajax({
        type: method,
        url: url,
        data: toSend,
    })
    .then(data => {
        redirect(path[0]);
    })
    .catch(err => {
        console.error(err);
        alert('Something went wrong!');
    });
}
//redirecting back to page where we added the content to
function redirect(page) {
    window.location.pathname = page;
}