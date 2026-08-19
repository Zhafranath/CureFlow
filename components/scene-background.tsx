'use client'

import { useEffect, useRef } from 'react'
import { useApp } from '@/lib/store'
import * as THREE from 'three'
import gsap from 'gsap'

export function SceneBackground() {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 20
    camera.position.y = 8

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Generate Particle Grid Geometry
    const width = 40
    const depth = 40
    const spacing = 1.2
    const particleCount = width * depth
    const positions = new Float32Array(particleCount * 3)

    let idx = 0
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const posX = (x - width / 2) * spacing
        const posZ = (z - depth / 2) * spacing
        positions[idx * 3] = posX
        positions[idx * 3 + 1] = 0
        positions[idx * 3 + 2] = posZ
        idx++
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // High performance ShaderMaterial (GPU wave calculation)
    const initialColor = isDark ? new THREE.Color('#06b6d4') : new THREE.Color('#0ea5e9')
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: initialColor },
        uOpacity: { value: isDark ? 0.65 : 0.45 },
      },
      vertexShader: `
        uniform float uTime;
        void main() {
          vec3 p = position;
          float y1 = sin(p.x * 0.15 + uTime * 0.8) * 0.8;
          float y2 = cos(p.z * 0.15 + uTime * 0.6) * 0.8;
          p.y = y1 + y2;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = 3.5 * (20.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Smooth Theme Transition
    const targetColor = isDark ? new THREE.Color('#22d3ee') : new THREE.Color('#0ea5e9')
    const targetOpacity = isDark ? 0.65 : 0.45
    gsap.to(material.uniforms.uColor.value, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 1.0,
      ease: 'power2.out',
    })
    gsap.to(material.uniforms.uOpacity, {
      value: targetOpacity,
      duration: 1.0,
      ease: 'power2.out',
    })

    let animationFrameId: number
    const animate = () => {
      material.uniforms.uTime.value = performance.now() * 0.001
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    // Mouse Parallax (throttled/smooth)
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1

      gsap.to(camera.position, {
        x: mouseX * 2.0,
        y: 8 - mouseY * 1.2,
        duration: 1.5,
        ease: 'power2.out',
      })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [isDark])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 -z-30 h-full w-full outline-none"
        style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 transition-all duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 55% 55% at 15% 55%, rgba(8,28,52,0.85) 0%, transparent 65%), linear-gradient(158deg, #030b14 0%, #050f1e 30%, #040c17 60%, #020810 100%)'
            : 'radial-gradient(ellipse 55% 55% at 15% 55%, rgba(14,165,233,0.12) 0%, transparent 65%), linear-gradient(158deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 60%, #cbd5e1 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 transition-all duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 30%, rgba(2,7,14,0.55) 70%, rgba(1,5,11,0.88) 100%)'
            : 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 40%, rgba(241,245,249,0.4) 75%, rgba(203,213,225,0.7) 100%)',
        }}
      />
    </>
  )
}
