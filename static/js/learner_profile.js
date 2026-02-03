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

document.querySelectorAll(".box").forEach( box => {
  box.addEventListener( "click" , () => {
    if(event.target.classList.contains("bookmark") || event.target.classList.contains("bi") ){
        return;
    }
    window.location.href =`/fullCoursePage?course_id=${encodeURIComponent(box.dataset.value)}`;
    } );
});

function goToHome(){
  window.location.href = `/Home`;
}

function goToFullPage(x){
    window.location.href = `/creatorCourse?creator=${encodeURIComponent(parseInt(x.dataset.value))}`;
}