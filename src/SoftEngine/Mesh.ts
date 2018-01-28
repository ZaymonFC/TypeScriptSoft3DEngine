import * as BABYLON from '../babylon.math'

//
// ─── CLASS FOR MESH OBJECT ──────────────────────────────────────────────────────
//
export interface Face {
  A: number
  B: number
  C: number
}

export class Mesh {
  Position: BABYLON.Vector3
  Rotation: BABYLON.Vector3
  Vertices: BABYLON.Vector3[]
  Faces   : Face[]

  constructor (public name: string, verticesCount: number, faceCount: number) {
    this.Vertices = new Array(verticesCount)
    this.Faces    = new Array(faceCount)
    this.Position = BABYLON.Vector3.Zero()
    this.Rotation = BABYLON.Vector3.Zero()
  }
}
