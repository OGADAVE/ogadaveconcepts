import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCqkF3S1laiCck3naywl6Jq9WoeWkouFCM",
  authDomain: "oga-dave-concepts.firebaseapp.com",
  projectId: "oga-dave-concepts",
  storageBucket: "oga-dave-concepts.firebasestorage.app",
  messagingSenderId: "277897709083",
  appId: "1:277897709083:web:46091bc6c047800c2b1abe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= DOM ELEMENTS ================= */
const authModal = document.getElementById("authModal");
const postSection = document.getElementById("post-section");
const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const logoutBtn = document.getElementById("logoutBtn");
const postImage = document.getElementById("postImage");
const uploadStatus = document.getElementById("uploadStatus");
const totalBlogs = document.getElementById("totalBlogs");
const totalAirdrops = document.getElementById("totalAirdrops");
const hotAirdrops = document.getElementById("hotAirdrops");
const newAirdrops = document.getElementById("newAirdrops");
const publishBtn = document.getElementById("publishBtn");
const publishAirdropBtn = document.getElementById("publishAirdropBtn");
const airdropTitle = document.getElementById("airdropTitle");
const airdropDescription = document.getElementById("airdropDescription");
const airdropReward = document.getElementById("airdropReward");
const airdropLink = document.getElementById("airdropLink");
const airdropReferral = document.getElementById("airdropReferral");
const airdropEnd = document.getElementById("airdropEnd");
const airdropImage = document.getElementById("airdropImage");
const isHot = document.getElementById("isHot");
const isNew = document.getElementById("isNew");
const isFeatured = document.getElementById("isFeatured");
const postTitle = document.getElementById("postTitle");
const postDescription = document.getElementById("postDescription");
const postContent = document.getElementById("postContent");
const postLink = document.getElementById("postLink");
const editModal = document.getElementById("editModal");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editContent = document.getElementById("editContent");
const editLink = document.getElementById("editLink");
const editImage = document.getElementById("editImage");
const editPreview = document.getElementById("editPreview");
const editReward = document.getElementById("editReward");
const editReferral = document.getElementById("editReferral");
const editEndDate = document.getElementById("editEndDate");
const editHot = document.getElementById("editHot");
const editNew = document.getElementById("editNew");
const editFeatured = document.getElementById("editFeatured");
const saveEditBtn = document.getElementById("saveEditBtn");
let unsubBlogs = null;
let unsubAirdrops = null;

/* ================= CLOUDINARY ================= */
const CLOUD_NAME = "dnjwoniyl";
const PRESET = "ogadave_media";

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("Image upload failed");
  } 

  return data.secure_url;
};

/* ================= AUTH MODAL ================= */
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(
      auth, 
      loginEmail.value, 
      loginPassword.value
    );

    Swal.fire("Success", "Logged in", "success");

    // 🔥 FORCE UI UPDATE
    authModal.style.display = "none";

  } catch (err) {
    Swal.fire("Error", "Invalid login", "error");
  }

  loginEmail.value = "";
  loginPassword.value = "";
});

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, async (user) => {
  console.log("AUTH STATE CHANGED:", user);
  if (!user) {
    authModal.style.display = "flex";
    postSection.classList.add("hidden");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      return;
    }


    const role = userSnap.data().role;

    if (!role || !["super_admin", "editor"].includes(role)) {
      await signOut(auth);
      return;
    }

    // SUCCESS STATE
    authModal.style.display = "none";
    postSection.classList.remove("hidden");

    loadAnalytics();
    listenToBlogs();
    listenToAirdrops();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    await signOut(auth);
  }
});

/* ================= LOGOUT ================= */
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

/* ================= ANALYTICS ================= */
async function loadAnalytics() {
  const blogSnap = await getDocs(collection(db, "blogPosts"));
  const airdropSnap = await getDocs(collection(db, "airdrops"));

  let hot = 0;
  let fresh = 0;

  airdropSnap.forEach(doc => {
    const d = doc.data();
    if (d.isHot) hot++;
    if (d.isNew) fresh++;
  });

  totalBlogs.innerText = blogSnap.size;
  totalAirdrops.innerText = airdropSnap.size;
  hotAirdrops.innerText = hot;
  newAirdrops.innerText = fresh;
}

