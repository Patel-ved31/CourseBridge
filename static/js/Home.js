// get search input box
const searchInput = document.getElementById("search");

// get suggestions div
const suggestionsBox = document.getElementById("suggestions");

// run this when user types anything
searchInput.addEventListener("keyup", (e) => {
  // get typed value
  let value = searchInput.value;

  // if input is empty
  if (value.length === 0) {
    // clear suggestions
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.border = "0";
    return;
  }

  if(e.key === "Enter" ){
    window.location.href =
      `/courseList?course=${encodeURIComponent(value)}`;
  }

  // send typed text to flask
  fetch(`/search?q=${value}`)
    // convert flask response to json
    .then((response) => response.json())

    // data = list received from flask
    .then((data) => {
      // clear old results
      suggestionsBox.innerHTML = "";


      // loop through each result
      data.forEach((item) => {
        // create new div
        let div = document.createElement("div");

        // put text inside div
        div.textContent = item;

        // when user clicks suggestion
        div.onclick = () => {
          searchInput.value = item;
          suggestionsBox.innerHTML = "";
        };

        // add div to suggestions box
        suggestionsBox.appendChild(div);
      });
    });
});


document.querySelectorAll(".box").forEach(box => {
  box.addEventListener("click", () => {
    const category = box.dataset.value;
    if (category == "other") {
      window.location.href = `/all_courses`;
      return;
    }
    window.location.href = `/categoryList?category=${encodeURIComponent(category)}`;
  });
});

function profile(){
  let name = document.querySelector(".user-name").dataset.value;
  let role = document.querySelector(".user-role").dataset.value;

  if(role === "Creator"){
    window.location.href = `/creator_profile`;
  }else{
    window.location.href = `/learner_profile`;
  }
}
// console.log(document.querySelectorAll("#suggestions > div"))
document.getElementById("suggestions").addEventListener("click", function (e) {
  if (e.target.tagName === "DIV") {
    const course = e.target.innerText.trim();

    window.location.href =
      `/courseList?course=${encodeURIComponent(course)}`;
  }
});

function goToFullPage(x){
    window.location.href = `/creatorCourse?creator=${encodeURIComponent(parseInt(x.dataset.value))}`;
}

function logout(){
  let currAcc = (localStorage.getItem("currAcc"));
  currAcc = parseInt(currAcc)

  let totalAcc = localStorage.getItem("totalAcc");

  totalAcc = parseInt(totalAcc);

  localStorage.removeItem("currAcc");

  for (let i = currAcc; i < totalAcc; i++) {
    name = localStorage.getItem(`name${i + 1}`);
    profile_pic = localStorage.getItem(`profile_pic${i + 1}`);
    role = localStorage.getItem(`role${i + 1}`);
    id = localStorage.getItem(`id${i + 1}`);

    localStorage.setItem(`name${i}`, name);
    localStorage.setItem(`profile_pic${i}`, profile_pic);
    localStorage.setItem(`role${i}`, role);
    localStorage.setItem(`id${i}`, id);

  }

  localStorage.removeItem(`id${totalAcc}`);
  localStorage.removeItem(`name${totalAcc}`);
  localStorage.removeItem(`profile_pic${totalAcc}`);
  localStorage.removeItem(`role${totalAcc}`);

  totalAcc = totalAcc - 1;
  localStorage.setItem("totalAcc", totalAcc);

  window.location.href = `/`;
}

function removeSugg(){
  suggestionsBox.innerHTML = "";
  suggestionsBox.style.border = "0";
}

// // ---------- NOTIFICATIONS (Navbar) ----------
// document.addEventListener("DOMContentLoaded", () => {
//     const nav = document.querySelector("nav");
//     if (nav) {
//         const notifBtn = document.createElement("div");
//         notifBtn.className = "notif-wrapper";
//         notifBtn.innerHTML = `
//             <i class="bi bi-bell-fill notif-icon"></i>
//             <span class="notif-badge" style="display:none"></span>
//             <div class="notif-dropdown">
//                 <div class="notif-header">Notifications <span id="markRead">Mark all read</span></div>
//                 <div class="notif-list"></div>
//             </div>
//         `;
//         // Insert before logout
//         const logout = nav.querySelector(".logout");
//         if (logout) nav.insertBefore(notifBtn, logout);
//         else nav.appendChild(notifBtn);

//         const badge = notifBtn.querySelector(".notif-badge");
//         const list = notifBtn.querySelector(".notif-list");
//         const dropdown = notifBtn.querySelector(".notif-dropdown");
//         const markReadBtn = notifBtn.querySelector("#markRead");

//         // Toggle Dropdown
//         notifBtn.querySelector(".notif-icon").addEventListener("click", (e) => {
//             e.stopPropagation();
//             dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
//         });

//         // Fetch Notifications
//         function fetchNotifs() {
//             fetch("/notifications")
//             .then(res => res.json())
//             .then(data => {
//                 list.innerHTML = "";
//                 const unreadCount = data.filter(n => !n.is_read).length;
                
//                 if (unreadCount > 0) {
//                     badge.style.display = "block";
//                     badge.innerText = unreadCount;
//                 } else {
//                     badge.style.display = "none";
//                 }

//                 if (data.length === 0) {
//                     list.innerHTML = "<div class='no-notif'>No notifications</div>";
//                 } else {
//                     data.forEach(n => {
//                         const item = document.createElement("div");
//                         item.className = `notif-item ${n.is_read ? 'read' : 'unread'}`;
//                         item.innerText = n.message;
//                         list.appendChild(item);
//                     });
//                 }
//             });
//         }

//         // Mark Read
//         markReadBtn.addEventListener("click", () => {
//             fetch("/mark-read", { method: "POST" })
//             .then(() => {
//                 fetchNotifs();
//             });
//         });

//         // Initial Fetch
//         fetchNotifs();
//         // Poll every 30 seconds
//         setInterval(fetchNotifs, 30000);

//         // Close dropdown on click outside
//         document.addEventListener("click", () => {
//             dropdown.style.display = "none";
//         });
//         dropdown.addEventListener("click", (e) => e.stopPropagation());
//     }
// });
