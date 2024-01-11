document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("image").addEventListener("change", previewMultiple);
});

function previewMultiple(event) {
  const form = document.querySelector("#formFile");
  form.innerHTML = ""; // clear previous images
  var images = document.getElementById("image"); // gets the input tag (has "image" id)
  var number = images.files.length; // gets the length of the files chosen by user

  // goes thru each img, creates object url, and adds the img into form
  for (i = 0; i < number; i++) {
    // event.target is the same as images var
    var urls = URL.createObjectURL(event.target.files[i]);
    form.innerHTML += '<img src="' + urls + '">';
  }
}
