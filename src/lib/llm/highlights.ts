import { Possession, QuarterStats, MatchResult } from '../simulation/types';

export interface GameMoment {
  quarter: number;
  time: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  type: 'clutch_shot' | 'momentum_swing' | 'run' | 'comeback' | 'highlight_play' | 'milestone';
  teamFavor?: 'team1' | 'team2';
  involvedPlayers: string[];
}

export interface GameHighlights {
  moments: GameMoment[];
  narrative: string;
  summary: string;
}

export class HighlightDetector {
  private keyMoments: GameMoment[] = [];

  detectKeyMoments(matchResult: MatchResult): GameMoment[] {
    this.keyMoments = [];

    // Analyze each quarter for key moments
    matchResult.quarters.forEach((quarter, qIndex) => {
      this.analyzeQuarter(quarter, qIndex, matchResult);
    });

    // Detect game-wide patterns
    this.detectComebacks(matchResult);
    this.detectClutchMoments(matchResult);

    // Sort by importance and chronological order
    this.keyMoments.sort((a, b) => {
      if (a.quarter !== b.quarter) return a.quarter - b.quarter;
      return this.getTimeInSeconds(b.time) - this.getTimeInSeconds(a.time);
    });

    return this.keyMoments;
  }

  private analyzeQuarter(quarter: QuarterStats, qIndex: number, matchResult: MatchResult) {
    const possessions = quarter.possessions;
    let team1RunScore = 0;
    let team2RunScore = 0;
    let lastScoringTeam: 'team1' | 'team2' | null = null;

    possessions.forEach((possession, pIndex) => {
      // Track scoring runs
      if (possession.points > 0) {
        if (possession.team === 'team1') {
          if (lastScoringTeam === 'team1') {
            team1RunScore += possession.points;
          } else {
            team1RunScore = possession.points;
            team2RunScore = 0;
          }
        } else {
          if (lastScoringTeam === 'team2') {
            team2RunScore += possession.points;
          } else {
            team2RunScore = possession.points;
            team1RunScore = 0;
          }
        }
        lastScoringTeam = possession.team;

        // Detect significant runs (8+ points)
        if (team1RunScore >= 8 || team2RunScore >= 8) {
          const runTeam = team1RunScore >= 8 ? 'team1' : 'team2';
          const runScore = team1RunScore >= 8 ? team1RunScore : team2RunScore;
          const teamName = runTeam === 'team1' ? matchResult.team1.name : matchResult.team2.name;

          this.keyMoments.push({
            quarter: quarter.quarter,
            time: possession.time,
            description: `${teamName} on a ${runScore}-0 run`,
            importance: runScore >= 12 ? 'high' : 'medium',
            type: 'run',
            teamFavor: runTeam,
            involvedPlayers: this.getPlayersInRun(possessions, pIndex, runTeam, 5)
          });

          // Reset run tracking after recording
          team1RunScore = 0;
          team2RunScore = 0;
        }

        // Detect big plays (3-pointers, and-ones)
        if (possession.points === 3) {
          this.keyMoments.push({
            quarter: quarter.quarter,
            time: possession.time,
            description: `${possession.player} drains a three-pointer`,
            importance: 'medium',
            type: 'highlight_play',
            teamFavor: possession.team,
            involvedPlayers: [possession.player]
          });
        }
      }

      // Detect momentum-shifting plays (steals leading to scores)
      if (possession.action.includes('stolen') && pIndex < possessions.length - 1) {
        const nextPossession = possessions[pIndex + 1];
        if (nextPossession.points > 0 && nextPossession.team !== possession.team) {
          const stealingPlayer = possession.action.match(/stolen by (.+)/)?.[1] || 'Unknown';
          this.keyMoments.push({
            quarter: quarter.quarter,
            time: possession.time,
            description: `${stealingPlayer} with a steal leading to ${nextPossession.player}'s ${nextPossession.points} points`,
            importance: 'medium',
            type: 'momentum_swing',
            teamFavor: nextPossession.team,
            involvedPlayers: [stealingPlayer, nextPossession.player]
          });
        }
      }
    });
  }

