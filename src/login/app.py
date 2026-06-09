from flask import Flask, jsonify, render_template, request, redirect, session
from flask_cors import CORS

from models.UserAccount import UserAccount
from models.UserSession import UserSession
from models.CasualStaff import CasualStaff
from models.TaskAllocation import TaskAllocation
from models.Manager import Manager

app = Flask(__name__)

app.secret_key = "smart_task_allocation_secret_key"

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
)


def get_request_data():
    if request.is_json:
        return request.get_json() or {}

    return request.form


def require_login(required_role=None):
    if not UserSession.is_logged_in():
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    if required_role and UserSession.get_role() != required_role:
        return jsonify({
            "success": False,
            "message": "Access Denied"
        }), 403

    return None


@app.route('/')
def login_page():
    return jsonify({
        "success": True,
        "message": "Flask backend is running."
    })


@app.route('/login', methods=['POST'])
def login():
    data = get_request_data()

    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    print(f"--- INCOMING LOGIN ATTEMPT ---")
    print(f"Typed Username: {username}")
    print(f"Typed Password: {password}")
    print(f"Selected Role: {role}")
    print(f"------------------------------")

    if not username or not password or not role:
        return jsonify({
            "success": False,
            "message": "Please fill in all login fields."
        }), 400

    user_account = UserAccount()
    user = user_account.verify(username, password, role)

    if user is None:
        return jsonify({
            "success": False,
            "message": "Invalid username, password, or role."
        }), 401

    if user.get('is_suspended'):
        return jsonify({
            "success": False,
            "message": "Login authentication failed. This account is suspended."
        }), 403

    UserSession.login(user)

    if user['role'] == 'manager':
        redirect_to = '/Features/manager_dashboard'

    elif user['role'] == 'casual_staff':
        redirect_to = '/Features/casual_staff_dashboard'

    elif user['role'] == 'department':
        redirect_to = '/Features/department_dashboard'

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


@app.route('/api/login', methods=['POST'])
def api_login():
    return login()


@app.route('/manager_dashboard')
def manager_dashboard():
    if not UserSession.is_logged_in():
        return redirect('/')

    if UserSession.get_role() != 'manager':
        return "Access Denied"

    return render_template('manager_dashboard.html')


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
        'casual_staff_dashboard.html',
        username=UserSession.get_username(),
        assigned_tasks=assigned_tasks
    )


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
        'department_dashboard.html',
        username=UserSession.get_username(),
        available_staff=available_staff,
        recent_allocations=recent_allocations
    )


@app.route('/api/department/tasks', methods=['GET', 'POST'])
def department_tasks():
    access_error = require_login('department')

    if access_error:
        return access_error

    task_allocation = TaskAllocation()

    if request.method == 'GET':
        return jsonify({
            "success": True,
            "message": "Task requests retrieved successfully.",
            "tasks": task_allocation.get_allocations_by_department(
                UserSession.get_user_id()
            )
        }), 200

    data = get_request_data()

    result = task_allocation.create_task(
        UserSession.get_user_id(),
        data
    )

    status_code = 201 if result["success"] else 400

    return jsonify(result), status_code


@app.route('/department/create_task', methods=['POST'])
def create_department_task():
    return department_tasks()


@app.route('/api/casual_staff/profile', methods=['GET', 'POST', 'PUT'])
def casual_staff_profile():
    access_error = require_login('casual_staff')

    if access_error:
        return access_error

    casual_staff = CasualStaff()

    if request.method == 'GET':
        profile = casual_staff.get_profile(
            UserSession.get_user_id()
        )

        if profile is None:
            return jsonify({
                "success": False,
                "message": "Profile was not found."
            }), 404

        return jsonify({
            "success": True,
            "message": "Profile retrieved successfully.",
            "profile": profile
        }), 200

    data = get_request_data()

    result = casual_staff.update_profile(
        UserSession.get_user_id(),
        data.get('full_name'),
        data.get('username') or data.get('email')
    )

    status_code = 200 if result["success"] else 400

    return jsonify(result), status_code


@app.route('/api/casual_staff/schedule', methods=['GET'])
def casual_staff_schedule():
    access_error = require_login('casual_staff')

    if access_error:
        return access_error

    task_allocation = TaskAllocation()

    result = task_allocation.get_upcoming_schedule_by_staff(
        UserSession.get_user_id()
    )

    if result["success"] and not result["schedule"]:
        result["message"] = "There are no upcoming tasks."

    status_code = 200 if result["success"] else 500

    return jsonify(result), status_code


@app.route('/logout')
def logout():
    if not UserSession.is_logged_in():
        return redirect('/')

    UserSession.logout()

    return redirect('/')


@app.route('/api/manager/staff', methods=['GET'])
def manager_view_staff():

    access_error = require_login('manager')

    if access_error:
        return access_error

    casual_staff = CasualStaff()

    return jsonify({
        "success": True,
        "staff": casual_staff.get_all_staff()
    }), 200


@app.route('/api/manager/create-staff', methods=['POST'])
def create_staff():
    access_error = require_login('manager')

    if access_error:
        return access_error

    data = request.get_json() or {}

    manager = Manager()

    result = manager.create_staff(
        data.get("full_name"),
        data.get("email"),
        data.get("password")
    )

    status_code = 201 if result["success"] else 400

    return jsonify(result), status_code


@app.route('/api/logout', methods=['POST', 'GET'])
def api_logout():
    if not UserSession.is_logged_in():
        return jsonify({
            "success": False,
            "message": "No account is currently logged in."
        }), 401

    UserSession.logout()

    return jsonify({
        "success": True,
        "message": "Logout successful.",
        "redirect_to": "/"
    }), 200


if __name__ == '__main__':
    # Change 'localhost' to '127.0.0.1'
    app.run(host='127.0.0.1', port=5000, debug=True)
