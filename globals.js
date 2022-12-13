var canvas, ctx, scope, siggen, no_images_to_load, vfd, led_on, led_off;
const sqrt=1.0293022366; // ^24=2 (sqrt=1.07177347; // ^10=2)
const frq=[1, 1.25,1.5,1.75,2, 2.5,3,3.5,4, 4.5,5,5.5,6, 7,8,9,10, 15,20,30,50, 100,200,500,1000];
const bgcolor="rgb(201, 187, 142)";
var k_intensity, k_focus, k_illum, k_xpos, k_func, k_freq, k_phase, k_ampl;
var b_power, b_ch;
var bufgen=[];
var ch1=new Array(512), ch2=new Array(512);
var ch=[ch1,ch2];
var y, order, ampl, freq, ampls=[0,0], freqs=[0,0], freqs_=[0,0], phases=[0,0];
var ui=[];
var b_chon, k_time, radio, b_ch1, b_ch2, b_dual, b_add, b_mod, b_xy, b_find;
const dVfd=16, dButton=20;
