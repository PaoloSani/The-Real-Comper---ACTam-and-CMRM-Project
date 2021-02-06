import React from 'react';
import ReactDOM from 'react-dom';
const teoria = require("teoria");
const { useState, useEffect } = React
// const Song = require('./index.js')
import { db, Song, chordToNoteSequence, chartToNoteSequence } from "./index";
import Modal from "react-modal";
import {midiRecorder} from "./midiRecorder";

//todo
// riproduzione/visualizzazione singolo accordo su tastiera
// chordToNoteSequence(midiChord, start, end)
// da chiamare questa funzione dalla chart, per ogni accordo... tipo con doppioClick (?)
// chordToNoteSequence(chart[indexDellAccordo], 0, 5) //5 secondi
// player.start()
//
// nota:
// var player = document.getElementById('midi-player1');
// questa riga l'ho spostata fuori da react cosí tutti i componenti la vedono


const meters_options = [{
    group: 'Group A',
    values: ['4/4', '17/16', '5/4']
}, {group: 'Group B',
        values: ['3/4', '7/8'],
    }, {
    group: 'Group C',
    values: ['5/4']
}];

/* ---------- Model/View Key Options ---------- */
const key_options = [
    'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'
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
    id: 'pause',
    icon: 'pause',
    name: 'Pause'
}, {
    id: 'stop',
    icon: 'stop',
    name: 'Stop'
}, {
    id: 'record',
    icon: 'fiber_manual_record',
    name: 'Record'
}, {
    id: 'repeat',
    icon: 'repeat',
    name: 'Repeat'
}, {
    id: 'save',
    icon: 'save',
    name: 'Save'
}, {
    id: 'open',
    icon: 'folder',
    name: 'Open'
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


var song = new Song('Prova');


song.Chart[0].chord='C6/9'
song.Chart[1].chord='Am7'
song.Chart[2].chord='Dm7'
song.Chart[3].chord='G7'

let songInfo ={};
let chart = {};
var songList = []
// update those obj
song.exportSongInfo(songInfo)
song.exportSongChart(chart)
var player = document.getElementById('midi-player1');

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// MIDI RECORDING ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

midiRecorder.init()


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
        console.log('Reached modal')
        let chord = props.chord;
        let type = chord.slice(1)
        chord = chord[0];
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
                    if (event.key === "Enter") {
                        const newInput = document.getElementById("custom-chord-input").value;
                        setCustomSel(newInput)
                    }
                });
            }

        }
    }

    const printRootOptions = (content) => {
        return (
            <div className={selRoot === content ? "meter-btn selected" : "meter-btn"} onClick={() =>handleClick(content, true)}>{content}</div>
        )
    }

    const printTypeOptions = (content) => {
        return (
            <div className={selType === content ? "meter-btn selected" : "meter-btn"} onClick={() => handleClick(content, false)}>{content}</div>
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
            <Modal isOpen={isOpen} style={customStyles} ariaHideApp={false} onAfterOpen={initializeModal} onRequestClose={closeModal} >
                <button onClick={closeModal}>x</button>
                <p>Note</p>
                <div className={"mtr-cntr"}>
                    {key_options.map((i) => printRootOptions(i))}
                </div>
                <p>Chord Type</p>
                <div className={"mtr-cntr"}>
                    {chord_type.map((i) => printTypeOptions(i))}
                </div>
                <div id="custom-chord" style={{display: 'none'}}>
                    <label htmlFor="">Enter custom chord</label> <input id="custom-chord-input" type="text" /><br/>
                </div>
            </Modal>
        </>
    )
}

function ChordBlock(props){

    const editChord = () => {
        props.openEditor(true, props.index);
    }

    const className = (index, slot, isPlaying) => {
        var name = (props.index % (props.slot * 4) % props.slot === 0) ? "chord-block end-bar" : "chord-block";

        if (index === isPlaying){
            name = name.concat(" selected")
        }
        return name;
    }

    const show = () => {
        props.showChord(props.index)
    }

    return (
        <div className={ className(props.index, props.slot, props.isPlaying)} onClick={show} >
            <i className="fas fa-edit edit" onClick={editChord}></i>
            <div className={"chord"}>{props.name}</div>
            {props.name !== '%' && (
                <div className={"degree"}>{props.degree}</div>
            )}
        </div>
    )
}

