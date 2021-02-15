import React from 'react';
import ReactDOM from 'react-dom';
const teoria = require("teoria");
const { useState, useEffect } = React
import {
    db,
    Song,
    chordToNoteSequence,
    chartToNoteSequence,
    meters_options as possibleMeters,
    getMetronome
} from "./songModel";
import Modal from "react-modal";
import {midiRecorder} from "./midiRecorder";
import {createProgression} from "./voicingCreator";
import {beatsTimeStamp} from "./beatsTimeStamp";

/* ---------- Import device images ---------- */
var mAudio = require('./M-AudioKS.png')
var artMini = require('./ArturiaMinilab.jpg')
var pearlMallet = require('./PearlMalletstation.png')
var defIm = require('./defIm.jpeg')

var meters_options = possibleMeters ;
const devices = [
    {
        manufacturer: 'default',
        name: 'default',
        image: defIm,
    },
    {
        manufacturer: 'M-Audio',
        name: 'M-Audio Keystation MK3',
        image: mAudio,
    },
    {
        manufacturer: 'Arturia',
        name: 'Arturia Minilab MKII',
        image: artMini,
    },
    {
        manufacturer: 'Pearl',
        name: 'Pearl Malletstation',
        image: pearlMallet,
    }
];

/* ---------- Model/View Key Options ---------- */
const key_options = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#','Bb', 'B'
];

// /* ----- Model/View of Control Buttons ----- */
const bank = [{
    id: 'new',
    icon: 'add',
    name: 'New'
}, {
    id: 'play',
    icon: 'play_arrow',
    name: 'Play'
}, {
    id: 'stop',
    icon: 'stop',
    name: 'Stop'
}, {
    id: 'record',
    icon: 'fiber_manual_record',
    name: 'Record'
},{
    id: 'generate',
    icon: 'piano',
    name: 'Generate'
},  {
    id: 'save',
    icon: 'save',
    name: 'Save'
}, {
    id: 'open',
    icon: 'folder',
    name: 'Open'
}, {
        id: 'metronome',
        on: 'music_note',
        off: 'music_off',
        name: 'Metronome'
}];

const chord_type = ['ma', 'm', '7', 'm7', 'maj7', 'dim', 'sus2', 'sus4', 'aug', '%', 'custom']

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        backgroundColor       : 'antique-white',
    }
};

const newModalStyle = {
    content : {
        position   : 'relative',
        margin     : 'auto',
        width      : '50%',
        height     : 'auto',
        top        : '10%',
        border     : '1px solid #888',
        background : '#fefefe',
    }
};

var song = new Song('Prova');


//default initialization
song.Chart[0].chord='C6/9'
song.Chart[1].chord='Am7'
song.Chart[2].chord='Dm7'
song.Chart[3].chord='G7'

let songInfo = {};
let chart = {};
var songList = []
// update those obj
song.exportSongInfo(songInfo)
song.exportSongChart(chart)
var player = document.getElementById('midi-player1');
player.noteSequence = chartToNoteSequence(songInfo, chart);

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// MIDI RECORDING ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

midiRecorder.init()

/**
 * ChordEditor is the Modal for modifying the single selected chord in the chart
 */
