from database import new_session
from models.funds import FundOrm
from schemas.funds import SFund, SFundUpdate
from sqlalchemy import select


class FundRepository:
    @classmethod
    async def get_all_funds(cls, limit: int, offset: int) -> list:
        async with new_session() as session:
            query = select(FundOrm).limit(limit).offset(offset)
            result = await session.execute(query)
            funds = result.scalars().all()
            return funds
    
    @classmethod
    async def get_fund_by_id(cls, fund_id: int) -> SFund:
        async with new_session() as session:
            query = select(FundOrm).where(FundOrm.id == fund_id)
            result = await session.execute(query)
            fund = result.scalars().first()
            if not fund:
                raise ValueError(f'Фонд с id {fund_id} не найден')
            return fund
    
    @classmethod
    async def create_fund(cls, fund_data) -> FundOrm:
        async with new_session() as session:
            fund = FundOrm(**fund_data.model_dump())
            session.add(fund)
            await session.commit()
            await session.refresh(fund)
            return fund
    
    @classmethod
    async def update_fund(cls, fund_id: int, update_data: SFundUpdate):
        async with new_session() as session:
            query = select(FundOrm).where(FundOrm.id == fund_id)
            result = await session.execute(query)
            fund = result.scalars().first()
            if not fund:
                raise ValueError(f'Фонд с id {fund_id} не найден')
            
            update_values = update_data.model_dump(exclude_unset=True)
            for key, value in update_values.items():
                setattr(fund, key, value)
            
            await session.commit()
            return fund
    
    @classmethod
    async def add_donation(cls, fund_id: int, amount: int):
        async with new_session() as session:
            query = select(FundOrm).where(FundOrm.id == fund_id)
            result = await session.execute(query)
            fund = result.scalars().first()
            if not fund:
                raise ValueError(f'Фонд с id {fund_id} не найден')
            
            fund.collected += amount
            fund.donate_count += 1
            await session.commit()
            return fund
    
    @classmethod
    async def delete_fund(cls, fund_id: int):
        async with new_session() as session:
            query = select(FundOrm).where(FundOrm.id == fund_id)
            result = await session.execute(query)
            fund = result.scalars().first()
            if not fund:
                raise ValueError(f'Фонд с id {fund_id} не найден')
            
            await session.delete(fund)
            await session.commit()