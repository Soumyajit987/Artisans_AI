import json
from pathlib import Path


BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"


def load_json(filename: str):
    file_path = DATA_DIR / filename

    if not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def save_json(filename: str, data):
    file_path = DATA_DIR / filename

    DATA_DIR.mkdir(exist_ok=True)

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )