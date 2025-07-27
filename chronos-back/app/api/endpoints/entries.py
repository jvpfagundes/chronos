from fastapi import APIRouter, Query
from fastapi.params import Depends
from app.schemas.auth import User
from app.core.auth import get_current_user
from app.schemas.entries import ProjectSchema, EntriesSchema
from app.services.entries import Entries
from fastapi.responses import JSONResponse


router = APIRouter()



@router.get("/")
async def get_entries(dat_start: str = Query(None, alias="dat_start"),
                      dat_end: str = Query(None, alias="dat_end"),
                      limit: int = Query(None, alias="limit"),
                      offset: int = Query(None, alias="offset"),
                      require_total_count: bool = Query(False, alias="require_total_count"),
                      search: str = Query(None, alias="search"),
                      current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).get_entries(dat_start=dat_start, dat_end=dat_end, limit=limit, offset=offset,
                                                  require_total_count=require_total_count, search=search)

    return JSONResponse(content=response, status_code=response['status_code'])

@router.post("/")
async def create_entry(entry_data: EntriesSchema,
                       current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).create_entry(title=entry_data.title, description=entry_data.description,
                                                   datm_start=entry_data.datm_start,datm_end=entry_data.datm_end,
                                                   datm_interval_start=entry_data.datm_interval_start,
                                                   datm_interval_end=entry_data.datm_interval_end,
                                                   project_id=entry_data.project_id, entry_date= entry_data.date)

    return JSONResponse(content=response, status_code=response['status_code'])

@router.delete("/")
async def delete_entry(entry_id: int, current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).soft_delete_entry(entry_id=entry_id)

    return JSONResponse(content=response, status_code=response['status_code'])


@router.put('/')
async def put_entry(entry_id: int, entry_data: EntriesSchema, current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).put_entry(entry_id=entry_id, entry_data=entry_data)


    return JSONResponse(content=response, status_code=response['status_code'])


@router.get("/streak")
async def get_entries_streak(current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).get_entries_streak()

    return JSONResponse(content=response, status_code=response['status_code'])

@router.get("/days")
async def get_entries_days(dat_start: str = Query('dat_start'),
                           dat_end: str = Query('dat_end'),
                           current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).get_days_entries(dat_start=dat_start, dat_end=dat_end)

    return JSONResponse(content=response, status_code=response['status_code'])

@router.get("/cards")
async def get_entries_cards(dat_start: str = Query('dat_start'),
                            dat_end: str = Query('dat_end'),
                            current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).get_entries_cards(dat_start=dat_start, dat_end=dat_end)

    return JSONResponse(content=response, status_code=response['status_code'])


@router.get("/projects")
async def get_projects(current_user: User = Depends(get_current_user)):
    user_id = current_user.get('id')

    response = await Entries(user_id).get_projects()

    return JSONResponse(content=response, status_code=response['status_code'])

@router.post("/projects")
async def create_project(
        project_data: ProjectSchema,
        current_user: User = Depends(get_current_user)
):
    user_id = current_user.get('id')

    response = await Entries(user_id).create_project(project_name=project_data.name)

    return JSONResponse(content=response, status_code=response['status_code'])