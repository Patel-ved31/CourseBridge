// get search input box
const searchInput = document.getElementById("search");

// get suggestions div
const suggestionsBox = document.getElementById("suggestions");

// run this when user types anything
searchInput.addEventListener("keyup", (e) => {
  // get typed value
  let value = searchInput.value;

  // if input is empty
  if (value.length === 0) {
    // clear suggestions
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.border = "0";
    return;
  }

  if(e.key === "Enter" ){
    window.location.href =
      `/courseList?course=${encodeURIComponent(value)}`;
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

// console.log(document.querySelectorAll("#suggestions > div"))
document.getElementById("suggestions").addEventListener("click", function (e) {
  if (e.target.tagName === "DIV") {
    const course = e.target.innerText.trim();

    window.location.href =
      `/courseList?course=${encodeURIComponent(course)}`;
  }
});

document.querySelector(".bookmark").addEventListener("click", function() {
    icon = this.querySelector(".bookmark i");
    if (this.dataset.value === "0") {
        fetch("/add-bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_id: this.dataset.courseId
            })
        })
        .then(res => res.json())
        .then(data => {
            icon.classList.remove("bi-bookmark");
            icon.classList.add("bi-bookmark-fill");
            this.dataset.value = "1";
        })
        .catch(err => {
            console.error(err);
        });
    } else {
        fetch("/remove-bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_id: this.dataset.courseId
            })
        }) 
        .then(res => res.json())
        .then(data => {
            icon.classList.remove("bi-bookmark-fill");
            icon.classList.add("bi-bookmark");
            this.dataset.value = "0";
        })
        .catch(err => {
            console.error(err);
        });
    }
});

document.querySelectorAll(".star .bi").forEach( icon => {
    icon.addEventListener("click", function() {
        let star = parseInt(this.dataset.value);

        document.querySelectorAll(".bi").forEach( s => {
            if (s.dataset.value <= star) {
                s.classList.remove("bi-star");
                s.classList.add("bi-star-fill");
            } else {
                s.classList.remove("bi-star-fill");
                s.classList.add("bi-star");
            }
        });
    });
});

document.querySelector("#submit-review").addEventListener("click", function() {
    let stars = document.querySelectorAll(".bi-star-fill").length;
    let reviewText = document.querySelector("#review-text").value;
    let courseId = document.querySelector(".review").dataset.value;

    fetch("/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            course_id: courseId,
            rating: stars,
            comment: reviewText
        })
    })
    .then(res => res.json())
    .then(data => {
        location.reload();
    })
    .catch(err => {
        console.error(err);
    }); 
});


function fullPage(x){
    window.location.href = `/creatorCourse?creator=${encodeURIComponent(parseInt(x.dataset.value))}`;
}

function goToHome(){
  window.location.href = `/Home`;
}

function sub(x){
    let creator_id = parseInt(x.dataset.value);

    fetch("/sub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            creator_id : creator_id
        })
    })
    .then(res => res.json())
    .then(data => {
        x.classList.add("already-sub")
        x.classList.remove("not-sub")

        x.innerText = "Subscribed"

        location.reload()
    })
    .catch(err => {
        console.error(err);
    }); 
}

function unsub(x){
    let creator_id = parseInt(x.dataset.value);

    fetch("/unsub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            creator_id : creator_id
        })
    })
    .then(res => res.json())
    .then(data => {
        x.classList.remove("already-sub")
        x.classList.add("not-sub")

        x.innerText = "Subscribe"

        location.reload()
    })
    .catch(err => {
        console.error(err);
    }); 
}