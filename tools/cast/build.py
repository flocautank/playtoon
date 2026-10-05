# Synth Horde — distribution « Living Sound » : modèles et animations, générés par Blender en headless.
#   /chemin/vers/python-avec-bpy tools/cast/build.py      (bpy 4.x : pip install bpy)
# Sortie : js/bonk-cast-data.js (données compactes en base64, lues par js/bonk-cast.js). Aucun fichier .glb n'est livré.
# Conventions : Blender Z en haut, l'avant regarde -Y ; à l'export, (x, y, z) → (x, z, −y) : Y en haut, l'avant regarde +Z.
# Couleurs linéaires ; « émission » → cœur lumineux du shader néon. Noms de matériaux spéciaux (voir KIND).
import bpy, bmesh, math, json, base64, struct, os
from math import radians as R
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'js', 'bonk-cast-data.js')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = 30

# genre de surface (shader) : 0 normal, 1 accent (couleur du personnage), 2 écran-oscilloscope, 3 neige télé, 4 pulse au
# rythme de la musique, 5 accent secondaire
KIND = {'Accent': 1, 'Screen': 2, 'Noise': 3, 'Accent2': 5}

def mat(name, col, emit=0.0, beat=False):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m['col'] = list(col); m['emit'] = emit; m['beat'] = beat
    return m

def finish(o, material, bone=None, bevel=0.0, seg=1):
    if bevel:
        md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'ANGLE'
        bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='bv')
    o.data.materials.clear(); o.data.materials.append(material)
    if bone: o['bone'] = bone
    return o

