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
  function landsat_crops(ymd) {
    var ic='users/qjhart/ssj-delta-cu/ssj-landuse/landuse';
//    var year=ee.Date(ymd).get('year');
    var year=2015;
    return ee.Image(ic+'/'+year);
  }
  function landsat_dates() {
    return ['2014-10-12','2014-10-28','2014-12-31',
'2015-03-05','2015-03-21','2015-04-22', '2015-05-08','2015-05-24',
'2015-06-25','2015-07-11','2015-07-27','2015-08-12','2015-09-29'];
  }
  // This function returns the landsat hourly weather data.
  function landsat_hourly(ymd) {
    var weather={
  "2014-10-12": {
    "ETo": 6.133272567103325,
    "Rnl": 0.9809029274584999,
    "Rs": 3.144552224003638,
    "Rso": 16.868794573753213,
    "T": 29.226391426740037,
    "Tdew": 2.5622519780078465,
    "Tn": 13.287338360176221,
    "Tx": 31.878106133127627,
    "U2": 17.19725550955502
  },
  "2014-10-28": {
    "ETo": 2.2747915673520014,
    "Rnl": 0.9843004793771291,
    "Rs": 1.217136941772136,
    "Rso": 14.40746778546422,
    "T": 18.562518364174306,
    "Tdew": 6.434127350039587,
    "Tn": 6.152497336908084,
    "Tx": 24.820042054532443,
    "U2": 14.637478386048363
  },
  "2014-12-31": {
    "ETo": 2.4589228294002257,
    "Rnl": 0.9811411938220901,
    "Rs": 3.2982584226244773,
    "Rso": 9.871933564531304,
    "T": 7.337890062597555,
    "Tdew": -7.299991090268843,
    "Tn": 0.7371885154263319,
    "Tx": 13.201403094345027,
    "U2": 10.061929882685774
  },
  "2015-03-05": {
    "ETo": 2.750401018851048,
    "Rnl": 0.9803016283598082,
    "Rs": 1.355728297706907,
    "Rso": 18.32008706541204,
    "T": 14.203027700564771,
    "Tdew": 4.884287105511345,
    "Tn": 3.114521955776621,
    "Tx": 22.1770114895763,
    "U2": 18.688194494430057
  },
  "2015-03-21": {
    "ETo": 3.5358995772286077,
    "Rnl": 0.917855308666424,
    "Rs": 2.002026232990826,
    "Rso": 19.93332352262316,
    "T": 21.229902348698836,
    "Tdew": 9.648260325171998,
    "Tn": 9.44041896337024,
    "Tx": 23.578966770657196,
    "U2": 21.71743467856943
  },
  "2015-04-22": {
    "ETo": 4.068879852184082,
    "Rnl": 0.9081084069734655,
    "Rs": 2.0141108999948396,
    "Rso": 24.243625398409538,
    "T": 21.17004750731949,
    "Tdew": 10.879212447286363,
    "Tn": 9.520650381553326,
    "Tx": 23.29879425153233,
    "U2": 26.696503899692203
  },
  "2015-05-08": {
    "ETo": 4.354681442389526,
    "Rnl": 0.9723570743032697,
    "Rs": 1.9042774978126298,
    "Rso": 27.652470188564966,
    "T": 18.214534969028836,
    "Tdew": 8.381730483104109,
//    "Tdew":8.9770858,
    "Tn": 7.219325345377701,
    "Tx": 21.99041924730227,
    "U2": 28.438593772361415
  },
  "2015-05-24": {
    "ETo": 5.498513152771229,
    "Rnl": 0.9839040781915261,
    "Rs": 2.9811442730695608,
    "Rso": 29.182121047740896,
    "T": 23.52271120790851,
    "Tdew": 10.90729079344321,
    "Tn": 10.830272796183504,
    "Tx": 25.384876823450014,
    "U2": 29.659550371678417
  },
  "2015-06-25": {
    "ETo": 7.85733654405825,
    "Rnl": 0.9722688614195756,
    "Rs": 2.2754310932648654,
    "Rso": 29.564575044408766,
    "T": 35.20297220793025,
    "Tdew": 12.570502645503298,
    "Tn": 16.7909486367793,
    "Tx": 36.8240471423019,
    "U2": 30.407887417828782
  },
  "2015-07-11": {
    "ETo": 6.289221152077814,
    "Rnl": 0.9794686188631927,
    "Rs": 2.856668669395553,
    "Rso": 29.260876282290337,
    "T": 28.89466453101049,
    "Tdew": 13.085845441846445,
    "Tn": 14.449828217392904,
    "Tx": 28.88967262723518,
    "U2": 29.874339878728545
  },
  "2015-07-27": {
    "ETo": 7.307926563900191,
    "Rnl": 0.9774844421586973,
    "Rs": 2.479397151588608,
    "Rso": 28.12183291550327,
    "T": 31.669389561328227,
    "Tdew": 10.582934270065298,
    "Tn": 14.527340768664903,
    "Tx": 34.28409758532665,
    "U2": 28.769826148578648
  },
  "2015-08-12": {
    "ETo": 6.288392889070689,
    "Rnl": 0.9840036210449514,
    "Rs": 2.5002574528327504,
    "Rso": 26.66479311675757,
    "T": 29.473207169232225,
    "Tdew": 11.201611826759555,
    "Tn": 13.935324909322295,
    "Tx": 31.07576451981986,
    "U2": 27.098418098467327
  },
  "2015-09-29": {
    "ETo": 3.7892091218891104,
    "Rnl": 0.7826907813685531,
    "Rs": 2.461289035835968,
    "Rso": 15.364485996623344,
    "T": 26.163885249195634,
    "Tdew": 9.961947429179308,
    "Tn": 13.529856546136385,
    "Tx": 25.268057406118498,
    "U2": 19.63378347982408
  }
};
return weather[ymd];
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
    landsat_crops:landsat_crops,
    landsat_dates:landsat_dates,
    landsat_hourly:landsat_hourly,
    export_options:export_options
  };
}()); //v2016-07-25

