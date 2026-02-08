let btn = document.querySelector(".add-btn");

btn.addEventListener( "click" , () => {
    document.querySelector(".main-section").style.display = "none";
    document.querySelector(".add-course").style.display = "block";
} )

document.getElementById("addCourseForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const price = document.getElementById("price").value.trim();
  const image = document.getElementById("thumbnail").files[0];
  const link = document.getElementById("link").value.trim();

  // ---------- VALIDATION ----------
  if (!title || !category || !image || !link) {
    alert("Title, Category , link and Image are required");
    return;
  }

  if (!image.type.startsWith("image/")) {
    alert("Only image files allowed");
    return;
  }

  // ---------- FORM DATA ----------
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("price", price);
  formData.append("thumbnail", image);
  formData.append("link", link);


  // ---------- SEND TO FLASK ----------
  fetch("/add-course", {
    method: "POST",
    body: formData   // ❗ DO NOT set headers
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    document.querySelector(".main-section").style.display = "block";
    document.querySelector(".add-course").style.display = "none";
  })
  .catch(err => {
    console.error(err);
    alert("Something went wrong");
  });
});

// show creator uploaded courses
document.querySelector(".uploaded-course").addEventListener("click", () => {
  if (document.querySelector(".user-courses").style.display === "block") {
    return;
  }
    let course =  document.querySelector(".user-courses");
    let bookmark =  document.querySelector(".user-bookmarks");

    bookmark.style.display = "none";
    course.style.display = "block"; 

    document.querySelector(".uploaded-course").classList.add("active");
    document.querySelector(".bookmarked-course").classList.remove("active"); 
});
// show creator bookmarked courses
document.querySelector(".bookmarked-course").addEventListener("click", () => {
  if (document.querySelector(".user-bookmarks").style.display === "block") {
    return;
  }
    let course =  document.querySelector(".user-courses");
    let bookmark =  document.querySelector(".user-bookmarks");

    course.style.display = "none";
    bookmark.style.display = "block";

    document.querySelector(".uploaded-course").classList.remove("active");
    document.querySelector(".bookmarked-course").classList.add("active");
});

// remove bookmark
document.querySelectorAll(".bookmark").forEach( bookmarkBtn => {
  bookmarkBtn.addEventListener( "click" , () => {
        fetch("/remove-bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_id: bookmarkBtn.parentElement.dataset.value
            })
        })
        .then(res => res.json())
        .then(data => {
            bookmarkBtn.parentElement.style.display = "none";
        })
        .catch(err => {
            console.error(err);
        });
    } 
  );
});

document.querySelectorAll(".box").forEach( box => {
  box.addEventListener( "click" , () => {
    if(event.target.classList.contains("bookmark") || event.target.classList.contains("bi") ){
        return;
    }
    window.location.href =`/fullCoursePage?course_id=${encodeURIComponent(box.dataset.value)}`;
    } );
});

// delete course
document.querySelectorAll(".delete-btn").forEach( deleteBtn => {
  deleteBtn.addEventListener( "click" , () => {
        fetch("/delete-course", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_id: deleteBtn.dataset.value
            })
        })  
        .then(res => res.json())
        .then(data => {
            deleteBtn.parentElement.style.display = "none";
        })
        .catch(err => {
            console.error(err);
        }
    );
    }
  );
});

function goToHome(){
  window.location.href = `/Home`;
}

function goToFullPage(x){
    window.location.href = `/creatorCourse?creator=${encodeURIComponent(parseInt(x.dataset.value))}`;
}