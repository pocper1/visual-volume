import torch
import numpy as np
import nrrd
import os
from tqdm import tqdm

def convert(input_file, output_file):
    print(f"Converting {input_file} to {output_file}")
    data = torch.load(input_file)
    volumeStack = data.numpy()

    if volumeStack.ndim == 3:
        volumeStack_trans = np.transpose(volumeStack, (2, 1, 0)).astype(np.float32)
    elif volumeStack.ndim == 4 and volumeStack.shape[-1] == 3:
        volumeStack_gray = np.mean(volumeStack, axis=-1) # mean the rgb color, and flatten into 3 dimension
        volumeStack_trans = np.transpose(volumeStack_gray, (2, 1, 0)).astype(np.float32)

    # cech if there is any nan value in the volume
    volumeStack_trans = np.nan_to_num(volumeStack_trans, nan=0.0, posinf=0.0, neginf=0.0)

    # normalize the volume to 0-255
    min_val = volumeStack_trans.min()
    max_val = volumeStack_trans.max()
    if max_val - min_val == 0:
        volumeStack_trans = np.zeros_like(volumeStack_trans)
    else:
        volumeStack_trans = (volumeStack_trans - min_val) / (max_val - min_val) * 255

    volumeStack_trans = volumeStack_trans.astype(np.uint8)

    nrrd.write(output_file, volumeStack_trans)

if __name__ == '__main__':
    dataset_dir = 'dataset'
    
    # Get all the folders in the dataset directory
    folders = [f for f in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, f))]
    print("Found the following folders in the dataset directory:")
    for folder in folders:
        print(folder, end=", ")
    
    for folder in tqdm(folders, desc="Processing folders"):
        folder_path = os.path.join(dataset_dir, folder)
        
        input_folder = os.path.join(folder_path)
        output_folder = os.path.join("..", "web", "public", folder)

        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        base_files = ["origin", "sobel_vectors",  "vector_conv",  "first_derivative",  "second_derivative",  "blurred_volume",  "adjusted_vectors",  "adjusted_vectors_interp",  "sobel_vectors_subsampled", "mask_recto", "mask_verso"]

        pt_files = [f"{file}.pt" for file in base_files]
        
        for pt_file in tqdm(pt_files, desc=f"Processing {folder}"):
            input_file = os.path.join(input_folder, pt_file)
            output_file = os.path.join(output_folder, os.path.basename(pt_file).replace(".pt", ".nrrd"))
            if os.path.exists(input_file):  # Check if the input file exists
                convert(input_file, output_file)
