// pDFTLNG = NL
// pUSRLNG = NL
// USRID = JVEDEV
// pDBFID = MNTDBF811
// pCBFID = MNTCBF81
// pEMSID =
// pAPPCODE = HTX
// PFMFILID = PRO81DR90D
// PFMSOMTD = USR
// pARRLEN = 13
/* SKL_ORGAN */
var SKL_ORGAN=new Array();
SKL_ORGAN.TTL="Organisatie";
SKL_ORGAN.OPT=[
    ["AA","Een AA organisatie"]
    ,["AB","Een AB organisatie"]
    ,["BB","Organisatietype BB"]
    ,["BC","Org. BC"]
    ,["BD","Org. BD"]
    ,["BE","org. BE"]
];

/* SKL_KRDCD */
var SKL_KRDCD=new Array();
SKL_KRDCD.TTL="Kredietbewakingscode";
SKL_KRDCD.OPT=[
    ["G","Geen"],
    ["N","Normaal"],
    ["O","Overleg"],
    ["R","Rembours"],
    ["X","Niet leveren"]
];

/* SKL_BTLCD */
var SKL_BTLCD=new Array();
SKL_BTLCD.TTL="Betaalwijze";
SKL_BTLCD.OPT=[
    ["D","Klant"],
    ["K","Kas (Contant)"],
    ["R","Rembours"],
    ["G","Groepsdebiteur"],
    ["H","Hoofdkantoor"],
    ["F","(H) + Factuur klant"]
];

/* SDB_BTWPD */
var SDB_BTWPD=new Array();
SDB_BTWPD.TTL="BTW verplichting debiteur";
SDB_BTWPD.OPT=[
    ["B","Berekenen"],
    ["E","Export"],
    ["F","Lev. binnen Fiscale eenheid"],
    ["G","Intracommunautair"],
    ["N","Vrijgesteld"],
    ["P","Particulier levering EU"],
    ["V","Verleggen"]
];

/* SKL_VZFAC */
var SKL_VZFAC=new Array();
SKL_VZFAC.TTL="Verzamelfacturering";
SKL_VZFAC.OPT=[
    ["O","Per order"],
    ["C","Cumulatief"]
];

/* SKL_FCFRQ */
var SKL_FCFRQ=new Array();
SKL_FCFRQ.TTL="Factureer frequentie";
SKL_FCFRQ.OPT=[
    ["D","Dag"],
    ["W","Week"],
    ["M","Maand"]
];

/* SKL_LVWBV */
var SKL_LVWBV=new Array();
SKL_LVWBV.TTL="Wijze leveren bevestigen klant";
SKL_LVWBV.OPT=[
    ["A","Afleverdatum bij de klant"],
    ["V","Verzenddatum eigen magazijn"]
];

/* SKL_INALV */
var SKL_INALV=new Array();
SKL_INALV.TTL="Naleveringen toegestaan?";
SKL_INALV.OPT=[
    ["1","Deel- en nalevering toegestaan"],
    ["2","Geen deel- bij nalevering"],
    ["3","Geen deellevering"],
    ["4","Geen nalevering"],
    ["5","Geen nalevering order"]
];

/* SKL_PRILV */
var SKL_PRILV=new Array();
SKL_PRILV.TTL="Prioriteitcode levering";
SKL_PRILV.OPT=[
    ["1","Hoogste prioriteit"],
    ["2","Prioriteit 2"],
    ["3","Prioriteit 3"],
    ["4","Prioriteit 4"],
    ["5","Prioriteit 5"],
    ["6","Prioriteit 6"],
    ["7","Prioriteit 7"],
    ["8","Prioriteit 8"],
    ["9","Laagste prioriteit"]
];

/* SLV_CDLPL */
var SLV_CDLPL=new Array();
SLV_CDLPL.TTL="Leveringsplaats";
SLV_CDLPL.OPT=[
    ["A01","Bij de buren afgeven aub"]
    ,["A02","Afleveren om de hoek"]
];

/* SPY_CDEUP */
var SPY_CDEUP=new Array();
SPY_CDEUP.TTL="Code bestemming partij";
SPY_CDEUP.OPT=[
    ["0","Onbepaald"],
    ["1","Dierlijk"],
    ["2","Humaan"]
];

/* SKL_KLSTP */
var SKL_KLSTP=new Array();
SKL_KLSTP.TTL="Toepassen staffel";
SKL_KLSTP.OPT=[
    ["G","Geen staffel"],
    ["S","Standaardstaffel"],
    ["H","Hogere staffel"],
    ["M","Mix"]
];

/* SAO_TAALA */
var SAO_TAALA=new Array();
SAO_TAALA.TTL="Taalcode artikel";
SAO_TAALA.OPT=[
    ["N","Nederlands"],
    ["D","Duits"],
    ["E","Engels"],
    ["F","Frans"]
];