def apply_tf(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

def box(name, size, loc, material, bone=None, bevel=0.0, rot=(0, 0, 0), taper=None, seg=1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.name = name; o.scale = size; apply_tf(o)
    if taper:
        for v in o.data.vertices:
            if v.co.z > 0: v.co.x *= taper[0]; v.co.y *= taper[1]
    return finish(o, material, bone, bevel, seg)

def cyl(name, r, depth, loc, material, bone=None, rot=(0, 0, 0), verts=12, r2=None, bevel=0.0):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    else: bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; o.name = name; apply_tf(o); return finish(o, material, bone, bevel)

def sphere(name, r, loc, material, bone=None, scale=(1, 1, 1), seg=10):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=max(4, seg // 2)); o = bpy.context.object; o.name = name; o.scale = scale; apply_tf(o)
    return finish(o, material, bone)

def torus(name, R1, r, loc, material, bone=None, rot=(0, 0, 0), scale=(1, 1, 1), seg=24, mseg=6):
    bpy.ops.mesh.primitive_torus_add(major_radius=R1, minor_radius=r, location=loc, rotation=rot, major_segments=seg, minor_segments=mseg)
    o = bpy.context.object; o.name = name; o.scale = scale; apply_tf(o); return finish(o, material, bone)

def ring(name, r_out, width, depth, loc, material, bone=None, rot=(0, 0, 0), verts=24):   # anneau plat (cylindre évidé)
    o = cyl(name, r_out, depth, loc, material, bone, rot, verts)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bpy.ops.object.mode_set(mode='OBJECT')
    bm = bmesh.new(); bm.from_mesh(o.data)
    caps = [f for f in bm.faces if len(f.verts) > 4]
    r = bmesh.ops.inset_individual(bm, faces=caps, thickness=width)
    bmesh.ops.delete(bm, geom=caps, context='FACES')
    bm.to_mesh(o.data); bm.free(); return o

def join(parts, name, origin=None):
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts: p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join(); o = bpy.context.object; o.name = name
    if origin is not None:   # pivot de la pièce (animation dans le shader)
        bpy.context.scene.cursor.location = origin; bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    return o

def clear():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)

# ===================================================================== empaquetage
C = Matrix(((1, 0, 0, 0), (0, 0, 1, 0), (0, -1, 0, 0), (0, 0, 0, 1)))   # Blender → three
def cv(v): return (v[0], v[2], -v[1])
def b64(b): return base64.b64encode(b).decode()

def matinfo(m):
    col = m['col']; e = m['emit']
    core = 0.45 + min(e, 4) * 0.14 if e else 0.22
    kind = KIND.get(m.name.split('.')[0], 4 if m['beat'] else 0)
    return tuple(col), core, kind

def pack(objs, part_of, var_of=lambda o: 0, fit=None, base=None, center=False):
    """objs : objets maillés ; part_of(o) → indice de pièce ; fit : plus grande dimension visée ; base : y du bas visé."""
    dg = bpy.context.evaluated_depsgraph_get()
    P, A, I, keys = [], [], [], {}
    piv = {}
    for o in objs:
        part = part_of(o); var = var_of(o)
        piv.setdefault(part, cv(o.matrix_world.translation))
        me = o.evaluated_get(dg).to_mesh(); bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.triangulate(bm, faces=bm.faces[:])
        M = o.matrix_world
        for f in bm.faces:
            m = o.material_slots[f.material_index].material if o.material_slots else None
            col, core, kind = matinfo(m)
            tri = []
            for v in f.verts:
                p = cv(M @ v.co)
                k = (round(p[0], 4), round(p[1], 4), round(p[2], 4), part, var, kind, col, core)
                if k not in keys:
                    keys[k] = len(P); P.append(p); A.append((col, core, part, kind, var))
                tri.append(keys[k])
            I.extend(tri)
        bm.free(); o.evaluated_get(dg).to_mesh_clear()
    xs, ys, zs = [p[0] for p in P], [p[1] for p in P], [p[2] for p in P]
    s = 1.0; off = [0, 0, 0]
    if fit:
        s = fit / max(max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs))
        off = [-(max(xs) + min(xs)) / 2 * s, 0, -(max(zs) + min(zs)) / 2 * s]
        off[1] = -(max(ys) + min(ys)) / 2 * s if center else (base - min(ys) * s if base is not None else 0)
    P = [(p[0] * s + off[0], p[1] * s + off[1], p[2] * s + off[2]) for p in P]
    pv = [[round(piv.get(i, (0, 0, 0))[j] * s + off[j], 4) for j in range(3)] for i in range(max(piv) + 1)]
    q = max(abs(c) for p in P for c in p) * 1.001
    pos = struct.pack('<%dh' % (len(P) * 3), *[int(round(c / q * 32767)) for p in P for c in p])
    at = bytearray()
    for col, core, part, kind, var in A:
        at += bytes([int(round(math.sqrt(max(0, min(1, c))) * 255)) for c in col] + [int(round(min(core, 5.1) * 50)), part, kind, var, 0])
    assert len(P) < 65536
    idx = struct.pack('<%dH' % len(I), *I)
    print(f'  {len(P)} sommets, {len(I) // 3} triangles')
    return {'q': q, 'n': len(P), 'p': b64(pos), 'a': b64(bytes(at)), 'i': b64(idx), 'piv': pv, 's': s, 'off': off}

def rigid(name, parts, fit, base=None, center=False):
    print(name)
    objs, idx = [], {}
    for i, o in enumerate(parts): objs.append(o); idx[o.name] = i
    DATA[name] = pack(objs, lambda o: idx[o.name], fit=fit, base=base, center=center)
    clear()

DATA = {}

# ===================================================================== HÉROS — un squelette, neuf têtes
ink, jacket = mat('Ink', (0.03, 0.03, 0.06)), mat('Jacket', (0.06, 0.1, 0.22))
acc, acc2 = mat('Accent', (0.15, 0.88, 1.0), 4), mat('Accent2', (1.0, 0.24, 0.94), 3)
screen, casing = mat('Screen', (0.05, 1.0, 0.75), 3), mat('Casing', (0.78, 0.74, 0.66))
sole, white = mat('Sole', (1.0, 0.9, 0.35), 2.2), mat('White', (0.9, 0.9, 0.95), 1.2)
gold, glass = mat('Gold', (1.0, 0.72, 0.22), 1.2), mat('Glass', (1.0, 0.75, 0.35), 1.0)
dark = mat('Dark', (0.09, 0.07, 0.14))
B = [('root', (0, 0, 0), None), ('hips', (0, 0, 0.82), 'root'), ('spine', (0, 0, 0.95), 'hips'),
     ('chest', (0, 0, 1.18), 'spine'), ('neck', (0, 0, 1.36), 'chest'), ('head', (0, 0, 1.44), 'neck')]
TAILS = {'root': (0, 0.3, 0), 'hips': (0, 0, 0.95), 'spine': (0, 0, 1.18), 'chest': (0, 0, 1.36), 'neck': (0, 0, 1.44), 'head': (0, 0, 1.95)}
for s, x in (('L', 1), ('R', -1)):
    B += [(f'upperarm.{s}', (0.24 * x, 0, 1.32), 'chest'), (f'forearm.{s}', (0.27 * x, 0, 1.08), f'upperarm.{s}'), (f'hand.{s}', (0.28 * x, 0, 0.86), f'forearm.{s}'),
          (f'thigh.{s}', (0.1 * x, 0, 0.82), 'hips'), (f'shin.{s}', (0.11 * x, 0, 0.47), f'thigh.{s}'), (f'foot.{s}', (0.11 * x, 0, 0.14), f'shin.{s}')]
    TAILS.update({f'upperarm.{s}': (0.27 * x, 0, 1.08), f'forearm.{s}': (0.28 * x, 0, 0.86), f'hand.{s}': (0.28 * x, 0, 0.76),
                  f'thigh.{s}': (0.11 * x, 0, 0.47), f'shin.{s}': (0.11 * x, 0, 0.14), f'foot.{s}': (0.11 * x, -0.2, 0.06)})
for i in range(5):
    B.append((f'scarf{i}', (0.08, 0.16 + i * 0.16, 1.38 - i * 0.02), 'neck' if i == 0 else f'scarf{i - 1}'))
    TAILS[f'scarf{i}'] = (0.08, 0.32 + i * 0.16, 1.36 - i * 0.02)
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
arm = bpy.context.object; arm.name = 'Hero'; eb = arm.data.edit_bones; eb.remove(eb[0])
for n, h, parent in B:
    b = eb.new(n); b.head = h; b.tail = TAILS[n]; b.roll = 0
    if parent: b.parent = eb[parent]
bpy.ops.object.mode_set(mode='OBJECT')
BONES = [b[0] for b in B]

HERO, VAR = [], {}
def H(o, var=0): HERO.append(o); VAR[o.name] = var; return o
# corps commun
for o in [box('hips', (0.3, 0.2, 0.16), (0, 0, 0.88), ink, 'hips', 0.03),
          box('torso', (0.4, 0.26, 0.44), (0, 0, 1.15), jacket, 'spine', 0.05, taper=(1.12, 1.05)),
          box('zip', (0.03, 0.02, 0.4), (0, -0.14, 1.15), acc, 'spine'),
          box('collar', (0.36, 0.3, 0.08), (0, 0, 1.38), jacket, 'chest', 0.03)]: H(o)
for s, x in (('L', 1), ('R', -1)):
    for o in [cyl(f'uarm.{s}', 0.045, 0.26, (0.255 * x, 0, 1.2), jacket, f'upperarm.{s}', verts=6),
              cyl(f'farm.{s}', 0.04, 0.22, (0.275 * x, 0, 0.97), ink, f'forearm.{s}', verts=6),
              box(f'cuff.{s}', (0.1, 0.1, 0.04), (0.28 * x, 0, 0.88), acc, f'forearm.{s}'),
              sphere(f'hand.{s}', 0.07, (0.28 * x, 0, 0.8), casing, f'hand.{s}', (1, 0.8, 1.1), seg=8),
              cyl(f'thigh.{s}', 0.055, 0.34, (0.105 * x, 0, 0.65), ink, f'thigh.{s}', verts=6),
              cyl(f'shin.{s}', 0.05, 0.32, (0.11 * x, 0, 0.31), ink, f'shin.{s}', verts=6),
              box(f'shoe.{s}', (0.22, 0.4, 0.17), (0.11 * x, -0.07, 0.09), casing, f'foot.{s}', 0.05),
              box(f'toe.{s}', (0.2, 0.12, 0.1), (0.11 * x, -0.23, 0.06), acc2, f'foot.{s}', 0.03),
              box(f'sole.{s}', (0.23, 0.41, 0.03), (0.11 * x, -0.07, 0.015), sole, f'foot.{s}')]: H(o)
for i in range(5):
    H(box(f'scarf{i}', (0.16 - i * 0.02, 0.17, 0.025), (0.08, 0.24 + i * 0.16, 1.37 - i * 0.02), acc2, f'scarf{i}'))
Z = 1.72   # centre des têtes
def heads(var, objs):
    for o in objs: H(o, var)
# 1 Glitch : moniteur cathodique, visage oscilloscope, antennes
heads(1, [box('crt', (0.66, 0.52, 0.5), (0, 0.02, Z), casing, 'head', 0.05, taper=(0.92, 0.9)), box('crtback', (0.46, 0.3, 0.36), (0, 0.3, Z), casing, 'head', 0.04),
          box('bezel', (0.56, 0.04, 0.4), (0, -0.25, Z), ink, 'head'), box('face', (0.48, 0.02, 0.32), (0, -0.27, Z), screen, 'head'),
          cyl('knob1', 0.035, 0.04, (0.24, -0.25, Z - 0.19), acc2, 'head', rot=(R(90), 0, 0), verts=8), cyl('knob2', 0.035, 0.04, (0.15, -0.25, Z - 0.19), acc, 'head', rot=(R(90), 0, 0), verts=8),
          cyl('antL', 0.012, 0.42, (0.12, 0.05, Z + 0.4), ink, 'head', rot=(0, R(22), 0), verts=4), cyl('antR', 0.012, 0.42, (-0.12, 0.05, Z + 0.4), ink, 'head', rot=(0, R(-22), 0), verts=4),
          sphere('tipL', 0.035, (0.2, 0.05, Z + 0.59), acc2, 'head', seg=6), sphere('tipR', 0.035, (-0.2, 0.05, Z + 0.59), acc, 'head', seg=6)])
# 2 Ronin : tête-cassette, bobines-yeux, bandeau
heads(2, [box('tape', (0.72, 0.2, 0.46), (0, 0, Z), dark, 'head', 0.04), box('label', (0.6, 0.02, 0.14), (0, -0.105, Z + 0.13), acc, 'head'),
          box('window', (0.4, 0.02, 0.13), (0, -0.105, Z - 0.03), ink, 'head'),
          cyl('reelL', 0.09, 0.04, (0.15, -0.11, Z - 0.03), white, 'head', rot=(R(90), 0, 0), verts=10), cyl('reelR', 0.09, 0.04, (-0.15, -0.11, Z - 0.03), white, 'head', rot=(R(90), 0, 0), verts=10),
          cyl('hubL', 0.035, 0.05, (0.15, -0.125, Z - 0.03), ink, 'head', rot=(R(90), 0, 0), verts=6), cyl('hubR', 0.035, 0.05, (-0.15, -0.125, Z - 0.03), ink, 'head', rot=(R(90), 0, 0), verts=6),
          box('band', (0.76, 0.24, 0.06), (0, 0, Z + 0.2), acc2, 'head'), box('knot', (0.08, 0.1, 0.08), (0.2, 0.12, Z + 0.2), acc2, 'head'),
          box('tail1', (0.05, 0.22, 0.04), (0.22, 0.25, Z + 0.15), acc2, 'head', rot=(R(-25), 0, 0)), box('tail2', (0.05, 0.2, 0.04), (0.16, 0.24, Z + 0.1), acc2, 'head', rot=(R(-40), 0, 0))])
# 3 Volt : tube électronique, filament allumé
heads(3, [cyl('socket', 0.22, 0.14, (0, 0, Z - 0.22), ink, 'head', verts=10), sphere('bulb', 0.26, (0, 0, Z + 0.06), glass, 'head', (1, 1, 1.45), seg=12),
          cyl('tip', 0.04, 0.08, (0, 0, Z + 0.45), glass, 'head', verts=6, r2=0.01),
          box('fil1', (0.04, 0.03, 0.2), (-0.07, -0.25, Z + 0.04), acc, 'head', rot=(0, R(25), 0)), box('fil2', (0.04, 0.03, 0.2), (0.07, -0.25, Z + 0.04), acc, 'head', rot=(0, R(-25), 0)),
          sphere('eyeL', 0.045, (0.09, -0.24, Z + 0.17), white, 'head', seg=6), sphere('eyeR', 0.045, (-0.09, -0.24, Z + 0.17), white, 'head', seg=6),
          box('ringA', (0.46, 0.46, 0.04), (0, 0, Z - 0.14), acc2, 'head')])
# 4 Bastion : caisson de basse en guise de tête, un œil-membrane
heads(4, [box('cab', (0.74, 0.56, 0.6), (0, 0, Z), dark, 'head', 0.05), ring('cone', 0.22, 0.06, 0.04, (0, -0.29, Z - 0.02), acc, 'head', rot=(R(90), 0, 0), verts=16),
          cyl('woof', 0.17, 0.05, (0, -0.28, Z - 0.02), ink, 'head', rot=(R(90), 0, 0), verts=14, r2=0.06), sphere('dust', 0.06, (0, -0.31, Z - 0.02), white, 'head', seg=6),
          cyl('tweet', 0.05, 0.04, (0.22, -0.29, Z + 0.21), acc2, 'head', rot=(R(90), 0, 0), verts=8),
          box('padL', (0.2, 0.3, 0.12), (0.33, 0, Z - 0.35), acc2, 'head', 0.03), box('padR', (0.2, 0.3, 0.12), (-0.33, 0, Z - 0.35), acc2, 'head', 0.03)])
# 5 Nova : tête-mégaphone
heads(5, [cyl('horn', 0.1, 0.5, (0, -0.1, Z), casing, 'head', rot=(R(90), 0, 0), verts=12, r2=0.32), ring('lip', 0.34, 0.05, 0.05, (0, -0.36, Z), acc, 'head', rot=(R(90), 0, 0), verts=14),
          cyl('throat', 0.27, 0.02, (0, -0.33, Z), ink, 'head', rot=(R(90), 0, 0), verts=12), cyl('back', 0.16, 0.2, (0, 0.2, Z), dark, 'head', rot=(R(90), 0, 0), verts=10),
          sphere('eyeL', 0.05, (0.09, -0.32, Z + 0.07), white, 'head', seg=6), sphere('eyeR', 0.05, (-0.09, -0.32, Z + 0.07), white, 'head', seg=6),
          box('handle', (0.05, 0.18, 0.14), (0, 0.05, Z - 0.22), acc2, 'head')])
# 6 Orbit : tête ronde ceinte d'un vinyle (comme une planète)
heads(6, [sphere('globe', 0.28, (0, 0, Z), dark, 'head', seg=12), ring('vinyl', 0.5, 0.17, 0.02, (0, 0, Z), ink, 'head', rot=(R(16), R(-10), 0), verts=24),
          ring('groove', 0.42, 0.02, 0.025, (0, 0, Z), acc, 'head', rot=(R(16), R(-10), 0), verts=24),
          sphere('eyeL', 0.055, (0.1, -0.25, Z + 0.05), acc2, 'head', seg=6), sphere('eyeR', 0.055, (-0.1, -0.25, Z + 0.05), acc2, 'head', seg=6)])
# 7 Blitz : casque de DJ, visière, gros écouteurs
heads(7, [box('helm', (0.5, 0.5, 0.5), (0, 0, Z), dark, 'head', 0.12, seg=2), box('visor', (0.46, 0.04, 0.14), (0, -0.25, Z + 0.02), acc, 'head', 0.02),
          cyl('cupL', 0.15, 0.1, (0.3, 0, Z), acc2, 'head', rot=(0, R(90), 0), verts=12), cyl('cupR', 0.15, 0.1, (-0.3, 0, Z), acc2, 'head', rot=(0, R(90), 0), verts=12),
          torus('band', 0.31, 0.03, (0, 0, Z + 0.05), ink, 'head', rot=(0, R(90), 0), scale=(1, 1, 1), seg=16, mseg=4),
          box('fin', (0.04, 0.3, 0.12), (0, 0.08, Z + 0.3), acc, 'head')])
# 8 Miser : tête-micro dorée
heads(8, [sphere('grill', 0.3, (0, 0, Z + 0.05), gold, 'head', seg=12), cyl('collar', 0.22, 0.14, (0, 0, Z - 0.26), ink, 'head', verts=10),
          torus('band', 0.29, 0.025, (0, 0, Z - 0.03), acc2, 'head', seg=16, mseg=4),
          sphere('eyeL', 0.05, (0.1, -0.27, Z + 0.08), ink, 'head', seg=6), sphere('eyeR', 0.05, (-0.1, -0.27, Z + 0.08), ink, 'head', seg=6),
          box('slot', (0.14, 0.03, 0.03), (0, -0.05, Z + 0.35), acc, 'head')])
# 9 Hex : bouton de synthé, couronne de diodes
heads(9, [cyl('knob', 0.3, 0.36, (0, 0, Z - 0.02), dark, 'head', verts=14), cyl('cap', 0.22, 0.12, (0, 0, Z + 0.22), ink, 'head', verts=12, r2=0.18),
          box('pointer', (0.04, 0.2, 0.03), (0, -0.1, Z + 0.29), acc, 'head')]
      + [sphere(f'led{i}', 0.03, (math.sin(a) * 0.34, -math.cos(a) * 0.34, Z + 0.12), acc2 if i < 5 else ink, 'head', seg=6) for i, a in enumerate([R(-110 + k * 36.6) for k in range(7)])]
      + [box('eyeL', (0.08, 0.03, 0.05), (0.1, -0.3, Z + 0.0), acc, 'head'), box('eyeR', (0.08, 0.03, 0.05), (-0.1, -0.3, Z + 0.0), acc, 'head')])

print('héros')
hero = pack(HERO, lambda o: BONES.index(o['bone']), lambda o: VAR[o.name])

# --- animations (mêmes clés que l'aperçu), échantillonnées à 30 i/s ---
UP = ('hips', 'spine', 'chest', 'neck', 'head')
def act(name, keys, loop=True):
    a = bpy.data.actions.new(name); arm.animation_data_create(); arm.animation_data.action = a
    for pb in arm.pose.bones: pb.rotation_mode = 'XYZ'; pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0); pb.scale = (1, 1, 1)
    for bone, ks in keys.items():
        if bone.startswith('_loc:') or bone.startswith('_scl:'):
            pb = arm.pose.bones[bone[5:]]; attr = 'location' if bone[1] == 'l' else 'scale'
            for f, v in ks: setattr(pb, attr, v); pb.keyframe_insert(attr, frame=f)
            continue
        pb = arm.pose.bones[bone]; sg = -1 if bone in UP else 1
        for f, (x, y, z) in ks: pb.rotation_euler = (R(x * sg), R(y), R(z)); pb.keyframe_insert('rotation_euler', frame=f)
    for fc in a.fcurves:
        for k in fc.keyframe_points: k.interpolation = 'BEZIER'
        if loop: fc.modifiers.new('CYCLES')
    return a
