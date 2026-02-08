let totalAcc = localStorage.getItem("totalAcc");

if (!totalAcc){
    totalAcc = 0;
}else{
    totalAcc = parseInt(totalAcc);
}


let allProfile = document.querySelector(".profiles");

for(let i = 1; i <= totalAcc; i++){

    let name = localStorage.getItem(`name${i}`);
    let profile_pic = localStorage.getItem(`profile_pic${i}`);

    allProfile.innerHTML += `
    <div class="profile-card acc-card" data-value="${i}">
            <div class="avatar">
                  <img src="/static/uploads/profilePIC/${profile_pic}" width="110" height="110" alt="..">
            </div>
            <div class="name"> ${name} </div>
        </div>
    `;
}

allProfile.innerHTML += `
    <div class="profile-card">
        <a href="login" style="text-decoration: none;" class="avatar add">+</a>
        <div class="name">Add</div>
    </div>
`


let profile = document.querySelectorAll(".acc-card");

profile.forEach(profile => {
    profile.addEventListener("click", () => {
        let x = parseInt(profile.dataset.value);

        let name = localStorage.getItem(`name${x}`);
        let profile_pic = localStorage.getItem(`profile_pic${x}`);
        let role = localStorage.getItem(`role${x}`);
        let id = localStorage.getItem(`id${x}`);

        fetch("/set-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            username: name,
            role: role,
            profile_pic: profile_pic,
            id: id
        })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("currAcc" , x)
                window.location.href = "/Home";
            }else{
            }
        });
        });
});
        
