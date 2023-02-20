// (also contains importSVGfiles() at the bottom)


function AutoDownloadBlob(stringlist, downloadfilename) 
{
    var a = document.createElement('a');
    a.style = "display: none"; 
    var mimetype = "text/plain"; 
    if (downloadfilename.match("svg$"))
        mimetype = "image/svg+xml"; 
    else if (downloadfilename.match("json$"))
        mimetype = "application/json"; 
    
    var blob = new Blob(stringlist, {'type':mimetype});
    a.href = window.URL.createObjectURL(blob);
    a.download = downloadfilename;
    document.body.appendChild(a); 
    a.onclick = function() { document.body.removeChild(a); }; 
    a.click();
}

function exportSVG()
{
    var xs = new XMLSerializer();
    var data = document.getElementById("paper1").children[0]; // gets the svg element put there by Raphael
    AutoDownloadBlob([xs.serializeToString(data)], "test.svg");
}


var bcancelExIm = false; 
var cosang = 5; 
var cosangdot = Math.cos(cosang*Math.PI/180); 
var TXlinestylespnum = { "subsetarea":0, "Wall":1, "EstW":1, "Detl":2, "symbDetl":2, "CeilB":2, "Pitc":2, "Cent":3, "symbFill":4 }; 
//alert("hi"); 
function exportPLT()
{
//console.log("exportingJSON instead"); 
//return exportJSON(); 

    var svgprocess = svgprocesses[fadividlast]; 
    var rlistb = svgprocess.rlistb; 
    
    var lplt = [ "IN;\n", "WU0;\n" ]; 
    var samplerateunit = 0.9; 
    var fac = 40; // PLT file operates at 40units per pixel
    var ytop = 10000; 
    var i = 0; 
    bcancelExIm = false; 
    document.getElementById("readingcancel").textContent = "exportPLT"; 
    function exportPLTpathR() {
        var path = rlistb[i].path; 
        var d = path.attr("path"); 
        var dtrans = Raphael.mapPath(d, path.matrix); 
        var fpts = PolySorting.flattenpath(dtrans, cosangdot, 0.0) 
        
        // uncomment to plot the flattenpath for debug viewing
        //var Lfpts = [ ]; for (var Di = 0; Di < fpts.length; Di++); Lfpts.push(fpts[Di][0]+","+fpts[Di][1]); 
        //paper1.path("M"+Lfpts.join("L")).attr("stroke", "red");  
        var spnum = rlistb[i].spnum, spnumobj; 
        if (svgprocess.btunnelxtype) {
            spnumobj = svgprocess.spnumlist[spnum]; 
            spnum = TXlinestylespnum[spnumobj.linestyle]; 
        }
        if (spnum !== undefined) {
            lplt.push("SP"+spnum+";\n"); 
            lplt.push("LT;\n"); 
            for (var j = 0; j < fpts.length; j++) {
                lplt.push((j == 0 ? "PU" : "PD")+(fpts[j][0]*fac).toFixed(3)+" "+(ytop-fpts[j][1]*fac).toFixed(3)+"\n"); 
            }
        } else if (spnumobj) {
            console.log(TXlinestylespnum[spnumobj.linestyle]); 
        }
        if (bcancelExIm) {
            return; 
        } else if (++i < rlistb.length) {
            setTimeout(exportPLTpathR, 1); 
        } else {
            lplt.push("SP0;\n"); 
            var a = document.createElement('a');
            AutoDownloadBlob(lplt, "test.plt"); 
        }
        document.getElementById("readingcancel").textContent = (i+"/"+rlistb.length); 
    };
    exportPLTpathR(); 
}

