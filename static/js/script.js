let name = localStorage.getItem("username");

if(name){
    let role = localStorage.getItem("role");
    let profile_pic = localStorage.getItem("profile_pic");
    let id = localStorage.getItem("id");

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
            window.location.href = "/Home";
        }else{
        }
    });

}

var typed = new Typed(".auto-type", {
  strings: ["Learn", "Create"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true,
  showCursor: true,
  cursorChar: "|",
});
