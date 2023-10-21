import datetime
import inspect
import sys
import threading
import traceback



class COLOR:
    black =   "\033[30m"
    red =     "\033[31m"
    green =   "\033[32m"
    yellow =  "\033[33m"
    blue =    "\033[34m"
    magenta = "\033[35m"
    cyan =    "\033[36m"
    white =   "\033[37m"

    light_black =   "\033[90m"
    light_red =     "\033[91m"
    light_green =   "\033[92m"
    light_yellow =  "\033[93m"
    light_blue =    "\033[94m"
    light_magenta = "\033[95m"
    light_cyan =    "\033[96m"
    light_white =   "\033[97m"

    bg_black =   "\033[30m"
    bg_red =     "\033[31m"
    bg_green =   "\033[32m"
    bg_yellow =  "\033[33m"
    bg_blue =    "\033[34m"
    bg_magenta = "\033[35m"
    bg_cyan =    "\033[36m"
    bg_white =   "\033[37m"

    bg_light_black =   "\033[100m"
    bg_light_red =     "\033[101m"
    bg_light_green =   "\033[102m"
    bg_light_yellow =  "\033[103m"
    bg_light_blue =    "\033[104m"
    bg_light_magenta = "\033[105m"
    bg_light_cyan =    "\033[106m"
    bg_light_white =   "\033[107m"

    bold = "\033[1m"
    no_bold = "\033[21m"
    underline = "\033[4m"
    nounderline = "\033[24m"
    inverse = "\033[7m"

    reset = "\033[00m"

_LOCK = threading.Lock()

def _log(level, message, args):
    try:
        currentframe = inspect.currentframe()
        frame = currentframe.f_back.f_back
        code = frame.f_code
        filename = code.co_filename
        linenumber = frame.f_lineno
        functionname = code.co_name
        now = datetime.datetime.now(tz=datetime.timezone.utc)
        with _LOCK:
            print(f"{COLOR.bold}{level}{COLOR.no_bold}{COLOR.light_blue}: {now}: {filename}:{linenumber}: {functionname}:{COLOR.reset} {message}{COLOR.reset}")
            sys.stdout.flush()
    finally:
        del frame
        del currentframe


def debug(message, args=None):
    _log(f"{COLOR.cyan}DEBUG", message, args)

def info(message, args=None):
    _log(f"{COLOR.blue}INFO", message, args)

def warning(message, args=None):
    _log(f"{COLOR.yellow}WARNING", message, args)
def warn(message, args=None):
    _log(f"{COLOR.yellow}WARNING", message, args)

def error(message, args=None):
    _log(f"{COLOR.red}ERROR", message, args)
def exception(message, args=None):
    _log(f"{COLOR.red}EXCEPTION", message, args)
    with _LOCK:
        traceback.print_exc()

def fatal(message, args=None):
    _log(f"{COLOR.red}FATAL", message, args)
    traceback.print_exc()
