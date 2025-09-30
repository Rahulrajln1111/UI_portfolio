'use client';

import React, { useEffect, useRef, useState } from 'react';

// Boot sequence with per-line colors
const bootSequence = [
  { text: "// Initializing Offensive Security Kernel v3.1...", color: "text-cyan-400" },
  { text: "// Establishing Secure Connection: 127.0.0.1", color: "text-yellow-400" },
  { text: "// Checking Integrity of Research Modules... [OK]", color: "text-green-400" },
  { text: "// Enumerating Exploitation Tools... [15 loaded]", color: "text-purple-400" },
  { text: "// Starting UI Render Process... [Successful]", color: "text-lime-400" },
];

// Total boot time based on typing animation
const BOOT_TIME =0;
//  bootSequence.reduce(
//   (total, line, idx) => total + line.text.length * 10 + idx * 20,
//   0
// ) ; // extra buffer

const LoadingAnimation: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Matrix 0/1 rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 18;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? "0" : "1";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  // Fade-out timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, BOOT_TIME);
    return () => clearTimeout(timer);
  }, []);

  // When fully loaded, remove loader from DOM after fade
  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    if (isLoaded) {
      const timeout = setTimeout(() => setShowLoader(false), 600); // match CSS fade duration
      return () => clearTimeout(timeout);
    }
  }, [isLoaded]);

  if (!showLoader) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-start justify-start
                  bg-black transition-opacity duration-500 font-mono
                  overflow-hidden p-4 md:p-8
                  ${isLoaded ? 'loaded' : ''}`}
      aria-hidden="true"
    >
      {/* Matrix 0/1 rain */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Boot text */}
      <div className="w-full h-full relative z-10 crt">
        {bootSequence.map((line, index) => {
          const delayTime = index * 600;
          const lineLength = line.text.length;
          return (
            <p
              key={index}
              className={`overflow-hidden whitespace-nowrap border-r-2 border-green-400 pr-1 mb-1 text-sm md:text-base ${line.color}`}
              style={{
                ['--ch' as any]: `${lineLength}ch`,
                animation: `
                  typing ${lineLength * 30}ms steps(${lineLength}, end) forwards,
                  blink-cursor 500ms step-end infinite
                `,
                animationDelay: `${delayTime}ms, ${lineLength * 30 + delayTime}ms`,
                width: '0ch',
              }}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingAnimation;
