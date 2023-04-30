#!/usr/bin/env python3
#
# Run a sample task.
#
import os
import sys
import datetime
import enum
import json
import time
import glob

from run_docking import dock_molecule

class Status(enum.Enum):
    """
    A class to represent a task status. 
    Notice that those values are written to the info.json file that is used by the frontend,
    so any changes here should be reflected in the frontend as well.
    """
    QUEUED = "queued"
    RUNNING = "running"
    FAILED = "failed"
    SUCCESSFUL = "successful"

def _load_json(path: str):
    """
    Method to load a json file from a given path.
    """
    with open(path, encoding="utf-8") as stream:
        return json.load(stream)

def _save_status_file(path: str, status: any, taskId: int):
    """
    Method to save the status file. It will update the lastChange field with the current time.
    """
    now = datetime.datetime.today()
    status["tasks"][taskId]["lastChange"] = now.strftime('%Y-%m-%dT%H:%M:%S')
    _save_json(path, status)

def _save_json(path: str, content: any):
    """
    Method to save a json file to a given path.
    """
    path_swp = path + ".swp"
    if(os.path.exists(path_swp)):
        time.sleep(1)
    with open(path_swp, "w", encoding="utf-8") as stream:
        json.dump(content, stream, ensure_ascii=True)
    os.replace(path_swp, path)

def get_prediction_directory(docking_directory: str):
    """
    Method to get the path to the prediction directory from the docking directory.
    """
    #currently assuming that the docking and predictions paths are different just by the name
    return str.replace(docking_directory, "docking", "predictions")

def get_prediction_path(docking_directory: str):
    """
    Method to get the path to the prediction file from the docking directory.
    """
    #currently assuming that the docking and predictions paths are different just by the name
    return os.path.join(get_prediction_directory(docking_directory), "public", "prediction.json")

def execute_directory_task(docking_directory: str, taskId: int):
    """
    Method to execute a task for a given directory and a given taskId.
    """

    result_file = os.path.join(docking_directory, str(taskId), "public", "result.json")

    #check if the directory exists - if not, we did not ask for this task
    #check if the result file exists - if it does, we already calculated it
    if not os.path.exists(docking_directory) or not os.path.isdir(docking_directory) or os.path.exists(result_file):
        return
    
    #first update the status file
    status_file = os.path.join(docking_directory, "info.json")
    status = _load_json(status_file)

    status["tasks"][taskId]["status"] = Status.RUNNING.value
    _save_status_file(status_file, status, taskId)

    #do the actual work here!
    #first, look for the gz file with the structure
    structure_file = ""
    for file_path in glob.glob(os.path.join(get_prediction_directory(docking_directory), "public") + "/*.gz"):
        structure_file = file_path
        break

    if structure_file == "":
        #no structure file found, we cannot do anything
        #this should not happen because the structure has to be downloadable for the prediction...
        status["tasks"][taskId]["status"] = Status.FAILED.value
        _save_status_file(status_file, status, taskId)
        return
    
    #try to dock the molecule
    try:
        dock_molecule(os.path.join(docking_directory, str(taskId), "input.json"), structure_file, os.path.join(docking_directory, str(taskId)))
    except Exception as e:
        print(repr(e))
        print(str(e))
        #something went wrong during the docking
        #TODO: add some more error handling here, provide a log?
        status["tasks"][taskId]["status"] = Status.FAILED.value
        _save_status_file(status_file, status, taskId)
        return

    #parse the prediction file and do some calculations - in this case just counting the number of residues per pocket
    #API is /docking/<database_name>/<prediction_name>/public/<file_name>
    #split docking_directory to get database_name and prediction_name
    result = []
    database_name = docking_directory.split("/")[4]
    if "user-upload" in database_name:
        prediction_name = docking_directory.split("/")[5]
    else:
        prediction_name = docking_directory.split("/")[6]

    result_url = "./api/v2/docking/" + database_name + "/" + prediction_name + "/public/out_vina.pdbqt"
    result.append({
        "url": result_url
    })
    result_json = json.dumps(result)

    #save the result file (this directory should already exist, though...)
    os.makedirs(os.path.join(docking_directory, str(taskId), "public"), exist_ok=True)

    with open(result_file, "w", encoding="utf-8") as stream:
        try:
            stream.write(result_json)
        finally:
            stream.flush()
    
    #update the status file, reload it first to make sure we don't overwrite any changes
    status = _load_json(status_file)
    
    status["tasks"][taskId]["status"] = Status.SUCCESSFUL.value
    _save_status_file(status_file, status, taskId)

def main(arguments):
    pass

if __name__ == "__main__":
    main(sys.argv[1:])
