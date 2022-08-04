/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                  .filterDate('1992-01-01', '2022-12-30')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .map(maskS2clouds)
                  .median();

var visualization = {
  min: 0.0,
  max: 0.2,
  bands: ['B8', 'B11', 'B5'],
};

Map.setCenter(122.84750343024014, -4.7100235470696425, 14);

Map.addLayer(dataset, visualization, 'FalseColor');


 Export.image.toDrive({
  image: ndvi,
  description: 'ndvi_tinanggea',
  scale: 30,
  region: 'geometry',
});

