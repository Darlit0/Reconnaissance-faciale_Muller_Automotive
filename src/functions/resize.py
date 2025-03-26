import cv2

def resize(img):
    if img.shape[0]>img.shape[1]:
        img = cv2.resize(img, (600, 800))
    elif img.shape[0]<img.shape[1]:
        img = cv2.resize(img, (800, 600))
    else:
        img = cv2.resize(img, (600, 600))
    return img