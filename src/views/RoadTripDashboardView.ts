// src/views/RoadTripDashboardView.ts
/*=============================
  VIEW LAYER (MVC)
    Visualizes the "Road Trip" game progress dashboard using Konva.js.
        - Renders a scrolling road environment where a car avatar advances based on stars collected.
        - Visualizes progress via background saturation (Grayscale -> Color reveal).
        - Manages real-time animations: Car suspension, jumping, boosting, and collisions.
        - Handles particle effects (Smoke/Fire) and environmental events (Plane flyovers).

    Sprint 3 updates (Nov 2025):
    - Implemented background masking logic (Grayscale vs Color layer based on progress).
    - Added physics-based interactions: Car jump, speed boost multipliers, and penalty slowdowns.
    - Integrated particle system for damage feedback (smoke/fire on obstacle hit).
    - Added decorative elements: Plane flyover with banner and floating feedback text.

    Public API:
    + constructor(containerId: string, totalStarsGoal: number, onCarBroken?: () => void)
    + init(): void
    + handleStateResult(isCorrect: boolean): void
    + reset(): void
    + dispose(): void
    + debugTrigger(type: 'plane' | 'star' | 'hit'): void

    Update history:
        - Initial setup of Konva Stage and Layers (Background, Entity, HUD).
        - Created basic Car geometry and road scrolling mechanics.
        - Implemented ResizeObserver for responsive canvas scaling.
==============================*/
import Konva from 'konva';
import { MAX_ERRORS } from "../utils/constants";

// BG PNG for road
import bgUrl from '../assets/us-roadtrip-panorama.png'; 

const CONFIG = {
    EMOJI: {
        POINTS: '⭐',
        OBSTACLE: '🔥',
        FEEDBACK: '😅',  // hit emoji
    },
    SPEED: {
        BASE: 120,             // car speed
        BOOST_MULTI: 1.5,      // ai boost
        PENALTY_MULTI: 0.5,    
        ROAD_FACTOR: 0.3,      
        PLANE: 200,            
        RECOVER_TIME: 4000,    
    },
    DURATION: {
        BOOST_AI: 2000,        // rate fo ai auto boost
        BOOST_QUIZ: 0,      // boost if get point
        PENALTY: 0,         // if lost point
    },
    PROB: {
        SMOKE_SPAWN: 0.15,     
        AI_BOOST: 0.0008,
        PLANE_FLY: 0.7,        // rate the plane flyabove if get point 
    },
    COLOR: {
        SMOKE: '#666666',      
        FIRE: '#ff3300',       
        PLANE_BODY: '#f0f0f0',
        PLANE_GLASS: '#81d4fa',
        BANNER_BG: '#ffd700',  
        BANNER_TEXT: '#d32f2f',
        ROAD_FILL: '#505050',  
    },
    SIZE: {
        SMOKE_MIN: 4,
        SMOKE_MAX: 8,
        FIRE_MIN: 3,
        FIRE_MAX: 5,
        CAR_SCALE: 0.95,        
    },
    LAYOUT: {
        ROAD_PCT_IN_IMAGE: 0.84, 
        ROAD_LINE_OFFSET: 8,   
        PLANE_Y_FACTOR: 0.2,
        ROAD_Y_OFFSET_FROM_BOTTOM: 30
    }
};

export class RoadTripDashboardView {
    private static readonly CONFIG = CONFIG;

    private containerId: string;
    private stage: Konva.Stage | null = null;
    
    // Layers
    private backgroundLayer: Konva.Layer | null = null;
    private entityLayer: Konva.Layer | null = null;
    private hudLayer: Konva.Layer | null = null;

    // Background Images
    private bgGroup: Konva.Group | null = null;       
    private bgGrayImage: Konva.Image | null = null;   
    private bgImage: Konva.Image | null = null;       
    private colorBgGroup: Konva.Group | null = null;  
    private bgImageLoaded = false; 
    private bgOriginalWidth = 0;
    private bgOriginalHeight = 0;

    private ro?: ResizeObserver;
    private roadLine: Konva.Line | null = null;
    private roadRect: Konva.Rect | null = null; 
    
