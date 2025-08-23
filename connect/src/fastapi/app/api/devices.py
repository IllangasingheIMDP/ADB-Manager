from fastapi import APIRouter
router = APIRouter()

@router.get("/devices")
async def get_devices():
    return{"devices":[]}