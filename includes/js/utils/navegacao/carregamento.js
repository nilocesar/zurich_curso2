define(['jquery', 'imagesloaded'], function ($) {
    'use strict';

    var carregamento = function () {
        var $public = {};
        var $private = {};
        var $parent = {};
        var $contador = 0;
        var $esq = 0;
        var $dir = 0;
        var $sentido = "esq";
        var $ac = 0;
        var $init = true;
        var $complete = false;


        $public.init = function init(parent, callNav) {
            $parent = parent;
        };

        $public.carregar = function carregar() {

            var _indice = $parent.indice;
            var _indiceID;
            var _config = $parent.config;
            var _exc = $parent.telasExce;
            var _excInd = false;

            $esq = _indice;
            $dir = _indice;

            $.each(_config, function (index, value) {

                if (value.indice == _indice)
                    _indiceID = value.id;

                var _id = value.id.toLowerCase();
                for (var i = 0; i < _exc.length; i++) {

                    if (_exc[i].t.toLowerCase() == _id) {
                        _exc[i].a = value.indice;

                        if (value.indice == _indice)
                            _excInd = true;

                    }
                }

            });

            if (!_excInd) {
                _exc.push({
                    t: _indiceID,
                    a: _indice
                });
            }


            $private.createTela();
        };

        $private.createTela = function createTela() {

            if ($init) ///primeiros carregamentos
            {
                var _exc = $parent.telasExce;
                var _vIndice = _exc[$ac].a;

                if (!$(".telaContainer" + _vIndice).attr("carrregamentoCompleto")) {
                    $private.loaderTela(_vIndice);
                    $ac++;
                }

                if ($ac == _exc.length) {
                    $init = false;
                }

                return false;

            };


            if ($sentido == "esq") {

                var _config = $parent.config;
                if ($esq < _config.length - 1) {
                    $esq += 1;
                    $private.loaderTela($esq);
                } else {
                    $dir -= 1;
                    $private.loaderTela($dir);
                }

                $sentido = "dir";

            } else {

                if ($dir == 0) {
                    $esq += 1;
                    $private.loaderTela($esq);
                } else {
                    $dir -= 1;
                    $private.loaderTela($dir);
                }

                $sentido = "esq";
            }
        }

        $private.loaderTela = function loaderTela(indice) {

            if ($(".telaContainer" + indice).attr("carrregamentoCompleto")) {
                $private.createTela();
            }

            var _config = $parent.config;
            $.each(_config, function (index, value) {

                if (value.indice == indice) {

                    if (!$(".telaContainer" + value.indice).attr("carrregamentoCompleto")) {
                        var _path = $parent.pathTelas + value.path;
                        $("#" + value.id).load(_path, function () {

                            var _indice = $(this).attr("indice");
                            $private.loaderImg(indice, value);
                        });

                    }
                }
            });
        };

        $private.loaderImg = function loaderImg(indice, value) {

            //
            var _containerImg = [];

            $(".telaContainer" + value.indice).find("*").each(function (indice, item) {

                if ($(item).css("background-image") != "none") {
                    if (_containerImg.indexOf($(item).css("background-image")) == -1) {
                        _containerImg.push($(item).css("background-image"));

                        if (!$(item).hasClass("imgloaded" + value.indice))
                            $(item).addClass("imgloaded" + value.indice);
                    }
                }
            });

            $(".imgloaded" + value.indice).imagesLoaded({
                background: true
            }).always(function (instance) {

            }).done(function (instance) {
                //console.log("Carregamento normal.")
                $private.loaderRemaining(indice, value);
            }).fail(function () {
                console.log("carregamento incorreto - erro imagem");
                $private.loaderRemaining(indice, value);
            }).progress(function (instance, image) {
                var result = image.isLoaded ? 'loaded' : 'broken';
                //console.log('image INIT is ' + result + ' for ' + image.img.src);
            });

            ///Garante o carregamento da tela caso dê algum problema nas imagens
            setTimeout(function () {

                if (!$(".telaContainer" + value.indice).attr("carrregamentoCompleto")) {
                    $private.loaderRemaining(indice, value);
                    ///
                    console.log("carregamento incorreto - erro demora");
                }

            }, 1000 * 10);
        }


        $private.loaderRemaining = function loaderRemaining(indice, value) {
            $(".telaContainer" + value.indice).attr("carrregamentoCompleto", "1");
            $private.createTela();
            $private.controlePreloader();
        }

        $private.controlePreloader = function controlePreloader() {
            $contador += 1;
            var _excLength = $parent.telasExce.length;
              
            if ($parent.config.length < ($parent.pageLoaderInit * 2) + _excLength) {
                
                if ($contador == ($parent.pageLoaderInit * 2) + _excLength) {
                    if(!$complete){
                        $parent.carregamentoCompleto();
                        $complete = true;
                    }   
                }
                
                if( $contador == $parent.config.length )
                {
                    if(!$complete){
                        $parent.carregamentoCompleto();
                        $complete = true;
                    }
                }
                    
                
            } else {

                
                // Carrega o dobro de telas consideradas + as telas de exceções
                if ($contador == ($parent.pageLoaderInit * 2) + _excLength) {
                    if(!$complete){
                        $parent.carregamentoCompleto();
                        $complete = true;
                    }
                }
                
                if( $contador == $parent.config.length ){
                    if(!$complete){
                        $parent.carregamentoCompleto();
                        $complete = true;
                    }
                }
            }
        }


        return $public;
    };

    return carregamento();
});
