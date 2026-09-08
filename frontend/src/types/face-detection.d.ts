interface FaceDetector {
  detect(source: CanvasImageSource | ImageBitmap | ImageData): Promise<DetectedFace[]>
}

interface DetectedFace {
  boundingBox: DOMRectReadOnly
  landmarks?: object[]
}

interface Window {
  FaceDetector?: new () => FaceDetector
}
