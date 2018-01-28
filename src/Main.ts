import * as SoftEngine from './SoftEngine/SoftEngine'
import * as BABYLON from './babylon.math'

let canvas   : HTMLCanvasElement
let device   : SoftEngine.Device
let mesh     : SoftEngine.Mesh
let meshes   : SoftEngine.Mesh[] = []
let camera   : SoftEngine.Camera
let cameraFOV: number

export const drawingLoop = () => {
  device.clear()

  mesh.Rotation.x += 0.1
  mesh.Rotation.y += 0.1

  device.render(camera, meshes)

  device.present()
  console.log("Testing")
  requestAnimationFrame(drawingLoop)
}

export const init = () => {
  canvas = <HTMLCanvasElement> document.getElementById("HTMLCanvas")
  mesh = new SoftEngine.Mesh("Cube", 8)
  
  camera = new SoftEngine.Camera()
  cameraFOV = 0.80
  
  device = new SoftEngine.Device(canvas, cameraFOV)

  mesh.Vertices[0] = new BABYLON.Vector3(-1, 1, 1)
  mesh.Vertices[1] = new BABYLON.Vector3(1, 1, 1)
  mesh.Vertices[2] = new BABYLON.Vector3(-1, -1, 1)
  mesh.Vertices[3] = new BABYLON.Vector3(-1, -1, -1)
  mesh.Vertices[4] = new BABYLON.Vector3(-1, 1, -1)
  mesh.Vertices[5] = new BABYLON.Vector3(1, 1, -1)
  mesh.Vertices[6] = new BABYLON.Vector3(1, -1, 1)
  mesh.Vertices[7] = new BABYLON.Vector3(1, -1, -1)
  meshes.push(mesh)
  
  camera.Position = new BABYLON.Vector3(0, 0, 10)
  camera.Target = new BABYLON.Vector3(0, 0, 0)
  
  requestAnimationFrame(drawingLoop)
}

document.addEventListener("DOMContentLoaded", init, false)




