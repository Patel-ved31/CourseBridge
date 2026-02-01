const docs = {
  overview: {
    title: "Platform Overview",
    body: `
      <section>
        <h2>What is CourseBridge?</h2>
        <p>
          CourseBridge is a centralized learning platform that connects
          <b>course creators</b> and <b>learners</b> in one ecosystem.
        </p>
      </section>

      <section>
        <h2>Why CourseBridge Exists</h2>
        <ul>
          <li>Scattered learning resources across platforms</li>
          <li>No single place to track bookmarks & progress</li>
          <li>Lack of creator visibility</li>
        </ul>
      </section>

      <section>
        <h2>Core Philosophy</h2>
        <p>
          Learn freely. Create independently. Grow together.
        </p>
      </section>
    `,
    subtopics: {},
  },

  features: {
    title: "Core Features",
    body: `
      <section>
        <h2>Course Discovery</h2>
        <p>
          Users can search courses using keywords, categories,
          or creator names with live suggestions.
        </p>
      </section>

      <section>
        <h2>Bookmark System</h2>
        <p>
          Learners can bookmark courses for later access.
          Bookmarks are stored per-user securely.
        </p>
      </section>

      <section>
        <h2>Review & Rating</h2>
        <ul>
          <li>One review per user per course</li>
          <li>5-star rating system</li>
          <li>Public visibility</li>
        </ul>
      </section>
    `,
    subtopics: {
      search: "Live search with keyword matching and instant navigation.",
      bookmark: "Toggle-based bookmarking system using PostgreSQL.",
      review: "Rating + comment system with duplicate prevention.",
    },
  },

  roles: {
    title: "User Roles & Permissions",
    body: `
      <section>
        <h2>Learner</h2>
        <ul>
          <li>Browse courses</li>
          <li>Bookmark courses</li>
          <li>Submit reviews</li>
        </ul>
      </section>

      <section>
        <h2>Creator</h2>
        <ul>
          <li>Create and manage courses</li>
          <li>Upload thumbnails</li>
          <li>Track published content</li>
        </ul>
      </section>

      <section>
        <h2>Role Enforcement</h2>
        <p>
          Roles are enforced at backend level using session validation.
        </p>
      </section>
    `,
    subtopics: {},
  },

  courses: {
    title: "Course Structure",
    body: `
      <section>
        <h2>Course Fields</h2>
        <ul>
          <li>Title</li>
          <li>Description</li>
          <li>Category</li>
          <li>Price (0 = Free)</li>
          <li>Thumbnail (PNG)</li>
          <li>External Course Link</li>
        </ul>
      </section>

      <section>
        <h2>Thumbnail Rules</h2>
        <p>
          Thumbnails are stored in the filesystem and referenced
          using course_id.png format.
        </p>
      </section>

      <section>
        <h2>Example</h2>
        <pre class="code">
course_id = 12
thumbnail = 12.png
        </pre>
      </section>
    `,
    subtopics: {},
  },

  reviews: {
    title: "Reviews & Ratings",
    body: `
      <section>
        <h2>Review Rules</h2>
        <ul>
          <li>Only logged-in users can review</li>
          <li>Only one review per user per course</li>
          <li>Users can view all public reviews</li>
        </ul>
      </section>

      <section>
        <h2>Rating System</h2>
        <p>
          Star ratings range from 1 to 5 and are stored as integers.
        </p>
      </section>
    `,
    subtopics: {},
  },

  bookmarks: {
    title: "Bookmarks",
    body: `
    <section>
      <h2>What is Bookmark?</h2>
      <p>
        The bookmark feature allows users to save courses for quick access later.
        Bookmarked courses appear in the user's profile under the bookmarks section.
      </p>
    </section>

    <section>
      <h2>Bookmark Rules</h2>
      <ul>
        <li>Only logged-in users can bookmark courses</li>
        <li>Users can remove a bookmark anytime</li>
      </ul>
    </section>

    <section>
      <h2>How It Works</h2>
      <ul>
        <li>User clicks the bookmark icon on a course</li>
        <li>The course is saved in the bookmarks table</li>
        <li>UI updates instantly without page reload</li>
        <li>Bookmarked courses are visible in profile</li>
      </ul>
    </section>

    <section>
      <h2>Visual Indicator</h2>
      <p>
        An empty bookmark icon indicates the course is not saved.
        A filled bookmark icon shows the course is already bookmarked.
      </p>
    </section>
  `,
  },

  security: {
    title: "Security & Authentication",
    body: `
      <section>
        <h2>Authentication</h2>
        <p>
          Login sessions are handled securely using Flask sessions.
        </p>
      </section>

      <section>
        <h2>OTP Verification</h2>
        <p>
          New users must verify email using OTP before registration.
        </p>
      </section>

      <section>
        <h2>Protected Routes</h2>
        <ul>
          <li>Creator dashboard</li>
          <li>Bookmarks</li>
          <li>Review submission</li>
        </ul>
      </section>
    `,
    subtopics: {},
  },

  deployment: {
    title: "Deployment Guide",
    body: `
      <section>
        <h2>Supported Platforms</h2>
        <ul>
          <li>Render</li>
          <li>Railway</li>
          <li>Local VPS</li>
        </ul>
      </section>

      <section>
        <h2>Database</h2>
        <p>
          PostgreSQL is used with environment-based connection strings.
        </p>
      </section>

      <section>
        <h2>Auto Reload</h2>
        <p>
          Development uses Flask debug mode for hot reload.
        </p>
      </section>
    `,
    subtopics: {},
  },
};

menuItems = document.querySelectorAll(".menu li");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

function loadDoc(key) {
  const doc = docs[key];
  document.getElementById("doc-title").innerText = doc.title;
  document.getElementById("doc-body").innerHTML = doc.body;
}



/* ---------------- INITIAL LOAD ---------------- */
loadDoc("overview");
