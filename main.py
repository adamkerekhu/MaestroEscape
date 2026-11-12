"""Entry point for the original Among Us clone and MaestroEscape adaptation.

python main.py             -> original Pygame Among Us menu
python main.py --maestro   -> MaestroEscape mode using the same Pygame engine
"""
import sys

if "--maestro" in sys.argv:
    from maestro_native import main as run_maestro
    run_maestro()
else:
    from game import Game

    while True:
        game = Game()
        game.menu.game_intro()
        del game
