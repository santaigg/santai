// Export v1 components
import { playerController as playerControllerV1 } from "./v1/controller";
import { PlayerService as PlayerServiceV1 } from "./v1/service";
export * from "./v1/types";

// Export v2 components
// import { playerController as playerControllerV2 } from "./v2/controller";
// import { PlayerService as PlayerServiceV2 } from "./v2/service";
// export * from "./v2/types";

// Re-export with explicit names
export {
  playerControllerV1,
  PlayerServiceV1,
  // playerControllerV2,
  // PlayerServiceV2
}; 