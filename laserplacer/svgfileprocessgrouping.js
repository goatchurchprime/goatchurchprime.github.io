


function getspnumCSP(fadivid, layerselectindextype)
{
    var elfadiv = document.getElementById(fadivid); 
    var ellayerclasslist = elfadiv.getElementsByClassName("layerclasslist");
    if (ellayerclasslist.length == 0)
        return null; 
    var spnumCSP = { "layerselectindextype":layerselectindextype, "cutpaths": [ ], "slotpaths": [ ], "penpaths": [ ] }; 
    var elspnumids = ellayerclasslist[0].getElementsByTagName("li"); 
    for (var i = 0; i < elspnumids.length; i++) {
        console.assert(parseInt(elspnumids[i].id.match(/\d+$/g)[0]) == i); // _sspnum(\d+) 
        var wd3sel = elspnumids[i].getElementsByClassName("wingding3stoggle"); 
        var bvisible = (wd3sel[0].textContent == wingdingtriplesymbolsU[1]); 
        var bcuttype = (wd3sel[1].textContent == wingdingtriplesymbolsU[2]); 
        var bslottype = (wd3sel[2].textContent == wingdingtriplesymbolsU[4]); 
        if (bvisible) {
            if (bcuttype && bslottype)
                spnumCSP["slotpaths"].push(i); 
            else if (bcuttype)
                spnumCSP["cutpaths"].push(i); 
            else
                spnumCSP["penpaths"].push(i); 
        }
    }
    return spnumCSP; 
}

function setspnumCSP(fadivid, spnumCSP)
{
    console.log("setspnumCSP", spnumCSP); 
    var elfadiv = document.getElementById(fadivid); 
    //console.assert(spnumCSP.layerselectvalue == elfadiv.getElementsByClassName("dropdownlayerselection")[0].value); 
    var elspnumids = elfadiv.getElementsByClassName("layerclasslist")[0].getElementsByTagName("li"); 
    for (var i = 0; i < elspnumids.length; i++) {
        var wd3sel = elspnumids[i].getElementsByClassName("wingding3stoggle"); 
        wd3sel[0].textContent = wingdingtriplesymbolsU[0]; // set all not visible
    }
    for (var i = 0; i < spnumCSP.cutpaths.length; i++) {
        var wd3sel = elspnumids[spnumCSP.cutpaths[i]].getElementsByClassName("wingding3stoggle"); 
        wd3sel[0].textContent = wingdingtriplesymbolsU[1]; // visible
        wd3sel[1].textContent = wingdingtriplesymbolsU[2]; // cut
        wd3sel[2].textContent = wingdingtriplesymbolsU[5]; // not slot
    }
    for (var i = 0; i < spnumCSP.slotpaths.length; i++) {
        var wd3sel = elspnumids[spnumCSP.slotpaths[i]].getElementsByClassName("wingding3stoggle"); 
        wd3sel[0].textContent = wingdingtriplesymbolsU[1]; // visible
        wd3sel[1].textContent = wingdingtriplesymbolsU[2]; // cut
        wd3sel[2].textContent = wingdingtriplesymbolsU[4]; // slot
    }
    for (var i = 0; i < spnumCSP.penpaths.length; i++) {
        var wd3sel = elspnumids[spnumCSP.penpaths[i]].getElementsByClassName("wingding3stoggle"); 
        wd3sel[0].textContent = wingdingtriplesymbolsU[1]; // visible
        wd3sel[1].textContent = wingdingtriplesymbolsU[3]; // pen
        wd3sel[2].textContent = wingdingtriplesymbolsU[5]; // not slot
    }
}


var wingdingtriplesymbols = [ "&#9898;",  // open circle (visible)
                              "&#9899;",  // filled circle (hidden) 
                              "&#x2700;", // scissors
                              "&#x270E;", // pencil
                              "&#x2701;", // blade scissors (slot)
                              "&#x2B20;" ]; // pentagon (not slot)
