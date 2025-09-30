// /* global ENUM, SESSION, XDOM, id, FieldAttribute */

// function FieldAuthorization() {}

// FieldAuthorization.update = function() {
//   var foAuthObjects = SESSION.activePage.authorizationFields;
//   for (var i = 0, l = foAuthObjects.length; i < l; i++) {
//     FieldAuthorization.apply(foAuthObjects[i]);
//   }
// };

// FieldAuthorization.apply = function(obj) {
//   var PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-service-type="*CHC"]'); //choice;
//   PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-quicksearch-id]', PageObjects); //snelzoek
//   PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-search-id]', PageObjects); //zoek
//   PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-button-icon="multiSelect"]', PageObjects); //multiselect
//   PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-service-type="*CAL"]', PageObjects); //calendar
//   PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-service-type="*RTV"]', PageObjects); //retrieve
//   PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"].topView', PageObjects); //topView
  
//   const topview = XDOM.query('[data-to-id="' + obj.id + '"].topView');
//   if(topview){
//     PageObjects = XDOM.queryAllAppend(`[for="${topview.id}"]`, PageObjects); //labels for Topview (indirectly related)
//   }


//   if (obj.authorizationLevel == ENUM.authorizationLevel.hidden) {
//     PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"][data-service-type="*DSP"]', PageObjects); //service display
//     PageObjects = XDOM.queryAllAppend(`[for="${obj.id}"]`, PageObjects); //labels
//     PageObjects = XDOM.queryAllAppend('[data-to-id="' + obj.id + '"].infoProgram', PageObjects); //info window
//   }

//   for (var i = 0, l = PageObjects.length; i < l; i++) {
//     FieldAttribute.hide(PageObjects[i]);
//     When.setHeader(PageObjects[i], 'unavailable');
//   }

//   return;
// };
