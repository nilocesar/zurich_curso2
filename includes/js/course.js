define(['jquery', 'jquery_scorm', 'modernizr', 'imagesloaded',
    'velocity', 'componentes_jquery', "transform2d_jquery", "transform3d_jquery",
    "transit_jquery", "easing_jquery", 'detectmobilebrowser',
    'highcharts', 'exporting', 'export_data', 'print', 'hammer',
    'TweenMax', 'TimelineMax', 'd3', "slick", 'blast'
], function($) {

    'use strict';

    var course = function() {
        var $public = {};
        var $private = {};

        //=============================================================
        // VARIABLES
        //=============================================================

        $private.projectData = {};
        $private.componenteData = {};

        $public.pathTelas = "views/telas/";
        $public.ajudaIndice = 0;
        $public.indice = 0;
        $public.indiceOLD = 0;
        $public.config = [];
        $public.liberado = false;
        $public.block = true;
        $public.navBlock = false;
        $public.navBlockNext = false;
        $public.navBlockPrev = false;
        $public.debug = false;
        $public.retornar = false;
        $public.cache = false;
        $public.log = true;
        $public.resize = false;
        $public.body = $("body");
        $public.IE = (navigator.userAgent.indexOf("Edge") > -1 || navigator.userAgent.indexOf("Trident/7.0") > -1) ? true : false;
        $public.MOBILE = SmartPhone.isAny();
        $public.ieOLD = SmartPhone.ieOLD();
        $public.parentBody = null;

        $public.pageLoaderInit = 3; /// carrega 3 página inicialmente 


        $public.timeExercicio = 3;


        $public.telasExce = [{
                "t": "aa2",
                "a": 0
            },
            {
                "t": "aa3",
                "a": 0
            },
            {
                "t": "aa5",
                "a": 0
            },
        ]; /// telas exceção de carregamento - elas já são carregadas na primeira remessa

        $public.padraoALL = 0;

        $public.menuAll = ['aa3', 'aa5', 'aa7', 'aa9', 'aa11', 'aa13', 'aa15'];


        $public.totalExerc = 5;



        //=============================================================
        // PUBLIC FUNCTIONS
        //=============================================================  

        $public.init = function init() {

            $private.initXML();

        };

        $public.setComponente = function setComponente(pathName, pathData) {
            $private.componenteData[pathName] = pathData;
        };

        $public.getComponente = function getComponente(pathName) {
            return $private.componenteData[pathName];
        };

        $public.setCourse = function setCourse(pathName, pathData) {
            $private.projectData[pathName] = pathData;
            return $public;
        };

        $public.getCourse = function getCourse(pathName) {
            return $private.projectData[pathName];
        };

        ///Função chamada em carregamento.js
        $public.carregamentoCompleto = function carregamentoCompleto() {
            $private.carregamentoInitComplete();
        }

        $public.createBase = function createBase(complete) {
            $public.getComponente("base").create(complete);
        }

        $public.liberarNavegacao = function liberarNavegacao() {
            $public.getComponente("base").liberarNavegacao();
        }

        $public.callModal = function callModal(url, _containerTela) {
            $public.getComponente("base").callModal(url, _containerTela);
        }

        $public.carregamento = function carregamento() {
            $public.getComponente("carregamento").carregar();
        }

        $public.motion = function motion(_status) {
            $public.getComponente("motion").call(_status);
        }

        $public.scorm_get_suspendData = function scorm_get_suspendData(variable) {
            return $public.getComponente("scorm").getSuspendata(variable);
        }

        $public.scorm_set_suspendData = function scorm_set_suspendData(variable, value) {
            $public.getComponente("scorm").setSuspendata(variable, value);
        }

        $public.scorm_get_lessonLocation = function scorm_get_lessonLocation(variable) {
            return $public.getComponente("scorm").getLessonLocation(variable);
        }

        $public.scorm_set_lessonLocation = function scorm_set_lessonLocation(variable, value) {
            $public.getComponente("scorm").setLessonLocation(variable, value);
        }

        $public.scorm_set_score = function scorm_set_score(raw) {
            $public.getComponente("scorm").setScore(raw);
        }

        $public.scorm_get_score = function scorm_get_score() {
            return $public.getComponente("scorm").getScore();
        }

        $public.scorm_set_interactions = function scorm_set_interactions(indice, correto, resposta, tipo, tempoGasto, pesoDado) {
            $public.getComponente("scorm").setInteractions(indice, correto, resposta, tipo, tempoGasto, pesoDado); //_indice, correto, resposta, _tipo, _tempoGasto, _pesoDado
        }

        $public.scorm_set_status_lesson = function scorm_set_status_lesson(_status) {
            $public.getComponente("scorm").setStatusLesson(_status)
        }

        $public.scorm_get_status_lesson = function scorm_get_status_lesson() {
            return $public.getComponente("scorm").getStatusLesson()
        }

        $public.getInteractionsCount = function getInteractionsCount() {
            return $public.getComponente("scorm").getInteractionsCount();
        }

        $public.sairScorm = function sairScorm() {
            $public.getComponente("scorm").sairScorm();
        }

        $public.completeScorm = function completeScorm() {
            $public.getComponente("scorm").completeScorm();
        }

        $public.resetSuspendata = function resetSuspendata() {
            $public.getComponente("scorm").resetSuspendata();
        }

        $public.resetLessonLocation = function resetLessonLocation() {

            $.each($public.config, function(indice, item) {
                item.visivel = false;
                if (item.avancar == 0.1) {
                    item.avancar = -1;
                }
                var page = item;
                var id = String(page.id).toUpperCase();
                var _container = $(".container" + id);
                _container.find(".setaDirBase").css("display", "none");
                _container.find(".setaDirBase").removeClass("Ativada");
                var element = _container.find(".setaDirBase .icoSet");
                element.addClass("fadeIn");
            });


            $public.getComponente("scorm").resetLessonLocation();
        }


        $public.resetAll = function resetAll() {
            $public.getComponente("scorm").resetAll();
        }

        $public.sair = function sair() {
            $public.getComponente("base").sair();
        }

        $public.prevTela = function prevTela(id) {
            $public.getComponente("base").prev(parseInt(id.split("aa")[1]));
        }

        $public.nextTela = function nextTela(id) {
            $public.getComponente("base").next(parseInt(id.split("aa")[1]));
        }

        $public.returnMenu = function returnMenu(_menu) {

            if ($public.scorm_get_suspendData("controleMenu")) {
                if (parseInt($public.scorm_get_suspendData("controleMenu")) < _menu) {
                    $public.scorm_set_suspendData("controleMenu", _menu);
                }
            } else {
                $public.scorm_set_suspendData("controleMenu", _menu);
            }


            //
            var _tela = "AA5";
            var _indice = 0;

            $.each($public.config, function(indice, item) {

                if (String(item.id).toUpperCase() == String(_tela).toUpperCase()) {
                    _indice = item.indice;
                }
            });

            $public.indice = _indice;
            $("body").attr("nav", "go");
            $("body").trigger("navegacao");

        }

        $public.controleCarregamento = function controleCarregamento() {

            var page = $public.config[$public.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);

            var _all = 4;

            _container.find('.itemX').removeClass('status1 status2 status3');

            for (var i = 1; i <= _all; i++) {

                var _exerc1 = "e" + i + "_" + 1;
                var _exerc2 = "e" + i + "_" + 2;
                var _notaModulo = 0;

                if ($public.scorm_get_suspendData(_exerc1) == 1) {
                    _notaModulo += 1;
                }
                if ($public.scorm_get_suspendData(_exerc2) == 1) {
                    _notaModulo += 1;
                }

                if (_notaModulo == 0) {
                    _container.find('.item' + i).addClass('status1');
                }
                if (_notaModulo == 1) {
                    _container.find('.item' + i).addClass('status2');
                }

                if (_notaModulo == 2) {
                    _container.find('.item' + i).addClass('status3');
                }


            }

        }

        $public.notaCurrent = function notaCurrent() {

            var page = $public.config[$public.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);

            var _all = 4;
            var _nota = 0;
            //var _exercCurrent = "e" + _tela.tema + "_" + _tela.exerc;

            for (var i = 1; i <= _all; i++) {

                var _exerc1 = "e" + i + "_" + 1;
                var _exerc2 = "e" + i + "_" + 2;

                if ($public.scorm_get_suspendData(_exerc1) == 1) {
                    _nota += 1;
                }
                if ($public.scorm_get_suspendData(_exerc2) == 1) {
                    _nota += 1;
                }

            }

            _container.find('.numberCurrent').text("0" + String(_nota));
            _container.find('.numberAll').text("0" + String(_all * 2));


            // var _qA = $public.scorm_get_suspendData("exerc1").split('_');

            // var _alt = _qA[0];
            // var _res = _qA[1];

            return _nota;

        }

        $public.controleMenu = function controleMenu(_menu) {

            var page = $public.config[$public.indice];
            var id = String(page.id).toUpperCase();
            var _container = $(".container" + id);


            if ($public.scorm_get_suspendData("controleMenu")) {
                if (parseInt($public.scorm_get_suspendData("controleMenu")) < _menu) {
                    $public.scorm_set_suspendData("controleMenu", _menu);
                }
            } else {
                $public.scorm_set_suspendData("controleMenu", _menu);
            }

            var _all = 4;
            var _menuCurrent = parseInt($public.scorm_get_suspendData("controleMenu"));
            _container.find('.itemX').addClass('menuInativo');
            _container.find('.itemX .escudo').removeClass("animated infinite pulse");


            for (var i = 1; i <= _all; i++) {


                if (i <= _menuCurrent) {

                    _container.find('.item' + i).removeClass('menuInativo');

                    if (i == _menuCurrent) {
                        _container.find('.item' + i + " .escudo").addClass("animated infinite pulse");
                    }

                }

            }






            _container.find('.itemX').on('click', function() {


                var _tela = $(this).attr('item');
                var _indice = 0;

                $.each($public.config, function(indice, item) {

                    if (String(item.id).toUpperCase() == String(_tela).toUpperCase()) {
                        _indice = item.indice;
                    }
                });

                $public.indice = _indice;
                $("body").attr("nav", "go");
                $("body").trigger("navegacao");

            })



        }



        //=============================================================
        // CONTROLES
        //=============================================================    

        //////////////////////////////// 
        //       INIT XML             //
        ////////////////////////////////

        $private.initXML = function initXML() {
            require(["utils/xml/xmlLoader"], function(module) {
                module.init($public);
                module.create(function() {
                    $private.initScorm();
                });
            });
        };

        //////////////////////////////// 
        //       SCORM                //
        ////////////////////////////////


        $private.initScorm = function initScorm() {
            require(["utils/scorm/scorm"], function(module) {
                module.init($public);
                module.create(function() {
                    $private.initBase();
                    $private.initSpeed();
                });

                $public.setComponente("scorm", module);
            });
        }

        //////////////////////////////// 
        //       SPEED                //
        ////////////////////////////////

        $private.initSpeed = function initSpeed() {
            if ($public.speed) {
                require(["componentes/speed"], function(module) {
                    module.init($public);
                });
            }
        }


        //////////////////////////////// 
        //       NAVEGACAO            //
        ////////////////////////////////

        $private.initBase = function initBase() {
            require(["componentes/base"], function(module) {
                module.init($public);
                $public.setComponente("base", module);
                $private.initNav();
            });
        }

        $private.initNav = function initNav() {

            require(["utils/navegacao/carregamento"], function(module) {
                module.init($public);
                $public.setComponente("carregamento", module);
            });

            require(["utils/navegacao/motion"], function(module) {
                module.init($public);
                $public.setComponente("motion", module);
            });

            require(["utils/navegacao/navegacao"], function(module) {
                module.init($public);
                module.create();
                $public.setComponente("navegacao", module);
            });

            require(["componentes/info"], function(module) {
                module.init($public);
                module.create();
                $public.setComponente("info", module);
            });


        }


        $private.carregamentoInitComplete = function carregamentoInitComplete() {
            $("#loading").css("display", "none");
            window.parent.iframe.preloaderComplete();

            //Iniciar após o carregamento inicial
            $("body").attr("nav", "init");
            $("body").trigger("navegacao");

        }


        return $public;
    };

    return course();
});