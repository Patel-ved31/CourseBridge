function sendOTP() {
  fetch("/send-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: document.getElementById("floatingEmail").value
    })
  })
  .then(res => res.json())
  .then(data => console.log(data.message));

  emailBox = document.querySelector(".email-varify");
  emailBox.style.display = "none";

  otpdigitBox = document.querySelector(".otp-box");
  otpdigitBox.style.display = "block";

}

function verifyOTP() {
  fetch("/verify-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      otp: document.getElementById("floating-opt-varify").value
    })
  })
  .then(res => res.json())
  .then(data => console.log(data.message));

  otpdigitBox = document.querySelector(".otp-box");
  otpdigitBox.style.display = "none";

  formBox = document.querySelector(".detail-form");
  formBox.style.display = "block";
}