import * as BABYLON from '../babylon.math'

//
// ─── CAMERA ─────────────────────────────────────────────────────────────────────
//
export class Camera {
  // Where the camera is in the world
  Position: BABYLON.Vector3
  // Where the camera is looking
  Target: BABYLON.Vector3

  constructor() {
    this.Position = BABYLON.Vector3.Zero()
    this.Target = BABYLON.Vector3.Zero()
  }
}