/* ================= IMAGE PREVIEW ================= */
postImage.addEventListener("change", () => {
  if (postImage.files[0]) {
    uploadStatus.innerHTML = `<img src="${URL.createObjectURL(postImage.files[0])}" width="100%">`;
  }
});

/* ================= BLOG CREATE ================= */
publishBtn.addEventListener("click", async () => {
  if (!postTitle.value || !postDescription.value) {
    return Swal.fire("Missing Fields", "", "warning");
  }

  publishBtn.innerText = "Posting...";
  publishBtn.disabled = true;

  try {
    let imageUrl = "";

    if (postImage.files[0]) {
      imageUrl = await uploadToCloudinary(postImage.files[0]);
    }

    await addDoc(collection(db, "blogPosts"), {
      title: postTitle.value,
      description: postDescription.value,
      content: postContent.value,
      link: postLink.value,
      imageUrl,
      date: serverTimestamp()
    });

    Swal.fire("Success", "Blog posted!", "success");

    postTitle.value = "";
    postDescription.value = "";
    postContent.value = "";
    postLink.value = "";
    postImage.value = "";
    uploadStatus.innerHTML = "";

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "", "error");
  }

  publishBtn.innerText = "Publish Blog";
  publishBtn.disabled = false;
});

/* ================= AIRDROP CREATE ================= */
publishAirdropBtn.addEventListener("click", async () => {

  if (!airdropTitle.value || !airdropDescription.value || !airdropLink.value) {
    return Swal.fire("Missing Fields", "", "warning");
  }

  publishAirdropBtn.innerText = "Posting...";
  publishAirdropBtn.disabled = true;

  try {
    let imageUrl = "";

    if (airdropImage.files[0]) {
      imageUrl = await uploadToCloudinary(airdropImage.files[0]);
    }

    await addDoc(collection(db, "airdrops"), {
      title: airdropTitle.value,
      description: airdropDescription.value,
      reward: airdropReward.value,
      link: airdropLink.value,
      referral: airdropReferral.value,
      endDate: airdropEnd.value ? new Date(airdropEnd.value).getTime() : null,
      imageUrl,
      isHot: isHot.checked,
      isNew: isNew.checked,
      isFeatured: isFeatured.checked,
      date: serverTimestamp()
    });

    Swal.fire("Success", "Airdrop posted!", "success");

    airdropTitle.value = "";
    airdropDescription.value = "";
    airdropReward.value = "";
    airdropLink.value = "";
    airdropReferral.value = "";
    airdropEnd.value = "";
    airdropImage.value = "";
    isHot.checked = false;
    isNew.checked = false;
    isFeatured.checked = false;

    loadAnalytics();

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "", "error");
  }

  publishAirdropBtn.innerText = "Publish Airdrop";
  publishAirdropBtn.disabled = false;
});

/* ================= REAL-TIME BLOGS ================= */
let blogData = [];
let airdropData = [];

function listenToBlogs() {
  if (unsubBlogs) unsubBlogs(); // Unsubscribe previous listener if exists

  unsubBlogs = onSnapshot(collection(db, "blogPosts"), (snapshot) => {
    blogData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "blog" }));
    renderAllPosts();
  });
}

/* ================= REAL-TIME AIRDROPS ================= */
function listenToAirdrops() {
  if (unsubAirdrops) unsubAirdrops(); // Unsubscribe previous listener if exists

  unsubAirdrops = onSnapshot(collection(db, "airdrops"), (snapshot) => {
    airdropData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "airdrop" }));
    renderAllPosts();
  });
}

/* ================= REAL-TIME ALL POSTS ================= */
let renderTimeout;