// quick hack to see if we can load into polar graph system
function exportJSON()
{
    var svgprocess = svgprocesses[fadividlast]; 
    var rlistb = svgprocess.rlistb; 
    
    var lplt = [ " " ]; 
    var samplerateunit = 0.9; 
    var fac = 1; 
    var ytop = 0; 
    var i = 0; 
    bcancelExIm = false; 
    document.getElementById("readingcancel").textContent = ("exportPLT"); 
    function exportJSONpathR() {
        var path = rlistb[i].path; 
        var d = path.attr("path"); 
        var dtrans = Raphael.mapPath(d, path.matrix); 
        var fpts = PolySorting.flattenpath(dtrans, cosangdot, 0.0) 
        
        // uncomment to plot the flattenpath for debug viewing
        //var Lfpts = [ ]; for (var Di = 0; Di < fpts.length; Di++); Lfpts.push(fpts[Di][0]+","+fpts[Di][1]); 
        //paper1.path("M"+Lfpts.join("L")).attr("stroke", "red");  
        var spnum = rlistb[i].spnum, spnumobj; 
        if (svgprocess.btunnelxtype) {
            spnumobj = svgprocess.spnumlist[spnum]; 
            spnum = TXlinestylespnum[spnumobj.linestyle]; 
        }
        if (spnum !== undefined) {
            for (var j = 0; j < fpts.length; j++) {
                lplt.push((j == 0 ? "M" : "L")+(200+fpts[j][0]*fac).toFixed(3)+" "+(fpts[j][1]*fac-ytop).toFixed(3)); 
            }
        } else if (spnumobj) {
            console.log(TXlinestylespnum[spnumobj.linestyle]); 
        }
        if (bcancelExIm) {
            return; 
        } else if (++i < rlistb.length) {
            setTimeout(exportJSONpathR, 1); 
        } else {
            lplt.push(""); 
            AutoDownloadBlob(lplt, "test.plt"); 
        }
        document.getElementById("readingcancel").textContent = (i+"/"+rlistb.length); 
    };
    exportJSONpathR(); 
}

SVGfileprocess.prototype.jsonThingsPositions = function()   // to be used by importThingPositions(lthingsposition) 
{
    var thingpos = { fname:this.fname, svgstate:this.elprocessstatus.textContent, currentabsolutescale:this.currentabsolutescale }; 
    thingpos["spnumCSP"] = getspnumCSP(this.fadivid, this.layerselectindextype) || this.spnumCSP; 
    thingpos["rlistblength"] = this.rlistb.length; 
    thingpos["pathgroupingsinfo"] = [ ]; 
    
    for (var i = 0; i < this.pathgroupings.length; i++) {
        thingpos["pathgroupingsinfo"].push({ pathgroupname:this.pathgroupings[i][0], tstr:this.Lgrouppaths[i][0].transform() }); 
    }
    return thingpos; 
}



function deletesvgprocess(fadivid)
{
    var elfadiv = this.parentElement;  
    if (fadividlast === fadivid)
        fadividlast = null; 
    svgprocesses[fadivid].removeall(); // kill off the geometry that derived from this file
    delete svgprocesses[fadivid]; 
    document.getElementById(fadivid).remove(); 
}


// returns [ {fadivid:fadivid, j:j, bbox:bbox } ]
function GetAllProcessGroupings()
{
    // scan through everything available
    var processgroupings = [ ]; 
    var svgprocesseskeys = Object.keys(svgprocesses); 
    
    for (var i = 0; i < svgprocesseskeys.length; i++) {
        var svgprocess = svgprocesses[svgprocesseskeys[i]]; 
        console.assert(svgprocess.Lgrouppaths.length == svgprocess.pathgroupings.length); 
        if (!svgprocess.bstockdefinitiontype) {
            for (var j = 0; j < svgprocess.pathgroupings.length; j++) {
                if (svgprocess.pathgroupings[j][0] != "unmatchedsinglets") {
                    var groupbbox = svgprocess.Lgrouppaths[j][0].getBBox(); 
                    processgroupings.push({fadivid:svgprocess.fadivid, j:j, bbox:groupbbox}); 
                }
            }
        }
    }
    return processgroupings; 
}



