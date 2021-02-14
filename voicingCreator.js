import teoria from "teoria";

/**
 * checkRange transpose a chord in order to fit the best range of the keyboard
 * @return: a chord
 */
function checkRange(chord){
    if (chord.notes()[0].octave() > 3 ){
       chord.transpose(teoria.interval('P-8'))
    }
    else if (chord.notes()[0].octave() < 3 ){
        chord.transpose(teoria.interval('P8'))

    }
    return chord
}

/**
 * costFunction evaluates the cost of moving from a given chord and a candidate following one
 * @param previous: the given chord previous chord of the progression (already voiced)
 * @param current: the candidate new chord
 * @return {number}: the cost
 */
function costFunction(previous, current){
    // already did checkRange on both so I assume they are in the same range
    let cost = 0;
    let interval;
    let spread;
    let minDist = 0;
    let dist = 0;


    for ( let i = 0; i < current.notes().length; i++ ){
        for ( let j = 0; j < previous.notes().length; j++ ) {
            // a measure of changing between successive chords
            interval = (teoria.interval(previous.notes()[j], current.notes()[i])).semitones();
            if ( i < 1 && j < 1 ){
                interval = - Math.abs(interval)*2;
            }
            cost = cost + interval;

            if ( i < j ){
                // penalize chords that have closer voices
                if ( current.notes()[i] !== undefined && current.notes()[j] !== undefined) {
                    dist = teoria.interval(current.notes()[i], current.notes()[j]).semitones();

                    if (dist < minDist) {
                        minDist = dist;
                    }
                }
            }
        }
    }


    // range measures the distance between the lowest and the highest note of the voicing
    let range = (teoria.interval(current.notes()[0], current.notes()[current.notes().length-1])).semitones();

    //spreading coeff -> low spread means high penalty because of dissonance
    spread =  100 / (range * dist) ;

    // additional penalization in order to avoid the movement from a well spread chord and a four-way close
    if ( cost < 0 ){
        cost = cost*(-10);
    }

    return cost + spread
}

/**
 * drop executes the calculation of a voicing type of a chord
 * @param chord: the chord to which calculate the new voicing
 * @param type: the type of voicing to execute
 * @return {*}: the new voiced version of the chord
 */
function drop(chord, type){
    let intervals;  //the voicings of the chord
    let newVoicing = [];
    let toDrop;

    // first try to do it as everything was a drop 2
    intervals = chord.voicing().map( i => i.toString());

    if ( type === 4 ){
        toDrop = intervals[0];
        newVoicing.push(toDrop);
        intervals.splice(0, 1);
        type = 2;
    }

    toDrop = intervals[intervals.length - type];
    newVoicing.push(toDrop);
    intervals.splice(intervals.length-type, 1);

    // add all one octave above
    for ( let i = 0; i < intervals.length; i++ ){
        var name = intervals[i][0];
        var degree = parseInt((intervals[i]).substring(1)) + 7;
        newVoicing.push(name+degree);
    }

    chord.voicing(newVoicing)

    return checkRange(chord);
}

/**
 * noteOverChord evaluates if the given note is played over the chord
 * @param note: the note, given as an object of pitch, startTime and endTime
 * @param chordStart: initial timeStamp of the chord to evaluate
 * @param chordEnd: final timestamp of the chord to evaluate
 * @return {boolean}: true if the note is played over the chord
 */
function noteOverChord(note, chordStart, chordEnd){
    return (note.endTime >= chordStart && note.endTime < chordEnd)
        || ( note.startTime >= chordStart && note.startTime < chordEnd )
        || ( note.startTime < chordStart && note.endTime > chordEnd )
}

/**
 * isCoreNote checks if the given note cannot be removed from the chord
 * @param value: an interval corresponding to a note of the melody
 * @return {boolean}: true if the note is respectively the 1, 3, 7, or 5 of the chord.
 */
function isCoreNote(value){
    let type = value[0];
    let degree = parseInt(value.substring(1)) % 7;
    return degree === 3 || degree === 7 || degree === 1 || (degree === 5 && type !== 'A');
}

/**
 * longSustainedNotes evaluates if the a note from the melody is sustained for more than a quarter note
 * @param melody: an array of notes (given as interval and duration) of the melody
 * @param quarterNote: the quarter note duration in time in the song
 * @return {*}: an array of non-core notes that are played over the chord
 */
