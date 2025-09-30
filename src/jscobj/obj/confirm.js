var Confirm = {};
 (function () {
	this.handler = null;
	this.autoClose = true;

	function showPromised(obj){
		let resolveTrue = null
		let resolveFalse = null
		let confirmPromise = new Promise((resolve,reject)=>{
			resolveTrue = () => resolve(true)
			resolveFalse = () => resolve(false)
		})

		obj.handler = ok => {
			if (ok) {
				resolveTrue();
			}else{
				resolveFalse();
			}
		}
		show(obj);
		return confirmPromise;
	}



	function show(obj){
		obj.txtYes = obj.txtYes || getCapt('confirmYes');
		obj.txtNo = obj.txtNo || getCapt('confirmNo');
		if(typeof obj.autoClose !== "undefined") {
			Confirm.autoClose = obj.autoClose;
		}

		Confirm.handler = obj.handler;

        // Todo: this throws an error with _dragObject not being defined (maybe a 'get size' function which returns a Vect2)
        // Todo: Add an array to know whether this is already open
        // Todo: Add this all to a modal module in Peebundle

        let dialogue = window.Dialogue.create(
            "confirm-dialogue",
            template(obj),
            "center",
			"false",
			"dialogue-medium"
        );

        if(obj.group) {
			dialogue.group.push(obj.group);
		}

        window.Dialogue.open(dialogue);
        document.getElementById('confirmYes').focus();
	}

	function keyup(ev){
		switch(ev.keyCode){
			case keyCode.space:
			case keyCode.enter:
				handle(ev);
				break;
			case keyCode.F12:
			case keyCode.escape:
				Confirm.handler(false);
				ModalPanel.click();
				break;
			case keyCode.arrowLeft:
			case keyCode.arrowRight:
				toggle(ev);
		}
	}

	async function handle(ev){
		Confirm.handler(ev.invokeObject.dataset.choice=="yes");
		if(Confirm.autoClose){
			Confirm.handler = null;
			ModalPanel.click();
		}
		
	}

	function click(ev){
		handle(ev);
		return;
	}

	function toggle(ev){
		if(ev.invokeObject.id=="confirmYes"){
			MAINDOC.getElementById("confirmNo").focus();
		}else{
			MAINDOC.getElementById("confirmYes").focus();
		}
	}

	function template(obj){
		return `<h3 slot="header">${obj.title}</h3>
                <i slot="header" class="control-icon dialogue-close fas fa-times"></i>
                <!-- <i slot="header" class="control-icon lock fas fa-lock"></i> -->
                <div>
                    <p class="confirmMessage">${obj.message}</p>
                    <div class="wrap-centre">
                        <a role="button" tabindex="0" id="confirmYes" class="impButton hvr-green  dialogue-close" data-event-class="Confirm" data-choice="yes">
                            <span>${obj.txtYes}</span>
                        </a>   
                        <a role="button" tabindex="0" id="confirmNo" class="impButton hvr-red dialogue-close" data-event-class="Confirm" data-choice="no">
                            <span>${obj.txtNo}</span>
                        </a>                                  
                    </div>
                </div>`;
	}

	this.keyup = keyup;
	this.click = click;
  	this.show = show;
  	this.showPromised = showPromised;
 }).apply( Confirm);

