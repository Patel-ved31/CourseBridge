let timer = null;
let timeLeft = 30;

function startTimer() {
  const timerText = document.getElementById("timerText");
  const resendBtn = document.getElementById("resendBtn");

  if (timer) clearInterval(timer);
  timeLeft = 30;

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

function sendOTP() {
  const email = document.getElementById("floatingEmail").value;

  fetch("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data.message);

    document.querySelector(".email-varify").style.display = "none";
    document.querySelector(".otp-box").style.display = "block";

    startTimer();
  });
}

/* VERIFY OTP */
function verifyOTP() {
  const otp = document.getElementById("floating-opt-varify").value;

  fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp: otp })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message === "true") {
      document.querySelector(".otp-box").style.display = "none";
      document.querySelector(".detail-form").style.display = "block";
    } else {
      alert("Invalid OTP");
    }
  });
}

function resendOTP() {
  sendOTP();
}
