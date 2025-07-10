import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from schemas.funds import SFund, SFundUpdate, SFundDonate, SFundPhotoUpdate
from repositories.funds import FundRepository




router = APIRouter(
    prefix="/funds",
    tags=['Фонды']
)

UPLOADS_DIR = "uploads"



@router.get("/", response_model=list[SFund])
async def get_all_funds(limit: int = 10, offset: int = 0):
    try:
        funds = await FundRepository.get_all_funds(limit, offset)
        return [SFund.model_validate(fund) for fund in funds]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{fund_id}", response_model=SFund)
async def get_fund_by_id(fund_id: int):
    try:
        fund = await FundRepository.get_fund_by_id(fund_id)
        return SFund.model_validate(fund)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/categories/{category_id}", response_model=list[SFund])
async def get_funds_by_category_id(category_id: int):
    try:
        funds = await FundRepository.get_funds_by_category_id(category_id)
        return [SFund.model_validate(fund) for fund in funds]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/", response_model=SFund, status_code=status.HTTP_201_CREATED)
async def create_fund(fund_data: SFundUpdate):
    try:
        fund = await FundRepository.create_fund(fund_data)
        return SFund.model_validate(fund)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{fund_id}/upload-photo")
async def upload_fund_photo(
    fund_id: int,
    file: UploadFile = File(...)
):
    # Создаем папку uploads если ее нет
    Path(UPLOADS_DIR).mkdir(exist_ok=True)
    
    filename = f"{fund_id}.jpg"
    file_path = os.path.join(UPLOADS_DIR, filename)
    
    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Обновляем путь к фото в БД
    photo_url = f"/uploads/{filename}"
    await FundRepository.update_fund(fund_id, SFundPhotoUpdate(photo_url=photo_url))
    
    return {"success": True, "photo_url": photo_url}


@router.post("/{fund_id}/donate", response_model=SFund)
async def donate_to_fund(fund_id: int, donation: SFundDonate):
    try:
        fund = await FundRepository.add_donation(fund_id, donation.amount)
        return SFund.model_validate(fund)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{fund_id}", response_model=SFund)
async def update_fund(fund_id: int, update_data: SFundUpdate):
    try:
        fund = await FundRepository.update_fund(fund_id, update_data)
        return SFund.model_validate(fund)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{fund_id}")
async def delete_fund(fund_id: int):
    try:
        await FundRepository.delete_fund(fund_id)
        return {"success": True, "detail": f"Фонд с id {fund_id} удален"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))