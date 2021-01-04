import React from 'react';
import ReactDOM from 'react-dom';
const teoria = require("teoria");

const { useState, useEffect} = React

const Song = require('./index.js')

const meters_options = [{
    group: 'Group A',
    values: ['4/4', '17/16', '5/4']
}, {
    group: 'Group B',
    values: ['3/4', '7/8']
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

var song = new Song('prova');

song.Chart[1].chord='Dmin7'

let chartObject = {
    chartModel : ['Cmaj7', 'Amin7', 'Dmin7', 'Db7'],
    tonalityModel : ['C' ,'major'],
    slotModel : 4,
}

let songInfo = {
    title: 'The Girl From Ipanema',
    meterType: meters_options[0],
    meter: '4/4',
    bpm: 120,
    glob_tonality: 'C major',
}

function ChordBlock(props){
    const [chordState, setChordState] = useState(() => props.chord)
    const [tonality, setTonality] = useState(() => props.tonality)

    const editChord = () => {

    }

    const createTeoriaChord = (chord, tonality) => {
        var chordToPrint = new teoria.chord(chord);
        let name = chordToPrint.name;
        let degree = chordToPrint.root.scaleDegree(teoria.scale(tonality[0], tonality[1]));

        return (
            <div>
                <div className={"chord"}>{name}</div>
                <div className={"degree"}>{degree}</div>
            </div>
        )
    }
    return (
        <div className={ (props.index % props.slot === 0) ? "chord-block end-bar" : "chord-block"}>
            <i className="fas fa-edit edit" onClick={editChord}></i>
            {createTeoriaChord(chordState, tonality)}
        </div>
    )
}

function ChordChart(){
    const [chartState, setChart] = useState( () => chartObject.chartModel )
    const [tonality, setTonality] = useState( () => chartObject.tonalityModel )
    const [slot, setSlot] = useState( () => chartObject.slotModel )

    const render = () => {
        for ( let i = 0; i < slot; i++ ){
            chartModel.push('Cmaj7')
        }
    }

    const addBar = () => {
        song.addBar()

        chartObject = song.render(chartObject)
        setChart([...chartObject.chartModel])
    }

    const printChord = (chord, index) => {
        return (
            <ChordBlock chord = {chord} index = {index} slot = {slot} tonality={tonality} />
        )
    }

    const removeBar =  () => {
        song.removeBar()
        chartObject = song.render(chartObject)
        setChart([...chartObject.chartModel])
    }

    const printLine = (i, array) =>{
        return (
            <div id={"line" + i} className={"chart-line"}>{array.map( (i, index) => printChord(i, index))} </div>
        )
    }

    const printChart = (chart) => {
        var size = slot*4
        var lines = Math.ceil(chart.length/(size))
        const arr = Array.from({length: lines}, (_, index) => index + 1);

        var arrayOfLines = [];

        for (var i=0; i< chart.length; i+=size) {
            arrayOfLines.push(chart.slice(i, i + size));
        }
        return arr.map( (i, index)=> printLine(index, arrayOfLines[index]))

    }

    useEffect(
        () =>{
            console.log(chartObject)
        }, [chartState]
    )

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
            <div id="chart">
                {printChart(chartState)}
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
            <ChordChart />
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