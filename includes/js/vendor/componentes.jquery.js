var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

(function ($) {
    $.fn.classes = function (callback) {
        var classes = [];
        $.each(this, function (i, v) {
            var splitClassName = v.className.split(/\s+/);
            for (var j = 0; j < splitClassName.length; j++) {
                var className = splitClassName[j];
                if (-1 === classes.indexOf(className)) {
                    classes.push(className);
                }
            }
        });
        if ('function' === typeof callback) {
            for (var i in classes) {
                callback(classes[i]);
            }
        }
        return classes;
    };
})(jQuery);

(function () {

    var defaultTapProperties = {
        title: '',
        favicon: ''
    };

    var instanceId = 0;

    var ChromeTabs = function () {
        function ChromeTabs() {
            _classCallCheck(this, ChromeTabs);

            this.draggabillyInstances = [];
        }

        _createClass(ChromeTabs, [{
            key: 'init',
            value: function init(el, id, options) {
                this.el = el;
                this.classID = id;
                this.options = options;

                this.instanceId = instanceId;
                this.el.setAttribute('data-chrome-tabs-instance-id', this.instanceId);
                instanceId += 1;

                this.setupStyleEl();
                this.setupEvents();
                this.layoutTabs();
                this.fixZIndexes();
            }
            }, {
            key: 'emit',
            value: function emit(eventName, data) {
                this.el.dispatchEvent(new CustomEvent(eventName, {
                    detail: data
                }));
            }
            }, {
            key: 'setupStyleEl',
            value: function setupStyleEl() {
                this.animationStyleEl = document.createElement('style');
                this.el.appendChild(this.animationStyleEl);
            }
            }, {
            key: 'setupEvents',
            value: function setupEvents() {
                var _this = this;

                $(".chrome-tab-current").find(".chrome-tab-title").addClass("activeTitleTab");
                $(".chrome-tab-current").find(".chrome-tab-favicon").addClass("removeEffectIco");

                window.addEventListener('resize', function (event) {
                    return _this.layoutTabs();
                });

                this.el.addEventListener('click', function (_ref) {
                    var target = _ref.target;

                    if (target.classList.contains('chrome-tab')) {
                        _this.setCurrentTab(target);
                    } else if (target.classList.contains('chrome-tab-close')) {
                        _this.removeTab(target.parentNode);
                    } else if (target.classList.contains('chrome-tab-title') || target.classList.contains('chrome-tab-favicon')) {
                        _this.setCurrentTab(target.parentNode);
                    }

                });
            }
            }, {
            key: 'layoutTabs',
            value: function layoutTabs() {

                var _this2 = this;

                var tabWidth = this.tabWidth;

                this.cleanUpPreviouslyDraggedTabs();
                this.tabEls.forEach(function (tabEl) {
                    return tabEl.style.width = tabWidth + 'px';
                });
                requestAnimationFrame(function () {
                    var styleHTML = '';
                    _this2.tabPositions.forEach(function (left, i) {
                        styleHTML += '\n            .chrome-tabs[data-chrome-tabs-instance-id="' + _this2.instanceId + '"] .chrome-tab:nth-child(' + (i + 1) + ') {\n              transform: translate3d(' + left + 'px, 0, 0)\n            }\n          ';
                    });
                    _this2.animationStyleEl.innerHTML = styleHTML;
                });
            }
            }, {
            key: 'fixZIndexes',
            value: function fixZIndexes() {
                var bottomBarEl = this.el.querySelector('.chrome-tabs-bottom-bar');
                var tabEls = this.tabEls;

                tabEls.forEach(function (tabEl, i) {
                    var zIndex = tabEls.length - i;

                    if (tabEl.classList.contains('chrome-tab-current')) {
                        zIndex = tabEls.length + 2;
                    }
                    tabEl.style.zIndex = zIndex;
                });
            }
            }, {
            key: 'setCurrentTab',
            value: function setCurrentTab(tabEl) {



                $(".chrome-tab-title").removeClass("activeTitleTab");
                $(".chrome-tab-favicon").removeClass("removeEffectIco");

                var currentTab = this.el.querySelector('.chrome-tab-current');
                if (currentTab) currentTab.classList.remove('chrome-tab-current');
                tabEl.classList.add('chrome-tab-current');

                $(".chrome-tab-current").find(".chrome-tab-title").addClass("activeTitleTab");
                $(".chrome-tab-current").find(".chrome-tab-favicon").addClass("removeEffectIco");


                this.fixZIndexes();
                $(this.classID).trigger("activeTabChange", [tabEl]);

                //                this.emit('activeTabChange', {
                //                    tabEl: tabEl
                //                });
            }
            }, {
            key: 'updateTab',
            value: function updateTab(tabEl, tabProperties) {
                tabEl.querySelector('.chrome-tab-title').textContent = tabProperties.title;
                tabEl.querySelector('.chrome-tab-favicon').style.backgroundImage = 'url(\'' + tabProperties.favicon + '\')';
            }
            }, {
            key: 'cleanUpPreviouslyDraggedTabs',
            value: function cleanUpPreviouslyDraggedTabs() {
                this.tabEls.forEach(function (tabEl) {
                    return tabEl.classList.remove('chrome-tab-just-dragged');
                });
            }
            }, {
            key: 'tabEls',
            get: function get() {
                return Array.prototype.slice.call(this.el.querySelectorAll('.chrome-tab'));
            }
            }, {
            key: 'tabContentEl',
            get: function get() {
                return this.el.querySelector('.chrome-tabs-content');
            }
            }, {
            key: 'tabWidth',
            get: function get() {
                var tabsContentWidth = this.tabContentEl.clientWidth - this.options.tabOverlapDistance;
                var width = tabsContentWidth / this.tabEls.length + this.options.tabOverlapDistance;
                return Math.max(this.options.minWidth, Math.min(this.options.maxWidth, width));
            }
            }, {
            key: 'tabEffectiveWidth',
            get: function get() {
                return this.tabWidth - this.options.tabOverlapDistance;
            }
            }, {
            key: 'tabPositions',
            get: function get() {
                var tabEffectiveWidth = this.tabEffectiveWidth;
                var left = 0;
                var positions = [];

                this.tabEls.forEach(function (tabEl, i) {
                    positions.push(left);
                    left += tabEffectiveWidth;
                });
                return positions;
            }
            }]);

        return ChromeTabs;
    }();

    window.ChromeTabs = ChromeTabs;
})();

