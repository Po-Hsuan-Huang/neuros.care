import React, { useRef, useEffect } from 'react';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import '@tensorflow/tfjs-backend-webgl';

// Simplified Perlin Noise - same as PsychedelicSmoke but optimized for background
class PerlinNoise {
    constructor() {
        this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
        this.p = [];
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
        this.perm = [];
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    dot(g, x, y, z) { return g[0] * x + g[1] * y + g[2] * z; }
    mix(a, b, t) { return (1.0 - t) * a + t * b; }
    fade(t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

    noise(x, y, z) {
        let X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
        x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
        let u = this.fade(x), v = this.fade(y), w = this.fade(z);
        let A = this.perm[X] + Y, AA = this.perm[A] + Z, AB = this.perm[A + 1] + Z;
        let B = this.perm[X + 1] + Y, BA = this.perm[B] + Z, BB = this.perm[B + 1] + Z;
        return this.mix(this.mix(this.mix(this.dot(this.grad3[this.perm[AA] % 12], x, y, z), this.dot(this.grad3[this.perm[BA] % 12], x - 1, y, z), u), this.mix(this.dot(this.grad3[this.perm[AB] % 12], x, y - 1, z), this.dot(this.grad3[this.perm[BB] % 12], x - 1, y - 1, z), u), v), this.mix(this.mix(this.dot(this.grad3[this.perm[AA + 1] % 12], x, y, z - 1), this.dot(this.grad3[this.perm[BA + 1] % 12], x - 1, y, z - 1), u), this.mix(this.dot(this.grad3[this.perm[AB + 1] % 12], x, y - 1, z - 1), this.dot(this.grad3[this.perm[BB + 1] % 12], x - 1, y - 1, z - 1), u), v), w);
    }
}

const BackgroundSegmenter = ({ videoElement, enabled }) => {
    const canvasRef = useRef(null);
    const segmenterRef = useRef(null);
    const perlinRef = useRef(new PerlinNoise());
    const timeRef = useRef(0);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (!enabled || !videoElement) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;

        const initSegmenter = async () => {
            try {
                const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
                const segmenterConfig = {
                    runtime: 'tfjs',
                    modelType: 'general'
                };
                segmenterRef.current = await bodySegmentation.createSegmenter(model, segmenterConfig);
                console.log('Body segmenter initialized');
            } catch (err) {
                console.error('Failed to init segmenter:', err);
            }
        };

        const resize = () => {
            if (videoElement.videoWidth && videoElement.videoHeight) {
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;

                // Initialize particles
                if (particlesRef.current.length === 0) {
                    for (let i = 0; i < 400; i++) {
                        particlesRef.current.push({
                            x: Math.random() * canvas.width,
                            y: Math.random() * canvas.height,
                            vx: 0, vy: 0,
                            size: Math.random() * 3 + 1,
                            hue: Math.random() * 60 + 160,
                            life: Math.random()
                        });
                    }
                }
            }
        };

        const drawPsychedelicBackground = () => {
            // Draw psychedelic smoke background
            ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            timeRef.current += 0.005;
            const perlin = perlinRef.current;

            particlesRef.current.forEach((p, i) => {
                const noiseScale = 0.003;
                const noiseX = perlin.noise(p.x * noiseScale, p.y * noiseScale, timeRef.current);
                const noiseY = perlin.noise(p.x * noiseScale + 100, p.y * noiseScale + 100, timeRef.current);

                p.vx = noiseX * 2;
                p.vy = noiseY * 2;
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                p.life += 0.005;
                if (p.life > 1) {
                    p.life = 0;
                    p.hue = Math.random() * 60 + 160;
                }

                const animatedHue = (p.hue + timeRef.current * 20) % 360;
                const alpha = Math.sin(p.life * Math.PI) * 0.8;
                const saturation = 70 + Math.sin(timeRef.current * 2 + i * 0.1) * 30;
                const lightness = 50 + Math.sin(timeRef.current + i * 0.05) * 20;

                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsla(${animatedHue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.fillStyle = `hsla(${animatedHue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const segment = async () => {
            if (!segmenterRef.current || !videoElement || videoElement.readyState < 2) {
                animationId = requestAnimationFrame(segment);
                return;
            }

            try {
                resize();

                // Draw psychedelic background first
                drawPsychedelicBackground();

                // Get segmentation mask
                const segmentation = await segmenterRef.current.segmentPeople(videoElement);

                if (segmentation && segmentation.length > 0) {
                    const mask = segmentation[0].mask;
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;

                    // Create temp canvas for video
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const videoData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

                    // Composite: keep person, replace background with psychedelic
                    await mask.toCanvasImageSource();
                    const maskData = await mask.toImageData();

                    for (let i = 0; i < maskData.data.length; i += 4) {
                        const maskValue = maskData.data[i]; // 0 = background, 255 = person
                        const alpha = maskValue / 255;

                        // Blend: if mask is high (person), use video; if low (background), use psychedelic
                        pixels[i] = videoData.data[i] * alpha + pixels[i] * (1 - alpha);
                        pixels[i + 1] = videoData.data[i + 1] * alpha + pixels[i + 1] * (1 - alpha);
                        pixels[i + 2] = videoData.data[i + 2] * alpha + pixels[i + 2] * (1 - alpha);
                        pixels[i + 3] = 255;
                    }

                    ctx.putImageData(imageData, 0, 0);
                }
            } catch (err) {
                console.error('Segmentation error:', err);
            }

            animationId = requestAnimationFrame(segment);
        };

        initSegmenter().then(() => segment());

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [enabled, videoElement]);

    if (!enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                zIndex: 2,
                pointerEvents: 'none'
            }}
        />
    );
};

export default BackgroundSegmenter;
