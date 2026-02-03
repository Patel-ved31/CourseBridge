const data = {
  overview: {
    title: "Platform Overview",
    content: `
      <div class="card">
        <h3>What is CourseBridge?</h3>
        <p>
          CourseBridge is a centralized learning platform that connects
          <b>course creators</b> and <b>learners</b> in one powerful ecosystem.
        </p>
      </div>

      <div class="card">
        <h3>What Problem It Solves</h3>
        <ul>
          <li>Scattered learning resources across platforms</li>
          <li>No unified bookmark & progress tracking</li>
          <li>Limited creator visibility</li>
        </ul>
      </div>
    `
  },

  vision: {
    title: "Our Vision",
    content: `
      <div class="card">
        <h3>Vision</h3>
        <p>
          To become a single destination where learning is simple,
          structured, and creator-friendly.
        </p>
      </div>
    `
  },

  features: {
    title: "Why CourseBridge Exists",
    content: `
      <div class="card">
        <ul>
          <li>Centralized learning discovery</li>
          <li>Free + paid courses together</li>
          <li>Bookmark & review system</li>
          <li>Creator-focused visibility</li>
        </ul>
      </div>
    `
  },

  philosophy: {
    title: "Core Philosophy",
    content: `
      <div class="card">
        <h3>Our Belief</h3>
        <p>
          Learn freely. Create independently. Grow together.
        </p>
      </div>
    `
  },

  team: {
  title: "Meet the Team",
  content: `
    <div class="team-column">

      <div class="team-row-card">
        <div class="team-photo">
          <img src="/static/css/MyProfile.jpeg" alt="Team member">
        </div>
        <div class="team-details">
          <h3>Patel Ved Pankajbhai</h3>
          <p class="role">Team Leader</p>
          <p class="bio">
              A passionate full-stack developer focused on building scalable web platforms with clean architecture, Strong Backend , and real-world problem solving at the core.
          </p>
        </div>
      </div>

      <div class="team-row-card">
        <div class="team-photo">
          <img src="/static/css/jeelProfile.jpeg"  alt="Team member">
        </div>
        <div class="team-details">
          <h3>Finaviya Jeelkumar Janakbhai</h3>
          <p class="role">UI handeler</p>
          <p class="bio">
           A passionate UI engineer focused on building modern and scalable web interfaces with clean design systems, responsive layouts, and user-centric experience at the core.
          </p>
        </div>
      </div>

      <div class="team-row-card">
        <div class="team-photo">
          <img src="/static/css/rutviProfile.jpeg" alt="Team member">
        </div>
        <div class="team-details">
          <h3>Rutvi Vasoya</h3>
          <p class="role">Database handeler</p>
          <p class="bio">
            A passionate database management specialist focused on maintaining secure, optimized, and reliable data systems with efficiency and scalability at the core.
          </p>
        </div>
      </div>

    </div>
  `
},



  future: {
    title: "Future Plans",
    content: `
      <div class="card">
        <ul>
          <li>Advanced creator dashboards</li>
          <li>Learning progress analytics</li>
          <li>Community & discussions</li>
          <li>Mobile-first experience</li>
        </ul>
      </div>
    `
  }
};

const titleEl = document.getElementById("page-title");
const contentEl = document.getElementById("page-content");
const buttons = document.querySelectorAll(".menu-item");

function loadSection(key) {
  titleEl.innerText = data[key].title;
  contentEl.innerHTML = data[key].content;

  buttons.forEach(btn => btn.classList.remove("active"));
  document.querySelector(`[data-key="${key}"]`).classList.add("active");
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    loadSection(btn.dataset.key);
  });
});

// default
loadSection("overview");
