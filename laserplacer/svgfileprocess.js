

var Iprocesscount = 0; 
var SVGfileprocess = function(fname, fadivid, bstockdefinitiontype) 
{
    this.fname = fname; 
    this.fadivid = fadivid; 
    this.bstockdefinitiontype = bstockdefinitiontype; 
    //this.svgstate = "constructed";   // want to replace this with elprocessstatus
    this.bcancelIm = false; 
    //this.cutfillcolour = "#0a8"; 
    this.processcountnumber = Iprocesscount++; // used for positioning on drop
    this.currentabsolutescale = 1.0; 
    
    // after importing:
    this.rlistb = [ ];  // all the paths
    this.nspnumcols = 0; 
    this.spnumCSP = null; 
    this.layerselectindextype = null; // have to back this up as the select box gets reset
    
    this.pathgroupings = [ ]; // the actual primary data, returned from ProcessToPathGroupings()
    this.pathgroupingtstrs = [ ]; // the transform strings (which run in parallel to the pathgroupings) of type {tstr:""} so we can pass it in to functions by reference
    this.Lgrouppaths = [ ]; // used to hold the sets of paths we drag with (the 0th element is the area, which is not part of the geometry)

    this.elprocessstatus = document.getElementById(this.fadivid).getElementsByClassName("fprocessstatus")[0]; 
}

/*SVGfileprocess.prototype.setsvgstate = function(lsvgstate)
{
    console.log(lsvgstate); // give a place we can intercept for debugging
    this.svgstate = lsvgstate; 
}*/



// only to be called after loading (the positions can be looked up later)
SVGfileprocess.prototype.applyThingsPosition = function(thingpos)   // to be used by importThingPositions(lthingsposition) 
{
    if (!this.bstockdefinitiontype) {
        var elfadiv = document.getElementById(this.fadivid); 
        elfadiv.getElementsByClassName("tfscale")[0].value = thingpos.currentabsolutescale; 
        rescalefileabs(elfadiv); 
        
        this.spnumCSP = thingpos.spnumCSP; 
        var layerselectvalue = (thingpos.spnumCSP.layerselectindextype == "color" ? "showcolourlist" : (thingpos.spnumCSP.layerselectindextype == "class" ? "showclasslist" : "showcolourclasslist")); 
        elfadiv.getElementsByClassName("dropdownlayerselection")[0].value = layerselectvalue; 
        makelayers(this);  
    }
    
    // and now fill in the parallel list of transformations for each of the pathgroups
    for (var j = 0; j < thingpos.pathgroupingsinfo.length; j++) {
        if (this.pathgroupingtstrs.length <= j)
            this.pathgroupingtstrs.push({tstr:""}); 
        this.pathgroupingtstrs[j].tstr = thingpos.pathgroupingsinfo[j].tstr; 
    }
}

SVGfileprocess.prototype.scalestrokewidth = function(drawstrokewidth, cutstrokewidth)
{
console.log("strokewidths", this.fadivid, drawstrokewidth, cutstrokewidth); 
    for (var i = 0; i < this.Lgrouppaths.length; i++) {
        var pgroup = this.Lgrouppaths[i][0]; 
        for (var j = 0; j < this.Lgrouppaths[i].length; j++) {
            this.Lgrouppaths[i][j].attr("stroke-width", drawstrokewidth); 
        };
//        if (this.pathgroupings[i][0] != "boundrect")
            this.Lgrouppaths[i][0].attr("stroke-width", cutstrokewidth); 
    }
    if (this.rjspath !== undefined)
        this.rjspath.attr("stroke-width", cutstrokewidth); 
}

function converttomm(s) 
{
    var fac = 1.0; 
    if (s.match(/.*?(mm|\d\.)$/g))
        fac = 1.0; 
    else if (s.match(/.*?(in)$/g))
        fac = 25.4; 
    else if (s.match(/.*?(pt)$/g))
        fac = 25.4/72; 
    else
        console.log("viewBox missing units", s); 
    return parseFloat(s)*fac; // parses what it understands
}


// undo the scale by multiplying by 1/(Dsvgprocess.fsca)*90/25.4

