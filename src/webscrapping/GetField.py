from osgeo import ogr

##Get stations function
##returns a list which has all the fields of a column
def getField(path, col):
    driver = ogr.GetDriverByName('ESRI Shapefile')
    dataSource = driver.Open(path,0)
    layer = dataSource.GetLayer()

    fields = []
    for feature in layer:
        fields.append(feature.GetField(col))
    
    return fields