import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqkF3S1laiCck3naywl6Jq9WoeWkouFCM",
  authDomain: "oga-dave-concepts.firebaseapp.com",
  projectId: "oga-dave-concepts",
  storageBucket: "oga-dave-concepts.firebasestorage.app",
  messagingSenderId: "277897709083",
  appId: "1:277897709083:web:46091bc6c047800c2b1abe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const blogContainer = document.getElementById("blog-container");

// 🔥 Skeleton loader
blogContainer.innerHTML = `
  <div class="skeleton"></div>
  <div class="skeleton"></div>
  <div class="skeleton"></div>
`;

async function loadPosts() {
  try {
    const q = query(collection(db, "blogPosts"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    blogContainer.innerHTML = "";

    if (querySnapshot.empty) {
      blogContainer.innerHTML = `<p class="loading">No updates yet. Check back soon.</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const post = doc.data();
      const postId = doc.id;

      const card = document.createElement("div");
      card.classList.add("blog-card");

      card.innerHTML = `
        <img src="${post.imageUrl}" alt="${post.title}">
        <div class="blog-info">
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          <a href="blog-detail.html?id=${postId}" class="btn gold-btn">Read More</a>
        </div>
      `;

      blogContainer.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    blogContainer.innerHTML = `<p class="loading">❌ Failed to load posts.</p>`;
  }
}

loadPosts();