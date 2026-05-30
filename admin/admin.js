/* =====================================================
   OGA DAVE CONCEPTS — admin.js
   Firebase Admin Dashboard Logic
   ===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ══════════════════════
   FIREBASE INIT
══════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyCqkF3S1laiCck3naywl6Jq9WoeWkouFCM",
  authDomain: "oga-dave-concepts.firebaseapp.com",
  projectId: "oga-dave-concepts",
  storageBucket: "oga-dave-concepts.firebasestorage.app",
  messagingSenderId: "277897709083",
  appId: "1:277897709083:web:46091bc6c047800c2b1abe"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ══════════════════════
   CLOUDINARY
══════════════════════ */
const CLOUD_NAME = "dnjwoniyl";
const PRESET     = "ogadave_media";

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Image upload failed");
  return data.secure_url;
}

/* ══════════════════════
   DOM REFS
══════════════════════ */
const authModal        = document.getElementById("authModal");
const dashboardWrap    = document.getElementById("dashboardWrap");
const loginBtn         = document.getElementById("loginBtn");
const loginEmail       = document.getElementById("loginEmail");
const loginPassword    = document.getElementById("loginPassword");
const loginError       = document.getElementById("loginError");
const logoutBtn        = document.getElementById("logoutBtn");

// Analytics
const totalBlogsEl    = document.getElementById("totalBlogs");
const totalAirdropsEl = document.getElementById("totalAirdrops");
const hotAirdropsEl   = document.getElementById("hotAirdrops");
const newAirdropsEl   = document.getElementById("newAirdrops");

// Blog form
const publishBtn      = document.getElementById("publishBtn");
const postTitle       = document.getElementById("postTitle");
const postDescription = document.getElementById("postDescription");
const postContent     = document.getElementById("postContent");
const postCategory    = document.getElementById("postCategory");
const postLink        = document.getElementById("postLink");
const postImage       = document.getElementById("postImage");
const uploadStatus    = document.getElementById("uploadStatus");

// Airdrop form
const publishAirdropBtn   = document.getElementById("publishAirdropBtn");
const airdropTitle        = document.getElementById("airdropTitle");
const airdropDescription  = document.getElementById("airdropDescription");
const airdropReward       = document.getElementById("airdropReward");
const airdropLink         = document.getElementById("airdropLink");
const airdropReferral     = document.getElementById("airdropReferral");
const airdropEnd          = document.getElementById("airdropEnd");
const airdropImage        = document.getElementById("airdropImage");
const isHot               = document.getElementById("isHot");
const isNew               = document.getElementById("isNew");
const isFeatured          = document.getElementById("isFeatured");

// Edit modal
const editModal       = document.getElementById("editModal");
const editModalTitle  = document.getElementById("editModalTitle");
const editTitle       = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editContent     = document.getElementById("editContent");
const editCategory    = document.getElementById("editCategory");
const editLink        = document.getElementById("editLink");
const editImage       = document.getElementById("editImage");
const editPreview     = document.getElementById("editPreview");
const editReward      = document.getElementById("editReward");
const editReferral    = document.getElementById("editReferral");
const editEndDate     = document.getElementById("editEndDate");
const editHot         = document.getElementById("editHot");
const editNew         = document.getElementById("editNew");
const editFeatured    = document.getElementById("editFeatured");
const saveEditBtn     = document.getElementById("saveEditBtn");

// Containers
const postsContainer    = document.getElementById("postsContainer");
const recentPostsList   = document.getElementById("recentPostsList");
const sidebarPostCount  = document.getElementById("sidebarPostCount");
const searchInput       = document.getElementById("searchInput");

/* ══════════════════════
   STATE
══════════════════════ */
let blogData      = [];
let airdropData   = [];
let unsubBlogs    = null;
let unsubAirdrops = null;
let currentId     = null;
let currentType   = null;