// have to handle the fact that the symbols get converted (quick hack to avoid having non-ascii things in this file)
var wingdingtriplesymbolsU = [ ]; 
for (var i = 0; i < wingdingtriplesymbols.length; i++) {
    var tmp = document.createElement("span"); 
    tmp.innerHTML = wingdingtriplesymbols[i]; 
    wingdingtriplesymbolsU.push(tmp.textContent); 
}

function UpdateWingDingVisibility(spnumid) 
{
    console.log("UpdateWingDingVisibility", spnumid); 
    var spnum = parseInt(spnumid.match(/\d+$/g)[0]); 
    var fadivid = spnumid.match(/^[^_]+/g)[0]; 
    var svgprocess = svgprocesses[fadivid]; 
    var wd3sel = document.getElementById(spnumid).getElementsByClassName("wingding3stoggle"); 
    var bvisible = (wd3sel[0].textContent == wingdingtriplesymbolsU[1]); 
    var bcuttype = (wd3sel[1].textContent == wingdingtriplesymbolsU[2]); 
    var bslottype = (wd3sel[2].textContent == wingdingtriplesymbolsU[4]); 
    console.log(fadivid, spnum, bvisible, bcuttype, bslottype); 
    var rlistb = svgprocess.rlistb; 
    for (var i = 0; i < rlistb.length; i++) {
        if (rlistb[i].spnum === spnum) {
            if (bvisible) {
                rlistb[i].path.show(); 
                rlistb[i].path.attr("stroke-dasharray", (bcuttype ? "" : "-")); 
                rlistb[i].path.attr("stroke", (bslottype ? "#F90" : rlistb[i].col)); 
            } else {
                rlistb[i].path.hide(); 
            }
        }
    }
}

function wingding3stogglesclick()
{
    var wdi = wingdingtriplesymbolsU.indexOf(this.textContent); 
    this.textContent = wingdingtriplesymbolsU[wdi + ((wdi%2)==0 ? 1 : -1)]; 
    UpdateWingDingVisibility(this.parentElement.id); 
}


