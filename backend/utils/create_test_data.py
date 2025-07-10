from datetime import datetime, timedelta, timezone
from database import new_session
from models.funds import FundOrm, CategoryOrm




async def create_test_data():
    async with new_session() as session:
        categories = [
            CategoryOrm(category="Дети"),
            CategoryOrm(category="Здоровье"),
            CategoryOrm(category="Животные"),
            CategoryOrm(category="Образование"),
            CategoryOrm(category="Экология"),
            CategoryOrm(category="Социальная помощь"),
            CategoryOrm(category="Другое")
        ]
        
        session.add_all(categories)
        await session.flush()
        
        now = datetime.now(timezone.utc)
        
        funds = [
            FundOrm(
                category_id=categories[0].id,
                title="Помощь детям-сиротам",
                description="Обеспечение детей-сирот одеждой, учебными принадлежностями и психологической поддержкой.",
                target=300000,
                collected=0,
                donate_count=0,
                photo_url="/uploads/1.jpg",
                target_date=now + timedelta(days=30)  # +30 дней от текущей даты
            ),
            FundOrm(
                category_id=categories[1].id,
                title="Лечение тяжелобольных",
                description="Сбор средств на дорогостоящее лечение и реабилитацию для пациентов с онкологическими заболеваниями.",
                target=1200000,
                collected=0,
                donate_count=0,
                photo_url="/uploads/2.jpg",
                target_date=now + timedelta(days=35)  # +60 дней
            ),
            FundOrm(
                category_id=categories[2].id,
                title="Защита животных",
                description="Строительство нового приюта для бездомных животных и программа стерилизации для контроля популяции.",
                target=500000,
                collected=0,
                donate_count=0,
                photo_url="/uploads/3.jpg",
                target_date=now + timedelta(days=40)  # +90 дней
            ),
            FundOrm(
                category_id=categories[3].id,
                title="Образование для всех",
                description="Обеспечение удалённых школ современным оборудованием и доступом к качественным образовательным ресурсам.",
                target=800000,
                collected=0,
                donate_count=89,
                photo_url="/uploads/4.jpg",
                target_date=now + timedelta(days=49)  # +90 дней
            ),
            FundOrm(
                category_id=categories[4].id,
                title="Экологическая инициатива",
                description="Посадка 10,000 деревьев в пострадавших от пожаров регионах и создание экологических троп.",
                target=350000,
                collected=0,
                donate_count=0,
                photo_url="/uploads/5.jpg",
                target_date=now + timedelta(days=33)  # +90 дней
            ),
            FundOrm(
                category_id=categories[5].id,
                title="Поддержка пожилых людей",
                description="Программа доставки продуктов и лекарств, а также социального сопровождения для одиноких пожилых людей.",
                target=200000,
                collected=0,
                donate_count=0,
                photo_url="/uploads/6.jpg",
                target_date=now + timedelta(days=87)  # +90 дней
            )
        ]
        
        session.add_all(funds)
        await session.commit()