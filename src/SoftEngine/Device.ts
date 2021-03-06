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

  /** 
   * Recursively draws a line between two points if the length is
   * greater than 2 pixels
   */
  public drawLine = (point0: BABYLON.Vector2, point1: BABYLON.Vector2) : void => {
    // Calculate the distance between the two points
    let lineDistance: number = point1.subtract(point0).length()

    // Base case
    if (lineDistance <= 2) { return }

    // Calculate the middle point of the specified line
    let middlePoint: BABYLON.Vector2 = point0.add((point1.subtract(point0).scale(0.5)))
    this.drawPoint(middlePoint)

    // Recurse
    this.drawLine(middlePoint, point0)
    this.drawLine(middlePoint, point1)
  }

  /** 
   * Uses Bresenham's line algorithm to draw an approximate raster between two points
   */
  public drawBLine = (point0: BABYLON.Vector2, point1: BABYLON.Vector2) : void => {
    let x0 = point0.x >> 0
    let x1 = point1.x >> 0
    let y0 = point0.y >> 0
    let y1 = point1.y >> 0

    let realDeltAx = Math.abs(x1 - x0)
    let realDeltAy = Math.abs(y1 - y0)
    let sx = (x0 < x1) ? 1 : -1
    let sy = (y0 < y1) ? 1 : -1
    let realError = realDeltAx - realDeltAy

    while(true) {
      this.drawPoint(new BABYLON.Vector2(x0, y0))
      // Check if the line is finished
      if ((x0 == x1) && (y0 == y1)) { break }
      
      let newError = 2 * realError

      if (newError > -realDeltAy) {
        realError -= realDeltAy
        x0 += sx
      }
      if (newError < realDeltAx) {
        realError += realDeltAx
        y0 += sy
      }
    }
  }

  /** Method to compute vertex projection for each frame */
  public render = (camera: Camera, meshes: Mesh[]) : void => {
    // Calculate the canvas aspect ratio
    let aspectRatio = this.workingWidth / this.workingHeight

    // Calculate the view matrix
    let ViewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up())

    // Calculate the projection matrix 
    let projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(this.fieldOfView, aspectRatio, 0.01, 1)

    /** Core Rendering Loop */
    meshes.forEach(mesh => {
      let worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(mesh.Rotation.y, mesh.Rotation.x, mesh.Rotation.z)
      .multiply(BABYLON.Matrix.Translation(mesh.Position.x, mesh.Position.y, mesh.Position.z))

      let transformationMatrix = worldMatrix.multiply(ViewMatrix).multiply(projectionMatrix)

      mesh.Faces.forEach(face => {
        let vertexA: BABYLON.Vector3 = mesh.Vertices[face.A]
        let vertexB: BABYLON.Vector3 = mesh.Vertices[face.B]
        let vertexC: BABYLON.Vector3 = mesh.Vertices[face.C]

        let pointA = this.project(vertexA, transformationMatrix)
        let pointB = this.project(vertexB, transformationMatrix)
        let pointC = this.project(vertexC, transformationMatrix)
        
        this.drawBLine(pointA, pointB)
        this.drawBLine(pointA, pointC)
        this.drawBLine(pointB, pointC)
      })
    })
  }
}
