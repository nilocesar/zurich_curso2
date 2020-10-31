/* ===========================================================
     SCORM JQUERY - Nilo César  - 28/01/2015
                    atualizado - 22/07/2015  
                    atualizado - 23/05/2016  
                    atualizado - 24/10/2016 - componente de avaliação
                    atualizado - 20/03/2017 - ADD de fake local sotore
/* ===========================================================

// Método START do scorm
$("body").scorm_start();

// Método COMPLETE do scorm
$("body").scorm_complete();

// Método que finaliza a api do scorm
$(window).unload(
    function () {
        $('body').scorm_quit();
    }
);

// Método que ENVIA um valor para o SUSPEND DATA - SET
$('body').scorm_set_suspendData("informacao", "loremIpsun")

// Método que BUSCA um valor para do SUSPEND DATA - GET
$('body').scorm_get_suspendData( "informacao" )

// Método que ENVIA um valor para o LESSON LOCATION - SET
$('body').scorm_set_lessonLocation( "tela" , "tela1" );

// Método que BUSCA um valor para do LESSON LOCATION - GET
$('body').scorm_get_lessonLocation("tela");

// Como cada treinamento tem um formato de bookmark ou um controle de tela diferenciado
as função a seguir devem ser CUSTOMIZADAS conforme o curso.
BASE.changePage
BASE.verifyStatus

/* ===========================================================
   
/* =========================================================== */


// Fake localStorage implementation. 
// Mimics localStorage, including events. 
// It will work just like localStorage, except for the persistant storage part. 

var fakeLocalStorage = function () {
    var fakeLocalStorage = {};
    var storage;

    // If Storage exists we modify it to write to our fakeLocalStorage object instead. 
    // If Storage does not exist we create an empty object. 
    if (window.Storage && window.localStorage) {
        storage = window.Storage.prototype;
    } else {
        // We don't bother implementing a fake Storage object
        window.localStorage = {};
        storage = window.localStorage;
    }

    // For older IE
    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }

    var dispatchStorageEvent = function (key, newValue) {
        var oldValue = (key == null) ? null : storage.getItem(key); // `==` to match both null and undefined
        var url = location.href.substr(location.origin.length);
        var storageEvent = document.createEvent('StorageEvent'); // For IE, http://stackoverflow.com/a/25514935/1214183

        storageEvent.initStorageEvent('storage', false, false, key, oldValue, newValue, url, null);
        window.dispatchEvent(storageEvent);
    };

    storage.key = function (i) {
        var key = Object.keys(fakeLocalStorage)[i];
        return typeof key === 'string' ? key : null;
    };

    storage.getItem = function (key) {
        return typeof fakeLocalStorage[key] === 'string' ? fakeLocalStorage[key] : null;
    };

    storage.setItem = function (key, value) {
        dispatchStorageEvent(key, value);
        fakeLocalStorage[key] = String(value);
    };

    storage.removeItem = function (key) {
        dispatchStorageEvent(key, null);
        delete fakeLocalStorage[key];
    };

    storage.clear = function () {
        dispatchStorageEvent(null, null);
        fakeLocalStorage = {};
    };
};


var pipwerks = {}; //pipwerks 'namespace' helps ensure no conflicts with possible other "SCORM" variables
pipwerks.UTILS = {}; //For holding UTILS functions
pipwerks.debug = {
    isActive: true
}; //Enable (true) or disable (false) for debug mode

pipwerks.SCORM = { //Define the SCORM object
    version: null, //Store SCORM version.
    handleCompletionStatus: true, //Whether or not the wrapper should automatically handle the initial completion status
    handleExitMode: true, //Whether or not the wrapper should automatically handle the exit mode
    API: {
        handle: null,
        isFound: false
    }, //Create API child object
    connection: {
        isActive: false
    }, //Create connection child object
    data: {
        completionStatus: null,
        exitStatus: null
    }, //Create data child object
    debug: {} //Create debug child object
};



/* --------------------------------------------------------------------------------
   pipwerks.SCORM.isAvailable
   A simple function to allow Flash ExternalInterface to confirm
   presence of JS wrapper before attempting any LMS communication.

   Parameters: none
   Returns:    Boolean (true)
----------------------------------------------------------------------------------- */

pipwerks.SCORM.isAvailable = function () {
    return true;
};



// ------------------------------------------------------------------------- //
// --- SCORM.API functions ------------------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
   pipwerks.SCORM.API.find(window)
   Looks for an object named API in parent and opener windows

   Parameters: window (the browser window object).
   Returns:    Object if API is found, null if no API found
---------------------------------------------------------------------------- */

