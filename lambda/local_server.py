"""Serves the Lambda handler on http://localhost:8000 with the data files from data/ (make data)."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from wmata_fares_api import data
from wmata_fares_api.handler import lambda_handler

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
data._load = lambda name: json.loads((DATA_DIR / name).read_text())


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        res = lambda_handler({"rawPath": self.path.split("?")[0]}, None)
        self.send_response(res["statusCode"])
        for key, value in res["headers"].items():
            self.send_header(key, value)
        self.end_headers()
        try:
            self.wfile.write(res["body"].encode())
        except BrokenPipeError:
            pass  # the app aborted the request, as React's dev double mount does


if __name__ == "__main__":
    print("API on http://localhost:8000")
    ThreadingHTTPServer(("localhost", 8000), Handler).serve_forever()
