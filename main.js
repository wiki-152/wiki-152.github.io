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

if (createStars) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
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

// Create DRACOLoader and GLTFLoader
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const loader = new THREE.GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let jetModel;
function loadModel() {
    return new Promise((resolve, reject) => {
        loader.load('models/fyre_jet_ship_compressed.glb', (gltf) => {
            jetModel = gltf.scene;

            // Assuming the model has multiple materials, adjust the brightness of all materials
            jetModel.traverse((child) => {
                if (child.isMesh) {
                    const material = child.material;

                    // Check if material is of type MeshStandardMaterial or MeshPhongMaterial
                    if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
                        // Increase the emissive intensity for a glow effect
                        material.emissive = new THREE.Color(0xaaaaaa); // Adjust this color as needed
                        material.emissiveIntensity = 0.125; // Adjust the intensity to make the model brighter

                        // Optionally, adjust other material properties
                        material.metalness = 0.85; // Increase metalness for more reflectivity
                        material.roughness = 0.5; // Adjust roughness
                    }
                }
            });

            jetModel.scale.set(0.3, 0.3, 0.3);
            jetModel.position.set(-1, 1, 0);
            rotationGroup.add(jetModel);
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Get the elapsed time since the last frame
    const delta = clock.getDelta();

    // Adjust rotation speed based on time elapsed
    rotationGroup.rotation.y += 0.25 * delta; // Adjust the multiplier to control the speed

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
});

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
});

// Debugging
console.log("main.js loaded");
console.log("Scene children:", scene.children);