// returns [ {fadivid:fadivid, j:j, bbox:bbox } ]
function GetGroupsoverlayingstock(stockbbox)
{
    // find all pathgroups that overlap this stockbbox
    var groupsoverlayingstock = [ ]; 
    var svgprocesseskeys = Object.keys(svgprocesses); 
    for (var i = 0; i < svgprocesseskeys.length; i++) {
        var svgprocess = svgprocesses[svgprocesseskeys[i]]; 
        if (!svgprocess.bstockdefinitiontype) {
            console.assert(svgprocess.Lgrouppaths.length == svgprocess.pathgroupings.length); 
            
            // boundary only done case (gives option of including this raw without grouping) 
            if (svgprocess.elprocessstatus.textContent == "BD") {
                console.assert(svgprocess.pathgroupings.length == 1); 
                console.assert(svgprocess.pathgroupings[0][0] == "boundrect"); 
                var groupbbox = svgprocess.Lgrouppaths[0][0].getBBox(); 
                if (Raphael.isBBoxIntersect(stockbbox, groupbbox))
                    groupsoverlayingstock.push({fadivid:svgprocess.fadivid, j:0, bbox:groupbbox}); 
                
            // grouped done case
            } else {
                for (var j = 0; j < svgprocess.pathgroupings.length; j++) {
                    if ((svgprocess.pathgroupings[j][0] != "boundrect") && (svgprocess.pathgroupings[j][0] != "unmatchedsinglets")) {
                        var groupbbox = svgprocess.Lgrouppaths[j][0].getBBox(); 
                        if (Raphael.isBBoxIntersect(stockbbox, groupbbox))
                            groupsoverlayingstock.push({fadivid:svgprocess.fadivid, j:j, bbox:groupbbox}); 
                    }
                }
            }
        }
    }
    return groupsoverlayingstock; 
}





// finish 
// returns [ { ptype:cutouter/cutisland/etch, d:dvalue, reversed:true/false, colour:col, tstr:tstr, xtransseq:[], ytransseq:[] } ] 
function GetPathsPensSequences(svgprocess, pgi, pathgrouping, tstr) 
{
    var res = [ ]; 
    for (var i = 1; i < pathgrouping.length; i++) {
        for (var k = 0; k < pathgrouping[i].length; k++) {
            var rres = { ptype:(i == pathgrouping.length - 1 ? "etch" : (i == 1 ? "cutouter" : "cutinner")), tstr:tstr, fadivid:svgprocess.fadivid, pgi:pgi, contnum:i, pgik:k }; 
            var jr; 
            if (rres.ptype == "etch") {
                jr = pathgrouping[i][k]; 
                rres["reversed"] = false; 
            } else {
                jr = pathgrouping[i][k]/2|0; 
                rres["reversed"] = ((pathgrouping[i][k]%2) == 0); 
            }
            rres["rspnum"] = svgprocess.rlistb[jr].spnum; 
            rres["absolutescale"] = svgprocess.currentabsolutescale; 
            rres["cmatrix"] = svgprocess.rlistb[jr].cmatrix; 
            rres["dmi"] = svgprocess.rlistb[jr].dmi; 
            if (svgprocess.rlistb[jr].MX0 !== undefined) {
                rres["MX0"] = svgprocess.rlistb[jr].MX0; 
                rres["MY0"] = svgprocess.rlistb[jr].MY0; 
            }
            res.push(rres); 
        }
    }
    return res; 
}

function PenCutSeqToPoints(penseq, ftol)
{
    penseq["xtransseq"] = [ ]; 
    penseq["ytransseq"] = [ ]; 
    
    // we should transform paths across preserving arcs
    // this depends on path2curve which converts all to paths; or we should use parsePathString; and then there's pathToAbsolute
    
    var dtrans; 
    if (penseq.dmi[0] === "m") {
        var dmiM = "M"+penseq.MX0+","+penseq.MY0+" "+ penseq.dmi; // insert an absolute M position and then shift it out
        dtrans = Raphael.mapPath(dmiM, penseq.cmatrix); 
        console.assert((dtrans[0][0] == "M") && (dtrans[1][0] == "M")); 
        dtrans.shift(); 
        console.log(dmiM, dtrans); 
    } else {
        dtrans = Raphael.mapPath(penseq.dmi, penseq.cmatrix); 
    }
    
    if (penseq.absolutescale !== 1)
        dtrans = Raphael.mapPath(dtrans, Raphael.matrix(penseq.absolutescale, 0, 0, Math.abs(penseq.absolutescale), 0, 0))
    dtrans = Raphael.transformPath(dtrans, penseq.tstr); 
    var pts = PolySorting.flattenpath(dtrans, cosangdot, ftol); 

    // maybe keep as segment objects, not in xtransseq arrays
    for (var j = 0; j < pts.length; j++) {
        penseq.xtransseq.push(pts[j][0])
        penseq.ytransseq.push(pts[j][1])
    }        
}

