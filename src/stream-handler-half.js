export class StreamHandlerHalfFilter {
  constructor(simpleHalfEffect) {
    this.simpleHalfEffect = simpleHalfEffect;
  }

  async processVideoFrame(originalFrame) {
    const buffer = new ArrayBuffer(originalFrame.allocationSize());
    // get video buffer from VideoFrame
    await originalFrame.copyTo(buffer);
    const videoFrame = {
      width: originalFrame.codedWidth,
      height: originalFrame.codedHeight,
      videoFrameBuffer: new Uint8ClampedArray(buffer),
    };
    this.simpleHalfEffect(videoFrame);
    return new VideoFrame(videoFrame.videoFrameBuffer, {
      codedHeight: videoFrame.height,
      codedWidth: videoFrame.width,
      format: originalFrame.format,
      timestamp: originalFrame.timestamp,
    });
  }
}
