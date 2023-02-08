import reactToEngineActions from "./engineActions";
import reactToPointerActions from "./pointerActions";
import reactToViewerActions from "./viewerActions";

const actionsStore = [
  reactToEngineActions,
  reactToPointerActions,
  reactToViewerActions
]

export default actionsStore;