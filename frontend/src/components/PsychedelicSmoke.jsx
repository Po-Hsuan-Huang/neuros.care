import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

const PsychedelicSmoke = () => {
    const canvasRef = useRef(null);
    const mousePos = useRef({ x: 0.5, y: 0.5 });
    const time = useRef(0);

    // Perlin Noise implementation
    class PerlinNoise {
        constructor() {
            this.grad3 = [
                [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
            ];
            this.p = [];
            for (let i = 0; i < 256; i++) {
                this.p[i] = Math.floor(Math.random() * 256);
            }
            this.perm = [];
            for (let i = 0; i < 512; i++) {
                this.perm[i] = this.p[i & 255];
            }
        }

        dot(g, x, y, z) {
            return g[0] * x + g[1] * y + g[2] * z;
        }

        mix(a, b, t) {
            return (1.0 - t) * a + t * b;
        }

        fade(t) {
            return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }

        noise(x, y, z) {
            let X = Math.floor(x) & 255;
            let Y = Math.floor(y) & 255;
            let Z = Math.floor(z) & 255;

            x -= Math.floor(x);
            y -= Math.floor(y);
            z -= Math.floor(z);

            let u = this.fade(x);
            let v = this.fade(y);
            let w = this.fade(z);

            let A = this.perm[X] + Y;
            let AA = this.perm[A] + Z;
            let AB = this.perm[A + 1] + Z;
            let B = this.perm[X + 1] + Y;
            let BA = this.perm[B] + Z;
            let BB = this.perm[B + 1] + Z;

            return this.mix(
                this.mix(
                    this.mix(
                        this.dot(this.grad3[this.perm[AA] % 12], x, y, z),
                        this.dot(this.grad3[this.perm[BA] % 12], x - 1, y, z),
                        u
                    ),
                    this.mix(
                        this.dot(this.grad3[this.perm[AB] % 12], x, y - 1, z),
                        this.dot(this.grad3[this.perm[BB] % 12], x - 1, y - 1, z),
                        u
                    ),
                    v
                ),
                this.mix(
                    this.mix(
                        this.dot(this.grad3[this.perm[AA + 1] % 12], x, y, z - 1),
                        this.dot(this.grad3[this.perm[BA + 1] % 12], x - 1, y, z - 1),
                        u
                    ),
                    this.mix(
                        this.dot(this.grad3[this.perm[AB + 1] % 12], x, y - 1, z - 1),
                        this.dot(this.grad3[this.perm[BB + 1] % 12], x - 1, y - 1, z - 1),
                        u
                    ),
                    v
                ),
                w
            );
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const perlin = new PerlinNoise();
        let animationId;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mousePos.current = {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height
            };
        };
        canvas.addEventListener('mousemove', handleMouseMove);

        const particles = [];
        const particleCount = 800;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: 0,
                vy: 0,
                life: Math.random(),
                maxLife: 1,
                size: Math.random() * 3 + 1,
                hue: Math.random() * 60 + 160 // Blue to purple range
            });
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time.current += 0.005;

            particles.forEach((p, i) => {
                // Perlin noise for organic flow
                const noiseScale = 0.003;
                const noiseX = perlin.noise(
                    p.x * noiseScale,
                    p.y * noiseScale,
                    time.current
                );
                const noiseY = perlin.noise(
                    p.x * noiseScale + 100,
                    p.y * noiseScale + 100,
                    time.current
                );

                // Influence from mouse position (gaze simulation)
                const dx = (mousePos.current.x * canvas.width) - p.x;
                const dy = (mousePos.current.y * canvas.height) - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = Math.min(100 / (distance + 1), 2);

                // Combine forces
                p.vx = noiseX * 2 + (dx / distance) * force * 0.5;
                p.vy = noiseY * 2 + (dy / distance) * force * 0.5;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Life cycle
                p.life += 0.005;
                if (p.life > p.maxLife) {
                    p.life = 0;
                    p.hue = Math.random() * 60 + 160;
                }

                // Animate hue for psychedelic effect
                const animatedHue = (p.hue + time.current * 20) % 360;
                const alpha = Math.sin(p.life * Math.PI) * 0.8;
                const saturation = 70 + Math.sin(time.current * 2 + i * 0.1) * 30;
                const lightness = 50 + Math.sin(time.current + i * 0.05) * 20;

                // Draw particle with glow
                ctx.shadowBlur = 15 + Math.sin(time.current * 3 + i * 0.1) * 10;
                ctx.shadowColor = `hsla(${animatedHue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.fillStyle = `hsla(${animatedHue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    backgroundColor: '#121212'
                }}
            />
        </Box>
    );
};

export default PsychedelicSmoke;
