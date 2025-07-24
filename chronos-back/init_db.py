from sqlalchemy import text
from app.db.session import engine


async def create_tables():
    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        birth_date DATE,
        monthly_goal FLOAT,
        daily_goal FLOAT,
        theme VARCHAR(255),
        is_first_access BOOLEAN DEFAULT TRUE,
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        week_day_list jsonb,
    );
    """

    entries_tables = """
    CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
    name VARCHAR(200),
    status BOOLEAN,
    user_id INTEGER REFERENCES users(id) ON DELETE NO ACTION
    );
            
    CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(200),
    description TEXT,
    duration INTEGER,
    datm_start TIMESTAMP,
    datm_end TIMESTAMP,
    datm_interval_start TIMESTAMPTZ,
    datm_interval_end TIMESTAMPTZ,
    status BOOLEAN,
    date DATE,
    project_id INTEGER REFERENCES projects(id) ON DELETE NO ACTION,
    user_id INTEGER REFERENCES users(id) ON DELETE NO ACTION
);

    """
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
    ]
    
    async with engine.begin() as conn:
        await conn.execute(text(users_table))

        for index in indexes:
            await conn.execute(text(index))



async def main():
    try:
        await create_tables()
    except Exception as e:
        raise
