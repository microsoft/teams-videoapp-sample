// let video;


const render = async (track) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const processor = new MediaStreamTrackProcessor( {track: track} );
    const reader = processor.readable.getReader();
    while (true) {
        const result = await reader.read();
        if (result.done)
          break;
        let frame = result.value;
        //ctx.drawImage(frame, 0, 0, 480, 360);
        ctx.drawImage(frame, 0, 0);
        frame.close();
    }
    // const processedStream = new MediaStream();
    // const video = document.createElement('video');
    // video.width = 490;
    // video.height = 360;
    // document.body.appendChild(video);
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // processedStream.addTrack(track);
    // video.srcObject = processedStream;
    // video.play();
};

// video = document.createElement('video');
// video.width = 480;
// video.height = 360;
// document.body.appendChild(video);
// video.srcObject = processedStream;

// window.chrome.webview =  {
//     getTextureStream: () => Promise.resolve(
//         document.getElementById('streamSource')
//         .captureStream()),
//     registerTextureStream: (streamId, track) => {
//         render(track);
//     }
// }