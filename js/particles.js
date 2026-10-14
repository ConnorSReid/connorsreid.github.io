const canvas = document.querySelector("#particles");

if (!canvas) {
  throw new Error(
    'No <canvas id="particle"> was found. Check index.html.'
  );
}

const context = canvas.getContext("2d");

const config = {
  minParticles: 30,
  maxParticles: 150,
  areaPerParticle: 18000,

  minRadius: 1,
  maxRadius: 2.5,
  minSpeed: 0.05,
  maxSpeed: 0.25,

  particleRgb: "221, 227, 239",
  linkDistance: 140,
  grabDistance: 150,
  linkOpacity: 0.25,
  grabOpacity: 0.55,
  lineWidth: 1,
};

let width = 0;
let height = 0;
let particles = [];
let lastTime = 0;

const pointer = {
  x: 0,
  y: 0,
  active: false,
};

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  const speed = random(config.minSpeed, config.maxSpeed);

  return {
    x: random(0, width),
    y: random(0, height),
    radius: random(config.minRadius, config.maxRadius),
    opacity: random(0.45, 1),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function Particles() {
  const count = clamp(
    Math.round((width * height) / config.areaPerParticle),
    config.minParticles,
    config.maxParticles
  );

  particles = Array.from({ length: count }, createParticle);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  width = rect.width;
  height = rect.height;

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);

  // Lets us continue to use normal CSS-pixel coordinates.
  contextx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  Particles();
}

function moveParticle(particle, frameScale) {
  particle.x += particle.vx * frameScale;
  particle.y += particle.vy * frameScale;

  const edge = particle.radius;

  if (particle.x < -edge) particle.x = width + edge;
  if (particle.x > width + edge) particle.x = -edge;
  if (particle.y < -edge) particle.y = height + edge;
  if (particle.y > height + edge) particle.y = -edge;
}

function drawLine(x1, y1, x2, y2, opacity) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = `rgba(${config.particleRgb}, ${opacity})`;
  context.lineWidth = config.lineWidth;
  context.stroke();
}

function drawParticleLinks() {
  const maxDistanceSquared = config.linkDistance ** 2;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared > maxDistanceSquared) continue;

      const distance = Math.sqrt(distanceSquared);
      const fade = 1 - distance / config.linkDistance;

      drawLine(
        particles[i].x,
        particles[i].y,
        particles[j].x,
        particles[j].y,
        config.linkOpacity * fade
      );
    }
  }
}

function drawMouseLinks() {
  if (!pointer.active) return;

  const maxDistanceSquared = config.grabDistance ** 2;

  for (const particle of particles) {
    const dx = particle.x - pointer.x;
    const dy = particle.y - pointer.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared > maxDistanceSquared) continue;

    const distance = Math.sqrt(distanceSquared);
    const fade = 1 - distance / config.grabDistance;

    drawLine(
      pointer.x,
      pointer.y,
      particle.x,
      particle.y,
      config.grabOpacity * fade
    );
  }
}

function drawParticles() {
  for (const particle of particles) {
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${config.particleRgb}, ${particle.opacity})`;
    context.fill();
  }
}

function render(frameScale = 0) {
  context.clearRect(0, 0, width, height);

  for (const particle of particles) {
    if (frameScale) moveParticle(particle, frameScale);
  }

  drawParticleLinks();
  drawMouseLinks();
  drawParticles();
}

function animate(timestamp) {
  const frameScale = lastTime
    ? Math.min((timestamp - lastTime) / 16.67, 2)
    : 1;

  lastTime = timestamp;

  render(frameScale);
  requestAnimationFrame(animate);
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();

  const isInsideCanvas =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (event.pointerType === "touch" || !isInsideCanvas) {
    pointer.active = false;
    return;
  }

  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
  pointer.active = true;
}

window.addEventListener("pointermove", updatePointer);
window.addEventListener("blur", () => (pointer.active = false));
window.addEventListener("resize", resizeCanvas);

resizeCanvas();

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  render(); // Shows still particles without animation.
} else {
  requestAnimationFrame(animate);
}