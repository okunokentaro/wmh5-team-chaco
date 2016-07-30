class MIDI{
    constructor(){
        this.midi = null;
        this.inputs = [];
        this.outputs = [];
        this.params = {};
    }
    _success(midiAccess){
        return new Promise((resolve, reject) => {
                console.log("MIDI READY");
        this.midi = midiAccess;
        resolve();
    });
    }
    _failure(msg){
        console.log("Failed - " + msg);
    }
    _setInputs(){
        return new Promise((resolve, reject) => {
            console.log("INPUTS READY");
            this.inputs = this.midi.inputs;
            this.inputs.forEach((key) => {
                key.onmidimessage = this._onMidiMessage.bind(this);
            });
            resolve();
        });
    }
    _onMidiMessage(event){
        //this.params[event.data[0]] = this.params[event.data[0]] ? this.params[event.data[0]] : {};
        this.params[event.data[1]] = event.data[2];
        console.log(event.data[1] + " : " + event.data[2]);
    }
    _setOutputs(){
        return new Promise((resolve, reject) => {
            console.log("OUTPUTS READY");
            this.outputs = this.midi.outputs;
            this.outputs.forEach((key) => {
                console.log(key);
            key.send([176, 64, 1]);
        });
            resolve();
        });
    }
    connect(){
        return navigator.requestMIDIAccess()
            .then(this._success.bind(this), this._failure.bind(this))
            .then(this._setInputs.bind(this), this._failure.bind(this))
            .then(this._setOutputs.bind(this), this._failure.bind(this))
    }
}