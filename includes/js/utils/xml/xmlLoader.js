define(['jquery'], function ($) {
    'use strict';

    var xmlLoader = function () {
        var $public = {};
        var $private = {};
        var $parent = {};

        $public.init = function init(parent) {
            $parent = parent;
        }

        $public.create = function create(callXml) {
            var _indice = 0;
            var _pathXML = $parent.getCourse("PATH_CONFIG");

            $.ajax({
                // a url do xml
                url: _pathXML,
                // o tipo de dados que é xml
                dataType: "xml",
                // antes de enviar loga "Enviando"
                beforeSend: function () {
                    //console.log('Enviando');
                },
                // se terminar com sucesso loga o retorno
                success: function (xml) {


                    /// CONTROLE XML TELAS
                    $(xml).find('nivel').each(function () {

                        if ($(this).attr('path') != undefined) {

                            var _this = this;
                            var _telaOBJ = {
                                indice: _indice,
                                id: $(_this).attr('id'),
                                cor: $(_this).attr('cor'),
                                custom:0,
                                logo: $private.filtroResposta( $(_this).attr('logo') ),
                                titulo: $(_this).attr('titulo'),
                                path: $(_this).attr('path'),
                                setas: $(_this).attr('setas'),
                                avancar: $(_this).attr('avancar'),
                                avaliada: $(_this).attr('avancar'),
                                transicao: $(_this).attr('transicao'),
                                tipo: "padrao",
                                parentNivel1: {
                                    titulo: $(_this)[0].parentNode.attributes.titulo.nodeValue,
                                    id: $(_this)[0].parentNode.attributes.id.nodeValue,
                                    // menu: $(_this)[0].parentNode.attributes.menu.nodeValue
                                },
                                parentNivel2: {
                                    titulo: $(_this)[0].parentNode.parentNode.attributes.titulo.nodeValue,
                                    id: $(_this)[0].parentNode.parentNode.attributes.id.nodeValue
                                },
                                visivel: false, /// Controle de travamento da tela
                                carregado: false,
                                complete: false
                            }

                            /*if ($(_this).attr('tipo') != "iframe") {
                                $parent.padraoALL++;
                            }*/

                            $parent.config.push(_telaOBJ);
                            _indice++;
                        }

                    });


                    /// CONTROLE XML INFO
                    $(xml).find('info').each(function () {
                        $parent.cache = ($private.filtroResposta($(this).find('cache').text()));
                        $parent.debug = ($private.filtroResposta($(this).find('debug').text()));
                        $parent.retornar = ($private.filtroResposta($(this).find('retornar').text()));
                        $parent.width = Number( $(this).find('width').text() );
                        $parent.height = Number( $(this).find('height').text() );
                        $parent.position = ( $(this).find('position').text() );
                    })

                    $(xml).find('info').find('compilador').each(function () {
                        $parent.speed = ($private.filtroResposta($(this).find('speed').text()));
                        $parent.log = ($private.filtroResposta($(this).find('log').text()));
                        $parent.resize = ($private.filtroResposta($(this).find('resize').text()));
                    })
                    
                    /// CONTROLE - para versão compilada
                    if (window.build) {
                        $parent.cache = false;
                        $parent.debug = false;
                    }

                    /// LOG
                    $private.controleLog();

                    /// CONTROLE DE VERIFICACAO se é PADRÃO ou IFRAME
                    var _verifyTipo = 0;
                    $.each($parent.config, function (index, value) {

                        var __pagelink = $parent.pathTelas + value.path;
                        $.ajax({
                            url: __pagelink,
                            cache: false,
                            value: value,
                            success: function (_page) {

                                var temp = document.createElement('div');
                                temp.innerHTML = _page;
                                var head = temp.head;

                                //
                                if ($(temp).find("title").length || $(temp).find("meta").length || String(_page).indexOf("</head>") > -1 || String(_page).indexOf("</html>") > -1) {

                                    var _ajaxValue = this.value.indice;
                                    $.each($parent.config, function (index, value) {
                                        if (_ajaxValue == value.indice)
                                            value.tipo = "iframe";
                                    })

                                } else {
                                    $parent.padraoALL++;
                                }

                                //
                                _verifyTipo++;
                                if ($parent.config.length == _verifyTipo) {
                                    //Complete Carregamento - function chamada no course;
                                    callXml();
                                }

                            },
                            error: function () {
                                this.value.tipo = "padrao";
                            },
                            complete: function () {

                                //console.log(this.value);
                            }
                        })
                    })
                }
            });
        };

        $private.controleLog = function controleLog() {

//            (function (cl) {
//                console.log = function () {
//                    if (window.allowConsole)
//                        cl(...arguments);
//                }
//            })(console.log)
//
//
//            if ($parent.log)
//                window.allowConsole = true;
//            else
//                window.allowConsole = false;

        }



        $private.filtroResposta = function filtroResposta(_resp) {
            var _termo = String(_resp);

            if (_termo == "sim" || _termo == "Sim" || _termo == "SIM" ||
                _termo == "true" || _termo == "True" || _termo == "TRUE" || _termo == true) {
                return true;
            } else {
                return false;
            }

        }



        return $public;
    };

    return xmlLoader();
});
