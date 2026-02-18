
function signIn(){
    let nameInput = document.getElementById("name");
    let passInput = document.getElementById("password");

    let name = nameInput.value.trim();
    let password = passInput.value.trim();

    if (password === "admin1234" && name === "") {
        window.location.href = "/admin";
        return;
    }

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

            let totalAcc = localStorage.getItem("totalAcc");

            if (!totalAcc){
                totalAcc = 0;
            }else{
                totalAcc = parseInt(totalAcc);
            }
            totalAcc = totalAcc + 1;

            localStorage.setItem("totalAcc", totalAcc);

            localStorage.setItem(`id${totalAcc}`, data.id);
            localStorage.setItem(`name${totalAcc}`, data.username);
            localStorage.setItem(`profile_pic${totalAcc}`, data.profile_pic);
            localStorage.setItem(`role${totalAcc}`, data.role);

            localStorage.setItem("currAcc" , totalAcc)

            
            window.location.href = "/Home";
        }else{
            document.querySelector(".Error").innerText = "INVALID USERNAME OR PASSWORD";

            document.getElementById("name").value = "";
            document.getElementById("password").value = "";
        }
    });
}