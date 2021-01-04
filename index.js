//no comment
const teoria = require("teoria");
import 'regenerator-runtime/runtime'

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDtryKgIopVUA44Y1F28yBuaN2aFyrgXLg",
    authDomain: "comper-8f4b6.firebaseapp.com",
    projectId: "comper-8f4b6",
    storageBucket: "comper-8f4b6.appspot.com",
    messagingSenderId: "724927156",
    appId: "1:724927156:web:452ca1acf1ed382e3b8de1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore()

function meterToIntArray(string){
    var array = string.split('/');

    return array.map(i => parseInt(i));
}

const meters_options = [
    {
        group: 'Group A',
        signatures_set: ['4/4', '17/16', '5/4'],
        slot: 4,
    },
    {
        group: 'Group B',
        signatures_set: ['3/4', '7/8'],
        slot: 3,
    },
    {
        group: 'Group C',
        signatures_set: ['5/4'],
        slot: 5,
    },
    {
        group: 'Group D',
        signatures_set: ['7/4'],
        slot: 7,
    },
]

class Chord {

    constructor(chord, tonality) {
        this.chord = chord;
        this.tonality = tonality;
    }

    get chord() {
        return this._chord;
    }

    // value can be either a string or a chord obj
    set chord(value) {
        if(!(value instanceof teoria.Chord)){
            !(value == null) ? this._chord = teoria.chord(value) : this._chord = teoria.chord('Cmaj');
        }else{
            this._chord = value;
        }
    }

    get tonality() {
        return this._tonality;
    }

    set tonality(value) {
        if(!(value instanceof teoria.Scale)){
            this._tonality = teoria.scale(value.split(' ')[0], value.split(' ')[1]);
        }else{
            this._tonality = value;
        }
    }
}



class Song{
    constructor(title, meter, bpm, tonality) {
        this.meter = meterToIntArray(meter || meters_options[0].signatures_set[0]);
        this.meterType = meters_options[0];
        this.bpm = bpm || 120;
        this.glob_tonality = tonality || 'C major';
        this._chart = [];
        this.addBar()
        this._title = title;
    }

    addBar(){
        for ( let i = 0; i < this.meterType.slot; i++){
            var c = new Chord(null, this.glob_tonality.tonic.name() + ' ' + this.glob_tonality.name);
            this._chart.push(c);
        }
    }

    removeBar(){
        for ( let i = 0; i < this.meterType.slot; i++){
            this._chart.pop();
        }
    }

    exportSimplifiedSong(songInfo, chartObject){

        // updating songInfo properties
        songInfo.title = this.title
        songInfo.meterType = this.meterType
        songInfo.meter = this.meter[0] + '/' + this.meter[1]
        songInfo.bpm = this.bpm
        songInfo.glob_tonality = this.glob_tonality.tonic.name().toUpperCase() + ' ' + this.glob_tonality.name

        // updating chartObject properties
        chartObject.chartModel = this.Chart.map( i => i.chord.name)
        chartObject.chartDegree = this.Chart.map( i => {
                var deg = i.chord.root.scaleDegree(this.glob_tonality)
                if (deg == 0) {
                    var interval = i.chord.root.interval(this.glob_tonality.tonic)
                    deg = (interval.number()%7).toString() + interval.quality()
                    if (deg == '1d') deg = '1A' // to fix that dimished octave become an augmented 1
                }
                return deg.toString()
                    .replace('1', 'I')
                    .replace('2', 'II')
                    .replace('3', 'III')
                    .replace('4', 'IV')
                    .replace('5', 'V')
                    .replace('6', 'VI')
                    .replace('7', 'VII')
            })
        chartObject.slotModel = this.meterType.slot
        chartObject.MIDInote = this.Chart.map( i => {
            return i.chord.notes().map(i => i.midi())
        })

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



// @param a Song instance to be saved to a file
function saveSongTofile(songInstance){

    console.log('saving song ', songInstance.title);
    // localStorage.setItem(songInstance.title, JSON.stringify(songInstance));
    var blob = new Blob( [JSON.stringify(songInstance)], {
        type: 'application/octet-stream'
    });
    var url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.id = 'downloadTag';
    link.href = url;
    link.download = songInstance.title + '.json';
    link.click();
    window.URL.revokeObjectURL(url);

}

//@param String containing filename
//@return a Song obj
/*async*/ function loadSong(songTitle) {

    //note: even if Synchronous XMLHttpRequest is deprecated, it gives me only a warning and not an error
    console.log('loading song ', songTitle);
    var parsedSong;

    // make the http request to get the json file
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parsedSong = JSON.parse(xhttp.responseText);
        }
    };
    xhttp.open("GET", "presets/" + songTitle+ ".json", false);
    xhttp.send();
module.exports = meters_options
module.exports = Song