function ChordEditor(props){
    const [isOpen, setIsOpen] = useState(false)
    const [selRoot, setSelRoot] = useState(() => props.chord.name)
    const [selType, setSelType] = useState(() => chord_type[0])
    const [customSel, setCustomSel] = useState( () => "")

    const closeModal = () => {
        updateSong()
        setIsOpen(false)
    }

    const updateSong = () => {
        var chord
        if ( selType === 'custom'){
            chord = customSel
        }
        else {
            if ( selType === '%'){
                chord = selType
            }
            else{
                chord = selRoot+selType
            }
        }

        props.closeEditor(false, 0, chord.slice())
    }

    const initializeModal = () => {
        let toCut = props.chord;
        let chord = toCut;
        let type;

        if ( chord[1] === 'b' || chord[1] === '#' ){
            chord = chord[0] + chord[1];
            type = toCut.slice(2);
        }
        else {
            chord = chord[0];
            type = toCut.slice(1)
        }

        setSelRoot(chord)
        if ( chord_type.includes(type) ){
            setSelType(type)
        }
        else {
            if ( chord === '%' ){
                setSelType('%')
            }
            else {
                setSelType('custom')
                setCustomSel(chord+type)
            }
        }
    }

    const handleClick = (content, isChordRoot) => {
        const takeInput = document.getElementById("custom-chord");
        takeInput.style.display = "none";
        if ( isChordRoot ){
            setSelRoot(content)
        }
        else {
            setSelType(content)
            if ( content === 'custom' ) {

                    takeInput.style.display = "block";
                    takeInput.addEventListener("keyup", function (event) {
                        let newChord ;
                        if (event.key === "Enter") {
                               const newInput = document.getElementById("custom-chord-input").value;
                                if (!key_options.forEach(i => newInput.includes(i))) {
                                    newChord = selRoot + newInput
                                } else {
                                    newChord = newInput
                                }

                                try {
                                    teoria.chord(newChord)
                                    setCustomSel(newChord)

                                } catch (TypeError) {
                                    document.getElementById("custom-chord-input").value = 'invalid chord';
                                    console.log('catch')
                                }

                            }

                    });


            }

        }
    }

    const printRootOptions = (content, index) => {
        return (
            <div key={'root'+index} className={selRoot === content ? "meter-btn selected" : "meter-btn"} onClick={() =>handleClick(content, true)}>{content}</div>
        )
    }

    const printTypeOptions = (content, index) => {
        return (
            <div key={'type'+index} className={selType === content ? "meter-btn selected" : "meter-btn"} onClick={() => handleClick(content, false)}>{content}</div>
        )
    }

    useEffect(
        () =>{
            if ( props.isOpen ) {
                setIsOpen( true )
            }
        }, [props.isOpen]
    )

    useEffect(
        () => {
            if ( customSel !== props.chord){
                closeModal()
            }
        }, [customSel]
    )

    return(
        <>
            <Modal key={'editing-modal'} isOpen={isOpen} style={customStyles} ariaHideApp={false} onAfterOpen={initializeModal} onRequestClose={closeModal} >
                <button key={'editing-modal button'}onClick={closeModal}>x</button>
                <p key={'note-name'}>Note</p>
                <div key={'meter-options'} className={"mtr-cntr"}>
                    {key_options.map((i, index) => printRootOptions(i, index))}
                </div>
                <p key={'chord-type'}>Chord Type</p>
                <div key={'chord-types'} className={"mtr-cntr"}>
                    {chord_type.map((i, index) => printTypeOptions(i, index))}
                </div>
                <div key={'enter-custom-chord'} id="custom-chord" style={{display: 'none'}}>
                    <label htmlFor="">Enter custom chord</label> <input id="custom-chord-input" type="text" /><br/>
                </div>
            </Modal>
        </>
    )
}

/**
 * ChordBlock is a single chord entity in the chart
 */
function ChordBlock(props){

    const editChord = () => {
        props.openEditor(true, props.index);
    }

    const className = (index, slot, isPlaying) => {
        var name = (props.index % (props.slot * 4) % props.slot === 0) ? "chord-block end-bar" : "chord-block";

        if (index === isPlaying){
            name = name.concat(" chord-selected")
        }
        return name;
    }

    const show = () => {
        props.showChord(props.index)
        playChord()
    }

    const playChord = () => {
        player.noteSequence = chordToNoteSequence(chart.MIDInote[props.index], 0, 3)
        player.stop()
        // Tone.Transport.clear()
        Tone.Transport.stop()
        player.start()
        setTimeout(function () {
            player.noteSequence = chartToNoteSequence(songInfo, chart);
            midiRecorder.getNoteSequence().notes.forEach(i => player.noteSequence.notes.push(i))
        }, 3000);
    }

    return (
        <div key={'chord-num'+props.index} className={className(props.index, props.slot, props.isPlaying)} onClick={show} >
            <i key={'icon' + props.index} className="far fa-edit icon-edit" onClick={editChord}/>
            <div key={'name'+props.index} className={"chord"}>{props.name}</div>
            {props.name !== '%' && (
                <div key={'degree'+props.index} className={"degree"}>{props.degree}</div>
            )}
        </div>
    )
}

