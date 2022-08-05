# SQL samples to be put in routes:
"""
SELECT dept.station, arr.station, f.peak 
FROM fares f
    INNER JOIN stations dept
        ON f.dept = dept.sid
    INNER JOIN stations arr 
        ON f.arr=arr.sid
WHERE f.peak = 0.0
"""
