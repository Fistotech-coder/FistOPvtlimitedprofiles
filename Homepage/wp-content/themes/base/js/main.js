let planes,
    scene,
    camera,
    renderer,
    orbit,
    hemilight,
    spotlight,
    cube,
    bust,
    darkmaterial;

planes = [];

let properties = {
    planespeed: 0.0025,
    planerotation: 5.2,
    speed: 0.002,
    lightcolor: "#9999ff",
    lightpower: 3.783,
    lightheight: 50,
    lightposition: -1.8,
    reflectivity: 1.6,
    roughness: 0.85,
    cameraFOV: 90,
    cameraX: 0,
    cameraY: -2.9,
    cameraZ: 33,
    wireframe: false,
    texturespeed: 1,
    viewOffsetX: 0,
    viewOffsetY: -90,
    textureOffsetX: 0,
    textureOffsetY: -0.93,
    textureScale: 1.1,
};

const gui = new dat.GUI({
    autoPlace: false
});
gui.domElement.id = "gui";

gui.add(properties, "lightpower", 0, 5);
gui.addColor(properties, "lightcolor").onChange(updateLightColor);
gui.add(properties, "lightheight", -50, 50);
gui.add(properties, "lightposition", -10, 10);
gui.add(properties, "reflectivity", 0, 4);
gui.add(properties, "roughness", 0, 1);
gui.add(properties, "wireframe");
gui.add(properties, "cameraFOV", 0, 90);
gui.add(properties, "cameraX", -40, 40);
gui.add(properties, "cameraY", -40, 40);
gui.add(properties, "cameraZ", -60, 60);
gui.add(properties, "texturespeed", -4, 4);
gui.add(properties, "viewOffsetX", -500, 500);
gui.add(properties, "viewOffsetY", -500, 500);
gui.add(properties, "textureOffsetX", -10, 10);
gui.add(properties, "textureOffsetY", -3.0, 0);
gui.add(properties, "textureScale", -1, 3);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffleArray(modelImages);

const textureCount = modelImages.length;
let currentTexture = 0;

function loadTexture(url) {
    return new Promise((resolve) => {
        new THREE.TextureLoader().load(url, resolve);
    });
}

const loader = document.getElementById("loader");

function loadObj(url) {
    return new Promise((resolve) => {
        new THREE.OBJLoader().load(
            url,
            resolve,

            function(xhr) {
                loader.innerHTML =
                    Math.round((xhr.loaded / xhr.total) * 100) + "% loaded";
            },
            function(error) {
                console.log("An error happened");
            }
        );
    });
}

const loadingPromises = [];

const bustLoader = loadObj(
    "/wp-content/themes/base/models/bust-optimized-2.obj"
);

bustLoader.then((obj) => {
    bust = obj;
});

loadingPromises.push(bustLoader);

const textures = [];

modelImages.forEach((imageUrl) => {
    const promise = loadTexture(imageUrl);

    promise.then((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        textures.push(texture);
    });

    loadingPromises.push(promise);
});

let urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("show-control")) {
    document.getElementById("gui").appendChild(gui.domElement);
}

let height = window.innerHeight;
let width = window.innerWidth;