var bbox=DELTA.bbox();

// Set the dates to be used for the monthly raster - use the first day of each month
var wy_2015 = [
'2015-10-01','2015-11-01','2015-12-01',
'2015-01-01','2015-02-01','2015-03-01',
'2015-04-01','2015-05-01','2015-06-01',
'2015-07-01','2015-08-01','2015-09-01',
];

var wy_2016 = ['2015-10-01',
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
    '2016-09-01'];

var water_years = [wy_2015, wy_2016];

for (var z=0;z < water_years.length; z++){
  
  dates = water_years[z]
  var months;
  
  
  function unmaskit(i) { 
    var n=i.unmask(0).clip(bbox);
    return n;
  }
  
  function maskit(i) { 
    var n=i.updateMask(i.gt(-50));//.clip(bbox);
    return n;
  }
  
  disalexi=disalexi.map(maskit);
  
  for (var i=0; i<dates.length; i++) {
      var b='b'+(i+1);
      var start=ee.Date(dates[i]);
      var stop=start.advance(1,'month');
      var mc=disalexi.filterDate(start,stop);
  //    mc=mc.map(maskit);
      var m=mc.mean().clip(bbox).int16();
  //    print(m);
      if (months) {
        months=months.addBands(m.select([0],[b]));
      } else {
        months=m.select([0],[b]);
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
  
  var opts=DELTA.export_options();
  
  opts.driveFileNamePrefix='ssj_disalexi_et_wy2015';
  Export.image(months,'ssj_disalexi_et_wy2015',opts);
  
  Export.image.toAsset({
    image:months,
    description:'disalexi',
    assetId:'users/qjhart/ssj-delta-cu/ssj-disalexi/et_wy2015',
    pyramidingPolicy: {
          '.default': 'mean',
        },
    scale:opts.scale,
    crs:opts.crs,
    crsTransform:opts.crs_transform,
    dimensions:opts.dimensions
  });
}