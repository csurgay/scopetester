var e=[], evt, objectUI, eN=0, mouseDownObject, mouseDownY, mouseMoved;

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
        objectUI=hitXY(event.clientX,event.clientY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("mousedown",Date.now(),objectUI,event.clientX,event.clientY);
        }
    }, false);
    canvas.addEventListener('mousemove', function(event) {
        if (mouseDownObject!=null) {
            if (e.length>0 && e[0].name=="mousemove") e.shift();
            new EventUI("mousemove",Date.now(),objectUI,event.clientX,event.clientY);
        }
    }, false);
    canvas.addEventListener('mouseup', function(event) {
        objectUI=hitXY(event.clientX,event.clientY);
        event.preventDefault();
        new EventUI("mouseup",Date.now(),objectUI,event.clientX,event.clientY);
    }, false);
    canvas.addEventListener('mouseout', function(event) {
        objectUI=hitXY(event.clientX,event.clientY);
        event.preventDefault();
        new EventUI("mouseup",Date.now(),objectUI,event.clientX,event.clientY);
    }, false);
    canvas.addEventListener('touchstart', function(event) {
        objectUI=hitXY(event.clientX,event.clientY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("touchstart",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
        }
    }, false);
    canvas.addEventListener('touchmove', function(event) {
        new EventUI("touchmove",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
    }, false);
    canvas.addEventListener('touchend', function(event) {
        objectUI=hitXY(event.clientX,event.clientY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("touchend",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
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
        else if (evt.name=="mousemove") {
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
        else if (evt.name=="touchstart") {
            mouseDownObject=evt.objectUI;
            mouseDownY=evt.y;
            mouseMoved=false;
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
        else if (evt.name=="touchend") {
            if (mouseDownObject==evt.objectUI && !mouseMoved) {
                evt.objectUI.clickXY(evt.x,evt.y);
                initChannels();
                draw(ctx);
            }
            mouseDownObject=null;
        }
    }
    setTimeout(processEvent,10);
}