/* ══════════════════════
   HELPERS
══════════════════════ */
function safe(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function fmtDate(f) {
  if (!f) return "—";
  try {
    const d = f.toDate ? f.toDate() : new Date(f);
    return d.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "—"; }
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle("loading", loading);
}

function toast(icon, title, text = "") {
  return Swal.fire({
    icon, title, text,
    background: "#141414",
    color: "#F2EFE8",
    confirmButtonColor: "#C9A84C",
    iconColor: icon === "success" ? "#22c55e" : icon === "error" ? "#ef4444" : "#C9A84C",
    timer: icon === "success" ? 2500 : undefined,
    timerProgressBar: icon === "success"
  });
}

function confirm(title, text) {
  return Swal.fire({
    title, text, icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#C9A84C",
    confirmButtonText: "Yes, delete it",
    background: "#141414",
    color: "#F2EFE8"
  });
}

/* ══════════════════════
   AUTH
══════════════════════ */
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const pass  = loginPassword.value;

  if (!email || !pass) {
    loginError.textContent = "Please enter your email and password.";
    return;
  }

  loginBtn.textContent = "Signing in...";
  loginBtn.disabled    = true;
  loginError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    loginError.textContent = "Invalid credentials. Please try again.";
    loginBtn.innerHTML = '<i class="fas fa-lock"></i> Sign In to Dashboard';
    loginBtn.disabled  = false;
  }
});

// Enter key on login
[loginEmail, loginPassword].forEach(el => {
  el.addEventListener("keydown", e => { if (e.key === "Enter") loginBtn.click(); });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authModal.style.display  = "flex";
    dashboardWrap.classList.add("hidden");
    stopListeners();
    return;
  }

  // Verify role in Firestore
  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) { await signOut(auth); return; }

    const { role, name } = userSnap.data();
    if (!["super_admin", "editor"].includes(role)) { await signOut(auth); return; }

    // Show dashboard
    authModal.style.display = "none";
    dashboardWrap.classList.remove("hidden");

    // Set user info in sidebar
    document.getElementById("adminName").textContent  = name || user.email.split("@")[0];
    document.getElementById("adminRole").textContent  = role === "super_admin" ? "Super Admin" : "Editor";
    document.getElementById("greetName").textContent  = (name || user.email.split("@")[0]).split(" ")[0];

    startListeners();
    loadAnalytics();

  } catch (err) {
    console.error("Auth check error:", err);
    await signOut(auth);
  }
});

logoutBtn.addEventListener("click", async () => {
  const res = await Swal.fire({
    title: "Sign out?", icon: "question",
    showCancelButton: true, confirmButtonText: "Yes, sign out",
    confirmButtonColor: "#C9A84C", background: "#141414", color: "#F2EFE8"
  });
  if (res.isConfirmed) await signOut(auth);
});

function stopListeners() {
  if (unsubBlogs)    { unsubBlogs();    unsubBlogs    = null; }
  if (unsubAirdrops) { unsubAirdrops(); unsubAirdrops = null; }
}

/* ══════════════════════
   ANALYTICS
══════════════════════ */
async function loadAnalytics() {
  try {
    const [blogSnap, airdropSnap] = await Promise.all([
      getDocs(collection(db, "blogPosts")),
      getDocs(collection(db, "airdrops"))
    ]);

    let hot = 0, fresh = 0;
    airdropSnap.forEach(d => {
      if (d.data().isHot) hot++;
      if (d.data().isNew) fresh++;
    });

    totalBlogsEl.textContent    = blogSnap.size;
    totalAirdropsEl.textContent = airdropSnap.size;
    hotAirdropsEl.textContent   = hot;
    newAirdropsEl.textContent   = fresh;
  } catch (err) {
    console.error("Analytics error:", err);
  }
}

/* ══════════════════════
   REAL-TIME LISTENERS
══════════════════════ */
function startListeners() {
  // Blogs
  unsubBlogs = onSnapshot(collection(db, "blogPosts"), snap => {
    blogData = snap.docs.map(d => ({ id: d.id, ...d.data(), type: "blog" }));
    scheduleRender();
  });

  // Airdrops
  unsubAirdrops = onSnapshot(collection(db, "airdrops"), snap => {
    airdropData = snap.docs.map(d => ({ id: d.id, ...d.data(), type: "airdrop" }));
    scheduleRender();
  });
}