/**
 * ChordChart manages the representation of the chords present in the song chart.
 */
function ChordChart(props){
    const [chartModel, setChartModel] = useState( () => chart.chartModel )
    const [chartDegree, setChartDegree] = useState(() => chart.chartDegree)
    const [slotModel, setSlotModel] = useState( () => chart.slotModel )
    const [midiNoteState, setMidiNoteState] = useState( () => chart.MIDInote)
    const [openModal, setOpenModal] = useState( () => false)
    const [newChord, setNewChord] = useState( () => "")
    const [indexOfChordToModify, setIndexToModify] = useState( () => 0)
    const [indexOfChordToPlay, setIndexToPlay] = useState( () => chart.chartModel.length + 1)

    useEffect(
        () => {
            if(props.newSongLoading){
                updateStates()
                props.setNewSongLoading(false)
            }
        },[props.newSongLoading]
    )

    const updateStates = () => {
        props.setMetronome(false)
        setChartModel([...chart.chartModel])
        setChartDegree([...chart.chartDegree])
        setSlotModel(chart.slotModel)
        setMidiNoteState([...chart.MIDInote])
        setIndexToPlay(chart.chartModel.length+1)
        player.noteSequence = chartToNoteSequence(songInfo, chart);
    }

    const addBar = () => {
        song.addBar()
        song.exportSongChart(chart)
        updateStates()
    }

    const removeBar =  () => {
        song.removeBar()
        song.exportSongChart(chart)
        updateStates()
    }

    const printChord = (name, index, degree, midi) => {
        return (
        <ChordBlock key={'chord-block'+index} name={name} index={index} slot={slotModel} degree={degree} midi={midi} openEditor={openEditor} isPlaying={indexOfChordToPlay} showChord={setIndexToPlay}/>
        )
    }

    const printLine = (lineIndex, namesPerLine, degreesPerLine, midiPerLine) =>{
        return (
            <div key={'line'+lineIndex} id={"line" + lineIndex} className={"chart-line"}>
                {namesPerLine.map((i, index) => printChord(i, index + lineIndex*slotModel*4, degreesPerLine[index], midiPerLine[index]))}
            </div>
        )
    }

    const printChart = () => {
        let size = slotModel*4
        let lines = Math.ceil(chartModel.length/(size))
        const arr = Array.from({length: lines}, (_, index) => index + 1);

        let namesPerLine = [];
        let degreesPerLine = [];
        let midiPerLine = [];

        for (let i=0; i< chartModel.length; i+=size) {
            namesPerLine.push(chartModel.slice(i, i + size));
            degreesPerLine.push(chartDegree.slice(i, i + size));
            midiPerLine.push(midiNoteState.slice(i, i + size));
        }
        return arr.map( (i, index)=> printLine(index, namesPerLine[index], degreesPerLine[index], midiPerLine[index]))
    }


    useEffect(
        () =>{
            if ( newChord !== "" && newChord !== '%'){
                song.modifyChord(newChord, indexOfChordToModify)
                song.exportSongChart(chart)
                updateStates()

            }
        }, [openModal, newChord]
    )



    useEffect(
        () =>{
            if ( props.newVoicing ){
                createProgression(song, midiRecorder.getNoteSequence())
                song.exportSongChart(chart)
                updateStates()
                props.setNewVoicing(false)
            }
        }, [props.newVoicing]
    )


    const openEditor = (state, index, chord) => {
        if ( state ){
            let chord = chartModel[index]
            setIndexToModify(index)
            setNewChord(chord)
        }
        else {
            if ( chord === '%' ){
                // find the last valid chord
                let i
                for ( i = 1; chartModel[indexOfChordToModify-i] === '%'; i++){}

                setNewChord(chartModel[indexOfChordToModify-i])
            }
            else {
                setNewChord(chord)
            }
        }

        setOpenModal(state)
    }

    return (
        <div key={'chords'} id="chords">
            <div key={'chart-editor'} className={"chart-editor"}>
                <button id="modify_chart" onClick={addBar}>
                    <i className="material-icons" >add</i>
                </button>
                <button id="modify_chart" onClick={removeBar}>
                    <i className="material-icons" >remove</i>
                </button>
            </div>
            <ChordEditor key={'chord-editor'} isOpen={openModal} closeEditor={openEditor} chord={newChord}/>
            <div key={'chart'} id="chart">
                {printChart(chartModel, chartDegree, midiNoteState, slotModel)}
            </div>
        </div>
    )
}

