import mysql.connector
from mysql.connector import pooling

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance.connection = None
        return cls._instance

    def get_connection(self):
        if self.connection is None:
            self.connection = pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=5,
                host="localhost",
                user="root",
                password="",
                database="imssfinal"
            )
        return self.connection

def get_db_connection():
    db = Database()
    return db.get_connection().get_connection()
