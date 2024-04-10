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
import { SimpleDropzone } from "simple-dropzone";

const CAMERA_START = new Vector3(0, 0, 10);



export async function main(canvas: HTMLCanvasElement, dropZoneEl: HTMLDivElement, inputEl: HTMLInputElement) {



  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor('white');
  renderer.shadowMap.enabled = true;
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight);
 

   new OrbitControls(camera, canvas);

  camera.position.copy(CAMERA_START);

  let model: Group | undefined = undefined;
  
  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();

  const ambientLight = new AmbientLight(0xffffff, 0.1);
  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.translateX(1);
  directionalLight.translateY(2);
  
  scene.add(ambientLight, directionalLight, camera);

  const dropControl = new SimpleDropzone(dropZoneEl, inputEl)
  dropControl.on('drop', async ({files}: {files: Map<string,File>}) => {
     console.log(files.entries())

     let objUrl: string | undefined
     let originalMtlFile: File | undefined
     let mtlUrl: string | undefined
     const textureMap: Map<string, string> = new Map()

     for (const entry of files.entries()) {
        const [path, file] = entry;
        if (path.endsWith('.obj')) {
            objUrl = URL.createObjectURL(file) 
        } else if (path.endsWith('.mtl')) {
            originalMtlFile = file;
        } else {
            // it's a texture
            let pathPaths = path.split('/')
            pathPaths = pathPaths.slice(2) // distcard the root folder parts
            const resourcePath = pathPaths.join('\\')
            const newResourcePath = URL.createObjectURL(file).split('/').slice(-1).join('');
            textureMap.set(resourcePath, newResourcePath) 
           
        }

        
     }

     if (originalMtlFile) {
        let fileText = await originalMtlFile.text();
        for (const entry of textureMap.entries()) {
            // TODO handle case insensitvity
            fileText = fileText.replaceAll(entry[0], entry[1]);
        }
        mtlUrl = URL.createObjectURL(new File([fileText], 'mtl')) 
        
    } 
   
    if (mtlUrl) {
        // it's an obj with mtl file
        if (objUrl) {
            
            mtlLoader.load(mtlUrl, (mtl) => {

          
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load(objUrl, (root: Group) => {
            model = root;
            scene.add(root)
        });
        })
        } else {
            // mtl but no obj, that's a fail
            alert('obj malformed')
        }
    } else if (objUrl) {
        // obj without mtl is fine, just load it without materials
        objLoader.load(objUrl,
            (root: Group) => {
       
             model = root;
               
                   scene.add(root)
               });
    } else {
        // no obj or mtl, that's not an obj
        alert('thats not a obj')
    }

})
   
     
 

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