SVGfileprocess.prototype.WorkOutPixelScale = function() 
{
    var qsvgtitletext = this.tsvg.querySelector("title"); 
    var svgtitletext = (qsvgtitletext !== null ? qsvgtitletext.textContent : ""); 
    this.btunnelxtype = (svgtitletext.match(/TunnelX/) != null); 
    if (this.btunnelxtype) 
        console.log("Detected TunnelX type"); 

    var sheight = this.tsvg.getAttribute("height"); 
    var swidth = this.tsvg.getAttribute("width"); 
    var viewBox = []; // (seemingly unable to lift the viewBox as an attribute, so get by regexp)
    this.txt.replace(/viewBox="(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s+(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s+(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s+(-?\d*\.?\d*(?:e[\-+]?\d+)?)/g, 
        function(a, x, y, w, h) { 
            viewBox.push(parseFloat(x), parseFloat(y), parseFloat(w), parseFloat(h)); 
    }); 

    console.log("facts: svg-width:" + swidth +"  svg-height:" + sheight + "  viewbox:"+viewBox); 
    this.fmmpixwidth = 1.0; 
    this.fmmpixheight = 1.0; 
    if ((viewBox.length != 0) && (sheight != undefined) && (swidth != undefined)) {
        var fmmheight = converttomm(sheight); 
        var fmmwidth = converttomm(swidth); 
        this.fmmpixwidth = viewBox[2]/fmmwidth; 
        this.fmmpixheight = viewBox[3]/fmmheight; 
        console.log("pixscaleX "+this.fmmpixwidth+"  pixscaleY "+this.fmmpixheight); 
    }
    // old pixel width of inkscape forcing, now it's 1mm to 1unit
    //var inkscapedefaultmmpix = 90/25.4; fsca = inkscapedefaultmmpix/this.fmmpixwidth
    this.fsca = 1.0/this.fmmpixwidth; 
}



// derived from GetSingletsList, which also sorts the non contour types into three categories of singlets
function GetSingletsListCSP(jdseqs, rlistb, spnumCSP)
{
    var singletslistNm = { }; 
    for (var i = 0; i < jdseqs.length; i++) {
        var jdseq = jdseqs[i]; 
        for (var j = 0; j < jdseq.length; j++) {
            singletslistNm[jdseq[j]/2|0] = 1; 
        }
    }
    
    var singletslist = [ ]; 
    for (var i = 0; i < rlistb.length; i++) {
        if (singletslistNm[i] === undefined) {
            if (spnumCSP.cutpaths.indexOf(rlistb[i].spnum) != -1)
                singletslist.push(i); 
            else if (spnumCSP.slotpaths.indexOf(rlistb[i].spnum) != -1)
                singletslist.push(i); 
            else if (spnumCSP.penpaths.indexOf(rlistb[i].spnum) != -1)
                singletslist.push(i); 
        }
    }
    return singletslist; 
}





// pgrouparea is the filled object that we click in, and lpaths are all the paths that should be dragged with it (including pgrouparea as first element)
SVGfileprocess.prototype.applygroupdrag = function(pgrouparea, lpaths, pathgroupingtstr) 
{
    console.assert(lpaths[0] === pgrouparea); 
console.log(pathgroupingtstr, pathgroupingtstr.tstr); 

        // closured values shared between the drag functions
    var blockedmode = false; 
    var brotatemode = false;  
    var brotatelocked15 = false; 
    var orgrotdeg = 0.0; // required to move the locking to the nearest 15
    
    var cx = 0, cy = 0; 
    var tstr = null; 
    var groupcolour = pgrouparea.attr("fill"); // original colour before coloured to highlight it is being dragged
    var elfadividphi = document.getElementById(pathgroupingtstr.fadividphi); 
    var eltfscale = (this.bstockdefinitiontype ? null : document.getElementById(this.fadivid).getElementsByClassName("tfscale")[0]); 
    
    pgrouparea.drag(
        function(dx, dy, x, y, e) { // drag
            if (tstr == null)
                return

            e.stopPropagation(); e.preventDefault(); 
            if (blockedmode)
                return; 
            else if (!brotatemode)
                tstr = "t"+(dx*paper1scale)+","+(dy*paper1scale)+pathgroupingtstr.tstr; 
            else if (brotatelocked15) 
                tstr = "r"+(-orgrotdeg + 15*Math.round((orgrotdeg+dx*0.34)/15))+","+cx+","+cy+pathgroupingtstr.tstr; 
            else
                tstr = "r"+(dx*0.34)+","+cx+","+cy+pathgroupingtstr.tstr; 
            tstr = pgrouparea.transform(tstr).transform(); // compose and extract the simplified transform
            for (var i = 1; i < lpaths.length; i++) 
                lpaths[i].transform(tstr); 
            elfadividphi.textContent = "t"+pgrouparea._.dx.toFixed()+","+pgrouparea._.dy.toFixed()+"r"+pgrouparea._.deg.toFixed(); 
        }, 
        function(x, y, e)  {  // mouse down
            if (e.button !== 0) {
                tstr = null; 
                return; 
            }
            
            tstr = pathgroupingtstr.tstr; 
            blockedmode = elfadividphi.classList.contains("locked"); 
            brotatelocked15 = document.getElementById("rotatelock15").classList.contains("selected"); 
            orgrotdeg = pgrouparea._.deg; 
            brotatemode = e.ctrlKey; 
            pathselected = pgrouparea; // this is only a remnant of the collision testing stuff
            //elfadividphi.classList.add("moving"); // doesn't work
            elfadividphi.selected = true; 
            
            groupcolour = pgrouparea.attr("fill"); 
            pgrouparea.attr("fill", "#fa0"); 
            if (brotatemode) {
                var bbox = pgrouparea.getBBox(); 
                cx = (bbox.x + bbox.x2)/2;  // this is where we could try rotate round point down
                cy = (bbox.y + bbox.y2)/2; 
            }
            e.stopPropagation(); e.preventDefault(); 
        },  
        function(e) {    // mouse up
            if (tstr == null)
                return
            e.stopPropagation(); e.preventDefault(); 
            if (!blockedmode)
                pathgroupingtstr.tstr = tstr;  
            elfadividphi.classList.remove("moving"); 
            pgrouparea.attr("fill", groupcolour); 
//            if (eltfscale !== null)
//                eltfscale.disabled = true; 
            tstr = null; 
        }
    ); 
}


