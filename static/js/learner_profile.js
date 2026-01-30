// remove bookmark
document.querySelectorAll(".bookmark").forEach((bookmarkBtn) => {
  bookmarkBtn.addEventListener("click", () => {
    fetch("/remove-bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: bookmarkBtn.parentElement.dataset.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        bookmarkBtn.parentElement.style.display = "none";
      })
      .catch((err) => {
        console.error(err);
      });
  });
});

function goToHome(){
  window.location.href = `/Home`;
}