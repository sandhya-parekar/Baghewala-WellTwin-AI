"""
Baghewala WellTwin AI - Demo Data Generator
Delegates directly to scripts/generate_synthetic_data.py for repeatable, physics-grounded synthetic datasets.
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from scripts.generate_synthetic_data import simulate_synthetic_dataset

if __name__ == "__main__":
    simulate_synthetic_dataset()
