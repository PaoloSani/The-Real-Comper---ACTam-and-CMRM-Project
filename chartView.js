import React from 'react';
import ReactDOM from 'react-dom';
const teoria = require("teoria");
import Modal from 'react-modal';


const { useState, useEffect, useRef} = React

const Song = require('./index.js')

const meters_options = [{
    group: 'Group A',
    values: ['4/4', '17/16', '5/4'],
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


var song = new Song('prova');


song.Chart[0].chord='C6/9'
song.Chart[1].chord='Am7'
song.Chart[2].chord='Dm7'
song.Chart[3].chord='G7'

let songInfo ={};
let chart = {};

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

/* ---------- Functions to add Control Buttons ---------- */
function Buttons(props) {
    return(
        <div id="btns">
            { props.btn.id === "open" ?
                <input type="file" id="a-file" accept=".mid" hidden="hidden" /> : null
            }
            <div key={props.btn.id} id={props.btn.id} className="button" onClick={() => Actions(props.btn.id)} >
                { props.btn.id === "open" ?
                    <i className="material-icons" id="folder-btn">{props.btn.icon}</i> :
                    <i className="material-icons">{props.btn.icon}</i>
                }
                <div className="name">{props.btn.name}</div>
            </div>
        </div>
    )
}

function Ctrls() {
    const [lastClick, setLastClick] = useState("")
    return(
        <div id="control-buttons">
            {bank.map(
                (btn) =>
                    <Buttons key={btn} btn={btn} />
            )}
        </div>
    );
}

function Actions(props) {
    if(props === "new") {
        PopupWindow()
    } else if(props === "play") {
        null
    } else if(props === "pause") {
        null
    } else if(props === "stop") {
        null
    } else if(props === "record") {
        null
    } else if(props === "repeat") {
        null
    } else if(props === "save") {
        null
    } else if(props === "open") {
        OpenFile()
    }

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
    add_btn.onclick = function() {
        modal.style.display = "block";
    }
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function SongComponent(){
    const [title, setTitle] = useState( () => songInfo.title)
    const [meterType, setMeterType] = useState( () => songInfo.meterType)
    const [meter, setMeter] = useState( () => songInfo.meter)
    const [bpm, setBpm] = useState( () => songInfo.bpm)
    const [glob_tonality, setGlob_tonality] = useState( () => songInfo.glob_tonality)

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

            <Ctrls />

            <NewSongInfo />
            
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