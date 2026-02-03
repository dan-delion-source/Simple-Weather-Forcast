class WeatherBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.weatherType = 'clear';
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setWeather(type) {
        this.weatherType = type;
        this.particles = [];
        this.initParticles();
    }

    initParticles() {
        const count = 100;
        if (this.weatherType === 'rain') {
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    speed: 10 + Math.random() * 20,
                    length: 10 + Math.random() * 20
                });
            }
        } else if (this.weatherType === 'snow') {
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    speed: 1 + Math.random() * 3,
                    radius: 1 + Math.random() * 3
                });
            }
        } else if (this.weatherType === 'cloudy') {
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    speed: 0.2 + Math.random() * 0.5,
                    radius: 100 + Math.random() * 200
                });
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Gradient background based on weather
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (this.weatherType === 'clear') {
            gradient.addColorStop(0, '#1e3c72');
            gradient.addColorStop(1, '#2a5298');
        } else if (this.weatherType === 'rain') {
            gradient.addColorStop(0, '#203a43');
            gradient.addColorStop(1, '#2c5364');
        } else if (this.weatherType === 'snow') {
            gradient.addColorStop(0, '#83a4d4');
            gradient.addColorStop(1, '#b6fbff');
        } else {
            gradient.addColorStop(0, '#3e5151');
            gradient.addColorStop(1, '#decba4');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';

        this.particles.forEach(p => {
            if (this.weatherType === 'rain') {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + p.length);
                this.ctx.stroke();
                p.y += p.speed;
                if (p.y > this.canvas.height) p.y = -p.length;
            } else if (this.weatherType === 'snow') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
                p.y += p.speed;
                p.x += Math.sin(p.y / 30);
                if (p.y > this.canvas.height) p.y = -p.radius;
            } else if (this.weatherType === 'cloudy') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                this.ctx.fill();
                p.x += p.speed;
                if (p.x - p.radius > this.canvas.width) p.x = -p.radius;
            }
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.WeatherBackground = WeatherBackground;
