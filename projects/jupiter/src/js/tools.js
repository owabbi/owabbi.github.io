export const frameRate = 1 / 40; // Seconds
export const frameDelay = frameRate * 1000; // ms

export function randomNumBetween(min, max) {
    return min + Math.random() * (max - min);
}


export function dist2(v, w) { return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y) }

export function distToSegment(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    }));
}
