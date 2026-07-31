import cv2
import numpy as np

# Load and binarize
img = cv2.imread('Challenge_file.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)

# Invert walls/paths for distance transform
inverted = cv2.bitwise_not(binary)
