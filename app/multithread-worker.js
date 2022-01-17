onmessage = function (e) {
  const { videoFrame, appliedEffect } = e.data;
  const maxLen =
    (videoFrame.height * videoFrame.width) /
    Math.max(1, appliedEffect.proportion) - 4;

  for (let i = 1; i < maxLen; i += 4) {
    //smaple effect just change the value to 100, which effect some pixel value of video frame
    videoFrame.data[i + 1] = appliedEffect.pixelValue;
  }

  setTimeout(() => {
    postMessage({ status: "processed" });
  }, 300);
};