function GetPolygonForIntersecting(svgprocess, pgi, pathgrouping, tstr, ftol) 
{
    var res = [ ]; 
    for (var i = 1; i < pathgrouping.length-1; i++) { // skip boundingbox=0 and etching=-1 
        var polygon = [ ]; 
        for (var k = 0; k < pathgrouping[i].length; k++) {
            var rres = { ptype:(i == 1 ? "cutouter" : "cutinner"), tstr:tstr, fadivid:svgprocess.fadivid, pgi:pgi, contnum:i, pgik:k }; 
            var jr = pathgrouping[i][k]/2|0; 
            rres["reversed"] = ((pathgrouping[i][k]%2) == 0); 
            rres["rspnum"] = svgprocess.rlistb[jr].spnum; 
            rres["absolutescale"] = svgprocess.currentabsolutescale; 
            rres["cmatrix"] = svgprocess.rlistb[jr].cmatrix; 
            rres["dmi"] = svgprocess.rlistb[jr].dmi; 
            if (svgprocess.rlistb[jr].MX0 !== undefined) {
                rres["MX0"] = svgprocess.rlistb[jr].MX0; 
                rres["MY0"] = svgprocess.rlistb[jr].MY0; 
            }
            PenCutSeqToPoints(rres, ftol); 
            var pn = rres.xtransseq.length; 
            for (var j = 0; j < pn; j++) {
                var jr = (rres.reversed ? pn - 1 - j : j); 
                polygon.push([rres.xtransseq[jr], rres.ytransseq[jr]]); 
            }
        }
        res.push(polygon); 
    }
    return res; 
}



var Dpens = null; 

function pencutordercompare(a, b)   // see GetPathsPensSequences for codes
{
    // all penmarks to happen first
    if (a.ptype == "etch") {
        if (b.ptype != "etch")
            return -1; 
        return (a.xtransseq[0] - b.xtransseq[0]); 
    } else if (b.ptype == "etch")
        return 1; 
    
    // then by each file
    if (a.fadivid != b.fadivid) 
        return (a.fadivid < b.fadivid ? -1 : 1); 
        
    // then by each object
    if (a.pgi != b.pgi)
        return (a.pgi - b.pgi);

    // cut inner types first
    if (a.ptype != b.ptype)
        return (a.ptype == "cutinner" ? -1 : 1); 
    
    // then in order of contours (only applies to inner contours, of which there can be several)
    if (a.contnum != b.contnum)
        return (a.contnum - b.contnum);

    // then sequentially along the contour
    return (a.pgik - b.pgik);
}


var PenCutAnimation = function(svgstockprocess, pencutseqs) 
{
    this.pencutanimtimeout = null; 
    this.svgstockprocess = svgstockprocess; 
    this.pencutseqs = pencutseqs; 
    this.elstockprocess = document.getElementById(svgstockprocess.fadivid); 
    this.elseqindex = this.elstockprocess.getElementsByClassName("pencutseqindex")[0]; 
    this.seqindex = parseInt(this.elseqindex.value); 
    if (this.seqindex >= this.pencutseqs.length)
        this.seqindex = 0; 
    this.seqseqindex = -1; 
    this.pencutanimtimeout = null; 
    this.svgstockprocess.rjspath = paper1.path("M0,0").attr({stroke:"red", "stroke-width":gcutstrokewidth}); 
    svgstockprocess.rjsnode = paper1.circle(0, 0, 0).attr({fill:"blue", "stroke":"none", "fill-opacity":0.5}); 
    this.rjspath = paper1.path("M0,0").attr({stroke:"red", "stroke-width":gcutstrokewidth}); 
    this.rjslinelink = paper1.path("M0,0").attr({stroke:"yellow", "stroke-width":gcutstrokewidth}); 
    this.rjslinecurr = paper1.path("M0,0").attr({stroke:"cyan", "stroke-width":gcutstrokewidth}); 
    this.rjsnode = paper1.circle(0, 0, gcutstrokewidth*2+20).attr({fill:"blue", "stroke":"none", "fill-opacity":0.5}); 
    this.elstockprocess.getElementsByClassName("pencutseqcount")[0].textContent = this.pencutseqs.length; 
    this.prevx = null; 
    this.prevy = null; 
    this.advancetime = 500; 
}

