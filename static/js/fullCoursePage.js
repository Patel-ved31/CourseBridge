document.querySelector(".bookmark").addEventListener("click", function() {
    icon = this.querySelector("i");
    if (this.dataset.value === "1") {
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
            this.dataset.value = "2";
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
            this.dataset.value = "1";
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