SVGfileprocess.prototype.removeall = function() 
{
    for (var i = 0; i < this.Lgrouppaths.length; i++) {
        var pgroup = this.Lgrouppaths[i][0]; 
        pgroup.undrag(); 
        pgroup.remove(); 
        for (var j = 1; j < this.Lgrouppaths[i].length; j++) {
            this.Lgrouppaths[i][j].remove(); 
        };
    }
    this.Lgrouppaths = [ ]; 
}



var Dlengpaths; 

SVGfileprocess.prototype.ProcessPathsToBoundingRect = function()
{
    var groupall = [ ]; 
    for (var i = 0; i < this.rlistb.length; i++) 
        groupall.push(i); 
    this.pathgroupings = [ [ "boundrect", groupall ] ]; 
}





SVGfileprocess.prototype.updateLgrouppaths = function()
{
    // remove old groups if they exist (mapping across the transforms that were originally applied when dragging the boundingrect)
    //var tstr = (this.Lgrouppaths.length != 0 ? this.Lgrouppaths[0][0].transform() : "t0,0"); 
    for (var i = 0; i < this.Lgrouppaths.length; i++) {
        var pgroup = this.Lgrouppaths[i][0]; 
        pgroup.undrag(); 
        pgroup.remove(); 
        /*for (var j = 1; j < this.Lgrouppaths[i].length; j++) {
            var path = this.Lgrouppaths[i][j]; 
            if (path.matrix.toTransformString() != "") {
                path.attr("path", Raphael.mapPath(path.attr("path"), path.matrix)); 
                path.transform("t0,0"); 
            }
        };*/
    }

    // shift area to top left corner wherever it starts out landing
// we don't have the bounding box at this point
/*    if ((this.pathgroupings.length == 1) && (this.pathgroupings[0][0] == "boundrect")) {
        var basematrix = pgroup.matrix.toTransformString(); 
        var dx = -bbox.x + 30 + this.processcountnumber*10; 
        var dy = -bbox.y + 30 + this.processcountnumber*10; 
        var tstr = "t"+(dx*paper1scale)+","+(dy*paper1scale)+basematrix; 
console.log("moving boundrect needs fixing", tstr); 
        pgroup.transform(tstr);         
        for (var k = 0; k < lpaths.length; k++) {
            lpaths[k].transform(tstr); 
        }; 
    }
*/

    // empty the select dropdown list
    var eldpositions = document.getElementById(this.fadivid).getElementsByClassName("dposition")[0]; 
    while (eldpositions.firstChild)  
        eldpositions.removeChild(eldpositions.firstChild); 
    
    // this.Lgrouppaths is the parallel arrays of actual pathgroupings and containing area (the first element of each is the derived outline or box, and not in the list
    // this.grouptransforms = [ { transform:tstr, fadividphi:fadividpgi } ]
    
    // first copy out the path properties from the rlistb thing
    var dlist = [ ]; 
    for (var i = 0; i < this.rlistb.length; i++) 
        dlist.push(this.rlistb[i].path.attr("path")); 

    this.Lgrouppaths = [ ];  // [ [pgroup, path, path, path], [pgroup, path, ...], ... ]
    for (var k = 0; k < this.pathgroupings.length; k++) {
        var pathgrouping = this.pathgroupings[k]; 
        // [ "id", [outerpathlist], [innerpathlist1], [innerpathlist2], ..., [engpathlist(unorderedindexes)] ]
        
        // form the area object from the directed cut paths and the engraved paths (whose direction is not encoded)
        var dgroup = [ ]; // used to build pgroup
        for (var j = 1; j < pathgrouping.length - 1; j++) {
            if (pathgrouping[j].length != 0)
                dgroup = dgroup.concat(PolySorting.JDgeoseq(pathgrouping[j], dlist)); 
        }
        var engpaths = pathgrouping[pathgrouping.length - 1]; 
        var lengpaths = [ ]
        for (var i = 0; i < engpaths.length; i++)
            lengpaths = lengpaths.concat(dlist[engpaths[i]]); 
            
        var pgroup; // to become the bounding shape of the group 
        if ((pathgrouping[0] == "boundrect") || (pathgrouping[0] == "unmatchedsinglets")) {
            var bbox = Raphael.pathBBox(lengpaths); 
            pgroup = paper1.path("M"+bbox.x+","+bbox.y+"H"+bbox.x2+"V"+bbox.y2+"H"+bbox.x+"Z"); 
            pgroup.attr(pathgrouping[0] == "boundrect" ? areacolvals.boundrect : areacolvals.unmatchedsingletsrect); 
        } else {   // pathgrouping[0] is the id of this component
            pgroup = paper1.path(dgroup); 
            //if (this.btunnelxtype)
            //      var fillcolour = this.spnumlist[this.rlistb[pathgrouping[1][0]/2|0].spnum].fillcolour; 
            //      pgroup.attr({stroke:"black", "stroke-width": gcutstrokewidth, fill:fillcolour, "fill-opacity":"0.1", "stroke-linejoin":"round"}); 
            pgroup.attr(this.bstockdefinitiontype ? areacolvals.stockarea : areacolvals.groupedarea); 
            pgroup.attr("stroke-width", gcutstrokewidth); 
            pgroup[0].style["fillRule"] = "evenodd"; // hack value in as this cannot be implemented via Raphaeljs interface (till we get the orientations right)

            if (this.bstockdefinitiontype) 
                pgroup.toBack(); 
        }
        
        if (this.pathgroupingtstrs.length <= k) 
            this.pathgroupingtstrs.push({tstr:this.pathgroupingtstrs.length == 0 ? "t0,0" : this.pathgroupingtstrs[0].tstr}); 
        this.pathgroupingtstrs[k].fadividphi = this.fadivid+"k"+k; 

        var eldposition = document.getElementById(this.fadivid).getElementsByClassName("dposition")[0]; 
        
        // form the list of all paths belonging to this area object
        var lpaths = [ pgroup ];  // first element has to be the area object itself
        for (var j = 1; j < pathgrouping.length - 1; j++) {
            for (var i = 0; i < pathgrouping[j].length; i++) {
                lpaths.push(this.rlistb[pathgrouping[j][i]/2|0].path); 
            }
        }
        for (var i = 0; i < engpaths.length; i++)
            lpaths.push(this.rlistb[engpaths[i]].path); 
            
        var tstr = this.pathgroupingtstrs[k].tstr; 
console.log(tstr); 
        for (var i = 0; i < lpaths.length; i++)
            lpaths[i].transform(tstr); // use the transforms that were put there
            
        if (this.bstockdefinitiontype) {  // all need to get behind the overlay or the gcutlinewidth outline part gets confusing
            for (var i = 1; i < lpaths.length; i++)
                lpaths[i].toBack(); 
        }

        this.Lgrouppaths.push(lpaths); 

        // problem with select/option construct is you can have no decoration of the cells; only plain text
        eldpositions.insertAdjacentHTML("beforeend", '<option id="'+this.pathgroupingtstrs[k].fadividphi+'">'+"t"+pgroup._.dx.toFixed()+","+pgroup._.dy.toFixed()+"r"+pgroup._.deg.toFixed()+'</option>'); 
        document.getElementById(this.pathgroupingtstrs[k].fadividphi).onclick = function() { this.classList.toggle("locked"); }; 
        this.applygroupdrag(pgroup, lpaths, this.pathgroupingtstrs[k]); 
    }; 
}

