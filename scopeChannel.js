class ScopeChannel {
    constructor(c,pX,pY) {
//        this.k_ypos=new Knob(ctx,240,pX+65,pY+247,20,481,0,"Pos Y","knob");
        this.k_ypos=new DoubleKnob(ctx,pX+60,pY+255,201,201,"Pos Y","posy",25,15);
//        if (c==0) this.k_ypos.k.value=10; else if (c==1) this.k_ypos.k.value=-10;
        this.k_ypos.setResetTogether();
        this.k_volts=new VoltsKnob(pX-10,pY+280);
        this.k_volts.k.value0=false;
        this.k_volts.k_.value0=false;
        this.b_ac=new PushButton(ctx,pX+58,pY+309,pbw,pbh,"AC",'on');
        this.b_gnd=new PushButton(ctx,pX+58,pY+309,pbw,pbh,"Gnd",'on');
        this.b_dc=new PushButton(ctx,pX+58,pY+309,pbw,pbh,"DC",'on');
        this.b_dc.state=1;
        this.acdc=new Radio(ctx,pX+58,pY+309,[this.b_ac,this.b_gnd,this.b_dc]);
    }
}
