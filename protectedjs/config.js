//@ da konfig page I want to keep things simple
//no save no cancel button
//but
//AUTOSAVE when input field changes

//listen to change events on input fields
$('input').on('change', function(e){
    //now to save
    //we need to know the path of the config value
    let path = $(this).attr('data-path'),
        val = $(this).val();
    saveConfig(toConfigUrl(path, val));
});

//method to compile a the path wich tells the configuration what value to store
function toConfigUrl(path, value){
    //path should be a string like key1/key2.../value
    //but we need an array like ["key1", "key2",..., vlalue]
    path = path.split('/');
    //aaand we can push the value to store to the end
    path.push(value);
    //and now we can return the url
    path = path.map(val => {
        return `"${val}"`;
    });
    return `/api/config/set?path=[${path}]`;
}
function saveConfig(path){
    $.ajax({
        method: "GET",
        url: path
    })
    .done(data => {
        message('success', "Változtatás elmentve", 1000);
    })
    .catch(err => {
        message('error', "Valami hiba történt mentés közben");
        console.error(err);
    });
}
