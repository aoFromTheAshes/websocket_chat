from sqlmodel import SQLModel


class LoginData(SQLModel):
    email: str
    password: str

class RegisterData(SQLModel):
    username: str
    email: str
    password: str
