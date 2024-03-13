import os

from metacatalog import api, models
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.schema import CreateSchema

URI = os.getenv('METACATALOG_URI', 'postgresql://postgres:postgres@localhost:5432/metacatalog')


def is_installed() -> bool:
    # create a metacatalog session
    session = api.connect_database(URI)

    try:
        session.query(models.Entry).limit(0).first()
        installed = True
    except ProgrammingError as e:
        if 'relation "entries" does not exist' in str(e):
            installed = False
        else:
            raise e

    # close the session
    session.close()

    return installed

def install_tables():
    # create a metacatalog session
    session = api.connect_database(URI)

    # create the tables
    api.create_tables(session)
    api.populate_defaults(session)

    # TODO: this needs to be added to metacatalog
    session.bind.execute(CreateSchema('data'))
    session.commit()

    # close the session
    session.close()


if __name__ == '__main__':
    if not is_installed():
        install_tables()