PenCutAnimation.prototype.pauseAnimation = function() 
{
    if (this.pencutanimtimeout != null)  { 
        clearTimeout(this.pencutanimtimeout); 
        this.pencutanimtimeout = null; 
    }
}

PenCutAnimation.prototype.clearAnimation = function() 
{
    this.pauseAnimation(); 
    this.rjspath.remove(); 
    this.rjsnode.remove(); 
    this.rjslinecurr.remove(); 
    this.rjslinelink.remove(); 
}


PenCutAnimation.prototype.advancenodeD = function() 
{
    var pencutseq = this.pencutseqs[this.seqindex]; 
    this.seqseqindex++; 
    if ((this.seqseqindex == 0) || (this.seqseqindex >= pencutseq.xtransseq.length)) {
        if (this.seqseqindex !== 0)
            this.seqindex++; 
        this.elseqindex.value = this.seqindex; 
        if (this.seqindex == this.pencutseqs.length)
            return false; // no callback
        pencutseq = this.pencutseqs[this.seqindex]; 
        var dseq = [ ]; 
        
        for (var j = 0; j < pencutseq.xtransseq.length; j++) {
            var jr = (pencutseq.reversed ? pencutseq.xtransseq.length - 1 - j : j); 
            dseq.push("L", pencutseq.xtransseq[jr], pencutseq.ytransseq[jr]); 
        }
        dseq[0] = "M"; 
        this.rjspath.attr("path", dseq); 
        this.seqseqindex = 0; 
    }
    
    var ir = (pencutseq.reversed ? pencutseq.xtransseq.length - 1 - this.seqseqindex : this.seqseqindex); 
    var px = pencutseq.xtransseq[ir]; 
    var py = pencutseq.ytransseq[ir]; 
    this.rjsnode.attr({cx:px, cy:py}); 
    if (this.prevx !== null) { 
        var d = ["M", this.prevx, this.prevy, "L", px, py]; 
        this.rjslinecurr.attr("path", d); 
        if (this.seqseqindex === 0) 
            this.rjslinelink.attr("path", d); 
    }
    this.prevx = px; 
    this.prevy = py; 
    return true; 
}


PenCutAnimation.prototype.advancenodeLooper = function() 
{
    this.pencutanimtimeout = null; 
    if (this.advancenodeD())
        this.pencutanimtimeout = setTimeout(this.advancenodeLooper.bind(this), this.advancetime); 
    else
        this.elstockprocess.getElementsByClassName("pencutseqanimate")[0].classList.remove("selected"); 
}


var pencutanimation_one = null; 
var Dsvgstockprocess = null; 
function pencutseqanimate(svgstockprocess)
{
Dsvgstockprocess = svgstockprocess; 
    if (!svgstockprocess.Dpencutseqs)
        return; 
    var elfadiv = document.getElementById(svgstockprocess.fadivid); 
    var elanimbutt = elfadiv.getElementsByClassName("pencutseqanimate")[0]; 
    elanimbutt.classList.toggle("selected"); 
    
    if (elanimbutt.classList.contains("selected")) {
        if (Dpens !== null)
            Dpens.remove(); 
        Dpens = null; 

        if (pencutanimation_one !== null)
            pencutanimation_one.clearAnimation(); 
        pencutanimation_one = new PenCutAnimation(svgstockprocess, svgstockprocess.Dpencutseqs); 
        pencutanimation_one.advancenodeLooper();   // gets it into the timeout loop
    } else {
        if (pencutanimation_one !== null)
            pencutanimation_one.pauseAnimation(); 
    }
}