    private roadY = 0;
    private carBaseY = 0;

    // Game State
    private totalStarsGoal: number;
    private maxHits = MAX_ERRORS;
    private starCount = 0;
    private hitCount = 0;
    private progress = 0; 

    // Entities
    private carGroup: Konva.Group | null = null;
    private starsOnRoad: Konva.Text[] = [];
    private obstaclesOnRoad: Konva.Text[] = [];
    private planeGroup: Konva.Group | null = null;
    private smokeParticles: Konva.Circle[] = [];

    // Physics / Animation
    private currentSpeed = CONFIG.SPEED.BASE;
    private isBroken = false;
    private isJumping = false;
    private boostTimer = 0;
    private isBoosting = false; 
    private speedTimeout: number | null = null;
    private animation: Konva.Animation | null = null;
    private onCarBrokenCallback: (() => void) | null = null;

    // HUD
    private starLabel: Konva.Text | null = null;
    private damageLabel: Konva.Text | null = null;

    constructor(containerId: string, totalStarsGoal: number, onCarBroken?: () => void) {
        this.containerId = containerId;
        this.totalStarsGoal = totalStarsGoal > 10 ? totalStarsGoal : 50;
        this.onCarBrokenCallback = onCarBroken || null;
    }

    public onCarBroken(callback: () => void): void {
        this.onCarBrokenCallback = callback;
    }

    public init(): void {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const w = container.clientWidth || 800;
        const h = container.clientHeight || 120;

        this.stage = new Konva.Stage({
            container: this.containerId,
            width: w, height: h
        });

        this.backgroundLayer = new Konva.Layer({ listening: false });
        this.entityLayer = new Konva.Layer({ listening: true });
        this.hudLayer = new Konva.Layer({ listening: false });

        this.stage.add(this.backgroundLayer);
        this.stage.add(this.entityLayer);
        this.stage.add(this.hudLayer);

        this.initBackground();
        this.updateLayoutMetrics(h);
        this.initRoad(w);
        this.initCar();
        this.initHudText(w);
        
        this.startAnimation();

        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(container);
    }

    private updateLayoutMetrics(height: number) {
        this.roadY = height - CONFIG.LAYOUT.ROAD_Y_OFFSET_FROM_BOTTOM;
        const lineAbsoluteY = this.roadY + CONFIG.LAYOUT.ROAD_LINE_OFFSET;        
        // the car position heigh. resize() should be changed at same time.
        this.carBaseY = lineAbsoluteY - 20;
    }

    private initBackground(): void {
        if (!this.backgroundLayer) return;

        this.bgGroup = new Konva.Group();
        this.colorBgGroup = new Konva.Group(); 

        const imageObj = new Image();
        imageObj.crossOrigin = "Anonymous"; 
        
        imageObj.onload = () => {
            if (!this.stage || !this.backgroundLayer) return;
            
            this.bgOriginalWidth = imageObj.width;
            this.bgOriginalHeight = imageObj.height;
            
            // 1. gray BG if no points
            this.bgGrayImage = new Konva.Image({ image: imageObj, listening: false });
            this.bgGroup?.add(this.bgGrayImage); 

            // 2. color the bg while geting points process
            this.bgImage = new Konva.Image({ image: imageObj, listening: false });
            this.colorBgGroup?.add(this.bgImage!);

            this.bgGroup?.add(this.colorBgGroup!);
            this.backgroundLayer.add(this.bgGroup!);
            this.bgGroup?.moveToBottom();

            this.bgImageLoaded = true;
            this.resize(); // resize again
        };
        imageObj.src = bgUrl;
    }