function longSustainedNotes(melody, quarterNote){
    return (melody.filter( i => i.duration >= quarterNote && !isCoreNote(i.value) )).map( i => i.value);
}

/**
 * createVoicing generates the voicing for a given chord
 * @param curr: the chord over which executing the calculation
 * @param prev: the previous chord of the progression (already voiced)
 * @param melody: the melody played over the chord
 * @param quarterNote: the quarter note duration in time
 * @return {*}: a new voicing for the chord
 */
function createVoicing(curr, prev, melody, quarterNote){
    // get the voicing
    let currVoicing = curr.voicing().map( i => i.toString());
    let newVoicing = teoria.chord(curr.name).voicing();
    let cost, minCost, idx;

    // remove notes / add notes according to the melody
    if ( currVoicing.length > 4 ){
        let idx = currVoicing.indexOf('P5')

        currVoicing.splice(idx, 1);

        if( currVoicing.length > 4 ){
            let noteToRemove = longSustainedNotes(melody, quarterNote);
            noteToRemove = noteToRemove.filter( (item, pos, noteToRemove) => { return noteToRemove.indexOf(item) === pos;} )
            console.log(noteToRemove)

            for ( let i = 0; i < noteToRemove.length; i++ ){
                let idx = currVoicing.indexOf(noteToRemove[i])

                if ( idx !== -1 ){
                    currVoicing.splice(idx, 1);
                }
            }
        }
    }

    // compute the costs for each voicing
    cost = [];

    cost.push(costFunction(prev, curr)+150); //four-way close (highly penalized)

    for ( let i = 2; i < 5; i++ ){
        cost.push(costFunction(prev, drop(teoria.chord(curr.name), i))) //drop2, drop3 e drop24
    }

    minCost = Math.min(...cost);
    idx = cost.indexOf(minCost) + 1;

    console.log('Chord: ', curr.name + ' ' + idx) //prints the selected voicing for a chord

    if ( idx > 1  ){
        newVoicing = drop(teoria.chord(curr.name), idx).voicing();
    }
    if ( curr === prev ){
        newVoicing = drop(teoria.chord(curr.name), 4).voicing();
    }

    return newVoicing.map(i=>i.toString());
}

/**
 * createProgression generates the voicing progression of a song, according to the melody (if given)
 * @param song: the song to modify
 * @param melodyNoteSequence: the melody played over the song (not necessary)
 */
function createProgression( song, melodyNoteSequence ){
    let currChord, prevChord;
    prevChord = song.Chart[0].chord;
    let repeat = 0;
    let quarterNote =  1 / ( song.bpm / 60 );
    let chordStart, chordEnd;
    let root, intervals;
    let newVoicing;


    for ( let i = 0; i < song.Chart.length; i++ ){
        currChord = song.Chart[i].chord;

        // reset to default voicing
        currChord.voicing((teoria.chord(currChord.name).voicing()).map(i=> i.toString()));

        // take the melody over the same chord
        if ( (i !== song.Chart.length-1) && (currChord.name !== song.Chart[i+1].chord.name) ){
            if ( i !== 0 && (i-repeat) !== 0 ){
                prevChord = song.Chart[i-repeat-1].chord;
            }

            chordStart = (i-repeat)*quarterNote;
            chordEnd = (i+1)*quarterNote;

            // take the intervals of the notes played over the chord with respect to the root
            root = currChord.root;

            intervals = (melodyNoteSequence.notes.filter((i)=> noteOverChord(i, chordStart, chordEnd))).map( i => {
                return {
                value: (teoria.interval(root, teoria.note.fromMIDI(i.pitch))).toString(),
                duration: (parseFloat(i.startTime) + parseFloat(i.endTime)).toFixed(3),
                }}
            );

            newVoicing = createVoicing(currChord, prevChord, intervals, quarterNote);
            console.log(newVoicing)

            // apply the voicing to all chord from the last repetition
            for ( let j = repeat; j >= 0; j-- ){
                song.Chart[i-j].chord.voicing(newVoicing);
                song.Chart[i-j].chord = checkRange(song.Chart[i-j].chord)
            }

            repeat = 0;
        }
        else {
            if ( i === song.Chart.length-1 ){
                for ( let j = repeat; j >= 0; j-- ){

                    song.Chart[i-j].chord = checkRange(drop(song.Chart[i-j].chord,4));
                }
            }
            repeat++;
        }

    }

}

export{createProgression, createVoicing}
