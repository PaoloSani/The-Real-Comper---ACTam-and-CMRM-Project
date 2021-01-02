

/* ---------- Open file function ---------- */
const real_btn = document.getElementById("a-file");
const folder_btn = document.getElementById("folder-btn");

folder_btn.addEventListener("click", function() {
    real_btn.click();
});

real_btn.addEventListener("change", function() {
    const mid_val = real_btn.value;
});

/* ---------- Get values of inputs ---------- */
var meter = document.getElementById("meters").value;
var tempo = document.getElementById("bpm").value;

/* ---------- Modal window ---------- */
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
