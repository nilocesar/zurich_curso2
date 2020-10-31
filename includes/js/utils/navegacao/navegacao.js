define(['jquery'], function ($) {
    'use strict';

    var navegacao = function () {
        var $public = {};
        var $private = {};
        var $parent = {};
        var $init = false;


        $public.init = function init(parent) {
            $parent = parent;
        }

        $public.create = function create() {
            $private.createBase();
        }

        $private.createBase = function createBase() {
            $parent.createBase(function () {
                $private.carregarTelaControl();
            });
        }


        $private.carregarTelaControl = function carregarTelaControl() {
            //Primeiro carregamento  
            $parent.carregamento();
        
            $("body").on("navegacao", function () {

                if ($parent.block) {
                    
                    if ($(this).attr("nav") == "init" && $init == false) {
                                            
                        $parent.motion("init");
                        $init = true;

                    } else if ($(this).attr("nav") == "next") {
                        if ($parent.indice < $parent.config.length - 1) {
                            $parent.indice++;
                            $parent.carregamento();
                            $parent.motion("next");
                            $parent.indiceOLD = $parent.indice;
                        }
                    } else if ($(this).attr("nav") == "previous") {

                        if ($parent.indice != 0) {
                            $parent.indice--;
                            $parent.carregamento();
                            $parent.motion("previous");
                            $parent.indiceOLD = $parent.indice;
                        }
                    } else if ($(this).attr("nav") == "go") {
                        $parent.carregamento();
                        $parent.motion("go");
                        $parent.indiceOLD = $parent.indice;
                    }

                    //
                    var _indice = $parent.indice;
                    var _config = $parent.config;
                    $.each(_config, function (index, value) {
                        if (_indice == value.indice) {
                            value.complete = true;
                        }
                    });

                    $("body").trigger('navegacaoComplete');
                    $parent.block = false;
                }
            })
        }


        return $public;
    };

    return navegacao();
});