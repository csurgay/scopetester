var pDelta; // for holding -event.delta
var xd, yd, rd, nd, kd; // for x,y for drawing

class Knob extends pObject {
    constructor(pLimit,pX,pY,pR,pTicks,pValue,pLabel,lpos,pMarker="marker") {
        const pos={"knob":-27,"double":-44,"sweep":78, 
        "double_s":-40, "delay":78, "func":-57, "range":-55, 
        "volts":-55, "sigdouble":-30};
        super(pX-pR,pY-pR,2*pR,2*pR);
        this.class="Knob";
        this.name=pLabel;
        this.live=true;
        this.limit=pLimit; // ticks/2: végállásos, -1: körbeforog
        this.r=pR;
        this.ticks=pTicks;
        this.defaultValue=pValue;
        this.value=pValue;
        this.value0=true; // value0: getValue is (- 0 +) not (0 + ++)
        this.l=pLabel;
        this.color="#EEEEEE";
        this.haircolor="gray";
        this.markercolor="red";
        var xLabel=pX; if (lpos=="sigdouble") xLabel+=70;
        new Label(xLabel,pY+pos[lpos],pLabel,12);
        this.marker=pMarker;
        this.shadow=true;
        ui.push(this);
    }
    getValue() {
        if (this.value0) {
            if (this.value<=this.ticks/2) return this.value;
            else return this.value-this.ticks;
        }
        else return this.value;
    }
    clickXY(x,y) {
        this.value=this.defaultValue;
        super.clickXY(x,y);
    }
    turnY(pDelta) {
        // set new value within limit
        for (var i=0; i<1; i++) {
            if (this.limit==-1 ||
                ((this.value!=this.limit || pDelta<0) &&
                (this.value!=(this.limit+1)%this.ticks || pDelta>0))) {
                this.value+=Math.sign(pDelta);
                if (this.value<0) this.value+=this.ticks;
                else if (this.value>this.ticks-1) this.value-=this.ticks;
            }
        }
        super.turnY(pDelta);
    }
    draw(ctx) {
        xd=this.x+this.r;
        yd=this.y+this.r;
        rd=this.r; nd=this.ticks; kd=this.value;
        if (this.shadow) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(60,60,60,0.2)";
            ctx.ellipse(xd,yd,2*rd,rd,Math.PI/4,-Math.PI/2,Math.PI/2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.strokeStyle=this.haircolor;
        ctx.lineTo(xd+rd,yd);
        ctx.fillStyle = this.color;
        ctx.arc(xd,yd,rd,0,2*Math.PI);
        ctx.fill();
        for(var i=0; i<nd; i++) {
            ctx.moveTo(xd+rd*Math.sin(2*Math.PI*i/nd),yd-rd*Math.cos(2*Math.PI*i/nd));
            ctx.lineTo(xd+2*rd/3*Math.sin(2*Math.PI*i/nd),yd-2*rd/3*Math.cos(2*Math.PI*i/nd));
        }
        ctx.stroke();
        if (this.marker=="marker") {
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle=this.markercolor;
            ctx.moveTo(xd+rd*Math.sin(2*Math.PI*kd/nd),yd-rd*Math.cos(2*Math.PI*kd/nd));
            ctx.lineTo(xd+3*rd/5*Math.sin(2*Math.PI*kd/nd),yd-3*rd/5*Math.cos(2*Math.PI*kd/nd));
            ctx.stroke();
        }
        ctx.lineWidth=1;
        super.draw(ctx);
    }
}

class DoubleKnob extends pObject {
    constructor(pX,pY,pTicks,pTicks_,pLabel,lpos,pR,pR_) {
        super(pX-pR,pY-pR,2*pR,2*pR);
        this.k=new Knob(-1,pX,pY,pR,pTicks,0,pLabel,lpos);
        this.k_=new Knob(-1,pX,pY,pR_,pTicks_,0,"",0);
        this.k_.hitPad=2; // so that hit rect is smaller for inner knob
        this.k.limit=Math.floor(this.k.ticks/2);
        this.k_.limit=Math.floor(this.k_.ticks/2);
        this.k.shadow=false;
    }
    setSwitchBufferNeeded() {
        super.setSwitchBufferNeeded();
        this.k.setSwitchBufferNeeded();
        this.k_.setSwitchBufferNeeded();
    }
    setInitChannelsNeeded() {
        super.initChannelsNeeded=true;
        this.k.initChannelsNeeded=true;
        this.k_.initChannelsNeeded=true;
    }
}

class DekorKnob extends DoubleKnob {
    constructor(pX,pY,vals,vals_,pLabel,posLabel,r,r_,rDekor) {
        super(pX,pY,vals.length,vals_.length,pLabel,posLabel,r,r_);
        this.rDekor=rDekor;
        this.k_.color="rgb(200,20,20)";
        this.k_.haircolor=this.k_.color;
        this.k_.markercolor="#EEEEEE";
        this.varLabel=new Label(pX-rDekor,pY-rDekor,"Var",11);
        this.varLabel.bgcolor="rgba(200,20,20,0.75)";
        this.varLabel.fgcolor="rgba(220,220,220,1)";
        this.varLabel.background=true;
        this.iconCircle(ui,pX,pY+2,this.rDekor,vals);
        this.captionCircle(ui,pX,pY+3,this.rDekor);
    }
}

class TimeDekorKnob extends DekorKnob {
    constructor(pX,pY,pLabel,pPosType,pR,pR_,rDekor) {
        super(pX,pY,tb,tb_,pLabel,pPosType,pR,pR_,rDekor);
        new UiTimeDekor(pX,pY,this.rDekor);
    }
    iconCircle(ui,x,y,r,tb) {
        nd=tb.length;
        for (var i=0; i<nd; i++) {
            kd=i; if (kd>this.k.ticks/2) kd-=this.k.ticks;
            var sv=tb[kd+8]; var su="ms"; // value and unit
            if (sv>=100) { sv/=1000; su="s"; }
            else if (sv<=0.05) { sv*=1000; su="us"; }
            var sl=""+sv; sl=sl.replace("0.",".");
            new Label(x+r*Math.sin(2*Math.PI*i/nd),y-r*Math.cos(2*Math.PI*i/nd),sl,12);
        }
    }
    captionCircle(ui,x,y,r) {
        new Label(x-r-4,y-r+12,"ms",12);
        new Label(x+r+1,y+r-7,"us",12);
        new Label(x-r-1,y+r-7,"sec",12);
    }
}

class TimeKnob extends TimeDekorKnob {
    constructor(pX,pY) {
        super(pX,pY,"Sweep Timebase","sweep",50,25,62);
    }
}

class DelaybaseKnob extends TimeDekorKnob {
    constructor(pX,pY) {
        super(pX,pY,"Delay Timebase","delay",40,20,52);
    }
}

class VoltsKnob extends DekorKnob {
    constructor(pX,pY) {
        super(pX,pY,vpd,vpd_,"Volts/Div","volts",30,15,40);
        this.k.limit=9;
        new UiVoltDekor(pX,pY,this.rDekor);
    }
    iconCircle(ui,x,y,r,vpd) {
        var n=vpd.length;
        for (var i=0; i<n; i++) {
            var kt=i; if (kt>this.k.ticks/2) kt-=this.k.ticks;
            var sv=vpd[kt+Math.round(this.k.ticks/2)-1]; 
            var su="V"; // value and unit
            if (sv>=100) { sv/=1000; su="kV"; }
            else if (sv<=0.05) { sv*=1000; su="mV"; }
            var sl=""+sv; sl=sl.replace("0.",".");
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),sl);
        }
    }
    captionCircle(ui,x,y,r) {
        new Label(x,y+r+16,"mV",12);
    }
}