    public resize(): void {
        if (!this.stage) return;
        const container = this.stage.container();
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;

        this.stage.width(w);
        this.stage.height(h);

        // 1. Background Logic
        let imgY = 0;
        let imgH = h;
        
        if (this.bgImageLoaded && this.bgOriginalWidth > 0) {
            const ratio = this.bgOriginalHeight / this.bgOriginalWidth;
            imgH = w * ratio;
            imgY = (h - imgH) / 2;
            
            // apply the size
            [this.bgGrayImage, this.bgImage].forEach(img => {
                if (img) {
                    img.width(w); 
                    img.height(imgH);
                    img.x(0); 
                    img.y(imgY);
                }
            });
            // The filter will only take effect and remain blurry after the width and height have been set and cached.
            if (this.bgGrayImage) {
                this.bgGrayImage.clearCache(); // clear cache
                this.bgGrayImage.cache();      // cache again
                this.bgGrayImage.filters([Konva.Filters.Grayscale, Konva.Filters.Brighten]);
                this.bgGrayImage.brightness(0.2); // 0.1 to 0.3
            }
        }

        // 2. Layout Logic
        if (this.bgImageLoaded) {
            this.roadY = imgY + (imgH * CONFIG.LAYOUT.ROAD_PCT_IN_IMAGE);
        } else {
            this.roadY = h - CONFIG.LAYOUT.ROAD_Y_OFFSET_FROM_BOTTOM;
        }
        const lineAbsoluteY = this.roadY + CONFIG.LAYOUT.ROAD_LINE_OFFSET;
        this.carBaseY = lineAbsoluteY - 20; 

        // 3. Road Logic
        if (this.roadRect) {
            this.roadRect.y(this.roadY);
            this.roadRect.width(w);
            this.roadRect.height(Math.max(20, h - this.roadY)); 
        }
        if (this.roadLine) {
            const lineY = this.roadY + CONFIG.LAYOUT.ROAD_LINE_OFFSET;
            this.roadLine.points([0, lineY, w, lineY]);
        }

        // 4. Car Logic
        if (this.carGroup && !this.isJumping && !this.isBoosting) {
            this.carGroup.y(this.carBaseY);
        }

        if (this.damageLabel) {
            this.damageLabel.x(w - 160);
        }

        this.updateColorProgress();
        this.stage.batchDraw();
    }

    private updateColorProgress(): void {
        if (!this.colorBgGroup || !this.stage) return;
        
        let pct = this.totalStarsGoal > 0 ? this.starCount / this.totalStarsGoal : 0;
        this.progress = Math.min(1, Math.max(0, pct));

        const w = this.stage.width();
        const h = this.stage.height();
        const clipW = w * this.progress;

        this.colorBgGroup.clip({ x: 0, y: 0, width: clipW, height: h });
        
        // car move front while getting more points
        if (this.carGroup) {
            const startX = w * 0.05;
            const endX = w * 0.9;
            const targetX = startX + (endX - startX) * this.progress;
            
            new Konva.Tween({
                node: this.carGroup,
                x: targetX,
                duration: 0.3,
            }).play();
        }

        this.backgroundLayer?.batchDraw();
    }

    private initRoad(width: number): void {
        if (!this.backgroundLayer) return;
        
        this.roadRect = new Konva.Rect({
            x: 0, y: this.roadY, 
            width, height: 40, 
            fill: CONFIG.COLOR.ROAD_FILL
        });

        const lineY = this.roadY + CONFIG.LAYOUT.ROAD_LINE_OFFSET; 
        this.roadLine = new Konva.Line({
            points: [0, lineY, width, lineY],
            stroke: '#ffffff', strokeWidth: 2, dash: [15, 15],
            opacity: 0.9
        });
        
        this.backgroundLayer.add(this.roadRect);
        this.backgroundLayer.add(this.roadLine);
    }

