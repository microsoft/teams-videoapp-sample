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
    videoFrame.data[i + 1] = appliedEffect.pixelValue;
  }
}

let canvas = new OffscreenCanvas(480,360);
let videoFilter = new WebglVideoFilter(canvas);
videoFilter.init();
//Sample video effect
function videoFrameHandler(videoFrame, notifyVideoProcessed, notifyError) {
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

async function videoFrameHandlerV2(receivedVideoFrame) {
  try{
    if (selectedEffectId !== effectIds.half) {
      return Promise.resolve(receivedVideoFrame.frame);
    }
    const frame = receivedVideoFrame.frame;
    const buffer = new ArrayBuffer(frame.allocationSize());
    await frame.copyTo(buffer);
    const data = new Uint8ClampedArray(buffer);
    const maxLen =
      (frame.codedHeight * frame.codedWidth) /
        Math.max(1, appliedEffect.proportion) - 4;
  
    for (let i = 1; i < maxLen; i += 4) {
      //smaple effect just change the value to 100, which effect some pixel value of video frame
      data[i + 1] = appliedEffect.pixelValue;
    }
    const processedFrame = new VideoFrame(data.buffer, {
      timestamp: frame.timestamp,
      format: frame.format,
      codedHeight: frame.codedHeight,
      codedWidth: frame.codedWidth,
      // frame.colorSpace might be null
      //colorSpace: frame.colorSpace,
    });
    return processedFrame;
  }catch(e){
    console.log(`debug: error occurs: ${e}`);
  }
  

  // if (!ctx) {
  //   console.log('simpleHalfEffect: ctx is null');
  //   return frame;
  // }
  // const width = frame.codedWidth;
  // const height = frame.codedHeight;
  // canvas.width = width;
  // canvas.height = height;
  // const timestamp = frame.timestamp || undefined;
  // ctx?.drawImage(frame, 0, 0);
  // ctx.shadowColor = '#000';
  // ctx.shadowBlur = 20;
  // ctx.lineWidth = 50;
  // ctx.strokeStyle = '#000';
  // ctx.strokeRect(0, 0, width, height);
  // return Promise.resolve(new VideoFrame(canvas, { timestamp }));
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
      break;
    case effectIds.gray:
      console.log('current effect: gray');
      document.getElementById("filter-gray").classList.add("selected");
      break;
    default:
      console.log('effect cleared');
      break;
  }
}

video.registerForVideoEffect(effectParameterChanged);
// video.registerForVideoFrame(videoFrameHandler, {
//   format: "NV12",
// });

video.registerForVideoFrameV2(videoFrameHandlerV2, {
  format: "NV12",
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
