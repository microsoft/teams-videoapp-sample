import "./fake-texture-stream-api";
import { app, video } from "@microsoft/teams-js";

app.initialize().then(() => {
  console.log("app.initialize() resolved");
  // This is the effect for processing
  let appliedEffect = {
    pixelValue: 100,
    proportion: 3,
  };

  let effectIds = {
    half: "c2cf81fd-a1c0-4742-b41a-ef969b3ed491",
    gray: "b0c8896c-7be8-4645-ae02-a8bc9b0355e1",
  };

  // This is the effect linked with UI
  let selectedEffectId = undefined;

  async function halfEffect(frame, data) {
    const maxLen =
      (frame.codedHeight * frame.codedWidth) /
        Math.max(1, appliedEffect.proportion) -
      4;

    for (let i = 1; i < maxLen; i += 4) {
      //smaple effect just change the value to 100, which effect some pixel value of video frame
      data[i + 1] = appliedEffect.pixelValue;
    }
    return data;
  }

  async function grayEffect(frame, data) {
    for (
      let i = frame.codedWidth * frame.codedHeight;
      i < data.byteLength;
      ++i
    ) {
      data[i] = 128;
    }
    return data;
  }

  async function videoFrameHandlerV2(receivedVideoFrame) {
    console.log("[frame] videoFrameHandlerV2 get called");
    try {
      const frame = receivedVideoFrame.frame;
      const buffer = new ArrayBuffer(frame.allocationSize());
      await frame.copyTo(buffer);
      const data = new Uint8ClampedArray(buffer);
      await (selectedEffectId === effectIds.half
        ? halfEffect(frame, data)
        : selectedEffectId === effectIds.gray
        ? grayEffect(frame, data)
        : undefined);
      const processedFrame = new VideoFrame(data.buffer, {
        timestamp: frame.timestamp,
        format: frame.format,
        codedHeight: frame.codedHeight,
        codedWidth: frame.codedWidth,
      });
      console.log("[frame] returning processed frame");
      return processedFrame;
    } catch (e) {
      console.error("error occurred in videoFrameHandlerV2", e);
    }
  }

  function clearSelect() {
    document.getElementById("filter-half").classList.remove("selected");
    document.getElementById("filter-gray").classList.remove("selected");
  }

  function effectParameterChanged(effectId) {
    console.log("effectParameterChanged called", "effectId=", effectId);
    if (selectedEffectId === effectId) {
      console.log("effect not changed");
      return;
    }
    selectedEffectId = effectId;

    clearSelect();
    switch (selectedEffectId) {
      case effectIds.half:
        console.log("current effect: half");
        document.getElementById("filter-half").classList.add("selected");
        break;
      case effectIds.gray:
        console.log("current effect: gray");
        document.getElementById("filter-gray").classList.add("selected");
        break;
      default:
        console.log("effect cleared");
        break;
    }

    if (selectedEffectId == effectIds.half) {
      return new Promise((r) => setTimeout(r, 1000));
    } else {
      return;
    }
  }

  console.log("calling registerForVideoEffect");
  video.registerForVideoEffect(effectParameterChanged);

  console.log("calling registerForVideoFrameV2");
  video.registerForVideoFrameV2(videoFrameHandlerV2, {
    format: "NV12",
  });

  // any changes to the UI should notify Teams client.
  const filterHalf = document.getElementById("filter-half");
  filterHalf.addEventListener("click", function () {
    if (selectedEffectId === effectIds.half) {
      return;
    }
    video.notifySelectedVideoEffectChanged(
      video.EffectChangeType.EffectChanged,
      effectIds.half
    );
  });
  const filterGray = document.getElementById("filter-gray");
  filterGray.addEventListener("click", function () {
    if (selectedEffectId === effectIds.gray) {
      return;
    }
    video.notifySelectedVideoEffectChanged(
      video.EffectChangeType.EffectChanged,
      effectIds.gray
    );
  });
});
