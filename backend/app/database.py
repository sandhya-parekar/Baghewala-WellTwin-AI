"""
Baghewala WellTwin AI - Database Helper
Provides connection pooling and helper methods for SQLite queries.
"""

import sqlite3
from typing import Generator, List, Dict, Any, Optional
from app.config import settings

def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def query_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def query_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def execute_write(query: str, params: tuple = ()) -> int:
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id
