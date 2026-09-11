// src/components/landing/HeroCanvas.jsx
import { useEffect, useRef } from 'react';

export default function HeroCanvas({ mousePos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = true;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const leafColors = [
      { fill: '#415e46', stroke: '#314735' },
      { fill: '#597858', stroke: '#445c43' },
      { fill: '#778a5e', stroke: '#5c6b48' },
      { fill: '#949c68', stroke: '#71784c' },
      { fill: '#caa085', stroke: '#a87d65' },
      { fill: '#d99a9a', stroke: '#b37777' },
    ];

    const leafCount = Math.min(26, Math.max(16, Math.floor(window.innerWidth / 65)));
    const leaves = Array.from({ length: leafCount }, (_, i) => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const isPetal = i % 5 === 0;
      return {
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * (height + 100) - 50,
        size: 14 + Math.random() * 22,
        speedX: 0.4 + Math.random() * 0.9,
        speedY: 0.25 + Math.random() * 0.65,
        swingSpeed: 0.015 + Math.random() * 0.025,
        swingRange: 25 + Math.random() * 45,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.02 + Math.random() * 0.04,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        opacity: 0.45 + Math.random() * 0.45,
        depth: 0.6 + Math.random() * 0.7,
        isPetal,
        seed: Math.random() * 1000,
      };
    });

    const dustCount = 35;
    const dustMotes = Array.from({ length: dustCount }, () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      return {
        x: width * 0.45 + Math.random() * (width * 0.5),
        y: height * 0.25 + Math.random() * (height * 0.55),
        radius: 1 + Math.random() * 2.2,
        vx: 0.15 + Math.random() * 0.3,
        vy: -0.15 - Math.random() * 0.35,
        alpha: 0.1 + Math.random() * 0.45,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI * 2,
      };
    });

    const drawLeaf = (x, y, size, angle, flip, color, opacity, isPetal) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(Math.cos(flip), 1);
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      if (isPetal) {
        ctx.moveTo(0, -size * 0.6);
        ctx.bezierCurveTo(size * 0.5, -size * 0.4, size * 0.5, size * 0.4, 0, size * 0.6);
        ctx.bezierCurveTo(-size * 0.5, size * 0.4, -size * 0.5, -size * 0.4, 0, -size * 0.6);
      } else {
        ctx.moveTo(0, -size * 0.7);
        ctx.bezierCurveTo(size * 0.55, -size * 0.2, size * 0.45, size * 0.5, 0, size * 0.7);
        ctx.bezierCurveTo(-size * 0.45, size * 0.5, -size * 0.55, -size * 0.2, 0, -size * 0.7);
      }

      ctx.fillStyle = color.fill;
      ctx.fill();

      if (!isPetal && Math.abs(Math.cos(flip)) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.6);
        ctx.quadraticCurveTo(size * 0.05, 0, 0, size * 0.65);
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.7;
        ctx.stroke();
      }

      ctx.restore();
    };

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      for (let d of dustMotes) {
        d.x += d.vx;
        d.y += d.vy;
        d.pulseVal += d.pulseSpeed;

        if (d.x > width + 20 || d.y < -20) {
          d.x = width * 0.4 + Math.random() * (width * 0.4);
          d.y = height * 0.7 + Math.random() * (height * 0.3);
        }

        const currentAlpha = d.alpha * (0.6 + 0.4 * Math.sin(d.pulseVal));
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 185, ${currentAlpha})`;
        ctx.shadowColor = 'rgba(255, 220, 140, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      for (let leaf of leaves) {
        leaf.seed += leaf.swingSpeed;
        const sway = Math.sin(leaf.seed) * (leaf.swingRange * 0.05);

        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;
        if (mousePos && mousePos.current) {
          const dx = leaf.x - mousePos.current.x;
          const dy = leaf.y - mousePos.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 0) {
            const force = (1 - dist / 180) * 1.5;
            mouseInfluenceX = (dx / dist) * force;
            mouseInfluenceY = (dy / dist) * force;
          }
        }

        leaf.x += leaf.speedX * leaf.depth + sway + mouseInfluenceX;
        leaf.y += leaf.speedY * leaf.depth + mouseInfluenceY;
        leaf.angle += leaf.angularVelocity;
        leaf.flip += leaf.flipSpeed;

        if (leaf.x > width + 80) {
          leaf.x = -60;
          leaf.y = Math.random() * (height * 0.7);
        }
        if (leaf.y > height + 60) {
          leaf.y = -40;
          leaf.x = Math.random() * (width * 0.8);
        }

        drawLeaf(
          leaf.x,
          leaf.y,
          leaf.size * leaf.depth,
          leaf.angle,
          leaf.flip,
          leaf.color,
          leaf.opacity,
          leaf.isPetal
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      style={{ display: 'block' }}
    />
  );
}
