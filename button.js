// Button Label position per pType
var xpos={"power":0,"on":-29, "small":0,"siggen":-32,"readout":-40};
var ypos={"power":-27,"on":0,"small":-15,"siggen":-3,"readout":0};

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
        var shadowD=this.type=="power"?3:2;
        var shadowR=this.type=="power"?1:2;
        ctx.fillStyle = shadowcolor;
            roundRect(ctx,this.x,this.y,this.w+shadowD-1,this.h+shadowD,shadowR);
        ctx.fill();
        if (b_power.state==0 || this.state==0) {
            ctx.drawImage(this.img_off,this.x+2,this.y+2,this.w-4,this.h-4);
        }
        else {
            ctx.drawImage(this.img_on,this.x,this.y,this.w,this.h);
        }
        super.draw(ctx);
    }
}
var pbl1=1, pbl2=1, pbq=1, pbw=28, pbh=19;
class PushButton extends Button {
    constructor(ctx,pX,pY,pW,pH,pLabel,pType,pShow) {
        super(ctx,pX,pY,pW,pH,pLabel,pType,pShow);
        this.class="PushButton";
        this.illum=true;
    }
    showPushed(offpushon) {
        if (offpushon=="off") this.draw(this.ctx,[3,2]);
        else if (offpushon=="offnoillum") this.draw(this.ctx,[3,2],"noillum");
        else if (offpushon=="push") this.draw(this.ctx,[-1,-1]);
        else if (offpushon=="pushillum") this.draw(this.ctx,[-1,-1],"illum");
        else if (offpushon=="on") this.draw(this.ctx,[0,0]);
    }
    draw(ctx, outxy=[-17,-17], pIllum="none") {
        if (outxy[0]==-17) {
            outxy=this.state==1?[0,0]:[3,2];
        }
        var pbx=this.x, pby=this.y, pbdx=this.w, pbdy=this.h;
        ctx.beginPath(); // gray border
        ctx.fillStyle="rgb(135,135,135)";
        // ctx.fillRect(pbx,pby,pbdx,pbdy);
        roundRect(ctx,pbx,pby,pbdx,pbdy,3);
        ctx.fill();
        ctx.beginPath(); // black hole
        ctx.fillStyle="rgb(35,35,35)";
        ctx.fillRect(pbx+pbl1,pby+pbl1,pbdx-2*pbl1,pbdy-2*pbl1);
        ctx.fill();
        ctx.beginPath(); // front plane
        ctx.fillStyle="rgb(120,120,120)";
        roundRect(ctx,pbx +outxy[0] +pbl1+pbl2 +pbq, pby +outxy[1] +pbl1+pbl2 +pbq, 
            pbdx -2*(pbl1+pbl2+pbq), pbdy-2*(pbl1+pbl2+pbq),1);
        ctx.fill();
        ctx.beginPath(); // left plane
        ctx.fillStyle="rgb(90,90,90)";
        ctx.moveTo(pbx +pbl1+pbl2, pby +pbl1+pbl2);
        ctx.lineTo(pbx +outxy[0] +pbl1+pbl2 +pbq, pby +outxy[1] +pbl1+pbl2 +pbq);
        ctx.lineTo(pbx +outxy[0] +pbl1+pbl2 +pbq, pby +outxy[1] +pbl1+pbl2 +pbq +pbdy-2*(pbl1+pbl2+pbq));
        ctx.lineTo(pbx +pbl1+pbl2, pby +pbl1+pbl2 +pbdy-2*(pbl1+pbl2));
        ctx.lineTo(pbx+pbl1+pbl2,pby+pbl1+pbl2 +pbq);
        ctx.fill();
        ctx.beginPath(); // top plane
        ctx.fillStyle="rgb(150,150,150)";
        ctx.moveTo(pbx +pbl1+pbl2, pby +pbl1+pbl2);
        ctx.lineTo(pbx +outxy[0] +pbl1+pbl2 +pbq, pby +outxy[1] +pbl1+pbl2 +pbq);
        ctx.lineTo(pbx +outxy[0] +pbl1+pbl2 +pbq +pbdx -2*(pbl1+pbl2 +pbq), pby +outxy[1] +pbl1+pbl2 +pbq);
        ctx.lineTo(pbx +pbl1+pbl2 +pbdx -2*(pbl1+pbl2), pby +pbl1+pbl2);
        ctx.lineTo(pbx +pbl1+pbl2, pby +pbl1+pbl2);
        ctx.fill();
        if (this.illum) {
            if (pIllum=="illum" && b_power.state==1) {
                ctx.drawImage(this.img_on,pbx +outxy[0] +pbl1+pbl2+pbq, pby +outxy[1] +pbl1+pbl2+pbq, 
                    pbdx -2*(pbl1+pbl2+pbq), pbdy-2*(pbl1+pbl2+pbq));    
            }
            else if (pIllum=="noillum" || b_power.state==0) {
            ctx.drawImage(this.img_off,pbx +outxy[0] +pbl1+pbl2+pbq, pby +outxy[1] +pbl1+pbl2+pbq, 
                pbdx -2*(pbl1+pbl2+pbq), pbdy-2*(pbl1+pbl2+pbq));    
            }
            else {
                ctx.drawImage(this.state==1?this.img_on:this.img_off,pbx +outxy[0] +pbl1+pbl2+pbq, pby +outxy[1] +pbl1+pbl2+pbq, 
                    pbdx -2*(pbl1+pbl2+pbq), pbdy-2*(pbl1+pbl2+pbq));
            }
            ctx.beginPath(); // front frame
            ctx.strokeStyle="rgb(120,120,120)";
            ctx.lineWidth=2;
            roundRect(ctx,pbx +outxy[0] +pbl1+pbl2 +pbq, pby +outxy[1] +pbl1+pbl2 +pbq, 
                pbdx -2*(pbl1+pbl2+pbq), pbdy-2*(pbl1+pbl2+pbq),1);
            ctx.stroke();
            }
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
            k_monitor.callSwitchOff();
            powerState="start"; powerValue=0; setTimeout(setPower,10);
        }
        // power switch-off event
        if (this.state==1) {
            for (let i=0; i<buttons.length; i++) {
                if (buttons[i].class!="PushButton") 
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
        powerValue+=3;
        draw(ctx);
        if (powerValue>=230) { powerState="off"; draw(ctx); }
        else setTimeout(setPower,10);
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
class FindButton extends PushButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
        findState="off";
        this.illum=false;
    }
    clickXY(x,y) {
        findState="off";
        this.state=0;
    }
    showPushed() {
        if (b_power.state==0) {
            super.showPushed("push");
        }
        else if (b_power.state==1) {
            super.showPushed("push");
            this.state=1;
            findState="search"; findValue=1.0; setTimeout(setFind,5);
            // findState: "search","found","off", dispch/findValue displayed
        }
    }
}
function setFind() {
    trace("setFind");
    if (findState=="search") {
        findValue*=1.5;
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
    for (let i=0; i<uidebugctx.length; i++) {
        if (!isNaN(uidebugctx[i].ticks)) {
            uidebugctx[i].reset();
        }
    }
    if (b_a.state==0) b_a.clickXY(0,0);
    if (b_auto.state==0) b_auto.clickXY(0,0);
    if (b_readout.state==1) b_readout.clickXY(0,0);
    presetManager.reset();
    if (k_cursor.k.pulled) {
        presetManager.add(1,"mousedown",k_cursor.k_,0,0,350);
        presetManager.add(1,"mouseup",k_cursor.k_,0,0);
    }
    if (k_xpos.k.pulled) {
        presetManager.add(1,"mousedown",k_xpos.k_,0,0,350);
        presetManager.add(1,"mouseup",k_xpos.k_,0,0);
    }
}
class PresetManager {
    constructor() {
        this.presetDelay=50;
        this.timeCursor;
    }
    reset() {
        epreset=[];
        this.timeCursor=Date.now();
    }
    add(pNo,pEvent,pObject,pX,pY,pDelay=-1) {
        for (let i=0; i<pNo; i++) {
            new EventPreset(pEvent,this.timeCursor,pObject,pX,pY);
            this.timeCursor+=pDelay==-1?this.presetDelay:pDelay;
        }
    }
}
function setImprintY() {
    if (imprintY==1000) return;
    imprintY--;
    if (imprintY<-520) imprintY=440;
    draw(ctx);
    setTimeout(setImprintY,50);
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
        else if (this.name.substring(0,6)=="Preset") {
            if (this.state==1) { 
                var pri=parseInt(this.name.substring(6));
                reset();
                clearTimeout(imprintTimer); imprintY=1000;
                if (pri==0) { // imprint text scrolling
                    imprintY=440;
                    imprintTimer=setTimeout(setImprintY,50);
                }
                else if (pri==1) { // Morse (Range, Freq, AM, Monitor)
                    presetManager.reset();
                    presetManager.add(3,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(4,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(3,"wheel",siggen[0].k_freq.k,0,-1);
                    presetManager.add(30,"wheel",siggen[1].k_freq.k,0,-1,7);
                    presetManager.add(2,"wheel",k_mode,0,1);
                    presetManager.add(7,"wheel",k_time.k,0,-1,7);
                    initChannels();
                    presetManager.add(1,"wheel",k_monitor,0,-1);
	                presetManager.add(100,"wheel",k_delay.k_,0,1,7);
                }
                else if (pri==2) { // La Linea Menomano (XY, Rotate, Pos+, DC, Intensity)
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
		            presetManager.add(8,"wheel",k_intensity,0,1,7);
                }
                else if (pri==3) { // NTSC (Scale, CH1, Delaybase, Delay)
                    presetManager.reset();
                    presetManager.add(2,"wheel",k_mode,0,-1);
                    presetManager.add(4,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,1);
                    presetManager.add(7,"wheel",k_time.k,0,1);
                    presetManager.add(7,"wheel",k_delaybase.k,0,1,7);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(5,"wheel",scope.ch[0].k_volts.k_,0,1);
		            presetManager.add(100,"wheel",k_delay.k,0,1,7);
		            presetManager.add(100,"wheel",k_delay.k_,0,1,7);
                }
                else if (pri==4) { // Lissajous (XY, Freq, Delaybase, Delay)
                    presetManager.reset();
                    presetManager.add(20,"wheel",siggen[0].k_freq.k,0,1,1);
                    presetManager.add(70,"wheel",siggen[1].k_freq.k,0,1,1);
                    presetManager.add(3,"wheel",k_time.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[1].k_volts.k_,0,-1);
                    presetManager.add(3,"wheel",k_mode,0,-1);
                    presetManager.add(135,"wheel",siggen[0].k_phase.k_,0,1,10);
		            presetManager.add(60,"wheel",siggen[1].k_phase.k_,0,-1,50);
                }
                else if (pri==5) { // Lissajous flowers (XY)
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
                    presetManager.add(15,"wheel",k_rot,0,-1,30);
                    presetManager.add(8,"wheel",k_focus,0,-1,30);
                    presetManager.add(30,"wheel",k_rot,0,1,30);
                    presetManager.add(8,"wheel",k_focus,0,1,30);
                    presetManager.add(8,"wheel",k_intensity,0,1,30);
                }
                else if (pri==6) { // Heart (XY)
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
                else if (pri==7) { // Wave (Sinc, Range, ADD, Trigger/Mode)
                    presetManager.reset();
                    presetManager.add(7,"wheel",siggen[0].k_func.k,0,1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(2,"wheel",siggen[1].k_func.k,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,1);
                    presetManager.add(16,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(1,"wheel",k_mode,0,1);
                    presetManager.add(32,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(7,"wheel",scope.ch[0].k_ypos,0,-1);
                    presetManager.add(11,"wheel",k_time.k_,0,1);
                    presetManager.add(1,"mousedown",b_readout,0,0);
                    presetManager.add(1,"mouseup",b_readout,0,0);
                    presetManager.add(1,"mousedown",b_mode,0,0);
                    presetManager.add(1,"mouseup",b_mode,0,0);
                    presetManager.add(24,"wheel",k_trigger.k,0,1);
                    presetManager.add(1,"mousedown",k_cursor.k_,0,0,350);
                    presetManager.add(1,"mouseup",k_cursor.k_,0,0);
                    presetManager.add(10,"wheel",k_cursor.k,0,-1,);
                    presetManager.add(20,"wheel",k_cursor.k_,0,-1,);
                }
                else if (pri==8) { // ECG slow sweep double in phaseshift
                    presetManager.reset();
                    presetManager.add(5,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(5,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(3,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(3,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(12,"wheel",siggen[1].k_phase.k,0,1);
                    presetManager.add(5,"wheel",scope.ch[0].k_ypos,0,1);
                    presetManager.add(5,"wheel",scope.ch[1].k_ypos,0,-1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(7,"wheel",k_time.k,0,-1);
                }
                initChannels();
                draw(ctx);
                setTimeout(()=>{b_presets[pri].callSwitchOff();},200);
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
class MicButton extends PushButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        super.clickXY(x,y);
        if (b_power.state==1) {
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
class ResetButton extends PushButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            reset();
            initChannels();
            draw(ctx);
        }
    }
}
class PresetButton extends PushButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(ctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        if (b_power.state==1) {
            b_presets[lastPreset++].clickXY(0,0);
            if (lastPreset>=b_presets.length) lastPreset=0;
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
    showNoPush(pPushButton) {
        for (let i=0; i<this.b.length; i++)
            if (this.b[i]!=pPushButton)
                this.b[i].showPushed("offnoillum");
    }
}