/**
 *  NewSongInfo is the Modal for the creation of a new song
 */
function NewSongInfo(props) {
    const [isNewOpen, setIsNewOpen] = useState(false)
    const [selKey, setSelKey] = useState(songInfo.glob_tonality)
    const [selMetGroup, setSelMetGroup] = useState(0)
    const [selMet, setSelMet] = useState(songInfo.meter)
    const [songName, setSongName] = useState({value: ""})
    const [songBpm, setSongBpm] = useState(songInfo.bpm)

    const handleKey = (e) => {
        const ko = key_options.find(k => k == e)
        setSelKey(ko + ' major')

    }

    const handleMeter = (r, e) => {
        const ts = meters_options[r].signatures_set.find(v => v == e)
        setSelMet(ts)
        setSelMetGroup(r)
    }

    const showSongName = ({ target: { value } }) => {
        setSongName(value)
    }

    const showBPM = ({ target: { value } }) => {
        setSongBpm(value)
    }

    useEffect(
        () => {
            if(props.isNewOpen) {
                setIsNewOpen(true)
            }
        }, [props.isNewOpen]
    )

    const openNew = () => {
        setSelMet(songInfo.meter)
        setSongBpm(songInfo.bpm)
        setSelKey(songInfo.glob_tonality)
        setSongName(songInfo.title)
    }

    const closeNew = () => {
        setIsNewOpen(false)
        props.setModalNew(false)
        song = new Song(songName, selMet, songBpm, selKey, selMetGroup)
        song.exportSongInfo(songInfo)
        song.exportSongChart(chart)
        props.setNewSongLoading(true)
    }

    return(
        <>
            <Modal key={'modal-new-song'} isOpen={isNewOpen} style={newModalStyle} onAfterOpen={openNew} ariaHideApp={false} onRequestClose={closeNew}>
                <div key={'div-new-song'}>
                    <span key={'close-new-song'} className="close" onClick={closeNew}>&times;</span>
                    <div key={'modal-header'} className="modal-header">
                         <p>Add Song parameters</p>
                     </div>
                     <div key={'modal-body'} className="modal-body">
                         <div key={'new-title'} id="new-title">
                             <label>Song Title:
                                 <input key={'input-song-name'} type="text" name="song-name" className="new-song-name" defaultValue={songInfo.title} onChange={showSongName}/>
                             </label>
                         </div>
                         <div id="new-meter" className="new-params">
                             <p className="param-title">Meter</p>
                         </div>
                         <div>
                             {meters_options.map(
                                 (mtrs, ix) =>
                                     <div key={'new-song-mtr'+ix} className="mtr-cntr" key={mtrs.group} id={mtrs.group}>
                                         { mtrs.signatures_set.map((vals, index) =>
                                             <div key={'mtr-btn'+index} className={(selMetGroup === ix && selMet === vals) ? "meter-btn selected" : "meter-btn"} onClick={() => handleMeter(ix, vals)}>{vals}</div>
                                         )}
                                     </div>
                             )}
                         </div>
                         <div id="new-tempo" className="new-params">
                             <p className="param-title">Tempo</p>
                         </div>
                         <div className="sweet-slider">
                             <div className="sweet-slider">
                                 BPM: <input type="number" id="new-bpm" name="new-bpm" min="60" max="220" defaultValue={songInfo.bpm} onChange={showBPM}/>
                             </div>
                         </div>
                         <div id="new-key" className="new-params">
                             <p className="param-title">Key</p>
                         </div>
                         <div className="key-cntr">
                             {key_options.map((key, index) =>
                                 <div key={'key-cntr'+index} className={selKey.split(' ')[0] == key ? "meter-btn selected" : "meter-btn"} onClick={() => handleKey(key.split(' ')[0])}>{key.split(' ')[0]}</div>
                             )}
                         </div>
                     </div>
                 </div>
            </Modal>
        </>
    )
}

