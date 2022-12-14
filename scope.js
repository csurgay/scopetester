class Scope extends pObject {
    constructor(pX,pY,pD,pDD) {
        super(pX,pY,10*pD+2*pDD,8*pD+2*pDD);
        this.d=pD;
        this.dd=pDD;
        ui.push(this);
        new Frame(630,15,220,250,"Horizontal","center");
        new Frame(630,278,220,170,"Vertical","center");
        new Frame(750,465,105,150,"Mode","center");
        new Frame(750,630,105,145,"Trigger","center");
        b_ch1=new ChOnButton(810,500,24,16,"CH1","on");
        b_ch2=new ChOnButton(810,500,24,16,"CH2","on");
        b_dual=new ChOnButton(810,500,24,16,"Dual","on");
        b_add=new ChOnButton(810,500,24,16,"Add","on");
        b_mod=new ChOnButton(810,500,24,16,"Mod","on");
        b_xy=new ChOnButton(810,500,24,16,"X-Y","on");
        radio_mode=new Radio(810,485,[b_ch1,b_ch2,b_dual,b_add,b_mod,b_xy]);
        b_auto=new ChOnButton(810,500,24,16,"Auto","on");
        b_dso=new ChOnButton(810,500,24,16,"DSO","on");
        b_single=new ChOnButton(810,500,24,16,"Single","on");
        radio_trigger=new Radio(810,650,[b_auto,b_dso,b_single]);
        b_find=new ChOnButton(20,300,24,16,"Find","small");
        b_find.label.size=12;
        b_chon=[b_ch1,b_ch2];
        this.ch=[new ScopeChannel(690,80), new ScopeChannel(790,80)];
        k_intensity=new Knob(30,120,15,41,0,"Intensity","knob");
        k_focus=new Knob(30,180,15,50,0,"Focus","knob");
        k_illum=new Knob(30,240,15,50,0,"Illum","knob");
        k_time=new TimeKnob(740,180);
        k_xpos=new Knob(740,410,20,49,0,"Pos X","knob");
    }
    drawScreen(ctx) {
        // draw screen
        ctx.beginPath();
        ctx.strokeStyle = "rgb(0, 25, 0)";
        ctx.lineWidth=6;
        ctx.fillStyle = "rgba(50, 100, 50, 1)";
        ctx.roundRect(this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.lineWidth=1;
        // draw grid
        var d=this.d;
        var dd=this.dd;
        var illum=k_illum.value;
        if (illum>0)
            ctx.strokeStyle = "rgb("+(128+illum*3)+", "+(128+illum*3)+", "+(128+illum*3)+")";
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
    }
    draw(ctx) {
        var d=this.d;
        var dd=this.dd;
        this.drawScreen(ctx);
        // draw beams
        var int=k_intensity.value; if (int>k_intensity.ticks/2) int-=k_intensity.ticks;
        var blur=k_focus.value; if (blur>k_focus.ticks/2) blur-=k_focus.ticks;
        ctx.save();
        ctx.roundRect(this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        ctx.beginPath();
        ctx.strokeStyle="rgb(0,"+(213+2*int)+",0)";
        ctx.lineWidth=3+int/7;
        ctx.filter="blur("+Math.abs(blur/5)+"px)";
        y=[new Array(512), new Array(512)];
        var px,py0,py=[0,0];
        for (var c=1; c>=0; c--) {
            py[c]=this.ch[c].k_ypos.value; if (py[c]>24) py[c]-=49;
            px=k_xpos.value; if (px>24) px-=49;
            if (b_find.state==1) py[c]/=7;
            py0=this.y+dd+4*d+py[c]*10;
            py[c]=py0+(c*2-1)*d;
            px=this.x+dd+px*10;
            var l=this.ch[c].k_level.k.value; if (l>24) l-=49;
            var l_=this.ch[c].k_level.k_.value; if (l_>24) l_-=49;
            for (var i=0; i<ch[c].length; i++) {
                if (siggen[c].b_ch.state==1) {
                    y[c][i]=Math.pow(1.01,l*20+l_)*ch[c][i]/2;
                    if (b_find.state==1) y[c][i]/=10;
                }
                else 
                    y[c][i]=0;
            }
        }
        if (b_dual.state==1) {
            for (var c=0; c<2; c++) {
                ctx.moveTo(px,py[c]-y[c][0]);
                for (var i=0; i<ch[c].length; i++) {
                    ctx.lineTo(px+i,py[c]-y[c][i]);
                }
            }
        }
        else if (b_xy.state==1) {
            ctx.moveTo(this.x+dd+5*d+ch[0][0],this.y+dd+4*d+ch[1][0]);    
            for (var i=1; i<512; i++)
                ctx.lineTo(this.x+dd+5*d+ch[0][i],this.y+dd+4*d+ch[1][i]);    
            ctx.lineTo(this.x+dd+5*d+ch[0][0],this.y+dd+4*d+ch[1][0]);    
        }
        else {
            if (b_ch1.state==1) ctx.moveTo(px,py0-y[0][0]);
            else if (b_ch2.state==1) ctx.moveTo(px,py0-y[1][0]);
            else if (b_add.state==1) ctx.moveTo(px,py0-(y[0][0]+y[1][0]));
            else if (b_mod.state==1) ctx.moveTo(px,py0-y[0][0]*y[1][0]/ampls[1]);
            for (var i=1; i<512; i++) {
                if (b_ch1.state==1) ctx.lineTo(px+i,py0-y[0][i]);
                else if (b_ch2.state==1) ctx.lineTo(px+i,py0-y[1][i]);
                else if (b_add.state==1) ctx.lineTo(px+i,py0-(y[0][i]+y[1][i]));
                else if (b_mod.state==1) ctx.lineTo(px+i,py0-y[0][i]*y[1][i]/ampls[1]);
            }
        }
        ctx.stroke();
        ctx.restore();
        ctx.lineWidth=1;
    }
}
class ScopeChannel {
    constructor(pX,pY) {
        this.k_ypos=new Knob(pX,pY,20,49,0,"Pos Y","knob");
        this.k_level=new DoubleKnob(pX,pY+260,49,49,"Volts/Div","double",35,17);
    }
}