
// necessary for the final splitting of the path by the M values (we set bMsplits=false only in tunnel importing)
SVGfileprocess.prototype.processSingleSVGpathFinal = function(dtrans, bMsplits, d, spnum, strokecolour, layerclass, cmatrix)
{
    var i0 = 0; 
    var mi = 0; 
    var im0 = 0; 
    while (i0 < dtrans.length) {
        var i1 = i0 + 1; 
        while ((i1 < dtrans.length) && ((dtrans[i1][0] != "M") || !bMsplits))  // only abs M values are in this case
            i1++; 

        console.assert((d[im0] == "M") || (d[im0] == "m")); 
        var dim1 = d.substr(im0+1).search("M"); 
        var dim1m = d.substr(im0+1).search("m"); 
        if ((dim1m != -1) && ((dim1 == -1) || (dim1m < dim1)))
            dim1 = dim1m; 
            
        console.assert((dim1 == -1) == (i1 == dtrans.length)); 
        
        // this is the place to separate out the paths by M positions
        var path = paper1.path(dtrans.slice(i0, i1)); 
        path.attr({stroke:strokecolour, "stroke-width":this.drawstrokewidth}); 
        var dmi = (dim1 == -1 ? d.substr(im0) : d.substr(im0, dim1)); 
        console.assert((dmi.indexOf("M", 1) == -1) && (dmi.indexOf("m", 1) == -1)); 
        var rb = {path:path, spnum:spnum, col:strokecolour, layerclass:layerclass, d:d, mi:mi, dmi:dmi, cmatrix:cmatrix}; 
        if (d[im0] == "m") {
            if (im0 !== 0) {
                var invcmatrix = cmatrix.invert();  // quick fix to undo the transforms being applied (that will be reapplied to the path if we don't get to the underlying position)
                var MX0 = dtrans[i0-1][dtrans[i0-1].length - 2];  // the previous end point relative to which the next m motion goes from
                var MY0 = dtrans[i0-1][dtrans[i0-1].length - 1];  
                rb["MX0"] = invcmatrix.x(MX0, MY0); 
                rb["MY0"] = invcmatrix.y(MX0, MY0); 
            } else {
                console.log("Bad lower-case m at start of path", d);  
                rb["MX0"] = 0;
                rb["MY0"] = 0;  
            }
        } 
        this.rlistb.push(rb); 
        
        im0 = dim1+im0+1; 
        i0 = i1; 
        mi++; 
    }
}
    
var nostrokecolour = null; 
//nostrokecolour = "#0000A0"; // can override the no stroke, though there's often a good reason it's not stroked (being garbage)
//layerclass is the class put in by the dxf2svg conversion which sets class of each element to the layername
//(which will potentially supercede the generation of spnums)
// function redundant now we are not updating colours in it
SVGfileprocess.prototype.processSingleSVGpath = function(d, cmatrix, stroke, layerclass)
{    
    var dtrans = Raphael.mapPath(d, cmatrix); // Raphael.transformPath(d, raphtranslist.join("")); 
    if (dtrans.length <= 1)
        return; 
    if ((stroke == "none") || (stroke === undefined) || (stroke === null)) {
        if (nostrokecolour == null) {
            console.log("skipping path with no stroke", d); 
            return; 
        }
        stroke = nostrokecolour; 
    }
    this.processSingleSVGpathFinal(dtrans, true, d, 0, stroke, layerclass, cmatrix); 
}


// this is because firefox returns "none" for cc.css("stroke")
function ColNoneToNull(col)
{
    if (col === undefined)
        return null; 
    if (col === "none")
        return null; 
    if (col === "")
        return null; 
    return col; 
}
// we get fill codes that shouldn't be set (for fonts) on firefox
function ColNoneToNullF(col)
{
    if (col === "rgb(0, 0, 0)")
        return null; 
    return ColNoneToNull(col); 
}


