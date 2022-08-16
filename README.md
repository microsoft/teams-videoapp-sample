# This repo demonstrates a minimal Teams video app.

## Develop video app in local and debug it in test-app

1. Clone this repo  and open terminal.
2. `cd` to the directory of README.md.
3. run `yarn install`.
4. run `yarn dev`, this will host the app in local environment or you can host the `src` folder on other place can access.
5. copy `https://127.0.0.1:5173/` or URL if you host on the place to test-app 'Video app url' input box and then click 'Load' button.
6. change `videoFrameHandler` function in `src/index.js`
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


## Sideload the video app in Teams
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
