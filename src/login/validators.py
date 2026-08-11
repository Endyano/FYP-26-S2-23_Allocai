import re

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


def is_valid_email(email):
    return bool(EMAIL_PATTERN.match(str(email).strip()))


def is_valid_phone(phone):
    return bool(PHONE_PATTERN.match(str(phone).strip()))
