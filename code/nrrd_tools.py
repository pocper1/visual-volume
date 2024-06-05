import numpy as np
import nrrd
import matplotlib.pyplot as plt

def read_nrrd_value(filename):
    readdata, header = nrrd.read(filename)
    print(readdata.shape)
    print(header)

def visualize_nnrrd(filename):
    readdata, header = nrrd.read(filename)
    slice_index = 150
    slice = readdata[slice_index, :, :, 0]
    plt.imshow(slice, cmap='gray')
    plt.show()


if __name__ == "__main__":
    filename = "../web/public/sobel_vectors.nrrd"
    read_nrrd_value(filename)

    # visualize_nnrrd(filename)
