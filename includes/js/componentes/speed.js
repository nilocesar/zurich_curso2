define(['jquery'], function ($) {
    'use strict';

    var speed = function () {
        var $public = {};
        var $private = {};
        var $parent = {};

        $public.init = function init(_parent) {
            $parent = _parent;

            $private.endTime = 0;
            $private.DOWNLOADSIZE = 8388608; //constante com o tamanho em bytes do arquivo speed.jpg

            $private.startTime = (new Date()).getTime();

            var pathSpeed = "includes/speed/speed.jpg";
            var speed = new Image();

            speed.onload = function () {
                $private.endTime = (new Date()).getTime();
                $private.showSpeed();
            }
            speed.onerror = function (err, msg) {
                //Erro ao carregar. Sem tratamento.
            }

            var cacheBuster = "?nnn=" + $private.startTime;
            speed.src = pathSpeed + cacheBuster;
        };



        $private.showSpeed = function showSpeed() {
            var duration = ($private.endTime - $private.startTime) / 1000;
            var bitsLoaded = $private.DOWNLOADSIZE;
            var speedBps = (bitsLoaded / duration).toFixed(2);
            var speedKbps = (speedBps / 1024).toFixed(2);
            var speedMbps = (speedKbps / 1024).toFixed(2);

            $(".speed").html("SUA VELOCIDADE É DE: <br />" + Math.round(speedKbps) + " Kbps");
            
            //
            if( $parent.scorm_get_lessonLocation( "speedIndice" ) )
            {
                var _indiceSpeed = $parent.scorm_get_lessonLocation( "speedIndice" );
                $parent.scorm_set_lessonLocation( "speedIndice" , parseInt(_indiceSpeed) + 1  );
            }
            else
            {
                $parent.scorm_set_lessonLocation( "speedIndice" , 0  );
            }
            
            var _speedIndice = $parent.scorm_get_lessonLocation( "speedIndice" );
            var speed = _speedIndice + "_speed";
            
            $parent.scorm_set_suspendData(speed , Math.round(speedKbps) );   

        };

        return $public;
    };

    return speed();
});
