/* browserDetect */
/* Load Timestamp 13:59:55.618 */
//browser detectie script
//alle niet ondersteunde browser moeten in de array blijven om foutieve detectie te voorkomen

var bBRWFCN_LOADED=true;

var BrowserDetect = {
    browser:'',

    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (eval('typeof ' + dataProp + '!=\'undefined\'')){
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Edge",
            identity: "Edge"
        },
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        { 	string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        },
        {
            prop: "window.opera",
            identity: "Opera"
        },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {		// for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        { 		// for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS : [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]

};
BrowserDetect.init();

var BROWSER_NAME  			='';
var BROWSER_VERSION  		='';
var is_ie6 = false;
var is_ie = false;
var is_ff = false;
var is_chr = false;
var is_saf = false;


BrowserDetect.isIE8				= false;
BrowserDetect.isIE9 			= false;
BrowserDetect.isIE 				= false;
BrowserDetect.isFirefox 	= false;
BrowserDetect.isChrome 		= false;
BrowserDetect.isSafari 		= false;
BrowserDetect.isiPad 		= false;
BrowserDetect.browserUsed	= null;
BrowserDetect.scrollbarWidth = 16;
BrowserDetect.isiPad = navigator.userAgent.match(/iPad/i) != null;
BrowserDetect.isiPad = /iPad/i.test(navigator.userAgent) || /iPhone OS 3_1_2/i.test(navigator.userAgent) || /iPhone OS 3_2_2/i.test(navigator.userAgent);

switch(BrowserDetect.browser.toString()){

    case 'Explorer':

        BrowserDetect.isIE 					= true;
        BrowserDetect.browserUsed		= 'InternetExplorer';
        BROWSER_NAME 								= 'ie';


        if (BrowserDetect.version == 9){
            BrowserDetect.isIE9 		= true;
            BROWSER_VERSION					= BrowserDetect.version;
        }

        if (BrowserDetect.version == 10){
            BrowserDetect.isIE9 		= true;
            BROWSER_VERSION					= BrowserDetect.version;
        }
        break;
    case 'Edge':
        BrowserDetect.isEdge		 	= true;
        BrowserDetect.browserUsed	= 'Edge';
        BROWSER_NAME 							= 'edge';
        BROWSER_VERSION						= BrowserDetect.version;
        break;
    case 'Firefox':
        BrowserDetect.isFirefox 	= true;
        BrowserDetect.browserUsed	= 'FireFox';
        BROWSER_NAME 							= 'ffx';
        BROWSER_VERSION						= BrowserDetect.version;
        break;
    case 'Safari':
        BrowserDetect.isSafari 		= true;
        BrowserDetect.browserUsed	= 'Safari';
        BROWSER_NAME 							= 'saf';
        BROWSER_VERSION						= BrowserDetect.version;
        break;
    case 'Chrome':
        BrowserDetect.scrollbarWidth = 17;
        BrowserDetect.isChrome 		= true;
        BrowserDetect.browserUsed	= 'Chrome';
        BROWSER_NAME								= 'chr';
        BROWSER_VERSION						= BrowserDetect.version;
        break;
    case 'Mozilla':
        BrowserDetect.isIE 				= true;
        BrowserDetect.browserUsed	= 'InternetExplorer';
        BROWSER_NAME								= 'moz';
        BROWSER_VERSION						= BrowserDetect.version;
        break;

    default:
        BROWSER_NAME ='unknown';
        BrowserDetect.browserUsed ='other';
}




/*===============================================================================*/
/*============================= SUPPORTED BROWSERS ==============================*/
/*===============================================================================*/
var	supportedBrowsers = [
    {
        "browserName"							: "Explorer",
        "browserTag"							: "ie",
        "supportedFromVersion"		: "10",
        "supportedOperatingSys"		: "Microsoft Windows"
    },
    {
        "browserName"							: "Edge",
        "browserTag"							: "edge",
        "supportedFromVersion"		: "10",
        "supportedOperatingSys"		: "Microsoft Windows"
    },
    {
        "browserName"							: "Chrome",
        "browserTag"							: "chr",
        "supportedFromVersion"		: "26",
        "supportedOperatingSys"		: "Microsoft Windows"
    },
    {
        "browserName"							: "Firefox",
        "browserTag"							: "ffx",
        "supportedFromVersion"		: "20",
        "supportedOperatingSys"		: "Microsoft Windows"
    },
    {
        "browserName"							: "Safari",
        "browserTag"							: "saf",
        "supportedFromVersion"		: "6",
        "supportedOperatingSys"		: "OS X Mountain Lion"
    },
    {
        "browserName"							: "Mozilla",
        "browserTag"							: "moz",
        "supportedFromVersion"		: "11",
        "supportedOperatingSys"		: "Microsoft Windows"
    }
];



function checkForSupportedBrowser(){
    var browserIsSupported = false;
    for (var i = 0; i < supportedBrowsers.length; i++) {
        if(BrowserDetect.browser == supportedBrowsers[i].browserName){

            if(BrowserDetect.version >= supportedBrowsers[i].supportedFromVersion){
                browserIsSupported = true;
            }

        }
    }

    if(!browserIsSupported){
        var txtMsg = getCapt('gBROWSERNOTSUPPORTEDMSG1')+" "+BrowserDetect.browser +" v"+BrowserDetect.version+" "+getCapt('gBROWSERNOTSUPPORTEDMSG2');
        alert(txtMsg);
        window.location.href = "/";
        return false;
    }
}