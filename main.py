import eel
import ast
import operator
import os
import sys

from database import (
    init_db,
    save_history,
    get_history,
    save_pattern,
    get_patterns
)

# ================= PATH FIX (EXE SAFE) =================
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


eel.init(resource_path("web"))
init_db()

# ================= SAFE AST EVALUATOR =================
OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg
}


def safe_eval(expression: str):
    def eval_node(node):
        if isinstance(node, ast.Num):
            return node.n

        if isinstance(node, ast.BinOp):
            left = eval_node(node.left)
            right = eval_node(node.right)
            op = OPS.get(type(node.op))
            if not op:
                raise ValueError("Unsupported operator")
            return op(left, right)

        if isinstance(node, ast.UnaryOp):
            op = OPS.get(type(node.op))
            if not op:
                raise ValueError("Unsupported unary operator")
            return op(eval_node(node.operand))

        raise ValueError("Invalid expression")

    tree = ast.parse(expression, mode="eval")
    return eval_node(tree.body)


# ================= PATTERN EXTRACTION =================
def ast_to_pattern(node):
    if isinstance(node, ast.Num):
        return "A"

    if isinstance(node, ast.BinOp):
        return f"({type(node.op).__name__} {ast_to_pattern(node.left)} {ast_to_pattern(node.right)})"

    if isinstance(node, ast.UnaryOp):
        return f"(Unary {ast_to_pattern(node.operand)})"

    raise ValueError("Unsupported expression")


def extract_pattern(expression):
    tree = ast.parse(expression, mode="eval")
    return ast_to_pattern(tree.body)


# ================= TEMPLATE GENERATION =================
def generate_template(expression):
    tree = ast.parse(expression, mode="eval")
    counter = 0

    def build(node):
        nonlocal counter

        if isinstance(node, ast.Num):
            var = chr(65 + counter)
            counter += 1
            return var

        if isinstance(node, ast.BinOp):
            return f"({build(node.left)} {op_symbol(node.op)} {build(node.right)})"

        if isinstance(node, ast.UnaryOp):
            return f"-{build(node.operand)}"

        raise ValueError("Unsupported node")

    def op_symbol(op):
        return {
            ast.Add: "+",
            ast.Sub: "-",
            ast.Mult: "*",
            ast.Div: "/"
        }[type(op)]

    template = build(tree.body)
    return template, counter


# ================= EEL EXPOSED APIs =================
@eel.expose
def calculate(expression):
    try:
        result = safe_eval(expression)
        save_history(expression, str(result))
        return {"result": str(result)}
    except Exception:
        return {"result": "Error"}


@eel.expose
def load_history():
    return get_history()


@eel.expose
def save_as_pattern(expression):
    try:
        pattern_key = extract_pattern(expression)
        template, var_count = generate_template(expression)
        save_pattern(pattern_key, template, var_count)
        return True
    except Exception:
        return False


@eel.expose
def load_patterns():
    return get_patterns()


@eel.expose
def apply_pattern(template, values):
    expr = template
    for key, val in values.items():
        expr = expr.replace(key, val)

    try:
        return str(safe_eval(expr))
    except Exception:
        return "Error"


# ================= START APP =================
eel.start(
    "index.html",
    size=(1000, 550),
    block=True
)
