import flask
from flask import Blueprint, request
from .database_v1 import register_database_v1
from .database_v2 import register_database_v2
from .database_v3 import register_database_v3

from .docking_task import DockingTask

api_v2 = Blueprint("api_v2", __name__)

databases = {
    database.name(): database
    for database in [
        *register_database_v1(),
        *register_database_v2(),
        *register_database_v3()
    ]
}

# prediction routes

@api_v2.route(
    "/prediction/<database_name>/<prediction_name>",
    methods=["GET"]
)
def route_get_info(database_name: str, prediction_name: str):
    database = databases.get(database_name, None)
    if database is None:
        return "", 404
    return database.get_info(prediction_name.upper())


@api_v2.route(
    "/prediction/<database_name>",
    methods=["POST"]
)
def route_post(database_name: str):
    database = databases.get(database_name, None)
    if database is None:
        return "", 404
    return database.create(flask.request.files)


@api_v2.route(
    "/prediction/<database_name>/<prediction_name>/log",
    methods=["GET"]
)
def route_get_log(database_name: str, prediction_name: str):
    database = databases.get(database_name, None)
    if database is None:
        return "", 404
    return database.get_log(prediction_name.upper())


@api_v2.route(
    "/prediction/<database_name>/<prediction_name>/public/<file_name>",
    methods=["GET"]
)
def route_get_file(database_name: str, prediction_name: str, file_name: str):
    database = databases.get(database_name, None)
    if database is None:
        return "", 404
    return database.get_file(prediction_name.upper(), file_name)

# docking routes

@api_v2.route(
    "/docking/<database_name>/<prediction_name>/post",
    methods=["POST"]
)
def route_post_docking_file(database_name: str, prediction_name: str):
    """Post a docking task to the server.
    Request body should be a JSON object with the following fields:
    - hash: str (a hash of the ligand with parameters)
    - pocket: int (pocket number)
    - smiles: str (SMILES for the ligand)
    - pH: float (pH value)
    - bounding_box: dict (bounding box for the docking)"""
    data = request.get_json(force=True) or {}
    dt = DockingTask(database_name=database_name)
    return dt.post_task(prediction_name.upper(), data)

@api_v2.route(
    "/docking/<database_name>/<prediction_name>/public/<file_name>",
    methods=["POST"]
)
def route_get_docking_file_with_param(database_name: str, prediction_name: str, file_name: str):
    """Get a docking file from the server.
    Request body should be a JSON object with the following fields:
    - hash: str (a hash of the ligand with parameters)"""
    data = request.get_json(force=True)
    param = data.get("hash", None)
    if data is None or param is None:
        return "", 404
    dt = DockingTask(database_name=database_name)
    return dt.get_file_with_post_param(prediction_name.upper(), file_name, param)

@api_v2.route(
    "/docking/<database_name>/<prediction_name>/tasks",
    methods=["GET"]
)
def route_get_all_docking_tasks(database_name: str, prediction_name: str):
    """Get all docking tasks from the server."""
    dt = DockingTask(database_name=database_name)
    return dt.get_all_tasks(prediction_name.upper())