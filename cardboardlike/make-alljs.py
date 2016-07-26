import os, time, re, sys, datetime
import pyproj
import json

bexpoloser=False
fjs = "/home/goatchurch/geom3d/goatchurchprime.github.io/cardboardlike/all3d.js"
fsvx = "/home/goatchurch/caving/expoloser/all.svx"
f3d = "/home/goatchurch/caving/allding.3d"

if not bexpoloser:
    fjs = "/home/goatchurch/geom3d/goatchurchprime.github.io/cardboardlike/allleck3d.js"
    fsvx = "/home/goatchurch/caving/NorthernEngland/ThreeCountiesArea/survexdata/leckfell.svx"
    fsvx = "/home/goatchurch/caving/NorthernEngland/ThreeCountiesArea/survexdata/all.svx"
    f3d = "/home/goatchurch/caving/allding2.3d"

os.system("cavern -sq %s --output=%s" % (fsvx, f3d))
dd3d = os.popen("dump3d -d %s" % f3d)
lines = dd3d.readlines()

# we try to get the dates for all the survey legs (ignoring date ranges), 
# and use connectivity to get to the entrances.  Could use connectivity 
# to push back dates to ensure passages can only appear in the timeline 
# when they can connect to the surface.
# The melt through time would have a sparkle whenever two caves get connected
# Roll back in time, then zoom out and replay showing the Appelhaus data
# and Raucherkhan data.  
# It's a bit like OpenStreetmap a year of edits

def LoadParseDmp(g):
    proj = None
    for l in g:
        if l.strip() == '--':
            break
        c, v = l.split(maxsplit=1)
        if c == "CS":
            print(v)
            proj = pyproj.Proj(v)

    prevp = None
    segsnamemap = { }
    stationsnamemap = { }
    entsmap = { }
    connlinks = { }
    sallnames = set()
    for l in g:
        ls = l.split()
        if ls[0] in ["MOVE", "NODE", "LINE"]:
            lng, lat = proj(float(ls[1]), float(ls[2]), inverse=True)
            #lng, lat = float(ls[1]), float(ls[2])
            alt = float(ls[3])
            p = (lat, lng, alt)
            if ls[0] == "MOVE":
                prevp = p
            elif ls[0] == "LINE":
                levelname = re.match("\[([^\]]*)", ls[4]).group(1)
                levelnames = levelname.split(".")
                while len(levelnames) > 1 and levelnames[0] in ["all", "leckfell", "easegill", "wks"]:
                    levelnames.pop(0)
                toplevelname = levelnames[0]
                styles = ls[5].split("=")[1:]+ls[6:]

                # calculate the date as a fractional year
                if styles and not re.match("[A-Z]*$", styles[-1]):
                    date = styles.pop()
                else:
                    date = "1900.01.01"
                ddate = datetime.datetime.strptime(date[:10], "%Y.%m.%d") # ignore date ranges
                fdate = ddate.year + (ddate - datetime.datetime(ddate.year, 1, 1)).days/365.0
                if prevp:
                    stationsnamemap[prevp] = toplevelname
                stationsnamemap[p] = toplevelname

                if "SURFACE" not in styles and "SPLAY" not in styles and "DUPLICATE" not in styles:
                    sallnames.add(toplevelname)
                    if prevp is not None:
                        if toplevelname not in segsnamemap:
                            segsnamemap[toplevelname] = []
                        segsnamemap[toplevelname].append((prevp, p, fdate))
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
                if "ENTRANCE" in tags:
                    if bexpoloser:
                        if "." not in name:
                            entsmap[name] = p
                    else:
                        es = name.split(".")
                        while es[-1] == "entrance":
                            es.pop()
                        name = re.sub("entrance|tag$|phanger", "", es[-1])
                        entsmap[name] = p
                        
    return segsnamemap, entsmap, stationsnamemap, sallnames 


segsnamemap, entsmap, stationsnamemap, sallnames = LoadParseDmp((l  for l in lines))

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
    for p, p1, fdate in segs:
        svxsegs.append((p[0], p[1], p[2], p1[0], p1[1], p1[2], i, fdate))
svxsegs.sort(key=lambda X: -max(X[2], X[5]))

altmin = min(min(X[2], X[5])  for X in svxsegs)
altmax = max(max(X[2], X[5])  for X in svxsegs)
vfac = 0.9/(altmax - altmin)
redalt = (0.5 - altmax*vfac) % 1


peaks = [ 
    ["Schoneberg", 47.712315, 13.790972, 2000 ], 
    ["Dachstein", 47.47527777777778, 13.606388888888889, 2995 ], 
    ["Loser", 47.66083333333333, 13.771111111111113, 1837 ],
    ["Trisselwand", 47.64611111111111, 13.813333333333334, 1754 ],
    
    ["Trissenstein", 47.626666666666665, 13.789166666666667, 1201 ],
    ["Brauning Nase", 47.678381045318616, 13.805098487465617, 1769 ],
    ["Rotelstein", 47.593488, 13.847536, 1614 ],
    ["Sarstein", 47.602606, 13.699005, 1975 ]
];

# this is subtracted from the data positions
if not bexpoloser:
    basepositionOrigin = [ "Hilde", 47.6160995, 13.8121137, 748 ];  

    # yorkshire ones
    peaks = [["Ingleborough", 54.166389, -2.397778, 723], 
             ["Great Coum", 54.2467,-2.4607, 687],
             ["Gragareth", 54.2085,-2.4814, 628], 
             ["Heysham", 54.0299033,-2.9157409, 0]];
    basepositionOrigin = ["Pos", 54.19063016552769, -2.500253529735059, 383.05];


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
fout.write(";\n\n")
fout.write("var peaks = ") 
fout.write(json.dumps(peaks))
fout.write(";\n\n")
fout.write("var basepositionOrigin = ") 
fout.write(json.dumps(basepositionOrigin))
fout.write(";\n")
fout.write("var vfac = %f, redalt = %f;\n" % (vfac, redalt)) 

fout.close()