function ChordChart(props){
    const [chartModel, setChartModel] = useState( () => chart.chartModel )
    const [chartDegree, setChartDegree] = useState(() => chart.chartDegree)
    const [slotModel, setSlotModel] = useState( () => chart.slotModel )
    const [midiNoteState, setMidiNoteState] = useState( () => chart.MIDInote)
    const [openModal, setOpenModal] = useState( () => false)
    const [newChord, setNewChord] = useState( () => "")
    const [indexOfChordToModify, setIndexToModify] = useState( () => 0)
    const [indexOfChordToPlay, setIndexToPlay] = useState( () => chart.chartModel.length + 1)

    const updateStates = () => {
        setChartModel([...chart.chartModel])
        setChartDegree([...chart.chartDegree])
        setSlotModel(chart.slotModel)
        setMidiNoteState([...chart.MIDInote])
        setIndexToPlay(chart.chartModel.length+1)
    }

    const addBar = () => {
        song.addBar()
        song.exportSongChart(chart)
        updateStates()
        console.log(chart)
    }

    const removeBar =  () => {
        song.removeBar()
        song.exportSongChart(chart)
        updateStates()
    }

    const printChord = (name, index, degree, midi) => {
        return (
        <ChordBlock name={name} index={index} slot={slotModel} degree={degree} midi={midi} openEditor={openEditor} isPlaying={indexOfChordToPlay} showChord={setIndexToPlay}/>
        )
    }

    const printLine = (lineIndex, namesPerLine, degreesPerLine, midiPerLine) =>{
        return (
            <div id={"line" + lineIndex} className={"chart-line"}>
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

    const startPlaying = () => {
        let i = 0;
        var t;

        var interval = setInterval(() => {
            if ( i === chartModel.length ){
                clearInterval(interval);
            }
            console.log(i);
            setIndexToPlay(i);
            i++;
        }, (1 / ( songInfo.bpm / 60 ))*1000);


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
            if ( props.updateNewSong ){
                song.exportSongChart(chart)
                updateStates()
            }
        }, [props.updateNewSong]
    )

    useEffect(
        () =>{
            if ( props.isPlaying ){
                startPlaying()
                props.stopPlaying(false)
            }
            else {
                setIndexToPlay(chartModel.length+1);
            }
        }, [props.isPlaying]
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
        <div id="chords">
            <div className={"chart-editor"}>
                <button id="modify_chart" onClick={addBar}>
                    <i className="material-icons" >add</i>
                </button>
                <button id="modify_chart" onClick={removeBar}>
                    <i className="material-icons" >remove</i>
                </button>
            </div>
            <ChordEditor isOpen={openModal} closeEditor={openEditor} chord={newChord}/>
            <div id="chart">
                {printChart(chartModel, chartDegree, midiNoteState, slotModel)}
            </div>
        </div>
    )
}

function NewSongInfo() {
    const [sel, setSel] = useState(false)

    const handleClick = () => {
        setSel(true)
    }

    return(
        <div id="myModal" className="modal">
            <div className="modal-content">
                <span className="close">&times;</span>
                <div className="modal-header">
                    <p>Add Song parameters</p>
                </div>
                <div className="modal-body">
                    <div id="new-title">
                        <form>
                            <label>Song Title:
                                <input type="text" name="song-name" className="new-song-name"/>
                            </label>
                        </form>
                    </div>
                    <br/>
                    <div id="new-meter" className="new-params">
                        <p>Meter</p>
                    </div>
                    <div className="mtr-cntr">
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>4/4</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>17/16</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>5/4</div>
                    </div>
                    <div className="mtr-cntr">
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>3/4</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>7/8</div>
                    </div>
                    <div className="mtr-cntr">
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>5/4</div>
                    </div>
                    <div id="new-tempo" className="new-params">
                        <p>Tempo</p>
                    </div>
                    <div className="sweet-slider">
                        <div className="sweet-slider">
                            BPM: <input type="number" id="new-bpm" name="new-bpm" min="60" max="220" defaultValue="90"/>
                        </div>
                    </div>
                    <div id="new-key" className="new-params">
                        <p>Key</p>
                    </div>
                    <div className="mtr-cntr">
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>C</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>C#/Db</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>D</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>D#/Eb</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>E</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>F</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>F#/Gb</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>G</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>G#/Ab</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>A</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>A#/Bb</div>
                        <div className={sel ? "meter-btn selected" : "meter-btn"} onClick={handleClick}>B</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LoadSongModal(props){
    const [modalSongList, setModalSongList] = useState(() => songList)
    const [isOpen, setIsOpen] = useState(() => false)


    const closeModal = () => {
        setIsOpen(false)
        props.setModalCaller(false)
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
                            docList.forEach(song => songList.push(song.data()._title))
                        });
                    }
                )
                    // .then(() => console.log('finito di caricare', songList))
                    .then(() => setModalSongList([...songList]))
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
                                            () => alert('selected song ' + index)
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

/* ---------- Functions to add Control Buttons ---------- */
function Buttons(props) {
    const [isRecording, setRecording] = useState( () => false );


    const startRecording = () => {
        setRecording(true);
        midiRecorder.setRecording(true);
    }

    const stopRecording = () => {
        setRecording(false);
        midiRecorder.setRecording(false);
        console.log(midiRecorder.getNoteSequence())
        player.noteSequence = midiRecorder.getNoteSequence();
    }



    function Actions(id) {
        if(id === "new") {
            PopupWindow()
        } else if(id === "play") {
            chartToNoteSequence(songInfo, chart)
            props.startPlaying(true)
        } else if(id === "pause") {
            null
        } else if(id === "stop") {
            props.startPlaying(false);
            handleClick()
        } else if(id === "record") {
            if(!isRecording){
                startRecording()
            }
            else stopRecording();
        } else if(id === "repeat") {
            null
        } else if(id === "save") {
            Song.loadFromFirebase('The Girl from Ipanema').then(songObj => song = songObj).then(() => {
                console.log('loaded song from firebase')
                song.exportSongInfo(songInfo)
                song.exportSongChart(chart)
                console.log(songInfo)
                console.log(chart)
            })
        } else if(id === "open") {
            // PopupWindow2()
            props.openModal(true)
            // OpenFile()
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
                    <i className="material-icons">{props.btn.icon}</i>
                }
                <div className="name">{props.btn.name}</div>
            </div>
        </div>
    )
}

function Ctrls(props) {
    const [lastClick, setLastClick] = useState("")

    return(
        <div id="control-buttons">
            {bank.map(
                (btn) =>
                    <Buttons key={btn} btn={btn} openModal={props.setModalCaller} startPlaying={props.startPlaying} />
            )}
        </div>
    );
}


/* ---------- Open file function ---------- */
function OpenFile() {
    const real_btn = document.getElementById("a-file");
    const folder_btn = document.getElementById("folder-btn");

    folder_btn.addEventListener("click", function() {
        real_btn.click();
    });

    real_btn.addEventListener("change", function() {
        const mid_val = real_btn.value;
    });
}

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

function handleClick(){
    // force a re-render
    console.log('forcing render')
    // document.getElementById("comper").innerHTML = '';
    ReactDOM.unmountComponentAtNode(document.getElementById("comper"))
    ReactDOM.render(<SongComponent />, root)
}

function SongComponent(){
    const [title, setTitle] = useState( () => songInfo.title)
    const [meterType, setMeterType] = useState( () => songInfo.meterType)
    const [meter, setMeter] = useState( () => songInfo.meter)
    const [bpm, setBpm] = useState( () => songInfo.bpm)
    const [glob_tonality, setGlob_tonaylity] = useState( () => songInfo.glob_tonality)
    const [modalCaller, setModalCaller] = useState( () => false)
    const [isPlaying, setIsPlaying] = useState( () => false)

    return(
        <div id = "wrapper">
            <h1>Comper & Voicings</h1>
            <div id="music-info">
                <h2>{title}</h2>
                <div id="mtrs-opts">
                    <label>Meter:</label>
                    <select id="meters" name="meters" defaultValue='4/4'>
                        {meters_options.map(
                            (mtrs) =>
                                <optgroup key={mtrs.group} label={mtrs.group}>
                                    { mtrs.values.map((vals) =>
                                        <option value={vals}>{vals}</option>
                                    )}
                                </optgroup>
                        )}
                    </select>
                </div>
                <div>
                    <label>Tempo:</label>
                    <span id="music-note">
                       ♩= <input type="number" id="bpm" name="bpm" min="60" max="220" defaultValue="90" title="Enter the tempo desired."/>
                   </span>
                </div>
                <div id="key-opts">
                    <label id="key">Key:</label>
                    <select id="keys" name="key" defaultValue='C'>
                        {key_options.map(
                            (key) =>
                                <option value={key}>{key}</option>
                        )}
                    </select>
                </div>
            </div>

            <Ctrls setModalCaller={setModalCaller} startPlaying={setIsPlaying}/>

            <NewSongInfo />

            <LoadSongModal isOpen={modalCaller} setModalCaller={setModalCaller}/>

            <br/>
            <ChordChart key={glob_tonality} isPlaying={isPlaying} stopPlaying={setIsPlaying}/>
            <br/>



        </div>
    )
}

const root = document.getElementById("comper")

ReactDOM.render(<SongComponent />, root)