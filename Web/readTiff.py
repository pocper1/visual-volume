import os
import numpy as np
from tifffile import imread
import json

def read_tiff_stack(directory):
    file_list = sorted([os.path.join(directory, f) for f in os.listdir(directory) if f.endswith('.tif')])
    stack = [imread(f) for f in file_list]
    return np.stack(stack, axis=-1)

directory = './Dataset'
tiff_stack = read_tiff_stack(directory)


# normalize
def normalize_stack(stack):
    stack_min = stack.min()
    stack_max = stack.max()
    normalized_stack = (stack - stack_min) / (stack_max - stack_min)
    return normalized_stack

normalized_stack = normalize_stack(tiff_stack)

# to json
def stack_to_json(stack, output_file):
    data = {
        "dimensions": stack.shape,
        "data": stack.flatten().tolist()
    }
    with open(output_file, 'w') as f:
        json.dump(data, f)

output_file = './tiff.json'
stack_to_json(normalized_stack, output_file)