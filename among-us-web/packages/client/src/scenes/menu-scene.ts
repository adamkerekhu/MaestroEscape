import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene } from '../core/scene-manager';
import { sceneManager } from '../core/scene-manager';
import { GameScene } from './game-scene';
import { PLAYER_COLORS, type PlayerColor } from '@among-us/shared';

const COLOR_HEX: Record<string, number> = {
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

interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

type MenuScreen = 'main' | 'multiplayer';

export class MenuScene implements Scene {
  container = new Container();
  isOverlay = false;

  private screen: MenuScreen = 'main';
  private selectedColor: PlayerColor = 'red';
  private playerName = 'Player';
  private rooms: RoomInfo[] = [];
  private nameInput: HTMLInputElement | null = null;

  // UI containers
  private mainScreen = new Container();
  private multiplayerScreen = new Container();
  private roomListContainer = new Container();

  async onEnter(): Promise<void> {
    this.buildMainScreen();
    this.buildMultiplayerScreen();

    this.container.addChild(this.mainScreen);
    this.container.addChild(this.multiplayerScreen);

    this.showScreen('main');
  }

  update(_dt: number): void {
    // No per-frame logic needed for menu
  }

  async onExit(): Promise<void> {
    this.removeNameInput();
    this.mainScreen.removeChildren();
    this.multiplayerScreen.removeChildren();
    this.container.removeChildren();
  }

  private showScreen(screen: MenuScreen): void {
    this.screen = screen;
    this.mainScreen.visible = screen === 'main';
    this.multiplayerScreen.visible = screen === 'multiplayer';

    if (screen === 'multiplayer') {
      this.createNameInput();
      this.fetchRooms();
    } else {
      this.removeNameInput();
    }
  }

  // --- Main screen ---

  private buildMainScreen(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, w, h);
    bg.fill(0x1a1a2e);
    this.mainScreen.addChild(bg);

    // Title
    const title = new Text({
      text: 'Among Us Web',
      style: new TextStyle({
        fontSize: 64,
        fill: 0xffffff,
        fontFamily: 'monospace',
        fontWeight: 'bold',
      }),
    });
    title.anchor.set(0.5);
    title.x = w / 2;
    title.y = h * 0.25;
    this.mainScreen.addChild(title);

    // Freeplay button
    this.createButton(
      this.mainScreen,
      'Freeplay',
      w / 2,
      h * 0.5,
      280,
      60,
      0x4a6fa5,
      () => this.startFreeplay(),
    );

    // Multiplayer button
    this.createButton(
      this.mainScreen,
      'Multiplayer',
      w / 2,
      h * 0.5 + 90,
      280,
      60,
      0x6b2fbb,
      () => this.showScreen('multiplayer'),
    );
  }

  // --- Multiplayer screen ---

  private buildMultiplayerScreen(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, w, h);
    bg.fill(0x1a1a2e);
    this.multiplayerScreen.addChild(bg);

    // Title
    const title = new Text({
      text: 'Multiplayer',
      style: new TextStyle({
        fontSize: 48,
        fill: 0xffffff,
        fontFamily: 'monospace',
        fontWeight: 'bold',
      }),
    });
    title.anchor.set(0.5);
    title.x = w / 2;
    title.y = 50;
    this.multiplayerScreen.addChild(title);

    // Name label
    const nameLabel = new Text({
      text: 'Name:',
      style: new TextStyle({
        fontSize: 20,
        fill: 0xcccccc,
        fontFamily: 'monospace',
      }),
    });
    nameLabel.x = w / 2 - 200;
    nameLabel.y = 110;
    this.multiplayerScreen.addChild(nameLabel);

    // Color picker label
    const colorLabel = new Text({
      text: 'Color:',
      style: new TextStyle({
        fontSize: 20,
        fill: 0xcccccc,
        fontFamily: 'monospace',
      }),
    });
    colorLabel.x = w / 2 - 200;
    colorLabel.y = 160;
    this.multiplayerScreen.addChild(colorLabel);

    // Color circles
    const colorStartX = w / 2 - 140;
    for (let i = 0; i < PLAYER_COLORS.length; i++) {
      const color = PLAYER_COLORS[i];
      const cx = colorStartX + i * 38;
      const cy = 175;

      const circle = new Graphics();
      circle.circle(0, 0, 14);
      circle.fill(COLOR_HEX[color] ?? 0xaaaaaa);
      if (color === this.selectedColor) {
        circle.circle(0, 0, 17);
        circle.stroke({ width: 3, color: 0xffffff });
      }
      circle.x = cx;
      circle.y = cy;
      circle.eventMode = 'static';
      circle.cursor = 'pointer';
      circle.on('pointerdown', () => {
        this.selectedColor = color;
        this.rebuildMultiplayerScreen();
      });
      this.multiplayerScreen.addChild(circle);
    }

    // Room list area
    const roomBg = new Graphics();
    roomBg.roundRect(w / 2 - 250, 220, 500, h - 350, 10);
    roomBg.fill(0x16213e);
    this.multiplayerScreen.addChild(roomBg);

    const roomTitle = new Text({
      text: 'Rooms',
      style: new TextStyle({
        fontSize: 22,
        fill: 0xffffff,
        fontFamily: 'monospace',
      }),
    });
    roomTitle.anchor.set(0.5, 0);
    roomTitle.x = w / 2;
    roomTitle.y = 230;
    this.multiplayerScreen.addChild(roomTitle);

    // Room list container (populated by fetchRooms)
    this.roomListContainer.removeChildren();
    this.roomListContainer.y = 265;
    this.multiplayerScreen.addChild(this.roomListContainer);

    // Create Room button
    this.createButton(
      this.multiplayerScreen,
      'Create Room',
      w / 2 - 80,
      h - 80,
      200,
      50,
      0x117f2d,
      () => this.createRoom(),
    );

    // Refresh button
    this.createButton(
      this.multiplayerScreen,
      'Refresh',
      w / 2 + 80,
      h - 80,
      140,
      50,
      0x4a6fa5,
      () => this.fetchRooms(),
    );

    // Back button
    this.createButton(
      this.multiplayerScreen,
      'Back',
      80,
      h - 80,
      120,
      50,
      0x555555,
      () => this.showScreen('main'),
    );
  }

  private rebuildMultiplayerScreen(): void {
    this.multiplayerScreen.removeChildren();
    this.roomListContainer = new Container();
    this.buildMultiplayerScreen();
    this.renderRoomList();
  }

  // --- Name input (HTML input overlaid on canvas) ---

  private createNameInput(): void {
    if (this.nameInput) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.playerName;
    input.maxLength = 12;
    input.placeholder = 'Enter name';
    input.style.cssText =
      'position:fixed;font-family:monospace;font-size:18px;padding:4px 8px;' +
      'background:#16213e;color:#fff;border:2px solid #4a6fa5;border-radius:4px;' +
      'outline:none;width:180px;z-index:100;';

    const w = window.innerWidth;
    input.style.left = `${w / 2 - 140}px`;
    input.style.top = '105px';

    input.addEventListener('input', () => {
      this.playerName = input.value || 'Player';
    });

    document.body.appendChild(input);
    this.nameInput = input;
  }

  private removeNameInput(): void {
    if (this.nameInput) {
      this.nameInput.remove();
      this.nameInput = null;
    }
  }

  // --- Room list ---

  private async fetchRooms(): Promise<void> {
    try {
      const resp = await fetch('/api/rooms');
      if (resp.ok) {
        this.rooms = (await resp.json()) as RoomInfo[];
      }
    } catch {
      this.rooms = [];
    }
    this.renderRoomList();
  }

  private renderRoomList(): void {
    this.roomListContainer.removeChildren();
    const w = window.innerWidth;

    if (this.rooms.length === 0) {
      const empty = new Text({
        text: 'No rooms available',
        style: new TextStyle({
          fontSize: 16,
          fill: 0x888888,
          fontFamily: 'monospace',
        }),
      });
      empty.anchor.set(0.5, 0);
      empty.x = w / 2;
      empty.y = 10;
      this.roomListContainer.addChild(empty);
      return;
    }

    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      const y = i * 50;

      // Room row background
      const row = new Graphics();
      row.roundRect(w / 2 - 230, y, 460, 42, 6);
      row.fill(i % 2 === 0 ? 0x1a2744 : 0x16213e);
      this.roomListContainer.addChild(row);

      // Room name
      const name = new Text({
        text: room.name || room.id,
        style: new TextStyle({
          fontSize: 16,
          fill: 0xffffff,
          fontFamily: 'monospace',
        }),
      });
      name.x = w / 2 - 220;
      name.y = y + 12;
      this.roomListContainer.addChild(name);

      // Player count
      const count = new Text({
        text: `${room.playerCount}/${room.maxPlayers}`,
        style: new TextStyle({
          fontSize: 14,
          fill: 0xaaaaaa,
          fontFamily: 'monospace',
        }),
      });
      count.x = w / 2 + 80;
      count.y = y + 14;
      this.roomListContainer.addChild(count);

      // Join button
      this.createButton(
        this.roomListContainer,
        'Join',
        w / 2 + 180,
        y + 21,
        70,
        34,
        0x4a6fa5,
        () => this.joinRoom(room.id),
      );
    }
  }

  // --- Actions ---

  private async createRoom(): Promise<void> {
    try {
      const resp = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (resp.ok) {
        const data = (await resp.json()) as { roomId: string };
        this.joinRoom(data.roomId);
      }
    } catch {
      // Connection error - ignore silently
    }
  }

  private async joinRoom(roomId: string): Promise<void> {
    const gameScene = new GameScene('multiplayer', {
      roomId,
      playerName: this.playerName,
      playerColor: this.selectedColor,
    });
    await sceneManager.replace(gameScene);
  }

  private async startFreeplay(): Promise<void> {
    const gameScene = new GameScene('freeplay');
    await sceneManager.replace(gameScene);
  }

  // --- UI helpers ---

  private createButton(
    parent: Container,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    onClick: () => void,
  ): void {
    const btn = new Graphics();
    btn.roundRect(-width / 2, -height / 2, width, height, 8);
    btn.fill(color);
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerover', () => {
      btn.alpha = 0.85;
    });
    btn.on('pointerout', () => {
      btn.alpha = 1;
    });
    btn.on('pointerdown', onClick);

    const text = new Text({
      text: label,
      style: new TextStyle({
        fontSize: 20,
        fill: 0xffffff,
        fontFamily: 'monospace',
      }),
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    parent.addChild(btn);
  }
}
