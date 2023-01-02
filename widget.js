class pObject {
    constructor(pX,pY,pW,pH) {
        this.x=pX;
        this.y=pY;
        this.w=pW;
        this.h=pH;
        this.switchBufferNeeded=false;
        this.live=false; // live pObjects: Button, Knob, Radio
        this.bgcolor=null;
        this.hitPad=0;
        return this;
    }
    setSwitchBufferNeeded() {
        this.switchBufferNeeded=true;
    }
    turn(event,pDelta) {
        if (this.live && k_monitor.on() && this.switchBufferNeeded) setTimeout(switchBuffer,1);
    }
    click(event) {
        if (this.live && k_monitor.on() && this.switchBufferNeeded) setTimeout(switchBuffer,1);
    }
    hit(event) {
        if (this.live) {
            var pX=event.clientX-canvas.getBoundingClientRect().left;
            var pY=event.clientY-canvas.getBoundingClientRect().top
            if (pX>this.x+this.hitPad && pX<this.x+this.w-this.hitPad && 
                pY>this.y+this.hitPad && pY<this.y+this.h-this.hitPad) return true; 
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
    fillRect(ctx) {
        if (this.bgcolor!=null) {
            ctx.fillStyle=this.bgcolor;
            ctx.fillRect(this.x-1,this.y-1,this.w+2,this.h+2);            
        }
    }
    draw(ctx) {
        if (b_debug.state==1) this.drawRect(ctx);
    }
}

class Icon extends pObject {
    constructor(pX,pY,pW,pH,pFunc,pHalfIcon) {
        var ret=super(pX,pY,pW,pH);
        this.f=pFunc;
        this.halfIcon=pHalfIcon;
        this.ChOnType=false;
        this.parent=null;
        ui.push(this);
    }
    draw(ctx) {
        if (!this.ChOnType || this.parent.b_ch.state==1) {
            ctx.beginPath();
            ctx.strokeStyle="black";
            ampl=127;
            var halfed=1; if (this.halfIcon=="halficon") halfed=3;
            ctx.moveTo(this.x,this.y-this.h*this.f(0)/ampl/halfed);
            order=0;
            for (var i=0; i<this.w; i++) 
                ctx.lineTo(this.x+i,this.y-this.h*this.f(Math.floor(L*i/this.w),0)/ampl/halfed);
            ctx.stroke();
        }
    }
}

class DebugIcon extends Icon {
    constructor(pX,pY,pW,pH,pFunc) {
        var ret=super(pX,pY,pW,pH,pFunc);
    }
    draw(ctx) {
        if (b_debug.state==1) super.draw(ctx);
    }
}

class Label extends pObject {
    constructor(pX,pY,pS,pSize) {        
        var ret=super(pX,pY,getTextWidth(ctx,pS,pSize),pSize+1);
        this.tX=pX; this.tY=pY;
        this.adjustRect(this.tX-this.w/2-2,this.tY-this.h/2,this.w+4,this.h-3);
        this.s=pS;
        this.size=pSize;
        ui.push(this);
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
        ctx.fillStyle=bgcolor;
        ctx.fillRect(this.x,this.y,this.w,this.h);
        if (b_debug.state==1) this.drawRect(ctx);
        this.fillRect(ctx);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle="black";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.s,this.tX,this.tY)
        ctx.stroke();
        super.draw(ctx);
    }
}

class DebugLabel extends Label {
    constructor(pX,pY,pS,pSize,pCalcFunc) {
        super(pX,pY,pS,pSize);
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
        super(pX,pY,pW,pH);
        var x={"center":pX+pW/2,"rightish":pX+3*pW/4};
        ui.push(this);
        new Label(x[pPos],pY+1," "+pLabel+" ",15);
    }
    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.strokeStyle = "rgb(0, 25, 0)";
        ctx.roundRect(this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.restore();
        super.draw(ctx);
    }
}