    // const request = async () => {
    //     const response = await fetch("presets/" + songTitle+ ".json");
    //     const json = await response.json();
    //     return json;
    // }
    // parsedSong = await request();

    // fetch('./presets/The Girl from Ipanema.json').then(result => result.json()).then(console.log);

    // var parsedSong = JSON.parse(localStorage.getItem(songTitle));
    // parsedSong = parseFromFirebase(songTitle)
    // console.log('parsedSong', parsedSong)
    var instance = new Song(songTitle); //just to have all methods and submethod
    Object.assign(instance, parsedSong); //instance is now a Song class obj with methods, but not submethods

    instance.glob_tonality = deserializeScale(parsedSong._tonality)

    instance._chart = instance.Chart.map(parsedChord => deserializeChordClass(parsedChord))

    function deserializeScale(parsedScale) {
        return teoria.Scale(deserializeNote(parsedScale.tonic), parsedScale.name);
    }

    function deserializeNote(parsedNote) {
        return teoria.Note(parsedNote.coord, parsedNote.duration);
    }

    function deserializeChordClass(parsedChord) {
        return new Chord(parsedChord._chord.name, deserializeScale(parsedChord._tonality));
    }

    console.log('loaded song: ', instance)
    return instance;
}


//button function handler
window.onload = function(){
    document.getElementById("save").addEventListener("click", () => saveSongTofile(newSong));

    const folder_btn = document.getElementById("folder-btn");
    folder_btn.addEventListener("click", function() {
        // getSongList();
        // real_btn.click();
        loadSong("The Girl from Ipanema")
    });
};


function getSongList(){
    console.log('getSongList called')
    fetch('./presets/Preset list.json') //per ora non esiste il file
        .then(result =>result.json())
        .then(console.log)
}


async function saveToFirebase(songInstance) {

    console.log('saving song to firebase');
    db.collection("songs").doc(songInstance.title).update(
        {
            songJson: JSON.stringify(songInstance)
        },
    );

}

// string of the song
function parseFromFirebase(songTitle) {

    return db.collection("songs").doc(songTitle).get().then(function(doc){
        console.log('parsed from firebase', JSON.parse(doc.data().songJson));
        return JSON.parse(doc.data().songJson)
    });

}



// ----------------------------------------------------------------------------
// example / testing program


// create a new song
var newSong = new Song('The Girl from Ipanema', '5/4', 130, 'C major');
console.log(newSong);

// create obj for react
let songInfo ={};
let chart = {};

// update those obj
newSong.exportSimplifiedSong(songInfo, chart)

// print (a copy!) of the obj just populated
console.log('songInfo', JSON.parse(JSON.stringify(songInfo)))
console.log('chart', JSON.parse(JSON.stringify(chart)))

console.log('.....\n\n\n\n....')
// load a new song from local
newSong = /*await*/ loadSong('The Girl from Ipanema awkward')


// setTimeout(newSong.exportSimplifiedSong(songInfo, chart),2000)
newSong.exportSimplifiedSong(songInfo, chart)
console.log('songInfo', songInfo)
console.log('chart', chart)

module.exports = meters_options
module.exports = Song