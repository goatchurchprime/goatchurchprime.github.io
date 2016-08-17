#! /usr/bin/python3

import os, time, re, sys, datetime, math
import pyproj
import json

f3d = "/home/goatchurch/caving/eurospeleotalk/logbookprocessing/Skydusky.3d"
fjs = "/home/goatchurch/geom3d/goatchurchprime.github.io/cardboardlike/Skydusky.js"
f3d = "/home/goatchurch/caving/expoloser/all.3d"
f3d = "/home/goatchurch/caving/NorthernEngland/ThreeCountiesArea/survexdata/all.3d"
f3d = "/home/goatchurch/caving/eurospeleotalk/logbookprocessing/40.3d"
#f3d = "/home/goatchurch/caving/eurospeleotalk/logbookprocessing/maxpleasure2.3d"
f3d = "/home/goatchurch/caving/eurospeleotalk/logbookprocessing/tianxingdongxuexitong.3d"

dd3d = os.popen("dump3d -d %s" % f3d)
if True:
    lines = dd3d.readlines()
    g = (l for l in lines)
else:
    g = dd3d

proj = None
for l in g:
    if l.strip() == '--':
        break
    c, v = l.split(maxsplit=1)
    if c == "CS":
        print("*cs", v)
        proj = pyproj.Proj(v)


"""
# parses the output of dump3d.c in the survex codebase
MOVE 515727.86 4127857.76 596.80
LINE 515729.21 4127855.33 599.44 [eg3] STYLE=NORMAL 2005.10.15
ERROR_INFO #legs 1, len 3.78m, E 0.70 H 0.61 V 0.82
NODE 512036.63 4127340.23 505.51 [eg7.12] SURFACE UNDERGROUND ENTRANCE
XSECT 0.40 0.40 0.10 0.40 [leckfell.allmarblesteps.wetroute.sidewinder2.006]
XSECT_END
STOP
"""

# nodeflags SURFACE, UNDERGROUND, ENTRANCE, EXPORTED, FIXED, ANON
# linestyles NORMAL DIVING CARTESIAN CYLPOLAR NOSURVEY
# lineflags SURFACE DUPLICATE SPLAY

nodes = [ ] # [ (p, name, flags) ]
lines = [ ] # [ (prevp, p, name, style, flags, date) ]
xsects = [ [ ] ] # [ [ (name, lrud) ] ]

prevp = None
for l in g:
    ls = l.split()
    if ls[0] == "ERROR_INFO":
        continue
    elif ls[0] == "STOP":
        break
    elif ls[0] == "NODE":
        p = (float(ls[1]), float(ls[2]), float(ls[3]))
        s = ls[4]
        assert s[0] == "[" and s[-1] == "]", ls
        nodes.append((p, s[1:-1], set(ls[5:])))
    elif ls[0] == "MOVE":
        p = (float(ls[1]), float(ls[2]), float(ls[3]))
        prevp = p
    elif ls[0] == "LINE":
        p = (float(ls[1]), float(ls[2]), float(ls[3]))
        s = ls[4]
        assert s[0] == "[" and s[-1] == "]", ls
        style = ""
        ddate = ""
        n = 5
        if n < len(ls) and ls[n][:6] == "STYLE=":
            style = ls[5][6:]
            n += 1
        flags = [ ]
        while n < len(ls) and ls[n] in ["SURFACE", "DUPLICATE", "SPLAY"]:
            flags.append(ls[n])
            n += 1
        if n < len(ls) and re.match("\d\d\d\d\.\d\d\.\d\d", ls[n]):
                ddate = datetime.datetime.strptime(ls[n][:10], "%Y.%m.%d") 
                # ignoring date ranges
                n += 1
        assert len(ls) == n, ls
        lines.append((prevp, p, s[1:-1], style, flags, ddate))
        prevp = p
    elif ls[0] == "XSECT":
        s = ls[5]
        assert s[0] == "[" and s[-1] == "]", ls
        lrud = (float(ls[1]), float(ls[2]), float(ls[3]), float(ls[4]))
        xsects[-1].append((s[1:-1], lrud))
    elif ls[0] == "XSECT_END":
        xsects.append([])
        

nodepmap = { }  # { p: ([names], [flags] }
for node in nodes:
    p = node[0]
    if p not in nodepmap:
        nodepmap[p] = ([ ], set()) 
    nodepmap[p][0].append(node[1])
    nodepmap[p][1].update(node[2])


# display stuff
p0 = nodes[0][0]
dfac = 0.1
sendactivity("clearallcontours")
sendactivity("clearallpoints")
sendactivity("clearalltriangles")
def sh(p):  return ((p[0]-p0[0])*dfac, (p[1]-p0[1])*dfac, p[2]*dfac)
sendactivity(points=[sh(p)  for p, v in nodepmap.items()  if "ENTRANCE" in v[1] ])
sendactivity(contours=[[sh(line[0]), sh(line[1])]  for line in lines  if "SURFACE" not in line[4]])
sendactivity(contours=[[sh(line[0]), sh(line[1])]  for line in lines  if "SURFACE" in line[4]], materialnumber=2)
    
