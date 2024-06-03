from PIL import Image

# 打開 TIFF 檔案
image = Image.open('../output/origin.tif')

# 獲取 TIFF 標籤
tiff_info = image.tag_v2

# 列出所有標籤
for tag, value in tiff_info.items():
    print(f'Tag {tag}: {value}')