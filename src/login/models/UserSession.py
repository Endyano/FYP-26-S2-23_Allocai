from flask import session


class UserSession:

    @staticmethod
    def login(user):
        session['user_id'] = user['id']
        session['username'] = user['email']
        session['role'] = user['role']
        session['full_name'] = user.get('full_name')

    @staticmethod
    def logout():
        session.clear()

    @staticmethod
    def is_logged_in():
        return 'user_id' in session

    @staticmethod
    def get_user_id():
        return session.get('user_id')

    @staticmethod
    def get_username():
        return session.get('username')

    @staticmethod
    def get_role():
        return session.get('role')

    @staticmethod
    def get_full_name():
        return session.get('full_name')
