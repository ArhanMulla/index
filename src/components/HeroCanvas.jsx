import { useEffect, useRef } from 'react';

const LABELS = ['Industry', 'Academia', 'Research', 'Innovation', 'Students'];

export default function HeroCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const nodes = Array.from({ length: 60 }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (Math.random() - 0.5) * 0.3,
      vy:  (Math.random() - 0.5) * 0.3,
      r:   Math.random() * 1.8 + 0.8,
      lbl: Math.random() > 0.88 ? LABELS[Math.floor(Math.random() * LABELS.length)] : null,
      ph:  Math.random() * Math.PI * 2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.ph += 0.018;
        if (n.x < -60)  n.x = canvas.width  + 60;
        if (n.x > canvas.width  + 60) n.x = -60;
        if (n.y < -60)  n.y = canvas.height + 60;
        if (n.y > canvas.height + 60) n.y = -60;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,191,166,${(1 - d / 130) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const p = Math.sin(n.ph) * 0.5 + 0.5;
        if (n.lbl) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 15 + p * 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,191,166,${0.05 + p * 0.07})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,191,166,${0.7 + p * 0.3})`;
          ctx.fill();
          ctx.font = '500 11px DM Sans, sans-serif';
          ctx.fillStyle = `rgba(0,191,166,${0.45 + p * 0.3})`;
          ctx.textAlign = 'center';
          ctx.fillText(n.lbl, n.x, n.y - 12);
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(76,111,239,${0.2 + p * 0.18})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.65 }}
    />
  );
}
