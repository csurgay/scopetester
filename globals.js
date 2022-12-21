var canvas, ctx, scope, siggen; // main ui objects
var no_images_to_load, vfd, led_on, led_off; // canvas images
const L = 4096, L2=L/2, L4=L/4, L8=L/8; // buffer length
const A = 127; // default amplitude (on integer scale, A -> 1.0)
var timebase, q; // not sure yet, q=timebase*L/512
const sqrt=1.0293022366; // ^24=2 (sqrt=1.07177347; // ^10=2)
//const bgcolor="rgb(201, 187, 142)"; // pastell yellow
const bgcolor="#bbbbbb"; // pastell yellow
var k_intensity, k_focus, k_illum, k_xpos;
var b_power;
var bufgen=[];
var ch=[new Array(L),new Array(L)]; // original channel buffer, will get rid of
var sch=[new Array(L),new Array(L)]; // signal channel buffer, no freq
var micch=[new Array(L),new Array(L)]; // mic channel buffer
var y, order, ampl, freq, ampls=[0,0];
var scales=[0,0], freqs=[0,0], freqs_=[0,0], phases=[0,0];
var ui=[];
var b_chon, k_time;
var radio_mode, b_ch1, b_ch2, b_dual, b_add, b_mod, b_xy;
var b_find, b_monitor, b_mic, b_debug;
var radio_trigger, b_auto, b_dso, b_single;
const dVfd=16, dButton=20;
const tb=[ 500,200,100,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005,.002,.001];
const tb_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const scale=["1","10","100","1000",".01",".1"];
var findState, findValue;