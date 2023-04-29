import React from "react";

import { PredictionInfo } from "../prankweb-api";
import { PocketData, ServerTaskType, Point3D } from "../custom-types";
import { ServerTaskData } from "../custom-types";

import PocketProperty from "../viewer/components/pocket-property";
import { getPocketAtomCoordinates } from "../viewer/molstar-visualise";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";

function twoPointsDistance(point1: Point3D, point2: Point3D) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) + Math.pow(point1.z - point2.z, 2));
}

function computeBoundingBox(plugin: PluginUIContext, pocket: PocketData) {
    const coords = getPocketAtomCoordinates(plugin, pocket.surface);

    /*const points: Array<Array<number>> = [];
    coords.forEach(coord => {
        console.log(coord);
        points.push([coord.x, coord.y, coord.z]);
    });*/

    const center: Point3D = {
        x: Number(pocket.center[0]),
        y: Number(pocket.center[1]),
        z: Number(pocket.center[2])
    };
    //compute max distance from the center
    let maxDistance = 0;
    coords.forEach(coord => {
        console.log(coord);
        const distance = twoPointsDistance(coord, center);
        if(distance > maxDistance) {
            maxDistance = distance;
        }
    });

    let diagonal = maxDistance * 2;
    let sideLength = diagonal / Math.sqrt(3);

    return {
        center: {
            x: center.x,
            y: center.y,
            z: center.z
        },
        size: {
            x: Math.ceil(sideLength),
            y: Math.ceil(sideLength),
            z: Math.ceil(sideLength)
        }
    };
}

/**
 * Sends requests to the backend to compute the docking task and periodically checks if the task is finished.
 * @param firstFetch True if this is the first request (including fails), false otherwise
 * @param prediction Prediction info
 * @param pocket Pocket data
 * @param hash Task identifier (hash)
 * @param serverTasks A list of all server tasks
 * @returns Completed task data
 */
export async function computeDockingTaskOnBackend(firstFetch: boolean, prediction: PredictionInfo, pocket: PocketData, hash: string, serverTasks: ServerTaskData[], plugin: PluginUIContext): Promise<any>{
    if(hash === "") {
        return;
    }

    const box = computeBoundingBox(plugin, pocket);

    await fetch(`./api/v2/docking/${prediction.database}/${prediction.id}/post`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "hash": hash,
            "pocket": pocket.rank,
            "bounding_box": box
        }),
    }).then((res) => {
        setTimeout(() => {}, 500); //wait for the backend to process the request
    }
    ).catch(err => {
        console.log(err);
    });

    //check if the task is finished
    let matchingTasks = (serverTasks.filter((e: ServerTaskData) => e.type === ServerTaskType.Docking && e.data.initialData.hash === hash && e.data.initialData.pocket === pocket.rank));

    if(matchingTasks.length === 0) {
        return;
    }

    if(matchingTasks[0].data.status !== "successful") {
        return;
    }

    const data = await fetch(`./api/v2/docking/${prediction.database}/${prediction.id}/public/result.json`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "hash": hash,
        }
    )}).then(res => res.json()).catch(err => console.log(err));
    if(!data) {
        return;
    }

    matchingTasks[0].data.responseData = data;
    return {
        "data": matchingTasks[0].data,
        "type": ServerTaskType.Docking
    };
}

/**
 * Returns a JSX element that renders the final data of this task.
 * @param responseData Response data received from the backend (i.e. the result of the task)
 * @param pocket Pocket data
 * @returns JSX element
 */
export function renderOnServerDockingTaskCompleted(taskData: ServerTaskData, pocket: PocketData, hash: string) {
    return (
        <PocketProperty inDialog={true} title={"Docking task (" + hash + ")"} data={
            taskData.data.responseData.find((p: any) => p.rank === pocket.rank)?.count
        }/>
    );
}

export function renderOnServerDockingTaskRunning(pocket: PocketData, hash: string) {
    return (
        <PocketProperty inDialog={true} title={"Docking task (" + hash + ")"} data={"running"}/>
    );
}