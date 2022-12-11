class Siggen extends pObject {
    constructor(pX,pY,pNo,pDefFunc) {
        var pW=370, pH=310, pX2=pX+105, pX3=pX+165, pY2=pY+100, pY3=pY+200;
        super(pX,pY,pW,300);
        new Frame(pX-65,pY-65,pW-10,pH,"CH"+pNo+" Signal","rightish");
        this.b_ch=new ChOnButton(pX+pW-150,pY-52,24,16,"ON","on");
        this.k_func=new FuncKnob(pX,pY,pDefFunc);
        this.k_freq=new DoubleKnob(pX2,pY,49,49,"Freq","double",35,17);
        this.k_ampl=new Knob(pX2,pY2,25,31,0,"Ampl","double");
        this.k_phase=new DoubleKnob(pX2,pY3,12,21,"Phase","double",35,17);
        new Vfd(pX3,pY,6,()=>{return freqs[0+pNo-1];},()=>{return this.b_ch.state==0;});
        new Vfd(pX3,pY2,6,()=>{return ampls[0+pNo-1];},()=>{return this.b_ch.state==0;});
        new Vfd(pX3,pY3,6,()=>{return 360*phases[0+pNo-1]/512;},()=>{return this.b_ch.state==0;});
        this.b_inv=new ChOnButton(pX,pY2,24,16,"INV","on");
    }
}
