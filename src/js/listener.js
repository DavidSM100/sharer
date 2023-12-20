import * as main from './main.js';
import { ls_set } from './util.js';

// Switch between send and receive screens
show_receive.addEventListener("click", function () {
  main.toggle_receive_send(this);
});

show_send.addEventListener("click", function () {
  main.toggle_receive_send(this);
});


// Show the send files screen
add_files.addEventListener("click", function() {
  homeDiv.style.display = "none";
  addFilesDiv.style.display = "block";
});


// Trigger the file input to select files from system
select_files_btn.addEventListener("click", function() {
  importFiles.click();
});

// Show the number of files
importFiles.addEventListener("change", function() {
  filesNumberSpan.innerHTML = this.files.length + " file(s)";
});


// Switch compress button imgs
compress_btn.addEventListener("click", main.switch_compress);

switch_compress_btn.addEventListener("click", main.switch_compress);


// Save part size data
sizeInput.addEventListener("input", function() {
  ls_set("sizeValue", this.value);
});

sizeSelect.addEventListener("change", function() {
  ls_set("sizeUnit", this.value);
});


// Cancel sending
cancel_send.addEventListener("click", function() {
  addFilesDiv.style.display = "none";
  homeDiv.style.display = "block";
});


// Add files to queue
send_files.addEventListener("click", main.add_files_to_queue);