# HIV Antiviral Resistance Scanner

Live: https://hiv-resistance-scanner.onrender.com

(It's on the free hosting tier so it goes to sleep after a while — give it 
30-50 sec to wake up if it's slow the first time you open it)

This is a project I built for my final year bioinformatics portfolio. It 
takes an HIV sequence and tells you which drugs it's resistant to, using 
Stanford's HIVdb database (the tool actually used for this kind of testing 
in real labs).

I got interested in this because resistance testing takes time and needs 
someone who knows how to read the results properly, which isn't always 
available everywhere. Stanford already has the science figured out through 
their Sierra API, so I focused on building something around it that a doctor 
could actually use — enter patient details, paste the sequence, get a clear 
report back, not just raw numbers.

The part I spent the most time on is the 3D view. You can see exactly where 
a mutation is sitting on the protein compared to where the drug is supposed 
to attach. If they're close together it usually explains why that drug stopped 
working.

Built with Flask for the backend, plain HTML/CSS/JS for the frontend, and 
3Dmol.js for the structure viewer. Deployed on Render.

Still working on: verifying the exact active site residue positions using 
CASTp instead of the reference values I'm using right now — want that part 
to be more accurate before I call it "done."

Obviously this isn't a real diagnostic tool, just a student project — any 
results here should go through an actual doctor.