function updateLightColor(color) {
    var hex = parseInt(color.replace(/^#/, ""), 16);
    spotlight.color.setHex(hex);
}

function addGrids(scene) {
    const gridHelperA = new THREE.GridHelper(20, 35, 0x0000ff, 0x0000ff);
    gridHelperA.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    gridHelperA.position.x = -10;
    scene.add(gridHelperA);

    const gridHelperB = new THREE.GridHelper(20, 35, 0x0000ff, 0x0000ff);
    gridHelperB.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    gridHelperB.position.x = 10;
    scene.add(gridHelperB);

    const gridHelper2 = new THREE.GridHelper(20, 35, 0x0000ff, 0x0000ff);
    gridHelper2.position.z = 0;
    gridHelper2.applyMatrix4(new THREE.Matrix4().makeTranslation(10, 0, 0));
    gridHelper2.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    gridHelper2.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
    gridHelper2.applyMatrix4(new THREE.Matrix4().makeTranslation(20, 0, 0));
    scene.add(gridHelper2);

    const gridHelper3 = new THREE.GridHelper(20, 35, 0x0000ff, 0x0000ff);
    gridHelper3.position.z = 0;
    gridHelper3.applyMatrix4(new THREE.Matrix4().makeTranslation(-10, 0, 0));
    gridHelper3.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    gridHelper3.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
    gridHelper3.applyMatrix4(new THREE.Matrix4().makeTranslation(-20, 0, 0));
    scene.add(gridHelper3);
}

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(properties.cameraFOV);
    camera.position.set(0, 0, 30.2);

    spotlight = new THREE.SpotLight(0x9999ff, 2);
    spotlight.castShadow = true;
    spotlight.shadow.bias = -0.0001;
    spotlight.shadow.mapSize.width = 1024 * 4;
    spotlight.shadow.mapSize.height = 1024 * 4;
    scene.add(spotlight);

    geometry = new THREE.PlaneGeometry(15.5, 15, 1, 1, 1);
    material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(
            "/wp-content/themes/base/images/hand-drawn-lines.png"
        ),
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
    });
    shape = new THREE.Mesh(geometry, material);
    shape.position.z = 16;
    shape.position.x = 3.5;
    shape.position.y = 2.9;

    scene.add(shape);

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(width, height);

    renderer.setPixelRatio(window.devicePixelRatio / 2);

    window.addEventListener("resize", () => {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);

        // let reductionFactor = Math.min(1440, window.innerWidth);
        let reductionFactor = 1 / (window.innerWidth / 1440);
        let scalingFactor = 2;

        // console.log(reductionFactor * scalingFactor);

        // properties.cameraZ = 33 + (reductionFactor * scalingFactor - scalingFactor);

        // console.log(window.innerWidth / 100);
    });

    let canvas = document.getElementById("canvas");

    darkmaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        reflectivity: 1,
        metalness: 0,
        roughness: 0,
    });

    bustLoader.then(() => {
        bust.castShadow = true;
        bust.receiveShadow = true;
        bust.children[0].material = darkmaterial;
        bust.position.x = 0.8;
        bust.position.y = -9.5;
        bust.position.z = 12;
        bust.scale.set(3.5, 3.5, 3.5);

        canvas.appendChild(renderer.domElement);
        renderer.domElement.id = "renderer";

        gsap.to(".load-image", {
            autoAlpha: 0,
            duration: 0.3,
            ease: "none"
        });
        gsap.to("#loader", {
            autoAlpha: 0,
            duration: 1,
            ease: "none"
        });
        gsap.to("#renderer", {
            autoAlpha: 1,
            delay: 0.4,
            duration: 1,
            ease: "none",
        });

        // orbit = new THREE.Object3D();
        // orbit.rotation.order = "YXZ"; //this is important to keep level, so Z should be the last axis to rotate in order...
        // orbit.position.copy(bust.position);
        // scene.add(orbit);

        // orbit.add(camera);
    });

    Promise.all(loadingPromises).then(() => {
        darkmaterial.map = textures[currentTexture];

        scene.add(bust);

        gsap.to(properties, {
            cameraFOV: 70,
            duration: 2,
            ease: "power4.out",
            delay: 0.14,
        });

        setInterval(() => {
            const textureNumber = (currentTexture + 1) % textureCount;
            currentTexture = textureNumber;

            gsap.to(properties, {
                texturespeed: 100,
                duration: 0.5,
                ease: "power4.inOut",
            });

            setTimeout(() => {
                gsap.to(properties, {
                    texturespeed: 1,
                    duration: 1.4,
                    ease: "power4.out",
                });
                darkmaterial.map = textures[currentTexture];
            }, 500);
        }, 4000);

        animate();
    });
}

function updateCamera(fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
}

function animate() {
    renderer.render(scene, camera);

    darkmaterial.roughness = properties.roughness;
    darkmaterial.reflectivity = properties.reflectivity;
    darkmaterial.wireframe = properties.wireframe;
    if (darkmaterial.map) {
        darkmaterial.map.offset.y = properties.textureOffsetY;

        darkmaterial.map.offset.x += 0.001 * properties.texturespeed;

        if (darkmaterial.map.offset.x > 99) darkmaterial.map.offset.x = 0;

        darkmaterial.map.repeat.set(
            properties.textureScale,
            properties.textureScale
        );
    }

    spotlight.power = properties.lightpower;

    spotlight.position.set(
        camera.position.x + properties.lightposition,
        camera.position.y + properties.lightheight,
        camera.position.z + 5
    );

    camera.position.x = properties.cameraX;
    camera.position.y = properties.cameraY;
    camera.position.z = properties.cameraZ;

    camera.setViewOffset(
        width,
        height,
        properties.viewOffsetX,
        properties.viewOffsetY,
        width,
        height
    );

    updateCamera(properties.cameraFOV);

    requestAnimationFrame(animate);
}

init();

// document.addEventListener("mousemove", function (e) {
//   let scale = -0.0003;
//   orbit.rotateY(e.movementX * scale);
//   orbit.rotateX(e.movementY * scale);
//   orbit.rotation.z = 0; //this is important to keep the camera level..
// });

document.addEventListener("scroll", function(e) {
    properties.cameraY = -window.scrollY / 50 - 2.9;
    properties.viewOffsetY = window.scrollY / 10 - 90;

    if (window.scrollY > window.innerHeight) {
        document.getElementById("canvas").style.display = "none";
        document.getElementById("background").style.display = "none";
    } else {
        document.getElementById("canvas").style.display = "block";
        document.getElementById("background").style.display = "block";
    }
});