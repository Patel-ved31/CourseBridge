document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".tab-content");
  const pageTitle = document.getElementById("page-title");
  const searchInput = document.getElementById("adminSearch");

  let adminData = { reports: [], courses: [], users: [] };

  // --- ANIMATION STYLES ---
  const style = document.createElement("style");
  style.textContent = `
    .details-cell {
      padding: 0 !important;
      border: 0;
    }
    .details-wrapper {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease-out;
    }
    .details-wrapper.open {
      max-height: 500px; /* Adjust if content is taller */
    }
    .details-content {
      padding: 20px;
    }
  `;
  document.head.appendChild(style);

  // Tab Switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.getElementById(`${target}-section`).classList.add("active");
      pageTitle.innerText = target.charAt(0).toUpperCase() + target.slice(1);
    });
  });

  // Fetch Data
  function fetchData() {
    fetch("/admin/data")
      .then((res) => res.json())
      .then((data) => {
        adminData = data;
        renderReports(data.reports);
        renderCourses(data.courses);
        renderUsers(data.users);
      });
  }

  function renderReports(reports) {
    const tbody = document.getElementById("reports-table-body");
    tbody.innerHTML = "";
    reports.forEach((r) => {
      
      const courseInfo = adminData.courses.find((c) => c.id === r.course_id);
      const creatorName = courseInfo ? courseInfo.creator : "N/A";

      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML = `
                <td><strong>${r.course_title}</strong></td>
                <td>${r.reporter}</td>
                <td>${r.categories}</td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.description}</td>
            `;

      const detailTr = document.createElement("tr");
      detailTr.innerHTML = `
        <td colspan="4" class="details-cell">
            <div class="details-wrapper">
                <div class="details-content" style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
                        <p style="min-width: 200px;"><strong>Creator:</strong> ${creatorName} (ID: ${r.creator_id})</p>
                        <p style="min-width: 200px;"><strong>Course Link:</strong> <a href="${r.link}" target="_blank" style="color: #3b82f6;">View Course</a></p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Full Description:</strong>
    
                        <p style="overflow-y: auto; max-height: 300px; width: 100%; background: #fff; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 5px; white-space: pre-wrap; word-wrap: break-word; ">${r.description}</p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="action-btn btn-danger" onclick="handleAction('delete_course', ${r.id}, ${r.course_id}, ${r.creator_id})">Del Course</button>
                        <button class="action-btn btn-warn" onclick="handleAction('delete_creator', ${r.id}, ${r.course_id}, ${r.creator_id})">Del Creator</button>
                        <button class="action-btn btn-success" onclick="handleAction('ignore', ${r.id}, ${r.course_id}, ${r.creator_id})">Ignore</button>
                    </div>
                </div>
            </div>
        </td>
      `;

      tr.addEventListener("click", () => {
        const wrapper = detailTr.querySelector(".details-wrapper");
        wrapper.classList.toggle("open");
        tr.style.backgroundColor = wrapper.classList.contains("open")
          ? "#f3f4f6"
          : "";
      });

      tbody.appendChild(tr);
      tbody.appendChild(detailTr);
    });
  }

  function renderCourses(courses) {
    const tbody = document.getElementById("courses-table-body");
    tbody.innerHTML = "";
    courses.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.title}</td>
                <td>${c.creator}</td>
                <td><button class="action-btn btn-danger" onclick="handleCourseDelete(${c.id})">Delete</button></td>
            `;
      tbody.appendChild(tr);
    });
  }

  function renderUsers(users) {
    const tbody = document.getElementById("users-table-body");
    tbody.innerHTML = "";
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td><button class="action-btn btn-danger" onclick="handleUserDelete(${u.id})">Delete</button></td>
            `;
      tbody.appendChild(tr);
    });
  }

  // Search Logic
  searchInput.addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    const activeTab = document.querySelector(".menu-item.active").dataset.tab;

    if (activeTab === "reports") {
      const filtered = adminData.reports.filter((r) =>
        r.course_title.toLowerCase().includes(term),
      );
      renderReports(filtered);
    } else if (activeTab === "courses") {
      const filtered = adminData.courses.filter((c) =>
        c.title.toLowerCase().includes(term),
      );
      renderCourses(filtered);
    } else if (activeTab === "users") {
      const filtered = adminData.users.filter(
        (u) =>
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
      renderUsers(filtered);
    }
  });

  // Global Action Handler
  window.handleAction = (action, reportId, courseId, creatorId) => {
    if (!confirm("Are you sure you want to perform this action?")) return;

    fetch("/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: action,
        report_id: reportId,
        course_id: courseId,
        creator_id: creatorId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        fetchData(); // Refresh
      });
  };

  // Global Action Handler for Course Deletion
  window.handleCourseDelete = (courseId) => {
    if (
      !confirm(
        `Are you sure you want to delete this course? This will also delete all its bookmarks, reviews, and reports.`,
      )
    )
      return;

    fetch("/admin/delete_course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        fetchData(); // Refresh
      })
      .catch((err) => console.error(err));
  };

  // Global Action Handler for User Deletion
  window.handleUserDelete = (userId) => {
    if (
      !confirm(
        `Are you sure you want to delete this user ? This will delete the user, all their courses, and all related data.`,
      )
    )
      return;

    fetch("/admin/delete_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        
        fetchData(); // Refresh
      })
      .catch((err) => console.error(err));
  };

  fetchData();
});
