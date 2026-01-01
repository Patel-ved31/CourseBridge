import psycopg2

def get_db():
    return psycopg2.connect(
        dbname="coursebridge",
        user="postgres",
        password="Ved311206",
        host="localhost",
        port="5432"
    )
