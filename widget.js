var hitX, hitY;

function uipush(obj) {
    if (obj.ctx==ctx) uictx.push(obj);
    else if (obj.ctx==debugctx) uidebugctx.push(obj);
}

class pObject {
    constructor(ctx,pX,pY,pW,pH) {
        this.ctx=ctx;
        this.class="class";
        this.name="dummy";
        this.x=pX;
        this.y=pY;
        this.w=pW;
        this.h=pH;
        this.switchBufferNeeded=false;
        this.live=false; // live (clickable) pObjects: Button, Knob, Radio
        this.initChannelsNeeded=false; // siggen need rebuffer signal samples
        this.bgcolor=null;
        this.fgcolor=null;
        this.hitPad=0;
        this.debugFrame=true;
        this.value=0; // for save/load presets
        return this;
    }
    setInitChannelsNeeded() {
        this.initChannelsNeeded=true;
    }
    setSwitchBufferNeeded() {
        this.switchBufferNeeded=true;
    }
    turnY(pDelta) {
        if (this.live && scope.k_monitor.on() && this.switchBufferNeeded) setTimeout(switchBuffer,10);
    }
    clickXY(x,y) {
        if (this.live && scope.k_monitor.on() && this.switchBufferNeeded) setTimeout(switchBuffer,10);
    }
    hitXY(x,y) {
        if (this.live) {
            hitX=x;
            hitY=y;
            if (hitX>this.x+this.hitPad && hitX<this.x+this.w-this.hitPad && 
                hitY>this.y+this.hitPad && hitY<this.y+this.h-this.hitPad) return true; 
            else return false;
        }
    }
    adjustRect(pX,pY,pW,pH) {
        this.x=pX; this.y=pY; this.w=pW; this.h=pH;
    }
    drawRect(ctx) {
        ctx.beginPath();
        ctx.strokeStyle="rgb(255,0,0)";
        ctx.lineWidth=1;
        ctx.rect(this.x-1,this.y-1,this.w+2,this.h+2);
        ctx.stroke();
    }
    draw(ctx) {
        if (b_frames.state==1 && this.debugFrame) this.drawRect(ctx);
    }
}

class Icon extends pObject {
    constructor(ctx,pX,pY,pW,pH,pFunc,pHalfIcon) {
        var ret=super(ctx,pX,pY,pW,pH);
        this.f=pFunc;
        this.halfIcon=pHalfIcon;
        this.ChOnType=false;
        this.parent=null;
        uipush(this);
    }
    draw(ctx) {
        if (!this.ChOnType || this.parent.b_ch.state==1) {
            ctx.beginPath();
            ctx.strokeStyle="black";
            ctx.lineWidth=1;
            ampl=127;
            var halfed=1; if (this.halfIcon=="halfIcon") halfed=3;
            yResult=this.f(0);
            if (yResult>100000) yResult-=1000000;
            ctx.moveTo(this.x,this.y-this.h*yResult/ampl/halfed);
            for (let i=1; i<this.w; i++) {
                yResult=this.f(Math.floor(this.f(-17)*i/this.w),0);
                if (yResult>100000) yResult-=1000000;
                ctx.lineTo(this.x+i,this.y-this.h*yResult/ampl/halfed);
            }
            ctx.stroke();
        }
    }
}

class DebugIcon extends Icon {
    constructor(pX,pY,pW,pH,pFunc) {
        var ret=super(debugctx,pX,pY,pW,pH,pFunc);
    }
    draw(ctx) {
        if (b_sch.state==1) {
            super.draw(ctx);
        }
    }
}

class Label extends pObject {
    constructor(ctx,pX,pY,pS,pSize,pColor="black") {        
        var ret=super(ctx,pX,pY,getTextWidth(ctx,pS,pSize),pSize+1);
        this.tX=pX; this.tY=pY;
        this.bgcolor=bgcolor;
        this.fgcolor=pColor;
        this.adjustRect(this.tX-this.w/2-2,this.tY-this.h/2,this.w+4,this.h-3);
        this.s=pS;
        this.size=pSize;
        this.color=pColor;
        this.background=false;
        uipush(this);
    }
    adjustXY(pX,pY) {
        this.tX+=pX;
        this.tY+=pY;
        ctx.font = this.size+'px Arial';
        this.w=getTextWidth(ctx,this.s,this.size);
        this.adjustRect(this.tX-this.w/2-2,this.tY-this.h/2,this.w+4,this.h-3);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.font = this.size+'px Arial';
        if (this.background) {
            ctx.fillStyle=this.bgcolor;
            ctx.fillRect(this.x,this.y-1,this.w,this.h+3);
        }
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle=this.fgcolor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.s,this.tX,this.tY)
        ctx.stroke();
        super.draw(ctx);
    }
}

class DebugLabel extends Label {
    constructor(pX,pY,pS,pSize,pCalcFunc) {
        super(debugctx,pX,pY,pS,pSize);
        this.debugFrame=false;
        this.calcFunc=pCalcFunc;
    }
    draw(ctx) {
        if (b_debug.state==1) {
            this.s=this.calcFunc();
            super.draw(ctx);
        }
    }
}

function getTextWidth(ctx,pS,pSize) {
    ctx.font = pSize+'px Arial';
    return Math.floor(ctx.measureText(pS).width);
}

class Frame extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pPos) {
        super(ctx,pX,pY,pW,pH);
        var x={"left":pX+100,"center":pX+pW/2,"centerish":pX+200,"rightish":pX+245,"right":pX+pW-50};
        uipush(this);
        this.label=new Label(ctx,x[pPos],pY+2," "+pLabel+" ",15);
        this.label.background=true;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.strokeStyle = "rgb(0, 25, 0)";
        roundRect(ctx, this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        super.draw(ctx);
    }
}
function drawText(str,pdx,pdy,hlNo=0) {
    var hlPtr=0;
    ctx.beginPath();
    ctx.lineCap="round";
    ctx.lineWidth=2;
    var dx=pdx, dy=pdy, dl=0.8, dd=8;
	for (let i=0; i<str.length; i++) {
        var c=str.charAt(i);
		if (c=='^' || c=='\n') {dx=pdx; dy+=16;}
		else {
			var l=letters[c];
            if (l===undefined) {
                error(c+" ("+str+") is not defined in letters");
                return;
            }
            if (imprintState=="scanning") hlPtr++;
			for (let j=0; j<l.length/4; j++) {
                if (imprintState!="scanning") hlPtr++;
                if (hlPtr==hlNo) {
                    ctx.strokeStyle="rgb(0,250,0)";
                    ctx.stroke();
                    ctx.beginPath();
                }
                ctx.moveTo(dx+dl*l[4*j+0], dy+dl*l[4*j+1]);
				ctx.lineTo(dx+dl*l[4*j+2], dy+dl*l[4*j+3]);
                if (hlPtr==hlNo) {
                    ctx.strokeStyle="rgb(255,255,255)";
                    ctx.lineWidth=4;
                    ctx.stroke();
                    if (["running","completing"].includes(imprintState)) return;
                }
			}
			dx+=dd;
		}
	}
    if (hlNo>0) {
        imprintState="scanning";
        if (hlNo>=hlPtr) imprintHlPtr=10; // restart highlight upon reaching the end
    }
    ctx.lineWidth=2;
	ctx.strokeStyle="rgb(0,250,0)";
	ctx.stroke();
}
