var select_water_year = function(water_year){
  if(water_year == 2015){

    var spatial_cimis_eto = ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-weather/eto_wy2015");
    var detaw_eto = ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-detaw/detaw_eto_wy2015");
    var disalexi_eto = ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_monthly/eto_2015_monthly");

    var methods={
      itrc:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-itrc-metric/itrc_et_wy2015_v2-0-1"), eto:spatial_cimis_eto},
      disalexi:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_et_wy2015_v2-1-0"), eto:disalexi_eto},
      ucdpt:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-ucd-priestley-taylor/ucd-pt_et_wy2015_v2-2-0"), eto:spatial_cimis_eto},
      ucdmetric:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-ucd-metric/ucd-metric_et_wy2015_v2-1-0"), eto:spatial_cimis_eto},
      sims:{image: ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-sims/sims_et_wy2015_v2-0-0"), eto:spatial_cimis_eto},
      calsimetaw:{image: ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-calsimetaw/calsimetaw_et_wy2015_v2-0-0"), eto:spatial_cimis_eto},
      detaw:{image: ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-detaw/detaw_et_wy2015_v2-0-1"), eto:detaw_eto},
    };
    

    
    var landIQ = ee.Image('users/ucd-cws-ee-data/ssj-delta-cu/ssj-landuse/landuse_2015_v2016-06-16');
    var landcover = landIQ.select(['b2']).rename('level_2');
    
    // fusion table with the station points 2015
    var station_points = ee.FeatureCollection('ft:1vGYHsi1INwYjWj62xbrcQMewrRJQLbbE_jyqFwL7');
    
  }
  else if(water_year == 2016){

    var spatial_cimis_eto = ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-weather/eto_wy2016");
    var detaw_eto = ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-detaw/detaw_eto_wy2016");
    var disalexi_eto = ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_monthly/eto_2016_monthly");

    var methods={
      itrc:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-itrc-metric/itrc_et_wy2016_v2-0-3"), eto:spatial_cimis_eto},
      disalexi:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_et_wy2016_v2-1-0"), eto:disalexi_eto},
      ucdpt:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-ucd-priestley-taylor/ucd-pt_et_wy2016_v2-2-0"), eto:spatial_cimis_eto},
      ucdmetric:{image:ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-ucd-metric/ucd-metric_et_wy2016_v2-1-0"), eto:spatial_cimis_eto},
      sims:{image: ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-sims/sims_et_wy2016_v2-0-0"), eto:spatial_cimis_eto},
      calsimetaw:{image: ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-calsimetaw/calsimetaw_et_wy2016_v2-0-2"), eto:spatial_cimis_eto},
      detaw:{image: ee.Image("users/ucd-cws-ee-data/ssj-delta-cu/ssj-detaw/detaw_et_wy2016_v2-0-1"), eto:detaw_eto},
    };
    
    var landIQ = ee.Image('users/ucd-cws-ee-data/ssj-delta-cu/ssj-landuse/landuse_2016_v2017-04-25');
    var landcover = landIQ.select(['b1']).rename('level_2');
    // fusion table with the station points 2016
    var station_points = ee.FeatureCollection('ft:1TedFG6u5KqIKghK23OyhPQC7ZIk-H_Qy74rkBvYL');
  }
  
  return({methods: methods, landcover: landcover, stations: station_points});
};//updated 6-6-17


// fusion tables with regions to clip
var DSAregion = ee.FeatureCollection('ft:1VnIrhkVHzFfej6PC0eDEW5ywS3Hjw9Fm0abHZllv');


// function to return an image clipped to a specific AOI from a fusion table
var clip_ET_region = function(image, AOI){
  var clipped = image.clipToCollection(AOI);
  return clipped;
};


// Grouped reducer for mean/median/quartiles/count
var GroupedStatReducers = ee.Reducer.mean()
  .combine(ee.Reducer.median(), "", true)
  .combine(ee.Reducer.percentile([9, 25, 75, 91]), "", true)
  .combine(ee.Reducer.count(), "", true)
  .combine(ee.Reducer.stdDev(), "", true);

// Function to use ReduceRegions to calculate GroupedStatReducers by landcover type for a single band 
var LUstats = function(monthlyETwy12band, bandname, landcover){
  var LUstatsSingleBand = monthlyETwy12band.select(bandname)
    .addBands(landcover)
    .reduceRegion({
      reducer: GroupedStatReducers.group({
        groupField: 1, 
        groupName: 'level_2',}), 
      scale: 30, // note scale is set to 200 meters!
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
};


var exportEEjson = function(region, wateryear){
  var methods = select_water_year(wateryear).methods;
  var landcover = select_water_year(wateryear).landcover;
 
    //loop through all the et sources, calc stats for areas
  for (var key in methods) {
  
    var filename = key + "-" + region + "-" + wateryear + "-etrf";
    print(filename);
    
    // calculate etrf (et / spatial cimis eto) for the image
    var model_et = methods[key].image;
    var eto = methods[key].eto;
    var etrf = model_et.divide(eto);
    
    var e =  LUstatsMonthlyET(clip_ET_region(etrf, region_names[region]), landcover);
    //print(e);
    
      var FC = ee.FeatureCollection([
      ee.Feature(null, ee.Dictionary(e))
    ]);
  
    Export.table.toDrive(FC, filename, "ET_comparisons_geojson", filename, "GeoJSON");
    }
  
};


exportEEjson("dsa", 2015);
exportEEjson("dsa", 2016);
