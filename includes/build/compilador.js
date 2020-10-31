var del = require('delete');
var mkdirp = require('mkdirp');
var copy = require('copy');
var fs = require('fs');
var xmldom = require('xmldom').DOMParser;
var archiver = require('archiver');
var browserSync = require('browser-sync').create();

var xmlPATH = 'data.xml';
var xml = "";
var pasta = "COMPILADO";
var titulo = "Titulo para o manifesto.xml";
var padrao = "scorm1.2";


fs.readFile(xmlPATH, 'utf-8', function (err, data) {
    var doc = new xmldom().parseFromString(data, 'application/xml');
    callXML(doc);
})

function callXML(doc) {

    var xmlDoc = doc;
    var _estrutura = xmlDoc.getElementsByTagName("estrutura")[0];
    var _info = _estrutura.getElementsByTagName("info")[0];
    var _compilar = (_info.getElementsByTagName("compilador")[0]);

    var _titulo = (_compilar.getElementsByTagName("titulo")[0].childNodes[0].nodeValue);
    var _padrao = (_compilar.getElementsByTagName("padrao")[0].childNodes[0].nodeValue);
    var _compilado = (_compilar.getElementsByTagName("zip_name")[0].childNodes[0].nodeValue);


    pasta = String("__" + _compilado + "__").toUpperCase();
    titulo = _titulo;
    padrao = _padrao;

    //
    initXML();
    initCompilacao();

}

function initXML() {

    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<manifest xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" identifier="MANIFEST01" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">';
    xml += '<metadata>';
    xml += '<schema>ADL SCORM</schema>';
    xml += '<schemaversion>1.2</schemaversion>';
    //xml += '<adlcp:location>imsmetadata.xml</adlcp:location>';
    xml += '</metadata>';
    xml += '<organizations default="AE_01">';
    xml += '<organization identifier="AE_01" structure="hierarchical">';


    xml += '<title>' + titulo + '</title>';

    var itens = "";
    var resources = "";
    var infoXML = {
        "item": {
            titulo: "#"
        }
    };

    Object.keys(infoXML.item).forEach(function (e, i) {
        var count = i < 10 ? '0' + i : i;

        itens += '<item identifier="ITEM_' + count + '" identifierref="RES_' + count + '" isvisible="true">';
        itens += '<title>' + titulo + '</title>';
        itens += '</item>';

        resources += '<resource identifier="RES_' + count + '" type="webcontent" adlcp:scormtype="sco" href="index.html" />';
    });

    xml += itens;
    xml += '</organization>';
    xml += '</organizations>';
    xml += '<resources>';
    xml += resources;
    xml += '</resources>';
    xml += '</manifest>';
}


function initCompilacao() {

    var pathA = "includes/build/conteudo/";
    var imsmanifestPath = pasta + "/imsmanifest.xml";

    var pathAnexo = {
        init: "anexos/**",
        end: pasta + "/anexos"
    };
    var pathIncludes = {
        init: "includes/**",
        end: pasta + "/includes"
    };

    var pathViews = {
        init: "views/**",
        end: pasta + "/views"
    };

    var infoBuild = {
        path: pasta + "/includes/build",
        speedPath: "includes/build/speed.jpg"
    }

    var infoCSS = {
        path: pasta + "/includes/css",
        cssPath: "includes/css/style.min.css",
        print: pasta + "/includes/css/telas/print.css",
        printPath: "includes/css/print.css"
    }

    var infoJS = {
        scriptPath: {
            init: "includes/js/script.js",
            end: pasta + "/includes/js"
        },
        requirePath: {
            init: "includes/js/vendor/require.js",
            end: pasta + "/includes/js"
        },
        phaserPath: {
            init: "includes/js/vendor/phaser.js",
            end: pasta + "/includes/js"
        },
        iframePath: {
            init: "includes/js/iframe.min.js",
            end: pasta + "/includes/js"
        }
    }

    var arquivos = [
                "data.xml"
                , "favicon.ico"
                , "anexos/"
                , pathA + "index.html"
                , pathA + "course.html"
                , pathA + "adlcp_rootv1p2.xsd"
                , pathA + "ims_xml.xsd"
                , pathA + "imscp_rootv1p1p2.xsd"
                , pathA + "index.html"
               ]

    // async 
    del([pasta], function (err) {
        if (err) throw err;
        createDirp();
    });

    function createDirp() {
        mkdirp(pasta, function (err) {
            if (err) throw (err);
            else copyArquivos()
        });
    }

    function copyArquivos() {

        copy.each(arquivos, pasta, {
            flatten: true
        }, function (err, files) {

            /* ANEXOS */
            copy(pathAnexo.init, pathAnexo.end, {
                expand: false
            }, function (err, files) {

                /* INCLUDES */
                copy(pathIncludes.init, pathIncludes.end, {
                    expand: false
                }, function (err, files) {

                    /* VIEWS */
                    copy(pathViews.init, pathViews.end, {
                        expand: false
                    }, function (err, files) {
                        controlCSS();
                    });
                });
            });
        });
    }

    function controlCSS() {
        

        del([infoBuild.path, infoCSS.path], function (err) {
            if (err) throw err;

            copy.each([infoCSS.cssPath], pasta, function (err) {
                if (err) throw err;
                controlJS();
            })
        });
    }

    function controlJS() {
        del([infoJS.scriptPath.end], function (err) {
            if (err) throw err;
            ///
            copy.one(infoJS.scriptPath.init, pasta, function (err) {
                if (err) throw err;
                ///
                copy.one(infoJS.requirePath.init, infoJS.requirePath.end, {
                    flatten: true
                }, function (err, files) {
                    if (err) throw err;
                    ///
                    copy.one(infoJS.phaserPath.init, infoJS.phaserPath.end, {
                        flatten: true
                    }, function (err, files) {
                        if (err) throw err;
                        ///
                        copy.one(infoJS.iframePath.init, infoJS.iframePath.end, {
                            flatten: true
                        }, function (err, files) {
                            if (err) throw err;
                            
                            ///
                             createMANIFESTO();

                        })
                    })
                })
            })
        });
    }


    function createMANIFESTO() {

        fs.writeFile(imsmanifestPath, xml, function (err) {
            if (err)
                return console.log(err);

            createZIP();
            loaderServer();
        });
    }


    function createZIP() {

        // create a file to stream archive data to. 
        var output = fs.createWriteStream(pasta + '.zip');
        var archive = archiver('zip', {
            store: false // Sets the compression method to STORE. 
        });

        // listen for all archive data to be written 
        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            //console.log('archiver has been finalized and the output file descriptor has closed.');
        });

        // good practice to catch this error explicitly 
        archive.on('error', function (err) {
            throw err;
        });

        // pipe archive data to the file 
        archive.pipe(output);
        // append files from a directory 
        archive.directory(pasta, false);
        archive.finalize();

        console.log("compilamento completo.");

    }

    function loaderServer() {

        var path = pasta + "/";

        browserSync.init({
            server: {
                baseDir: path
            }
        });

        browserSync.stream({
            match: '**/*.css'
        });

    }
}
