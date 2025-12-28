import eel
import ast
import operator
import os
import sys

# ----------------- PATH FIX (for EXE) -----------------
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

eel.init(resource_path("web"))

# ----------------- SAFE EVALUATOR -----------------

# Supported operators only
operators = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg
}

def safe_eval(expr):
    def eval_node(node):
        if isinstance(node, ast.Num):  # number
            return node.n

        if isinstance(node, ast.BinOp):  # binary ops
            left = eval_node(node.left)
            right = eval_node(node.right)
            op = operators.get(type(node.op))
            if not op:
                raise ValueError("Unsupported operator")
            return op(left, right)

        if isinstance(node, ast.UnaryOp):  # unary minus
            op = operators.get(type(node.op))
            if not op:
                raise ValueError("Unsupported unary operator")
            return op(eval_node(node.operand))

        raise ValueError("Invalid expression")

    tree = ast.parse(expr, mode="eval")
    return eval_node(tree.body)

# ----------------- EEL EXPOSED FUNCTION -----------------
@eel.expose
def calculate(expression):
    try:
        result = safe_eval(expression)
        return str(result)
    except Exception:
        return "Error"

# ----------------- START APP -----------------
eel.start(
    "index.html",
    size=(720, 520),
    block=True
)