// this is attached to the select class=dropdownlayerselection object and puts stuff into the layerclasslist
// It is also used to invoke delete, makegroupings and generate paths
function makelayers(lthis) 
{
    var elfadiv = document.getElementById(lthis.fadivid); 
    var layerselectvalue = elfadiv.getElementsByClassName("dropdownlayerselection")[0].value; 
    var layerclassdiv = elfadiv.getElementsByClassName("layerclasslist")[0]; 
console.log("makelayers", layerselectvalue); 
    if (layerselectvalue == "collapse") {
        layerclassdiv.style.display = "none";
        if (lthis.layerselectindextype !== null)
            lthis.spnumCSP = getspnumCSP(lthis.fadivid, lthis.layerselectindextype);  // back up the spnumCSP
        return; 
    }
    if (layerselectvalue == "makegroup") {
        layerclassdiv.style.display = "none";
        lthis.spnumCSP = getspnumCSP(lthis.fadivid, lthis.layerselectindextype);  // back up the spnumCSP
        groupingprocess(lthis);
        return; 
    }
    if (layerselectvalue == "deleteprocess") {
        alert("About to delete process"); 
        deletesvgprocess(lthis.fadivid);
        return; 
    }
    
    // layerselectindex = showcolourlist, ; 
    lthis.layerselectindextype = ({"showcolourlist":"color", "showclasslist":"class", "showcolourclasslist":"colclass"})[layerselectvalue]; 
    console.log(lthis.layerselectindextype); 
    console.assert(lthis.layerselectindextype !== undefined); 
    
    layerclassdiv.style.display = "block"; 
    layerclassdiv.innerHTML = "<ul></ul>"; 
    var layerclassul = layerclassdiv.getElementsByTagName("ul")[0]; 
    var rlistb = lthis.rlistb; 

    var splcnamematch = { }; 
    lthis.nspnumcols = 0; 
    
    for (var i = 0; i < rlistb.length; i++) {
        var splc = (layerselectvalue == "showcolourlist" ? rlistb[i].col : (layerselectvalue == "showclasslist" ? rlistb[i].layerclass : (rlistb[i].layerclass+" | "+rlistb[i].col))); 
        if (splcnamematch[splc] == undefined) {
            console.log(splc); 
            var spnumid = lthis.fadivid+"_sspnum"+lthis.nspnumcols; 
            var layerblock = ['<li id="'+spnumid+'">']; 
            layerblock.push('<div class="wingding3stoggle">'+wingdingtriplesymbols[1]+"</div>"); 
            layerblock.push('<div class="wingding3stoggle">'+wingdingtriplesymbols[2]+"</div>"); 
            layerblock.push('<div class="wingding3stoggle">'+wingdingtriplesymbols[5]+"</div>"); 
            
            layerblock.push('<div class="layerclasscol" style="background:'+rlistb[i].col+'"> </div>'); 
            layerblock.push('<div class="layerclassname"><span>'+splc+'</span></div>'); 
            layerblock.push("</li>"); 
            layerclassul.insertAdjacentHTML("beforeend", layerblock.join("")); 
            splcnamematch[splc] = lthis.nspnumcols++; 
        }
        rlistb[i].spnum = splcnamematch[splc]; // fill it in
    }
    console.assert(Object.keys(splcnamematch).length == lthis.nspnumcols); 

    // now apply any backed up spnumCSP
    if (lthis.spnumCSP === null) {
        lthis.spnumCSP = getspnumCSP(lthis.fadivid, lthis.layerselectindextype); 
        console.assert(lthis.spnumCSP.cutpaths.length == lthis.nspnumcols); 
    } else {
        console.log("jjkj", layerselectvalue, lthis.spnumCSP.layerselectindextype); 
        if (lthis.layerselectindextype === lthis.spnumCSP.layerselectindextype) 
            setspnumCSP(lthis.fadivid, lthis.spnumCSP); 
        lthis.spnumCSP = getspnumCSP(lthis.fadivid, lthis.layerselectindextype); 
        var elspnumids = elfadiv.getElementsByClassName("layerclasslist")[0].getElementsByTagName("li"); 
        for (var i = 0; i < elspnumids.length; i++) 
            UpdateWingDingVisibility(elspnumids[i].id); // we also need to reset the line types from whatever state it's in if it's been changed
    }

    // add the toggle feature onto each of these wingdingies
    var wingding3stoggles = layerclassul.getElementsByClassName("wingding3stoggle"); 
    for (var i = 0; i < wingding3stoggles.length; i++) 
        wingding3stoggles[i].onclick = wingding3stogglesclick; 
}

// For stockdef types this is attached to the select class=dropdownlayerselection object and puts stuff into the layerclasslist
// It is also used to invoke delete (and then GenPath)
function makestockdeflayers(lthis) 
{
    var elfadiv = document.getElementById(lthis.fadivid); 
    var layerselectvalue = elfadiv.getElementsByClassName("dropdownlayerselection")[0].value; 
    var layerclassdiv = elfadiv.getElementsByClassName("layerparamslist")[0]; 
console.log("makestockdeflayers", layerselectvalue); 
    if (layerselectvalue == "collapse") {
        lthis.textvalues = rereadstockdefparamsfromlayerparamslist(lthis); 
        layerclassdiv.style.display = "none";
        return; 
    }
    if (layerselectvalue == "deleteprocess") {
        alert("About to delete stock process"); 
        deletesvgprocess(lthis.fadivid);
        return; 
    }
    if (layerselectvalue == "testpathoverlaps") {
        genpathonstockoverlapsTest(lthis.fadivid); 
        return; 
    }

    if (layerselectvalue == "generatepath") {
        genpathorderonstock(lthis.fadivid); 
        return; 
    }
    
   
    // assert(layerselectvalue == "showparameters")
    layerclassdiv.style.display = "block"; 
    layerclassdiv.innerHTML = "<ul></ul>"; 
    var layerclassul = layerclassdiv.getElementsByTagName("ul")[0]; 
    
    for (var i = 0; i < lthis.textvalues.length; i++) {
        var layerblock; 
        var textvalueparam = lthis.textvalues[i]; 
        if (textvalueparam.length == 2) {
            layerblock = [ '<li class="valueparam">', '<div class="valueparamkey">', textvalueparam[0], '</div>', ":", 
                           '<input type="text" value="', textvalueparam[1], '"/>', '</li>' ]; 
        } else {
            layerblock = [ '<li class="textvalue">', lthis.textvalues[i], '</li>' ]; 
        }
        layerclassul.insertAdjacentHTML("beforeend", layerblock.join("")); 
    }
}

