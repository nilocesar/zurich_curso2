/**
 * 
 * @auther SM@K<smali.kazmi@hotmail.com>
 * @description website: smak.pk
 */

(function () {
    var root = this;

    var SmartPhone = function (obj) {
        if (obj instanceof SmartPhone)
            return obj;
        if (!(this instanceof SmartPhone))
            return new SmartPhone(obj);
        this._wrapped = obj;
    };

    SmartPhone.userAgent = null;
    SmartPhone.getUserAgent = function () {
        return this.userAgent;
    };

    SmartPhone.setUserAgent = function (userAgent) {
        this.userAgent = userAgent;
    };

    SmartPhone.isAndroid = function () {
        return this.getUserAgent().match(/Android/i);
    };

    SmartPhone.isBlackBerry = function () {
        return this.getUserAgent().match(/BlackBerry/i);
    };

    SmartPhone.isBlackBerryPlayBook = function () {
        return this.getUserAgent().match(/PlayBook/i);
    };

    SmartPhone.isBlackBerry10 = function () {
        return this.getUserAgent().match(/BB10/i);
    };

    SmartPhone.isIOS = function () {
        return this.isIPhone() || this.isIPad() || this.isIPod();
    };

    SmartPhone.isIPhone = function () {
        return this.getUserAgent().match(/iPhone/i);
    };

    SmartPhone.isIPad = function () {
        return this.getUserAgent().match(/iPad/i);
    };

    SmartPhone.isIPod = function () {
        return this.getUserAgent().match(/iPod/i);
    };

    SmartPhone.isOpera = function () {
        return this.getUserAgent().match(/Opera Mini/i);
    };

    SmartPhone.isWindows = function () {
        return this.isWindowsDesktop() || this.isWindowsMobile();
    };

    SmartPhone.isWindowsMobile = function () {
        return this.getUserAgent().match(/IEMobile/i);
    };

    SmartPhone.isWindowsDesktop = function () {
        return this.getUserAgent().match(/WPDesktop/i);
    };

    SmartPhone.isFireFox = function () {
        return this.getUserAgent().match(/Firefox/i);
    };

    SmartPhone.isNexus = function () {
        return this.getUserAgent().match(/Nexus/i);
    };

    SmartPhone.isKindleFire = function () {
        return this.getUserAgent().match(/Kindle Fire/i);
    };

    SmartPhone.isPalm = function () {
        return this.getUserAgent().match(/PalmSource|Palm/i);
    };

    SmartPhone.ieOLD = function () {
        var ua = window.navigator.userAgent;

        // Test values; Uncomment to check result …

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        var msie = ua.indexOf('MSIE '); // -IE10
        var trident = ua.indexOf('Trident/'); // - IE11
        
        if (msie > 0 || trident > 0 ) {
            // IE 10 or older => return version number
            /*return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);*/
            return true;
        }

        
       /* if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }*/

        // other browser
        return false;
    }

    SmartPhone.isAny = function () {
        var foundAny = false;
        var getAllMethods = Object.getOwnPropertyNames(SmartPhone).filter(function (property) {
            return typeof SmartPhone[property] == 'function';
        });

        for (var index in getAllMethods) {
            if (getAllMethods[index] === 'setUserAgent' || getAllMethods[index] === 'getUserAgent' ||
                getAllMethods[index] === 'isAny' || getAllMethods[index] === 'isWindows' ||
                getAllMethods[index] === 'isIOS') {
                continue;
            }
            if (SmartPhone[getAllMethods[index]]()) {
                foundAny = true;
                break;
            }
        }
        return foundAny;
    };

    if (typeof window === 'function' || typeof window === 'object') {
        SmartPhone.setUserAgent(navigator.userAgent);
    }

    if (typeof exports !== 'undefined') {

        var middleware = function (isMiddleware) {

            isMiddleware = isMiddleware === (void 0) ? true : isMiddleware;

            if (isMiddleware) {
                return function (req, res, next) {

                    var userAgent = req.headers['user-agent'] || '';
                    SmartPhone.setUserAgent(userAgent);
                    req.SmartPhone = SmartPhone;

                    if ('function' === typeof res.locals) {
                        res.locals({
                            SmartPhone: SmartPhone
                        });
                    } else {
                        res.locals.SmartPhone = SmartPhone;
                    }

                    next();
                };
            } else {
                return SmartPhone;
            }

        };

        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = middleware;
        }
        exports = middleware;
    } else {
        root.SmartPhone = SmartPhone;
    }

}.call(this));
