
var fakegpsstart = [47.69278936428201, 13.820952855143327, 1877.69];  // this is at 204a entrance
var ifakegpsstart = 0; 
function fakegpsgenerator()
{
    var ioffs = 100, ifac = 1.0/600; 
    var i = ioffs; 
    var x0 = Math.cos(i*ifac)*i*0.00001; 
    var y0 = -Math.sin(i*ifac)*i*0.00001; 

    i = ioffs + ifakegpsstart; 
    var x = Math.cos(i*ifac)*i*0.00001; 
    var y = -Math.sin(i*ifac)*i*0.00001; 
    
    geo_success({ coords: { latitude: fakegpsstart[0] + x - x0, longitude: fakegpsstart[1] + y - y0, accuracy: i*0.01, altitudeAccuracy: i*0.01+1, altitude: ((i % 31) != 6 ? fakegpsstart[2] : 0.0) }}); 
    ifakegpsstart++; 
    if (ifakegpsstart < 100)
        setTimeout(fakegpsgenerator, 1000); 
}

var trailgeometry = null; 
var trialgeometryindex = 0; 
var footminusalt = 20; 
function LoadTrail(scene) 
{
    trailgeometry = new THREE.Geometry();
    //var p = latlngtopt(svxents[i][1], svxents[i][2], svxents[i][3]); 
    var p = new THREE.Vector3(camera.position.x, camera.position.y - footminusalt, camera.position.z); 
    for (var i = 0; i < 50; i++)
        trailgeometry.vertices.push(new THREE.Vector3(p.x, p.y, p.z)); 
    var trailpointsmaterial = new THREE.PointsMaterial({ color: 0x22FF11, sizeAttenuation: false, size: 5.0 }); 
    var trailpoints = new THREE.Points(trailgeometry, trailpointsmaterial); 
    scene.add(trailpoints); 
}

function TrailUpdate()
{
    // make the trail
    var trailstep = 15.0; 
    if (trailgeometry) {
        var pp = trailgeometry.vertices[trialgeometryindex % trailgeometry.vertices.length]; 
        var pc = camera.position; 
        if (Math.max(Math.abs(pp.x - pc.x), Math.abs(pp.z - pc.z)) >= trailstep) {
            trialgeometryindex++; 
            trailgeometry.vertices[trialgeometryindex % trailgeometry.vertices.length].set(pc.x, pc.y - footminusalt, pc.z); 
            document.getElementById('testout').textContent = " :::"+trialgeometryindex+" "+pc.x.toFixed(0)+","+pc.y.toFixed(0)+","+pc.z.toFixed(0); 
            trailgeometry.verticesNeedUpdate = true; 
            trailgeometry.computeBoundingSphere(); 
            trailgeometry.computeBoundingBox(); 
        }
    }
    
    if (footposmesh) {
        footposmesh.position.set(camera.position.x, camera.position.y - footminusalt, camera.position.z); 
    }
}


var footposmesh = null; 
function LoadFootpos(scene) 
{
    var alt = 0, tfac = 0.5, pixsize = 0.06; 
    var vertbuff = new THREE.Float32Attribute(new Float32Array((6+4)*3), 3); 
    var indices = new Uint16Array(6+6);
    for (var i = 0; i <= 1; i++) {
        var xfac = (i == 0 ? -1 : 1); 
        vertbuff.setXYZ(i*3, 0.1*xfac*tfac, alt, 0); 
        vertbuff.setXYZ(i*3+1, 0.1*xfac*tfac, alt, -2*tfac); 
        vertbuff.setXYZ(i*3+2, 1*xfac*tfac, alt, -2*tfac); 
        indices[i*3] = i*3; 
        indices[i*3+1] = i*3+1+i; 
        indices[i*3+2] = i*3+2-i; 
        
        vertbuff.setXYZ(i*2+6, pixsize*xfac*tfac, alt, -pixsize*tfac)
        vertbuff.setXYZ(i*2+7, pixsize*xfac*tfac, alt, pixsize*tfac)
    }
    indices[6] = 6;  indices[7] = 7;  indices[8] = 9; 
    indices[9] = 6;  indices[10] = 9;  indices[11] = 8; 
    var buffergeometry = new THREE.BufferGeometry(); 
    buffergeometry.setIndex(new THREE.BufferAttribute(indices, 1)); 
    buffergeometry.addAttribute('position', vertbuff);
    footposmesh = new THREE.Mesh(buffergeometry, new THREE.MeshBasicMaterial({ color: 0x22FF11 }));  
    scene.add(footposmesh); 
}

var pickposmesh = null; 
function LoadPickPos(scene) 
{
    var alt = 0, tfac = 3; 
    var vertbuff = new THREE.Float32Attribute(new Float32Array(6*3), 3); 
    var indices = new Uint16Array(6);
    for (var i = 0; i <= 1; i++) {
        var xfac = (i == 0 ? -1 : 1); 
        vertbuff.setXYZ(i*3, 0.02*xfac*tfac, alt, 0); 
        vertbuff.setXYZ(i*3+1, 0.02*xfac*tfac, alt, -2*tfac); 
        vertbuff.setXYZ(i*3+2, 1*xfac*tfac, alt + i, -2*tfac); 
        indices[i*3] = i*3; 
        indices[i*3+1] = i*3+1+i; 
        indices[i*3+2] = i*3+2-i; 
    }
    var buffergeometry = new THREE.BufferGeometry(); 
    buffergeometry.setIndex(new THREE.BufferAttribute(indices, 1)); 
    buffergeometry.addAttribute('position', vertbuff);
    pickposmesh = new THREE.Mesh(buffergeometry, new THREE.MeshBasicMaterial({ color: "red" }));  
    scene.add(pickposmesh); 
}



function geo_success(position) 
{ 
    latG = position.coords.latitude; 
    lngG = position.coords.longitude; 
    document.getElementById('gpsrec').textContent = "Lat:"+latG.toFixed(7)+" Lng:"+lngG.toFixed(7)+
                                                    " (~"+position.coords.accuracy.toFixed(0)+"m)"+
                                                    " Alt:"+position.coords.altitude.toFixed(1)+
                                                    " (~"+position.coords.altitudeAccuracy.toFixed(0)+"m)"; 
    //document.getElementById('heading').textContent = position.coords.heading.toFixed(0); 
    //document.getElementById('speed').textContent = position.coords.speed.toFixed(2); 
    
    if (position.coords.altitude != 0.0)
        altG = position.coords.altitude; 
    SetCameraPositionG();
} 
    
function SetCameraPositionG()
{
    var pc = latlngtopt(latG - latR, lngG - lngR, altG - altR); 
    camera3JSAlt = pc.y; 
    camera.position.set(pc.x, pc.y, pc.z); 
    TrailUpdate(); 
};

function geo_error() 
{  
    document.getElementById('gpsrec').textContent = "gps error"; 
}