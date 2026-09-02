from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

def analyze_sequence(fasta_text):
    query = """
    query($sequence: String!) {
      viewer {
        sequenceAnalysis(sequences: [{header: "input", sequence: $sequence}]) {
          drugResistance {
            gene { name }
            drugScores {
              drugClass { name }
              drug { displayAbbr }
              text
            }
          }
          mutations { text }
        }
      }
    }
    """
    r = requests.post("https://hivdb.stanford.edu/graphql",
                       json={"query": query, "variables": {"sequence": fasta_text}})
    return r.json()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    seq = request.json.get("sequence", "")
    result = analyze_sequence(seq)
    try:
        analysis = result["data"]["viewer"]["sequenceAnalysis"][0]
        mutations = [m["text"] for m in analysis["mutations"]]
        rows = []
        for gene_entry in analysis["drugResistance"]:
            gene = gene_entry["gene"]["name"]
            for score in gene_entry["drugScores"]:
                rows.append({
                    "gene": gene,
                    "drugClass": score["drugClass"]["name"],
                    "drug": score["drug"]["displayAbbr"],
                    "resistance": score["text"]
                })
        return jsonify({"mutations": mutations, "rows": rows})
    except (KeyError, IndexError):
        return jsonify({"error": "Could not parse result"})

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)