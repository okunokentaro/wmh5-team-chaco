import {Injectable} from '@angular/core';
import Rx from 'rxjs/Rx';

class MIDI{
    constructor(){
        this.midi = null;
        this.inputs = [];
        this.outputs = [];
        this.params = [];
        this.outPutKey = [];
        for(let i = 0; i < 16; i++){
            this.params[i] = 0;
        }
    }
    _success(midiAccess){
        return new Promise((resolve, reject) => {
                console.log('MIDI READY');
        this.midi = midiAccess;
        console.log(this.midi);
        resolve();
    });
    }
    _failure(msg){
        console.log('Failed - ' + msg);
    }
    _setInputs(){
        return new Promise((resolve, reject) => {
                console.log('INPUTS READY');
        this.inputs = this.midi.inputs;
        this.inputs.forEach((key) => {
            console.log(key);
        key.onmidimessage = this._onMidiMessage.bind(this);
    });
        resolve();
    });
    }
    _onMidiMessage(event){
        this.params[event.data[0]] = this.params[event.data[0]] ? this.params[event.data[0]] : {};
        this.params[event.data[1]] = event.data[2];
        console.log(event.data[1] + ' : ' + event.data[2]);
    }
    _setOutputs(){
        return new Promise((resolve, reject) => {
                console.log('OUTPUTS READY');
        this.outputs = this.midi.outputs;
        this.outputs.forEach((key) => {
            this.outPutKey.push(key);
    });
        resolve();
    });
    }
    sendMIDI(index){
        for(let i = 0; i < 16; i++){
            this.outPutKey[0].send([176, i, 0]);
        }
        this.outPutKey[0].send([176, index, 127]);
    }
    connect(){
        return navigator.requestMIDIAccess()
            .then(this._success.bind(this), this._failure.bind(this))
            .then(this._setInputs.bind(this), this._failure.bind(this))
            .then(this._setOutputs.bind(this), this._failure.bind(this))
    }
}


class Osc {
    constructor(v, l){
        this.audioctx = new AudioContext();
        let play = 0;
        this.vcoParam = v;
        this.lfoParam = l;
        this.vco = this.audioctx.createOscillator();
        this.vco.type = 'square';
        this.lfo = this.audioctx.createOscillator();
        this.depth = this.audioctx.createGain();
        this.init();
    }
    init(){
        console.log('OSC init', this.vco, this.lfo);
        console.log(this.vcoParam);
        this.vco.connect(this.audioctx.destination);
        this.lfo.connect(this.depth);
        this.depth.connect(this.vco.frequency);
        this.vco.frequency.value = 0;
        this.lfo.frequency.value = 0;
        this.depth.gain.value = 0;
        this.vco.start(0);
        this.lfo.start(0);
    }
    start(){
        this.vco.frequency.value = this.vcoParam;
        this.lfo.frequency.value = this.lfoParam;
        this.depth.gain.value = 30;
    }
    stop(){
        this.vco.frequency.value = 0;
        this.depth.gain.value = 0;
    }
}

export class MidiAdaputer {
    constructor (){
        this.midi = new MIDI();
        this.osc = [
            new Osc(261.626, 1),
            new Osc(311.127, 1),
            new Osc(349.228, 1),
            new Osc(391.995, 1),
            new Osc(466.164, 1),
            new Osc(523.251, 1)
        ];
        this.subject = new Rx.Subject();
        this.init();
    }
    init(){
        this.midi.connect();
        this.subject.subscribe((v) => {
            if(v.ch0){
                this.start(v.ch0, 0);
            }
            if(v.ch1){
                this.start(v.ch1, 1);
            }
            if(v.ch2){
                this.start(v.ch2, 2);
            }
            if(v.ch3){
                this.start(v.ch3, 3);
            }
            if(v.ch4){
                this.start(v.ch4, 4);
            }
            if(v.ch5){
                this.start(v.ch5, 5);
            }
            //if(v.ch6){
            //    this.start(v.ch6, 6);
            //}
            //if(v.ch7){
            //    this.start(v.ch7, 7);
            //}
        });
    }
    start(ch, i){
        this.osc[i].start();
        setTimeout(() => {
            this.osc[i].stop();
        }, (60000 / ch.bpm / 16));
    }
    emit(v) {
        this.subject.next(v);
    }
}