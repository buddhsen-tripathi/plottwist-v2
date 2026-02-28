import type { RoundState, PlayerScore, Room, Memory } from "@/types/game";

const VOTE_POINTS = 100;
const CALLBACK_BONUS = 25;
const TOP_TWO_BONUS = 15;

export function calculateRoundScores(
  room: Room,
  round: RoundState
): { scores: Record<string, PlayerScore>; winnerId: string; memory: Memory } {
  const scores = { ...room.scores };
  const submissions = round.submissions;
  const currentRound = round.roundNumber;

  // Count votes per player
  const voteCounts: Record<string, number> = {};
  for (const sub of Object.values(submissions)) {
    voteCounts[sub.playerId] = sub.votes;
  }

  // Sort by votes to find top two
  const sorted = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);
  const topTwoIds = new Set(sorted.slice(0, 2).map(([id]) => id));
  const winnerId = sorted[0]?.[0] ?? "";

  // Check for memory callbacks
  const memories = room.memories;
  const hasCallback = (twist: string): boolean => {
    if (memories.length === 0) return false;
    const lowerTwist = twist.toLowerCase();
    return memories.some(
      (m) =>
        lowerTwist.includes(m.winningTwist.toLowerCase().slice(0, 10)) ||
        lowerTwist.includes(m.winnerName.toLowerCase())
    );
  };

  for (const [playerId, sub] of Object.entries(submissions)) {
    const player = room.players[playerId];
    if (!player) continue;

    if (!scores[playerId]) {
      scores[playerId] = {
        playerId,
        playerName: player.name,
        avatar: player.avatar,
        color: player.color,
        totalScore: 0,
        roundScores: [],
        votesReceived: 0,
        streak: 0,
        isTopTwo: false,
      };
    }

    const sc = scores[playerId];
    let roundScore = (voteCounts[playerId] ?? 0) * VOTE_POINTS;

    // Callback bonus
    if (hasCallback(sub.twist)) {
      roundScore += CALLBACK_BONUS;
    }

    // Top two bonus
    const isTop = topTwoIds.has(playerId);
    if (isTop) {
      roundScore += TOP_TWO_BONUS;
    }

    // Streak tracking
    if (playerId === winnerId) {
      sc.streak += 1;
    } else {
      sc.streak = 0;
    }

    sc.votesReceived += voteCounts[playerId] ?? 0;
    sc.totalScore += roundScore;
    sc.roundScores[currentRound - 1] = roundScore;
    sc.isTopTwo = isTop;
  }

  // Build memory entry
  const winnerSub = submissions[winnerId];
  const winnerPlayer = room.players[winnerId];
  const memory: Memory = {
    round: currentRound,
    winningTwist: winnerSub?.twist ?? "",
    winnerName: winnerPlayer?.name ?? "",
    winnerAvatar: winnerPlayer?.avatar ?? "",
    narration: winnerSub?.narration ?? "",
    mediaUrl: winnerSub?.mediaUrl,
  };

  return { scores, winnerId, memory };
}
