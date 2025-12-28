import eel

eel.init('web')

@eel.expose
def calculate(expression):
    try:
        return str(eval(expression))
    except:
        return "Error"

eel.start('index.html', size=(400, 600))