function rereadstockdefparamsfromlayerparamslist(lthis) 
{
    var elfadiv = document.getElementById(lthis.fadivid); 
    var layerclassdiv = elfadiv.getElementsByClassName("layerparamslist")[0]; 
    if (layerclassdiv.style.display == "none")
        return lthis.textvalues; 
    var layerclassul = layerclassdiv.getElementsByTagName("ul")[0]; 
    var layerclasslivalues = layerclassul.getElementsByTagName("li"); 
    var ltextvalues = [ ]; 
    for (var i = 0; i < layerclasslivalues.length; i++) {
        var li = layerclasslivalues[i]; 
        if (li.className == "valueparam") {
            ltextvalues.push([li.getElementsByClassName("valueparamkey")[0].textContent, li.getElementsByTagName("input")[0].value]); 
        } else if (li.className == "textvalue") {
            ltextvalues.push([li.textContent]); 
        }
    }
    return ltextvalues; 
}














function DcolourPathSubGrouping(rlistb, splist, pathpoly, strokecolour) 
{
    for (var ii = 0; ii < pathpoly.length; ii++) {
        var rp = rlistb[pathpoly[ii]/2|0]; 
        rp.path.attr("stroke", (strokecolour ? strokecolour : splist[rp.spnum].strokecolour)); 
    }
}


function CopyPathListOfColourList(rlistb, spnumarray)
{
    var dlist = [ ]; 
    var npathsc = 0; 
    for (var i = 0; i < rlistb.length; i++) {
        if ((spnumarray === null) || ((spnumarray.indexOf(rlistb[i].spnum) != -1) && (rlistb[i].path.getTotalLength() != 0)))
            dlist.push(rlistb[i].path.attr("path")); 
        else
            dlist.push(null); 
        npathsc++; 
    }
    return dlist; 
}


function MakeContourcurvesFromSequences(dlist, jdseqs) 
{
    var jdgeos = [ ]; 
    for (var i = 0; i < jdseqs.length; i++) {
        jdgeos.push(PolySorting.JDgeoseq(jdseqs[i], dlist)); // concatenated sequences of paths forming the boundaries
    }
    return jdgeos; 
}


