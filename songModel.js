const teoria = require("teoria");
import 'regenerator-runtime/runtime';
import {beatsTimeStamp} from "./beatsTimeStamp";

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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}else {
    firebase.app(); // if already initialized, use that one
}
var db = firebase.firestore()

function meterToIntArray(string){
    var array = string.split('/');

    return array.map(i => parseInt(i));
}

const meters_options = [
    {
        group: 'Group A',
        signatures_set: ['4/4', '17/16', '5/4', '9/8'],
        durationRatio: {
            0: [1,1,1,1],
            1: [1,1,1,5/4],
            2: [1,1,1,2],
            3: [1,1,1,3/2]},
        slot: 4,
    },
    {
        group: 'Group B',
        signatures_set: ['3/4', '7/8'],
        durationRatio: [
            [1,1,1],
            [1,1,3/2]],
        slot: 3,
    },
    {
        group: 'Group C',
        signatures_set: ['5/4'],
        durationRatio: [[1,1,1,1,1]],
        slot: 5,
    },
    {
        group: 'Group D',
        signatures_set: ['7/4'],
        durationRatio: [[1,1,1,1,1,1,1]],
        slot: 7,
    },
]


class Chord {

    constructor(chord, tonality) {
        this.tonality = tonality;
        this.chord = chord;
    }

    get chord() {
        return this._chord;
    }