run = {'_loc:root': [(1, (0, 0, 0)), (5, (0, 0, 0.09)), (9, (0, 0, -0.02)), (13, (0, 0, 0.09)), (17, (0, 0, -0.02))],
       'spine': [(1, (-14, 0, 6)), (9, (-14, 0, -6)), (17, (-14, 0, 6))],
       'head': [(1, (8, 0, -8)), (3, (2, 0, -6)), (9, (8, 0, 8)), (11, (2, 0, 6)), (17, (8, 0, -8))],
       'thigh.L': [(1, (-55, 0, 0)), (9, (40, 0, 0)), (17, (-55, 0, 0))], 'thigh.R': [(1, (40, 0, 0)), (9, (-55, 0, 0)), (17, (40, 0, 0))],
       'shin.L': [(1, (20, 0, 0)), (5, (15, 0, 0)), (9, (70, 0, 0)), (13, (100, 0, 0)), (17, (20, 0, 0))],
       'shin.R': [(1, (70, 0, 0)), (5, (100, 0, 0)), (9, (20, 0, 0)), (13, (15, 0, 0)), (17, (70, 0, 0))],
       'foot.L': [(1, (-10, 0, 0)), (9, (25, 0, 0)), (17, (-10, 0, 0))], 'foot.R': [(1, (25, 0, 0)), (9, (-10, 0, 0)), (17, (25, 0, 0))],
       'upperarm.L': [(1, (55, 0, -12)), (9, (-60, 0, -12)), (17, (55, 0, -12))], 'upperarm.R': [(1, (-60, 0, 12)), (9, (55, 0, 12)), (17, (-60, 0, 12))],
       'forearm.L': [(1, (-80, 0, 0)), (17, (-80, 0, 0))], 'forearm.R': [(1, (-80, 0, 0)), (17, (-80, 0, 0))]}
