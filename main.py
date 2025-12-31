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

# ---------------- PATH FIX ----------------
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


eel.init(resource_path("web"))
init_db()  # 🔥 MUST RUN ONCE AT START


# ---------------- SAFE EVAL ----------------
OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg
}


def safe_eval(expr):
    def eval_node(node):
        if isinstance(node, ast.Num):
            return node.n
        if isinstance(node, ast.BinOp):
            return OPS[type(node.op)](
                eval_node(node.left),
                eval_node(node.right)
            )
        if isinstance(node, ast.UnaryOp):
            return OPS[type(node.op)](eval_node(node.operand))
        raise ValueError("Invalid")

    return eval_node(ast.parse(expr, mode="eval").body)


# ---------------- PATTERN LOGIC ----------------
def ast_to_pattern(node):
    if isinstance(node, ast.Num):
        return "A"
    if isinstance(node, ast.BinOp):
        return f"({type(node.op).__name__} {ast_to_pattern(node.left)} {ast_to_pattern(node.right)})"
    if isinstance(node, ast.UnaryOp):
        return f"(Unary {ast_to_pattern(node.operand)})"
    raise ValueError("Unsupported")


def extract_pattern(expr):
    return ast_to_pattern(ast.parse(expr, mode="eval").body)


def generate_template(expr):
    tree = ast.parse(expr, mode="eval")
    counter = 0

    def build(node):
        nonlocal counter
        if isinstance(node, ast.Num):
            v = chr(65 + counter)
            counter += 1
            return v
        if isinstance(node, ast.BinOp):
            return f"({build(node.left)} {sym(node.op)} {build(node.right)})"
        if isinstance(node, ast.UnaryOp):
            return f"-{build(node.operand)}"

    def sym(op):
        return {
            ast.Add: "+",
            ast.Sub: "-",
            ast.Mult: "*",
            ast.Div: "/"
        }[type(op)]

    return build(tree.body), counter


# ---------------- EEL API ----------------
@eel.expose
def calculate(expression):
    try:
        result = safe_eval(expression)
        save_history(expression, str(result))  # ✅ NOW WORKS
        return {"result": str(result)}
    except Exception as e:
        print("Calc error:", e)
        return {"result": "Error"}


@eel.expose
def load_history():
    return get_history()


@eel.expose
def save_named_pattern(name, expression):
    try:
        pattern_key = extract_pattern(expression)
        template, count = generate_template(expression)
        save_pattern(name, pattern_key, template, count)  # ✅ NOW WORKS
        return True
    except Exception as e:
        print("Pattern error:", e)
        return False


@eel.expose
def load_patterns():
    return get_patterns()


@eel.expose
def apply_pattern(template, values):
    expr = template
    for k, v in values.items():
        expr = expr.replace(k, v)
    try:
        return str(safe_eval(expr))
    except:
        return "Error"


eel.start("index.html", size=(1000, 550), block=True)
