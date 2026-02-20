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

  if (e.key === "Enter") {
    window.location.href = `/courseList?course=${encodeURIComponent(value)}`;
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
          window.location.href = `/courseList?course=${encodeURIComponent(item)}`;
        };

        // add div to suggestions box
        suggestionsBox.appendChild(div);
      });
    });
});

document.querySelector(".bookmark").addEventListener("click", function () {
  icon = document.querySelector(".bookmark i");
  if (this.dataset.value === "0") {
    fetch("/add-bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: this.dataset.courseId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        icon.classList.remove("bi-bookmark");
        icon.classList.add("bi-bookmark-fill");
        this.dataset.value = "1";
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    fetch("/remove-bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: this.dataset.courseId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        icon.classList.remove("bi-bookmark-fill");
        icon.classList.add("bi-bookmark");
        this.dataset.value = "0";
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

document.querySelectorAll(".star .bi").forEach((icon) => {
  icon.addEventListener("click", function () {
    let star = parseInt(this.dataset.value);

    document.querySelectorAll(".star .bi").forEach((s) => {
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

document.querySelector("#submit-review").addEventListener("click", function () {
  let stars = document.querySelectorAll(".bi-star-fill").length;
  let reviewText = document.querySelector("#review-text").value;
  let courseId = document.querySelector(".review").dataset.value;

  fetch("/submit-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      rating: stars,
      comment: reviewText,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      location.reload();
    })
    .catch((err) => {
      console.error(err);
    });
});

function fullPage(x) {
  window.location.href = `/creatorCourse?creator=${encodeURIComponent(parseInt(x.dataset.value))}`;
}

function goToHome() {
  window.location.href = `/Home`;
}

function sub(x) {
  let creator_id = parseInt(x.dataset.value);

  fetch("/sub", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creator_id: creator_id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message === "subscription done") {
        x.classList.add("already-sub");
        x.classList.remove("not-sub");

        x.innerText = "Subscribed";

        location.reload();
      } else {
        alert(data.message);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function unsub(x) {
  let creator_id = parseInt(x.dataset.value);

  fetch("/unsub", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creator_id: creator_id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      x.classList.remove("already-sub");
      x.classList.add("not-sub");

      x.innerText = "Subscribe";

      location.reload();
    })
    .catch((err) => {
      console.error(err);
    });
}

function removeSugg() {
  // Add a small delay to allow click events on suggestions to fire
  setTimeout(() => {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.border = "0";
  }, 150);
}

function displayReportModal() {
  document.querySelector(".modal-overlay").style.display = "block";
}

function cancleReport() {
  document.querySelector(".modal-overlay").style.display = "none";
}

function addOpt(x) {
  let val = x.dataset.value;

  if (x.classList.contains("selected")) {
    x.classList.remove("selected");
  } else {
    x.classList.add("selected");
  }
}

function sendReport() {
  let selectedCats = [];

  temp = document.querySelectorAll(".selected");

  if (temp.length === 0) {
    alert("Please select at least one category.");
    return;
  }

  temp.forEach((x) => {
    selectedCats.push(x.dataset.value);
  });

  let description = document.querySelector("#reportDesc").value.trim();

  if (!description) {
    alert("Please provide a Report Reason.");
    return;
  }

  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course_id");

  fetch("/report-course", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      categories: selectedCats,
      description: description,
    }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.message || "Something went wrong");
        throw error;
      }
      return data;
    })
    .then((data) => {
      alert(data.message);
      document.querySelector(".modal-overlay").style.display = "none";
      location.reload();
    })
    .catch((error) => {
      alert(error.message);
      document.querySelector(".modal-overlay").style.display = "none";
    });
}
