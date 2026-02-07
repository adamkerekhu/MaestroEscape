import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene } from '../core/scene-manager';
import type { MeetingManager } from '../game/meeting';
import type { PlayerColor } from '@among-us/shared';

const COLOR_MAP: Record<PlayerColor, number> = {
  red: 0xc51111,
  blue: 0x132ed1,
  green: 0x117f2d,
  orange: 0xed7a09,
  yellow: 0xf5f557,
  black: 0x3f474e,
  brown: 0x71491e,
  pink: 0xd6b1ff,
  purple: 0x6b2fbb,
  white: 0xd5e0ef,
};

const PANEL_BG = 0x1a1a2e;
const PANEL_BORDER = 0x3a3a5e;
const VOTE_BTN_COLOR = 0x2a6e3f;
const SKIP_BTN_COLOR = 0x5e5e2a;
const VOTED_COLOR = 0x555555;

export class MeetingScene implements Scene {
  container = new Container();
  isOverlay = true;

  private meeting: MeetingManager;
  private alertText: Text | null = null;
  private votingPanel: Container | null = null;
  private resultsPanel: Container | null = null;
  private ejectText: Text | null = null;
  private timerText: Text | null = null;
  private lastPhase = 'none';

  constructor(meeting: MeetingManager) {
    this.meeting = meeting;
  }

  async onEnter(): Promise<void> {
    this.container.sortableChildren = true;
    this.rebuild();
  }

  async onExit(): Promise<void> {
    this.container.removeChildren();
    this.alertText = null;
    this.votingPanel = null;
    this.resultsPanel = null;
    this.ejectText = null;
    this.timerText = null;
  }

  update(_dt: number): void {
    const phase = this.meeting.phase;
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.rebuild();
    }

