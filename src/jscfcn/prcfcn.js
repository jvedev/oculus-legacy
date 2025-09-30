

/**
 * initialiseert positie scrollbar bij kiezen andere optie in P procedure en bij submit
 */
function resetAllsubfilePositions() {
  for (var x in SESSION.program) {
    SESSION.program[x].subfilePos = 0;
  }
}

function gotoPreviousProgram() {
  if (SESSION.submitInProgress) {
    return;
  }

  Upload.resetFormEncType();
  SESSION.stack.back(SESSION.activePage);
  closeHighSlide();

  Subfile.getProgramSettings().subfilePos = 0;

  window.onbeforeunload = null;
  Command.submit();
  return false;
}
