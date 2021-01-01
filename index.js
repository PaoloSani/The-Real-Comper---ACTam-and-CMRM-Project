//no comment
const teoria = require("teoria");

const serializable = require('tanagra-core').serializable

// questo era per una prova di fare serializble manualmente
// import * as knowledge from "./dist/teoria.2206f598";

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
               this.chord = 'Cmaj';
               // giusto per gaver qualcosa
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
            var c = new Chord(null, this.glob_tonality.tonic.name() + ' ' + this.glob_tonality.name);
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
        console.log(value instanceof teoria.Scale);
        if(!(value instanceof teoria.Scale)) this._tonality = teoria.scale(value.split(' ')[0], value.split(' ')[1]);
        if(value instanceof teoria.Scale) this._tonality = value;
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

// Mark class `Song` as serializable and containing sub-types teoria e compagnia
module.exports = serializable(Song, [Chord, teoria.Chord, teoria.Note, teoria.Interval, teoria.Scale])//, [
module.exports = serializable(Song)//, [
//     // previous versions of the class
//     [Bar, Baz, FooBar], // this version also references FooBar
//     [FooBarBaz]         // this version references a different type altogether, FooBarBaz
// ])


var newSong = new Song('The Girl from Ipanema');
// console.log(newSong)


function ChordExt(tonalita){
    this.tonalita = tonalita;
}

//tentativo estensione classe teoria.Chord
// teoria.chord(teoria.note('a')).notes().forEach( i => console.log(i.name()) )
// ChordExt.prototype = teoria.Chord.prototype;
// ChordExt.prototype = Object.create(teoria.Chord.prototype);
// ChordExt.prototype = Object.create(teoria.chord(teoria.note('Amaj')));
// ChordExt.prototype = Object.create(teoria.chord(teoria.note('A')));
// ciao = new ChordExt('c minore')
// console.log(ciao.root.name()) //A, come varibile di proto
// console.log(ciao.root = teoria.note('b')) //qua al posto di cambiare la cosa di proto, crea una nuova
// // infatti lo dice proprio qua
// // https://javascript.info/prototype-inheritance#writing-doesn-t-use-prototype
// console.log(dir(ciao)) //e qua infatti possiamo vedere questa cosa

//meglio metterlo dentro class Song ?
function saveSong(songIstance){
    console.log('saving song ', songIstance.title);
    console.log('saving song ', songIstance);
    localStorage.setItem(songIstance.title, JSON.stringify(songIstance));
    let str = JSON.stringify(songIstance, function replacer (key, value){
        console.log('value', value)
        // value.
    })

}

function loadSong(songTitle){ //song title is the string with the filename
    var parsedSong = JSON.parse(localStorage.getItem(songTitle));

    // console.log(parsedSong); // ovviamente non mi salva i metodi
    var instance = new Song(songTitle);
    Object.assign(instance, parsedSong);
    //now we have to manually "istanciate" every internal class,
    // in particular tonality, and all the bars in chords array

    console.log('instance of the class for the moment: ', instance )
    console.log('tonic', instance.glob_tonality.tonic )
    console.log('this', instance )
    // console.log(teoria.Note.prototype.name.call(instance.glob_tonality.tonic, instance.glob_tonality))

    function nameOfTonic(Note) {
        console.log(Note.coord[1])
        return knowledge.fifths[Note.coord[1] + knowledge.A4[1] ] //- accidentalValue(Note) * 7 + 1];
    }
    function accidentalValue(Note) {
        return Math.round((Note.coord[1] + knowledge.A4[1] - 2) / 7);
    }

    //CASIN
    // todo
    // fare una funzione (nel file principale questo qua js) in cui gli si passa una scala, ma cosí come viene
    // jsonata (parsata).
    // fare sub function ausiliarie per trasformare da parsed a tone.note con tutti i metodi del caso
    // usare questa per trsaformare da scala a istanza di scala. se serve poi di chord. bisognerá fare un for loop
    // buon anno
    console.log('catch this trick', nameOfTonic(instance.glob_tonality.tonic))

    // teoria.Note.prototype.name.call(

    console.log('am I stupid, or what?')
    let asdasd = teoria.scale('A', 'minor');
    console.log('dummy tonality shuold be complete', asdasd);

    let dummyTonalityIstancee = teoria.scale('A', 'minor');
    console.log('dummy tonality shuold be complete', dummyTonalityIstancee);

    console.log('instantlly generated scale', teoria.scale('A', 'minor'));
    Object.assign(dummyTonalityIstancee, instance.glob_tonality);
    console.log('dummy tonality', dummyTonalityIstancee);
    instance.glob_tonality = dummyTonalityIstancee;
    instance.glob_tonality = instance.glob_tonality.tonic.name() + ' ' + instance.glob_tonality.name
    console.log('pre returned song', instance);
    return instance;

    //to set new tonality we can create a scale with data parsed, or we could create a use Object.assign()
    // don't know if it works
    // let's find out
    // xe un problema: ci sono molte sottoclassi
    // si potrebbe modificare il costruttore
}


// saveSong(newSong);
// console.log('loaded song', loadSong('The Girl from Ipanema'));


// Seerialijse
// var str = serialijse.serialize(newSong);
// var so = serialijse.deserialize(str);
// console.log(so)

// tangara
// --------------------------------------------
// tanagra deserializer test
// const json = require('tanagra-json') // alternatively, `require('tanagra-protobuf')`
// const auto = require('tanagra-auto-mapper') // alternatively, `require('tanagra-protobuf')`
// json.init()                          // `await json.init()` if you're using `tanagra-protobuf`
// const encoded = json.encodeEntity(newSong)
// const decoded = json.decodeEntity(encoded, Song)
// // non funziona
// console.log('decoded', decoded)
// console.log('auto generated', auto.generateTypeMap(ChordExt))
//----------------------------------------------

// JavaScript-Serializer
//----------------------------------------------
// https://github.com/iconico/JavaScript-Serializer
// objSerializer = new JSSerializer();
// objSerializer.Serialize(newSong);
// var strJS = objSerializer.GetJSString('dematerilizedSong');
// eval(strJS)
// console.log(strJS)
//----------------------------------------------