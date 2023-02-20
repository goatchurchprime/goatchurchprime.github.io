# README #

This program generates NC code for a laser cutter or router 
from the 2D shapes in an SVG file after cleaning and joining up 
the cutting and etching lines and repositioning them within the cutting area.

Specific instructions and hints are embedded in [the page](https://goatchurch.bitbucket.io/laserplacer.html).

The main dependency is [RaphaelJS](http://dmitrybaranovskiy.github.io/raphael/)

### Features

This program runs fully in the browser, written in native Javascript.  No installation necessary.  
Just drop your SVG files containing the geometry into the working area, drop in a second 
SVG file called "stockdef_machinename" into the same file, click a few buttons, drag one onto the 
other in the position you want to cut, and then download the finished NC file that you can 
upload to your laser cutter or router.  

### Implementation notes

FileArea tracks each file import.  

svgprocesses is an array of SVGfileprocess recording the current state of the file, whether it has been loaded or grouped yet.

Select a process from it as k = svgprocesses["fa0"]

This uses the function importSVGpathR() that is called-back recursively and uses a cstack and pstack to keep track of how much is left to do and how deep the transformation values go.

Now you can look at its contents.
SVGprocess.spnummap maps from colours to colour numbers.  
SVGprocess.spnumlist maps colour numbers back to colours, but also provides an index for rlistb elements via spnum

# Series of calls
InitiateLoadingProcess()
Calls to importSVGpathRR(), which calls back repeatedly the function importSVGpathR()
FinalizeLoadingProcess()


    this.rlistb = [ ];  // list of type [ {path       : paper1.path (raphaelJS object), 
                        //                 spnum      : pen number object indexinginto spnumobj list
                        //                 layerclass : classname from svg object, from layername in dxf
                        //                 col        : stroke colour
                        //                 d          : original path d definition string, 
                        //                 mi         : index of M move within d-string, 
                        //                 dmi        : sub d definition path string, 
                        //                 cmatrix    : concatenated transform derived from svg grouping objects   } ]
                        // quickest shortcut is to use d = path.attr("path")
                        // also functions useful are: Raphael.mapPath(d, cmatrix) and PolySorting.flattenpath()


processSingleSVGpath() sorts out the colours, then calls processSingleSVGpathfinal() which slices up the path code at every M-code in the sequence so they can be treated separately.

-----

Second stage is to click on GGoup that groups these paths by contours and engravings for individual component drag.  You can reselect the X labels on the colours to control which are the cut types and click on GGoup a second time

Function that groups is called groupimportedSVGfordrag()

This calls ProcessToPathGroupings() and then applies the drag and move capabilities to each of the path components

tells about the colours you have.  which colours are selected

The colours that are not selected (white X) are included in the list spnumscp and used for ProcessToPathGroupings() and in 


To run the components of the polygon sorting from the javascript console, we have this sequence of functions:

k = svgprocesses["fa0"]
s = PolySorting.FindClosedPathSequencesD(CopyPathListOfColour(k.rlistb, 1), 2, false); 
j = MakeContourcurvesFromSequences(CopyPathListOfColour(k.rlistb, null), s); 
b = PolySorting.FindAreaGroupingsD(j); 


# DXF powers

An experimental dxf converter has been made from https://github.com/bjnortier/dxf using 
    browserify examples/jtest2.js --standalone bdxf -o examples/bundledxftrial.js 

where jtest2.js says: 
    const dxf = require('..')
    exports.dxf = dxf; 




----------------
todo stuff:
* get the bgroupcoloursindividually cases merged into a single loop
* start to break out the components of ProcessToPathGroupings cleanly with callbacks
* put spnumCSP into an array of paths that incorporates the bgroupcoloursindividually thing


* get the working area to fill the screen no scrolling
* grouping by a big rectangle outline that's draggable


---------

*load the subsetareas separately and be able to pass over tsvg again to get the details
*remove Raphael.mapPath at end of transform case (practice on scratch object first, then do the mappath on output)
*remove jigsawareaoffset code from tunnelx java
*build symbol trimming tech of clippaths, possibly in a second pass over the tsvg object
*drop-down of the sizes of stock (ply) which gets plotted in brown as the area, and material (which generates the lookup for the feeds and speeds)
*select stock shape and type of material which is always underneath (allow for multiple sheets)
*batch up each object into json of [original svgpaths,transforms,sequences,islands,colours,scaletomm,boundingbox,filename,author], 
*be able to draw in minimal tiles off side of stock, post and recover from database file
*layouts are saved as json objects and reimported, merged, etc.
*pile objects along the right hand column in individual boxes
*file select dropdowns that refer to local banks of colours/scales/unified line calls that may be different and can be rerun
*zoom out all by default to scale the two laser board sizes in down the left hand side
*use colours or picking to specify the engraving curves
*estimates of time to cut, which can be used to check if order of cut improving.  do cuts after each etch so abort still have working results
*begin relay packing within area and clearance bits in callouts
*export that ply sheet and remove everything on it
*allow this file to serve from BB, which should be on the net somewhere accessible to the Laser Machine
*colour bits by stock material (colour, thickness, type)
*twisted banks and serves out components for the cutter, previews what's being calculated elsewhere.  




<p>Code is at <a href="https://bitbucket.org/goatchurch/laserplacer">bitbucket.org/goatchurch/laserplacer</a></p>