idle = {'_loc:root': [(1, (0, 0, 0)), (16, (0, 0, -0.025)), (31, (0, 0, 0))],
        'head': [(1, (0, 0, -6)), (8, (4, 0, 0)), (16, (0, 0, 6)), (24, (4, 0, 0)), (31, (0, 0, -6))],
        'chest': [(1, (0, 0, 0)), (16, (-4, 0, 0)), (31, (0, 0, 0))],
        'upperarm.L': [(1, (0, 0, -8)), (16, (8, 0, -12)), (31, (0, 0, -8))], 'upperarm.R': [(1, (0, 0, 8)), (16, (8, 0, 12)), (31, (0, 0, 8))],
        'forearm.L': [(1, (-25, 0, 0)), (31, (-25, 0, 0))], 'forearm.R': [(1, (-25, 0, 0)), (31, (-25, 0, 0))],
        'thigh.L': [(1, (0, 0, 4)), (16, (-6, 0, 4)), (31, (0, 0, 4))], 'shin.L': [(1, (0, 0, 0)), (16, (12, 0, 0)), (31, (0, 0, 0))],
        'thigh.R': [(1, (0, 0, -4)), (31, (0, 0, -4))]}
jump = {'_loc:root': [(1, (0, 0, 0)), (4, (0, 0, -0.22)), (7, (0, 0, 0.08)), (20, (0, 0, 0))],
        '_scl:root': [(1, (1, 1, 1)), (4, (1.15, 1.15, 0.8)), (7, (0.88, 0.88, 1.18)), (12, (1, 1, 1)), (20, (1, 1, 1))],
        'spine': [(1, (0, 0, 0)), (4, (-25, 0, 0)), (8, (12, 0, 0)), (14, (-18, 0, 0)), (20, (0, 0, 0))],
        'head': [(1, (0, 0, 0)), (4, (18, 0, 0)), (8, (-15, 0, 0)), (14, (10, 0, 0)), (20, (0, 0, 0))],
        'thigh.L': [(1, (0, 0, 0)), (4, (-55, 0, 0)), (8, (12, 0, 0)), (13, (-85, 0, 0)), (20, (0, 0, 0))],
        'thigh.R': [(1, (0, 0, 0)), (4, (-55, 0, 0)), (8, (18, 0, 0)), (13, (-45, 0, 0)), (20, (0, 0, 0))],
        'shin.L': [(1, (0, 0, 0)), (4, (95, 0, 0)), (8, (5, 0, 0)), (13, (120, 0, 0)), (20, (0, 0, 0))],
        'shin.R': [(1, (0, 0, 0)), (4, (95, 0, 0)), (8, (5, 0, 0)), (13, (75, 0, 0)), (20, (0, 0, 0))],
        'upperarm.L': [(1, (0, 0, 0)), (4, (45, 0, -10)), (8, (-165, 0, -30)), (14, (-70, 0, -60)), (20, (0, 0, 0))],
        'upperarm.R': [(1, (0, 0, 0)), (4, (45, 0, 10)), (8, (-165, 0, 30)), (14, (-70, 0, 60)), (20, (0, 0, 0))]}
slide = {'_loc:root': [(1, (0, 0, 0)), (4, (0, 0, -0.55)), (20, (0, 0, -0.55))],
         'hips': [(1, (0, 0, 0)), (4, (-40, 0, 0)), (20, (-40, 0, 0))], 'spine': [(1, (0, 0, 0)), (4, (25, 0, 0)), (20, (25, 0, 0))],
         'head': [(1, (0, 0, 0)), (4, (25, 0, 0)), (20, (25, 0, 0))],
         'thigh.L': [(1, (0, 0, 0)), (4, (-80, 0, 0)), (20, (-80, 0, 0))], 'shin.L': [(1, (0, 0, 0)), (4, (5, 0, 0)), (20, (5, 0, 0))],
         'thigh.R': [(1, (0, 0, 0)), (4, (-35, 0, 0)), (20, (-35, 0, 0))], 'shin.R': [(1, (0, 0, 0)), (4, (95, 0, 0)), (20, (95, 0, 0))],
         'upperarm.L': [(1, (0, 0, 0)), (4, (25, 0, -70)), (20, (25, 0, -70))], 'upperarm.R': [(1, (0, 0, 0)), (4, (-120, 0, 30)), (20, (-120, 0, 30))]}
hit = {'_scl:root': [(1, (1, 1, 1)), (3, (1.12, 1.12, 0.86)), (7, (0.95, 0.95, 1.06)), (12, (1, 1, 1))],
       'spine': [(1, (0, 0, 0)), (3, (22, 0, 10)), (12, (0, 0, 0))], 'head': [(1, (0, 0, 0)), (3, (28, 0, -16)), (6, (-10, 0, 8)), (12, (0, 0, 0))],
       'upperarm.L': [(1, (0, 0, 0)), (3, (-50, 0, -50)), (12, (0, 0, 0))], 'upperarm.R': [(1, (0, 0, 0)), (3, (-50, 0, 50)), (12, (0, 0, 0))]}
death = {'_loc:root': [(1, (0, 0, 0)), (10, (0, 0, -0.3)), (22, (0, 0.25, -0.72)), (40, (0, 0.25, -0.72))],
         'hips': [(1, (0, 0, 0)), (10, (0, 0, 0)), (22, (70, 0, 12)), (40, (88, 0, 12))],
         'spine': [(1, (0, 0, 0)), (8, (-30, 0, 0)), (22, (10, 0, 0))],
         'neck': [(1, (0, 0, 0)), (20, (0, 0, 0)), (26, (-25, 0, 30)), (40, (-35, 0, 40))],
         'thigh.L': [(1, (0, 0, 0)), (10, (-60, 0, 0)), (40, (-10, 0, 10))], 'shin.L': [(1, (0, 0, 0)), (10, (100, 0, 0)), (40, (20, 0, 0))],
         'thigh.R': [(1, (0, 0, 0)), (10, (-50, 0, 0)), (40, (-30, 0, -5))], 'shin.R': [(1, (0, 0, 0)), (10, (90, 0, 0)), (40, (60, 0, 0))],
         'upperarm.L': [(1, (0, 0, 0)), (10, (-120, 0, -40)), (40, (-160, 0, -70))], 'upperarm.R': [(1, (0, 0, 0)), (10, (-110, 0, 50)), (40, (-150, 0, 80))]}
victory = {'_loc:root': [(1, (0, 0, 0)), (6, (0, 0, -0.12)), (11, (0, 0, 0.35)), (16, (0, 0, -0.06)), (21, (0, 0, 0))],
           'upperarm.L': [(1, (0, 0, -10)), (6, (20, 0, -10)), (11, (-150, 0, -45)), (21, (-150, 0, -45))],
           'upperarm.R': [(1, (0, 0, 10)), (6, (20, 0, 10)), (11, (-150, 0, 45)), (21, (-150, 0, 45))],
           'forearm.L': [(1, (0, 0, 0)), (11, (-20, 0, 0)), (21, (-20, 0, 0))], 'forearm.R': [(1, (0, 0, 0)), (11, (-20, 0, 0)), (21, (-20, 0, 0))],
           'head': [(1, (0, 0, 0)), (11, (-15, 0, 0)), (16, (-10, 0, 10)), (21, (-15, 0, 0))],
           'thigh.L': [(1, (0, 0, 0)), (6, (-40, 0, 0)), (11, (10, 0, 0)), (21, (0, 0, 0))], 'shin.L': [(1, (0, 0, 0)), (6, (70, 0, 0)), (11, (30, 0, 0)), (21, (0, 0, 0))]}
CLIPS = {}
pbs = [arm.pose.bones[n] for n in BONES]
heads0 = [Vector(arm.data.bones[n].head_local) for n in BONES]
par = [BONES.index(b[2]) if b[2] else -1 for b in B]
for name, keys, loop in (('Idle', idle, True), ('Run', run, True), ('Jump', jump, False), ('Slide', slide, False), ('Hit', hit, False), ('Death', death, False), ('Victory', victory, False)):
    a = act(name, keys, loop); f0, f1 = (int(v) for v in a.frame_range)
    frames = list(range(f0, f1 + 1))
    tracks = {i: {'q': [], 'p': [], 's': []} for i in range(len(BONES))}
    for f in frames:
        bpy.context.scene.frame_set(f)
        D = [pb.matrix @ pb.bone.matrix_local.inverted() for pb in pbs]
        for i in range(len(BONES)):
            Dp = D[par[i]] if par[i] >= 0 else Matrix.Identity(4); hp = heads0[par[i]] if par[i] >= 0 else Vector((0, 0, 0))
            L = Matrix.Translation(-hp) @ Dp.inverted() @ D[i] @ Matrix.Translation(heads0[i])
            L3 = C @ L @ C.inverted()
            loc, rot, scl = L3.decompose()
            tracks[i]['q'] += [rot.x, rot.y, rot.z, rot.w]; tracks[i]['p'] += list(loc); tracks[i]['s'] += list(scl)
    out = []
    for i, tk in tracks.items():
        n = len(frames)
        q = tk['q']
        if max(abs(q[j] - q[j % 4]) for j in range(len(q))) > 1e-4: out.append([i, 'q', b64(struct.pack('<%dh' % len(q), *[int(round(c * 32767)) for c in q]))])
        for kk in ('p', 's'):
            v = tk[kk]
            if max(abs(v[j] - v[j % 3]) for j in range(len(v))) > 1e-4: out.append([i, kk, b64(struct.pack('<%df' % len(v), *v))])
    CLIPS[name] = {'n': len(frames), 'fps': 30, 'loop': loop, 't': out}
    arm.animation_data.action = None