    // value can be either a string or a chord obj
    set chord(value) {
        if(!(value instanceof teoria.Chord)){
            var root = this.tonality.tonic.name().toUpperCase() + this.tonality.tonic.accidental();
            this._chord = !(value == null) ? teoria.chord(value, 3) : teoria.chord(root + this.tonality.name.substring(0,3), 3);
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

/**
 * Model class of the project. It holds multiple song attributes and has methods to transform this model into a lightweight model for the View
 */
class Song{
    constructor(title, meter, bpm, tonality, meterIndex) {
        // this.meter = meterToIntArray(meter || meters_options[0].signatures_set[0]);
        this.meter = (meter || meters_options[0].signatures_set[0]);
        this.meterType = meters_options[meterIndex] || meters_options[0];
        this.bpm = bpm || 120;
        this.glob_tonality = tonality || 'C major';
        this._chart = [];
        this.addBar()
        this._title = title;
    }

    addBar(){
        for ( let i = 0; i < this.meterType.slot; i++){
            var c = new Chord(null, this.glob_tonality.tonic.name() + this.glob_tonality.tonic.accidental() + ' ' + this.glob_tonality.name);
            this._chart.push(c);
        }
    }

    removeBar(){
        for ( let i = 0; i < this.meterType.slot; i++){
            this._chart.pop();
        }
    }

    get Chart(){
        return this._chart;
    }

    set glob_tonality(value){
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

    get meterType(){
        return this._meterType;
    }

    set meterType(value){
        this._meterType = value;
    }

    get glob_tonality(){
        return this._tonality;
        return this._tonality;
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

    modifyChord(chord, index){
        this._chart[index].chord = chord;
    }

    /**
     * Automatically transpose the song in a new tonality
     * @param newTonality: the target new tonality
     */
    transposeSong(newTonality){
        let interval = this.glob_tonality.tonic.interval(teoria.note(newTonality));

        for ( let i = 0; i < this.Chart.length; i++){
            let chord = this.Chart[i].chord.transpose(interval);
            this.Chart[i].chord = chord;
        }
        this.glob_tonality = newTonality + ' major';
    }

    /**
     * Update a light version of the song attributes
     * @param songInfo: the object to update
     */
    exportSongInfo(songInfo) {
        // updating songInfo properties
        songInfo.title = this.title
        songInfo.meterType = this.meterType
        // songInfo.meter = this.meter[0] + '/' + this.meter[1]
        songInfo.meter = (typeof this.meter === "string") ? this.meter : this.meter[0] + '/' + this.meter[1]
        songInfo.bpm = this.bpm
        songInfo.glob_tonality = this.glob_tonality.tonic.name().toUpperCase() + this.glob_tonality.tonic.accidental() + ' ' + this.glob_tonality.name
    }

    /**
     * Update a light version of the chart
     * @param chartObject: the object to update
     */
    exportSongChart(chartObject){
        // updating chartObject properties
        chartObject.chartModel = this.Chart.map( (i, index) => {
            if ( index > 0 && i.chord.name === this.Chart[index - 1].chord.name ){
                return '%'
            }
            else {
               return i.chord.name
            }
        } )
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

    /**
     * Saves current song to firebase
     * @param collectionName: location folder in which the file must be saved
     */
    async saveToFirebase(collectionName) {

        collectionName = (collectionName === ("presets") | collectionName === ("songs")) ? collectionName : "presets"
        console.log('saving song to firebase "', this.title, '" in ',collectionName);
        db.collection(collectionName).doc(this.title).set(
            JSON.parse(JSON.stringify(this))
        );
    }

    /**
     * Load a song from Firebase
     * @param songTitle: name of the song
     * @param collectionName: collection in which the title must be searched
     * @return {*}: a Song instance
     */
    static loadFromFirebase(songTitle, collectionName) {

        // put collection to song if not specified
        collectionName = (collectionName === ("presets") | collectionName === ("songs")) ? collectionName : "songs"
        return db.collection(collectionName).doc(songTitle).get().then(function(doc){
            console.log('loading from firebase')
            return Song.parseSong(doc.data())
        });
    }


    /**
     *
     * @param parsedSong: Object
     * @return {Song}: a song instance
     */
    static parseSong(parsedSong){

        var instance = new Song("song"); //just to have all methods
        Object.assign(instance, parsedSong); //instance is now a Song class obj with methods, but not submethods

        instance.meterType = meters_options.filter(value => value.group === (instance.meterType.group))[0]

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

    /**
     *  @param collectionName: songs or presets
     */
    static getSongList(collectionName){

        collectionName = (collectionName === ("presets") | collectionName === ("songs")) ? collectionName : "songs"
        return db.collection(collectionName).get()
            // .then(docList => {
            //     docList.forEach(
            //         doc => console.log(doc.id, " => ", doc.data()))
            //         // doc => doc.id)
            // })
    }

    getMetronome(){

    }

}

/**
 * Export a noteSequence of the chord
 * @param midiChord: the notes of the chord
 * @param start: the initial timeStamp of the chord
 * @param end: the final timeStamp of the chord
 * @return {{notes: [], totalTime: *}}: a noteSequence object
 */
function chordToNoteSequence(midiChord, start, end){

    var chordNoteSequence = {
        notes: [],
        totalTime: end,
    }
    midiChord.forEach(i => chordNoteSequence.notes.push(
        {
            pitch: i, startTime: start, endTime: end
        }
    ))
    return chordNoteSequence
}

/**
 * Export a noteSequece version of the chart
 * @param songInfo: the parameters of the song
 * @param chart: the chart of the song
 * @return {{notes: [], totalTime: number}}: the final noteSequence generated
 */
function chartToNoteSequence(songInfo, chart){
    var chartNoteSequence = {
        notes: [],
        totalTime: 0
    }

    // var quarterNoteDuration = 1 / ( songInfo.bpm / 60 )
    var chordTimeStamp = beatsTimeStamp(songInfo, chart)
    console.log(chordTimeStamp)

    var repeat = 0;

    for (let i = 0; i < chart.MIDInote.length; i++ ){
        var curr = chart.MIDInote[i];
        var next = chart.MIDInote[i+1];

        if ( JSON.stringify(curr)!== JSON.stringify(next)){
            let index = i;
            chordToNoteSequence(curr,chordTimeStamp[index-repeat],chordTimeStamp[index+1]).notes.forEach(i => {
                chartNoteSequence.notes.push(i)
            })
            // chartNoteSequence.totalTime = chordTimeStamp[index+1];
            repeat = 0;
        }
        else {
            repeat++;
        }
    }

    // noteSquence with repeated chords
    // chart.MIDInote.forEach((i,index) => {
    //         chordToNoteSequence(i,chordTimeStamp[index],chordTimeStamp[index+1]).notes.forEach(i => {
    //             chartNoteSequence.notes.push(i)
    //         })
    //         chartNoteSequence.totalTime = chordTimeStamp[index+1];
    //     }
    // )

    chartNoteSequence.totalTime = chordTimeStamp[chordTimeStamp.length-1];

    return chartNoteSequence;
}

function getMetronome(songInfo, chart) {
    var metronomeNoteSequence = {
        notes: [],
        totalTime: 0
    }

    // var quarterNoteDuration = 1 / ( songInfo.bpm / 60 )
    var noteTimeStamp = beatsTimeStamp(songInfo, chart)


    for (let i = 0; i < chart.MIDInote.length; i++ ){
        if( i % songInfo.meterType.slot === 0){
            metronomeNoteSequence.notes.push({pitch: 80, startTime: noteTimeStamp[i], endTime: noteTimeStamp[i+1], isDrum: true})
        }
        else{
            metronomeNoteSequence.notes.push({pitch: 81, startTime: noteTimeStamp[i], endTime: noteTimeStamp[i+1], isDrum: true})
        }
    }



    metronomeNoteSequence.totalTime = noteTimeStamp[noteTimeStamp.length-1];

    return metronomeNoteSequence;
}

export { db, Song, chordToNoteSequence, chartToNoteSequence, getMetronome , meters_options }
