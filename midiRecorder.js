var midiRecorder = {
    isRecording: false,
    noteSequence: {
        notes: [],
        totalTime: 0
    },
    initialTimeStamp: null,
    timeStampArray: new Array(127).fill(0),
    soundFontPlayer: new core.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus'),

    init: function() {

        this.soundFontPlayer.loadAllSamples();

        const onMIDIMessage = (message) => {

            var command = message.data[0];
            var pitch = message.data[1];

            var svg = document.getElementsByClassName('waterfall-piano')[0]
            const rect = svg.querySelector(`rect[data-pitch="${pitch}"]`)

            if(command == 144){
                this.soundFontPlayer.playNoteDown({ pitch: pitch });
                rect.classList.add('active')
                rect.setAttribute('fill', `orange`);
            }
            if(command == 128){
                this.soundFontPlayer.playNoteUp({ pitch: message.data[1] });
                rect.classList.remove('active')
                rect.setAttribute('fill', rect.getAttribute('original-fill'));
            }
            
            if( this.isRecording ){
                var timeStamp = ((message.timeStamp - this.initialTimeStamp) / 1000).toFixed(5);

                if (command === 144 ){ //noteOn
                    this.timeStampArray[pitch] = timeStamp;
                }

                if ( command === 128 ){ //noteOff
                    this.noteSequence.notes.push(
                        {pitch: pitch, startTime: this.timeStampArray[pitch], endTime: timeStamp},)
                }

                this.noteSequence.totalTime = timeStamp;
            }

            // TODO: fai sentire la nota
        }

        function onMIDISuccess(midiAccess) {
            var inputs = midiAccess.inputs.values();
            for (var input of inputs) {
                input.onmidimessage = onMIDIMessage; //sets up the MIDI listener
            }
        }

        function onMIDIFailure(e) {
            console.log('No access to MIDI devices' + e);
        }

        if(navigator.requestMIDIAccess)
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        else
            alert("No MIDI support in your browser.");
    },

    setRecording(value){
        this.isRecording = value;

        if ( value ){
            this.noteSequence.notes = [];
            this.initialTimeStamp = performance.now();
        }
    },

    getNoteSequence(){
        return this.noteSequence;
    },


};

export {midiRecorder}