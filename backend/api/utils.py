from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get('SECRET_KEY')
fernet = Fernet(key)

def encryptFile(fileBytes: bytes) -> bytes:
    return fernet.encrypt(fileBytes)

def decryptFile(encryptedFileBytes: bytes) -> bytes:
    return fernet.decrypt(encryptedFileBytes)