from flask import Flask, jsonify, render_template, request, redirect, session
from models.UserAccount import UserAccount
from models.UserSession import UserSession
from flask_cors import CORS 
from models.CasualStaff import CasualStaff
from models.TaskAllocation import TaskAllocation
from models.Department import Department

app = Flask(__name__)

# a secret key for session management
app.secret_key = "smart_task_allocation_secret_key"

# 2. Attach CORS to permit Next.js (port 3000) to securely send cross-origin requests
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

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

    username = request.form.get('username')
    password = request.form.get('password')

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Please fill in all login fields."
        }), 400

    user_account = UserAccount()
    user = user_account.verify(username, password)

    if user is None:
        return jsonify({
            "success": False,
            "message": "Invalid username or password."
        }), 401

    UserSession.login(user)

    if user['role'] == 'manager':
        redirect_to = '/manager_dashboard'

    elif user['role'] == 'casual_staff':
        redirect_to = '/casual_staff_dashboard'

    elif user['role'] == 'department':
        redirect_to = '/department_dashboard'

    else:
        return jsonify({
            "success": False,
            "message": "Unknown role."
        }), 400

    return jsonify({
        "success": True,
        "message": "Login successful",
        "role": user['role'],
        "redirect_to": redirect_to
    }), 200

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
    
    task_allocation = TaskAllocation()

    assigned_tasks = task_allocation.get_allocations_by_staff(
        UserSession.get_user_id()
    )

    return render_template(
        'casual_staff_dashboard.html', # filename change accordingly
        username=UserSession.get_username(),
        assigned_tasks=assigned_tasks
    )

# file name change accordingly
# for department dashboard
@app.route('/department_dashboard')
def department_dashboard():

    if not UserSession.is_logged_in():
        return redirect('/')

    if UserSession.get_role() != 'department':
        return "Access Denied"
    
    casual_staff = CasualStaff()
    task_allocation = TaskAllocation()

    available_staff = casual_staff.get_all_staff()
    recent_allocations = task_allocation.get_all_allocations()

    return render_template(
        'department_dashboard.html', # filename change accordingly
        username=UserSession.get_username(),
        available_staff=available_staff,
        recent_allocations=recent_allocations
    )

# for logout process
@app.route('/logout')
def logout():

    UserSession.logout()

    return redirect('/')


# to run the main program
if __name__ == '__main__':
    app.run(debug=True)
