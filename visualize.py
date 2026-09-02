import py3Dmol

def show_structure(pdb_id, mutation_positions, active_site_positions):
    view = py3Dmol.view(query=f'pdb:{pdb_id}', width=800, height=500)
    view.setStyle({'cartoon': {'color': 'lightgray'}})

    view.addStyle({'resi': active_site_positions}, {'stick': {'color': 'blue'}})
    view.addStyle({'resi': mutation_positions}, {'stick': {'color': 'red'}})

    view.setClickable(
        {'resi': active_site_positions},
        True,
        '''function(atom,viewer){
            viewer.addLabel("Active site residue " + atom.resi,
                {position: atom, backgroundColor: "#3D6B8C", fontColor:"white", fontSize:12});
        }'''
    )

    view.setClickable(
        {'resi': mutation_positions},
        True,
        '''function(atom,viewer){
            viewer.addLabel("Mutation at residue " + atom.resi,
                {position: atom, backgroundColor: "#A32E2E", fontColor:"white", fontSize:12});
        }'''
    )

    view.zoomTo()
    return view