let renderTimer;
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderAllPosts, 120);
}

/* ══════════════════════
   RENDER POSTS
══════════════════════ */
function renderAllPosts() {
  const all = [...blogData, ...airdropData]
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

  // Update sidebar badge
  sidebarPostCount.textContent = all.length;

  // Analytics refresh
  const totalBlogsCount    = blogData.length;
  const totalAirdropsCount = airdropData.length;
  const hotCount           = airdropData.filter(a => a.isHot).length;
  const newCount           = airdropData.filter(a => a.isNew).length;
  totalBlogsEl.textContent    = totalBlogsCount;
  totalAirdropsEl.textContent = totalAirdropsCount;
  hotAirdropsEl.textContent   = hotCount;
  newAirdropsEl.textContent   = newCount;

  // Recent (overview panel — top 5)
  renderPostsList(recentPostsList, all.slice(0, 5), false);

  // Manage panel — filter + search
  window._renderAllPosts();
}

// Exposed for filter/search controls (called from HTML)
window._renderAllPosts = function () {
  const filterVal = window._currentFilter || "all";
  const searchVal = (searchInput?.value || "").toLowerCase().trim();

  let all = [...blogData, ...airdropData]
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

  if (filterVal !== "all") all = all.filter(p => p.type === filterVal);
  if (searchVal) all = all.filter(p =>
    (p.title || "").toLowerCase().includes(searchVal) ||
    (p.description || "").toLowerCase().includes(searchVal)
  );

  renderPostsList(postsContainer, all, true);
};

// Keep filter state accessible
window.filterPosts = (filter, btn) => {
  window._currentFilter = filter;
  document.querySelectorAll("[data-filter]").forEach(b => {
    const active = b.dataset.filter === filter;
    b.style.background  = active ? "linear-gradient(135deg, var(--gold), var(--gold-light))" : "var(--surface-3)";
    b.style.color       = active ? "#000" : "var(--text-secondary)";
    b.style.boxShadow   = active ? "0 4px 16px rgba(201,168,76,0.3)" : "none";
  });
  window._renderAllPosts();
};

/* ── Build the posts list HTML ── */
function renderPostsList(container, posts, showActions) {
  if (!posts.length) {
    container.innerHTML = `
      <div class="posts-empty">
        <i class="fas fa-inbox"></i>
        <h3>No posts found</h3>
        <p>Publish your first blog post or airdrop to see it here.</p>
      </div>`;
    return;
  }

  container.innerHTML = "";
  posts.forEach(p => {
    const row = document.createElement("div");
    row.className = "post-row";

    const thumb = p.imageUrl
      ? `<img class="post-row-thumb" src="${safe(p.imageUrl)}" alt="${safe(p.title)}" loading="lazy">`
      : `<div class="post-row-thumb-placeholder"><i class="fas fa-image"></i></div>`;

    const badges = [
      p.isHot      ? `<span class="mini-badge hot">🔥 Hot</span>`      : "",
      p.isNew      ? `<span class="mini-badge new">🆕 New</span>`      : "",
      p.isFeatured ? `<span class="mini-badge featured">📌 Featured</span>` : ""
    ].join("");

    const actions = showActions ? `
      <div class="post-row-actions">
        <button class="btn-edit"   onclick="editItem('${p.id}','${p.type}')"   title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn-delete" onclick="deleteItem('${p.id}','${p.type}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>` : `
      <div class="post-row-actions">
        <button class="btn-edit" onclick="editItem('${p.id}','${p.type}')" title="Edit"><i class="fas fa-pen"></i></button>
      </div>`;

    row.innerHTML = `
      ${thumb}
      <div class="post-row-info">
        <h4>${safe(p.title)}</h4>
        <div class="post-row-meta">
          <span class="post-type-badge ${p.type}">${p.type === "blog" ? "Blog" : "Airdrop"}</span>
          <span class="post-date"><i class="fas fa-calendar-alt"></i> ${fmtDate(p.date)}</span>
          ${badges ? `<div class="post-badges">${badges}</div>` : ""}
        </div>
      </div>
      ${actions}`;

    container.appendChild(row);
  });
}

