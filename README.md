# This repo demonstrates a minimal Teams video app.

## Develop video app in local and debug it in test-app

1. Clone this repo open terminal
2. `cd` to the directory of README.md
3. run `yarn install`
4. run `yarn start-app`, this will host the app in locl environment or you can host the `app` folder on other place can access.
5. copy `https://localhost:8000/index.html` or url if you host on the palce to test-app 'Video app url' input box and then click 'Load' button.
6. change `videoFrameHandler` function in `app/index.js`
7. This sample processes the video frame in main thread for simplicity, you can move the frame processing to worker thread if needed.


## Teams Video API reference
#### You can find the Teams video extensibility API [link](https://github.com/OfficeDev/microsoft-teams-library-js/blob/master/src/public/video.ts)

### API reference
There are three API for video extensibility
```javascript
registerForVideoFrame(frameCallback, config) 
```
#### Register a callback to get: 
- video frames from video pipeline.
- a callback to return processed video frames to video pipeline. 
- a callback to notify error 

```javascript
registerForVideoEffect(callback)
```
- Get notification that the selected effect in video app’s UI should be applied
```javascript
 notifySelectedVideoEffectChanged(
    effectChangeType,
    effectId,
  ) 
  ```
  - Whenever the user selects a different effect in a video app, the video app should call this API to notify Teams client. 
## How to use the test app?

1. Test-app was used to develop/verify video app, you can find the test-app under the `test-app` folder, copy and unzip to other folder. Ensure you are in Windows, and your computer has a camera. Use OBS virtual camera if you don't have a camera.
2. After the application is opened, select a camera device in the 'Camera' drop down.
3. Input your video app's url. Deploying the video app in https server is preferred.
4. Click `Load video app`. The example video app will be loaded if the `Video app url` is blank.

## How to test performance?

1. Load video app following commands in the above section.
2. To evaluate processing time, click `Real-time Evaluation` or `Full Evaluation` under `Time per Frame'. 
    - `Real-time Evaluation` logs the average and range of processing time in millisecond in each second.
    - `Full Evaluation` logs both the processing time and the distribution of processing time.
3. To evaluate memory usage, click `Real-time Evaluation` or `Full Evaluation` under `Memory Usage'. 
    - `Real-time Evaluation` logs the average and range of both active heap size and total heap size for each frame.
    - `Full Evaluation` logs both the heap size and the distribution of heap size.
4. To test video app under different resolutions, click `Reduce the resolution by half`, `Same`, or `Double the resolution`. 


## How to change to your own video app?

1. Click `Destroy video app` if you have already loaded the example video app.
2. Input your video app's url.
3. Click `Load video app`.

## How to change camera resolution?

We can change the video frame resolution by changing this configuration file: `%appdata%\Roaming\Microsoft\electron\SkypeRT\persistent.conf`

Please append the following key-value to the json file: `"RtmCodecsConfig": {"MinVideoSourceResolution":"83886800", "MaxVideoSourceResolution":"83886800"}`

Here are the allowed number corresponding to specific resolution:

```
(640, 360)   = 0x02800168 = 41943400
(1280, 720)  = 0x050002D0 = 83886800
(1920, 1080) = 0x07800438 = 125830200
```

After saving the persistent.conf, restart the test-app, it should grab video frame from camera with the given resolution.
 
The RtmCodecsConfig key-value will be removed every time restarting the test-app, it's expected. But the resolution will be remembered in the test-app future running.

## There's no device shown in the 'Camera' dropdown.

1. Make sure your camera has been plugged into your computer.
2. Delete `%appdata%\Microsoft\electron` folder.
## Install the video app in Teams
1. Host the app directory in a public accessible HTTPS server. You can use github page as the host.
2. Replace the `name`, `appId`, and `contentUrl` in `manifest/manifest.json`.
    1. The contentUrl should point to your app directory, like `https://github.com/microsoft/teams-videoapp-sample/app/`
    2. appId can be any unique GUID
3. zip the manifest directory, choose the zip file after clicking Upload a custom app
4. Go to a teams meeting, enable the video, and activate the video app.
5. You can get more information on [Video app developer guide](https://github.com/microsoft/teams-videoapp-sample/wiki/Teams-Video-App-Developer-Guide)


## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
