import numpy as np
import nrrd

if __name__ == "__main__":
    filename = "../web/public/sobel_vectors.nrrd"

    readdata, header = nrrd.read(filename)
    print(readdata.shape)
    print(header)