pipwerks.SCORM.API.find = function (win) {

    var API = null,
        findAttempts = 0,
        findAttemptLimit = 500,
        traceMsgPrefix = "SCORM.API.find",
        trace = pipwerks.UTILS.trace,
        scorm = pipwerks.SCORM;

    while ((!win.API && !win.API_1484_11) &&
        (win.parent) &&
        (win.parent != win) &&
        (findAttempts <= findAttemptLimit)) {

        findAttempts++;
        win = win.parent;

    }

    //If SCORM version is specified by user, look for specific API
    if (scorm.version) {

        switch (scorm.version) {

            case "2004":

                if (win.API_1484_11) {

                    API = win.API_1484_11;

                } else {

                    trace(traceMsgPrefix + ": SCORM version 2004 was specified by user, but API_1484_11 cannot be found.");

                }

                break;

            case "1.2":

                if (win.API) {

                    API = win.API;

                } else {

                    trace(traceMsgPrefix + ": SCORM version 1.2 was specified by user, but API cannot be found.");

                }

                break;

        }

    } else { //If SCORM version not specified by user, look for APIs

        if (win.API_1484_11) { //SCORM 2004-specific API.

            scorm.version = "2004"; //Set version
            API = win.API_1484_11;

        } else if (win.API) { //SCORM 1.2-specific API

            scorm.version = "1.2"; //Set version
            API = win.API;

        }

    }

    if (API) {

        trace(traceMsgPrefix + ": API found. Version: " + scorm.version);
        trace("API: " + API);

    } else {

        trace(traceMsgPrefix + ": Error finding API. \nFind attempts: " + findAttempts + ". \nFind attempt limit: " + findAttemptLimit);

    }

    return API;

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.API.get()
   Looks for an object named API, first in the current window's frame
   hierarchy and then, if necessary, in the current window's opener window
   hierarchy (if there is an opener window).

   Parameters:  None.
   Returns:     Object if API found, null if no API found
---------------------------------------------------------------------------- */

pipwerks.SCORM.API.get = function () {

    var API = null,
        win = window,
        scorm = pipwerks.SCORM,
        find = scorm.API.find,
        trace = pipwerks.UTILS.trace;

    if (win.parent && win.parent != win) {
        API = find(win.parent);
    }

    if (!API && win.top.opener) {
        API = find(win.top.opener);
    }

    //Special handling for Plateau
    //Thanks to Joseph Venditti for the patch
    if (!API && win.top.opener && win.top.opener.document) {
        API = find(win.top.opener.document);
    }

    if (API) {
        scorm.API.isFound = true;
    } else {
        trace("API.get failed: Can't find the API!");
    }

    return API;

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.API.getHandle()
   Returns the handle to API object if it was previously set

   Parameters:  None.
   Returns:     Object (the pipwerks.SCORM.API.handle variable).
---------------------------------------------------------------------------- */

pipwerks.SCORM.API.getHandle = function () {

    var API = pipwerks.SCORM.API;

    if (!API.handle && !API.isFound) {

        API.handle = API.get();

    }

    return API.handle;

};



// ------------------------------------------------------------------------- //
// --- pipwerks.SCORM.connection functions --------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
   pipwerks.SCORM.connection.initialize()
   Tells the LMS to initiate the communication session.

   Parameters:  None
   Returns:     Boolean
---------------------------------------------------------------------------- */

pipwerks.SCORM.connection.initialize = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        completionStatus = scorm.data.completionStatus,
        trace = pipwerks.UTILS.trace,
        makeBoolean = pipwerks.UTILS.StringToBoolean,
        debug = scorm.debug,
        traceMsgPrefix = "SCORM.connection.initialize ";

    trace("connection.initialize called.");

    if (!scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            switch (scorm.version) {
                case "1.2":
                    success = makeBoolean(API.LMSInitialize(""));
                    break;
                case "2004":
                    success = makeBoolean(API.Initialize(""));
                    break;
            }

            if (success) {

                //Double-check that connection is active and working before returning 'true' boolean
                errorCode = debug.getCode();

                if (errorCode !== null && errorCode === 0) {

                    scorm.connection.isActive = true;

                    if (scorm.handleCompletionStatus) {

                        //Automatically set new launches to incomplete
                        completionStatus = scorm.status("get");

                        if (completionStatus) {

                            switch (completionStatus) {

                                //Both SCORM 1.2 and 2004
                                case "not attempted":
                                    scorm.status("set", "incomplete");
                                    break;

                                    //SCORM 2004 only
                                case "unknown":
                                    scorm.status("set", "incomplete");
                                    break;

                                    //Additional options, presented here in case you'd like to use them
                                    //case "completed"  : break;
                                    //case "incomplete" : break;
                                    //case "passed"     : break;    //SCORM 1.2 only
                                    //case "failed"     : break;    //SCORM 1.2 only
                                    //case "browsed"    : break;    //SCORM 1.2 only

                            }

                        }

                    }

                } else {

                    success = false;
                    trace(traceMsgPrefix + "failed. \nError code: " + errorCode + " \nError info: " + debug.getInfo(errorCode));

                }

            } else {

                errorCode = debug.getCode();

                if (errorCode !== null && errorCode !== 0) {

                    trace(traceMsgPrefix + "failed. \nError code: " + errorCode + " \nError info: " + debug.getInfo(errorCode));

                } else {

                    trace(traceMsgPrefix + "failed: No response from server.");

                }
            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "aborted: Connection already active.");

    }

    return success;

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.connection.terminate()
   Tells the LMS to terminate the communication session

   Parameters:  None
   Returns:     Boolean
---------------------------------------------------------------------------- */

pipwerks.SCORM.connection.terminate = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        exitStatus = scorm.data.exitStatus,
        completionStatus = scorm.data.completionStatus,
        trace = pipwerks.UTILS.trace,
        makeBoolean = pipwerks.UTILS.StringToBoolean,
        debug = scorm.debug,
        traceMsgPrefix = "SCORM.connection.terminate ";


    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            if (scorm.handleExitMode && !exitStatus) {

                if (completionStatus !== "completed" && completionStatus !== "passed") {

                    switch (scorm.version) {
                        case "1.2":
                            success = scorm.set("cmi.core.exit", "suspend");
                            break;
                        case "2004":
                            success = scorm.set("cmi.exit", "suspend");
                            break;
                    }

                } else {

                    switch (scorm.version) {
                        case "1.2":
                            success = scorm.set("cmi.core.exit", "logout");
                            break;
                        case "2004":
                            success = scorm.set("cmi.exit", "normal");
                            break;
                    }

                }

            }

            //Ensure we persist the data
            success = scorm.save();

            if (success) {

                switch (scorm.version) {
                    case "1.2":
                        success = makeBoolean(API.LMSFinish(""));
                        break;
                    case "2004":
                        success = makeBoolean(API.Terminate(""));
                        break;
                }

                if (success) {

                    scorm.connection.isActive = false;

                } else {

                    errorCode = debug.getCode();
                    trace(traceMsgPrefix + "failed. \nError code: " + errorCode + " \nError info: " + debug.getInfo(errorCode));

                }

            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "aborted: Connection already terminated.");

    }

    return success;

};



