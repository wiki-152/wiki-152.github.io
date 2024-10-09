// Create the scene, camera, and renderer for the 3D background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.9, 10000);
camera.position.set(0, 1, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.id = 'three-canvas';
document.body.appendChild(renderer.domElement);

const rotationGroup = new THREE.Group();
scene.add(rotationGroup);

let stars;
const createStars = true;

function getStarSize() {
    const screenWidth = window.innerWidth;
    return screenWidth <= 768 ? 5.0 : 0.5;
}

if (createStars) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        size: getStarSize(),
        vertexColors: true,
    });

    const starVertices = [];
    const starColors = [];
    const colorOptions = [0xffffff, 0xffd700, 0x87ceeb, 0xff4500];

    for (let i = 0; i < 25000; i++) {
        const x = (Math.random() - 0.5) * 20000;
        const y = (Math.random() - 0.5) * 20000;
        const z = (Math.random() - 0.5) * 20000;
        starVertices.push(x, y, z);

        const color = new THREE.Color(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    stars = new THREE.Points(starGeometry, starMaterial);
    rotationGroup.add(stars);
}

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (stars) {
        stars.material.size = getStarSize();
    }
});

function animate() {
    requestAnimationFrame(animate);
    rotationGroup.rotation.y += 0.0005;
    renderer.render(scene, camera);
}

animate();

// Pop-up greetings functionality
const greetings = [
    "Hello", "Hola", "Bonjour", "Hallo", "Ciao",
    "Konnichiwa", "Namaste", "Salaam", "Zdravstvuyte", "Annyeong"
];

function createGreeting(text) {
    const greeting = document.createElement('div');
    greeting.className = 'greeting';
    greeting.textContent = text;
    greeting.style.left = `${Math.random() * 80 + 10}%`;
    greeting.style.top = `${Math.random() * 80 + 10}%`;
    greeting.style.animation = 'pop-up 4s ease-in-out infinite';
    document.body.appendChild(greeting);

    setTimeout(() => {
        greeting.remove();
    }, 6000);
}

function generateGreetings() {
    setInterval(() => {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        createGreeting(randomGreeting);
    }, 1000);
}

// Initialize greetings
generateGreetings();