///iOS shim for HTML 5 drag'n'drop
(function (doc) {

    log = noop; // noOp, remove this line to enable debugging

    var coordinateSystemForElementFromPoint;

    function main(config) {
        config = config || {};

        coordinateSystemForElementFromPoint = navigator.userAgent.match(/OS [1-4](?:_\d+)+ like Mac/) ? "page" : "client";

        var div = doc.createElement('div');
        var dragDiv = 'draggable' in div;
        var evts = 'ondragstart' in div && 'ondrop' in div;

        var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
        log((needsPatch ? "" : "not ") + "patching html5 drag drop");

        if (!needsPatch) {
            return;
        }

        if (!config.enableEnterLeave) {
            DragDrop.prototype.synthesizeEnterLeave = noop;
        }

        if (config.holdToDrag) {
            doc.addEventListener("touchstart", touchstartDelay(config.holdToDrag));
        } else {
            doc.addEventListener("touchstart", touchstart);
        }
    }

    function DragDrop(event, el) {

        this.dragData = {};
        this.dragDataTypes = [];
        this.dragImage = null;
        this.dragImageTransform = null;
        this.dragImageWebKitTransform = null;
        this.customDragImage = null;
        this.customDragImageX = null;
        this.customDragImageY = null;
        this.el = el || event.target;

        log("dragstart");

        if (this.dispatchDragStart()) {
            this.createDragImage();
            this.listen();
        }
    }

    DragDrop.prototype = {
        listen: function () {
            var move = onEvt(doc, "touchmove", this.move, this);
            var end = onEvt(doc, "touchend", ontouchend, this);
            var cancel = onEvt(doc, "touchcancel", cleanup, this);

            function ontouchend(event) {
                this.dragend(event, event.target);
                cleanup.call(this);
            }

            function cleanup() {
                log("cleanup");
                this.dragDataTypes = [];
                if (this.dragImage !== null) {
                    this.dragImage.parentNode.removeChild(this.dragImage);
                    this.dragImage = null;
                    this.dragImageTransform = null;
                    this.dragImageWebKitTransform = null;
                }
                this.customDragImage = null;
                this.customDragImageX = null;
                this.customDragImageY = null;
                this.el = this.dragData = null;
                return [move, end, cancel].forEach(function (handler) {
                    return handler.off();
                });
            }
        },
        move: function (event) {
            event.preventDefault();
            var pageXs = [],
                pageYs = [];
            [].forEach.call(event.changedTouches, function (touch) {
                pageXs.push(touch.pageX);
                pageYs.push(touch.pageY);
            });

            var x = average(pageXs) - (this.customDragImageX || parseInt(this.dragImage.offsetWidth, 10) / 2);
            var y = average(pageYs) - (this.customDragImageY || parseInt(this.dragImage.offsetHeight, 10) / 2);
            this.translateDragImage(x, y);

            this.synthesizeEnterLeave(event);
        },
        // We use translate instead of top/left because of sub-pixel rendering and for the hope of better performance
        // http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
        translateDragImage: function (x, y) {
            var translate = "translate(" + x + "px," + y + "px) ";

            if (this.dragImageWebKitTransform !== null) {
                this.dragImage.style["-webkit-transform"] = translate + this.dragImageWebKitTransform;
            }
            if (this.dragImageTransform !== null) {
                this.dragImage.style.transform = translate + this.dragImageTransform;
            }
        },
        synthesizeEnterLeave: function (event) {
            var target = elementFromTouchEvent(this.el, event)
            if (target != this.lastEnter) {
                if (this.lastEnter) {
                    this.dispatchLeave(event);
                }
                this.lastEnter = target;
                if (this.lastEnter) {
                    this.dispatchEnter(event);
                }
            }
            if (this.lastEnter) {
                this.dispatchOver(event);
            }
        },
        dragend: function (event) {

            // we'll dispatch drop if there's a target, then dragEnd.
            // drop comes first http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html#drag-and-drop-processing-model
            log("dragend");

            if (this.lastEnter) {
                this.dispatchLeave(event);
            }

            var target = elementFromTouchEvent(this.el, event)
            if (target) {
                log("found drop target " + target.tagName);
                this.dispatchDrop(target, event);
            } else {
                log("no drop target");
            }

            var dragendEvt = doc.createEvent("Event");
            dragendEvt.initEvent("dragend", true, true);
            this.el.dispatchEvent(dragendEvt);
        },
        dispatchDrop: function (target, event) {
            var dropEvt = doc.createEvent("Event");
            dropEvt.initEvent("drop", true, true);

            var touch = event.changedTouches[0];
            var x = touch[coordinateSystemForElementFromPoint + 'X'];
            var y = touch[coordinateSystemForElementFromPoint + 'Y'];

            var targetOffset = getOffset(target);

            dropEvt.offsetX = x - targetOffset.x;
            dropEvt.offsetY = y - targetOffset.y;

            dropEvt.dataTransfer = {
                types: this.dragDataTypes,
                getData: function (type) {
                    return this.dragData[type];
                }.bind(this),
                dropEffect: "move"
            };
            dropEvt.preventDefault = function () {
                // https://www.w3.org/Bugs/Public/show_bug.cgi?id=14638 - if we don't cancel it, we'll snap back
            }.bind(this);

            once(doc, "drop", function () {
                log("drop event not canceled");
            }, this);

            target.dispatchEvent(dropEvt);
        },
        dispatchEnter: function (event) {

            var enterEvt = doc.createEvent("Event");
            enterEvt.initEvent("dragenter", true, true);
            enterEvt.dataTransfer = {
                types: this.dragDataTypes,
                getData: function (type) {
                    return this.dragData[type];
                }.bind(this)
            };

            var touch = event.changedTouches[0];
            enterEvt.pageX = touch.pageX;
            enterEvt.pageY = touch.pageY;
            enterEvt.clientX = touch.clientX;
            enterEvt.clientY = touch.clientY;

            this.lastEnter.dispatchEvent(enterEvt);
        },
        dispatchOver: function (event) {

            var overEvt = doc.createEvent("Event");
            overEvt.initEvent("dragover", true, true);
            overEvt.dataTransfer = {
                types: this.dragDataTypes,
                getData: function (type) {
                    return this.dragData[type];
                }.bind(this)
            };

            var touch = event.changedTouches[0];
            overEvt.pageX = touch.pageX;
            overEvt.pageY = touch.pageY;
            overEvt.clientX = touch.clientX;
            overEvt.clientY = touch.clientY;

            this.lastEnter.dispatchEvent(overEvt);
        },
        dispatchLeave: function (event) {

            var leaveEvt = doc.createEvent("Event");
            leaveEvt.initEvent("dragleave", true, true);
            leaveEvt.dataTransfer = {
                types: this.dragDataTypes,
                getData: function (type) {
                    return this.dragData[type];
                }.bind(this)
            };

            var touch = event.changedTouches[0];
            leaveEvt.pageX = touch.pageX;
            leaveEvt.pageY = touch.pageY;
            leaveEvt.clientX = touch.clientX;
            leaveEvt.clientY = touch.clientY;

            this.lastEnter.dispatchEvent(leaveEvt);
            this.lastEnter = null;
        },
        dispatchDragStart: function () {
            var evt = doc.createEvent("Event");
            evt.initEvent("dragstart", true, true);
            evt.dataTransfer = {
                setData: function (type, val) {
                    this.dragData[type] = val;
                    if (this.dragDataTypes.indexOf(type) == -1) {
                        this.dragDataTypes[this.dragDataTypes.length] = type;
                    }
                    return val;
                }.bind(this),
                setDragImage: function (el, x, y) {
                    this.customDragImage = el;
                    this.customDragImageX = x
                    this.customDragImageY = y
                }.bind(this),
                dropEffect: "move"
            };
            return this.el.dispatchEvent(evt);
        },
        createDragImage: function () {
            if (this.customDragImage) {
                this.dragImage = this.customDragImage.cloneNode(true);
                duplicateStyle(this.customDragImage, this.dragImage);
            } else {
                this.dragImage = this.el.cloneNode(true);
                duplicateStyle(this.el, this.dragImage);
            }
            this.dragImage.style.opacity = "0.5";
            this.dragImage.style.position = "absolute";
            this.dragImage.style.left = "0px";
            this.dragImage.style.top = "0px";
            this.dragImage.style.zIndex = "999999";

            var transform = this.dragImage.style.transform;
            if (typeof transform !== "undefined") {
                this.dragImageTransform = "";
                if (transform != "none") {
                    this.dragImageTransform = transform.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
                }
            }

            var webkitTransform = this.dragImage.style["-webkit-transform"];
            if (typeof webkitTransform !== "undefined") {
                this.dragImageWebKitTransform = "";
                if (webkitTransform != "none") {
                    this.dragImageWebKitTransform = webkitTransform.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
                }
            }

            this.translateDragImage(-9999, -9999);

            doc.body.appendChild(this.dragImage);
        }
    };

    // delayed touch start event
    function touchstartDelay(delay) {
        return function (evt) {
            var el = evt.target;

            if (el.draggable === true) {
                var heldItem = function () {
                    end.off();
                    cancel.off();
                    scroll.off();
                    touchstart(evt);
                };

                var onReleasedItem = function () {
                    end.off();
                    cancel.off();
                    scroll.off();
                    clearTimeout(timer);
                };

                var timer = setTimeout(heldItem, delay);

                var end = onEvt(el, 'touchend', onReleasedItem, this);
                var cancel = onEvt(el, 'touchcancel', onReleasedItem, this);
                var scroll = onEvt(window, 'scroll', onReleasedItem, this);
            }
        };
    };

    // event listeners
    function touchstart(evt) {
        var el = evt.target;
        do {
            if (el.draggable === true) {
                // If draggable isn't explicitly set for anchors, then simulate a click event.
                // Otherwise plain old vanilla links will stop working.
                // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events#Handling_clicks
                if (!el.hasAttribute("draggable") && el.tagName.toLowerCase() == "a") {
                    var clickEvt = document.createEvent("MouseEvents");
                    clickEvt.initMouseEvent("click", true, true, el.ownerDocument.defaultView, 1,
                        evt.screenX, evt.screenY, evt.clientX, evt.clientY,
                        evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);
                    el.dispatchEvent(clickEvt);
                    log("Simulating click to anchor");
                }
                evt.preventDefault();
                new DragDrop(evt, el);
                break;
            }
        } while ((el = el.parentNode) && el !== doc.body);
    }

    // DOM helpers
    function elementFromTouchEvent(el, event) {
        var touch = event.changedTouches[0];
        var target = doc.elementFromPoint(
            touch[coordinateSystemForElementFromPoint + "X"],
            touch[coordinateSystemForElementFromPoint + "Y"]
        );
        return target;
    }

    //calculate the offset position of an element (relative to the window, not the document)
    function getOffset(el) {
        var rect = el.getBoundingClientRect();
        return {
            "x": rect.left,
            "y": rect.top
        };
    }

    function onEvt(el, event, handler, context) {
        if (context) {
            handler = handler.bind(context);
        }
        el.addEventListener(event, handler);
        return {
            off: function () {
                return el.removeEventListener(event, handler);
            }
        };
    }

    function once(el, event, handler, context) {
        if (context) {
            handler = handler.bind(context);
        }

        function listener(evt) {
            handler(evt);
            return el.removeEventListener(event, listener);
        }
        return el.addEventListener(event, listener);
    }

    // duplicateStyle expects dstNode to be a clone of srcNode
    function duplicateStyle(srcNode, dstNode) {
        // Is this node an element?
        if (srcNode.nodeType == 1) {
            // Remove any potential conflict attributes
            dstNode.removeAttribute("id");
            dstNode.removeAttribute("class");
            dstNode.removeAttribute("style");
            dstNode.removeAttribute("draggable");

            // Clone the style
            var cs = window.getComputedStyle(srcNode);
            for (var i = 0; i < cs.length; i++) {
                var csName = cs[i];
                dstNode.style.setProperty(csName, cs.getPropertyValue(csName), cs.getPropertyPriority(csName));
            }

            // Pointer events as none makes the drag image transparent to document.elementFromPoint()
            dstNode.style.pointerEvents = "none";
        }

        // Do the same for the children
        if (srcNode.hasChildNodes()) {
            for (var j = 0; j < srcNode.childNodes.length; j++) {
                duplicateStyle(srcNode.childNodes[j], dstNode.childNodes[j]);
            }
        }
    }

    // general helpers
    function log(msg) {
        console.log(msg);
    }

    function average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((function (s, v) {
            return v + s;
        }), 0) / arr.length;
    }

    function noop() {}

    // main(window.iosDragDropShim);
    //main({ holdToDrag: 300});
    main({
        enableEnterLeave: true
    });


})(document);


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
//  ARRASTE                                                        //
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////


