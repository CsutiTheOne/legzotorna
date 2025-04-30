//HELPER FUNCTIONS FOR API ROUTES CAN BE FOUND HERE
//HELPERS REQUIRE CONNECTION WITH DATABASE
const   db = require('../models');
//nodemailer is needed to send out emails when new order is created
const   nodemailer = require("nodemailer");
//concig is becouse why not
const   Config = require("../config");
var C = new Config();
//filesystem for the files routes
const   fs = require('fs');

//this function is useful for email notifications
function sendMail(to, subject, body, isHTML, cb){
    let smtpTransport = nodemailer.createTransport({
        service: process.env.MAILSERV,
        auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
        }
    });
    //actual message
    //answer is what we send
    var message = {
        from: C.get('from_email'),
        to: to,
        subject: subject,
        html: isHTML ? body : null,
        text: !isHTML ? body : null
    };
    //and finaly send it out
    return smtpTransport.sendMail(message, cb);
}

function handleError(req, res, err){
    console.error(err)
    res.send(err);
}

//THESE FUNCTIONS HANDLE DOING THE RESPONSE

//===Helper functions for users
exports.users = {
    //array of all the users
    get: (req, res) => {
        db.Users.find()
        .then(allUsers => {
            res.status(200).json(allUsers);
        })
        .catch((err) => {
            res.send(err);
        });
    },
    //data of only one user
    show: (req, res) => {
        db.Users.findById(req.params.user_id)
        .then(foundUser => {
            res.status(200).json(foundUser);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //updating specific user
    update: (req, res) => {
        db.Users.findOneAndUpdate({_id: req.params.user_id}, req.body, {returnOriginal: false})
        .then(updatedUser => {
            res.status(200).json(updatedUser);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //geting rid of specific user
    delete: (req, res) => {
        db.Users.findOneAndDelete({_id: req.params.user_id})
        .then(() => {
            res.send("User deleted Succcesfully");
        })
        .catch(err => {
            res.send(err);
        })
    }
}
//===Helpers for products routes===
exports.products = {
    //array of all products
    get: (req, res) => {
        db.Products.find()
        .then(allProducts => {
            res.status(200).json(allProducts);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //creating new product
    create: (req, res) => {
        db.Products.create(req.body)
        .then(createdProduct => {
            res.status(201).json(createdProduct);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //showing only one product
    show: (req, res) => {
        db.Products.findById(req.params.product_id)
        .then(foundProduct => {
            res.status(200).json(foundProduct);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //updating one product
    update: (req, res) => {
        db.Products.findOneAndUpdate({_id: req.params.product_id}, req.body, {returnOriginal: false})
        .then(updatedProduct => {
            res.status(200).json(updatedProduct);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //deleting specific product
    delete: (req, res) => {
        db.Products.findOneAndDelete({_id: req.params.product_id})
        .then(() => {
            res.status(200).send('Deleted Succcesfully');
        })
        .catch(err => {
            res.send(err);
        });
    }
}
//===HELPER FUNCTIONS FOR CONTENTS===
exports.orders = {
    //array of every order
    get: (req, res) => {
        db.Orders.find()
        .then(allOrders => {
            res.status(200).json(allOrders);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //creating new order
    create: (req, res) => {
        //when a new order is made
        //first we store order in db
        let price = req.body.price,
            //szallitas = (req.body.payment.method == 'Előre_utalás') ? C.eloreu_shipping : C.utanv_shipping;
            szallitas = C.eloreu_shipping;
        if(!req.body.ships) {
            szallitas = 0;
        }
        req.body.payment.method = "Előre_utalás";
        db.Orders.create(req.body)
        .then(createdOrder => {
            //oldal email sending copied to bottom
            //after we stored it succesfully, we send out an email
            //first the way and service we send through
            let to = createdOrder.details.email,
                subject = 'Sikeres rendelés!';
            let string = '<p>Azért kapja ezt az emailt,<br/>' +
                'mert nemrégiben rendelést adott le a <a href="legzotorna.com">legzotorna.com</a> weboldalon összesen <strong>' + (parseInt(price)+parseInt(szallitas)) + 'Ft</strong> értékben. (Termékek: ' + price + 'Ft, szállítás: ' + szallitas + 'Ft)</p>' +
                `<p>Rendelése adatait megtekintheti <a href="legzotorna.com/order/${createdOrder._id}">ide</a> kattintva.</p><br/>`;

            if(createdOrder.payment.method == 'Előre_utalás'){
                string += "<p>A fizetés módja előre utalás. <br/>" +
                'Kérjük, a rendelés összegét az alábbi bankszámlaszámra utalja át: <br/><strong>' + C.bank_account +
                '<br/>Számlatulajdonos: Szabó Zsolt</strong>' +
                '<br/><br/><strong> Kérjük a közleménybe írja bele az ön nevét!</strong></p>';
            }
            string += '<p>Köszönjük vásárlását!<br/><br/>Ez egy automatikusan generált email, kérjük ne válaszoljon!</p>';
            sendMail(to, subject, string, true, function(err){
                //console.log("EMAIL SENGING IS WORKING THIS WAY TOOO!!!");
                if(err) console.log(err);
                res.status(201).json(createdOrder);
            });
            //AAAAND also notify the moderators with right to access orders that a new order's been created
            //to know who to send to, we need to look through users
            db.Users.find({'rights.canManageOrders': true})
            .then(foundUsers => {
                //so now we know the users
                subject = 'Új rendelés érkezett!';
                string = '<h5>Tisztelt moderátor</h5>';
                string += `<p>Ez az email egy értesítés arról, </br>hogy a <a href="legzotorna.com">legzotorna.com</a> weboldalra új rendelés érkezett!</p>`;
                string += `<p>A rendelést <a href="legzotorna.com/admin/orders/${createdOrder._id}">ide</a> kattinva megtekintheti.</p>`;
                string += '<p></br></br>Ez egy automatikusan generált email, kérjük ne válaszoljon!</p>';
                //we can send the mails
                foundUsers.forEach((to) => {
                    sendMail(to.email, subject, string, true, (err) => {
                        if(err) console.error(err);
                    });
                });
            })
            .catch(err => {
                handleError(req, res, err);
            });
        })
        .catch(err => {
            handleError(req, res, err);
        });
    },
    //showing one specific order
    show: (req, res) => {
        db.Orders.findById(req.params.order_id).
        populate('products.product').exec((err, foundOrder) => {
            if(err){
                res.send(err);
            }
            res.status(200).json(foundOrder);
        });

        // db.Orders.findById(req.params.order_id)
        // .then(foundOrder => {
        //     res.status(200).json(foundOrder);
        // })
        // .catch(err => {
        //     res.send(err);
        // });
    },
    //editing existing order
    update: (req, res) => {
        db.Orders.findOneAndUpdate({_id: req.params.order_id}, req.body, {returnOriginal: true})
        .then(updatedOrder => {
            //CHECK, if we have modified the payment.done status
            if(req.body.payment.method == "Előre_utalás" && (req.body.payment.done == 'true' && !updatedOrder.payment.done)){
                //we should send an email to notify the costumer
                let to = updatedOrder.details.email,
                    subject = "Sikeres fizetés!",
                    html = `
                        <h5>Kedves vásárlónk!</h5>
                        <p>
                            Azért kapta ezt az emailt <br/>mert a <a href="legzotorna.com">legzotorna.com</a> weboldalon vásárolt <br/>
                            ${updatedOrder._id} azonosítójú rendelését előre utalással sikeresen befizette!
                        </p>
                        <p>
                            Mostantól a digitális termákeit letöltheti <a href="https://legzotorna.com/media">innen</a>!
                        </p>
                        <p>
                            <br/><br/>Ez egy automatikusan generált email, kérjük ne válaszoljon!
                        </p>
                    `;
                sendMail(to, subject, html, true, function(err){
                    if(err) console.log(err);
                    res.status(200).json(req.body);
                });
            } else if (req.body.status === "Lezárva" && updatedOrder.status !== "Lezárva") {
                let to = updatedOrder.details.email,
                    subject = "Sikeres fizetés!",
                    html = `
                        <h5>Kedves vásárlónk!</h5>
                        <p>
                            Ez egy értesítésr arról, hogy ${updatedOrder._id} azonosítójú rendelése le lett zárva.
                        </p>
                        <p>
                            Amennyiben hibát észlel, kérjük vegye fel velünk a kapcsolatot!
                        </p>
                        <p>
                            Ez egy automatikusan generált email, kérjük ne válaszoljon!
                        </p>
                    `;
                sendMail(to, subject, html, true, function(err) {
                    if(err) console.log(err);
                    res.status(200).json(req.body);
                });
            } else {
                res.status(200).json(req.body);
            }
        })
        .catch(err => {
            res.send(err);
        });
    },
    //deleting order
    delete: (req, res) => {
        db.Orders.findOneAndDelete({_id: req.params.order_id})
        .then(() => {
            res.send("Order deleted succesfully");
        })
        .catch(err => {
            res.send(err);
        });
    },
}
//===Helper functions for contents===
exports.contents = {
    //array of every content
    get: (req, res) => {
        db.Contents.find()
        .then(allContents => {
            res.status(200).json(allContents);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //creating new content
    create: (req, res) => {
        db.Contents.create(req.body)
        .then(createdContent => {
            res.status(201).json(createdContent);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //showing one specific content
    show: (req, res) => {
        db.Contents.findById(req.params.content_id)
        .then(foundContent => {
            res.status(200).json(foundContent);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //editing existing content
    update: (req, res) => {
        db.Contents.findOneAndUpdate({_id: req.params.content_id}, req.body, {returnOriginal: false})
        .then(updatedContent => {
            res.status(200).json(updatedContent);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //deleting content
    delete: (req, res) => {
        db.Contents.findOneAndDelete({_id: req.params.content_id})
        .then(() => {
            res.send("Content article deleted succesfully");
        })
        .catch(err => {
            res.send(err);
        });
    },
}
//===Helper functions for contact messages===
exports.messages = {
    //array of every message
    get: (req, res) => {
        db.Messages.find()
        .then(allMessages => {
            res.status(200).json(allMessages);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //creating new message
    create: (req, res) => {
        db.Messages.create(req.body)
        .then(createdMessage => {
            //notify message moderators about the new message
            db.Users.find({'rights.canAnswer': true})
            .then(foundUsers => {
                //so now we know the users
                subject = 'Új üzenet érkezett!';
                html = `
                    <h5>Tisztelt moderátor!</h5>
                    <p>
                        Értesítjük önt, hogy a <a href="legzotorna.com">legzotorna</a> weboldalon új kérdés érkezett "${createdMessage.subject}" témával.
                    </p>
                    <p>
                        Az üzenetet bejelentkezést követően <a href="legzotorna.com/admin/messages/${createdMessage._id}">itt</a> megtekintheti
                    </p>
                    <p>Ez egy automatikusan generált email, kérjük ne válaszoljon!</p>
                `;
                //we can send the mails
                foundUsers.forEach((to) => {
                    sendMail(to.email, subject, html, true);
                });
            })
            .catch(err => {
                handleError(req, res, err);
            })
            res.status(201).json(createdMessage);
        })
        .catch(err => {
            handleError(req, res, err);
        });
    },
    //showing one specific message
    show: (req, res) => {
        db.Messages.findById(req.params.message_id)
        .then(foundMessage => {
            res.status(200).json(foundMessage);
        })
        .catch(err => {
            res.send(err);
        });
    },
    //sending answer for specific contact message
    answer: (req, res) => {
        db.Messages.findOneAndUpdate({_id: req.params.message_id}, req.body, {returnOriginal: false})
        .then(foundMessage => {
            let to = foundMessage.email,
                subject = foundMessage.subject,
                html = `
                    <h5>Tisztelt ${foundMessage.name}</h5>
                    <p>Önnek <a href="legzotorna.com">legzotorna</a> weboldalon feltett, "${foundMessage.subject}" témájú kérdésére az alábbi válasz érkezett:</p>
                    <br/>
                    <p><i>${foundMessage.answer.text}</i><p>
                    <br/><br/>
                    <p>Eredeti üzenet:</p>
                    <p><i>${foundMessage.message}</i></p>
                    <br/><br/>
                    <p>Kérjük a továbbiakban ne válaszoljon erre az emailre! <br/>Ha mégis maradt még kérdése, vegye fel a kapcsolatot velünk más módon, például az info@legzotorna.com email címen.</p>
                `;

            sendMail(to, subject, html, true, function(err){
                if(err) console.log(err);
                res.status(201).json(foundMessage);
            })
        })
        .catch(err => {
            res.send(err);
        });
    },
    //deleting message
    delete: (req, res) => {
        db.Messages.findOneAndDelete({_id: req.params.message_id})
        .then(() => {
            req.flash('success', "Üzenet törölve!");
            res.send("Message deleted succesfully");
        })
        .catch(err => {
            res.send(err);
        });
    },
}
//===CONFIGURATION===
exports.config = {
    get: (req, res) => {
        //let's check if path is provided
        let path = req.query.path ? JSON.parse(req.query.path) : null;
        if(path){
            //if there is path we can get specific value
            //but only if there is value
            let value = C.load().get(...path);
            if(!!value) res.status(200).json(value);
            else res.status(404).json(C.load());
        } else {
            //if no path, just send all
            res.status(200).json(C.load());
        }
    },
    set: (req, res) => {
        let path = req.query.path ? JSON.parse(req.query.path) : null;
        if(path){
            if(path[path.length-1] == "undefined") path[path.length-1] = undefined;
            C.set(...path).save();
            res.status(201).json(C.load());
        } else {
            res.status(404).json(C.load());
        }
    }

}


//===FILE MANAGEMENT===
var resdir = './resources';
exports.files = {
    //files list
    get: (req, res) => {
        fs.readdir(resdir, (err, files) => {
            if(err){
                console.log('ERROR');
                res.send(err);
            } else {
                res.status(200).json(files);
            }
        });
    },
    //upload file
    create: (req, res) => {
        let file, filename, extension;
        //so we've got another thing coming
        file = req.files.file;
        //filename will be given or the default
        filename = (req.body.filename && req.body.filename.length > 1) ? req.body.filename : Date.now();
        //extension stays the same
        extension = file.name.split('.');
        extension = '.' + extension[extension.length - 1];
        if(extension == '.peg') extension = '.jpeg';

        //aaand we can write the file
        file.mv(__dirname + '/../resources/' + filename + extension, function(err) {
            if(err){
                res.send(err);
            } else {
                res.send(`${filename}.${extension}`);
            }
       });
    },
    //download
    show: (req, res) => {
        fs.readdir(resdir, (err, files) => {
            if(err){
                res.send(err);
            }
            if(files.includes(req.params.file_name)){
                res.download(__dirname + '/../resources/' + req.params.file_name);
            } else {
                res.status(404).send('No file with given name');
            }
        });
    },
    //delete file
    delete: (req, res) => {
        fs.readdir(resdir, (err, files) => {
            if(err){
                res.send(err);
            }
            if(files.includes(req.params.file_name)){
                fs.unlink(resdir + '/' + req.params.file_name, (err) => {
                    if (err) throw err;
                    res.status(200).send("File deleted.");
                });
            } else {
                res.status(404).send('No file with given name');
            }
        });
    }
}



//exporting every helper function
module.exports = exports;




// OLD

// Removed from orders.create
// var smtpTransport = nodemailer.createTransport({
//     service: process.env.MAILSERV,
//     auth: {
//         user: process.env.MAILUSER,
//         pass: process.env.MAILPASS
//     }
// });
// //actual message
// var string = 'Azért kapja ezt az emailt, \n' +
//     'mert nemrégiben rendelést adott fel a legzotorna.herokuapp.com weboldalon ' + price + 'Ft értékben.\n' +
//     'Rendelése adatait megtekintheti ezen a linken: https://herokuapp.legzotorna.com/order/'+ createdOrder._id + '\n\n';
// if(createdOrder.payment.method == 'Előre_utalás'){
//     string += "Mivel ön a fizetési módnál, az előre utalást választotta, \n" +
//     'Kérem a rendelés összegét az alábbi benkszámlaszámra utalja át: ' + C.bank_account +
//     '\n<s> A közleményben pedig írja bele a rendelés azonosítóját, nevét, email címét!</s';
// }
// string += '\nKöszönjük vásárlását!';
// var message = {
//     from: 'websiteservicemail@gmail.com',
//     to: createdOrder.details.email,
//     subject: 'Sikeres rendelés!',
//     text: string
// };
// //and finaly send it out
// smtpTransport.sendMail(message, function(err){
//     if(err) res.send(err);
//     else res.status(201).json(createdOrder);
// });
