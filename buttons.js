const real_btn = document.getElementById("a-file");
const folder_btn = document.getElementById("folder-btn");

folder_btn.addEventListener("click", function() {
    real_btn.click();
});

real_btn.addEventListener("change", function() {
    const mid_val = real_btn.value;
});

var meter = document.getElementById("meters").value;

var tempo = document.getElementById("bpm").value;
