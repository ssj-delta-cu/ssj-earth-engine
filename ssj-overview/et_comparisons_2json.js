
var select_water_year = function(water_year){
  if(water_year == 2015){

    var methods={
      itrc_co:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-itrc-metric/itrc_et_wy2015_v2-1-0")},
      itrc_or:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-itrc-metric/itrc_et_wy2015_v2-0-1")},
      disalexi_or:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_et_wy2015_v2-0-0")},
      disalexi_co:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_et_wy2015_v2-1-0")},
      };
    
    var landIQ = ee.Image('users/ucd-cws-ee-data/ssj-delta-cu/ssj-landuse/landuse_2015_v2016-06-16');
    var landcover = landIQ.select(['b2']).rename('level_2');
  }
  else if(water_year == 2016){

    var methods={
      itrc_co:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-itrc-metric/itrc_et_wy2016_v2-1-0")},
      itrc_or:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-itrc-metric/itrc_et_wy2016_v2-0-1")},
      disalexi_or:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_et_wy2016_v2-0-0")},
      disalexi_co:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_et_wy2016_v2-1-0")},
      };
    
    var landIQ = ee.Image('users/ucd-cws-ee-data/ssj-delta-cu/ssj-landuse/landuse_2016_v2017-04-25');
    var landcover = landIQ.select(['b1']).rename('level_2');
  }
  
  return({methods: methods, landcover: landcover});
};


print(select_water_year(2015).landcover);

Map.addLayer(select_water_year(2015).landcover);

// fusion tables with regions to clip
var DSAregion = ee.FeatureCollection('ft:1VnIrhkVHzFfej6PC0eDEW5ywS3Hjw9Fm0abHZllv');
var LEGALregion = ee.FeatureCollection('ft:1pwTPCh-j_aDA2MUbk12LxorHFrW-DnEgYqqySPk5');


// function to return an image clipped to a specific AOI from a fusion table
var clip_ET_region = function(image, AOI){
  var clipped = image.clipToCollection(AOI);
  return clipped;
};


// Grouped reducer for mean/median/quartiles/count
var GroupedStatReducers = ee.Reducer.mean()
  .combine(ee.Reducer.median(), "", true)
  .combine(ee.Reducer.percentile([9, 25, 75, 91]), "", true)
  .combine(ee.Reducer.count(), "", true);

// Function to use ReduceRegions to calculate GroupedStatReducers by landcover type for a single band 
var LUstats = function(monthlyETwy12band, bandname, landcover){
  var LUstatsSingleBand = monthlyETwy12band.select(bandname)
    .addBands(landcover)
    .reduceRegion({
      reducer: GroupedStatReducers.group({
        groupField: 1, 
        groupName: 'level_2',}), 
      scale: 200, // note scale is set to 200 meters!
      maxPixels: 1e8 });
  return LUstatsSingleBand;
};


// loop through each band in the 12 band monthly ET and calc stats about the landuse 
var LUstatsMonthlyET = function(monthlyETwy12band, landcover){
 
  // months in wy order
  var m = ['OCT','NOV','DEC','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP'];

  // rename band to months (They are in order by water year)
  monthlyETwy12band=monthlyETwy12band.select([0,1,2,3,4,5,6,7,8,9,10,11],m);
  
  // create dictionary to store each month for the water year
  var wydict = ee.Dictionary();
  
  for(var i=0;i<m.length;i++){
    var statsMonth = LUstats(monthlyETwy12band, m[i], landcover);
    statsMonth = ee.Dictionary(statsMonth);
    statsMonth = statsMonth.rename(['groups'], [m[i]]);
    wydict = wydict.combine(statsMonth, false);
  }
  return(wydict); // return results as dictionary of monthly dictionarys broken down by level 2 crop id
};


var region_names = {
  "dsa": DSAregion, 
  "legal": LEGALregion,
  "dsa_1": DSAregion.filterMetadata("subarea", "equals", 1),
  "dsa_2": DSAregion.filterMetadata("subarea", "equals", 2),
  "dsa_51": DSAregion.filterMetadata("subarea", "equals", 51),
  "dsa_103": DSAregion.filterMetadata("subarea", "equals", 103),
  "dsa_119": DSAregion.filterMetadata("subarea", "equals", 119),
  "dsa_153": DSAregion.filterMetadata("subarea", "equals", 153)
};


var exportEEjson = function(region, wateryear){
  var methods = select_water_year(wateryear).methods;
  var landcover = select_water_year(wateryear).landcover;
    //loop through all the et sources, calc stats for areas
  for (var key in methods) {
  
    var filename = key + "-" + region + "-" + wateryear;
    print(filename);
    var e =  LUstatsMonthlyET(clip_ET_region(methods[key].image, region_names[region]), landcover);
    print(e);
    
      var FC = ee.FeatureCollection([
      ee.Feature(null, ee.Dictionary(e))
    ]);
  
    Export.table.toDrive(FC, filename, "ET_comparisons_geojson", filename, "GeoJSON");
    }
  
};


exportEEjson("dsa", 2015);
exportEEjson("dsa", 2016);
