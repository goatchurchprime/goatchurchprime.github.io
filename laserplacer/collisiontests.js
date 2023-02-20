
var collidestepout = 10, collidestepover = 10; 

// duff
function TestCollision(dx, dy) 
{
    for (var i = 0; i < opts.length; i++) {
        var x = opts[i][0] + dx; 
        var y = opts[i][1] + dy; 
        if (y >= paper1.height*paper1scale)
            return false; 
        for (var j = 0; j < rlist.length; j++) {
            if (rlist[j] == pathselected)
                continue; 
            if (rlist[j].isPointInside(x, y))
                return false; 
        }
    }
    return true; 
}



function CollideBinary() 
{
    // paper1.getElementsByPoint(x, y); 
    var ymid = (ylo + yhi)/2; 
    if (TestCollision(0, ymid)) {
        ylo = ymid; 

        var basematrix = pathselected.matrix.toTransformString(); 
        var tstr = "t0,"+ylo+basematrix; 
        for (var k = 0; k < Lgrouppath.length; k++) {
            Lgrouppath[k].transform(tstr); 
        }; 

    } else {
        yhi = ymid; 
    }
    if (yhi - ylo <= collidestepout + 1) {
        perprods.remove(); 
    } else {
        setTimeout(CollideBinary, 5); 
    }
}

/* refer to: 
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = getPath[this.type](this);
        if (this.attr('transform') && this.attr('transform').length) {
            rp = R.transformPath(rp, this.attr('transform'));
        }
        return R.isPointInsidePath(rp, x, y);
    };
*/

function MoveCollide()
{
    path = pathselected; 
    var dtrans = Raphael.mapPath(path.attr("path"), path.matrix); 
    var pl = Raphael.getTotalLength(dtrans); 
    console.log(pl); 
    var ds = [ ]; 
    opts = [ ]; 
    for (var i = 0; i < pl; i += collidestepover) {
        var pal = Raphael.getPointAtLength(dtrans, i); 
        var angnorm = Raphael.rad(pal.alpha+90); 
        var sa = Math.sin(angnorm); 
        var ca = Math.cos(angnorm); 
        var d = collidestepout; 
        if (Raphael.isPointInsidePath(dtrans, pal.x+ca*d, pal.y+sa*d)) { d = -d }; 
        ds.push("M", pal.x, ",", pal.y, "l", ca*d, ",", sa*d); 
        opts.push([pal.x+ca*d, pal.y+sa*d]); 
    }
    
    perprods = paper1.path(ds.join("")); 
    ylo = 0; 
    yhi = 400; 
    
    Lgrouppath = null; 
    var Lgrouppaths = svgprocesses[fadividlast].Lgrouppaths; 
    for (var k = 0; k < Lgrouppaths.length; k++) {
        if (Lgrouppaths[k][0] == pathselected)
            Lgrouppath = Lgrouppaths[k]; 
    }
    setTimeout(CollideBinary, 5); 
}

Dtranslats = null; 
Dxjson = null; 
function Nest1() 
{
    var polymap = { }; 
    var board = [ ]; 
    var sequence = [ ]; 
    var Ipolymap = { }; 
    //for (var i = 0; i < svgprocesses.length; i++) {
    Object.keys(a).forEach(function(key, i) {  // untested after the above change from list to object
        var svgp = svgprocesses[key]; 
        for (var j = 0; j < svgp.Lgrouppaths.length; j++) {
            var pth = svgp.Lgrouppaths[j][0].attr("path"); 
            var pgid = svgp.pathgroupings[j][0]; 
            polymap[pgid] = pth; 
            Ipolymap[pgid] = [key, j]; 
            
            if ((i == 0) && (j == 0)) {
                board.push(pgid); 
            } else {
                sequence.push(pgid); 
            }
        }
    }); 
}
