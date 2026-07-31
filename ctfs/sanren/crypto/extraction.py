from collections import deque

# Define entry (top outer gap) and exit (center gap) coordinates
start = (binary.shape[1] // 2, 15)
end = (binary.shape[1] // 2, binary.shape[0] // 2)

# BFS pathfinder
queue = deque([[start]])
visited = set([start])
path = []

while queue:
    curr_path = queue.popleft()
    x, y = curr_path[-1]
    
    if (abs(x - end[0]) < 15) and (abs(y - end[1]) < 15):
        path = curr_path
        break
        
    for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
        nx, ny = x + dx, y + dy
        if 0 <= nx < binary.shape[1] and 0 <= ny < binary.shape[0]:
            if binary[ny, nx] == 255 and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append(curr_path + [(nx, ny)])
