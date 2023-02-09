// Button Label position per pType
var xpos={"power":0,"on":-29, "small":0,"siggen":-32,"readout":-40};
var ypos={"power":-27,"on":0,"small":-15,"siggen":-3,"readout":0};

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
        if (this.class=="PushButton") {
            super.draw(ctx);
            return;
        }
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
        this.otherIllumCondition=()=>true;
    }
    setOtherIllumCondition(condition) {
        this.otherIllumCondition=condition;
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
            if (pIllum=="illum" && b_power.state==1 && this.otherIllumCondition()) {
                ctx.drawImage(this.img_on,pbx +outxy[0] +pbl1+pbl2+pbq, pby +outxy[1] +pbl1+pbl2+pbq, 
                    pbdx -2*(pbl1+pbl2+pbq), pbdy-2*(pbl1+pbl2+pbq));    
            }
            else if (pIllum=="noillum" || b_power.state==0 || !this.otherIllumCondition()) {
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
            imprintY=1000;
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
class AutotestButton extends PushButton {
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
            siggen[0].k_scale.value=7;
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
