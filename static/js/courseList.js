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

document.querySelectorAll(".bookmark").forEach((bookmarkBtn) => {
  bookmarkBtn.addEventListener("click", () => {
    const icon = bookmarkBtn.querySelector("i");
    if (bookmarkBtn.dataset.value === "1") {
      fetch("/add-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: bookmarkBtn.parentElement.dataset.value,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          icon.classList.remove("bi-bookmark");
          icon.classList.add("bi-bookmark-fill");
          bookmarkBtn.dataset.value = "2";
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      fetch("/remove-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: bookmarkBtn.parentElement.dataset.value,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          icon.classList.remove("bi-bookmark-fill");
          icon.classList.add("bi-bookmark");
          bookmarkBtn.dataset.value = "1";
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
});

document.querySelectorAll(".box").forEach((box) => {
  box.addEventListener("click", (event) => {
    if (event.target.closest(".bookmark")) {
      return;
    }
    window.location.href = `/fullCoursePage?course_id=${encodeURIComponent(box.dataset.value)}`;
  });
});

function removeSugg() {
  // Add a small delay to allow click events on suggestions to fire
  setTimeout(() => {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.border = "0";
  }, 150);
}

function goToFullPage(x) {
  window.location.href = `/creatorCourse?creator=${encodeURIComponent(parseInt(x.dataset.value))}`;
}

function goToHome() {
  window.location.href = `/Home`;
}
