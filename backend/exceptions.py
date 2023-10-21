
class Error(Exception):
    def __init__(self, reason, user_message=None):
        self.reason = reason
        self.user_message = user_message

class BadInputError(Error):
    pass
