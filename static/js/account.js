const sections = {
  overview: document.querySelector(".overview"),
  name: document.querySelector(".change-name"),
  password: document.querySelector(".change-password"),
  profile: document.querySelector(".change-profilePic"),
  delete: document.querySelector(".delete-acc"),
};

const buttons = document.querySelectorAll(".menu-item");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    Object.values(sections).forEach(sec => sec.style.display = "none");
    sections[btn.dataset.key].style.display = "block";
  });
});

/* DEFAULT */
Object.values(sections).forEach(sec => sec.style.display = "none");
sections.overview.style.display = "block";

let s = document.querySelectorAll(".s")

/* EDIT MODES */
function show(type) {
  Object.values(sections).forEach(sec => sec.style.display = "none");

  if (type === "changeName") {
    document.querySelector(".change-name").style.display = "block"
   s.forEach(btn => btn.classList.remove("active"));
   document.querySelector(".s2").classList.add("active")
};
  if (type === "changePassWord") {
    document.querySelector(".change-password").style.display = "block"
    s.forEach(btn => btn.classList.remove("active"));
   document.querySelector(".s3").classList.add("active")
  };
  if (type === "changePhoto"){ 
    document.querySelector(".change-profilePic").style.display = "block"
    s.forEach(btn => btn.classList.remove("active"));
   document.querySelector(".s4").classList.add("active")
  }
}

function isValidUsername(name) {
  for (let ch of name) {
    if (
      !(
        (ch >= "A" && ch <= "Z") ||
        (ch >= "a" && ch <= "z") ||
        (ch >= "0" && ch <= "9")
      )
    ) {
      return false;
    }
  }
  return true;
}

function changeName(){
    let name = document.querySelector(".new-username").value;

    if (name.length === 0) {
    document.querySelector(".name-error").innerText =
      "Username cannot be empty";
    return;
  }

  if (!isValidUsername(name)) {
    document.querySelector(".name-error").innerText =
      "Only A-Z, a-z and 0-9 allowed";
    return;
  }

  fetch("/changeName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            newName : name,
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.message === "True"){
            location.reload()
        }else{
            document.querySelector(".name-error").innerText =
            data.message;
            
        }
    })
    .catch(err => {
        console.error(err);
    }); 
}

function changePassword(){
    let password = document.querySelector(".new-password").value;
    let renter = document.querySelector(".renter").value;

    if (password !== renter){
        document.querySelector(".password-error").innerText = "Both PassWord Not Match"
        return;
    }

    if (password.length < 4){
        document.querySelector(".password-error").innerText = "Password length must be more then 4"
        return;
    }
    fetch("/changePass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            newPass : password,
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.message === "True"){
            location.reload()
        }else{
            document.querySelector(".password-error").innerText =
            data.message;
            password.value = "";
            renter.value = ""
        }
    })
    .catch(err => {
        console.error(err);
    }); 
}


function deleteAccount(){
    let confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone.");

    if (confirmation) {
        fetch("/deleteAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.json()) 
        .then(data => {
            if(data.message === "True"){
                alert("Your account has been deleted.");
                window.location.href = "/";
            }else{
                alert("There was an error deleting your account. Please try again later.");
            } 
        })
        .catch(err => {
            console.error(err);
        });
    }
}