// ------------------------------------------------------------------------- //
// --- pipwerks.SCORM.data functions --------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
   pipwerks.SCORM.data.get(parameter)
   Requests information from the LMS.

   Parameter: parameter (string, name of the SCORM data model element)
   Returns:   string (the value of the specified data model element)
---------------------------------------------------------------------------- */

pipwerks.SCORM.data.get = function (parameter) {

    var value = null,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        debug = scorm.debug,
        traceMsgPrefix = "SCORM.data.get(" + parameter + ") ";

    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            switch (scorm.version) {
                case "1.2":
                    value = API.LMSGetValue(parameter);
                    break;
                case "2004":
                    value = API.GetValue(parameter);
                    break;
            }

            errorCode = debug.getCode();

            //GetValue returns an empty string on errors
            //If value is an empty string, check errorCode to make sure there are no errors
            if (value !== "" || errorCode === 0) {

                //GetValue is successful.  
                //If parameter is lesson_status/completion_status or exit status, let's
                //grab the value and cache it so we can check it during connection.terminate()
                switch (parameter) {

                    case "cmi.core.lesson_status":
                    case "cmi.completion_status":
                        scorm.data.completionStatus = value;
                        break;

                    case "cmi.core.exit":
                    case "cmi.exit":
                        scorm.data.exitStatus = value;
                        break;

                }

            } else {

                trace(traceMsgPrefix + "failed. \nError code: " + errorCode + "\nError info: " + debug.getInfo(errorCode));

            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "failed: API connection is inactive.");

    }

    trace(traceMsgPrefix + " value: " + value);

    return String(value);

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.data.set()
   Tells the LMS to assign the value to the named data model element.
   Also stores the SCO's completion status in a variable named
   pipwerks.SCORM.data.completionStatus. This variable is checked whenever
   pipwerks.SCORM.connection.terminate() is invoked.

   Parameters: parameter (string). The data model element
               value (string). The value for the data model element
   Returns:    Boolean
---------------------------------------------------------------------------- */

pipwerks.SCORM.data.set = function (parameter, value) {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        makeBoolean = pipwerks.UTILS.StringToBoolean,
        debug = scorm.debug,
        traceMsgPrefix = "SCORM.data.set(" + parameter + ") ";


    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            switch (scorm.version) {
                case "1.2":
                    success = makeBoolean(API.LMSSetValue(parameter, value));
                    break;
                case "2004":
                    success = makeBoolean(API.SetValue(parameter, value));
                    break;
            }

            if (success) {

                if (parameter === "cmi.core.lesson_status" || parameter === "cmi.completion_status") {

                    scorm.data.completionStatus = value;

                }

            } else {

                trace(traceMsgPrefix + "failed. \nError code: " + errorCode + ". \nError info: " + debug.getInfo(errorCode));

            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "failed: API connection is inactive.");

    }

    return success;

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.data.save()
   Instructs the LMS to persist all data to this point in the session

   Parameters: None
   Returns:    Boolean
---------------------------------------------------------------------------- */

pipwerks.SCORM.data.save = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        makeBoolean = pipwerks.UTILS.StringToBoolean,
        traceMsgPrefix = "SCORM.data.save failed";


    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle();

        if (API) {

            switch (scorm.version) {
                case "1.2":
                    success = makeBoolean(API.LMSCommit(""));
                    break;
                case "2004":
                    success = makeBoolean(API.Commit(""));
                    break;
            }

        } else {

            trace(traceMsgPrefix + ": API is null.");

        }

    } else {

        trace(traceMsgPrefix + ": API connection is inactive.");

    }

    return success;

};


