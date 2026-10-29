import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app)
BASE = os.path.dirname(os.path.abspath(__file__))


@app.get("/")
def index():
    return send_from_directory(BASE, "index.html")


@app.get("/health")
def health():
    return jsonify(status="ok", project="Team B: Live Whiteboard", stack="flask")

@app.route("/api/rooms", methods=["POST"])
def ep_0(**kwargs):
    # TODO: Create a room -> {roomId}
    return jsonify(error="Not implemented", todo="Create a room -> {roomId}"), 501

@app.route("/api/rooms/<id>", methods=["GET"])
def ep_1(**kwargs):
    # TODO: Get the current board state
    return jsonify(error="Not implemented", todo="Get the current board state"), 501


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
