import json
import os
from datetime import datetime

DATA_PATH = os.path.join("data", "history.json")


def load_patterns():
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def save_patterns(data):
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=4)


def add_pattern(name, expression):
    """
    Save a new calculation pattern
    Example:
    name = "Billing Formula"
    expression = "(x * y) + z"
    """
    data = load_patterns()

    pattern = {
        "id": len(data["patterns"]) + 1,
        "name": name,
        "expression": expression,
        "created_at": datetime.now().isoformat()
    }

    data["patterns"].append(pattern)
    save_patterns(data)

    return pattern


def get_patterns():
    """
    Return all saved patterns
    """
    data = load_patterns()
    return data["patterns"]


def evaluate_pattern(expression, values):
    """
    Evaluate expression with given values

    expression: "(x * y) + z"
    values: {"x": 10, "y": 5, "z": 2}
    """
    safe_expr = expression

    for key, value in values.items():
        safe_expr = safe_expr.replace(key, str(value))

    try:
        result = eval(safe_expr)
    except Exception:
        raise ValueError("Invalid calculation")

    return result
