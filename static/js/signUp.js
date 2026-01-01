// let timer = null;
// let timeLeft = 30;

// function startTimer() {
//   if (timer) clearInterval(timer);
//   timeLeft = 30;

//   const timerText = document.getElementById("timerText");
//   const resendBtn = document.getElementById("resendBtn");

//   resendBtn.disabled = true;
//   timerText.innerText = `Resend OTP in ${timeLeft}s`;

//   timer = setInterval(() => {
//     timeLeft--;
//     timerText.innerText = `Resend OTP in ${timeLeft}s`;

//     if (timeLeft <= 0) {
//       clearInterval(timer);
//       timer = null;
//       timerText.innerText = "You can resend OTP now";
//       resendBtn.disabled = false;
//     }
//   }, 1000);
// }

// function sendOTP() {
//   const email = document.getElementById("floatingEmail").value;
//   fetch("/check-email", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data.success) {
//         fetch("/send-otp", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email }),
//         })
//           .then((res) => res.json())
//           .then(() => {
//             document.querySelector(".email-varify").style.display = "none";
//             document.querySelector(".otp-box").style.display = "block";
//             startTimer();
//           });
//       } else {
//         document.querySelector(".Error").innerText = "this email already exist";
//       }
//     });
// }

// function verifyOTP() {
//   const otp = document.getElementById("floating-opt-varify").value;

//   fetch("/verify-otp", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ otp }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data.message === "true") {
//         document.getElementById("hiddenEmail").value =
//           document.getElementById("floatingEmail").value;

//         document.querySelector(".otp-box").style.display = "none";
//         document.querySelector(".detail-form").style.display = "block";
//       } else {
//         alert("Invalid OTP");
//       }
//     });
// }

// function resendOTP() {
//   sendOTP();
// }

// function isValidUsername(name) {
//   for (let i = 0; i < name.length; i++) {
//     let ch = name[i];

//     if (
// //      !(
//         (ch >= "A" && ch <= "Z") ||
//         (ch >= "a" && ch <= "z") ||
//         (ch >= "0" && ch <= "9")
//       )
//     ) {
//       return false;
//     }
//   }
//   return true;
// }

// function submitForm(event) {
//   event.preventDefault(); // stop normal form submit

//   let nameInput = document.getElementById("floatingUsername");
//   let passInput = document.getElementById("floatingPassword");
//   let emailInput = document.getElementById("hiddenEmail");
//   let roleInput = document.querySelector('input[name="radioDefault"]:checked');

//   let name = nameInput.value.trim();
//   let password = passInput.value.trim();
//   let email = emailInput.value;
//   let role = roleInput.value;

//   // clear old errors
//   document.querySelector(".UserNameError").innerText = "";
//   document.querySelector(".PasswordError").innerText = "";

//   // username validation
//   if (!isValidUsername(name)) {
//     document.querySelector(".UserNameError").innerText =
//       "Username must contain only A-Z, a-z, 0-9";
//     return;
//   }

//   // password validation
//   if (password.length < 4) {
//     document.querySelector(".PasswordError").innerText =
//       "Password must be at least 4 characters";
//     return;
//   }

//   // ✅ SEND DATA TO FLASK
//   fetch("/register", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       username: name,
//       password: password,
//       email: email,
//       role: role,
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       alert(data.message);
//     });
// }

let timer = null;
let timeLeft = 30;

/* ---------------- TIMER ---------------- */
function startTimer() {
  if (timer) clearInterval(timer);
  timeLeft = 30;

  const timerText = document.getElementById("timerText");
  const resendBtn = document.getElementById("resendBtn");

  resendBtn.disabled = true;
  timerText.innerText = `Resend OTP in ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerText.innerText = `Resend OTP in ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      timerText.innerText = "You can resend OTP now";
      resendBtn.disabled = false;
    }
  }, 1000);
}

/* ---------------- SEND OTP ---------------- */
function sendOTP() {
  // const email = document.getElementById("floatingEmail").value.trim();
  // const errorBox = document.querySelector(".Error");

  // errorBox.innerText = "";

  // if (email.length === 0) {
  //   errorBox.innerText = "Please enter your email";
  //   return;
  // }

  // fetch("/check-email", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email })
  // })
  // .then(res => res.json())
  // .then(data => {
  //   if (!data.success) {
  //     errorBox.innerText = "This email already exists";
  //     return;
  //   }

  //   return fetch("/send-otp", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email })
  //   });
  // })
  // .then(res => {
  //   if (!res) return;
  //   return res.json();
  // })
  // .then(() => {
  //   document.querySelector(".email-varify").style.display = "none";
  //   document.querySelector(".otp-box").style.display = "block";
  //   startTimer();
  // });
  const email = document.getElementById("floatingEmail").value;
  fetch("/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        fetch("/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
          .then((res) => res.json())
          .then(() => {
            document.querySelector(".email-varify").style.display = "none";
            document.querySelector(".otp-box").style.display = "block";
            startTimer();
          });
      } else {
        document.querySelector(".Error").innerText = "this email already exist";
      }
    });
}

/* ---------------- VERIFY OTP ---------------- */
function verifyOTP() {
  const otp = document.getElementById("floating-opt-varify").value.trim();

  fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message === "true") {
      document.getElementById("hiddenEmail").value =
        document.getElementById("floatingEmail").value;

      document.querySelector(".otp-box").style.display = "none";
      document.querySelector(".detail-form").style.display = "block";
    } else {
      alert("Invalid OTP");
    }
  });
}

/* ---------------- RESEND OTP ---------------- */
function resendOTP() {
  sendOTP();
}

/* ---------------- USERNAME CHECK ---------------- */
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

/* ---------------- FINAL SUBMIT ---------------- */
function submitForm(event) {
  event.preventDefault();

  const name = document.getElementById("floatingUsername").value.trim();
  const password = document.getElementById("floatingPassword").value.trim();
  const email = document.getElementById("hiddenEmail").value;
  const roleInput = document.querySelector('input[name="radioDefault"]:checked');

  document.querySelector(".UserNameError").innerText = "";
  document.querySelector(".PasswordError").innerText = "";
  document.querySelector(".RoleError").innerText = "";

  if (name.length === 0) {
    document.querySelector(".UserNameError").innerText =
      "Username cannot be empty";
    return;
  }

  if (!isValidUsername(name)) {
    document.querySelector(".UserNameError").innerText =
      "Only A-Z, a-z and 0-9 allowed";
    return;
  }

  if (password.length < 4) {
    document.querySelector(".PasswordError").innerText =
      "Password must be at least 4 characters";
    return;
  }

  if (!roleInput) {
    document.querySelector(".RoleError").innerText =
      "Please select Learner or Creator";
    return;
  }

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: name,
      password: password,
      email: email,
      role: roleInput.value
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    // optional redirect
    // window.location.href = "/login";
  });
}
