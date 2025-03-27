import numpy as np
import cv2
import pandas as pd
import math
import face_recognition
import os

image1 = cv2.imread('img/grej.jpg')
image2 = cv2.imread('grejon/grej.jpg') 


def resize(img):
    if img.shape[0]>img.shape[1]:
        img = cv2.resize(img, (600, 800))
    elif img.shape[0]<img.shape[1]:
        img = cv2.resize(img, (800, 600))
    else:
        img = cv2.resize(img, (600, 600))
    return img

def creerZone(img, x, y, xMax, yMax):
    zone = img[x:xMax, y:yMax]
    zone = cv2.cvtColor(zone, cv2.COLOR_BGR2RGB)
    return zone

def cutFace(img):
    face = face_recognition.face_locations(img)
    for (top, right, bottom, left) in face:
        cv2.rectangle(img, (left, top), (right, bottom), (0, 255, 255), 2)
    return creerZone(img, top, left, bottom, right)

def vectorisation(img):
    vect = face_recognition.face_encodings(img)
    if len(vect) == 0:
        return False
    else:
        return vect

def reco(img1, img2, percent):
    img1 = resize(img1)
    img2 = resize(img2)
    # img1 = cutFace(img1)
    # img2 = cutFace(img2)
    vect1 = vectorisation(img1)
    vect2 = vectorisation(img2)
    print(type(vect1))
    print(type(vect2))
    print(vect1)
    print(vect2)
    # if np.linalg.norm(vect1[0]-vect2[0]) < percent:
    #     print("Bravo tres belle photo elle est reconnue mais maintenant insere une photo de tes fesses pour voir si elles sont reconnues aussi grace a la reconnaissance faciale je peux te dire que tu as des fesses tres reconnaissables et que tu es un peu trop fier de ta bite mais bon c est pas grave on t aime quand meme <3")
    #     print( str((1-(np.linalg.norm(vect1[0]-vect2[0])))*100) + "%" )
    #     return True
    # else:
    #     print("Desole mais cette photo n'est pas reconnue par notre systeme de reconnaissance faciale qui est pourtant tres performant et qui a ete developpe par des ingenieurs tres competents et qui a ete teste par des pd de la nasa et de la cia et qui font des trucs de ouf et qui ont des gros salaires et qui ont des femmes tres belles et qui ont des enfants tres intelligents et qui ont des maisons tres grandes et qui ont des voitures tres belles et qui ont des chiens tres mignons et qui ont des chats tres mignons et qui ont des poissons tres mignons et qui ont des oiseaux tres mignons et qui ont des tortues tres mignonnes et qui ont des lapins tres mignons et qui ont des hamsters tres mignons et qui ont des cochons d inde tres mignons et qui ont des serpents tres mignons et qui ont des araignees tres mignonnes et qui ont des scorpions tres mignons et qui ont des fourmis tres mignonnes et qui ont des moustiques tres mignons et qui ont des mouches tres mignonnes et qui ont des abeilles tres mignonnes et qui non je deconne c est de la merde ce truc de reconnaissance faciale car ca a ete developpe par des pd de merde qui ont pas de vie et qui sont des gros nuls et qui sont des grosse merdes et qui sont des gros cons et qui sont des gros connards et qui sont des gros encules et qui chient dans leur froc et qui ont des problemes de constipation et qui ont des problemes de diarrhee et qui ont des problemes de digestion et qui ont des problemes de transit et qui ont des problemes de selles et qui ont des problemes de caca et qui ont des problemes de merde et qui ont des problemes de chiasse et qui ont des problemes de dejection et qui ont des problemes de defecation et qui ont des problemes de excrement et qui ont des problemes de fiente et qui ont des problemes de matiere fecale et qui ont des problemes de matiere fecale et qui ont des problemes de matiere crottee et qui ont des problemes de matiere chiee et qui ont des problemes de matiere dejectionnee et qui ont des problemes de matiere defecationnee et qui ont des problemes de matiere excrement et qui ont des problemes de matiere fiente et qui ont des problemes de matiere merde et qui ont des problemes de matiere caca et qui ont des problemes de matiere dejection et qui ont des problemes de matiere defecation et qui ont des problemes de matiere excrement et qui ont des problemes de matiere fiente et qui ont des problem")
    #     print( str((1-(np.linalg.norm(vect1[0]-vect2[0])))*100) + "%" )
    #     return False
    



# print(reco(image1, image2, 0.5))

# img1 = resize(image1)
# img1 = vectorisation(img1)

# for i in os.listdir('grejon'):
#     img2 = cv2.imread('grejon/'+i)
#     img2 = resize(img2)
#     img2 = vectorisation(img2)
#     if img2 != False and img1 != False:
#         print( str((1-(np.linalg.norm(img1[0]-img2[0])))*100) + "%" )
#     else:
#         print("visage non reconnu")
    

reco(image1, image2, 0.5)
