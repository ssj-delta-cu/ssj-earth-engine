/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageCollection = ee.ImageCollection("users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/eto_collection");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// UPDATING FOR A NEW WATER YEAR
// In order to update this code to work for a new water year, you must do a few short things
// 1) Add the daily disalexi rasters for the new water year to the image collection at
//    users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/et_daily_output and 
//    users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/et_daily_output_corr (depending on
//    which version of disalexi's data you're using, regular or corrected).
// 2) See below in the code where there are variables named things like wy_2015. Define an object
//    like that for each water year and image collection (so, if you want 2015 data for
//    et_daily_output and et_daily_output_corr, you'll define two objects) - give the object
//    a name attribute  - this will be used in the output names. Also give it the path to the
//    Image Collection it refers to in the 'collection' attribute. Finally, give it the dates
//    for the water year - this should just be a list of strings that include the first day of
//    each month in the water year. The code will automatically fill the range of days for that
//    month and collect the data from the image collection.
// 3) Once you've created the object, add it to the water_years list - this list contains
//    the objects to process and will be iterated over. You can remove any existing ones that
//    you don't want to rerun
// 4) Run the scripts. Once it has run, export the images from the tasks pane and they will go
//    to user/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_monthly


// LIBRARIES AND CONSTANTS ================================================
var DELTA = (function() {
  function bbox() {
    return delta_service_region().geometry().bounds();
  }
  function delta_service_region() {
        return ee.FeatureCollection('ft:1OE_ETOZ9Wc2ffFa_B7YWTof9LP2YcuWNcOccSHO7');
  }
  function landcover() {
    return ee.FeatureCollection('ft:13MC0r0a-Zi36E9PNhFOr9m3a5MJAjsKmOsQKk3_9');
  }

   //ul_lr:=596898 4276385 656760 4162602
  function export_options() {
    return  { 
      crs:"EPSG:26910",
      crs_transform:[30,0,596898,0,-30,4276385],
      dimensions:'1995x3793',
      driveFolder:'EarthEngine'
    };
  }
  return {
    bbox:bbox,
    delta_service_region:delta_service_region,
    landcover:landcover,
    export_options:export_options
  };
}()); //v2016-07-25 - partial - Nick removed the parts that weren't needed for this script to clean it up a bit

var bbox=DELTA.bbox();


// LOCAL FUNCTIONS =============================================================
function unmaskit(i) { 
  var n=i.unmask(0).clip(bbox);
  return n;
}

function maskit(i) { 
  var n=i.updateMask(i.gt(-50));//.clip(bbox);
  return n;
}

// WATER YEAR AND DATA DEFINITIONS =============================================

// Set the dates to be used for the monthly raster - use the first day of each month
var wy_2015 = {'name': 'wy_2015',
  'collection':'users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/et_daily_output',
  'dates': [
        '2014-10-01','2014-11-01','2014-12-01',
        '2015-01-01','2015-02-01','2015-03-01',
        '2015-04-01','2015-05-01','2015-06-01',
        '2015-07-01','2015-08-01','2015-09-01',
        ]
};

var eto_2015 = {'name': 'disalexi_eto_2015',
  'collection':'users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/eto_collection',
  'dates': wy_2015.dates
};

var wy_2015_corr = {'name': 'wy_2015_corr',
    'collection': 'users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/et_daily_output_corr',
    'dates': wy_2015.dates,
};

var wy_2016 = {'name': 'wy_2016',
    'collection': 'users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/et_daily_output',
    'dates': ['2015-10-01',
    '2015-11-01',
    '2015-12-01',
    '2016-01-01',
    '2016-02-01',
    '2016-03-01',
    '2016-04-01',
    '2016-05-01',
    '2016-06-01',
    '2016-07-01',
    '2016-08-01',
    '2016-09-01']
    };

var eto_2016 = {'name': 'disalexi_eto_2016',
  'collection': eto_2015.collection,
  'dates': wy_2016.dates
};

var wy_2016_corr = {'name': 'wy_2016_corr',
    'collection': 'users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/et_daily_output_corr',
    'dates': wy_2016.dates
};

var water_years = [wy_2016_corr];  // add any new years to run here


// PROCESSING CODE ============================================================

for (var z=0;z < water_years.length; z++){  // we'll iterate through each water year and run it once for each
  
  var wy_name = water_years[z].name;
  var dates = water_years[z].dates; // and set the current water year to the dates variable used below
  var months = null;
  
  var disalexi = ee.ImageCollection(water_years[z].collection);
  disalexi=disalexi.map(maskit);
  
  for (var i=0; i<dates.length; i++) {
      var b = 'b'+(i+1);
      var start = ee.Date(dates[i]);
      var stop = start.advance(1,'month');  // get the end date for the month based on the start date
      var mc = disalexi.filterDate(start,stop);  // filter the image collection to the date range for the month
  //    mc=mc.map(maskit);
      var m = mc.mean().clip(bbox).int16();  // get the mean value and clip the image to the Delta Bounding Box (defined in the DELTA library)
  //    print(m);
      if (months) {
        months = months.addBands(m.select([0],[b]));  // add a new band to the monthly raster for this month
      } else {
        months = m.select([0],[b]);
      }
  }
  print(months);
  
  //var e=months.select(['b4','b5','b6']).multiply(0)
  //  .select([0,1,2],['b1','b2','b3']);
  //months=e.addBands(months);
  //print(months);
  var display=disalexi.min()
    .addBands(disalexi.max())
    .addBands(disalexi.median());
  
  
  Map.addLayer(months,{bands:['b8','b4','b12'],min:0,max:60},'DisAlexi');
  Map.addLayer(display,{min:0,max:60},'High Low');
  Map.addLayer(disalexi,{min:0,max:60},'Daily');
  
  var opts=DELTA.export_options();  // sets resolution, CRS, etc
  
  // Uncomment below to export to Google Drive - can also do it with the other task below when running task
  //opts.driveFileNamePrefix='ssj_disalexi_et_' + wy_name;
  //Export.image(months,'ssj_disalexi_et_' + wy_name, opts);
  
  Export.image.toAsset({
    image:months,
    description:'disalexi_' + wy_name,
    assetId:'users/ucd-cws-ee-data/ssj-delta-cu/ssj-disalexi/disalexi_monthly/et_' + wy_name,
    pyramidingPolicy: {
          '.default': 'mean',
        },
    scale:opts.scale,
    crs:opts.crs,
    crsTransform:opts.crs_transform,
    dimensions:opts.dimensions
  });
}