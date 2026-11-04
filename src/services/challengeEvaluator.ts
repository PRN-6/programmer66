import { Challenge } from '../types/competition';
import { GameState } from '../store/useGameStore';

export interface EvaluationResult {
  passed: boolean;
  score: number;
  message: string;
}

/**
 * Validates whether the participant's automation script and farm state
 * meet the specific criteria for the active competition challenge.
 */
export function evaluateChallenge(
  challenge: Challenge,
  gameState: GameState,
  code: string
): EvaluationResult {
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
      // Handle Level 4: Soil Nutrition Master (fertilizer & weeds)
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

      // Handle Level 2: Smart Irrigation Engineer
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

