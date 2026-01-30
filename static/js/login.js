
function signIn(){
    let nameInput = document.getElementById("name");
    let passInput = document.getElementById("password");

    let name = nameInput.value.trim();
    let password = passInput.value.trim();

    if (name == ""){
        document.querySelector(".Error").innerText = "USERNAME MUST NOT BE EMPTY";
        return;
    }

    if(password == ""){
        document.querySelector(".Error").innerText = "PASSWORD MUST NOT BE EMPTY";
        return;
    }
    
    fetch("/check-details", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: name,
      password: password,
    })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/Home";
        }else{
            document.querySelector(".Error").innerText = "INVALID USERNAME OR PASSWORD";

            document.getElementById("name").value = "";
            document.getElementById("password").value = "";
        }
    });
}