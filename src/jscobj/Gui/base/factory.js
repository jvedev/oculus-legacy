var GUI = {};
/**
 * factory voor pageObjects
 * @param obj definitie in json van object
 * @returns pageObject
 */
GUI.factory = {};
GUI.factory.get = function(obj,parentObject ){
  var foObj = null;
  GUI.translateDefinition(obj);
  if(!(obj && obj.type)){
    return;
  }
  
  switch(obj.type){
   case 'output':
       if(obj.dataType == ENUM.dataType.logical){
         foObj =  new GUI.LogicalOut(obj);
         break;
       }
       if(obj.dataType == ENUM.dataType.link){
         foObj =   new GUI.Link(obj);
         break;
       }
       if(obj.dataType == ENUM.dataType.memo){
         foObj =   new GUI.MemoOut(obj);
         break;
       }
       if(nullWhenEmpty(obj.editMask)!=null){
         foObj =   new GUI.MaskedOutput(obj);
         break;
       }
       foObj =   new GUI.Output(obj);
       break;
   case 'input':
     
     if(nullWhenEmpty(obj.editMask)!=null){
       foObj =   new GUI.MaskedInput(obj);
       break;
     }
     
     if(obj.dataType == ENUM.dataType.memo){
       foObj =   new GUI.MemoIn(obj);
       break;
     }
     
   
     if(obj.dataType == ENUM.dataType.logical){
       foObj =   new GUI.LogicalIn(obj);
       break;
     }
     
     if(obj.fieldAttribute=="*HIDDEN"){
       foObj =   new GUI.Hidden(obj);
       break;
     }
     
     foObj =   new GUI.Input(obj);
     break;
   case 'hiddenInput':
     foObj =   new GUI.Hidden(obj);
     break;
   case 'chart':
     foObj =   new GUI.Chart(obj);
     break;
   case 'label':
     foObj =   new GUI.Label(obj);
     break;
   case 'image':
     foObj =   new GUI.Image(obj);
     break; 
   case 'constant':
     foObj =   new GUI.Constant(obj);
     break;
   case 'dataset':
     foObj =   new GUI.DataSet(obj);
     break; 
   case 'serviceChoice':
     foObj =   new GUI.ChoiceService(obj);
     break; 
   case 'serviceDisplay':
     foObj =   new GUI.DisplayService(obj);
     break; 
  case 'serviceRetrieve':
     foObj =   new GUI.Retrieve(obj);
     break;
  case 'CalendarChoice':
     foObj =   new GUI.Calendar(obj);
     break;
  case 'sessionLauncher':
     foObj =   new GUI.SessionLauncher(obj);
     break;
  case 'quickSearch':
     foObj =   new GUI.QuickSearch(obj);
     break;
  case 'queryList':
     foObj =   new GUI.QueryList(obj);
     break;
  case 'infoProgram':
     foObj =   new GUI.InfoWindowIcon(obj);
     break;
  case 'editProgram':
     foObj =   new GUI.EditWindowIcon(obj);
     break;
  case 'unauthorized':
  case 'notAuthorized':
  case 'CommandButton':
    return null;
    break;
  default: 
    console.log('onbekend gui object:');
    console.log(obj);
    return null;
  }
  
  foObj.parentObject = parentObject;
  return foObj;
};
