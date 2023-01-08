// Button Label position per pType
var xpos={"power":0,"on":-29, "small":0,"siggen":-29};
var ypos={"power":-27,"on":0,"small":-15,"siggen":0};

var grd; // for grad on Canvas

class Button extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH);
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
        ui.push(this);
        this.label=new Label(this.cX,this.cY,pLabel,pType=="small"?12:(pType=="on"?12:(pType=="siggen"?15:15)));
        this.setLabelXY(pType);
        buttons.push(this);
    }
    getValue() {
        return this.state;
    }
    callSwitchOff() {
        if (this.state==1) this.clickXY(0,0);
    }
    setLabelXY(pType) {
        this.label.adjustXY(xpos[pType],ypos[pType]);
    }
    clickXY(x,y) {
        super.clickXY(x,y);
        if (this.radio!=null) this.radio.reset();
        this.state=1-this.state;
    }
    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        grd = ctx.createRadialGradient(this.x+this.w/2,this.y+this.h/2,
            2*this.w/5, this.x+this.w/2,this.y+this.h/2,
            2*this.w/3);
        grd.addColorStop(0, "rgb(10,30,30)");
        grd.addColorStop(1, bgcolor);
        ctx.fillStyle = grd;
        if (this.type=="power") 
            ctx.fillRect(this.x-dVfd,this.y-dVfd/2,this.w+2*dVfd,this.h+dVfd);
        ctx.fill();
        ctx.drawImage(this.state==1?this.img_on:this.img_off,this.x,this.y,this.w,this.h);
        super.draw(ctx);
    }
}
class PowerButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        this.img_on=led_on_power;
        this.img_off=led_off_power;
        buttons.splice(-1); // remove this last power button from buttons
    }
    clickXY(x,y) {
        // power switch-on event
        if (this.state==0) {
            b_dual.state=1;
            b_auto.state=1;
            for (var i=0; i<2; i++) {
                siggen[i].b_ch.state=1;
                scope.ch[i].b_dc.state=1;
            }
            k_monitor.callSwitchOff();
        }
        // power switch-off event
        if (this.state==1) {
            for (var i=0; i<buttons.length; i++) {
                buttons[i].callSwitchOff();
            }
            k_monitor.callSwitchOff();
       }
        super.clickXY(x,y);
    }
}
class ChOnButton extends Button {
    clickXY(x,y) {
        if (b_power.state==1) super.clickXY(x,y);
    }
}
class IndicatorLed extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        this.img_on=led_red;
        this.img_off=led_off;
        this.live=false;
    }
    clickXY(x,y) {
        if (b_power.state==1) super.clickXY(x,y);
    }
    showRed() {
        if (b_power.state==1) this.state=1;
    }
}
class FindButton extends ChOnButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        findState="off";
    }
    clickXY(x,y) {
        super.clickXY(x,y);
        if (this.state==1) { findState="search"; findValue=1.0; setTimeout(setFind,10); }
        else if (this.state==0) findState="off";
        // findState: "search"/"found"/"off", y/findValue displayed
    }
}
class DebugButton extends ChOnButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        super.clickXY(x,y);
        if (this.state==1) { logWindow.removeAttribute("hidden"); }
        else if (this.state==0) logWindow.setAttribute("hidden","hidden");
        // findState: "search"/"found"/"off", y/findValue displayed
    }
}
function setFind() {
    trace("setFind");
    if (findState=="search") {
        findValue*=1.2;
        scope.draw(ctx);
        setTimeout(setFind,10);
    }
}
class MicButton extends ChOnButton {
    clickXY(x,y) {
        super.clickXY(x,y);
        if (this.state==1) {
            clearTimeout(micTimeout);
            recordAudio();
            micTimeout=setTimeout(function(){b_mic.callSwitchOff();},10000);
        }
        else if (this.state==0) this.switchOff();
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
    }
}
class ResvButton extends ChOnButton {
    clickXY(x,y) {
        super.clickXY(x,y);
        if (this.state==1) {
            for(var i=0; i<ui.length; i++) {
                if (!isNaN(ui[i].ticks)) {
                    ui[i].value=Math.floor(Math.random()*ui[i].ticks);
                }
            }
            initChannels();
            draw(ctx);
            setTimeout(()=>{b_resv.callSwitchOff();},500);
        }
        else if (this.state==0) this.switchOff();
    }
    callSwitchOff() {
        if (this.state==1) {
            super.clickXY(0,0);
            this.switchOff();
            draw(ctx);
        }
    }
    switchOff() {
    }
}
class Radio extends pObject {
    constructor(pX,pY,pListButtons) {
        super(pX,pY,25,pListButtons.length*dButton);
        this.name="Radio";
        this.live=false;
        this.b=pListButtons;
        for (var i=0; i<pListButtons.length; i++) {
            pListButtons[i].radio=this;
            pListButtons[i].x=pX;
            pListButtons[i].y=pY+i*dButton;
            pListButtons[i].label.adjustXY(0,i*dButton);
        }
        ui.push(this);
    }
    reset() {
        for (var i=0; i<this.b.length; i++) {
            this.b[i].state=0;
        }
    }
}
