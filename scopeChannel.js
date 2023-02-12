const sc_radioX=36, sc_radioY=58;
const sc_sourceX=230, sc_sourceY=26;

class ScopeChannel {
    constructor(c,pX,pY) {
        var xx=c==0?80:180;
        this.label=new Label(ctx,pX+xx,pY,"CH"+(c+1),14);
        this.label.background=true;
        this.k_volts=new VoltsKnob(pX+133,pY+65);
        this.k_ypos=new DoubleKnob(ctx,pX+50,pY+30,201,201,"Pos  ","posy",20,10);
        this.k_ypos.setResetTogether();
        this.k_volts.k.value0=false;
        this.k_volts.k_.value0=false;
        this.b_ac=new PushButton(ctx,pX+sc_radioX,pY+sc_radioY,pbw,pbh,"AC",'on');
        this.b_gnd=new PushButton(ctx,pX+sc_radioX,pY+sc_radioY,pbw,pbh,"Gnd",'on');
        this.b_dc=new PushButton(ctx,pX+sc_radioX,pY+sc_radioY,pbw,pbh,"DC",'on');
        this.b_dc.state=1;
        this.acdc=new Radio(ctx,pX+sc_radioX,pY+sc_radioY,[this.b_ac,this.b_gnd,this.b_dc]);
        this.cal=new IndicatorLed(pX+200,pY+10+1000,24,16,"Cal","on");
        new Frame(pX+sc_sourceX-32,pY+12,70,108,"Src","center");
        this.bnc=new BncButton(pX+sc_sourceX+5,pY+105,16,16,"","bnc");
        this.b_ext=new PushButton(ctx,pX+sc_sourceX,pY+sc_sourceY,pbw,pbh,"Ext",'on');
        this.b_mic=new PushButton(ctx,pX+sc_sourceX,pY+sc_sourceY,pbw,pbh,"Mic",'on');
        this.b_ch=new PushButton(ctx,pX+sc_sourceX,pY+sc_sourceY,pbw,pbh,"WG"+(c+1),'on');
        this.b_ch.state=1;
        this.source=new Radio(ctx,pX+sc_sourceX,pY+sc_sourceY,[this.b_ch,this.b_mic,this.b_ext]);
    }
}