    // ======== Car shape ===========
    private initCar(): void {
        if (!this.entityLayer) return;

        const carWidth = 40;
        const carHeight = 18;
        
        this.carGroup = new Konva.Group({ 
            x: 40, 
            y: this.carBaseY,
            scaleX: CONFIG.SIZE.CAR_SCALE, 
            scaleY: CONFIG.SIZE.CAR_SCALE
        });

        // 1. car Body
        const bodyRect = new Konva.Rect({
            x: 0, y: 0, width: carWidth, height: carHeight,
            fill: '#1976d2', cornerRadius: 5,
            shadowColor: 'black', shadowBlur: 4, shadowOffset: {x:2, y:2}, shadowOpacity: 0.3
        });
        
        // 2. car Roof  Rect
        const roofW = carWidth * 0.6;
        const roofH = carHeight * 0.6;
        const roofRect = new Konva.Rect({
            x: (carWidth - roofW)/2, 
            y: -roofH + 2, // inside the car body alittle
            width: roofW,
            height: roofH,
            fill: '#42a5f5',
            cornerRadius: [4, 4, 0, 0] // round top two corner
        });

        // 3. car - Window 
        const winW = roofW * 0.7;
        const winH = roofH * 0.6;
        const windowRect = new Konva.Rect({
            x: (carWidth - winW)/2, 
            y: -roofH + 4, 
            width: winW, 
            height: winH,
            fill: '#e1f5fe', // window shell color
            cornerRadius: 2
        });

        // 4. car wheels
        const wheelY = carHeight - 2;
        const w1 = new Konva.Circle({ x: 10, y: wheelY, radius: 6, fill: '#333' });
        const w2 = new Konva.Circle({ x: carWidth - 10, y: wheelY, radius: 6, fill: '#333' });
        // wheel hub
        const w1_in = new Konva.Circle({ x: 10, y: wheelY, radius: 2.5, fill: '#888' });
        const w2_in = new Konva.Circle({ x: carWidth - 10, y: wheelY, radius: 2.5, fill: '#888' });

        this.carGroup.add(bodyRect, roofRect, windowRect, w1, w2, w1_in, w2_in);
        this.entityLayer.add(this.carGroup);
        
        this.carGroup.on('click tap', () => this.triggerJump());
    }

    private initHudText(width: number): void {
        if (!this.hudLayer) return;

        this.starLabel = new Konva.Text({
            x: 20, y: 10,
            text: `${CONFIG.EMOJI.POINTS} ${this.starCount}`,
            fontSize: 20, fill: '#ffca28', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: 'black', strokeWidth: 1, shadowBlur: 2
        });

        this.damageLabel = new Konva.Text({
            x: width - 120, y: 10,
            text: `${CONFIG.EMOJI.OBSTACLE} ${this.hitCount}/${this.maxHits}`,
            fontSize: 20, fill: 'white', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: 'black', strokeWidth: 0.5, shadowBlur: 2
        });

        this.hudLayer.add(this.starLabel, this.damageLabel);
    }

    // -------------------------------------------------------------------------
    // view Logic & Animation
    // -------------------------------------------------------------------------

    private startAnimation(): void {
        this.animation = new Konva.Animation((frame) => {
            if (!frame) return;
            const dt = frame.timeDiff / 1000;
            
            if (this.isBroken) {
                if (this.carGroup) this.carGroup.rotation(5);
                this.updateSmoke(dt);
                return; 
            }

            this.updateAiBehavior(dt);
            this.updateEntities(dt); 
            this.updatePlane(dt);
            this.updateSmoke(dt);    
            
            if (this.carGroup && !this.isJumping) {
                 const vibe = this.isBoosting ? 1.5 : 0.2;
                 const freq = this.isBoosting ? 50 : 150; 
                 const wobble = Math.sin(frame.time / freq) * vibe;
                 this.carGroup.offsetY(wobble); 
            }

        }, this.entityLayer); 
        this.animation.start();
    }

