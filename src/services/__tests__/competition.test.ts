import { describe, it, expect, beforeEach } from 'vitest';
import { CompetitionService } from '../competitionService';

describe('CompetitionService', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('creates a competition room with unique code and default challenges', async () => {
    const room = await CompetitionService.createRoom('Winter Codeathon 2026', 45);

    expect(room.id).toBeDefined();
    expect(room.code).toMatch(/^PROG-\d{4}$/);
    expect(room.title).toBe('Winter Codeathon 2026');
    expect(room.durationMinutes).toBe(45);
    expect(room.status).toBe('waiting');
    expect(room.challenges.length).toBeGreaterThanOrEqual(3);
  });

  it('retrieves created room by code', async () => {
    const created = await CompetitionService.createRoom('Championship', 30);
    const retrieved = await CompetitionService.getRoomByCode(created.code);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
  });

  it('allows a team to join a room', async () => {
    const room = await CompetitionService.createRoom('Battle of Devs', 20);
    const { team } = await CompetitionService.joinRoom(room.code, 'Cyber Harvesters', ['DevA', 'DevB']);

    expect(team.name).toBe('Cyber Harvesters');
    expect(team.members).toEqual(['DevA', 'DevB']);
    expect(team.score).toBe(0);

    const teams = await CompetitionService.getTeams(room.id);
    expect(teams.length).toBe(1);
    expect(teams[0].id).toBe(team.id);
  });

  it('records submission and updates team score', async () => {
    const room = await CompetitionService.createRoom('Finals', 15);
    const { team } = await CompetitionService.joinRoom(room.code, 'AlgoKnights', ['Alice']);

    const sub = await CompetitionService.submitSolution(
      room.id,
      team.id,
      team.name,
      'chal-1',
      'print("test")',
      100,
      true,
      'Passed all test vectors'
    );

    expect(sub.pointsAwarded).toBe(100);
    expect(sub.status).toBe('passed');

    const teams = await CompetitionService.getTeams(room.id);
    expect(teams[0].score).toBe(100);
    expect(teams[0].completedChallenges).toContain('chal-1');
  });
});
