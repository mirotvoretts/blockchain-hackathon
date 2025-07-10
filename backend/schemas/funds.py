from pydantic import BaseModel, Field, ConfigDict, field_validator, computed_field
from datetime import datetime, timezone




class SFundDonate(BaseModel):
    amount: int = Field(gt=0, description="Сумма пожертвования")


class SFundBase(BaseModel):
    category_id: int = Field(default=7)
    title: str
    description: str
    target: int = Field(gt=0)
    collected: int = Field(default=0, ge=0)
    donate_count: int = Field(default=0, ge=0)
    photo_url: str | None = Field(None, description="URL изображения формата /uploads/{fund_id}.jpg")
    target_date: datetime = Field(description="Дата окончания сбора в формате ISO 8601")
    location: str | None = Field(None, description="Географическая локация проекта")
    team_info: str | None = Field(None, description="Информация о команде")
    link: str | None = Field(None, description="Ссылка на дополнительные ресурсы")
    contract_address: str | None = Field(None, description="Блокчейн-адрес контракта")
    
    @field_validator('target_date')
    def validate_target_date(cls, v):
        if v < datetime.now(timezone.utc):
            raise ValueError("Дата окончания не может быть в прошлом")
        return v


class SFundPhotoUpdate(BaseModel):
    """Схема только для обновления фото"""
    photo_url: str | None = Field(None, description="URL изображения формата /uploads/{fund_id}.jpg")


class SFundUpdate(SFundBase):
    """Основная схема для обновления фонда"""
    category_id: int | None = None
    title: str | None = None
    description: str | None = None
    target: int | None = Field(None, gt=0)
    collected: int | None = Field(None, ge=0)
    donate_count: int | None = Field(None, ge=0)
    photo_url: str | None = None
    target_date: datetime | None = Field(None, description="Дата окончания сбора в формате ISO 8601")
    location: str | None = None
    team_info: str | None = None
    link: str | None = None
    contract_address: str | None = None


class SFund(SFundBase):
    """Схема для отображения фонда"""
    id: int
    created_at: datetime
    
    @computed_field
    @property
    def days_left(self) -> int:
        return (self.target_date - datetime.now(timezone.utc)).days

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
                "target_date": "2024-12-31T23:59:59Z",
                "created_at": "2024-05-20T12:00:00",
                "days_left": 42,
                "location": "Москва, Россия",
                "team_info": "Команда из 5 волонтеров",
                "link": "https://наш-фонд.рф",
                "contract_address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
            }
        }
    )