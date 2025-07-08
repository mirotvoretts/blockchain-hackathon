from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class SFundDonate(BaseModel):
    amount: int = Field(gt=0, description="Сумма пожертвования")


class SFundBase(BaseModel):
    category_id: int = Field(default=4)
    title: str = Field(min_length=3, max_length=50)
    description: str = Field(min_length=10, max_length=100)
    target: int = Field(gt=0)
    collected: int = Field(default=0, ge=0)
    donate_count: int = Field(default=0, ge=0)
    photo_url: str | None = None


class SFundUpdate(SFundBase):
    category_id: int | None = None
    title: str | None = Field(None, min_length=3, max_length=50)
    description: str | None = Field(None, min_length=10, max_length=100)
    target: int | None = Field(None, gt=0)
    collected: int | None = Field(None, ge=0)
    donate_count: int | None = Field(None, ge=0)
    photo_url: str | None = None


class SFund(SFundBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "category_id": 2,
                "title": "Помощь бездомным животным",
                "description": "Сбор на корм и лечение.",
                "target": 100000,
                "collected": 35000,
                "donate_count": 42,
                "photo_url": "/uploads/fond_pets.jpg",
                "created_at": "2024-05-20T12:00:00"
            }
        }
    )