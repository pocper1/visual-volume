import torch
import numpy as np
import nrrd
import os
from tqdm import tqdm

def convert(input_file, output_file):
    print(f"Converting {input_file} to {output_file}")
    data = torch.load(input_file)
    volumeStack = data.numpy()
    print(volumeStack.shape)


    if volumeStack.ndim == 3:
        volumeStack_trans = np.transpose(volumeStack, (2, 1, 0)).astype(np.float32)
    # 處理 4 維數據，將 RGB / 3 轉為 3 維數據
    elif volumeStack.ndim == 4 and volumeStack.shape[-1] == 3:
        # 將 RGB 值平均以獲取灰度值
        # print("Original last dimension:", volumeStack[:, :, :, -1])
        print("volumestack:" + str(volumeStack.shape))
        volumeStack_gray = np.mean(volumeStack, axis=-1)
        volumeStack_trans = np.transpose(volumeStack_gray, (2, 1, 0)).astype(np.float32)

    # 檢查數據中是否有無效值並進行替換
    volumeStack_trans = np.nan_to_num(volumeStack_trans, nan=0.0, posinf=0.0, neginf=0.0)

    # 檢查數據範圍並進行標準化
    min_val = volumeStack_trans.min()
    max_val = volumeStack_trans.max()
    if max_val - min_val == 0:
        volumeStack_trans = np.zeros_like(volumeStack_trans)
    else:
        volumeStack_trans = (volumeStack_trans - min_val) / (max_val - min_val) * 255

    volumeStack_trans = volumeStack_trans.astype(np.uint8)

    nrrd.write(output_file, volumeStack_trans)

if __name__ == '__main__':
    tifName = ["cell_yxz_007_006_022", "cell_yxz_008_010_005", "cell_yxz_010_011_003", "cell_yxz_015_013_008"]

    
    for file in tqdm(tifName, desc="Processing files"):
        input_folder = "../../pipeline-visualize/output/" + file + "/"
        output_folder = "../web/public/" + file + "/"

        pt_files = [
                    input_folder + "origin.pt", 
                    input_folder + "sobel_vectors.pt", 
                    input_folder + "vector_conv.pt", 
                    input_folder + "first_derivative.pt", 
                    input_folder + "second_derivative.pt", 
                    input_folder + "blurred_volume.pt", 
                    input_folder + "adjusted_vectors.pt", 
                    input_folder + "adjusted_vectors_interp.pt", 
                    input_folder + "sobel_vectors_subsampled.pt",
                    input_folder + "mask_recto.pt",
                    input_folder + "mask_verso.pt"
                ]
        
        for input_file in tqdm(pt_files, desc=f"Processing {file}"):
            output_file = output_folder + os.path.basename(input_file).replace(".pt", ".nrrd")
            convert(input_file, output_file)
