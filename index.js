//no comment
const teoria = require("teoria");

var chord = teoria.note('C');

class Chord {
       constructor(chord, tonality) {
           this.chord = chord;
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

var firstChord = new Chord('Cmin9', 'F major');

class bar{
    constructor(type) {
        this.array = [];
        this.type = type;
    }

    createBar(){
        for(var  i = 0; i < this.type; i++) {
            let p = new Chord('C', 'C major');
            this.array.push(p);
        }
    }

    get allChords(){
        return this.array;
    }
}

var newBar = new bar(4);

newBar.createBar()

var chords_in_a_bar = newBar.allChords;

(chords_in_a_bar.forEach(i => console.log(i.chord.notes().toString())))