    if (this.timerText && phase === 'voting') {
      this.timerText.text = `Time: ${Math.ceil(this.meeting.voteTimeRemaining)}s`;
    }
  }

  private rebuild(): void {
    this.container.removeChildren();
    this.alertText = null;
    this.votingPanel = null;
    this.resultsPanel = null;
    this.ejectText = null;
    this.timerText = null;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Semi-transparent overlay background
    const overlay = new Graphics();
    overlay.rect(0, 0, w, h);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(overlay);

    switch (this.meeting.phase) {
      case 'alert':
        this.buildAlertUI(w, h);
        break;
      case 'discussion':
      case 'voting':
        this.buildVotingUI(w, h);
        break;
      case 'results':
        this.buildResultsUI(w, h);
        break;
      case 'ejecting':
        this.buildEjectUI(w, h);
        break;
    }
  }

  private buildAlertUI(w: number, h: number): void {
    const info = this.meeting.meetingInfo;
    const label =
      info?.reason === 'body_reported'
        ? 'DEAD BODY REPORTED'
        : 'EMERGENCY MEETING';
    const color = info?.reason === 'body_reported' ? 0xff4444 : 0xffcc00;

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 64,
      fill: color,
      fontWeight: 'bold',
      align: 'center',
      dropShadow: {
        color: 0x000000,
        distance: 4,
        blur: 6,
      },
    });

    this.alertText = new Text({ text: label, style });
    this.alertText.anchor.set(0.5, 0.5);
    this.alertText.x = w / 2;
    this.alertText.y = h / 2;
    this.container.addChild(this.alertText);
  }

  private buildVotingUI(w: number, h: number): void {
    const panel = new Container();
    this.votingPanel = panel;

    const panelW = Math.min(600, w - 40);
    const players = this.meeting.players;
    const aliveIds = Object.keys(players).filter((id) => players[id].alive);
    const deadIds = Object.keys(players).filter((id) => !players[id].alive);
    const allIds = [...aliveIds, ...deadIds];

    const rowH = 50;
    const headerH = 60;
    const footerH = 60;
    const panelH = headerH + allIds.length * rowH + footerH + 20;

    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2;

    // Background
    const bg = new Graphics();
    bg.roundRect(panelX, panelY, panelW, panelH, 12);
    bg.fill(PANEL_BG);
    bg.stroke({ color: PANEL_BORDER, width: 2 });
    panel.addChild(bg);

    // Header: "Who is the Impostor?"
    const headerStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    const header = new Text({ text: 'Who is the Impostor?', style: headerStyle });
    header.anchor.set(0.5, 0);
    header.x = w / 2;
    header.y = panelY + 15;
    panel.addChild(header);

    // Timer
    const timerStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 18,
      fill: 0xcccccc,
    });
    this.timerText = new Text({
      text: `Time: ${Math.ceil(this.meeting.voteTimeRemaining)}s`,
      style: timerStyle,
    });
    this.timerText.anchor.set(1, 0);
    this.timerText.x = panelX + panelW - 15;
    this.timerText.y = panelY + 18;
    panel.addChild(this.timerText);

    // Player rows
    const hasVoted = this.meeting.hasLocalVoted;
    const isVotingPhase = this.meeting.phase === 'voting';

    for (let i = 0; i < allIds.length; i++) {
      const pid = allIds[i];
      const p = players[pid];
      if (!p) continue;

      const rowY = panelY + headerH + i * rowH;

      // Color circle
      const circle = new Graphics();
      circle.circle(panelX + 35, rowY + rowH / 2, 15);
      const hexColor = COLOR_MAP[p.color] ?? 0xaaaaaa;
      circle.fill(p.alive ? hexColor : 0x555555);
      panel.addChild(circle);

      // Name
      const nameStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 18,
        fill: p.alive ? 0xffffff : 0x888888,
      });
      const nameLabel = new Text({ text: p.name, style: nameStyle });
      nameLabel.x = panelX + 60;
      nameLabel.y = rowY + (rowH - 18) / 2;
      panel.addChild(nameLabel);

      // Dead marker
      if (!p.alive) {
        const deadMark = new Text({
          text: 'DEAD',
          style: new TextStyle({
            fontFamily: 'monospace',
            fontSize: 12,
            fill: 0xff4444,
          }),
        });
        deadMark.x = panelX + panelW - 80;
        deadMark.y = rowY + (rowH - 12) / 2;
        panel.addChild(deadMark);
        continue;
      }

      // Vote button (only if alive, voting phase, and local player hasn't voted)
      if (isVotingPhase && !hasVoted && p.alive && pid !== this.meeting.localPlayerId) {
        const btn = new Graphics();
        btn.roundRect(panelX + panelW - 100, rowY + 8, 80, 34, 6);
        btn.fill(VOTE_BTN_COLOR);
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        const targetId = pid;
        btn.on('pointerdown', () => {
          this.meeting.castVote(targetId);
          this.rebuild();
        });
        panel.addChild(btn);

        const voteLabel = new Text({
          text: 'VOTE',
          style: new TextStyle({
            fontFamily: 'monospace',
            fontSize: 14,
            fill: 0xffffff,
            fontWeight: 'bold',
          }),
        });
        voteLabel.anchor.set(0.5, 0.5);
        voteLabel.x = panelX + panelW - 60;
        voteLabel.y = rowY + 25;
        panel.addChild(voteLabel);
      } else if (hasVoted) {
        // Show a checkmark if the local player voted for this person
        const localVote = this.meeting.votes[this.meeting.localPlayerId];
        if (localVote === pid) {
          const checkmark = new Text({
            text: 'VOTED',
            style: new TextStyle({
              fontFamily: 'monospace',
              fontSize: 12,
              fill: 0x44ff44,
            }),
          });
          checkmark.x = panelX + panelW - 80;
          checkmark.y = rowY + (rowH - 12) / 2;
          panel.addChild(checkmark);
        }
      }
    }

    // Skip button
    if (isVotingPhase && !hasVoted) {
      const skipY = panelY + headerH + allIds.length * rowH + 10;
      const skipBtn = new Graphics();
      skipBtn.roundRect(panelX + panelW / 2 - 60, skipY, 120, 40, 8);
      skipBtn.fill(SKIP_BTN_COLOR);
      skipBtn.eventMode = 'static';
      skipBtn.cursor = 'pointer';
      skipBtn.on('pointerdown', () => {
        this.meeting.castVote('skip');
        this.rebuild();
      });
      panel.addChild(skipBtn);

      const skipLabel = new Text({
        text: 'SKIP VOTE',
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 14,
          fill: 0xffffff,
          fontWeight: 'bold',
        }),
      });
      skipLabel.anchor.set(0.5, 0.5);
      skipLabel.x = panelX + panelW / 2;
      skipLabel.y = skipY + 20;
      panel.addChild(skipLabel);
    }

    this.container.addChild(panel);
  }

  private buildResultsUI(w: number, h: number): void {
    const panel = new Container();
    this.resultsPanel = panel;

    const result = this.meeting.result;
    if (!result) return;

    const panelW = Math.min(500, w - 40);
    const players = this.meeting.players;
    const voterIds = Object.keys(result.votes);
    const rowH = 40;
    const headerH = 60;
    const panelH = headerH + voterIds.length * rowH + 80;

    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2;

    const bg = new Graphics();
    bg.roundRect(panelX, panelY, panelW, panelH, 12);
    bg.fill(PANEL_BG);
    bg.stroke({ color: PANEL_BORDER, width: 2 });
    panel.addChild(bg);

    // Title
    const titleText = result.ejectedPlayerId
      ? `${players[result.ejectedPlayerId]?.name ?? 'Unknown'} was ejected.`
      : 'No one was ejected. (Tie / Skipped)';
    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 22,
      fill: result.ejectedPlayerId ? 0xff6666 : 0xcccccc,
      fontWeight: 'bold',
      align: 'center',
    });
    const title = new Text({ text: titleText, style: titleStyle });
    title.anchor.set(0.5, 0);
    title.x = w / 2;
    title.y = panelY + 15;
    panel.addChild(title);

    // Vote breakdown
    for (let i = 0; i < voterIds.length; i++) {
      const voterId = voterIds[i];
      const targetId = result.votes[voterId];
      const voter = players[voterId];
      const target = targetId === 'skip' ? null : players[targetId];

      const rowY = panelY + headerH + i * rowH;

      const voterCircle = new Graphics();
      voterCircle.circle(panelX + 25, rowY + rowH / 2, 10);
      voterCircle.fill(COLOR_MAP[voter?.color ?? 'white'] ?? 0xaaaaaa);
      panel.addChild(voterCircle);

      const rowText =
        targetId === 'skip'
          ? `${voter?.name ?? voterId} skipped`
          : `${voter?.name ?? voterId} -> ${target?.name ?? targetId}`;

      const rowLabel = new Text({
        text: rowText,
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 15,
          fill: 0xdddddd,
        }),
      });
      rowLabel.x = panelX + 45;
      rowLabel.y = rowY + (rowH - 15) / 2;
      panel.addChild(rowLabel);
    }

    this.container.addChild(panel);
  }

  private buildEjectUI(w: number, h: number): void {
    const result = this.meeting.result;
    if (!result || !result.ejectedPlayerId) return;

    const player = this.meeting.players[result.ejectedPlayerId];
    const name = player?.name ?? 'Unknown';
    const wasImpostor = result.ejectedWasImpostor;

    const line1 = `${name} was ejected.`;
    const line2 =
      wasImpostor === true
        ? `${name} was An Impostor.`
        : wasImpostor === false
          ? `${name} was not An Impostor.`
          : '';

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 36,
      fill: 0xffffff,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        distance: 3,
        blur: 5,
      },
    });

    this.ejectText = new Text({ text: `${line1}\n${line2}`, style });
    this.ejectText.anchor.set(0.5, 0.5);
    this.ejectText.x = w / 2;
    this.ejectText.y = h / 2;
    this.container.addChild(this.ejectText);

    // Ejected player icon floating away
    if (player) {
      const icon = new Graphics();
      icon.circle(0, 0, 25);
      icon.fill(COLOR_MAP[player.color] ?? 0xaaaaaa);
      icon.x = w / 2;
      icon.y = h / 2 + 80;
      this.container.addChild(icon);
    }
  }
}
