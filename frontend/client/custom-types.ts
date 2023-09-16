import { RcsbFv } from "@rcsb/rcsb-saguaro";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PredictionInfo } from "./prankweb-api";
import { Color } from "molstar/lib/mol-util/color";

/**
 * These interfaces represent information from the server that is received from the prediction API endpoint.
 */
export interface RegionData {
    name: string;
    start: number;
    end: number;
}

export interface ScoresData {
    conservation?: number[];
    plddt?: number[]; //also referenced to as AlphaFold score
}

export interface StructureData {
    indices: string[];
    sequence: string[];
    binding: number[];
    regions: RegionData[];
    scores: ScoresData;
}

export interface PocketData {
    name: string;
    rank: string;
    score: string;
    probability: string;
    center: string[];
    residues: string[];
    surface: string[];
    color?: string;             //color of the pocket, if already generated by rcsb plugin (e.g. "00ff00")
    isVisible?: boolean;        //if the pocket is visible
    avgConservation?: number;   //computed average conservation of the pocket
    avgAlphaFold?: number;      //computed average AlphaFold score of the pocket
}

export interface Metadata {
    //metadata can contain anything at this point
}

export interface PredictionData {
    structure: StructureData;
    pockets: PocketData[];
    metadata: Metadata;
}

/**
 * This interface and array is used to reference amino acids based on their code to the corresponding code and vice versa.
 */
interface AminoAcid {
    letter: string;
    code: string;
    name: string;
}

export const aminoCodeMap : AminoAcid[] = [
    { letter: "A", code: "ALA", name: "Alanine" },
    { letter: "R", code: "ARG", name: "Arginine" },
    { letter: "N", code: "ASN", name: "Asparagine" },
    { letter: "D", code: "ASP", name: "Aspartic Acid" },
    { letter: "C", code: "CYS", name: "Cysteine" },
    { letter: "Q", code: "GLN", name: "Glutamine" },
    { letter: "E", code: "GLU", name: "Glutamic Acid" },
    { letter: "G", code: "GLY", name: "Glycine" },
    { letter: "H", code: "HIS", name: "Histidine" },
    { letter: "I", code: "ILE", name: "Isoleucine" },
    { letter: "L", code: "LEU", name: "Leucine" },
    { letter: "K", code: "LYS", name: "Lysine" },
    { letter: "M", code: "MET", name: "Methionine" },
    { letter: "F", code: "PHE", name: "Phenylalanine" },
    { letter: "P", code: "PRO", name: "Proline" },
    { letter: "S", code: "SER", name: "Serine" },
    { letter: "T", code: "THR", name: "Threonine" },
    { letter: "W", code: "TRP", name: "Tryptophan" },
    { letter: "Y", code: "TYR", name: "Tyrosine" },
    { letter: "V", code: "VAL", name: "Valine" },
];

/**
 * cc: https://github.com/scheuerv/molart/
 * This type is used to simplify work with current residue focused in Mol*.
 */
export type MolstarResidue = {
    authName: string;
    authSeqNumber: number;
    chain: {
        asymId: string;
        authAsymId: string;
        entity: {
            entityId: string;
            index: number;
        };
        index: number;
    };
    index: number;
    insCode: string;
    isHet: boolean;
    name: string;
    seqNumber: number;
};

/**
 * These enums and interfaces are used to represent the current selected represenations/overpaint of the protein and pockets.
 */
export enum PolymerViewType {
    Atoms = 0,
    Gaussian_Surface = 1,
    Cartoon = 2
}

export enum PocketsViewType {
    Ball_Stick_Atoms_Color = 0,
    Ball_Stick_Residues_Color = 1,
    Surface_Atoms_Color = 2,
    Surface_Residues_Color = 3
}

export enum PolymerColorType {
    Clean = 0,
    Conservation = 1,
    AlphaFold = 2
}

export interface PolymerRepresentation {
    type: PolymerViewType;
    representation: StateObjectSelector; //Mol* representation
}

export interface PocketRepresentation {
    pocketId: string;
    type: PocketsViewType;
    representation: StateObjectSelector; //Mol* representation
    coloredPocket: boolean; //for efficiency when overpainting
}

/**
 * These interfaces just specify the types of React Application component props and state.
 */
export interface ReactApplicationProps {
    molstarPlugin: PluginUIContext,
    predictionInfo: PredictionInfo,
    polymerView: PolymerViewType,
    pocketsView: PocketsViewType,
    polymerColor: PolymerColorType
}

export interface ReactApplicationState {
    isLoading: boolean,
    data: PredictionData,
    error: Error | undefined,
    polymerView: PolymerViewType,
    pocketsView: PocketsViewType,
    polymerColor: PolymerColorType,
    isShowOnlyPredicted: boolean,
    pluginRcsb: RcsbFv | undefined,
    serverTasks: ServerTask[],
    numUpdated: number,
    tabIndex: number,
    initialPocket: number
}

/**
 * This interface is used for working with chains and their residues when selecting different residues with possibly different thresholds.
 * The threshold may not be entered. 
 */
export interface ChainData {
    threshold?: number;
    chainId: string;
    residueNums: number[];
}

/**
 * Those constants represent the AlphaFold thresholds and the colors for the different thresholds.
 * Defined here: https://alphafold.ebi.ac.uk/
 */
export const AlphaFoldThresholdsRcsb = [0.5, 0.7, 0.9];
export const AlphaFoldThresholdsMolStar = [90, 70, 50, 0];

export const AlphaFoldColorsRcsb = [
    "#ff7d45",
    "#ffdb13",
    "#65cbf3",
    "#0053d6"
];
export const AlphaFoldColorsMolStar = [
    Color.fromRgb(0, 83, 214),
    Color.fromRgb(101, 203, 243),
    Color.fromRgb(255, 219, 19),
    Color.fromRgb(255, 125, 69)
]

/**
 * This array contains first colors used to color the pockets.
 * Colorblind edited scheme 'Wong' from https://davidmathlogic.com/colorblind/ 
 */
export const DefaultPocketColors = [
    "CE0000",
    "F0E442",
    "E69F00",
    "56B4E9",
    "009E73",
    "0072B2",
    "DA74AD"
];

/**
 * These enums/interfaces are used to represent various client/server tasks and their data.
 */
export enum ClientTaskType {
    Volume = 0,
    DockingTaskCount = 1
}

export const ClientTaskTypeDescriptors = [
    "Atoms volume",
    "Number of docking tasks"
]

export interface ClientTask {
    pocket: string;
    type: ClientTaskType;
    data: any;
}

export interface ClientTaskLocalStorageData extends ClientTask {
    //potentially may contain more data
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export enum ServerTaskType {
    Docking = 0
}

export const ServerTaskTypeDescriptors = [
    "Molecular docking"
]

export interface ServerTask {
    pocket: string;
    type: ServerTaskType;
    data: ServerTaskInfo;
}

export interface ServerTaskInfo {
    id: string;
    created: string;
    lastChange: string;
    status: string;
    initialData: {
        hash: string;       //hash of the data
        pocket: string;     //pocket id
        [key: string]: any; //other data
    };   //initial data
    responseData: any;  //response data
}

export interface ServerTaskLocalStorageData {
    name: string,
    params: string,
    pocket: number,
    created: string,
    status: string,
    type: ServerTaskType,
    responseData: any
}