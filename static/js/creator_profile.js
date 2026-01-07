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