/**
 * LoadSongModal is the Modal for downloading an existing song from Firebase
 */
function LoadSongModal(props){
    const [modalSongList, setModalSongList] = useState(() => songList)
    const [isOpen, setIsOpen] = useState(() => false)


    const closeModal = () => {
        setIsOpen(false)
        props.setModalCaller(false)
    }

    function loadSong(index) {
        song = Song.parseSong(songList[index])
        song.exportSongInfo(songInfo)
        chart = {}
        song.exportSongChart(chart)
        console.log('i want to call the update function', songInfo, chart)
        props.setNewSongLoading(true)
        closeModal()
    }

    useEffect(
        () => {
            if (props.isOpen){
                setIsOpen(true)
                Promise.all([
                    Song.getSongList('presets'),
                    Song.getSongList('songs')
                ]).then(promiseArray => {
                        songList = []
                        // console.log(promiseArray)
                        promiseArray.forEach((docList, docListIndex) => {
                            songList.push(docListIndex)
                            docList.forEach(song => songList.push(song.data()/*._title*/))
                        });
                    }
                )
                // .then(() => console.log('finito di caricare', songList))
                // .then(() => setModalSongList([...songList]))
                .then(() => setModalSongList(songList.map(i => (i instanceof Object) ? i._title : i)) )
            }
        }, [props.isOpen]
    )

    // loadAllSongs()


        // .then(setModalSongList(songList))
        // .then(() => setVariable(songList))
    // .then(setVariable( songList.map(song => console.log(song._title))));

    function setVariable(list) {
        console.log(list)
        setTimeout(() => setModalSongList(list), 10000)
    }


    return (
        <Modal id="loadSongModal" isOpen={isOpen} onRequestClose={closeModal} /*className={'modal'}*/>
                <span className="close" onClick={closeModal}>&times;</span>
                <div className="modal-header">
                    <p>Load a new song</p>
                </div>
                <ul id="songList">
                    {
                        modalSongList.map((songTitle, index) => {
                            return(
                                <li id={'songListElement' + index}
                                    onClick={ /*!(songTitle === 0 | songTitle === 1) && ( () => alert('')) }*/
                                        (songTitle === 0 | songTitle === 1) ?
                                            undefined
                                        :(
                                            () => loadSong(index)
                                        )
                                    }
                                    className={
                                            (songTitle === 0 | songTitle === 1) ? "songCollection" : "songTitle"
                                    }
                                >
                                    {
                                        (songTitle === 0 | songTitle === 1) ? (
                                            songTitle === 0 ? "Presets" : "Songs"
                                        ):(
                                            songTitle
                                        )
                                    }
                                </li>
                            )
                        })
                    }
                </ul>
        </Modal>
    )
}

/**
 * Buttons manages the representation and the actions of the buttons
 */
