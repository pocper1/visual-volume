import matplotlib.pyplot as plt
import nrrd

filename = "../web/public/sobel_vectors.nrrd"


# 讀取 NRRD 檔案
readdata, header = nrrd.read(filename)

# 選擇一個切片來視覺化
slice_index = 150
slice = readdata[slice_index, :, :, 0]

# 使用 matplotlib 來視覺化這個切片
plt.imshow(slice, cmap='gray')
plt.show()