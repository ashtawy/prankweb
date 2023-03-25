import { getApiEndpoint } from "../prankweb-api";
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { loadStructureIntoMolstar, createPocketsGroupFromJson, linkMolstarToRcsb, addPredictedPolymerRepresentation, showAllPocketsInRepresentation } from './molstar-visualise';
import { PocketsViewType, PredictionData } from "../custom-types";
import { initRcsb } from './rcsb-visualise'
import { RcsbFv } from "@rcsb/rcsb-saguaro";

/**
 * Method that initializes both of the plugins.
 * @param molstarPlugin Mol* plugin
 * @param database Database name for the API endpoint
 * @param identifier Identifier for the API endpoint
 * @param structureName Name of the structure
 * @param predicted True if the structure is predicted
 * @returns An updated prediction and the Rcsb plugin
 */
export async function sendDataToPlugins(molstarPlugin: PluginUIContext, database: string, identifier: string, structureName: string, predicted: boolean) : Promise<[PredictionData, RcsbFv]>{
    const baseUrl: string = getApiEndpoint(database, identifier) + "/public";

    // Download pdb/mmcif and create a model in Mol*.
    const molData = await loadStructureIntoMolstar(molstarPlugin, `${baseUrl}/${structureName}`).then(result => result);
    
    const structure = molData[1];

    // Download the prediction.
    let prediction : PredictionData = await downloadJsonFromUrl(`${baseUrl}/prediction.json`);

    // Initialize RCSB plugin + link it to Mol*.
    const rcsbPlugin : RcsbFv = initRcsb(prediction, molstarPlugin);

    // Add pockets etc. from the prediction to Mol*.
    await createPocketsGroupFromJson(molstarPlugin, structure!, "Pockets", prediction);

    // Add predicted polymer representation.
    if(predicted) await addPredictedPolymerRepresentation(molstarPlugin, prediction, structure!);

    // Show only the wanted pocket representations.
    showAllPocketsInRepresentation(molstarPlugin, PocketsViewType.Surface_Atoms_Color);

    // Link Molstar to RCSB.
    linkMolstarToRcsb(molstarPlugin, prediction, rcsbPlugin);
    
    // Compute average conservation for each pocket.
    prediction = computePocketConservationAndAFAverage(prediction);

    return [prediction, rcsbPlugin];
}

/**
 * Finds the indices of the residues in the structure.
 * @param toBeFound Residues to be found
 * @param allResidues All residues in the structure
 * @returns Indices of the residues in the structure
 */
function getResidueIndices(toBeFound: string[], allResidues: string[]) {
    let final : number[] = [];
    toBeFound.forEach(residue => {
        let index = allResidues.indexOf(residue);
        if (index > -1) {
            final.push(index);
        }
    });
    return final;
}

/**
 * Method which computes the average conservation and average AlphaFold score for each pocket.
 * @param data Prediction data
 * @returns Updated prediction data with average conservation and average AlphaFold score for each pocket
 */
function computePocketConservationAndAFAverage(data: PredictionData) {
    if (!data.structure.scores) {
        data.pockets.forEach(pocket => {pocket.avgConservation = 0});
        data.pockets.forEach(pocket => {pocket.avgAlphaFold = 0});
    }

    data.pockets.forEach(pocket => {
        let avgConservation = 0;
        let avgAlphaFold = 0;
        
        getResidueIndices(pocket.residues, data.structure.indices).forEach(index => {
            if(data.structure.scores.conservation) {
                avgConservation += data.structure.scores.conservation[index];
            }
            if(data.structure.scores.plddt) {
                avgAlphaFold += data.structure.scores.plddt[index];
            }
        });

        avgAlphaFold /= pocket.residues.length;
        pocket.avgAlphaFold = Number(avgAlphaFold.toFixed(3));

        avgConservation /= pocket.residues.length;
        pocket.avgConservation = Number(avgConservation.toFixed(3));
    });

    return data;
  }

/**
 * Attempts to download a JSON file from a given URL.
 * @param url URL
 * @returns JSON file, if successful
 */
async function downloadJsonFromUrl(url: string) {
    try {
        const response = await fetch(url, {
            method: 'GET'
        });
        const jsonResp = await response.json();
        return jsonResp;
    } catch (error) {
        console.error(error);
    }
}