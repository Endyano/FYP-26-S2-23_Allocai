import datetime
import decimal
import os
import uuid

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS

from boundary.auth_boundary import auth_bp
from boundary.manager_boundary import manager_bp
from boundary.public_boundary import public_bp
from boundary.full_time_staff_boundary import full_time_staff_bp
from control.auth_control import AuthControl
from boundary.part_time_staff_boundary import part_time_staff_bp
from boundary.company_admin_boundary import company_admin_bp

load_dotenv()


class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, (datetime.time, datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, uuid.UUID):
            return str(obj)
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super().default(obj)


app = Flask(__name__)
app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "smart_task_allocation_secret_key")

CORS(app, supports_credentials=True)

app.register_blueprint(public_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(manager_bp)
app.register_blueprint(full_time_staff_bp)
app.register_blueprint(part_time_staff_bp)
app.register_blueprint(company_admin_bp)


@app.route("/")
def health_check():
    return jsonify({
        "success": True,
        "message": "Flask backend is running."
    })


@app.route("/login", methods=["POST"])
def legacy_login():
    data = request.get_json() or {}
    result = AuthControl.login(data)
    return jsonify(result), 200 if result["success"] else 401


@app.route("/logout", methods=["POST", "GET"])
def legacy_logout():
    return jsonify(AuthControl.logout())


if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)