//no comment
const teoria = require("teoria");


function meterToIntArray(string){
    var array = string.split('/');

    return array.map(i => parseInt(i));
}

const metersSet = [
    {
        signatures_set: ['4/4', '17/16', '5/4'],
        slot: 4,
    },
    {
        signatures_set: ['3/4', '7/8'],
        slot: 3,
    },
    {
        signatures_set: ['5/4'],
        slot: 5,
    },
    {
        signatures_set: ['7/4'],
        slot: 7,
    },
]


class Chord {
       constructor(chord, tonality) {
           if ( chord == null ){
                this._chord = null;
           }
           else {
               this.chord = chord;
           }
           this.tonality = tonality;
       }

    get chord() {
        return this._chord;
    }

    set chord(value) {
        this._chord = teoria.chord(value);
    }


    get tonality() {
        return this._tonality;
    }

    set tonality(value) {
        this._tonality = teoria.scale(value.split(' ')[0], value.split(' ')[1]);
    }
}



class Song{
    constructor(title) {
        this.meterType = 0;
        this.meter = meterToIntArray(metersSet[0].signatures_set[0]);
        this.bpm = 120;
        this.glob_tonality = 'C major';
        this._chart = [];
        this.createChart();
        this._title = title;
    }

    addBar(){
        for ( let i = 0; i < metersSet[this.meterType].slot; i++){
            let c = new Chord(null, this.glob_tonality.tonic.name() + ' ' + this.glob_tonality.name);
            this._chart.push(c);
        }
    }

    removeBar(){
        for ( let i = 0; i < metersSet[this.meterType].slot; i++){
            this._chart.pop();
        }
    }

    createChart(){
        this.addBar();
    }

    get Chart(){
        return this._chart;
    }

    get meterType(){
        return this._meterType;
    }

    set meterType(value){
        this._meterType = value;
    }

    get glob_tonality(){
        return this._tonality;
    }

    set glob_tonality(value){
        this._tonality = teoria.scale(value.split(' ')[0], value.split(' ')[1]);
    }

    set meter(value) {
        this._meter = value;
    }

    set bpm(value) {
        this._bpm = value;
    }

    set title(value) {
        this._title = value;
    }

    get meter(){
        return this._meter;
    }

    get bpm(){
        return this._bpm;
    }

    get title() {
        return this._title;
    }

}

var newSong = new Song('The Girl from Ipanema');

console.log(newSong);