SVGfileprocess.prototype.importSVGpathR = function() 
{
    while (this.cstack.length == this.pback.pos) 
        this.pback = this.pstack.pop(); 
    if (this.cstack.length == 0) {
        return false; 
    }
    var cc = this.cstack.pop(); 
    var tag = cc.tagName.toLowerCase(); 
    var raphtranslist = this.pback.raphtranslist; 
    var cmatrix = this.pback.cmatrix; // this already is raphtranslist.join("")).matrix
    
    // we need to replace strings translate(1,2) with t1,2
    if (cc.getAttribute("transform")) {
        raphtranslist = raphtranslist.slice(); 
        // was: raphtranslist.push(cc.getAttribute("transform").replace(/([mtrs])\w+\s*\(([^\)]*)\)/gi, function(a, b, c) { return b.toLowerCase()+c+(b.match(/s/i) ? ",0,0" : ""); } )); 
        var transre = /([mtrs])\w+\s*\(([^\)]*)\)/gi; 
        var transstr = cc.getAttribute("transform"); 
        var transmatch;
        while ((transmatch = transre.exec(transstr)) !== null) {
            var transshort = transmatch[1].toLowerCase() + transmatch[2]; 
            if (transshort[0] == "s") {  // get the scaling about absolute 0,0 not centre of path
                var ncommas = (transshort.match(/,/g)||[]).length; 
                if (ncommas == 0)
                    transshort += "," + transshort.substr(1); 
                if (ncommas <= 1)
                    transshort += ",0,0"; 
            }
            raphtranslist.push(transshort); 
        }
        cmatrix = paper1.path().transform(raphtranslist.join("")).matrix; 
    }
    var strokelist = this.pback.strokelist; 

    // decode case where multiple classes in same field
    var cclass = cc.getAttribute("class"); 
    
    // to use getComputedStyle, the loaded svg object would need to be inserted into the DOM somewhere; but here we are just parsing it by regexps
    var lstyle = { }; 
    if (cc.getAttribute("style")) {   // taken from parser in InitiateLoadingProcess
        cc.getAttribute("style").replace(/([^:;]*):([^:;]*)/gi, function(a1, b1, c1) { 
            var c11 = c1.trim(); 
            if ((c11.length != 0) && (c11[0] == '"') && (c11[c11.length-1] == '"'))
                c11 = c11.slice(1, -1); 
            lstyle[b1.trim().toLowerCase()] = c11; 
        });
    }
    var cstroke = ColNoneToNull(cc.getAttribute("stroke")) || ColNoneToNull(lstyle["stroke"]); 
    var cfill = ColNoneToNullF(cc.getAttribute("fill")) || ColNoneToNullF(lstyle["fill"]); 
    var ocfill = cfill; 

    if ((cstroke === null) && cclass) {
        var lcclasss = cclass.split(" "); 
        for (var k = 0; k < lcclasss.length; k++) { 
            var lcclass = lcclasss[k]; 
            if (lcclass) {
                var lstroke = this.mclassstyle[lcclass] && this.mclassstyle[lcclass]["stroke"]; 
                var lfill = this.mclassstyle[lcclass] && this.mclassstyle[lcclass]["fill"]; 
                cstroke = ColNoneToNull(lstroke) || ColNoneToNull(cstroke);  // prioritized getting colour from somewhere
                if (!ocfill)
                    cfill = lfill || cfill; 
            }
        }
    }
    
    if (!cstroke || (cstroke === null))  // use fill if stroke not there
        cstroke = cfill;  // strictly because there is a strokelist stack but no filllist stack, this will mask any lower fills anyway
    
    if (cstroke) {
        strokelist = strokelist.slice(); 
        strokelist.push(cstroke); 
    } else {
        cstroke = strokelist[strokelist.length - 1]; 
    }
    
    var layerclass = cc.getAttribute("class") || ""; 
    if (tag == "pattern") {
        console.log("skip pattern"); 
    } else if (tag == "clippath") {
        console.log("skip clippath"); // will deploy Raphael.pathIntersection(path1, path2) eventually
        // <clipPath id="cp1"> <path d="M497.7 285.2 Z"/></clipPath>
        // then clippath="url(#cp1)" in a path for a trimmed symbol type
    } else if ((tag == "polygon") || (tag == "polyline")) {
        var ppts = cc.getAttribute("points").split(/\s+|,/);
        var x0 = ppts.shift(); 
        var y0 = ppts.shift();
        var d = 'M'+x0+','+y0+'L'+ppts.join(' ')+(tag == "polygon" ? "Z" : ""); 
        this.processSingleSVGpath(d, cmatrix, cstroke, layerclass); 
    } else if (tag == "circle") {
        var cx = parseFloat(cc.getAttribute("cx"));
        var cy = parseFloat(cc.getAttribute("cy")); 
        var r = parseFloat(cc.getAttribute("r")); 
        var d = "M"+(cx-r)+","+cy+"A"+r+","+r+",0,0,1,"+cx+","+(cy-r)+"A"+r+","+r+",0,1,1,"+(cx-r)+","+cy; 
        this.processSingleSVGpath(d, cmatrix, cstroke, layerclass); 
    } else if (tag == "line") {
        var x1 = parseFloat(cc.getAttribute("x1"));
        var y1 = parseFloat(cc.getAttribute("y1")); 
        var x2 = parseFloat(cc.getAttribute("x2"));
        var y2 = parseFloat(cc.getAttribute("y2")); 
        var d = "M"+x1+","+y1+"L"+x2+","+y2; 
        this.processSingleSVGpath(d, cmatrix, cstroke, layerclass); 
    } else if (tag == "rect") {
        var x0 = parseFloat(cc.getAttribute("x"));
        var y0 = parseFloat(cc.getAttribute("y")); 
        var x1 = x0 + parseFloat(cc.getAttribute("width")); 
        var y1 = y0 + parseFloat(cc.getAttribute("height")); 
        var d = "M"+x0+","+y0+"L"+x0+","+y1+" "+x1+","+y1+" "+x1+","+y0+"Z"; 
        if (!this.btunnelxtype)
            this.processSingleSVGpath(d, cmatrix, cstroke, layerclass); 
    } else if (tag == "path") {
        this.processSingleSVGpath(cc.getAttribute("d"), cmatrix, cstroke, layerclass); 
        
    } else if (tag == "text") {
        var textvalue = cc.textContent; 
        var textvalueparam = textvalue.split(/\s*=\s*/); 
        this.textvalues.push(textvalueparam.length == 2 ? textvalueparam : [textvalue]); 
        
    } else {  // push remaining objects back into the stack
        this.pstack.push(this.pback); 
        this.pback = { pos:this.cstack.length, raphtranslist:raphtranslist, strokelist:strokelist, cmatrix:cmatrix }; 
        var cs = cc.children; 
        for (var i = cs.length - 1; i >= 0; i--) 
            this.cstack.push(cs[i]);   // in reverse order for the stack
    }
    this.elprocessstatus.textContent = ("L"+this.rlistb.length+"/"+this.cstack.length); 
    return true; 
}




