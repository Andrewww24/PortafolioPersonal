
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-bg';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');


  const CONFIG = {
    count:        90,      // número de partículas
    maxRadius:    2.2,     // radio máximo de cada punto
    speed:        0.35,    // velocidad de movimiento
    linkDistance: 130,     // distancia máxima para trazar línea
    colorDot:     '168, 85, 247',   // púrpura accent (RGB)
    colorLine:    '124, 58, 237',   // violeta primario (RGB)
    dotOpacity:   0.75,
    lineOpacity:  0.18,
  };


  class Particle {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, randomY = false) {
      this.x  = Math.random() * w;
      this.y  = randomY ? Math.random() * h : h + 4;
      this.r  = Math.random() * CONFIG.maxRadius + 0.6;
      const angle = Math.random() * Math.PI * 2;
      const spd   = (Math.random() * 0.5 + 0.2) * CONFIG.speed;
      this.vx = Math.cos(angle) * spd;
      this.vy = Math.sin(angle) * spd;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update(w, h) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0)  { this.x = 0;  this.vx *= -1; }
      if (this.x > w)  { this.x = w;  this.vx *= -1; }
      if (this.y < 0)  { this.y = 0;  this.vy *= -1; }
      if (this.y > h)  { this.y = h;  this.vy *= -1; }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.colorDot}, ${this.opacity * CONFIG.dotOpacity})`;
      ctx.fill();
    }
  }


  let W, H, particles = [], rafId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, () => new Particle(W, H));
  }


  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.linkDistance) {
          const alpha = (1 - dist / CONFIG.linkDistance) * CONFIG.lineOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.colorLine}, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }


    for (const p of particles) {
      p.update(W, H);
      p.draw(ctx);
    }

    rafId = requestAnimationFrame(draw);
  }


  let mouse = { x: null, y: null };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });


  const _update = Particle.prototype.update;
  Particle.prototype.update = function (w, h) {
    if (mouse.x !== null) {
      const dx   = mouse.x - this.x;
      const dy   = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        this.vx += dx / dist * 0.04;
        this.vy += dy / dist * 0.04;
        /* limitar velocidad */
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > CONFIG.speed * 3) {
          this.vx = (this.vx / spd) * CONFIG.speed * 3;
          this.vy = (this.vy / spd) * CONFIG.speed * 3;
        }
      }
    }
    _update.call(this, w, h);
  };


  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      init();
      draw();
    }, 200);
  });


  init();
  draw();
})();