function plotpencutseqadvance(svgstockprocess, iadvance)
{
Dsvgstockprocess = svgstockprocess; 
    if (!svgstockprocess.Dpencutseqs)
        return; 
    if (pencutanimation_one !== null) {
        pencutanimation_one.pauseAnimation(); 
        pencutanimation_one.elstockprocess.getElementsByClassName("pencutseqanimate")[0].classList.remove("selected"); 
        if (iadvance == 1) {
            pencutanimation_one.advancenodeD(); 
        } else {
            pencutanimation_one.seqindex--; 
            pencutanimation_one.seqseqindex = -1; 
            this.prevx = null; 
            pencutanimation_one.advancenodeD(); 
        }
    }
}
// maybe these should be members of svgprocess (when process is a stock)
function plotpencutseq(svgstockprocess, iadvance)
{
    if (pencutanimation_one !== null)
        pencutanimation_one.pencutseqclearanimate(); 
    var elstockprocess = document.getElementById(svgstockprocess.fadivid); 
    var elseqindex = elstockprocess.getElementsByClassName("pencutseqindex")[0]; 
    console.log(elseqindex); 
    var i = parseInt(elseqindex.value) + iadvance; 
    elseqindex.value = i; 
    
    var pencutseq = svgstockprocess.Dpencutseqs[i]; 
    var dseq = [ ]; 
    for (var j = 0; j < pencutseq.xtransseq.length; j++) 
        dseq.push("L", pencutseq.xtransseq[j], pencutseq.ytransseq[j]); 
    dseq[0] = "M"; 

    svgstockprocess.rjspath.attr("path", dseq); 
}


var Doverlaps = [ ]; 
function genpathonstockoverlapsTest(fadivid) 
{
    var svgstockprocess = svgprocesses[fadivid]; 
    console.assert(svgstockprocess.bstockdefinitiontype); 
    var stockbbox = svgstockprocess.Lgrouppaths[0][0].getBBox(); 
    svgstockprocess.textvalues = rereadstockdefparamsfromlayerparamslist(svgstockprocess); 

    var allprocessgroupings = GetAllProcessGroupings(); // [ {fadivid:fadivid, j:j, bbox:bbox } ]
    
    // sort through which ones are inside the stock
    var processgroupings = [ ]
    for (var i = 0; i < allprocessgroupings.length; i++) {
        var svgprocess = svgprocesses[allprocessgroupings[i].fadivid]; 
        var gj = allprocessgroupings[i].j; 
        var gjbbox = allprocessgroupings[i].bbox; 
        if (Raphael.isPointInsideBBox(stockbbox, gjbbox.x, gjbbox.y) && Raphael.isPointInsideBBox(stockbbox, gjbbox.x2, gjbbox.y) && Raphael.isPointInsideBBox(stockbbox, gjbbox.x, gjbbox.y2) && Raphael.isPointInsideBBox(stockbbox, gjbbox.x2, gjbbox.y2)) {
            processgroupings.push(allprocessgroupings[i]); 
        }
    }
    
    var ftol = parseFloat(paramvaluedefault(svgstockprocess.textvalues, "curvetolerance", "0.5")); 
    
    // sort through and make the path sequences for each processgrouping
    for (var i = 0; i < processgroupings.length; i++) {
        var svgprocess = svgprocesses[processgroupings[i].fadivid]; 
        var gj = processgroupings[i].j; 
        processgroupings[i]["multipolygon"] = GetPolygonForIntersecting(svgprocess, gj, svgprocess.pathgroupings[gj], svgprocess.pathgroupingtstrs[gj].tstr, ftol); 
    }
    
    while (Doverlaps.length != 0)
        Doverlaps.pop().remove(); 

    console.log(processgroupings); 
    for (var i = 0; i < processgroupings.length; i++) {
        for (var j = i+1; j < processgroupings.length; j++) {
            var polyintersect = martinez.intersection(processgroupings[i].multipolygon, processgroupings[j].multipolygon); 
            console.log(i, j, polyintersect); 
            if (polyintersect !== null) {
                var dseq = [ ]; 
                for (var p = 0; p < polyintersect.length; p++) {
                    for (var m = 0; m < polyintersect[p].length; m++) {
                        for (var k = 0; k < polyintersect[p][m].length; k++) {
                            dseq.push((k == 0 ? "M" : "L"), polyintersect[p][m][k][0], polyintersect[p][m][k][1]); 
                        }
                    }
                }
                console.log(dseq); 
                Doverlaps.push(paper1.path(dseq).attr({"stroke-width":gcutstrokewidth*3, "stroke":"red"})); 
            }
        }
    }
    

}


var Dpencutseqs = null; 
var Detchseqslen = -1; 
var Drlends; 
var Drlidat; 
var Djdopseqs; 