function renderAllPosts() {
  clearTimeout(renderTimeout);

  renderTimeout = setTimeout(() => {
    const container = document.getElementById("postsContainer");

    const all = [...blogData, ...airdropData];

    if (all.length === 0) {
      container.innerHTML = "<p style='text-align:center;'>No posts yet</p>";
      return;
    }

    container.innerHTML = "";

    all.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

    all.forEach(d => {
      container.innerHTML += `
        <div style="background:#000;padding:10px;margin:10px 0;border-radius:10px;">
          <img src="${d.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}" width="100%">
          <h4>${d.title}</h4>
          <small>${d.type}</small>

          <button onclick="editItem('${d.id}','${d.type}')">Edit</button>
          <button onclick="deleteItem('${d.id}','${d.type}')">Delete</button>
        </div>
      `;
    });

  }, 100);
}

/* ================= DELETE ================= */
window.deleteItem = async (id, type) => {
  const confirm = await Swal.fire({
    title: "Delete?",
    icon: "warning",
    showCancelButton: true
  });

  if (confirm.isConfirmed) {
    await deleteDoc(doc(db, type === "blog" ? "blogPosts" : "airdrops", id));
    Swal.fire("Deleted", "", "success");
  }
};

/* ================= EDIT ================= */
let currentId = null;
let currentType = null;

window.editItem = async (id, type) => {
  currentId = id;
  currentType = type;

  const refDoc = doc(db, type === "blog" ? "blogPosts" : "airdrops", id);
  const snap = await getDoc(refDoc);

  const d = snap.data();

  // RESET VISIBILITY FIRST
editContent.classList.add("hidden");
editReward.classList.add("hidden");
editReferral.classList.add("hidden");
editEndDate.classList.add("hidden");

  // COMMON
  editTitle.value = d.title || "";
  editDescription.value = d.description || "";
  editLink.value = d.link || "";
  editImage.value = "";
  editPreview.src = d.imageUrl || "";

  // BLOG
  editContent.classList.toggle("hidden", type !== "blog");
  editContent.value = d.content || "";

  // AIRDROP
  editReward.classList.toggle("hidden", type !== "airdrop");
  editReferral.classList.toggle("hidden", type !== "airdrop");
  editEndDate.classList.toggle("hidden", type !== "airdrop");

  editReward.value = d.reward || "";
  editReferral.value = d.referral || "";
  editEndDate.value = d.endDate ? new Date(d.endDate).toISOString().slice(0, 16) : "";

  // TAGS
  editHot.checked = d.isHot || false;
  editNew.checked = d.isNew || false;
  editFeatured.checked = d.isFeatured || false;

  editModal.style.display = "flex";
};

/* ================= EDIT PREVIEW ================= */
editImage.addEventListener("change", () => {
  if (editImage.files[0]) {
    editPreview.src = URL.createObjectURL(editImage.files[0]);
  }
});

/* ================= SAVE EDIT ================= */
saveEditBtn.addEventListener("click", async () => {

  saveEditBtn.innerText = "Saving...";
  saveEditBtn.disabled = true;

  try {

    let imageUrl = editPreview.src;

    if (editImage.files[0]) {
      imageUrl = await uploadToCloudinary(editImage.files[0]);
    }

    const baseData = {
      title: editTitle.value,
      description: editDescription.value,
      link: editLink.value,
      imageUrl,
      isHot: editHot.checked,
      isNew: editNew.checked,
      isFeatured: editFeatured.checked
    };

    if (currentType === "blog") {
      baseData.content = editContent.value;
    }

    if (currentType === "airdrop") {
      baseData.reward = editReward.value;
      baseData.referral = editReferral.value;
      baseData.endDate = editEndDate.value;
    }

    await updateDoc(
      doc(db, currentType === "blog" ? "blogPosts" : "airdrops", currentId),
      baseData
    );

    Swal.fire("Updated Successfully", "", "success");
    editModal.style.display = "none";

  } catch (err) {
    console.error(err);
    Swal.fire("Error updating", "", "error");
  }

  saveEditBtn.innerText = "Save Changes";
  saveEditBtn.disabled = false;
});