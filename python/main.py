from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load the trained model
model = joblib.load("air_quality_model.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # Expecting {"temperature": ..., "humidity": ..., ...}
    features = [data['temperature'], data['humidity'], data['nox'], data['nh3'], data['so2'], data['voc'], data['co2']]
    prediction = model.predict([features])  # Predict next AQI
    return jsonify({"aqi_prediction": prediction[0]})

if __name__ == '__main__':
    app.run(debug=True)