hero['bones'] = [[BONES[i], par[i], *[round(c, 4) for c in cv(heads0[i] - (heads0[par[i]] if par[i] >= 0 else Vector()))]] for i in range(len(BONES))]
hero['clips'] = CLIPS
DATA['hero'] = hero
clear()

# ===================================================================== HORDE (pièces rigides animées dans le shader)
# drone → STATIC : cube de neige télé, cadre néon, antenne
frame, noise = mat('Frame', (1.0, 0.24, 0.94), 3, True), mat('Noise', (0.8, 0.8, 0.9), 2)
o1 = box('screen', (0.62, 0.62, 0.62), (0, 0, 0), noise)
edges = []
for a in (-1, 1):
    for b2 in (-1, 1):
        edges += [box(f'ex{a}{b2}', (0.7, 0.06, 0.06), (0, a * 0.32, b2 * 0.32), frame), box(f'ey{a}{b2}', (0.06, 0.7, 0.06), (a * 0.32, 0, b2 * 0.32), frame),
                  box(f'ez{a}{b2}', (0.06, 0.06, 0.7), (a * 0.32, b2 * 0.32, 0), frame)]
o2 = join(edges + [cyl('ant', 0.015, 0.4, (0.15, 0, 0.5), frame, rot=(0, R(20), 0), verts=4), sphere('tip', 0.05, (0.22, 0, 0.7), frame, seg=6),
                   box('eyeL', (0.1, 0.02, 0.06), (0.12, -0.32, 0.08), mat('EyeW', (1, 1, 1), 4)), box('eyeR', (0.1, 0.02, 0.06), (-0.12, -0.32, 0.08), mat('EyeW', (1, 1, 1), 4))], 'frame', (0, 0, 0))
rigid('drone', [o1, o2], 1.0, center=True)

# spike → CLIPPER : onde en dents de scie, deux yeux
saw, eye, pupil = mat('Saw', (1.0, 0.63, 0.13), 2.5), mat('Eye', (1, 1, 1), 5), mat('Pupil', (0.02, 0.02, 0.03))
me = bpy.data.meshes.new('zig'); bm = bmesh.new()
pts = [(-0.55, 0), (-0.3, 0.75), (-0.3, 0.1), (0, 0.85), (0, 0.15), (0.3, 0.95), (0.3, 0.2), (0.55, 0.6), (0.55, 0)]
vs = [bm.verts.new((x, -0.12, z)) for x, z in pts] + [bm.verts.new((x, 0.12, z)) for x, z in pts]
n = len(pts); bm.faces.new(vs[:n][::-1]); bm.faces.new(vs[n:])
for i in range(n): j = (i + 1) % n; bm.faces.new((vs[i], vs[j], vs[n + j], vs[n + i]))
bm.to_mesh(me); bm.free(); zig = bpy.data.objects.new('body', me); bpy.context.collection.objects.link(zig); zig.data.materials.append(saw)
eyes = join([sphere('e1', 0.08, (-0.1, -0.14, 0.42), eye, seg=8), sphere('e2', 0.08, (0.12, -0.14, 0.48), eye, seg=8),
             sphere('p1', 0.035, (-0.1, -0.2, 0.42), pupil, seg=6), sphere('p2', 0.035, (0.12, -0.2, 0.48), pupil, seg=6)], 'eyes', (0.01, -0.15, 0.45))
rigid('spike', [zig, eyes], 1.1, base=-0.5)

# brute → SUBWOOFER : caisson qui se dandine, membrane qui cogne au rythme
cab, conem, rim = mat('Cabinet', (0.1, 0.03, 0.06)), mat('Cone', (0.08, 0.08, 0.1)), mat('Rim', (1.0, 0.19, 0.31), 4, True)
o1 = join([box('body', (0.8, 0.7, 0.9), (0, 0, 0.75), cab, None, 0.05), box('trim', (0.82, 0.72, 0.04), (0, 0, 1.2), rim)], 'body', (0, 0, 0.75))
o2 = join([ring('cone', 0.32, 0.06, 0.05, (0, -0.36, 0.72), rim, rot=(R(90), 0, 0), verts=16), cyl('c2', 0.27, 0.06, (0, -0.35, 0.72), conem, rot=(R(90), 0, 0), verts=14, r2=0.09),
           cyl('dust', 0.08, 0.06, (0, -0.39, 0.72), rim, rot=(R(90), 0, 0), verts=8)], 'cone', (0, -0.36, 0.72))
o3 = join([box('legL', (0.16, 0.2, 0.3), (0.22, 0, 0.15), cab), box('footL', (0.22, 0.3, 0.08), (0.22, -0.04, 0.04), rim)], 'legL', (0.22, 0, 0.3))
o4 = join([box('legR', (0.16, 0.2, 0.3), (-0.22, 0, 0.15), cab), box('footR', (0.22, 0.3, 0.08), (-0.22, -0.04, 0.04), rim)], 'legR', (-0.22, 0, 0.3))
rigid('brute', [o1, o2, o3, o4], 1.25, base=-0.5)

# gunner → GRAMOPHONE : caisse en bois, pavillon qui recule à chaque tir, manivelle
wood, brass, cyan = mat('Wood', (0.12, 0.05, 0.04)), mat('Brass', (0.15, 0.88, 1.0), 2.2, True), mat('CyanEye', (0.7, 1, 1), 4)
o1 = join([box('case', (0.6, 0.5, 0.32), (0, 0, 0.3), wood, None, 0.03), box('trim', (0.62, 0.52, 0.04), (0, 0, 0.47), brass),
           cyl('plat', 0.2, 0.04, (0, 0.05, 0.5), mat('Plat', (0.03, 0.03, 0.05)), verts=12), box('eyeL', (0.08, 0.02, 0.05), (0.12, -0.26, 0.33), cyan), box('eyeR', (0.08, 0.02, 0.05), (-0.12, -0.26, 0.33), cyan)]
          + [box(f'leg{i}', (0.08, 0.08, 0.14), (x, y, 0.07), wood) for i, (x, y) in enumerate([(0.22, 0.18), (-0.22, 0.18), (0.22, -0.18), (-0.22, -0.18)])], 'case', (0, 0, 0.3))
o2 = join([cyl('neck', 0.04, 0.4, (0, 0.05, 0.68), brass, rot=(R(-25), 0, 0), verts=6),
           cyl('bell', 0.08, 0.55, (0, -0.2, 0.95), brass, rot=(R(70), 0, 0), verts=12, r2=0.38), cyl('mouth', 0.36, 0.02, (0, -0.47, 1.05), mat('Throat', (0.15, 0.88, 1.0), 1.6, True), rot=(R(70), 0, 0), verts=12)], 'horn', (0, 0.05, 0.5))
o3 = join([cyl('crank', 0.025, 0.2, (0.38, 0.05, 0.32), brass, rot=(0, R(90), 0), verts=4), box('handle', (0.04, 0.04, 0.14), (0.48, 0.05, 0.38), brass)], 'crank', (0.38, 0.05, 0.32))
rigid('gunner', [o1, o2, o3], 1.25, base=-0.5)

# charger → NEEDLE : disque vinyle qui tourne, bras de lecture qui charge
arm_m, vinyl, label, ruby = mat('Arm', (0.75, 0.78, 0.85)), mat('Vinyl', (0.03, 0.03, 0.05)), mat('Label', (0.49, 1.0, 0.54), 2.5, True), mat('Stylus', (0.49, 1.0, 0.54), 5)
groove = mat('Groove', (0.3, 0.9, 0.5), 1.2)
disc = join([cyl('disc', 0.55, 0.06, (0, 0, 0.05), vinyl, verts=24), cyl('label', 0.2, 0.07, (0, 0, 0.05), label, verts=12), ring('g1', 0.4, 0.015, 0.065, (0, 0, 0.05), groove, verts=24),
             cyl('spindle', 0.03, 0.12, (0, 0, 0.12), arm_m, verts=6)], 'disc', (0, 0, 0.05))
