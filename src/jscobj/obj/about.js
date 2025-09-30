var About = {};


(function () {
	function show(){
		let support = top.supportCaptions || '';
		let product = top.productName || 'Oculus';
		let content = `
		<div id="settingsWrapper"  data-event-class="userSettings" >
		  <div id="settingsTitle">
			   <span id="settingsTitleLabel">${getCapt('about') + ' ' + product} </span>
			   <i role="button" tabindex="0" data-title-origin="*LBL"  data-title-variable="cCANCEL_TTL" data-click="close" data-event-class="userSettings"  class="icon pth-close  pull-right settingsCloseBtn"> </i>
		  </div>
		  <div id="settingscontent">
  		  <div class="titleText">${getCapt('about_title_versions')}</div>
  		  <div><span>${getCapt('about_oculus_version')}</span><span> ${OCULUS.version} / ${top.landingspageVersion}</span></div>
			<div><span>${getCapt('about_oculus_date')}</span><span> ${OCULUS.versionDate}</span></div>
			<!--
      <div class="titleText">${getCapt('about_title_tour')}</div>
				<div class="icon-text-button" data-event-class="Tour" data-click="startTour" data-tour-id="tour1">
					<i class="fa fa-map-signs" aria-hidden="true"></i>
					<span>${getCapt('helptour')}</span>
				</div>-->
  		  <div class="contentText">
  		    ${support}
		    </div>
		  </div>
		</div>`;
		ModalPanel.open(content);
	  };

	this.click = show;
}).apply( About);
