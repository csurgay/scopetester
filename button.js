// Button Label position per pType
var xpos={"power":0,"on":-33, "small":0};
var ypos={"power":-27,"on":0,"small":-15};

var grd; // for grad on Canvas
var img; // for LEDon/LEDoff/LEDred images

class Button extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH);
        this.img=led_on;
        this.live=true;
        this.cX=pX+pW/2;
        this.cY=pY+pH/2;
        this.state=0;
        this.type=pType;
        ui.push(this);
        this.label=new Label(this.cX,this.cY,pLabel,pType=="small"?12:15);
        this.setLabelXY(pType);
        buttons.push(this);
    }
    callSwitchOff() {
        if (this.state==1) this.click();
    }
    setLabelXY(pType) {
        this.label.adjustXY(xpos[pType],ypos[pType]);
    }
    click(event) {
        super.click();
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
        else if (this.type=="on-nem") 
            ctx.fillRect(this.x-dVfd,this.y-dVfd/4,this.w+2*dVfd,this.h+dVfd/2);
        ctx.fill();
        img=led_off; if (this.state==1) img=this.img;
        ctx.drawImage(img,0,0,225,216,this.x,this.y,this.w,this.h);
        super.draw(ctx);
    }
}
class PowerButton extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        buttons.splice(-1); // remove this last power button from buttons
    }
    click(event) {
        // power switch-on event
        if (this.state==0) {
            b_dual.state=1;
            b_auto.state=1;
            for (var i=0; i<2; i++) {
                siggen[i].b_ch.state=1;
                scope.ch[i].b_dc.state=1;
            }
        }
        // power switch-off event
        if (this.state==1) {
            for (var i=0; i<buttons.length; i++) {
                buttons[i].callSwitchOff(event);
            }
            k_monitor.callSwitchOff(event);
       }
        super.click(event);
    }
}
class ChOnButton extends Button {
    click(event) {
        if (b_power.state==1) super.click(event);
    }
}
class IndicatorLed extends Button {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        this.img=led_red;
    }
    click(event) {
        if (b_power.state==1) super.click(event);
    }
}
class FindButton extends ChOnButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        findState="off";
    }
    click(event) {
        super.click(event);
        if (this.state==1) { findState="search"; findValue=1.0; setTimeout(setFind,10); }
        else if (this.state==0) findState="off";
        // findState: "search"/"found"/"off", y/findValue displayed
    }
}
function setFind() {
    if (findState=="search") {
        findValue*=1.2;
        scope.draw(ctx);
        setTimeout(setFind,10);
    }
}
class MicButton extends ChOnButton {
    click(event) {
        super.click(event);
        if (this.state==1) {
            recordAudio();
            setTimeout(function(){b_mic.callSwitchOff(event);},10000);
        }
        else if (this.state==0) this.switchOff();
    }
    callSwitchOff(event) {
        if (this.state==1) {
            super.click(event);
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
    click(event) {
        super.click(event);
        if (this.state==1) {
            b_resv.draw(ctx);
            scope.drawScreen(ctx);
            setTimeout(()=>{b_resv.callSwitchOff(event);},500);
        }
        else if (this.state==0) this.switchOff();
    }
    callSwitchOff(event) {
        if (this.state==1) {
            super.click(event);
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
        this.live=true;
        this.b=pListButtons;
        for (var i=0; i<pListButtons.length; i++) {
            pListButtons[i].x=pX;
            pListButtons[i].y=pY+i*dButton;
            pListButtons[i].label.adjustXY(0,i*dButton);
        }
        ui.push(this);
    }
    click(event) {
        for (var i=0; i<this.b.length; i++) {
            if (this.b[i].hit(event)) if (this.b[i].state==0) {
                for (var j=0; j<this.b.length; j++)
                    this.b[j].state=0;
                this.b[i].click(event);
            }
        }
    }
}