post = join([cyl('pivot', 0.07, 0.42, (0.42, 0.3, 0.27), arm_m, verts=8), box('eyeL', (0.06, 0.02, 0.04), (0.45, 0.22, 0.38), ruby), box('eyeR', (0.06, 0.02, 0.04), (0.38, 0.22, 0.38), ruby)], 'post', (0.42, 0.3, 0.27))
armo = join([cyl('hub', 0.08, 0.14, (0.42, 0.3, 0.5), arm_m, rot=(0, R(90), 0), verts=8), cyl('b1', 0.035, 0.5, (0.42, 0.05, 0.5), arm_m, rot=(R(90), 0, 0), verts=6),
             cyl('b2', 0.035, 0.4, (0.3, -0.33, 0.5), arm_m, rot=(R(90), 0, R(-35)), verts=6), box('counter', (0.18, 0.18, 0.18), (0.42, 0.42, 0.5), arm_m),
             box('head', (0.14, 0.24, 0.08), (0.15, -0.58, 0.46), arm_m), cyl('stylus', 0.03, 0.22, (0.15, -0.64, 0.33), ruby, verts=4, r2=0.004)], 'arm', (0.42, 0.3, 0.5))
rigid('charger', [disc, post, armo], 1.25, base=-0.5)

# splitter → CASSETTE : marche sur la tranche, bobines-yeux qui tournent ; à sa mort, la bande se déchire en trois Clippers
shell, lab, reel = mat('Shell', (0.42, 0.25, 0.85), 0.6), mat('Lab', (1.0, 0.9, 0.95), 1.5, True), mat('Reel', (0.95, 0.95, 1.0), 1.5)
o1 = join([box('shell', (0.9, 0.16, 0.58), (0, 0, 0.55), shell, None, 0.03), box('label', (0.76, 0.02, 0.18), (0, -0.085, 0.72), lab),
           box('win', (0.5, 0.02, 0.16), (0, -0.085, 0.5), mat('Win', (0.02, 0.02, 0.05))), box('lip', (0.6, 0.18, 0.1), (0, 0, 0.27), shell)], 'shell', (0, 0, 0.55))
rl = join([cyl('rl', 0.1, 0.04, (0.16, -0.1, 0.5), reel, rot=(R(90), 0, 0), verts=6), cyl('rlh', 0.04, 0.05, (0.16, -0.11, 0.5), mat('Hub', (0.05, 0.03, 0.08)), rot=(R(90), 0, 0), verts=6)], 'reelL', (0.16, -0.1, 0.5))
rr = join([cyl('rr', 0.1, 0.04, (-0.16, -0.1, 0.5), reel, rot=(R(90), 0, 0), verts=6), cyl('rrh', 0.04, 0.05, (-0.16, -0.11, 0.5), mat('Hub', (0.05, 0.03, 0.08)), rot=(R(90), 0, 0), verts=6)], 'reelR', (-0.16, -0.1, 0.5))
lL = join([box('lL', (0.06, 0.06, 0.2), (0.2, 0, 0.12), shell), box('fL', (0.12, 0.18, 0.05), (0.2, -0.03, 0.025), lab)], 'legL', (0.2, 0, 0.24))
lR = join([box('lR', (0.06, 0.06, 0.2), (-0.2, 0, 0.12), shell), box('fR', (0.12, 0.18, 0.05), (-0.2, -0.03, 0.025), lab)], 'legR', (-0.2, 0, 0.24))
rigid('splitter', [o1, rl, rr, lL, lR], 1.25, base=-0.5)

# bomber → TUBE : lampe électronique qui chauffe et explose
sock, bulb, fil = mat('Sock', (0.06, 0.04, 0.05)), mat('Bulb', (1.0, 0.42, 0.1), 0.8), mat('Fil', (1.0, 0.9, 0.5), 5)
o1 = join([cyl('sock', 0.3, 0.22, (0, 0, 0.11), sock, verts=10), box('band', (0.5, 0.5, 0.05), (0, 0, 0.2), mat('Band', (1.0, 0.35, 0.1), 3, True))]
          + [cyl(f'pin{i}', 0.03, 0.12, (math.cos(i * 1.57) * 0.18, math.sin(i * 1.57) * 0.18, -0.02), fil, verts=4) for i in range(4)], 'base', (0, 0, 0.2))
o2 = join([sphere('glass', 0.3, (0, 0, 0.55), bulb, (1, 1, 1.3), seg=12), cyl('top', 0.06, 0.1, (0, 0, 0.98), bulb, verts=6, r2=0.01),
           box('f1', (0.05, 0.03, 0.26), (-0.07, -0.28, 0.55), fil, rot=(0, R(20), 0)), box('f2', (0.05, 0.03, 0.26), (0.07, -0.28, 0.55), fil, rot=(0, R(-20), 0)),
           box('brow', (0.26, 0.03, 0.04), (0, -0.29, 0.72), sock, rot=(0, 0, 0))], 'bulb', (0, 0, 0.2))
rigid('bomber', [o1, o2], 1.1, base=-0.5)

# blinker → MÉTRONOME : pyramide, balancier qui accélère avant la téléportation
metro, plate, pend = mat('Metro', (0.35, 0.2, 0.9), 0.5), mat('Plate', (0.05, 0.03, 0.1)), mat('Pend', (0.85, 0.75, 1.0), 3, True)
o1 = join([box('body', (0.6, 0.45, 0.95), (0, 0, 0.48), metro, None, 0.02, taper=(0.45, 0.6)), box('plate', (0.3, 0.02, 0.6), (0, -0.2, 0.5), plate, taper=(0.5, 1)),
           box('eyeL', (0.07, 0.02, 0.05), (0.07, -0.215, 0.62), pend), box('eyeR', (0.07, 0.02, 0.05), (-0.07, -0.215, 0.62), pend), box('foot', (0.66, 0.5, 0.06), (0, 0, 0.03), plate)], 'body', (0, 0, 0.5))
o2 = join([box('rod', (0.025, 0.02, 0.7), (0, -0.235, 0.5), pend), box('weight', (0.12, 0.05, 0.1), (0, -0.24, 0.62), pend, None, 0.01)], 'arm', (0, -0.235, 0.18))
rigid('blinker', [o1, o2], 1.15, base=-0.5)

# healer → ÉGALISEUR : barres qui dansent, croix qui soigne
eqb, bar, plus = mat('EqBase', (0.04, 0.12, 0.09)), mat('Bar', (0.36, 1.0, 0.69), 2.5, True), mat('Plus', (0.6, 1.0, 0.8), 4)
parts = [join([box('base', (0.8, 0.4, 0.16), (0, 0, 0.08), eqb, None, 0.02), box('lip', (0.82, 0.42, 0.03), (0, 0, 0.17), bar)], 'base', (0, 0, 0.08))]
for i in range(5):
    x = -0.3 + i * 0.15
    parts.append(join([box(f'bar{i}', (0.1, 0.1, 0.6), (x, 0, 0.48), bar)], f'bar{i}', (x, 0, 0.18)))
parts.append(join([box('px', (0.3, 0.08, 0.09), (0, 0, 1.0), plus), box('py', (0.09, 0.08, 0.3), (0, 0, 1.0), plus)], 'plus', (0, 0, 1.0)))
rigid('healer', parts, 1.3, base=-0.5)

# warden → AMPLI : pile de baffles, tête d'ampli à boutons, membranes qui cognent (mini-boss)
cab2, grill, logo, knob = mat('Cab2', (0.06, 0.04, 0.08)), mat('Grill', (0.25, 0.04, 0.14), 0.5), mat('Logo', (1.0, 0.18, 0.48), 4, True), mat('Knob', (0.85, 0.85, 0.9), 1)
o1 = join([box('c1', (1.0, 0.6, 0.7), (0, 0, 0.35), cab2, None, 0.03), box('c2', (1.0, 0.6, 0.7), (0, 0, 1.06), cab2, None, 0.03),
           box('g1', (0.86, 0.02, 0.56), (0, -0.305, 0.35), grill), box('g2', (0.86, 0.02, 0.56), (0, -0.305, 1.06), grill)], 'stack', (0, 0, 0.7))
