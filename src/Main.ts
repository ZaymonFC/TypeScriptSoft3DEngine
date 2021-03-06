import * as SoftEngine from './SoftEngine/SoftEngine'
import * as BABYLON from './babylon.math'

let canvas: HTMLCanvasElement
let device: SoftEngine.Device
let mesh: SoftEngine.Mesh
let meshes: SoftEngine.Mesh[] = []
let camera: SoftEngine.Camera
let cameraFOV: number

export const drawingLoop = () => {
  device.clear()

  mesh.Rotation.x += 0.05
  mesh.Rotation.y += 0.05

  device.render(camera, meshes)

  device.present()
  requestAnimationFrame(drawingLoop)
}

export const init = () => {
  canvas = <HTMLCanvasElement>document.getElementById("HTMLCanvas")

  camera = new SoftEngine.Camera()
  cameraFOV = 0.80

  device = new SoftEngine.Device(canvas, cameraFOV)
  mesh = returnCubeMesh()
  meshes.push(mesh)

  camera.Position = new BABYLON.Vector3(0, 0, 10)
  camera.Target = new BABYLON.Vector3(0, 0, 0)

  requestAnimationFrame(drawingLoop)
}

document.addEventListener("DOMContentLoaded", init, false)

export const returnCubeMesh = () => {
  let mesh = new SoftEngine.Mesh("Cube", 8, 12);

  mesh.Vertices[0] = new BABYLON.Vector3(-1, 1, 1);
  mesh.Vertices[1] = new BABYLON.Vector3(1, 1, 1);
  mesh.Vertices[2] = new BABYLON.Vector3(-1, -1, 1);
  mesh.Vertices[3] = new BABYLON.Vector3(1, -1, 1);
  mesh.Vertices[4] = new BABYLON.Vector3(-1, 1, -1);
  mesh.Vertices[5] = new BABYLON.Vector3(1, 1, -1);
  mesh.Vertices[6] = new BABYLON.Vector3(1, -1, -1);
  mesh.Vertices[7] = new BABYLON.Vector3(-1, -1, -1);

  mesh.Faces[0] = { A: 0, B: 1, C: 2 };
  mesh.Faces[1] = { A: 1, B: 2, C: 3 };
  mesh.Faces[2] = { A: 1, B: 3, C: 6 };
  mesh.Faces[3] = { A: 1, B: 5, C: 6 };
  mesh.Faces[4] = { A: 0, B: 1, C: 4 };
  mesh.Faces[5] = { A: 1, B: 4, C: 5 };

  mesh.Faces[6] = { A: 2, B: 3, C: 7 };
  mesh.Faces[7] = { A: 3, B: 6, C: 7 };
  mesh.Faces[8] = { A: 0, B: 2, C: 7 };
  mesh.Faces[9] = { A: 0, B: 4, C: 7 };
  mesh.Faces[10] = { A: 4, B: 5, C: 6 };
  mesh.Faces[11] = { A: 4, B: 6, C: 7 };

  return mesh;
}