/* ══════════════════════
   BLOG — CREATE
══════════════════════ */
publishBtn.addEventListener("click", async () => {
  const title   = postTitle.value.trim();
  const desc    = postDescription.value.trim();
  const content = postContent.value.trim();

  if (!title || !desc || !content) {
    toast("warning", "Missing Fields", "Title, description and content are all required.");
    return;
  }

  setLoading(publishBtn, true);
  uploadStatus.textContent = "Uploading...";

  try {
    let imageUrl = "";
    if (postImage.files[0]) {
      uploadStatus.textContent = "Uploading image...";
      imageUrl = await uploadToCloudinary(postImage.files[0]);
    }

    await addDoc(collection(db, "blogPosts"), {
      title,
      description: desc,
      content,
      category: postCategory.value,
      link:     postLink.value.trim(),
      imageUrl,
      date: serverTimestamp()
    });

    toast("success", "Blog Post Published! 🎉");

    // Reset form
    postTitle.value = postDescription.value = postContent.value = postLink.value = "";
    postImage.value = "";
    document.getElementById("blogPreviewWrap").style.display = "none";
    uploadStatus.textContent = "";

    loadAnalytics();
    switchPanel("manage");

  } catch (err) {
    console.error("Blog publish error:", err);
    toast("error", "Failed to Publish", err.message);
    uploadStatus.textContent = "";
  }

  setLoading(publishBtn, false);
});

/* ══════════════════════
   AIRDROP — CREATE
══════════════════════ */
publishAirdropBtn.addEventListener("click", async () => {
  const title = airdropTitle.value.trim();
  const desc  = airdropDescription.value.trim();
  const link  = airdropLink.value.trim();

  if (!title || !desc || !link) {
    toast("warning", "Missing Fields", "Title, description and join link are required.");
    return;
  }

  setLoading(publishAirdropBtn, true);

  try {
    let imageUrl = "";
    if (airdropImage.files[0]) {
      imageUrl = await uploadToCloudinary(airdropImage.files[0]);
    }

    await addDoc(collection(db, "airdrops"), {
      title,
      description: desc,
      reward:     airdropReward.value.trim(),
      link,
      referral:   airdropReferral.value.trim(),
      endDate:    airdropEnd.value ? new Date(airdropEnd.value).getTime() : null,
      imageUrl,
      isHot:      isHot.checked,
      isNew:      isNew.checked,
      isFeatured: isFeatured.checked,
      date: serverTimestamp()
    });

    toast("success", "Airdrop Published! 🚀");

    // Reset
    airdropTitle.value = airdropDescription.value = airdropReward.value = "";
    airdropLink.value  = airdropReferral.value    = airdropEnd.value    = "";
    airdropImage.value = "";
    isHot.checked = isNew.checked = isFeatured.checked = false;
    document.getElementById("airdropPreviewWrap").style.display = "none";

    loadAnalytics();
    switchPanel("manage");

  } catch (err) {
    console.error("Airdrop publish error:", err);
    toast("error", "Failed to Publish", err.message);
  }

  setLoading(publishAirdropBtn, false);
});

/* ══════════════════════
   DELETE
══════════════════════ */
window.deleteItem = async (id, type) => {
  const res = await confirm(
    "Delete this post?",
    "This action cannot be undone. The post will be removed from your website immediately."
  );
  if (!res.isConfirmed) return;

  try {
    await deleteDoc(doc(db, type === "blog" ? "blogPosts" : "airdrops", id));
    toast("success", "Deleted");
    loadAnalytics();
  } catch (err) {
    console.error("Delete error:", err);
    toast("error", "Delete Failed", err.message);
  }
};

