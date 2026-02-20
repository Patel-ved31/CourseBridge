const searchInput = document.getElementById("search");

const suggestionsBox = document.getElementById("suggestions");

searchInput.addEventListener("keyup", (e) => {
  let value = searchInput.value;

  if (value.length === 0) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.border = "0";
    return;
  }

  if (e.key === "Enter") {
    window.location.href = `/courseList?course=${encodeURIComponent(value)}`;
  }

  fetch(`/search?q=${value}`)
    .then((response) => response.json())

    .then((data) => {
      suggestionsBox.innerHTML = "";

      data.forEach((item) => {
        let div = document.createElement("div");

        div.textContent = item;

        div.onclick = () => {
          window.location.href = `/courseList?course=${encodeURIComponent(item)}`;
        };

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
