var e=[], evt, evtState="idle", objectUI, eN=0;
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

function hitXY(x,y) {
    trace("hitXY("+x+","+y+")");
    for (let i=uictx.length-1; i>=0; i--) {
        if (uictx[i].hitXY(x-canvas.getBoundingClientRect().left,y-canvas.getBoundingClientRect().top)) {
            return uictx[i]; 
        }
    }
    for (let i=uidebugctx.length-1; i>=0; i--) {
        if (uidebugctx[i].hitXY(x-debugcanvas.getBoundingClientRect().left,y-debugcanvas.getBoundingClientRect().top)) {
            return uidebugctx[i]; 
        }
    }
    return null;
}

var keypressOnlyOnce=false;
function eventInit(canvas) {
    trace("mouseInit");
    if (!keypressOnlyOnce) {
        keypressOnlyOnce=true;
        document.addEventListener('keypress', function(event) {
            new EventUI("keypress",Date.now(),null,event.key,event.code);
        }, false);
    }   
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
        log("listen touchstart:"+objectUI.class+" "+objectUI.name);
        if (objectUI!=null) {
            event.preventDefault();
            moveCounter=turnSensitity;
            new EventUI("touchstart",Date.now(),objectUI,mouseDownX,mouseDownY);
            evtState="touchstart";
        }
    }, false);
    canvas.addEventListener('mousemove', function(event) {
        if (evtState=="mousedown") {
            event.preventDefault();
            if (e.length>0 && e[0].name=="mousemove") e.shift();
            new EventUI("mousemove",Date.now(),objectUI,event.clientX,event.clientY);
        }
    }, false);
    canvas.addEventListener('touchmove', function(event) {
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
    canvas.addEventListener('mouseup', function(event) {
        if (evtState=="mousedown") {
            event.preventDefault();
            objectUI=hitXY(event.clientX,event.clientY);
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
            objectUI=hitXY(event.changedTouches[0].clientX,event.changedTouches[0].clientY);
            new EventUI("touchend",Date.now(),objectUI,event.changedTouches[0].pageX,event.changedTouches[0].pageY);
            evtState="idle";
        }
    }, false);
    canvas.addEventListener('touchcancel', function(event) {
        if (evtState=="touchstart") {
            event.preventDefault();
            objectUI=hitXY(event.changedTouches[0].clientX,event.changedTouches[0].clientY);
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
        if (evt.name=="keypress") {
            if (evt.x=="d") { b_debug.clickXY(0,0); draw(ctx); }
            else if (evt.x=="0") { b_reset.clickXY(0,0); draw(ctx); }
            else if (evt.x=="1") { b_presets[0].clickXY(0,0); draw(ctx); }
            else if (evt.x=="2") { b_presets[1].clickXY(0,0); draw(ctx); }
            else if (evt.x=="3") { b_presets[2].clickXY(0,0); draw(ctx); }
            else if (evt.x=="4") { b_presets[3].clickXY(0,0); draw(ctx); }
            else if (evt.x=="5") { b_presets[4].clickXY(0,0); draw(ctx); }
            else if (evt.x=="6") { b_presets[5].clickXY(0,0); draw(ctx); }
//            alert(`Key pressed ${evt.x} \r\n Key code value: ${evt.y}`);
        }
        else if (evt.name=="wheel") {
            evt.objectUI.turnY(evt.y);
            if (evt.objectUI.initChannelsNeeded) initChannels();
            draw(ctx);
        }
        else if (evt.name=="mousedown") {
            mouseDownObject=evt.objectUI;
            mouseDownY=evt.y;
            mouseMoved=false;
        }
        else if (evt.name=="touchstart") {
            mouseDownObject=evt.objectUI;
            mouseDownTime=evt.time;
            mouseDownY=evt.y;
            mouseMoved=false;
        }
        else if (evt.name=="mousemove") {
            if (mouseDownObject!=null) {
                mouseDownObject.turnY(mouseDownY-evt.y);
                mouseDownY=evt.y;
                mouseMoved=true;
                if (mouseDownObject.initChannelsNeeded) initChannels();
                draw(ctx);
            }
        }
        else if (evt.name=="touchmove") {
            if (mouseDownObject!=null) {
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
                    (!mouseMoved || mouseDownObject.class=="Button")) {
                    evt.objectUI.clickXY(evt.x,evt.y);
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
                    (!mouseMoved || mouseDownObject.class=="Button" || 
                    mouseDownObject.class=="Knob" && evt.time-mouseDownTime<200 )) {
                    mouseDownObject.clickXY(evt.x,evt.y);
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
    setTimeout(processEvent,10);
}
