from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from database import Model




class FundOrm(Model):
    __tablename__ = 'funds'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'))
    title: Mapped[str]
    description: Mapped[str] = mapped_column(String(100)) #Потом огриничить длину до 100 символов
    target: Mapped[int] = mapped_column(nullable=False)
    collected: Mapped[int] = mapped_column(default=0) #Сколько собрали
    donate_count: Mapped[int] = mapped_column(default=0) #Тут сделать счетчик пожертвований
    photo_url: Mapped[str] = mapped_column(nullable=True) #Путь до фотографии в папке uploads
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CategoryOrm(Model):
    __tablename__ = 'categories'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(default="Другое")