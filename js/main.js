console.log("JS is working");

const overlay = document.getElementById("panelOverlay");
const card = overlay.querySelector(".panel-overlay-card");
const titleEl = overlay.querySelector(".panel-overlay-title");
const bodyEl = overlay.querySelector(".panel-overlay-body");
const closeBtn = overlay.querySelector(".panel-overlay-close");

const contentRoot = document.getElementById("panelContent");

let activeBtn = null;

function setStartRectFrom(el) {
  const r = el.getBoundingClientRect();
  overlay.style.setProperty("--start-top", `${r.top}px`);
  overlay.style.setProperty("--start-left", `${r.left}px`);
  overlay.style.setProperty("--start-width", `${r.width}px`);
  overlay.style.setProperty("--start-height", `${r.height}px`);
}

function openOverlayFrom(btn) {
  activeBtn = btn;

  // Capture the clicked panel's rectangle (includes hover transform if active)
  setStartRectFrom(btn);

  // Title
  const title = btn.dataset.title || btn.querySelector("h1")?.textContent || "";
  titleEl.textContent = title;

  // Body content from hidden sections
  const key = btn.dataset.key;
  const section = contentRoot?.querySelector(`[data-key="${key}"]`);
  bodyEl.innerHTML = section ? section.innerHTML : "<p>[content]</p>";

  // Show overlay
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Animate to fullscreen on next frame
  requestAnimationFrame(() => {
    overlay.classList.add("open");
    closeBtn.focus();
  });
}

function closeOverlay() {
  if (!activeBtn) return;

  // Animate back to the original panel rect
  setStartRectFrom(activeBtn);
  overlay.classList.remove("open");

  const onDone = (e) => {
    if (e.target !== card) return;

    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // return focus to the button (keyboard-friendly)
    activeBtn.focus();
    activeBtn = null;

    card.removeEventListener("transitionend", onDone);
  };

  card.addEventListener("transitionend", onDone);
}

// Hook up buttons
document.querySelectorAll(".open-content").forEach((btn) => {
  btn.addEventListener("click", () => openOverlayFrom(btn));
});

// Close controls
closeBtn.addEventListener("click", closeOverlay);

// Click outside card closes
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

// ESC closes
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("open")) closeOverlay();
});

// If window resizes while open, close (keeps animation consistent)
window.addEventListener("resize", () => {
  if (overlay.classList.contains("open")) closeOverlay();
});