import face_recognition
def vectorisation(img):
    vect = face_recognition.face_encodings(img)
    if len(vect) == 0:
        return False
    else:
        return vect