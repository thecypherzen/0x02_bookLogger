#!/usr/bin/python3

from flask import Flask, url_for, render_template

app = Flask(__name__)

@app.route('/', strict_slashes=False)
def index():
    """ returns the index view """
    return render_template("index.html")

'''
if __name__ == "__main__":
    app.run(host="0.0.0.0",
            port=5001)
'''
