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
            callScorm();
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
