import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.animation import FuncAnimation
import scipy.ndimage

# 模擬CT掃描數據
np.random.seed(42)
ct_data = np.random.rand(100, 100, 100)

# 設定Sobel過濾器
sobel_x = np.array([[[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
                    [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
                    [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]])

sobel_y = np.array([[[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
                    [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
                    [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]])

sobel_z = np.array([[[-1, -2, -1], [-1, -2, -1], [-1, -2, -1]],
                    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
                    [[1, 2, 1], [1, 2, 1], [1, 2, 1]]])

# 計算梯度
grad_x = scipy.ndimage.convolve(ct_data, sobel_x)
grad_y = scipy.ndimage.convolve(ct_data, sobel_y)
grad_z = scipy.ndimage.convolve(ct_data, sobel_z)

# 計算梯度強度
gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2 + grad_z**2)

# 設定門檻值
threshold = 2.5  # 可以根據需要調整

# 提取表面點
surface_points = np.where(gradient_magnitude > threshold)

# 組合成點雲
point_cloud = np.vstack(surface_points).T

# 動畫設置
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.set_zlim(0, 100)

ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('CT to Point Cloud Process')

sc = ax.scatter([], [], [], s=1)

def init():
    sc._offsets3d = ([], [], [])
    return sc,

def update(frame):
    step = frame * 10
    if step > point_cloud.shape[0]:
        step = point_cloud.shape[0]
    sc._offsets3d = (point_cloud[:step, 0], point_cloud[:step, 1], point_cloud[:step, 2])
    return sc,

ani = FuncAnimation(fig, update, frames=range(0, point_cloud.shape[0] // 10), init_func=init, blit=True, repeat=False)

plt.show()