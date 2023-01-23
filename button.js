// Button Label position per pType
var xpos={"power":0,"on":-29, "small":0,"siggen":-29,"readout":-40};
var ypos={"power":-27,"on":0,"small":-15,"siggen":0,"readout":0};

var grd; // for grad on Canvas

class Button extends pObject {
    constructor(ctx,pX,pY,pW,pH,pLabel,pType,pShow=true) {
        super(ctx,pX,pY,pW,pH);
        this.class="Button";
        this.name=pLabel;
        this.radio=null;
        this.img_on=led_on;
        this.img_off=led_off;
        this.live=true;
        this.cX=pX+pW/2;
        this.cY=pY+pH/2;
        this.state=0;
        this.type=pType;
        this.show=pShow;
        if (pShow) {
            uipush(this);
            this.label=new Label(ctx,this.cX,this.cY,pLabel,pType=="small"?12:(pType=="on"?12:(pType=="siggen"?15:(pType=="readout"?12:15))));
            this.setLabelXY(pType);
        }
        buttons.push(this);
    }
    getValue() {
        return this.state;
    }
    callSwitchOff() {
        this.state=0;
        draw(ctx);
    }
    setLabelXY(pType) {
        this.label.adjustXY(xpos[pType],ypos[pType]);
    }
    clickXY(x,y) {
        if (this.radio!=null) {
            this.radio.reset();
            this.state=1;
        }
        else {
            this.state=1-this.state;
        }
        super.clickXY(x,y);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,0,0,0.75)";
            roundRect(ctx,this.x-1,this.y-1,this.w+1,this.h+1,2);
        ctx.fill();
        ctx.beginPath();
        var shadowD=this.type=="power"?5:3;
        var shadowR=this.type=="power"?1:3;
        ctx.fillStyle = shadowcolor;
            roundRect(ctx,this.x,this.y,this.w+shadowD-1,this.h+shadowD,shadowR);
        ctx.fill();
        ctx.drawImage(this.state==1?this.img_on:this.img_off,this.x,this.y,this.w,this.h);
        super.draw(ctx);
    }
}
class PowerButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
        this.img_on=led_on_powers;
        this.img_off=led_off_powers;
        buttons.splice(-1); // remove this last power button from buttons
    }
    clickXY(x,y) {
        // power switch-on event
        if (this.state==0) {
            b_auto.state=1;
            for (let i=0; i<2; i++) {
                siggen[i].b_ch.state=1;
                scope.ch[i].b_dc.state=1;
            }
            k_monitor.callSwitchOff();
            powerState="start"; powerValue=80.0; setTimeout(setPower,10);
        }
        // power switch-off event
        if (this.state==1) {
            for (let i=0; i<buttons.length; i++) {
                buttons[i].callSwitchOff();
            }
            k_monitor.callSwitchOff();
            powerState="off";
        }
        super.clickXY(x,y);
        if (this.state==1) {
            k_mode.setButtonValue();
        }
    }
}
function setPower() {
    trace("setPower");
    if (powerState=="start") {
        powerValue+=10;
        draw(ctx);
        if (powerValue>230) { powerState="off"; draw(ctx); }
        else setTimeout(setPower,100);
    }
}
class ChOnButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            super.clickXY(x,y);
        }
    }
}
class IndicatorLed extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
        this.img_on=led_red;
        this.img_off=led_off;
        this.live=false;
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            super.clickXY(x,y);
        }
    }
    showRed() {
        if (b_power.state==1) {
            this.state=1;
        }
    }
}
class FindButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
        findState="off";
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            super.clickXY(x,y);
            if (this.state==1) { findState="search"; findValue=1.0; setTimeout(setFind,5); }
            else if (this.state==0) findState="off";
            // findState: "search"/"found"/"off", y/findValue displayed
        }
    }
}
function setFind() {
    trace("setFind");
    if (findState=="search") {
        findValue*=1.2;
        draw(ctx);
        setTimeout(setFind,5);
    }
}
function reset() {
    for (let i=0; i<uictx.length; i++) {
        if (!isNaN(uictx[i].ticks)) {
            uictx[i].reset();
        }
    }
}
class PresetManager {
    constructor() {
        this.presetDelay=50;
        this.timeCursor;
    }
    reset() {
        this.timeCursor=Date.now();
    }
    add(pNo,pEvent,pObject,pX,pY,pDelay=-1) {
        for (let i=0; i<pNo; i++) {
            new EventUI(pEvent,this.timeCursor,pObject,pX,pY);
            this.timeCursor+=pDelay==-1?this.presetDelay:pDelay;
        }
    }
}
class DebugButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(debugctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        super.clickXY(x,y);
        if (this.name=="Debug") {
            if (this.state==1) { 
                logWindow.removeAttribute("hidden"); 
                debugcanvas.removeAttribute("hidden"); 
            }
            else if (this.state==0) {
                logWindow.setAttribute("hidden","hidden");
                debugcanvas.setAttribute("hidden","hidden");
            }
        }
        else if (this.name=="Reset") {
            if (this.state==1) { 
                reset();
                initChannels();
                draw(ctx);
                setTimeout(()=>{b_reset.callSwitchOff();},500);
            }
        }
        else if (this.name.substring(0,6)=="Preset") {
            if (this.state==1) { 
                var pri=parseInt(this.name.substring(6));
                reset();
                if (pri==0) {
                    presetManager.reset();
                    presetManager.add(3,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(4,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(3,"wheel",siggen[0].k_freq.k,0,-1);
                    presetManager.add(30,"wheel",siggen[1].k_freq.k,0,-1,7);
                    presetManager.add(2,"wheel",k_mode,0,1);
                    presetManager.add(7,"wheel",k_time.k,0,-1,7);
                    initChannels();
                    presetManager.add(1,"wheel",k_monitor,0,-1);
                }
                else if (pri==1) {
                    presetManager.reset();
                    presetManager.add(2,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(3,"wheel",k_mode,0,1);
                    presetManager.add(15,"wheel",k_rot,0,1,20);
                    presetManager.add(30,"wheel",k_rot,0,-1,20);
                    presetManager.add(15,"wheel",k_rot,0,1,20);
                    presetManager.add(1,"mousedown",siggen[1].b_phalf,0,0);
                    presetManager.add(1,"mouseup",siggen[1].b_phalf,0,0);
                    presetManager.add(15,"wheel",scope.ch[0].k_ypos,0,-1,7);
                    presetManager.add(15,"wheel",scope.ch[1].k_ypos,0,-1,7);
                    presetManager.add(10,"wheel",siggen[1].k_dc.k,0,-1);
                    presetManager.add(48,"wheel",siggen[1].k_dc.k,0,1,7);
                    presetManager.add(1,"mousedown",siggen[1].b_phalf,0,0);
                    presetManager.add(1,"mouseup",siggen[1].b_phalf,0,0);
                }
                else if (pri==2) {
                    presetManager.reset();
                    presetManager.add(2,"wheel",k_mode,0,-1);
                    presetManager.add(4,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,1);
                    presetManager.add(7,"wheel",k_time.k,0,1);
                    presetManager.add(7,"wheel",k_delaybase.k,0,1,7);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(5,"wheel",scope.ch[0].k_volts.k_,0,1);
                }
                else if (pri==3) {
                    presetManager.reset();
                    presetManager.add(20,"wheel",siggen[0].k_freq.k,0,1,1);
                    presetManager.add(70,"wheel",siggen[1].k_freq.k,0,1,1);
                    presetManager.add(3,"wheel",k_time.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[1].k_volts.k_,0,-1);
                    presetManager.add(3,"wheel",k_mode,0,-1);
                    presetManager.add(300,"wheel",siggen[1].k_phase.k_,0,1,1);
                }
                else if (pri==4) {
                    presetManager.reset();
                    presetManager.add(6,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(6,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(6,"wheel",siggen[1].k_phase.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(3,"wheel",k_mode,0,-1);
                    presetManager.add(1,"wheel",k_delay,0,1,500); // delay
                    presetManager.add(2,"wheel",siggen[0].k_func.k_,0,1,100);
                    presetManager.add(2,"wheel",siggen[1].k_func.k_,0,1,100);
                    presetManager.add(1,"wheel",k_delay,0,1,500); // delay
                    presetManager.add(2,"wheel",siggen[0].k_func.k_,0,1,100);
                    presetManager.add(2,"wheel",siggen[1].k_func.k_,0,1,100);
                    presetManager.add(1,"wheel",k_delay,0,1,500); // delay
                    presetManager.add(2,"wheel",siggen[0].k_func.k_,0,-1,1);
                    presetManager.add(2,"wheel",siggen[1].k_func.k_,0,-1,1);
                    presetManager.add(6,"wheel",k_time.k,0,-1);
                    presetManager.add(100,"wheel",k_delay.k_,0,1,20);
                }
                else if (pri==5) {
                    presetManager.reset();
                    presetManager.add(1,"wheel",siggen[0].k_func.k,0,1);
                    presetManager.add(6,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k_,0,-1);
                    presetManager.add(5,"wheel",siggen[1].k_freq.k,0,1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(3,"wheel",k_mode,0,-1);
                }
                initChannels();
                draw(ctx);
                setTimeout(()=>{b_presets[pri].callSwitchOff();},500);
            }
        }
    }
}
class AutotestButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(debugctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        super.clickXY(x,y);
        clearTimeout(attimer);
        if (this.state==1) attimer=setTimeout(autotest,100);
    }
}
class MicButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            super.clickXY(x,y);
            if (this.state==1) {
                clearTimeout(micTimeout);
                recordAudio();
//            micTimeout=setTimeout(function(){b_mic.callSwitchOff();},10000);
            }
            else if (this.state==0) {
                this.switchOff();
            }
        }
    }
    callSwitchOff() {
        if (this.state==1) {
            super.clickXY(0,0);
            this.switchOff();
            initChannels();
            draw(ctx);
        }
    }
    switchOff() {
        stopRecording();
        initChannels();
        draw(ctx);
    }
}
class PresetButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            super.clickXY(x,y);
            if (this.state==1) {
                for(var i=0; i<uictx.length; i++) {
                    if (!isNaN(uictx[i].ticks)) {
                        uictx[i].value=Math.floor(Math.random()*uictx[i].ticks);
                    }
                }
                initChannels();
                draw(ctx);
                setTimeout(()=>{b_preset.callSwitchOff();},500);
            }
            else if (this.state==0) this.callSwitchOff();
        }
    }
    callSwitchOff() {
        if (this.state==1) {
            super.clickXY(0,0);
            draw(ctx);
        }
    }
}
class Radio extends pObject {
    constructor(pX,pY,pListButtons,pShow=true) {
        super(ctx,pX,pY,25,pListButtons.length*dButton);
        this.name="Radio";
        this.live=false;
        this.b=pListButtons;
        this.show=pShow;
        for (let i=0; i<pListButtons.length; i++) {
            pListButtons[i].radio=this;
            pListButtons[i].x=pX;
            pListButtons[i].y=pY+i*dButton;
            if (pShow) pListButtons[i].label.adjustXY(0,i*dButton);
        }
        uictx.push(this);
    }
    reset() {
        for (let i=0; i<this.b.length; i++) {
                this.b[i].state=0;
        }
    }
}
