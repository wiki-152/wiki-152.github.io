// Create the scene, camera, and renderer (unchanged from your existing setup)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Add lights for the scene
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Increase intensity for brighter ambient lighting
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Strong directional light
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.9, 10000);
camera.position.set(0, 1, 5);
camera.lookAt(0, 0, 0);

// Create the renderer and attach it to the DOM (integrate this part with your HTML)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Create a parent group for rotation
const rotationGroup = new THREE.Group();
scene.add(rotationGroup);

// Create a Galaxy with randomly colored stars
let stars;
const createStars = true; // Enable stars

function getStarSize() {
    const screenWidth = window.innerWidth;
    return screenWidth <= 768 ? 5.0 : 0.5; // Larger stars on mobile, smaller on desktop
}

if (createStars) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        size: getStarSize(),
        vertexColors: true,
    });

    const starVertices = [];
    const starColors = [];
    const colorOptions = [0xffffff, 0xffd700, 0x87ceeb, 0xff4500]; // Natural star colors

    // Generate star positions and colors
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
    rotationGroup.add(stars); // Add stars to the rotation group
}

// Handle window resize for responsive star sizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update star size on screen resize
    if (stars) {
        stars.material.size = getStarSize();
    }
});

// Animation loop to render the scene and apply rotations
function animate() {
    requestAnimationFrame(animate);

    // Rotate the stars slightly for a slow, dynamic background
    rotationGroup.rotation.y += 0.0005;

    renderer.render(scene, camera);
}

animate();
