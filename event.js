var e=[], evt, evtState="idle", objectUI, eN=0, mouseDownObject=null, mouseDownX, mouseDownY, mouseMoved;

class EventUI {
    constructor(pName,pTime,pObjectUI,pX,pY) {
        this.n=eN++;
        this.name=pName;
        this.time=pTime;
        this.objectUI=pObjectUI;
        this.x=pX;
        this.y=pY;
        e.push(this);
    }
}

function hitXY(x,y) {
    for (var i=ui.length-1; i>=0; i--) {
        if (ui[i].hitXY(x,y)) {
            return ui[i]; 
        }
    }
    return null;
}

function mouseInit(canvas) {
    canvas.addEventListener('wheel', function(event) {
        objectUI=hitXY(event.clientX,event.clientY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("wheel",Date.now(),objectUI,0,-Math.sign(event.deltaY));
        }
    }, false);
    canvas.addEventListener('mousedown', function(event) {
        mouseDownX=event.clientX; mouseDownY=event.clientY;
        objectUI=hitXY(mouseDownX,mouseDownY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("mousedown",Date.now(),objectUI,mouseDownX,mouseDownY);
            evtState="mousedown";
        }
    }, false);
    canvas.addEventListener('touchstart', function(event) {
        mouseDownX=event.changedTouches[0].clientX; mouseDownY=event.changedTouches[0].clientY;
        objectUI=hitXY(mouseDownX,mouseDownY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("touchstart",Date.now(),objectUI,mouseDownX,mouseDownY);
            evtState="touchstart";
        }
    }, false);
    canvas.addEventListener('mousemove', function(event) {
        if (evtState=="mousedown" && 
        (Math.abs(event.clientX-mouseDownX)>1 || Math.abs(event.clientY-mouseDownY)>1)) {
            event.preventDefault();
            if (e.length>0 && e[0].name=="mousemove") e.shift();
            new EventUI("mousemove",Date.now(),objectUI,event.clientX,event.clientY);
        }
    }, false);
    canvas.addEventListener('touchmove', function(event) {
        if (evtState=="touchstart"&& 
        (Math.abs(event.changedTouches[0].clientX-mouseDownX)>1 || Math.abs(event.changedTouches[0].clientY-mouseDownY)>1)) {
            event.preventDefault();
            if (e.length>0 && e[0].name=="touchmove") e.shift();
            new EventUI("touchmove",Date.now(),objectUI,event.changedTouches[0].clientX,event.changedTouches[0].clientY);
        }
    }, false);
    canvas.addEventListener('mouseup', function(event) {
        if (evtState=="mousedown") {
            objectUI=hitXY(event.clientX,event.clientY);
            event.preventDefault();
            new EventUI("mouseup",Date.now(),objectUI,event.clientX,event.clientY);
            evtState="idle";
        }
    }, false);
    canvas.addEventListener('mouseout', function(event) {
        if (evtState=="mousedown") {
            event.preventDefault();
            new EventUI("mouseup",Date.now(),objectUI,event.clientX,event.clientY);
            evtState="idle";
        }
    }, false);
    canvas.addEventListener('touchend', function(event) {
        if (evtState=="touchstart") {
            event.preventDefault();
            new EventUI("touchend",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
            evtState="idle";
        }
    }, false);
}

function processEvent() {
    if (e.length>0) {
        evt=e.shift();
        if (evt.name=="wheel") {
            evt.objectUI.turnY(evt.y);
            initChannels();
            draw(ctx);
        }
        else if (evt.name=="mousedown") {
            mouseDownObject=evt.objectUI;
            mouseDownY=evt.y;
            mouseMoved=false;
        }
        else if (evt.name=="touchstart") {
            mouseDownObject=evt.objectUI;
            mouseDownY=evt.y;
            mouseMoved=false;
        }
        else if (evt.name=="mousemove") {
            if (mouseDownObject!=null) {
                mouseDownObject.turnY(mouseDownY-evt.y);
                mouseDownY=evt.y;
                mouseMoved=true;
                initChannels();
                draw(ctx);
            }
        }
        else if (evt.name=="touchmove") {
            if (mouseDownObject!=null) {
                mouseDownObject.turnY(mouseDownY-evt.y);
                mouseDownY=evt.y;
                mouseMoved=true;
                initChannels();
                draw(ctx);
            }
        }
        else if (evt.name=="mouseup") {
            if (mouseDownObject!=null) {
                if (mouseDownObject==evt.objectUI && !mouseMoved) {
                    evt.objectUI.clickXY(evt.x,evt.y);
                    initChannels();
                    draw(ctx);
                }
            }
            mouseDownObject=null;
        }
        else if (evt.name=="touchend") {
            if (mouseDownObject!=null && mouseDownObject==evt.objectUI && !mouseMoved) {
                evt.objectUI.clickXY(evt.x,evt.y);
                initChannels();
                draw(ctx);
            }
            mouseDownObject=null;
        }
        objectUI=evt.objectUI;
        if (objectUI==null) log("ctx:"+evt.name);
        else log(evt.name+":"+objectUI.name+":"+objectUI.getValue());
    }
    setTimeout(processEvent,10);
}
