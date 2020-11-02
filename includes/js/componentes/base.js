define(['jquery', 'nicescroll'], function($) {
    'use strict';

    var base = function() {
        var $public = {};
        var $private = {};
        var $parent = {};
        // var $initMenu = false;


        $public.init = function init(_parent) {
            $parent = _parent;
        };

        $public.create = function create(complete) {

            $(".main").append("<div class='base'></div>");
            $(".base").load("views/interface/base/index.html", function() {

                //
                $private.createTelasContainer();
                $private.controleNavBase();
                $private.createAjuda();
                $private.createSair();
                $private.createRetormar();

                complete();
            });

            $private.reziseModal();
            $(window).resize(function() {
                $(".telaBase").height($(window).height());
                $private.reziseModal();
            });

        };


        $public.liberarNavegacao = function liberarNavegacao() {

            $parent.liberado = true;

            var _indice = $parent.indice;
            var _config = $parent.config;
            $.each(_config, function(index, value) {
                if (_indice == value.indice) {
                    value.visivel = true;
                }
            });


            $private.revisarSetas();
        }






        $public.sair = function sair() {
            //$(".sairContainer").css("display", "block");
            $private.sairCurso();
        }

        $private.createTelasContainer = function createTelasContainer() {
            var _config = $parent.config;

            $.each(_config, function(index, value) {
                $(".telaBase").append("<div indice=" + value.indice + " id=" + value.id + " avancar=" + value.avancar + "  carregado=" + value.carregado + " setas=" + value.setas + " tipo=" + value.tipo + " transicao=" + value.transicao + "  class='telaContainer telaContainer" + value.indice + "'></div>");
            })
        }

        $private.controleNavBase = function controleNavBase() {


            var _config = $parent.config;
            $parent.ajudaIndice = 0;
            $parent.calculadoraIndice = 0;

            $("body").on('navegacaoComplete', function() {
                var _indice = $parent.indice;
                var _config = $parent.config;

                $.each(_config, function(index, value) {
                    if ($parent.indice == value.indice) {

                        $private.contadorTitulosStatus(index, value, _indice, _config);
                        $private.destravarStatus(index, value, _indice, _config);
                        $private.createCustom();
                        //$private.resetAnimate();
                    }
                })

                //
                var _heightTop = parseInt($('.topBase').css("height"));
                $('.telaBase').css("height", window.innerHeight - _heightTop);

            })

        }

        $private.resetAnimate = function resetAnimate() {

            var page = $parent.config[$parent.indice];
            var id = String(page.id).toUpperCase();
            var _containerTela = $(".container" + id);

            if (window[page.id].status) {
                _containerTela.find(".animated").each(function(indice, item) {

                    if ($(item).css("display") == "block" || $(item).css("display") == "flex") {
                        $(item).removeClass("animated");
                    }

                });

                var slideContainer = _containerTela.find('.slide-container');
                slideContainer.slick('slickGoTo', 0);

            }

            if (document.getElementById("videoAA21")) {
                var vid = document.getElementById("videoAA21");
                vid.pause();
            }

        }


        $private.destravarStatus = function destravarStatus(index, value, _indice, _config) {

            if (parseInt(value.avancar) > -1) {
                setTimeout(function() {

                    $public.liberarNavegacao();

                }, 1000 * value.avancar);
            }
        }

        $private.createCustom = function createCustom() {
            var page = $parent.config[$parent.indice];
            var id = String(page.id).toUpperCase();
            var _custom = page.custom;
            var _container = $(".container" + id);

            if (_custom == 0) {

                page.custom = 1;
                _container.find(".containerGeral").prepend("<div class='baseCustom'></div>");
                _container.find(".baseCustom").load("views/interface/custom/index.html", function() {

                    $private.controleCustom();
                    $private.posControleCustom();
                    $private.revisarSetas();
                });
            } else {
                $private.posControleCustom();
                $private.revisarSetas();
            }
        }

        $private.controleCustom = function controleCustom() {

            var page = $parent.config[$parent.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);

            _container.find(".posicionar").positionCSS({
                box: _container.find(".containerGeral"),
                img_H: course.height,
                img_W: course.width
            });


            _container.find(".btnHelp").on('click', function() {
                _container.find(".btnHelp").css('display', 'none');
                _container.find(".btnClose").css('display', 'none');
                _container.find(".helpBase").css("display", "block");
            })

            _container.find(".btnCloseHelp").on('click', function() {

                _container.find(".btnHelp").css('display', 'block');
                _container.find(".btnClose").css('display', 'block')
                _container.find(".helpBase").css("display", "none");
            })

            _container.find(".btnMenu").on('click', function() {
                _container.find(".menuBase").css("display", "block");
            })

            _container.find(".btnCloseMenu").on('click', function() {
                _container.find(".menuBase").css("display", "none");
            })

            _container.find(".btnClose").on('click', function() {
                $(".sairContainer").css("display", "block");
            })

            _container.find(".setaEsqBase").on('click', function() {
                $("body").attr("nav", "previous");
                $("body").trigger("navegacao");
            })

            _container.find(".setaDirBase").on('click', function() {

                // if ($parent.liberado) {
                $("body").attr("nav", "next");
                $("body").trigger("navegacao");
                // }
            })

            // _container.find(".menuBase .itemM").on('click', function () {

            //     var _tela = $( this ).attr("tela");
            //     var page = $parent.config[$parent.indice];
            //     var id = String(page.id).toUpperCase();

            //     if( _tela != id ){
            //         $.each($parent.config , function(indice, item){

            //             if( (item.id).toUpperCase() == _tela  ){
            //                 // console.log( item.indice );
            //                 _container.find(".menuBase").css("display", "none");
            //                 $parent.indice = item.indice;
            //                 $("body").attr("nav", "go");
            //                 $("body").trigger("navegacao");
            //             }
            //         });
            //     }
            //     else{
            //         //_container.find(".menuBase").css("display", "none");
            //     }
            // });


        }

        $private.posControleCustom = function posControleCustom() {

            var page = $parent.config[$parent.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);
            $(".logoBase").css("display", "block");

            $(".navInit").css("display", "block");


            var _titulo1 = page.titulo;
            $(".titulo1Base").html(_titulo1);

        }




        $private.revisarSetas = function revisarSetas() {

            var page = $parent.config[$parent.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);

            _container.find(".setaEsqBase").css("display", "none");
            _container.find(".setaDirBase").css("display", "none");


            if (page.setas == 'nenhuma' || page.setas == 'nenhum') {
                _container.find(".setaDirBase").css("display", 'none');
                _container.find(".setaEsqBase").css("display", 'none');
            } else if (page.setas == "direita") {
                $private.ativarSetaNext();
            } else if (page.setas == "esquerda") {
                _container.find(".setaEsqBase").css("display", "block");
            } else if (page.setas == "ambas" || page.setas == "ambos") {
                _container.find(".setaEsqBase").css("display", "block");
                $private.ativarSetaNext();
            }
        }

        $private.ativarSetaNext = function ativarSetaNext() {

            var page = $parent.config[$parent.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);



            if (page.avancar > -1)
                page.visivel = true;

            if (page.visivel) {

                if (page.avancar <= -1)
                    page.avancar = 0.1;

                if (_container.find(".setaDirBase").hasClass("Ativada")) {
                    _container.find(".setaDirBase").css("display", 'block');
                    return false
                }

                setTimeout(function() {

                    _container.find(".setaDirBase").removeClass("setaInativa");
                    _container.find(".setaDirBase").addClass("Ativada");
                    _container.find(".setaDirBase").css("display", 'block');

                    var element = _container.find(".setaDirBase .icoSet");
                    element.removeClass("fadeIn");


                }, 1000 * page.avancar);

            }

        }

        $private.contadorTitulosStatus = function contadorTitulosStatus(index, value, _indice, _config) {

            var _current = _indice + 1;
            if (_current < 10) {
                $(".bottonInfoCurrent").text("0" + String(_current));
            } else {
                $(".bottonInfoCurrent").text(String(_current));
            }

            var _total = _config.length;
            $(".bottonInfoAll").text(_total);

            ///titulo
            var _titulo1 = value.titulo;
            var _titulo2 = value.parentNivel1.titulo;
            var _titulo3 = value.parentNivel2.titulo;

            $(".titulo1Base").html(_titulo1);
            $(".titulo2Base").html(_titulo2);
            $(".titulo3Base").html(_titulo3);
        }

        $private.createRetormar = function createRetormar() {

            if (!$parent.retornar) /// confere se é para ter a tela de retornar de onde parou
                return false

            var _indice = $parent.indice;
            if (_indice != 0) {
                $(".retormar").css("display", "block");

                $(".retormar").find(".naoSair").on("click", function() {

                    $(".retormar").css("display", "none");


                    $parent.indice = 0;
                    $("body").attr("nav", "go");
                    $("body").trigger("navegacao");

                });

                $(".retormar").find(".simSair").on("click", function() {
                    $(".retormar").css("display", "none");
                });

            }
        }


        $private.createAjuda = function createAjuda() {
            $(".main").append("<div class='ajudaContainer'></div>");
            $(".ajudaContainer").load("views/interface/ajuda/index.html", function() {
                $(".ajudaContainer .fechar").on('click', function() {
                    $(".ajudaContainer").css("display", "none");
                })
            });

            $(".iconAjudaBase").on('click', function() {
                $(".ajudaContainer").css("display", "block");
            })

        }

        $private.createSair = function createSair() {

            $(".main").append("<div class='sairContainer'></div>");
            $(".sairContainer").load("views/interface/sair/sair.html", function() {
                $(".sairContainer .naoSair").on('click', function() {
                    $(".sairContainer").css("display", "none");
                })

                $(".sairContainer .simSair").on('click', function() {
                    $private.sairCurso();
                })

            });

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                $(".iconSairBase").css("display", "block");
            }

            $(".iconSairBase").on('click', function() {
                $(".sairContainer").css("display", "block");
            })
        }

        $private.sairCurso = function sairCurso() {

            var _quit_url = "views/interface/sair/encerrado.html";

            if (top === window) { // IS IFRAME
                var Browser = navigator.appName;
                var indexB = Browser.indexOf('Explorer');

                if (indexB > 0) {
                    var indexV = navigator.userAgent.indexOf('MSIE') + 5;
                    var Version = navigator.userAgent.substring(indexV, indexV + 1);

                    if (Version >= 7) {
                        window.open('', '_self', '');
                        window.close();
                    } else if (Version == 6) {
                        window.opener = null;
                        window.close();
                    } else {
                        window.opener = '';
                        window.close();
                    }

                } else {
                    window.open('', '_parent', '');
                    window.close();
                }
            } else {
                var contentRoot = window;
                var urlBase = $private.GetContentRootUrlBase(contentRoot);
                window.location.href = urlBase + _quit_url;
            }

            $parent.sairScorm();
        }

        $private.GetContentRootUrlBase = function GetContentRootUrlBase(contentRoot) {

            var urlParts = contentRoot.location.href.split("/");
            delete urlParts[urlParts.length - 1];
            contentRoot = urlParts.join("/");
            return contentRoot;
        }

        $private.reziseModal = function reziseModal() {


            // Get screen size (inner/outerWidth, inner / outerHeight)
            var height = $(window).height();
            var width = $(window).width();


            if (width > height) {
                // Landscape
                $(".portrait").css("display", "none");
            } else {

                // Portrait
                setTimeout(function() {
                    $(".portrait").css("display", "block");
                }, 1000 * 0.2);

            }
        }

        return $public;
    };

    return base();
});