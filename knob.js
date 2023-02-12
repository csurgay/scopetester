var pDelta; // for holding -event.delta
var xd, yd, rd, nd, kd; // for x,y for drawing
const pullDx=1, pullDy=1, pullDr=1;

class Knob extends pObject {
    constructor(ctx,pLimit,pX,pY,pR,pTicks,pValue,pLabel,lpos,pMarker="marker") {
        const pos={"none":[0,0],"knob":[0,-27],"smallknob":[0,-22],"volume":[0,-40],
        "pot":[-22,1],"pot2":[-25,1],"double":[0,-44],"sweep":[0,80], 
        "double_s":[0,-35], "delay":[0,78], "func":[0,-62], "range":[0,-55], "posy":[-30,0],
        "volts":[0,-55], "sigdouble":[63,-31], "cursor":[0,-46], "xpos":[0,-46]};
        super(ctx,pX-pR,pY-pR,2*pR,2*pR);
        this.class="Knob";
        this.name=pLabel;
        this.live=true;
        this.limit=pLimit; // ticks/2: végállásos, -1: körbeforog
        this.r=pR;
        this.ticks=pTicks;
        this.defaultValue=pValue;
        this.value=pValue;
        this.valueA=pValue;
        this.valueB=pValue;
        this.value0=true; // value0: getValue is (- 0 +) not (0 + ++)
        this.l=pLabel;
        this.color="#EEEEEE";
        this.haircolor="gray";
        this.markercolor="red";
        new Label(ctx,pX+pos[lpos][0],pY+pos[lpos][1],pLabel,12);
        this.marker=pMarker;
        this.shadow=true;
        this.pulled=false;
        this.pullable=false;
        this.pullShadow=false;
        this.pulledTogether=null;
        this.pullDekorType="";
        this.resetTogether=null;
        uipush(this);
    }
    getValue() {
        if (this.value0) {
            if (this.value<=this.ticks/2) return this.value;
            else return this.value-this.ticks;
        }
        else return this.value;
    }
    getValueA() {
        if (this.value0) {
            if (this.valueA<=this.ticks/2) return this.valueA;
            else return this.valueA-this.ticks;
        }
        else return this.valueA;
    }
    getValueB() {
        if (this.value0) {
            if (this.valueB<=this.ticks/2) return this.valueB;
            else return this.valueB-this.ticks;
        }
        else return this.valueB;
    }
    reset() {
        this.value=this.defaultValue;
        this.valueA=this.defaultValue;
        this.valueB=this.defaultValue;
        if (this.resetTogether!=null) {
            this.resetTogether.value=this.resetTogether.defaultValue;
        }
    }
    clickXY(x,y) {
        this.reset();
        super.clickXY(x,y);
    }
    limitValue(v,inc,limit) {
        var ret=v+inc;
        if (this.limit!=-1) {
            if (inc>0) if (ret==limit+1) ret--;
            if (inc<0) if (ret==limit || ret==-1 && limit==this.ticks-1) ret++;
        }
        if (ret<0) ret+=this.ticks;
        else if (ret>=this.ticks) ret-=this.ticks;
        return ret;
    }
    turnY(pDelta) {
        // set new value within limit
        var newValueA=this.valueA, newValueB=this.valueB;
        for (let i=0; i<=Math.abs(this.ticks*pDelta/1000); i++) {
            this.value=this.limitValue(this.value,Math.sign(pDelta),this.limit);
            newValueA=this.limitValue(newValueA,Math.sign(pDelta),this.limit);
            newValueB=this.limitValue(newValueB,Math.sign(pDelta),this.limit);
        }
        if (this.pulled) {
            this.valueB=newValueB;
        }
        else {
            if (this.valueA==this.valueB) {
                this.valueA=newValueA;
                this.valueB=newValueB;
            }
            else {
                this.valueA=newValueA;
            }
        }
        super.turnY(pDelta);
    }
    pullpush() {
        this.pulled=!this.pulled;
        if (this.pulledTogether!=null)
            this.pulledTogether.pulled=!this.pulledTogether.pulled;
        if (this.pulled) {
            this.x+=pullDx; this.y+=pullDy; this.r+=pullDr;
            if (this.pulledTogether!=null) {
                this.pulledTogether.x+=pullDx; 
                this.pulledTogether.y+=pullDy;
                this.pulledTogether.r+=pullDr; 
            }
        }
        else {
            this.x-=pullDx; this.y-=pullDy; this.r-=pullDr;
            if (this.pulledTogether!=null) {
                this.pulledTogether.x-=pullDx; 
                this.pulledTogether.y-=pullDy;
                this.pulledTogether.r-=pullDr; 
            }
        }
    }
    setPullable() {
        this.pullable=true;
        this.pullShadow=true;
    }
    draw(ctx) {
        xd=this.x+this.r;
        yd=this.y+this.r;
        rd=this.r; nd=this.ticks; 
        kd=this.value;
        if (this.class=="TimerKnob") kd=this.valueB;
        if (this.shadow) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(60,60,60,0.2)";
            ctx.ellipse(xd,yd,2*rd,rd,Math.PI/4,-Math.PI/2,Math.PI/2);
            ctx.fill();
        }
        if (this.pulled && this.pullShadow) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.ellipse(xd,yd,1.15*rd,rd,Math.PI/4,-Math.PI/2,Math.PI/2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.lineWidth=1;
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
        if (this.pullDekorType!="") {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle=this.markercolor;
            ctx.translate(this.x+this.r,this.y+this.r);
            ctx.rotate(2*Math.PI*kd/nd);
            if (this.pullDekorType=="timer") {
                ctx.font="bold 12px Arial";
                ctx.fillText("PULL",0,-5);
                ctx.fillText("DLYD",0,7);
            }
            else if (this.pullDekorType=="cursor") {
                ctx.fillStyle="black";
                ctx.font="9.5px Arial";
                ctx.fillText("PULL",0,-3);
                ctx.fillText("ON",0,6);
            }
            else if (this.pullDekorType=="xpos") {
                ctx.fillStyle="black";
                ctx.font="9.5px Arial";
                ctx.fillText("PULL",0,-3);
                ctx.fillText("x10",0,6);
            }
            ctx.fill();
            ctx.restore();
        }
        ctx.lineWidth=1;
        super.draw(ctx);
    }
}

