let btn = document.querySelector(".add-btn");

btn.addEventListener( "click" , () => {
    document.querySelector(".main-section").style.display = "none";
    document.querySelector(".add-course").style.display = "block";
} )