pipwerks.SCORM.status = function (action, status) {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        traceMsgPrefix = "SCORM.getStatus failed",
        cmi = "";

    if (action !== null) {

        switch (scorm.version) {
            case "1.2":
                cmi = "cmi.core.lesson_status";
                break;
            case "2004":
                cmi = "cmi.completion_status";
                break;
        }

        switch (action) {

            case "get":
                success = scorm.data.get(cmi);
                break;

            case "set":
                if (status !== null) {

                    success = scorm.data.set(cmi, status);

                } else {

                    success = false;
                    trace(traceMsgPrefix + ": status was not specified.");

                }

                break;

            default:
                success = false;
                trace(traceMsgPrefix + ": no valid action was specified.");

        }

    } else {

        trace(traceMsgPrefix + ": action was not specified.");

    }

    return success;

};


// ------------------------------------------------------------------------- //
// --- pipwerks.SCORM.debug functions -------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
   pipwerks.SCORM.debug.getCode
   Requests the error code for the current error state from the LMS

   Parameters: None
   Returns:    Integer (the last error code).
---------------------------------------------------------------------------- */

pipwerks.SCORM.debug.getCode = function () {

    var scorm = pipwerks.SCORM,
        API = scorm.API.getHandle(),
        trace = pipwerks.UTILS.trace,
        code = 0;

    if (API) {

        switch (scorm.version) {
            case "1.2":
                code = parseInt(API.LMSGetLastError(), 10);
                break;
            case "2004":
                code = parseInt(API.GetLastError(), 10);
                break;
        }

    } else {

        trace("SCORM.debug.getCode failed: API is null.");

    }

    return code;

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.debug.getInfo()
   "Used by a SCO to request the textual description for the error code
   specified by the value of [errorCode]."

   Parameters: errorCode (integer).
   Returns:    String.
----------------------------------------------------------------------------- */

pipwerks.SCORM.debug.getInfo = function (errorCode) {

    var scorm = pipwerks.SCORM,
        API = scorm.API.getHandle(),
        trace = pipwerks.UTILS.trace,
        result = "";


    if (API) {

        switch (scorm.version) {
            case "1.2":
                result = API.LMSGetErrorString(errorCode.toString());
                break;
            case "2004":
                result = API.GetErrorString(errorCode.toString());
                break;
        }

    } else {

        trace("SCORM.debug.getInfo failed: API is null.");

    }

    return String(result);

};


/* -------------------------------------------------------------------------
   pipwerks.SCORM.debug.getDiagnosticInfo
   "Exists for LMS specific use. It allows the LMS to define additional
   diagnostic information through the API Instance."

   Parameters: errorCode (integer).
   Returns:    String (Additional diagnostic information about the given error code).
---------------------------------------------------------------------------- */

pipwerks.SCORM.debug.getDiagnosticInfo = function (errorCode) {

    var scorm = pipwerks.SCORM,
        API = scorm.API.getHandle(),
        trace = pipwerks.UTILS.trace,
        result = "";

    if (API) {

        switch (scorm.version) {
            case "1.2":
                result = API.LMSGetDiagnostic(errorCode);
                break;
            case "2004":
                result = API.GetDiagnostic(errorCode);
                break;
        }

    } else {

        trace("SCORM.debug.getDiagnosticInfo failed: API is null.");

    }

    return String(result);

};


// ------------------------------------------------------------------------- //
// --- Shortcuts! ---------------------------------------------------------- //
// ------------------------------------------------------------------------- //

// Because nobody likes typing verbose code.

pipwerks.SCORM.init = pipwerks.SCORM.connection.initialize;
pipwerks.SCORM.get = pipwerks.SCORM.data.get;
pipwerks.SCORM.set = pipwerks.SCORM.data.set;
pipwerks.SCORM.save = pipwerks.SCORM.data.save;
pipwerks.SCORM.quit = pipwerks.SCORM.connection.terminate;



// ------------------------------------------------------------------------- //
// --- pipwerks.UTILS functions -------------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
   pipwerks.UTILS.StringToBoolean()
   Converts 'boolean strings' into actual valid booleans.

   (Most values returned from the API are the strings "true" and "false".)

   Parameters: String
   Returns:    Boolean
---------------------------------------------------------------------------- */

pipwerks.UTILS.StringToBoolean = function (value) {
    var t = typeof value;
    switch (t) {
        //typeof new String("true") === "object", so handle objects as string via fall-through. 
        //See https://github.com/pipwerks/scorm-api-wrapper/issues/3
        case "object":
        case "string":
            return (/(true|1)/i).test(value);
        case "number":
            return !!value;
        case "boolean":
            return value;
        case "undefined":
            return null;
        default:
            return false;
    }
};



/* -------------------------------------------------------------------------
   pipwerks.UTILS.trace()
   Displays error messages when in debug mode.

   Parameters: msg (string)
   Return:     None
---------------------------------------------------------------------------- */

pipwerks.UTILS.trace = function (msg) {

    if (pipwerks.debug.isActive) {

        if (window.console && window.console.log) {
            console.log(msg);
        } else {
            //alert(msg);
        }

    }
};



///////////////////////////////////////////////////
//  CONTROLE SCORM JQUERY v0.0.1 --- 09/09/2014  //
///////////////////////////////////////////////////
///// TODO: O "SCORM CONTROLE" DEVE SER CHAMADA DEPOIS DO SCORM_WRAPPER 

(function ($) {

    // Global Variables
    var BASE = this;

    /////////////////////////
    //  START DO SCORM     //
    /////////////////////////


    $.fn.scorm_start = function (options) {
        var settings = $.extend({
            SCO: "index",
            PAGE: "index.html",
            PAGE_CURRENT: 1,
            PAGE_ALL: 1,
            PAGE_STATUS: [],
            lessonLocation: 1,
            lessonStatus: "incomplete",
            sessionTime: "",
            suspendData: "",
            inLMS: false,
            OBJ: undefined,
            StartDate: undefined,
            SCORM_API: undefined,
            cache: true

        }, options);

        BASE.SCORM = settings;


        //////////////////////////////////
        //  INICIANDO a API DO SCORM    //
        //////////////////////////////////

        (function () {
            ///
            if (!BASE.SCORM.cache) {

                // Example of how to use it
                if (typeof window.localStorage === 'object') {
                    try {
                        localStorage.clear()
                    } catch (e) {
                        fakeLocalStorage();
                    }
                } else {
                    // Use fake localStorage for any browser that does not support it.
                    fakeLocalStorage();
                }
            }

            BASE.SCORM.inLMS = pipwerks.SCORM.init() ? true : false;

            if (BASE.SCORM.inLMS) {
                var _lessonLocation = pipwerks.SCORM.get("cmi.core.lesson_location");
                if (_lessonLocation != null && _lessonLocation != undefined && _lessonLocation != "null" && _lessonLocation != "undefined" && _lessonLocation != "") {
                    BASE.SCORM.lessonLocation = pipwerks.SCORM.get("cmi.core.lesson_location"); /// 256 caract// retorna que etapa ele esta no curso!
                } else {
                    BASE.SCORM.lessonLocation = "";
                }

                var _lessonStatus = pipwerks.SCORM.get("cmi.core.lesson_status"); // STATUS completo oou nãoT 
                if (_lessonStatus != null && _lessonStatus != undefined && _lessonStatus != "null" && _lessonStatus != "undefined" && _lessonStatus != "") {
                    BASE.SCORM.lessonStatus = pipwerks.SCORM.get("cmi.core.lesson_status");
                } else {
                    BASE.SCORM.lessonStatus = "";
                }

                var _suspendData = pipwerks.SCORM.get("cmi.suspend_data");
                if (_suspendData != null && _suspendData != undefined && _suspendData != "null" && _suspendData != "undefined" && _suspendData != "") {
                    BASE.SCORM.suspendData = pipwerks.SCORM.get("cmi.suspend_data"); ///4056 caracT //// retorna o suspendata do curso!
                } else {
                    BASE.SCORM.suspendData = "";
                }
            }

            ///START DO CURSO 
            if (BASE.SCORM.inLMS) {
                BASE.debug("[start_timer called]");
                BASE.SCORM.StartDate = new Date().getTime();

                $(window).unload(
                    function () {
                        pipwerks.SCORM.quit();
                    }
                );
            }

        })();
    }

    /////////////////////////
    //  COMPLETE DO SCORM  //
    /////////////////////////

    $.fn.scorm_complete = function () {

        console.log("scorm_complete");

        if (BASE.SCORM.inLMS) {
            BASE.debug("COMPLETE LMS")
            BASE.ComputeTime();
            pipwerks.SCORM.set("cmi.core.lesson_status", "completed");
            pipwerks.SCORM.save();
        }
    }


    //////////////////////////////////////
    //     LESSON LOCATION  - public    //
    //////////////////////////////////////
    ///TODO: Retorna e envia qual é o local que vc esta no Curso -- máx de 256 caract


    $.fn.scorm_get_lessonLocation = function (variable) {
        return BASE.Get_lessonLocation(variable);
    }

    $.fn.scorm_set_lessonLocation = function (variable, value) {
        BASE.Set_lessonLocation(variable, value);
    }

    $.fn.scorm_reset_lessonLocation = function () {
        BASE.Reset_lessonLocation();
    }

    ///////////////////////////////
    //   SUSPEND DATA - public   //
    ///////////////////////////////

    $.fn.scorm_get_suspendData = function (variable) {
        return BASE.Get_suspendData(variable);
    }

    $.fn.scorm_set_suspendData = function (variable, value) {

        BASE.Set_suspendData(variable, value);
    }

    $.fn.scorm_reset_suspendData = function () {
        BASE.Reset_suspendData();
    }


    ///////////////////////////////
    //   INTERACTIONS - public   //
    ///////////////////////////////

    $.fn.scorm_set_interactions = function (_gabaritoCorreto, _gabaritoDado, _tipoQuestao, _tempoGastoQuestao, _pesoDadoQuestao) {
        BASE.Set_interactions(_gabaritoCorreto, _gabaritoDado, _tipoQuestao, _tempoGastoQuestao, _pesoDadoQuestao);
    }

    $.fn.scorm_get_interactions_count = function () {
        return BASE.Get_interactions_count();
    }

    ////////////////////////////////
    //  SAVE SCORE - public       //
    ////////////////////////////////

    $.fn.scorm_set_score = function (_raw) {
        BASE.Set_score(_raw);
    }

    $.fn.scorm_get_score = function () {
        return BASE.Get_score();
    }

    $.fn.scorm_set_score_max = function (_max) {
        BASE.Max_score(_max);
    }

    $.fn.scorm_set_score_min = function (_min) {
        BASE.Min_score(_min);
    }


    ////////////////////////////////
    //  STATUS - public           //
    ////////////////////////////////

    $.fn.scorm_set_status_lesson = function (_status) {
        BASE.Set_lessonStatus(_status);
    }

    $.fn.scorm_get_status_lesson = function () {
        return BASE.Get_lessonStatus();
    }

    ////////////////////////////////
    //  RESET DO SCORM - public  //
    /////////////////////////////////

    $.fn.scorm_reset = function () {

        if (BASE.SCORM.inLMS) {
            pipwerks.SCORM.set("cmi.core.lesson_location", "");
            pipwerks.SCORM.set("cmi.suspend_data", "");
            pipwerks.SCORM.set("cmi.core.score.raw", "0");
            pipwerks.SCORM.set("cmi.core.lesson_status", "not attempted");
            pipwerks.SCORM.set("cmi.core.session_time", "0");
            pipwerks.SCORM.save();

            //
            BASE.SCORM.lessonLocation = "";
            BASE.SCORM.lessonStatus = "";
            BASE.SCORM.suspendData = "";
            BASE.SCORM.StartDate = new Date().getTime();

        } else {

            // Example of how to use it
            if (typeof window.localStorage === 'object') {
                try {
                    localStorage.clear()
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                // Use fake localStorage for any browser that does not support it.
                fakeLocalStorage();
            }

            /*if (localStorage)
                localStorage.clear();*/
        }

    }

    ///////////////////////////////
    //  QUIT BROSWER - public   //
    ///////////////////////////////

    $.fn.scorm_quit = function () {
        BASE.quitScorm();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                        FUNCTIONS PRIVADAS                                         //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////
    //      LESSON STATUS - Private          //
    ///////////////////////////////////////////

    BASE.Get_lessonStatus = function () {
        return pipwerks.SCORM.get("cmi.core.lesson_status");
    }

    BASE.Set_lessonStatus = function (status) {
        pipwerks.SCORM.set("cmi.core.lesson_status", status);
        pipwerks.SCORM.save();
    }


    ///////////////////////////////////////////
    //      LESSON LOCATION - Private        //
    ///////////////////////////////////////////

    BASE.Get_lessonLocation = function (variable) {
        var output = null;

        if (BASE.SCORM.inLMS) {
            var lessonLocation = BASE.SCORM.lessonLocation;

            var startPosition = lessonLocation.indexOf(variable);
            if (startPosition > -1) {
                var endPosition = lessonLocation.indexOf(";", startPosition) == -1 ? lessonLocation.length : lessonLocation.indexOf(";", startPosition);
                var block = lessonLocation.substr(startPosition, (endPosition - startPosition));
                output = block.split("=")[1];
            }
        } else {

            // 
            if (typeof window.localStorage === 'object') {
                try {
                    if (localStorage.getItem(variable)) {
                        output = localStorage.getItem(variable);
                    } else {
                        output = null;
                    }
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                fakeLocalStorage();
            }


            /*if (localStorage) {

                if (localStorage.getItem(variable)) {
                    output = localStorage.getItem(variable);
                } else {
                    output = null;
                }
            }*/
        }

        return output;
    }

    BASE.Set_lessonLocation = function (variable, value) {
        if (BASE.SCORM.inLMS) {
            var lessonLocation = BASE.SCORM.lessonLocation;
            var indexInit = lessonLocation.indexOf(variable);
            if (indexInit <= -1) {
                lessonLocation += lessonLocation == "" ? (variable + "=" + value) : ";" + (variable + "=" + value);
            } else {
                var indexEnd = lessonLocation.indexOf(";", indexInit) <= -1 ? lessonLocation.length : lessonLocation.indexOf(";", indexInit);
                var block = lessonLocation.substr(indexInit, (indexEnd - indexInit));
                lessonLocation = lessonLocation.split(block).join((variable + "=" + value));
            }

            BASE.SCORM.lessonLocation = lessonLocation;

            pipwerks.SCORM.set("cmi.core.lesson_location", BASE.SCORM.lessonLocation);
            pipwerks.SCORM.save();

            BASE.ComputeTime();

        } else {

            if (typeof window.localStorage === 'object') {
                try {
                   localStorage.setItem(variable, value);
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                fakeLocalStorage();
            }


            //            if (localStorage) {
            //                localStorage.setItem(variable, value);
            //            }
        }
    }

    BASE.Reset_lessonLocation = function () {
        pipwerks.SCORM.set("cmi.core.lesson_location", '');
        pipwerks.SCORM.save();
    }

    ///////////////////////////////////////////
    //         SUSPENDDATA - Private         //
    ///////////////////////////////////////////

    BASE.Get_suspendData = function (variable) {
        var output = null;
        if (BASE.SCORM.inLMS) {
            var suspendData = BASE.SCORM.suspendData;
            var startPosition = suspendData.indexOf(variable);
            if (startPosition > -1) {
                var endPosition = suspendData.indexOf(";", startPosition) == -1 ? suspendData.length : suspendData.indexOf(";", startPosition);
                var block = suspendData.substr(startPosition, (endPosition - startPosition));
                output = block.split("=")[1];
            }
        } else {
            
            if (typeof window.localStorage === 'object') {
                try {
                    if (localStorage.getItem(variable)) {
                        output = localStorage.getItem(variable);
                    } else {
                        output = null;
                    }
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                fakeLocalStorage();
            }
        }


        return output;
    }

    BASE.Set_suspendData = function (variable, value) {


        if (BASE.SCORM.inLMS) {

            var suspendData = BASE.SCORM.suspendData;
            var indexInit = suspendData.indexOf(variable);

            if (indexInit <= -1) {
                suspendData += suspendData == "" ? (variable + "=" + value) : ";" + (variable + "=" + value);
            } else {
                var indexEnd = suspendData.indexOf(";", indexInit) <= -1 ? suspendData.length : suspendData.indexOf(";", indexInit);
                var block = suspendData.substr(indexInit, (indexEnd - indexInit));
                suspendData = suspendData.split(block).join((variable + "=" + value));
            }
            BASE.SCORM.suspendData = suspendData;

            pipwerks.SCORM.set("cmi.suspend_data", BASE.SCORM.suspendData);
            pipwerks.SCORM.save();

        } else {
            if (typeof window.localStorage === 'object') {
                try {
                   localStorage.setItem(variable, value);
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                fakeLocalStorage();
            }
        }
    }

    BASE.Reset_suspendData = function () {
        pipwerks.SCORM.set("cmi.suspend_data", '');
        pipwerks.SCORM.save();
    }

    ///////////////////////////////////////////
    //      INTERACTIONS SCORM - Private     //
    ///////////////////////////////////////////

    BASE.Set_interactions = function (_identificador, _gabaritoCorreto, _gabaritoDado, _tipoQuestao, _tempoGastoQuestao, _pesoDadoQuestao) {

        if (BASE.SCORM.inLMS) {
            var _indiceQuestao = 0;
            var _status = "";
            var today = new Date();
            h = today.getHours();
            m = today.getMinutes();
            s = today.getSeconds();

            if (h < 10) h = "0" + h;
            if (m < 10) m = "0" + m;
            if (s < 10) s = "0" + s;

            var _timeCurrent = h + ":" + m + ":" + s;

            if (BASE.Get_suspendData("ava"))
                _indiceQuestao = BASE.Get_suspendData("ava")

            var _indice = String(_indiceQuestao);
            var _id = "a" + _identificador;
            var _idObj = _id + "Obj";
            var _type = _tipoQuestao; //true-false, choice, fill-in, matching, performance, sequencing, likert, numeric
            var _correta = _gabaritoCorreto;
            var _resposta = _gabaritoDado;
            var _pesoQuestao = String(_pesoDadoQuestao);
            var _tempoGasto = _tempoGastoQuestao;


            if (_resposta == _correta) _status = "correct";
            else _status = "wrong"


            ///Essa avaliaçao só serve para o scorm 1.2    
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".id", _id);
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".type", _type); //true-false, choice, fill-in, matching, performance, sequencing, likert, numeric
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".objectives.0.id", _idObj);
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".time", _timeCurrent); /// Tempo que foi dada a resposta
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".correct_responses.0.pattern", _correta); /// Resposta correta.
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".student_response", _resposta); /// Resposta dada.
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".result", _status); /// Status da resposta Resposta.
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".weighting", _pesoQuestao); // Peso da questão
            pipwerks.SCORM.set("cmi.interactions." + _indice + ".latency", _tempoGasto); // tempo gasto

            pipwerks.SCORM.save();


            //Avaliacao
            var _idSusData = Number(_indice) + 1;
            BASE.Set_suspendData("ava", _idSusData);

        }

    }

    BASE.Get_interactions_count = function () {
        if (BASE.SCORM.inLMS) {
            return pipwerks.SCORM.get("cmi.interactions._count");
        } else {
            return 0
        }
    }

    ///////////////////////////////////////////
    //          SCORE SCORM - Private        //
    ///////////////////////////////////////////

    BASE.Set_score = function (_raw) {

        /// Apenas de 0 a 100
        if (BASE.SCORM.inLMS) {
            if (Math.round(_raw) <= 100) {
                pipwerks.SCORM.set("cmi.core.score.raw", _raw);
                pipwerks.SCORM.save();
            } else {
                pipwerks.SCORM.set("cmi.core.score.raw", 100);
                pipwerks.SCORM.save();
                console.log("Alerta: O raw(score) deve ser gravado em porcentagem pelo scorm que vão de 0 a 100%, seu calculo ultrapassou esse valor. - " + Math.round(_raw));
            }
        } else {
            
            if (typeof window.localStorage === 'object') {
                try {
                   localStorage.setItem("score", _raw);
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                fakeLocalStorage();
            }
            
            
            /*if (localStorage)
                localStorage.setItem("score", _raw);*/
        }

    }

    BASE.Get_score = function () {
        if (BASE.SCORM.inLMS) {
            return pipwerks.SCORM.get("cmi.core.score.raw");
        } else {
            
            if (typeof window.localStorage === 'object') {
                try {
                    if (localStorage.getItem(variable)) {
                        output = localStorage.getItem(variable);
                    } else {
                        output = null;
                    }
                } catch (e) {
                    fakeLocalStorage();
                }
            } else {
                fakeLocalStorage();
            }

            /*if (localStorage) {

                if (localStorage.getItem("score")) {
                    return localStorage.getItem("score");
                } else {
                    return null;
                }
            }*/


        }
    };

    BASE.Max_score = function (_max) {
        pipwerks.SCORM.set("cmi.core.score.max", Math.round(_max));
    }

    BASE.Min_score = function (_min) {
        pipwerks.SCORM.set("cmi.core.score.min", Math.round(_min));
    }



    ///////////////////////////////////////////
    // CONTROLA O TEMPO PARA O LMS DO SCORM  //
    ///////////////////////////////////////////

    BASE.ComputeTime = function () {
        if (BASE.SCORM.StartDate != 0) {
            var currentDate = new Date().getTime();
            var elapsedSeconds = ((currentDate - BASE.SCORM.StartDate) / 1000);
            var formattedTime = BASE.ConvertTotalSeconds(elapsedSeconds);

        } else {
            formattedTime = "00:00:00.0";
        }

        BASE.SCORM.sessionTime = formattedTime;
        pipwerks.SCORM.set("cmi.core.session_time", formattedTime);
        BASE.debug("[compute_time called]");
    }


    ////////////////////////////////////////////
    //     ConvertTotalSeconds { SCORM }      //
    ////////////////////////////////////////////

    BASE.ConvertTotalSeconds = function (ts) {
        var sec = (ts % 60);

        ts -= sec;
        var tmp = (ts % 3600); //# of seconds in the total # of minutes
        ts -= tmp; //# of seconds in the total # of hours

        // convert seconds to conform to CMITimespan type (e.g. SS.00)
        sec = Math.round(sec * 100) / 100;

        var strSec = new String(sec);
        var strWholeSec = strSec;
        var strFractionSec = "";

        if (strSec.indexOf(".") != -1) {
            strWholeSec = strSec.substring(0, strSec.indexOf("."));
            strFractionSec = strSec.substring(strSec.indexOf(".") + 1, strSec.length);
        }

        if (strWholeSec.length < 2) {
            strWholeSec = "0" + strWholeSec;
        }
        strSec = strWholeSec;

        if (strFractionSec.length) {
            strSec = strSec + "." + strFractionSec;
        }

        if ((ts % 3600) != 0)
            var hour = 0;
        else var hour = (ts / 3600);
        if ((tmp % 60) != 0)
            var min = 0;
        else var min = (tmp / 60);

        if ((new String(hour)).length < 2)
            hour = "0" + hour;
        if ((new String(min)).length < 2)
            min = "0" + min;

        var rtnVal = hour + ":" + min + ":" + strSec;

        return rtnVal;
    }


    //////////////////
    // CHANGE PAGE  //
    //////////////////

    BASE.changePage = function (_pageCurrent) {
        //Esse controle de tela foi utilizado o SUSPEND DATA, mas o mais indicado seria o lessonLocation
        //BASE.Set_suspendData("pagina" + _pageCurrent + "_status", "true")

        BASE.SCORM.PAGE_CURRENT = _pageCurrent;
        ///BASE.debug("troca de página " + BASE.SCORM.PAGE_CURRENT)

        BASE.ComputeTime();
    }



    ///////////////////
    // VERIFY STATUS //
    ///////////////////

    BASE.verifyStatus = function () {

    };

    ///////////////////
    //      QUIT     //
    ///////////////////

    BASE.quitScorm = function () {
        BASE.ComputeTime();
        pipwerks.SCORM.quit();
    }

    ////////////////////
    //     DEBUG      //
    ////////////////////

    BASE.debug = function (msg, type) {
        if (window.console && console.debug && this.debugMode) {
            console.debug(msg);
        };
    }


}(jQuery));
