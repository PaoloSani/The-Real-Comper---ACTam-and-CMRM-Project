const real_btn = document.getElementById("a-file");
const folder_btn = document.getElementById("folder-btn");

folder_btn.addEventListener("click", function() {
    real_btn.click();
});

real_btn.addEventListener("change", function() {
    const mid_val = real_btn.value;
});

// function save() { 
//     val = document.myform.text_area.value; 
//     mydoc = document.open(); 
//     mydoc.write(val); 
//     mydoc.execCommand("saveAs",true,".mid"); //you can change the .txt to your extention
//     history.go(-1);
// }

