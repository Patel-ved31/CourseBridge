function signIn(){
    let nameInput = document.getElementById("name");
    let passInput = document.getElementById("password");

    let name = nameInput.value.trim();
    let password = passInput.value.trim();

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
            document.querySelector(".Error").innerText = "Invalid username or password";

            document.getElementById("name").value = "";
            document.getElementById("password").value = "";
        }
    });
}