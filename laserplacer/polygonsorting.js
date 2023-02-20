
PolySorting = {

patheval: function(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) 
{
    var s = 1 - t; 
    var s2 = s*s, s3 = s2*s; 
    var t2 = t*t, t3 = t2*t; 
    
    var x = s3*p1x + s2*3*t*c1x + s*3*t2*c2x + t3*p2x; 
    var y = s3*p1y + s2*3*t*c1y + s*3*t2*c2y + t3*p2y; 

    var dx = 3*s2*(c1x - p1x) + 6*s*t*(c2x - c1x) + 3*t2*(p2x - c2x); 
    var dy = 3*s2*(c1y - p1y) + 6*s*t*(c2y - c1y) + 3*t2*(p2y - c2y); 
    var dleng = Math.sqrt(dx*dx + dy*dy)||1; 
    return { x:x, y:y, tx:dx/dleng, ty:dy/dleng, t:t }; 
}, 

epsilont: 0.01,
flattenpath: function(d, cosangdot, thinningtolerance) 
{
    console.assert(d[0][0] == "M"); 
    var p1x = d[0][1], p1y = d[0][2]; 
    var res = [ [p1x, p1y] ]; 
    for (var i = 1; i < d.length; i++) {
        if (d[i][0] != "C")  console.log(i, d); 
        console.assert(d[i][0] == "C"); 
        var c1x = d[i][1], c1y = d[i][2]; 
        var c2x = d[i][3], c2y = d[i][4]; 
        var p2x = d[i][5], p2y = d[i][6]; 
        var pevalstack = [ this.patheval(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, 1.0),  
                           this.patheval(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, 0.0) ]; 
        while (pevalstack.length >= 2) {
            var peval0 = pevalstack.pop(); 
            var peval1 = pevalstack[pevalstack.length - 1]; 
            var dottang = peval0.tx*peval1.tx + peval0.ty*peval1.ty; 
            if ((dottang < cosangdot) && (peval1.t - peval0.t >= this.epsilont)) {
                pevalstack.push(this.patheval(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, (peval0.t+peval1.t)/2)); 
                pevalstack.push(peval0); 
            } else {
                res.push([peval1.x, peval1.y]); 
            }
        }
        res.push([p2x, p2y]); 
        p1x = p2x;  p1y = p2y;  
    }
    
    var toli01 = function(pts, i0, i1) {
        var p0 = pts[i0]; 
        var p1 = pts[i1]; 
        var vx = p1[0] - p0[0]; 
        var vy = p1[1] - p0[1]; 
        var vlensq = vx*vx + vy*vy; 
        var vlen = Math.sqrt(vlensq); 
        var tol = 0.0; 
        for (var j = i0+1; j < i1; j++) {
            var p = pts[j]; 
            var vpx = p[0] - p0[0]; 
            var vpy = p[1] - p0[1]; 
            var ltol; 
            if (vlen != 0.0) {
                var lamk = vpx*vx + vpy*vy; 
                if (lamk < 0.0) {
                    ltol = Math.sqrt(vpx*vpx + vpy*vpy); 
                } else if (lamk > vlensq) {
                    var vpx1 = p[0] - p1[0]; 
                    var vpy1 = p[1] - p1[1]; 
                    ltol = Math.sqrt(vpx1*vpx1 + vpy1*vpy1); 
                } else {
                    ltol = Math.abs((vpx*vy - vpy*vx)/vlen); 
                }
            } else {
                ltol = Math.sqrt(vpx*vpx + vpy*vpy); 
            }
            if (ltol > tol)
                tol = ltol; 
        }
        return tol; 
    }
    
// we should look for sideways angle tolerance here too and not just thin this blindly
// do by selecting and diverging out again like the subdivision algorithm.    
    if (thinningtolerance != 0.0) {
        console.log("thinning to pixel tolerance", thinningtolerance); 
        var pts = res;
        var i0 = 0; 
        var res = [ pts[i0] ]; 
        var i1 = 1; 
        while (i1 < pts.length-1) {
            if (toli01(pts, i0, i1+1) > thinningtolerance) {
                res.push(pts[i1]); 
                i0 = i1; 
                i1++; 
            } else {
                i1++;
            }
        }
        res.push(pts[pts.length-1]); 
    }
    return res; 
}, 

FindPathOrientation: function(darea)
{
    var iL = 0; 
    for (var i = 1; i < darea.length; i++) {
        if (darea[i][darea[i].length - 2] < darea[iL][darea[iL].length - 2]) {
            iL = i; 
        }
    }
    var x = darea[iL][darea[iL].length - 2]; 
    var y = darea[iL][darea[iL].length - 1]; 
    var xf, yf, xb, yb; 
    var iF = iL + 1; 
    while (iF != iL) {
        if (iF == darea.length) {
            iF = 0; 
            if (iF == iL)
                break; 
        }
        xF = darea[iF][darea[iF].length - 2]; 
        yF = darea[iF][darea[iF].length - 1]; 
        if ((xF != x) || (yF != y))
            break; 
        iF++; 
    }
    var iB = iL - 1; 
    while (iB != iL) {
        if (iB == -1) {
            iB = darea.length - 1; 
            if (iB == iL)
                break; 
        }
        xB = darea[iB][darea[iB].length - 2]; 
        yB = darea[iB][darea[iB].length - 1]; 
        if ((xB != x) || (yB != y))
            break; 
        iB--; 
    }
        
    var vxF = xF - x;  
    var vyF = yF - y;  
    console.assert(vxF >= 0.0, vxF); 
    var diamondF = vyF / (Math.abs(vyF) + vxF); 
    var vxB = xB - x;  
    var vyB = yB - y;  
    console.assert(vxB >= 0.0, vxB); 
    var diamondB = vyB / (Math.abs(vyB) + vxB); 
    return diamondB <= diamondF; 
},


FPSrlendsPC: function(pencutseqs, etchseqslen) // etchseqslen is the pencuts at the front that are etch numbers
{
    var rlends = [ ]; // [ x, y, i, bfore, pathlength ]
    for (var i = 0; i < etchseqslen; i++) {
        var pencutseq = pencutseqs[i]; 
        var n = pencutseq.xtransseq.length; 
        
        var pathlength = 0; 
        for (var j = 1; j < n; j++)
            pathlength += Math.hypot(pencutseq.xtransseq[j]-pencutseq.xtransseq[j-1], pencutseq.ytransseq[j]-pencutseq.ytransseq[j-1]); 
            
        rlends.push([ pencutseq.xtransseq[0], pencutseq.ytransseq[0], i, false, pathlength ]); 
        rlends.push([ pencutseq.xtransseq[n-1], pencutseq.ytransseq[n-1], i, true, pathlength ]); 
    } 
    rlends.sort(); 
    return rlends; 
},

FPScopybackreorderingPC: function(pencutseqs, etchseqslen, jdopseqs)
{
    var etchpencutseqs = pencutseqs.slice(0, etchseqslen); 
    var ic = 0; 
    for (var j = 0; j < jdopseqs.length; j++) {
        for (var k = 0; k < jdopseqs[j].length; k++) {
            var i = jdopseqs[j][k]/2|0; 
            console.assert(etchpencutseqs[i] !== null); 
            console.assert(ic < etchseqslen); 
            pencutseqs[ic] = etchpencutseqs[i]; 
            pencutseqs[ic].reversed = ((jdopseqs[j][k]%2)==1); 
            etchpencutseqs[i] = null; 
            ic++; 
        }
    }
    console.assert(ic === etchseqslen); 
},


FPSrlends: function(dlist, dlistlen) 
{
    var rlends = [ ]; // [ x, y, i, bfore, pathlength ]  (could combine the into i*2+bfore for consistency)
    for (var i = 0; i < dlistlen; i++) {
        var pseq = dlist[i]; 
        if (pseq !== null) {
            var pathlength = Raphael.getTotalLength(pseq); 
            var seg0 = pseq[0]; 
            rlends.push([ seg0[1], seg0[2], i, false, pathlength ]); 
            var segE = pseq[pseq.length - 1]; 
            rlends.push([ segE[segE.length-2], segE[segE.length-1], i, true, pathlength ]); 
        }
    } 
    rlends.sort(); 
    return rlends; 
},

// this is the source of the doubling up index and then odd/even value to denote either which node (front 
// or back) of the edge, or the direction of the edge.  Recording as this way (rather than [index, bdirection] pairs) 
// means we have a good way to index into parallel table of other things, in the way that pairs cannot look things up, 
// even though this is a little less intuitive and clear. In C++ we would have done this as a struct with accessor functions
FPSrlidat: function(rlends, dlistlen, closedist) 
{
    var rlidat = [ ]; // index*2 + (front ? 1 : 0[back])
    for (var i = 0; i < dlistlen*2; i++) {
        rlidat.push([ ]); // each will be a list of cross connections [d, j]  (these are not pairs of 
    }
    
    var closedistSq = closedist*closedist; 
    for (var j = 0; j < rlends.length - 1; j++) {
        var rle = rlends[j]; 
        var xB = rle[0]; 
        var yB = rle[1]; 
        var jd = rle[2]*2 + (rle[3] ? 1 : 0);  // encoding the index as *2 + (forward ? 1 : 0)
        
        // loop through forwards (constrained by beyond the x-direction wider than closedist
        for (var j1 = j+1; ((j1 < rlends.length) && (rlends[j1][0] <= xB + closedist)); j1++) {
            var rle1 = rlends[j1]; 
            var dx = rle1[0] - xB;
            var dy = rle1[1] - yB; 
            var dCsq = dx*dx + dy*dy; 
            if ((dCsq <= closedistSq) && ((rle[2] != rle1[2]) || (rle[4] > closedist))) { /* avoid connecting short line segment back to self (unless long enough to be a loop) */
                var jd1 = rle1[2]*2 + (rle1[3] ? 1 : 0); 
                rlidat[jd].push([dCsq, jd1]); 
                rlidat[jd1].push([dCsq, jd]); 
            }
        }
    }

    // sort adjacencies at endpoints by distance
    for (var j = 0; j < rlidat.length; j++) {
        rlidat[j].sort(); 
    }
    return rlidat; 
},

disconnectJD1: function(rlidat, jd, jd1)  // disconnects the other end of any link we are deleting (usually by popping)
{
    var rlid1 = rlidat[jd1]; 
    //console.log("disconjd", jd, jd1, rlid1.slice()); 
    var d1i; 
    for (d1i = rlid1.length - 1; d1i >= 0; d1i--) {
        if (rlid1[d1i][1] == jd)
            break; 
    }
    for (++d1i ; d1i < rlid1.length; d1i++)
        rlid1[d1i-1] = rlid1[d1i]; 
    rlid1.pop(); 
}, 

// used for finding sequences
FPSjdOpenseqsbetweenjcts: function(rlidat, dlistlen)
{
    // extract closed sequences of paths that join up
    var jdopseqs = [ ];  
    
    // find all isolated sequences between other 3-way nodes or with no connections
    for (var i = 0; i < dlistlen; i++) {
        if ((rlidat[i*2].length != 1) && (rlidat[i*2+1].length != 1)) 
            jdopseqs.push([i*2]); 
    }

    // find sequences
    for (var i = 0; i < dlistlen; i++) {
        if ((rlidat[i*2].length == 1) || (rlidat[i*2+1].length == 1)) {
            var jd = i*2; 
            jdopseq = [ ]; 
            while (rlidat[jd].length == 1) {
                var jd1 = rlidat[jd].pop()[1];
                this.disconnectJD1(rlidat, jd, jd1); 
                jd = jd1 + ((jd1%2) == 1 ? -1 : 1); 
                jdopseq.push(jd); // the going backwards one as we will reverse this sequence
            }
            jdopseq.reverse(); 
            jdopseq.push(i*2); 
            jd = i*2 + 1; 
            while (rlidat[jd].length == 1) {
                var jd1 = rlidat[jd].pop()[1];
                jdopseq.push(jd1); // the going forwards half
                this.disconnectJD1(rlidat, jd, jd1); 
                jd = jd1 + ((jd1%2) == 1 ? -1 : 1); 
            }
            if (jdopseq[0] === jdopseq[jdopseq.length-1])  // looped cases get curve in twice
                jdopseq.pop(); 
            jdopseqs.push(jdopseq); 
        }
    }
    
    var Dsumjdopseq = 0; 
    for (var i = 0; i < jdopseqs.length; i++)
        Dsumjdopseq += jdopseqs[i].length; 
    console.assert(Dsumjdopseq == dlistlen); 
    
    return jdopseqs; 
}, 


FPSjdseqs: function(rlidat, dlistlen)
{    
    // extract closed sequences of paths that join up
    var jdseqs = [ ];  
    var i = 0; 

    var rlconns = 0; 
    for (var j = 0; j < rlidat.length - 1; j++) 
        rlconns += rlidat[j].length; 
    var Dloops = rlconns*2 + dlistlen;  // used to trap infinite loops

    // this will only find forward following loops (jd=i*2+1)
    while (i < dlistlen) {
        console.assert(Dloops-- >= 0); // catches infinite loops
        
        // disconnect any endpoint going backwards
        if (rlidat[i*2].length == 0) {
            // then disconnect forward links from here
            if (rlidat[i*2 + 1].length == 0) {
                i++; 
            } else {
                var jd = i*2 + 1; 
                while (rlidat[jd].length != 0) {
                    this.disconnectJD1(rlidat, jd, rlidat[jd].pop()[1]); 
                }
            }
        // line is an endpoint going forward 
        } else if (rlidat[i*2 + 1].length == 0) {
            var jd = i*2; 
            while (rlidat[jd].length != 0) {
                this.disconnectJD1(rlidat, jd, rlidat[jd].pop()[1]); 
            }
            
        // not an endpoint going forwards, follow round to see if it forms a loop
        } else {
            var jdseq = [ ]; 
            var jd0 = i*2 + 1; 
            var jd = jd0; 
            while (true) {
                
                // we've chased through and hit an end, take it out
                if (rlidat[jd].length == 0) {
                    var jdl = jdseq.pop(); 
                    //console.log("removing jdl", jdl, jd0); 
                    this.disconnectJD1(rlidat, jdl, rlidat[jdl].shift()[1]); 
                    break; 
                    
                // we've exceeded the number of edges possible, so time to quit (and take out the starting point)
                } else if ((jdseq.length > dlistlen - i*0) || ((jdseq.length != 0) && (jdseq[jdseq.length-1] == jd))) {
                    //console.log("removing jd0 semiloop", jd0); 
                    this.disconnectJD1(rlidat, jd0, rlidat[jd0].shift()[1]); 
                    break; 
                    
                // this is the part actually continue chasing through the 2-way connections (pretty important but hard)
                } else {
                    jdseq.push(jd); 
                    var jd1 = rlidat[jd][0][1];  // pick closest out of the list here
                    
                    // (except try to avoid looping back on self if possible)
                    if ((jdseq.length >= 2) && (jdseq[jdseq.length - 2] == jd1) && (rlidat[jd].length >= 2)) {
                        //console.log("Avoid obvious loop backwards"); 
                        var jd1 = rlidat[jd][1][1];  // pick second closest out of the list here
                    }

                    jd = jd1 + ((jd1%2) == 1 ? -1 : 1); 
                    
                    // we've looped around to starting point
                    if (jd == jd0) 
                        break; 
                }
            }

            // got a closed cycle.  Disconnect everything else around it
            if (jd == jd0) {
                //console.log("found cycle", jdseq); 
                jdseqs.push(jdseq); 
                for (var ijd = 0; ijd < jdseq.length; ijd++) {
                    var jd = jdseq[ijd]; 
                    while (rlidat[jd].length != 0) {
                        this.disconnectJD1(rlidat, jd, rlidat[jd].pop()[1]); 
                    }
                    jd1 = jd + ((jd%2) == 1 ? -1 : 1); 
                    while (rlidat[jd1].length != 0) {
                        this.disconnectJD1(rlidat, jd1, rlidat[jd1].pop()[1]); 
                    }
                }
                i++; 
            } 
        }
    }
    return jdseqs; 
},


FindClosedPathSequencesD: function(dlist, closedist)
{
    // create arrays of closest links  (dlist can be padded with nulls to knock out values but retain the indexes)
    var rlends = this.FPSrlends(dlist, dlist.length); // [ x, y, i, bfore, pathlength ]
    //Drlends = rlends; 
    var rlidat = this.FPSrlidat(rlends, dlist.length, closedist); 
    //Drlidat = this.FPSrlidat(rlends, dlist.length, closedist);   // recalculate to avoid consumption by FPSjdseqs
    return this.FPSjdseqs(rlidat, dlist.length); 
}, 


GetSingletsList: function(jdseqs, dlistlength)
{
    var singletslistNm = { }; 
    for (var i = 0; i < jdseqs.length; i++) {
        var jdseq = jdseqs[i]; 
        for (var j = 0; j < jdseq.length; j++) {
            singletslistNm[jdseq[j]/2|0] = 1; 
        }
    }
    var singletslist = [ ]; 
    for (var i = 0; i < dlistlength; i++) {
        if (singletslistNm[i] === undefined) {
            singletslist.push(i); 
        }
    }
    return singletslist; 
},




dpathappendsegs: function(darea, dpath, breversed) 
{
    if (breversed) {
        for (var k = dpath.length - 1; k > 0; k--) {
            var lseq0 = dpath[k-1]; 
            var lseq1 = dpath[k]; 
            var nseq = [ lseq1[0] ]; 
            for (var l = lseq1.length - 4; l > 0; l -= 2)
                nseq.push(lseq1[l], lseq1[l + 1]); 
            nseq.push(lseq0[lseq0.length - 2], lseq0[lseq0.length - 1]); 
            darea.push(nseq); 
        }
    } else {
        for (var k = 1; k < dpath.length; k++) 
            darea.push(dpath[k]); 
    }
},

RevJDseq: function(jdseq)
{
    var res = [ ]; 
    for (var i = jdseq.length - 1; i >= 0; i--) {
        var jd = jdseq[i]; 
        res.push(jd + ((jd%2)==1 ? -1 : 1)); 
    }
    return res; 
},

JDgeoseq: function(jdseq, dlist)
{
    var darea = [ ]; 
    //console.log(jdseq); 
    var spath = undefined; 
    console.assert(jdseq.length != 0); 
    for (var ijd = 0; ijd < jdseq.length; ijd++) {
        var jd = jdseq[ijd]; 
        var i = jd/2|0; 
        var bfore = ((jd%2)==1); 
        spath = dlist[i]; 
        console.assert(spath[0][0] == "M"); 
        var px, py; 
        if (bfore) {
            if (ijd == 0) {
                darea.push(spath[0]); 
            } else if ((px != spath[0][1]) || (py != spath[0][2])) {
                darea.push(["L", spath[0][1], spath[0][2]]); 
            }
            this.dpathappendsegs(darea, spath, false); 
            var lseq = spath[spath.length-1]; 
            px = lseq[lseq.length - 2]; 
            py = lseq[lseq.length - 1]; 
        } else {
            var lseq = spath[spath.length-1]; 
            if (ijd == 0) {
                darea.push(["M", lseq[lseq.length - 2], lseq[lseq.length - 1]]); 
            } else if ((px != lseq[lseq.length - 2]) || (py != lseq[lseq.length - 1])) {
                darea.push(["L", lseq[lseq.length - 2], lseq[lseq.length - 1]]); 
            }
            this.dpathappendsegs(darea, spath, true); 
            px = spath[0][1]; 
            py = spath[0][2]; 
        }
    }
    console.assert((darea.length == 0) || (darea[0][0] == "M")); 
    if ((px != darea[0][1]) || (py != darea[0][2])) {
        darea.push(["L", darea[0][1], darea[0][2]]); 
    }
    return darea; 
},


FindAreaGroupingsD: function(jdgeos)
{
    var nsampspercurve = 3; 
    var nsampspercurveDecider = 2; // work on contour points because using actual inner points gives false positives if mishandled
    var cycsamplepts = [ ]; 
    for (var ic = 0; ic < jdgeos.length; ic++) {
        var jdgeo = jdgeos[ic]; 
        var samplepts = [ Raphael.pathBBox(jdgeo) ]; 
        var tl = Raphael.getTotalLength(jdgeo); 
        for (var i = 0; i < nsampspercurve; i++) {
            var pal = Raphael.getPointAtLength(jdgeo, tl*i/nsampspercurve); 
            samplepts.push(pal); 
        }
        cycsamplepts.push(samplepts); 
    }

    // find insidedness
    var continnerpairs = [ ]; 
    for (var ic0 = 0; ic0 < jdgeos.length - 1; ic0++) {
        var jdgeo0 = jdgeos[ic0]; 
        var cycsamplepts0 = cycsamplepts[ic0]
        for (var ic1 = ic0+1; ic1 < jdgeos.length; ic1++) {
            var jdgeo1 = jdgeos[ic1]; 
            var cycsamplepts1 = cycsamplepts[ic1]
            if (Raphael.isBBoxIntersect(cycsamplepts0[0], cycsamplepts1[0])) {
                var si0 = 0, si1 = 0; 
                for (var i = 1; i <= nsampspercurve; i++) {
                    //var pt1m = [["M", cycsamplepts1[i].x, cycsamplepts1[i].y], ["H", cycsamplepts1[0].x2 + 10]]; 
                    //var pt0m = [["M", cycsamplepts0[i].x, cycsamplepts0[i].y], ["H", cycsamplepts0[0].x2 + 10]]; 
                    //var ni0 = Raphael.pathIntersectionNumber(jdgeo0, pt1m); 
                    //var ni1 = Raphael.pathIntersectionNumber(jdgeo1.darea, pt0m); 
                    si0 += (Raphael.isPointInsidePath(jdgeo0, cycsamplepts1[i].x, cycsamplepts1[i].y) ? 1 : 0); 
                    si1 += (Raphael.isPointInsidePath(jdgeo1, cycsamplepts0[i].x, cycsamplepts0[i].y) ? 1 : 0); 
                }

                if ((si0 >= nsampspercurveDecider) && (si1 < nsampspercurveDecider))
                    continnerpairs.push([ic1, ic0]); 
                else if ((si0 < nsampspercurveDecider) && (si1 >= nsampspercurveDecider))
                    continnerpairs.push([ic0, ic1]); 
                else if ((si0 >= nsampspercurveDecider) && (si1 >= nsampspercurveDecider))
                    console.log("overlapping", ic0, ic1, "si", si0, si1); 
            }
        }
    }

    // containment sets
    var mapsdown = { }; 
    var mapsup = { }; 
    for (var ic = 0; ic < jdgeos.length; ic++) {
        mapsdown[ic] = [ ]; 
        mapsup[ic] = [ ]; 
    }
    for (var i = 0; i < continnerpairs.length; i++) {
        var ic0 = continnerpairs[i][0]; 
        var ic1 = continnerpairs[i][1]; 
        mapsdown[ic1].push(ic0); 
        mapsup[ic0].push(ic1); 
    }

    var mapsdown1 = { }; 
    for (var ic = 0; ic < jdgeos.length; ic++) {
        var md = mapsdown[ic]; 
        var md2 = [ ]; 
        for (var i = 0; i < md.length; i++) {
            var md11 = mapsdown[md[i]]; 
            for (var j = 0; j < md11.length; j++) {
                md2.push(md11[j]); 
            }
        }
        var md1 = [ ]; 
        for (var i = 0; i < md.length; i++) {
            if (!md2.includes(md[i])) {
                md1.push(md[i]); 
            }
        }
        mapsdown1[ic] = md1; 
    }
    
    // work down the tree
    //console.log("mapsdown", mapsdown); 
    //console.log("mapsdown1", mapsdown1); 
    //console.log(mapsup); 
    var outerlevels = [ ]; 
    for (var ic = 0; ic < jdgeos.length; ic++) {
        if (mapsup[ic].length == 0) {
            outerlevels.push(ic); 
        }
    }
    var cboundislands = [ ]; 
    while ((outerlevels.length != 0) && (cboundislands.length < jdgeos.length + 10)) {
        var ic = outerlevels.shift(); 
        var cboundisland = [ ic ]; 
        var md1 = mapsdown1[ic]; 
        for (var i = 0; i < md1.length; i++) {
            cboundisland.push(md1[i]); 
            var md1i1 = mapsdown1[md1[i]]; 
            for (var j = 0; j < md1i1.length; j++) {
                outerlevels.push(md1i1[j]); 
            }
        }
        cboundislands.push(cboundisland); 
        console.assert(cboundislands.length <= jdgeos.length); 
    }
    return cboundislands; 
},

SingletsToGroupingsD: function(dpath, cboundislands, jdgeos)
{
    var lamchecks = [ 0.5, 0.1, 0.9, 0.7, 0.33233432 ]; 
    var tl = Raphael.getTotalLength(dpath); 
    var il = 0; 
    var Jb = -1; 
    while (il < lamchecks.length) {
        var pt = Raphael.getPointAtLength(dpath, tl*lamchecks[il]); 
        var Js = [ ]; 
        for (var j = 0; j < cboundislands.length; j++) {
            var cboundisland = cboundislands[j]; 
            var k; 
            for (k = 0; k < cboundisland.length; k++) {
                if (Raphael.isPointInsidePath(jdgeos[cboundisland[k]], pt.x, pt.y) != (k == 0))
                    break; 
            }
            if (k == cboundisland.length)
                Js.push(j); 
        }
        
        if (Js.length == 1) {
            Jb = Js[0]; 
            break; 
        }
        if (Js.length != 0)
            Jb = Js[0]; 
        il++; 
    }
    return Jb; 
}


}

