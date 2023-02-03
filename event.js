var e=[], epreset=[], evt, evtState="idle", objectUI, eN=0;
var mouseDownObject=null, mouseDownX, mouseDownY, mouseMoved, mouseDownTime;
var turnSensitity=240; // move if deltaY >= turnSensitivity/knob.ticks

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
class EventPreset extends EventUI {
    constructor(pName,pTime,pObjectUI,pX,pY) {
        super(pName,pTime,pObjectUI,pX,pY);
        e.splice(-1);
        epreset.push(this);
    }
}

function hitXY(pCanvas,x,y) {
    trace("hitXY("+x+","+y+")");
    if (pCanvas==canvas) {
        for (let i=uictx.length-1; i>=0; i--) {
            if (uictx[i].hitXY(x-canvas.getBoundingClientRect().left,y-canvas.getBoundingClientRect().top)) {
                return uictx[i]; 
            }
        }
    }
    else if (pCanvas==debugcanvas) {
        for (let i=uidebugctx.length-1; i>=0; i--) {
            if (uidebugctx[i].hitXY(x-debugcanvas.getBoundingClientRect().left,y-debugcanvas.getBoundingClientRect().top)) {
                return uidebugctx[i]; 
            }
        }
    }
    return null;
}

var keypressOnlyOnce=false, moveCounter;
function eventInit(pCanvas) {
    trace("mouseInit");
    if (!keypressOnlyOnce) {
        keypressOnlyOnce=true;
        document.addEventListener('keypress', function(event) {
            new EventUI("keypress",Date.now(),null,event.key,event.code);
        }, false);
    }   
    pCanvas.addEventListener('wheel', function(event) {
        objectUI=hitXY(pCanvas,event.clientX,event.clientY);
        if (objectUI!=null) {
            event.preventDefault();
            new EventUI("wheel",Date.now(),objectUI,0,-Math.sign(event.deltaY));
        }
    }, false);
    pCanvas.addEventListener('mousedown', function(event) {
        if (event.which==1) {
            mouseDownX=event.clientX; mouseDownY=event.clientY;
            objectUI=hitXY(pCanvas,mouseDownX,mouseDownY);
            if (objectUI!=null) {
                event.preventDefault();
                new EventUI("mousedown",Date.now(),objectUI,mouseDownX,mouseDownY);
                evtState="mousedown";
            }
        }
    }, false);
    pCanvas.addEventListener('touchstart', function(event) {
        mouseDownX=event.changedTouches[0].clientX; mouseDownY=event.changedTouches[0].clientY;
        objectUI=hitXY(pCanvas,mouseDownX,mouseDownY);
        log("listen touchstart:"+objectUI.class+" "+objectUI.name);
        if (objectUI!=null) {
            event.preventDefault();
            moveCounter=turnSensitity;
            new EventUI("touchstart",Date.now(),objectUI,mouseDownX,mouseDownY);
            evtState="touchstart";
        }
    }, false);
    pCanvas.addEventListener('mousemove', function(event) {
        if (evtState=="mousedown") {
            event.preventDefault();
            if (e.length>0 && e[0].name=="mousemove") e.shift();
            new EventUI("mousemove",Date.now(),objectUI,event.clientX,event.clientY);
        }
    }, false);
    pCanvas.addEventListener('touchmove', function(event) {
        if (evtState=="touchstart") {
            event.preventDefault();
            if (e.length>0 && e[0].name=="touchmove") e.shift();
            var needMove=true;
            if (mouseDownObject!=null && mouseDownObject.class=="Knob") {
                needMove=false;
                moveCounter-=mouseDownObject.ticks;
                if (moveCounter<=0) {
                    needMove=true;
                    moveCounter=turnSensitity;
                }
            }
            if (needMove) new EventUI("touchmove",Date.now(),objectUI,event.changedTouches[0].clientX,event.changedTouches[0].clientY);
        }
    }, false);
    pCanvas.addEventListener('mouseup', function(event) {
        if (evtState=="mousedown") {
            event.preventDefault();
            objectUI=hitXY(pCanvas,event.clientX,event.clientY);
            new EventUI("mouseup",Date.now(),objectUI,event.clientX,event.clientY);
            evtState="idle";
        }
    }, false);
    pCanvas.addEventListener('mouseout', function(event) {
        if (evtState=="mousedown") {
            event.preventDefault();
            new EventUI("mouseup",Date.now(),objectUI,event.clientX,event.clientY);
            evtState="idle";
        }
    }, false);
    pCanvas.addEventListener('touchend', function(event) {
        if (evtState=="touchstart") {
            event.preventDefault();
            objectUI=hitXY(pCanvas,event.changedTouches[0].clientX,event.changedTouches[0].clientY);
            new EventUI("touchend",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
            evtState="idle";
        }
    }, false);
    pCanvas.addEventListener('touchcancel', function(event) {
        if (evtState=="touchstart") {
            event.preventDefault();
            objectUI=hitXY(pCanvas,event.changedTouches[0].clientX,event.changedTouches[0].clientY);
            new EventUI("touchend",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
            evtState="idle";
        }
    }, false);
}

function processEvent() {
    if (e.length>0) {
        trace("processEvent");
        evt=e.shift();
        while(Date.now()<evt.time) ;
        actionEvent(evt);
    }
    else if (epreset.length>0) {
        evt=epreset.shift();
        while(Date.now()<evt.time) ;
        actionEvent(evt);
    }
    setTimeout(processEvent,10);
}

function actionEvent(evt) {
    if (evt.name=="keypress") {
        if (evt.x=="d") { b_debug.clickXY(0,0); draw(ctx); }
        else if (evt.x=="0") { b_reset.clickXY(0,0); draw(ctx); }
        else if (evt.x=="1") { b_presets[0].clickXY(0,0); draw(ctx); }
        else if (evt.x=="2") { b_presets[1].clickXY(0,0); draw(ctx); }
        else if (evt.x=="3") { b_presets[2].clickXY(0,0); draw(ctx); }
        else if (evt.x=="4") { b_presets[3].clickXY(0,0); draw(ctx); }
        else if (evt.x=="5") { b_presets[4].clickXY(0,0); draw(ctx); }
        else if (evt.x=="6") { b_presets[5].clickXY(0,0); draw(ctx); }
        else if (evt.x=="7") { b_presets[6].clickXY(0,0); draw(ctx); }
        else if (evt.x=="8") { b_presets[7].clickXY(0,0); draw(ctx); }
        else if (evt.x=="9") { b_presets[8].clickXY(0,0); draw(ctx); }
//            alert(`Key pressed ${evt.x} \r\n Key code value: ${evt.y}`);
    }
    else if (evt.name=="wheel") {
        evt.objectUI.turnY(evt.y);
        if (evt.objectUI.initChannelsNeeded) initChannels();
        draw(ctx);
    }
    else if (evt.name=="mousedown") {
        mouseDownObject=evt.objectUI;
        mouseDownTime=evt.time;
        mouseDownY=evt.y;
        mouseMoved=false;
        if (mouseDownObject.class=="PushButton") {
            mouseDownObject.showPushed("pushillum");
            if (mouseDownObject.radio!=null)
                mouseDownObject.radio.showNoPush(mouseDownObject);
        }
    }
    else if (evt.name=="touchstart") {
        mouseDownObject=evt.objectUI;
        mouseDownTime=evt.time;
        mouseDownY=evt.y;
        mouseMoved=false;
        if (mouseDownObject.class=="PushButton") {
            mouseDownObject.showPushed("pushillum");
        }
    }
    else if (evt.name=="mousemove") {
        if (mouseDownObject!=null && mouseDownObject.class!="Button" && mouseDownObject.class!="PushButton") {
            mouseDownObject.turnY(mouseDownY-evt.y);
            mouseDownY=evt.y;
            mouseMoved=true;
            if (mouseDownObject.initChannelsNeeded) initChannels();
            draw(ctx);
        }
    }
    else if (evt.name=="touchmove") {
        if (mouseDownObject!=null && mouseDownObject.class!="Button" && mouseDownObject.class!="PushButton") {
            mouseDownObject.turnY(mouseDownY-evt.y);
            mouseDownY=evt.y;
            mouseMoved=true;
            if (mouseDownObject.initChannelsNeeded) initChannels();
            draw(ctx);
        }
    }
    else if (evt.name=="mouseup") {
        if (mouseDownObject!=null) {
            if (mouseDownObject==evt.objectUI && 
                (!mouseMoved || mouseDownObject.class=="Button" || mouseDownObject.class=="PushButton")) {
                if (mouseDownObject.class=="Knob"
                    && evt.objectUI.pullable
                    && evt.time-mouseDownTime>300) {
                    evt.objectUI.pullpush();
                } 
                else {
                    evt.objectUI.clickXY(evt.x,evt.y);
                }
                if (mouseDownObject.initChannelsNeeded) initChannels();
                draw(ctx);
            }
        }
        mouseDownObject=null;
    }
    else if (evt.name=="touchend") {
        if (mouseDownObject!=null) {
            log("deltaT:"+(evt.time-mouseDownTime));
            if (mouseDownObject==evt.objectUI && 
                (!mouseMoved || mouseDownObject.class=="Button" || mouseDownObject.class=="PushButton" || 
                mouseDownObject.class=="Knob" && evt.time-mouseDownTime<200 )) {
                if (mouseDownObject.class=="Knob"
                    && evt.objectUI.pullable
                    && evt.time-mouseDownTime>300) {
                    evt.objectUI.pullpush();
                }
                else {
                    mouseDownObject.clickXY(evt.x,evt.y);
                }
                if (mouseDownObject.initChannelsNeeded) initChannels();
                draw(ctx);
            }
        }
        mouseDownObject=null;
    }
    objectUI=evt.objectUI;
    // if (objectUI==null) log("ctx:"+evt.name);
    // else log(evt.name+":"+objectUI.name+":"+objectUI.getValue());
}
