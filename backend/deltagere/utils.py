import datetime

def maybe_convert_datetime_to_date(value):
    if isinstance(value, datetime.datetime):
        assert (value.hour == 0 and
                value.minute == 0 and
                value.second == 0 and
                value.microsecond == 0), value
        return value.date()
    else:
        return value
