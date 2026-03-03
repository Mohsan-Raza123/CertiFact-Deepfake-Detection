import numpy as np
import tensorflow as tf
import cv2
import os

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    # 1. Create a model that maps the input image to the activations of the last conv layer
    #    and the output predictions
    grad_model = tf.keras.models.Model(
        [model.inputs], [model.get_layer(last_conv_layer_name).output, model.output]
    )

    # 2. Compute the gradient of the top predicted class for our input image
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]

    # 3. Get gradients of the output with respect to the output feature map of the last conv layer
    grads = tape.gradient(class_channel, last_conv_layer_output)

    # 4. Mean intensity of the gradient over a specific feature map channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # 5. Multiply each channel in the feature map array by 'how important this channel is'
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # 6. Normalize the heatmap between 0 & 1
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def save_and_display_gradcam(img_path, heatmap, cam_path="cam.jpg", alpha=0.4):
    # 1. Load the original image
    img = cv2.imread(img_path)
    
    # 2. Rescale heatmap to a range 0-255
    heatmap = np.uint8(255 * heatmap)

    # 3. Use jet colormap to colorize heatmap
    jet = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # 4. Resize heatmap to match original image size
    jet = cv2.resize(jet, (img.shape[1], img.shape[0]))

    # 5. Superimpose the heatmap on original image
    superimposed_img = jet * alpha + img
    
    # 6. Save
    cv2.imwrite(cam_path, superimposed_img)
    return cam_path

def generate_heatmap(model, img_array, original_img_path, output_folder):
    try:
        # A. Find the last convolutional layer automatically
        last_conv_layer_name = None
        for layer in reversed(model.layers):
            if 'conv' in layer.name:
                last_conv_layer_name = layer.name
                break
        
        if not last_conv_layer_name:
            print("⚠️ Could not find a convolutional layer for Grad-CAM")
            return None

        # B. Generate Heatmap Data
        heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name)

        # C. Save Heatmap Image
        filename = os.path.basename(original_img_path)
        heatmap_filename = f"heatmap_{filename}"
        heatmap_path = os.path.join(output_folder, heatmap_filename)
        
        save_and_display_gradcam(original_img_path, heatmap, heatmap_path)
        
        return f"/uploads/{heatmap_filename}"
    except Exception as e:
        print(f"🔥 Grad-CAM Error: {e}")
        return None