  private detectComebacks(matchResult: MatchResult) {
    let maxLead = 0;
    let maxLeadTeam: 'team1' | 'team2' | null = null;
    let runningTeam1Score = 0;
    let runningTeam2Score = 0;

    matchResult.quarters.forEach((quarter) => {
      runningTeam1Score += quarter.team1Score;
      runningTeam2Score += quarter.team2Score;

      const currentLead = Math.abs(runningTeam1Score - runningTeam2Score);
      if (currentLead > maxLead) {
        maxLead = currentLead;
        maxLeadTeam = runningTeam1Score > runningTeam2Score ? 'team1' : 'team2';
      }
    });

    // If there was a significant lead that was overcome
    if (maxLead >= 10 && matchResult.winner !== maxLeadTeam) {
      const comebackTeam = matchResult.winner === 'team1' ? matchResult.team1.name : matchResult.team2.name;
      this.keyMoments.push({
        quarter: 4,
        time: '0:00',
        description: `${comebackTeam} completes a comeback from ${maxLead} points down`,
        importance: 'high',
        type: 'comeback',
        teamFavor: matchResult.winner,
        involvedPlayers: []
      });
    }
  }

  private detectClutchMoments(matchResult: MatchResult) {
    const fourthQuarter = matchResult.quarters.find(q => q.quarter === 4);
    if (!fourthQuarter) return;

    // Get possessions in the last 2 minutes of Q4
    const clutchPossessions = fourthQuarter.possessions.filter(p => {
      const seconds = this.getTimeInSeconds(p.time);
      return seconds <= 120; // Last 2 minutes
    });

    clutchPossessions.forEach((possession) => {
      if (possession.points > 0) {
        // Calculate score differential at this point
        const timeSeconds = this.getTimeInSeconds(possession.time);
        const isVeryClutch = timeSeconds <= 30; // Last 30 seconds

        if (isVeryClutch) {
          this.keyMoments.push({
            quarter: 4,
            time: possession.time,
            description: `${possession.player} scores in the clutch with ${possession.time} left`,
            importance: 'high',
            type: 'clutch_shot',
            teamFavor: possession.team,
            involvedPlayers: [possession.player]
          });
        }
      }
    });
  }

  private getPlayersInRun(possessions: Possession[], endIndex: number, team: 'team1' | 'team2', maxPlayers: number): string[] {
    const players = new Set<string>();
    for (let i = Math.max(0, endIndex - 5); i <= endIndex; i++) {
      if (possessions[i].team === team && possessions[i].points > 0) {
        players.add(possessions[i].player);
      }
    }
    return Array.from(players).slice(0, maxPlayers);
  }

  private getTimeInSeconds(timeString: string): number {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  }
}

export class CommentaryGenerator {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async generateHighlights(
    matchResult: MatchResult,
    keyMoments: GameMoment[]
  ): Promise<GameHighlights> {
    // If no API key is configured, return structured but not LLM-enhanced highlights
    if (!this.apiKey) {
      return this.generateBasicHighlights(matchResult, keyMoments);
    }

    try {
      // Dynamic import to avoid build errors if openai is not installed
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: this.apiKey });