    private updateEntities(dt: number): void {
        if (!this.stage || !this.carGroup) return;
        const speed = this.currentSpeed;

        if (this.roadLine) {
            const dashSpeed = speed * CONFIG.SPEED.ROAD_FACTOR;
            // road line direction
            this.roadLine.dashOffset(this.roadLine.dashOffset() + dashSpeed * dt);
            this.backgroundLayer?.batchDraw(); 
        }

        const updateItem = (item: Konva.Shape) => {
            item.x(item.x() - speed * dt);
            
            if (this.checkCollision(this.carGroup!, item)) {
                 const type = item.getAttr('itemType');
                 
                 if (type === 'star') {
                     this.starCount++;
                     this.updateColorProgress();
                     this.spawnFloatingText('star', '+1');
                 }
                 if (type === 'obstacle') {
                     this.hitCount++;
                     this.spawnFloatingText('obstacle', 'OUCH!');
                     this.carGroup!.opacity(0.5);
                     setTimeout(() => this.carGroup!.opacity(1), 200);
                     
                     this.spawnSmoke(); 
                     if (this.hitCount > 1) this.triggerCarSweat();
                     if (this.hitCount >= this.maxHits && !this.isBroken) this.markBroken();
                 }
                 this.updateHud();
                 item.destroy();
                 return false; 
            }
            if (item.x() < -50) {
                item.destroy();
                return false;
            }
            return true;
        };

        this.starsOnRoad = this.starsOnRoad.filter(s => updateItem(s));
        this.obstaclesOnRoad = this.obstaclesOnRoad.filter(o => updateItem(o));
        
        if (this.hitCount > 0 && Math.random() < CONFIG.PROB.SMOKE_SPAWN) {
            this.spawnSmoke();
        }
    }

    private updateAiBehavior(dt: number): void {
        if (this.isBoosting || this.isBroken) return;

        this.boostTimer += dt;
        if (this.boostTimer > 2.0 && !this.isJumping) {
            if (Math.random() < CONFIG.PROB.AI_BOOST) {
                this.triggerBoost(CONFIG.DURATION.BOOST_AI);
                this.boostTimer = 0;
            }
        }
    }

    public handleStateResult(isCorrect: boolean): void {
        if (isCorrect) {
            this.spawnItemOnRoad('star');
            this.triggerBoost(CONFIG.DURATION.BOOST_QUIZ);
            if (Math.random() > CONFIG.PROB.PLANE_FLY) {
                const progress = this.totalStarsGoal > 0 ? this.starCount / this.totalStarsGoal : 0;
    
                const showBanner = progress >= 0.5; 
            
                this.triggerPlaneFlyover(showBanner);
            }
        } else {
            this.spawnItemOnRoad('obstacle');
            setTimeout(() => {
                 this.currentSpeed = CONFIG.SPEED.BASE * CONFIG.SPEED.PENALTY_MULTI;
                 if (this.isBoosting) this.endBoost();
            }, 400);
            
            setTimeout(() => {
                if (!this.isBroken && !this.isBoosting) this.currentSpeed = CONFIG.SPEED.BASE;
            }, CONFIG.DURATION.PENALTY + 400);
        }
    }

    private spawnItemOnRoad(type: 'star' | 'obstacle') {
        if (!this.entityLayer || !this.stage) return;
        const item = new Konva.Text({
            x: this.stage.width() + 50, 
            y: this.roadY - 25, 
            text: type === 'star' ? CONFIG.EMOJI.POINTS : CONFIG.EMOJI.OBSTACLE,
            fontSize: 24
        }) as unknown as Konva.Shape;
        
        item.setAttr('itemType', type);
        if (type === 'star') this.starsOnRoad.push(item as any);
        else this.obstaclesOnRoad.push(item as any);
        this.entityLayer.add(item);
    }

    private checkCollision(r1Node: Konva.Node, r2Node: Konva.Node): boolean {
        const r1 = r1Node.getClientRect();
        const r2 = r2Node.getClientRect();
        const margin = 8; 
        return !(
            r2.x > r1.x + r1.width - margin ||
            r2.x + r2.width < r1.x + margin ||
            r2.y > r1.y + r1.height - margin ||
            r2.y + r2.height < r1.y + margin
        );
    }

    // feedback emoji when hit
    private triggerCarSweat(): void {
        if (!this.carGroup) return;
        const sweat = new Konva.Text({
            text: CONFIG.EMOJI.FEEDBACK, fontSize: 28,
            x: 15, y: -40, opacity: 0
        });
        this.carGroup.add(sweat);
        new Konva.Tween({
            node: sweat, duration: 0.5, y: sweat.y() - 15, opacity: 1,
            onFinish: () => {
                new Konva.Tween({
                    node: sweat, duration: 1.0, y: sweat.y() - 10, opacity: 0,
                    onFinish: () => sweat.destroy()
                }).play();
            }
        }).play();
    }