// this operates the settimeout loop (done this way because some files we've tried are very very large)
function importSVGpathRR(lthis)  
{
    if (lthis.bcancelIm) {
        this.elprocessstatus.textContent = ("CANCELLED"); 
        
    // this is the timeout loop
    } else if (lthis.btunnelxtype ? lthis.importSVGpathRtunnelx() : lthis.importSVGpathR()) {
        setTimeout(importSVGpathRR, lthis.timeoutcyclems, lthis); 
        
    // the final step when done
    } else {
        lthis.elprocessstatus.textContent = "LD"; 
        setTimeout(lthis.FinalizeLoadingProcess.bind(lthis), 1); 
    }
}


function paramvaluedefault(textvalues, key, defv)  
{
    // keep these as a list of pairs and singletons, not a dict, as it's much more well-behaved
    for (var i = 0; i < textvalues.length; i++) {
        if ((textvalues[i].length == 2) && (textvalues[i][0] == key))
            return textvalues[i][1]; 
    }
    return defv;  
}


SVGfileprocess.prototype.InitiateLoadingProcess = function(txt) 
{
    // NB "stroke" actually means colour in SVG lingo
    this.txt = txt; 
    
// this is the last place jquery is used, for the parsing ofthe svg text.  
// there must be a way using 
//   this.Dtsvg = document.createElement("div"); 
//   this.Dtsvg.innerHTML = txt; 
// would also need a rewrite on the cstack using nodename and node value, and find out what .find does
// to get it all done
//console.log(txt);   
    var dtsvg = document.createElement("div"); 
    dtsvg.innerHTML = txt; 
    this.tsvg = dtsvg.querySelector("svg"); 
    //this.tsvg = $($(txt).children()[0]).parent(); // seems not to work directly as $(txt).find("svg")
    
//console.log(this.tsvg);   
    this.WorkOutPixelScale();  // sets the btunnelxtype
    
    // find the class definitions for style (using the replace function to look up all of them)
    this.mclassstyle = { }; 
    var mclassstyle = this.mclassstyle; 
    var qstyle = this.tsvg.querySelector("style"); 
    var styletext = (qstyle !== null ? qstyle.textContent : ""); 
    styletext.replace(/\.([\w\d\-]+)\s*\{([^}]*)/gi, function(a, b, c) { 
        mclassstyle[b] = { }; 
        c.replace(/([^:;]*):([^:;]*)/gi, function(a1, b1, c1) { 
            var c11 = c1.trim(); 
            if ((c11.length != 0) && (c11[0] == '"') && (c11[c11.length-1] == '"'))
                c11 = c11.slice(1, -1); 
            mclassstyle[b][b1.trim().toLowerCase()] = c11; 
        }); 
    }); 
    console.log("mclassstyle", mclassstyle); 

    // autorun the group process (should distinguish easy cases)
    //if (txt.length < 10000)
    //    $("div#"+this.fadivid+" .groupprocess").addClass("selected"); 

    this.rlistb = [ ];  // list of type [ {path       : paper1.path (raphaelJS object), 
                        //                 spnum      : pen number object indexinginto spnumobj list
                        //                 layerclass : classname from svg object, from layername in dxf
                        //                 col        : stroke colour
                        //                 d          : original path d definition string, 
                        //                 mi         : index of M move within d-string, 
                        //                 dmi        : sub d definition path string, 
                        //                 cmatrix    : concatenated transform derived from svg grouping objects
                        //                 (MX0, MY0) : used when dmi[0]=="m" relative move to state its absolute offset  } ]
                        // quickest shortcut is to use d = path.attr("path")
                        // also functions useful are: Raphael.mapPath(d, cmatrix) and PolySorting.flattenpath()
                        
    
    this.Lgrouppaths = [ ]; // used to hold the sets of paths we drag with
    //this.pathgroupings = [ ]; // the actual primary data, returned from ProcessToPathGroupings()
    this.textvalues = [ ];  // contents of any text objects, split by '=' which we can use to make into parameters and settings on the postprocessor; accessed by paramvaluedefault()

    // these control the loop importSVGpathRR runs within
    var imatrix = Raphael.matrix(this.fsca, 0, 0, this.fsca, 0, 0); 
    this.pback = {pos:-1, raphtranslist:[imatrix.toTransformString()], strokelist:[undefined], cmatrix:imatrix };
    this.pstack = [ ];   // stack holding the depth sequence of transforms to be applied
    this.cstack = [ this.tsvg ];  // stack handling the recursive breakdown and identification of the objects
    
    this.timeoutcyclems = 4; 
    importSVGpathRR(this); 
}

