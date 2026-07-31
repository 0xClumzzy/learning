import cv2
import numpy as np

# Load image
img = cv2.imread('Challenge_file.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to binary (walls = black (0), paths = white (255))
_, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)

# Invert so walls are white (1) for distance transform / morphological operations
inverted = cv2.bitwise_not(thresh)

# 1. Locate start (top outer gap) and end (center inner gap) coordinates
# You can set exact pixel coordinates manually or dynamically:
h, w = gray.shape
start_point = (w // 2, 15)       # Entrance at top outer ring
end_point   = (w // 2, h // 2)   # Inner center ring

# 2. Distance Transform Pathfinding (Flood Fill BFS approach)
# Create a mask of walkable pixels (path area without walls)
path_mask = thresh.copy()

# Skeletonize / Thin walls to get clean path centers
dist = cv2.distanceTransform(path_mask, cv2.DIST_L2, 5)
cv2.normalize(dist, dist, 0, 1.0, cv2.NORM_MINMAX)

# Trace path back from end_point to start_point following max distance ridge
current = end_point
path_points = [current]

# Simple gradient ascent along the distance transform map to find central path
for _ in range(10000):
    x, y = current
    if np.hypot(x - start_point[0], y - start_point[1]) < 15:
        break
    
    # Check 8-neighbor pixels for maximum distance to wall
    neighbors = []
    for dx in [-2, 0, 2]:
        for dy in [-2, 0, 2]:
            if dx == 0 and dy == 0: continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                neighbors.append(((nx, ny), dist[ny, nx]))
    
    # Move to the neighboring pixel furthest from any wall
    next_pt = max(neighbors, key=lambda p: p[1])[0]
    if next_pt == current:
        break
    current = next_pt
    path_points.append(current)

# 3. Highlight the solved path on the original image
path_canvas = img.copy()
for i in range(len(path_points) - 1):
    cv2.line(path_canvas, path_points[i], path_points[i+1], (0, 0, 255), 3)

cv2.imwrite('solved_path.png', path_canvas)

# 4. Mask original image using the solved path dilated slightly to capture symbols
path_mask_lines = np.zeros_like(gray)
for i in range(len(path_points) - 1):
    cv2.line(path_mask_lines, path_points[i], path_points[i+1], 255, 15)

# Extract only elements lying along the path
symbols_along_path = cv2.bitwise_and(gray, gray, mask=path_mask_lines)
cv2.imwrite('extracted_symbols.png', symbols_along_path)

print("[+] Path solved and saved to solved_path.png")
print("[+] Extracted sequential path symbols to extracted_symbols.png")
