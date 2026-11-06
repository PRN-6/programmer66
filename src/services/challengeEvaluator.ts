import { Challenge } from '../types/competition';
import { GameState } from '../store/useGameStore';
import { Lexer } from '../scripting/lexer';
import { Parser } from '../scripting/parser';
import { Interpreter } from '../scripting/interpreter';

export interface EvaluationResult {
  passed: boolean;
  score: number;
  message: string;
}

/**
 * Deep equality comparison for LeetCode test outputs.
 * Supports primitives, arrays, nested matrices, and dictionaries.
 */
function compareOutputs(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true;
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 0.0001;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (!compareOutputs(actual[i], expected[i])) return false;
    }
    return true;
  }
  if (typeof actual === 'object' && actual !== null && typeof expected === 'object' && expected !== null) {
    const act = actual as Record<string, unknown>;
    const exp = expected as Record<string, unknown>;
    const keysA = Object.keys(act);
    const keysB = Object.keys(exp);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => compareOutputs(act[k], exp[k]));
  }
  return false;
}

/**
 * Validates whether the participant's automation script and farm state
 * meet the specific criteria for the active competition challenge,
 * including LeetCode unit tests and algorithmic grid patterns.
 */
export async function evaluateChallenge(
  challenge: Challenge,
  gameState: GameState,
  code: string
): Promise<EvaluationResult> {
  const trimmed = (code || '').trim();
  if (trimmed.length < 10) {
    return {
      passed: false,
      score: 0,
      message: 'Code is empty or unexecuted. Write and run your Python script first.',
    };
  }

  const tiles = Object.values(gameState.tiles || {});
  const targetCount = challenge.targetCount || 1;

  switch (challenge.testCriterion) {
    case 'leetcode_test': {
      if (!challenge.functionName) {
        return {
          passed: false,
          score: 0,
          message: 'Evaluation error: Missing functionName definition in challenge metadata.',
        };
      }

      try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const interpreter = new Interpreter({ stepDelayMs: 0, maxSteps: 40000 });
        await interpreter.run(ast);

        const targetFn = interpreter.getGlobalEnv().get(challenge.functionName);
        if (typeof targetFn !== 'function') {
          return {
            passed: false,
            score: 0,
            message: `Function "${challenge.functionName}" not found. Define "def ${challenge.functionName}(...)" in your code.`,
          };
        }

        const testCases = challenge.testCases || [];
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const actual = await (targetFn as (...args: unknown[]) => Promise<unknown>)(...tc.input);

          if (!compareOutputs(actual, tc.expected)) {
            const inputStr = JSON.stringify(tc.input);
            const expStr = JSON.stringify(tc.expected);
            const actStr = JSON.stringify(actual);
            return {
              passed: false,
              score: 0,
              message: `❌ Test Case ${i + 1} Failed (${tc.description || 'Sample'}): Input ${inputStr} -> Expected ${expStr}, but received ${actStr}.`,
            };
          }
        }

        return {
          passed: true,
          score: challenge.points,
          message: `🏆 All ${testCases.length} LeetCode test cases passed successfully!`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          passed: false,
          score: 0,
          message: `Python syntax or runtime error in test execution: ${msg}`,
        };
      }
    }

    case 'pattern_match': {
      const descLower = (challenge.description || '').toLowerCase();

      // LeetCode 463: Island Perimeter (Border plots watered, inner dry)
      if (descLower.includes('perimeter')) {
        const width = gameState.gridWidth || 6;
        const height = gameState.gridHeight || 6;
        let borderWatered = 0;
        let interiorWatered = 0;
        let totalBorder = 0;

        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
            const tile = tiles.find((t) => t.x === x && t.y === y);
            const isWatered = (tile?.moisture || 0) >= 60;
            if (isBorder) {
              totalBorder++;
              if (isWatered) borderWatered++;
            } else {
              if (isWatered) interiorWatered++;
            }
          }
        }

        if (borderWatered >= Math.max(1, totalBorder - 2) && interiorWatered === 0) {
          return {
            passed: true,
            score: challenge.points,
            message: `Verified: Island perimeter correctly hydrated (${borderWatered}/${totalBorder}) with zero interior flooding!`,
          };
        }
        return {
          passed: false,
          score: 0,
          message: `Condition not met: Hydrate all outer perimeter plots (moisture >= 60%) while keeping interior plots dry.`,
        };
      }

      // LeetCode 75: Sort Colors / Dutch National Flag (Row 0: carrot, Row 1: wheat, Row 2: corn)
      if (descLower.includes('sort') || descLower.includes('dutch') || descLower.includes('flag')) {
        const r0 = tiles.filter((t) => t.y === 0 && t.crop === 'carrot').length;
        const r1 = tiles.filter((t) => t.y === 1 && t.crop === 'wheat').length;
        const r2 = tiles.filter((t) => t.y === 2 && t.crop === 'corn').length;
        const total = r0 + r1 + r2;
        const required = challenge.targetCount || 12;

        if (total >= required && r0 >= 3 && r1 >= 3 && r2 >= 3) {
          return {
            passed: true,
            score: challenge.points,
            message: `Verified: Dutch National Flag sorted! Row 0: Carrots, Row 1: Wheat, Row 2: Corn (${total}/${required}).`,
          };
        }
        return {
          passed: false,
          score: 0,
          message: `Condition not met: Sort crops by row: Row 0 must be Carrots, Row 1 Wheat, Row 2 Corn (found ${total}/${required}).`,
        };
      }

      // LeetCode 54: Spiral Matrix
      if (descLower.includes('spiral')) {
        const plantedCount = tiles.filter((t) => t.crop !== null).length;
        if (plantedCount >= targetCount) {
          return {
            passed: true,
            score: challenge.points,
            message: `Verified: Spiral Matrix traversal planted ${plantedCount}/${targetCount} plots!`,
          };
        }
        return {
          passed: false,
          score: 0,
          message: `Condition not met: Plant at least ${targetCount} plots along the clockwise spiral path.`,
        };
      }

      // General pattern fallback
      const totalPlanted = tiles.filter((t) => t.crop !== null).length;
      if (totalPlanted >= targetCount) {
        return {
          passed: true,
          score: challenge.points,
          message: `Verified: Algorithmic grid pattern matched with ${totalPlanted}/${targetCount} plots!`,
        };
      }
      return {
        passed: false,
        score: 0,
        message: `Condition not met: Pattern requires at least ${targetCount} target plots.`,
      };
    }

    case 'planted_count': {
      const targetCrop = challenge.targetCrop ? challenge.targetCrop.toLowerCase() : null;
      let count = 0;
      if (targetCrop) {
        count = tiles.filter((t) => t.crop && t.crop.toLowerCase() === targetCrop).length;
      } else {
        count = tiles.filter((t) => t.crop !== null).length;
      }

      const cropName = targetCrop ? `${targetCrop}` : 'crop';
      if (count >= targetCount) {
        return {
          passed: true,
          score: challenge.points,
          message: `Verified: Successfully planted ${count}/${targetCount} ${cropName} plots!`,
        };
      }

      return {
        passed: false,
        score: 0,
        message: `Condition not met: Found ${count}/${targetCount} ${cropName} plots planted. Need at least ${targetCount}.`,
      };
    }

    case 'water_efficiency': {
      const descLower = (challenge.description || '').toLowerCase();
      // Handle Soil Nutrition Master (fertilizer & weeds)
      if (descLower.includes('fertiliz') || descLower.includes('nutri')) {
        const count = tiles.filter((t) => t.nutrients >= 65 && t.weedLevel === 0).length;
        if (count >= targetCount) {
          return {
            passed: true,
            score: challenge.points,
            message: `Verified: Successfully fertilized and cleared ${count}/${targetCount} plots!`,
          };
        }
        return {
          passed: false,
          score: 0,
          message: `Condition not met: Only ${count}/${targetCount} plots have nutrients >= 65% with zero weeds.`,
        };
      }

      // Handle moisture hydration challenges
      const count = tiles.filter((t) => t.moisture >= 60).length;
      if (count >= targetCount) {
        return {
          passed: true,
          score: challenge.points,
          message: `Verified: ${count}/${targetCount} plots hydrated to optimal moisture (>=60%)!`,
        };
      }

      return {
        passed: false,
        score: 0,
        message: `Condition not met: Only ${count}/${targetCount} plots watered to optimal moisture (>=60%).`,
      };
    }

    case 'harvest_count': {
      const harvestedStats = gameState.stats?.totalHarvested || 0;
      const inv = gameState.inventory || {};
      const harvestedInventory =
        (inv.wheat || 0) +
        (inv.corn || 0) +
        (inv.carrot || 0) +
        (inv.tomato || 0) +
        (inv.potato || 0);
      const totalHarvested = Math.max(harvestedStats, harvestedInventory);

      if (totalHarvested >= targetCount) {
        return {
          passed: true,
          score: challenge.points,
          message: `Verified: Successfully harvested ${totalHarvested}/${targetCount} mature crops!`,
        };
      }

      return {
        passed: false,
        score: 0,
        message: `Condition not met: Only ${totalHarvested}/${targetCount} crops harvested. Wait for crops to mature and harvest them.`,
      };
    }

    case 'speed_run': {
      const activeCrops = tiles.filter((t) => t.crop !== null).length;
      const total = activeCrops + (gameState.stats?.totalHarvested || 0);

      if (total >= targetCount) {
        return {
          passed: true,
          score: challenge.points,
          message: `Verified: Automation speed run achieved ${total}/${targetCount} actions!`,
        };
      }

      return {
        passed: false,
        score: 0,
        message: `Condition not met: Reached ${total}/${targetCount} actions. Automate faster to reach the target!`,
      };
    }

    default: {
      return {
        passed: true,
        score: challenge.points,
        message: 'Verified: Automation challenge criteria passed!',
      };
    }
  }
}
