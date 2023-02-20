
// there is still some jquery dependency here

SVGfileprocess.prototype.LoadTunnelxDrawingDetails = function() 
{
    console.assert(this.btunnelxtype); 
    this.elprocessstatus.textContent = ("detailsloading"); 

    var imatrix = Raphael.matrix(this.fsca, 0, 0, this.fsca, 0, 0); 
    this.pback = {pos:-1, raphtranslist:[imatrix.toTransformString()], strokelist:[undefined], cmatrix:imatrix };
    this.pstack = [ ]; 
    this.cstack = [ this.tsvg ]; 
    importSVGpathRR(this); 
}


// this could still break into totally disconnected contours with islands that don't overlap
// (but that's for later when we are even trimming the symbols)
function ProcessToPathGroupingsTunnelX(rlistb, spnumlist)
{
    var subsetnamemaps = { }; 
    for (var i = 0; i < rlistb.length; i++) {
        var spnumobj = spnumlist[rlistb[i].spnum]; 
        if (spnumobj.linestyle == "subsetarea") {
            var subsetname = spnumobj.subsetname; 
            if (subsetnamemaps[subsetname] === undefined) 
                subsetnamemaps[subsetname] = [ subsetname ]; 
            subsetnamemaps[subsetname].push([i*2+1]); 
        }
    }

    var subsetnames = Object.keys(subsetnamemaps); 
    res = [ ]; 
    for (var i = 0; i < subsetnames.length; i++) {
        var lres = subsetnamemaps[subsetnames[i]]; 
        lres.push([]); // the list of engraving edges
        res.push(lres); 
    }

    // engraving edge groups
    for (var i = 0; i < rlistb.length; i++) {
        var spnumobj = spnumlist[rlistb[i].spnum]; 
        if (spnumobj.linestyle != "subsetarea") {
            var subsetname = spnumobj.subsetname; 
            if (subsetnamemaps[subsetname] !== undefined) 
                subsetnamemaps[subsetname][subsetnamemaps[subsetname].length-1].push(i); 
        }
    }

    console.log("resresX", res); 
    return res; 
}

// out of date regarding spnumcols
SVGfileprocess.prototype.spnummapGetCreate = function(cclass, mcs, strokecolour)
{
    // convert all to extended classes with these strokes in?
    if (this.spnummap[cclass] === undefined) {
        var fillcolour = Raphael.getColor(1.0); 
        var spnumobj = { spnum:this.spnumlist.length, strokecolour:strokecolour, fillcolour:fillcolour, subsetname:mcs.dsubsetname, linestyle:mcs.dlinestyle }; 
        var stitle = spnumobj.subsetname+"-"+spnumobj.linestyle; 
        this.spnummap[cclass] = spnumobj.spnum; 
        this.spnumlist.push(spnumobj); 
        if (spnumobj.linestyle == "Wall") {
            $('div#'+this.fadivid+' .spnumcols').append($('<span class="spnum'+spnumobj.spnum+'" title="'+stitle+'">'+('X')+'</span>').css("background", fillcolour||strokecolour)); 
            $('div#'+this.fadivid+' .spnumcols span.spnum'+spnumobj.spnum).click(function() {
                if ($(this).hasClass("selected")) 
                    $(this).removeClass("selected"); 
                else
                    $(this).addClass("selected"); 
            });
        }
    }
}


SVGfileprocess.prototype.processSingleSVGpathTunnelx = function(d, stroke, cc)
{
    var dtrans = Raphael.path2curve(d); 
    var cclass = cc.getAttribute("class"); 
    var mcs = this.mclassstyle[cclass]; 
    var dlinestyle = mcs.dlinestyle; 
    this.spnummapGetCreate(cclass, mcs, stroke); 
    if (this.elprocessstatus.textContent == "importsvgrareas") {  // was svgstate
        if (mcs.dlinestyle === undefined) {
            console.log(cclass); 
            return; 
        } else if (mcs.dlinestyle.match("subsetarea") == null) {
            return; 
        }
    } else if (this.svgstate == "detailsloading") {
        if (mcs.dlinestyle == undefined) 
            return; // this is due to a label arrow!
        if (mcs.dlinestyle.match("OSA|CCA|subsetarea") != null)
            return; 
    }
    
    // convert all to extended classes with these strokes in?
    var spnum = this.spnummap[cclass]; 
    var spnumobj = this.spnumlist[spnum]; 
    var strokecolour = spnumobj.strokecolour; 
    if (this.svgstate == "importsvgrareas") 
        strokecolour = spnumobj.fillcolour; 
    var bMsplits = (mcs.dlinestyle.match(/symb/) != null);  // symbols don't get broken up even if made of several disconnected strokes, please
    this.processSingleSVGpathFinal(dtrans, bMsplits, d, spnum, strokecolour, layerclass, null); 
}


// simplified of importSVGpathR
SVGfileprocess.prototype.importSVGpathRtunnelx = function() 
{
    while (this.cstack.length == this.pback.pos) 
        this.pback = this.pstack.pop(); 
    if (this.cstack.length == 0) 
        return false; 
    var cc = this.cstack.pop(); 
    var tag = cc.tag.toLowerCase(); 
    console.assert(cc.getAttribute("transform") === null); 

    if (tag == "clippath") {
        console.log("skip clippath"); // will deploy Raphael.pathIntersection(path1, path2) eventually
        // <clipPath id="cp1"> <path d="M497.7 285.2 Z"/></clipPath>
        // then clippath="url(#cp1)" in a path for a trimmed symbol type
    } else if (tag == "path") {
        var cclass = cc.getattr("class"); 
        var cstroke = this.mclassstyle[cclass]["stroke"]; 
        this.processSingleSVGpathTunnelx(cc.getAttribute("d"), cstroke, cc); 
    } else {
        this.pstack.push(this.pback); 
        this.pback = { pos:this.cstack.length }; 
        var cs = cc.children; 
        for (var i = cs.length - 1; i >= 0; i--) 
            this.cstack.push(cs[i]);   // in reverse order for the stack
    }
    this.elprocessstatus.textContent = ("T"+this.rlistb.length+"/"+this.cstack.length); 
    return true; 
}

SVGfileprocess.prototype.processdetailSVGtunnelx = function()
{
    var subsetnamemapsI = { }; 
    for (var i = 0; i < this.pathgroupings.length; i++) {
        subsetnamemapsI[this.pathgroupings[i][0]] = i; 
        console.assert(this.pathgroupings[i][this.pathgroupings[i].length-1].length == 0); 
    }
    
    var rlistb = this.rlistb; 
    var spnumlist = this.spnumlist; 
    // engraving edge groups
    for (var j = 0; j < rlistb.length; j++) {
        var spnumobj = spnumlist[rlistb[j].spnum]; 
        if (spnumobj.linestyle != "subsetarea") {
            var subsetname = spnumobj.subsetname; 
            var i = subsetnamemapsI[subsetname]; 
            if (i !== undefined) {
                this.pathgroupings[i][this.pathgroupings[i].length-1].push(j); 
                var pgroup = this.Lgrouppaths[i][0]; 
                rlistb[j].path.transform(pgroup.matrix.toTransformString()); 
                this.Lgrouppaths[i].push(rlistb[j].path); 
            }
        }
    }
    
    this.setsvgstate("done"+this.svgstate); 
}