// may need to be in callback type to spread the load and make the processstatus appear
var bgroupcoloursindividually = true; 
function ProcessToPathGroupings(res, rlistb, closedist, spnumCSP, fadivid, elprocessstatus)
{
    console.assert(res.length == 0); // should start as [ ]
    // form the closed path sequences per spnum
    var jdseqs = [ ];  // indexes dlist

    var spnumarrays = [ ]; 
    if (bgroupcoloursindividually) {
        for (var ispnum = 0; ispnum < spnumCSP.cutpaths.length; ispnum++) 
            spnumarrays.push([ spnumCSP.cutpaths[ispnum] ]); 
    } else {
        spnumarrays.push(spnumCSP.cutpaths); 
    }
    console.log(spnumarrays); 
    
    for (var i = 0; i < spnumarrays.length; i++) {
        elprocessstatus.textContent = "Gjoining_spnum="+spnumarrays[i].join(","); 
        var dlisti = CopyPathListOfColourList(rlistb, spnumarrays[i]); 
        var ljdseqs = PolySorting.FindClosedPathSequencesD(dlisti, closedist); 
        jdseqs = jdseqs.concat(ljdseqs); 
    }
    
    // jdseqs = [ [i1, i2, i3,...] sequence of dlist[ii/2|0], bfore=((ii%2)==1 ]

    // list of paths not included in any cycle
    elprocessstatus.textContent = "Ggetsingletlist"; 
    
    // var singletslist = PolySorting.GetSingletsList(jdseqs, rlistb.length); 
    var singletslist = GetSingletsListCSP(jdseqs, rlistb, spnumCSP); 
    
    // build the dlist without any holes parallel to rlistb to use for groupings
    elprocessstatus.textContent = "Gconcat_JDgeoseqs"; 
    var dlist = CopyPathListOfColourList(rlistb, null); 
    var jdgeos = MakeContourcurvesFromSequences(dlist, jdseqs); 

    // groups of jdsequences forming outercontour, islands, singlets 
    elprocessstatus.textContent = "GFindAreaGroupingsD"; 
    
    // initialized outside (so we can run in a callback)
    // var res = [ ];  // [ [ fadivid+"cb"+0, ...], [ fadivid+"cb"+1, ...], ..., 
    var cboundislands = PolySorting.FindAreaGroupingsD(jdgeos); 
    
    elprocessstatus.textContent = "Goriented_islands"; 
    for (var j = 0; j < cboundislands.length; j++) {
        var lres = [ fadivid+"cb"+j ]; 
        var cboundisland = cboundislands[j]; 
        for (var ci = 0; ci < cboundisland.length; ci++) {
            var i = cboundisland[ci]; 
            var jdgeo = jdgeos[i]; 
            var bfore = PolySorting.FindPathOrientation(jdgeo); 
            var jdseq = (((ci == 0) == bfore) ? jdseqs[i] : PolySorting.RevJDseq(jdseqs[i])); 
            lres.push(jdseq); 
        }
        lres.push([ ]); // the slot for the list of singlet paths
        res.push(lres); 
    }
    
    elprocessstatus.textContent = "Gsinglets_to_groupings"; 
    var unmatchedsinglets = [ ]; 
    for (var i = 0; i < singletslist.length; i++) {
        var ic = singletslist[i]; 
        var dpath = dlist[ic]; 
        var j = PolySorting.SingletsToGroupingsD(dpath, cboundislands, jdgeos); 
        if (j != -1) {
            res[j][res[j].length-1].push(ic); 
            rlistb[ic].path.attr("stroke-dasharray", ""); 
        }
        else
            unmatchedsinglets.push(ic); 
    }

    elprocessstatus.textContent = "GC"; 
    if (unmatchedsinglets.length != 0)
        res.push(["unmatchedsinglets", unmatchedsinglets ]); 
    console.log("unmatched", unmatchedsinglets); 
    console.log("pathgroupings", res); 
    return res; 
}




var closedistgrouping = 0.2; // should be a setting
function groupingprocess(svgprocess) 
{
    svgprocess.elprocessstatus.textContent = "Gstart"; 

    // action this way so as to get the working-green thing lit up so we know it's working
    setTimeout(function() {
        // pathgroupings are of indexes into rlistb specifying the linked boundaries and islands (*2+(bfore?1:0)), and engraving lines in the last list (not multiplied)
        svgprocess.pathgroupings = [ ];  // the res value
        ProcessToPathGroupings(svgprocess.pathgroupings, svgprocess.rlistb, closedistgrouping, svgprocess.spnumCSP, svgprocess.fadivid, svgprocess.elprocessstatus); 
        svgprocess.elprocessstatus.textContent = "GD"; 
        svgprocess.updateLgrouppaths(); 
        updateAvailableThingPositions(); 
    }, 1); 
}