function Buttons(props) {
    const [isRecording, setRecording] = useState( () => false );


    const startRecording = () => {
        document.getElementById("record").style.color = "red";
        player.start();
        setRecording(true);
        midiRecorder.setRecording(true);
    }

    const stopRecording = () => {
        document.getElementById("record").style.color = "inherit";
        setRecording(false);
        midiRecorder.setRecording(false);
        midiRecorder.getNoteSequence().notes.forEach(i => player.noteSequence.notes.push(i))
    }



    function Actions(id) {
        if(id === "new") {
            props.openNew(true)
        } else if(id === "play") {
            try {
                player.start()
            }
            catch (Error) {
                console.log('Wait for the buffer to start!')
            }
        } else if(id === "generate") {
            props.generateVoicing(true);

        } else if(id === "stop") {
            player.stop()
        } else if(id === "record") {
            if(!isRecording){
                startRecording()
            }
            else stopRecording();
        } else if(id === "repeat") {
            null
        } else if(id === "save") {
            song.saveToFirebase()
        } else if(id === "open") {
            props.openModal(true)
            // OpenFile()
        }
        else if(id === "metronome") {
            if (props.metronome){
                props.setMetronome(false)
                player.noteSequence = chartToNoteSequence(songInfo, chart);
                midiRecorder.getNoteSequence().notes.forEach(i => player.noteSequence.notes.push(i))
            }
            else{
                props.setMetronome(true);
                getMetronome(songInfo, chart).notes.forEach(i=>player.noteSequence.notes.push(i));
            }
        }

    }

    return(
        <div id="btns">
            { props.btn.id === "open" ?
                <input type="file" id="a-file" accept=".mid" hidden="hidden" /> : null
            }
            <div key={props.btn.id} id={props.btn.id} className="button" onClick={() => Actions(props.btn.id)}>
                { props.btn.id === "open" ?
                    <i className="material-icons" id="folder-btn">{props.btn.icon}</i> :
                    (props.btn.id === "record" ? <i className="material-icons record" id="folder-btn">{props.btn.icon}</i> :
                    <i className="material-icons">{props.btn.id === 'metronome' ? ( props.metronome ? props.btn.on : props.btn.off ) :props.btn.icon}</i>
                    )
                }
                <div className="name">{props.btn.name}</div>
            </div>
        </div>
    )
}



//TODO: delete?
/* ---------- Open file function ---------- */
function OpenFile() {
    const real_btn = document.getElementById("a-file");
    const folder_btn = document.getElementById("folder-btn");

    folder_btn.EventListener("click", function() {
        real_btn.click();
    });

    real_btn.addEventListener("change", function() {
        const mid_val = real_btn.value;
    });
}


