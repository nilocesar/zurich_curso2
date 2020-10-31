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



var g_bShowApiErrors = false; // change to true to show error messages
var g_bInitializeOnLoad = true; // change to false to not initialize LMS when HTML page loads
// Translate these strings if g_bShowApiErrors is true and you need to localize the application
var g_strAPINotFound = "Management system interface not found.";
var g_strAPITooDeep = "Cannot find API - too deeply nested.";
var g_strAPIInitFailed = "Found API but LMSInitialize failed.";
var g_strAPISetError = "Trying to set value but API not available.";
var g_strFSAPIError = 'LMS API adapter returned error code: "%1"\nWhen FScommand called API.%2\nwith "%3"';
var g_strDisableErrorMsgs = "Select cancel to disable future warnings.";
// Change g_bSetCompletedAutomatically to true if you want the status to be set to completed automatically when calling LMSFinish.
// Normally, this flag remains false if the Flash movie itself sets status to completed by sending a FSCommand to set status to "completed", "passed" or "failed" (both of which imply "completed")
var g_bSetCompletedAutomatically = false;
// This value is normally given by the LMS, but in case it is not this is the default value to use to determine passed/failed.
// Set this null if the Flash actionscript uses its own method to determine passed/fail, otherwise set to a value from 0 to 1 inclusive (may be a floating point value, e.g "0.75".
var g_SCO_MasteryScore = null; // allowable values: 0.0..1.0, or null
//==================================================================
// WARNING!!!
// Do not modify anything below this line unless you know exactly what you are doing!
// You should not have to change these two values as the Flash template presets are based on them.
var g_nSCO_ScoreMin = 0; // must be a number
var g_nSCO_ScoreMax = 100; // must be a number > nSCO_Score_Min
// Per SCORM specification, the LMS provided mastery score, if any, will override the SCO in interpreting whether the score should be interpreted when the pass/fail status is determined.
// The template tries to obtain the mastery score, and if it is available, to set the status to passed or failed accordingly when the SCO sends a score.
// The LMS may not actually make the determination until the SCO has been terminated.
// Default value for this flag is true. Set it to false if don't want to predict how the LMS will set pass/fail status based on the mastery score (the LMS will win in the end anyway).
var g_bInterpretMasteryScore = true;
// This script implements various aspects of common logic behavior of a SCO.
/////////// API INTERFACE INITIALIZATION AND CATCHER FUNCTIONS ////////
var g_nFindAPITries = 0;
var g_objAPI = null;
var g_bInitDone = false;
var g_bFinishDone = false;
var g_bSCOBrowse = false;
var g_dtmInitialized = new Date(); // will be adjusted after initialize
var g_bMasteryScoreInitialized = false;

function AlertUserOfAPIError(strText) {
    console.log( strText );
}

function ExpandString(s) {
    var re = new RegExp("%", "g")
    for (i = arguments.length - 1; i > 0; i--) {
        s2 = "%" + i;
        if (s.indexOf(s2) > -1) {
            re.compile(s2, "g")
            s = s.replace(re, arguments[i]);
        }
    }
    return s
}

function FindAPI(win) {
    while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        g_nFindAPITries++;
        if (g_nFindAPITries > 500) {
            AlertUserOfAPIError(g_strAPITooDeep);
            return null;
        }
        win = win.parent;
    }
    return win.API;
}

function APIOK() {
    return ((typeof (g_objAPI) != "undefined") && (g_objAPI != null))
}

function SCOInitialize() {
    var err = true;
    if (!g_bInitDone) {
        if ((window.parent) && (window.parent != window)) {
            g_objAPI = FindAPI(window.parent)
        }
        if ((g_objAPI == null) && (window.opener != null)) {
            g_objAPI = FindAPI(window.opener)
        }

        if (!APIOK()) {
            AlertUserOfAPIError(g_strAPINotFound);
            err = false
        } else {
            err = g_objAPI.LMSInitialize("");
            if (err == "true") {
                g_bSCOBrowse = (g_objAPI.LMSGetValue("cmi.core.lesson_mode") == "browse");
                if (!g_bSCOBrowse) {
                    if (g_objAPI.LMSGetValue("cmi.core.lesson_status") == "not attempted") {
                        err = g_objAPI.LMSSetValue("cmi.core.lesson_status", "incomplete")
                    }
                }
            } else {
                AlertUserOfAPIError(g_strAPIInitFailed)
            }
        }
        if (typeof (SCOInitData) != "undefined") {
            // The SCOInitData function can be defined in another script of the SCO
            SCOInitData()
        }
        g_dtmInitialized = new Date();
    }
    g_bInitDone = true;
    return (err + "") // Force type to string
};

