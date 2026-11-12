"""MaestroEscape: first pub-escape ruleset using the ORIGINAL Pygame engine.

Run: python maestro_native.py

This mode deliberately reuses Game, Player, Bot, Camera, TiledMap, existing
sprites, sounds, collisions, and map assets from the uploaded Among Us clone.
It is a desktop single-player rules test, not a browser/multiplayer port.
"""
import math
import random
import sys

import pygame as pg

from game import Game
from sprites import Player
from settings import FPS, WIDTH, HEIGHT


ROUND_SECONDS = 360
INTERACT_RADIUS = 115
SABOTAGE_SECONDS = 15

# Valid locations from the original map's spawn and vent coordinates.
# Rename/reposition these after replacing the spaceship TMX with the pub TMX.
LOCATIONS = {
    "JACKET": (3046, 791),
    "CAR KEYS": (3563, 762),
    "CAR": (3898, 791),
    "TAXI": (4513, 1525),
    "BUBI": (3694, 1942),
    "KEBAB SHOP": (2220, 1711),
    "TRAFIK": (1887, 1578),
}


class MaestroRules:
    def __init__(self):
        self.jacket = False
        self.keys = False
        self.drinks = 0
        self.hits = 0
        self.blocked = {route: 0 for route in ("CAR", "TAXI", "BUBI")}
        self.waiting = None
        self.started = pg.time.get_ticks()
        self.notice = "Get your jacket. E interact, WASD move. Escape via taxi, car or Bubi."
        self.notice_until = self.started + 7000
        self.winner = None

    def notify(self, message):
        self.notice = message
        self.notice_until = pg.time.get_ticks() + 3500

    def action(self, player):
        now = pg.time.get_ticks()
        x, y = player.pos.x, player.pos.y
        nearby = sorted(
            ((math.hypot(x - p[0], y - p[1]), key) for key, p in LOCATIONS.items()),
        )
        distance, place = nearby[0]
        if distance > INTERACT_RADIUS:
            self.notify("Get closer to an interaction point.")
            return
        if place == "JACKET":
            self.jacket = True
            self.notify("Jacket collected. Time to go home!")
            return
        if place == "CAR KEYS":
            self.keys = True
            self.notify("Car keys collected.")
            return
        if place in ("KEBAB SHOP", "TRAFIK"):
            # The original game already has a vent/teleport mechanic.
            # This initial mode keeps the destination visible as a waypoint.
            self.notify(place + ": shortcut location (teleport coming in multiplayer).")
            return
        if not self.jacket:
            self.notify("Collect the jacket before leaving!")
            return
        if now < self.blocked[place]:
            self.notify(place + " is sabotaged. Try another way home.")
            return
        if place == "CAR":
            if self.keys:
                self.winner = "ESCAPER VIA CAR"
            else:
                self.notify("You need the car keys first.")
        elif place in ("TAXI", "BUBI"):
            delay = 8000 if place == "TAXI" else 4000
            if self.waiting is None or self.waiting[0] != place:
                self.waiting = (place, now + delay)
                self.notify(place + " requested. Stay nearby and press E again.")
            elif now >= self.waiting[1]:
                self.winner = "ESCAPER VIA " + place
            else:
                self.notify("Wait " + str(math.ceil((self.waiting[1] - now) / 1000)) + " seconds.")

    def step(self, player, bots):
        now = pg.time.get_ticks()
        if now - self.started > ROUND_SECONDS * 1000:
            self.winner = "HUNTERS (TIME OUT)"
        # Local prototype: nearby original NPCs provide a mild obstacle.
        # They don't yet share hunter role state over the original network.
        for bot in bots:
            if pg.sprite.collide_rect(player, bot):
                if now >= getattr(bot, "_maestro_next_drink", 0):
                    bot._maestro_next_drink = now + 14000
                    self.drinks += 1
                    self.notify("A regular offers you another drink! " + str(self.drinks) + "/5")
                    if self.drinks >= 5:
                        self.winner = "HUNTERS (TOO MANY DRINKS)"
        if self.waiting:
            dest, _ = self.waiting
            dx = player.pos.x - LOCATIONS[dest][0]
            dy = player.pos.y - LOCATIONS[dest][1]
            if math.hypot(dx, dy) > INTERACT_RADIUS * 1.4:
                self.waiting = None

    def draw(self, game):
        surface = game.screen
        font = pg.font.SysFont("arial", 20, bold=True)
        small = pg.font.SysFont("arial", 15)
        panel = pg.Surface((min(690, WIDTH - 24), 122), pg.SRCALPHA)
        panel.fill((12, 15, 27, 215))
        surface.blit(panel, (12, 12))
        left = max(0, ROUND_SECONDS - (pg.time.get_ticks() - self.started) // 1000)
        title = f"MAESTRO ESCAPE | {left // 60}:{left % 60:02d} | Drinks {self.drinks}/5"
        surface.blit(font.render(title, True, (255, 214, 138)), (24, 21))
        surface.blit(small.render(
            "Jacket: " + ("YES" if self.jacket else "NO") +
            "   Keys: " + ("YES" if self.keys else "NO") +
            "   E: interact   WASD: move   ESC: quit", True, (255, 255, 255)), (24, 54))
        near = min(LOCATIONS, key=lambda k: math.dist(LOCATIONS[k], tuple(game.player.pos)))
        dist = int(math.dist(LOCATIONS[near], tuple(game.player.pos)))
        surface.blit(small.render(f"Closest: {near} ({dist} px)", True, (135, 215, 245)), (24, 80))
        if pg.time.get_ticks() < self.notice_until:
            surface.blit(small.render(self.notice[:100], True, (255, 224, 158)), (24, 105))

        # Draw waypoint labels in camera/world coordinates on top of ORIGINAL map.
        for name, (x, y) in LOCATIONS.items():
            rect = pg.Rect(x, y, 1, 1)
            view = game.camera.apply_rect(rect)
            if -100 < view.x < WIDTH + 100 and -100 < view.y < HEIGHT + 100:
                pg.draw.circle(surface, (255, 200, 90), (view.x, view.y), 12, 2)
                surface.blit(small.render(name, True, (255, 230, 140)), (view.x + 15, view.y - 10))


def main():
    pg.init()
    try:
        pg.mixer.init()
    except pg.error:
        pass
    game = Game()
    game.gamemode = "MaestroEscape"
    game.new()
    game.player = Player(game, random.choice(game.player_pos), 0, True, game.player_colour)
    game.player.imposter = False
    rules = MaestroRules()
    running = True

    while running:
        game.dt = game.clock.tick(FPS) / 1000
        game.timer = pg.time.get_ticks()
        for event in pg.event.get():
            if event.type == pg.QUIT or (event.type == pg.KEYDOWN and event.key == pg.K_ESCAPE):
                running = False
            elif event.type == pg.KEYDOWN and event.key == pg.K_e:
                rules.action(game.player)

        game.all_sprites.update()
        game.camera.update(game.player)
        rules.step(game.player, game.bots)

        # Original map, character sprites, wall collisions and NPC animations.
        game.screen.blit(game.map_img, game.camera.apply_rect(game.map_rect))
        for sprite in game.all_sprites:
            game.screen.blit(sprite.image, game.camera.apply(sprite))
        rules.draw(game)
        if rules.winner:
            overlay = pg.Surface((WIDTH, HEIGHT), pg.SRCALPHA)
            overlay.fill((0, 0, 0, 185))
            game.screen.blit(overlay, (0, 0))
            font = pg.font.SysFont("arial", 42, bold=True)
            msg = font.render(rules.winner + " WINS!", True, (255, 220, 145))
            game.screen.blit(msg, msg.get_rect(center=(WIDTH // 2, HEIGHT // 2)))
        pg.display.flip()
        if rules.winner:
            pg.time.wait(2800)
            running = False
    pg.quit()


if __name__ == "__main__":
    main()
