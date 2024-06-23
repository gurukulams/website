const { Namer } = require('@parcel/plugin');

function cleanName(bundle) {
  const mainEntry = bundle.getMainEntry();
  if (mainEntry && mainEntry.filePath) {
    const mainEntryName = mainEntry.filePath.split('/').pop().replace(/\.[^/.]+$/, "");
    return mainEntryName;
  }
  
  for (let asset of bundle.getAssets()) {
    if (asset.filePath) {
      const assetName = asset.filePath.split('/').pop().replace(/\.[^/.]+$/, "");
      return assetName;
    }
  }
  
  return 'bundle-' + bundle.id;
}

module.exports = new Namer({
  name({ bundle }) {
    const name = cleanName(bundle);
    return name + "." + bundle.type;
  }
});
