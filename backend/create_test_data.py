from database import new_session
from models.funds import FundOrm, CategoryOrm

async def create_test_data():
    async with new_session() as session:
        categories = [
            CategoryOrm(category="Животные"),
            CategoryOrm(category="Дети"),
            CategoryOrm(category="Медицина"),
            CategoryOrm(category="Другое")
        ]
        
        session.add_all(categories)
        await session.flush()
        
        funds = [
            FundOrm(
                category_id=categories[0].id,
                title="Помощь бездомным кошкам",
                description="Сбор на корм и лечение бездомных кошек",
                target=100000,
                collected=25000,
                donate_count=42,
                photo_url="/uploads/cats.jpg"
            ),
            FundOrm(
                category_id=categories[1].id,
                title="Образование для детей",
                description="Покупка учебников для детских домов",
                target=200000,
                collected=75000,
                donate_count=31,
                photo_url="/uploads/children.jpg"
            ),
            FundOrm(
                category_id=categories[2].id,
                title="Лечение ребенка",
                description="Сбор на операцию ребенку",
                target=500000,
                collected=125000,
                donate_count=89,
                photo_url="/uploads/medicine.jpg"
            )
        ]
        
        session.add_all(funds)
        await session.commit()