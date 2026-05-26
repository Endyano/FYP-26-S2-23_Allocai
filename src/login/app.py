from flask import Flask, render_template, request, redirect, session
from models.UserAccount import UserAccount
from models.UserSession import UserSession

app = Flask(__name__)

# a secret key for session management
app.secret_key = "smart_task_allocation_secret_key"


# to show login page
@app.route('/')
def login_page():
    error = session.pop('login_error', None)

    return render_template(
        'login.html', # change accordingly depending on the frontend file name and language
        error=error
    )


# for login process
@app.route('/login', methods=['POST'])
def login():

    # to receive form data
    username = request.form.get('username')
    password = request.form.get('password')
    role = request.form.get('role')

    # to validate the input
    if not username or not password or not role:
        session['login_error'] = 'Please fill in all login fields.'
        return redirect('/')

    # to verify user account
    user_account = UserAccount()

    user = user_account.verify(
        username,
        password,
        role
    )

    # for invalid login
    if user is None:
        session['login_error'] = 'Invalid username, password, or role.'
        return redirect('/')

    # Create session
    UserSession.login(user)

    # Redirect based on role
    # the file name change accordingly
    if user['role'] == 'manager':
        return redirect('/manager_dashboard')

    elif user['role'] == 'casual_staff':
        return redirect('/casual_staff_dashboard')

    elif user['role'] == 'department':
        return redirect('/department_dashboard')

    else:
        session['login_error'] = 'Unknown role.'
        return redirect('/')


# managing all the dashboards
# file name change accordingly
# for manager dashboard
@app.route('/manager_dashboard')
def manager_dashboard():

    if not UserSession.is_logged_in():
        return redirect('/')

    if UserSession.get_role() != 'manager':
        return "Access Denied"

    return render_template('manager_dashboard.html') # file name change accordingly


# file name change accordingly
# for casual staff dashboard
@app.route('/casual_staff_dashboard')
def casual_staff_dashboard():

    if not UserSession.is_logged_in():
        return redirect('/')

    if UserSession.get_role() != 'casual_staff':
        return "Access Denied"

    return render_template('casual_staff_dashboard.html') # file name change accordingly


# file name change accordingly
# for department dashboard
@app.route('/department_dashboard')
def department_dashboard():

    if not UserSession.is_logged_in():
        return redirect('/')

    if UserSession.get_role() != 'department':
        return "Access Denied"

    return render_template('department_dashboard.html') # file name change accordingly


# for logout process
@app.route('/logout')
def logout():

    UserSession.logout()

    return redirect('/')


# to run the main program
if __name__ == '__main__':
    app.run(debug=True)