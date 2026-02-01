const termsContent = {
  overview: {
    title: "Terms & Conditions Overview",
    body: `
      <p>
        Welcome to <strong>CourseBridge</strong>. By accessing or using our
        platform, you agree to comply with and be bound by these Terms and
        Conditions.
      </p>

      <p>
        CourseBridge connects learners and creators through curated educational
        content. Please read these terms carefully before using the platform.
      </p>
    `,
    subtopics: {}
  },

  eligibility: {
    title: "Eligibility",
    body: `
      <ul>
        <li>You must be at least 13 years old to use CourseBridge</li>
        <li>Users must provide accurate registration details</li>
        <li>Creators must have rights to publish course content</li>
      </ul>
    `,
    subtopics: {}
  },

  accounts: {
    title: "User Accounts",
    body: `
      <p>
        You are responsible for maintaining the confidentiality of your
        account credentials and for all activities under your account.
      </p>

      <ul>
        <li>One account per user</li>
        <li>No impersonation of others</li>
        <li>Account misuse may result in suspension</li>
      </ul>
    `,
    subtopics: {}
  },

  courses: {
    title: "Courses & Content",
    body: `
      <p>
        Course content is provided by independent creators. CourseBridge does
        not guarantee the accuracy or completeness of course materials.
      </p>

      <ul>
        <li>Free and paid courses are clearly marked</li>
        <li>Paid course pricing is set by creators</li>
        <li>Unauthorized redistribution is prohibited</li>
      </ul>
    `,
    subtopics: {}
  },

  reviews: {
    title: "Reviews & Ratings",
    body: `
      <section>
        <h2>Review Rules</h2>
        <ul>
          <li>Only logged-in users can submit reviews</li>
          <li>Each user may review a course only once</li>
          <li>Reviews must be respectful and relevant</li>
        </ul>
      </section>

      <section>
        <h2>Rating System</h2>
        <p>
          Star ratings range from 1 to 5 and are stored as integers.
          Abuse of the review system may result in restrictions.
        </p>
      </section>
    `,
    subtopics: {}
  },

  bookmarks: {
    title: "Bookmarks",
    body: `
      <ul>
        <li>Users may bookmark courses for later reference</li>
        <li>Bookmarks are private to each user</li>
        <li>Bookmarks may be removed at any time</li>
      </ul>
    `,
    subtopics: {}
  },

  prohibited: {
    title: "Prohibited Activities",
    body: `
      <ul>
        <li>Posting illegal or copyrighted content</li>
        <li>Attempting to hack or disrupt services</li>
        <li>Using automated bots or scrapers</li>
        <li>Harassment or abusive behavior</li>
      </ul>
    `,
    subtopics: {}
  },

  termination: {
    title: "Account Termination",
    body: `
      <p>
        CourseBridge reserves the right to suspend or terminate accounts that
        violate these terms without prior notice.
      </p>
    `,
    subtopics: {}
  },

  liability: {
    title: "Limitation of Liability",
    body: `
      <p>
        CourseBridge is not liable for any indirect, incidental, or consequential
        damages resulting from the use of the platform.
      </p>
    `,
    subtopics: {}
  },

  updates: {
    title: "Updates to Terms",
    body: `
      <p>
        These terms may be updated periodically. Continued use of the platform
        constitutes acceptance of the updated terms.
      </p>
    `,
    subtopics: {}
  }
};

/* ---------------- LOAD CONTENT ---------------- */

const menuItems = document.querySelectorAll("#termsMenu li");
const contentBox = document.getElementById("contentBox");

function loadContent(key) {
  const data = termsContent[key];
  if (!data) return;

  contentBox.innerHTML = `
    <h1>${data.title}</h1>
    ${data.body}
  `;
}

/* ---------------- MENU INTERACTION ---------------- */

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const key = item.dataset.key;
    loadContent(key);
  });
});

/* ---------------- INITIAL LOAD ---------------- */
loadContent("overview");
