import React from 'react';
import ReactDOM from 'react-dom';
const teoria = require("teoria");
const { useState, useEffect} = React
// const Song = require('./index.js')
import { db, Song } from "./index";
import Modal from "react-modal";


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

const chord_type = ['ma', 'm', '7', 'm7', 'maj7', 'dim', 'sus2', 'sus4', 'aug', 'custom']


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
            chord = selRoot+selType
        }

        props.closeEditor(false, 0, chord.slice())
    }

    const initializeModal = () => {
        let chord = props.chord;
        let type = chord.slice(1)
        chord = chord[0];
        setSelRoot(chord)
        if ( chord_type.includes(type)){
            setSelType(type)
        }
        else {
            setSelType('custom')
            setCustomSel(chord+type)
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


    return (
        <div className={ (props.index % (props.slot * 4) % props.slot === 0) ? "chord-block end-bar" : "chord-block"} >
            <i className="fas fa-edit edit" onClick={editChord}></i>
            <div className={"chord"}>{props.name}</div>
            <div className={"degree"}>{props.degree}</div>
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
    const [indexOfChord, setIndex] = useState( () => 0)

    const updateStates = () => {
        setChartModel([...chart.chartModel])
        setChartDegree([...chart.chartDegree])
        setSlotModel(chart.slotModel)
        setMidiNoteState([...chart.MIDInote])
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
        <ChordBlock name={name} index={index} slot={slotModel} degree={degree} midi={midi} openEditor={openEditor}/>
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

    useEffect(
        () =>{
            if ( newChord !== ""){
                song.modifyChord(newChord, indexOfChord)
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


    const openEditor = (state, index, chord) => {
        if ( state ){
            let chord = chartModel[index]
            setIndex(index)
            setNewChord(chord)
        }
        else {
            setNewChord(chord)
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

function NewSongInfo(props) {
    const [isNewOpen, setIsNewOpen] = useState(false)
    var keyName = songInfo.glob_tonality.split(' ')[0]
    const [selKey, setSelKey] = useState(keyName)
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
        setSelKey(keyName)
        setSongName(songInfo.title)
    }

    const closeNew = () => {
        setIsNewOpen(false)
        props.setModalNew(false)
        song = new Song(songName, selMet, songBpm, 'C major', selMetGroup)
        song.exportSongInfo(songInfo)
        song.exportSongChart(chart)
        props.setNewSongLoading(true)
    }

    return(
        <>
            <Modal isOpen={isNewOpen} style={newModalStyle} onAfterOpen={openNew} ariaHideApp={false} onRequestClose={closeNew}> 
                <div> 
                    <span className="close" onClick={closeNew}>&times;</span>
                    <div className="modal-header">
                         <p>Add Song parameters</p>
                     </div>
                     <div className="modal-body">
                         <div id="new-title">
                             <label>Song Title:
                                 <input type="text" name="song-name" className="new-song-name" defaultValue={songInfo.title} onChange={showSongName}/>
                             </label>
                         </div>
                         <div id="new-meter" className="new-params">
                             <p className="param-title">Meter</p>
                         </div>
                         <div>
                             {meters_options.map(
                                 (mtrs, ix) =>
                                     <div className="mtr-cntr" key={mtrs.group} id={mtrs.group}>
                                         { mtrs.signatures_set.map((vals) =>
                                             <div className={(selMetGroup == ix && selMet == vals) ? "meter-btn selected" : "meter-btn"} onClick={() => handleMeter(ix, vals)}>{vals}</div>
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
                             {key_options.map((key) => 
                                 <div className={selKey == key ? "meter-btn selected" : "meter-btn"} onClick={() => handleKey(key)}>{key}</div>
                             )}
                         </div>
                     </div>
                 </div>
            </Modal>
        </>
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

    function Actions(id) {
        if(id === "new") {
            // PopupWindow()
            props.openNew(true)
        } else if(id === "play") {
            null
        } else if(id === "pause") {
            null
        } else if(id === "stop") {
            handleClick()
        } else if(id === "record") {
            null
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
            <div key={props.btn.id} id={props.btn.id} className="button" onClick={() => Actions(props.btn.id)} >
                { props.btn.id === "open" ?
                    <i className="material-icons" id="folder-btn">{props.btn.icon}</i> :
                    (props.btn.id == "record" ? <i className="material-icons record" id="folder-btn">{props.btn.icon}</i> :
                    <i className="material-icons">{props.btn.icon}</i>
                    )
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
                    <Buttons key={btn} btn={btn} openModal={props.setModalCaller} openNew={props.setModalNew} />
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
    const [bpm, setBpm] = useState(songInfo.bpm)
    const [glob_tonality, setGlob_tonality] = useState( () => songInfo.glob_tonality)
    const [modalCaller, setModalCaller] = useState( () => false)
    const [modalNew, setModalNew] = useState(() => false)
    const [newSongLoading, setNewSongLoading] = useState( () => false)

    useEffect(
        () =>{
            if(newSongLoading){
                setTitle(songInfo.title)
                setMeter(songInfo.meter)
                setMeterType(songInfo.meterType)
                setBpm(songInfo.bpm)
                setGlob_tonality(songInfo.glob_tonality)
                setNewSongLoading(false)
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
        song.transposeSong(value)
        song.exportSongInfo(songInfo)
        song.exportSongChart(chart)
        setNewSongLoading(true)
        console.log(chart)
    }

    // TODO: update modal

    return(
        <div id = "wrapper">
            <h1>THE REAL COMPER</h1>
            <div id="music-info">
                <h2>{title}</h2>
                <div id="mtrs-opts">
                    <label>Meter:</label>
                    <select id="meters" name="meters" defaultValue={songInfo.meter} value={meter} onChange={showMeter}>
                        {meterType.signatures_set.map((mtrs) => 
                            <option value={mtrs}>{mtrs}</option>
                        )}
                    </select>
                </div>
                <div>
                    <label>Tempo:</label>
                    <span id="music-note">
                       ♩= <input type="number" id="bpm" name="bpm" min="60" max="220" defaultValue={songInfo.bpm} value={bpm} onChange={showBPM}/>
                   </span>
                </div>
                <div id="key-opts">
                    <label id="key">Key:</label>
                    <select id="keys" name="key" defaultValue={songInfo.glob_tonality} value={glob_tonality} onChange={showKey}>
                        {key_options.map(
                            (key) =>
                                <option value={key}>{key}</option>
                        )}
                    </select>
                </div>
            </div>

            <Ctrls setModalCaller={setModalCaller} setModalNew={setModalNew}/>

            <NewSongInfo isNewOpen={modalNew} setModalNew={setModalNew} setTitle={setTitle} setGlob_tonality={setGlob_tonality} setBpm={setBpm} setMeter={setMeter} setMeterType={setMeterType} setNewSongLoading={setNewSongLoading}/>

            <LoadSongModal isOpen={modalCaller} setModalCaller={setModalCaller} setNewSongLoading={setNewSongLoading}/>

            <br/>
            <ChordChart key={glob_tonality}/>
            <br/>

            <div id="piano-roll">
                <midi-visualizer
                    type="waterfall"
                    src="https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/twinkle_twinkle.mid">
                </midi-visualizer>
                <midi-visualizer
                    type="staff"
                    src="https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/twinkle_twinkle.mid">
                </midi-visualizer>

                <midi-player
                    src="https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/twinkle_twinkle.mid"
                    sound-font visualizer="#piano-roll midi-visualizer" id="midi-player1">
                </midi-player>

                <svg>
                    <defs>
                        <linearGradient id="keyGradient" x1="15%" x2="0%" y1="0" y2="100%">
                            <stop stopColor="black" offset="60%"/>
                            <stop stopColor="grey" offset="99%"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    )
}

const root = document.getElementById("comper")

ReactDOM.render(<SongComponent />, root)