/* ══════════════════════
   EDIT — OPEN MODAL
══════════════════════ */
window.editItem = async (id, type) => {
  currentId   = id;
  currentType = type;

  // Fetch latest data
  const snap = await getDoc(doc(db, type === "blog" ? "blogPosts" : "airdrops", id));
  if (!snap.exists()) { toast("error", "Post not found"); return; }
  const d = snap.data();

  // Modal title
  editModalTitle.textContent = type === "blog" ? "Edit Blog Post" : "Edit Airdrop";

  // Show/hide blog-only fields
  document.getElementById("editContentField").classList.toggle("hidden", type !== "blog");
  document.getElementById("editCategoryField").classList.toggle("hidden", type !== "blog");

  // Show/hide airdrop-only fields
  document.getElementById("editRewardField").classList.toggle("hidden",  type !== "airdrop");
  document.getElementById("editReferralField").classList.toggle("hidden", type !== "airdrop");
  document.getElementById("editEndDateField").classList.toggle("hidden",  type !== "airdrop");
  document.getElementById("editTagsField").classList.toggle("hidden",     type !== "airdrop");

  // Common
  editTitle.value       = d.title       || "";
  editDescription.value = d.description || "";
  editLink.value        = d.link        || "";
  editImage.value       = "";
  editPreview.src       = d.imageUrl    || "";
  editPreview.style.display = d.imageUrl ? "block" : "none";

  // Blog
  if (type === "blog") {
    editContent.value  = d.content  || "";
    editCategory.value = d.category || "Crypto";
  }

  // Airdrop
  if (type === "airdrop") {
    editReward.value  = d.reward   || "";
    editReferral.value = d.referral || "";
    editEndDate.value  = d.endDate
      ? new Date(d.endDate).toISOString().slice(0, 16)
      : "";
    editHot.checked      = !!d.isHot;
    editNew.checked      = !!d.isNew;
    editFeatured.checked = !!d.isFeatured;
  }

  editModal.classList.add("show");
};

/* ══════════════════════
   EDIT — SAVE
══════════════════════ */
saveEditBtn.addEventListener("click", async () => {
  const title = editTitle.value.trim();
  const desc  = editDescription.value.trim();

  if (!title || !desc) {
    toast("warning", "Missing Fields", "Title and description are required.");
    return;
  }

  saveEditBtn.disabled      = true;
  saveEditBtn.innerHTML     = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    let imageUrl = editPreview.src || "";

    if (editImage.files[0]) {
      imageUrl = await uploadToCloudinary(editImage.files[0]);
    }

    const updateData = {
      title,
      description: desc,
      link: editLink.value.trim(),
      imageUrl
    };

    if (currentType === "blog") {
      updateData.content  = editContent.value.trim();
      updateData.category = editCategory.value;
    }

    if (currentType === "airdrop") {
      updateData.reward      = editReward.value.trim();
      updateData.referral    = editReferral.value.trim();
      updateData.endDate     = editEndDate.value
        ? new Date(editEndDate.value).getTime()
        : null;
      updateData.isHot       = editHot.checked;
      updateData.isNew       = editNew.checked;
      updateData.isFeatured  = editFeatured.checked;
    }

    await updateDoc(
      doc(db, currentType === "blog" ? "blogPosts" : "airdrops", currentId),
      updateData
    );

    toast("success", "Updated Successfully! ✅");
    editModal.classList.remove("show");

  } catch (err) {
    console.error("Save edit error:", err);
    toast("error", "Save Failed", err.message);
  }

  saveEditBtn.disabled  = false;
  saveEditBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
});

/* ══════════════════════
   SEARCH (live)
══════════════════════ */
searchInput?.addEventListener("input", () => window._renderAllPosts());

/* ══════════════════════
   KEYBOARD SHORTCUTS
══════════════════════ */
document.addEventListener("keydown", e => {
  // ESC closes edit modal
  if (e.key === "Escape") editModal.classList.remove("show");
});