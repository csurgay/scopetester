class Scope extends pObject {
    constructor(pX,pY,pD,pDD) {
        super(pX,pY,10*pD+2*pDD,8*pD+2*pDD);
        this.d=pD;
        this.dd=pDD;
        ui.push(this);
        new Frame(630,15,300,255,"Horizontal","center");
        new Frame(630,283,300,170,"Vertical","center");
        new Frame(750,630,85,145,"Beam","center");
        new Frame(845,630,85,145,"Monitor","center");
        new Frame(750,465,180,150,"Trigger","center");
        k_vol=new Knob(8,885,675,20,17,0,"Volume","knob");
        k_vol.setSwitchBufferNeeded();
        k_monitor=new MonitorKnob(885,735);
        b_ch1=new ChOnButton(800,650,24,16,"CH1","on");
        b_ch2=new ChOnButton(800,650,24,16,"CH2","on");
        b_chon=[b_ch1,b_ch2];
        b_dual=new ChOnButton(800,650,24,16,"Dual","on");
        b_add=new ChOnButton(800,650,24,16,"Add","on");
        b_mod=new ChOnButton(800,650,24,16,"Mod","on");
        b_xy=new ChOnButton(800,650,24,16,"X-Y","on");
        radio_mode=new Radio(800,650,[b_ch1,b_ch2,b_dual,b_add,b_mod,b_xy]);
        b_auto=new ChOnButton(880,554,24,16,"Auto","on");
        b_ch1tr=new ChOnButton(880,554,24,16,"Ch1","on");
        b_ch2tr=new ChOnButton(880,554,24,16,"Ch2","on");
        radio_trig=new Radio(880,554,[b_auto,b_ch1tr,b_ch2tr]);
        b_find=new FindButton(20,300,24,16,"Find","small");
        b_mic=new MicButton(20,380,24,16,"Mic","small");
        b_debug=new DebugButton(20,420,24,16,"Debug","small");
        this.ch=[new ScopeChannel(690,80), new ScopeChannel(830,80)];
        k_intensity=new Knob(8,30,120,15,17,0,"Intensity","knob");
        k_focus=new Knob(-1,30,180,15,17,0,"Focus","knob");
        k_illum=new Knob(18,30,240,15,17,0,"Illum","knob");
        k_time=new TimeKnob(850,180);
        new Vfd(715,75,4,()=>{return 10*k_delay.k.value+k_delay.k_.value;},()=>{return 10*k_delay.k.value+k_delay.k_.value==0;});
        k_delay=new DoubleKnob(670,75,100,100,"Delay","double",35,20);
        k_delaybase=new DelaybaseKnob(705,180);
        k_xpos=new Knob(24,850,75,20,49,0,"Pos X","knob");
        k_trig=new DoubleKnob(800,520,50,50,"Level","double_s",30,15);
        k_hold=new DoubleKnob(880,520,50,50,"HoldOff","double_s",30,15);
        k_slope=new Knob(-1,800,590,17,2,0,"Slope","knob");
        b_resv=new ResvButton(20,340,24,16,"Resv","small");
        b_resv.label.size=12;
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
        var illum=Math.floor(127*k_illum.value/k_illum.ticks);
        if (illum>0)
            ctx.strokeStyle = "rgb("+(128+illum)+", "+(128+illum)+", "+(128+illum)+")";
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
        // intensity and focus
        var int=k_intensity.value; if (int>k_intensity.ticks/2) int-=k_intensity.ticks;
        var blur=k_focus.value; if (blur>k_focus.ticks/2) blur-=k_focus.ticks;
        // draw beams
        ctx.save();
        ctx.roundRect(this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        ctx.beginPath();
        ctx.strokeStyle="rgb(0,"+(255-5*k_intensity.ticks/2+5*int)+",0)";
        ctx.lineWidth=3+int/3+Math.abs(blur/2);
        ctx.filter="blur("+Math.abs(blur/2)+"px)";
        var px,py0,py=[0,0];
        var minY=1000000, maxY=-1000000;
        // timebase
        var kt=k_time.k.value; if (kt>k_time.k.ticks/2) kt-=k_time.k.ticks;
        var kt_=k_time.k_.value; if (kt_>k_time.k_.ticks/2) kt_-=k_time.k_.ticks;
        timebase=tb[kt+Math.floor(k_time.k.ticks/2-1)]*tb_[kt_+Math.floor(k_time.k_.ticks/2)];
        q=timebase*L/512;
        // delay
        var kdb=k_delaybase.k.value; if (kdb>k_delaybase.k.ticks/2) kdb-=k_delaybase.k.ticks;
        var kdb_=k_delaybase.k_.value; if (kdb_>k_delaybase.k_.ticks/2) kdb_-=k_delaybase.k_.ticks;
        delay=tb[kdb+Math.floor(k_delaybase.k.ticks/2-1)]*tb_[kdb_+Math.floor(k_delaybase.k_.ticks/2)];
        delay=(10*k_delay.k.value+k_delay.k_.value)*delay;
        delay=delay*L;
    // loop of channels
        for (var c=1; c>=0; c--) {
            // level (Volts/Div)
            var l=this.ch[c].k_volts.k.value; l=(l+Math.floor(vpd.length/2))%vpd.length;
            var l_=this.ch[c].k_volts.k_.value; l_=(l_+Math.floor(vpd_.length/2))%vpd_.length;
            var level=vpd[l]*vpd_[l_];
            if (b_debug.state==1) console.log("ch:"+c+" l:"+l+" l_:"+l_+" level:"+level);
            // x and y pos
            py[c]=this.ch[c].k_ypos.value; if (py[c]>24) py[c]-=49;
            px=k_xpos.value; if (px>24) px-=49;
            // find value one adjust at a time
            if (findState!="off") py[c]/=findValue;
            // gnd lines position
            py0=this.y+dd+4*d+py[c]*10;
            py[c]=py0+(c*2-1)*d;
            px=this.x+dd+px*10;
            // main y value buffer calculation
            for (var i=0; i<L; i++) {
                // if CH is switched on
                if (siggen[c].b_ch.state==1) {
                    // main y calculation
                    var qi=Math.round(freqs[c]*(10*q*i+delay))%L; if (qi<0) qi+=L;
                    y[c][i]=sch[c][qi]/level/2;
                    // find
                    if (findState!="off") y[c][i]/=findValue;
                    if (y[c][i]<minY) minY=y[c][i];
                    if (y[c][i]>maxY) maxY=y[c][i];
                }
                else 
                    y[c][i]=0;
            }
        }
        if (findState=="search" && minY>-4*dd && maxY<4*dd) {
            findState="found";
        }
        if (b_dual.state==1) {
            for (var c=0; c<2; c++) {
                ctx.moveTo(px,py[c]-y[c][0]);
                for (var i=0; i<512; i++) {
                    ctx.lineTo(px+i,py[c]-y[c][i]);
                }
            }
        }
        else if (b_xy.state==1) {
            ctx.moveTo(this.x+dd+5*d+y[0][0],this.y+dd+4*d+y[1][0]);    
            for (var i=1; i<512; i++)
                ctx.lineTo(this.x+dd+5*d+y[0][i],this.y+dd+4*d+y[1][i]);    
            ctx.lineTo(this.x+dd+5*d+y[0][0],this.y+dd+4*d+y[1][0]);    
        }
        else {
            ctx.moveTo(px,py0-this.calcModeY(-1,y[0][0],y[1][0]));
            for (var i=1; i<512; i++) {
                var qi = i;
                ctx.lineTo(px+i,py0-this.calcModeY(-1,y[0][qi],y[1][qi]));
            }
        }
        ctx.stroke();
        ctx.restore();
        ctx.lineWidth=1;
    }
    calcModeY(c,ych0,ych1) {
        if (b_ch1.state==1) return ych0;
        else if (b_ch2.state==1) return ych1;
        else if (b_add.state==1) return ych0+ych1;
        else if (b_mod.state==1) return ych0*ych1/ampls[1];
        else if (b_dual.state==1) return [ych0,ych1][c];
    }
}
class ScopeChannel {
    constructor(pX,pY) {
        this.k_ypos=new Knob(24,pX+70,pY+340,20,49,0,"Pos Y","knob");
        this.k_volts=new VoltsKnob(pX,pY+275);
    }
}