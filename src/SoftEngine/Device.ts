import * as BABYLON from '../babylon.math'
import  { Camera } from './Camera'
import { Mesh } from './Mesh'

export class Device {
  // The size of the back buffer is equal to the number of
  // pixels to draw on the screen (W*H) * 4 (RGBA Values)
  private backBuffer    : ImageData
  private workingCanvas : HTMLCanvasElement
  private workingContext: CanvasRenderingContext2D
  private workingWidth  : number
  private workingHeight : number
  private fieldOfView   : number

  // Equivalent to backbuffer.data
  private backBufferData: any

  constructor (canvas: HTMLCanvasElement, fov: number) {
    this.workingCanvas  = canvas
    this.workingWidth   = canvas.width
    this.workingHeight  = canvas.height
    this.workingContext = this.workingCanvas.getContext("2d")
    this.fieldOfView    = fov
    // console.log(this.workingCanvas, this.workingContext, this.workingHeight, this.workingWidth)
  }

  /** Function to clear the back buffer */
  public clear = () : void => {
    // Clear with black colour by default
    this.workingContext.fillStyle = 'black'
    this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight)
    // Once cleared get associated image data to clear backbuffer
    this.backBuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight)
  }

  /** Function to flush the back buffer into the front buffer */
  public present = (): void => {
    this.workingContext.putImageData(this.backBuffer, 0, 0)
  }

  /** Function to put a pixel on the screen at X,Y coordinates */
  public putPixel = (x: number, y: number, color: BABYLON.Color4) : void => {
    this.backBufferData = this.backBuffer.data
    // As we have a 1-Dimensional Array for our backbuffer we
    // need to know the equivalent cell index in 1-Dimension
    // based on the 2D coordinates of the screen
    let index: number = ((x >> 0) + (y >> 0) * this.workingWidth) * 4

    // HTML5 Canvas uses RGBA colour space
    this.backBufferData[index]     = color.r * 255
    this.backBufferData[index + 1] = color.g * 255
    this.backBufferData[index + 2] = color.b * 255
    this.backBufferData[index + 3] = color.a * 255
    // console.log(this.backBufferData)
  }

  /** 
   * Function to take in 3-Dimensional coordinate and transforms them
   * into 2-Dimensional coordinates using the transformation
   * matrix
   */
  public project = (coordinate: BABYLON.Vector3,transMat: BABYLON.Matrix) : BABYLON.Vector2 => {
    let point = BABYLON.Vector3.TransformCoordinates(coordinate, transMat)
    // Coordinates in point will be based on coord system starting in the
    // in the center of the screen. This needs to be translated into
    // device coordinates (x=0, y=0 Top Left)
    let x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0
    let y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0
    
    return (new BABYLON.Vector2(x,y))
  }

  /**
   * Draw point calls putPixel() but culls points not visible on the screen
   */
  public drawPoint = (point: BABYLON.Vector2) : void => {
    if (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x <= this.workingWidth &&
      point.y <= this.workingHeight
    ) {
      this.putPixel(point.x, point.y, new BABYLON.Color4(1, 1, 1, 1))
    }
  }

  /** Method to compute vertex projection for each frame */
  public render = (camera: Camera, meshes: Mesh[]) : void => {
    let aspectRatio = this.workingWidth / this.workingHeight

    let ViewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up())
    let projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(this.fieldOfView, aspectRatio, 0.01, 1)

    meshes.forEach(mesh => {
      let worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(mesh.Rotation.y, mesh.Rotation.x, mesh.Rotation.z)
      .multiply(BABYLON.Matrix.Translation(mesh.Position.x, mesh.Position.y, mesh.Position.z))

      let transformationMatrix = worldMatrix.multiply(ViewMatrix).multiply(projectionMatrix)

      mesh.Vertices.forEach(vertex => {
        let projectedPoint = this.project(vertex, transformationMatrix)
        this.drawPoint(projectedPoint)
      })
    });
  }

}

