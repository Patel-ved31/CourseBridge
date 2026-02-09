function otp(input, e) {
  if (input.value.length === 1) {
    input.value = "";
    // return;
  }

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    return;
  }

  setTimeout(() => {
    if (input.value.length === 1) {
      const next = input.nextElementSibling;
      if (next) next.focus();
    }
  }, 0);
}

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
  resendBtn.style.backgroundColor = "transparent";
  resendBtn.style.color = "#a855f7";

  timer = setInterval(() => {
    timeLeft--;
    timerText.innerText = `Resend OTP in ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      timerText.innerText = "You can resend OTP now";
      resendBtn.disabled = false;
      resendBtn.style.backgroundColor = "#a855f7";
      resendBtn.style.color = "#000";
    }
  }, 1000);
}

/* ---------------- SEND OTP ---------------- */
function sendOTP() {
  let x = document.querySelector(".send-otp-btn");
  x.innerText = "Sending.....";

  const email = document.getElementById("floatingEmail").value;

  if (!email || !email.includes("@")) {
    document.querySelector(".Error").innerText = "Enter valid email";
    x.innerText = "Send OTP";
    return;
  }

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
        x.innerText = "Send OTP";
      }
    });
}

/* ---------------- VERIFY OTP ---------------- */
function verifyOTP() {
  const otp =
    document.getElementById("one").value +
    document.getElementById("two").value +
    document.getElementById("three").value +
    document.getElementById("four").value +
    document.getElementById("five").value +
    document.getElementById("six").value;

  if (otp.length !== 6) {
    alert("Please enter complete OTP");
    return;
  }

  fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  })
    .then((res) => res.json())
    .then((data) => {
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
  const roleInput = document.querySelector(
    'input[name="radioDefault"]:checked',
  );
  const profile = document.getElementById("thumbnail").files[0];

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

  if (!profile) {
    document.querySelector(".ProfileError").innerText =
      "please upload valid Profile Picture";
    return;
  }

  const formData = new FormData();
  formData.append("username", name);
  formData.append("password", password);
  formData.append("email", email);
  formData.append("role", roleInput.value);
  formData.append("profile", profile);

  fetch("/register", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message) {

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

        window.location.href = `/Home`;
      }
    });
}

let againEmail = document.querySelector(".back")

againEmail.addEventListener("click", () => {

  document.querySelector(".send-otp-btn").innerText = "Send OTP";

  document.querySelector(".email-varify").style.display = "block";
  document.querySelector(".otp-box").style.display = "none";
});
