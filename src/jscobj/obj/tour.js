


  var  Tour = {};

  (function () {
    let steps= [],
        currentStep = 0,
        currentDetail = 0,
        showBulletText = false,
        title = '',
        TourPath = '',
        id = '';
        tours = {};

    const TourDir = '/tour'
    const loadImg = (...paths) => Promise.all(paths.map(checkImage));
    const checkImage = path => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve({path, status: 'ok'});
        img.onerror = () => resolve({path, status: 'error'});
        img.src = path;
    });



    function load(id, onLoadAll){

        let p = new Promise((resolve, reject) =>{
            if(tours[id]){resolve()}
            let tourDefinition= document.createElement('script');
            document.head.appendChild(tourDefinition);
            tourDefinition.charset 		= "utf-8";
            tourDefinition.type 		= "text/javascript";
            tourDefinition.onload       =  resolve;
            tourDefinition.onerror      =  reject;
            tourDefinition.src			= `${TourDir}/${id}/${userLanguage}.js`;
        });
       p.then(()=>onLoad(onLoadAll), () => SCOPE.main.Dialogue.alert(`${getCapt('errorNoTourDefined')} ${id} <br> (${TourDir}/${id}/${userLanguage}.js)`));
    }



    function onLoad(onLoadAll=()=>{}){
        tours[id].images = [];
        tours[id].steps.forEach(collectImages);
        loadImg(...tours[id].images).then(onLoadAll)
    }

    function collectImages(step){
        let i = new Image();
        let uri = `${TourDir}/${id}/img/${step.image}`
        if(!tours[id].images.includes(uri)){
            tours[id].images.push(uri)
        }
        if(step.details){
            step.details.forEach(collectImages);
        }

    }


    function add(bulletText, image, title, content){
        tours[id].steps.push({title:title, content:content, image:image,bulletText:bulletText, nr:tours[id].steps.length});
      }
    function addDetail(bulletText, image, title, content){
      let currentStep = tours[id].steps[tours[id].steps.length-1];
      if(!currentStep){return;}
      if(!currentStep.details){
        currentStep.details = [];
      }
      currentStep.details.push({title:title, content:content, image:image,bulletText:bulletText, nr:currentStep.nr ,detailnr:currentStep.details.length});
    }

    function stepBullit(step){
        let detailNr = '';
      if(typeof step.detailnr=='number'){
        detailNr = `data-step-detail-nr="${step.detailnr}"`;
      }
      if(step.details){
        return `<div class="step-bullet fa" role="button" tabindex="0" data-workflow-state="open" data-workflow-step="closed" data-event-class="Tour" data-click="jumpTo" data-step-nr="${step.nr}"><span>${step.bulletText}</span></div>
                <div class="step-detail fa" data-step-nr="${step.nr}" ${detailNr} data-hidden="true">${step.details.map(stepBullit).join('')}</div>`
      }
      return `<div class="step-bullet fa" role="button" tabindex="0" data-workflow-state="open" data-workflow-step="single" data-event-class="Tour" data-click="jumpTo"  data-step-nr="${step.nr}" ${detailNr}><span>${step.bulletText}</span></div>`;
    }

    function render(){
        let template = `
            <div class="tour-placeHolder" data-event-class="Tour" data-show-bullet-text="${showBulletText}" >
                <a role="button" tabindex="0" id="dummyFocus"  data-event-class="Tour" ></a>
                <div class="step-bar"></div>
                <div class="tour-body">
                    <div class="tour-title">${title}
                    <i class="fa fa-close" data-event-class="Tour" data-click="skip" role="button" tabindex="0" class="tour-button"></i>
                    </div>
                    <div class="tour-image"><img src=""/></div>
                    <div class="tour-text"></div>
                    <div class="tour-navigation">
                        <div data-event-class="Tour" data-click="restart" role="button" tabindex="0" class="tour-button"><i class="fa fa-refresh" aria-hidden="true"></i><span>${getCapt('btnStart')}</span></div>
                        <div data-event-class="Tour" data-click="previous" role="button" tabindex="0" class="tour-button"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i><span>${getCapt('btnPrev')}</span></div>
                        <div data-event-class="Tour" data-click="next" role="button" tabindex="0" class="tour-button"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i><span>${getCapt('btnNext')}</span></div>
                        
                    </div>
                </div>
            </div>
            `;
        ModalPanel.open(template);

        let placeHolder = document.querySelector('.step-bar');
        placeHolder.innerHTML = steps.map(stepBullit).join('');

        show();

    }

    function focus(){
        a = document.querySelector('.tour-placeHolder a');
        a.focus();
    }

    function init(){
        steps = tours[id].steps;
        showBulletText = tours[id].showBulletText;
        title = tours[id].title;
        render();
    }
    function start (id){
        load(id,init );
    }

    function newTour(tourId, title,showStepBulletText=false){
        id = tourId;
        tours[id] = {
            title:title,
            showBulletText:showStepBulletText,
            steps:[]
        };
    }

    function getDots(){
        let main = document.querySelector(`[data-step-nr="${currentStep}"]`),
            detail = document.querySelector(`[data-step-nr="${currentStep}"][data-step-detail-nr="${currentDetail}"]`);
        if(!main){return null;}
        return{
          main:main,
          detail:detail,
          isOpen:main.dataset.workflowStep=="open",
          hasDetail:main.dataset.workflowStep!="single"
        }
    }

    function getStep(){
        return steps[currentStep];
    }


    function show(){
        let step = steps[currentStep],
            dots = getDots();
        focus();
        if(!step){
           currentStep = steps.length -1;
           return;
        }

        dots.main.setAttribute("data-workflow-state","active");
        if(!dots.isOpen && dots.hasDetail && typeof currentDetail=='number'){
            open(dots.main)
            dots.detail.setAttribute("data-workflow-state","active");
        }
        if(dots.isOpen &&  dots.detail){
            dots.detail.setAttribute("data-workflow-state","active");
        }


        if(step.details && step.details[currentDetail]){
            step =  step.details[currentDetail];
        }
        document.querySelector(".tour-text").innerHTML = step.content;
        document.querySelector(".tour-title").innerHTML = step.title;
        document.querySelector(".tour-image img").src = `${TourDir}/${id}/img/${step.image}`;
    }

    function closeAll(){
        P.setAttributesToNodeList('[data-workflow-step="open"]',"data-workflow-step","open");
        P.setAttributesToNodeList('.step-detail[data-hidden="false"]',"data-hidden","true");
    }

    function jumpTo(ev){
        let obj = ev.invokeObject,
            ds = obj.dataset,
            step = ds.stepNr,
            detail = ds.stepDetailNr,
            state = ds.workflowStep,
            dots = getDots();

        if(dots.main && dots.main.dataset.stepNr != step){
            done(dots.main);
        }
        if(dots.detail && dots.detail.dataset.stepDetailNr != detail){
            done(dots.detail);
        }

        currentStep = step;
        currentDetail = detail || 0;
        if(state =="closed"){
            closeAll();
            open(obj);
            currentDetail = null;
        }

        show();
    }

    function done(obj){
        if(!obj){return;}
        obj.setAttribute("data-workflow-state","done");
    }

    function close(obj){
        if(obj.dataset.workflowStep != "open"){
            return;
        }
        let details = obj.nextElementSibling;
            obj.setAttribute("data-workflow-step","closed");
            details.setAttribute("data-hidden", "true");
            currentDetail = null;
    }

    function open(obj){
        let details = obj.nextElementSibling;
            obj.setAttribute("data-workflow-step","open");
            details.setAttribute("data-hidden", "false");
    }

    function next(){
        let dots = getDots(),
            step = getStep();
        if(!(dots && step)){
            return;
        }
        if(!dots.hasDetail){
            done(dots.main);
            currentDetail = null
            currentStep++;
            show();
            return;
        }
        if(dots.isOpen){
            done(dots.detail)
            currentDetail++
            if(currentDetail >= step.details.length){
                done(dots.main);
                close(dots.main);
                currentStep++;
            }
            show();
            return;
        }
        currentDetail = 0;
        open(dots.main);
        show();
    }

    // function skip(){
    //     let dots = getDots();
    //     done(dots.detail);
    //     done(dots.main);
    //     close(dots.main);
    //     currentDetail = null;
    //     currentStep++;
    //     show();
    // }
    function setLastDetail(){
        let step = getStep();
        if(step.details){
            currentDetail = step.details.length-1;
        }
    }
    function previous(){
        let dots = getDots();
        if(currentDetail>0){
            currentDetail--;
            done(dots.detail);
            show();
            return;
        }

        if(currentStep <=0){
            return;
        }
        done(dots.main);
        if(currentDetail==0){
            close(dots.main);
        }else{
            currentStep--;
            setLastDetail();
        }
        show();
    }

    function restart(){
        currentStep = 0;
        currentDetail = null;
        start(id);
    }

    function keydown(ev){
        switch(ev.keyCode){
            case keyCode.escape:
            case keyCode.F12:
                ModalPanel.click();
                break;
            case keyCode.arrowUp:
            case keyCode.arrowLeft:
                previous();
                break;
            // case keyCode.arrowRight:
            // case keyCode.arrowDown:
            //     skip();
            default:
                next();

        }
        return false;
    }


    function click(ev){
        next();
    }
    function startTour(ev){
        tour = ev.invokeObject.dataset.tourId;
        start(tour);
    }

    this.startTour = startTour;
    this.keydown = keydown;
    this.add = add;
    this.addDetail = addDetail;
    this.start = start;
    this.restart = restart;
    this.close = ModalPanel.close;
    this.previous = previous;
    this.new = newTour;
    this.next = next;
    this.jumpTo = jumpTo;
    this.click = click;
    this.load = load;
}).apply( Tour);



function testTour(){
    Tour.start('tour1');
}