function genpathorderonstock(fadivid) 
{

    var svgstockprocess = svgprocesses[fadivid]; 
    console.assert(svgstockprocess.bstockdefinitiontype); 
    var stockbbox = svgstockprocess.Lgrouppaths[0][0].getBBox(); 
    svgstockprocess.textvalues = rereadstockdefparamsfromlayerparamslist(svgstockprocess); 

    var groupsoverlayingstock = GetGroupsoverlayingstock(stockbbox); 
   
    // collect all the penciled edges into the su
    var pencutseqs = [ ]; 
    for (var i = 0; i < groupsoverlayingstock.length; i++) {
        var svgprocess = svgprocesses[groupsoverlayingstock[i].fadivid]; 
        var gj = groupsoverlayingstock[i].j; 
        var pencutseq = GetPathsPensSequences(svgprocess, gj, svgprocess.pathgroupings[gj], svgprocess.pathgroupingtstrs[gj].tstr); 
    }
    
    var ftol = parseFloat(paramvaluedefault(svgstockprocess.textvalues, "curvetolerance", "0.5")); 
    
    // make the point sequences for each path and do all etches from left to right
    for (var i = 0; i < pencutseqs.length; i++) {
        PenCutSeqToPoints(pencutseqs[i], ftol);
        if (pencutseqs[i].ptype == "etch")
            pencutseqs[i].reversed = (pencutseqs[i].xtransseq[0] > pencutseqs[i].xtransseq[pencutseqs[i].xtransseq.length - 1]); 
    }

    console.log("pencutseqs", pencutseqs); 
    pencutseqs.sort(pencutordercompare); 
    console.log("pencutseqsordered", pencutseqs); 

// sequencing the etch pens to be in sensible order
    var etchseqslen = 0; 
    for (  ; etchseqslen < pencutseqs.length; etchseqslen++) {
        if (pencutseqs[etchseqslen].ptype != "etch") 
            break; 
    }
    
Dpencutseqs = pencutseqs; 
Detchseqslen = etchseqslen; 
var closedist = 0.32; // distance we can join across
    var rlends = PolySorting.FPSrlendsPC(pencutseqs, etchseqslen); 
    var rlidat = PolySorting.FPSrlidat(rlends, etchseqslen, closedist);  
Drlends = rlends; 
Drlidat = rlidat; 
    var jdopseqs = PolySorting.FPSjdOpenseqsbetweenjcts(rlidat, etchseqslen); 
Djdopseqs = jdopseqs.slice(); 

// sod it; just do by closest
var GetXY = function(pencutseq, jdopseq, bfront) {
    var jd = (bfront ? jdopseq[0] : jdopseq[jdopseq.length-1]); 
    var i = jd/2|0; 
    var bfore = (((jd%2)==0)==bfront); 
    var j = (bfore ? pencutseqs[i].xtransseq.length - 1 : 0); 
    return [ pencutseqs[i].xtransseq[j], pencutseqs[i].ytransseq[j] ]; 
}
var FPSclosest = function(pencutseqs, jdopseqs, x0, y0) {
    var dist = -1; 
    var ijd; 
    var idjbfront; 
    for (var i = 0; i < jdopseqs.length; i++) {
        var p0 = GetXY(pencutseqs, jdopseqs[i], true); 
        var ldist0 = Math.hypot(p0[0]-x0, p0[1]-y0); 
        var p1 = GetXY(pencutseqs, jdopseqs[i], false); 
        var ldist1 = Math.hypot(p1[0]-x0, p1[1]-y0); 
        if ((dist == -1) || (ldist0 < dist)) {
            ijd = i; 
            idjbfront = true; 
            dist = ldist0; 
        }
        if ((dist == -1) || (ldist1 < dist)) {
            ijd = i; 
            idjbfront = false; 
            dist = ldist1; 
        }
    }
    return [ijd, idjbfront, dist]; 
}

var Njdopseqs = (jdopseqs.length != 0 ? [ jdopseqs.pop() ] : [ ]); 
while (jdopseqs.length != 0) {
    var n = Njdopseqs.length; 
    var pp0 = GetXY(pencutseq, Njdopseqs[n-1], false); 
    var igdl = FPSclosest(pencutseqs, jdopseqs, pp0[0], pp0[1]); 
    Njdopseqs.push(jdopseqs.splice(igdl[0], 1)[0]); 
    if (igdl[1]) {
        Njdopseqs[n].reverse(); 
        for (var k = 0; k < Njdopseqs[n].length; k++)
            Njdopseqs[n][k] += ((Njdopseqs[n][k]%2)==0 ? 1 : -1); // reverse direction of each by exchanging odd for even
    }
}
console.log(Njdopseqs); // reorder the the pencuts from the index lookup
PolySorting.FPScopybackreorderingPC(pencutseqs, etchseqslen, Njdopseqs); 

 
    // all in one seqence go now
    var dseq = [ ]; 
    for (var i = 0; i < pencutseqs.length; i++) {
        var pencutseq = pencutseqs[i]; 
        var pn = pencutseq.xtransseq.length; 
        for (var j = 0; j < pencutseqs[i].xtransseq.length; j++) {
            var jr = (pencutseq.reversed ? pn - 1 - j : j); 
            dseq.push("L", pencutseq.xtransseq[jr], pencutseq.ytransseq[jr]); 
        }
    }
    if (dseq.length != 0)
        dseq[0] = "M"; 

if (Dpens !== null)
    Dpens.remove(); 
Dpens = paper1.path(dseq).attr("stroke-width", gcutstrokewidth); 

    svgstockprocess.Dpencutseqs = pencutseqs; 
Dsvgstockprocess = svgstockprocess; 

    var elfadiv = document.getElementById(fadivid); 
    elfadiv.getElementsByClassName("pencutseqcount")[0].textContent = pencutseqs.length; 

	var lc; 
    if (paramvaluedefault(svgstockprocess.textvalues, "PenCutSeqsTo", "") == "KinetiC")
		lc = PenCutSeqsToKineticCode(pencutseqs, stockbbox, svgstockprocess.textvalues); 
	else
		lc = PenCutSeqsToPltCode(pencutseqs, stockbbox, svgstockprocess.textvalues); 

    var lfilename = paramvaluedefault(svgstockprocess.textvalues, "defaultfilename", "default.nc"); 
    AutoDownloadBlob(lc, lfilename); 
}




