define(['jquery'], function ($) {
    'use strict';

    var motion = function () {
        var $public = {};
        var $private = {};
        var $parent = {};

        $public.init = function init(parent, callNav) {
            $parent = parent;
        };

        $public.call = function call(_status) {
            if (_status == "init") {
                $private.motionNext();
            }
            if (_status == "next") {
                $private.motionNext();
            }
            if (_status == "previous") {
                $private.motionPrevious();
            }
            if (_status == "go") {
                $private.motionNext();
            }
        }


        $private.motionNext = function motionNext() {

            var _indiceOLD = $parent.indiceOLD;
            var _indice = $parent.indice;
            var _config = $parent.config;

            $.each(_config, function (index, value) {

                $("#" + value.id).css("display", "none");
                if (value.indice == _indice) {
                    $("#" + value.id).css("display", "block");
                    $("#" + value.id).css('opacity', '0');
                    $("#" + value.id).removeClass('animated fadeIn fadeInRight fadeInLeft fadeInDown fadeInUp');

                    if (value.transicao == "alpha") {
                        $("#" + value.id).addClass('animated fadeIn');
                        $("#" + value.id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                            $private.completeAnimate();
                        });

                    } else if (value.transicao == "horizontal") {
                        $("#" + value.id).addClass('animated fadeInUp');
                        $("#" + value.id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                            $private.completeAnimate();
                        });
                    } else if (value.transicao == "vertical") {
                        //overflow: hidden
                        $("#" + value.id).parent().css("overflow", "hidden");
                        $("#" + value.id).css("left", $(window).width());
                        $("#" + value.id).animate({
                            opacity: 1,
                            left: "0"
                        }, 1000 * 1, function () {
                            $(this).parent().css("overflow", "auto");
                            $private.completeAnimate();
                        });
                    } else {
                       /* $("#" + value.id).addClass('animated fadeIn');*/
                        $("#" + value.id).css('opacity', 1);
                        setTimeout(function(){
                            $private.completeAnimate();
                        }, 1000 * 1)
                        
                    }
                }
            })

        }

        $private.motionPrevious = function motionPrevious() {

            var _indiceOLD = $parent.indiceOLD;
            var _indice = $parent.indice;
            var _config = $parent.config;

            $.each(_config, function (index, value) {

                $("#" + value.id).css("display", "none");
                if (value.indice == _indice) {
                    $("#" + value.id).css("display", "block");
                    $("#" + value.id).css('opacity', '0');
                    $("#" + value.id).removeClass('animated fadeIn fadeInRight fadeInLeft fadeInDown fadeInUp');

                    if (value.transicao == "alpha") {
                        $("#" + value.id).addClass('animated fadeIn');
                    } else if (value.transicao == "horizontal") {
                        $("#" + value.id).addClass('animated fadeInDown');
                    } else if (value.transicao == "vertical") {
                        $("#" + value.id).addClass('animated fadeInLeft');
                    } else {
                        $("#" + value.id).css('opacity', 1);
                        setTimeout(function(){
                            $private.completeAnimate();
                        }, 1000 * 1);
                    }

                    $("#" + value.id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $private.completeAnimate();
                    });
                }
            })

        }

        $private.completeAnimate = function completeAnimate() {
            $parent.block = true;
        }

        return $public;
    };

    return motion();
});