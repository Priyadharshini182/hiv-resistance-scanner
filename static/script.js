document.getElementById("sampleBtn").addEventListener("click", () => {
    document.getElementById("seqInput").value =
        `>sample
CCTCAGATCACTCTTTGGCAACGACCCCTCGTCACAATAAAGATAGGGGGGCAACTAAAGGAAGCTCTATTAGATACAGGAGCAGATGATACAGTATTAGAAGAAATGAGTTTGCCAGGAAGATGGAAACCAAAAATGATAGGGGGAATTGGAGGTTTTATCAAAGTAAGACAGTATGAT`;
});

const activeSites = {
    "PR": [25, 27, 29, 30, 50],
    "RT": [110, 185, 186, 188],
    "IN": [64, 116, 152]
};
const pdbIds = { "PR": "1HXB", "RT": "1RTH", "IN": "1BIS" };

let lastData = null;

document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const patientName = document.getElementById("patientName").value;
    const patientId = document.getElementById("patientId").value;
    const seq = document.getElementById("seqInput").value;

    if (!patientName || !patientId) { alert("Please enter patient name and ID."); return; }
    if (!seq.trim()) { alert("Please paste a sequence."); return; }

    document.getElementById("analyzeBtn").innerText = "Analyzing...";

    const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence: seq })
    });
    const data = await response.json();
    document.getElementById("analyzeBtn").innerText = "Analyze";

    if (data.error) { alert("Could not analyze sequence."); return; }

    lastData = data;
    renderResults(data);
});

function resistClass(text) {
    const t = text.toLowerCase();
    if (t.includes("high")) return "pill-high";
    if (t.includes("intermediate")) return "pill-intermediate";
    if (t.includes("low")) return "pill-low";
    return "pill-susceptible";
}

function renderResults(data) {
    document.getElementById("results").style.display = "block";

    const patientName = document.getElementById("patientName").value;
    const patientId = document.getElementById("patientId").value;
    const age = document.getElementById("patientAge").value;
    const sex = document.getElementById("patientSex").value;
    const date = document.getElementById("sampleDate").value;
    const clinician = document.getElementById("clinicianName").value || "—";

    document.getElementById("patientBanner").innerHTML =
        `<b>Patient:</b> ${patientName} &nbsp;|&nbsp; <b>ID:</b> ${patientId} &nbsp;|&nbsp;
         <b>Age/Sex:</b> ${age} / ${sex} &nbsp;|&nbsp; <b>Sample date:</b> ${date} &nbsp;|&nbsp;
         <b>Clinician:</b> ${clinician}`;

    const mutations = data.mutations;
    document.getElementById("mutCount").innerText = mutations.length;
    document.getElementById("mutCodes").innerText = mutations.length ? mutations.join(", ") : "None";

    const cardsDiv = document.getElementById("resultCards");
    cardsDiv.innerHTML = "";
    data.rows.forEach(r => {
        cardsDiv.innerHTML += `
        <div class="result-card">
            <span><b>${r.drug}</b> &nbsp;·&nbsp; ${r.drugClass} &nbsp;·&nbsp; ${r.gene}</span>
            <span class="resist-pill ${resistClass(r.resistance)}">${r.resistance}</span>
        </div>`;
    });

    const geneSelect = document.getElementById("geneSelect");
    const genes = [...new Set(data.rows.map(r => r.gene))].filter(g => pdbIds[g]);
    geneSelect.innerHTML = genes.map(g => `<option value="${g}">${g}</option>`).join("");
    if (genes.length) renderStructure(genes[0], mutations);
    geneSelect.onchange = () => renderStructure(geneSelect.value, mutations);

    // Clinical summary
    const high = data.rows.filter(r => r.resistance.toLowerCase().includes("high"));
    const inter = data.rows.filter(r => r.resistance.toLowerCase().includes("intermediate"));
    const sus = data.rows.filter(r => r.resistance.toLowerCase().includes("susceptible"));
    let lines = [];
    if (high.length) lines.push(`High-level resistance detected to: <b>${[...new Set(high.map(r => r.drug))].join(", ")}</b>. Not recommended for this patient's regimen.`);
    if (inter.length) lines.push(`Intermediate resistance observed for: <b>${[...new Set(inter.map(r => r.drug))].join(", ")}</b>. Use with caution.`);
    if (sus.length) lines.push(`Full susceptibility maintained for: <b>${[...new Set(sus.map(r => r.drug))].join(", ")}</b>. Viable treatment options.`);
    if (!lines.length) lines.push("No significant resistance patterns detected.");
    document.getElementById("clinicalSummary").innerHTML =
        lines.join("<br><br>") +
        `<br><br><i>Report generated for patient <b>${patientName}</b> (ID: ${patientId}), sample dated ${date}. Interpret alongside clinical history.</i>`;
}

function renderStructure(gene, mutations) {
    const positions = mutations.map(m => parseInt(m.match(/\d+/))).filter(Boolean);
    const activeRes = activeSites[gene] || [];

    let viewerDiv = document.getElementById("viewer");
    viewerDiv.innerHTML = "";
    let viewer = $3Dmol.createViewer(viewerDiv, {});
    $3Dmol.download("pdb:" + pdbIds[gene], viewer, {}, () => {
        viewer.setStyle({}, { cartoon: { color: "lightgray" } });
        viewer.setStyle({ resi: activeRes }, { stick: { color: "blue" } });
        viewer.setStyle({ resi: positions }, { stick: { color: "red" } });

        viewer.setClickable({ resi: activeRes }, true, (atom) => {
            viewer.addLabel("Active site residue " + atom.resi, { position: atom, backgroundColor: "#3D6B8C", fontColor: "white" });
        });
        viewer.setClickable({ resi: positions }, true, (atom) => {
            viewer.addLabel("Mutation at residue " + atom.resi, { position: atom, backgroundColor: "#A32E2E", fontColor: "white" });
        });

        viewer.zoomTo();
        viewer.render();
    });
}