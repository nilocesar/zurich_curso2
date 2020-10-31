var iframe = iframe || {};
var PATH_CONFIG = "./data.xml";
(function (doc, undefined) {
    'use strict';
    //
    require.config({
        baseUrl: './includes/js/',
        paths: {
            jquery: 'iframe/vendor/jquery-1.11.2.min',
            jquery_scorm: "iframe/vendor/scorm.jquery",
            iframe: 'iframe'
        },
        shim: {
            jquery: {
                exports: '$'
            },
            jquery_scorm:{
                deps: ['jquery']
            }
        }
    });

    require(['jquery'], function ($) {
        require(['iframe'], function (_iframe) {
            $(function () {
                iframe = _iframe;
                iframe.init( PATH_CONFIG );
            });
        });
    });
    
})(document);


