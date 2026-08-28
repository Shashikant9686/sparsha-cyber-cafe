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
  vx: number;
  vy: number;
}

export default function AntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Google palette colors (blue, red, yellow, green, slate)
    const colors = [
      '#2563eb', // Blue
      '#3b82f6', // Sky Blue
      '#6366f1', // Indigo
      '#f59e0b', // Amber/Yellow
      '#ec4899', // Pink
      '#94a3b8', // Slate
    ];

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false,
    };

    const particles: Particle[] = [];
    const spacing = 32; // Grid density

    const initParticles = () => {
      particles.length = 0;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          // Add slight jitter for organic look
          const jitterX = (Math.random() - 0.5) * 12;
          const jitterY = (Math.random() - 0.5) * 12;
          const color = colors[Math.floor(Math.random() * colors.length)];

          particles.push({
            x: x + jitterX,
            y: y + jitterY,
            originX: x + jitterX,
            originY: y + jitterY,
            angle: 0,
            length: 4 + Math.random() * 4,
            color,
            vx: 0,
            vy: 0,
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
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 320;

        // Calculate direction towards cursor
        const targetAngle = Math.atan2(dy, dx);

        if (dist < maxDist) {
          // Particles align and get pulled towards cursor
          const force = (1 - dist / maxDist) * 1.2;
          p.angle = targetAngle;
          p.x += Math.cos(targetAngle) * force * 1.5;
          p.y += Math.sin(targetAngle) * force * 1.5;
        } else {
          // Settle back into starting grid positions
          p.angle += (targetAngle - p.angle) * 0.02;
          p.x += (p.originX - p.x) * 0.05;
          p.y += (p.originY - p.y) * 0.05;
        }

        // Draw oriented particle dash
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.beginPath();
        ctx.moveTo(-p.length / 2, 0);
        ctx.lineTo(p.length / 2, 0);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = dist < maxDist ? 0.85 : 0.25;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
}