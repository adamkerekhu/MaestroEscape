export { TaskBase } from './task-base';
export { FixWiringTask } from './fix-wiring';
export { StabilizeNavTask } from './stabilize-nav';
export { EmptyGarbageTask } from './empty-garbage';
export { RebootWifiTask } from './reboot-wifi';
export { DivertPowerTask } from './divert-power';
export { AlignEngineTask } from './align-engine';
export { FuelEngineTask } from './fuel-engine';
export { ClearAsteroidsTask } from './clear-asteroids';

import type { TaskType } from '@among-us/shared';
import type { TaskBase } from './task-base';
import { FixWiringTask } from './fix-wiring';
import { StabilizeNavTask } from './stabilize-nav';
import { EmptyGarbageTask } from './empty-garbage';
import { RebootWifiTask } from './reboot-wifi';
import { DivertPowerTask } from './divert-power';
import { AlignEngineTask } from './align-engine';
import { FuelEngineTask } from './fuel-engine';
import { ClearAsteroidsTask } from './clear-asteroids';

export function createTaskScene(type: TaskType): TaskBase {
  switch (type) {
    case 'fix_wiring':
      return new FixWiringTask();
    case 'stabilize_nav':
      return new StabilizeNavTask();
    case 'empty_garbage':
      return new EmptyGarbageTask();
    case 'reboot_wifi':
      return new RebootWifiTask();
    case 'divert_power':
      return new DivertPowerTask();
    case 'align_engine':
      return new AlignEngineTask();
    case 'fuel_engine':
      return new FuelEngineTask();
    case 'clear_asteroids':
      return new ClearAsteroidsTask();
  }
}
