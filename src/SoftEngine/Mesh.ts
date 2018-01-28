import * as BABYLON from '../babylon.math'

//
// ─── CLASS FOR MESH OBJECT ──────────────────────────────────────────────────────
//
export class Mesh {
  Position: BABYLON.Vector3
  Rotation: BABYLON.Vector3
  Vertices: BABYLON.Vector3[]

  constructor (public name: string, verticesCount: number) {
    this.Vertices = new Array(verticesCount)
    this.Position = BABYLON.Vector3.Zero()
    this.Rotation = BABYLON.Vector3.Zero()
  }
}