SVGfileprocess.prototype.FinalizeLoadingProcess = function() 
{
    // count the number of layers and colours and layer-colours; fill <select dropdownlayerselection> and make a choice
    var colcountmap = { }; 
    var layerclasscountmap = { };
    var collayerclasscountmap = { };
    console.log(this); 
    for (var i = 0; i < this.rlistb.length; i++) {
        colcountmap[this.rlistb[i].col] = 1; 
        layerclasscountmap[this.rlistb[i].layerclass] = 1; 
        collayerclasscountmap[this.rlistb[i].col+"*"+this.rlistb[i].layerclass] = 1; 
    }
    console.log("layerclasscountmap", layerclasscountmap); 
    console.log("colcountmap", colcountmap);
    var ncolcountmap = Object.keys(colcountmap).length;  
    var nlayerclasscountmap = Object.keys(layerclasscountmap).length;  
    var ncollayerclasscountmap = Object.keys(collayerclasscountmap).length; 
    var bblanklayer = (layerclasscountmap[""] !== undefined)
    var bclasstype = ((nlayerclasscountmap >= 2) && !bblanklayer); 

    var eldropdownlayerselection = document.getElementById(this.fadivid).getElementsByClassName("dropdownlayerselection")[0]; 
    var dropdownlayerselectionlist = [ '<option value="collapse">collapse</option>' ]; 
    if (!this.bstockdefinitiontype) {
        dropdownlayerselectionlist.push('<option value="showcolourlist">colour '+(bclasstype?"":"*")+ncolcountmap+'</option>'); 
        dropdownlayerselectionlist.push('<option value="showclasslist">class '+(bclasstype?"*":"")+nlayerclasscountmap+(bblanklayer ? "_" : "")+"</option>"); 
        dropdownlayerselectionlist.push('<option value="showcolourclasslist">colclass '+ncollayerclasscountmap+'</option>'); 
        dropdownlayerselectionlist.push('<option value="makegroup">group</option>'); // option 4
    } else {
        dropdownlayerselectionlist.push('<option value="showparameters">parameters</option>'); 
        dropdownlayerselectionlist.push('<option value="testpathoverlaps">test overlaps</option>'); 
        dropdownlayerselectionlist.push('<option value="generatepath">make toolpath</option>'); 
    }
    dropdownlayerselectionlist.push('<option value="deleteprocess">delete</option>'); // option 5
    eldropdownlayerselection.innerHTML = dropdownlayerselectionlist.join(""); 
    if (!this.bstockdefinitiontype) {
        eldropdownlayerselection.value = (bclasstype ? "showclasslist" : "showcolourlist"); 
    }
    
    // this.processdetailSVGtunnelx(); 
    this.ProcessPathsToBoundingRect();  
    this.elprocessstatus.textContent = "BD"; 
    this.updateLgrouppaths(); 
    updateAvailableThingPositions();  // apply any JSON code to this
    if (this.bstockdefinitiontype) {
        this.spnumCSP = { "layerselectindextype":"colour", "cutpaths": [ 0 ], "slotpaths": [ ], "penpaths": [ ] }; 
        eldropdownlayerselection.value = "showparameters"; 
        groupingprocess(this); 
        setTimeout(makestockdeflayers, 1, this); 
    } else {
        setTimeout(makelayers, 1, this); 
    }
}


