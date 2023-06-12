import { app, video } from "@microsoft/teams-js";

import { WebglVideoFilter } from "./webgl-video-filter";

app.initialize().then(() => {
// This is the effect for processing
let appliedEffect = {
  pixelValue: 100,
  proportion: 3,
};

let effectIds = {
  half: "c2cf81fd-a1c0-4742-b41a-ef969b3ed490",
  gray: "b0c8896c-7be8-4645-ae02-a8bc9b0355e5",
}

// This is the effect linked with UI
let uiSelectedEffect = {};
let selectedEffectId = undefined;
let errorOccurs = false;
let useSimpleEffect = false;
function simpleHalfEffect(videoFrame) {
  const maxLen =
    (videoFrame.height * videoFrame.width) /
      Math.max(1, appliedEffect.proportion) - 4;

  for (let i = 1; i < maxLen; i += 4) {
    //smaple effect just change the value to 100, which effect some pixel value of video frame
    videoFrame.videoFrameBuffer[i + 1] = appliedEffect.pixelValue;
  }
}

let canvas = new OffscreenCanvas(480,360);
let videoFilter = new WebglVideoFilter(canvas);
videoFilter.init();
//Sample video effect
function videoBufferHandler(videoFrame, notifyVideoProcessed, notifyError) {
  switch (selectedEffectId) {
    case effectIds.half:
      simpleHalfEffect(videoFrame);
      break;
    case effectIds.gray:
      videoFilter.processVideoFrame(videoFrame);
      break;
    default:
      break;
  }

  //send notification the effect processing is finshed.
  notifyVideoProcessed();

  //send error to Teams if any
  // if (errorOccurs) {
  //   notifyError("some error message");
  // }
}

  async function videoStreamHandler(receivedVideoFrame) {

  const originalFrame = receivedVideoFrame.videoFrame;
  const buffer = new ArrayBuffer(originalFrame.allocationSize());
  await originalFrame.copyTo(buffer);
  const videoFrame = {
    width: originalFrame.codedWidth,
    height: originalFrame.codedHeight,
    videoFrameBuffer: new Uint8ClampedArray(buffer),
  }

  let notifyVideoProcessed, notifyError;

  const promise = new Promise((resolve, reject) => {
    notifyVideoProcessed = () => {
      resolve(
        new VideoFrame(videoFrame.videoFrameBuffer, {
          codedHeight: videoFrame.height,
          codedWidth: videoFrame.width,
          format: originalFrame.format,
          timestamp: originalFrame.timestamp,
        })
      );
    };
    notifyError = reject;
  });

  videoBufferHandler(videoFrame, notifyVideoProcessed, notifyError);
  return promise;
}

function clearSelect() {
  document.getElementById("filter-half").classList.remove("selected");
  document.getElementById("filter-gray").classList.remove("selected");
}

function effectParameterChanged(effectId) {
  console.log(effectId);
  if (selectedEffectId === effectId) {
    console.log('effect not changed');
    return;
  }
  selectedEffectId = effectId;

  clearSelect();
  switch (selectedEffectId) {
    case effectIds.half:
      console.log('current effect: half');
      document.getElementById("filter-half").classList.add("selected");
      return Promise.resolve();
    case effectIds.gray:
      console.log('current effect: gray');
      document.getElementById("filter-gray").classList.add("selected");
      return Promise.resolve();
    default:
      console.log('effect cleared');
      return Promise.resolve();
  }
}

video.registerForVideoEffect(effectParameterChanged);
video.registerForVideoFrame({
  videoBufferHandler: videoBufferHandler,
  videoFrameHandler: videoStreamHandler,
  config: {
    format: video.VideoFrameFormat.NV12,
  }
});

// any changes to the UI should notify Teams client.
const filterHalf = document.getElementById("filter-half");
filterHalf.addEventListener("click", function () {
  if (selectedEffectId === effectIds.half) {
    return;
  }
  video.notifySelectedVideoEffectChanged("EffectChanged", effectIds.half);
});
const filterGray = document.getElementById("filter-gray");
filterGray.addEventListener("click", function () {
  if (selectedEffectId === effectIds.gray) {
    return;
  }
  video.notifySelectedVideoEffectChanged("EffectChanged", effectIds.gray);
});
});
