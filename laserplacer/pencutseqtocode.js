


function PenCutSeqsToKineticCode(pencutseqs, stockbbox, textvalues)
{
	var zclear = parseFloat(paramvaluedefault(textvalues, "zclear", 20)); 
	var zetch = parseFloat(paramvaluedefault(textvalues, "zetch", 15)); 
	var zcut = parseFloat(paramvaluedefault(textvalues, "zcut", 10)); 

    lc = [  "POST: https://bitbucket.org/goatchurch/laserplacer\r\n", 
			"%\r\n", "G90 (absolute dimensions)\r\n", "G94 (feed in mm/min)\r\n", 
		    "G17 (Level selection XY for circular arcs)\r\n", 
		    "G21 (metric unit for coordinates mm)\r\n", 
			"G90 (Absolute coordinates)\r\n", 
			"G40 (Cancel radius compensation)\r\n", 
			"G54 (Select workpiece zero)\r\n", 
			"G0 X0 Y0\r\n", 
			"G43 Z"+zclear+" H1 (Switch length compensation on)\r\n" ]; 

    
    var currx, curry, currsp; 
    var jointol = 0.1; 
    // origin to offset is stockbbox.x, stockbbox.y2-; 
    
    // [ { ptype:cutouter/cutisland/etch, d:dvalue, reversed:true/false, colour:col, tstr:tstr, xtransseq:[], ytransseq:[] } ] 
    for (var i = 0; i < pencutseqs.length; i++) {
        var pencutseq = pencutseqs[i]; 
        var sp = (pencutseq.ptype == "etch" ? 1 : 2); 
        var n = pencutseq.xtransseq.length; 
        var p0x = (pencutseq.reversed ? pencutseq.xtransseq[n-1] : pencutseq.xtransseq[0]); 
        var p0y = (pencutseq.reversed ? pencutseq.ytransseq[n-1] : pencutseq.ytransseq[0]); 
        var bliftpen = ((i == 0) || (Math.hypot(currx - p0x, curry - p0y) > jointol)); 
        var bchangepen = ((i == 0) || (sp != currsp)); 
        if (bliftpen || bchangepen) {
            if (i != 0)
                lc.push("G0 Z"+zclear+"\r\n"); 
            lc.push("X"+(p0x-stockbbox.x).toFixed(3)+" Y"+(stockbbox.y2-p0y).toFixed(3)+"\r\n");  // flipping the y
            //if (bchangepen)
            //    lc.push("SP "+sp+";\r\n"); 
            //lc.push("PD;\r\n"); 
			lc.push("G1 Z"+(pencutseq.ptype == "etch" ? zetch : zcut)+" F1000\r\n"); 
            currsp = sp; 
        }
        currx = p0x; 
        curry = p0y; 
            
        for (var j = 1; j < n; j++) {
            var rj = (pencutseq.reversed ? n-1-j : j); 
            currx = pencutseq.xtransseq[rj]; 
            curry = pencutseq.ytransseq[rj]; 
            lc.push("X"+(currx-stockbbox.x).toFixed(3)+" Y"+(stockbbox.y2-curry).toFixed(3)+"\r\n"); 
        }
    }

    lc.push("G0 Z"+zclear+"\r\n", "M30\r\n", "%\r\n"); 
    return lc; 
} 


function PenCutSeqsToPltCode(pencutseqs, stockbbox, textvalues)
{
    lc = [ "POST: https://bitbucket.org/goatchurch/laserplacer\r\n" ];  
    lc.push("START\r\n"); 
    lc.push("'(Name of files and entities loaded go here)\r\n"); 
    lc.push("%4 1000;\r\n", "%5 1000;\r\n", "%6 100;\r\n", "%7 10;\r\n", "%8 10;\r\n", "%9 10;\r\n"); 
    
    var currx, curry, currsp, currvs; 
    var jointol = 0.1; 
    // origin to offset is stockbbox.x, stockbbox.y2-; 
    
    // [ { ptype:cutouter/cutisland/etch, d:dvalue, reversed:true/false, colour:col, tstr:tstr, xtransseq:[], ytransseq:[] } ] 
    for (var i = 0; i < pencutseqs.length; i++) {
        var pencutseq = pencutseqs[i]; 
        var sp = (pencutseq.ptype == "etch" ? 1 : 2); 
        var n = pencutseq.xtransseq.length; 
        var p0x = (pencutseq.reversed ? pencutseq.xtransseq[n-1] : pencutseq.xtransseq[0]); 
        var p0y = (pencutseq.reversed ? pencutseq.ytransseq[n-1] : pencutseq.ytransseq[0]); 
        var bliftpen = ((i == 0) || (Math.hypot(currx - p0x, curry - p0y) > jointol)); 
        var bchangepen = ((i == 0) || (sp != currsp)); 
        if (bliftpen || bchangepen) {
            if (i != 0)
                lc.push("PU;\r\n"); 
            lc.push("VS 1000;\r\n"); 
            currvs = 1000; 
            lc.push("PA "+(p0x-stockbbox.x).toFixed(2)+","+(stockbbox.y2-p0y).toFixed(2)+";\r\n");  // flipping the y
            if (bchangepen)
                lc.push("SP "+sp+";\r\n"); 
            lc.push("PD;\r\n"); 
            currsp = sp; 
        }
        var vs = (pencutseq.ptype == "etch" ? 500 : 140); 
        if (vs != currvs) 
            lc.push("VS "+vs+";\r\n"); 
        currvs = vs;  
        currx = p0x; 
        curry = p0y; 
            
        for (var j = 1; j < n; j++) {
            var rj = (pencutseq.reversed ? n-1-j : j); 
            currx = pencutseq.xtransseq[rj]; 
            curry = pencutseq.ytransseq[rj]; 
            lc.push("PA "+(currx-stockbbox.x).toFixed(2)+","+(stockbbox.y2-curry).toFixed(2)+";\r\n"); 
        }
    }

    lc.push("PU;\r\n", "VS 1000;\r\n", "PU;\r\n", "PA 0,0;\r\n", "!PG;\r\n"); 
    return lc; 
} 


