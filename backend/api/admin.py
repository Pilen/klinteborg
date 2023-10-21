import json
from fastapi import APIRouter, Depends
from backend.database import TX, make_tx, TX
from backend.config import config

router = APIRouter()


def set_auto_permissions(tx: TX) -> None:
    tx.execute("""
    DELETE FROM User_permissions
          WHERE reason = 'auto'
    """)
    permissions = [row["permission"] for row in tx.fetch_all("""SELECT permission FROM permissions""")]
    admin_users = tx.fetch_all("""
    SELECT fdfid
      FROM User_permissions
     WHERE permission = 'admin'
    """)
    for user in admin_users:
        for permission in permissions:
            tx.insert(user_permissions, fdfid=user["fdfid"], permission=permission, reason='auto')
