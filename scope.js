var b_chon, k_time;
class Scope extends pObject {
    constructor(pX,pY,pD,pDD) {
        super(pX,pY,10*pD+2*pDD,8*pD+2*pDD);
        this.d=pD;
        this.dd=pDD;
        ui.push(this);
        new Frame(630,15,220,250,"Horizontal",1);
        new Frame(630,278,220,170,"Vertical",1);
        b_chon=[new ChOnButton(690,30,24,16,"CH1",4),
            new ChOnButton(790,30,24,16,"CH2",4)];
        this.ch=[new ScopeChannel(690,110), new ScopeChannel(790,110)];
        k_time=new TimeKnob(740,190);
    }
    draw(ctx) {
        // draw screen
        ctx.beginPath();
        ctx.strokeStyle = "rgb(0, 25, 0)";
        ctx.lineWidth=6;
        ctx.fillStyle = "rgba(0, 50, 0, .5)";
        ctx.roundRect(this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.lineWidth=1;
        // draw grid
        var illum=k_illum.value;
        if (illum>0)
            ctx.strokeStyle = "rgb("+(128+illum*3)+", "+(128+illum*3)+", "+(128+illum*3)+")";
        var d=this.d;
        var dd=this.dd;
        for (var i=dd; i<=this.w-dd+1; i+=d) {
            ctx.moveTo(this.x+i,this.y+dd);
            ctx.lineTo(this.x+i,this.y+this.h-dd);
        }
        for (var i=dd; i<=this.h-dd+1; i+=d) {
            ctx.moveTo(this.x+dd,this.y+i);
            ctx.lineTo(this.x+this.w-dd,this.y+i);
        }
        // draw hair
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+this.h/2-dd/4);
            ctx.lineTo(this.x+i,this.y+this.h/2+dd/4);
        }
        for (var i=dd; i<=this.h-dd+1; i+=d/5) {
            ctx.moveTo(this.x+this.w/2-dd/4,this.y+i);
            ctx.lineTo(this.x+this.w/2+dd/4,this.y+i);
        }
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+2*d-dd/8);
            ctx.lineTo(this.x+i,this.y+dd+2*d+dd/8);
        }
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+6*d-dd/8);
            ctx.lineTo(this.x+i,this.y+dd+6*d+dd/8);
        }
        // draw dots
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+6*d+d/2);
            ctx.lineTo(this.x+i,this.y+dd+6*d+d/2+1);
        }
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+d+d/2);
            ctx.lineTo(this.x+i,this.y+dd+d+d/2+1);
        }
        ctx.stroke();
        // draw beams
        var int=k_intensity.value; if (int>k_intensity.ticks/2) int-=k_intensity.ticks;
        var blur=k_focus.value; if (blur>k_focus.ticks/2) blur-=k_focus.ticks;
        ctx.save();
        ctx.roundRect(this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        ctx.beginPath();
        for (var c=0; c<2; c++) if (b_chon[c].state==1) {
            var py=this.ch[c].k_pos.k.value; if (py>24) py-=49;
            var px=this.ch[c].k_pos.k_.value; if (px>24) px-=49;
            py=this.y+dd+(3+c*2)*d+py*10;
            px=this.x+dd+px*10;
            var l=this.ch[c].k_level.k.value; if (l>24) l-=49;
            var l_=this.ch[c].k_level.k_.value; if (l_>24) l_-=49;
            ctx.strokeStyle="rgb(0,"+(213+2*int)+",0)";
            ctx.lineWidth=3+int/7;
            ctx.filter="blur("+Math.abs(blur/5)+"px)";
            if (b_ch[c].state==1)
                ctx.moveTo(px,py-Math.pow(1.01,l*20+l_)*ch[c][0]/2);
            else
                ctx.moveTo(px,py-0*ch[c][0]/2);
            for (var i=0; i<ch[c].length; i++) {
                if (b_ch[c].state==1)
                    ctx.lineTo(px+i,py-Math.pow(1.01,l*20+l_)*ch[c][i]/2);
                else
                    ctx.lineTo(px+i,py-0*ch[c][i]/2);
            }
        }
        ctx.stroke();
        ctx.restore();
        ctx.lineWidth=1;
    }
}
class ScopeChannel {
    constructor(pX,pY) {
        this.k_pos=new DoubleKnob(pX,pY,49,49,"Pos Y/X",3,35,17);
        this.k_level=new DoubleKnob(pX,pY+230,49,49,"Volts/Div",3,35,17);
    }
}