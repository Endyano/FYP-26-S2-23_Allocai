class UserAccount:

    def __init__(self):
        self.users = [
            # connect with database
        ]

    def verify(self, username, password, role):

        for user in self.users:
            if (
                user['username'] == username
                and user['password'] == password
                and user['role'] == role
            ):
                return user

        return None