from flask import Flask, render_template
from shutil import copyfile

app = Flask(__name__)

copyfile("../data/geojson/Metro_Lines.geojson", "static/Metro_Lines.geojson")
copyfile("../data/geojson/Metro_Stations.geojson", "static/Metro_Stations.geojson")
copyfile("../data/all_stations.json", "static/all_stations.json")

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':
      app.run(host='0.0.0.0', port=8001)
