define(['jquery', 'jquery_scorm'], function ($) {
    'use strict';

    var scorm = function () {
        var $public = {};
        var $private = {};
        var $parent = {};

        $public.init = function init(parent) {
            $parent = parent;   
        }

        $public.create = function create(callScorm) {
            
            $public.scormInit( $parent.cache );
            
            $("body").on('navegacaoComplete', function () {
                var _indice = $parent.indice;
                $public.controlLessonLocationCurrent( _indice );
                $public.verifComplete();
            })
            
            var _configJson = JSON.stringify( $parent.config );
            var _configScorm = $public.controlLessonLocationInit( _configJson );
           
            var _indiceInit =  Number( $public.getLessonLocation( "on" ) );
            if ( !_indiceInit ) _indiceInit = 0;
            
            
            //
            $parent.indice = _indiceInit;
            $parent.config = JSON.parse( _configScorm );

            callScorm();
        }

        $public.controlLessonLocationInit = function controlLessonLocationInit(_config) {
            var _configArray = JSON.parse(_config);
            var _cursoInit = $public.getLessonLocation("on");

            if (_cursoInit == null || _cursoInit == "") /// primeira entrada no curso
            {
                $public.setLessonLocation("on", "0");

                for (var i = 0; i < _configArray.length; i++) {
                    var _lesson = "L" + String(_configArray[i].indice);
                    $public.setSuspendata(_lesson, "0");
                }

            } else {
                for (var i = 0; i < _configArray.length; i++) {
                    var _lesson = "L" + String(_configArray[i].indice);
                    var _indiceLesson = $public.getSuspendata(_lesson);

                    //
                    if (_indiceLesson == "1" || _indiceLesson == 1) {
                        _configArray[i].visivel = true;
                    }
                }
            }

            _configArray = JSON.stringify(_configArray);
            return _configArray;
        }

        $public.controlLessonLocationCurrent = function controlLessonLocationCurrent(_indice) {
            $public.setLessonLocation("on", _indice);

            var _lesson = "L" + String(_indice);
            var _currentLesson = $public.getSuspendata(_lesson);

            if (_currentLesson == "0" || _currentLesson == 0)
                $public.setSuspendata(_lesson, "1");
        }
        
        $public.verifComplete = function verifComplete()
        {
            var config = $parent.config;
            var _status = true;

            for ( var i = 0 ; i < config.length ; i++ )
            {   
                if ( config[i].complete == false )
                    _status = false;
            }
            
            ///complete
            if ( _status == true )
            {
                 console.log("getInteractionsCount" , $public.getInteractionsCount() );
                /// Caso esse valor seja maior que zero, será considerado o status da avaliação e não do complete de telas  
                if( $public.getInteractionsCount() < 1 )
                {
                    $public.completeScorm();
                     console.log("completas entrou" );
                }
                    
            }
        }
        
        $public.scormInit = function scormInit(_cache) {
            $("body").scorm_start({
                cache: _cache
            });
        }

        $public.completeScorm = function completeScorm() {
            $("body").scorm_complete();
        }

        $public.getSuspendata = function getSuspendata(variable) {
            return $("body").scorm_get_suspendData(variable);
        }

        $public.setSuspendata = function setSuspendata(variable, value) {
            $("body").scorm_set_suspendData(variable, value);
        }

        $public.getLessonLocation = function getLessonLocation(variable) {
            return $("body").scorm_get_lessonLocation(variable);
        }

        $public.setLessonLocation = function setLessonLocation(variable, value) {
            $("body").scorm_set_lessonLocation(variable, value);
        }

        $public.setScore = function setScore(raw) {
            $("body").scorm_set_score(raw);
        }

        $public.getScore = function getScore() {
            return $("body").scorm_get_score();
        }


        $public.setInteractions = function setInteractions(indice, correto, resposta, tipo, tempoGasto, pesoDado) {

            console.log(indice, correto, resposta, tipo, tempoGasto, pesoDado);
            $('body').scorm_set_interactions(indice, correto, resposta, tipo, tempoGasto, pesoDado); //_indice, correto, resposta, _tipo, _tempoGasto, _pesoDado
        }

        $public.setStatusLesson = function setStatusLesson(_status) {
            $('body').scorm_set_status_lesson(_status)
        }

        $public.getStatusLesson = function getStatusLesson() {
            return $('body').scorm_get_status_lesson()
        }

        $public.getInteractionsCount = function getInteractionsCount() {
            return $('body').scorm_get_interactions_count();
        }

        $public.resetAll = function resetAll() {
            $("body").scorm_reset();
        }

        $public.resetSuspendata = function resetSuspendata() {
            $("body").scorm_reset_suspendData();
        }

        $public.resetLessonLocation = function resetLessonLocation() {
            $("body").scorm_reset_lessonLocation();
        }
        
        $public.sairScorm = function sairScorm() {
            $("body").scorm_quit();
        }


        return $public;
    };

    return scorm();
});