function importSVGfile(i, f)
{
    console.log("importSVGfile", f.name); 
    var beps = f.type.match('image/x-eps'); 
    var bsvg = f.type.match('image/svg\\+xml'); 
    var bsvgizedtext = f.type.match('svgizedtext');  // this is the letters case
    var bdxf = f.type.match('image/vnd\\.dxf'); 
    
    if (!beps && !bsvg && !bdxf && !bsvgizedtext) {
        alert(f.name+" not SVG, EPS or DXF file: "+f.type); 
        return;
    }
    if (dropsvgherenote !== null) {
        dropsvgherenote.remove(); 
        dropsvgherenote = null; 
    }

    // create the new unique id and the process behind it
    var fadivid = 'fa'+filecountid; 
    filecountid++; 
    filenamelist[fadivid] = f.name; 
    var bstockdefinitiontype = (f.name.match(/^stockdef/) ? true : false); 

    // create the control panel and functions for this process
    var elfilearea = document.getElementById("filearea"); 
    
    var fileblock = ['<div id="'+fadivid+'">']; 
    fileblock.push('<select class="dropdownlayerselection"></select>'); 
    if (!bstockdefinitiontype) 
        fileblock.push('<input class="tfscale" type="text" name="fscale" value="1.0" title="Apply scale"/>'); 
    fileblock.push('<b class="fname">'+f.name+'</b>'); 

    fileblock.push('<span class="fprocessstatus">VV</span>'); 
    fileblock.push('<select class="dposition"></select>'); 
    if (bstockdefinitiontype) {
        fileblock.push('<input type="text" class="pencutseqindex" value="0" title="Path index"/>/<span class="pencutseqcount" title="Total path count">1</span>'); 
        fileblock.push('<input type="button" value="<<<" class="pencutseqback" title="go back one path"/>'); 
        fileblock.push('<input type="button" value=">" class="pencutseqadvance" title="advance on segment"/>'); 
        fileblock.push('<input type="button" value="A" class="pencutseqanimate" title="animate"/>'); 
    }
    
    if (!bstockdefinitiontype)
        fileblock.push('<div class="layerclasslist"></div>'); 
    else
        fileblock.push('<div class="layerparamslist"></div>'); 
    
    fileblock.push('</div>'); 
    elfilearea.insertAdjacentHTML("beforeend", fileblock.join("")); 

    // n/ow the actual process (which has links into the control panel just made
    var svgprocess = new SVGfileprocess(f.name, fadivid, bstockdefinitiontype); 
    svgprocesses[fadivid] = svgprocess; 

    var elfadiv = document.getElementById(fadivid); 
    if (bstockdefinitiontype) {
        elfadiv.getElementsByClassName("pencutseqadvance")[0].onclick = function() { plotpencutseqadvance(svgprocess, 1) }; 
        elfadiv.getElementsByClassName("pencutseqback")[0].onclick = function() { plotpencutseqadvance(svgprocess, -1) }; 
        elfadiv.getElementsByClassName("pencutseqanimate")[0].onclick = function() { pencutseqanimate(svgprocess) }; 
        elfadiv.getElementsByClassName("dropdownlayerselection")[0].onchange = function() { makestockdeflayers(svgprocess); }
    } else {
        elfadiv.getElementsByClassName("fprocessstatus")[0].onclick = function() { svgprocess.bcancelIm = true; }; 
        elfadiv.getElementsByClassName("tfscale")[0].onkeydown = function(e) { if (e.keyCode == 13)  { e.preventDefault(); rescalefileabs(elfadiv) }; }; 
        elfadiv.getElementsByClassName("dropdownlayerselection")[0].onchange = function() { makelayers(svgprocess); }
    }
    
    fadividlast = fadivid; 
Dsvgprocess = svgprocess; 
Df = f;  

    if (bsvgizedtext) {
        svgprocess.InitiateLoadingProcess(f.svgtext); 
    } else if (bsvg) {
        var reader = new FileReader(); 
        reader.onload = (function(e) { svgprocess.InitiateLoadingProcess(reader.result); }); 
        reader.readAsText(f); 
    } else {
        alert("not svg type: "+f.name); 
        elfadiv.getElementsByClassName("fname")[0].style.background = "red"; 
    }
}

