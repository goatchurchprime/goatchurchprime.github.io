import os, time, re, sys
import pyproj
import json

fjs = "/home/goatchurch/geom3d/goatchurchprime.github.io/cardboardlike/all3d.js"
fsvx = "/home/goatchurch/caving/expoloser/all.svx"
f3d = "/home/goatchurch/caving/allding.3d"

# *FIX 0_7 reference 35419.56 82237.16 1769.77 ;Brauning Nase
#cs = "+proj=tmerc +lat_0=0 +lon_0=13d20 +k=1 +x_0=0 +y_0=-5200000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232"
#proj = pyproj.Proj(cs)
#print(proj(35419.56, 82237.16, inverse=True))

os.system("cavern -sq %s --output=%s" % (fsvx, f3d))
dd3d = os.popen("dump3d %s" % f3d)
lines = dd3d.readlines()


proj = None
g = (l  for l in lines)
for l in g:
    if l.strip() == '--':
        break
    c, v = l.split(maxsplit=1)
    if c == "CS":
        print(v)
        proj = pyproj.Proj(v)

prevp = None
conts = [ ]
segs = [ ]  # same as conts but in segments
ents = [ ]
for l in g:
    # legs sections
    m = re.match('(MOVE|LINE) ([0-9\.\-]*) ([0-9\.\-]*) ([0-9\.\-]*)(?:.*?STYLE=.*?(SURFACE))?', l)
    if m:
        if m.group(1) == 'MOVE':
            if conts and len(conts[-1]) == 1:
                conts.pop()
            conts.append([])
            prevp = None
        lng, lat = proj(float(m.group(2)), float(m.group(3)), inverse=True)
        alt = float(m.group(4))
        p = (lat, lng, alt)
        if not m.group(5):
            conts[-1].append(p)
            if prevp is not None:
                segs.append(prevp + p)
            prevp = p
    
    # entrances
    m = re.match('(NODE) ([0-9\.\-]*) ([0-9\.\-]*) ([0-9\.\-]*) \[([^\]]*)\]\s+(.*)', l)
    if m:
        tags = m.group(6).split()
        name = m.group(5)
        if ("ENTRANCE" in tags and "." not in name) or name in ["t2006-09", "gps2010-01", "gps2010-07"]:
            lng, lat = proj(float(m.group(2)), float(m.group(3)), inverse=True)
            alt = float(m.group(4))
            ents.append((name, lat, lng, alt))
        
os.system("rm %s" % f3d)

fout = open(fjs, "w")
fout.write("// generated %s from running %s\n\n" % (time.asctime(), sys.argv[0]))
fout.write("var svxlegs = ") 
fout.write(json.dumps(segs))
fout.write(";\n\n")
fout.write("var svxents = ") 
fout.write(json.dumps(ents))
fout.write(";\n")

fout.close()