class UiTimeDekor extends pObject {
    constructor(pX,pY,pR) {
        super(pX,pY,0,0);
        this.r=pR;
        ui.push(this);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth=16;
        ctx.strokeStyle=hl_green;
        ctx.arc(this.x,this.y,this.r,Math.PI*61/69,Math.PI*130/69);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle=hl_gray;
        ctx.arc(this.x,this.y,this.r,Math.PI*131/69,Math.PI*37/69);
        ctx.stroke();
        ctx.lineWidth=1;
    }
}

class UiVoltDekor extends pObject {
    constructor(pX,pY,pR) {
        super(pX,pY,0,0);
        this.r=pR;
        ui.push(this);
    }
    draw(ctx) {
//        super.draw(ctx);
        ctx.beginPath();
        ctx.lineWidth=16;
        ctx.strokeStyle="rgba(100,100,100,0.35)";
        ctx.arc(this.x,this.y,this.r,Math.PI*-4/180,Math.PI*135/180);
        ctx.stroke();
        ctx.lineWidth=1;
    }
}

class FuncKnob extends DoubleKnob {
    constructor(pX,pY) {
        super(pX,pY,bufgen.length,33,"Func                         ","func",35,19);
        this.dutyLabel=new Label(pX+40,pY-55,"Param",12);
        this.dutyLabel.bgcolor=hl_gray;
        this.dutyLabel.background=true;
        this.k.value=0;
        this.k_.color="gray";
        this.k_.haircolor="#EEEEEE";
        this.k.value0=false;
        this.k_.value0=false;
        this.k.limit=-1;
        this.k_.limit=-1;
        this.iconCircle(pX-8,pY,50,bufgen);
    }
    iconCircle(x,y,r,bufgen) {
        var n=bufgen.length;
        for (var i=0; i<n; i++) {
            new Icon(x+r*Math.sin(2*Math.PI*i/n)-2,
            y-r*Math.cos(2*Math.PI*i/n),20,6,bufgen[i].f,
            bufgen[i].halfIcon);
        }
    }
}

class ScaleKnob extends Knob {
    constructor(pX,pY) {
        super(3,pX,pY,25,scale.length,0,"Range","range");
        this.iconCircle(pX,pY+4,40,scale);
    }
    iconCircle(x,y,r,scale) {
        var n=scale.length;
        for (var i=0; i<n; i++) {
            var unit=""+scale[i]; 
            if (unit=="1") unit="1k"; 
            else if (unit=="10") unit="10k";
            else if (unit=="100") unit="100k";
            else if (unit=="1000") unit="1M";
            else if (unit==".01") unit="10";
            else if (unit==".1") unit="100";
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),unit,12);
        }
    }
}

class MonitorKnob extends Knob {
    constructor(pX,pY) {
        super(-1,pX,pY,18,a_monitor.length,4,"none","none");
        this.value0=false;
        this.iconCircle(pX,pY+2,30,a_monitor);
    }
    iconCircle(x,y,r,a_monitor) {
        var n=a_monitor.length;
        for (var i=0; i<n; i++) {
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),a_monitor[i],12);
        }
    }
    on() {
        return a_monitor[this.value]!="Off";
    }
    turnY(pDelta) {
        super.turnY(pDelta);
        if (b_power.state==1) {
            if (this.on()) switchBuffer();
            else this.switchOff();
        }
    }
    clickXY(x,y) {
        stopBuffer(aptr);
        super.clickXY(x,y);
    }
    callSwitchOff() {
        this.value=this.defaultValue; // this have to be "Off"
        this.switchOff();
    }
    switchOff() {
        stopBuffer(aptr);
        astarted=false;
    }
}
