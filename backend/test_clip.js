const { CLIPVisionModelWithProjection, AutoProcessor, RawImage } = require('@xenova/transformers');

async function test() {
  try {
    console.log('Loading CLIPVisionModelWithProjection...');
    const processor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');
    const model = await CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32');
    console.log('Model loaded.');

    const width = 224;
    const height = 224;
    const data = new Uint8Array(width * height * 3).fill(128); // gray image
    const rawImage = new RawImage(data, width, height, 3);

    console.log('Preprocessing image...');
    const imageInputs = await processor(rawImage);
    console.log('Image inputs keys:', Object.keys(imageInputs));

    console.log('Running model...');
    const output = await model(imageInputs);
    console.log('Output keys:', Object.keys(output));

    if (output.image_embeds) {
      console.log('SUCCESS! Found image_embeds.');
      console.log('Embeds shape:', output.image_embeds.dims);
      console.log('Embeds data length:', output.image_embeds.data.length);
    } else {
      console.log('Failed: image_embeds is missing.');
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