//TODO: delete?
/* ---------- Popup window ---------- */
function PopupWindow() {
    // Get the modal
    var modal = document.getElementById("myModal");
    // Get the button that opens the modal
    var add_btn = document.getElementById("new");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    // When the user clicks the button, open the modal
    add_btn.onclick = function () {
        modal.style.display = "block";
    }
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function DeviceConn() {
    const [imName, setImName] = useState(() => midiRecorder.getInputName().split(' ')[0])
    const [imSource, setImSource] = useState(() => devices[0].image)

    useEffect(
        () => {
            if(imName != midiRecorder.getInputName().split(' ')[0]) {
                devices.forEach(dev =>
                    {if(dev.manufacturer === midiRecorder.getInputName().split(' ')[0]) {
                        setImName([dev.name])
                        setImSource([dev.image.toString()])
                    }})
            }
        }, []
    )

    // useEffect(
    //     () => {
    //         devices.forEach(dev => {if(dev.manufacturer === imName) {setImSource([dev.image.toString()])} })
    //         console.log(imName)
    //     }, [imName]
    // )

    // const setImage = () => {
    //     var imDev = defIm
    //     for(let dev in devices){
    //         if(dev.manufacturer === imName){
    //             imDev = dev.image
    //         }
    //     }
    //     return(imDev)
    // }

    return(
        <div>
            <h3>{imName}</h3>
            <img src={imSource} width="300" height="200"/>
        </div>
    )
}

/**
 * SongComponent is the general React component for the app, it manages the general info of the song and act a Parent component for communicating children
 */
function SongComponent(){
    const [title, setTitle] = useState( () => songInfo.title)
    const [meterType, setMeterType] = useState( () => songInfo.meterType)
    const [meter, setMeter] = useState( () => songInfo.meter)
    const [bpm, setBpm] = useState(() => songInfo.bpm)
    const [glob_tonality, setGlob_tonality] = useState( () => songInfo.glob_tonality)
    const [modalCaller, setModalCaller] = useState( () => false)
    const [modalNew, setModalNew] = useState(() => false)
    const [newSongLoading, setNewSongLoading] = useState(() => false)
    const [newVoicing, setNewVoicing] = useState(() => false)
    const [metronome, setMetronome] = useState(() => false)

    useEffect(
        () =>{
            if(newSongLoading){
                setTitle(songInfo.title)
                setMeter(songInfo.meter)
                setMeterType(songInfo.meterType)
                setBpm(songInfo.bpm)
                setGlob_tonality(songInfo.glob_tonality.split(' ')[0])
            }
        }, [newSongLoading]
    )

    const showMeter = ({ target: { value } }) => {
        setMeter(value)
        song._meter = value
        song.exportSongInfo(songInfo)
    }

    const showBPM = ({ target: { value } }) => {
        setBpm(value)
        song._bpm = value
        song.exportSongInfo(songInfo)
    }

    const showKey = ({ target: { value } }) => {
        setGlob_tonality(value)
        setNewSongLoading(false)
        song.transposeSong(value)
        song.exportSongInfo(songInfo)
        song.exportSongChart(chart)
        setNewSongLoading(true)
    }

    return(
        <div key={'wrapper'} id = "wrapper">
            <h1 key={'title'}>THE REAL COMPER</h1>
            <div id="prova">
                <div id="music-info">
                    <h2 key={'song-title'}>{title}</h2>
                    <div key={'meters-option'} id="mtrs-opts">
                        <label key={'meter-title'}>Meter:</label>
                        <select key={'select-meter'} id="meters" name="meters" defaultValue={songInfo.meter} value={meter} onChange={showMeter}>
                            {meterType.signatures_set.map((mtrs, index) =>
                                <option key={'meter-options'+index} value={mtrs}>{mtrs}</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label key={'tempo-title'}>Tempo:</label>
                        <span key={'bpm-title'} id="music-note">
                        ♩= <input key={'bpm-song'} type="number" id="bpm" name="bpm" min="60" max="220" value={bpm} onChange={showBPM}/>
                    </span>
                    </div>
                    <div key={'key-opts'} id="key-opts">
                        <label key={'tonality-title'} id="key">Key:</label>
                        <select key={'change-tonality'} id="keys" name="key" value={glob_tonality} onChange={showKey}>
                            {key_options.map(
                                (key, index) =>
                                    <option key={'option-tonality'+index} value={key}>{key}</option>
                            )}
                        </select>
                    </div>
                </div>

                <div id="control-buttons">
                    {bank.map(
                        (btn, index) =>
                            <Buttons key={index} btn={btn} openModal={setModalCaller} openNew={setModalNew} generateVoicing={setNewVoicing} setMetronome={setMetronome} metronome={metronome}/>
                    )}
                </div>
                <DeviceConn/>
            </div>
            <NewSongInfo isNewOpen={modalNew} setModalNew={setModalNew} setTitle={setTitle} setGlob_tonality={setGlob_tonality} setBpm={setBpm} setMeter={setMeter} setMeterType={setMeterType} setNewSongLoading={setNewSongLoading}/>

            <LoadSongModal isOpen={modalCaller} setModalCaller={setModalCaller} setNewSongLoading={setNewSongLoading}/>

            <br/>
            <ChordChart newSongLoading={newSongLoading} setNewSongLoading={setNewSongLoading} newVoicing={newVoicing} setNewVoicing={setNewVoicing} setMetronome={setMetronome}/>
            <br/>



        </div>
    )
}

const root = document.getElementById("comper")

ReactDOM.render(<SongComponent />, root)