(function ($) {



    $.fn.arraste = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'drag-item',
            confirmarClass: 'confirmar-btn',
            positivaClass: 'positivo-modal',
            tentativaClass: 'tentativa-modal',
            negativaClass: 'negativo-modal',
            fecharModalClass: 'fechar-modal',
            tentativas: 1,
            destravarTela: false,
            avancarTela: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);


        BASE.$activeItem = null;

        BASE.indiceArraste = 0;
        BASE.indiceAlvo = 0;
        BASE.tentativasUsadas = 0;
        BASE.statusFeed = "inativo";
        BASE.block = false;


        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

            item.setAttribute('draggable', 'true');

            if ($(item).attr("arraste")) {
                BASE.indiceArraste++;
                $(item).addClass("arraste");
                $(item).addClass("arraste" + BASE.indiceArraste);
                $(item).attr("indiceArraste", BASE.indiceArraste);
            }

            if ($(item).attr("alvo")) {
                BASE.indiceAlvo++;
                item.old = item.innerHTML;
                $(item).addClass("alvo");
                $(item).addClass("alvo" + BASE.indiceAlvo);
                $(item).attr("indiceAlvo", BASE.indiceAlvo);
            }


            $(item).on('dragstart', onDragStart);
            $(item).on('dragend', onDragEnd);
            $(item).on('dragover', onDragOver);
            $(item).on('dragenter', onDragEnter);
            $(item).on('dragleave', onDragLeave);
            $(item).on('drop', onDrop);


        })


        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.avancarClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).on("click", function () {
            confere();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.avancarClass).on("click", function () {
            avancar();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })


        if (BASE.SETTINGS.randomico)
            random();


        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {

            var cards = $(BASE.$container).find('.arraste');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }

        ///////////////////////////////////////////
        //      DRAG DROP                        //
        ///////////////////////////////////////////


        function onDragStart(event) {

            if (BASE.block)
                return false;

            BASE.$activeItem = this;

            event.originalEvent.dataTransfer.effectAllowed = 'move';
            event.originalEvent.dataTransfer.setData('text', this.innerHTML);


            BASE.current = {
                "drag": this,
                "drop": null
            };
            BASE.status = "drag";
            BASE.SETTINGS.disparo.call(this, BASE);
        };

        function onDragEnd(event) {

        };

        function onDragEnter(event) {

        };

        function onDragLeave(event) {

        };

        function onDragOver(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            event.originalEvent.dataTransfer.dropEffect = 'move';

            BASE.current = {
                "drag": this,
                "drop": null
            };
            BASE.status = "over";
            BASE.SETTINGS.disparo.call(this, BASE);


            return false;
        };

        function onDrop(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }

            var dragThis = BASE.$activeItem;
            var dropThis = this;


            if ($(dropThis).attr("alvo")) {



                if (!$(dragThis).attr("alvo")) {


                    if ($(dragThis).css("opacity") > 0.2) {


                        if (dropThis.innerHTML == dropThis.old) {
                            $(dragThis).css("opacity", 0.2);
                            dropThis.indiceArraste = $(dragThis).attr("indiceArraste");
                            dropThis.innerHTML = event.originalEvent.dataTransfer.getData('text');
                        } else {
                            $(BASE.$container).find('.arraste' + dropThis.indiceArraste).css("opacity", 1);
                            $(dragThis).css("opacity", 0.2);
                            dropThis.indiceArraste = $(dragThis).attr("indiceArraste");
                            dropThis.innerHTML = event.originalEvent.dataTransfer.getData('text');
                        }


                    }

                } else {

                    var _dropIndice = dropThis.indiceArraste;

                    dragThis.innerHTML = dropThis.innerHTML;
                    dropThis.indiceArraste = dragThis.indiceArraste;
                    dragThis.indiceArraste = _dropIndice;

                    dropThis.innerHTML = event.originalEvent.dataTransfer.getData('text');
                }


            } else {
                if ($(dragThis).attr("alvo") && dragThis.innerHTML != dragThis.old) {
                    dragThis.innerHTML = dragThis.old;
                    $(BASE.$container).find('.arraste' + dragThis.indiceArraste).css("opacity", 1);
                }
            }

            statusConfirmar();

            BASE.current = {
                "drag": dragThis,
                "drop": dropThis
            };
            BASE.status = "drop";
            BASE.SETTINGS.disparo.call(this, BASE);


            return false;
        };

        function statusConfirmar() {
            var _alvoMudado = 0;



            $(BASE.$container).find('.alvo').each(function (indice, item) {

                if (item.innerHTML != item.old)
                    _alvoMudado++;

            })


            if (_alvoMudado == BASE.indiceArraste) {
                ativarConfirmar();
            } else {
                desativarConfirmar();
            }
        }

        function ativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "block");
        }

        function desativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

        function confere() {

            var _confereArray = [];
            var _statusConfere = true;
            var an = 0;

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("alvo")) {
                    var _alvo = $(item).attr("alvo");
                    var _alvoArray = _alvo.split("|");
                    var _resposta = false;

                    for (var i = 0; i < _alvoArray.length; i++) {
                        if (_alvoArray[i] == item.indiceArraste)
                            _resposta = true;
                    }

                    if (_resposta) {
                        $(item).addClass(BASE.SETTINGS.positivaClass);
                    } else {


                        $(item).addClass(BASE.SETTINGS.negativaClass);
                        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(
                            function (indice, itemArraste) {
                                if ($(itemArraste).attr("arraste")) {

                                    if ($(itemArraste).attr("arraste") == $(item).attr("alvo")) {
                                        an += 2;

                                        var _texto = itemArraste.innerHTML;
                                        item.innerHTML = _texto;
                                        $(item).addClass("animated fadeIn delay0_" + an);
                                    }

                                }

                            }
                        );

                    }
                }
            });


            //feed(_statusConfere);
            BASE.block = true;
            BASE.status = "confirmar";
            BASE.SETTINGS.disparo.call(this, BASE);
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
            $(BASE.$container).find('.' + BASE.SETTINGS.avancarClass).css("display", "block");

        }

        function avancar() {

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {
                $(item).removeClass("animated fadeIn");
                $(item).removeClass(BASE.SETTINGS.negativaClass);
                $(item).removeClass(BASE.SETTINGS.positivaClass);
            });

            BASE.block = false;
            $(BASE.$container).find('.' + BASE.SETTINGS.avancarClass).css("display", "none");

            BASE.status = "avancar";
            BASE.SETTINGS.disparo.call(this, BASE);
            reset();
        }

        function feed(_status) {

            //GAMBI -firefox
            $(".modalFeed .bcg").css("position", "fixed");
            $(".modalFeed .bcg").css("top", "50%");
            $(".modalFeed .bcg").css("left", "50%");
            $(".modalFeed .bcg").css("width", $(window).width());
            $(".modalFeed .bcg").css("height", $(window).height());
            $(".modalFeed .bcg").css("margin-top", $(window).height() / 2 * -1);
            $(".modalFeed .bcg").css("margin-left", $(window).width() / 2 * -1);
            //GAMBI -firefox

            //Positivo
            if (_status) {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "block");
                BASE.statusFeed = "liberado";

                BASE.status = "positivo";
                BASE.SETTINGS.disparo.call(this, BASE);


            } else {
                BASE.tentativasUsadas++;

                if (BASE.tentativasUsadas < BASE.SETTINGS.tentativas) {
                    $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "block");

                    BASE.status = "tentativa";
                    BASE.SETTINGS.disparo.call(this, BASE);

                } else {
                    $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "block");
                    BASE.statusFeed = "liberado";

                    BASE.status = "negativo";
                    BASE.SETTINGS.disparo.call(this, BASE);

                }
            }


        }

        function fecharModal() {

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);

            if (BASE.statusFeed == "liberado") {
                if (BASE.SETTINGS.destravarTela && !BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                } else if (BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                    // window.nav.avancarTela();
                }

                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

                BASE.status = "complete";
                BASE.SETTINGS.disparo.call(this, BASE);

            } else {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");
                reset();
            }

        }

        function reset() {
            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("arraste")) {
                    $(item).css("opacity", 1);
                }

                if ($(item).attr("alvo")) {
                    item.indiceArraste = 0;
                    item.innerHTML = item.old;
                }
            })

            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

    }

    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  CESTA                                                          //
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    $.fn.cesta = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'drag-item',
            confirmarClass: 'confirmar-btn',
            positivaClass: 'positivo-modal',
            tentativaClass: 'tentativa-modal',
            negativaClass: 'negativo-modal',
            fecharModalClass: 'fechar-modal',
            tentativas: 1,
            destravarTela: false,
            avancarTela: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);


        BASE.$activeItem = null;

        BASE.indiceArraste = 0;
        BASE.indiceAlvo = 0;
        BASE.tentativasUsadas = 0;
        BASE.statusFeed = "inativo";
        BASE.init = true;

        if (BASE.SETTINGS.randomico)
            random();

        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

            if (BASE.init) {

                var _obj = $(item).parent().parent().clone();
                $(_obj).addClass("cloneItens");
                _obj.prependTo($(item).parent().parent());
                _obj.css("opacity", 0.2);
                _obj.css("position", 'absolute');

                BASE.init = false;
            }

            if ($(item).attr("arraste")) {
                BASE.indiceArraste++;
                $(item).addClass("arraste");
                $(item).addClass("arraste" + $(item).attr("arraste"));
                $(item).attr("indiceArraste", $(item).attr("arraste"));
                item.setAttribute('draggable', 'true');

                $(item).on('dragstart', onDragStart);
                $(item).on('dragend', onDragEnd);

                $(item).parent().on('dragover', onDragOver);
                $(item).parent().on('dragenter', onDragEnter);
                $(item).parent().on('dragleave', onDragLeave);
                $(item).parent().on('drop', onDrop);

            }

            if ($(item).attr("alvo")) {
                BASE.indiceAlvo++;
                item.old = item.innerHTML;
                $(item).addClass("alvo");
                $(item).addClass("alvo" + BASE.indiceAlvo);
                $(item).attr("indiceAlvo", BASE.indiceAlvo);
            }


            $(item).on('dragover', onDragOver);
            $(item).on('dragenter', onDragEnter);
            $(item).on('dragleave', onDragLeave);
            $(item).on('drop', onDrop);



        })


        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).on("click", function () {
            confere();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })



        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("arraste")) {
                    $(item).parent().addClass("randomArraste");
                }
            })


            var cards = $(BASE.$container).find('.randomArraste');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }


        ///////////////////////////////////////////
        //      DRAG DROP                        //
        ///////////////////////////////////////////


        function onDragStart(event) {

            BASE.$activeItem = this;

            event.originalEvent.dataTransfer.effectAllowed = 'move';
            event.originalEvent.dataTransfer.setData('text/html', this.innerHTML);


            BASE.current = {
                "drag": this,
                "drop": null
            };
            BASE.status = "drag";
            BASE.SETTINGS.disparo.call(this, BASE);



        };

        function onDragEnd(event) {

        };

        function onDragEnter(event) {

        };

        function onDragLeave(event) {

        };

        function onDragOver(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            event.originalEvent.dataTransfer.dropEffect = 'move';

            BASE.current = {
                "drag": this,
                "drop": null
            };
            BASE.status = "over";
            BASE.SETTINGS.disparo.call(this, BASE);

            return false;
        };

        function onDrop(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }

            var dragThis = BASE.$activeItem;
            var dropThis = this;


            if ($(dropThis).attr("alvo")) {

                $(dragThis).parent().attr("a" + $(dragThis).attr("indiceArraste"), "0");

                //console.log($(dragThis).parent())

                if (!dragThis.oldParent)
                    dragThis.oldParent = $(dragThis).parent();

                $(dropThis).append(dragThis);

                $(dropThis).attr("a" + $(dragThis).attr("indiceArraste"), "1");

            } else {

                $(dragThis).parent().attr("a" + $(dragThis).attr("indiceArraste"), "0");
                $(dragThis.oldParent).append(dragThis);
            }


            BASE.current = {
                "drag": dragThis,
                "drop": dropThis
            };
            BASE.status = "drop";
            BASE.SETTINGS.disparo.call(this, BASE);

            statusConfirmar();

            return false;
        };

        function statusConfirmar() {
            var _alvoMudado = 0;



            $(BASE.$container).find('.alvo').each(function (indice, item) {

                _alvoMudado += $(item).find('.arraste').length;

            })


            if (_alvoMudado == BASE.indiceArraste) {
                ativarConfirmar();
            } else {
                desativarConfirmar();
            }
        }

        function ativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "block");
        }

        function desativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

        function confere() {

            var _confereArray = [];
            var _statusConfere = true;

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("alvo")) {
                    var _alvo = $(item).attr("alvo");
                    var _alvoArray = _alvo.split("|");

                    for (var i = 0; i < _alvoArray.length; i++) {

                        if ($(item).attr("a" + _alvoArray[i]) != "1")
                            _statusConfere = false;
                    }
                }
            });

            feed(_statusConfere);

        }


        function feed(_status) {

            //GAMBI -firefox
            $(".modalFeed .bcg").css("position", "fixed");
            $(".modalFeed .bcg").css("top", "50%");
            $(".modalFeed .bcg").css("left", "50%");
            $(".modalFeed .bcg").css("width", $(window).width());
            $(".modalFeed .bcg").css("height", $(window).height());
            $(".modalFeed .bcg").css("margin-top", $(window).height() / 2 * -1);
            $(".modalFeed .bcg").css("margin-left", $(window).width() / 2 * -1);
            //GAMBI -firefox

            //Positivo
            if (_status) {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "block");
                BASE.statusFeed = "liberado";

                BASE.status = "positivo";
                BASE.SETTINGS.disparo.call(this, BASE);


            } else {
                BASE.tentativasUsadas++;

                if (BASE.tentativasUsadas < BASE.SETTINGS.tentativas) {
                    $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "block");

                    BASE.status = "tentativa";
                    BASE.SETTINGS.disparo.call(this, BASE);

                } else {
                    $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "block");
                    BASE.statusFeed = "liberado";

                    BASE.status = "negativo";
                    BASE.SETTINGS.disparo.call(this, BASE);

                }
            }


        }

        function fecharModal() {

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);

            if (BASE.statusFeed == "liberado") {
                if (BASE.SETTINGS.destravarTela && !BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                } else if (BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                    //// window.nav.avancarTela();
                }

                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

                BASE.status = "complete";
                BASE.SETTINGS.disparo.call(this, BASE);

            } else {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");
                reset();
            }

        }


        function reset() {
            BASE.$activeItem = [];
            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("arraste")) {
                    $(item.oldParent).append(item);
                    $(item).on('dragstart', onDragStart);
                    $(item).on('dragend', onDragEnd);
                }


                if ($(item).attr("alvo")) {

                    $(item).html("");

                    for (var i = 1; i <= BASE.indiceArraste; i++) {
                        $(item).attr("a" + i, "0")
                    }

                }
            })

            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }
    }


    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  ordem                                                          //
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    $.fn.ordem = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'drag-item',
            confirmarClass: 'confirmar-btn',
            positivaClass: 'positivo-modal',
            tentativaClass: 'tentativa-modal',
            negativaClass: 'negativo-modal',
            fecharModalClass: 'fechar-modal',
            tentativas: 1,
            destravarTela: false,
            avancarTela: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);


        BASE.$activeItem = null;

        BASE.indiceOrdem = 0;
        BASE.tentativasUsadas = 0;
        BASE.statusFeed = "inativo";

        if (BASE.SETTINGS.randomico)
            random();



        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

            item.setAttribute('draggable', 'true');

            if ($(item).attr("ordem")) {
                BASE.indiceOrdem++;
                $(item).addClass("ordem");
                $(item).addClass("ordem" + BASE.indiceOrdem);
                $(item).attr("indiceordem", BASE.indiceOrdem);
                $(item).on('dragstart', onDragStart);
                $(item).on('dragend', onDragEnd);
                $(item).on('dragover', onDragOver);
                $(item).on('dragenter', onDragEnter);
                $(item).on('dragleave', onDragLeave);
                $(item).on('drop', onDrop);
            }

        })


        /*$(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");*/
        $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).on("click", function () {
            confere();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })



        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {


            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("ordem")) {
                    $(item).addClass("randomOrdem");
                }
            })


            var cards = $(BASE.$container).find('.randomOrdem');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }

        ///////////////////////////////////////////
        //      DRAG DROP                        //
        ///////////////////////////////////////////


        function onDragStart(event) {

            BASE.$activeItem = this;

            event.originalEvent.dataTransfer.effectAllowed = 'move';
            event.originalEvent.dataTransfer.setData('text/html', this.innerHTML);

            BASE.current = {
                "drag": this,
                "drop": null
            };
            BASE.status = "drag";
            BASE.SETTINGS.disparo.call(this, BASE);
        };

        function onDragEnd(event) {

        };

        function onDragEnter(event) {

        };

        function onDragLeave(event) {

        };

        function onDragOver(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            event.originalEvent.dataTransfer.dropEffect = 'move';

            BASE.current = {
                "drag": this,
                "drop": null
            };
            BASE.status = "over";
            BASE.SETTINGS.disparo.call(this, BASE);

            return false;
        };

        function onDrop(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }

            var dragThis = BASE.$activeItem;
            var dropThis = this;
            var dragOrdem = $(dragThis).attr("ordem");
            var dropOrdem = $(dropThis).attr("ordem");


            dragThis.innerHTML = dropThis.innerHTML;
            dropThis.innerHTML = event.originalEvent.dataTransfer.getData('text/html');


            $(dropThis).attr("ordem", dragOrdem);
            $(dragThis).attr("ordem", dropOrdem);

            BASE.current = {
                "drag": dragThis,
                "drop": dropThis
            };
            BASE.status = "drop";
            BASE.SETTINGS.disparo.call(this, BASE);


            return false;
        };

        function statusConfirmar() {
            var _alvoMudado = 0;



            $(BASE.$container).find('.alvo').each(function (indice, item) {

                if (item.innerHTML != item.old)
                    _alvoMudado++;
            })


            if (_alvoMudado == BASE.indiceArraste) {
                ativarConfirmar();
            } else {
                desativarConfirmar();
            }
        }

        function ativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "block");
        }

        function desativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

        function confere() {

            var _confereArray = [];
            var _statusConfere = true;

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("ordem")) {
                    var _ordem = $(item).attr("ordem");
                    var _ordemArray = _ordem.split("|");
                    var _resposta = false;


                    for (var i = 0; i < _ordemArray.length; i++) {

                        if (_ordemArray[i] == $(item).attr("indiceordem"))
                            _resposta = true;
                    }

                    _confereArray.push(_resposta);
                }
            });



            $.each(_confereArray, function (index, value) {
                if (value == false)
                    _statusConfere = false;
            });


            feed(_statusConfere);

        }


        function feed(_status) {

            //GAMBI -firefox
            $(".modalFeed .bcg").css("position", "fixed");
            $(".modalFeed .bcg").css("top", "50%");
            $(".modalFeed .bcg").css("left", "50%");
            $(".modalFeed .bcg").css("width", $(window).width());
            $(".modalFeed .bcg").css("height", $(window).height());
            $(".modalFeed .bcg").css("margin-top", $(window).height() / 2 * -1);
            $(".modalFeed .bcg").css("margin-left", $(window).width() / 2 * -1);
            //GAMBI -firefox

            //Positivo
            if (_status) {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "block");
                BASE.statusFeed = "liberado";

                BASE.status = "positivo";
                BASE.SETTINGS.disparo.call(this, BASE);


            } else {
                BASE.tentativasUsadas++;

                if (BASE.tentativasUsadas < BASE.SETTINGS.tentativas) {
                    $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "block");

                    BASE.status = "tentativa";
                    BASE.SETTINGS.disparo.call(this, BASE);

                } else {
                    $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "block");
                    BASE.statusFeed = "liberado";

                    BASE.status = "negativo";
                    BASE.SETTINGS.disparo.call(this, BASE);

                }
            }


        }

        function fecharModal() {

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);

            if (BASE.statusFeed == "liberado") {
                if (BASE.SETTINGS.destravarTela && !BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                } else if (BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                    //// window.nav.avancarTela();
                }

                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

                BASE.status = "complete";
                BASE.SETTINGS.disparo.call(this, BASE);

            } else {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");
                reset();
            }

        }

        function reset() {
            /*$(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("arraste")) {
                    $(item).css("opacity", 1);
                }

                if ($(item).attr("alvo")) {
                    item.indiceArraste = 0;
                    item.innerHTML = item.old;
                }
            })

            //$(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");*/
        }
    }



    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  multipla                                                      //
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    $.fn.multipla = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'alternativa-item',
            itemAtivoClass: 'alternativaAtiva',
            confirmarClass: 'confirmar-btn',
            positiva1Class: 'positivo1-modal',
            positiva2Class: 'positivo2-modal',
            tentativaClass: 'tentativa-modal',
            negativaClass: 'negativo-modal',
            fecharModalClass: 'fechar-modal',
            nota: 1,
            thor: false,
            tentativas: 1,
            destravarTela: false,
            avancarTela: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);
        BASE.respostasCorretas = 0;
        BASE.tentativasUsadas = 0;
        BASE.tentativa = 0;

        //
        BASE.titulo = $(BASE.$container).find("." + BASE.SETTINGS.tituloClass).text();
        BASE.questionInit = [];


        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).on("click", function () {
            confere();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })


        if (BASE.SETTINGS.randomico)
            random();


        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

            BASE.questionInit.push({
                info: $(item).text(),
                valor: $(item).attr("resposta")
            });

            if ($(item).attr("resposta")) {

                if ($(item).attr("resposta") == "1") {
                    BASE.respostasCorretas++;
                }

                $(item).click(function () {
                    controleQuestion(this);
                })
            }

        })


        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {


            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("resposta")) {
                    $(item).addClass("randomResposta");
                }
            })


            var cards = $(BASE.$container).find('.randomResposta');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }


        ///////////////////////////////////////////
        //      FILTRO DADOS                     //
        ///////////////////////////////////////////


        function controleQuestion(_this) {

            if (BASE.respostasCorretas == 1) {
                $(_this).siblings("." + BASE.SETTINGS.itemClass).attr("ativa", "false");
                $(_this).siblings("." + BASE.SETTINGS.itemClass).removeClass(BASE.SETTINGS.itemAtivoClass);
            }

            var _status = false;
            if ($(_this).hasClass(BASE.SETTINGS.itemAtivoClass)) {
                $(_this).removeClass(BASE.SETTINGS.itemAtivoClass);
                $(_this).attr("ativa", "false");
                _status = false;
            } else {
                $(_this).addClass(BASE.SETTINGS.itemAtivoClass);
                $(_this).attr("ativa", "true");
                _status = true;
            }

            BASE.current = {
                "target": _this,
                "status": _status
            };
            BASE.status = "questao";
            BASE.SETTINGS.disparo.call(this, BASE);


            statusConfirmar()

        }



        function statusConfirmar() {

            var _confereCorretas = 0;
            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("resposta")) {
                    if ($(item).attr("ativa") == "true") {
                        _confereCorretas++;
                    }
                }

            })

            //if (_confereCorretas >= BASE.respostasCorretas) {
            //Gambi
            if (_confereCorretas >= 1) {
                ativarConfirmar();
            } else {
                desativarConfirmar();
            }

        }

        function ativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "block");
        }

        function desativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

        function confere() {

            var _confereArray = [];
            var _statusConfere = true;

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {
                if ($(item).attr("ativa") == "true")
                    BASE.resposta = $(item).attr("resposta");
            });

            BASE.status = "confirmar";
            $("body").trigger('infoGame');
            BASE.SETTINGS.disparo.call(this, BASE);

            //Reset
            //$(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
            var _item = $(BASE.$container).find("." + BASE.SETTINGS.itemClass);
            _item.attr("ativa", "false");
            
            //_item.removeClass(BASE.SETTINGS.itemAtivoClass);

            /*if (BASE.resposta == 0 && !BASE.tentativa && BASE.SETTINGS.tentativas > 1) {
                BASE.tentativa = true;
                var _sub_questaos = BASE.SETTINGS.sub_questaos;
                var titulo2 = BASE.SETTINGS.titulo2;

                $(BASE.$container).find('.' + BASE.SETTINGS.tituloClass).text(titulo2);
                $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                    $(item).css("display", "none");

                    if (indice <= _sub_questaos.length - 1) {
                        $(item).css("display", "block");
                        $(item).text(_sub_questaos[indice].info);
                        $(item).attr("resposta", _sub_questaos[indice].valor);
                    }

                });
            } else {
                BASE.tentativa = false;
                $(BASE.$container).find('.' + BASE.SETTINGS.tituloClass).text(BASE.titulo);
                $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                    $(item).css("display", "block");
                    $(item).text(BASE.questionInit[indice].info);
                    $(item).attr("resposta", BASE.questionInit[indice].valor);

                });


            }*/
            
            //
            //reset();
            
        }


        function feedCustom(_status) {

            if (_status == true) //  positivo
            {
                BASE.status = "positivo";
                course.gameStatus = "positivo1";
            } else {
                BASE.status = "negativo";
                course.gameStatus = "negativo";
            }

            course.exercicioAtivo = true;
            $("body").trigger('infoGame');
            BASE.SETTINGS.disparo.call(this, BASE);

        }

        function feed(_status) {

            //GAMBI -firefox
            $(".modalFeed .bcg").css("position", "fixed");
            $(".modalFeed .bcg").css("top", "50%");
            $(".modalFeed .bcg").css("left", "50%");
            $(".modalFeed .bcg").css("width", $(window).width());
            $(".modalFeed .bcg").css("height", $(window).height());
            $(".modalFeed .bcg").css("margin-top", $(window).height() / 2 * -1);
            $(".modalFeed .bcg").css("margin-left", $(window).width() / 2 * -1);
            //GAMBI -firefox


            //Positivo
            if (_status == "1") {


                $(BASE.$container).find('.' + BASE.SETTINGS.positiva1Class).css("display", "block");
                BASE.statusFeed = "liberado";

                BASE.status = "positivo1";
                BASE.SETTINGS.disparo.call(this, BASE);
                var _nota1 = Number(course.scorm_get_suspendData("nota1"));
                var _nota2 = Number(course.scorm_get_suspendData("nota2"));


                if (BASE.SETTINGS.nota == 1) {

                    if (_nota1) {
                        _nota1 += 10;
                        course.scorm_set_suspendData("nota1", _nota1);
                    } else {

                        var _notaInit = 10;

                        if (BASE.SETTINGS.thor)
                            _notaInit = 20;

                        course.scorm_set_suspendData("nota1", _notaInit);
                    }

                } else if (BASE.SETTINGS.nota == 2) {

                    if (_nota2) {
                        _nota2 += 10;
                        course.scorm_set_suspendData("nota2", _nota2);
                    } else {
                        var _notaInit = 10;

                        if (BASE.SETTINGS.thor)
                            _notaInit = 20;

                        course.scorm_set_suspendData("nota2", _notaInit);
                    }

                }

                course.gameStatus = "positivoAtivo1Info";
                $("body").trigger('infoGame');



            } else if (_status == "2") {
                $(BASE.$container).find('.' + BASE.SETTINGS.positiva2Class).css("display", "block");
                BASE.statusFeed = "liberado";

                BASE.status = "positivo2";
                BASE.SETTINGS.disparo.call(this, BASE);

                var _nota1 = Number(course.scorm_get_suspendData("nota1"));
                var _nota2 = Number(course.scorm_get_suspendData("nota2"));


                if (BASE.SETTINGS.nota == 1) {

                    if (_nota1) {
                        _nota1 += 5;
                        course.scorm_set_suspendData("nota1", _nota1);
                    } else {
                        course.scorm_set_suspendData("nota1", 5);
                    }

                } else if (BASE.SETTINGS.nota == 2) {

                    if (_nota2) {

                        _nota2 += 5;
                        course.scorm_set_suspendData("nota2", _nota2);
                    } else {
                        course.scorm_set_suspendData("nota2", 5);
                    }

                }

                course.gameStatus = "positivoAtivo2Info";

                //$("body").trigger('infoGame');


            } else {
                BASE.tentativasUsadas++;

                if (BASE.tentativasUsadas < BASE.SETTINGS.tentativas) {
                    $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "block");

                    BASE.status = "tentativa";
                    BASE.SETTINGS.disparo.call(this, BASE);

                } else {
                    $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "block");
                    BASE.statusFeed = "liberado";

                    BASE.status = "negativo";
                    BASE.SETTINGS.disparo.call(this, BASE);

                }
            }


        }

        function fecharModal() {

            reset();

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);



        }


        function reset() {
            $(BASE.$container).find('.' + BASE.SETTINGS.positiva1Class).css("display", "none");
            $(BASE.$container).find('.' + BASE.SETTINGS.positiva2Class).css("display", "none");
            $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");
            $("." + BASE.SETTINGS.itemClass).attr("ativa", "false");
            $("." + BASE.SETTINGS.itemClass).removeClass(BASE.SETTINGS.itemAtivoClass);
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }
    }


    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  multipla  Custom                                                     
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    $.fn.multiplaCustom = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'alternativa-item',
            itemAtivoClass: 'alternativaAtiva',
            subTitulo: '',
            confirmarClass: 'confirmar-btn',
            positiva1Class: 'positivo1-modal',
            positiva2Class: 'positivo2-modal',
            tentativaClass: 'tentativa-modal',
            negativaClass: 'negativo-modal',
            fecharModalClass: 'fechar-modal',
            nota: 1,
            thor: false,
            tentativas: 1,
            destravarTela: false,
            avancarTela: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);
        BASE.respostasCorretas = 0;
        BASE.tentativasUsadas = 0;
        BASE.tentativa = 0;


        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).attr("selecionador", "true");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).on("click", function () {
            confere();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })


        if (BASE.SETTINGS.randomico)
            random();


        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

            if ($(item).attr("resposta")) {

                if ($(item).attr("resposta") == "1") {
                    BASE.respostasCorretas++;
                }

                $(item).click(function () {

                    if ($(this).attr("selecionador") == "true") {
                        controleQuestion(this);
                    }

                })
            }

        })


        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {


            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("resposta")) {
                    $(item).addClass("randomResposta");
                }
            })


            var cards = $(BASE.$container).find('.randomResposta');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }


        ///////////////////////////////////////////
        //      FILTRO DADOS                     //
        ///////////////////////////////////////////


        function controleQuestion(_this) {

            if (BASE.respostasCorretas == 1) {
                $(_this).siblings("." + BASE.SETTINGS.itemClass).attr("ativa", "false");
                $(_this).siblings("." + BASE.SETTINGS.itemClass)
                    .find("." + BASE.SETTINGS.itemAtivoClass).css("display", "none");
            }

            var _status = false;


            if ($(_this).find("." + BASE.SETTINGS.itemAtivoClass).css("display") == "none") {
                $(_this).find("." + BASE.SETTINGS.itemAtivoClass).css("display", "block");
                $(_this).attr("ativa", "true");
                _status = true;
            } else {
                $(_this).find("." + BASE.SETTINGS.itemAtivoClass).css("display", "none");
                $(_this).attr("ativa", "false");
                _status = false;
            }


            /*
            if ($(_this).hasClass(BASE.SETTINGS.itemAtivoClass)) 
            {
                $(_this).removeClass(BASE.SETTINGS.itemAtivoClass);
                $(_this).attr("ativa", "false");
                _status = false;
            } 
            else 
            {
                $(_this).addClass(BASE.SETTINGS.itemAtivoClass);
                $(_this).attr("ativa", "true");
                _status = true;
            }*/

            BASE.current = {
                "target": _this,
                "status": _status
            };
            BASE.status = "questao";
            BASE.SETTINGS.disparo.call(this, BASE);


            statusConfirmar();

        }



        function statusConfirmar() {

            var _confereCorretas = 0;
            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("resposta")) {
                    if ($(item).attr("ativa") == "true") {
                        _confereCorretas++;
                    }
                }

            })

            if (_confereCorretas >= BASE.respostasCorretas) {
                ativarConfirmar();
            } else {
                desativarConfirmar();
            }


        }

        function ativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "block");
        }

        function desativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

        function confere() {

            var _confereArray = [];
            var _statusConfere = true;

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("ativa") == "true") {

                    feed($(item).attr("resposta"));
                }
            });

            //
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");



        }


        function feed(nota) {

            //GAMBI -firefox
            $(".modalFeed .bcg").css("position", "fixed");
            $(".modalFeed .bcg").css("top", "50%");
            $(".modalFeed .bcg").css("left", "50%");
            $(".modalFeed .bcg").css("width", $(window).width());
            $(".modalFeed .bcg").css("height", $(window).height());
            $(".modalFeed .bcg").css("margin-top", $(window).height() / 2 * -1);
            $(".modalFeed .bcg").css("margin-left", $(window).width() / 2 * -1);
            //GAMBI -firefox

            //reset tentativa
            if (BASE.tentativa == 2)
                BASE.tentativa = 0



            if (BASE.tentativa == 1) /// não juntar com o outro if
            {
                if (BASE.nota == 1) {
                    BASE.tentativa = 0;
                }
            }

            BASE.tentativa += 1;
            BASE.subTitulo = BASE.SETTINGS.subTitulo;
            BASE.status = "confirmado";
            BASE.nota = nota;


            if (BASE.tentativa == 1) /// primeira tentativa
            {
                if (parseInt(nota) == 1) //positivo1
                {
                    course.gameStatus = "positivo1";
                } else if (parseInt(nota) == 2) //positivo2
                {
                    course.gameStatus = "positivo2";
                } else {
                    course.gameStatus = "negativo";
                }
            } else if (BASE.tentativa == 2) /// segunda tentativa
            {
                if (parseInt(nota) == 1) //positivo
                {
                    course.gameStatus = "positivo2";
                } else {
                    course.gameStatus = "negativo";
                }
            }


            course.exercicioAtivo = true;
            $("body").trigger('infoGame');
            BASE.SETTINGS.disparo.call(this, BASE);

        }

        function fecharModal() {

            reset();

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);



        }


        function reset() {
            $(BASE.$container).find('.' + BASE.SETTINGS.positiva1Class).css("display", "none");
            $(BASE.$container).find('.' + BASE.SETTINGS.positiva2Class).css("display", "none");
            $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");
            $("." + BASE.SETTINGS.itemClass).attr("ativa", "false");
            $("." + BASE.SETTINGS.itemClass).removeClass(BASE.SETTINGS.itemAtivoClass);
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }
    }


    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  VF                                                         //
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    $.fn.vf = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'alternativa-item',
            respostaClass: 'resposta',
            verdadeClass: 'verdadeAtivo',
            falsoClass: 'falsoAtivo',
            confirmarClass: 'confirmar-btn',
            positivaClass: 'positivo-modal',
            tentativaClass: 'tentativa-modal',
            negativaClass: 'negativo-modal',
            fecharModalClass: 'fechar-modal',
            tentativas: 1,
            destravarTela: false,
            avancarTela: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);
        BASE.respostasCorretas = 0;
        BASE.tentativasUsadas = 0;


        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
        $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

        $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).on("click", function () {
            confere();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })


        if (BASE.SETTINGS.randomico)
            random();


        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, itemA) {


            $(itemA).find("." + BASE.SETTINGS.respostaClass).each(function (indice, item) {

                if ($(item).attr("status")) {
                    $(item).click(function () {
                        controleQuestion(this);
                    })
                }

            })
        })


        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {


            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                $(item).addClass("randomResposta");

            })


            var cards = $(BASE.$container).find('.randomResposta');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }


        ///////////////////////////////////////////
        //      FILTRO DADOS                     //
        ///////////////////////////////////////////


        function controleQuestion(_this) {

            $(_this).parent().find("." + BASE.SETTINGS.respostaClass).each(function (indice, item) {

                if ($(item).attr("status")) {
                    $(item).removeClass(BASE.SETTINGS.verdadeClass);
                    $(item).removeClass(BASE.SETTINGS.falsoClass);
                }
            })

            var _status = $(_this).attr("status").toUpperCase();
            if (_status == ("v").toUpperCase()) {
                $(_this).addClass(BASE.SETTINGS.verdadeClass);
            } else if (_status == ("f").toUpperCase()) {
                $(_this).addClass(BASE.SETTINGS.falsoClass);
            }

            $(_this).parent().attr("respostaCorreta", _status);

            BASE.current = {
                "target": _this,
                "status": _status
            };
            BASE.status = "questao";
            BASE.SETTINGS.disparo.call(this, BASE);


            statusConfirmar()

        }



        function statusConfirmar() {

            var _statusAtivo = true;

            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, itemA) {

                $(itemA).find("." + BASE.SETTINGS.respostaClass).each(function (indice, item) {

                    if (!$(item).parent().attr("respostaCorreta"))
                        _statusAtivo = false
                })

            })


            if (_statusAtivo) {
                ativarConfirmar();
            }

        }

        function ativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "block");
        }

        function desativarConfirmar() {
            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }

        function confere() {

            var _statusConfere = true;


            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, itemA) {

                $(itemA).find("." + BASE.SETTINGS.respostaClass).each(function (indice, item) {

                    if ($(item).parent().attr("respostaCorreta").toUpperCase() !=
                        $(itemA).attr("resposta").toUpperCase())
                        _statusConfere = false
                })

            })


            feed(_statusConfere);

        }


        function feed(_status) {

            //GAMBI -firefox
            $(".modalFeed .bcg").css("position", "fixed");
            $(".modalFeed .bcg").css("top", "50%");
            $(".modalFeed .bcg").css("left", "50%");
            $(".modalFeed .bcg").css("width", $(window).width());
            $(".modalFeed .bcg").css("height", $(window).height());
            $(".modalFeed .bcg").css("margin-top", $(window).height() / 2 * -1);
            $(".modalFeed .bcg").css("margin-left", $(window).width() / 2 * -1);
            //GAMBI -firefox

            //Positivo
            if (_status) {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "block");
                BASE.statusFeed = "liberado";

                BASE.status = "positivo";
                BASE.SETTINGS.disparo.call(this, BASE);


            } else {
                BASE.tentativasUsadas++;

                if (BASE.tentativasUsadas < BASE.SETTINGS.tentativas) {
                    $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "block");

                    BASE.status = "tentativa";
                    BASE.SETTINGS.disparo.call(this, BASE);

                } else {
                    $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "block");
                    BASE.statusFeed = "liberado";

                    BASE.status = "negativo";
                    BASE.SETTINGS.disparo.call(this, BASE);

                }
            }


        }

        function fecharModal() {

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);

            if (BASE.statusFeed == "liberado") {
                if (BASE.SETTINGS.destravarTela && !BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                } else if (BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                    //// window.nav.avancarTela();
                }

                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");

                BASE.status = "complete";
                BASE.SETTINGS.disparo.call(this, BASE);

            } else {
                $(BASE.$container).find('.' + BASE.SETTINGS.positivaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.tentativaClass).css("display", "none");
                $(BASE.$container).find('.' + BASE.SETTINGS.negativaClass).css("display", "none");
                reset();
            }

        }

        function reset() {

            $(BASE.$container).find("." + BASE.SETTINGS.respostaClass).each(function (indice, item) {

                if ($(item).attr("status")) {
                    $(item).removeClass(BASE.SETTINGS.verdadeClass);
                    $(item).removeClass(BASE.SETTINGS.falsoClass);
                    $(item).parent().removeAttr("respostaCorreta");
                }
            })


            $(BASE.$container).find('.' + BASE.SETTINGS.confirmarClass).css("display", "none");
        }
    }


    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  POPUP                                                          //
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    $.fn.popup = function (options) {

        var BASE = {};

        var settings = $.extend({
            itemClass: 'btnPop',
            itemInativoClass: 'btnPopInativo',
            popClass: 'modalPop',
            fecharModalClass: 'fechar-modal',
            destravarTela: false,
            avancarTela: false,
            sequencial: false,
            randomico: false,
            disparo: undefined
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);
        BASE.sequencia = 1;
        BASE.sequenciaCurrent = 0;
        BASE.btnALL = 0;


        if (BASE.SETTINGS.randomico)
            random();


        $(BASE.$container).find('.' + BASE.SETTINGS.fecharModalClass).on("click", function () {
            fecharModal();
        })

        $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

            BASE.btnALL += 1;

            if (BASE.SETTINGS.sequencial) {
                $(item).attr("sequencia", (indice + 1));

                if (indice != 0)
                    $(item).addClass(BASE.SETTINGS.itemInativoClass);

            }

            $(item).click(function () {


                var _seq = parseInt($(this).attr("sequencia"));
                BASE.sequenciaCurrent = _seq;

                if (BASE.SETTINGS.sequencial) {
                    if (BASE.sequencia >= _seq) {
                        controleQuestion(this);
                    }
                } else {
                    controleQuestion(this);
                }



            })

        })


        ///////////////////////////////////////////
        //      RANDOM                           //
        ///////////////////////////////////////////

        function random() {


            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                $(item).addClass("randomBtnpop");

            })


            var cards = $(BASE.$container).find('.randomBtnpop');

            for (var i = 0; i < cards.length; i++) {
                var target = Math.floor(Math.random() * cards.length - 1) + 1;
                var target2 = Math.floor(Math.random() * cards.length - 1) + 1;
                cards.eq(target).before(cards.eq(target2));
            }
        }


        ///////////////////////////////////////////
        //      FILTRO DADOS                     //
        ///////////////////////////////////////////


        function controleQuestion(_this) {

            $(_this).attr("view", "true");
            var _popup = $(_this).attr("popup");

            $(BASE.$container).find('.' + BASE.SETTINGS.popClass).each(function (indice, item) {

                if ($(item).attr("popup") == _popup) {
                    $(item).css("display", 'block');
                }

            })

            BASE.current = {
                "pop": _this,
                "indice": _popup
            };
            BASE.status = "popup";
            BASE.SETTINGS.disparo.call(this, BASE);

        }


        function fecharModal() {

            $(BASE.$container).find('.' + BASE.SETTINGS.popClass).css("display", "none");

            if (BASE.SETTINGS.sequencial) {
                if (BASE.sequenciaCurrent == BASE.sequencia) {
                    BASE.sequencia += 1;
                    $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                        if ($(item).attr("sequencia") == String(BASE.sequencia)) {
                            $(item).removeClass(BASE.SETTINGS.itemInativoClass);
                        }
                    })
                }
            }

            BASE.status = "fechar";
            BASE.SETTINGS.disparo.call(this, BASE);

            var _view = true;
            $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).each(function (indice, item) {

                if ($(item).attr("view") != "true") {
                    _view = false;
                }
            })

            if (_view) {
                if (BASE.SETTINGS.destravarTela && !BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                } else if (BASE.SETTINGS.avancarTela) {
                    // window.nav.unLockScreen();
                    //// window.nav.avancarTela();
                }

                $(BASE.$container).find('.' + BASE.SETTINGS.itemClass).attr("view", "false");


                BASE.status = "complete";
                BASE.SETTINGS.disparo.call(this, BASE);
            }



        }



    }




    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  POSITION      CSS                                              //
    //posiciona o elemento com base no tamanho real da imagem de fundo COVER //
    ////

    $.fn.positionCSS = function (options) {

        var BASE = {};

        var settings = $.extend({
            box: null,
            img_W: 1920,
            img_H: 1080,
            p_X: 0,
            p_Y: 0, 
            postion: 'center'

        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.THIS_CLASS = $("."+BASE.THIS.attr('class')
                                .split(/[ \n\r\t\f]+/)
                                .join('.'));


        setTimeout(function () {
            boxInit();
            dataInit();
        }, 1000 * 0.2)


        $(window).resize(function () {

            clearTimeout($.data(BASE.THIS_CLASS, 'resizeTimer'));
            $.data(BASE.THIS_CLASS, 'resizeTimer', setTimeout(function () {
                boxInit();
                dataInit();
            }, 200));

        });

        function boxInit() {

            var _w = BASE.SETTINGS.img_W;
            var _h = BASE.SETTINGS.img_H;
            var _screenW = $(window).width();
            var _screenH = $(window).height();
            var $box = BASE.SETTINGS.box;


            if($box){
                var scaleBox = Math.min(
                    _screenW / _w,
                    _screenH / _h
                );
    
                $box.css("width", _w * scaleBox);
                $box.css("height", _h * scaleBox);
    
                $box.css("margin-left", (_w * scaleBox) / 2 * -1);
                $box.css("margin-top", (_h * scaleBox) / 2 * -1);
            }

            if(course.position == 'top'){
                $box.css('top', (_h * scaleBox)/2 );
            }
            else if(course.position == 'center'){
                $box.css('top', '50%');
            }
            else if(course.position == 'bottom'){
                $box.css('bottom', '0');
            }
            else{
                $box.css('top', '50%');
            }

        }


        function dataInit() {

            return BASE.THIS.each(function () {

                sizeInit(this);
                updatePointer(this);

            });
        }

        function sizeInit(_this) {

            if (!$(_this).attr("init")) {

                $(_this).attr("init", "true");
                $(_this).attr("init_W", parseInt($(_this).css("width")));
                $(_this).attr("init_H", parseInt($(_this).css("height")));

            }

        }

        function updatePointer(_this) {

            var pointer = $(_this);

            var image = {
                width: BASE.SETTINGS.img_W,
                height: BASE.SETTINGS.img_H
            };
            var target = {
                x: parseInt(pointer.attr("px")),
                y: parseInt(pointer.attr("py"))
            };

            var $box = BASE.SETTINGS.box;
            if($box){
                var windowWidth = $box.width();
                var windowHeight = $box.height();
            }
            else{
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();
            }


            // Get largest dimension increase
            var xScale = windowWidth / image.width;
            var yScale = windowHeight / image.height;
            var scale;
            var yOffset = 0;
            var xOffset = 0;

            if (xScale > yScale) {
                // The image fits perfectly in x axis, stretched in y
                scale = xScale;
                yOffset = (windowHeight - (image.height * scale)) / 2;
            } else {
                // The image fits perfectly in y axis, stretched in x
                scale = yScale;
                xOffset = (windowWidth - (image.width * scale)) / 2;
            }


            var _x = (target.x) * scale + xOffset;
            var _y = (target.y) * scale + yOffset;

            var prop = true;           
            if( pointer.children().length >=1 ||  pointer.text().length > 0 || pointer.css("background-size") == "auto" ) 
                prop = false;

            ///PROP
            if (prop) {

                pointer.css('top', _y);
                pointer.css('left', _x);

                var _wInit = pointer.attr("init_W");
                var _hInit = pointer.attr("init_H");

                pointer.css('width', _wInit * scale);
                pointer.css('height', _hInit * scale);
            } else {

                pointer.css({
                    '-moz-transform-origin': "0 0",
                    'transform-origin': "0 0",
                    '-ms-transform-origin': "0 0",
                    '-webkit-transform-origin': "0 0"
                });
                
                pointer.css({
                    translate: [_x, _y ]
                });
                
                
                pointer.css({
                    scale: scale 
                });
                
                if( pointer.attr("trans") )
                {
                     var _type = pointer.attr("trans");
                     motion(_type, pointer, _x, _y);
                }
            }

        }

        function motion(_type, pointer, _x, _y) {
            
             var _w = String(pointer.width());
             var _h = String(pointer.height());
            
            
            if (_type == "fadeIn") {
                pointer.css({
                    opacity: 0
                });
                pointer.transition({
                    opacity: 1
                }, 1000 * 1);
                
            } else if (_type == "fadeInRight") {
                
                pointer.css({
                    x: _w,
                    opacity: 0
                })

                pointer.transition({
                    opacity: 1,
                    x: _x
                }, 1000 * 1);

            } else if (_type == "fadeInleft") {
                
                pointer.css({
                    x: _w * -1,
                    opacity: 0
                })

                pointer.transition({
                    opacity: 1,
                    x: _x
                }, 1000 * 1);

            } else if (_type == "fadeInTop") {

                pointer.css({
                    y: _h,
                    opacity: 0
                })

                pointer.transition({
                    opacity: 1,
                    y: _y
                }, 1000 * 1);

            } else if (_type == "fadeInBottom") {

                pointer.css({
                    y: _h * -1,
                    opacity: 0
                })

                pointer.transition({
                    opacity: 1,
                    y: _y
                }, 1000 * 1);

            } 
        }


    }

    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    //  ANIMAR                                                         //
    /////////////////////////////////////////////////////////////////////

    $.fn.motion = function (options) {

        var BASE = {};

        var settings = $.extend({
            tempo: 1,
            delay: 0,
            motion: "alpha"
        }, options);

        BASE.SETTINGS = settings;
        BASE.THIS = this;
        BASE.$container = document.querySelector(BASE.THIS.selector);

        dataInit();

        function dataInit() {
            return BASE.THIS.each(function () {
                acao(this);
            });
        }

        function acao(_this) {

            var pointer = $(_this);
            var _motion = BASE.SETTINGS.motion;
            var _tempo = BASE.SETTINGS.tempo;
            var _delay = BASE.SETTINGS.delay;

            if (pointer.attr("motion"))
                _motion = pointer.attr("motion")

            if (pointer.attr("tempo"))
                _tempo = pointer.attr("tempo")

            if (pointer.attr("delay"))
                _delay = pointer.attr("delay")


            controleAcoes(pointer, _motion, _tempo, _delay);

        }

        function controleAcoes(pointer, _motion, _tempo, _delay) {


            //
            pointer.css("top", 0);
            pointer.css("left", 0);

            if (_motion == "alpha")
                alphaMotion(pointer, _tempo, _delay);

            if (_motion == "top")
                topMotion(pointer, _tempo, _delay);

            if (_motion == "bottom")
                bottomMotion(pointer, _tempo, _delay);

            if (_motion == "right")
                rightMotion(pointer, _tempo, _delay);

            if (_motion == "left")
                leftMotion(pointer, _tempo, _delay);

            if (_motion == "scale0")
                scale0Motion(pointer, _tempo, _delay);

            if (_motion == "scale1")
                scale1Motion(pointer, _tempo, _delay);


        }


        function alphaMotion(pointer, _tempo, _delay) {


            pointer.css("opacity", 0);
            pointer.delay(1000 * _delay).animate({
                opacity: 1
            }, 1000 * _tempo, function () {
                // Animation complete.
            });
        }

        function topMotion(pointer, _tempo, _delay) {


            var _h = String(pointer.height());

            pointer.css({
                y: _h
            })
            pointer.transition({
                y: 0,
                delay: 1000 * _delay
            }, 1000 * _tempo, function () {


            });
        }

        function bottomMotion(pointer, _tempo, _delay) {

            var _h = String(pointer.height());

            pointer.css({
                y: _h * -1
            })
            pointer.transition({
                y: 0,
                delay: 1000 * _delay
            }, 1000 * _tempo, function () {


            });

        }

        function rightMotion(pointer, _tempo, _delay) {

            var _w = String(pointer.width());

            pointer.css({
                x: _w
            })
            pointer.transition({
                x: 0,
                delay: 1000 * _delay
            }, 1000 * _tempo, function () {


            });

        }

        function leftMotion(pointer, _tempo, _delay) {

            var _w = String(pointer.width());

            pointer.css({
                x: _w * -1
            })
            pointer.transition({
                x: 0,
                delay: 1000 * _delay
            }, 1000 * _tempo, function () {


            });

        }

        function scale1Motion(pointer, _tempo, _delay) {

            pointer.css({
                scale: [0, 0]
            })
            pointer.transition({
                scale: [1, 1],
                delay: 1000 * _delay
            }, 1000 * _tempo, function () {


            });

        }

        function scale0Motion(pointer, _tempo, _delay) {


            pointer.css({
                scale: [1, 1]
            })
            pointer.transition({
                scale: [0, 0],
                delay: 1000 * _delay
            }, 1000 * _tempo, function () {


            });


        }

    }


}(jQuery));
