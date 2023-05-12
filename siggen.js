class Siggen extends pObject {
    constructor(pX,pY,pNo) {
        var pW=505, pH=310, pX2=pX+125, pX3=pX+175, pX4=pX3+155;
        var pY1=pY-20, pY2=pY1+75, pY3=pY2+75, pY4=pY3+75, pY5=pY3+20;
        super(ctx,pX,pY,pW,300);
        this.myChannel=pNo;
        if (pNo==1) {
            new Label(ctx,pX+50,pY-78,"WAVEFORM GENERATOR",16,bgcolor);
            new Label(ctx,pX+640,pY-78,credit,16,bgcolor);
        }
        new Frame(pX-65,pY-65,pW-40,pH,"                  ","right");

        this.b_ch=new PushButton(ctx,pX+pW-149,pY-71,34,22,"WG"+pNo+"     ","siggen");
        this.b_ch.illum=false;
        this.b_ch.state=1;
        this.b_ch.setSwitchBufferNeeded();
        this.b_ch.initChannelsNeeded=true;

        this.k_func=new FuncKnob(pX+15,pY+165);
//        this.k_func=new FuncKnob(pX+5,pY+10);
        this.k_func.setSwitchBufferNeeded();
        this.k_func.setInitChannelsNeeded();

        this.k_scale=new ScaleKnob(pX+15,pY+15);
//        this.k_scale=new ScaleKnob(pX+5,pY+133);
        this.k_scale.setSwitchBufferNeeded();
        this.k_scale.value0=false;
        this.k_scale.initChannelsNeeded=true;

        this.k_freq=new DoubleKnob(ctx,pX2,pY1,201,101,"Freq (kHz)       ","sigdouble",30,15);
        this.k_freq.setSwitchBufferNeeded();
        this.k_freq.setInitChannelsNeeded();
        this.k_ampl=new DoubleKnob(ctx,pX2,pY2,201,201,"Ampl (V)         ","sigdouble",30,15);
        this.k_ampl.setSwitchBufferNeeded();
        this.k_ampl.setInitChannelsNeeded();
        this.k_phase=new DoubleKnob(ctx,pX2,pY3,24,720,"Phase (0-360)","sigdouble",30,15);
        this.k_phase.setSwitchBufferNeeded();
        this.k_phase.k.value0=false;
        this.k_phase.k.limit=-1;
        this.k_phase.k_.limit=-1;
        this.k_phase.setInitChannelsNeeded();
        this.k_dc=new DoubleKnob(ctx,pX2,pY4,201,101,"Offset (V DC)  ","sigdouble",30,15);
        this.k_dc.setSwitchBufferNeeded();
        this.k_dc.setInitChannelsNeeded();
        new Vfd(pX3-5,pY1,6,()=>{return Math.round(100000*freqs[0+pNo-1])/100000;},()=>{return scope.b_power.state==0 || this.b_ch.state==0;});
        new Vfd(pX3-5,pY2,6,()=>{return ampls[0+pNo-1]/100;},()=>{return scope.b_power.state==0 || this.b_ch.state==0;});
        new Vfd(pX3-5,pY3,6,()=>{return Math.round(360*phases[0+pNo-1]/L);},()=>{return scope.b_power.state==0 || this.b_ch.state==0;});
        new Vfd(pX3-5,pY4,6,()=>{return dcs[0+pNo-1];},()=>{return scope.b_power.state==0 || this.b_ch.state==0;});
        this.b_phalf=new PushButton(ctx,pX4,pY5,pbw,pbh,"Pos+","on");
        this.b_phalf.setInitChannelsNeeded();
        this.b_phalf.setOtherIllumCondition(()=>{return this.b_ch.state==1;});
        this.b_nhalf=new PushButton(ctx,pX4,pY5+20,pbw,pbh,"Neg-","on");
        this.b_nhalf.setInitChannelsNeeded();
        this.b_nhalf.setOtherIllumCondition(()=>{return this.b_ch.state==1;});
        this.b_inv=new PushButton(ctx,pX4,pY5+40,pbw,pbh,"Inv","on");
        this.b_inv.setInitChannelsNeeded();
        this.b_inv.setOtherIllumCondition(()=>{return this.b_ch.state==1;});
        this.b_abs=new PushButton(ctx,pX4,pY5+60,pbw,pbh,"Abs","on");
        this.b_abs.setInitChannelsNeeded();
        this.b_abs.setOtherIllumCondition(()=>{return this.b_ch.state==1;});
        this.display=new DebugIcon(0,100*pNo,100,20,(x)=>{if (x==-17) return schlen[pNo-1]; else return sch[pNo-1][x];});
        this.display.ChOnType=true;
        this.display.parent=this;

        this.noise=new NoiseKnob(pX4+3,pY1+30,"grayed");
        this.burst=new BurstKnob(pX4+3,pY1+125,"grayed");
    }
}
