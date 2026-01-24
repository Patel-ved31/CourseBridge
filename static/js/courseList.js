document.querySelectorAll(".bookmark").forEach( bookmarkBtn => {
  bookmarkBtn.addEventListener( "click" , () => {
    const icon = bookmarkBtn.querySelector("i");
    if( bookmarkBtn.dataset.value === "1" ){
      fetch("/add-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            course_id: bookmarkBtn.parentElement.dataset.value,
        })
      })
      .then(res => res.json())
        .then(data => {
            icon.classList.remove("bi-bookmark");
            icon.classList.add("bi-bookmark-fill");
            bookmarkBtn.dataset.value = "2";
        })
      .catch(err => {
          console.error(err);
      });
    }else{
        fetch("/remove-bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_id: bookmarkBtn.parentElement.dataset.value
            })
        })
        .then(res => res.json())
        .then(data => {
            icon.classList.remove("bi-bookmark-fill");
            icon.classList.add("bi-bookmark");
            bookmarkBtn.dataset.value = "1";
        })
        .catch(err => {
            console.error(err);
        });
    }
    } );
});

document.querySelectorAll(".box").forEach( box => {
  box.addEventListener( "click" , () => {
    if(event.target.classList.contains("bookmark") || event.target.classList.contains("bi") ){
        return;
    }
    window.location.href =`/fullCoursePage?course_id=${encodeURIComponent(box.dataset.value)}`;
    } );
});
