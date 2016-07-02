// fake regular data

var orig = [ 47.6160995, 13.8121137, 748 ];  
var earthrad = 6378137; 
var FNfac = 2*Math.PI*earthrad/360; 
var FEfac = FNfac*Math.cos(orig[0]*Math.PI/180); 

var nF = 10/FNfac, eF = 10/FEfac; 

var svxlegs = [ ];
for (var i = -3; i <= 3; i++) {
    svxlegs.push([orig[0], orig[1], orig[2]-50, orig[0]+(i==0?1.5:1)*nF, orig[1]+i*eF/10, orig[2]-50]);  
}
var svxents = [["OO", orig[0], orig[1], orig[2]-50]];  
