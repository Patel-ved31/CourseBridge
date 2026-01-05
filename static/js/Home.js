// get search input box
const searchInput = document.getElementById("search");

// get suggestions div
const suggestionsBox = document.getElementById("suggestions");

// run this when user types anything
searchInput.addEventListener("keyup", () => {
  // get typed value
  let value = searchInput.value;

  // if input is empty
  if (value.length === 0) {
    // clear suggestions
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.border = "0";
    return;
  }

  // send typed text to flask
  fetch(`/search?q=${value}`)
    // convert flask response to json
    .then((response) => response.json())

    // data = list received from flask
    .then((data) => {
      // clear old results
      suggestionsBox.innerHTML = "";


      // loop through each result
      data.forEach((item) => {
        // create new div
        let div = document.createElement("div");

        // put text inside div
        div.textContent = item;

        // when user clicks suggestion
        div.onclick = () => {
          searchInput.value = item;
          suggestionsBox.innerHTML = "";
        };

        // add div to suggestions box
        suggestionsBox.appendChild(div);
      });
    });
});


document.querySelectorAll(".box").forEach(box => {
  box.addEventListener("click", () => {
    const category = box.dataset.value;

    // redirect to course page with category
    window.location.href = `/courseList?category=${encodeURIComponent(category)}`;
  });
});

function profile(){
  let name = document.querySelector(".user-name").dataset.value;
  let role = document.querySelector(".user-role").dataset.value;

  if(role === "Creator"){
    window.location.href = `/creator_profile`;
  }
}
