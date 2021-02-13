import teoria from "teoria";

function checkRange(chord){
    if (chord.notes()[0].octave() > 3 ){
       chord.transpose(teoria.interval('P-8'))
    }
    else if (chord.notes()[0].octave() < 3 ){
        chord.transpose(teoria.interval('P8'))

    }

    return chord
}

function costFunction(previous, current){
    // already did checkRange on both
    let cost = 0;
    let interval;
    let spread;
    let minDist = 0;
    let dist = 0;


    for ( let i = 0; i < current.notes().length; i++ ){
        for ( let j = 0; j < previous.notes().length; j++ ) {
            interval = (teoria.interval(previous.notes()[j], current.notes()[i])).semitones();
            if ( i < 1 && j < 1 ){
                interval = -interval*2;
            }
            cost = cost + interval;

            if ( i < j ){
                if ( current.notes()[i] !== undefined && current.notes()[j] !== undefined) {
                    dist = teoria.interval(current.notes()[i], current.notes()[j]).semitones();

                    if (dist < minDist) {
                        minDist = dist;
                    }
                }
            }
        }
    }

    let range = (teoria.interval(current.notes()[0], current.notes()[current.notes().length-1])).semitones();

    //spreading coeff -> low spread means high penalty because of dissonance
    spread =  100 / (range * dist) ;

    if ( cost < 0 ){
        cost = cost*(-10);
    }

    return cost + spread
}

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

function noteOverChord(note, chordStart, chordEnd){
    return (note.endTime >= chordStart && note.endTime < chordEnd)
        || ( note.startTime >= chordStart && note.startTime < chordEnd )
        || ( note.startTime < chordStart && note.endTime > chordEnd )
}

function isCoreNote(value){
    let type = value[0];
    let degree = parseInt(value.substring(1)) % 7;
    return degree === 3 || degree === 7 || degree === 1 || (degree === 5 && type !== 'A');
}

function longSustainedNotes(melody, quarterNote){
    return (melody.filter( i => i.duration >= quarterNote && !isCoreNote(i.value) )).map( i => i.value);
}

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

    cost.push(costFunction(prev, curr)+150); //four-way close

    for ( let i = 2; i < 5; i++ ){
        cost.push(costFunction(prev, drop(teoria.chord(curr.name), i))) //drop2, drop3 e drop24
    }


    minCost = Math.min(...cost);
    idx = cost.indexOf(minCost) + 1;

    console.log('Chord: ', curr.name + ' ' + idx)

    if ( idx > 1  ){
        newVoicing = drop(teoria.chord(curr.name), idx).voicing();
    }
    if ( curr === prev ){
        newVoicing = drop(teoria.chord(curr.name), 4).voicing();
    }

    return newVoicing.map(i=>i.toString());
}

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
