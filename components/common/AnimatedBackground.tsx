'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Create molecules/atoms (particles)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    // Chemistry-themed colors (blues, greens)
    const colors = [
      new THREE.Color(0x3498db), // Blue
      new THREE.Color(0x2ecc71), // Green
      new THREE.Color(0x9b59b6), // Purple
      new THREE.Color(0xe74c3c), // Red
    ];
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position
      posArray[i] = (Math.random() - 0.5) * 10; // x
      posArray[i + 1] = (Math.random() - 0.5) * 10; // y
      posArray[i + 2] = (Math.random() - 0.5) * 10; // z
      
      // Color
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Add molecular bonds (lines)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    
    // Create connections between close particles
    const lineGeometries: THREE.Line[] = [];
    const maxDistance = 2; // Maximum distance for connection
    
    for (let i = 0; i < particlesCount; i++) {
      const posI = new THREE.Vector3(
        posArray[i * 3],
        posArray[i * 3 + 1],
        posArray[i * 3 + 2]
      );
      
      for (let j = i + 1; j < particlesCount; j++) {
        const posJ = new THREE.Vector3(
          posArray[j * 3],
          posArray[j * 3 + 1],
          posArray[j * 3 + 2]
        );
        
        const distance = posI.distanceTo(posJ);
        
        if (distance < maxDistance) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([posI, posJ]);
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
          lineGeometries.push(line);
        }
      }
    }
    
    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate the particle system
      particlesMesh.rotation.x = elapsedTime * 0.05;
      particlesMesh.rotation.y = elapsedTime * 0.03;
      
      // Rotate lines
      lineGeometries.forEach(line => {
        line.rotation.x = elapsedTime * 0.05;
        line.rotation.y = elapsedTime * 0.03;
      });
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      
      // Dispose geometries and materials
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      lineMaterial.dispose();
      lineGeometries.forEach(line => {
        line.geometry.dispose();
      });
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      aria-hidden="true"
    />
  );
}