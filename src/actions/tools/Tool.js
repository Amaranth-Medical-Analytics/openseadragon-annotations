export default class Tool {
    constructor(model) {
        this.model = model;
    }

    reset() {
      this.model.clicks = 0;
    }

    onPress() {
      this.model.clicks++;
    }

    onMove() {}

    onRelease() {}

    onLeaveCanvas() {
      this.model.activityInProgress = false;
      this.model.clicks = 0;
    }

    onZoom() {
      this.model.activityInProgress = false;
      this.model.clicks = 0;
    }
}