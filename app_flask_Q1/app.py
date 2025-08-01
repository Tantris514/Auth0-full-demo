from flask import Flask, request, jsonify, abort
from authlib.integrations.flask_oauth2 import ResourceProtector
from validator import Auth0JWTBearerTokenValidator
from uuid import uuid4
import logging
import os


log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(name)s %(threadName)s : %(message)s',
    filename=log_file_path,
    filemode='w'
)
logger = logging.getLogger(__name__)

require_auth = ResourceProtector()
validator = Auth0JWTBearerTokenValidator(
    "dev-6ysi0lcrczy3s2qd.us.auth0.com",  
    "https://validation/api"              
)
require_auth.register_token_validator(validator)

app = Flask(__name__)

#Stores the users in memory since we are not using a database
users = {}

@app.route('/users', methods=['GET'])
@require_auth("read:users")
def get_users():
    return jsonify(list(users.values()))

@app.route('/users/<int:user_id>', methods=['GET'])
@require_auth("read:users")
def get_user(user_id):
    user = users.get(user_id)
    if not user:
        logger.error(f'User with ID {user_id} not found')
        return jsonify({'error': 'User not found'}), 404
    logger.info(f'Retrieving user with ID: {user_id} : {user}')
    return jsonify(user)


@app.route('/users', methods=['POST'])
@require_auth("write:users")
def create_user():
    data = request.get_json()
    if not data or 'name' not in data or 'username' not in data:
        logger.error('Missing user data')
        abort(400, jsonify({'error': 'Missing user data'}))
    user = {
        'id': uuid4().int,
        'name': data['name'],
        'username': data['username']
    }
    users[user['id']] = user
    logger.info(f'Creating user: {user}')
    return jsonify(user), 201


@app.route('/users/<int:user_id>', methods=['DELETE'])
@require_auth("delete:users")
def delete_user(user_id):
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    del users[user_id]
    logger.info(f'Deleting user with ID: {user_id}')
    return '', 204


@app.route('/users/<int:user_id>', methods=['PUT'])
@require_auth("write:users")
def update_user(user_id):
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    if not data or ('name' not in data and 'username' not in data):
        logger.error('Missing name or username in update')
        abort(400, jsonify({'error': 'Missing name or username in update'}))
    if 'name' in data:
        users[user_id]['name'] = data['name']
    if 'username' in data:
        users[user_id]['username'] = data['username']
    logger.info(f'Updated user {user_id} with data: {data}')
    return jsonify(users[user_id])


@app.route("/api/public")
def public():
    return jsonify(message="This is a public endpoint.")

@app.route("/api/private")
@require_auth("scope_dont:exist") # This scope is not granted, so it will fail
def private():
    return jsonify(message="You accessed a private endpoint with a valid token.")



if __name__ == '__main__':
    logger.info('Starting Flask app')
    app.run(debug=True, host="localhost", port=3000)

