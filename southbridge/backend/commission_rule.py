from app.core.database import SessionLocal
from app.models.BED import BEDCommissionRule
from app.models.user import * #for ignoring the warnings
from app.models.BED import * #for ignoring the warnings
from app.models.order import * #for ignoring the warnings
from app.models.route import * #for ignoring the warnings
from app.models.bid import * #for ignoring the warnings
from app.models.load import * #for ignoring the warnings
from app.models.location import * #for ignoring the warnings
from app.models.payment import * #for ignoring the warnings
from app.models.service import * #for ignoring the warnings

def main():
    """Create commission rules for BED referral levels"""
    db = SessionLocal()
    try:
        print("================================================")
        print("Creating commission rules...")
        
        datas = [
            {"level": 1, "percentage": 5},
            {"level": 2, "percentage": 3},
            {"level": 3, "percentage": 1},
            {"level": 4, "percentage": 0.3},
            {"level": 5, "percentage": 0.1},
        ]
        
        for data in datas:
            # Check if rule already exists
            existing = db.query(BEDCommissionRule).filter(
                BEDCommissionRule.referral_level == data["level"]
            ).first()
            
            if existing:
                print(f"Commission rule for level {data['level']} already exists, skipping...")
                continue
                
            rule = BEDCommissionRule(
                referral_level=data["level"],
                commission_percentage=data["percentage"]
            )
            db.add(rule)
            db.commit()
            print(f"✓ Commission rule created for level {data['level']} with percentage {data['percentage']}%")
            
        print("================================================")
        print("Commission rules created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating commission rules: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    main()
