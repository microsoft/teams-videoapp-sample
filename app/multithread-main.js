const FrameStatus = {
  fixed: "fixed",
  reserved: "reserved",
  processing: "processing",
  processed: "processed",
  available: "available",
};

class FramePool {
  constructor(size) {
    this.size = size;
    this.framePool = [];
    this.counter = 0;
    this.frameId = 1;
    this.lastProcessedFrame = null;
  }

  _removeFrameWithDifferentSize(byteLength) {
    let i = 0;
    while (i < this.framePool.length) {
      const currentFrame = this.framePool[i];
      if (
        (currentFrame.status === FrameStatus.available || currentFrame.status === FrameStatus.processed) &&
        currentFrame.data.byteLength !== byteLength
      ) {
        delete this.framePool[i];
        this.framePool.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  _findUsableFrame(length) {
    const availableFrames = this.framePool.filter((elem, idx) => {
      return (
        elem.status === FrameStatus.available && elem.data.byteLength === length
      );
    });

    if (availableFrames.length > 0) {
      return availableFrames[0];
    }

    return null;
  }

  markFrameAvailable(frame) {
    frame.status = FrameStatus.available;
  }

  getProsessedFrame(length) {
    const processedFrames = this.framePool
      .filter((elem, idx) => {
        return (
          elem.status === FrameStatus.processed &&
          elem.data.byteLength === length
        );
      })
      .sort((a, b) => {
        // if there are several processed frames, get one with biggest counter
        return b.counter - a.counter;
      })
      .map((elem) => {
        elem.status = FrameStatus.available;
        return elem;
      });
    if (processedFrames.length > 0) {
      return processedFrames[0];
    }
  }
  allocate(length) {
    this._removeFrameWithDifferentSize(length);

    let frame = this._findUsableFrame(length);
    if (frame !== null) {
      frame.counter = ++this.counter;
      frame.status = FrameStatus.reserved;
      return frame;
    }

    if (this.framePool.length < this.size) {
      frame = {
        id: this.frameId++,
        status: FrameStatus.reserved,
        data: new Uint8Array(new SharedArrayBuffer(length)),
        counter: this.counter++,
      };
      this.framePool.push(frame);
      return frame;
    }

    return null;
  }

  getLastProcessedFrame(byteLength) {
    if (this.lastProcessedFrame === null) {
      this.lastProcessedFrame = framePool.allocate(byteLength);
      this.lastProcessedFrame.status = FrameStatus.fixed;
    } else if (this.lastProcessedFrame.data.byteLength !== byteLength) {
      framePool.markFrameAvailable(this.lastProcessedFrame);
      this.lastProcessedFrame = framePool.allocate(byteLength);
      this.lastProcessedFrame.status = FrameStatus.fixed;
    }

    return this.lastProcessedFrame;
  }
  updateLastProcessedFrame(frame) {
    // swap data
    const tmp = this.lastProcessedFrame.data;
    this.lastProcessedFrame.data = frame.data;
    frame.data = tmp;
    this.lastProcessedFrame.counter = frame.counter;
  }
  print() {
    const lines = ["-------------- FramePool --------------"];
    lines.push();
    this.framePool.forEach((frame) => {
      lines.push(
        `id: ${frame.id}, status: ${frame.status}, counter: ${frame.counter}`
      );
    });
    console.log(lines.join("\n"));
  }
  increaseSize(size) {
      this.size += size;
  }
}


const WorkerStatus = {
    busy: 'busy',
    idle: 'idle',
}
class WorkerPool {
  constructor(size, script) {
    this.size = size;
    this.workers = [];
    this.script = script;
    this.workerId = 0;
    for (let i = 0; i < this.size; ++i) {
      // eager load the workers.
      this.workers.push({
        id: this.workerId++,
        status: WorkerStatus.idle,
        worker: new Worker(this.script),
      });
    }
  }

  _findAvailableWorker() {
    const myAvailableWorkers = this.workers.filter((worker) => {
      return worker.status === WorkerStatus.idle;
    });
    if (myAvailableWorkers.length === 0) {
      return null;
    }
    const myWorker = myAvailableWorkers[0];

    myWorker.status = WorkerStatus.busy;
    return myWorker;
  }

  _getAvailableWorker() {
    const myWorker = this._findAvailableWorker();
    if (myWorker) {
      return myWorker;
    }
    if (this.size > this.workers.length) {
      const worker = {
        id: this.workerId++,
        status: WorkerStatus.idle,
        worker: new Worker(this.script),
      };
      this.workers.push(worker);
      return worker;
    }
    return null;
  }

  addToWorker(videoFrame, frameData) {
    const myWorker = this._getAvailableWorker();
    if (!myWorker) {
      return false;
    }

    frameData.status = FrameStatus.processing;
    frameData.data.set(videoFrame.data);
    videoFrame.data = frameData.data;
    myWorker.counter = frameData.counter;
    myWorker.frameData = frameData;
    myWorker.worker.postMessage({ videoFrame, appliedEffect });
    myWorker.worker.onmessage = (e) => {
      myWorker.status = WorkerStatus.idle;
      frameData.status = FrameStatus.processed;
      myWorker.counter = null;
    };
    return true;
  }
  print() {
    const lines = ["=========== WORKER =============="];
    lines.push();
    this.workers.forEach((frame) => {
      lines.push(
        `id: ${frame.id}, status: ${frame.status}, counter: ${frame.counter}`
      );
    });
    console.log(lines.join("\n"));
  }
  increaseSize(size) {
      this.size += size;
  }
}

const INITIAL_WORKER_COUNT = 1;
const framePool = new FramePool(INITIAL_WORKER_COUNT + 1);
const workerPool = new WorkerPool(INITIAL_WORKER_COUNT, "./multithread-worker.js");

microsoftTeams.initialize(() => {}, [
    "https://localhost:9000",
    "https://lubobill1990.github.io",
  ]);
  
  // This is the effect for processing
  let appliedEffect = {
    pixelValue: 100,
    proportion: 2,
  };
  
  // This is the effect linked with UI
  let uiSelectedEffect = {};
//Sample video effect
async function videoFrameHandler(
  videoFrame,
  notifyVideoProcessed,
  notifyError
) {
  // get last processed frame in the first line to ensure it has the smallest counter.
  const lastProcessedFrame = framePool.getLastProcessedFrame(
    videoFrame.data.byteLength
  );
  
//   console.log('\n\n-------------------------------')
//   framePool.print();
//   workerPool.print();
  const frameData = framePool.allocate(videoFrame.data.byteLength);
  if (frameData !== null) {
    const clonedVideoFrame = { ...videoFrame };
    if(!workerPool.addToWorker(clonedVideoFrame, frameData)){
        console.log('no idle worker')
    }
  }
  // console.log('-------------------------------')
  // framePool.print();
  // workerPool.print();

  const processedFrame = framePool.getProsessedFrame(
    videoFrame.data.byteLength
  );
  // drop the frame if it has smaller counter.
  if (processedFrame && lastProcessedFrame.counter < processedFrame.counter) {
    videoFrame.data.set(processedFrame.data);
    framePool.updateLastProcessedFrame(processedFrame);
  } else {
    // use last processed frame when there's no processed frame available.
    videoFrame.data.set(lastProcessedFrame.data);
  }
  notifyVideoProcessed();
}

function effectParameterChanged(effectName) {
  console.log(effectName);
  if (effectName === undefined) {
    // If effectName is undefined, then apply the effect selected in the UI
    appliedEffect = {
      ...appliedEffect,
      ...uiSelectedEffect,
    };
  } else {
    // if effectName is string sent from Teams client, the apply the effectName
    try {
      appliedEffect = {
        ...appliedEffect,
        ...JSON.parse(effectName),
      };
    } catch (e) {}
  }
}

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

document.getElementById("worker_count").addEventListener("change", function () {
  framePool.increaseSize(this.value - framePool.size);
  workerPool.increaseSize(this.value - workerPool.size);
});
document.getElementById("worker_count").value = INITIAL_WORKER_COUNT;
microsoftTeams.appInitialization.notifySuccess();