    private triggerJump(): void {
        if (this.isBroken || this.isJumping || !this.carGroup) return;
        this.isJumping = true;
        const jumpHeight = 40;
        new Konva.Tween({
            node: this.carGroup, y: this.carBaseY - jumpHeight,
            duration: 0.3, easing: Konva.Easings.EaseOut,
            onFinish: () => {
                new Konva.Tween({
                    node: this.carGroup!, y: this.carBaseY,
                    duration: 0.4, easing: Konva.Easings.BounceEaseOut,
                    onFinish: () => { this.isJumping = false; }
                }).play();
            }
        }).play();
    }

    private triggerBoost(duration: number): void {
        if (this.isBoosting || this.isBroken) return;
        this.isBoosting = true;
        this.currentSpeed = CONFIG.SPEED.BASE * CONFIG.SPEED.BOOST_MULTI;
        if (this.carGroup) {
            new Konva.Tween({
                node: this.carGroup, scaleX: CONFIG.SIZE.CAR_SCALE * 1.2, scaleY: CONFIG.SIZE.CAR_SCALE * 0.8, duration: 0.2
            }).play();
        }
        if (this.speedTimeout) clearTimeout(this.speedTimeout);
        this.speedTimeout = window.setTimeout(() => this.endBoost(), duration);
    }

    private endBoost(): void {
        if (this.isBroken) return; 
        this.isBoosting = false;
        this.currentSpeed = CONFIG.SPEED.BASE; 
        if (this.carGroup) {
            new Konva.Tween({
                node: this.carGroup, scaleX: CONFIG.SIZE.CAR_SCALE, scaleY: CONFIG.SIZE.CAR_SCALE,
                duration: 0.4, easing: Konva.Easings.ElasticEaseOut 
            }).play();
        }
    }

    private updateHud(): void {
        if (this.starLabel) this.starLabel.text(`${CONFIG.EMOJI.POINTS} ${this.starCount}`);
        if (this.damageLabel) this.damageLabel.text(`${CONFIG.EMOJI.OBSTACLE} ${this.hitCount}/${this.maxHits}`);
    }

    private spawnSmoke(): void {
        if (!this.carGroup || !this.entityLayer) return;
        const startX = this.carGroup.x();
        const startY = this.carGroup.y() + 15;
        const smoke = new Konva.Circle({
            x: startX, y: startY, radius: Math.random() * 4 + 4,
            fill: CONFIG.COLOR.SMOKE, opacity: 0.6
        });
        this.smokeParticles.push(smoke);
        this.entityLayer.add(smoke);
        smoke.moveToBottom();

        if (this.hitCount > 1) { 
            const fire = new Konva.Circle({
                x: startX + (Math.random()*6-3), y: startY, radius: Math.random()*4+2,
                fill: CONFIG.COLOR.FIRE, opacity: 0.9
            });
            this.smokeParticles.push(fire); 
            this.entityLayer.add(fire);
            fire.moveToBottom();
        }
    }

    private updateSmoke(dt: number): void {
        this.smokeParticles = this.smokeParticles.filter(p => {
            p.x(p.x() - 60 * dt); p.y(p.y() - 20 * dt); p.opacity(p.opacity() - 0.5 * dt);
            if (p.fill() === CONFIG.COLOR.FIRE && p.opacity() < 0.6) p.fill(CONFIG.COLOR.SMOKE);
            if (p.opacity() <= 0) { p.destroy(); return false; }
            return true;
        });
    }

    private spawnFloatingText(type: 'star' | 'obstacle', msg: string) {
        if (!this.carGroup || !this.entityLayer) return;
        const text = new Konva.Text({
            x: this.carGroup.x(), y: this.carGroup.y() - 30,
            text: msg, fontSize: 20, fontStyle: 'bold',
            fill: type === 'star' ? '#FFD700' : '#FF4500',
            shadowColor: 'black', shadowBlur: 2
        });
        this.entityLayer.add(text);
        new Konva.Tween({
            node: text, y: text.y() - 40, opacity: 0, duration: 0.8,
            onFinish: () => text.destroy()
        }).play();
    }

