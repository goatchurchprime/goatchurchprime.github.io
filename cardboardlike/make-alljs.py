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
segsnamemap = { }
stationsnamemap = { }
entsmap = { }
sallnames = set()
connlinks = { }
for l in g:
    ls = l.split()
    if ls[0] in ["MOVE", "NODE", "LINE"]:
        lng, lat = proj(float(ls[1]), float(ls[2]), inverse=True)
        #lng, lat = float(ls[1]), float(ls[2])
        alt = float(ls[3])
        p = (lat, lng, alt)
        if ls[0] == "MOVE":
            if conts and len(conts[-1]) == 1:
                conts.pop()
            conts.append([])
            prevp = p
        elif ls[0] == "LINE":
            toplevelname = re.match("\[([^\]\.]*)", ls[4]).group(1)
            styles = ls[5].split("=")[1:]+ls[6:]
            if prevp:
                stationsnamemap[prevp] = toplevelname
            stationsnamemap[p] = toplevelname
            if "SURFACE" not in styles and "SPLAY" not in styles and "DUPLICATE" not in styles:
                sallnames.add(toplevelname)
                conts[-1].append(p)
                if prevp is not None:
                    if toplevelname not in segsnamemap:
                        segsnamemap[toplevelname] = []
                    segsnamemap[toplevelname].append((prevp, p))
            else:
                if prevp not in connlinks:
                    connlinks[prevp] = set()
                if p not in connlinks:
                    connlinks[p] = set()
                connlinks[prevp].add(p)
                connlinks[p].add(prevp)
            prevp = p
        elif ls[0] == "NODE":
            name = ls[4].strip("[]")
            tags = ls[5].split() if len(ls) >= 6 else []
            if ("ENTRANCE" in tags and "." not in name) or name in ["t2006-09", "gps2010-01", "gps2010-07"]:
                entsmap[name] = p
                
assocnamesents = { }
for e, p in entsmap.items():
    toplevelsurvname = stationsnamemap.get(p)
    if toplevelsurvname and toplevelsurvname in segsnamemap:
        if toplevelsurvname not in assocnamesents:
            assocnamesents[toplevelsurvname] = [ ]
        assocnamesents[toplevelsurvname].append(e)
    else:
        sallnames.add(e)

allnames = list(sallnames)
allnames.sort()

# associate an index to each entrance
svxents = [ ]
for e, p in entsmap.items():
    ps = set((p,))
    le = e
    psdone = set()
    while ps:
        lp = min(ps, key=lambda X: (X[0]-p[0])**2+(X[1]-p[1])**2+(X[2]-p[2])**2)
        ps.remove(lp)
        toplevelsurvname = stationsnamemap.get(lp)
        #print(lp, toplevelsurvname)
        if toplevelsurvname and toplevelsurvname in segsnamemap:
            le = toplevelsurvname
            break
        else:
            psdone.add(lp)
            for pss in connlinks.get(lp, []):
                if pss not in psdone:
                    ps.add(pss)
    toplevelsurvname = stationsnamemap.get(lp)
    le = toplevelsurvname if toplevelsurvname and toplevelsurvname in segsnamemap else e
    svxents.append((e, p[0], p[1], p[2], allnames.index(le)))
svxents.sort(key=lambda X: -X[3])

svxsegs = [ ]
for sname, segs in segsnamemap.items():
    i = allnames.index(sname)
    for p, p1 in segs:
        svxsegs.append((p[0], p[1], p[2], p1[0], p1[1], p1[2], i))
svxsegs.sort(key=lambda X: -max(X[2], X[5]))

fout = open(fjs, "w")
fout.write("// generated %s from running %s\n\n" % (time.asctime(), sys.argv[0]))
fout.write("var svxnames = ") 
fout.write(json.dumps(allnames))
fout.write(";\n\n")
fout.write("var svxents = ") 
fout.write(json.dumps(svxents))
fout.write(";\n\n")
fout.write("var svxlegs = ") 
fout.write(json.dumps(svxsegs))
fout.write(";\n")
fout.close()