//if (svgprocess.svgstate.match(/doneimportsvgr|doneimportsvgrareas/))
//    svgprocess.groupimportedSVGfordrag((svgprocess.btunnelxtype ? "grouptunnelx" : "groupcontainment")); 



function updateAvailableThingPositions()   // see jsonThingsPositions for format
{
    // go through and find any svgprocesses that match by name with any unconsumed thingpositions
    var svgprocesseskeys = Object.keys(svgprocesses); 
    for (var i = 0; i < svgprocesseskeys.length; i++) {
        var svgprocess = svgprocesses[svgprocesseskeys[i]]; 
        
        // we should only need to apply it once, because all the positions will be filled in ready in the pathgroupingtstrs array
        if ((svgprocess.elprocessstatus.textContent == "BD") || (svgprocess.elprocessstatus.textContent == "GD")) {
            var jmatchedalready = -1; 
            for (var j = 0; j < mainthingsposition.svgprocesses.length; j++) {
                if (mainthingsposition.svgprocesses[j].matchingprocessfadivid === svgprocess.fadivid) {
                    jmatchedalready = j; 
                    break; 
                }
            }
            if (jmatchedalready !== -1)
                continue; 
            
            for (var j = 0; j < mainthingsposition.svgprocesses.length; j++) {
                if ((mainthingsposition.svgprocesses[j].matchingprocessfadivid === undefined) && (svgprocess.fname == mainthingsposition.svgprocesses[j].fname)) {
                    svgprocess.applyThingsPosition(mainthingsposition.svgprocesses[j]); 
                    mainthingsposition.svgprocesses[j].matchingprocessfadivid = svgprocess.fadivid; 
                    if (svgprocess.elprocessstatus.textContent == "BD") {
                        var elfadiv = document.getElementById(svgprocess.fadivid); 
                        elfadiv.getElementsByClassName("dropdownlayerselection")[0].value = "makegroup"; 
                        if (elfadiv.getElementsByClassName("layerclasslist").length != 0)
                            elfadiv.getElementsByClassName("layerclasslist")[0].style.display = "none";
                        groupingprocess(svgprocess); 
                    } 
                    break; 
                }
            }
        }
    }

    // update the select option list of thingpos
    var elimportedthingpos = document.getElementById("importedthingpos"); 
    while (elimportedthingpos.firstChild)  // clearall
        elimportedthingpos.removeChild(elimportedthingpos.firstChild); 
    for (var j = 0; j < mainthingsposition.svgprocesses.length; j++)
        elimportedthingpos.insertAdjacentHTML("beforeend", "<option>"+(mainthingsposition.svgprocesses[j].matchingprocessfadivid ?"["+mainthingsposition.svgprocesses[j].matchingprocessfadivid+"] ":"** ")+mainthingsposition.svgprocesses[j].fname+"</option>"); // can't put colours into option tag
    elimportedthingpos.hidden = (mainthingsposition.svgprocesses.length == 0); 
}

var Df; 
var filecountid = 0; 
function importSVGfiles(files)
{
    console.log("importSVGfiles", files.length); 
    for (var i = 0; i < files.length; i++) {
        if (files[i].type == "application/json") {
            var reader = new FileReader(); 
            reader.onload = function(e) {  mainthingsposition = JSON.parse(reader.result);  updateAvailableThingPositions();  }; 
            reader.readAsText(files[i]); 
        } else {
            importSVGfile(i, files[i]);   // this function already kicks off independent loading processes
        }
    }
}

