// Optional smooth fade-in animation
document.addEventListener("DOMContentLoaded", () => {
  const heroText = document.querySelector(".hero-text");
  const heroPhoto = document.querySelector(".hero-photo");

  heroText.style.opacity = "0";
  heroText.style.transform = "translateY(30px)";

  heroPhoto.style.opacity = "0";
  heroPhoto.style.transform = "scale(0.9)";

  setTimeout(() => {
    heroText.style.transition = "all 1s ease";
    heroText.style.opacity = "1";
    heroText.style.transform = "translateY(0)";

    heroPhoto.style.transition = "all 1.2s ease";
    heroPhoto.style.opacity = "1";
    heroPhoto.style.transform = "scale(1)";
  }, 300);
});

// Highlight active link on scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});

// Fade-in on scroll
const fadeElements = document.querySelectorAll('.about');

window.addEventListener('scroll', () => {
  fadeElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.style.transition = 'opacity 1s ease, transform 1s ease';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    } else {
      el.style.opacity = 0;
      el.style.transform = 'translateY(50px)';
    }
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
});

document.querySelectorAll('.portfolio-card').forEach(card => {
  observer.observe(card);
});

// Form validation
  const form = document.querySelector(".contact-form");
const successMsg = document.getElementById("form-success");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      successMsg.style.display = "block";
      successMsg.textContent = "✅ Message sent successfully!";
      form.reset();

      // Auto hide after 5 seconds
      setTimeout(() => {
        successMsg.style.display = "none";
      }, 5000);

    } else {
      successMsg.style.display = "block";
      successMsg.textContent = "❌ Something went wrong. Try again.";
    }

  } catch (error) {
    successMsg.style.display = "block";
    successMsg.textContent = "❌ Network error. Check your connection.";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();