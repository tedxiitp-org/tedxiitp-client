import type { LevelDefinition } from "@/components/arrow-escape/types/game";

import level01 from "./level-01.json";
import level02 from "./level-02.json";
import level03 from "./level-03.json";
import level04 from "./level-04.json";
import level05 from "./level-05.json";
import level06 from "./level-06.json";
import level07 from "./level-07.json";
import level08 from "./level-08.json";
import level09 from "./level-09.json";
import level10 from "./level-10.json";
import level11 from "./level-11.json";
import level12 from "./level-12.json";
import level13 from "./level-13.json";
import level14 from "./level-14.json";
import level15 from "./level-15.json";
import level16 from "./level-16.json";
import level17 from "./level-17.json";

/**
 * All 17 levels, in play order. The run is only complete once every one of
 * these has been cleared (levels 18-20 were removed — 17 is the full set).
 */
export const ALL_LEVELS: LevelDefinition[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
  level11,
  level12,
  level13,
  level14,
  level15,
  level16,
  level17,
] as unknown as LevelDefinition[];
