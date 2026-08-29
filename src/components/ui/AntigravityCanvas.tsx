'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  angle: number;
  length: number;
  color: string;
  speed: number;
}

export default function AntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run on desktop devices with mice/pointers
    if (!window.matchMedia('(pointer: fine)').matches) return;
    // Respect the user's OS-level motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Google-style vibrant accent colors
    const colors = ['#2563eb', '#38bdf8', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isActive: false,
    };

    const particles: Particle[] = [];
    // Tighter spacing for a richer, denser field around the cursor
    const spacing = 22;

    const initParticles = () => {
      particles.length = 0;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const jitterX = (Math.random() - 0.5) * 8;
          const jitterY = (Math.random() - 0.5) * 8;
          const color = colors[Math.floor(Math.random() * colors.length)];

          particles.push({
            x: x + jitterX,
            y: y + jitterY,
            originX: x + jitterX,
            originY: y + jitterY,
            angle: Math.random() * Math.PI * 2,
            length: 4 + Math.random() * 5,
            color,
            speed: 0.08 + Math.random() * 0.06,
          });
        }
      }
    };

    initParticles();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else if (isPaused) {
        isPaused = false;
        render();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      // Smooth lerp for liquid-like motion
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      const influenceRadius = 240; // Only animate within 240px of cursor

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Skip calculations for particles far away from cursor to save CPU and remove clutter
        if (dist > influenceRadius) {
          // Gently drift back to original position
          p.x += (p.originX - p.x) * 0.08;
          p.y += (p.originY - p.y) * 0.08;
          continue;
        }

        // Particle is near the cursor -> calculate vector angle & gravitational pull
        const targetAngle = Math.atan2(dy, dx);
        const force = (1 - dist / influenceRadius);

        // Turn towards cursor smoothly
        p.angle += (targetAngle - p.angle) * p.speed;

        // Pull slightly towards cursor
        p.x += Math.cos(targetAngle) * force * 2.2;
        p.y += Math.sin(targetAngle) * force * 2.2;

        // Draw particle dash
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.beginPath();
        ctx.moveTo(-p.length / 2, 0);
        ctx.lineTo(p.length / 2, 0);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        
        // Alpha fades smoothly based on distance from cursor
        ctx.globalAlpha = Math.max(0, force * 0.9);
        ctx.stroke();

        ctx.restore();
      }

      if (!isPaused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30 h-full w-full mix-blend-multiply"
      aria-hidden="true"
    />
  );
}