class CalibPot extends Knob {
    constructor(ctx,pLimit,pX,pY,pR,pTicks,pValue,pLabel,lpos) {
        super(ctx,pLimit,pX,pY,pR,pTicks,pValue,pLabel,lpos,"nomarker");
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle="rgb(30,30,30)";
        ctx.arc(this.x+this.r,this.y+this.r,8,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle="rgb(120,120,120)";
        ctx.arc(this.x+this.r,this.y+this.r,5,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.lineWidth=3;
        ctx.strokeStyle="rgb(60,60,60)";
        ctx.moveTo(this.x+this.r+5*Math.sin(2*Math.PI*this.value/this.ticks),this.y+this.r-5*Math.cos(2*Math.PI*this.value/this.ticks));
        ctx.lineTo(this.x+this.r-5*Math.sin(2*Math.PI*this.value/this.ticks),this.y+this.r+5*Math.cos(2*Math.PI*this.value/this.ticks));
        ctx.stroke();
    }
}

class DoubleKnob extends pObject {
    constructor(ctx,pX,pY,pTicks,pTicks_,pLabel,lpos,pR,pR_) {
        super(ctx,pX-pR,pY-pR,2*pR,2*pR);
        this.k=new Knob(ctx,-1,pX,pY,pR,pTicks,0,pLabel,lpos);
        this.k_=new Knob(ctx,-1,pX,pY,pR_,pTicks_,0,"","none");
        this.k_.hitPad=2; // so that hit rect is smaller for inner knob
        this.k.limit=Math.floor(this.k.ticks/2);
        this.k_.limit=Math.floor(this.k_.ticks/2);
        this.k.shadow=false;
//        uipush(this);
    }
    setSwitchBufferNeeded() {
        super.setSwitchBufferNeeded();
        this.k.setSwitchBufferNeeded();
        this.k_.setSwitchBufferNeeded();
    }
    setInitChannelsNeeded() {
        super.setInitChannelsNeeded();
        this.k.initChannelsNeeded=true;
        this.k_.initChannelsNeeded=true;
    }
    setPullable(pDekorType) {
        this.k.pullable=true;
        this.k.pullShadow=true;
        this.k.pulledTogether=this.k_;
        this.k_.pullDekorType=pDekorType;
        this.k_.pullable=true;
        this.k_.pulledTogether=this.k;
    }
    setResetTogether() {
        this.k.resetTogether=this.k_;
        this.k_.resetTogether=this.k;
    }
}

class DekorKnob extends DoubleKnob {
    constructor(ctx,pX,pY,vals,vals_,pLabel,posLabel,r,r_,rDekor,pDekorKnobType) {
        super(ctx,pX,pY,vals.length,vals_.length,pLabel,posLabel,r,r_);
        this.rDekor=rDekor;
        this.k_.color="rgb(200,20,20)";
        this.k_.haircolor=this.k_.color;
        this.k_.markercolor="#EEEEEE";
        this.varLabel=new Label(ctx,pX-rDekor+3,pY-rDekor+2,"Var",11);
        this.varLabel.bgcolor="rgba(200,20,20,0.75)";
        this.varLabel.fgcolor="rgba(220,220,220,1)";
        this.varLabel.background=true;
        if (pDekorKnobType=="Time") 
            new UiTimeDekor(ctx,pX,pY,this.rDekor);
        else if (pDekorKnobType=="Volts") 
            new UiVoltDekor(pX,pY,this.rDekor);
        this.iconCircle(pX,pY+2,this.rDekor,vals);
        this.captionCircle(pX,pY+3,this.rDekor);
    }
    // draw(ctx) {
    //     ctx.beginPath();
    //     ctx.fillStyle="white";
    //     ctx.arc(this.x+this.w/2,this.y+this.h/2,this.rDekor,0,2*Math.PI);
    //     ctx.fill();
    // }
}

class TimeDekorKnob extends DekorKnob {
    constructor(ctx,pX,pY,pLabel,pPosType,pR,pR_,rDekor) {
        super(ctx,pX,pY,tb,tb_,pLabel,pPosType,pR,pR_,rDekor,"Time");
    }
    iconCircle(x,y,r,tb) {
        nd=tb.length;
        for (let i=0; i<nd; i++) {
            kd=i; if (kd>this.k.ticks/2) kd-=this.k.ticks;
            var sv=tb[kd+11]; var su="ms"; // value and unit
            if (sv>=100) { sv/=1000; su="s"; }
            else if (sv<=0.05) { sv*=1000; su="\u03bcs"; }
            var sl=""+sv; sl=sl.replace("0.",".");
            new Label(this.ctx,x+r*Math.sin(2*Math.PI*i/nd),
                y-r*Math.cos(2*Math.PI*i/nd),sl,12);
        }
    }
    captionCircle(x,y,r) {
        new Label(this.ctx,x-r-4,y-r+12,"ms",12);
        new Label(this.ctx,x+r-5,y+r-7,"\u03bcs",12);
        new Label(this.ctx,x-r+2,y+r-7,"sec",12);
    }
}

class TimeKnob extends TimeDekorKnob {
    constructor(pX,pY) {
        super(ctx,pX,pY,"A timebase and B DLYD","sweep",50,25,62);
        this.class="TimeKnob";
        this.setPullable("timer");
        uictx.push(this);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle=hl_plastic;
        ctx.arc(this.x+this.w/2,this.y+this.h/2,this.rDekor+11,0,2*Math.PI);
        ctx.arc(this.x+this.w/2,this.y+this.h/2,this.rDekor+8,0,2*Math.PI);
        ctx.fill("evenodd");
        ctx.beginPath();
        ctx.strokeStyle=hl_plastic;
        ctx.lineWidth=18;
        ctx.lineCap="butt";
        ctx.arc(this.x+this.w/2,this.y+this.h/2,this.rDekor,
            this.k.valueA*2*Math.PI/this.k.ticks+0.15-Math.PI/2,
            this.k.valueA*2*Math.PI/this.k.ticks-0.15-Math.PI/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle=hl_plastic;
        ctx.arc(this.x+this.w/2,this.y+this.h/2,this.rDekor-9,0,2*Math.PI);
        ctx.arc(this.x+this.w/2,this.y+this.h/2,this.rDekor-12,0,2*Math.PI);
        ctx.fill("evenodd");
    }
}

class DelaybaseKnob extends TimeDekorKnob {
    constructor(pX,pY,pLabel) {
        super(debugctx,pX,pY,pLabel,"delay",40,20,52);
    }
}

class VoltsKnob extends DekorKnob {
    constructor(pX,pY) {
        super(ctx,pX,pY,vpd,vpd_,"Volts/Div","volts",30,15,40,"Volts");
        this.k.limit=9;
    }
    iconCircle(x,y,r,vpd) {
        var n=vpd.length;
        for (let i=0; i<n; i++) {
            var kt=i; if (kt>this.k.ticks/2) kt-=this.k.ticks;
            var sv=vpd[kt+Math.round(this.k.ticks/2)-1]; 
            var su="V"; // value and unit
            if (sv>=100) { sv/=1000; su="kV"; }
            else if (sv<=0.05) { sv*=1000; su="mV"; }
            var sl=""+sv; sl=sl.replace("0.",".");
            new Label(ctx,x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),sl);
        }
    }
    captionCircle(x,y,r) {
        new Label(ctx,x+r,y+r,"mV",12);
    }
}

class UiTimeDekor extends pObject {
    constructor(ctx,pX,pY,pR) {
        super(ctx,pX,pY,0,0);
        this.r=pR;
        uipush(this);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth=16;
        ctx.lineCap="butt";
        ctx.strokeStyle=hl_green;
        ctx.arc(this.x,this.y,this.r,Math.PI*186/180,Math.PI*323/180);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle=hl_white;
        ctx.arc(this.x,this.y,this.r,Math.PI*324/180,Math.PI*96/180);
        ctx.stroke();
        ctx.lineWidth=1;
    }
}

class UiVoltDekor extends pObject {
    constructor(pX,pY,pR) {
        super(ctx,pX,pY,0,0);
        this.r=pR;
        uipush(this);
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
        super(ctx,pX,pY,bufgen.length,33,"Func                         ","func",42,25);
        this.dutyLabel=new Label(ctx,pX+40,pY-61,"Param",12);
        this.dutyLabel.bgcolor=hl_gray;
        this.dutyLabel.background=true;
        this.k.value=0;
        this.k_.color="gray";
        this.k_.haircolor="#EEEEEE";
        this.k.value0=false;
        this.k_.value0=false;
        this.k.limit=-1;
        this.k_.limit=-1;
        this.iconCircle(pX-8,pY,55,bufgen);
    }
    iconCircle(x,y,r,bufgen) {
        var n=bufgen.length;
        for (let i=0; i<n; i++) {
            new Icon(ctx,x+r*Math.sin(2*Math.PI*i/n)-2,
            y-r*Math.cos(2*Math.PI*i/n),20,6,bufgen[i].f,
            bufgen[i].halfIcon);
        }
    }
}

class ScaleKnob extends Knob {
    constructor(pX,pY) {
        super(ctx,3,pX,pY,25,scale.length,0,"Range","range");
        this.iconCircle(pX+1,pY+2,40,scale);
    }
    iconCircle(x,y,r,scale) {
        var n=scale.length;
        for (let i=0; i<n; i++) {
            var unit=""+scale[i]; 
            if (unit=="1") unit="1k"; 
            else if (unit=="10") unit="10k";
            else if (unit=="100") unit="100k";
            else if (unit=="1000") unit="1M";
            else if (unit==".00001") unit=".01";
            else if (unit==".0001") unit=".1";
            else if (unit==".001") unit="1";
            else if (unit==".01") unit="10";
            else if (unit==".1") unit="100";
            new Label(ctx,x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),unit,12);
        }
    }
}

class MonitorKnob extends Knob {
    constructor(pX,pY) {
        super(ctx,-1,pX,pY,18,a_monitor.length,4,"none","none");
        this.value0=false;
        this.iconCircle(pX,pY+2,30,a_monitor);
    }
    iconCircle(x,y,r,a_monitor) {
        var n=a_monitor.length;
        for (let i=0; i<n; i++) {
            new Label(ctx,x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),a_monitor[i],12);
        }
    }
    on() {
        return a_monitor[this.value]!="Off";
    }
    reset() {
        this.callSwitchOff();
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
        super.reset();
        this.switchOff();
    }
    switchOff() {
        stopBuffer(aptr);
        astarted=false;
    }
}

class ModeKnob extends Knob {
    constructor(pX,pY) {
        // for (let i=0; i<radio_mode.b.length; i++)
        //     a_mode.push(radio_mode.b[i].name);
        super(ctx,-1,pX,pY,21,a_mode.length,1,"none","none");
        this.value0=false;
        this.iconCircle(pX,pY+2,34,a_mode);
    }
    iconCircle(x,y,r,a_mode) {
        var n=a_mode.length;
        for (let i=0; i<n; i++) {
            new Label(ctx,x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),a_mode[i],12);
        }
    }
    clickXY(pX,pY) {
        super.clickXY(pX,pY);
        this.setButtonValue();
    }
    turnY(pDelta) {
        super.turnY(pDelta);
        this.setButtonValue();
    }
    reset() {
        super.reset();
        this.setButtonValue();
    }
    setButtonValue() {
        for (let i=0; i<buttons.length; i++)
            if (buttons[i].radio==radio_mode && buttons[i].name==a_mode[this.value])
                buttons[i].clickXY(0,0);
    }
}