function SCOFinish() {
    if ((APIOK()) && (g_bFinishDone == false)) {
        SCOReportSessionTime()
        if (g_bSetCompletedAutomatically) {
            SCOSetStatusCompleted();
        }
        if (typeof (SCOSaveData) != "undefined") {
            // The SCOSaveData function can be defined in another script of the SCO
            SCOSaveData();
        }

        SCOCommit();

        g_bFinishDone = (g_objAPI.LMSFinish("") == "true");
    }
    return (g_bFinishDone + "") // Force type to string
}
// Call these catcher functions rather than trying to call the API adapter directly
function SCOGetValue(nam) {
    return ((APIOK()) ? g_objAPI.LMSGetValue(nam.toString()) : "")
}

function SCOCommit() {
    return ((APIOK()) ? g_objAPI.LMSCommit("") : "false")
}

function SCOGetLastError() {
    return ((APIOK()) ? g_objAPI.LMSGetLastError() : "-1")
}

function SCOGetErrorString(n) {
    return ((APIOK()) ? g_objAPI.LMSGetErrorString(n) : "No API")
}

function SCOGetDiagnostic(p) {
    return ((APIOK()) ? g_objAPI.LMSGetDiagnostic(p) : "No API")
}
//LMSSetValue is implemented with more complex data management logic below
var g_bMinScoreAcquired = false;
var g_bMaxScoreAcquired = false;
// Special logic begins here
function SCOSetValue(nam, val) {
    var err = "";
    if (!APIOK()) {
        AlertUserOfAPIError(g_strAPISetError + "\n" + nam + "\n" + val);
        err = "false"
    } else if (nam == "cmi.core.score.raw") err = privReportRawScore(val)
    if (err == "") {

        console.log(nam + " " + val.toString());

        err = g_objAPI.LMSSetValue(nam, val.toString() + "");
        SCOCommit();

        if (err != "true") return err
    }
    if (nam == "cmi.core.score.min") {
        g_bMinScoreAcquired = true;
        g_nSCO_ScoreMin = val
    } else if (nam == "cmi.core.score.max") {
        g_bMaxScoreAcquired = true;
        g_nSCO_ScoreMax = val
    }
    return err
}

function privReportRawScore(nRaw) { // called only by SCOSetValue
    if (isNaN(nRaw)) return "false";
    if (!g_bMinScoreAcquired) {
        if (g_objAPI.LMSSetValue("cmi.core.score.min", g_nSCO_ScoreMin + "") != "true") return "false"
    }
    if (!g_bMaxScoreAcquired) {
        if (g_objAPI.LMSSetValue("cmi.core.score.max", g_nSCO_ScoreMax + "") != "true") return "false"
    }
    if (g_objAPI.LMSSetValue("cmi.core.score.raw", nRaw) != "true") return "false";
    g_bMinScoreAcquired = false;
    g_bMaxScoreAcquired = false;
    if (!g_bMasteryScoreInitialized) {
        var nMasteryScore = parseInt(SCOGetValue("cmi.student_data.mastery_score"), 10);
        if (!isNaN(nMasteryScore)) g_SCO_MasteryScore = nMasteryScore
    }
    if ((g_bInterpretMasteryScore) && (!isNaN(g_SCO_MasteryScore))) {
        var stat = (nRaw >= g_SCO_MasteryScore ? "passed" : "failed");
        if (SCOSetValue("cmi.core.lesson_status", stat) != "true") return "false";
    }
    return "true"
}