# process into a tube using bisectors using name lookup
nmapnodes = { }
for p, v in nodepmap.items():
    for na in v[0]:
        nmapnodes[na] = p
        

from basicgeo import P3


def shp(p):  return P3((p[0]-p0[0])*dfac, (p[1]-p0[1])*dfac, p[2]*dfac)
tris = [ ]
def AddQuad(q0, q1, q2, q3):
    tris.append((q0.x,q0.y,q0.z, q1.x,q1.y,q1.z, q2.x,q2.y,q2.z))
    tris.append((q0.x,q0.y,q0.z, q2.x,q2.y,q2.z, q3.x,q3.y,q3.z))

cornconts = [ ]    
for xsect in xsects:
 if len(xsect) < 2:
    continue
 U0, U1, U2, U3 = P3(0,0,0), P3(0,0,0), P3(0,0,0), P3(0,0,0)
 last_right = P3(1.0, 0.0, 0.0)
 right = P3(0,0,0)
 up = P3(0,0,0)
 up_v = P3(0.0, 0.0, 1.0)
 cover_end = False
 z_pitch_adjust = 0
 cornconts.append([])
 for i in range(len(xsect)):
    bskip = False
    if i == 0:
        leg_v = shp(nmapnodes[xsect[1][0]]) - shp(nmapnodes[xsect[0][0]])
        right = P3.Cross(leg_v, up_v)
        if right.Lensq() == 0:  
            right = last_right
            up = up_v
        else:
            last_right = right
            up = up_v   # a mistake?
        cover_end = True
    elif i == len(xsect)-1:
        leg_v = shp(nmapnodes[xsect[-1][0]]) - shp(nmapnodes[xsect[-2][0]])
        right = P3.Cross(leg_v, up_v)
        if (right.Lensq() == 0):
            right = P3(last_right.x, last_right.y, 0.0)
            up = up_v
        else:
            last_right = right
            up = up_v
        cover_end = True
    else:
        leg1_v = shp(nmapnodes[xsect[i][0]]) - shp(nmapnodes[xsect[i-1][0]])
        leg2_v = shp(nmapnodes[xsect[i+1][0]]) - shp(nmapnodes[xsect[i][0]])
        r1 = P3.ZNorm(P3.Cross(leg1_v, up_v))
        r2 = P3.ZNorm(P3.Cross(leg2_v, up_v))
        right = r1 + r2
        if (right.Lensq() == 0):
            right = last_right
        if r1.Lensq() == 0:
            print("hithere do r1")
            n = P3.ZNorm(leg1_v)
            z_pitch_adjust = n.z
            up = up_v
            shift = 0
            maxdotp = 0.0
            right = P3.ZNorm(right)
            up = P3.ZNorm(up)
            vec = up - right
            UU = [U0, U1, U2, U3]
            for orient in range(4):
                tmp = UU[orient] - shp(nmapnodes[xsect[i-1][0]])
                tmp = P3.ZNorm(tmp)
                dotp = P3.Dot(vec, tmp)
                if (dotp > maxdotp):
                    maxdotp = dotp
                    shift = orient
            if shift:
                if shift != 2:
                    temp = UU[0]
                    UU[0] = UU[shift];
                    UU[shift] = UU[2];
                    UU[2] = UU[shift ^ 2];
                    UU[shift ^ 2] = temp;
                else:
                    UU0, UU2 = UU2, UU0
                    UU1, UU3 = UU3, UU1
            U0, U1, U2, U3 = UU
            bskip = True
        elif r2.Lensq() == 0:
            n = P3.ZNorm(leg2_v)
            z_pitch_adjust = n.z
            up = up_v
            bskip = True
        else:
            up = up_v
    last_right = right
    right = P3.ZNorm(right)
    up = P3.ZNorm(up)
    if (z_pitch_adjust != 0):
        up = up + P3(0, 0, abs(z_pitch_adjust))
    l, r = abs(xsect[i][1][0]), abs(xsect[i][1][1])
    u, d = abs(xsect[i][1][2]), abs(xsect[i][1][3])
    pt_v = shp(nmapnodes[xsect[i][0]])
    v0 = pt_v + (-right*l + up*u)*dfac
    v1 = pt_v + (right*r + up*u)*dfac
    v2 = pt_v + (right*r - up*d)*dfac
    v3 = pt_v + (-right*l - up*d)*dfac
    cornconts[-1].append(v2)
    bskip = False
    if not bskip:
        if i != 0:
            AddQuad(v0, v1, U1, U0);
            AddQuad(v2, v3, U3, U2);
            AddQuad(v1, v2, U2, U1);
            AddQuad(v3, v0, U0, U3);
        if cover_end:
            if (i == 0):
                AddQuad(v0, v1, v2, v3)
            else:
                AddQuad(v3, v2, v1, v0)
    U0, U1, U2, U3 = v0, v1, v2, v3
    
 #break           
sendactivity(codetriangles=tris)
#sendactivity(contours=cornconts, materialnumber=1)
    
    
       
        