    private triggerPlaneFlyover(showBanner: boolean): void {
        if (!this.stage || this.planeGroup) return;
        const planeY = this.stage.height() * CONFIG.LAYOUT.PLANE_Y_FACTOR;
        this.planeGroup = new Konva.Group({ x: -200, y: planeY });
        
        const body = new Konva.Ellipse({ radiusX: 45, radiusY: 9, fill: CONFIG.COLOR.PLANE_BODY, stroke: '#999', strokeWidth: 1 });
        const cockpit = new Konva.Arc({ x: 25, y: -4, innerRadius: 0, outerRadius: 8, angle: 180, rotation: 0, fill: CONFIG.COLOR.PLANE_GLASS });
        const wing = new Konva.Ellipse({ x: 5, y: 2, radiusX: 10, radiusY: 32, fill: '#ccc', rotation: 30 });
        const tail = new Konva.RegularPolygon({ x: -38, y: -8, sides: 3, radius: 12, fill: '#999', rotation: -90 });

        this.planeGroup.add(tail, wing, body, cockpit);

        if (showBanner) {
            const bannerGroup = new Konva.Group({ x: -55, y: 0 });
            const text = new Konva.Text({ text: 'KEEP GOING!', fontSize: 12, fontFamily: 'Arial', fill: CONFIG.COLOR.BANNER_TEXT, padding: 4, fontStyle: 'bold' });
            const bg = new Konva.Rect({ width: text.width(), height: text.height(), fill: CONFIG.COLOR.BANNER_BG, cornerRadius: 4, stroke: '#cc9900', strokeWidth: 1 });
            const rope = new Konva.Line({ points: [20, 0, 0, 0], stroke: '#666', strokeWidth: 1 });
            
            bg.x(-bg.width()); bg.y(-bg.height()/2);
            text.x(-bg.width()); text.y(-bg.height()/2);
            bannerGroup.add(rope, bg, text);
            this.planeGroup.add(bannerGroup);
            bannerGroup.moveToBottom();
        }

        this.planeGroup.setAttr('velocity', CONFIG.SPEED.PLANE);
        this.entityLayer?.add(this.planeGroup);
    }

    private updatePlane(dt: number): void {
        if (!this.planeGroup || !this.stage) return;
        const vel = this.planeGroup.getAttr('velocity');
        this.planeGroup.x(this.planeGroup.x() + vel * dt);
        if (this.planeGroup.x() > this.stage.width() + 300) {
            this.planeGroup.destroy();
            this.planeGroup = null;
        }
    }

    private markBroken(): void {
        if (this.isBroken) return;
        this.isBroken = true;
        if (this.damageLabel) this.damageLabel.fill('#ff0000');
        if (this.onCarBrokenCallback) this.onCarBrokenCallback();
    }

    private updateBrokenCarAnimation(dt: number): void {
        if (this.carGroup) this.carGroup.rotation(5);
    }

    public reset(): void {
        this.isBroken = false;
        this.isBoosting = false;
        this.starCount = 0;
        this.hitCount = 0;
        this.progress = 0;
        this.updateHud();
        this.updateColorProgress();
        if (this.carGroup) this.carGroup.x(40).rotation(0); 
        this.starsOnRoad.forEach(s => s.destroy()); this.starsOnRoad = [];
        this.obstaclesOnRoad.forEach(o => o.destroy()); this.obstaclesOnRoad = [];
        this.smokeParticles.forEach(s => s.destroy()); this.smokeParticles = [];
    }

    public dispose(): void {
        this.ro?.disconnect();
        this.animation?.stop();
        this.stage?.destroy();
    }
    
    public debugTrigger(type: 'plane' | 'star' | 'hit'): void {
        if (type === 'plane') this.triggerPlaneFlyover(true);
        if (type === 'star') this.spawnItemOnRoad('star');
        if (type === 'hit') this.spawnItemOnRoad('obstacle');
    }
}