import numpy as np
import cv2
import face_recognition
import io
from PIL import Image

def resize(img):
    if img.shape[0]>img.shape[1]:
        img = cv2.resize(img, (600, 800))
    elif img.shape[0]<img.shape[1]:
        img = cv2.resize(img, (800, 600))
    else:
        img = cv2.resize(img, (600, 600))
    return img

def vectorisation(img):
    vect = face_recognition.face_encodings(img)
    if len(vect) == 0:
        return False
    else:
        return vect


def compare_image(uploaded_bytes, images_bytes_list, seuil):
    print(seuil)
    try:
        pil_image = Image.open(io.BytesIO(uploaded_bytes))
        uploaded_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        uploaded_img = resize(uploaded_img)
        uploaded_vector = vectorisation(uploaded_img)
        
        if not uploaded_vector:
            print("Aucun visage détecté dans l'image téléchargée")
            return None

        similarity_threshold = seuil
        best_match_index = None
        best_similarity = 0
        
        for i, db_image_bytes in enumerate(images_bytes_list):
            try:
                db_pil_image = Image.open(io.BytesIO(db_image_bytes))
                db_img = cv2.cvtColor(np.array(db_pil_image), cv2.COLOR_RGB2BGR)
                db_img = resize(db_img)
                db_vector = vectorisation(db_img)
                
                if not db_vector:
                    print(f"Aucun visage détecté dans l'image à l'index {i}")
                    continue
                
                distance = np.linalg.norm(uploaded_vector[0] - db_vector[0])
                similarity = 1 - distance
                
                print(f"Image index {i}: Similarité {similarity * 100:.2f}%")

                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match_index = i
                
            except Exception as e:
                print(f"Erreur lors de la comparaison avec l'image index {i}: {str(e)}")
                continue

        if best_match_index is not None and best_similarity > similarity_threshold:
            print(f"Meilleure correspondance: Image index {best_match_index} avec {best_similarity * 100:.2f}%")
            return best_match_index
        else:
            print("Aucune correspondance trouvée au-dessus du seuil")
            return None
            
    except Exception as e:
        print(f"Erreur lors du traitement de l'image téléchargée: {str(e)}")
        return None