// Button Label position per pType
var xpos={"power":0,"on":-29, "small":0,"siggen":-29};
var ypos={"power":-27,"on":0,"small":-15,"siggen":0};

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
        this.label=new Label(this.cX,this.cY,pLabel,pType=="small"?12:(pType=="on"?12:(pType=="siggen"?15:15)));
        this.setLabelXY(pType);
        buttons.push(this);
    }
    callSwitchOff() {
        if (this.state==1) this.clickXY(0,0);
    }
    setLabelXY(pType) {
        this.label.adjustXY(xpos[pType],ypos[pType]);
    }
    clickXY(x,y) {
        super.clickXY(x,y);
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
    clickXY(x,y) {
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
        this.img=led_red;
    }
    clickXY(x,y) {
        if (b_power.state==1) super.clickXY(x,y);
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
function setFind() {
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
            ctx.rect(100,100,200,200);
            ctx.sctoke();
            for(var i=0; i<1000000; i++)
                for(var j=0; j<3000; j++) ;
            b_resv.draw(ctx);
            scope.drawScreen(ctx);
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
        this.live=true;
        this.b=pListButtons;
        for (var i=0; i<pListButtons.length; i++) {
            pListButtons[i].x=pX;
            pListButtons[i].y=pY+i*dButton;
            pListButtons[i].label.adjustXY(0,i*dButton);
        }
        ui.push(this);
    }
    clickXY(x,y) {
        for (var i=0; i<this.b.length; i++) {
            if (this.b[i].hitXY(x,y)) if (this.b[i].state==0) {
                for (var j=0; j<this.b.length; j++)
                    this.b[j].state=0;
                this.b[i].clickXY(x,y);
            }
        }
    }
}
