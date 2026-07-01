"""Script to create a test user for development/testing."""

from auth.crud import get_password_hash
from database.connection import SessionLocal, init_db
from database.models import User


def create_test_user():
    """Create a test user in the database."""
    # Initialize database tables
    init_db()

    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.username == "testuser").first()
        if existing_user:
            print("[INFO] Test user 'testuser' already exists!")
            print(f"   Username: testuser")
            print(f"   Password: password123")
            print(f"   User ID: {existing_user.user_id}")
            return

        # Create test user
        test_user = User(
            username="testuser",
            password_hash=get_password_hash("password123"),
            timezone="America/New_York",
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print("[SUCCESS] Test user created successfully!")
        print(f"   Username: testuser")
        print(f"   Password: password123")
        print(f"   User ID: {test_user.user_id}")

    except Exception as e:
        print(f"[ERROR] Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_user()