function MillisecondsToCMIDuration(n) {
    //Convert duration from milliseconds to 0000:00:00.00 format
    var hms = "";
    var dtm = new Date();
    dtm.setTime(n);
    var h = "000" + Math.floor(n / 3600000);
    var m = "0" + dtm.getMinutes();
    var s = "0" + dtm.getSeconds();
    var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
    hms = h.substr(h.length - 4) + ":" + m.substr(m.length - 2) + ":";
    hms += s.substr(s.length - 2) + "." + cs.substr(cs.length - 2);
    return hms
}
// SCOReportSessionTime is called automatically by this script, but you may call it at any time also from the SCO
function SCOReportSessionTime() {
    var dtm = new Date();
    var n = dtm.getTime() - g_dtmInitialized.getTime();
    return SCOSetValue("cmi.core.session_time", MillisecondsToCMIDuration(n))
}
// Since only the designer of a SCO knows what completed means, another script of the SCO may call this function to set completed status.
// The function checks that the SCO is not in browse mode, and avoids clobbering a "passed" or "failed" status since they imply "completed".
function SCOSetStatusCompleted() {
    var stat = SCOGetValue("cmi.core.lesson_status");
    if (SCOGetValue("cmi.core.lesson_mode") != "browse") {
        if ((stat != "completed") && (stat != "passed") && (stat != "failed")) {
            return SCOSetValue("cmi.core.lesson_status", "completed")
        }
    } else return "false"
}
// Objective management logic
function SCOSetObjectiveData(id, elem, v) {
    var result = "false";
    var i = SCOGetObjectiveIndex(id);
    if (isNaN(i)) {
        i = parseInt(SCOGetValue("cmi.objectives._count"));
        if (isNaN(i)) i = 0;
        if (SCOSetValue("cmi.objectives." + i + ".id", id) == "true") {
            result = SCOSetValue("cmi.objectives." + i + "." + elem, v)
        }
    } else {
        result = SCOSetValue("cmi.objectives." + i + "." + elem, v);
        if (result != "true") {
            // Maybe this LMS accepts only journaling entries
            i = parseInt(SCOGetValue("cmi.objectives._count"));
            if (!isNaN(i)) {
                if (SCOSetValue("cmi.objectives." + i + ".id", id) == "true") {
                    result = SCOSetValue("cmi.objectives." + i + "." + elem, v)
                }
            }
        }
    }
    return result
}

function SCOGetObjectiveData(id, elem) {
    var i = SCOGetObjectiveIndex(id);
    if (!isNaN(i)) {
        return SCOGetValue("cmi.objectives." + i + "." + elem)
    }
    return ""
}

