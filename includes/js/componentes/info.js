define(['jquery'], function ($) {
    'use strict';

    var info = function () {
        var $public = {};
        var $private = {};
        var $parent = {};
        var $open = false;

        $public.init = function init(_parent) {
            $parent = _parent;
        };


        $public.create = function create() {

            var pressedCtrl = false; //variável de controle 
            var pressedShift = false; //variável de controle 
            var openUp = false;
            var letraV = 86; // letra V
            var init = true;

            $(document).keydown(function (e) {
                if (e.which == 17) pressedCtrl = true; //Informando que Crtl está acionado
                if (e.which == 16) pressedShift = true; //Informando que SHIFT está acionado

                if ((e.which == letraV || e.keyCode == letraV) && pressedCtrl && pressedShift) {
                    if (init) {
                        init = false;

                        if (!$parent.debug) {
                            $private.createDebug();
                        } else {
                            $(".debug").css("display", "none");
                        }
                    } else {
                        if ($(".debug").css("display") == "none") {
                            $(".debug").css("display", "block");
                        } else {
                            $(".debug").css("display", "none");
                        }
                    }
                }
            })


            if ($parent.debug) {
                $private.createDebug();
            }

            if ($parent.resize) {
                $private.resizeFull();
            }

        };

        $private.createDebug = function createDebug() {
            $("body").append("<div class='debug'></div>");
            $(".debug").load("views/interface/debug/index.html", function () {

                $private.controleOPEN();
                $private.createItens();
            });
        }

        $private.controleOPEN = function controleOPEN() {

            //
            $(".debug").css("top", "-170px");

            //
            $(".debugStatus").on("click", function () {

                $(".nano-debug").niceScroll();
                /* $(".nano-debug").nanoScroller({
                     iOSNativeScrolling: true,
                     alwaysVisible: true
                 });*/

                if ($open == false) {

                    //
                    $(".debug").animate({
                        top: "0"
                    });

                    $(".debugStatus .open").html("Fechar");

                    //
                    $open = true;

                } else {

                    //
                    $(".debug").animate({
                        top: "-170"
                    });

                    $(".debugStatus .open").html("Abrir");

                    //
                    $open = false;

                }

            });

            $(".enviarParaCurrent button").on("click", function () {

                var _text = $(".enviarParaCurrent input").val();
                var _textLength = _text.length;

                if (_textLength == 0)
                    return false


                var _config = $parent.config;


                $.each(_config, function (index, value) {

                    if (parseInt(_text) == parseInt(value.indice)) {
                        $parent.indice = parseInt(_text);
                        $("body").attr("nav", "go");
                        $("body").trigger("navegacao");
                        $(".enviarParaCurrent input").val("");
                    } else if (String(_text).toUpperCase() == String(value.id).toUpperCase()) {

                        $parent.indice = parseInt(value.indice);
                        $("body").attr("nav", "go");
                        $("body").trigger("navegacao");
                        $(".enviarParaCurrent input").val("");
                    } else {
                        $(".enviarParaCurrent input").val("");

                    }
                })

            });
            
            $(".cacheCurrent button").on("click", function () {
                localStorage.clear();
                
                var reloaderCache = confirm("Suspendata e LessonLocation limpo - para o próximo teste.");
                
                if( reloaderCache ){
                    window.location.href = window.location.href; //This is a possibility
                    window.location.reload(); //Another possiblity
                    history.go(0); //And another
                }
            });


            $("body").on('navegacaoComplete', function () {
                var _indice = $parent.indice;
                var _config = $parent.config;

                $.each(_config, function (index, value) {
                    if (_indice == value.indice) {

                        $(".debugStatus .debugIndiceCurrent spam").html(value.indice);
                        $(".debugStatus .debugIdCurrent spam").html(value.id);
                        $(".debugStatus .debugPathCurrent spam").html(value.path);
                    }
                })
            })


        }

        $private.createItens = function createItens() {

            var _config = $parent.config;
            var _indice = $parent.indice;
            var _current = -1;

            $("body").on('navegacaoComplete', function () {
                _current = $parent.indice;
            })

            $.each(_config, function (index, value) {

                var i = index + 1;
                if (i != 1) {
                    $("#debugItem1").clone(true).attr("id", "debugItem" + i).appendTo(".nano-content-debug");
                }
            })

            ///GAMBI para nao pegar o evento de Click do clone
            $.each(_config, function (index, value) {
                var i = index + 1;
                $("#debugItem" + i).attr("indice", value.indice);
                $("#debugItem" + i).find(".debugIndice").html(value.indice);
                $("#debugItem" + i).find(".debugId").html(value.id);
                $("#debugItem" + i).find(".debugPath").html(value.path);
                $("#debugItem" + i).find(".debugParentTitulo").html(value.parentNivel1.titulo);


                $("#debugItem" + i).on("click", function (e) {
                    e.stopPropagation();

                    if (_current != Number($(this).attr("indice"))) {

                        _current = Number($(this).attr("indice"));

                        $parent.indice = Number($(this).attr("indice"));
                        $("body").attr("nav", "go");
                        $("body").trigger("navegacao");

                        //
                        $(".debug").animate({
                            top: "-170"
                        });

                        $(".debugStatus .open").html("Abrir");

                        //
                        $open = false;
                    }

                })

            })

        }

        //////////////////////////////// 
        //       RESIZE               //
        ////////////////////////////////

        $private.resizeFull = function resizeFull() {

            window.moveTo(0, 0);
            window.resizeTo(screen.width, screen.height);

            top.window.moveTo(0, 0);
            if (document.all) {
                top.window.resizeTo(screen.availWidth, screen.availHeight);
            } else if (document.layers || document.getElementById) {
                if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
                    top.window.outerHeight = screen.availHeight;
                    top.window.outerWidth = screen.availWidth;
                }
            }
        }



        return $public;
    };

    return info();
});
