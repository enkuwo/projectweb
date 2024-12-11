from flask import Flask, request, jsonify
import sqlite3
import bcrypt

app = Flask(__name__)

# Function to insert user into the database
def insert_user(username, email, password):
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = sqlite3.connect('database/users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

# Route to handle signup
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    if insert_user(username, email, password):
        return jsonify({'success': True}), 201
    else:
        return jsonify({'success': False, 'message': 'Email already exists.'}), 400

if __name__ == '__main__':
    app.run(debug=True)