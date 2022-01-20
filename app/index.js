microsoftTeams.initialize(() => {}, [
  "https://microsoft.github.io",
]);

// This is the effect for processing
let appliedEffect = {
  pixelValue: 100,
  proportion: 3,
};

// This is the effect linked with UI
let uiSelectedEffect = {};
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

  if (useSimpleEffect) {
    simpleHalfEffect(videoFrame);
  } else {
    videoFilter.processVideoFrame(videoFrame);
  }
 
  //send notification the effect processing is finshed.
  notifyVideoProcessed();
  
  //send error to Teams if any
  // if (errorOccurs) {
  //   notifyError("some error message");
  // }
}

function effectParameterChanged(effectId) {
  console.log(effectId);
  if (effectId === undefined) {
    //todo If effectName is undefined, need to clear the effect selected status.

  } else {
      if (effectId === "c2cf81fd-a1c0-4742-b41a-ef969b3ed490") {
        useSimpleEffect = true;
      } else if (effectId === "b0c8896c-7be8-4645-ae02-a8bc9b0355e5") {
        useSimpleEffect = false;
      }
    }
  }

microsoftTeams.appInitialization.notifySuccess();
microsoftTeams.video.registerForVideoEffect(effectParameterChanged);
microsoftTeams.video.registerForVideoFrame(videoFrameHandler, {
  format: "NV12",
});

// any changes to the UI should notify Teams client.
document.getElementById("enable_check").addEventListener("change", function () {
  if (this.checked) {
    microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged");
  } else {
    microsoftTeams.video.notifySelectedVideoEffectChanged("EffectDisabled");
  }
});
document.getElementById("proportion").addEventListener("change", function () {
  uiSelectedEffect.proportion = this.value;
  microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged");
});
document.getElementById("pixel_value").addEventListener("change", function () {
  uiSelectedEffect.pixelValue = this.value;
  microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged");
});
