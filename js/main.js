console.log("JS is working");

const panel = document.getElementById("panel");
const card = panel.querySelector(".panel-block");
const titleEl = panel.querySelector(".panel-block-content-title");
const bodyEl = panel.querySelector(".panel-block-content-body");
const closeBtn = panel.querySelector(".close-panel-block");

const contentRoot = document.getElementById("panelContent");

let activeBtn = null;

function setStartRectFrom(el) {
  const r = el.getBoundingClientRect();
  panel.style.setProperty("--start-top", `${r.top}px`);
  panel.style.setProperty("--start-left", `${r.left}px`);
  panel.style.setProperty("--start-width", `${r.width}px`);
  panel.style.setProperty("--start-height", `${r.height}px`);
}

function openPanelFrom(btn) {
  activeBtn = btn;

  // Capture the clicked panel's rectangle (includes hover transform if active)
  const anchor = btn.closest("li") || btn;
  setStartRectFrom(anchor);

  // Title
  const title = btn.dataset.title || btn.querySelector("h2")?.textContent || "";
  titleEl.textContent = title;

  // Body content from hidden sections
  const key = btn.dataset.key;
  const section = contentRoot?.querySelector(`[data-key="${key}"]`);
  bodyEl.innerHTML = section ? section.innerHTML : "<p>[content]</p>";

  // Show panel
  panel.classList.add("is-visible");
  panel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  bodyEl.scrollTop = 0;

  // Animate to fullscreen on next frame
  requestAnimationFrame(() => {
    panel.classList.add("open");
    closeBtn.focus();
  });
}

function closePanel() {
  if (!activeBtn) return;

  const anchor = activeBtn.closest("li") || activeBtn;

  // Animate back to the original panel rect
  setStartRectFrom(anchor);
  panel.classList.remove("open");

  const onDone = (e) => {
    if (e.target !== card) return;

    panel.classList.remove("is-visible");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    bodyEl.innerHTML = "";

    // return focus to the button (keyboard-friendly)
    activeBtn.focus();
    activeBtn = null;

    card.removeEventListener("transitionend", onDone);
  };

  card.addEventListener("transitionend", onDone);
}

// Hook up buttons
document.querySelectorAll(".open-accordion-block").forEach((btn) => {
  btn.addEventListener("click", () => openOverlayFrom(btn));
});

// Close controls
closeBtn.addEventListener("click", closePanel);

// Click outside card closes
panel.addEventListener("click", (e) => {
  if (e.target === panel) closePanel();
});

// ESC closes
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
});

// If window resizes while open, close (keeps animation consistent)
window.addEventListener("resize", () => {
  if (panel.classList.contains("open")) closePanel();
});