function SCOGetObjectiveIndex(id) {
    var i = -1;
    var nCount = parseInt(SCOGetValue("cmi.objectives._count"));
    if (!isNaN(nCount)) {
        for (i = nCount - 1; i >= 0; i--) { //walk backward in case LMS does journaling
            if (SCOGetValue("cmi.objectives." + i + ".id") == id) {
                return i
            }
        }
    }
    return NaN
}


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


            SCOInitialize();
            
            if (BASE.SCORM.cache == false) {
                if (localStorage)
                    localStorage.clear();
            }

            if (APIOK()) {
                BASE.SCORM.inLMS = true;
            }

            if (BASE.SCORM.inLMS) {

                var _lessonLocation = SCOGetValue("cmi.core.lesson_location");
                if (_lessonLocation != null && _lessonLocation != undefined && _lessonLocation != "null" && _lessonLocation != "undefined" && _lessonLocation != "") {
                    BASE.SCORM.lessonLocation = _lessonLocation; /// 256 caract// retorna que etapa ele esta no curso!
                } else {
                    BASE.SCORM.lessonLocation = "";
                }

                var _lessonStatus = SCOGetValue("cmi.core.lesson_status"); // STATUS completo oou nãoT 
                if (_lessonStatus != null && _lessonStatus != undefined && _lessonStatus != "null" && _lessonStatus != "undefined" && _lessonStatus != "") {
                    BASE.SCORM.lessonStatus = _lessonStatus;
                } else {
                    BASE.SCORM.lessonStatus = "";
                }

                //alert("_lessonStatus -> " + _lessonStatus);
                
                var _suspendData = SCOGetValue("cmi.suspend_data");
                if (_suspendData != null && _suspendData != undefined && _suspendData != "null" && _suspendData != "undefined" && _suspendData != "") {
                    BASE.SCORM.suspendData = _suspendData; ///4056 caracT //// retorna o suspendata do curso!
                } else {
                    BASE.SCORM.suspendData = "";
                }

                BASE.debug("[start_timer called]");
                BASE.SCORM.StartDate = new Date().getTime();

                $(window).unload(
                    function () {
                        BASE.quitScorm();
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
            SCOSetStatusCompleted();
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
            SCOSetValue("cmi.core.lesson_location", "");
            SCOSetValue("cmi.suspend_data", "");
            SCOSetValue("cmi.core.score.raw", "0");
            SCOSetValue("cmi.core.lesson_status", "not attempted");
            SCOSetValue("cmi.core.session_time", "0");

            //
            BASE.SCORM.lessonLocation = "";
            BASE.SCORM.lessonStatus = "";
            BASE.SCORM.suspendData = "";
            BASE.SCORM.StartDate = new Date().getTime();

        } else {

            if (localStorage)
                localStorage.clear();
        }

    }

    ///////////////////////////////
    //  QUIT BROSWER - public   //
    ///////////////////////////////

    $.fn.scorm_quit = function () {
        BASE.quitScorm();


        //alert("sair " + (-(window.history.length - 1)) );
        //window.history.go(-(window.history.length - 1)); 
        var _quit_url = "views/interface/sair/encerrado.html";
        var contentRoot = window;
        var urlBase = GetContentRootUrlBase(contentRoot);
        window.location.href = urlBase + _quit_url;

        function GetContentRootUrlBase(contentRoot) {

            var urlParts = contentRoot.location.href.split("/");
            delete urlParts[urlParts.length - 1];
            contentRoot = urlParts.join("/");
            return contentRoot;
        }

    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                        FUNCTIONS PRIVADAS                                         //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////
    //      LESSON STATUS - Private          //
    ///////////////////////////////////////////

    BASE.Get_lessonStatus = function () {
        return SCOGetValue("cmi.core.lesson_status");
    }

    BASE.Set_lessonStatus = function (status) {
        SCOSetValue("cmi.core.lesson_status", status);
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


            if (localStorage) {

                if (localStorage.getItem(variable)) {
                    output = localStorage.getItem(variable);
                } else {
                    output = null;
                }
            }
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

            SCOSetValue("cmi.core.lesson_location", BASE.SCORM.lessonLocation);

            BASE.ComputeTime();

        } else {


            if (localStorage) {
                localStorage.setItem(variable, value);
            }
        }
    }

    BASE.Reset_lessonLocation = function () {
        SCOSetValue("cmi.core.lesson_location", '');
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

            if (localStorage.getItem(variable)) {
                output = localStorage.getItem(variable);
            } else {
                output = null;
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

            SCOSetValue("cmi.suspend_data", BASE.SCORM.suspendData);

        } else {

            localStorage.setItem(variable, value);


        }
    }

    BASE.Reset_suspendData = function () {
        SCOSetValue("cmi.suspend_data", '');
    }

    ///////////////////////////////////////////
    //      INTERACTIONS SCORM - Private     //
    ///////////////////////////////////////////

    BASE.Set_interactions = function (_identificador, _gabaritoCorreto, _gabaritoDado, _tipoQuestao, _tempoGastoQuestao, _pesoDadoQuestao) {

    }

    BASE.Get_interactions_count = function () {

    }

    ///////////////////////////////////////////
    //          SCORE SCORM - Private        //
    ///////////////////////////////////////////

    BASE.Set_score = function (_raw) {

    }

    BASE.Get_score = function () {};

    BASE.Max_score = function (_max) {

    }

    BASE.Min_score = function (_min) {

    }



    ///////////////////////////////////////////
    // CONTROLA O TEMPO PARA O LMS DO SCORM  //
    ///////////////////////////////////////////

    BASE.ComputeTime = function () {
        SCOReportSessionTime();
    }


    ///////////////////
    //      QUIT     //
    ///////////////////

    BASE.quitScorm = function () {
        SCOFinish();
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
