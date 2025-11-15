// src/views/FireworksView.ts
// 3-5 fireworks, 1 -2 is lagre in the middle ,and others small random.

import Konva from 'konva';
import type { Layer } from 'konva/lib/Layer';
import type { Circle } from 'konva/lib/shapes/Circle';
import type { Tween } from 'konva/lib/Tween';

interface FireworkParticle {
    circle: Circle;
    tween: Tween;
}

export class FireworksView {
    private layer: Layer;
    private particles: FireworkParticle[] = [];
    private animationFrame: number | null = null;
    // fireworks setup
    private cfg = {
        scale: 5, 
        large: { particleCount: 14, explosionSize: 80, radius: 3 }, // large fireworks
        small: { particleCount: 10, explosionSize: 50, radius: 2 }, // small one.
        // large fireworks 3-layer 
        rings: {                    
            delaysMs: [0, 120, 240],  // Relative delay per 
            scale:    [1.0, 1.35, 1.7]// radius ratio
        },
        durBase: 2.0,   // Tween base time
        durJitter: 0.7
    };

    // clean the screen when time out
    private timeouts: Array<ReturnType<typeof setTimeout>> = [];
    private cleaning = false;

    constructor(layer: Layer) {
        this.layer = layer;
    }

    
    // Draw a circle of particles for large fireworks
    private spawnRing(x: number, y: number, isLarge: boolean, ringIndex = 0) {
        const base = isLarge ? this.cfg.large : this.cfg.small;

        const particleCount = base.particleCount;
        const explosionSize =
            base.explosionSize * this.cfg.scale *
            (isLarge ? this.cfg.rings.scale[ringIndex] ?? 1 : 1);

        const radius = base.radius * this.cfg.scale;

        const colors = isLarge
            ? ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFE66D']
            : ['#FFA726', '#66BB6A', '#42A5F5'];

        for (let i = 0; i < particleCount; i++) {
            const angle = (i * 360) / particleCount;
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Konva.Circle hola
            const particle = new Konva.Circle({
                x, y,
                radius,        
                fill: color,
                opacity: 1,
                listening: false,
                shadowColor: color,     
                shadowBlur: radius * 2, 
                shadowOpacity: 0.6
            });

            this.layer.add(particle);

            const tween = new Konva.Tween({
                node: particle,
                duration: this.cfg.durBase + Math.random() * this.cfg.durJitter,
                x: x + Math.cos((angle * Math.PI) / 180) * explosionSize * (0.8 + Math.random() * 0.4),
                y: y + Math.sin((angle * Math.PI) / 180) * explosionSize * (0.8 + Math.random() * 0.4),
                radius: 0,             
                opacity: 0,            
                shadowBlur: 0,         
                shadowOpacity: 0,
                easing: Konva.Easings.EaseOut
            });

            this.particles.push({ circle: particle, tween });
            tween.play();

            this.ensureCleanupLoop();
        }

        // Center Afterglow Aura
        if (isLarge && ringIndex === 0) {
            const halo = new Konva.Circle({
                x, y,
                radius: (base.explosionSize * 0.4) * this.cfg.scale,
                fill: '#ffffff',
                opacity: 0.2,
                listening: false
            });
            this.layer.add(halo);
            const haloTween = new Konva.Tween({
                node: halo,
                duration: 0.8,
                radius: halo.radius() * 2.2, 
                opacity: 0,              
                easing: Konva.Easings.EaseOut
            });
           
            this.particles.push({ circle: halo, tween: haloTween });
            haloTween.play();
        }
    }

    private launchFirework(x: number, y: number, isLarge: boolean = false) {
        if (isLarge) {
            this.cfg.rings.delaysMs.forEach((delay, idx) => {
                const t = setTimeout(() => this.spawnRing(x, y, true, idx), delay);
                this.timeouts.push(t);
            });
        } else {
            this.spawnRing(x, y, false, 0);
        }   
    }

    // animation:
    startFireworks() {
        const stage = this.layer.getStage();
        if (!stage) return; // check the layer is created

        const centerX = stage.width() / 2;
        const centerY = stage.height() / 3;

        // large, middle 
        this.timeouts.push(setTimeout(() => this.launchFirework(centerX, centerY, true), 300));
        this.timeouts.push(setTimeout(() => this.launchFirework(centerX - 60, centerY - 40, true), 800));
        // this.timeouts.push(setTimeout(() => this.launchFirework(centerX + 80, centerY - 40, true), 1800));


        // small .
        this.timeouts.push(setTimeout(() => this.launchFirework(centerX + 80, centerY + 20), 1200));
        this.timeouts.push(setTimeout(() => this.launchFirework(centerX - 90, centerY + 30), 1800));
        this.timeouts.push(setTimeout(() => this.launchFirework(centerX + 40, centerY - 50), 2000));

    }

    // Ensure the cleanup cycle runs only once; 
    // continue cleaning when particles are present.
    private ensureCleanupLoop() {
        if (this.cleaning) return;
        this.cleaning = true;

        const tick = () => {
        this.particles = this.particles.filter(({ circle, tween }) => {
            const done = circle.radius() <= 0.1 || circle.opacity() <= 0.01;
            if (done) {
            try { tween.destroy(); } catch {}
            try { circle.destroy(); } catch {}
            return false;
            }
            return true;
        });

        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(tick);
        } else {
            // stop if there is no circle
            this.cleaning = false;
            if (this.animationFrame !== null) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        }
        };

        this.animationFrame = requestAnimationFrame(tick);
    }

    stop() {
        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.cleaning = false;

        this.timeouts.forEach((t) => clearTimeout(t));
        this.timeouts = [];

        this.particles.forEach(({ tween, circle }) => {
            try { tween.destroy(); } catch {}
            try { circle.destroy(); } catch {}
        });
        this.particles = [];
    }
}
