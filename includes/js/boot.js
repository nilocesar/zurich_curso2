var course = course || {};
var PATH_CONFIG = "./data.xml";
(function (doc, undefined) {
    'use strict';
    //
    require.config({
        baseUrl: './includes/js',
        paths: {
            jquery: 'vendor/jquery-1.11.2.min',
            jquery_scorm: "iframe/vendor/scorm.jquery",
            imagesloaded: "vendor/imagesloaded.pkgd.min",
            nicescroll: "vendor/jquery.nicescroll.min",
            modernizr: "vendor/modernizr",
            velocity: "vendor/velocity.min",
            detectmobilebrowser: "vendor/detectmobilebrowser",
            transform2d_jquery: "vendor/jquery.transform2d",
            transform3d_jquery: "vendor/jquery.transform3d",
            transit_jquery: "vendor/jquery.transit.min",
            easing_jquery: "vendor/jquery.easing.min",
            componentes_jquery: "vendor/componentes.jquery",
            highcharts: "vendor/highcharts",
            exporting: "vendor/exporting",
            export_data: "vendor/export-data",
            print: "vendor/jQuery.print.min",
            hammer: "vendor/hammer.min",
            TweenLite: "vendor/TweenLite.min",
            TweenMax: "vendor/TweenMax.min",
            TimelineMax: "vendor/TimelineMax.min",
            d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.3.3/d3.min',
            slick: 'vendor/slick',
            blast: "vendor/blast",
            course: 'course'
        },
        shim: {
            jquery: {
                exports: '$'
            },
            imagesloaded: {
                deps: ['jquery']
            },
            nicescroll: {
                deps: ['jquery']
            },
            highcharts: {
                exports: "Highcharts",
                deps: ["jquery"]
            }
        }
    });

    require(['jquery'], function ($) {
        require(['course'], function (_course) {
            $(function () {
                course = _course;
                course.setCourse('PATH_CONFIG', PATH_CONFIG).init();
            });
        });
    });

})(document);
