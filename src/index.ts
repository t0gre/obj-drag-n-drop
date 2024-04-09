import { 
  Scene, 
  PerspectiveCamera, 
  AmbientLight, 
  DirectionalLight, 
  WebGLRenderer, 
  Group,
  Vector3,
 } from "three";


import { MTLLoader, OBJLoader, OrbitControls } from "three/examples/jsm/Addons.js";

const CAMERA_START = new Vector3(0, 0, 10);


export async function main(canvas: HTMLCanvasElement) {

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor('white');
  renderer.shadowMap.enabled = true;
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight);
 

  const controls = new OrbitControls(camera, canvas);

  camera.position.copy(CAMERA_START);

  let model: Group | undefined = undefined;
  
  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();

  mtlLoader.load('/cube/default.mtl', (mtl) => {
    
    mtl.preload();
    objLoader.setMaterials(mtl);
    objLoader.load('/cube/cube.obj', (root: Group) => {
      
      model = root;
  
      scene.add(root)
  });
})

  const ambientLight = new AmbientLight(0xffffff, 0.1);
  const directionalLight = new DirectionalLight(0xff11ff, 0.8);
  directionalLight.translateX(1);
  directionalLight.translateY(2);
  
  scene.add(ambientLight, directionalLight, camera);

  let oldTimestamp = 0;
  function animate(newTimestamp: number): void {
      if (!oldTimestamp) {
          oldTimestamp = newTimestamp;
      } else {
          renderer.render(scene, camera);
          oldTimestamp = newTimestamp;
      }
     
      requestAnimationFrame(animate)
  }
  
  requestAnimationFrame(animate)
  window.addEventListener('resize', () => {
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newHeight, newHeight, false)
  })



}