cones = []
for z in (0.35, 1.06):
    for x in (-0.2, 0.2):
        cones += [ring(f'r{x}{z}', 0.17, 0.035, 0.03, (x, -0.32, z), logo, rot=(R(90), 0, 0), verts=12), cyl(f'k{x}{z}', 0.13, 0.04, (x, -0.31, z), mat('ConeW', (0.03, 0.02, 0.04)), rot=(R(90), 0, 0), verts=10, r2=0.05)]
o2 = join(cones, 'cones', (0, -0.31, 0.7))
o3 = join([box('head', (1.04, 0.5, 0.32), (0, 0, 1.6), cab2, None, 0.03), box('panel', (0.9, 0.02, 0.16), (0, -0.255, 1.6), mat('Panel', (0.75, 0.6, 0.3), 0.5)),
           box('strip', (0.5, 0.02, 0.05), (0, -0.265, 1.7), logo)]
          + [cyl(f'kn{i}', 0.035, 0.05, (-0.35 + i * 0.1, -0.27, 1.56), knob, rot=(R(90), 0, 0), verts=6) for i in range(8)]
          + [box('eyeL', (0.12, 0.02, 0.05), (0.25, -0.27, 1.66), mat('EyeR', (1, 0.3, 0.5), 5)), box('eyeR', (0.12, 0.02, 0.05), (-0.25, -0.27, 1.66), mat('EyeR', (1, 0.3, 0.5), 5))], 'head', (0, 0, 1.44))
rigid('warden', [o1, o2, o3], 1.25, base=-0.5)

# ===================================================================== BOSS (flottent à 4 m)
# 0 SENTINELLE → BOOMBOX géant
bx, grl, led, goldm = mat('BoomBody', (0.12, 0.05, 0.16)), mat('BGrill', (0.05, 0.04, 0.07)), mat('Led', (1.0, 0.18, 0.33), 5, True), mat('BGold', (1.0, 0.79, 0.3), 3)
body = join([box('main', (4.2, 1.6, 2.2), (0, 0, 0), bx, None, 0.2), box('handle', (3.0, 0.3, 0.25), (0, 0, 1.55), grl, None, 0.06),
             box('hL', (0.25, 0.3, 0.5), (-1.4, 0, 1.25), grl), box('hR', (0.25, 0.3, 0.5), (1.4, 0, 1.25), grl),
             box('deck', (1.2, 0.08, 0.6), (0, -0.8, -0.35), grl), box('tape', (0.9, 0.05, 0.4), (0, -0.84, -0.35), goldm),
             box('stripe', (4.24, 1.64, 0.08), (0, 0, 0.75), led), cyl('ant', 0.04, 2.2, (1.7, 0, 2.0), grl, rot=(0, R(-25), 0), verts=6)]
            + [box(f'eq{i}', (0.12, 0.05, 0.3), (-0.5 + i * 0.2, -0.82, 0.45), led) for i in range(6)], 'body', (0, 0, 0))
eL = join([cyl('spkL', 0.75, 0.15, (-1.25, -0.8, 0.1), grl, rot=(R(90), 0, 0), verts=20, r2=0.3), ring('rimL', 0.82, 0.08, 0.06, (-1.25, -0.82, 0.1), led, rot=(R(90), 0, 0), verts=20),
           sphere('puL', 0.24, (-1.25, -0.95, 0.1), goldm, None, (1, 0.5, 1), seg=10)], 'eyeL', (-1.25, -0.85, 0.1))
eR = join([cyl('spkR', 0.75, 0.15, (1.25, -0.8, 0.1), grl, rot=(R(90), 0, 0), verts=20, r2=0.3), ring('rimR', 0.82, 0.08, 0.06, (1.25, -0.82, 0.1), led, rot=(R(90), 0, 0), verts=20),
           sphere('puR', 0.24, (1.25, -0.95, 0.1), goldm, None, (1, 0.5, 1), seg=10)], 'eyeR', (1.25, -0.85, 0.1))
rigid('boss0', [body, eL, eR], 7.5, center=True)

# 1 HYDRE DE MAGMA → ampli en fusion à trois cous-câbles terminés par des pavillons
magma, crack, hornm, mouth = mat('Magma', (0.16, 0.04, 0.02)), mat('Crack', (1.0, 0.45, 0.08), 4, True), mat('HornM', (0.5, 0.12, 0.05), 0.6), mat('Mouth', (1.0, 0.55, 0.15), 2.2)
core = join([box('amp', (2.6, 1.8, 1.8), (0, 0, 0), magma, None, 0.2), box('crk1', (2.64, 0.06, 0.08), (0, -0.9, 0.3), crack, rot=(0, R(12), 0)),
             box('crk2', (1.6, 0.06, 0.08), (0.3, -0.9, -0.3), crack, rot=(0, R(-20), 0)), box('crk3', (0.08, 1.84, 1.2), (0.9, 0, 0), crack, rot=(R(15), 0, 0)),
             ring('woof', 0.7, 0.12, 0.08, (0, -0.92, -0.05), crack, rot=(R(90), 0, 0), verts=18), cyl('wc', 0.6, 0.1, (0, -0.9, -0.05), mat('HCone', (0.05, 0.02, 0.02)), rot=(R(90), 0, 0), verts=16, r2=0.2)]
            + [box(f'tooth{i}', (0.2, 0.2, 0.3), (-0.9 + i * 0.45, -0.85, -0.95), crack, rot=(R(180), 0, 0), taper=(0.1, 0.1)) for i in range(5)], 'core', (0, 0, 0))
necks = []
for i, (x, tilt) in enumerate([(-1.0, -28), (0.0, 0), (1.0, 28)]):
    hx, hz = x + math.sin(R(tilt)) * 1.9, 2.75
    # cou : un câble de vertèbres qui se chevauchent, en S, du dessus de l'ampli jusqu'au pavillon
    segs = []
    for k in range(7):
        f = k / 6; cx = x + (hx - x) * f + math.sin(f * math.pi) * 0.15 * (1 if x >= 0 else -1); cz = 0.85 + (hz - 0.35 - 0.85) * f; cy = -0.1 - 0.3 * math.sin(f * math.pi)
        segs.append(sphere(f'v{i}{k}', 0.26 - k * 0.012, (cx, cy, cz), hornm if k % 2 else crack if k == 3 else magma, None, (1, 1, 0.8), seg=8))
    segs += [cyl(f'h{i}', 0.18, 0.8, (hx, -0.55, hz), hornm, rot=(R(75), 0, 0), verts=12, r2=0.55), cyl(f'm{i}', 0.52, 0.04, (hx, -0.95, hz + 0.1), mouth, rot=(R(75), 0, 0), verts=12),
             sphere(f'eA{i}', 0.09, (hx + 0.18, -0.4, hz + 0.45), mouth, seg=6), sphere(f'eB{i}', 0.09, (hx - 0.18, -0.4, hz + 0.45), mouth, seg=6)]
    necks.append(join(segs, f'neck{i}', (x, 0, 0.9)))
rigid('boss1', [core] + necks, 8.0, center=True)

# 2 ARCHONTE DU VIDE → orgue-synthé flottant : clavier-mâchoire, couronne de tuyaux, œil-haut-parleur qui aspire
void, keyw, keyb, pipe, pipet = mat('Void', (0.08, 0.04, 0.16)), mat('KeyW', (0.85, 0.82, 1.0), 0.8), mat('KeyB', (0.03, 0.02, 0.05)), mat('Pipe', (0.5, 0.42, 0.9), 0.5), mat('PipeT', (0.15, 0.88, 1.0), 4, True)
frm = [box('slab', (4.4, 1.6, 0.5), (0, 0, -0.9), void, None, 0.1), box('back', (4.4, 0.5, 2.2), (0, 0.6, 0.2), void, None, 0.1)]
frm += [box(f'kw{i}', (0.26, 0.6, 0.12), (-2.0 + i * 0.29, -0.55, -0.6), keyw) for i in range(14)]
frm += [box(f'kb{i}', (0.15, 0.36, 0.14), (-1.85 + i * 0.29, -0.43, -0.52), keyb) for i in range(13) if i % 7 not in (2, 6)]
frm += [box('trimA', (4.44, 0.06, 0.06), (0, -0.8, -0.66), pipet)]
body = join(frm, 'frame', (0, 0, 0))
pp = []
for i in range(11):
    x = -2.0 + i * 0.4; h = 1.2 + 1.3 * math.exp(-((i - 5) / 3.2) ** 2)
    pp += [cyl(f'p{i}', 0.15, h, (x, 0.55, 1.3 + h / 2), pipe, verts=8), cyl(f'pt{i}', 0.17, 0.12, (x, 0.55, 1.3 + h), pipet, verts=8), box(f'pm{i}', (0.16, 0.05, 0.1), (x, 0.4, 1.5), keyb)]