      const gameContext = this.buildGameContext(matchResult, keyMoments);

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional basketball commentator generating exciting play-by-play highlights for a basketball game.
            Create engaging, dramatic commentary that captures the excitement of key moments.
            Keep individual moment descriptions to 1-2 sentences.
            The narrative should be 2-3 sentences capturing the overall game flow.
            The summary should be 1-2 sentences about the final result.`
          },
          {
            role: 'user',
            content: gameContext
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      const generatedContent = response.choices[0].message.content;
      return this.parseGeneratedContent(generatedContent, keyMoments, matchResult);
    } catch (error) {
      console.error('Error generating LLM highlights:', error);
      return this.generateBasicHighlights(matchResult, keyMoments);
    }
  }

  private buildGameContext(matchResult: MatchResult, keyMoments: GameMoment[]): string {
    const winner = matchResult.winner === 'team1' ? matchResult.team1.name : matchResult.team2.name;
    const loser = matchResult.winner === 'team1' ? matchResult.team2.name : matchResult.team1.name;

    let context = `Game Summary:
${winner} defeats ${loser} ${matchResult.team1Score}-${matchResult.team2Score}
MVP: ${matchResult.mvp.player} with ${matchResult.mvp.points} points, ${matchResult.mvp.rebounds} rebounds, ${matchResult.mvp.assists} assists

Key Moments to commentate on:
`;

    keyMoments.slice(0, 8).forEach((moment, index) => {
      const teamName = moment.teamFavor
        ? (moment.teamFavor === 'team1' ? matchResult.team1.name : matchResult.team2.name)
        : 'Both teams';

      context += `
${index + 1}. Quarter ${moment.quarter}, ${moment.time} remaining
Type: ${moment.type}
Players: ${moment.involvedPlayers.join(', ') || 'Team effort'}
Context: ${moment.description}
Team benefiting: ${teamName}
`;
    });

    context += `
Generate:
1. Enhanced commentary for each moment (make it exciting and contextual)
2. A narrative arc describing the game flow
3. A punchy summary of the result`;

    return context;
  }

  private parseGeneratedContent(
    content: string | null,
    keyMoments: GameMoment[],
    matchResult: MatchResult
  ): GameHighlights {
    if (!content) {
      return this.generateBasicHighlights(matchResult, keyMoments);
    }

    // Parse the generated content to extract enhanced descriptions
    // This is a simplified parsing - in production, you'd want more robust parsing
    const lines = content.split('\n').filter(line => line.trim());
    const enhancedMoments = keyMoments.map((moment, index) => {
      // Try to find enhanced description for this moment
      const enhancedDesc = lines[index] || moment.description;
      return {
        ...moment,
        description: enhancedDesc
      };
    });

    // Extract narrative and summary from the generated content
    const narrative = lines.find(line => line.toLowerCase().includes('narrative')) ||
      this.generateBasicNarrative(matchResult);
    const summary = lines[lines.length - 1] ||
      this.generateBasicSummary(matchResult);

    return {
      moments: enhancedMoments,
      narrative: narrative.replace(/^(narrative:?|summary:?)/i, '').trim(),
      summary: summary.replace(/^(summary:?)/i, '').trim()
    };
  }

  private generateBasicHighlights(
    matchResult: MatchResult,
    keyMoments: GameMoment[]
  ): GameHighlights {
    return {
      moments: keyMoments.slice(0, 8), // Top 8 moments
      narrative: this.generateBasicNarrative(matchResult),
      summary: this.generateBasicSummary(matchResult)
    };
  }

  private generateBasicNarrative(matchResult: MatchResult): string {
    const winner = matchResult.winner === 'team1' ? matchResult.team1.name : matchResult.team2.name;
    const loser = matchResult.winner === 'team1' ? matchResult.team2.name : matchResult.team1.name;
    const margin = Math.abs(matchResult.team1Score - matchResult.team2Score);

    if (margin <= 5) {
      return `A nail-biter to the very end as ${winner} edges out ${loser} in a thriller. Both teams traded baskets throughout, with the outcome uncertain until the final buzzer.`;
    } else if (margin <= 15) {
      return `${winner} controlled the pace and maintained their composure to secure a solid victory over ${loser}. Despite some resistance, they never let the lead slip away.`;
    } else {
      return `${winner} dominated from start to finish, putting on a clinic against ${loser}. Their superior execution on both ends of the floor made this a statement win.`;
    }
  }

  private generateBasicSummary(matchResult: MatchResult): string {
    const winner = matchResult.winner === 'team1' ? matchResult.team1.name : matchResult.team2.name;
    const finalScore = `${matchResult.team1Score}-${matchResult.team2Score}`;
    return `${winner} takes the victory ${finalScore} behind ${matchResult.mvp.player}'s ${matchResult.mvp.points}-point performance.`;
  }
}