var gdrawstrokewidth = 1.0; 
var gcutstrokewidth = 0.8; 
function scalestrokewidths(fss)
{
    gdrawstrokewidth *= fss; 
    gcutstrokewidth *= fss; 
    var fadivids = Object.keys(svgprocesses); 
    for (var i = 0; i < fadivids.length; i++) 
        svgprocesses[fadivids[i]].scalestrokewidth(gdrawstrokewidth, gcutstrokewidth); 
}


// called when a return happens in the scale input
function rescalefileabs(elfadiv)
{
    var newabsolutescale = parseFloat(elfadiv.getElementsByClassName("tfscale")[0].value); 
    var svgprocess = svgprocesses[elfadiv.id]; 
    var relativescale = newabsolutescale/svgprocess.currentabsolutescale; // abs on yscale means -1 will reflect
    var rlistb = svgprocess.rlistb; 
    
    // rescaling the input values 
    for (var i = 0; i < rlistb.length; i++) {
        rlistb[i].path.attr("path", Raphael.mapPath(rlistb[i].path.attr("path"), Raphael.matrix(relativescale, 0, 0, Math.abs(relativescale), 0, 0))); 
    }
    
    // rescaling the groups can move them around because each is done to its centre
    for (var i = 0; i < svgprocess.Lgrouppaths.length; i++)
        svgprocess.Lgrouppaths[i][0].attr("path", Raphael.mapPath(svgprocess.Lgrouppaths[i][0].attr("path"), Raphael.matrix(relativescale, 0, 0, Math.abs(relativescale), 0, 0))); 
    svgprocess.currentabsolutescale = newabsolutescale; 
}



function exportThingPositions()
{
    // build up a list of thing positions for each file included
    var res = { "datecreated":new Date().toISOString() }; 
    res["svgprocesses"] = [ ]; 
    var svgprocesseskeys = Object.keys(svgprocesses); 
    for (var i = 0; i < svgprocesseskeys.length; i++) {
        var svgprocess = svgprocesses[svgprocesseskeys[i]]; 
        res["svgprocesses"].push(svgprocess.jsonThingsPositions()); 
    }
    AutoDownloadBlob([JSON.stringify(res, null, 2)], "thingpositions.json"); 
}