pipes = join(pp, 'pipes', (0, 0.55, 1.3))
eye = join([ring('er', 0.95, 0.12, 0.1, (0, -0.15, 0.4), pipet, rot=(R(90), 0, 0), verts=24), cyl('ec', 0.85, 0.1, (0, -0.12, 0.4), mat('ECone', (0.03, 0.02, 0.06)), rot=(R(90), 0, 0), verts=20, r2=0.25),
            sphere('ep', 0.3, (0, -0.3, 0.4), mat('EPupil', (0.73, 0.55, 1.0), 4), None, (1, 0.5, 1), seg=10)]
           + [box(f'sp{i}', (0.05, 0.04, 0.5), (math.cos(i * 1.047) * 0.55, -0.2, 0.4 + math.sin(i * 1.047) * 0.55), pipet, rot=(0, -i * 1.047 + R(90), 0)) for i in range(6)], 'eye', (0, -0.15, 0.4))
rigid('boss2', [body, pipes, eye], 8.0, center=True)

# ===================================================================== DÉCOR : tours d'enceintes autour de l'arène (les membranes cognent sur le temps)
tcab, tgr, tacc = mat('TCab', (0.05, 0.03, 0.08)), mat('TGrill', (0.12, 0.06, 0.16)), mat('Accent', (0.15, 0.88, 1.0), 3)
st = [box('base', (2.2, 1.4, 0.3), (0, 0, 0.15), tcab)]
for k in range(3):
    z = 0.3 + 1.05 * k + 0.5
    st += [box(f'cab{k}', (2.0, 1.2, 1.0), (0, 0, z), tcab, None, 0.03), box(f'g{k}', (1.8, 0.02, 0.86), (0, -0.605, z), tgr), box(f'led{k}', (1.9, 0.02, 0.03), (0, -0.61, z + 0.46), tacc)]
st += [box('top', (2.1, 1.3, 0.5), (0, 0, 3.75), tcab, None, 0.03)] + [cyl(f'hn{i}', 0.08, 0.55, (-0.7 + i * 0.35, -0.55, 3.75), tgr, rot=(R(90), 0, 0), verts=6, r2=0.17) for i in range(5)]
stack = join(st, 'stack', (0, 0, 0))
cn = []
for k in range(3):
    z = 0.3 + 1.05 * k + 0.5
    for x in (-0.48, 0.48):
        cn += [ring(f'r{k}{x}', 0.4, 0.06, 0.04, (x, -0.63, z), tacc, rot=(R(90), 0, 0), verts=14), cyl(f'c{k}{x}', 0.34, 0.05, (x, -0.62, z), mat('TCone', (0.02, 0.02, 0.03)), rot=(R(90), 0, 0), verts=12, r2=0.1),
               cyl(f'd{k}{x}', 0.09, 0.04, (x, -0.66, z), tacc, rot=(R(90), 0, 0), verts=8)]
cones = join(cn, 'cones', (0, -0.62, 1.9))
rigid('tower', [stack, cones], 1.0, base=0)

# ===================================================================== OBJETS (une seule couleur : shader néon du jeu, teinte par instance)
def prop(name, objs, fit):
    print(name); DATA[name] = pack(objs, lambda o: 0, fit=fit, center=True); clear()
w = mat('W', (1, 1, 1))
def extrude(name, pts, depth):   # profil 2D (x, z) extrudé en Y
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vs = [bm.verts.new((x, -depth / 2, z)) for x, z in pts] + [bm.verts.new((x, depth / 2, z)) for x, z in pts]
    n = len(pts); bm.faces.new(vs[:n][::-1]); bm.faces.new(vs[n:])
    for i in range(n): j = (i + 1) % n; bm.faces.new((vs[i], vs[j], vs[n + j], vs[n + i]))
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.data.materials.append(w); return o
# note de musique (XP) : croche
prop('note', [sphere('head', 0.17, (0, 0, 0), w, None, (1.25, 0.8, 0.9), seg=10), box('stem', (0.05, 0.05, 0.5), (0.18, 0, 0.25), w),
              box('flag', (0.05, 0.05, 0.26), (0.26, 0, 0.42), w, rot=(0, R(-50), 0))], 0.62)
# disque d'or (pièce)
prop('record', [cyl('disc', 0.3, 0.05, (0, 0, 0), w, rot=(R(90), 0, 0), verts=16), cyl('lab', 0.12, 0.08, (0, 0, 0), w, rot=(R(90), 0, 0), verts=10),
                ring('gr', 0.24, 0.012, 0.06, (0, 0, 0), w, rot=(R(90), 0, 0), verts=16)], 0.62)
# cœur (soin)
hp = [(math.sin(a) ** 3 * 0.5, 0.42 * math.cos(a) - 0.17 * math.cos(2 * a) - 0.07 * math.cos(3 * a) - 0.03 * math.cos(4 * a)) for a in [i / 16 * 2 * math.pi for i in range(16)]]
prop('heart', [extrude('heart', hp[::-1], 0.22)], 0.7)
# pédale d'effet (mine)
prop('pedal', [box('body', (0.62, 0.8, 0.16), (0, 0, 0), w, None, 0.04), cyl('sw', 0.09, 0.1, (0, 0.2, 0.12), w, verts=8),
               cyl('k1', 0.06, 0.08, (-0.17, -0.22, 0.11), w, verts=6), cyl('k2', 0.06, 0.08, (0.17, -0.22, 0.11), w, verts=6), box('jack', (0.1, 0.12, 0.08), (0.36, 0, 0), w)], 0.9)
# vinyle (arme disque)
prop('vinyl', [cyl('disc', 0.6, 0.05, (0, 0, 0), w, verts=24), cyl('lab', 0.2, 0.09, (0, 0, 0), w, verts=12),
               ring('g1', 0.5, 0.015, 0.07, (0, 0, 0), w, verts=24), ring('g2', 0.36, 0.015, 0.07, (0, 0, 0), w, verts=20)], 1.2)
# flight-case (jarre cassable)
prop('case', [box('box', (0.66, 0.5, 0.62), (0, 0, 0), w, None, 0.02)]
             + [box(f'c{i}', (0.12, 0.12, 0.12), (x * 0.3, y * 0.22, z * 0.28), w) for i, (x, y, z) in enumerate([(a, b, c) for a in (-1, 1) for b in (-1, 1) for c in (-1, 1)])]
             + [box('hdl', (0.24, 0.06, 0.06), (0, -0.27, 0.12), w), box('lat', (0.1, 0.04, 0.12), (0, -0.26, -0.08), w)], 0.85)

# flight-case (coffre) : caisse à cornières et loquets, couvercle à poignée — deux pièces (le couvercle s'ouvre et brille)
prop('fcase', [box('box', (1.3, 0.9, 0.8), (0, 0, 0), w, None, 0.02)]
              + [box(f'c{i}', (0.16, 0.16, 0.16), (x * 0.63, y * 0.43, z * 0.38), w) for i, (x, y, z) in enumerate([(a, b, c) for a in (-1, 1) for b in (-1, 1) for c in (-1, 1)])]
              + [box('l1', (0.12, 0.05, 0.16), (-0.35, -0.46, 0.25), w), box('l2', (0.12, 0.05, 0.16), (0.35, -0.46, 0.25), w),
                 box('h1', (0.05, 0.3, 0.08), (0.67, 0, 0.05), w), box('h2', (0.05, 0.3, 0.08), (-0.67, 0, 0.05), w)], 1.4)
prop('flid', [box('lid', (1.4, 1.0, 0.25), (0, 0, 0), w, None, 0.03), box('hdl', (0.5, 0.08, 0.07), (0, 0, 0.16), w),
              box('hb1', (0.06, 0.08, 0.1), (-0.24, 0, 0.12), w), box('hb2', (0.06, 0.08, 0.1), (0.24, 0, 0.12), w)], 1.4)

js = '// généré par tools/cast/build.py (Blender) — ne pas modifier à la main\nexport const CAST = ' + json.dumps(DATA, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js)
print('écrit', OUT, len(js) // 1024, 'Ko')
