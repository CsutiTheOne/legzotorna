const fs = require('fs');

// class wich describes the fundamental settings of this entire application
module.exports = class Application {
    constructor(){
        this.load();
    }
    load(){
        //this method loads in the data stored in ./config.json
        let loaded = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
        Object.keys(loaded).forEach(setting => {
            this[setting] = loaded[setting];
        });
        return this;
    }
    save(){
        //this method saves the current settings into ./config.JSON
        fs.writeFileSync(__dirname + '/config.json', JSON.stringify(this));
        return this;
    }
    set(...path){
        //Do anyting only
        //if we have a key and a value passed
        if(path.length < 2) throw "No value was given";
        //this method changes a value in the class
        //even, if it is a setting in a subobject within the class
        //also able to add new key-value pairs
        let [name, value] = [path[path.length-2], path[path.length-1]];
        path.slice(0, path.length-2).reduce((acc, curr) => acc[curr], this)[name] = value;
        return this;
    }
    get(...path){
        try {
            return path.reduce((acc, curr) => acc[curr], this);
        } catch(e) {
            return undefined;
        }

    }
    rid(...path){
        let key = path[path.length-1];
        path.slice(0, path.length-1).reduce((acc, curr) => acc[curr], this)[key] = undefined;
        return this;
    }
}
