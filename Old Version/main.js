// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Increase intensity to brighten the scene
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increase intensity for a brighter effect
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Set up the camera
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.9, 10000);
camera.position.set(0, 1, 5); // Adjusted camera position
camera.lookAt(0, 0, 0); // Ensure camera is looking at the scene's center

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Improve rendering quality on high DPI screens
document.getElementById('scene-container').appendChild(renderer.domElement);

// Create a parent group for rotation
const rotationGroup = new THREE.Group();
scene.add(rotationGroup);

// Create a Galaxy with randomly colored stars
let stars;
const createStars = true; // Set to true if you want to enable stars

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
    rotationGroup.add(stars); // Add stars to the rotation group
}

// Update star size on resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust pixel ratio on resize
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update star size based on screen width
    if (stars) {
        stars.material.size = getStarSize();
    }
});

// Create DRACOLoader and GLTFLoader
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const loader = new THREE.GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let jetModel, jetModel2, jetModel3;
function loadModel() {
    return new Promise((resolve, reject) => {
        loader.load('models/fyre_jet_ship_compressed.glb', (gltf) => {
            jetModel = gltf.scene;

            // Adjust materials for brightness and reflection
            jetModel.traverse((child) => {
                if (child.isMesh) {
                    const material = child.material;

                    if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
                        material.emissive = new THREE.Color(0xaaaaaa);
                        material.emissiveIntensity = 0.125;
                        material.metalness = 0.85;
                        material.roughness = 0.5;
                    }
                }
            });

            // Scale and position the first jet model
            jetModel.scale.set(0.3, 0.3, 0.3);
            jetModel.position.set(-20, 1, 0); // Start position of the first jet
            rotationGroup.add(jetModel);

            // Create a second jet model by cloning the first one
            jetModel2 = jetModel.clone();
            jetModel2.position.set(-25, 1, -2); // Position it slightly behind the first jet
            rotationGroup.add(jetModel2);

            // Create a third jet model by cloning the first one
            jetModel3 = jetModel.clone();
            jetModel3.position.set(-30, 1, -4); // Position it slightly behind the second jet
            rotationGroup.add(jetModel3);

            resolve(jetModel);

            // Hide the loader
            document.getElementById('loader').style.display = 'none';
        }, undefined, (error) => {
            reject(error);
        });
    });
}

loadModel().then(() => {
    console.log('Model loaded successfully');
}).catch((error) => {
    console.error('Error loading model:', error);
});

// Create a clock to keep track of time
const clock = new THREE.Clock();

// Variables to control the movement
const startX = -20; // Start position off-screen to the left
const endX = 25; // End position off-screen to the right
const moveSpeed = 5; // Speed of the movement (adjust as needed)

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Get the elapsed time since the last frame
    const delta = clock.getDelta();

    // Update the position of the first jet model
    if (jetModel) {
        jetModel.position.x += moveSpeed * delta;

        // Reset position when the model moves off-screen
        if (jetModel.position.x > endX) {
            jetModel.position.x = startX;
        }
    }

    // Update the position of the second jet model
    if (jetModel2) {
        jetModel2.position.x += moveSpeed * delta;

        // Reset position when the second model moves off-screen
        if (jetModel2.position.x > endX) {
            jetModel2.position.x = startX - 5; // Slight delay compared to the first jet
        }
    }

    // Update the position of the third jet model
    if (jetModel3) {
        jetModel3.position.x += moveSpeed * delta;

        // Reset position when the third model moves off-screen
        if (jetModel3.position.x > endX) {
            jetModel3.position.x = startX - 10; // Slight delay compared to the second jet
        }
    }

    // Rotate the stars
    rotationGroup.rotation.y += 0.25 * delta;

    // Render the scene
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust pixel ratio on resize
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Wheel Listenenr Event 
window.addEventListener('wheel', (event) => {
    if (jetModel) {
        const deltaY = event.deltaY;
        const windowHeight = window.innerHeight;

        // Calculate new positions based on scroll
        const x = jetModel.position.x - deltaY / windowHeight;
        const y = jetModel.position.y - deltaY / windowHeight;

        jetModel.position.set(x, y, 0);
    } else {
        console.warn('Jet model is not loaded yet.');
    }

    if (jetModel2) {
        const deltaY = event.deltaY;
        const windowHeight = window.innerHeight;

        // Calculate new positions based on scroll
        const x = jetModel2.position.x - deltaY / windowHeight;
        const y = jetModel2.position.y - deltaY / windowHeight;

        jetModel2.position.set(x, y, 0);
    } else {
        console.warn('Second jet model is not loaded yet.');
    }
});

// Handle keydown event
window.addEventListener('keydown', (event) => {
    if (jetModel) {
        const key = event.key;
        const moveDistance = 0.05;

        let x = jetModel.position.x;
        let y = jetModel.position.y;

        if (key === 'ArrowUp') {
            y += moveDistance;
        } else if (key === 'ArrowDown') {
            y -= moveDistance;
        } else if (key === 'ArrowLeft') {
            x -= moveDistance;
        } else if (key === 'ArrowRight') {
            x += moveDistance;
        }

        jetModel.position.set(x, y, 0);
    } else {
        console.warn('Jet model is not loaded yet.');
    }

    if (jetModel2) {
        const key = event.key;
        const moveDistance = 0.05;

        let x = jetModel2.position.x;
        let y = jetModel2.position.y;

        if (key === 'ArrowUp') {
            y += moveDistance;
        } else if (key === 'ArrowDown') {
            y -= moveDistance;
        } else if (key === 'ArrowLeft') {
            x -= moveDistance;
        } else if (key === 'ArrowRight') {
            x += moveDistance;
        }

        jetModel2.position.set(x, y, 0);
    } else {
        console.warn('Second jet model is not loaded yet.');
    }
});

// Handle scroll event
window.addEventListener('scroll', () => {
    if (jetModel) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Calculate the new position of the jet model
        const t = scrollY / (documentHeight - windowHeight); // Normalized scroll position
        const x = 2 * (1 - t) - 1; // Map scroll position to x-axis (-1 to 1)
        const y = 1 - 2 * t; // Map scroll position to y-axis (1 to -1)

        jetModel.position.set(x, y, 0); // Update model position based on scroll
    } else {
        console.warn('Jet model is not loaded yet.');
    }

    if (jetModel2) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Calculate the new position of the second jet model
        const t = scrollY / (documentHeight - windowHeight); // Normalized scroll position
        const x = 2 * (1 - t) - 1; // Map scroll position to x-axis (-1 to 1)
        const y = 1 - 2 * t; // Map scroll position to y-axis (1 to -1)

        jetModel2.position.set(x, y, 0); // Update model position based on scroll
    } else {
        console.warn('Second jet model is not loaded yet.');
    }
});

// Debugging
console.log("main.js loaded");
console.log("Scene children:", scene.children);
