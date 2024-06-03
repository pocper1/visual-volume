import os
import base64
import SimpleITK as sitk
import torch
import pyvista as pv
import numpy as np
from tqdm import tqdm
from skimage import measure
from pygltflib import GLTF2, Asset, Buffer, BufferView, Accessor, Mesh, Node, Scene, Primitive

def load_pt_file(input_path):
    tensor = torch.load(input_path)
    tensor = tensor.float()  # 確保數據為 float32 類型
    return tensor

def convert_tensor_to_image(tensor):
    array = tensor.numpy().astype(np.float32)  # 確保數據為 float32 類型
    image = sitk.GetImageFromArray(array)
    return image


def inspect_volume(volume):
    print(f"Volume shape: {volume.shape}")

    if volume.ndim != 4:
        raise ValueError("Input volume should be a 4D numpy array.")

    n, c, h, w = volume.shape if volume.shape[1] < 10 else (volume.shape[0], volume.shape[-1], volume.shape[1], volume.shape[2])

    for i in range(c):
        channel_data = volume[:, i, :, :] if volume.shape[1] < 10 else volume[i, :, :, :]
        print(f"Channel {i} - min: {channel_data.min()}, max: {channel_data.max()}, mean: {channel_data.mean()}")

    selected_channel = volume[:, 0, :, :] if volume.shape[1] < 10 else volume[0, :, :, :]
    return selected_channel


def convert_image_to_numpy(image):
    volume = sitk.GetArrayFromImage(image)
    selected_volume = inspect_volume(volume)

    if selected_volume.ndim != 3:
        raise ValueError("Selected volume should be a 3D numpy array.")

    return selected_volume

def convert_volume_to_mesh(volume):
    verts, faces, normals, values = measure.marching_cubes(volume, level=0.5)
    vertices = np.array(verts, dtype=np.float32).flatten()
    faces = np.array(faces, dtype=np.int32).flatten()
    return vertices, faces

def create_gltf(vertices, faces, output_path):
    buffer_data = vertices.tobytes() + faces.tobytes()
    buffer = Buffer(uri="data:application/octet-stream;base64," + base64.b64encode(buffer_data).decode('ascii'), byteLength=len(buffer_data))

    vertex_buffer_view = BufferView(buffer=0, byteOffset=0, byteLength=len(vertices.tobytes()), target=34962)
    index_buffer_view = BufferView(buffer=0, byteOffset=len(vertices.tobytes()), byteLength=len(faces.tobytes()), target=34963)

    vertex_accessor = Accessor(bufferView=0, byteOffset=0, componentType=5126, count=len(vertices) // 3, type="VEC3")
    index_accessor = Accessor(bufferView=1, byteOffset=0, componentType=5125, count=len(faces) // 3, type="SCALAR")

    primitive = Primitive(attributes={"POSITION": 0}, indices=1)
    mesh = Mesh(primitives=[primitive])

    node = Node(mesh=0)
    scene = Scene(nodes=[0])

    gltf = GLTF2(
        asset=Asset(version="2.0"),
        buffers=[buffer],
        bufferViews=[vertex_buffer_view, index_buffer_view],
        accessors=[vertex_accessor, index_accessor],
        meshes=[mesh],
        nodes=[node],
        scenes=[scene],
        scene=0
    )

    gltf.save(output_path)

def process_pt_to_gltf(input_path, output_path):
    pbar = tqdm(total=6, desc="Processing", ncols=80)

    # 讀取 .pt 檔案
    pbar.set_description("Loading .pt file")
    tensor = load_pt_file(input_path)
    pbar.update()

    # 將 tensor 轉換為 SimpleITK 圖像
    pbar.set_description("Converting tensor to SimpleITK image")
    image = convert_tensor_to_image(tensor)
    pbar.update()

    # 將 SimpleITK 圖像轉換為 numpy array
    pbar.set_description("Converting SimpleITK image to numpy array")
    volume = convert_image_to_numpy(image)
    pbar.update()

    # 將 3D 體積數據轉換為 3D 網格
    pbar.set_description("Converting volume to mesh")
    vertices, faces = convert_volume_to_mesh(volume)
    pbar.update()

    # 創建 glTF 檔案
    pbar.set_description("Creating glTF file")
    create_gltf(vertices, faces, output_path)
    pbar.update()

    pbar.set_description("Saving glTF file")
    pbar.update()

    pbar.close()

if __name__ == '__main__':
    name = 'sobel_vectors'
    input_path = '../output/' + name + '.pt'
    output_path = '../output/' + name + '.gltf'
    process_pt_to_gltf(input_path, output_path)
