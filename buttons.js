const { useState } = React

/* ----- Model/View ----- */
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

/* ---------- Get values of inputs ---------- */
var meter = document.getElementById("meters").value;
var tempo = document.getElementById("bpm").value;


/* ---------- Functions to add html components with React ---------- */
function Buttons(props) {

	return(
		<div key={props.btn.id} id={props.btn.id} className="button" onClick={() => PopupWindow()}> 
			<i className="material-icons">{props.btn.icon}</i>
			<div className="name">{props.btn.name}</div>
		</div>
	)
}
function Ctrls() {
		
	return(
		<div id="ctrl-btns">
			{bank.map(
				(btn) =>
				<Buttons key={btn} btn={btn}/>
			)}
		</div>
	);
}

/* ---------- Open file function ---------- */
// function OpenFile() {
	// const real_btn = document.getElementById("a-file");
	// const folder_btn = document.getElementById("folder-btn");
	
	// folder_btn.addEventListener("click", function() {
	//     real_btn.click();
	// });
	
	// real_btn.addEventListener("change", function() {
	//     const mid_val = real_btn.value;
	// });
// }

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

ReactDOM.render(<Ctrls />, document.getElementById('control-buttons'));
