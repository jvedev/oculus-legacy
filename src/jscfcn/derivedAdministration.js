function derivedAdministration() {}

derivedAdministration.LastTemplate = '';
derivedAdministration.nr = null;
/**
 * opent het zoekscherm voor het kiezen van een afgeleide administratie
 * maakt daarna een clone (JSON.parse(JSON.stringify(option))); van de gekozen optie.
 * dit is noodzakelijk omdat anders de volgende keer dat de optie gekozen wordt
 * option.ENV niet meer *VAR is
 * @param option
 * @param nr
 */
derivedAdministration.open = function(option, nr) {
  //maak een clone van de option dit moet anders zal de volgende keer dat de optie gekozen wordt *VAR voor de option.ENV de laatst gekozen admin naam hebben
  var foClonedOption = {
    SON: option.SON,
    ENV: option.ENV,
    PGM: option.PGM,
    DSC: option.DSC,
    APP: option.APP,
    IDTORG: option.IDT,
    TTL: option.TTL
  };

  var chooseAdministrationPlaceholder = XDOM.getObject('chooseAdministration');
  var chooseAdministrationFrame = XDOM.getObject('chooseAdministrationFrame');
  var bodyBlocker = XDOM.getObject('bodyBlocker');

  var fsUrl =
    '/ndscgi/BOX/ndmctl/DEBN76.ndm/MAIN?' +
    'PFMFILID=' +
    option.TPL +
    '&PFMSOMTD=' +
    option.SON +
    '&AUTHTOKEN=' +
    SESSION.AUTHTOKEN +
    '&USRID=' +
    OCULUS.remoteUser +
    '&MDADM=' +
    option.TPL;

  derivedAdministration.modelAdministrationOption = foClonedOption;
  derivedAdministration.nr = nr;
  chooseAdministrationPlaceholder.className = 'isVisible';
  bodyBlocker.className = 'open';

  if (derivedAdministration.LastTemplate != option.TPL) {
    chooseAdministrationFrame.src = fsUrl;
    derivedAdministration.LastTemplate = option.TPL;
  } else {
    chooseAdministrationFrame.contentDocument.getElementById('ENVID').focus();
  }
};

derivedAdministration.close = function() {
  var chooseAdministrationPlaceholder = XDOM.getObject('chooseAdministration');
  var bodyBlocker = XDOM.getObject('bodyBlocker');
  chooseAdministrationPlaceholder.className = 'isHidden';
  bodyBlocker.className = '';
};

derivedAdministration.select = async function(adminId) {
  derivedAdministration.modelAdministrationOption.ENV = adminId;
  await NAV.Session.newSession(derivedAdministration.modelAdministrationOption, derivedAdministration.nr);
  derivedAdministration.close();
};
